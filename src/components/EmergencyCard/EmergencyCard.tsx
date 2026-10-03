/**
 * Mary App — EmergencyCard
 * Destaque de emergência da Home. Precisa ser fácil de
 * achar rapidamente, mas sem parecer alarmante — por isso
 * usa a cor primária do tema (não vermelho puro) com um
 * leve brilho, não uma cor de "perigo".
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "../../theme";
import { Text } from "../../components/AppText";

type EmergencyCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
};

export function EmergencyCard({ title, description, buttonLabel, onPress }: EmergencyCardProps) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <Animated.View style={estiloAnimado}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (escala.value = withTiming(0.98, { duration: 100 }))}
        onPressOut={() => (escala.value = withTiming(1, { duration: 150 }))}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${description}`}
        style={styles.card}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="warning" size={22} color={colors.white} />
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.button}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    ...(shadows.primaryGlow as object),
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  textArea: { flex: 1 },
  title: { color: colors.white, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
  description: { marginTop: 2, color: "rgba(255,255,255,0.85)", fontSize: 11.5 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  buttonText: { color: colors.white, fontSize: 11.5, fontWeight: fontWeights.bold },
});
