import { ANSI } from "../utils/ansi.mjs";
import KeyBoardManager, { clearScreen } from "../utils/io.mjs";
import { print, printCenterd } from "../utils/io.mjs";

const menuState = {
    currentActiveMenuItem: 0
};
let menuItemCount = 0;

function createMenu(menuItems) {
    return {
        isDrawn: false,
        next: null,
        transitionTo: null,

        update: function (dt) {
            if (KeyBoardManager.isUpPressed()) {
                menuState.currentActiveMenuItem--;
                if (menuState.currentActiveMenuItem < 0) {
                    menuState.currentActiveMenuItem = 0;
                }
                this.isDrawn = false;
            }
            else if (KeyBoardManager.isDownPressed()) {
                menuState.currentActiveMenuItem++;
                if (menuState.currentActiveMenuItem >= menuItems.length) {
                    menuState.currentActiveMenuItem = menuItems.length - 1;
                }
                this.isDrawn = false;
            }
            else if (KeyBoardManager.isEnterPressed()) {
                if (menuItems[menuState.currentActiveMenuItem].action) {
                    menuItems[menuState.currentActiveMenuItem].action();
                }
            }
        },

        draw: function () {
            if (this.isDrawn == false) {
                this.isDrawn = true;
                clearScreen();
                let output = ""

                for (let index in menuItems) {
                    let menuItem = menuItems[index]

                    let title = typeof menuItem.text === 'function' ? menuItem.text() : menuItem.text;
                    if (menuState.currentActiveMenuItem == menuItem.id) {
                        title = `*${title}*`;
                    } else {
                        title = ` ${title} `;
                    }
                    output += title + "\n";
                }
                printCenterd(output);
            }
        }
    }
}

export default createMenu;