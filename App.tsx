/**
 * Mary App — ponto de entrada
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nProvider } from "./src/i18n";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
