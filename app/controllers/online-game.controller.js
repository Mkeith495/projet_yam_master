// app/controller/online-game.controller.js

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
import { audioManager } from "../audio/audio.manager";

export default function OnlineGameController({ navigation }) {
  const socket = useContext(SocketContext);

  const [inQueue, setInQueue] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [idOpponent, setIdOpponent] = useState(null);

  // Ajoutez ces nouveaux states
  const [scores, setScores] = useState({
    playerScore: 0,
    playerTokens: 12,
    opponentScore: 0,
    opponentTokens: 12,
  });
  const [prevScores, setPrevScores] = useState({
    playerScore: 0,
    opponentScore: 0,
  });
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    console.log("[emit][queue.join]:", socket.id);
    socket.emit("queue.join");
    setInQueue(false);
    setInGame(false);

    audioManager.playBgm("queue_bgm");

    socket.on("queue.added", (data) => {
      console.log("[listen][queue.added]:", data);
      setInQueue(data["inQueue"]);
      setInGame(data["inGame"]);
    });

    socket.on("game.start", (data) => {
      console.log("[listen][game.start]:", data);
      setInQueue(data["inQueue"]);
      setInGame(data["inGame"]);
      setIdOpponent(data["idOpponent"]);
      audioManager.stopBgm();
      audioManager.playSfx("match_start_sfx");
      audioManager.playBgm("ingame_bgm", { volume: 0.22 });
    });

    socket.on("queue.left", (data) => {
      console.log("[listen][queue.left]:", data);
      setInQueue(data["inQueue"]);
      setInGame(data["inGame"]);
      audioManager.stopBgm();
      navigation.navigate("HomeScreen");
    });

    socket.on("game.scores.view-state", (data) => {
      const nextPlayerScore =
        typeof data?.playerScore === "number" ? data.playerScore : 0;
      const nextOpponentScore =
        typeof data?.opponentScore === "number" ? data.opponentScore : 0;

      if (
        nextPlayerScore > prevScores.playerScore ||
        nextOpponentScore > prevScores.opponentScore
      ) {
        audioManager.playSfx("combo_sfx");
      }

      setPrevScores({
        playerScore: nextPlayerScore,
        opponentScore: nextOpponentScore,
      });
      setScores(data);
    });

    socket.on("game.end", (data) => {
      setGameOver(data);
      setInGame(false); // On arrête le rendu du Board pour afficher le résumé

      audioManager.stopBgm();

      const hasWon = data?.winnerSocketId
        ? data.winnerSocketId === socket.id
        : false;
      const isDraw =
        typeof data?.player1Score === "number" &&
        typeof data?.player2Score === "number" &&
        data.player1Score === data.player2Score;

      if (isDraw) audioManager.playBgm("draw_bgm");
      else if (hasWon) audioManager.playBgm("win_bgm");
      else audioManager.playBgm("lose_bgm");
    });

    // N'oubliez pas de nettoyer les écouteurs dans le return de useEffect
    return () => {
      socket.off("queue.added");
      socket.off("game.start");
      socket.off("queue.left");
      socket.off("game.scores.view-state");
      socket.off("game.end");
      audioManager.stopBgm();
    };
  }, []);

  // Dans le return, gérez l'affichage de la fin de partie
  if (gameOver) {
    const hasWon = gameOver.winnerSocketId
      ? gameOver.winnerSocketId === socket.id
      : false;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Partie Terminée !</Text>
        <Text style={styles.paragraph}>
          {hasWon ? "Vous avez gagné !" : "Vous avez perdu..."}
        </Text>
        <Text style={styles.footnote}>Raison : {gameOver.reason}</Text>
        <Text style={styles.footnote}>
          Votre score : {scores.playerScore} | Adversaire :{" "}
          {scores.opponentScore}
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
      {!inQueue && !inGame && (
        <>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.paragraph}>Connexion au serveur...</Text>
        </>
      )}

      {inQueue && (
        <>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.paragraph}>En attente d'un adversaire...</Text>
          <View>
            <Button
              title="Quittez la file d'attente"
              onPress={() => {
                socket.emit("queue.leave");
              }}
            />
          </View>
        </>
      )}

      {inGame && <>{inGame && <Board scores={scores} />}</>}
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
