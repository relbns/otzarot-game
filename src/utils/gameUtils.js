/**
 * Game Utilities
 * 
 * This file contains utility functions for the game.
 */
import { DICE_FACES } from '../constants';

/**
 * Get a random die face (excluding blank)
 * @returns {string} Random die face
 */
export const getRandomFace = () => {
  const playableFaces = DICE_FACES.filter((face) => face !== 'blank');
  return playableFaces[Math.floor(Math.random() * playableFaces.length)];
};

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
  return faceSymbols[face] || face;
};

/**
 * Calculate the value of a set of dice
 * @param {number} count - Number of dice in the set
 * @returns {number} Value of the set
 */
export const calculateSetValue = (count) => {
  switch (count) {
    case 3: return 100;
    case 4: return 200;
    case 5: return 500;
    case 6: return 1000;
    case 7: return 2000;
    case 8: return 4000;
    default: return 0;
  }
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Create a new deck of cards
 * @param {Array} CARDS - Array of card definitions
 * @returns {Array} New shuffled deck
 */
export const createNewDeck = (CARDS) => {
  let newDeck = [];
  CARDS.forEach(card => {
    for (let i = 0; i < (card.timesShown || 1); i++) {
      newDeck.push({ ...card });
    }
  });
  
  return shuffleArray(newDeck);
};

/**
 * Create initial dice array
 * @param {number} count - Number of dice to create
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
