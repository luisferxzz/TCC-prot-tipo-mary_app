/**
 * Mary App — paleta de cores
 * Extraída fielmente de css/global.css (:root) do projeto Web.
 * Nenhuma cor foi inventada ou alterada nesta migração.
 */

export const colors = {
  primary: "#d81b60",
  primaryDark: "#ad1457",
  primaryLight: "#f06292",

  background: "#0f0f10",
  surface: "#18181b",
  surfaceLight: "#222225",

  text: "#ffffff",
  textSecondary: "#b8b8bd",
  textMuted: "#85858c",

  border: "#303036",

  success: "#2e7d32",
  successLight: "#66bb6a",
  warning: "#f9a825",
  danger: "#d32f2f",
  dangerLight: "#ff6b6b",

  white: "#ffffff",
} as const;

export type ColorName = keyof typeof colors;
