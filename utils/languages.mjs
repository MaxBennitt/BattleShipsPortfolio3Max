const languages = {
    english: {
        startGame: "Start Game",
        exitGame: "Exit Game",
        changeLanguage: "Change Language",
        shipPlacementPhase: "Ship Placement Phase",
        controls: "Controls",
        arrowKeys: "Arrow keys: Move cursor",
        rotateKey: "R: Rotate ship",
        enterKey: "Enter: Place ship",
        shipsToPlace: "Ships to place",
        spaces: "spaces"
    },
    norwegian: {
        startGame: "Start Spill",
        exitGame: "Avslutt Spill",
        changeLanguage: "Bytt Språk",
        shipPlacementPhase: "Plassering av Skip",
        controls: "Kontroller",
        arrowKeys: "Piltaster: Flytt markør",
        rotateKey: "R: Roter skip",
        enterKey: "Enter: Plasser skip",
        shipsToPlace: "Skip å plassere",
        spaces: "Plasser"
    }
};

let currentLanguage = 'english';

export function getCurrentLanguage() {
    return currentLanguage;
}

export function setLanguage(language) {
    if (languages[language]) {
        currentLanguage = language;
    }
}

export function getText(key) {
    return languages[currentLanguage][key] || 'Missing text';
}

export default languages;