import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { staticServer } from './staticServer.js';
import crypto from 'crypto';

const { PORT = 8080 } = process.env;

let activeGame;

class Game {
  /** possible game states. Mostly for validating
   *  the changing of the game's state. */
  #gameStates;
  /** The current state of the game */
  roomId;

  /** Players that have joined (ordered) */
  players;

  constructor() {
    this.#gameStates = [
      "WAITING", // A new game is started, players may join.
      "IN_PROGRESS", // game has started.
    ];
    this.gameState = "WAITING";
    /** 4-digit code used to find a game and join it */
    this.roomId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    this.players = [];
  }
  set gameState(state) {
    if (!this.#gameStates.includes(state)) {
      throw new Error("Invalid State")
    }
    this._gameState = state;
  }
  get gameState() {
    return this._gameState;
  }

  addPlayer(player) {
    this.players.push(player)
  }

  toString() {
    const game = {
      gameState: this.gameState,
      roomId: this.roomId,
      players: this.players.map(p => p.toString()),
    }
  }

}

class Player {
  /** An id that is held by the browser and sent on each
   * request, to keep track of a unique player */
  id;
  /** user-provided name. Displayed in-game */
  name;

  /** game-based data, score is points */
  score;

  constructor(name) {
    this.id = crypto.randomBytes(8).toString("hex");
    this.name = name;
    this.score = 0;
  }
}


const server = createServer((req, res) => {
  console.log('New request!', { path: req.url  });

  staticServer(req, res);
});

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('New connection opened');

  ws.on('message', function message(buffer) {
    const { action, data } = JSON.parse(buffer.toString('utf-8'));
    console.log(`New Message: ${action}`);

    // All the possible actions //
    
    /** getGame returns the active game, or an empty string if
     *  no game is active */
    if (action === "getGame") {
      ws.send(JSON.stringify({ action: "res:getGame", data: activeGame ?? "" }));
    }
  });
});

server.listen(PORT);
