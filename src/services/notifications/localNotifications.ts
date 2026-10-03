/**
 * Mary App — notificações locais
 *
 * IMPORTANTE: isto é notificação LOCAL (agendada no próprio
 * aparelho), não push remoto. Funciona no Expo Go, sem
 * precisar de development build. Push de verdade (disparado
 * por um servidor) é outra coisa — exige development build e
 * fica de fora por enquanto (ver services/emergency/sos.ts e
 * a tela de Notificações pra saber onde isso é usado).
 *
 * A notificação nunca pode quebrar o fluxo que a chamou (o
 * SOS, por exemplo) — por isso todo erro aqui é engolido.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let canalCriado = false;

async function garantirCanalAndroid() {
  if (Platform.OS !== "android" || canalCriado) return;
  await Notifications.setNotificationChannelAsync("padrao", {
    name: "Mary App",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  canalCriado = true;
}

export async function pedirPermissaoNotificacoes(): Promise<boolean> {
  try {
    const atual = await Notifications.getPermissionsAsync();
    if (atual.granted) return true;

    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
  } catch {
    return false;
  }
}

/** Dispara assim que o SOS é registrado — ver dispararSOS() em services/emergency/sos.ts. */
export async function notificarSosRegistrado(): Promise<void> {
  try {
    const permitido = await pedirPermissaoNotificacoes();
    if (!permitido) return;

    await garantirCanalAndroid();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de emergência registrado",
        body: "O Mary App registrou seu SOS agora. Toque para ver os detalhes.",
      },
      trigger: null, // dispara imediatamente
    });
  } catch {
    // notificação é um bônus — nunca deve derrubar o fluxo de SOS
  }
}

const ID_LEMBRETE_SEMANAL = "mary-app-lembrete-semanal";
const UMA_SEMANA_EM_SEGUNDOS = 7 * 24 * 60 * 60;

/** Chamado quando o usuário LIGA o toggle em Perfil > Notificações. */
export async function ativarLembreteSemanal(): Promise<boolean> {
  try {
    const permitido = await pedirPermissaoNotificacoes();
    if (!permitido) return false;

    await garantirCanalAndroid();
    await cancelarLembreteSemanal();
    await Notifications.scheduleNotificationAsync({
      identifier: ID_LEMBRETE_SEMANAL,
      content: {
        title: "Dica do Mary App",
        body: "Já faz uma semana — confira se seus contatos de emergência e sua localização estão atualizados.",
      },
      // sem "type" explícito de propósito: essa forma
      // (seconds + repeats) é a que funciona nas versões
      // recentes do expo-notifications: confirme com
      // `npx tsc --noEmit` no seu projeto, já que o pacote
      // muda o formato do trigger entre versões.
      trigger: { seconds: UMA_SEMANA_EM_SEGUNDOS, repeats: true } as Notifications.NotificationTriggerInput,
    });
    return true;
  } catch {
    return false;
  }
}

/** Chamado quando o usuário DESLIGA o toggle em Perfil > Notificações. */
export async function cancelarLembreteSemanal(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_SEMANAL).catch(() => {});
}
