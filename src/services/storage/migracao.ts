/**
 * Mary App — migração de dados para o usuário logado
 * Espelha migrarDadosParaUsuario() de app.js (Web).
 *
 * Num app React Native recém-instalado isso raramente
 * encontrará dados para migrar (o AsyncStorage começa
 * vazio) — mas mantemos a mesma lógica defensiva do
 * original, útil caso o app já tenha sido usado antes de
 * uma conta existir vinculada, ou em migrações futuras.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

const CHAVES_DE_CONTA = [
  STORAGE_KEYS.CONTATOS,
  STORAGE_KEYS.EMERGENCIAS,
  STORAGE_KEYS.CONFIGURACOES,
  STORAGE_KEYS.NOTIFICACOES,
  STORAGE_KEYS.FOTO_PERFIL,
  STORAGE_KEYS.FAVORITOS,
];

export async function migrarDadosParaUsuario(usuarioId: string): Promise<void> {
  if (!usuarioId) return;

  const marcador = `mary_migrado_${usuarioId}`;

  const jaMigrado = await AsyncStorage.getItem(marcador);
  if (jaMigrado) return;

  for (const chaveBase of CHAVES_DE_CONTA) {
    const chaveNova = `${chaveBase}_${usuarioId}`;

    const [dadoAntigo, dadoNovo] = await Promise.all([
      AsyncStorage.getItem(chaveBase),
      AsyncStorage.getItem(chaveNova),
    ]);

    if (dadoAntigo !== null && dadoNovo === null) {
      await AsyncStorage.setItem(chaveNova, dadoAntigo);
    }
  }

  await AsyncStorage.setItem(marcador, "true");
}
