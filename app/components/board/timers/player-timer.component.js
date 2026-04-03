import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const PlayerTimer = () => {
  const socket = useContext(SocketContext);
  const [playerTimer, setPlayerTimer] = useState(0);

  useEffect(() => {
    socket.on("game.timer", (data) => {
      setPlayerTimer(data["playerTimer"]);
    });
  }, []);

  return (
    <View style={styles.playerTimerContainer}>
      <Text style={styles.timerText}>Timer: {playerTimer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  playerTimerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontFamily: "Orbitron_400Regular",
    fontSize: 11,
    color: "#EAF6FF",
    textShadowColor: "rgba(0, 229, 255, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

export default PlayerTimer;
