/**
 * Mary App — navegador raiz
 * Espelha o fluxo geral do projeto Web (index → onboarding
 * → login/cadastro → home), agora como uma Stack nativa.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoadingScreen } from "../screens/Loading/LoadingScreen";
import { OnboardingScreen } from "../screens/Onboarding/OnboardingScreen";
import { LoginScreen } from "../screens/Login/LoginScreen";
import { CadastroScreen } from "../screens/Cadastro/CadastroScreen";
import { AppTabs } from "./AppTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
    </Stack.Navigator>
  );
}
