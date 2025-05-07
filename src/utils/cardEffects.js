/**
 * Card Effects Handler
 * 
 * This file contains functions for handling card effects in the game.
 */
import { getRandomFace } from './gameUtils';

/**
 * Apply initial card effects when a card is drawn
 * @param {Object} params - Parameters for handling card effects
 * @param {Object} params.card - The card that was drawn
 * @param {Array} params.currentDice - Current dice array
 * @param {Function} params.addToLog - Function to add to game log
 * @param {Function} params.t - Translation function
 * @param {string} params.playerName - Name of the active player
 * @returns {Object} Object containing updated dice and state changes
 */
export const handleInitialCardEffects = ({
  card,
  currentDice,
  addToLog,
  t,
  playerName
}) => {
  if (!card) return { newDice: currentDice, modifiedDice: false };
  
  let newDice = [...currentDice];
  let modifiedDice = false;
  let skullsAdded = 0;
  
  switch (card.effect) {
    case 'start_with_gold':
      // This card effect is handled purely in scoring, no dice modification needed here.
      // We keep modifiedDice = false so processCardEffectDice isn't triggered unnecessarily.
      modifiedDice = false; 
      // Original logic that modified dice visually (removed):
      // for (let i = 0; i < newDice.length; i++) {
      //   if (newDice[i].face === 'blank') {
      //     newDice[i] = { 
      //       ...newDice[i], 
      //       face: 'coin', 
      //       locked: false, 
      //       lockedByCard: true 
      //     };
      //     modifiedDice = true;
      //     break;
      //   }
      // }
      addToLog(`${playerName} ${t('start_with_gold')}`);
      break;

    case 'start_with_diamond':
      // This card effect is handled purely in scoring, no dice modification needed here.
      modifiedDice = false;
      // Original logic that modified dice visually (removed):
      // for (let i = 0; i < newDice.length; i++) {
      //   if (newDice[i].face === 'blank') {
      //     newDice[i] = {
      //       ...newDice[i],
      //       face: 'diamond',
      //       locked: false,
      //       lockedByCard: true
      //     };
      //     modifiedDice = true;
      //     break;
      //   }
      // } // <-- Correctly placed closing brace for comment
      addToLog(`${playerName} ${t('start_with_diamond')}`);
      break;

    case 'start_with_1_skull':
      // This card effect is handled purely in scoring (disqualification check), no dice modification needed here.
      modifiedDice = false;
      skullsAdded = 0; // Skulls are added virtually in scoring logic
      // Original logic that modified dice visually (removed):
      // for (let i = 0; i < newDice.length; i++) {
      //   if (newDice[i].face === 'blank') {
      //     newDice[i] = {
      //       ...newDice[i],
      //       face: 'skull',
      //       locked: true
      //     };
      //     modifiedDice = true;
      //     skullsAdded = 1;
      //     break;
      //   }
      // }
      addToLog(`${playerName} ${t('start_with_1_skull')}`);
      break;

    case 'start_with_2_skulls':
      // This card effect is handled purely in scoring (disqualification check), no dice modification needed here.
      modifiedDice = false;
      skullsAdded = 0; // Skulls are added virtually in scoring logic
      // Original logic that modified dice visually (removed):
      // skullsAdded = 0;
      // for (let i = 0; i < newDice.length && skullsAdded < 2; i++) {
      //   if (newDice[i].face === 'blank') {
      //     newDice[i] = {
      //       ...newDice[i],
      //       face: 'skull',
      //       locked: true
      //     };
      //     skullsAdded++;
      //     modifiedDice = true;
      //   }
      // }
      addToLog(`${playerName} ${t('start_with_2_skulls')}`);
      break;
      
    default:
      break;
  }
  
  return { 
    newDice, 
    modifiedDice, 
    skullsAdded 
  };
};

/**
 * Process dice after initial card effects
 * @param {Object} params - Parameters for processing dice
 * @param {Array} params.dice - Dice to process
 * @param {Function} params.addToLog - Function to add to game log
 * @param {Function} params.t - Translation function
 * @param {string} params.playerName - Name of the active player
 * @returns {Object} Object containing updated dice and state changes
 */
export const processCardEffectDice = ({
  dice,
  addToLog,
  t,
  playerName
}) => {
  // Roll any blank dice
  const rolledDice = dice.map(die => 
    (die.face === 'blank' && !die.locked) 
      ? { ...die, face: getRandomFace() } 
      : die
  );
  
  // Count skulls
  const currentSkulls = rolledDice.filter(d => d.face === 'skull').length;
  
  let gamePhase = 'decision';
  let turnEndsWithSkulls = false;
  let autoEndCountdown = 0;
  
  // Check for 3+ skulls
  if (currentSkulls >= 3) {
    // Lock all skull dice
    const lockedDice = rolledDice.map(die => 
      die.face === 'skull' 
        ? { ...die, locked: true } 
        : die
    );
    
    turnEndsWithSkulls = true;
    autoEndCountdown = 5;
    gamePhase = 'resolution';
    
    addToLog(
      `${playerName} ${t('rolled')} ${currentSkulls} ${t('skulls')} ${t('from_card')}! ${t('turn_ends')}.`
    );
    
    return {
      rolledDice: lockedDice,
      currentSkulls,
      gamePhase,
      turnEndsWithSkulls,
      autoEndCountdown,
      shouldCalculateScore: true
    };
  }
  
  return {
    rolledDice,
    currentSkulls,
    gamePhase,
    turnEndsWithSkulls,
    autoEndCountdown,
    shouldCalculateScore: false
  };
};

/**
 * Handle Island of Skulls dice roll
 * @param {Object} params - Parameters for handling Island of Skulls
 * @param {Array} params.currentDice - Current dice
 * @param {Array} params.diceToRollIndexes - Indices of dice to roll
 * @param {Object} params.currentCard - Current card
 * @param {Function} params.addToLog - Function to add to game log
 * @param {Function} params.t - Translation function
 * @param {string} params.playerName - Name of the active player
 * @param {Array} params.players - Array of players (though not used for direct updates anymore)
 * @param {number} params.activePlayer - Index of active player (though not used for direct updates anymore)
 * @returns {Object} Object containing updated state, including newlyRolledSkulls
 */
export const handleIslandOfSkullsRoll = ({
  currentDice,
  diceToRollIndexes,
  // currentCard, // Not needed here for penalty calculation anymore
  addToLog,
  t,
  playerName
  // players, // Not directly modified here anymore
  // activePlayer // Not directly modified here anymore
}) => {
  // Roll non-skull, non-locked dice
  const newDiceRolled = currentDice.map((die, i) =>
    (diceToRollIndexes.includes(i) && !die.locked && !die.inTreasureChest && die.face !== 'skull')
      ? { ...die, face: getRandomFace(), selected: false }
      : die
  );
  
  // Count newly rolled skulls from this specific roll
  const newlyRolledSkulls = newDiceRolled.filter(
    (d, i) => diceToRollIndexes.includes(i) && d.face === 'skull' && currentDice[i].face !== 'skull'
  ).length;
  // A more precise count of *new* skulls:
  // const newlyRolledSkulls = newDiceRolled.reduce((count, die, i) => {
  //   if (diceToRollIndexes.includes(i) && die.face === 'skull' && currentDice[i].face !== 'skull') {
  //     return count + 1;
  //   }
  //   return count;
  // }, 0);


  let gamePhase = 'decision'; // Assume player continues rolling
  let shouldEndIoSRolling = false;
  
  if (newlyRolledSkulls === 0) {
    // No new skulls rolled, IoS rolling phase ends
    addToLog(`${playerName} ${t('no_skulls_in_island')}. ${t('island_turn_ends_rolling')}.`);
    gamePhase = 'resolution'; // Indicates rolling part is done
    shouldEndIoSRolling = true;
  } else {
    // New skulls rolled, player continues
    addToLog(`${playerName} ${t('rolled')} ${newlyRolledSkulls} ${t('new_skulls_on_island')}.`);
  }
  
  // Lock all skull dice (including newly rolled ones)
  const lockedSkullDice = newDiceRolled.map(d => 
    d.face === 'skull' ? { ...d, locked: true } : d
  );
  
  return {
    newDice: lockedSkullDice, // The state of dice after this roll
    gamePhase,                // 'decision' to continue IoS, 'resolution' if IoS rolling ends
    newlyRolledSkulls,        // Skulls from THIS roll, to be accumulated
    shouldEndIoSRolling       // True if no new skulls were rolled
    // updatedPlayers is removed, no direct score changes here
    // shouldCalculateScore is effectively replaced by shouldEndIoSRolling or gamePhase='resolution'
  };
};
