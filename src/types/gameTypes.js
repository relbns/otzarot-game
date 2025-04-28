/**
 * Game Types
 * 
 * This file contains type definitions for the game state and related objects.
 * While JavaScript doesn't enforce types, these serve as documentation.
 */

/**
 * @typedef {Object} Player
 * @property {number} id - Unique identifier for the player
 * @property {string} name - Player's name
 * @property {number} score - Player's current score
 */

/**
 * @typedef {Object} Die
 * @property {number} id - Unique identifier for the die
 * @property {string} face - Current face showing ('coin', 'diamond', 'swords', 'monkey', 'parrot', 'skull', 'blank')
 * @property {boolean} selected - Whether the die is currently selected for rerolling
 * @property {boolean} locked - Whether the die is locked (can't be rerolled)
 * @property {boolean} inTreasureChest - Whether the die is in the treasure chest (for treasure chest card)
 */

/**
 * @typedef {Object} Card
 * @property {string} name - English name of the card
 * @property {string} hebrewName - Hebrew name of the card
 * @property {string} description - English description of the card
 * @property {string} hebrewDescription - Hebrew description of the card
 * @property {string} effect - Effect type of the card
 * @property {string} icon - Icon representing the card
 * @property {number} [bonus] - Bonus points for certain cards
 * @property {number} [timesShown] - Number of times this card appears in the deck
 */

/**
 * @typedef {Object} GameState
 * @property {string} language - Current language ('en' or 'he')
 * @property {number} playerCount - Number of players
 * @property {boolean} showStartForm - Whether to show the start form
 * @property {boolean} gameStarted - Whether the game has started
 * @property {Card[]} deck - Current deck of cards
 * @property {Player[]} players - Array of players
 * @property {number} activePlayer - Index of the active player
 * @property {string} gamePhase - Current phase of the game ('waiting', 'drawing', 'rolling', 'decision', 'resolution')
 * @property {number} rollsRemaining - Number of rolls remaining in the current turn
 * @property {boolean} isGameOver - Whether the game is over
 * @property {Player|null} winner - The winning player, if any
 * @property {boolean} islandOfSkulls - Whether the player is in the Island of Skulls
 * @property {number} skullCount - Number of skulls currently showing
 * @property {boolean} skullRerollUsed - Whether the skull reroll has been used (for sorceress card)
 * @property {boolean} turnEndsWithSkulls - Whether the turn ends with skulls
 * @property {number} autoEndCountdown - Countdown for auto-ending the turn
 * @property {Die[]} currentDice - Current dice
 * @property {number[]} selectedDice - Indices of selected dice
 * @property {Card|null} currentCard - Current card
 * @property {boolean} isCardFlipping - Whether a card is currently flipping
 * @property {boolean} isDiceRolling - Whether dice are currently rolling
 * @property {string[]} gameLog - Log of game events
 * @property {boolean} showShuffleNotification - Whether to show the shuffle notification
 * @property {boolean} showScoreModal - Whether to show the score modal
 * @property {number} turnScore - Score for the current turn
 * @property {string[]} turnScoreDetails - Details of the score for the current turn
 * @property {number} turnPenalties - Penalties for the current turn
 * @property {string[]} turnPenaltyDetails - Details of the penalties for the current turn
 * @property {number} pointsToWin - Points needed to win
 * @property {boolean} playSounds - Whether to play sounds
 * @property {boolean} victoryModalVisible - Whether the victory modal is visible
 */

export {};
