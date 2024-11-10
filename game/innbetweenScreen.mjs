import { print, printCenterd } from "../utils/io.mjs";


const DEFAULT_VALUES = {
    ZERO: 0,
    DEFAULT_DISPLAY_TIME: 3,
    MILLISECONDS_MULTIPLIER: 1000
 };
 
 const STATES = {
    TRANSITION_MESSAGE: "Transitioning away from innbetween screen"
 };
 
 const INITIAL_STATE = {
    IS_DRAWN: false,
    NEXT: null,
    TRANSITION_TO: null,
    DISPLAY_TIME: DEFAULT_VALUES.ZERO,
    TEXT: null,
    TRANSITION_FN: null
 };


 function createInnBetweenScreen() {
    return {
        isDrawn: INITIAL_STATE.IS_DRAWN,
        next: INITIAL_STATE.NEXT,
        transitionTo: INITIAL_STATE.TRANSITION_TO,
        displayTime: INITIAL_STATE.DISPLAY_TIME,
        text: INITIAL_STATE.TEXT,
        transitionFn: INITIAL_STATE.TRANSITION_FN,
 
        init: function (text, transitionFn, displayTime = DEFAULT_VALUES.DEFAULT_DISPLAY_TIME) {
            this.displayTime = displayTime * DEFAULT_VALUES.MILLISECONDS_MULTIPLIER;
            this.text = text;
            this.transitionFn = transitionFn;
        },
 
        update: function (dt) {
            this.displayTime -= dt;
            if (this.displayTime <= DEFAULT_VALUES.ZERO) {
                this.next = this.transitionFn();
                this.transitionTo = STATES.TRANSITION_MESSAGE;
            }
        },
 
        draw: function (dr) {
            if (this.isDrawn === false) {
                this.isDrawn = true;
                printCenterd(this.text);
            }
        }
    }
 }
 
 export default createInnBetweenScreen;