/**
 * Mary App — Tela de carregamento
 * Espelha index.html + index.js: mostra a marca por um
 * instante, verifica sessão, verifica onboarding, decide
 * o destino. Aqui a "navegação por URL" vira navigation.reset().
 *
 * IMPORTANTE (à prova de trava):
 * Se a verificação de sessão do Supabase travar ou nunca
 * responder (rede indisponível, problema de configuração,
 * etc.), esta tela NUNCA deve prender o usuário sem nenhum
 * botão pra tocar. Por isso:
 * 1. Toda a decisão roda com um limite de tempo (timeout);
 * 2. Qualquer erro cai num fallback seguro (Login), nunca
 *    fica esperando pra sempre;
 * 3. Um botão "Continuar" aparece depois de alguns segundos,
 *    como saída de emergência manual.
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, ActivityIndicator, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { estaLogado } from "../../services/supabase/auth";
import { onboardingConcluido } from "../../services/storage/preferences";
import type { RootStackNavigation } from "../../navigation/types";

const TEMPO_LIMITE_MS = 5000;
const TEMPO_ATE_MOSTRAR_BOTAO_MS = 4000;

function comLimiteDeTempo<T>(promessa: Promise<T>, ms: number, valorPadrao: T): Promise<T> {
  return new Promise((resolve) => {
    const cronometro = setTimeout(() => resolve(valorPadrao), ms);

    promessa
      .then((valor) => {
        clearTimeout(cronometro);
        resolve(valor);
      })
      .catch(() => {
        clearTimeout(cronometro);
        resolve(valorPadrao);
      });
  });
}

export function LoadingScreen() {
  const navigation = useNavigation<RootStackNavigation>();
  const { t } = useTranslation();

  const [mostrarBotaoEmergencia, setMostrarBotaoEmergencia] = useState(false);
  const [mensagemDiagnostico, setMensagemDiagnostico] = useState("");

  const opacidade = useRef(new Animated.Value(0)).current;
  const deslocamento = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 1, duration: 750, delay: 250, useNativeDriver: true }),
      Animated.timing(deslocamento, { toValue: 0, duration: 750, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cronometroBotao = setTimeout(() => {
      if (!cancelado) setMostrarBotaoEmergencia(true);
    }, TEMPO_ATE_MOSTRAR_BOTAO_MS);

    async function decidirDestino() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 900));
        if (cancelado) return;

        // Nunca espera para sempre: se estaLogado() travar,
        // depois de TEMPO_LIMITE_MS assumimos "não logado"
        // e seguimos o fluxo normal em vez de ficar preso.
        const logado = await comLimiteDeTempo(estaLogado(), TEMPO_LIMITE_MS, false);
        if (cancelado) return;

        if (logado) {
          navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
          return;
        }

        const jaViuOnboarding = await comLimiteDeTempo(onboardingConcluido(), TEMPO_LIMITE_MS, false);
        if (cancelado) return;

        if (jaViuOnboarding) {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        }
      } catch (erro) {
        console.error("[MaryApp] Erro ao decidir destino inicial:", erro);

        if (!cancelado) {
          setMensagemDiagnostico(String((erro as Error)?.message || erro));
          // Nunca trava numa tela sem saída — em erro
          // inesperado, vai para o Login.
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }
    }

    decidirDestino();

    return () => {
      cancelado = true;
      clearTimeout(cronometroBotao);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.logo, { opacity: opacidade, transform: [{ translateY: deslocamento }] }]}
      >
        <Text style={styles.logoText}>M</Text>
      </Animated.View>

      <Text style={styles.title}>MARY</Text>
      <Text style={styles.tagline}>{t("index.loadingTagline")}</Text>

      <ActivityIndicator color={colors.primary} style={styles.spinner} />

      {mostrarBotaoEmergencia && (
        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyText}>Isso está demorando mais que o esperado.</Text>

          {Boolean(mensagemDiagnostico) && (
            <Text style={styles.diagnosticoText}>Detalhe técnico: {mensagemDiagnostico}</Text>
          )}

          <Pressable
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}
            style={styles.emergencyButton}
          >
            <Text style={styles.emergencyButtonText}>Continuar mesmo assim</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: radius.xl - 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoText: { color: colors.white, fontSize: 33, fontWeight: fontWeights.extraBold },
  title: { color: colors.text, fontSize: fontSizes.xl - 1, fontWeight: fontWeights.extraBold, letterSpacing: 3 },
  tagline: { marginTop: 8, color: colors.textMuted, fontSize: 13.5, textAlign: "center", lineHeight: 19 },
  spinner: { marginTop: 18 },
  emergencyBox: {
    marginTop: 34,
    alignItems: "center",
    gap: 10,
    maxWidth: 280,
  },
  emergencyText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  diagnosticoText: {
    color: colors.dangerLight,
    fontSize: 10.5,
    textAlign: "center",
  },
  emergencyButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emergencyButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: fontWeights.medium,
  },
});
