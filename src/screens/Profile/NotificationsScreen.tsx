/**
 * Mary App — Notificações
 *
 * O toggle controla duas coisas: (1) os lembretes DENTRO do
 * app (dica do dia na Home) e (2) uma notificação semanal de
 * verdade agendada no aparelho (local, não push — ver
 * services/notifications/localNotifications.ts). Continua sem
 * push remoto, que exigiria development build.
 */

import React, { useCallback, useState } from "react";
import { View, Pressable, Switch, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { notificacoesAtivas, definirNotificacoesAtivas } from "../../services/storage/preferences";
import { ativarLembreteSemanal, cancelarLembreteSemanal } from "../../services/notifications/localNotifications";
import type { ProfileStackNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

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

    if (valor) {
      const conseguiu = await ativarLembreteSemanal();
      if (!conseguiu) {
        Alert.alert(
          t("notificacoesConfig.permissionDeniedTitle"),
          t("notificacoesConfig.permissionDeniedText")
        );
      }
    } else {
      await cancelarLembreteSemanal();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
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
