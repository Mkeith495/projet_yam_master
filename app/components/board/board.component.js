// app/components/board/board.component.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/opponent-timer.component";
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";

const OpponentInfos = ({ tokens }) => {
  return (
    <View style={styles.opponentInfosContainer}>
      <Text>Opponent tokens: {tokens}</Text>
    </View>
  );
};

const OpponentScore = ({ score }) => {
  return (
    <View style={styles.opponentScoreContainer}>
      <Text>Score: {score}</Text>
    </View>
  );
};

const PlayerInfos = ({ tokens }) => {
  return (
    <View style={styles.playerInfosContainer}>
      <Text>Your tokens: {tokens}</Text>
    </View>
  );
};

const PlayerScore = ({ score }) => {
  return (
    <View style={styles.playerScoreContainer}>
      <Text>Score: {score}</Text>
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
    backgroundColor: "#fff",
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
    borderColor: "black",
    backgroundColor: "lightgrey",
  },
  opponentTimerScoreContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgrey",
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
    borderColor: "black",
    backgroundColor: "lightgrey",
  },
  playerTimerScoreContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgrey",
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgrey",
  },
});

export default Board;
