/**
 * Mary App — Cartão "Modo Seguro"
 *
 * IMPORTANTE (mesma regra usada na versão Web do projeto):
 * isto reflete status REAIS do app (sistema funcionando,
 * localização ativa ou não, contatos cadastrados) — nunca
 * uma garantia de segurança pessoal que o app não pode
 * calcular. "Modo Seguro" aqui é o nome da seção, não uma
 * promessa de proteção.
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppCard } from "../AppCard";
import { colors, spacing, fontSizes, fontWeights } from "../../theme";
import { Text } from "../../components/AppText";

type SecurityStatusCardProps = {
  title: string;
  description: string;
  locationText: string;
  contactsText: string;
  /** Opcional — só aparece se informado (ex.: quando a preferência de notificações já existir). */
  notificationsText?: string;
  /** "ok" (padrão, verde) ou "attention" (amarelo) quando algo precisa de atenção do usuário. */
  tone?: "ok" | "attention";
};

export function SecurityStatusCard({
  title,
  description,
  locationText,
  contactsText,
  notificationsText,
  tone = "ok",
}: SecurityStatusCardProps) {
  const corStatus = tone === "attention" ? colors.warning : colors.successLight;
  const pulso = useSharedValue(1);

  useEffect(() => {
    pulso.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const estiloPulso = useAnimatedStyle(() => ({
    transform: [{ scale: pulso.value }],
    opacity: 2 - pulso.value,
  }));

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dotWrapper}>
          <Animated.View style={[styles.dotPulse, { backgroundColor: corStatus }, estiloPulso]} />
          <View style={[styles.dot, { backgroundColor: corStatus }]} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.chipText}>{locationText}</Text>
        </View>

        <View style={styles.chip}>
          <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.chipText}>{contactsText}</Text>
        </View>

        {Boolean(notificationsText) && (
          <View style={styles.chip}>
            <Ionicons name="notifications-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.chipText}>{notificationsText}</Text>
          </View>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dotWrapper: { width: 12, height: 12, alignItems: "center", justifyContent: "center" },
  dotPulse: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerText: { flex: 1 },
  title: { color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold, letterSpacing: 0.3 },
  description: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
  },
  chipIcon: { fontSize: 12 },
  chipText: { color: colors.textSecondary, fontSize: 11, fontWeight: fontWeights.medium },
});
