import { Component, signal, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Tile, tileSuites } from "./tile";
import { CommonModule, NgFor } from "@angular/common";
import { Hand } from "./hand";
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from "angular-animations";

const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SUITS = ["b", "t", "w"];
const WINS = [
  "mao",
  "dui_dui",
  "qing_yi_se",
  "dai_19",
  "7_dui",
  "qing_dui",
  "long_7_dui",
  "qing_7_dui",
  "qing_long_7_dui",
];

function getAllTiles(): Tile[] {
  let tilesSet: Tile[] = [];
  for (let suit = 0; suit < 3; suit++) {
    for (let num = 1; num < 10; num++) {
      for (let i = 0; i < 4; i++) {
        // each tile has 4 occurences
        let tile: Tile = {
          num: num,
          suit: suit,
        };
        tile.asset = getTileAsset(tile);
        tilesSet = tilesSet.concat(tile);
      }
    }
  }
  return tilesSet;
}
const ALLTILES = getAllTiles();

function dedupTiles(tiles: Tile[]): Tile[] {
  const _tiles: Tile[] = JSON.parse(JSON.stringify(tiles));
  const _dedup: Tile[] = [];
  for (let i = 0; i < _tiles.length; i = i + 4) {
    _dedup.push(_tiles[i]);
  }
  return _dedup;
}
const BINGTILES = dedupTiles(ALLTILES.slice(0, 36));
const TIAOTILES = dedupTiles(ALLTILES.slice(36, 72));
const WANTILES = dedupTiles(ALLTILES.slice(72, 108));

let ALLPLACEMENTS: any[] = [];
buildPossiblePlacements(
  ALLPLACEMENTS,
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  3,
  [],
  0
);

function getRandomNum(endInclude: number = 9): number {
  return Math.floor(Math.random() * endInclude) + 1;
}

function getRandomSuit(): number {
  return Math.floor(Math.random() * 3);
}

function getSameTileWithCount(
  count: number,
  allowedSuits: Set<number>
): Tile[] {
  let tiles: Tile[] = [];
  const _num = getRandomNum();
  const _suit = pickRandomFromList(Array.from(allowedSuits));
  for (let i = 0; i < count; i++) {
    let _tile: Tile = {
      num: _num,
      suit: _suit,
    };
    _tile.asset = getTileAsset(_tile);
    tiles.push(_tile);
  }
  return tiles;
}

function getDoublet(allowedSuits: Set<number>): Tile[] {
  return getSameTileWithCount(2, allowedSuits);
}

function getTripletAAA(allowedSuits: Set<number>): Tile[] {
  return getSameTileWithCount(3, allowedSuits);
}

function getTripletABC(allowedSuits: Set<number>): Tile[] {
  let tiles: Tile[] = [];
  let _num = getRandomNum(6);
  const _suit = pickRandomFromList(Array.from(allowedSuits));
  for (let i = 0; i < 3; i++) {
    let _tile: Tile = {
      num: _num + i,
      suit: _suit,
    };
    _tile.asset = getTileAsset(_tile);
    tiles.push(_tile);
  }
  return tiles;
}

// function getRandomTiles(): Tile[] {
//   let numSet = getRandomSet(14);
//   let tileSet = getAllTiles();
//   let tiles: Tile[] = [];
//   for (let currNum of numSet) {
//     tiles.push(tileSet[currNum]);
//   }
//   tiles = sortTiles(tiles);
//   return tiles;
// }

function getRandomSet(total: number): Set<number> {
  let numSet = new Set<number>();
  while (numSet.size < total) {
    numSet.add(Math.floor(Math.random() * 108));
  }
  return numSet;
}

function sortTiles(tiles: Tile[]): Tile[] {
  tiles.sort(function (a, b) {
    // return a.suit - b.suit || a.num - b.num;
    return a.suit - b.suit;
  });
  return tiles;
}

function sortTilesByNum(tiles: Tile[]): Tile[] {
  tiles.sort(function (a, b) {
    // return a.suit - b.suit || a.num - b.num;
    return a.num - b.num;
  });
  return tiles;
}

function pickRandomFromList(list: any[]): any {
  const random = Math.floor(Math.random() * list.length);
  return list[random];
}

function generateTilesFromPatterns(
  patterns: string[],
  allowedSuits: Set<number>
): Tile[][] {
  let _tiles: Tile[][] = [];
  for (const _p of patterns) {
    switch (_p) {
      case "AA":
        _tiles.push(getDoublet(allowedSuits));
        break;
      case "AAA":
        _tiles.push(getTripletAAA(allowedSuits));
        break;
      case "ABC":
        _tiles.push(getTripletABC(allowedSuits));
        break;
      default:
        console.error("unknown pattern");
        break;
    }
  }
  return _tiles;
}

function checkIfIsValidSet(tiles: Tile[]): boolean {
  let map = new Map<String, number>();
  for (const tile of tiles) {
    if (map.has(tile.asset!)) {
      map.set(tile.asset!, map.get(tile.asset!)! + 1);
      if (map.get(tile.asset!)! > 4) {
        // console.log("invalid set!", tiles);
        return false;
      }
    } else {
      map.set(tile.asset!, 1);
    }
  }
  return true;
}

function getWinHand(): Tile[] {
  // simplest win set:
  // AA + 4 * AAA/ABC
  let _setPattern: string[] = [];
  let _tiles: Tile[] = [];
  let hand: Hand = new Hand();

  // 缺一门
  let _allowedSuits = new Set<number>();
  while (_allowedSuits.size < 2) {
    _allowedSuits.add(pickRandomFromList([0, 1, 2]));
  }

  for (let i = 0; i < 4; i++) {
    _setPattern.push(pickRandomFromList(["AAA", "ABC"]));
  }

  // make sure it is a valid set
  let isValid = false;
  while (!isValid) {
    hand.eye = generateTilesFromPatterns(["AA"], _allowedSuits)[0];
    hand.melds = generateTilesFromPatterns(_setPattern, _allowedSuits);
    isValid = checkIfIsValidSet(hand.getAllTiles());
  }

  segregateWinSet(hand.getAllTiles());
  return sortTiles(hand.getAllTiles());
}

function segregateWinSet(tiles: Tile[]): Tile[][] {
  // input 14 tiles, output 2D array of shape AA + 4 * AAA/ABC
  let _melds: Tile[][] = [];

  let _considered_eye_tile: String[] = [];
  for (let i = 0; i < tiles.length; i++) {
    let _meldsCandidate: Tile[] = [];
    let _eyes: number[] = [];
    if (_considered_eye_tile.includes(tiles[i].asset!)) {
      continue;
    }
    _eyes.push(i);
    _considered_eye_tile.push(tiles[i].asset!);

    // eyes loop
    for (let j = 0; j < tiles.length; j++) {
      if (j === i) {
        continue;
      }
      if (tiles[i].asset === tiles[j].asset) {
        _eyes.push(j);
      }
    }
    // end early if _eyes can't be found
    if (_eyes.length < 2) {
      continue;
    }

    // melds loop
    let _eyeSkipped = 0;
    for (let k = 0; k < tiles.length; k++) {
      // if tile is used as eye, skip
      if (_eyes.includes(k) && _eyeSkipped < 2) {
        _eyeSkipped++;
        continue;
      }
      _meldsCandidate.push(tiles[k]);
    }
    // console.log("eyes: ", _eyes);
    // console.log(_meldsCandidate);

    // group into proper melds if any
    const allProperMelds = tryGroupIntoProperMelds(_meldsCandidate);
    if (allProperMelds.length === 0) {
      // console.log("no proper melds when eyes are ", tiles[_eyes[0]]);
    } else {
      // console.log("proper melds when eye is ", tiles[_eyes[0]]);
      // console.log(allProperMelds);
      _melds = allProperMelds[0];
      _melds.push([tiles[_eyes[0]], tiles[_eyes[1]]]);
    }
  }

  return _melds;
}

function tryGroupIntoProperMelds(tiles: Tile[]): Tile[][][] {
  let result: Tile[][][] = [];
  for (let i = 0; i < ALLPLACEMENTS.length; i++) {
    const _p = ALLPLACEMENTS[i];

    // under each _p placement, there are 4 groups of tile index
    // each group has 3 tile index.
    let _proper_melds: Tile[][] = [];
    for (let j = 0; j < _p.length; j++) {
      // all three tiles in the group must be of same suit
      const t0 = tiles[_p[j][0]];
      const t1 = tiles[_p[j][1]];
      const t2 = tiles[_p[j][2]];
      if (t0.suit !== t1.suit || t1.suit !== t2.suit) {
        break;
      }
      if (t0.num === t1.num && t1.num === t2.num) {
        _proper_melds.push([t0, t1, t2]); // AAA case
      }

      let _temp = [t0, t1, t2];
      sortTilesByNum(_temp);
      if (
        _temp[0].num + 1 === _temp[1].num &&
        _temp[1].num + 1 === _temp[2].num
      ) {
        _proper_melds.push([t0, t1, t2]); // ABC case
      }
    }
    if (_proper_melds.length === 4) {
      result.push(_proper_melds);
      // console.log("proper melds found: ", _proper_melds);
      break; // just need one
    } else {
      // console.log('not a proper melds combination')
    }
  }
  return result;
}

function buildPossiblePlacements(
  result: any[],
  input_array: number[],
  sub_size: number = 3,
  curr_array: any[],
  curr_idx: number = 0
) {
  // first entry
  if (curr_array.length === 0) {
    for (let i = 0; i < input_array.length / sub_size; i++) {
      curr_array.push([]);
    }
  }

  // main logic
  // for each available sub array, push _curr, then continue recursion
  // avaiable sub are length > 1 and the first one with length === 0

  const _curr = input_array[curr_idx];
  let firstEmptySubUsed = false;

  for (let j = 0; j < curr_array.length; j++) {
    if (curr_array[j].length === sub_size) {
      continue;
    }
    if (firstEmptySubUsed) {
      continue;
    }

    if (curr_array[j].length === 0) {
      firstEmptySubUsed = true;
    }

    // deep copy
    let new_array = JSON.parse(JSON.stringify(curr_array));
    new_array[j].push(_curr);

    if (curr_idx + 1 === input_array.length) {
      // end reached.
      // console.log(new_array);
      result.push(new_array);
    } else {
      buildPossiblePlacements(
        result,
        input_array,
        sub_size,
        new_array,
        curr_idx + 1
      );
    }
  }
}

function getTileAsset(tile: Tile): String {
  return "assets/" + String(tile.num) + SUITS[tile.suit] + ".png";
}

function findPossibleWinTiles(tiles: Tile[]): Map<String, Tile[][]> {
  let possibles: Map<String, Tile[][]> = new Map();
  let _suits = new Set();
  for (let tile of tiles) {
    _suits.add(tile.suit);
  }
  // console.log(_suits);
  for (const _s of _suits) {
    let _check_tiles: Tile[] = [];
    switch (_s) {
      case 0:
        _check_tiles = BINGTILES;
        break;
      case 1:
        _check_tiles = TIAOTILES;
        break;
      case 2:
        _check_tiles = WANTILES;
        break;
      default:
        break;
    }
    for (let i = 0; i < _check_tiles.length; i++) {
      const _t = _check_tiles[i];
      let _try_tiles: Tile[] = JSON.parse(JSON.stringify(tiles));
      _try_tiles.push(_t);
      // console.log("trying ", _t);
      const res = segregateWinSet(_try_tiles);
      if (res.length > 0) {
        // console.log(res);
        possibles.set(_t.asset!, res);
      }
    }
  }

  return possibles;
}

function removeRandomTile(tiles: Tile[]): Tile[] {
  const idx = Math.floor(Math.random() * tiles.length);
  let removed: Tile[] = JSON.parse(JSON.stringify(tiles));
  removed.splice(idx, 1);
  return removed;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgFor, CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  protected readonly isDev = signal(false);
  protected readonly tilesWinningHand = signal(getWinHand());
  protected readonly tilesRemovedOne = signal(
    sortTiles(removeRandomTile(this.tilesWinningHand()))
  );
  protected readonly mapPossibleWinnings = signal(
    findPossibleWinTiles(this.tilesRemovedOne())
  );
  protected readonly assetsPossibleWinnings = signal(
    Array.from(this.mapPossibleWinnings().keys())
  );

  protected readonly groupedHandPossibleWinnings = signal(
    Array.from(this.mapPossibleWinnings().values())
  );

  protected readonly suitTiles = signal([BINGTILES, TIAOTILES, WANTILES]);
  protected readonly selectedTiles = signal(new Set());
  protected readonly gameState = signal(0); // 0-playing,1-won
  protected readonly messages = signal({
    "MahJong Practice": "MahJong Practice",
    "Hand tiles": "Hand tiles",
    "Please choose winning tile": "Please choose winning tile",
  });

  title = "scmahjong";

  constructor() {
    this.resetGame();
    const lang = navigator.language;
    console.log(lang)
    if (lang.includes("zh")) {
      // manually doing i18n
      this.messages.set({
        "MahJong Practice": "下叫练习",
        "Hand tiles": "手牌",
        "Please choose winning tile": "选择胡牌",
      });
    }
  }

  resetGame() {
    this.tilesWinningHand.set(getWinHand());
    this.tilesRemovedOne.set(
      sortTiles(removeRandomTile(this.tilesWinningHand()))
    );
    this.mapPossibleWinnings.set(findPossibleWinTiles(this.tilesRemovedOne()));
    this.assetsPossibleWinnings.set(
      Array.from(this.mapPossibleWinnings().keys())
    );
    this.groupedHandPossibleWinnings.set(
      Array.from(this.mapPossibleWinnings().values())
    );
    this.selectedTiles.set(new Set());
    this.gameState.set(0);
  }

  onClickTile(e: any, t: Tile): any {
    if (this.gameState() === 1) {
      return;
    }
    let ele: HTMLElement = e.target;
    if (!this.assetsPossibleWinnings().includes(t.asset!)) {
      if (!ele.className.includes("shake")) {
        const old = ele.className;
        ele.className = ele.className + " shake";
        setTimeout(() => {
          ele.className = old;
        }, 300);
      }
      return;
    }
    // console.log(t)
    this.selectedTiles.update((v) => {
      if (v.has(t.asset)) {
        v.delete(t.asset);
      } else {
        v.add(t.asset);
      }
      return v;
    });
    if (this.selectedTiles().size === this.assetsPossibleWinnings().length) {
      this.gameState.set(1);
    }
    // console.log(this.selectedTiles());
  }
}
