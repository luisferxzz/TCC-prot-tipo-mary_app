/**
 * Mary App — contatos de emergência (React Native)
 * Espelha obterContatos()/adicionarContato()/atualizarContato()/
 * removerContato() de app.js (Web) — mesma regra de negócio,
 * mesmos campos, mesmo escopo por usuário.
 */

import { obter, salvar, chaveUsuario } from "./asyncStorage";
import { STORAGE_KEYS } from "./keys";

export type Contato = {
  id: number;
  nome: string;
  telefone: string;
  relacao: string;
  favorito: boolean;
  // Se este contato entra na lista de contato rápido
  // sugerida depois de um SOS. Ausente = true (contatos
  // criados antes dessa opção existir continuam valendo).
  notificarSos?: boolean;
  criadoEm: string;
};

export type NovoContato = {
  nome: string;
  telefone: string;
  relacao: string;
  favorito?: boolean;
  notificarSos?: boolean;
};

function gerarId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/** true por padrão — contato só fica de fora se o usuário desativar explicitamente. */
export function deveNotificar(contato: Contato): boolean {
  return contato.notificarSos !== false;
}

export async function obterContatos(): Promise<Contato[]> {
  const chave = await chaveUsuario(STORAGE_KEYS.CONTATOS);
  return obter<Contato[]>(chave, []);
}

async function salvarContatos(contatos: Contato[]): Promise<boolean> {
  const chave = await chaveUsuario(STORAGE_KEYS.CONTATOS);
  return salvar(chave, contatos);
}

export async function adicionarContato(dados: NovoContato): Promise<boolean> {
  if (!dados.nome?.trim() || !dados.telefone?.trim()) {
    return false;
  }

  const contatos = await obterContatos();

  contatos.push({
    id: gerarId(),
    nome: dados.nome.trim(),
    telefone: dados.telefone.trim(),
    relacao: dados.relacao?.trim() || "",
    favorito: dados.favorito ?? false,
    notificarSos: dados.notificarSos ?? true,
    criadoEm: new Date().toISOString(),
  });

  return salvarContatos(contatos);
}

export async function atualizarContato(
  id: number,
  dados: Partial<NovoContato>
): Promise<boolean> {
  const contatos = await obterContatos();
  const indice = contatos.findIndex((c) => c.id === id);

  if (indice === -1) return false;

  contatos[indice] = { ...contatos[indice], ...dados };
  return salvarContatos(contatos);
}

export async function removerContato(id: number): Promise<boolean> {
  const contatos = await obterContatos();
  const novos = contatos.filter((c) => c.id !== id);

  if (novos.length === contatos.length) return false;

  return salvarContatos(novos);
}
