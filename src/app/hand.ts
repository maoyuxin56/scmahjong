import { Tile } from "./tile";

export class Hand {
  melds: Tile[][];
  eye: Tile[];

  constructor() {
    this.melds = [];
    this.eye = [];
  }

  public getAllTiles(): Tile[] {
    let _tiles: Tile[] = [];
    _tiles.push(...this.eye);
    for (const meld of this.melds) {
      _tiles.push(...meld);
    }
    return _tiles;
  }

}
