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

const GAME_FPS = 1000 / 60;
let currentState = null;
let gameLoop = null;
let mainMenuScene = null;
let menuItemCount = 0;

const GAME_STATES = {
    SPLASH_SCREEN: "Splash Screen",
    MAIN_MENU: "Main Menu",
    MAP_LAYOUT: "Map Layout",
    INNBETWEEN: "Innbetween",
    BATTLESHIP: "Battleship"
};

const MENU_ITEMS = {
    START_GAME: "startGame",
    CHANGE_LANGUAGE: "changeLanguage",
    EXIT_GAME: "exitGame"
};

const LANGUAGES = {
    ENGLISH: "english",
    NORWEGIAN: "norwegian"
};

const SCREEN_KEYS = {
    SHIP_PLACEMENT_PHASE: "shipPlacementPhase",
    FIRST_PLAYER_READY: "firstPlayerReady",
    SECOND_PLAYER_READY: "secondPlayerReady",
    LOOK_AWAY: "lookAway",
    OTHER_LOOK_AWAY: "otherLookAway"
};

const LANGUAGE_NAMES = {
    ENGLISH: "English",
    NORWEGIAN: "Norsk"
};

function buildMenu() {
    return [
        {
            text: () => getText(MENU_ITEMS.START_GAME),
            id: menuItemCount++,
            action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(`${getText(SCREEN_KEYS.SHIP_PLACEMENT_PHASE)}\n${getText(SCREEN_KEYS.FIRST_PLAYER_READY)}\n${getText(SCREEN_KEYS.LOOK_AWAY)}`, () => {
                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1MapLayout) => {
                        let innbetween = createInnBetweenScreen();
                        innbetween.init(`${getText(SCREEN_KEYS.SHIP_PLACEMENT_PHASE)}\n${getText(SCREEN_KEYS.SECOND_PLAYER_READY)}\n${getText(SCREEN_KEYS.OTHER_LOOK_AWAY)}`, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2MapLayout) => {
                                let battleship = createBattleshipScreen();
                                battleship.init(player1MapLayout.map, player2MapLayout.map);
                                battleship.mainMenuScene = GAME_STATES.MAIN_MENU;
                                return battleship;
                            });
                            return p2map;
                        });
                        return innbetween;
                    });
                    return p1map;
                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = GAME_STATES.MAP_LAYOUT;
            }
        },
        {
            text: () => getText(MENU_ITEMS.CHANGE_LANGUAGE),
            id: menuItemCount++,
            action: function () {
                const languageMenu = createMenu([
                    {
                        text: () => LANGUAGE_NAMES.ENGLISH,
                        id: 0,
                        action: function() {
                            setLanguage(LANGUAGES.ENGLISH);
                            currentState = mainMenuScene;
                            mainMenuScene.isDrawn = false;
                        }
                    },
                    {
                        text: () => LANGUAGE_NAMES.NORWEGIAN,
                        id: 1,
                        action: function() {
                            setLanguage(LANGUAGES.NORWEGIAN);
                            currentState = mainMenuScene;
                            mainMenuScene.isDrawn = false;
                        }
                    }
                ]);
                currentState = languageMenu;
            }
        },
        {
            text: () => getText(MENU_ITEMS.EXIT_GAME),
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