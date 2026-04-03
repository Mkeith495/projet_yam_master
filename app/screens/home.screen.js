// app/screens/home.screen.js

import React, { useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { audioManager } from "../audio/audio.manager";

export default function HomeScreen({ navigation }) {
  const hasEnabledAudioRef = useRef(false);
  const titlePulseAnim = useRef(new Animated.Value(0)).current;
  const actionsFloatAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(titlePulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(titlePulseAnim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(actionsFloatAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(actionsFloatAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      audioManager.playBgm("home_bgm");
      return () => {
        audioManager.stopBgm();
      };
    }, []),
  );

  const enableAudioIfNeeded = () => {
    if (hasEnabledAudioRef.current) return;
    hasEnabledAudioRef.current = true;
    audioManager.playBgm("home_bgm");
  };

  return (
    <LinearGradient
      colors={["#05060A", "#0B1020", "#05060A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={enableAudioIfNeeded}
      />
      <View style={styles.hero}>
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [
                {
                  scale: titlePulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.03],
                  }),
                },
              ],
            },
          ]}
        >
          YAM MASTER
        </Animated.Text>
        <Text style={styles.subtitle}>Choisis ton mode de jeu</Text>
      </View>

      <Animated.View
        style={[
          styles.actions,
          {
            transform: [
              {
                translateY: actionsFloatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.buttonOuter}
          onPress={() => navigation.navigate("OnlineGameScreen")}
        >
          <LinearGradient
            colors={["rgba(0, 229, 255, 0.35)", "rgba(142, 43, 255, 0.25)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Jouer en ligne</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOuter, { marginTop: 14 }]}
          onPress={() => navigation.navigate("VsBotGameScreen")}
        >
          <LinearGradient
            colors={["rgba(142, 43, 255, 0.25)", "rgba(0, 229, 255, 0.28)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Jouer contre le bot</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060A",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 18,
  },
  hero: {
    alignItems: "center",
    marginBottom: 26,
  },
  title: {
    fontFamily: "Orbitron_700Bold",
    fontSize: 30,
    letterSpacing: 2,
    color: "#EAF6FF",
    textShadowColor: "rgba(0, 229, 255, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    marginTop: 10,
    fontFamily: "Orbitron_400Regular",
    fontSize: 12,
    color: "#BFD4FF",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 420,
  },
  buttonOuter: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.35)",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 2,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    color: "#EAF6FF",
    textShadowColor: "rgba(142, 43, 255, 0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
