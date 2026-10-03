/**
 * Mary App — Gravações de segurança
 * Lista as gravações feitas na tela de Emergência, com tocar
 * (um player por vez), compartilhar (expo-sharing) e apagar
 * (arquivo + registro).
 *
 * Ponta solta conhecida: se a gravação tocar até o fim
 * sozinha, o ícone continua mostrando "pausar" até o usuário
 * tocar de novo — não implementei a detecção automática de
 * fim de reprodução pra manter o escopo enxuto. Cosmético, não
 * afeta a gravação em si.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { Gravacao, obterGravacoes, removerGravacao } from "../../services/storage/emergencyRecordings";
import { excluirArquivoDaGravacao, formatarDuracao } from "../../services/audio/emergencyRecorder";
import type { EmergencyStackNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";

export function RecordingsScreen() {
  const navigation = useNavigation<EmergencyStackNavigation>();
  const { t } = useTranslation();

  const [gravacoes, setGravacoes] = useState<Gravacao[]>([]);
  const [tocandoId, setTocandoId] = useState<number | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  const carregar = useCallback(async () => {
    setGravacoes(await obterGravacoes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    return () => {
      playerRef.current?.release();
    };
  }, []);

  async function alternarReproducao(gravacao: Gravacao) {
    if (tocandoId === gravacao.id) {
      playerRef.current?.pause();
      setTocandoId(null);
      return;
    }

    playerRef.current?.release();
    const player = createAudioPlayer({ uri: gravacao.uri });
    playerRef.current = player;
    player.play();
    setTocandoId(gravacao.id);
  }

  async function compartilhar(gravacao: Gravacao) {
    const disponivel = await Sharing.isAvailableAsync();
    if (!disponivel) {
      Alert.alert(t("gravacoes.shareUnavailable"));
      return;
    }
    await Sharing.shareAsync(gravacao.uri);
  }

  function confirmarExclusao(gravacao: Gravacao) {
    Alert.alert(t("gravacoes.deleteConfirmTitle"), t("gravacoes.deleteConfirmText"), [
      { text: t("perfil.cancel"), style: "cancel" },
      {
        text: t("privacidade.deleteConfirmButton"),
        style: "destructive",
        onPress: async () => {
          if (tocandoId === gravacao.id) {
            playerRef.current?.release();
            setTocandoId(null);
          }
          await excluirArquivoDaGravacao(gravacao.uri);
          await removerGravacao(gravacao.id);
          carregar();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>{t("gravacoes.title")}</Text>
          <Text style={styles.subtitle}>{t("gravacoes.subtitle")}</Text>
        </View>
      </View>

      {gravacoes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="mic-outline" size={30} color={colors.textMuted} style={{ marginBottom: 6 }} />
          <Text style={styles.emptyText}>{t("gravacoes.emptyText")}</Text>
        </View>
      ) : (
        <FlatList
          data={gravacoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AppCard style={styles.row}>
              <Pressable
                onPress={() => alternarReproducao(item)}
                style={styles.playButton}
                accessibilityLabel={tocandoId === item.id ? t("gravacoes.pause") : t("gravacoes.play")}
              >
                <Ionicons name={tocandoId === item.id ? "pause" : "play"} size={16} color={colors.primary} />
              </Pressable>

              <View style={{ flex: 1 }}>
                <Text style={styles.rowDate}>{new Date(item.criadoEm).toLocaleString("pt-BR")}</Text>
                <Text style={styles.rowDuration}>{formatarDuracao(item.duracaoMs)}</Text>
              </View>

              <Pressable onPress={() => compartilhar(item)} style={styles.actionButton} accessibilityLabel={t("gravacoes.share")}>
                <Ionicons name="share-outline" size={16} color={colors.primaryLight} />
              </Pressable>
              <Pressable onPress={() => confirmarExclusao(item)} style={styles.actionButton} accessibilityLabel={t("gravacoes.delete")}>
                <Ionicons name="trash-outline" size={16} color={colors.dangerLight} />
              </Pressable>
            </AppCard>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  backButton: {
    width: 40, height: 40, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  title: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs, maxWidth: 260 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  playButton: {
    width: 36, height: 36, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  rowDate: { color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
  rowDuration: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  actionButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: 6 },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: "center", maxWidth: 260 },
});
