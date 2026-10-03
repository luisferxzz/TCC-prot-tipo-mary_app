/**
 * Mary App — Perfil
 *
 * Segue a referência visual: foto + nome + e-mail + status
 * no topo, cartões de "Informações pessoais", lista
 * agrupada de "Configurações", card de "Configurações de
 * emergência" e "Sair da conta".
 *
 * Todos os itens abaixo (Editar perfil, Segurança,
 * Localização, Notificações, Idioma, Privacidade,
 * Configurações de emergência) já são telas reais na
 * ProfileStack — nada mais cai em "em breve" aqui.
 */

import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "../../theme";
import { useTranslation } from "../../i18n";
import { AppCard } from "../../components/AppCard";
import { ProfileOptionGroup, ProfileOptionItem } from "../../components/ProfileOption";
import { obterUsuario, fazerLogout, UsuarioLocal } from "../../services/supabase/auth";
import {
  obterFotoPerfil,
  removerFotoPerfil,
  tirarFoto,
  escolherFotoDaGaleria,
} from "../../services/storage/profilePhoto";
import type { ProfileStackNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";

export function ProfileScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [usuario, setUsuario] = useState<UsuarioLocal | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        const [dadosUsuario, foto] = await Promise.all([obterUsuario(), obterFotoPerfil()]);
        if (!cancelado) {
          setUsuario(dadosUsuario);
          setFotoUri(foto);
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  function abrirOpcoesDeFoto() {
    Alert.alert(
      t("perfil.photoOptionsTitle"),
      t("perfil.photoOptionsText"),
      [
        {
          text: t("perfil.photoKeepSystem"),
          onPress: async () => {
            await removerFotoPerfil();
            setFotoUri(null);
          },
        },
        {
          text: t("perfil.photoTakePhoto"),
          onPress: async () => {
            const resultado = await tirarFoto();
            if (resultado.sucesso) {
              setFotoUri(resultado.uri);
            } else if (resultado.motivo === "permissao_negada") {
              Alert.alert(
                t("perfil.permissionNeededTitle"),
                t("perfil.cameraPermissionText")
              );
            }
          },
        },
        {
          text: t("perfil.photoChooseGallery"),
          onPress: async () => {
            const resultado = await escolherFotoDaGaleria();
            if (resultado.sucesso) {
              setFotoUri(resultado.uri);
            } else if (resultado.motivo === "permissao_negada") {
              Alert.alert(
                t("perfil.permissionNeededTitle"),
                t("perfil.galleryPermissionText")
              );
            }
          },
        },
        { text: t("perfil.cancel"), style: "cancel" },
      ],
      { cancelable: true }
    );
  }

  async function aoSair() {
    Alert.alert(t("perfil.logoutConfirmTitle"), t("perfil.logoutConfirmText"), [
      { text: "Cancelar", style: "cancel" },
      {
        text: t("perfil.logout"),
        style: "destructive",
        onPress: async () => {
          await fazerLogout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }

  const nome = usuario?.nome || "Usuário";
  const email = usuario?.email || "—";
  const telefone = usuario?.telefone || t("perfil.notInformed");

  const opcoesConfiguracoes: ProfileOptionItem[] = [
    { key: "editar", icon: "person-outline", label: t("perfil.editProfile"), onPress: () => navigation.navigate("EditProfile") },
    { key: "seguranca", icon: "shield-checkmark-outline", label: t("perfil.security"), onPress: () => navigation.navigate("Security") },
    { key: "localizacao", icon: "location-outline", label: t("perfil.location"), onPress: () => navigation.navigate("Location") },
    { key: "notificacoes", icon: "notifications-outline", label: t("notificacoesConfig.title"), onPress: () => navigation.navigate("Notifications") },
    { key: "idioma", icon: "globe-outline", label: t("configuracoes.language"), onPress: () => navigation.navigate("Language") },
    { key: "privacidade", icon: "lock-closed-outline", label: t("perfil.privacy"), onPress: () => navigation.navigate("Privacy") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Pressable onPress={abrirOpcoesDeFoto} style={styles.avatarWrapper} accessibilityLabel="Alterar foto de perfil">
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.text} />
            </View>
          </Pressable>

          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.successLight} />
            <Text style={styles.badgeText}>{t("perfil.protected")}</Text>
          </View>
        </Animated.View>

        {/* INFORMAÇÕES PESSOAIS */}
        <Animated.View entering={FadeInDown.duration(400).delay(90)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("perfil.personalInfo")}</Text>

          <View style={styles.infoStack}>
            <AppCard style={styles.infoCard}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                <Text style={styles.infoLabel}>{t("perfil.email")}</Text>
              </View>
              <Text style={styles.infoValue}>{email}</Text>
            </AppCard>

            <AppCard style={styles.infoCard}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                <Text style={styles.infoLabel}>{t("perfil.phone")}</Text>
              </View>
              <Text style={styles.infoValue}>{telefone}</Text>
            </AppCard>
          </View>
        </Animated.View>

        {/* CONFIGURAÇÕES */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("perfil.settings")}</Text>
          <ProfileOptionGroup items={opcoesConfiguracoes} />
        </Animated.View>

        {/* EMERGÊNCIA */}
        <Animated.View entering={FadeInDown.duration(400).delay(270)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t("perfil.emergency")}</Text>
          <ProfileOptionGroup
            items={[
              {
                key: "emergencia",
                icon: "alert-circle-outline",
                label: t("perfil.emergencySettings"),
                description: t("perfil.emergencySettingsDesc"),
                onPress: () => navigation.navigate("EmergencySettings"),
              },
            ]}
          />
        </Animated.View>

        {/* SAIR */}
        <Animated.View entering={FadeInDown.duration(400).delay(360)}>
          <Pressable onPress={aoSair} style={styles.logoutButton} accessibilityRole="button">
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={18} color={colors.dangerLight} />
              <Text style={styles.logoutText}>{t("perfil.logout")}</Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: 140, gap: spacing.xl },
  header: { alignItems: "center", gap: 6 },
  avatarWrapper: { position: "relative", marginBottom: spacing.sm },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radius.xl + 20,
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: radius.xl + 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: { color: colors.white, fontSize: 34, fontWeight: fontWeights.extraBold },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    ...(shadows.card as object),
  },
  cameraBadgeIcon: { fontSize: 13 },
  nome: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  email: { color: colors.textSecondary, fontSize: fontSizes.xs },
  badge: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: `${colors.successLight}22`,
  },
  badgeText: { color: colors.successLight, fontSize: 11, fontWeight: fontWeights.medium },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  infoStack: { gap: spacing.md },
  infoCard: { gap: 4 },
  infoLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { color: colors.textMuted, fontSize: 11, fontWeight: fontWeights.medium },
  infoValue: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  logoutButton: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoutText: { color: colors.dangerLight, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
});
