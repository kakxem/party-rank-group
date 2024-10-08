export enum Role {
  ADMIN = "ADMIN",
  USER = "PLAYER",
}

export interface Player {
  id: string;
  name: string;
  active: boolean;
  role: Role;
}

export interface PlayerScore {
  player: string;
  score: number;
}

export interface Item {
  id: string;
  name: string;
  link: string;
  createdBy: string;
  score: PlayerScore[];
}
export type ResultItem = Item & { averageScore: number };
export enum Scene {
  MAIN = "main",
  LOBBY = "lobby",
  GAME = "game",
  RESULT = "result",
}

export enum Messages {
  UPDATE_CLIENT = "updateClient",
  UPDATE_SERVER = "updateServer",
  UPDATE_ROOM_NAME = "updateRoomName",
  START_GAME = "startGame",
  ADD_SCORE = "addScore",
  ADD_ITEM = "addItem",
  IMPORT_LIST = "importList",
  DELETE_ITEM = "deleteItem",
  ERROR = "error",
}

export type ConnectionData = {
  player: {
    id: string;
    name: string;
  };
  roomCode: string;
  join?: boolean;
};

export type State = {
  actualItem: number;
  executingTimeout: boolean;
};

export interface Game {
  id?: string;
  name?: string;
  scene: Scene;
  players: Player[];
  list: Item[];
  state: State;
}
