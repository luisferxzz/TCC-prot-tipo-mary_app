/**
 * Mary App — tempo relativo ("há 2 minutos")
 * Usado na Home para mostrar há quanto tempo a localização
 * foi atualizada, sem depender de nenhuma lib externa.
 */

export function minutosDesde(dataISO: string): number {
  const diffMs = Date.now() - new Date(dataISO).getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

export function tempoRelativo(
  dataISO: string,
  t: (chave: string, parametros?: Record<string, string | number>) => string
): string {
  const minutos = minutosDesde(dataISO);

  if (minutos < 1) return t("home.timeJustNow");
  if (minutos < 60) return t("home.timeMinutesAgo", { count: minutos });

  const horas = Math.round(minutos / 60);
  if (horas < 24) return t("home.timeHoursAgo", { count: horas });

  const dias = Math.round(horas / 24);
  return t("home.timeDaysAgo", { count: dias });
}
