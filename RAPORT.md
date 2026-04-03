# Rapport — Yam Master (live-demo)

Ce document décrit les fonctionnalités implémentées, l’architecture et la manière de lancer/valider le projet en local.

## 1) Prérequis

- Node.js (LTS recommandé)
- Un navigateur (pour Expo Web) ou un émulateur Android / téléphone physique

## 2) Lancement du projet (local)

### 2.1 Backend (Socket.IO Game Manager)

Dans un terminal :

1. Aller dans le dossier `backend/`
2. Installer les dépendances
3. Démarrer le serveur

Commande(s) :

- `npm install`
- `npm run start`

Le serveur écoute sur :

- `http://localhost:3000`

### 2.2 Frontend (Expo / React Native)

Dans un autre terminal à la racine du projet :

- `npm install`
- `npx expo start`

#### Configuration de l’endpoint Socket.IO

Le point de connexion Socket est défini dans `app/contexts/socket.context.js` :

- Web : `http://localhost:3000`
- Mobile : une IP locale (à adapter à votre réseau)

## 3) Architecture applicative

### 3.1 Frontend

- **Entrée** : `App.js`
- **Navigation** : `@react-navigation/stack`
- **Contexte Socket** : `app/contexts/socket.context.js`
- **Écrans** :
  - `app/screens/home.screen.js`
  - `app/screens/online-game.screen.js`
  - `app/screens/vs-bot-game.screen.js`
- **Controllers** (gestion évènements de partie) :
  - `app/controllers/online-game.controller.js`
  - `app/controllers/vs-bot-game.controller.js`
- **UI Board** : `app/components/board/board.component.js`
  - Sous-composants : timers / decks / choices / grid

### 3.2 Backend

- **Entrée** : `backend/index.js`
- **Moteur de jeu** : `backend/services/game.service.js`
  - Initialisation (`init.*`)
  - Génération des view-states (`send.forPlayer.*`)
  - Dés (`dices.*`)
  - Combinaisons (`choices.findCombinations`)
  - Grille / score / victoire (`grid.*`)

## 4) Contrat Socket.IO (évènements)

### 4.1 Matchmaking Online

- **Client → Server**
  - `queue.join`
  - `queue.leave`

- **Server → Client**
  - `queue.added`
  - `queue.left`
  - `game.start`

### 4.2 Partie (Online + VsBot)

- **Client → Server**
  - `game.dices.roll`
  - `game.dices.lock`
  - `game.choices.selected`
  - `game.grid.selected`

- **Server → Client**
  - `game.timer`
  - `game.deck.view-state`
  - `game.choices.view-state`
  - `game.grid.view-state`
  - `game.scores.view-state`
  - `game.end`

### 4.3 VsBot

- **Client → Server**
  - `vsbot.start`

## 5) Fonctionnalités implémentées (TP Finale)

### 5.1 Finition du moteur de jeu

#### 5.1.1 Scores (alignements 3 / 4)

- Calcul des points :
  - Alignement de 3 pions : **+1**
  - Alignement de 4 pions : **+2**
- Implémentation : `GameService.grid.calculateScore(grid, playerKey)`
- Mise à jour des scores déclenchée à chaque pose sur la grille (`game.grid.selected`).

#### 5.1.2 Tokens (12 pions par joueur)

- Chaque joueur démarre avec **12 tokens**.
- À chaque pion posé : décrément du compteur du joueur.
- Implémentation : `GameService.grid.selectCell(..., gameState)` décrémente `player1Tokens` / `player2Tokens`.

#### 5.1.3 Conditions de fin de partie

La partie s’arrête si :

- Un joueur réalise un alignement de **5** : victoire immédiate.
- Ou si un des joueurs n’a plus de tokens : le vainqueur est celui avec le meilleur score.

Implémentation :

- `GameService.grid.checkWinConditionFive(grid, playerKey)`
- Contrôle dans `backend/index.js` lors de `game.grid.selected`
- Emission de `game.end` aux clients avec :
  - `winner` (`player:1` / `player:2`)
  - `winnerSocketId` / `loserSocketId`
  - `player1Score` / `player2Score`
  - `reason`

#### 5.1.4 Écran de fin de partie (récap)

- **Online** : affichage dans `app/controllers/online-game.controller.js`
- **VsBot** : affichage dans `app/controllers/vs-bot-game.controller.js`

Contenu :

- Gagnant / perdant
- Raison de fin
- Scores finaux
- Bouton retour menu

### 5.2 Finalisation du mode Online

- File d’attente via `queue.join`
- Sortie de file via `queue.leave`
- Démarrage automatique de partie dès que 2 joueurs sont en queue
- Synchronisation des vues par view-states (timer / deck / choices / grid / scores)

#### Gestion du cas “combinaison non jouable sur la grille”

- Après le dernier lancer, si aucune combinaison n’est jouable sur la grille, le tour est passé automatiquement.
- Implémentation : check `isAnyCombinationAvailableOnGridForPlayer` puis `endTurnAndReset(...)`.

### 5.3 Mode VsBot

#### Principe

- Le client démarre une partie VsBot via `vsbot.start`.
- Le serveur crée une partie `player:1` (humain) vs `player:2` (BOT).
- Le bot joue automatiquement quand c’est son tour.

#### Comportement du bot

- Le bot tente de jouer sur un tour complet (jusqu’à 3 lancers).
- Il sélectionne une combinaison **jouable sur la grille** (case libre existante).
- Amélioration : heuristique de verrouillage (conserver une paire / favoriser `≤8`) pour augmenter la probabilité de poser.

## 6) Checklist de validation (tests manuels)

### Online (2 navigateurs)

1. Ouvrir 2 clients
2. Cliquer sur **Jouer en ligne** des deux côtés
3. Vérifier : `game.start` arrive, la grille/timer s’affichent
4. Jouer plusieurs tours :
   - `Roll` / verrouillage de dés
   - sélection d’une combinaison
   - pose sur la grille
5. Vérifier :
   - timer alterne correctement
   - scores/tokens se mettent à jour

### Fin de partie

- Provoquer un alignement de 5 : vérifier `game.end` + écran recap
- Provoquer épuisement de tokens : vérifier `game.end` + winner par score

### VsBot

1. Cliquer sur **Jouer contre le bot**
2. Jouer plusieurs tours
3. Vérifier que le bot enchaîne ses tours et pose régulièrement
4. Vérifier l’écran de fin avec scores cohérents

## 7) Limitations / améliorations possibles

- Ajout d’une base de données (authentification + historique + sauvegarde)
- Replay tour par tour
- Amélioration UI/UX (animations, sons, thème)




