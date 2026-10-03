/**
 * Mary App — Onboarding
 * Espelha os 4 slides do index.html/index.js (Web), agora
 * como um carrossel nativo: ScrollView horizontal com
 * paging (suporta swipe, além do botão "Próximo").
 */

import React, { useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Pressable, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, fontSizes, fontWeights } from "../../theme";
import { useTranslation } from "../../i18n";
import { concluirOnboarding } from "../../services/storage/preferences";
import { Button } from "../../components/Button";
import type { RootStackNavigation } from "../../navigation/types";
import { Text } from "../../components/AppText";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const SLIDES = [
  { icon: "shield-checkmark" as const, titleKey: "index.slide1Title", textKey: "index.slide1Text", buttonKey: "index.slide1Button" },
  { icon: "warning" as const, titleKey: "index.slide2Title", textKey: "index.slide2Text", buttonKey: "index.slide2Button" },
  { icon: "location" as const, titleKey: "index.slide3Title", textKey: "index.slide3Text", buttonKey: "index.slide3Button" },
  { icon: "checkmark-circle" as const, titleKey: "index.slide4Title", textKey: "index.slide4Text", buttonKey: "index.slide4Button" },
];

export function OnboardingScreen() {
  const navigation = useNavigation<RootStackNavigation>();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  async function finalizar() {
    await concluirOnboarding();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  function irParaSlide(indice: number) {
    scrollRef.current?.scrollTo({ x: indice * width, animated: true });
    setIndiceAtual(indice);
  }

  function aoRolar(evento: NativeSyntheticEvent<NativeScrollEvent>) {
    const novoIndice = Math.round(
      evento.nativeEvent.contentOffset.x / width
    );
    if (novoIndice !== indiceAtual) {
      setIndiceAtual(novoIndice);
    }
  }

  function aoTocarProximo() {
    if (indiceAtual < SLIDES.length - 1) {
      irParaSlide(indiceAtual + 1);
    } else {
      finalizar();
    }
  }

  const ultimoSlide = indiceAtual === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {!ultimoSlide && (
        <Pressable
          onPress={finalizar}
          style={styles.skipButton}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>{t("index.skip")}</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoRolar}
        style={styles.track}
      >
        {SLIDES.map((slide, indice) => (
          <View key={indice} style={[styles.slide, { width }]}>
            <View style={styles.iconWrapper}>
              <Ionicons name={slide.icon} size={42} color={colors.primary} />
            </View>

            <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
            <Text style={styles.slideText}>{t(slide.textKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={styles.dots}
        accessibilityLabel={t("index.stepLabel", {
          atual: indiceAtual + 1,
          total: SLIDES.length,
        })}
      >
        {SLIDES.map((_, indice) => (
          <View
            key={indice}
            style={[styles.dot, indice === indiceAtual && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={t(SLIDES[indiceAtual].buttonKey)} onPress={aoTocarProximo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: 16,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: fontWeights.medium,
  },
  track: {
    flex: 1,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 92,
    height: 92,
    borderRadius: radius.xl + 6,
    backgroundColor: "rgba(216, 27, 96, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  icon: {
    fontSize: 42,
  },
  slideTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: fontWeights.extraBold,
    textAlign: "center",
    marginBottom: 12,
  },
  slideText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 300,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
