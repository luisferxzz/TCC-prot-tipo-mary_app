/**
 * Mary App — ProfileOption
 * Lista de opções agrupada (Editar perfil, Segurança,
 * Localização...), com divisórias entre itens em vez de
 * cards soltos — mesmo padrão usado nas Configurações da
 * versão Web do projeto.
 */

import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "../../theme";
import { Text } from "../../components/AppText";

export type ProfileOptionItem = {
  key: string;
  /** Nome de um ícone do Ionicons — ver https://icons.expo.fyi */
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  onPress: () => void;
};

export function ProfileOptionGroup({ items }: { items: ProfileOptionItem[] }) {
  return (
    <View style={styles.group}>
      {items.map((item, indice) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          style={({ pressed }) => [
            styles.row,
            indice > 0 && styles.rowDivider,
            pressed && styles.rowPressed,
          ]}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name={item.icon} size={18} color={colors.primaryLight} />
          </View>

          <View style={styles.textArea}>
            <Text style={styles.label}>{item.label}</Text>
            {Boolean(item.description) && (
              <Text style={styles.description}>{item.description}</Text>
            )}
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    ...(shadows.card as object),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surfaceLight },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}1F`,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 16 },
  textArea: { flex: 1 },
  label: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  description: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  chevron: { color: colors.textMuted, fontSize: 22, fontWeight: fontWeights.regular },
});
