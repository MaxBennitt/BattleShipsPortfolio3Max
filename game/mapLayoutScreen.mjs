import { GAME_BOARD_DIM } from "../consts.mjs";
import { ANSI } from "../utils/ansi.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import units from "./units.mjs";
import KeyBoardManager from "../utils/io.mjs";
import { create2DArrayWithFill } from "../utils/array.mjs"

ANSI.SEA__AND_SHIP = '\x1b[38;5;83;48;5;39m';
ANSI.SEA = '\x1b[48;5;39m';

function createMapLayoutScreen() {
    const MapLayout = {
        player: null,
        isDrawn: false,
        next: null,
        transitionTo: null,
        cursorColumn: 0,
        cursorRow: 0,
        currentShipIndex: 0,
        isHorizontal: false,
        map: create2DArrayWithFill(GAME_BOARD_DIM),
        ships: [...Object.values(units)],
        placedShips: [],
        transitionFn: null,

        init: function (player, transitionFn) {
            this.player = player;
            this.transitionFn = transitionFn;
        },

        canPlaceShip: function () {
            const ship = this.ships[this.currentShipIndex];
            const size = ship.size;
        
            if (this.isHorizontal && this.cursorColumn + size > GAME_BOARD_DIM) {
                return false;
            }
            if (!this.isHorizontal && this.cursorRow + size > GAME_BOARD_DIM) {
                return false;
            }
        
            try {
                for (let i = 0; i < size; i++) {
                    const column = this.isHorizontal ? this.cursorColumn + i : this.cursorColumn;
                    const row = this.isHorizontal ? this.cursorRow : this.cursorRow + i;
                    
                    if (row >= GAME_BOARD_DIM || column >= GAME_BOARD_DIM) {
                        return false;
                    }
                    
                    if (this.map[row][column] !== 0) {
                        return false;
                    }
                }
            } catch (error) {
                return false;
            }
        
            return true;
        },

        placeShip: function () {
            const ship = this.ships[this.currentShipIndex];
            for (let i = 0; i < ship.size; i++) {
                const column = this.isHorizontal ? this.cursorColumn + i : this.cursorColumn;
                const row = this.isHorizontal ? this.cursorRow : this.cursorRow + i;
                this.map[row][column] = ship.symbole;
            }

            this.placedShips.push({
                ...ship,
                x: this.cursorColumn,
                y: this.cursorRow,
                isHorizontal: this.isHorizontal
            });
        },

        isPositionInShipPreview: function (column, row) {
            if (this.currentShipIndex >= this.ships.length) return false;

            const ship = this.ships[this.currentShipIndex];
            if (this.isHorizontal) {
                return row === this.cursorRow &&
                    column >= this.cursorColumn &&
                    column < this.cursorColumn + ship.size;
            } else {
                return column === this.cursorColumn &&
                    row >= this.cursorRow &&
                    row < this.cursorRow + ship.size;
            }
        },

        update: function (dt) {
            let newCursorRow = this.cursorRow;
            let newCursorColumn = this.cursorColumn;
            const ship = this.ships[this.currentShipIndex];
            const size = ship ? ship.size : 1;

            if (KeyBoardManager.isUpPressed()) {
                newCursorRow = Math.max(0, this.cursorRow - 1);
            }
            if (KeyBoardManager.isDownPressed()) {
                const maxRow = this.isHorizontal ? GAME_BOARD_DIM - 1 : GAME_BOARD_DIM - size;
                newCursorRow = Math.min(maxRow, this.cursorRow + 1);
            }
            if (KeyBoardManager.isLeftPressed()) {
                newCursorColumn = Math.max(0, this.cursorColumn - 1);
            }
            if (KeyBoardManager.isRightPressed()) {
                const maxColumn = this.isHorizontal ? GAME_BOARD_DIM - size : GAME_BOARD_DIM - 1;
                newCursorColumn = Math.min(maxColumn, this.cursorColumn + 1);
            }

            if (newCursorRow !== this.cursorRow || newCursorColumn !== this.cursorColumn) {
                this.cursorRow = newCursorRow;
                this.cursorColumn = newCursorColumn;
                this.isDrawn = false;
            }

            if (KeyBoardManager.isRotatePressed()) {
                const wouldFitAfterRotation = !this.isHorizontal ? 
                    (this.cursorColumn + size <= GAME_BOARD_DIM) : 
                    (this.cursorRow + size <= GAME_BOARD_DIM);
        
                if (wouldFitAfterRotation) {
                    this.isHorizontal = !this.isHorizontal;
                    this.isDrawn = false;
                }
            }

            if (KeyBoardManager.isEnterPressed() && this.currentShipIndex < this.ships.length) {
                this.isDrawn = false;
                if (this.canPlaceShip()) {
                    this.placeShip();
                    this.currentShipIndex++;
                    this.cursorColumn = 0;
                    this.cursorRow = 0;
                    if (this.currentShipIndex < this.ships.length) {
                        this.ship = this.ships[this.currentShipIndex];
                    } else {
                        this.next = this.transitionFn();
                        this.transitionTo = "next state";
                    }
                }
            }
        },

        draw: function (dr) {
            if (!this.isDrawn) {
                clearScreen();
                print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}Ship Placement Phase\n\n${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
            }

            let output = '  ';
            for (let i = 0; i < GAME_BOARD_DIM; i++) {
                output += ` ${String.fromCharCode(65 + i)}`;
            }
            output += '\n';
        
            for (let y = 0; y < GAME_BOARD_DIM; y++) {
                output += `${String(y + 1).padStart(2, ' ')} `;
        
                for (let x = 0; x < GAME_BOARD_DIM; x++) {
                    const cell = this.map[y][x];
                    const isInShipPreview = this.isPositionInShipPreview(x, y);
        
                    if (isInShipPreview && this.canPlaceShip()) {
                        output += ANSI.COLOR.GREEN + '█' + ANSI.RESET + ' ';
                    } else if (isInShipPreview) {
                        output += ANSI.COLOR.WHITE + '█' + ANSI.RESET + ' ';
                    }
                    else if (cell !== 0) {
                        output += ANSI.SEA__AND_SHIP + cell + ANSI.RESET + ' ';
                    } else {
                        output += ANSI.SEA + ' ' + ANSI.RESET + ' ';
                    }
                }
                output += `${y + 1}\n`;
            }
        
            output += '  ';
            for (let i = 0; i < GAME_BOARD_DIM; i++) {
                output += ` ${String.fromCharCode(65 + i)}`;
            }
            output += '\n\n';
        
            if (!this.isDrawn) {
                output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}Controls:${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
                output += 'Arrow keys: Move cursor\n';
                output += 'R: Rotate ship\n';
                output += 'Enter: Place ship\n';
        
                output += `\n${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}Ships to place:${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
                this.ships.forEach((ship, index) => {
                    const status = index < this.currentShipIndex ? '✓' :
                        index === this.currentShipIndex ? '>' : ' ';
                    output += `${status} ${ship.id} (${ship.size} spaces)\n`;
                });
            }
            print(ANSI.CURSOR_HOME + output);
            
            this.isDrawn = true;
        }
    };

    return MapLayout;
}

export default createMapLayoutScreen;