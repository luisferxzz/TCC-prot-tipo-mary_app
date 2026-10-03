/**
 * Mary App — Home
 *
 * Reformulada para funcionar como painel central de
 * segurança (dashboard), não mais um segundo menu:
 * saudação, status real do app, SOS, dicas de segurança,
 * resumo de localização/contatos e atividade recente.
 *
 * O que NÃO mudou (por pedido explícito):
 * - identidade visual (fundo escuro, rosa, cards arredondados);
 * - navegação inferior;
 * - o fluxo de SOS em si — o botão aqui só inicia a MESMA
 *   confirmação/lógica que já existe em EmergencyScreen,
 *   via services/emergency/sos.ts (ver esse arquivo).
 *
 * O que mudou:
 * - removida a grade "Outros recursos" (Contatos/Hospitais/
 *   Polícia/Segurança), que só duplicava Mapa/Emergência/Perfil;
 * - localização, contatos e atividade recente agora são
 *   dados reais (via useSecurityStatus), não texto fixo;
 * - card de status agora tem um 3º chip de notificações
 *   (preferência interna — ver Perfil > Notificações);
 * - adicionada a seção de dicas de segurança (conteúdo local,
 *   em src/content/securityTips.ts).
 */

import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacing, fontSizes, fontWeights, radius } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { SecurityStatusCard } from "../../components/SecurityStatusCard";
import { EmergencyCard } from "../../components/EmergencyCard";
import { obterUsuario } from "../../services/supabase/auth";
import { useSecurityStatus } from "../../hooks/useSecurityStatus";
import { tempoRelativo } from "../../utils/relativeTime";
import { obterDicaDoDia, obterOutrasDicas } from "../../content/securityTips";
import type { AppTabsNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

function saudacaoPorHorario(): "morning" | "afternoon" | "night" {
  const hora = new Date().getHours();
  if (hora < 12) return "morning";
  if (hora < 18) return "afternoon";
  return "night";
}

// Texto + seta de "vai pra outra tela" — usado nos links dos
// cards de resumo (mapa, contatos, histórico), em vez de um
// "→" preso dentro da tradução.
function LinkText({ children }: { children: string }) {
  return (
    <View style={styles.linkRow}>
      <Text style={styles.summaryLink}>{children}</Text>
      <Ionicons name="chevron-forward" size={13} color={colors.primaryLight} />
    </View>
  );
}

// Delay-base entre cada bloco da tela — pequeno o bastante
// pra parecer fluido, não uma demonstração de animação.
const ATRASO_ENTRE_SECOES = 90;

export function HomeScreen() {
  const navigation = useNavigation<AppTabsNavigation>();
  const { t } = useTranslation();
  const { localizacao, contatos, historico, notificacoesAtivas } = useSecurityStatus();

  const [nome, setNome] = useState("Usuário");

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        const usuario = await obterUsuario();
        if (!cancelado && usuario?.nome) {
          setNome(usuario.nome.split(" ")[0]);
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  const chaveSaudacao = {
    morning: "home.greetingMorning",
    afternoon: "home.greetingAfternoon",
    night: "home.greetingNight",
  }[saudacaoPorHorario()];

  // Precisa de atenção quando um recurso essencial de
  // segurança ainda não está configurado — nunca inventado,
  // só a leitura direta dos dados reais.
  const precisaAtencao = !localizacao || contatos.length === 0;

  const locationChip = localizacao
    ? t("home.locationUpdatedChip", { time: tempoRelativo(localizacao.atualizadoEm, t) })
    : t("home.locationNotVerifiedChip");

  const contactsChip =
    contatos.length === 0
      ? t("home.contactsNoneChip")
      : contatos.length === 1
      ? t("home.contactsConfiguredChipOne")
      : t("home.contactsConfiguredChipMany", { count: contatos.length });

  const notificationsChip = notificacoesAtivas
    ? t("home.notificationsActiveChip")
    : t("home.notificationsInactiveChip");

  const dicaDoDia = obterDicaDoDia();
  const outrasDicas = obterOutrasDicas(2);

  const ultimasAtividades = [...historico]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(0)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>
              {t(chaveSaudacao)} {nome} 👋
            </Text>
            <Text style={styles.subtitle}>Como podemos manter você seguro hoje?</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* STATUS DO MARY APP */}
        <Animated.View entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES)}>
          <SecurityStatusCard
            tone={precisaAtencao ? "attention" : "ok"}
            title={t(precisaAtencao ? "home.statusAttentionTitle" : "home.statusOkTitle")}
            description={t(precisaAtencao ? "home.statusAttentionDescription" : "home.statusOkDescription")}
            locationText={locationChip}
            contactsText={contactsChip}
            notificationsText={notificationsChip}
          />
        </Animated.View>

        {/* EMERGÊNCIA / SOS */}
        <Animated.View entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES * 2)}>
          <EmergencyCard
            title={t("home.emergencyTitle")}
            description={t("home.emergencyDescription")}
            buttonLabel={t("home.emergencyButton")}
            onPress={() =>
              navigation.navigate("Emergencia", {
                screen: "EmergencyHome",
                params: { autoTriggerSOS: true },
              })
            }
          />
        </Animated.View>

        {/* ATUALIZAÇÕES DE SEGURANÇA */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES * 3)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{t("home.securityUpdatesTitle")}</Text>

          <AppCard style={styles.tipCard}>
            <View style={styles.tipLabelRow}>
              <Ionicons name="bulb-outline" size={13} color={colors.primaryLight} />
              <Text style={styles.tipLabel}>{t("home.tipOfDayLabel")}</Text>
            </View>
            <Text style={styles.tipText}>{t(dicaDoDia.textKey)}</Text>
          </AppCard>

          {outrasDicas.map((dica) => (
            <AppCard key={dica.id} style={styles.tipCardSmall}>
              <View style={styles.tipLabelRow}>
                <Ionicons name={dica.icon as any} size={13} color={colors.primaryLight} />
                <Text style={styles.tipLabel}>{t(dica.categoryKey)}</Text>
              </View>
              <Text style={styles.tipText}>{t(dica.textKey)}</Text>
            </AppCard>
          ))}
        </Animated.View>

        {/* LOCALIZAÇÃO RESUMIDA */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES * 4)}
          style={styles.section}
        >
          <AppCard style={styles.summaryCard} onPress={() => navigation.navigate("Mapa")}>
            <View style={styles.summaryTitleRow}>
              <Ionicons name="location-outline" size={15} color={colors.text} />
              <Text style={styles.summaryTitle}>{t("home.locationSummaryTitle")}</Text>
            </View>
            <Text style={styles.summaryText}>
              {localizacao
                ? t("home.locationUpdatedAgo", { time: tempoRelativo(localizacao.atualizadoEm, t) })
                : t("home.locationNotVerified")}
            </Text>
            <LinkText>{t("home.viewOnMap")}</LinkText>
          </AppCard>
        </Animated.View>

        {/* CONTATOS DE EMERGÊNCIA */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES * 5)}
          style={styles.section}
        >
          <AppCard
            style={styles.summaryCard}
            onPress={() => navigation.navigate("Emergencia", { screen: "Contacts" })}
          >
            <View style={styles.summaryTitleRow}>
              <Ionicons name="people-outline" size={15} color={colors.text} />
              <Text style={styles.summaryTitle}>{t("home.contactsSummaryTitle")}</Text>
            </View>

            {contatos.length === 0 ? (
              <>
                <Text style={styles.summaryText}>{t("home.contactsNoneText")}</Text>
                <LinkText>{t("home.addContact")}</LinkText>
              </>
            ) : (
              <>
                <Text style={styles.summaryText}>
                  {t(
                    contatos.length === 1
                      ? "home.contactsConfiguredCountOne"
                      : "home.contactsConfiguredCountMany",
                    { count: contatos.length }
                  )}
                </Text>
                <Text style={styles.summaryNames} numberOfLines={1}>
                  {contatos.slice(0, 3).map((c) => c.nome).join(" • ")}
                </Text>
                <LinkText>{t("home.manageContacts")}</LinkText>
              </>
            )}
          </AppCard>
        </Animated.View>

        {/* ATIVIDADE RECENTE */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(ATRASO_ENTRE_SECOES * 6)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t("home.recentActivityTitle")}</Text>
            {ultimasAtividades.length > 0 && (
              <Pressable
                onPress={() => navigation.navigate("Emergencia", { screen: "EmergencyHome" })}
              >
                <LinkText>{t("home.viewHistory")}</LinkText>
              </Pressable>
            )}
          </View>

          {ultimasAtividades.length === 0 ? (
            <AppCard style={styles.emptyActivity}>
              <Ionicons name="shield-checkmark-outline" size={26} color={colors.textMuted} />
              <Text style={styles.emptyActivityText}>{t("home.noActivity")}</Text>
            </AppCard>
          ) : (
            <AppCard style={{ gap: spacing.sm }}>
              {ultimasAtividades.map((registro) => (
                <View key={registro.id} style={styles.activityRow}>
                  <Ionicons name="alert-circle" size={16} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityStatus}>{registro.status}</Text>
                    <Text style={styles.activityDate}>
                      {new Date(registro.data).toLocaleString("pt-BR")}
                    </Text>
                  </View>
                </View>
              ))}
            </AppCard>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 140,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, maxWidth: 260 },
  subtitle: { marginTop: 4, color: colors.textSecondary, fontSize: fontSizes.xs, maxWidth: 260 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: fontSizes.md, fontWeight: fontWeights.bold },

  section: { gap: spacing.md },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },

  tipCard: { gap: spacing.xs },
  tipCardSmall: { gap: spacing.xs, marginTop: spacing.sm },
  tipLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipLabel: { color: colors.primaryLight, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  tipText: { color: colors.textSecondary, fontSize: fontSizes.xs, lineHeight: 18 },

  summaryCard: { gap: 4 },
  summaryTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryTitle: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  summaryText: { color: colors.textSecondary, fontSize: fontSizes.xs },
  summaryNames: { color: colors.textMuted, fontSize: 11 },
  linkRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 2 },
  summaryLink: { color: colors.primaryLight, fontSize: 12, fontWeight: fontWeights.medium },

  emptyActivity: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
  emptyActivityIcon: { fontSize: 26 },
  emptyActivityText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },

  activityRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  activityIcon: { fontSize: 16 },
  activityStatus: { color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
  activityDate: { marginTop: 2, color: colors.textMuted, fontSize: 10 },
});
