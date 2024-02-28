export enum tileSuites {
  Bing, // -> 0
  Tiao, // -> 1
  Wan, // -> 2
}

export interface Tile {
  num: number;
  suit: tileSuites;
  asset?: String;
}
