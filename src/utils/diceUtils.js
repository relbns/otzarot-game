/**
 * Dice Utilities
 * 
 * Helper functions for dice visualization and rendering.
 */
import { getRandomFace } from '../logic/dice';

/**
 * Render a die face as an emoji
 * @param {string} face - Die face to render
 * @returns {string} Emoji representation of the die face
 */
export const renderDieFace = (face) => {
    const faceSymbols = {
        coin: '🪙',
        diamond: '💎',
        swords: '⚔️',
        monkey: '🐒',
        parrot: '🦜',
        skull: '💀',
        blank: ''
    };
    if (face === 'blank') {
        return '';
    }
    return faceSymbols[face] || face;
};

/**
 * Generate a sequence of die faces for animation
 * @param {number} frames - Number of animation frames
 * @param {string} finalFace - Final face to show (optional)
 * @returns {Array} Array of faces for animation
 */
export const generateDiceAnimation = (frames = 8, finalFace = null) => {
    const sequence = [];
    for (let i = 0; i < frames - 1; i++) {
        sequence.push(getRandomFace());
    }
    sequence.push(finalFace || getRandomFace());
    return sequence;
};

/**
 * Check if a die can be selected
 * @param {Object} die - Die object
 * @param {boolean} isSorceressAvailable - Whether sorceress ability is available
 * @returns {boolean} Whether the die can be selected
 */
export const canSelectDie = (die, isSorceressAvailable = false) => {
    // Cannot select locked dice (unless it's a skull with sorceress)
    if (die.locked && !(die.face === 'skull' && isSorceressAvailable)) {
        return false;
    }

    // Cannot select dice in treasure chest
    if (die.inTreasureChest) {
        return false;
    }

    // Cannot select skulls without sorceress
    if (die.face === 'skull' && !isSorceressAvailable) {
        return false;
    }

    return true;
};

/**
 * Check if a die can be put in treasure chest
 * @param {Object} die - Die object
 * @param {boolean} hasTreasureChest - Whether treasure chest card is active
 * @returns {boolean} Whether the die can be put in treasure chest
 */
export const canPutInTreasureChest = (die, hasTreasureChest) => {
    return hasTreasureChest && die.face !== 'skull' && !die.locked;
};

/**
 * Get the state description of a die
 * @param {Object} die - Die object
 * @returns {string} State description ('locked', 'chest', 'selected', or 'normal')
 */
export const getDieState = (die) => {
    if (die.locked) return 'locked';
    if (die.inTreasureChest) return 'chest';
    if (die.selected) return 'selected';
    return 'normal';
};

/**
 * Check if all dice are properly used (for full chest bonus)
 * @param {Array} dice - Array of dice objects
 * @returns {boolean} Whether all dice contribute to score
 */
export const areAllDiceUsed = (dice) => {
    return dice.every(die => {
        // Skulls and blanks never contribute
        if (die.face === 'skull' || die.face === 'blank') {
            return false;
        }

        // Coins and diamonds always contribute (individual value)
        if (die.face === 'coin' || die.face === 'diamond') {
            return true;
        }

        // Other faces (monkey, parrot, swords) contribute only if part of a set of 3+
        const facesCount = dice.filter(d => d.face === die.face).length;
        return facesCount >= 3;
    });
};

/**
 * Determine if player is disqualified (3+ skulls)
 * @param {Array} dice - Array of dice objects
 * @returns {boolean} Whether player is disqualified
 */
export const isPlayerDisqualified = (dice) => {
    const skullCount = dice.filter(die => die.face === 'skull').length;
    return skullCount >= 3;
};

/**
 * Get CSS classes for die based on its state
 * @param {Object} die - Die object
 * @param {boolean} isSelected - Whether die is selected for reroll
 * @param {boolean} isSorceressAvailable - Whether sorceress ability is available
 * @returns {Object} CSS classes object
 */
export const getDieClasses = (die, isSelected, isSorceressAvailable = false) => {
    const isRerollableSkull = die.face === 'skull' && isSorceressAvailable;

    return {
        die: true,
        'die--locked': die.locked && !die.inTreasureChest,
        'die--chest': die.inTreasureChest,
        'die--selected': isSelected,
        'die--skull': die.face === 'skull',
        'die--rerollable': canSelectDie(die, isSorceressAvailable),
        'die--sorceress-skull': isRerollableSkull
    };
};