/**
 * Mary App — Configurações de emergência
 *
 * Só controla UMA coisa por enquanto: quais contatos
 * aparecem como botão de ligação rápida depois que o SOS é
 * confirmado (ver EmergencyScreen.tsx). Isso é lido via
 * deveNotificar() em services/storage/contacts.ts — sem
 * nenhum "envio" real, porque o app não tem SMS/push
 * automático implementado.
 */

import React, { useCallback, useState } from "react";
import { View, Pressable, Switch, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import {
  Contato,
  obterContatos,
  atualizarContato,
  deveNotificar,
} from "../../services/storage/contacts";
import type { ProfileStackNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

export function EmergencySettingsScreen() {
  const navigation = useNavigation<ProfileStackNavigation>();
  const { t } = useTranslation();

  const [contatos, setContatos] = useState<Contato[]>([]);

  const carregar = useCallback(async () => {
    setContatos(await obterContatos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function alternar(contato: Contato, valor: boolean) {
    setContatos((atual) =>
      atual.map((c) => (c.id === contato.id ? { ...c, notificarSos: valor } : c))
    );
    await atualizarContato(contato.id, { notificarSos: valor });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("emergenciaConfig.title")}</Text>
          <Text style={styles.subtitle}>{t("emergenciaConfig.subtitle")}</Text>
        </View>
      </View>

      {contatos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={30} color={colors.textMuted} style={{ marginBottom: 4 }} />
          <Text style={styles.emptyText}>{t("emergenciaConfig.emptyText")}</Text>
          <Button
            label={t("emergenciaConfig.manageAllContacts")}
            onPress={() => navigation.navigate("Emergencia", { screen: "Contacts" })}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : (
        <FlatList
          data={contatos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <Pressable
              onPress={() => navigation.navigate("Emergencia", { screen: "Contacts" })}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>{t("emergenciaConfig.manageAllContacts")}</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.nome}</Text>
                <Text style={styles.rowMeta}>{item.relacao || item.telefone}</Text>
              </View>
              <Switch
                value={deveNotificar(item)}
                onValueChange={(valor) => alternar(item, valor)}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  backButton: {
    width: 40, height: 40, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  backButtonText: { color: colors.text, fontSize: 20 },
  title: { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: fontSizes.xs, maxWidth: 280 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  rowName: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  rowMeta: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  footerLink: { alignItems: "center", paddingVertical: spacing.md },
  footerLinkText: { color: colors.primaryLight, fontSize: 12, fontWeight: fontWeights.medium },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: 6 },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: "center", maxWidth: 260 },
});
