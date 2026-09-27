/**
 * Mary App — Contatos de emergência
 * CRUD completo (adicionar, editar, remover, marcar como
 * principal), mesma regra de negócio da versão Web.
 */

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, fontSizes, fontWeights, shadows } from "../../theme";
import { useTranslation } from "../../i18n";
import { Button } from "../../components/Button";
import {
  Contato,
  obterContatos,
  adicionarContato,
  removerContato,
  atualizarContato,
} from "../../services/storage/contacts";
import type { EmergencyStackNavigation } from "../../navigation/types";

export function ContactsScreen() {
  const navigation = useNavigation<EmergencyStackNavigation>();
  const { t } = useTranslation();

  const [contatos, setContatos] = useState<Contato[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [relacao, setRelacao] = useState("");
  const [principal, setPrincipal] = useState(false);

  const carregar = useCallback(async () => {
    setContatos(await obterContatos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function abrirParaAdicionar() {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setRelacao("");
    setPrincipal(false);
    setModalVisivel(true);
  }

  function abrirParaEditar(contato: Contato) {
    setEditandoId(contato.id);
    setNome(contato.nome);
    setTelefone(contato.telefone);
    setRelacao(contato.relacao);
    setPrincipal(contato.favorito);
    setModalVisivel(true);
  }

  async function salvar() {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert(t("contatos.fillRequired"));
      return;
    }

    const sucesso = editandoId
      ? await atualizarContato(editandoId, { nome, telefone, relacao, favorito: principal })
      : await adicionarContato({ nome, telefone, relacao, favorito: principal });

    if (!sucesso) {
      Alert.alert(t("contatos.saveError"));
      return;
    }

    setModalVisivel(false);
    carregar();
  }

  function confirmarRemocao(contato: Contato) {
    Alert.alert(t("contatos.removeConfirmTitle", { nome: contato.nome }), t("contatos.removeConfirmText"), [
      { text: t("contatos.cancel"), style: "cancel" },
      {
        text: t("contatos.remove"),
        style: "destructive",
        onPress: async () => {
          await removerContato(contato.id);
          carregar();
        },
      },
    ]);
  }

  function ligarPara(telefone: string) {
    Alert.alert(t("contatos.callConfirmTitle"), t("contatos.callConfirmText", { telefone }), [
      { text: t("contatos.cancel"), style: "cancel" },
      { text: t("contatos.call"), onPress: () => Linking.openURL(`tel:${telefone}`) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={t("common.back")}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("contatos.title")}</Text>
          <Text style={styles.subtitle}>
            {contatos.length === 0 ? t("contatos.emptyTitle") : `${contatos.length} ${t("contatos.countSuffix")}`}
          </Text>
        </View>

        <Pressable onPress={abrirParaAdicionar} style={styles.addButton} accessibilityLabel="Adicionar contato">
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {contatos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>{t("contatos.emptyTitle")}</Text>
          <Text style={styles.emptyText}>
            {t("contatos.emptyText")}
          </Text>
          <Button label={t("contatos.addButton")} onPress={abrirParaAdicionar} style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={contatos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>

              <Pressable style={styles.cardInfo} onPress={() => abrirParaEditar(item)}>
                <View style={styles.nameRow}>
                  <Text style={styles.contactName}>{item.nome}</Text>
                  {item.favorito && <Text style={styles.mainBadge}>{t("contatos.mainBadge")}</Text>}
                </View>
                <Text style={styles.contactMeta}>{item.relacao || t("contatos.mainContact")} · {item.telefone}</Text>
              </Pressable>

              <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={() => ligarPara(item.telefone)} accessibilityLabel={`Ligar para ${item.nome}`}>
                  <Text>📞</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => confirmarRemocao(item)} accessibilityLabel={`Excluir ${item.nome}`}>
                  <Text>🗑️</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* MODAL — ADICIONAR/EDITAR */}
      <Modal visible={modalVisivel} animationType="slide" transparent onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editandoId ? t("contatos.editTitle") : t("contatos.addTitle")}</Text>

            <TextInput style={styles.input} placeholder={t("contatos.namePlaceholder")} placeholderTextColor={colors.textSecondary} value={nome} onChangeText={setNome} />
            <TextInput style={styles.input} placeholder={t("contatos.phonePlaceholder")} placeholderTextColor={colors.textSecondary} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder={t("contatos.relationPlaceholder")} placeholderTextColor={colors.textSecondary} value={relacao} onChangeText={setRelacao} />

            <Pressable style={styles.checkboxRow} onPress={() => setPrincipal((atual) => !atual)}>
              <View style={[styles.checkbox, principal && styles.checkboxChecked]}>
                {principal && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{t("contatos.mainContact")}</Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Button label={t("contatos.cancel")} variant="secondary" onPress={() => setModalVisivel(false)} style={{ flex: 1 }} />
              <Button label={t("contatos.save")} onPress={salvar} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
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
  title: { color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
  subtitle: { marginTop: 2, color: colors.textSecondary, fontSize: 11 },
  addButton: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  addButtonText: { color: colors.white, fontSize: 22, fontWeight: fontWeights.bold, marginTop: -2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  card: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  avatar: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: `${colors.primary}26`,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: colors.primaryLight, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactName: { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  mainBadge: {
    fontSize: 9, fontWeight: fontWeights.bold, color: colors.primary,
    backgroundColor: `${colors.primary}22`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
  },
  contactMeta: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  actions: { flexDirection: "row", gap: 6 },
  actionButton: {
    width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceLight,
    alignItems: "center", justifyContent: "center",
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: 6 },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyTitle: { color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: "center", maxWidth: 260 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, gap: spacing.md, ...(shadows.floating as object),
  },
  modalTitle: { color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold, marginBottom: 4 },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, color: colors.text, backgroundColor: colors.surfaceLight, fontSize: 14,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: colors.white, fontSize: 12, fontWeight: fontWeights.bold },
  checkboxLabel: { color: colors.textSecondary, fontSize: fontSizes.xs },
  modalActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
});
