/**
 * Mary App — autenticação (React Native)
 * Espelha a lógica de estaLogado()/sincronizarUsuarioLocal()/
 * fazerLogout() de app.js (Web). O conceito é o mesmo — só a
 * forma de navegar (React Navigation, não window.location)
 * e de persistir (SecureStore, não localStorage) muda.
 */

import { supabase } from "./client";
import { obter, salvar, remover, chaveUsuario } from "../storage/asyncStorage";
import { STORAGE_KEYS } from "../storage/keys";
import { migrarDadosParaUsuario } from "../storage/migracao";

export type UsuarioLocal = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

export async function estaLogado(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("[MaryApp] Erro ao verificar sessão:", error);
      return false;
    }

    return Boolean(data?.session);
  } catch (erro) {
    console.error("[MaryApp] Erro ao verificar login:", erro);
    return false;
  }
}

/**
 * Busca o perfil na tabela "usuarios" e sincroniza
 * localmente — mesma ideia do app.js Web. Não bloqueia o
 * app caso a tabela de perfil esteja temporariamente
 * indisponível (mesmo comportamento defensivo do original).
 */
export async function sincronizarUsuarioLocal(): Promise<UsuarioLocal | null> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const usuarioAuth = sessao?.session?.user;

    if (!usuarioAuth) return null;

    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("nome, telefone")
      .eq("id", usuarioAuth.id)
      .maybeSingle();

    if (error) {
      console.error("[MaryApp] Erro ao buscar perfil:", error);
    }

    const dados: UsuarioLocal = {
      id: usuarioAuth.id,
      nome: perfil?.nome || usuarioAuth.email?.split("@")[0] || "Usuário",
      email: usuarioAuth.email || "",
      telefone: perfil?.telefone || null,
    };

    await salvar(STORAGE_KEYS.USUARIO, dados);
    await migrarDadosParaUsuario(dados.id);

    return dados;
  } catch (erro) {
    console.error("[MaryApp] Erro ao sincronizar usuário:", erro);
    return null;
  }
}

export async function obterUsuario(): Promise<UsuarioLocal | null> {
  return obter<UsuarioLocal | null>(STORAGE_KEYS.USUARIO, null);
}

/**
 * Atualiza nome/telefone na tabela "usuarios" e sincroniza
 * o cache local — mesma tabela e campos que
 * sincronizarUsuarioLocal() já lê no login.
 */
export async function atualizarPerfil(
  dados: Partial<Pick<UsuarioLocal, "nome" | "telefone">>
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const usuarioAtual = await obterUsuario();
    if (!usuarioAtual) {
      return { sucesso: false, erro: "Sessão não encontrada." };
    }

    const { error } = await supabase
      .from("usuarios")
      .update({
        ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
        ...(dados.telefone !== undefined ? { telefone: dados.telefone } : {}),
      })
      .eq("id", usuarioAtual.id);

    if (error) {
      console.error("[MaryApp] Erro ao atualizar perfil:", error);
      return { sucesso: false, erro: error.message };
    }

    const atualizado: UsuarioLocal = { ...usuarioAtual, ...dados };
    await salvar(STORAGE_KEYS.USUARIO, atualizado);

    return { sucesso: true };
  } catch (erro) {
    console.error("[MaryApp] Erro ao atualizar perfil:", erro);
    return { sucesso: false, erro: "Não foi possível salvar agora." };
  }
}

/**
 * Troca a senha da conta logada. O Supabase Auth só exige
 * uma sessão válida (não pede a senha atual) — mesma regra
 * usada em qualquer app com supabase-js.
 */
export async function alterarSenha(
  novaSenha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      console.error("[MaryApp] Erro ao alterar senha:", error);
      return { sucesso: false, erro: error.message };
    }

    return { sucesso: true };
  } catch (erro) {
    console.error("[MaryApp] Erro ao alterar senha:", erro);
    return { sucesso: false, erro: "Não foi possível alterar a senha agora." };
  }
}

export async function fazerLogin(email: string, senha: string) {
  return supabase.auth.signInWithPassword({ email, password: senha });
}

export async function recuperarSenha(email: string) {
  // No app mobile não existe uma URL de redirecionamento de
  // página como na Web — o Supabase envia um e-mail com um
  // link que abre o app via deep link. Configurar o deep
  // link (scheme "maryapp://redefinir-senha") é um passo de
  // configuração no painel do Supabase, fora do código.
  return supabase.auth.resetPasswordForEmail(email);
}

export async function fazerLogout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (erro) {
    console.error("[MaryApp] Erro ao sair:", erro);
  } finally {
    await remover(STORAGE_KEYS.USUARIO);
  }
}

export { chaveUsuario };
