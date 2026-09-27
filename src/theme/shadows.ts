/**
 * Mary App — sombras centralizadas
 * Um único lugar pra ajustar a "sensação" de profundidade
 * do app inteiro (Etapa 23 do pedido: tema centralizado).
 */

import { Platform } from "react-native";
import { colors } from "./colors";

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 4 },
    default: {},
  }),

  floating: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 10 },
    default: {},
  }),

  primaryGlow: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: {},
  }),
} as const;
