/**
 * Mary App — Idioma
 * Mesma ideia do modal de idioma da versão Web: busca +
 * lista com o idioma atual marcado. Aqui é uma tela de
 * verdade (com "voltar"), já que no mobile isso funciona
 * melhor como tela do que como modal pequeno.
 */

import React, { useMemo, useState } from "react";
import { View, Pressable, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import type { CodigoIdioma } from "../../i18n";
import type { ProfileStackNavigation } from "../../navigation/types";
import { Text, TextInput } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

export function LanguageScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t, idiomaAtual, idiomasDisponiveis, definirIdioma } = useTranslation();
  const [busca, setBusca] = useState("");

  const idiomasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return idiomasDisponiveis;
    return idiomasDisponiveis.filter((idioma) => idioma.name.toLowerCase().includes(termo));
  }, [busca, idiomasDisponiveis]);

  async function aoSelecionar(codigo: CodigoIdioma) {
    await definirIdioma(codigo);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <View>
          <Text style={styles.title}>{t("languageModal.title")}</Text>
          <Text style={styles.subtitle}>{t("languageModal.subtitle")}</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={14} color={colors.textSecondary} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder={t("languageModal.searchPlaceholder")}
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={idiomasFiltrados}
        keyExtractor={(item) => item.codigo}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selecionado = item.codigo === idiomaAtual;
          return (
            <Pressable
              onPress={() => aoSelecionar(item.codigo)}
              style={[styles.option, selecionado && styles.optionSelected]}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              accessibilityState={{ selected: selecionado }}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={styles.optionText}>{item.name}</Text>
              {selecionado && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: { color: colors.text, fontSize: 20 },
  title: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSizes.sm, paddingVertical: 10 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}14` },
  flag: { fontSize: 18 },
  optionText: { flex: 1, color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  check: { color: colors.primary, fontSize: 16, fontWeight: fontWeights.bold },
});
