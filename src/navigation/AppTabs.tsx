/**
 * Mary App — Tabs principais (Início/Mapa/Emergência/Perfil)
 * Usa BottomNavigation (barra flutuante animada) no lugar
 * da tab bar padrão do React Navigation.
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "../i18n";
import { BottomNavigation } from "../components/BottomNavigation";
import { HomeScreen } from "../screens/Home/HomeScreen";
import { MapScreen } from "../screens/Map/MapScreen";
import { ProfileStack } from "./ProfileStack";
import { EmergencyStack } from "./EmergencyStack";
import type { AppTabsParamList } from "./types";

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNavigation {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t("common.navHome") }} />

      <Tab.Screen name="Mapa" component={MapScreen} options={{ tabBarLabel: t("common.navMap") }} />

      <Tab.Screen name="Emergencia" component={EmergencyStack} options={{ tabBarLabel: t("common.navEmergency") }} />

      <Tab.Screen name="Perfil" component={ProfileStack} options={{ tabBarLabel: t("common.navProfile") }} />
    </Tab.Navigator>
  );
}
