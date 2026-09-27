/**
 * Mary App — tipografia
 * Espelha --text-xs .. --text-xxl de global.css.
 * Fonte do sistema (equivalente ao stack "Inter, -apple-system..."
 * do CSS original — RN usa a fonte nativa da plataforma por padrão,
 * que já é bem próxima esteticamente).
 */

import { Platform } from "react-native";

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
} as const;

export const fontWeights = {
  regular: "400" as const,
  medium: "600" as const,
  bold: "700" as const,
  extraBold: "800" as const,
};

export const fontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});
