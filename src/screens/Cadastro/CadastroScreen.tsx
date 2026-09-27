/**
 * Mary App — Cadastro
 * Espelha cadastro.html/cadastro.js: 2 etapas (dados
 * pessoais + endereço/senha), Supabase Auth (signUp) +
 * gravação do perfil na tabela "usuarios".
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import { supabase } from "../../services/supabase/client";
import type { RootStackNavigation } from "../../navigation/types";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CadastroScreen() {
  const navigation = useNavigation<RootStackNavigation>();
  const { t } = useTranslation();

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Etapa 1
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Etapa 2
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);

  function validarEtapa1(): boolean {
    if (!nome.trim() || !REGEX_EMAIL.test(email.trim()) || !telefone.trim()) {
      setMensagem(t("login.invalidEmail"));
      return false;
    }
    setMensagem("");
    return true;
  }

  function aoAvancar() {
    if (validarEtapa1()) {
      setEtapa(2);
    }
  }

  async function aoFinalizar() {
    setMensagem("");

    if (senha.length < 6) {
      setMensagem("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    if (!aceitaTermos) {
      setMensagem(t("cadastro.termsLabel"));
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (error) {
        setMensagem(error.message);
        setCarregando(false);
        return;
      }

      const usuarioId = data.user?.id;

      if (usuarioId) {
        await supabase.from("usuarios").insert({
          id: usuarioId,
          nome: nome.trim(),
          telefone: telefone.trim(),
          data_nascimento: dataNascimento || null,
          cidade: cidade || null,
          estado: estado || null,
          endereco: endereco || null,
          numero: numero || null,
          complemento: complemento || null,
        });
      }

      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (erro) {
      console.error("[MaryApp] Erro ao criar conta:", erro);
      setMensagem("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => (etapa === 2 ? setEtapa(1) : navigation.goBack())}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>

          <Text style={styles.title}>{t("cadastro.title")}</Text>
          <Text style={styles.subtitle}>
            {etapa === 1 ? t("cadastro.step1Title") : t("cadastro.step2Title")}
          </Text>

          <View style={styles.progress}>
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={[styles.progressStep, etapa === 2 && styles.progressStepActive]} />
          </View>

          {etapa === 1 ? (
            <>
              <Field label={t("cadastro.fullName")} value={nome} onChangeText={setNome} />
              <Field label={t("cadastro.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Field label={t("cadastro.phone")} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
              <Field label={t("cadastro.birthDate")} value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" />

              {Boolean(mensagem) && <Text style={styles.errorText}>{mensagem}</Text>}

              <Button label={t("cadastro.next")} onPress={aoAvancar} />
            </>
          ) : (
            <>
              <Field label={t("cadastro.password")} value={senha} onChangeText={setSenha} secureTextEntry />
              <Field label={t("cadastro.confirmPassword")} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />
              <Field label={t("cadastro.city")} value={cidade} onChangeText={setCidade} />
              <Field label={t("cadastro.state")} value={estado} onChangeText={setEstado} />
              <Field label={t("cadastro.address")} value={endereco} onChangeText={setEndereco} />
              <Field label={t("cadastro.number")} value={numero} onChangeText={setNumero} keyboardType="numeric" />
              <Field label={t("cadastro.complement")} value={complemento} onChangeText={setComplemento} />

              <Pressable style={styles.termsRow} onPress={() => setAceitaTermos((atual) => !atual)}>
                <View style={[styles.checkbox, aceitaTermos && styles.checkboxChecked]}>
                  {aceitaTermos && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>{t("cadastro.termsLabel")}</Text>
              </Pressable>

              {Boolean(mensagem) && <Text style={styles.errorText}>{mensagem}</Text>}

              <View style={styles.actionsRow}>
                <Button
                  label={t("cadastro.back")}
                  variant="secondary"
                  onPress={() => setEtapa(1)}
                  style={{ flex: 1 }}
                />
                <Button
                  label={t("cadastro.submit")}
                  onPress={aoFinalizar}
                  loading={carregando}
                  style={{ flex: 1.3 }}
                />
              </View>
            </>
          )}

          <View style={styles.loginArea}>
            <Text style={styles.loginText}>{t("cadastro.alreadyHaveAccount")}</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>{t("cadastro.signIn")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 16 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backButtonText: { color: colors.text, fontSize: 22 },
  title: { color: colors.text, fontSize: 25, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 6, marginBottom: 18, color: colors.textSecondary, fontSize: fontSizes.sm },
  progress: { flexDirection: "row", gap: 8, marginBottom: 22 },
  progressStep: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  progressStepActive: { backgroundColor: colors.primary },
  inputGroup: { marginBottom: 15 },
  label: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, marginBottom: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  errorText: { color: colors.dangerLight, fontSize: 12.5, marginBottom: 12 },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 4, marginBottom: 18 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: colors.white, fontSize: 12, fontWeight: fontWeights.bold },
  termsText: { flex: 1, color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  actionsRow: { flexDirection: "row", gap: 10 },
  loginArea: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 26 },
  loginText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  loginLink: { color: colors.primaryLight, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
});
