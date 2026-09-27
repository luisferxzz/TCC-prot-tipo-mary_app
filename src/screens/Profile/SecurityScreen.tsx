/**
 * Mary App — Segurança
 * Troca de senha via supabase.auth.updateUser(). Com uma
 * sessão válida o Supabase não pede a senha atual — por
 * isso não há campo "senha atual" aqui.
 */

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { AppCard } from "../../components/AppCard";
import { alterarSenha } from "../../services/supabase/auth";
import type { ProfileStackNavigation } from "../../navigation/types";

export function SecurityScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (novaSenha.length < 6) {
      Alert.alert(t("seguranca.tooShortError"));
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert(t("seguranca.mismatchError"));
      return;
    }

    setSalvando(true);
    const resultado = await alterarSenha(novaSenha);
    setSalvando(false);

    if (resultado.sucesso) {
      setNovaSenha("");
      setConfirmarSenha("");
      Alert.alert(t("seguranca.successTitle"), t("seguranca.successText"));
    } else {
      Alert.alert(t("seguranca.errorText"));
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>{t("seguranca.title")}</Text>
          <Text style={styles.subtitle}>{t("seguranca.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppCard style={{ gap: spacing.md }}>
          <View>
            <Text style={styles.label}>{t("seguranca.newPasswordLabel")}</Text>
            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder={t("seguranca.newPasswordPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <View>
            <Text style={styles.label}>{t("seguranca.confirmPasswordLabel")}</Text>
            <TextInput
              style={styles.input}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              placeholder={t("seguranca.confirmPasswordPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>
        </AppCard>

        <Button
          label={t("seguranca.save")}
          onPress={salvar}
          loading={salvando}
          disabled={salvando}
          style={{ marginTop: spacing.lg }}
        />
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
  label: { marginBottom: 6, color: colors.textSecondary, fontSize: 12, fontWeight: fontWeights.medium },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, color: colors.text, backgroundColor: colors.surfaceLight, fontSize: 14,
  },
});
