/**
 * Mary App — Notificações
 *
 * O projeto ainda não tem push de verdade (sem
 * expo-notifications instalado) — esta tela liga/desliga
 * os lembretes DENTRO do app (dica do dia na Home). Nada
 * de fingir que existe uma notificação do sistema que na
 * prática não seria enviada.
 */

import React, { useCallback, useState } from "react";
import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { notificacoesAtivas, definirNotificacoesAtivas } from "../../services/storage/preferences";
import type { ProfileStackNavigation } from "../../navigation/types";

export function NotificationsScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [ativo, setAtivo] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        const valor = await notificacoesAtivas();
        if (!cancelado) setAtivo(valor);
      })();
      return () => {
        cancelado = true;
      };
    }, [])
  );

  async function alternar(valor: boolean) {
    setAtivo(valor);
    await definirNotificacoesAtivas(valor);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>{t("notificacoesConfig.title")}</Text>
          <Text style={styles.subtitle}>{t("notificacoesConfig.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppCard style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t("notificacoesConfig.toggleLabel")}</Text>
            <Text style={styles.rowDescription}>{t("notificacoesConfig.toggleDescription")}</Text>
          </View>
          <Switch
            value={ativo}
            onValueChange={alternar}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </AppCard>
      </View>
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
  backButtonText: { color: colors.text, fontSize: 20 },
  title: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs, maxWidth: 260 },
  content: { paddingHorizontal: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowLabel: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  rowDescription: { marginTop: 4, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
});
