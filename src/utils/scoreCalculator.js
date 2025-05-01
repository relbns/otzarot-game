/**
 * Score Calculator
 * 
 * This file contains functions for calculating scores in the game.
 */
import { calculateSetValue } from './gameUtils';
import {
  calculateScore as calculatePureScore
} from '../logic/scoring';

/**
 * Get plural form of a dice face name
 * @param {string} face - The dice face name (e.g., 'coin', 'diamond')
 * @returns {string} Pluralized face name
 */
export const getPluralDiceFace = (face) => {
  if (face === 'swords') {
    return face;
  }
  return face + 's';
};

/**
 * Calculate the base score for a set of dice
 * @param {Object} diceCounts - Object with counts of each die face
 * @param {Array} scoreDescription - Array to add score descriptions to
 * @param {Function} t - Translation function
 * @returns {number} Total score
 */
export const calculateBaseScore = (diceCounts, scoreDescription, t) => {
  let totalScore = 0;

  // Calculate sets (3 or more of a kind)
  Object.entries(diceCounts).forEach(([face, count]) => {
    if (count >= 3 && face !== 'skull') {
      const setScore = calculateSetValue(count);
      totalScore += setScore;
      scoreDescription.push(`${count} ${t(getPluralDiceFace(face))} (${t('set')}): ${setScore} ${t('points')}`);
    }
  });

  // Add individual coins and diamonds
  if (diceCounts.coin > 0) {
    const coinScore = diceCounts.coin * 100;
    totalScore += coinScore;
    scoreDescription.push(`${diceCounts.coin} ${t('coins')} (${t('individual')}): ${coinScore} ${t('points')}`);
  }

  if (diceCounts.diamond > 0) {
    const diamondScore = diceCounts.diamond * 100;
    totalScore += diamondScore;
    scoreDescription.push(`${diceCounts.diamond} ${t('diamonds')} (${t('individual')}): ${diamondScore} ${t('points')}`);
  }

  return totalScore;
};

/**
 * Calculate score for a turn based on dice and card effects
 * @param {Object} params - Parameters for score calculation
 * @param {Array} params.currentDice - Current dice
 * @param {Object} params.currentCard - Current card
 * @param {boolean} params.islandOfSkulls - Whether in Island of Skulls
 * @param {Function} params.t - Translation function
 * @param {Array} params.DICE_FACES - Array of possible dice faces
 * @param {Array} [params.players] - Array of players (needed for zombie attack)
 * @param {number} [params.activePlayer] - Index of active player (needed for zombie attack)
 * @returns {Object} Score information
 */
export const calculateTurnScore_old = ({
  currentDice,
  currentCard,
  islandOfSkulls,
  t,
  DICE_FACES,
  players,
  activePlayer
}) => {
  // Initialize counters
  const combinedCounts = {};
  DICE_FACES.forEach(face => combinedCounts[face] = 0);

  // Count dice faces
  currentDice.forEach(die => {
    if (die.face !== 'blank') {
      combinedCounts[die.face]++;
    }
  });

  let score = 0;
  let scoreDescription = [];
  let penalties = 0;
  let penaltyDescription = [];
  let updatedPlayers = players ? [...players] : null;

  const isDisqualified = combinedCounts.skull >= 3;

  // Handle Island of Skulls
  if (islandOfSkulls) {
    score = 0;
    scoreDescription.push(t('island_of_skulls_no_score'));
    return {
      score,
      scoreDescription,
      penalties,
      penaltyDescription,
      isDisqualified,
      updatedPlayers,
      finalScore: 0
    };
  }

  // Handle disqualification (3+ skulls)
  if (isDisqualified) {
    score = 0;

    // Check for treasure chest card
    if (currentCard?.effect === 'store_dice') {
      const chestCounts = {};
      DICE_FACES.forEach(f => chestCounts[f] = 0);

      currentDice.forEach(d => {
        if (d.inTreasureChest) {
          chestCounts[d.face]++;
        }
      });

      if (Object.values(chestCounts).some(c => c > 0)) {
        scoreDescription.push(t('treasure_chest_saved_log'));
        score = calculateBaseScore(chestCounts, scoreDescription, t);
      } else {
        scoreDescription.push(t('disqualified_no_points'));
      }
    } else {
      scoreDescription.push(t('disqualified_no_points'));
    }

    // Handle truce card penalty
    if (currentCard?.effect === 'truce' && combinedCounts.swords > 0) {
      penalties += combinedCounts.swords * 500;
      penaltyDescription.push(
        `${t('truce_penalty_log')} (${combinedCounts.swords} ${t('swords')}): -${combinedCounts.swords * 500} ${t('points')}`
      );
    }

    return {
      score,
      scoreDescription,
      penalties,
      penaltyDescription,
      isDisqualified,
      updatedPlayers,
      finalScore: Math.max(0, score - penalties)
    };
  }

  // Normal scoring (not disqualified)
  const cardEffect = currentCard?.effect;
  let tempCounts = { ...combinedCounts };

  // Handle special cases for Gold and Diamond cards
  if (cardEffect === 'start_with_gold' || cardEffect === 'start_with_diamond') {
    // These cards should be treated as normal scoring
    score = calculateBaseScore(tempCounts, scoreDescription, t);
  } else if (cardEffect) {
    // Handle different card effects
    switch (cardEffect) {
      case 'double_score':
        score = calculateBaseScore(tempCounts, scoreDescription, t) * 2;
        scoreDescription.push(`${t('captain_effect')}: ${t('score_doubled')}`);
        break;

      case 'store_dice':
        score = calculateBaseScore(tempCounts, scoreDescription, t);
        break;

      case 'monkey_business':
        const mpCount = tempCounts.monkey + tempCounts.parrot;
        let mpScore = 0;

        if (mpCount >= 3) {
          mpScore = calculateSetValue(mpCount);
          scoreDescription.push(`${mpCount} ${t('monkey')}/${t('parrot')} (${t('set')}): ${mpScore} ${t('points')}`);
        }

        score += mpScore;
        tempCounts.monkey = 0;
        tempCounts.parrot = 0;
        score += calculateBaseScore(tempCounts, scoreDescription, t);
        break;

      case 'storm':
        // Storm card: ONLY Gold/Diamonds count (200 pts each)
        if (tempCounts.coin > 0) {
          score += tempCounts.coin * 200;
          scoreDescription.push(`${tempCounts.coin} ${t('coins')} (${t('doubled')}): ${tempCounts.coin * 200} ${t('points')}`);
        }

        if (tempCounts.diamond > 0) {
          score += tempCounts.diamond * 200;
          scoreDescription.push(`${tempCounts.diamond} ${t('diamonds')} (${t('doubled')}): ${tempCounts.diamond * 200} ${t('points')}`);
        }

        // No other dice contribute to score in Storm
        scoreDescription.push(`${t('storm_effect')}: ${t('only_coins_diamonds_count')}`);
        break;

      case 'sea_battle_2':
      case 'sea_battle_3':
      case 'sea_battle_4':
        const reqSwords = parseInt(cardEffect.slice(-1));
        const bonus = currentCard.bonus || 0;

        // Calculate normal score from other dice
        const normalScore = calculateBaseScore(tempCounts, scoreDescription, t);

        if (tempCounts.swords >= reqSwords) {
          // Success - add bonus to normal score
          score = normalScore + bonus;
          scoreDescription.push(`${t('sea_battle_success')} (${reqSwords} ${t('swords')}): ${bonus} ${t('points')}`);
        } else {
          // Failure - still get normal score but with penalty
          score = normalScore;
          penalties = bonus;
          penaltyDescription.push(
            `${t('sea_battle_fail')} (${t('needed')} ${reqSwords}, ${t('got')} ${tempCounts.swords}): -${bonus} ${t('points')}`
          );
        }
        break;

      case 'truce':
        tempCounts.swords = 0;
        score = calculateBaseScore(tempCounts, scoreDescription, t);
        scoreDescription.push(`${t('truce_effect')}: ${t('swords_no_score')}`);
        break;

      case 'midas_touch':
        let midasScore = 0;

        if (tempCounts.coin > 0) {
          midasScore += tempCounts.coin * 200;
          scoreDescription.push(`${tempCounts.coin} ${t('coins')} (${t('doubled')}): ${tempCounts.coin * 200} ${t('points')}`);
        }

        // Calculate sets with other dice (excluding coins)
        const tempCountsWithoutCoins = { ...tempCounts, coin: 0 };
        midasScore += calculateBaseScore(tempCountsWithoutCoins, scoreDescription, t);
        score = midasScore;
        break;

      case 'diamond_mine':
        let dmScore = 0;

        if (tempCounts.diamond > 0) {
          dmScore += tempCounts.diamond * 300;
          scoreDescription.push(`${tempCounts.diamond} ${t('diamonds')} (${t('tripled')}): ${tempCounts.diamond * 300} ${t('points')}`);
        }

        // Calculate sets with other dice (excluding diamonds)
        const tempCountsWithoutDiamonds = { ...tempCounts, diamond: 0 };
        dmScore += calculateBaseScore(tempCountsWithoutDiamonds, scoreDescription, t);
        score = dmScore;
        break;

      case 'zombie_attack':
        // Zombie Attack: Need 5+ Swords to win 1200 pts; else opponents share it
        if (tempCounts.swords >= 5) {
          score = 1200;
          scoreDescription.push(`${t('zombie_attack_victory')} (${tempCounts.swords} ${t('swords')}): 1200 ${t('points')}`);
        } else {
          score = 0;

          // If players array is provided, distribute points to opponents
          if (players && activePlayer !== undefined && players.length > 1) {
            const oppCount = players.length - 1;
            const ptsPerOpp = Math.floor(1200 / oppCount);

            penaltyDescription.push(`${t('zombie_attack_failed')}: ${t('opponents_share_points')}`);

            // Update opponents' scores
            updatedPlayers = players.map((p, i) =>
              i !== activePlayer
                ? { ...p, score: p.score + ptsPerOpp }
                : p
            );
          }
        }
        break;

      default:
        score = calculateBaseScore(tempCounts, scoreDescription, t);
        break;
    }
  } else {
    // No card effect
    score = calculateBaseScore(combinedCounts, scoreDescription, t);
  }

  // Check for full chest bonus - only if all 8 dice are used to generate points
  const canApplyFullChest = !isDisqualified && !islandOfSkulls &&
    !['sea_battle_2', 'sea_battle_3', 'sea_battle_4', 'zombie_attack'].includes(currentCard?.effect);

  if (canApplyFullChest && score > 0) {
    // Count how many dice are actually contributing to the score
    let contributingDiceCount = 0;

    // Count dice based on card effect
    if (currentCard?.effect === 'storm') {
      // In storm, only coins and diamonds count
      contributingDiceCount = combinedCounts.coin + combinedCounts.diamond;
    } else if (currentCard?.effect === 'truce') {
      // In truce, swords don't count
      contributingDiceCount = currentDice.filter(d =>
        d.face !== 'skull' && d.face !== 'swords' && d.face !== 'blank'
      ).length;
    } else if (currentCard?.effect === 'monkey_business') {
      // In monkey business, monkeys and parrots count together
      const nonMonkeyParrotCount = currentDice.filter(d =>
        d.face !== 'skull' && d.face !== 'monkey' && d.face !== 'parrot' && d.face !== 'blank'
      ).length;

      // Only count monkeys and parrots once if they form a set
      const monkeyParrotCount = combinedCounts.monkey + combinedCounts.parrot;
      const effectiveDiceCount = monkeyParrotCount >= 3 ? monkeyParrotCount : 0;

      contributingDiceCount = nonMonkeyParrotCount + effectiveDiceCount;
    } else {
      // Normal scoring - count all non-skull dice that contribute to score
      contributingDiceCount = currentDice.filter(d =>
        d.face !== 'skull' && d.face !== 'blank'
      ).length;
    }

    // Apply full chest bonus only if all 8 dice are used
    if (contributingDiceCount === 8) {
      score += 500;
      scoreDescription.push(`${t('full_chest_bonus')}: 500 ${t('points')}`);
    }
  }

  const finalScore = Math.max(0, score - penalties);

  return {
    score,
    scoreDescription,
    penalties,
    penaltyDescription,
    isDisqualified,
    updatedPlayers,
    finalScore
  };
};


/**
 * Calculate score for a turn based on dice and card effects
 * @param {Object} params - Parameters for score calculation
 * @param {Array} params.currentDice - Current dice
 * @param {Object} params.currentCard - Current card
 * @param {boolean} params.islandOfSkulls - Whether in Island of Skulls
 * @param {Function} params.t - Translation function
 * @param {Array} params.DICE_FACES - Array of possible dice faces
 * @param {Array} [params.players] - Array of players (needed for zombie attack)
 * @param {number} [params.activePlayer] - Index of active player (needed for zombie attack)
 * @returns {Object} Score information
 */
export const calculateTurnScore = ({
  currentDice,
  currentCard,
  islandOfSkulls,
  t,
  DICE_FACES,
  players,
  activePlayer
}) => {
  // Use the pure function for calculation
  const result = calculatePureScore({
    dice: currentDice,
    card: currentCard,
    islandOfSkulls
  });

  // Convert the result to the format expected by the current code
  let scoreDescription = [];
  let penaltyDescription = [];
  let updatedPlayers = players ? [...players] : null;

  // Create text descriptions from the breakdown
  result.scoreBreakdown.forEach(item => {
    switch (item.type) {
      case 'set':
        scoreDescription.push(`${item.count} ${t(getPluralDiceFace(item.face))} (${t('set')}): ${item.score} ${t('points')}`);
        break;
      case 'individual':
        scoreDescription.push(`${item.count} ${t(getPluralDiceFace(item.face))} (${t('individual')}): ${item.score} ${t('points')}`);
        break;
      case 'captain_effect':
        scoreDescription.push(`${t('captain_effect')}: ${t('score_doubled')}`);
        break;
      case 'storm_effect':
        scoreDescription.push(`${t('storm_effect')}: ${t('only_coins_diamonds_count')}`);
        break;
      case 'storm_coins':
        scoreDescription.push(`${item.count} ${t('coins')} (${t('doubled')}): ${item.score} ${t('points')}`);
        break;
      case 'storm_diamonds':
        scoreDescription.push(`${item.count} ${t('diamonds')} (${t('doubled')}): ${item.score} ${t('points')}`);
        break;
      case 'monkey_business':
        scoreDescription.push(`${item.count} ${t('monkey')}/${t('parrot')} (${t('set')}): ${item.score} ${t('points')}`);
        break;
      case 'midas_coins':
        scoreDescription.push(`${item.count} ${t('coins')} (${t('doubled')}): ${item.score} ${t('points')}`);
        break;
      case 'diamond_mine':
        scoreDescription.push(`${item.count} ${t('diamonds')} (${t('tripled')}): ${item.score} ${t('points')}`);
        break;
      case 'sea_battle_success':
        scoreDescription.push(`${t('sea_battle_success')} (${item.required} ${t('swords')}): ${item.bonus} ${t('points')}`);
        break;
      case 'zombie_attack_victory':
        scoreDescription.push(`${t('zombie_attack_victory')} (${item.swords} ${t('swords')}): 1200 ${t('points')}`);
        break;
      case 'full_chest_bonus':
        scoreDescription.push(`${t('full_chest_bonus')}: 500 ${t('points')}`);
        break;
      case 'truce_effect':
        scoreDescription.push(`${t('truce_effect')}: ${t('swords_no_score')}`);
        break;
       case 'treasure_chest_saved':
         scoreDescription.push(t('treasure_chest_saved_log'));
         break;
       case 'card_added_coin':
         scoreDescription.push(t('card_added_coin', 'Card adds 1 Coin')); // Added default text
         break;
       case 'card_added_diamond':
         scoreDescription.push(t('card_added_diamond', 'Card adds 1 Diamond')); // Added default text
         break;
      case 'set_doubled': // Handle the new type for doubled sets in Storm
        scoreDescription.push(`${item.count} ${t(getPluralDiceFace(item.face))} (${t('doubled')}): ${item.score} ${t('points')}`);
        break;
       // Removed card_bonus_gold and card_bonus_diamond cases
       // Add more cases as needed
     }
   });

  // Create penalty descriptions
  result.penaltyBreakdown.forEach(item => {
    switch (item.type) {
      case 'sea_battle_fail':
        penaltyDescription.push(
          `${t('sea_battle_fail')} (${t('needed')} ${item.required}, ${t('got')} ${item.actual}): -${item.penalty} ${t('points')}`
        );
        break;
      case 'truce_penalty':
        penaltyDescription.push(
          `${t('truce_penalty_log')} (${item.swords} ${t('swords')}): -${item.penalty} ${t('points')}`
        );
        break;
      case 'sea_battle_fail_disqualified':
         penaltyDescription.push(
            `${t('sea_battle_fail_disqualified_log')}: -${item.penalty} ${t('points')}` // Needs new translation key
          );
          break;
      case 'skull_penalty':
        penaltyDescription.push(
          `${item.count} ${t('skulls')}: -${item.penalty} ${t('points')}`
        );
        break;
      // Add more cases as needed
    }
  });

  // Handle zombie attack distribution (if needed)
  if (result.scoreBreakdown.some(item => item.type === 'zombie_attack_failed') &&
    players && activePlayer !== undefined && players.length > 1) {
    const oppCount = players.length - 1;
    const ptsPerOpp = Math.floor(1200 / oppCount);

    // Update opponents' scores
    updatedPlayers = players.map((p, i) =>
      i !== activePlayer
        ? { ...p, score: p.score + ptsPerOpp }
        : p
    );
  }

  return {
    score: result.score,
    scoreDescription,
    penalties: result.penalties,
    penaltyDescription,
    isDisqualified: result.isDisqualified,
    updatedPlayers,
    finalScore: result.finalScore
  };
};
