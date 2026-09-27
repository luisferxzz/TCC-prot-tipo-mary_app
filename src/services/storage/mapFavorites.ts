/**
 * Mary App — favoritos do mapa (React Native)
 * Espelha obterFavoritos()/adicionarFavorito()/removerFavorito()
 * de app.js (Web). Salvos só no dispositivo, escopados por
 * usuário — igual a tudo mais no app.
 */

import { obter, salvar, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

export type FavoritoMapa = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  criadoEm: string;
};

export type NovoFavoritoMapa = {
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
};

export async function obterFavoritosMapa(): Promise<FavoritoMapa[]> {
  const chave = await chaveUsuario(STORAGE_KEYS.FAVORITOS);
  return obter<FavoritoMapa[]>(chave, []);
}

export async function adicionarFavoritoMapa(dados: NovoFavoritoMapa): Promise<boolean> {
  if (typeof dados.latitude !== "number" || typeof dados.longitude !== "number") {
    return false;
  }

  const favoritos = await obterFavoritosMapa();

  favoritos.push({
    id: Date.now(),
    nome: dados.nome?.trim() || "Local salvo",
    endereco: dados.endereco?.trim() || "",
    latitude: dados.latitude,
    longitude: dados.longitude,
    criadoEm: new Date().toISOString(),
  });

  const chave = await chaveUsuario(STORAGE_KEYS.FAVORITOS);
  return salvar(chave, favoritos);
}

export async function removerFavoritoMapa(id: number): Promise<boolean> {
  const favoritos = await obterFavoritosMapa();
  const novos = favoritos.filter((f) => f.id !== id);

  if (novos.length === favoritos.length) return false;

  const chave = await chaveUsuario(STORAGE_KEYS.FAVORITOS);
  return salvar(chave, novos);
}
