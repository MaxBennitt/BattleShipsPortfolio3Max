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
        enterKeyFire: "Enter: Fire!",
        shipsToPlace: "Ships to place",
        spaces: "spaces",
        player1Turn: "Player 1's Turn",
        player2Turn: "Player 2's Turn",
        gameOver: "Game Over!",
        wins: "Wins!",
        pressEnterExit: "Press Enter to exit game...",
        firstPlayerReady: "First player get ready.",
        secondPlayerReady: "Second player get ready.",
        lookAway: "Player two look away",
        otherLookAway: "Player one look away",
        remainingSegments: "segments remaining"
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
        enterKeyFire: "Enter: Skyt!",
        shipsToPlace: "Skip å plassere",
        spaces: "plasser",
        player1Turn: "Spiller 1's Tur",
        player2Turn: "Spiller 2's Tur",
        gameOver: "Spillet er Over!",
        wins: "Vinner!",
        pressEnterExit: "Trykk Enter for å avslutte spillet...",
        firstPlayerReady: "Første spiller gjør deg klar.",
        secondPlayerReady: "Andre spiller gjør deg klar.",
        lookAway: "Spiller to se bort",
        otherLookAway: "Spiller en se bort",
        remainingSegments: "segmenter gjenstår"
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