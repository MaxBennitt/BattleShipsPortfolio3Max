import { printCenterd, clearScreen } from "./io.mjs";
import { ANSI } from "./ansi.mjs";

function createResolutionChecker() {
    return {
        isDrawn: false,
        next: null,
        transitionTo: null,
        minimumWidth: 80,
        minimumHeight: 24,

        init: function(nextState) {
            this.next = nextState;
        },

        checkResolution: function() {
            const columns = process.stdout.columns;
            const rows = process.stdout.rows;

            return {
                meetsMinimum: columns >= this.minimumWidth && rows >= this.minimumHeight,
                current: { width: columns, height: rows },
                required: { width: this.minimumWidth, height: this.minimumHeight }
            };
        },

        update: function(dt) {
            const resolution = this.checkResolution();
            if (resolution.meetsMinimum) {
                this.transitionTo = "next state";
            }
        },

        draw: function(dr) {
            if (this.isDrawn === false) {
                this.isDrawn = true;
                clearScreen();

                const resolution = this.checkResolution();
                if (!resolution.meetsMinimum) {
                    const message = [
                        `${ANSI.COLOR.RED}${ANSI.TEXT.BOLD}Resolution Error${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`,
                        "",
                        "Your terminal window is too small to play Battleships.",
                        "",
                        `Current: ${resolution.current.width}x${resolution.current.height}`,
                        `Required: ${resolution.required.width}x${resolution.required.height}`,
                        "",
                        "Please resize your terminal window",
                        "",
                        "Press ESC to exit..."
                    ].join("\n");

                    printCenterd(message);
                }
            }
        }
    };
}

export { createResolutionChecker };