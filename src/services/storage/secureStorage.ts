/**
 * Mary App — armazenamento SEGURO (expo-secure-store)
 *
 * Usa o Keychain (iOS) / Keystore (Android) do sistema —
 * criptografado pelo próprio dispositivo.
 *
 * Único uso hoje: token de sessão do Supabase Auth. O
 * projeto Web (protótipo acadêmico) guardava a sessão no
 * localStorage do navegador; em um app real de celular,
 * o token de sessão é exatamente o tipo de dado que NÃO
 * deveria ficar em armazenamento comum — por isso a
 * separação nesta migração.
 *
 * NUNCA armazene aqui: senha em texto puro (o Supabase Auth
 * já nunca expõe a senha em texto puro — só o token de
 * sessão passa por este app).
 */

import * as SecureStore from "expo-secure-store";

export async function obterSeguro(chave: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(chave);
  } catch (erro) {
    console.error(`[MaryApp] Erro ao ler item seguro "${chave}":`, erro);
    return null;
  }
}

export async function salvarSeguro(
  chave: string,
  valor: string
): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(chave, valor);
    return true;
  } catch (erro) {
    console.error(`[MaryApp] Erro ao salvar item seguro "${chave}":`, erro);
    return false;
  }
}

export async function removerSeguro(chave: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(chave);
    return true;
  } catch (erro) {
    console.error(`[MaryApp] Erro ao remover item seguro "${chave}":`, erro);
    return false;
  }
}
