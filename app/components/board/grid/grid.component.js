import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {
  const socket = useContext(SocketContext);

  const [displayGrid, setDisplayGrid] = useState(false);
  const [canSelectCells, setCanSelectCells] = useState([]);
  const [grid, setGrid] = useState([]);

  const handleSelectCell = (cellId, rowIndex, cellIndex) => {
    if (canSelectCells) {
      socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
    }
  };

  useEffect(() => {
    socket.on("game.grid.view-state", (data) => {
      setDisplayGrid(data["displayGrid"]);
      setCanSelectCells(data["canSelectCells"]);
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
            {row.map((cell, cellIndex) => (
              <TouchableOpacity
                key={cell.id + "-" + rowIndex + "-" + cellIndex}
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
                <Text style={styles.cellText}>{getCellLabel(cell)}</Text>
              </TouchableOpacity>
            ))}
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
    borderColor: "black",
  },
  cellText: {
    fontSize: 11,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
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
