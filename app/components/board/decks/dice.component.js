// app/components/board/decks/dice.component.js

import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Dice = ({ index, locked, value, onPress, opponent }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const prevValueRef = useRef(value);

  useEffect(() => {
    const prevValue = prevValueRef.current;
    if (value && value !== prevValue) {
      spinAnim.setValue(0);
      Animated.sequence([
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(spinAnim, {
          toValue: 0,
          duration: 160,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevValueRef.current = value;
  }, [value]);

  const pipLayout = {
    1: ["C"],
    2: ["TL", "BR"],
    3: ["TL", "C", "BR"],
    4: ["TL", "TR", "BL", "BR"],
    5: ["TL", "TR", "C", "BL", "BR"],
    6: ["TL", "ML", "BL", "TR", "MR", "BR"],
  };

  const pipPositions = {
    TL: { top: 8, left: 8 },
    TR: { top: 8, right: 8 },
    BL: { bottom: 8, left: 8 },
    BR: { bottom: 8, right: 8 },
    ML: { top: "50%", left: 8, marginTop: -4 },
    MR: { top: "50%", right: 8, marginTop: -4 },
    C: { top: "50%", left: "50%", marginLeft: -4, marginTop: -4 },
  };

  const faceValue = Number(value);
  const pips =
    Number.isFinite(faceValue) && faceValue >= 1 && faceValue <= 6
      ? pipLayout[faceValue] || []
      : [];

  const faceColors = opponent
    ? ["rgba(235, 242, 255, 0.55)", "rgba(150, 165, 190, 0.35)"]
    : ["#F7FBFF", "#DCE7F5"];

  const pipColor = opponent ? "rgba(11, 16, 32, 0.55)" : "#0B1020";

  const handlePress = () => {
    if (!opponent) {
      onPress(index);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.diceTouchable, locked && styles.lockedDiceTouchable]}
      onPress={handlePress}
      disabled={opponent}
    >
      <Animated.View
        style={{
          transform: [
            { perspective: 600 },
            {
              rotateZ: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "720deg"],
              }),
            },
            {
              rotateY: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "25deg"],
              }),
            },
            {
              rotateX: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "18deg"],
              }),
            },
            {
              scale: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.06],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={faceColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.diceFace}
        >
          <View style={styles.innerBevel} />
          {pips.map((pos) => (
            <View
              key={pos}
              style={[
                styles.pip,
                pipPositions[pos],
                { backgroundColor: pipColor },
              ]}
            />
          ))}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  diceTouchable: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.65)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  lockedDiceTouchable: {
    opacity: 0.72,
  },
  diceFace: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 10, 18, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerBevel: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  pip: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0B1020",
    shadowColor: "rgba(0,0,0,0.6)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  opponentText: {
    fontSize: 12,
    color: "red",
  },
});

export default Dice;
