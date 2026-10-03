/**
 * Mary App — QuickAccessCard
 * Cartão de acesso rápido usado na grade da Home (Mapa,
 * Emergência, Contatos, Hospitais...).
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Pressable } from "react-native";
import { AppCard } from "../AppCard";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { Text } from "../../components/AppText";

type QuickAccessCardProps = {
  icon: string;
  label: string;
  onPress: () => void;
  accentColor?: string;
  style?: ViewStyle;
  large?: boolean;
};

export function QuickAccessCard({
  icon,
  label,
  onPress,
  accentColor = colors.primary,
  style,
  large = false,
}: QuickAccessCardProps) {
  const escala = useSharedValue(1);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, estiloAnimado, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (escala.value = withTiming(0.97, { duration: 100 }))}
        onPressOut={() => (escala.value = withTiming(1, { duration: 150 }))}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <AppCard style={large ? styles.cardLarge : styles.card} elevated>
          <View
            style={[
              large ? styles.iconWrapperLarge : styles.iconWrapper,
              { backgroundColor: `${accentColor}26` },
            ]}
          >
            <Text style={large ? styles.iconLarge : styles.icon}>{icon}</Text>
          </View>
          <Text style={large ? styles.labelLarge : styles.label}>{label}</Text>
        </AppCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "flex-start", gap: spacing.sm, minHeight: 100 },
  cardLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 84,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperLarge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 20 },
  iconLarge: { fontSize: 24 },
  label: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  labelLarge: { color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
});
