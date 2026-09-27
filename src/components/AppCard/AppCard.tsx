/**
 * Mary App — AppCard
 * Cartão base reutilizável em toda a interface (Home,
 * Perfil, Emergência...). Centraliza raio de borda, sombra
 * e fundo — para manter os cards visualmente idênticos em
 * qualquer tela (Etapa 31 do pedido).
 */

import React from "react";
import { View, ViewStyle, Pressable } from "react-native";
import { colors, radius, spacing, shadows } from "../../theme";

type AppCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  accessibilityLabel?: string;
};

export function AppCard({
  children,
  style,
  onPress,
  elevated = true,
  accessibilityLabel,
}: AppCardProps) {
  const baseStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...(elevated ? (shadows.card as ViewStyle) : {}),
    ...style,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [baseStyle, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}
