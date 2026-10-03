/**
 * Mary App — Mapa
 * Hospeda o mapa Leaflet (mapHtml.ts) numa WebView e faz a
 * ponte com os serviços reais do RN: localização
 * (expo-location, via services/location) e favoritos
 * (AsyncStorage, via services/storage/mapFavorites) —
 * a WebView nunca acessa esses recursos diretamente.
 */

import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { colors } from "../../theme";
import { gerarHtmlDoMapa } from "./mapHtml";
import { obterLocalizacaoAtual } from "../../services/location/location";
import {
  obterFavoritosMapa,
  adicionarFavoritoMapa,
  removerFavoritoMapa,
} from "../../services/storage/mapFavorites";

type MensagemDaWebView =
  | { tipo: "pronto" }
  | { tipo: "pedir_localizacao" }
  | { tipo: "favorito_adicionar"; nome: string; endereco: string; latitude: number; longitude: number }
  | { tipo: "favorito_remover"; id: number };

export function MapScreen() {
  const webViewRef = useRef<WebView>(null);
  const html = useMemo(() => gerarHtmlDoMapa(), []);

  function enviarParaWebView(mensagem: unknown) {
    webViewRef.current?.injectJavaScript(
      `window.receberDoRN(${JSON.stringify(mensagem)}); true;`
    );
  }

  async function enviarFavoritosAtualizados() {
    const favoritos = await obterFavoritosMapa();
    enviarParaWebView({ tipo: "favoritos", lista: favoritos });
  }

  async function tratarPedidoDeLocalizacao() {
    const resultado = await obterLocalizacaoAtual();

    if (resultado.sucesso) {
      enviarParaWebView({
        tipo: "localizacao",
        latitude: resultado.dados.latitude,
        longitude: resultado.dados.longitude,
      });
    } else {
      enviarParaWebView({ tipo: "erro_localizacao", mensagem: resultado.mensagem });
    }
  }

  const aoReceberMensagem = useCallback(async (evento: WebViewMessageEvent) => {
    let mensagem: MensagemDaWebView;

    try {
      mensagem = JSON.parse(evento.nativeEvent.data);
    } catch (erro) {
      console.error("[MaryApp] Mensagem inválida da WebView do mapa:", erro);
      return;
    }

    switch (mensagem.tipo) {
      case "pronto":
        await enviarFavoritosAtualizados();
        // Pede a localização assim que o mapa carrega — antes
        // o usuário precisava tocar no botão 📍 pra começar a
        // ver onde está, o que não faz sentido num app de
        // segurança (quanto antes souber a posição, melhor).
        await tratarPedidoDeLocalizacao();
        break;

      case "pedir_localizacao":
        await tratarPedidoDeLocalizacao();
        break;

      case "favorito_adicionar":
        await adicionarFavoritoMapa({
          nome: mensagem.nome,
          endereco: mensagem.endereco,
          latitude: mensagem.latitude,
          longitude: mensagem.longitude,
        });
        await enviarFavoritosAtualizados();
        break;

      case "favorito_remover":
        await removerFavoritoMapa(mensagem.id);
        await enviarFavoritosAtualizados();
        break;
    }
  }, []);

  // Sempre que a aba Mapa ganha foco, reenvia os favoritos —
  // cobre o caso de terem sido alterados em outro lugar.
  useFocusEffect(
    useCallback(() => {
      enviarFavoritosAtualizados();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.webviewWrapper}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={aoReceberMensagem}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled={false}
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webviewWrapper: { flex: 1 },
  webview: { flex: 1, backgroundColor: colors.background },
});
