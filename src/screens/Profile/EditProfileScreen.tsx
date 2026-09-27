/**
 * Mary App — Editar perfil
 * E-mail não é editável aqui (pertence à autenticação);
 * nome e telefone vão pra tabela "usuarios" no Supabase,
 * via atualizarPerfil() em services/supabase/auth.ts.
 */

import React, { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { AppCard } from "../../components/AppCard";
import { obterUsuario, atualizarPerfil } from "../../services/supabase/auth";
import type { ProfileStackNavigation } from "../../navigation/types";

export function EditProfileScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        const usuario = await obterUsuario();
        if (!cancelado && usuario) {
          setEmail(usuario.email);
          setNome(usuario.nome);
          setTelefone(usuario.telefone || "");
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert(t("editarPerfil.fillRequired"));
      return;
    }

    setSalvando(true);
    const resultado = await atualizarPerfil({ nome: nome.trim(), telefone: telefone.trim() });
    setSalvando(false);

    if (resultado.sucesso) {
      Alert.alert(t("editarPerfil.successTitle"), t("editarPerfil.successText"), [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(t("editarPerfil.errorText"));
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>{t("editarPerfil.title")}</Text>
          <Text style={styles.subtitle}>{t("editarPerfil.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppCard style={{ gap: spacing.md }}>
          <View>
            <Text style={styles.label}>{t("editarPerfil.nameLabel")}</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder={t("editarPerfil.namePlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View>
            <Text style={styles.label}>{t("editarPerfil.phoneLabel")}</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder={t("editarPerfil.phonePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text style={styles.label}>{t("editarPerfil.emailLabel")}</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{email}</Text>
            </View>
            <Text style={styles.readonlyNote}>{t("editarPerfil.emailReadonlyNote")}</Text>
          </View>
        </AppCard>

        <Button
          label={t("editarPerfil.save")}
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
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs },
  content: { paddingHorizontal: spacing.lg },
  label: { marginBottom: 6, color: colors.textSecondary, fontSize: 12, fontWeight: fontWeights.medium },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, color: colors.text, backgroundColor: colors.surfaceLight, fontSize: 14,
    justifyContent: "center",
  },
  inputDisabled: { opacity: 0.6 },
  inputDisabledText: { color: colors.textMuted, fontSize: 14 },
  readonlyNote: { marginTop: 4, color: colors.textMuted, fontSize: 11 },
});
