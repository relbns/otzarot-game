/**
 * Pure scoring logic for Otzarot game
 */

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
 * Count occurrences of each dice face
 * @param {Array} dice - Array of dice objects
 * @returns {Object} Counts of each face
 */
export const countDiceFaces = (dice) => {
    const counts = {
        coin: 0,
        diamond: 0,
        swords: 0,
        monkey: 0,
        parrot: 0,
        skull: 0,
        blank: 0
    };

    dice.forEach(die => {
        if (die.face in counts) {
            counts[die.face]++;
        }
    });

    return counts;
};

/**
 * Calculate basic score from dice counts without card effects
 * @param {Object} diceCounts - Object with counts of each die face
 * @returns {Object} Score details including total and breakdown
 */
export const calculateBasicScore = (diceCounts) => {
    let totalScore = 0;
    const scoreBreakdown = [];

    // Calculate sets (3 or more of a kind)
    Object.entries(diceCounts).forEach(([face, count]) => {
        // Exclude both 'skull' and 'blank' from forming sets
        if (count >= 3 && face !== 'skull' && face !== 'blank') {
            const setScore = calculateSetValue(count);
            totalScore += setScore;
            scoreBreakdown.push({
                type: 'set',
                face,
                count,
                score: setScore
            });
        }
    });

    // Add individual coins and diamonds
    // Per rules: "If in a set, they count BOTH as individual value AND set value"
    if (diceCounts.coin > 0) {
        const coinScore = diceCounts.coin * 100;
        totalScore += coinScore;
        scoreBreakdown.push({
            type: 'individual',
            face: 'coin',
            count: diceCounts.coin,
            score: coinScore
        });
    }

    if (diceCounts.diamond > 0) {
        const diamondScore = diceCounts.diamond * 100;
        totalScore += diamondScore;
        scoreBreakdown.push({
            type: 'individual',
            face: 'diamond',
            count: diceCounts.diamond,
            score: diamondScore
        });
    }

    return {
        score: totalScore,
        breakdown: scoreBreakdown
    };
};

/**
 * Check if player is disqualified (3+ skulls)
 * @param {Object} diceCounts - Object with counts of each die face
 * @returns {boolean} True if disqualified
 */
export const isDisqualified = (diceCounts) => {
    return diceCounts.skull >= 3;
};

/**
 * Calculate score with card effects
 * @param {Object} params - Parameters for score calculation
 * @param {Array} params.dice - Array of dice objects
 * @param {Object} params.card - Card object or null
 * @param {boolean} params.islandOfSkulls - Whether in Island of Skulls
 * @returns {Object} Complete score calculation
 */
export const calculateScore = ({ dice, card, islandOfSkulls }) => {
    // Initialize the result object
    const result = {
        score: 0,
        scoreBreakdown: [],
        penalties: 0,
        penaltyBreakdown: [],
        isDisqualified: false,
        finalScore: 0
    };

    // Count dice faces from actual dice roll
    const diceCounts = countDiceFaces(dice);

    // Add virtual items (skulls, coins, diamonds) from cards to the counts
    // This happens *before* disqualification check and score calculation
    // so they contribute to sets and disqualification rules.
    if (card) {
        if (card.effect === 'start_with_1_skull') {
            diceCounts.skull += 1;
        } else if (card.effect === 'start_with_2_skulls') {
            diceCounts.skull += 2;
        } else if (card.effect === 'start_with_gold') {
            diceCounts.coin += 1;
            // Add a breakdown item to indicate the card's contribution
             result.scoreBreakdown.push({ type: 'card_added_coin', count: 1 });
        } else if (card.effect === 'start_with_diamond') {
            diceCounts.diamond += 1;
            // Add a breakdown item to indicate the card's contribution
             result.scoreBreakdown.push({ type: 'card_added_diamond', count: 1 });
        }
    }

    // Check if disqualified (now includes virtual skulls from cards)
    result.isDisqualified = isDisqualified(diceCounts);

    // Handle Island of Skulls - Player scores 0 on this turn, but penalties might apply
    if (islandOfSkulls) {
        result.score = 0; // Ensure base score is 0 for this turn type
        result.islandOfSkulls = true;
        // Do NOT return early, allow disqualification penalties to be calculated below
    }

    // Handle disqualification (3+ skulls)
    if (result.isDisqualified) {
        result.score = 0; // Explicitly set score to 0 first

        // Special case for Zombie Attack (Victory overrides disqualification)
        if (card?.effect === 'zombie_attack' && diceCounts.swords >= 5) {
            result.score = 1200;
            result.scoreBreakdown.push({
                type: 'zombie_attack_victory',
                swords: diceCounts.swords,
                score: 1200
            });
            result.finalScore = 1200;
            return result;
        }

        // Check for treasure chest card
        if (card?.effect === 'store_dice') {
            const chestDice = dice.filter(d => d.inTreasureChest);
            const chestCounts = countDiceFaces(chestDice);

            if (chestDice.length > 0) {
                const chestScore = calculateBasicScore(chestCounts);
                result.score = chestScore.score;
                result.scoreBreakdown = [
                    { type: 'treasure_chest_saved' },
                    ...chestScore.breakdown
                ];
            }
        }

        // Handle truce card penalty
        if (card?.effect === 'truce' && diceCounts.swords > 0) {
            const penalty = diceCounts.swords * 500;
            result.penalties = penalty;
            result.penaltyBreakdown.push({
                type: 'truce_penalty',
                swords: diceCounts.swords,
                penalty
            });
        }

        // Add penalty for skulls if disqualified AND on Island of Skulls
        if (islandOfSkulls && diceCounts.skull > 0) {
            const skullPenalty = diceCounts.skull * 100; // 100 points per skull penalty on IoS
            result.penalties += skullPenalty;
            result.penaltyBreakdown.push({
                type: 'skull_penalty',
                count: diceCounts.skull,
                penalty: skullPenalty
            });
        }

        // Calculate final score (allowing negatives)
        // If it was Island of Skulls, score is 0, but penalties apply
        result.finalScore = (islandOfSkulls ? 0 : result.score) - result.penalties;
        return result; // Return here for disqualified cases
    }

    // Normal scoring (not disqualified)
    const cardEffect = card?.effect || '';

    // Function to check if all 8 dice contribute to score (for full chest bonus)
    const checkFullChestBonus = () => {
        const contributingDiceCount = dice.filter(d => {
            // Skulls and blanks never contribute
            if (d.face === 'skull' || d.face === 'blank') {
                return false;
            }

            // Coins and diamonds always contribute (individual value)
            if (d.face === 'coin' || d.face === 'diamond') {
                return true;
            }

            // Other faces (monkey, parrot, swords) contribute only if part of a set of 3+
            return diceCounts[d.face] >= 3;
        }).length;

        return contributingDiceCount === 8;
    };

    // Handle different card effects
    switch (cardEffect) {
        case 'double_score': {
            // First calculate the basic score
            const basicScore = calculateBasicScore(diceCounts);
            result.scoreBreakdown = [...basicScore.breakdown];
            result.score = basicScore.score;

            // Add full chest bonus if applicable
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }

            // Now double the total
            result.score = result.score * 2;
            result.scoreBreakdown.push({
                type: 'captain_effect',
                multiplier: 2
            });
            break;
        }

        case 'store_dice': {
            const basicScore = calculateBasicScore(diceCounts);
            result.score = basicScore.score;
            result.scoreBreakdown = basicScore.breakdown;

            // Full chest bonus
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
            break;
        }

        case 'monkey_business': {
            // Combine monkeys and parrots
            const mpCount = diceCounts.monkey + diceCounts.parrot;
            const modifiedCounts = { ...diceCounts, monkey: 0, parrot: 0 };

            if (mpCount >= 3) {
                const mpScore = calculateSetValue(mpCount);
                result.score += mpScore;
                result.scoreBreakdown.push({
                    type: 'monkey_business',
                    count: mpCount,
                    score: mpScore
                });
            }

            const basicScore = calculateBasicScore(modifiedCounts);
            result.score += basicScore.score;
            result.scoreBreakdown = [...result.scoreBreakdown, ...basicScore.breakdown];

            // Full chest bonus
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
            break;
        }

        case 'storm': {
            // Storm: Only sets of Coins and Diamonds score, and they score normally (not doubled).
            let stormScore = 0;
            let contributingDiceCount = 0; // For full chest bonus

            // Calculate score ONLY from Coin and Diamond sets
            ['coin', 'diamond'].forEach(face => {
                const count = diceCounts[face];
                if (count >= 3) {
                    const setScore = calculateSetValue(count);
                    stormScore += setScore;
                    result.scoreBreakdown.push({
                        type: 'set', // Standard set type
                        face,
                        count,
                        score: setScore
                    });
                    contributingDiceCount += count; // Add dice in this set to the count
                }
            });

            result.score = stormScore;
            result.scoreBreakdown.push({ type: 'storm_effect' }); // Indicate storm is active

            // Full chest bonus - if all 8 dice were part of the scoring Coin/Diamond sets
            if (contributingDiceCount === 8) {
                 // Check if ONLY coins and diamonds were present and formed sets
                 const nonCoinDiamondCount = diceCounts.swords + diceCounts.monkey + diceCounts.parrot + diceCounts.skull + diceCounts.blank;
                 if (nonCoinDiamondCount === 0) {
                    result.score += 500;
                    result.scoreBreakdown.push({
                        type: 'full_chest_bonus',
                        bonus: 500
                    });
                 }
            }
            break;
        }

        case 'sea_battle_2':
        case 'sea_battle_3':
        case 'sea_battle_4': {
            const reqSwords = parseInt(cardEffect.slice(-1));
            const bonus = card.bonus || 0;

            // Calculate normal score from other dice
            const basicScore = calculateBasicScore(diceCounts);
            result.score = basicScore.score;
            result.scoreBreakdown = basicScore.breakdown;

            if (diceCounts.swords >= reqSwords) {
                // Success - add bonus
                result.score += bonus;
                result.scoreBreakdown.push({
                    type: 'sea_battle_success',
                    required: reqSwords,
                    actual: diceCounts.swords,
                    bonus
                });

                // Full chest bonus - only if we succeeded
                if (checkFullChestBonus()) {
                    result.score += 500;
                    result.scoreBreakdown.push({
                        type: 'full_chest_bonus',
                        bonus: 500
                    });
                }
            } else {
                // Failure - add penalty (no full chest bonus)
                result.penalties = bonus;
                result.penaltyBreakdown.push({
                    type: 'sea_battle_fail',
                    required: reqSwords,
                    actual: diceCounts.swords,
                    penalty: bonus
                });
            }
            break;
        }

        case 'truce': {
            // Don't count swords for score
            const modifiedCounts = { ...diceCounts, swords: 0 };
            const basicScore = calculateBasicScore(modifiedCounts);
            result.score = basicScore.score;
            result.scoreBreakdown = [
                ...basicScore.breakdown,
                { type: 'truce_effect' }
            ];

            // Full chest bonus - only if all non-sword dice contribute
            const nonSwordDice = dice.filter(d => d.face !== 'swords');
            const nonSwordSkulls = nonSwordDice.filter(d => d.face === 'skull').length;
            const nonSwordBlanks = nonSwordDice.filter(d => d.face === 'blank').length;

            // If all non-sword dice contribute to score
            if (nonSwordDice.length - nonSwordSkulls - nonSwordBlanks === nonSwordDice.length) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
            break;
        }

        case 'midas_touch': {
            // Special handling for coins (doubled)
            if (diceCounts.coin > 0) {
                // For coin sets, still use normal set value
                if (diceCounts.coin >= 3) {
                    const setScore = calculateSetValue(diceCounts.coin);
                    result.score += setScore;
                    result.scoreBreakdown.push({
                        type: 'set',
                        face: 'coin',
                        count: diceCounts.coin,
                        score: setScore
                    });
                }

                // Double the individual coin values
                const coinScore = diceCounts.coin * 200; // 200 per coin instead of 100
                result.score += coinScore;
                result.scoreBreakdown.push({
                    type: 'midas_coins',
                    count: diceCounts.coin,
                    score: coinScore
                });
            }

            // Score other dice normally (excluding coins)
            const nonCoinCounts = { ...diceCounts, coin: 0 };
            const otherBasicScore = calculateBasicScore(nonCoinCounts);
            result.score += otherBasicScore.score;
            result.scoreBreakdown = [...result.scoreBreakdown, ...otherBasicScore.breakdown];

            // Full chest bonus
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
            break;
        }

        case 'diamond_mine': {
            // Special handling for diamonds (tripled)
            if (diceCounts.diamond > 0) {
                // For diamond sets, still use normal set value
                if (diceCounts.diamond >= 3) {
                    const setScore = calculateSetValue(diceCounts.diamond);
                    result.score += setScore;
                    result.scoreBreakdown.push({
                        type: 'set',
                        face: 'diamond',
                        count: diceCounts.diamond,
                        score: setScore
                    });
                }

                // Triple the individual diamond values
                const diamondScore = diceCounts.diamond * 300; // 300 per diamond instead of 100
                result.score += diamondScore;
                result.scoreBreakdown.push({
                    type: 'diamond_mine',
                    count: diceCounts.diamond,
                    score: diamondScore
                });
            }

            // Score other dice normally (excluding diamonds)
            const nonDiamondCounts = { ...diceCounts, diamond: 0 };
            const otherBasicScore = calculateBasicScore(nonDiamondCounts);
            result.score += otherBasicScore.score;
            result.scoreBreakdown = [...result.scoreBreakdown, ...otherBasicScore.breakdown];

            // Full chest bonus
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
            break;
        }

        case 'zombie_attack': {
            // Zombie Attack: Need 5+ Swords to win
            if (diceCounts.swords >= 5) {
                result.score = 1200;
                result.scoreBreakdown.push({
                    type: 'zombie_attack_victory',
                    swords: diceCounts.swords,
                    score: 1200
                });
            } else {
                result.score = 0;
                result.scoreBreakdown.push({
                    type: 'zombie_attack_failed',
                    swords: diceCounts.swords
                });
            }
            break;
        }

        default: {
            // No card effect - basic scoring
            const basicScore = calculateBasicScore(diceCounts);
            result.score = basicScore.score;
            result.scoreBreakdown = basicScore.breakdown;

            // Full chest bonus
            if (checkFullChestBonus()) {
                result.score += 500;
                result.scoreBreakdown.push({
                    type: 'full_chest_bonus',
                    bonus: 500
                });
            }
        }
    }

    // NOTE: The flat bonus addition for gold/diamond cards has been removed.
    // Their value is now incorporated directly into the diceCounts before basic score calculation.

    // Calculate final score (allowing negatives)
    result.finalScore = result.score - result.penalties;
    return result;
};
