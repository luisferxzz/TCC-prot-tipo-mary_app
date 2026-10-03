/**
 * Mary App — gravação de áudio de segurança
 *
 * Usa expo-audio (não expo-av — esse está depreciado desde a
 * SDK 54). Grava direto na pasta de documentos do app
 * (directory: "document"), não no cache, porque o sistema
 * pode apagar o cache sozinho quando o aparelho fica sem
 * espaço — e uma gravação de segurança não pode sumir assim.
 *
 * A gravação é sempre uma ação explícita do usuário (um toque
 * pra começar, um toque pra parar) — não dispara sozinha
 * junto com o SOS. Ver o comentário no topo de sos.ts sobre
 * por que essa decisão foi tomada assim.
 */

import { useCallback, useState } from "react";
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { adicionarGravacao, Gravacao } from "../services/storage/emergencyRecordings";

export type StatusGravacao = "ocioso" | "permissao_negada" | "gravando" | "salvando";

export function useEmergencyRecorder() {
  const audioRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, directory: "document" });
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const [status, setStatus] = useState<StatusGravacao>("ocioso");

  const iniciar = useCallback(async () => {
    const permissao = await AudioModule.requestRecordingPermissionsAsync();
    if (!permissao.granted) {
      setStatus("permissao_negada");
      return;
    }

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setStatus("gravando");
  }, [audioRecorder]);

  const parar = useCallback(async (): Promise<Gravacao | null> => {
    setStatus("salvando");
    const duracaoMs = recorderState.durationMillis ?? 0;

    await audioRecorder.stop();
    const uri = audioRecorder.uri;

    setStatus("ocioso");
    if (!uri) return null;

    return adicionarGravacao(uri, duracaoMs);
  }, [audioRecorder, recorderState.durationMillis]);

  return {
    status,
    gravando: recorderState.isRecording,
    duracaoMs: recorderState.durationMillis ?? 0,
    iniciar,
    parar,
  };
}
