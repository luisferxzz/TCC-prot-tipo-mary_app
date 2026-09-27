/**
 * Mary App — provedor de i18n (React Native)
 *
 * Mesma prioridade de idioma do projeto Web:
 * 1. Selecionado manualmente nesta sessão
 * 2. Salvo anteriormente
 * 3. Idioma do dispositivo (expo-localization)
 * 4. pt-BR (padrão do projeto)
 *
 * Diferença em relação ao Web: lá o motor escaneava o DOM
 * procurando [data-i18n]. Aqui não existe DOM — cada
 * componente usa o hook useTranslation() para ler o texto
 * diretamente, o que é o padrão idiomático em React.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Localization from "expo-localization";
import { ptBR } from "./locales/pt-BR";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { obterIdioma, salvarIdioma } from "../services/storage/preferences";

const DICIONARIOS = { "pt-BR": ptBR, en, es } as const;

export type CodigoIdioma = keyof typeof DICIONARIOS;

const IDIOMA_PADRAO: CodigoIdioma = "pt-BR";
const IDIOMAS_DISPONIVEIS = Object.keys(DICIONARIOS) as CodigoIdioma[];

// Preparado para expansão futura — nenhum idioma enviado
// hoje é RTL, mas o mecanismo já existe (mesma ideia do i18n.js Web).
const IDIOMAS_RTL: string[] = ["ar", "he", "fa", "ur"];

function normalizarCodigo(codigo: string | null | undefined): CodigoIdioma | null {
  if (!codigo) return null;

  const exato = IDIOMAS_DISPONIVEIS.find(
    (item) => item.toLowerCase() === codigo.toLowerCase()
  );
  if (exato) return exato;

  const prefixo = codigo.split("-")[0].toLowerCase();
  return (
    IDIOMAS_DISPONIVEIS.find(
      (item) => item.split("-")[0].toLowerCase() === prefixo
    ) || null
  );
}

function buscarValor(dicionario: any, caminho: string): unknown {
  return caminho
    .split(".")
    .reduce((atual, parte) => (atual && typeof atual === "object" ? atual[parte] : undefined), dicionario);
}

type I18nContextType = {
  idiomaAtual: CodigoIdioma;
  isRTL: boolean;
  t: (chave: string, parametros?: Record<string, string | number>) => string;
  definirIdioma: (codigo: CodigoIdioma) => Promise<void>;
  idiomasDisponiveis: { codigo: CodigoIdioma; name: string; flag: string }[];
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [idiomaAtual, setIdiomaAtual] = useState<CodigoIdioma>(IDIOMA_PADRAO);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    (async () => {
      const salvo = await obterIdioma();
      const salvoValido = normalizarCodigo(salvo);

      if (salvoValido) {
        setIdiomaAtual(salvoValido);
      } else {
        const doDispositivo = normalizarCodigo(
          Localization.getLocales()[0]?.languageTag
        );
        setIdiomaAtual(doDispositivo || IDIOMA_PADRAO);
      }

      setPronto(true);
    })();
  }, []);

  const t = useMemo(() => {
    return (chave: string, parametros?: Record<string, string | number>) => {
      const dadosAtual = DICIONARIOS[idiomaAtual];
      const dadosPadrao = DICIONARIOS[IDIOMA_PADRAO];

      let texto = buscarValor(dadosAtual, chave);
      if (typeof texto !== "string") {
        texto = buscarValor(dadosPadrao, chave);
      }
      if (typeof texto !== "string") {
        return chave;
      }

      if (parametros) {
        Object.entries(parametros).forEach(([nome, valor]) => {
          texto = (texto as string).replace(
            new RegExp(`\\{${nome}\\}`, "g"),
            String(valor)
          );
        });
      }

      return texto as string;
    };
  }, [idiomaAtual]);

  async function definirIdioma(codigo: CodigoIdioma) {
    setIdiomaAtual(codigo);
    await salvarIdioma(codigo);
  }

  const idiomasDisponiveis = IDIOMAS_DISPONIVEIS.map((codigo) => ({
    codigo,
    name: DICIONARIOS[codigo].meta.name,
    flag: DICIONARIOS[codigo].meta.flag,
  }));

  const isRTL = IDIOMAS_RTL.includes(idiomaAtual.split("-")[0]);

  if (!pronto) return null; // aguarda carregar a preferência salva

  return (
    <I18nContext.Provider
      value={{ idiomaAtual, isRTL, t, definirIdioma, idiomasDisponiveis }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const contexto = useContext(I18nContext);
  if (!contexto) {
    throw new Error("useTranslation precisa estar dentro de <I18nProvider>");
  }
  return contexto;
}
