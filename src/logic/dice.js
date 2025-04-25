/**
 * Dice Logic Module
 * 
 * Pure functions for managing dice in the Otzarot game.
 */

/**
 * Creates an array of new dice with default values
 * @param {number} count - Number of dice to create (default: 8)
 * @returns {Array} Array of dice objects
 */
export const createInitialDice = (count = 8) => {
    return Array(count).fill(null).map((_, index) => ({
        id: index,
        face: 'blank',
        selected: false,
        locked: false,
        inTreasureChest: false,
    }));
};

/**
 * Gets a random dice face (excluding blank)
 * @returns {string} Random dice face
 */
export const getRandomFace = () => {
    const validFaces = ['coin', 'diamond', 'swords', 'monkey', 'parrot', 'skull'];
    return validFaces[Math.floor(Math.random() * validFaces.length)];
};

/**
 * Rolls a set of dice based on specified indices
 * @param {Array} dice - Current dice array
 * @param {Array} indicesToRoll - Array of indices of dice to roll
 * @returns {Array} New dice array with rolled faces
 */
export const rollDice = (dice, indicesToRoll) => {
    return dice.map((die, index) => {
        if (indicesToRoll.includes(index) && !die.locked && !die.inTreasureChest && die.face !== 'skull') {
            return { ...die, face: getRandomFace(), selected: false };
        }
        return die;
    });
};

/**
 * Performs first roll for all dice
 * @param {Array} dice - Current dice array
 * @returns {Array} New dice array with all dice rolled
 */
export const performFirstRoll = (dice) => {
    const allIndices = dice.map((_, index) => index);
    return rollDice(dice, allIndices);
};

/**
 * Toggles selection state of a die
 * @param {Array} dice - Current dice array
 * @param {number} index - Index of die to toggle
 * @param {boolean} isSorceressAvailable - Whether sorceress ability is available
 * @returns {Object} Object containing updated dice and selected indices
 */
export const toggleDieSelection = (dice, selectedDice, index, isSorceressAvailable = false) => {
    const die = dice[index];

    // Cannot select locked or treasure chest dice
    if ((die.locked && die.face !== 'skull') || die.inTreasureChest) {
        return { dice, selectedDice };
    }

    // Handle skull selection (only allowed with sorceress)
    if (die.face === 'skull') {
        if (isSorceressAvailable) {
            // With sorceress, select only this skull and deselect others
            return {
                dice,
                selectedDice: selectedDice.includes(index) ? [] : [index]
            };
        }
        return { dice, selectedDice }; // Cannot select skulls without sorceress
    }

    // Regular selection toggle
    let newSelectedDice;
    if (selectedDice.includes(index)) {
        newSelectedDice = selectedDice.filter(i => i !== index);
    } else {
        // If a skull is selected with sorceress, replace it
        if (isSorceressAvailable && selectedDice.some(i => dice[i].face === 'skull')) {
            newSelectedDice = [index];
        } else {
            newSelectedDice = [...selectedDice, index];
        }
    }

    return {
        dice,
        selectedDice: newSelectedDice
    };
};

/**
 * Toggles treasure chest state for a die
 * @param {Array} dice - Current dice array
 * @param {Array} selectedDice - Currently selected dice indices
 * @param {number} index - Index of die to toggle
 * @returns {Object} Object containing updated dice and selected indices
 */
export const toggleTreasureChest = (dice, selectedDice, index) => {
    // Skip if die is a skull
    if (dice[index].face === 'skull') {
        return { dice, selectedDice };
    }

    const die = dice[index];
    let newDice = [...dice];
    let newSelectedDice = [...selectedDice];

    // Cycle through states: selected -> in chest -> neither
    if (selectedDice.includes(index)) {
        // Move from selected to treasure chest
        newDice[index] = { ...die, selected: false, inTreasureChest: true, locked: false };
        newSelectedDice = newSelectedDice.filter(i => i !== index);
    } else if (die.inTreasureChest) {
        // Remove from treasure chest (neither selected nor in chest)
        newDice[index] = { ...die, selected: false, inTreasureChest: false, locked: false };
    } else {
        // Select for reroll
        newDice[index] = { ...die, selected: true, inTreasureChest: false, locked: false };
        newSelectedDice.push(index);
    }

    return {
        dice: newDice,
        selectedDice: newSelectedDice
    };
};

/**
 * Gets indices of dice that need to be rolled for the Island of Skulls
 * @param {Array} dice - Current dice array
 * @returns {Array} Array of indices of dice to roll
 */
export const getIslandOfSkullsRollableIndices = (dice) => {
    return dice.reduce((indices, die, index) => {
        if (die.face !== 'skull' && !die.locked && !die.inTreasureChest) {
            indices.push(index);
        }
        return indices;
    }, []);
};

/**
 * Locks all dice of a specific face
 * @param {Array} dice - Current dice array
 * @param {string} face - Face to lock (e.g., 'skull')
 * @returns {Array} Updated dice array with specified faces locked
 */
export const lockDiceWithFace = (dice, face) => {
    return dice.map(die =>
        die.face === face ? { ...die, locked: true } : die
    );
};

/**
 * Locks all dice except those with specified faces
 * @param {Array} dice - Current dice array
 * @param {Array} excludeFaces - Array of faces to exclude from locking
 * @returns {Array} Updated dice array with non-excluded faces locked
 */
export const lockDiceExceptFaces = (dice, excludeFaces) => {
    return dice.map(die => {
        if (!excludeFaces.includes(die.face) && !die.inTreasureChest) {
            return { ...die, locked: true };
        }
        return die;
    });
};

/**
 * Counts the number of dice with a specific face
 * @param {Array} dice - Array of dice
 * @param {string} face - Face to count
 * @returns {number} Count of dice with specified face
 */
export const countDiceFace = (dice, face) => {
    return dice.filter(die => die.face === face).length;
};

/**
 * Checks if all non-locked, non-treasure chest dice are of specified faces
 * @param {Array} dice - Array of dice
 * @param {Array} faces - Array of allowed faces
 * @returns {boolean} True if all non-locked dice are of specified faces
 */
export const areAllUnlockedDiceOfFaces = (dice, faces) => {
    return dice.every(die =>
        die.locked || die.inTreasureChest || faces.includes(die.face)
    );
};

/**
 * Applies initial dice effects from cards
 * @param {Array} dice - Current dice array
 * @param {Object} card - Card with effects to apply
 * @returns {Object} Object with updated dice and count of skulls added
 */
export const applyInitialCardEffects = (dice, card) => {
    if (!card) return { dice, skullsAdded: 0 };

    let newDice = [...dice];
    let skullsAdded = 0;

    switch (card.effect) {
        case 'start_with_gold':
            // Add one gold coin to first available die
            for (let i = 0; i < newDice.length; i++) {
                if (newDice[i].face === 'blank') {
                    newDice[i] = {
                        ...newDice[i],
                        face: 'coin',
                        locked: false,
                        lockedByCard: true
                    };
                    break;
                }
            }
            break;

        case 'start_with_diamond':
            // Add one diamond to first available die
            for (let i = 0; i < newDice.length; i++) {
                if (newDice[i].face === 'blank') {
                    newDice[i] = {
                        ...newDice[i],
                        face: 'diamond',
                        locked: false,
                        lockedByCard: true
                    };
                    break;
                }
            }
            break;

        case 'start_with_1_skull':
            // Add one skull to first available die
            for (let i = 0; i < newDice.length; i++) {
                if (newDice[i].face === 'blank') {
                    newDice[i] = {
                        ...newDice[i],
                        face: 'skull',
                        locked: true
                    };
                    skullsAdded = 1;
                    break;
                }
            }
            break;

        case 'start_with_2_skulls':
            // Add two skulls to first available dice
            let added = 0;
            for (let i = 0; i < newDice.length && added < 2; i++) {
                if (newDice[i].face === 'blank') {
                    newDice[i] = {
                        ...newDice[i],
                        face: 'skull',
                        locked: true
                    };
                    added++;
                }
            }
            skullsAdded = added;
            break;

        default:
            break;
    }

    return {
        dice: newDice,
        skullsAdded
    };
};

// /**
//  * Handles Island of Skulls dice roll
//  * @param {Array} dice - Current dice array
//  * @param {Array} indices - Indices of dice to roll
//  * @returns {Object} Object with rolled dice and newly rolled skulls count
//  */
// export const rollIslandOfSkulls = (dice, indices) => {
//     // Roll the dice
//     const rolledDice = rollDice(dice, indices);

//     // Count newly rolled skulls by direct comparison
//     const newlyRolledSkulls = indices.reduce((count, index) => {
//       if (dice[index].face !== 'skull' && rolledDice[index].face === 'skull') {
//         return count + 1;
//       }
//       return count;
//     }, 0);

//     // Lock all skull dice
//     const lockedSkullDice = rolledDice.map(die => 
//       die.face === 'skull' ? { ...die, locked: true } : die
//     );

//     return {
//       dice: lockedSkullDice,
//       newSkullCount: newlyRolledSkulls
//     };
//   };

/**
 * Handles Island of Skulls dice roll
 * @param {Array} dice - Current dice array
 * @param {Array} indices - Indices of dice to roll
 * @returns {Object} Object with rolled dice and newly rolled skulls count
 */
export const rollIslandOfSkulls = (dice, indices) => {
    // Create a deep copy of the original dice for accurate comparison
    const originalDice = JSON.parse(JSON.stringify(dice));

    // Roll the dice
    const rolledDice = rollDice(dice, indices);

    // Count newly rolled skulls by direct comparison with original state
    const newlyRolledSkulls = indices.reduce((count, index) => {
        if (originalDice[index].face !== 'skull' && rolledDice[index].face === 'skull') {
            return count + 1;
        }
        return count;
    }, 0);

    // Lock all skull dice
    const lockedSkullDice = rolledDice.map(die =>
        die.face === 'skull' ? { ...die, locked: true } : die
    );

    return {
        dice: lockedSkullDice,
        newSkullCount: newlyRolledSkulls
    };
};