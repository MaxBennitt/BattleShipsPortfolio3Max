import { GAME_BOARD_DIM } from "../consts.mjs";
import { ANSI } from "../utils/ansi.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import units from "./units.mjs";
import KeyBoardManager from "../utils/io.mjs";
import { create2DArrayWithFill } from "../utils/array.mjs"
import { getText } from "../utils/languages.mjs";

ANSI.SEA__AND_SHIP = '\x1b[38;5;83;48;5;39m';
ANSI.SEA = '\x1b[48;5;39m';

const DEFAULT_VALUES = {
    ZERO: 0,
    ONE: 1,
    TWO: 2
};

const ASCII = {
    CHAR_CODE_A: 65
};

const STRING_LITERALS = {
    EMPTY: '',
    SPACE: ' ',
    NEW_LINE: '\n',
    DOUBLE_NEW_LINE: '\n\n',
    COLON: ':',
    CURSOR: '█',
    CHECK_MARK: '✓',
    ARROW: '>',
    OPEN_PAREN: '(',
    CLOSE_PAREN: ')'
};

const TEXT_KEYS = {
    SHIP_PLACEMENT_PHASE: 'shipPlacementPhase',
    CONTROLS: 'controls',
    ARROW_KEYS: 'arrowKeys',
    ROTATE_KEY: 'rotateKey',
    ENTER_KEY: 'enterKey',
    SHIPS_TO_PLACE: 'shipsToPlace',
    SPACES: 'spaces'
};

const STATES = {
    NEXT_STATE: "next state"
};

const INITIAL_STATE = {
    PLAYER: null,
    IS_DRAWN: false,
    NEXT: null,
    TRANSITION_TO: null,
    CURSOR_COLUMN: DEFAULT_VALUES.ZERO,
    CURSOR_ROW: DEFAULT_VALUES.ZERO,
    CURRENT_SHIP_INDEX: DEFAULT_VALUES.ZERO,
    IS_HORIZONTAL: false,
    TRANSITION_FN: null
};

function createMapLayoutScreen() {
    const MapLayout = {
        player: INITIAL_STATE.PLAYER,
        isDrawn: INITIAL_STATE.IS_DRAWN,
        next: INITIAL_STATE.NEXT,
        transitionTo: INITIAL_STATE.TRANSITION_TO,
        cursorColumn: INITIAL_STATE.CURSOR_COLUMN,
        cursorRow: INITIAL_STATE.CURSOR_ROW,
        currentShipIndex: INITIAL_STATE.CURRENT_SHIP_INDEX,
        isHorizontal: INITIAL_STATE.IS_HORIZONTAL,
        map: create2DArrayWithFill(GAME_BOARD_DIM),
        ships: [...Object.values(units)],
        placedShips: [],
        transitionFn: INITIAL_STATE.TRANSITION_FN,

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
            for (let i = DEFAULT_VALUES.ZERO; i < ship.size; i++) {
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
            const size = ship ? ship.size : DEFAULT_VALUES.ONE;

            if (KeyBoardManager.isUpPressed()) {
                newCursorRow = Math.max(DEFAULT_VALUES.ZERO, this.cursorRow - DEFAULT_VALUES.ONE);
            }
            if (KeyBoardManager.isDownPressed()) {
                const maxRow = this.isHorizontal ? GAME_BOARD_DIM - DEFAULT_VALUES.ONE : GAME_BOARD_DIM - size;
                newCursorRow = Math.min(maxRow, this.cursorRow + DEFAULT_VALUES.ONE);
            }
            if (KeyBoardManager.isLeftPressed()) {
                newCursorColumn = Math.max(DEFAULT_VALUES.ZERO, this.cursorColumn - DEFAULT_VALUES.ONE);
            }
            if (KeyBoardManager.isRightPressed()) {
                const maxColumn = this.isHorizontal ? GAME_BOARD_DIM - size : GAME_BOARD_DIM - DEFAULT_VALUES.ONE;
                newCursorColumn = Math.min(maxColumn, this.cursorColumn + DEFAULT_VALUES.ONE);
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
                    this.cursorColumn = DEFAULT_VALUES.ZERO;
                    this.cursorRow = DEFAULT_VALUES.ZERO;
                    if (this.currentShipIndex < this.ships.length) {
                        this.ship = this.ships[this.currentShipIndex];
                    } else {
                        this.next = this.transitionFn(this);
                        this.transitionTo = STATES.NEXT_STATE;
                    }
                }
            }
        },

        draw: function (dr) {
            if (!this.isDrawn) {
                clearScreen();
                print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${getText(TEXT_KEYS.SHIP_PLACEMENT_PHASE)}${STRING_LITERALS.COLON}${STRING_LITERALS.DOUBLE_NEW_LINE}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
            }

            let output = `${STRING_LITERALS.SPACE}${STRING_LITERALS.SPACE}`;
            for (let i = DEFAULT_VALUES.ZERO; i < GAME_BOARD_DIM; i++) {
                output += `${STRING_LITERALS.SPACE}${String.fromCharCode(ASCII.CHAR_CODE_A + i)}`;
            }
            output += STRING_LITERALS.NEW_LINE;
        
            for (let y = DEFAULT_VALUES.ZERO; y < GAME_BOARD_DIM; y++) {
                output += `${String(y + DEFAULT_VALUES.ONE).padStart(DEFAULT_VALUES.TWO, STRING_LITERALS.SPACE)}${STRING_LITERALS.SPACE}`;
        
                for (let x = DEFAULT_VALUES.ZERO; x < GAME_BOARD_DIM; x++) {
                    const cell = this.map[y][x];
                    const isInShipPreview = this.isPositionInShipPreview(x, y);
        
                    if (isInShipPreview && this.canPlaceShip()) {
                        output += `${ANSI.COLOR.GREEN}${STRING_LITERALS.CURSOR}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                    } else if (isInShipPreview) {
                        output += `${ANSI.COLOR.WHITE}${STRING_LITERALS.CURSOR}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                    }
                    else if (cell !== DEFAULT_VALUES.ZERO) {
                        output += `${ANSI.SEA__AND_SHIP}${cell}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                    } else {
                        output += `${ANSI.SEA}${STRING_LITERALS.SPACE}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                    }
                }
                output += `${y + DEFAULT_VALUES.ONE}${STRING_LITERALS.NEW_LINE}`;
            }
        
            output += `${STRING_LITERALS.SPACE}${STRING_LITERALS.SPACE}`;
            for (let i = DEFAULT_VALUES.ZERO; i < GAME_BOARD_DIM; i++) {
                output += `${STRING_LITERALS.SPACE}${String.fromCharCode(ASCII.CHAR_CODE_A + i)}`;
            }
            output += STRING_LITERALS.DOUBLE_NEW_LINE;
        
            if (!this.isDrawn) {
                output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${getText(TEXT_KEYS.CONTROLS)}${STRING_LITERALS.COLON}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}${STRING_LITERALS.NEW_LINE}`;
                output += `${getText(TEXT_KEYS.ARROW_KEYS)}${STRING_LITERALS.NEW_LINE}`;
                output += `${getText(TEXT_KEYS.ROTATE_KEY)}${STRING_LITERALS.NEW_LINE}`;
                output += `${getText(TEXT_KEYS.ENTER_KEY)}${STRING_LITERALS.NEW_LINE}`;
        
                output += `${STRING_LITERALS.NEW_LINE}${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${getText(TEXT_KEYS.SHIPS_TO_PLACE)}${STRING_LITERALS.COLON}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}${STRING_LITERALS.NEW_LINE}`;
                this.ships.forEach((ship, index) => {
                    const status = index < this.currentShipIndex ? STRING_LITERALS.CHECK_MARK :
                        index === this.currentShipIndex ? STRING_LITERALS.ARROW : STRING_LITERALS.SPACE;
                    output += `${status} ${ship.id} ${STRING_LITERALS.OPEN_PAREN}${ship.size} ${getText(TEXT_KEYS.SPACES)}${STRING_LITERALS.CLOSE_PAREN}${STRING_LITERALS.NEW_LINE}`;
                });
            }
            print(ANSI.CURSOR_HOME + output);
            
            this.isDrawn = true;
        }
    };

    return MapLayout;
}

export default createMapLayoutScreen;