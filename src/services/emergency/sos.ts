/**
 * Mary App — disparo de SOS (lógica compartilhada)
 *
 * Extraído de EmergencyScreen.tsx para que a Home possa
 * iniciar o MESMO fluxo (sem reimplementar): obter
 * localização atual e registrar a emergência no histórico.
 * A confirmação do usuário (Alert) e a atualização de
 * estado de cada tela continuam em cada tela — só a parte
 * "o que acontece quando o SOS é confirmado" mora aqui.
 */

import { obterLocalizacaoAtual, LocalizacaoSalva } from "../location/location";
import { registrarEmergencia } from "../storage/emergencyHistory";

export type ResultadoSOS = {
  localizacao: LocalizacaoSalva | null;
};

export async function dispararSOS(): Promise<ResultadoSOS> {
  const resultado = await obterLocalizacaoAtual();

  await registrarEmergencia({
    status: "Modo SOS ativado",
    latitude: resultado.sucesso ? resultado.dados.latitude : undefined,
    longitude: resultado.sucesso ? resultado.dados.longitude : undefined,
  });

  return { localizacao: resultado.sucesso ? resultado.dados : null };
}
