/**
 * Mary App — Login
 * Espelha login.html/login.js: e-mail + senha via Supabase
 * Auth, mostrar/ocultar senha, esqueci minha senha, login
 * social preparado (não funcional — mesmo aviso do Web).
 */

import React, { useState } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { fazerLogin, recuperarSenha } from "../../services/supabase/auth";
import type { RootStackNavigation } from "../../navigation/types";
import { Text, TextInput } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const navigation = useNavigation<RootStackNavigation>();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState<"erro" | "sucesso" | "">("");
  const [carregando, setCarregando] = useState(false);

  function limparErros() {
    setErroEmail("");
    setErroSenha("");
    setMensagem("");
    setMensagemTipo("");
  }

  async function aoEntrar() {
    limparErros();

    let valido = true;
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado) {
      setErroEmail(t("login.emptyEmail"));
      valido = false;
    } else if (!REGEX_EMAIL.test(emailNormalizado)) {
      setErroEmail(t("login.invalidEmail"));
      valido = false;
    }

    if (!senha) {
      setErroSenha(t("login.emptyPassword"));
      valido = false;
    }

    if (!valido) return;

    setCarregando(true);
    setMensagem(t("login.signingIn"));

    try {
      const { data, error } = await fazerLogin(emailNormalizado, senha);

      if (error) {
        const mensagemErro = String(error.message || "").toLowerCase();

        if (mensagemErro.includes("email not confirmed")) {
          setMensagemTipo("erro");
          setMensagem("Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).");
        } else if (mensagemErro.includes("too many requests")) {
          setMensagemTipo("erro");
          setMensagem("Muitas tentativas. Aguarde um pouco e tente novamente.");
        } else {
          setMensagemTipo("erro");
          setMensagem(t("login.genericError"));
        }

        setCarregando(false);
        return;
      }

      if (!data?.session) {
        setMensagemTipo("erro");
        setMensagem(t("login.genericError"));
        setCarregando(false);
        return;
      }

      setMensagemTipo("sucesso");
      setMensagem(t("login.success"));

      navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
    } catch (erro) {
      console.error("[MaryApp] Erro inesperado no login:", erro);
      setMensagemTipo("erro");
      setMensagem(t("login.genericError"));
      setCarregando(false);
    }
  }

  async function aoEsquecerSenha() {
    const emailNormalizado = email.trim().toLowerCase();

    if (!REGEX_EMAIL.test(emailNormalizado)) {
      setMensagemTipo("erro");
      setMensagem(t("login.invalidEmail"));
      return;
    }

    try {
      await recuperarSenha(emailNormalizado);
      setMensagemTipo("sucesso");
      setMensagem(t("login.success"));
    } catch (erro) {
      console.error("[MaryApp] Erro ao recuperar senha:", erro);
    }
  }

  function aoTocarSocial(provedor: string) {
    setMensagemTipo("");
    setMensagem(`${provedor} — ${t("common.comingSoon")}`);
  }

  // ⚠️ TEMPORÁRIO — não faz login real, só pula pra Home.
  // Remova esta função junto com o botão que a chama.
  function aoEntrarSemConta() {
    navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.title}>{t("login.title")}</Text>
            <Text style={styles.tagline}>{t("login.tagline")}</Text>
          </View>

          <View style={styles.formTitle}>
            <Text style={styles.welcomeTitle}>{t("login.welcomeTitle")}</Text>
            <Text style={styles.welcomeSubtitle}>{t("login.welcomeSubtitle")}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("login.emailLabel")}</Text>
            <TextInput
              style={[styles.input, Boolean(erroEmail) && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder={t("login.emailPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!carregando}
            />
            {Boolean(erroEmail) && <Text style={styles.errorText}>{erroEmail}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("login.passwordLabel")}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, Boolean(erroSenha) && styles.inputError]}
                value={senha}
                onChangeText={setSenha}
                placeholder={t("login.passwordPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!senhaVisivel}
                editable={!carregando}
              />
              <Pressable
                onPress={() => setSenhaVisivel((atual) => !atual)}
                style={styles.passwordToggle}
                accessibilityRole="button"
                accessibilityLabel={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              >
                <Ionicons name={senhaVisivel ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            {Boolean(erroSenha) && <Text style={styles.errorText}>{erroSenha}</Text>}
          </View>

          <Pressable onPress={aoEsquecerSenha} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t("login.forgotPassword")}</Text>
          </Pressable>

          <Button
            label={carregando ? t("login.signingIn") : t("login.submitButton")}
            onPress={aoEntrar}
            loading={carregando}
          />

          {Boolean(mensagem) && (
            <Text
              style={[
                styles.message,
                mensagemTipo === "erro" && styles.messageError,
                mensagemTipo === "sucesso" && styles.messageSuccess,
              ]}
            >
              {mensagem}
            </Text>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("login.orContinueWith")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable
              style={[styles.socialButton, { backgroundColor: "#4285f4" }]}
              onPress={() => aoTocarSocial("Google")}
              accessibilityLabel={`Entrar com Google — ${t("common.comingSoon")}`}
            >
              <Text style={styles.socialButtonText}>G</Text>
            </Pressable>

            <Pressable
              style={[styles.socialButton, { backgroundColor: "#1877f2" }]}
              onPress={() => aoTocarSocial("Facebook")}
              accessibilityLabel={`Entrar com Facebook — ${t("common.comingSoon")}`}
            >
              <Text style={styles.socialButtonText}>f</Text>
            </Pressable>
          </View>

          <View style={styles.registerArea}>
            <Text style={styles.registerText}>{t("login.noAccount")}</Text>
            <Pressable onPress={() => navigation.navigate("Cadastro")}>
              <Text style={styles.registerLink}>{t("login.createAccount")}</Text>
            </Pressable>
          </View>

          {/* =====================================================
              ⚠️ TEMPORÁRIO — SÓ PARA TESTES
              Remova este bloco (e a função aoEntrarSemConta)
              antes de entregar/publicar o projeto. Não faz
              nenhum login real — só pula direto pra Home
              pra testar a interface enquanto o cadastro real
              é investigado.
          ===================================================== */}
          <Pressable onPress={aoEntrarSemConta} style={styles.devBypassButton}>
            <Ionicons name="flask-outline" size={14} color={colors.textMuted} />
            <Text style={styles.devBypassText}>Entrar sem conta (modo de teste)</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: { color: colors.white, fontSize: 34, fontWeight: fontWeights.extraBold },
  title: { color: colors.text, fontSize: 24, fontWeight: fontWeights.extraBold, letterSpacing: 2 },
  tagline: { marginTop: 6, color: colors.textSecondary, fontSize: fontSizes.sm },
  formTitle: { marginBottom: 24 },
  welcomeTitle: { color: colors.text, fontSize: 23, fontWeight: fontWeights.bold },
  welcomeSubtitle: { marginTop: 6, color: colors.textSecondary, fontSize: fontSizes.sm },
  inputGroup: { marginBottom: 17 },
  label: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, marginBottom: 7 },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  inputError: { borderColor: colors.dangerLight },
  errorText: { marginTop: 5, color: colors.dangerLight, fontSize: 11.5 },
  passwordWrapper: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 54 },
  passwordToggle: { position: "absolute", right: 10 },
  forgotPassword: { alignSelf: "flex-end", marginTop: -8, marginBottom: 4 },
  forgotPasswordText: { color: colors.primaryLight, fontSize: 13, fontWeight: fontWeights.medium },
  message: { marginTop: 14, textAlign: "center", fontSize: fontSizes.sm, color: colors.textSecondary },
  messageError: { color: colors.dangerLight },
  messageSuccess: { color: colors.successLight },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: radius.lg - 3,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: { color: colors.white, fontSize: 17, fontWeight: fontWeights.extraBold },
  registerArea: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 24 },
  registerText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  registerLink: { color: colors.primaryLight, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  devBypassButton: {
    marginTop: 28,
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.warning,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  devBypassText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: fontWeights.medium,
  },
});
