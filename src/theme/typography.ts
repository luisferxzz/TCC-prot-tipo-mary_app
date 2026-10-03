/**
 * Mary App — tipografia
 * Espelha --text-xs .. --text-xxl de global.css.
 * Fonte: Inter (Google Fonts, via @expo-google-fonts/inter),
 * carregada em App.tsx com useFonts(). `fontFamily` abaixo é
 * o antigo fallback de fonte do sistema — não é mais usado
 * pelos componentes de texto (ver Text/TextInput em
 * components/AppText), mas fica disponível caso precise.
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

/**
 * Inter — uma família por peso. Em React Native, fontes
 * customizadas não usam fontWeight: cada peso é um arquivo
 * separado, então o componente AppText traduz o fontWeight
 * do estilo para a família certa (ver components/AppText).
 */
export const fontFamilies = {
  regular: "Inter_400Regular",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
} as const;

export function fontFamilyPorPeso(peso?: string | number): string {
  const n = typeof peso === "string" ? parseInt(peso, 10) : peso;
  if (!n || n < 500) return fontFamilies.regular;
  if (n < 700) return fontFamilies.semibold;
  if (n < 800) return fontFamilies.bold;
  return fontFamilies.extraBold;
}
