/**
 * Mary App — locais próximos (hospital / delegacia)
 *
 * Usa a Overpass API do OpenStreetMap — a mesma família de
 * serviços já usada no Mapa (Nominatim pra busca, OSRM pras
 * rotas): grátis, sem chave de API, consistente com o resto
 * do app. Roda direto do React Native (fetch simples), sem
 * precisar da WebView do mapa.
 *
 * Limite conhecido: a instância pública da Overpass às vezes
 * fica lenta ou fora do ar em horários de pico. Por isso o
 * timeout curto e a mensagem de erro amigável — se isso virar
 * problema real em produção, a troca por uma API paga (Google
 * Places, por ex.) fica isolada neste arquivo, sem tocar na
 * tela.
 */

export type TipoLocal = "hospital" | "policia";

export type LocalProximo = {
  id: string;
  nome: string;
  tipo: TipoLocal;
  latitude: number;
  longitude: number;
  distanciaMetros: number;
  endereco?: string;
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RAIOS_TENTATIVA_METROS = [3000, 8000, 15000];
const TIMEOUT_MS = 12000;

const TAG_POR_TIPO: Record<TipoLocal, string> = {
  hospital: 'node["amenity"="hospital"]',
  policia: 'node["amenity"="police"]',
};

function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function montarEndereco(tags: Record<string, string> = {}): string | undefined {
  const partes = [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"]].filter(Boolean);
  return partes.length > 0 ? partes.join(", ") : undefined;
}

async function buscarRaio(
  tipo: TipoLocal,
  latitude: number,
  longitude: number,
  raio: number
): Promise<LocalProximo[]> {
  const query = `[out:json][timeout:10];${TAG_POR_TIPO[tipo]}(around:${raio},${latitude},${longitude});out body 20;`;

  const controle = new AbortController();
  const timeoutId = setTimeout(() => controle.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
      signal: controle.signal,
    });

    if (!resposta.ok) return [];

    const dados = await resposta.json();
    const elementos: any[] = dados.elements || [];

    return elementos
      .filter((el) => el.lat && el.lon)
      .map((el) => ({
        id: `${tipo}-${el.id}`,
        nome: el.tags?.name || (tipo === "hospital" ? "Hospital sem nome cadastrado" : "Delegacia sem nome cadastrada"),
        tipo,
        latitude: el.lat,
        longitude: el.lon,
        distanciaMetros: distanciaMetros(latitude, longitude, el.lat, el.lon),
        endereco: montarEndereco(el.tags),
      }))
      .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Busca o local mais próximo, expandindo o raio de busca até
 * achar algo (ou desistir em 15km). Retorna null se não achar
 * nada ou se a Overpass falhar — nunca inventa um resultado.
 */
export async function buscarMaisProximo(
  tipo: TipoLocal,
  latitude: number,
  longitude: number
): Promise<LocalProximo | null> {
  for (const raio of RAIOS_TENTATIVA_METROS) {
    const resultados = await buscarRaio(tipo, latitude, longitude, raio);
    if (resultados.length > 0) return resultados[0];
  }
  return null;
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

export function linkParaRota(destino: LocalProximo): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destino.latitude},${destino.longitude}`;
}
