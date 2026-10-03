/**
 * Mary App — utilitários de arquivo das gravações
 * A gravação em si (start/stop) usa o hook useAudioRecorder
 * do expo-audio, então mora em src/hooks/useEmergencyRecorder.ts
 * (hooks só funcionam dentro de componentes React). Aqui só
 * fica o que não precisa ser hook: apagar o arquivo e formatar
 * a duração pra exibir na lista.
 */

import * as FileSystem from "expo-file-system";

export async function excluirArquivoDaGravacao(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Se o arquivo já não existir (ou o caminho mudou entre
    // versões do app), não é motivo pra travar a exclusão do
    // registro na lista.
  }
}

export function formatarDuracao(ms: number): string {
  const totalSegundos = Math.round(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}
