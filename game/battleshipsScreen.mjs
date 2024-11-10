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

const createBattleshipScreen = () => {
    return {
        isDrawn: false,
        next: null,
        transitionTo: null,
        cursorColumn: 0,
        cursorRow: 0,
        currentPlayer: FIRST_PLAYER,
        firstPlayerBoard: null,
        secondPlayerBoard: null,
        currentBoard: null,
        opponentBoard: null,
        targets: [],
        shots: [],
        firstPlayerShipSegments: 0,
        secondPlayerShipSegments: 0,
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
            let count = 0;
            for(let row = 0; row < GAME_BOARD_DIM; row++) {
                for(let col = 0; col < GAME_BOARD_DIM; col++) {
                    if(board[row][col] !== 0) {
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
            this.cursorColumn = 0;
            this.cursorRow = 0;
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
                this.cursorRow = Math.max(0, this.cursorRow - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isDownPressed()) {
                this.cursorRow = Math.min(GAME_BOARD_DIM - 1, this.cursorRow + 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isLeftPressed()) {
                this.cursorColumn = Math.max(0, this.cursorColumn - 1);
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
                    const isHit = this.opponentBoard[this.cursorRow][this.cursorColumn] !== 0;
                    this.shots.push({
                        x: this.cursorColumn,
                        y: this.cursorRow,
                        type: isHit ? SHOT_TYPES.HIT : SHOT_TYPES.MISS,
                        player: this.currentPlayer
                    });
                    if (isHit) {
                        if (this.currentPlayer === FIRST_PLAYER) {
                            this.secondPlayerShipSegments--;
                            if (this.secondPlayerShipSegments === 0) {
                                this.gameOver = true;
                                this.winner = "Player 1";
                            }
                        } else {
                            this.firstPlayerShipSegments--;
                            if (this.firstPlayerShipSegments === 0) {
                                this.gameOver = true;
                                this.winner = "Player 2";
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
                    print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}Game Over!\n${this.winner} Wins!\n\n${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
                    print("Press Enter to exit game...\n\n");
                } else {
                    const playerName = this.currentPlayer === FIRST_PLAYER ? "Player 1" : "Player 2";
                    print(`${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${playerName}'s Turn\n\n${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`);
                }

                let output = '  ';
                for (let i = 0; i < GAME_BOARD_DIM; i++) {
                    output += ` ${String.fromCharCode(65 + i)}`;
                }
                output += '\n';

                for (let y = 0; y < GAME_BOARD_DIM; y++) {
                    output += `${String(y + 1).padStart(2, ' ')} `;
                    
                    for (let x = 0; x < GAME_BOARD_DIM; x++) {
                        const shot = this.shots.find(s => 
                            s.x === x && 
                            s.y === y && 
                            s.player === this.currentPlayer
                        );
        
                        if (x === this.cursorColumn && y === this.cursorRow) {
                            output += ANSI.COLOR.WHITE + '█' + ANSI.RESET + ' ';
                        } else if (shot) {
                            if (shot.type === SHOT_TYPES.HIT) {
                                output += ANSI.COLOR.RED + shot.type + ANSI.RESET + ' ';
                            } else {
                                output += ANSI.COLOR.BLUE + shot.type + ANSI.RESET + ' ';
                            }
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
                output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}Controls:${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
                output += `${getText('arrowKeys')}\n`;
                output += `${getText('enterKey')}: Fire!\n`;
                output += `\nPlayer 1 Ships: ${this.firstPlayerShipSegments} segments remaining\n`;
                output += `Player 2 Ships: ${this.secondPlayerShipSegments} segments remaining\n`;

                print(output);
            }
            this.isDrawn = true;
        }
    };
}

export default createBattleshipScreen;