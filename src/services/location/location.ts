/**
 * Mary App — localização (React Native)
 * Espelha a lógica de obterLocalizacaoAtual()/salvarLocalizacao()
 * da versão Web, usando expo-location em vez da Geolocation
 * API do navegador. Pede permissão de forma apropriada.
 */

import * as Location from "expo-location";
import { obter, salvar, chaveUsuario } from "../storage/asyncStorage";
import { STORAGE_KEYS } from "../storage/keys";

export type LocalizacaoSalva = {
  latitude: number;
  longitude: number;
  precisao: number | null;
  atualizadoEm: string;
};

export type ResultadoLocalizacao =
  | { sucesso: true; dados: LocalizacaoSalva }
  | {
      sucesso: false;
      motivo: "permissao_negada" | "servico_desativado" | "erro";
      mensagem: string;
    };

export async function obterUltimaLocalizacaoSalva(): Promise<LocalizacaoSalva | null> {
  const chave = await chaveUsuario(STORAGE_KEYS.LOCALIZACAO);
  return obter<LocalizacaoSalva | null>(chave, null);
}

/**
 * Pede permissão (se necessário) e obtém a localização
 * atual do dispositivo. Nunca lança exceção sem tratar —
 * sempre devolve um resultado explicando o que aconteceu,
 * pra tela poder mostrar uma mensagem amigável.
 */
export async function obterLocalizacaoAtual(): Promise<ResultadoLocalizacao> {
  try {
    const servicoAtivo = await Location.hasServicesEnabledAsync();

    if (!servicoAtivo) {
      return {
        sucesso: false,
        motivo: "servico_desativado",
        mensagem: "O GPS do dispositivo está desativado. Ative-o nas configurações do sistema.",
      };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return {
        sucesso: false,
        motivo: "permissao_negada",
        mensagem:
          "Precisamos da sua localização para encontrar os serviços de emergência mais próximos e compartilhar sua posição com seus contatos.",
      };
    }

    const posicao = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const dados: LocalizacaoSalva = {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
      precisao: posicao.coords.accuracy,
      atualizadoEm: new Date().toISOString(),
    };

    const chave = await chaveUsuario(STORAGE_KEYS.LOCALIZACAO);
    await salvar(chave, dados);

    return { sucesso: true, dados };
  } catch (erro) {
    console.error("[MaryApp] Erro ao obter localização:", erro);
    return {
      sucesso: false,
      motivo: "erro",
      mensagem: "Não foi possível obter sua localização agora. Tente novamente.",
    };
  }
}

export function criarLinkDeLocalizacao(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
