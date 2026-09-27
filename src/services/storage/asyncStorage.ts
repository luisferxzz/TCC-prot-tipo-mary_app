/**
 * Mary App — armazenamento comum (AsyncStorage)
 *
 * Espelha as funções obter()/salvar()/remover() e
 * chaveUsuario() de app.js (Web) — inclusive o comentário
 * original sobre por que a chave precisa ser vinculada ao
 * usuário logado (evitar que contas diferentes no mesmo
 * dispositivo compartilhem dados).
 *
 * IMPORTANTE — o que vai aqui:
 * contatos, histórico de emergências, configurações,
 * notificações internas, favoritos do mapa, URI da foto de
 * perfil, onboarding e idioma.
 *
 * O que NÃO vai aqui: token de sessão do Supabase — isso
 * fica em secureStorage.ts (services/storage/secureStorage.ts),
 * por ser um dado sensível.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, CHAVES_DE_DISPOSITIVO } from "./keys";

export async function obter<T>(chave: string, valorPadrao: T): Promise<T> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    if (bruto === null) return valorPadrao;
    return JSON.parse(bruto) as T;
  } catch (erro) {
    console.error(`[MaryApp] Erro ao ler "${chave}":`, erro);
    return valorPadrao;
  }
}

export async function salvar<T>(chave: string, dados: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(dados));
    return true;
  } catch (erro) {
    console.error(`[MaryApp] Erro ao salvar "${chave}":`, erro);
    return false;
  }
}

export async function remover(chave: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(chave);
    return true;
  } catch (erro) {
    console.error(`[MaryApp] Erro ao remover "${chave}":`, erro);
    return false;
  }
}

/**
 * Gera a chave por usuário — mesma lógica de app.js Web.
 * Chaves de dispositivo (onboarding, idioma) nunca são
 * escopadas, porque precisam existir antes do login.
 */
export async function chaveUsuario(chaveBase: string): Promise<string> {
  if (CHAVES_DE_DISPOSITIVO.includes(chaveBase)) {
    return chaveBase;
  }

  try {
    const usuario = await obter<{ id?: string } | null>(
      STORAGE_KEYS.USUARIO,
      null
    );

    if (usuario?.id) {
      return `${chaveBase}_${usuario.id}`;
    }
  } catch (erro) {
    console.error("[MaryApp] Erro ao montar chave por usuário:", erro);
  }

  return chaveBase;
}
