/**
 * Mary App — Stack interna do Perfil
 * Permite que Idioma (e as próximas: Editar perfil,
 * Segurança, Localização, Notificações, Privacidade,
 * Configurações de emergência) sejam telas de verdade,
 * com botão "voltar", em vez de alertas de "em breve".
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../screens/Profile/ProfileScreen";
import { LanguageScreen } from "../screens/Profile/LanguageScreen";
import { EditProfileScreen } from "../screens/Profile/EditProfileScreen";
import { SecurityScreen } from "../screens/Profile/SecurityScreen";
import { LocationSettingsScreen } from "../screens/Profile/LocationSettingsScreen";
import { NotificationsScreen } from "../screens/Profile/NotificationsScreen";
import { PrivacyScreen } from "../screens/Profile/PrivacyScreen";
import { EmergencySettingsScreen } from "../screens/Profile/EmergencySettingsScreen";
import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Location" component={LocationSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="EmergencySettings" component={EmergencySettingsScreen} />
    </Stack.Navigator>
  );
}
