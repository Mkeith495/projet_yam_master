// app/screens/vs-bot-game.screen.js

import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SocketContext } from "../contexts/socket.context";
import VsBotGameController from "../controllers/vs-bot-game.controller";

export default function VsBotGameScreen({ navigation }) {
  const socket = useContext(SocketContext);

  return (
    <View style={styles.container}>
      {!socket && (
        <>
          <Text style={styles.paragraph}>No connection with server...</Text>
          <Text style={styles.footnote}>
            Restart the app and wait for the server to be back again.
          </Text>
        </>
      )}

      {socket && <VsBotGameController navigation={navigation} />}
    </View>
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
  },
  paragraph: {
    fontSize: 16,
    color: "#EAF6FF",
    fontFamily: "Orbitron_700Bold",
  },
  footnote: {
    fontSize: 12,
    marginTop: 8,
    color: "#BFD4FF",
    fontFamily: "Orbitron_400Regular",
  },
});
