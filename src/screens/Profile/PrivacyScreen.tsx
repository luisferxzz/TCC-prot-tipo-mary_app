/**
 * Mary App — Privacidade
 * Três blocos: como os dados são usados (texto informativo,
 * sem inventar nada que o app não faça), status das 3
 * permissões sensíveis num só lugar, e apagar dados locais
 * deste aparelho (NÃO apaga a conta/login).
 */

import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { AppCard } from "../../components/AppCard";
import { apagarDadosLocais } from "../../services/storage/dataManagement";
import type { ProfileStackNavigation } from "../../navigation/types";

type StatusPermissao = "concedida" | "negada" | "desconhecida";

function textoStatus(
  status: StatusPermissao,
  t: (chave: string) => string
): string {
  return {
    concedida: t("privacidade.permissionGranted"),
    negada: t("privacidade.permissionDenied"),
    desconhecida: t("privacidade.permissionUnknown"),
  }[status];
}

export function PrivacyScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [localizacaoStatus, setLocalizacaoStatus] = useState<StatusPermissao>("desconhecida");
  const [cameraStatus, setCameraStatus] = useState<StatusPermissao>("desconhecida");
  const [microfoneStatus, setMicrofoneStatus] = useState<StatusPermissao>("desconhecida");
  const [apagando, setApagando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        const [loc, cam, mic] = await Promise.all([
          Location.getForegroundPermissionsAsync(),
          ImagePicker.getCameraPermissionsAsync(),
          Audio.getPermissionsAsync(),
        ]);

        if (cancelado) return;

        const mapear = (status: string): StatusPermissao =>
          status === "granted" ? "concedida" : status === "denied" ? "negada" : "desconhecida";

        setLocalizacaoStatus(mapear(loc.status));
        setCameraStatus(mapear(cam.status));
        setMicrofoneStatus(mapear(mic.status));
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  function confirmarApagar() {
    Alert.alert(t("privacidade.deleteConfirmTitle"), t("privacidade.deleteConfirmText"), [
      { text: t("perfil.cancel"), style: "cancel" },
      {
        text: t("privacidade.deleteConfirmButton"),
        style: "destructive",
        onPress: async () => {
          setApagando(true);
          await apagarDadosLocais();
          setApagando(false);
          Alert.alert(t("privacidade.deleteSuccess"));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>{t("privacidade.title")}</Text>
          <Text style={styles.subtitle}>{t("privacidade.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppCard style={{ gap: spacing.xs }}>
          <Text style={styles.cardTitle}>{t("privacidade.dataUsageTitle")}</Text>
          <Text style={styles.cardText}>{t("privacidade.dataUsageText")}</Text>
        </AppCard>

        <AppCard style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>{t("privacidade.permissionsTitle")}</Text>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>{t("privacidade.locationPermission")}</Text>
            <Text style={styles.permissionValue}>{textoStatus(localizacaoStatus, t)}</Text>
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>{t("privacidade.cameraPermission")}</Text>
            <Text style={styles.permissionValue}>{textoStatus(cameraStatus, t)}</Text>
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>{t("privacidade.microphonePermission")}</Text>
            <Text style={styles.permissionValue}>{textoStatus(microfoneStatus, t)}</Text>
          </View>

          <Button
            label={t("privacidade.openSettings")}
            variant="secondary"
            onPress={() => Linking.openSettings()}
            style={{ marginTop: spacing.sm }}
          />
        </AppCard>

        <AppCard style={{ gap: spacing.xs, marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>{t("privacidade.localDataTitle")}</Text>
          <Text style={styles.cardText}>{t("privacidade.localDataText")}</Text>

          <Button
            label={t("privacidade.deleteLocalData")}
            variant="secondary"
            onPress={confirmarApagar}
            loading={apagando}
            disabled={apagando}
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  cardTitle: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  cardText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  permissionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  permissionLabel: { color: colors.textSecondary, fontSize: fontSizes.xs },
  permissionValue: { color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
});
