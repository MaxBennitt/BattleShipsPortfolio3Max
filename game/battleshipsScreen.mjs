import { GAME_BOARD_DIM, FIRST_PLAYER, SECOND_PLAYER } from "../consts.mjs";
import { print } from "../utils/io.mjs";
import { clearScreen } from "../utils/io.mjs";
import { ANSI } from "../utils/ansi.mjs";
import KeyBoardManager from "../utils/io.mjs";
import { getText } from "../utils/languages.mjs";

const SHOT_TYPES = {
    MISS: 'O',
    HIT: 'X'
}

const PLAYER_NAMES = {
    PLAYER_1: "Player 1",
    PLAYER_2: "Player 2",
    TURN_SUFFIX: "'s Turn"
};

const SEGMENT_TEXT = {
    REMAINING: "segments remaining",
    SHIPS: "Ships"
};

const BOARD_SYMBOLS = {
    CURSOR: "█",
    EMPTY: " "
};

const ASCII = {
    CHAR_CODE_A: 65
};

const STRING_LITERALS = {
    EMPTY: "",
    SPACE: " ",
    NEW_LINE: "\n",
    DOUBLE_NEW_LINE: "\n\n",
    COLON: ":",
    FIRE: "Fire!"
};

const PAD_START = {
    LENGTH: 2,
    FILL: STRING_LITERALS.SPACE
};

const DEFAULT_VALUE = {
    ZERO: 0
};

const TEXT_KEYS = {
    GAME_OVER: 'gameOver',
    WINS: 'wins',
    PRESS_ENTER_EXIT: 'pressEnterExit',
    CONTROLS: 'controls',
    ARROW_KEYS: 'arrowKeys',
    ENTER_KEY: 'enterKey'
};

const createBattleshipScreen = () => {
    return {
        isDrawn: false,
        next: null,
        transitionTo: null,
        cursorColumn: DEFAULT_VALUE.ZERO,
        cursorRow: DEFAULT_VALUE.ZERO,
        currentPlayer: FIRST_PLAYER,
        firstPlayerBoard: null,
        secondPlayerBoard: null,
        currentBoard: null,
        opponentBoard: null,
        targets: [],
        shots: [],
        firstPlayerShipSegments: DEFAULT_VALUE.ZERO,
        secondPlayerShipSegments: DEFAULT_VALUE.ZERO,
        gameOver: false,
        winner: null,

        init: function(firstPBoard, secondPBoard) {
            this.firstPlayerBoard = firstPBoard;
            this.secondPlayerBoard = secondPBoard;
            this.currentBoard = this.firstPlayerBoard;
            this.opponentBoard = this.secondPlayerBoard;
            this.firstPlayerShipSegments = this.countShipSegments(firstPBoard);
            this.secondPlayerShipSegments = this.countShipSegments(secondPBoard);
        },

        countShipSegments: function(board) {
            let count = DEFAULT_VALUE.ZERO;
            for(let row = DEFAULT_VALUE.ZERO; row < GAME_BOARD_DIM; row++) {
                for(let col = DEFAULT_VALUE.ZERO; col < GAME_BOARD_DIM; col++) {
                    if(board[row][col] !== DEFAULT_VALUE.ZERO) {
                        count++;
                    }
                }
            }
            return count;
        },

        swapPlayer: function() {
            this.currentPlayer *= -1;
            if (this.currentPlayer === FIRST_PLAYER) {
                this.currentBoard = this.firstPlayerBoard;
                this.opponentBoard = this.secondPlayerBoard;
            } else {
                this.currentBoard = this.secondPlayerBoard;
                this.opponentBoard = this.firstPlayerBoard;
            }
            this.cursorColumn = DEFAULT_VALUE.ZERO;
            this.cursorRow = DEFAULT_VALUE.ZERO;
            this.isDrawn = false;
        },

        update: function(dt) {
            if(this.gameOver) {
                if(KeyBoardManager.isEnterPressed()) {
                    print(ANSI.SHOW_CURSOR);
                    clearScreen();
                    process.exit();
                }
                return;
            }
            if (KeyBoardManager.isUpPressed()) {
                this.cursorRow = Math.max(DEFAULT_VALUE.ZERO, this.cursorRow - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isDownPressed()) {
                this.cursorRow = Math.min(GAME_BOARD_DIM - 1, this.cursorRow + 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isLeftPressed()) {
                this.cursorColumn = Math.max(DEFAULT_VALUE.ZERO, this.cursorColumn - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isRightPressed()) {
                this.cursorColumn = Math.min(GAME_BOARD_DIM - 1, this.cursorColumn + 1);
                this.isDrawn = false;
            }
        
            if (KeyBoardManager.isEnterPressed()) {
                const existingShot = this.shots.find(shot => 
                    shot.x === this.cursorColumn && 
                    shot.y === this.cursorRow &&
                    shot.player === this.currentPlayer
                );
        
                if (!existingShot) {
                    const isHit = this.opponentBoard[this.cursorRow][this.cursorColumn] !== DEFAULT_VALUE.ZERO;
                    this.shots.push({
                        x: this.cursorColumn,
                        y: this.cursorRow,
                        type: isHit ? SHOT_TYPES.HIT : SHOT_TYPES.MISS,
                        player: this.currentPlayer
                    });
                    if (isHit) {
                        if (this.currentPlayer === FIRST_PLAYER) {
                            this.secondPlayerShipSegments--;
                            if (this.secondPlayerShipSegments === DEFAULT_VALUE.ZERO) {
                                this.gameOver = true;
                                this.winner = PLAYER_NAMES.PLAYER_1;
                            }
                        } else {
                            this.firstPlayerShipSegments--;
                            if (this.firstPlayerShipSegments === DEFAULT_VALUE.ZERO) {
                                this.gameOver = true;
                                this.winner = PLAYER_NAMES.PLAYER_2;
                            }
                        }
                    }
                    this.isDrawn = false;
                    this.swapPlayer();
                }
            }
        },

        draw: function(dr) {
            if (this.isDrawn === false) {
                clearScreen();
                
                if (this.gameOver) {
                    print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${getText(TEXT_KEYS.GAME_OVER)}${STRING_LITERALS.NEW_LINE}${this.winner} ${getText(TEXT_KEYS.WINS)}${STRING_LITERALS.DOUBLE_NEW_LINE}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
                    print(`${getText(TEXT_KEYS.PRESS_ENTER_EXIT)}${STRING_LITERALS.DOUBLE_NEW_LINE}`);
                } else {
                    const playerName = this.currentPlayer === FIRST_PLAYER ? PLAYER_NAMES.PLAYER_1 : PLAYER_NAMES.PLAYER_2;
                    print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${playerName}${PLAYER_NAMES.TURN_SUFFIX}${STRING_LITERALS.DOUBLE_NEW_LINE}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
                }

                let output = `${STRING_LITERALS.SPACE}${STRING_LITERALS.SPACE}`;
                for (let i = DEFAULT_VALUE.ZERO; i < GAME_BOARD_DIM; i++) {
                    output += `${STRING_LITERALS.SPACE}${String.fromCharCode(ASCII.CHAR_CODE_A + i)}`;
                }
                output += STRING_LITERALS.NEW_LINE;

                for (let y = DEFAULT_VALUE.ZERO; y < GAME_BOARD_DIM; y++) {
                    output += `${String(y + 1).padStart(PAD_START.LENGTH, PAD_START.FILL)}${STRING_LITERALS.SPACE}`;
                    
                    for (let x = DEFAULT_VALUE.ZERO; x < GAME_BOARD_DIM; x++) {
                        const shot = this.shots.find(s => 
                            s.x === x && 
                            s.y === y && 
                            s.player === this.currentPlayer
                        );
        
                        if (x === this.cursorColumn && y === this.cursorRow) {
                            output += `${ANSI.COLOR.WHITE}${BOARD_SYMBOLS.CURSOR}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                        } else if (shot) {
                            if (shot.type === SHOT_TYPES.HIT) {
                                output += `${ANSI.COLOR.RED}${shot.type}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                            } else {
                                output += `${ANSI.COLOR.BLUE}${shot.type}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                            }
                        } else {
                            output += `${ANSI.SEA}${BOARD_SYMBOLS.EMPTY}${ANSI.RESET}${STRING_LITERALS.SPACE}`;
                        }
                    }
                    output += `${y + 1}${STRING_LITERALS.NEW_LINE}`;
                }
                output += `${STRING_LITERALS.SPACE}${STRING_LITERALS.SPACE}`;
                for (let i = DEFAULT_VALUE.ZERO; i < GAME_BOARD_DIM; i++) {
                    output += `${STRING_LITERALS.SPACE}${String.fromCharCode(ASCII.CHAR_CODE_A + i)}`;
                }
                output += STRING_LITERALS.DOUBLE_NEW_LINE;
                output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${getText(TEXT_KEYS.CONTROLS)}${STRING_LITERALS.COLON}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}${STRING_LITERALS.NEW_LINE}`;
                output += `${getText(TEXT_KEYS.ARROW_KEYS)}${STRING_LITERALS.NEW_LINE}`;
                output += `${getText(TEXT_KEYS.ENTER_KEY)}${STRING_LITERALS.COLON} ${STRING_LITERALS.FIRE}${STRING_LITERALS.NEW_LINE}`;
                output += `${STRING_LITERALS.NEW_LINE}${PLAYER_NAMES.PLAYER_1} ${SEGMENT_TEXT.SHIPS}${STRING_LITERALS.COLON} ${this.firstPlayerShipSegments} ${SEGMENT_TEXT.REMAINING}${STRING_LITERALS.NEW_LINE}`;
                output += `${PLAYER_NAMES.PLAYER_2} ${SEGMENT_TEXT.SHIPS}${STRING_LITERALS.COLON} ${this.secondPlayerShipSegments} ${SEGMENT_TEXT.REMAINING}${STRING_LITERALS.NEW_LINE}`;

                print(output);
            }
            this.isDrawn = true;
        }
    };
}

export default createBattleshipScreen;