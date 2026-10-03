/**
 * Mary App — navegação inferior flutuante
 *
 * Substitui a tab bar padrão do React Navigation por uma
 * versão flutuante, com cantos arredondados, sombra e
 * animação no item ativo (Reanimated) — conforme as
 * Etapas 6 e 7 do pedido. Usada como `tabBar` customizado
 * do Bottom Tabs Navigator.
 */

import React, { useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, radius, spacing, fontSizes, fontWeights, shadows } from "../../theme";
import { Text } from "../../components/AppText";

type NomeIonicon = React.ComponentProps<typeof Ionicons>["name"];

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

// Um ícone "outline" pra aba inativa, preenchido pra aba ativa
// — dá o mesmo tipo de destaque que a animação já dava com emoji.
const ICONES: Record<string, { ativo: NomeIonicon; inativo: NomeIonicon }> = {
  Home: { ativo: "home", inativo: "home-outline" },
  Mapa: { ativo: "location", inativo: "location-outline" },
  Emergencia: { ativo: "alert-circle", inativo: "alert-circle-outline" },
  Perfil: { ativo: "person", inativo: "person-outline" },
};

function ItemDaAba({
  ativo,
  icone,
  label,
  onPress,
}: {
  ativo: boolean;
  icone: { ativo: NomeIonicon; inativo: NomeIonicon };
  label: string;
  onPress: () => void;
}) {
  const progresso = useSharedValue(ativo ? 1 : 0);

  useEffect(() => {
    progresso.value = withSpring(ativo ? 1 : 0, { damping: 14, stiffness: 180 });
  }, [ativo]);

  const estiloIcone = useAnimatedStyle(() => ({
    transform: [
      { translateY: -progresso.value * 4 },
      { scale: 1 + progresso.value * 0.12 },
    ],
  }));

  const estiloFundo = useAnimatedStyle(() => ({
    opacity: progresso.value,
    transform: [{ scale: 0.8 + progresso.value * 0.2 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: ativo }}
      style={styles.item}
    >
      <View style={styles.itemIconArea}>
        <Animated.View style={[styles.itemIconBackground, estiloFundo]} />
        <AnimatedIonicons
          name={ativo ? icone.ativo : icone.inativo}
          size={18}
          color={ativo ? colors.primary : colors.textMuted}
          style={estiloIcone}
        />
      </View>

      <Text style={[styles.itemLabel, ativo && styles.itemLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {state.routes.map((route, indice) => {
          const { options } = descriptors[route.key];
          const label = String(options.tabBarLabel ?? options.title ?? route.name);
          const ativo = state.index === indice;

          function aoTocar() {
            const evento = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!ativo && !evento.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <ItemDaAba
              key={route.key}
              ativo={ativo}
              icone={ICONES[route.name] ?? { ativo: "ellipse", inativo: "ellipse-outline" }}
              label={label}
              onPress={aoTocar}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    ...(shadows.floating as object),
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  itemIconArea: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconBackground: {
    position: "absolute",
    width: 40,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}22`,
  },
  itemIcon: { fontSize: 18 },
  itemLabel: { color: colors.textMuted, fontSize: 10, fontWeight: fontWeights.medium },
  itemLabelActive: { color: colors.primary, fontWeight: fontWeights.bold },
});
