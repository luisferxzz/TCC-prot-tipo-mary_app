/**
 * Mary App — chaves de armazenamento
 * Espelha exatamente o objeto CHAVES de app.js (Web).
 */

export const STORAGE_KEYS = {
  USUARIO: "mary_usuario",
  LOCALIZACAO: "mary_localizacao",
  CONTATOS: "mary_contatos",
  EMERGENCIAS: "mary_emergencias",
  CONFIGURACOES: "mary_configuracoes",
  NOTIFICACOES: "mary_notificacoes",
  FOTO_PERFIL: "mary_foto_perfil",
  FAVORITOS: "mary_favoritos",
  ONBOARDING: "mary_onboarding_concluido",
  IDIOMA: "mary_idioma",
  // Só existe no mobile (gravação de áudio não tem equivalente
  // no app.js Web) — por isso não está no comentário acima.
  GRAVACOES: "mary_gravacoes",
} as const;

// Chaves que NÃO são escopadas por usuário — precisam
// funcionar antes do login (mesmo critério do app.js Web).
export const CHAVES_DE_DISPOSITIVO: string[] = [
  STORAGE_KEYS.ONBOARDING,
  STORAGE_KEYS.IDIOMA,
];
