/**
 * Mary App — preferências de dispositivo
 * Espelha onboardingConcluido()/concluirOnboarding()/
 * obterIdioma()/salvarIdioma() de app.js (Web).
 */

import { obter, salvar, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

export async function onboardingConcluido(): Promise<boolean> {
  return obter<boolean>(STORAGE_KEYS.ONBOARDING, false);
}

export async function concluirOnboarding(): Promise<boolean> {
  return salvar(STORAGE_KEYS.ONBOARDING, true);
}

export async function obterIdioma(): Promise<string | null> {
  return obter<string | null>(STORAGE_KEYS.IDIOMA, null);
}

export async function salvarIdioma(codigo: string): Promise<boolean> {
  return salvar(STORAGE_KEYS.IDIOMA, codigo);
}

/**
 * Preferência de notificações internas (dica do dia, avisos
 * de segurança dentro do app). O projeto ainda NÃO tem push
 * de verdade configurado (sem expo-notifications instalado)
 * — isso liga/desliga o que já existe hoje, sem fingir que
 * manda notificação pro sistema.
 */
export async function notificacoesAtivas(): Promise<boolean> {
  const chave = await chaveUsuario(STORAGE_KEYS.NOTIFICACOES);
  return obter<boolean>(chave, true);
}

export async function definirNotificacoesAtivas(ativo: boolean): Promise<boolean> {
  const chave = await chaveUsuario(STORAGE_KEYS.NOTIFICACOES);
  return salvar(chave, ativo);
}
