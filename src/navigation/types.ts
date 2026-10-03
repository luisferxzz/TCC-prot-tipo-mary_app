/**
 * Mary App — tipos de navegação
 *
 * Fase 1 (atual): Loading, Onboarding, Login, Cadastro e as
 * Tabs principais (Home real; Mapa/Contatos/Configurações
 * como placeholders "em construção" até a próxima fase).
 */

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp, NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
  Loading: undefined;
  Onboarding: undefined;
  Login: undefined;
  Cadastro: undefined;
  AppTabs: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Mapa: undefined;
  // NavigatorScreenParams permite navegar direto pra uma tela
  // interna da stack de Emergência (ex.: Contatos, ou o SOS
  // pré-disparado) a partir de qualquer outra aba, como a Home.
  Emergencia: NavigatorScreenParams<EmergencyStackParamList>;
  Perfil: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Language: undefined;
  EditProfile: undefined;
  Security: undefined;
  Location: undefined;
  Notifications: undefined;
  Privacy: undefined;
  EmergencySettings: undefined;
};

export type ProfileStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  AppTabsNavigation
>;

export type EmergencyStackParamList = {
  // autoTriggerSOS: usado pela Home para iniciar o MESMO
  // fluxo de SOS que já existe aqui, sem duplicar a lógica.
  EmergencyHome: { autoTriggerSOS?: boolean } | undefined;
  Contacts: undefined;
  Recordings: undefined;
};

export type EmergencyStackNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<EmergencyStackParamList>,
  AppTabsNavigation
>;

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

export type AppTabsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabsParamList>,
  RootStackNavigation
>;
