export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface GameState {
  snake: Coordinate[];
  food: Coordinate;
  direction: Direction;
  status: GameStatus;
  score: number;
  highScore: number;
  speed: number;
}