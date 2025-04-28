/**
 * Dice Manager
 * 
 * This module combines the pure dice logic with utility functions
 * to provide an integrated interface for managing dice in the game.
 */
import {
    createInitialDice,
    rollDice,
    performFirstRoll,
    toggleDieSelection,
    toggleTreasureChest,
    getIslandOfSkullsRollableIndices,
    lockDiceWithFace,
    countDiceFace,
    applyInitialCardEffects,
    rollIslandOfSkulls,
    areAllUnlockedDiceOfFaces
} from './dice';

/**
 * Creates and initializes a new set of dice
 * @returns {Array} Array of dice objects
 */
export const initializeDice = () => {
    return createInitialDice();
};

/**
 * Handles the first roll of dice
 * @param {Array} dice - Current dice array
 * @returns {Object} Object with new dice and skulls count
 */
export const handleFirstRoll = (dice) => {
    const newDice = performFirstRoll(dice);
    const skullCount = countDiceFace(newDice, 'skull');

    let isIslandOfSkulls = false;
    let updatedDice = newDice;

    // Check for Island of Skulls (4+ skulls on first roll)
    if (skullCount >= 4) {
        isIslandOfSkulls = true;
        // Lock all non-skull dice
        updatedDice = lockDiceWithFace(newDice, 'skull');
    } else if (skullCount >= 3) {
        // Lock all skull dice
        updatedDice = lockDiceWithFace(newDice, 'skull');
    }

    return {
        dice: updatedDice,
        skullCount,
        isIslandOfSkulls,
        isDisqualified: skullCount >= 3 && !isIslandOfSkulls
    };
};

/**
 * Handles rerolling selected dice
 * @param {Array} dice - Current dice array
 * @param {Array} selectedDice - Indices of dice to reroll
 * @param {boolean} isSorceressSkullReroll - Whether this is a sorceress skull reroll
 * @returns {Object} Object with new dice, skulls count, and disqualification status
 */
export const handleReroll = (dice, selectedDice, isSorceressSkullReroll = false) => {
    // Roll selected dice
    const newDice = rollDice(dice, selectedDice);

    // Count skulls after roll
    const skullCount = countDiceFace(newDice, 'skull');

    // Check for disqualification (3+ skulls)
    const isDisqualified = skullCount >= 3;

    // If disqualified, lock all skull dice
    let updatedDice = newDice;
    if (isDisqualified) {
        updatedDice = lockDiceWithFace(newDice, 'skull');
    }

    return {
        dice: updatedDice,
        skullCount,
        isDisqualified
    };
};

/**
 * Handles Island of Skulls rolling
 * @param {Array} dice - Current dice array
 * @returns {Object} Object with rolled dice, new skull count, total skull count
 */
export const handleIslandOfSkullsRoll = (dice) => {
    // Get indices of dice that can be rolled
    const rollableIndices = getIslandOfSkullsRollableIndices(dice);

    // Roll the dice
    const { dice: newDice, newSkullCount } = rollIslandOfSkulls(dice, rollableIndices);

    // Count total skulls
    const totalSkullCount = countDiceFace(newDice, 'skull');

    return {
        dice: newDice,
        newSkullCount,
        totalSkullCount,
        isRoundOver: newSkullCount === 0
    };
};

/**
 * Handles die selection for rerolling
 * @param {Array} dice - Current dice array
 * @param {Array} selectedDice - Current selected dice indices
 * @param {number} index - Index of die to toggle selection
 * @param {boolean} isSorceressAvailable - Whether sorceress ability is available
 * @returns {Object} Object with updated selection state
 */
export const handleDieSelection = (dice, selectedDice, index, isSorceressAvailable) => {
    return toggleDieSelection(dice, selectedDice, index, isSorceressAvailable);
};

/**
 * Handles toggling treasure chest status for a die
 * @param {Array} dice - Current dice array
 * @param {Array} selectedDice - Current selected dice indices
 * @param {number} index - Index of die to toggle
 * @returns {Object} Object with updated dice and selection
 */
export const handleTreasureChest = (dice, selectedDice, index) => {
    return toggleTreasureChest(dice, selectedDice, index);
};

/**
 * Applies initial card effects to dice
 * @param {Array} dice - Current dice array
 * @param {Object} card - Card with effects to apply
 * @returns {Object} Object with updated dice and skull count change
 */
export const handleCardEffects = (dice, card) => {
    const { dice: newDice, skullsAdded } = applyInitialCardEffects(dice, card);
    return {
        dice: newDice,
        skullsAdded
    };
};

/**
 * Checks if zombie attack condition is met (only skulls and swords remain)
 * @param {Array} dice - Current dice array
 * @returns {boolean} Whether zombie attack is complete
 */
export const isZombieAttackComplete = (dice) => {
    return areAllUnlockedDiceOfFaces(dice, ['skull', 'swords']);
};

/**
 * Handles zombie attack dice locking
 * @param {Array} dice - Current dice array
 * @returns {Array} Updated dice with non-skull, non-sword dice locked
 */
export const handleZombieAttackLocking = (dice) => {
    return dice.map(die => {
        if (die.face !== 'skull' && die.face !== 'swords' && !die.inTreasureChest) {
            return { ...die, locked: true };
        }
        return die;
    });
};

/**
 * Checks if a reroll is valid based on game rules
 * @param {Array} dice - Current dice array
 * @param {Array} selectedDice - Currently selected dice indices
 * @param {Object} gameState - Current game state
 * @returns {Object} Validation result with isValid and reason
 */
export const validateReroll = (dice, selectedDice, gameState) => {
    const {
        rollsRemaining,
        islandOfSkulls,
        currentCard,
        skullRerollUsed
    } = gameState;

    // Check if there are rolls remaining
    if (rollsRemaining <= 0 && !islandOfSkulls) {
        return {
            isValid: false,
            reason: 'no_rolls_remaining'
        };
    }

    // Check for storm card restriction
    if (currentCard?.effect === 'storm' && rollsRemaining <= 1) {
        return {
            isValid: false,
            reason: 'storm_max_rolls'
        };
    }

    // Special handling for sorceress skull reroll
    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    const isSorceressRerollAttempt = selectedDice.length === 1 &&
        dice[selectedDice[0]]?.face === 'skull';

    // Check minimum dice selection (normal gameplay)
    if (!islandOfSkulls && selectedDice.length < 2 &&
        !(isSorceressAvailable && isSorceressRerollAttempt)) {
        return {
            isValid: false,
            reason: 'min_2_dice_reroll'
        };
    }

    // Valid reroll
    return {
        isValid: true,
        isSorceressSkullReroll: isSorceressAvailable && isSorceressRerollAttempt
    };
};

/**
 * Determines whether the player should enter Island of Skulls
 * @param {number} skullCount - Number of skulls rolled
 * @param {string} gamePhase - Current game phase
 * @returns {boolean} Whether to enter Island of Skulls
 */
export const shouldEnterIslandOfSkulls = (skullCount, gamePhase) => {
    return gamePhase === 'rolling' && skullCount >= 4;
};

/**
 * Gets all dice in treasure chest
 * @param {Array} dice - Current dice array
 * @returns {Array} Dice that are in the treasure chest
 */
export const getDiceInTreasureChest = (dice) => {
    return dice.filter(die => die.inTreasureChest);
};

/**
 * Gets the locked state of dice for UI display
 * @param {Array} dice - Current dice array
 * @param {boolean} isSorceressAvailable - Whether sorceress ability is available
 * @returns {Array} Array of locked states (true/false) for each die
 */
export const getDiceLockedStates = (dice, isSorceressAvailable = false) => {
    return dice.map(die => {
        if (die.inTreasureChest) return false;
        if (die.face === 'skull' && !isSorceressAvailable) return true;
        return die.locked;
    });
};

/**
 * Gets rollable dice indices based on current game state
 * @param {Array} dice - Current dice array
 * @param {boolean} isIslandOfSkulls - Whether in Island of Skulls mode
 * @param {Array} selectedDice - Currently selected dice indices
 * @returns {Array} Indices of dice that can be rolled
 */
export const getRollableDiceIndices = (dice, isIslandOfSkulls, selectedDice) => {
    if (isIslandOfSkulls) {
        return getIslandOfSkullsRollableIndices(dice);
    }

    return selectedDice;
};

/**
 * Create a game state summary for dice
 * @param {Array} dice - Current dice array
 * @returns {Object} Summary of dice state
 */
export const getDiceStateSummary = (dice) => {
    const faces = {};
    const validFaces = ['coin', 'diamond', 'swords', 'monkey', 'parrot', 'skull'];

    // Initialize counts
    validFaces.forEach(face => faces[face] = 0);

    // Count each face
    dice.forEach(die => {
        if (validFaces.includes(die.face)) {
            faces[die.face]++;
        }
    });

    // Special counts
    const treasureChestCount = dice.filter(die => die.inTreasureChest).length;
    const lockedCount = dice.filter(die => die.locked).length;
    const selectedCount = dice.filter(die => die.selected).length;

    return {
        ...faces,
        treasureChestCount,
        lockedCount,
        selectedCount,
        isDisqualified: faces.skull >= 3,
        isFullChest: dice.length === 8 && dice.every(die => die.face !== 'blank')
    };
};