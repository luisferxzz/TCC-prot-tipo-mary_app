/**
 * Mary App — status de segurança para o dashboard da Home
 *
 * Agrega os mesmos dados que a tela de Emergência já lê
 * (última localização salva, contatos, histórico), só que
 * pensado para a Home: recarrega toda vez que a tela ganha
 * foco, igual ao padrão já usado em EmergencyScreen e
 * ProfileScreen.
 */

import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { obterUltimaLocalizacaoSalva, LocalizacaoSalva } from "../services/location/location";
import { obterContatos, Contato } from "../services/storage/contacts";
import { obterEmergencias, RegistroEmergencia } from "../services/storage/emergencyHistory";
import { notificacoesAtivas } from "../services/storage/preferences";

export type StatusSeguranca = {
  localizacao: LocalizacaoSalva | null;
  contatos: Contato[];
  historico: RegistroEmergencia[];
  notificacoesAtivas: boolean;
  carregando: boolean;
};

export function useSecurityStatus(): StatusSeguranca {
  const [localizacao, setLocalizacao] = useState<LocalizacaoSalva | null>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [historico, setHistorico] = useState<RegistroEmergencia[]>([]);
  const [notificacoes, setNotificacoes] = useState(true);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      setCarregando(true);

      (async () => {
        const [loc, listaContatos, listaHistorico, notifAtivas] = await Promise.all([
          obterUltimaLocalizacaoSalva(),
          obterContatos(),
          obterEmergencias(),
          notificacoesAtivas(),
        ]);

        if (!cancelado) {
          setLocalizacao(loc);
          setContatos(listaContatos);
          setHistorico(listaHistorico);
          setNotificacoes(notifAtivas);
          setCarregando(false);
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  return { localizacao, contatos, historico, notificacoesAtivas: notificacoes, carregando };
}
