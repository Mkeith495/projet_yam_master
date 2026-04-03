import React, { useEffect, useContext, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import { audioManager } from "../../../audio/audio.manager";

const Grid = () => {
  const socket = useContext(SocketContext);

  const [displayGrid, setDisplayGrid] = useState(false);
  const [canSelectCells, setCanSelectCells] = useState([]);
  const [grid, setGrid] = useState([]);
  const prevGridRef = useRef([]);
  const [lastPlayedKey, setLastPlayedKey] = useState(null);
  const popAnim = useRef(new Animated.Value(0)).current;

  const handleSelectCell = (cellId, rowIndex, cellIndex) => {
    if (canSelectCells) {
      audioManager.playSfx("dice_place_sfx");
      socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
    }
  };

  useEffect(() => {
    socket.on("game.grid.view-state", (data) => {
      setDisplayGrid(data["displayGrid"]);
      setCanSelectCells(data["canSelectCells"]);

      const nextGrid = data["grid"];
      const prevGrid = prevGridRef.current;
      let changedKey = null;

      if (Array.isArray(nextGrid) && Array.isArray(prevGrid)) {
        for (let r = 0; r < nextGrid.length; r++) {
          for (let c = 0; c < (nextGrid[r] || []).length; c++) {
            const nextCell = nextGrid[r]?.[c];
            const prevCell = prevGrid[r]?.[c];
            if (!nextCell) continue;

            const nextOwner = nextCell.owner;
            const prevOwner = prevCell?.owner;
            if (nextOwner && nextOwner !== prevOwner) {
              changedKey = `${nextCell.id}-${r}-${c}`;
            }
          }
        }
      }

      if (changedKey) {
        setLastPlayedKey(changedKey);
        popAnim.setValue(0);
        Animated.sequence([
          Animated.timing(popAnim, {
            toValue: 1,
            duration: 110,
            useNativeDriver: true,
          }),
          Animated.timing(popAnim, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
        ]).start();
      }

      prevGridRef.current = nextGrid;
      setGrid(data["grid"]);
    });
  }, []);

  const getCellLabel = (cell) => {
    const raw = cell?.viewContent;
    if (typeof raw === "string" && raw.trim().length > 0) return raw;
    if (typeof raw === "number") return String(raw);

    const id = cell?.id;
    if (!id) return "";

    if (id.startsWith("brelan")) {
      const n = id.replace("brelan", "");
      return n;
    }

    const map = {
      carre: "Carré",
      full: "Full",
      yam: "Yam",
      suite: "Suite",
      moinshuit: "≤8",
      sec: "Sec",
      defi: "Défi",
    };

    return map[id] || String(id);
  };

  return (
    <View style={styles.gridContainer}>
      {displayGrid &&
        grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => {
              const key = cell.id + "-" + rowIndex + "-" + cellIndex;
              const isLastPlayed = key === lastPlayedKey;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.cell,
                    cell.owner === "player:1" && styles.playerOwnedCell,
                    cell.owner === "player:2" && styles.opponentOwnedCell,
                    cell.canBeChecked &&
                      !(cell.owner === "player:1") &&
                      !(cell.owner === "player:2") &&
                      styles.canBeCheckedCell,
                    rowIndex !== 0 && styles.topBorder,
                    cellIndex !== 0 && styles.leftBorder,
                  ]}
                  onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                  disabled={!cell.canBeChecked}
                >
                  <Animated.View
                    style={
                      isLastPlayed
                        ? {
                            transform: [
                              {
                                scale: popAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.1],
                                }),
                              },
                            ],
                          }
                        : null
                    }
                  >
                    <Text style={styles.cellText}>{getCellLabel(cell)}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#0B1020",
  },
  row: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    flexDirection: "row",
    flex: 2,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(234, 246, 255, 0.22)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  cellText: {
    fontSize: 11,
    color: "#EAF6FF",
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 229, 255, 0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  playerOwnedCell: {
    backgroundColor: "lightgreen",
    opacity: 0.9,
  },
  opponentOwnedCell: {
    backgroundColor: "lightcoral",
    opacity: 0.9,
  },
  canBeCheckedCell: {
    backgroundColor: "lightyellow",
  },
  topBorder: {
    borderTopWidth: 1,
  },
  leftBorder: {
    borderLeftWidth: 1,
  },
});

export default Grid;
