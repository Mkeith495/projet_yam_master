// app/components/board/board.component.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/opponent-timer.component";
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";

const OpponentInfos = ({ tokens }) => {
  return (
    <LinearGradient
      colors={["#0B1020", "#111B33"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.opponentInfosContainer}
    >
      <Text style={styles.hudText}>Adversaire: {tokens} tokens</Text>
    </LinearGradient>
  );
};

const OpponentScore = ({ score }) => {
  return (
    <View style={styles.opponentScoreContainer}>
      <Text style={styles.hudTextSmall}>Score: {score}</Text>
    </View>
  );
};

const PlayerInfos = ({ tokens }) => {
  return (
    <LinearGradient
      colors={["#0B1020", "#111B33"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.playerInfosContainer}
    >
      <Text style={styles.hudText}>Vous: {tokens} tokens</Text>
    </LinearGradient>
  );
};

const PlayerScore = ({ score }) => {
  return (
    <View style={styles.playerScoreContainer}>
      <Text style={styles.hudTextSmall}>Score: {score}</Text>
    </View>
  );
};

const Board = ({ scores }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.topRow]}>
        <OpponentInfos tokens={scores?.opponentTokens} />
        <View style={styles.opponentTimerScoreContainer}>
          <OpponentTimer />
          <OpponentScore score={scores?.opponentScore} />
        </View>
      </View>
      <View style={[styles.row, styles.deckRow]}>
        <OpponentDeck />
      </View>
      <View style={[styles.row, styles.middleRow]}>
        <Grid />
        <Choices />
      </View>
      <View style={[styles.row, styles.deckRow]}>
        <PlayerDeck />
      </View>
      <View style={[styles.row, styles.bottomRow]}>
        <PlayerInfos tokens={scores?.playerTokens} />
        <View style={styles.playerTimerScoreContainer}>
          <PlayerTimer />
          <PlayerScore score={scores?.playerScore} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    backgroundColor: "#05060A",
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  topRow: {
    flex: 1,
  },
  deckRow: {
    flex: 3,
  },
  middleRow: {
    flex: 6,
  },
  bottomRow: {
    flex: 1,
  },
  opponentInfosContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.35)",
  },
  opponentTimerScoreContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1020",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0, 229, 255, 0.35)",
  },
  opponentScoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "black",
  },
  gridContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "black",
  },
  playerInfosContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.35)",
  },
  playerTimerScoreContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1020",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0, 229, 255, 0.35)",
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  hudText: {
    fontFamily: "Orbitron_700Bold",
    fontSize: 12,
    color: "#EAF6FF",
    textShadowColor: "rgba(0, 229, 255, 0.55)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  hudTextSmall: {
    fontFamily: "Orbitron_400Regular",
    fontSize: 11,
    color: "#BFD4FF",
    textShadowColor: "rgba(142, 43, 255, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

export default Board;
