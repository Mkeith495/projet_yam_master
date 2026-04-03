const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
var uniqid = require("uniqid");
const GameService = require("./services/game.service");

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];
const BOT_SOCKET_ID = "BOT";

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit(
    "game.timer",
    GameService.send.forPlayer.gameTimer("player:1", game.gameState),
  );
  game.player2Socket.emit(
    "game.timer",
    GameService.send.forPlayer.gameTimer("player:2", game.gameState),
  );
};

const createGameVsBot = (playerSocket) => {
  const botSocket = {
    id: BOT_SOCKET_ID,
    emit: () => {},
    on: () => {},
  };

  createGame(playerSocket, botSocket);
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit(
      "game.deck.view-state",
      GameService.send.forPlayer.deckViewState("player:1", game.gameState),
    );
    game.player2Socket.emit(
      "game.deck.view-state",
      GameService.send.forPlayer.deckViewState("player:2", game.gameState),
    );
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    game.player1Socket.emit(
      "game.choices.view-state",
      GameService.send.forPlayer.choicesViewState("player:1", game.gameState),
    );
    game.player2Socket.emit(
      "game.choices.view-state",
      GameService.send.forPlayer.choicesViewState("player:2", game.gameState),
    );
  }, 200);
};

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    game.player1Socket.emit(
      "game.grid.view-state",
      GameService.send.forPlayer.gridViewState("player:1", game.gameState),
    );
    game.player2Socket.emit(
      "game.grid.view-state",
      GameService.send.forPlayer.gridViewState("player:2", game.gameState),
    );
  }, 200);
};

const endTurnAndReset = (game) => {
  game.gameState.currentTurn =
    game.gameState.currentTurn === "player:1" ? "player:2" : "player:1";
  game.gameState.timer = GameService.timer.getTurnDuration();
  game.gameState.deck = GameService.init.deck();
  game.gameState.choices = GameService.init.choices();
  game.gameState.grid = GameService.grid.resetcanBeCheckedCells(
    game.gameState.grid,
  );

  updateClientsViewTimers(game);
  updateClientsViewDecks(game);
  updateClientsViewChoices(game);
  updateClientsViewGrid(game);
};

const findFirstPlayableCellForChoice = (grid, choiceId) => {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell.owner === null && cell.id === choiceId) {
        return { cellId: cell.id, rowIndex: r, cellIndex: c };
      }
    }
  }
  return null;
};

const handleGridSelected = (gameIndex, data) => {
  const gameState = games[gameIndex].gameState;

  // 1. Marquer la cellule et décrémenter les pions
  gameState.grid = GameService.grid.resetcanBeCheckedCells(gameState.grid);
  gameState.grid = GameService.grid.selectCell(
    data.cellId,
    data.rowIndex,
    data.cellIndex,
    gameState.currentTurn,
    gameState.grid,
    gameState,
  );

  // 2. Calculer les scores basés sur les alignements de 3 ou 4
  gameState.player1Score = GameService.grid.calculateScore(
    gameState.grid,
    "player:1",
  );
  gameState.player2Score = GameService.grid.calculateScore(
    gameState.grid,
    "player:2",
  );

  updateClientsViewScores(games[gameIndex]);

  // 3. Vérifier les conditions de fin de partie
  const hasWonByAlignment = GameService.grid.checkWinConditionFive(
    gameState.grid,
    gameState.currentTurn,
  );
  const noMoreTokens =
    gameState.player1Tokens <= 0 || gameState.player2Tokens <= 0;

  if (hasWonByAlignment || noMoreTokens) {
    let winner = gameState.currentTurn;
    if (noMoreTokens && !hasWonByAlignment) {
      winner =
        gameState.player1Score > gameState.player2Score
          ? "player:1"
          : "player:2";
    }

    const winnerSocketId =
      winner === "player:1"
        ? games[gameIndex].player1Socket.id
        : games[gameIndex].player2Socket.id;
    const loserSocketId =
      winner === "player:1"
        ? games[gameIndex].player2Socket.id
        : games[gameIndex].player1Socket.id;

    const gameOverData = {
      winner,
      winnerSocketId,
      loserSocketId,
      player1Score: gameState.player1Score,
      player2Score: gameState.player2Score,
      reason: hasWonByAlignment
        ? "Alignement de 5 !"
        : "Plus de pions disponibles.",
    };

    games[gameIndex].player1Socket.emit("game.end", gameOverData);
    if (games[gameIndex].player2Socket?.emit) {
      games[gameIndex].player2Socket.emit("game.end", gameOverData);
    }
    return true;
  }

  // 4. Si la partie continue : Fin du tour classique
  endTurnAndReset(games[gameIndex]);
  return false;
};

const botPlayTurn = (gameIndex) => {
  const game = games[gameIndex];
  if (!game) return;
  if (game.player2Socket.id !== BOT_SOCKET_ID) return;
  if (game.gameState.currentTurn !== "player:2") return;

  const gameState = game.gameState;

  const applyLockHeuristic = () => {
    const countsByValue = {};
    for (const dice of gameState.deck.dices) {
      if (!dice.value) continue;
      countsByValue[dice.value] = (countsByValue[dice.value] || 0) + 1;
    }

    let bestValue = null;
    let bestCount = 0;
    for (const [value, count] of Object.entries(countsByValue)) {
      if (count > bestCount) {
        bestCount = count;
        bestValue = value;
      }
    }

    // If we have at least a pair, keep it to increase chances of brelan/carré/yam/full
    if (bestValue && bestCount >= 2) {
      gameState.deck.dices = gameState.deck.dices.map((d) =>
        d.value === bestValue
          ? { ...d, locked: true }
          : { ...d, locked: false },
      );
      return;
    }

    // Otherwise, bias toward low sum (<=8): keep 1 and 2 if present
    gameState.deck.dices = gameState.deck.dices.map((d) => {
      if (d.value === "1" || d.value === "2") return { ...d, locked: true };
      return { ...d, locked: false };
    });
  };

  const findPlayableChoice = (combinations) => {
    const playable = combinations.filter((c) =>
      findFirstPlayableCellForChoice(gameState.grid, c.id),
    );

    if (playable.length === 0) return null;

    // Random choice among playable for more variety
    return playable[Math.floor(Math.random() * playable.length)];
  };

  // Up to 3 rolls. Prefer stopping early if a playable choice appears.
  for (let step = 0; step < gameState.deck.rollsMaximum; step++) {
    const isLastRoll =
      gameState.deck.rollsCounter >= gameState.deck.rollsMaximum;

    gameState.deck.dices = GameService.dices.roll(gameState.deck.dices);
    gameState.deck.rollsCounter++;

    if (isLastRoll) {
      gameState.deck.dices = GameService.dices.lockEveryDice(
        gameState.deck.dices,
      );
    }

    const dices = gameState.deck.dices;
    const isSec = !isLastRoll && gameState.deck.rollsCounter === 2;
    const combinations = GameService.choices.findCombinations(
      dices,
      false,
      isSec,
    );
    gameState.choices.availableChoices = combinations;

    const playableChoice = findPlayableChoice(combinations);
    if (playableChoice) {
      gameState.choices.idSelectedChoice = playableChoice.id;
      gameState.grid = GameService.grid.resetcanBeCheckedCells(gameState.grid);
      gameState.grid = GameService.grid.updateGridAfterSelectingChoice(
        playableChoice.id,
        gameState.grid,
      );

      updateClientsViewDecks(game);
      updateClientsViewChoices(game);
      updateClientsViewGrid(game);

      const cell = findFirstPlayableCellForChoice(
        gameState.grid,
        playableChoice.id,
      );
      if (!cell) {
        endTurnAndReset(game);
        return;
      }

      handleGridSelected(gameIndex, cell);
      return;
    }

    if (!isLastRoll) {
      applyLockHeuristic();
    }
  }

  // No playable move after last roll => pass
  endTurnAndReset(game);
};

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const createGame = (player1Socket, player2Socket) => {
  // init objet (game) with this first level of structure:
  // - gameState : { .. evolutive object .. }
  // - idGame : just in case ;)
  // - player1Socket: socket instance key "joueur:1"
  // - player2Socket: socket instance key "joueur:2"
  const newGame = GameService.init.gameState();
  newGame["idGame"] = uniqid();
  newGame["player1Socket"] = player1Socket;
  newGame["player2Socket"] = player2Socket;

  // push game into 'games' global array
  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  // just notifying screens that game is starting
  games[gameIndex].player1Socket.emit(
    "game.start",
    GameService.send.forPlayer.viewGameState("player:1", games[gameIndex]),
  );
  games[gameIndex].player2Socket.emit(
    "game.start",
    GameService.send.forPlayer.viewGameState("player:2", games[gameIndex]),
  );

  // we update views
  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewScores(games[gameIndex]); // <--- Ajoutez ceci

  // timer every second
  const gameInterval = setInterval(() => {
    // timer variable decreased
    games[gameIndex].gameState.timer--;

    // emit timer to both clients every seconds
    updateClientsViewTimers(games[gameIndex]);

    // if timer is down to 0, we end turn
    if (games[gameIndex].gameState.timer === 0) {
      // switch currentTurn variable
      games[gameIndex].gameState.currentTurn =
        games[gameIndex].gameState.currentTurn === "player:1"
          ? "player:2"
          : "player:1";

      // reset timer
      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

      // reset deck / choices / grid states
      games[gameIndex].gameState.deck = GameService.init.deck();
      games[gameIndex].gameState.choices = GameService.init.choices();
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(
        games[gameIndex].gameState.grid,
      );

      // reset views also
      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
      updateClientsViewGrid(games[gameIndex]);

      // BOT auto-play if needed
      setTimeout(() => botPlayTurn(gameIndex), 200);
    }
  }, 1000);

  // remove intervals at deconnection
  player1Socket.on("disconnect", () => {
    clearInterval(gameInterval);
  });

  player2Socket.on("disconnect", () => {
    clearInterval(gameInterval);
  });
};

const newPlayerInQueue = (socket) => {
  queue.push(socket);

  // 'queue' management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  } else {
    socket.emit("queue.added", GameService.send.forPlayer.viewQueueState());
  }
};

// 1. Ajoutez cette fonction avec les autres "EMITTER METHODS"
const updateClientsViewScores = (game) => {
  game.player1Socket.emit(
    "game.scores.view-state",
    GameService.send.forPlayer.scoresViewState("player:1", game.gameState),
  );
  game.player2Socket.emit(
    "game.scores.view-state",
    GameService.send.forPlayer.scoresViewState("player:2", game.gameState),
  );
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on("connection", (socket) => {
  console.log(`[${socket.id}] socket connected`);

  socket.on("queue.join", () => {
    console.log(`[${socket.id}] new player in queue `);
    newPlayerInQueue(socket);
  });

  socket.on("vsbot.start", () => {
    const existingGameIndex = GameService.utils.findGameIndexBySocketId(
      games,
      socket.id,
    );
    if (existingGameIndex !== -1) {
      return;
    }

    const queueIndex = queue.findIndex((s) => s.id === socket.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }

    console.log(`[${socket.id}] start VsBot game`);
    createGameVsBot(socket);
  });

  socket.on("queue.leave", () => {
    const queueIndex = queue.findIndex((s) => s.id === socket.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }

    socket.emit("queue.left", GameService.send.forPlayer.viewQueueState());
  });

  socket.on("game.dices.roll", () => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(
      games,
      socket.id,
    );

    if (
      games[gameIndex].gameState.deck.rollsCounter <
      games[gameIndex].gameState.deck.rollsMaximum
    ) {
      // si ce n'est pas le dernier lancé

      // gestion des dés
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(
        games[gameIndex].gameState.deck.dices,
      );
      games[gameIndex].gameState.deck.rollsCounter++;

      // gestion des combinaisons
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = false;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(
        dices,
        isDefi,
        isSec,
      );
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // gestion des vues
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    } else {
      // si c'est le dernier lancer

      // gestion des dés
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(
        games[gameIndex].gameState.deck.dices,
      );
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(
        games[gameIndex].gameState.deck.dices,
      );

      // gestion des combinaisons
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = Math.random() < 0.15;
      const isSec = false;

      // gestion des choix
      const combinations = GameService.choices.findCombinations(
        dices,
        isDefi,
        isSec,
      );
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // check de la grille si des cases sont disponibles
      const isAnyCombinationAvailableOnGridForPlayer =
        GameService.grid.isAnyCombinationAvailableOnGridForPlayer(
          games[gameIndex].gameState,
        );
      // Si aucune combinaison n'est disponible après le dernier lancer OU si des combinaisons sont disponibles avec les dés mais aucune sur la grille
      if (
        combinations.length === 0 ||
        !isAnyCombinationAvailableOnGridForPlayer
      ) {
        endTurnAndReset(games[gameIndex]);

        // BOT auto-play if needed
        setTimeout(() => botPlayTurn(gameIndex), 200);
        return;
      }

      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }
  });

  socket.on("game.dices.lock", (idDice) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(
      games,
      socket.id,
    );
    const indexDice = GameService.utils.findDiceIndexByDiceId(
      games[gameIndex].gameState.deck.dices,
      idDice,
    );

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked =
      !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on("game.choices.selected", (data) => {
    // gestion des choix
    const gameIndex = GameService.utils.findGameIndexBySocketId(
      games,
      socket.id,
    );
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    // gestion de la grid
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(
      games[gameIndex].gameState.grid,
    );
    games[gameIndex].gameState.grid =
      GameService.grid.updateGridAfterSelectingChoice(
        data.choiceId,
        games[gameIndex].gameState.grid,
      );

    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  // Dans index.js, remplacez le contenu de socket.on('game.grid.selected')

  socket.on("game.grid.selected", (data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(
      games,
      socket.id,
    );
    const ended = handleGridSelected(gameIndex, data);
    if (ended) return;

    // BOT auto-play if needed
    setTimeout(() => botPlayTurn(gameIndex), 200);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
  });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get("/", (req, res) => res.sendFile("index.html"));

http.listen(3000, function () {
  console.log("listening on *:3000");
});
