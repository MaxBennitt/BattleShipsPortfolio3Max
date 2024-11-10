import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import { createResolutionChecker } from "./utils/ResolutionChecker.mjs";
import { getText, setLanguage, getCurrentLanguage } from "./utils/languages.mjs";

const GAME_FPS = 1000 / 60; // The theoretical refresh rate of our game engine
let currentState = null;    // The current active state in our finite-state machine.
let gameLoop = null;        // Variable that keeps a reference to the interval id assigned to our game loop 
let mainMenuScene = null;
let menuItemCount = 0;

// Support / Utility functions ---------------------------------------------------------------

function buildMenu() {
    return [
        {
            text: () => getText('startGame'),
            id: menuItemCount++,
            action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(`${getText('shipPlacementPhase')}\nFirst player get ready.\nPlayer two look away`, () => {
                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1MapLayout) => {
                        let innbetween = createInnBetweenScreen();
                        innbetween.init(`${getText('shipPlacementPhase')}\nSecond player get ready.\nPlayer one look away`, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2MapLayout) => {
                                let battleship = createBattleshipScreen();
                                battleship.init(player1MapLayout.map, player2MapLayout.map);
                                battleship.mainMenuScene = mainMenuScene;
                                return battleship;
                            });
                            return p2map;
                        });
                        return innbetween;
                    });
                    return p1map;
                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            }
        },
        {
            text: () => getText('changeLanguage'),
            id: menuItemCount++,
            action: function () {
                const languageMenu = createMenu([
                    {
                        text: () => "English",
                        id: 0,
                        action: function() {
                            setLanguage('english');
                            currentState = mainMenuScene;
                            mainMenuScene.isDrawn = false;
                        }
                    },
                    {
                        text: () => "Norsk",
                        id: 1,
                        action: function() {
                            setLanguage('norwegian');
                            currentState = mainMenuScene;
                            mainMenuScene.isDrawn = false;
                        }
                    }
                ]);
                currentState = languageMenu;
            }
        },
        {
            text: () => getText('exitGame'),
            id: menuItemCount++,
            action: function () {
                print(ANSI.SHOW_CURSOR);
                clearScreen();
                process.exit();
            }
        }
    ];
}

const MAIN_MENU_ITEMS = buildMenu();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

(function initialize() {
    print(ANSI.HIDE_CURSOR);
    clearScreen();
    const ResolutionChecker = createResolutionChecker();
    mainMenuScene = createMenu(MAIN_MENU_ITEMS);
    SplashScreen.next = mainMenuScene;
    ResolutionChecker.init(SplashScreen);
    currentState = ResolutionChecker;
    gameLoop = setInterval(update, GAME_FPS);
})();

export default buildMenu;