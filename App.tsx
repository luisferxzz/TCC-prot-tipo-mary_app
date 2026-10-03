/**
 * Mary App — ponto de entrada
 *
 * Carrega a fonte Inter (4 pesos) antes de mostrar qualquer
 * tela, mantendo a splash visível nesse meio-tempo — padrão
 * recomendado pelo próprio expo-splash-screen. Se a fonte
 * falhar ao carregar (erro de rede em dev, por ex.), o app
 * segue com a fonte do sistema em vez de travar pra sempre.
 */

import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nProvider } from "./src/i18n";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      setPronto(true);
    }
  }, [fontsLoaded, fontsError]);

  const aoRenderizarLayout = useCallback(async () => {
    if (pronto) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [pronto]);

  if (!pronto) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={aoRenderizarLayout}>
      <SafeAreaProvider>
        <I18nProvider>
          <StatusBar style="light" backgroundColor={colors.background} />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
