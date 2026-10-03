/**
 * Mary App — hook do hospital/delegacia mais próximos
 * Busca só quando a latitude/longitude muda (evita bater na
 * Overpass toda vez que a tela ganha foco de novo).
 */

import { useEffect, useRef, useState } from "react";
import { buscarMaisProximo, LocalProximo } from "../services/places/nearbyPlaces";

export type StatusBusca = "ocioso" | "buscando" | "encontrado" | "nao_encontrado" | "erro";

export type NearbyPlacesState = {
  hospital: LocalProximo | null;
  policia: LocalProximo | null;
  status: StatusBusca;
};

export function useNearbyPlaces(latitude: number | null, longitude: number | null): NearbyPlacesState {
  const [hospital, setHospital] = useState<LocalProximo | null>(null);
  const [policia, setPolicia] = useState<LocalProximo | null>(null);
  const [status, setStatus] = useState<StatusBusca>("ocioso");
  const ultimaBusca = useRef<string | null>(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const chave = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    if (ultimaBusca.current === chave) return;
    ultimaBusca.current = chave;

    let cancelado = false;
    setStatus("buscando");

    (async () => {
      try {
        const [h, p] = await Promise.all([
          buscarMaisProximo("hospital", latitude, longitude),
          buscarMaisProximo("policia", latitude, longitude),
        ]);

        if (cancelado) return;
        setHospital(h);
        setPolicia(p);
        setStatus(h || p ? "encontrado" : "nao_encontrado");
      } catch {
        if (!cancelado) setStatus("erro");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [latitude, longitude]);

  return { hospital, policia, status };
}
