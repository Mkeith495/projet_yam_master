import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import { SocketContext } from "../contexts/socket.context";
import Board from "../components/board/board.component";

export default function VsBotGameController({ navigation }) {
  const socket = useContext(SocketContext);

  const [inGame, setInGame] = useState(false);
  const [scores, setScores] = useState({
    playerScore: 0,
    playerTokens: 12,
    opponentScore: 0,
    opponentTokens: 12,
  });
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    socket.emit("vsbot.start");
    setInGame(false);

    socket.on("game.start", (data) => {
      setInGame(data["inGame"]);
    });

    socket.on("game.scores.view-state", (data) => {
      setScores(data);
    });

    socket.on("game.end", (data) => {
      setGameOver(data);
      setInGame(false);
    });

    return () => {
      socket.off("game.start");
      socket.off("game.scores.view-state");
      socket.off("game.end");
    };
  }, []);

  if (gameOver) {
    const hasWon = gameOver.winnerSocketId
      ? gameOver.winnerSocketId === socket.id
      : false;

    const finalPlayerScore =
      typeof gameOver.player1Score === "number"
        ? gameOver.player1Score
        : scores.playerScore;
    const finalBotScore =
      typeof gameOver.player2Score === "number"
        ? gameOver.player2Score
        : scores.opponentScore;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Partie Terminée !</Text>
        <Text style={styles.paragraph}>
          {hasWon ? "Vous avez gagné !" : "Vous avez perdu..."}
        </Text>
        <Text style={styles.footnote}>Raison : {gameOver.reason}</Text>
        <Text style={styles.footnote}>
          Votre score : {finalPlayerScore} | Bot : {finalBotScore}
        </Text>
        <Button
          title="Retour au menu"
          onPress={() => navigation.navigate("HomeScreen")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!inGame && (
        <>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.paragraph}>Démarrage de la partie VsBot...</Text>
        </>
      )}

      {inGame && <Board scores={scores} />}
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
    marginTop: 12,
  },
  footnote: {
    fontSize: 12,
    marginTop: 8,
    color: "#BFD4FF",
    fontFamily: "Orbitron_400Regular",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#EAF6FF",
    fontFamily: "Orbitron_700Bold",
    textShadowColor: "rgba(0, 229, 255, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
