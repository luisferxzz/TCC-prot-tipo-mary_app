/**
 * Mary App — placeholder para telas ainda não migradas
 * nesta fase (Mapa, Contatos, Configurações chegam nas
 * próximas etapas, como combinado).
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fontSizes, fontWeights } from "../../theme";
import { Text } from "../../components/AppText";

export function PlaceholderScreen({ nome }: { nome: string }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{nome}</Text>
        <Text style={styles.subtitle}>Esta tela chega em uma próxima etapa da migração.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  title: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { color: colors.textMuted, fontSize: fontSizes.sm, textAlign: "center" },
});
