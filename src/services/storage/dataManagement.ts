/**
 * Mary App — apagar dados locais deste dispositivo
 *
 * IMPORTANTE: isto NÃO apaga a conta nem faz logout —
 * só limpa o que fica salvo neste aparelho (contatos,
 * histórico de emergências, favoritos do mapa e foto de
 * perfil local). Usado pela tela de Privacidade.
 */

import { remover, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

const CHAVES_APAGAVEIS = [
  STORAGE_KEYS.CONTATOS,
  STORAGE_KEYS.EMERGENCIAS,
  STORAGE_KEYS.LOCALIZACAO,
  STORAGE_KEYS.FAVORITOS,
  STORAGE_KEYS.FOTO_PERFIL,
  STORAGE_KEYS.GRAVACOES,
];

export async function apagarDadosLocais(): Promise<void> {
  for (const chaveBase of CHAVES_APAGAVEIS) {
    const chave = await chaveUsuario(chaveBase);
    await remover(chave);
  }

  // Apaga os arquivos de áudio de verdade, não só a lista —
  // senão eles ficam órfãos ocupando espaço no aparelho.
  const { obterGravacoes } = await import("./emergencyRecordings");
  const { excluirArquivoDaGravacao } = await import("../audio/emergencyRecorder");
  const gravacoes = await obterGravacoes();
  await Promise.all(gravacoes.map((g) => excluirArquivoDaGravacao(g.uri)));
}
