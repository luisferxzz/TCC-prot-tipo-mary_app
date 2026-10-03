/**
 * Mary App — Text / TextInput com a fonte do app (Inter)
 *
 * Em React Native cada peso de uma fonte customizada é uma
 * família diferente. Estes wrappers leem o fontWeight do
 * estilo, escolhem a família Inter correspondente e removem
 * o fontWeight (evita "negrito duplo" no Android). Todo o
 * resto do estilo continua igual — por isso telas e
 * componentes só trocam o import, sem mexer nos estilos.
 */

import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  TextProps,
  TextInputProps,
} from "react-native";
import { fontFamilyPorPeso } from "../../theme";

export function Text({ style, ...props }: TextProps) {
  const peso = StyleSheet.flatten(style)?.fontWeight;
  return (
    <RNText
      {...props}
      style={[{ fontFamily: fontFamilyPorPeso(peso) }, style, { fontWeight: undefined }]}
    />
  );
}

export function TextInput({ style, ...props }: TextInputProps) {
  const peso = StyleSheet.flatten(style)?.fontWeight;
  return (
    <RNTextInput
      {...props}
      style={[{ fontFamily: fontFamilyPorPeso(peso) }, style, { fontWeight: undefined }]}
    />
  );
}
