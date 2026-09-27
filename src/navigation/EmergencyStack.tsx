/**
 * Mary App — Stack interna da Emergência
 * Permite que "Contatos de emergência" seja uma tela
 * completa (com voltar), acessível tanto pela aba
 * Emergência quanto potencialmente por outros pontos do app.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EmergencyScreen } from "../screens/Emergency/EmergencyScreen";
import { ContactsScreen } from "../screens/Emergency/ContactsScreen";
import type { EmergencyStackParamList } from "./types";

const Stack = createNativeStackNavigator<EmergencyStackParamList>();

export function EmergencyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmergencyHome" component={EmergencyScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
    </Stack.Navigator>
  );
}
