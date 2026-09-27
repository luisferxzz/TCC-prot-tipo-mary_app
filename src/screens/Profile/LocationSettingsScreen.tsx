/**
 * Mary App — Localização (configurações)
 * Só lê o status da permissão (sem pedir de novo à toa) e
 * reaproveita obterLocalizacaoAtual()/obterUltimaLocalizacaoSalva(),
 * os mesmos services que Emergência e Home já usam.
 */

import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { AppCard } from "../../components/AppCard";
import {
  obterLocalizacaoAtual,
  obterUltimaLocalizacaoSalva,
  LocalizacaoSalva,
} from "../../services/location/location";
import { tempoRelativo } from "../../utils/relativeTime";
import type { ProfileStackNavigation } from "../../navigation/types";

type StatusPermissao = "concedida" | "negada" | "desconhecida";

export function LocationSettingsScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [statusPermissao, setStatusPermissao] = useState<StatusPermissao>("desconhecida");
  const [localizacao, setLocalizacao] = useState<LocalizacaoSalva | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setStatusPermissao(status === "granted" ? "concedida" : status === "denied" ? "negada" : "desconhecida");
    setLocalizacao(await obterUltimaLocalizacaoSalva());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function atualizarAgora() {
    setAtualizando(true);
    await obterLocalizacaoAtual();
    await carregar();
    setAtualizando(false);
  }

  const textoPermissao = {
    concedida: t("localizacaoConfig.permissionGranted"),
    negada: t("localizacaoConfig.permissionDenied"),
    desconhecida: t("localizacaoConfig.permissionUnknown"),
  }[statusPermissao];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>{t("localizacaoConfig.title")}</Text>
          <Text style={styles.subtitle}>{t("localizacaoConfig.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppCard style={{ gap: spacing.sm }}>
          <Text style={styles.cardLabel}>{t("localizacaoConfig.permissionLabel")}</Text>
          <Text style={styles.cardValue}>{textoPermissao}</Text>

          {statusPermissao !== "concedida" && (
            <Button
              label={t("localizacaoConfig.openSettings")}
              variant="secondary"
              onPress={() => Linking.openSettings()}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </AppCard>

        <AppCard style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={styles.cardLabel}>{t("localizacaoConfig.lastLocationLabel")}</Text>
          <Text style={styles.cardValue}>
            {localizacao
              ? t("home.locationUpdatedAgo", { time: tempoRelativo(localizacao.atualizadoEm, t) })
              : t("home.locationNotVerified")}
          </Text>

          <Button
            label={t("emergencia.updateLocation")}
            onPress={atualizarAgora}
            loading={atualizando}
            disabled={atualizando}
            style={{ marginTop: spacing.sm }}
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
  cardLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: fontWeights.medium },
  cardValue: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
});
