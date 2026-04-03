// app/screens/home.screen.js

import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#05060A", "#0B1020", "#05060A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>YAM MASTER</Text>
        <Text style={styles.subtitle}>Choisis ton mode de jeu</Text>
      </View>

      <View style={styles.actions}>
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
      </View>
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
