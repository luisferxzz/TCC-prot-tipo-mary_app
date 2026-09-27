/**
 * Mary App — foto de perfil (React Native)
 *
 * Diferente da versão Web (que guardava a imagem como
 * base64 gigante no localStorage), aqui copiamos o arquivo
 * de verdade para a pasta de documentos do app
 * (expo-file-system) e guardamos só a URI no AsyncStorage —
 * é o padrão correto para mobile, e evita estourar o limite
 * do AsyncStorage.
 */

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { obter, salvar, remover } from "./asyncStorage";
import { chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

const PASTA_FOTOS = `${FileSystem.documentDirectory}mary-app-fotos/`;

async function garantirPasta() {
  const info = await FileSystem.getInfoAsync(PASTA_FOTOS);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PASTA_FOTOS, { intermediates: true });
  }
}

export async function obterFotoPerfil(): Promise<string | null> {
  const chave = await chaveUsuario(STORAGE_KEYS.FOTO_PERFIL);
  return obter<string | null>(chave, null);
}

async function salvarUriComoFotoPerfil(uriOriginal: string): Promise<string> {
  await garantirPasta();

  const destino = `${PASTA_FOTOS}perfil_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uriOriginal, to: destino });

  const chave = await chaveUsuario(STORAGE_KEYS.FOTO_PERFIL);
  await salvar(chave, destino);

  return destino;
}

export async function removerFotoPerfil(): Promise<boolean> {
  const chave = await chaveUsuario(STORAGE_KEYS.FOTO_PERFIL);
  return remover(chave);
}

export type ResultadoEscolhaFoto =
  | { sucesso: true; uri: string }
  | { sucesso: false; motivo: "permissao_negada" | "cancelado" | "erro" };

/**
 * Abre a câmera do dispositivo. Pede permissão de forma
 * apropriada e explica o motivo, como pedido.
 */
export async function tirarFoto(): Promise<ResultadoEscolhaFoto> {
  try {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      return { sucesso: false, motivo: "permissao_negada" };
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled || !resultado.assets?.[0]) {
      return { sucesso: false, motivo: "cancelado" };
    }

    const uriSalva = await salvarUriComoFotoPerfil(resultado.assets[0].uri);
    return { sucesso: true, uri: uriSalva };
  } catch (erro) {
    console.error("[MaryApp] Erro ao tirar foto:", erro);
    return { sucesso: false, motivo: "erro" };
  }
}

/**
 * Abre a galeria/seletor de imagens do dispositivo.
 */
export async function escolherFotoDaGaleria(): Promise<ResultadoEscolhaFoto> {
  try {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      return { sucesso: false, motivo: "permissao_negada" };
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled || !resultado.assets?.[0]) {
      return { sucesso: false, motivo: "cancelado" };
    }

    const uriSalva = await salvarUriComoFotoPerfil(resultado.assets[0].uri);
    return { sucesso: true, uri: uriSalva };
  } catch (erro) {
    console.error("[MaryApp] Erro ao escolher foto da galeria:", erro);
    return { sucesso: false, motivo: "erro" };
  }
}
