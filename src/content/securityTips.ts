/**
 * Mary App — dicas de segurança (conteúdo local)
 *
 * Base local, conforme pedido: nada de "notícias" nem dados
 * falsos — só orientações curtas de segurança pessoal,
 * digital, trânsito e localização. Cada dica referencia
 * chaves de i18n (não texto solto), então funciona nos 3
 * idiomas do app automaticamente.
 *
 * Pensado para crescer sem mexer na tela: pra adicionar uma
 * dica nova, basta um item aqui + as 3 traduções — a Home
 * não precisa mudar.
 */

export type DicaSeguranca = {
  id: string;
  icon: string;
  categoryKey: string;
  textKey: string;
};

export const DICAS_SEGURANCA: DicaSeguranca[] = [
  {
    id: "contatos-atualizados",
    icon: "🛡️",
    categoryKey: "home.tipCategoryGeneral",
    textKey: "home.tipContactsUpdated",
  },
  {
    id: "links-desconhecidos",
    icon: "📱",
    categoryKey: "home.tipCategoryDigital",
    textKey: "home.tipUnknownLinks",
  },
  {
    id: "transito-seguro",
    icon: "🚗",
    categoryKey: "home.tipCategoryTraffic",
    textKey: "home.tipSafeDriving",
  },
  {
    id: "compartilhar-localizacao",
    icon: "📍",
    categoryKey: "home.tipCategoryLocation",
    textKey: "home.tipShareLocation",
  },
];

/**
 * Dica do dia — determinística pelo dia do ano, então todo
 * mundo com o app aberto no mesmo dia vê a mesma dica, e ela
 * muda sozinha à meia-noite sem precisar de nenhum backend.
 */
export function obterDicaDoDia(): DicaSeguranca {
  const agora = new Date();
  const inicioDoAno = new Date(agora.getFullYear(), 0, 0);
  const diaDoAno = Math.floor((agora.getTime() - inicioDoAno.getTime()) / 86400000);
  return DICAS_SEGURANCA[diaDoAno % DICAS_SEGURANCA.length];
}

/**
 * Demais dicas pra seção "Atualizações de segurança"
 * (a dica do dia fica de fora pra não repetir o mesmo
 * conteúdo duas vezes na tela).
 */
export function obterOutrasDicas(limite = 2): DicaSeguranca[] {
  const dicaDoDia = obterDicaDoDia();
  return DICAS_SEGURANCA.filter((dica) => dica.id !== dicaDoDia.id).slice(0, limite);
}
