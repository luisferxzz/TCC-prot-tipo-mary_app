/**
 * Mary App — metadados das gravações de segurança
 * O arquivo de áudio em si fica no sistema de arquivos
 * (ver services/audio/emergencyRecorder.ts); aqui fica só a
 * lista: onde está cada arquivo, quando e por quanto tempo.
 */

import { obter, salvar, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

export type Gravacao = {
  id: number;
  uri: string;
  criadoEm: string;
  duracaoMs: number;
};

export async function obterGravacoes(): Promise<Gravacao[]> {
  const chave = await chaveUsuario(STORAGE_KEYS.GRAVACOES);
  const lista = await obter<Gravacao[]>(chave, []);
  // Mais recente primeiro.
  return [...lista].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
}

export async function adicionarGravacao(uri: string, duracaoMs: number): Promise<Gravacao> {
  const chave = await chaveUsuario(STORAGE_KEYS.GRAVACOES);
  const lista = await obter<Gravacao[]>(chave, []);

  const nova: Gravacao = { id: Date.now(), uri, duracaoMs, criadoEm: new Date().toISOString() };
  lista.push(nova);
  await salvar(chave, lista);

  return nova;
}

export async function removerGravacao(id: number): Promise<void> {
  const chave = await chaveUsuario(STORAGE_KEYS.GRAVACOES);
  const lista = await obter<Gravacao[]>(chave, []);
  await salvar(chave, lista.filter((g) => g.id !== id));
}
