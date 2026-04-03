// app/components/board/decks/player-deck.component.js

import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const PlayerDeck = () => {
  const socket = useContext(SocketContext);
  const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
  const [dices, setDices] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      value: "",
      locked: true,
    })),
  );
  const [displayRollButton, setDisplayRollButton] = useState(false);
  const [rollsCounter, setRollsCounter] = useState(0);
  const [rollsMaximum, setRollsMaximum] = useState(3);
  const rollPressAnim = React.useRef(new Animated.Value(0)).current;
  const diceShakeAnim = React.useRef(new Animated.Value(0)).current;
  const prevRollsCounterRef = React.useRef(0);

  useEffect(() => {
    socket.on("game.deck.view-state", (data) => {
      setDisplayPlayerDeck(data["displayPlayerDeck"]);
      if (data["displayPlayerDeck"]) {
        setDisplayRollButton(data["displayRollButton"]);
        setRollsCounter(data["rollsCounter"]);
        setRollsMaximum(data["rollsMaximum"]);
        setDices(data["dices"]);

        const nextRolls =
          typeof data?.rollsCounter === "number" ? data.rollsCounter : 0;
        if (nextRolls > prevRollsCounterRef.current) {
          diceShakeAnim.setValue(0);
          Animated.sequence([
            Animated.timing(diceShakeAnim, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(diceShakeAnim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start();
        }
        prevRollsCounterRef.current = nextRolls;
      }
    });
  }, []);

  const toggleDiceLock = (index) => {
    const newDices = [...dices];
    if (newDices[index].value !== "" && displayRollButton) {
      socket.emit("game.dices.lock", newDices[index].id);
    }
  };

  const rollDices = () => {
    if (rollsCounter <= rollsMaximum) {
      socket.emit("game.dices.roll");
    }
  };

  return (
    <View style={styles.deckPlayerContainer}>
      {displayPlayerDeck && (
        <>
          {displayRollButton && (
            <>
              <View style={styles.rollInfoContainer}>
                <Text style={styles.rollInfoText}>
                  Lancer {rollsCounter} / {rollsMaximum}
                </Text>
              </View>
            </>
          )}

          <View style={styles.diceContainer}>
            <Animated.View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                transform: [
                  {
                    translateX: diceShakeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 6],
                    }),
                  },
                ],
              }}
            >
              {dices.map((diceData, index) => (
                <Dice
                  key={diceData.id}
                  index={index}
                  locked={diceData.locked}
                  value={diceData.value}
                  onPress={toggleDiceLock}
                />
              ))}
            </Animated.View>
          </View>

          {displayRollButton && (
            <>
              <TouchableOpacity
                style={styles.rollButton}
                onPress={rollDices}
                onPressIn={() => {
                  rollPressAnim.setValue(0);
                  Animated.timing(rollPressAnim, {
                    toValue: 1,
                    duration: 90,
                    useNativeDriver: true,
                  }).start();
                }}
                onPressOut={() => {
                  Animated.timing(rollPressAnim, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: rollPressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.96],
                        }),
                      },
                    ],
                  }}
                >
                  <Text style={styles.rollButtonText}>Roll</Text>
                </Animated.View>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  deckPlayerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "black",
  },
  rollInfoContainer: {
    marginBottom: 10,
  },
  rollInfoText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rollButton: {
    width: "30%",
    backgroundColor: "green",
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  rollButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default PlayerDeck;
