// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { SocketContext } from "../contexts/socket.context";
import Board from "../components/board/board.component";

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
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    console.log("[emit][queue.join]:", socket.id);
    socket.emit("queue.join");
    setInQueue(false);
    setInGame(false);

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
    });

    socket.on("queue.left", (data) => {
      console.log("[listen][queue.left]:", data);
      setInQueue(data["inQueue"]);
      setInGame(data["inGame"]);
      navigation.navigate("HomeScreen");
    });

    socket.on("game.scores.view-state", (data) => {
      setScores(data);
    });

    socket.on("game.end", (data) => {
      setGameOver(data);
      setInGame(false); // On arrête le rendu du Board pour afficher le résumé
    });

    // N'oubliez pas de nettoyer les écouteurs dans le return de useEffect
    return () => {
      socket.off("queue.added");
      socket.off("game.start");
      socket.off("queue.left");
      socket.off("game.scores.view-state");
      socket.off("game.end");
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
        <Text>{hasWon ? "Vous avez gagné !" : "Vous avez perdu..."}</Text>
        <Text>Raison : {gameOver.reason}</Text>
        <Text>
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
          <Text style={styles.paragraph}>Waiting for server datas...</Text>
        </>
      )}

      {inQueue && (
        <>
          <Text style={styles.paragraph}>Waiting for another player...</Text>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  paragraph: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
