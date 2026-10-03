/**
 * Mary App — Emergência
 *
 * Real e funcional: localização (expo-location), SOS com
 * confirmação, números oficiais com confirmação antes de
 * ligar, contatos (link pro CRUD completo), histórico,
 * hospital/delegacia mais próximos (Overpass API — OSM,
 * grátis, sem chave, mesma família do Mapa), gravação de
 * áudio de segurança (expo-audio — sempre uma ação explícita
 * do usuário, nunca automática junto com o SOS).
 */

import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { Button } from "../../components/Button";
import {
  obterUltimaLocalizacaoSalva,
  obterLocalizacaoAtual,
  criarLinkDeLocalizacao,
  LocalizacaoSalva,
} from "../../services/location/location";
import { obterContatos, Contato, deveNotificar } from "../../services/storage/contacts";
import { obterEmergencias, RegistroEmergencia } from "../../services/storage/emergencyHistory";
import { dispararSOS } from "../../services/emergency/sos";
import { useNearbyPlaces } from "../../hooks/useNearbyPlaces";
import { formatarDistancia, linkParaRota, LocalProximo } from "../../services/places/nearbyPlaces";
import { useEmergencyRecorder } from "../../hooks/useEmergencyRecorder";
import { formatarDuracao } from "../../services/audio/emergencyRecorder";
import type { EmergencyStackNavigation, EmergencyStackParamList } from "../../navigation/types";
import { Text } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

type EmergencyHomeRoute = RouteProp<EmergencyStackParamList, "EmergencyHome">;

function numerosOficiais(t: (k: string) => string) {
  return [
    { nome: t("emergencia.samuName"), numero: "192", descricao: t("emergencia.samuDesc"), icone: "medkit" as const },
    { nome: t("emergencia.policeName"), numero: "190", descricao: t("emergencia.policeDesc"), icone: "shield" as const },
    { nome: t("emergencia.fireName"), numero: "193", descricao: t("emergencia.fireDesc"), icone: "flame" as const },
  ];
}

function LinhaLocalProximo({
  local,
  tipoLabel,
  naoEncontradoLabel,
  icone,
}: {
  local: LocalProximo | null;
  tipoLabel: string;
  naoEncontradoLabel: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <AppCard style={estilosLocalProximo.card}>
      <View style={estilosLocalProximo.row}>
        <View style={estilosLocalProximo.iconWrapper}>
          <Ionicons name={icone} size={18} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={estilosLocalProximo.tipo}>{tipoLabel}</Text>
          {local ? (
            <>
              <Text style={estilosLocalProximo.nome} numberOfLines={1}>{local.nome}</Text>
              <Text style={estilosLocalProximo.distancia}>{formatarDistancia(local.distanciaMetros)}</Text>
            </>
          ) : (
            <Text style={estilosLocalProximo.naoEncontrado}>{naoEncontradoLabel}</Text>
          )}
        </View>

        {local && (
          <Pressable
            onPress={() => Linking.openURL(linkParaRota(local))}
            style={estilosLocalProximo.routeButton}
            accessibilityLabel={`Como chegar em ${local.nome}`}
          >
            <Ionicons name="navigate-outline" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>
    </AppCard>
  );
}

const estilosLocalProximo = StyleSheet.create({
  card: { padding: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrapper: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: `${colors.primary}22`, alignItems: "center", justifyContent: "center",
  },
  tipo: { color: colors.textMuted, fontSize: 11, fontWeight: fontWeights.medium },
  nome: { marginTop: 2, color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  distancia: { marginTop: 2, color: colors.textSecondary, fontSize: 11 },
  naoEncontrado: { marginTop: 2, color: colors.textMuted, fontSize: fontSizes.xs },
  routeButton: {
    width: 34, height: 34, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
});

const estilosGravacao = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrapper: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: `${colors.primary}22`, alignItems: "center", justifyContent: "center",
  },
  titulo: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  subtitulo: { marginTop: 2, color: colors.textSecondary, fontSize: 11 },
  recordButton: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  recordButtonAtivo: { backgroundColor: colors.danger },
  link: { flexDirection: "row", alignItems: "center", gap: 2, alignSelf: "flex-start" },
  linkText: { color: colors.primaryLight, fontSize: 12, fontWeight: fontWeights.medium },
});

export function EmergencyScreen() {
  const navigation = useNavigation<EmergencyStackNavigation>();
  const route = useRoute<EmergencyHomeRoute>();
  const { t } = useTranslation();

  const [localizacao, setLocalizacao] = useState<LocalizacaoSalva | null>(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [historico, setHistorico] = useState<RegistroEmergencia[]>([]);

  const { hospital, policia, status: statusLocaisProximos } = useNearbyPlaces(
    localizacao?.latitude ?? null,
    localizacao?.longitude ?? null
  );

  const { status: statusGravacao, gravando, duracaoMs, iniciar: iniciarGravacaoBase, parar: pararGravacao } =
    useEmergencyRecorder();

  const iniciarGravacao = useCallback(async () => {
    await iniciarGravacaoBase();
  }, [iniciarGravacaoBase]);

  const aoPararGravacao = useCallback(async () => {
    await pararGravacao();
  }, [pararGravacao]);

  useEffect(() => {
    if (statusGravacao === "permissao_negada") {
      Alert.alert(t("gravacoes.permissionDeniedTitle"), t("gravacoes.permissionDeniedText"));
    }
  }, [statusGravacao, t]);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        const [ultimaLocalizacao, listaContatos, listaHistorico] = await Promise.all([
          obterUltimaLocalizacaoSalva(),
          obterContatos(),
          obterEmergencias(),
        ]);

        if (!cancelado) {
          setLocalizacao(ultimaLocalizacao);
          setContatos(listaContatos);
          setHistorico(listaHistorico);
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  async function atualizarLocalizacao() {
    setCarregandoLocalizacao(true);
    setErroLocalizacao(null);

    const resultado = await obterLocalizacaoAtual();

    if (resultado.sucesso) {
      setLocalizacao(resultado.dados);
    } else {
      setErroLocalizacao(resultado.mensagem);
    }

    setCarregandoLocalizacao(false);
  }

  function ligarPara(nome: string, numero: string) {
    Alert.alert(
      t("emergencia.callConfirmTitle", { nome }),
      t("emergencia.callConfirmText"),
      [
        { text: t("perfil.cancel"), style: "cancel" },
        { text: t("emergencia.call"), onPress: () => Linking.openURL(`tel:${numero}`) },
      ]
    );
  }

  const acionarSOS = useCallback(() => {
    Alert.alert(
      t("emergencia.sosConfirmTitle"),
      t("emergencia.sosConfirmText"),
      [
        { text: t("emergencia.cancel"), style: "cancel" },
        {
          text: t("emergencia.confirmSos"),
          style: "destructive",
          onPress: async () => {
            const { localizacao: novaLocalizacao } = await dispararSOS();

            if (novaLocalizacao) setLocalizacao(novaLocalizacao);
            setHistorico(await obterEmergencias());

            const contatosAtuais = await obterContatos();
            const contatosParaLigar = contatosAtuais.filter(deveNotificar).slice(0, 3);

            if (contatosParaLigar.length > 0) {
              Alert.alert(t("emergencia.sosRegisteredTitle"), t("emergencia.sosRegisteredWithContacts"), [
                ...contatosParaLigar.map((c) => ({
                  text: t("emergencia.sosCallContact", { nome: c.nome }),
                  onPress: () => Linking.openURL(`tel:${c.telefone}`),
                })),
                { text: t("emergencia.close") },
              ]);
            } else {
              Alert.alert(t("emergencia.sosRegisteredTitle"), t("emergencia.sosRegisteredNoContacts"));
            }
          },
        },
      ]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // Vindo da Home com o SOS já solicitado: abre a MESMA
  // confirmação acima, sem duplicar nenhuma lógica. O param
  // é limpo em seguida pra não reabrir de novo ao voltar
  // pra esta tela por outro motivo.
  useEffect(() => {
    if (route.params?.autoTriggerSOS) {
      acionarSOS();
      navigation.setParams({ autoTriggerSOS: undefined });
    }
  }, [route.params?.autoTriggerSOS, acionarSOS, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="warning" size={20} color={colors.primary} />
            <Text style={styles.title}>{t("emergencia.title")}</Text>
          </View>
          <Text style={styles.subtitle}>{t("emergencia.subtitle")}</Text>
        </Animated.View>

        {/* SOS */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <Pressable onPress={acionarSOS} style={styles.sosCard} accessibilityRole="button">
            <Ionicons name="warning" size={30} color={colors.white} style={{ marginBottom: 4 }} />
            <Text style={styles.sosTitle}>{t("emergencia.sosTitle")}</Text>
            <Text style={styles.sosSubtitle}>{t("emergencia.sosSubtitle")}</Text>
          </Pressable>
        </Animated.View>

        {/* GRAVAÇÃO DE SEGURANÇA */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)}>
          <AppCard style={estilosGravacao.card}>
            <View style={estilosGravacao.row}>
              <View style={estilosGravacao.iconWrapper}>
                <Ionicons name={gravando ? "radio-button-on" : "mic-outline"} size={18} color={gravando ? colors.danger : colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={estilosGravacao.titulo}>{t("gravacoes.cardTitle")}</Text>
                <Text style={estilosGravacao.subtitulo}>
                  {gravando ? formatarDuracao(duracaoMs) : t("gravacoes.cardSubtitle")}
                </Text>
              </View>

              <Pressable
                onPress={gravando ? aoPararGravacao : iniciarGravacao}
                style={[estilosGravacao.recordButton, gravando && estilosGravacao.recordButtonAtivo]}
                accessibilityLabel={gravando ? t("gravacoes.stop") : t("gravacoes.start")}
              >
                <Ionicons name={gravando ? "stop" : "mic"} size={16} color={colors.white} />
              </Pressable>
            </View>

            <Pressable onPress={() => navigation.navigate("Recordings")} style={estilosGravacao.link}>
              <Text style={estilosGravacao.linkText}>{t("gravacoes.viewAll")}</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.primaryLight} />
            </Pressable>
          </AppCard>
        </Animated.View>

        {/* LOCALIZAÇÃO */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("emergencia.locationTitle")}</Text>

          <AppCard style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                {localizacao ? (
                  <>
                    <Text style={styles.locationText}>
                      {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
                    </Text>
                    <Text style={styles.locationMeta}>
                      Atualizado em {new Date(localizacao.atualizadoEm).toLocaleString("pt-BR")}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.locationText}>{t("emergencia.locationNotObtained")}</Text>
                )}
                {Boolean(erroLocalizacao) && <Text style={styles.locationError}>{erroLocalizacao}</Text>}
              </View>
            </View>

            <Button
              label={carregandoLocalizacao ? t("emergencia.obtaining") : t("emergencia.updateLocation")}
              variant="secondary"
              onPress={atualizarLocalizacao}
              loading={carregandoLocalizacao}
            />
          </AppCard>
        </Animated.View>

        {/* NÚMEROS OFICIAIS */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("emergencia.officialNumbers")}</Text>

          <View style={styles.numbersList}>
            {numerosOficiais(t).map((item) => (
              <Pressable
                key={item.numero}
                style={styles.numberRow}
                onPress={() => ligarPara(item.nome, item.numero)}
              >
                <Ionicons name={item.icone} size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.numberName}>{item.nome}</Text>
                  <Text style={styles.numberDesc}>{item.numero} — {item.descricao}</Text>
                </View>
                <Text style={styles.callLabel}>{t("emergencia.call")}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* HOSPITAL / POLÍCIA */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("emergencia.nearbyPlaces")}</Text>

          {!localizacao ? (
            <AppCard style={styles.preparedCard}>
              <Ionicons name="map-outline" size={26} color={colors.textMuted} />
              <Text style={styles.preparedText}>{t("emergencia.nearbyPlacesNeedsLocation")}</Text>
            </AppCard>
          ) : statusLocaisProximos === "buscando" ? (
            <AppCard style={styles.preparedCard}>
              <Ionicons name="search" size={24} color={colors.textMuted} />
              <Text style={styles.preparedText}>{t("emergencia.nearbyPlacesLoading")}</Text>
            </AppCard>
          ) : statusLocaisProximos === "erro" ? (
            <AppCard style={styles.preparedCard}>
              <Ionicons name="cloud-offline-outline" size={26} color={colors.textMuted} />
              <Text style={styles.preparedText}>{t("emergencia.nearbyPlacesError")}</Text>
            </AppCard>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <LinhaLocalProximo
                local={hospital}
                tipoLabel={t("emergencia.hospitalLabel")}
                naoEncontradoLabel={t("emergencia.hospitalNotFound")}
                icone="medkit"
              />
              <LinhaLocalProximo
                local={policia}
                tipoLabel={t("emergencia.policeLabel")}
                naoEncontradoLabel={t("emergencia.policeNotFound")}
                icone="shield"
              />
            </View>
          )}
        </Animated.View>

        {/* CONTATOS */}
        <Animated.View entering={FadeInDown.duration(400).delay(360)} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("emergencia.contactsTitle")}</Text>
            <Pressable onPress={() => navigation.navigate("Contacts")}>
              <Text style={styles.seeAll}>{t("emergencia.seeAll")}</Text>
            </Pressable>
          </View>

          <AppCard>
            {contatos.length === 0 ? (
              <Text style={styles.emptyContactsText}>
                {t("emergencia.noContacts")}
              </Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {contatos.slice(0, 3).map((contato) => (
                  <View key={contato.id} style={styles.contactPreviewRow}>
                    <Ionicons
                      name={contato.favorito ? "star" : "ellipse"}
                      size={contato.favorito ? 13 : 6}
                      color={contato.favorito ? colors.warning : colors.textMuted}
                    />
                    <Text style={styles.contactPreview}>
                      {contato.nome} · {contato.relacao || "Contato"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </AppCard>
        </Animated.View>

        {/* HISTÓRICO */}
        <Animated.View entering={FadeInDown.duration(400).delay(420)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("emergencia.historyTitle")}</Text>

          <AppCard>
            {historico.length === 0 ? (
              <Text style={styles.emptyContactsText}>{t("emergencia.noHistory")}</Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {[...historico]
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .slice(0, 5)
                  .map((registro) => (
                    <View key={registro.id} style={styles.historyRow}>
                      <Text style={styles.historyStatus}>{registro.status}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(registro.data).toLocaleString("pt-BR")}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </AppCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: 140, gap: spacing.xl },
  header: { gap: 4 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.text, fontSize: fontSizes.xl - 4, fontWeight: fontWeights.extraBold },
  subtitle: { color: colors.textSecondary, fontSize: fontSizes.xs },
  sosCard: {
    alignItems: "center",
    gap: 6,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    ...(shadows.primaryGlow as object),
  },
  sosIcon: { fontSize: 34 },
  sosTitle: { color: colors.white, fontSize: fontSizes.lg, fontWeight: fontWeights.extraBold, letterSpacing: 1 },
  sosSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11, textAlign: "center" },
  section: { gap: spacing.md },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  seeAll: { color: colors.primaryLight, fontSize: 12, fontWeight: fontWeights.medium },
  locationCard: { gap: spacing.md },
  locationRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  locationIcon: { fontSize: 18 },
  locationText: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  locationMeta: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  locationError: { marginTop: 6, color: colors.dangerLight, fontSize: 11 },
  numbersList: { gap: spacing.sm },
  numberRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  numberIcon: { fontSize: 18 },
  numberName: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  numberDesc: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  callLabel: {
    color: colors.white, fontSize: 11, fontWeight: fontWeights.bold, backgroundColor: colors.primary,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  preparedCard: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  preparedIcon: { fontSize: 24 },
  preparedText: { color: colors.textMuted, fontSize: 11.5, textAlign: "center", lineHeight: 17 },
  emptyContactsText: { color: colors.textMuted, fontSize: fontSizes.xs, lineHeight: 18 },
  contactPreviewRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactPreview: { color: colors.textSecondary, fontSize: fontSizes.xs },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyStatus: { color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
  historyDate: { color: colors.textMuted, fontSize: 10 },
});
