/**
 * Mary App — histórico de emergências (React Native)
 * Espelha obterEmergencias()/registrarEmergencia() de
 * app.js (Web).
 */

import { obter, salvar, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

export type RegistroEmergencia = {
  id: number;
  status: string;
  observacao?: string;
  latitude?: number;
  longitude?: number;
  data: string;
};

export type NovoRegistroEmergencia = {
  status: string;
  observacao?: string;
  latitude?: number;
  longitude?: number;
};

export async function obterEmergencias(): Promise<RegistroEmergencia[]> {
  const chave = await chaveUsuario(STORAGE_KEYS.EMERGENCIAS);
  return obter<RegistroEmergencia[]>(chave, []);
}

export async function registrarEmergencia(
  dados: NovoRegistroEmergencia
): Promise<boolean> {
  const emergencias = await obterEmergencias();

  emergencias.push({
    id: Date.now(),
    status: dados.status,
    observacao: dados.observacao,
    latitude: dados.latitude,
    longitude: dados.longitude,
    data: new Date().toISOString(),
  });

  const chave = await chaveUsuario(STORAGE_KEYS.EMERGENCIAS);
  return salvar(chave, emergencias);
}

export async function limparHistoricoEmergencias(): Promise<boolean> {
  const chave = await chaveUsuario(STORAGE_KEYS.EMERGENCIAS);
  return salvar(chave, []);
}
