/**
 * Mary App — cliente Supabase (React Native)
 *
 * Mesma URL/projeto do app Web. A diferença essencial é o
 * adaptador de armazenamento da sessão: aqui usamos
 * expo-secure-store (Keychain/Keystore) em vez do
 * localStorage do navegador, porque o token de sessão é
 * um dado sensível.
 */

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { obterSeguro, salvarSeguro, removerSeguro } from "../storage/secureStorage";

const SUPABASE_URL = "https://wmsohlgdqqavhsppjfuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dZ6ub0BIT3xtNPVSNg0ToA_2kZmPhPb";

// Adaptador que faz o Supabase Auth usar o SecureStore
// (Keychain/Keystore) em vez de localStorage/AsyncStorage
// para persistir a sessão.
const ExpoSecureStoreAdapter = {
  getItem: (chave: string) => obterSeguro(chave),
  setItem: (chave: string, valor: string) => salvarSeguro(chave, valor),
  removeItem: (chave: string) => removerSeguro(chave),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
