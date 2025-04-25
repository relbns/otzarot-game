import {
    calculateSetValue,
    countDiceFaces,
    calculateBasicScore,
    isDisqualified,
    calculateScore
} from '../scoring';

describe('Scoring Logic', () => {
    describe('calculateSetValue', () => {
        test('returns correct values for different set sizes', () => {
            expect(calculateSetValue(3)).toBe(100);
            expect(calculateSetValue(4)).toBe(200);
            expect(calculateSetValue(5)).toBe(500);
            expect(calculateSetValue(6)).toBe(1000);
            expect(calculateSetValue(7)).toBe(2000);
            expect(calculateSetValue(8)).toBe(4000);
            expect(calculateSetValue(2)).toBe(0); // Not a valid set
        });
    });

    describe('countDiceFaces', () => {
        test('counts occurrences of each dice face', () => {
            const dice = [
                { id: 1, face: 'coin', locked: false },
                { id: 2, face: 'coin', locked: false },
                { id: 3, face: 'diamond', locked: false },
                { id: 4, face: 'sword', locked: false },
                { id: 5, face: 'monkey', locked: false },
                { id: 6, face: 'parrot', locked: false },
                { id: 7, face: 'skull', locked: true },
                { id: 8, face: 'blank', locked: false }
            ];

            const result = countDiceFaces(dice);

            expect(result.coin).toBe(2);
            expect(result.diamond).toBe(1);
            expect(result.swords).toBe(0); // Not found due to typo 'sword' vs 'swords'
            expect(result.monkey).toBe(1);
            expect(result.parrot).toBe(1);
            expect(result.skull).toBe(1);
            expect(result.blank).toBe(1);
        });
    });

    describe('calculateBasicScore', () => {
        test('calculates sets and individual coins/diamonds', () => {
            const counts = {
                coin: 3,
                diamond: 2,
                swords: 0,
                monkey: 0,
                parrot: 0,
                skull: 0,
                blank: 0
            };

            const result = calculateBasicScore(counts);

            // 3 coins as a set (100) + 3 individual coins (300) + 2 individual diamonds (200)
            expect(result.score).toBe(600);
            expect(result.breakdown).toHaveLength(3);

            // Check first entry - set of 3 coins
            expect(result.breakdown[0].type).toBe('set');
            expect(result.breakdown[0].face).toBe('coin');
            expect(result.breakdown[0].count).toBe(3);
            expect(result.breakdown[0].score).toBe(100);

            // Check second entry - 3 individual coins
            expect(result.breakdown[1].type).toBe('individual');
            expect(result.breakdown[1].face).toBe('coin');
            expect(result.breakdown[1].count).toBe(3);
            expect(result.breakdown[1].score).toBe(300);

            // Check third entry - 2 individual diamonds
            expect(result.breakdown[2].type).toBe('individual');
            expect(result.breakdown[2].face).toBe('diamond');
            expect(result.breakdown[2].count).toBe(2);
            expect(result.breakdown[2].score).toBe(200);
        });
    });

    describe('isDisqualified', () => {
        test('returns true with 3 or more skulls', () => {
            expect(isDisqualified({ skull: 3, coin: 2, diamond: 1, swords: 1, monkey: 0, parrot: 0, blank: 1 })).toBe(true);
            expect(isDisqualified({ skull: 4, coin: 1, diamond: 1, swords: 1, monkey: 0, parrot: 1, blank: 0 })).toBe(true);
        });

        test('returns false with fewer than 3 skulls', () => {
            expect(isDisqualified({ skull: 2, coin: 2, diamond: 1, swords: 1, monkey: 1, parrot: 1, blank: 0 })).toBe(false);
            expect(isDisqualified({ skull: 0, coin: 3, diamond: 2, swords: 1, monkey: 1, parrot: 1, blank: 0 })).toBe(false);
        });
    });

    describe('calculateScore', () => {
        // Helper function to create dice array for testing
        const createDice = (faces) => {
            return faces.map((face, id) => ({
                id,
                face,
                locked: face === 'skull',
                inTreasureChest: false
            }));
        };

        test('basic scoring without card effects', () => {
            const dice = createDice(['coin', 'coin', 'coin', 'diamond', 'diamond', 'swords', 'monkey', 'parrot']);
            const result = calculateScore({ dice, card: null, islandOfSkulls: false });

            // 3 coins as set (100) + 3 individual coins (300) + 2 individual diamonds (200) = 600
            expect(result.score).toBe(600);
            expect(result.isDisqualified).toBe(false);
            expect(result.finalScore).toBe(600);
        });

        test('disqualification with 3 skulls', () => {
            const dice = createDice(['skull', 'skull', 'skull', 'diamond', 'diamond', 'swords', 'monkey', 'parrot']);
            const result = calculateScore({ dice, card: null, islandOfSkulls: false });

            expect(result.score).toBe(0);
            expect(result.isDisqualified).toBe(true);
            expect(result.finalScore).toBe(0);
        });

        test('captain card doubles score', () => {
            const dice = createDice(['coin', 'coin', 'coin', 'diamond', 'diamond', 'swords', 'monkey', 'parrot']);
            const card = { effect: 'double_score', name: 'Captain' };

            const result = calculateScore({ dice, card, islandOfSkulls: false });

            // (100 + 300 + 200) * 2 = 1200
            expect(result.score).toBe(1200);
            expect(result.isDisqualified).toBe(false);
            expect(result.finalScore).toBe(1200);
        });

        test('monkey business card combines monkeys and parrots', () => {
            const dice = createDice(['monkey', 'monkey', 'parrot', 'parrot', 'parrot', 'coin', 'diamond', 'swords']);
            const card = { effect: 'monkey_business', name: 'Monkey Business' };

            const result = calculateScore({ dice, card, islandOfSkulls: false });

            // 5 monkey/parrot combined (500) + 1 coin (100) + 1 diamond (100) = 700
            expect(result.score).toBe(700);
            expect(result.isDisqualified).toBe(false);
            expect(result.finalScore).toBe(700);
        });

        // Test for treasure chest card
        test('treasure chest card protects dice from disqualification', () => {
            // Create dice with 3 skulls (would normally disqualify)
            const dice = createDice(['skull', 'skull', 'skull', 'coin', 'coin', 'diamond', 'diamond', 'parrot']);

            // Put some dice in treasure chest
            const diceWithChest = dice.map((die, i) =>
                i >= 3 && i <= 6 ? { ...die, inTreasureChest: true } : die
            );

            const card = { effect: 'store_dice', name: 'Treasure Chest' };

            const result = calculateScore({ dice: diceWithChest, card, islandOfSkulls: false });

            // Even with 3 skulls, we should get score from treasure chest dice
            // 2 coins (200) + 2 diamonds (200) = 400
            expect(result.isDisqualified).toBe(true);
            expect(result.score).toBe(400);
            expect(result.finalScore).toBe(400);
        });

        // Test for storm card
        test('storm card scores only coins and diamonds (doubled)', () => {
            const dice = createDice(['coin', 'coin', 'diamond', 'parrot', 'parrot', 'parrot', 'swords', 'monkey']);
            const card = { effect: 'storm', name: 'Storm' };

            const result = calculateScore({ dice, card, islandOfSkulls: false });

            // Only coins and diamonds count, doubled: 2 coins × 200 + 1 diamond × 200 = 600
            expect(result.score).toBe(600);
            expect(result.finalScore).toBe(600);

            // Other dice should not contribute to score
            const breakdownTypes = result.scoreBreakdown.map(item => item.type);
            expect(breakdownTypes).toContain('storm_coins');
            expect(breakdownTypes).toContain('storm_diamonds');
            expect(breakdownTypes).not.toContain('set'); // No sets should be counted
        });

        // Test for sea battle cards
        test('sea battle card with required swords', () => {
            // Success case - enough swords
            const successDice = createDice(['swords', 'swords', 'swords', 'coin', 'coin', 'diamond', 'monkey', 'parrot']);
            const card = {
                effect: 'sea_battle_3',
                name: 'Sea Battle',
                bonus: 500
            };

            const successResult = calculateScore({ dice: successDice, card, islandOfSkulls: false });

            // Basic score: 2 coins (200) + 1 diamond (100) + full chest bonus (500) + sea battle bonus (500) = 1300
            expect(successResult.score).toBe(900);
            expect(successResult.penalties).toBe(0);
            expect(successResult.finalScore).toBe(900);

            // Failure case - not enough swords
            const failureDice = createDice(['swords', 'swords', 'coin', 'coin', 'diamond', 'monkey', 'parrot', 'parrot']);

            const failureResult = calculateScore({ dice: failureDice, card, islandOfSkulls: false });

            // Basic score: 2 coins (200) + 1 diamond (100) = 300, but penalty of 500
            expect(failureResult.score).toBe(300);
            expect(failureResult.penalties).toBe(500);
            expect(failureResult.finalScore).toBe(0); // Can't go below 0
        });

        // Test for truce card
        test('truce card does not count swords and penalizes if disqualified with swords', () => {
            // Normal case - no swords counted in score
            const normalDice = createDice(['swords', 'swords', 'coin', 'coin', 'diamond', 'diamond', 'monkey', 'parrot']);
            const card = { effect: 'truce', name: 'Truce' };

            const normalResult = calculateScore({ dice: normalDice, card, islandOfSkulls: false });

            // Basic score without swords: 2 coins (200) + 2 diamonds (200) + full chest bonus (500) = 900
            expect(normalResult.score).toBe(900);
            expect(normalResult.penalties).toBe(0);
            expect(normalResult.finalScore).toBe(900);

            // Disqualification case - penalty for each sword
            const disqualifiedDice = createDice(['skull', 'skull', 'skull', 'swords', 'swords', 'coin', 'diamond', 'parrot']);

            const disqualifiedResult = calculateScore({ dice: disqualifiedDice, card, islandOfSkulls: false });

            // Disqualified with 2 swords → 2 × 500 = 1000 penalty
            expect(disqualifiedResult.isDisqualified).toBe(true);
            expect(disqualifiedResult.score).toBe(0);
            expect(disqualifiedResult.penalties).toBe(1000);
            expect(disqualifiedResult.finalScore).toBe(0); // Can't go below 0
        });

        // Test for midas touch card
        test('midas touch card doubles coin values', () => {
            const dice = createDice(['coin', 'coin', 'coin', 'diamond', 'diamond', 'monkey', 'parrot', 'parrot']);
            const card = { effect: 'midas_touch', name: 'Midas Touch' };

            const result = calculateScore({ dice, card, islandOfSkulls: false });

            // 3 coins doubled (600) + coin set (100) + 2 diamonds (200) = 900
            expect(result.score).toBe(900);
            expect(result.finalScore).toBe(900);

            // Check that coins are doubled in the breakdown
            const coinItem = result.scoreBreakdown.find(item => item.type === 'midas_coins');
            expect(coinItem).toBeTruthy();
            expect(coinItem.count).toBe(3);
            expect(coinItem.score).toBe(600); // 3 coins × 200
        });

        // Test for diamond mine card
        test('diamond mine card triples diamond values', () => {
            const dice = createDice(['coin', 'coin', 'diamond', 'diamond', 'diamond', 'monkey', 'parrot', 'parrot']);
            const card = { effect: 'diamond_mine', name: 'Diamond Mine' };

            const result = calculateScore({ dice, card, islandOfSkulls: false });

            // 2 coins (200) + 3 diamonds tripled (900) + diamond set (100) = 1200
            expect(result.score).toBe(1200);
            expect(result.finalScore).toBe(1200);

            // Check that diamonds are tripled in the breakdown
            const diamondItem = result.scoreBreakdown.find(item => item.type === 'diamond_mine');
            expect(diamondItem).toBeTruthy();
            expect(diamondItem.count).toBe(3);
            expect(diamondItem.score).toBe(900); // 3 diamonds × 300
        });

        // Test for zombie attack card
        test('zombie attack card requires 5+ swords to win', () => {
            // Success case - enough swords
            const successDice = createDice(['swords', 'swords', 'swords', 'swords', 'swords', 'skull', 'skull', 'skull']);
            const card = { effect: 'zombie_attack', name: 'Zombie Attack' };

            const successResult = calculateScore({ dice: successDice, card, islandOfSkulls: false });

            // 5+ swords with zombie attack = 1200 points
            expect(successResult.isDisqualified).toBe(true); // 3+ skulls would normally disqualify
            expect(successResult.score).toBe(1200); // But zombie attack overrides that
            expect(successResult.finalScore).toBe(1200);

            // Failure case - not enough swords
            const failureDice = createDice(['swords', 'swords', 'swords', 'swords', 'monkey', 'skull', 'skull', 'skull']);

            const failureResult = calculateScore({ dice: failureDice, card, islandOfSkulls: false });

            // Less than 5 swords = 0 points (failure)
            expect(failureResult.isDisqualified).toBe(true);
            expect(failureResult.score).toBe(0);
            expect(failureResult.finalScore).toBe(0);
        });

        // Test for sorceress card (this would be handled in game logic, not scoring directly)
        test('starting with skull from card is counted in disqualification', () => {
            // Create dice with 2 skulls + 1 from card
            const dice = createDice(['skull', 'skull', 'coin', 'coin', 'diamond', 'diamond', 'monkey', 'parrot']);

            // Simulate a card that adds an initial skull
            const cardResult = calculateScore({ dice, card: null, islandOfSkulls: false });

            // With 2 skulls, should not be disqualified
            expect(cardResult.isDisqualified).toBe(false);

            // Now add another skull to simulate card effect
            const diceWithExtraSkull = [...dice];
            diceWithExtraSkull[2] = { ...diceWithExtraSkull[2], face: 'skull', locked: true };

            const withExtraSkullResult = calculateScore({ dice: diceWithExtraSkull, card: null, islandOfSkulls: false });

            // With 3 skulls, should be disqualified
            expect(withExtraSkullResult.isDisqualified).toBe(true);
            expect(withExtraSkullResult.score).toBe(0);
        });

        // Test for gold and diamond card starting effects
        test('starting with coin/diamond from card is counted in score', () => {
            // Gold card test
            // Normal dice roll without modifications
            const goldTestDice = createDice(['coin', 'coin', 'diamond', 'diamond', 'monkey', 'parrot', 'parrot', 'swords']);

            // Card effect should add a gold coin to scoring
            const goldCardResult = calculateScore({
                dice: goldTestDice,
                card: { effect: 'start_with_gold' },
                islandOfSkulls: false
            });

            // 2 coins from dice + 1 from card = 3 coins as set (100) + 3 coins (300) + 2 diamonds (200) = 600
            expect(goldCardResult.score).toBe(600);

            // Diamond card test
            // Normal dice roll without modifications
            const diamondTestDice = createDice(['coin', 'coin', 'diamond', 'diamond', 'monkey', 'parrot', 'parrot', 'swords']);

            // Card effect should add a diamond to scoring
            const diamondCardResult = calculateScore({
                dice: diamondTestDice,
                card: { effect: 'start_with_diamond' },
                islandOfSkulls: false
            });

            // 2 coins (200) + 2 diamonds from dice + 1 from card = 3 diamonds as set (100) + 3 diamonds (300) = 600
            expect(diamondCardResult.score).toBe(600);
        });

        // Test island of skulls
        test('island of skulls scores zero points', () => {
            const dice = createDice(['skull', 'skull', 'skull', 'skull', 'coin', 'coin', 'diamond', 'diamond']);

            const result = calculateScore({ dice, card: null, islandOfSkulls: true });

            expect(result.score).toBe(0);
            expect(result.finalScore).toBe(0);
            expect(result.islandOfSkulls).toBe(true);
        });

        // Test for full chest bonus
        test('full chest bonus is applied when all 8 dice contribute to score', () => {
            // All 8 dice contribute
            const fullDice = createDice(['coin', 'coin', 'coin', 'diamond', 'diamond', 'monkey', 'monkey', 'monkey']);

            const fullResult = calculateScore({ dice: fullDice, card: null, islandOfSkulls: false });

            // 3 coins as set (100) + 3 coins (300) + 2 diamonds (200) + 3 monkeys as set (100) + full chest bonus (500) = 1200
            expect(fullResult.score).toBe(1200);

            // A breakdown item for full chest bonus should exist
            const bonusItem = fullResult.scoreBreakdown.find(item => item.type === 'full_chest_bonus');
            expect(bonusItem).toBeTruthy();
            expect(bonusItem.bonus).toBe(500);

            // Not all 8 contribute due to skull
            const partialDice = createDice(['coin', 'coin', 'coin', 'diamond', 'diamond', 'monkey', 'monkey', 'skull']);

            const partialResult = calculateScore({ dice: partialDice, card: null, islandOfSkulls: false });

            // 3 coins as set (100) + 3 coins (300) + 2 diamonds (200) + 2 monkeys (0) = 600 (no full chest bonus)
            expect(partialResult.score).toBe(600);

            // No bonus item should exist
            const noBonusItem = partialResult.scoreBreakdown.find(item => item.type === 'full_chest_bonus');
            expect(noBonusItem).toBeFalsy();
        });

        // Special case with multiple sets
        test('multiple sets are scored correctly', () => {
            const dice = createDice(['coin', 'coin', 'coin', 'monkey', 'monkey', 'monkey', 'parrot', 'parrot']);

            const result = calculateScore({ dice, card: null, islandOfSkulls: false });

            // 3 coins as set (100) + 3 coins (300) + 3 monkeys as set (100) = 5000
            expect(result.score).toBe(500);

            // Check that both sets are in the breakdown
            const setItems = result.scoreBreakdown.filter(item => item.type === 'set');
            expect(setItems.length).toBe(2);
        });

        // Test different set sizes
        test('different set sizes score according to the table', () => {
            // 3 of a kind
            const threeDice = createDice(['monkey', 'monkey', 'monkey', 'coin', 'coin', 'diamond', 'parrot', 'parrot']);
            const threeResult = calculateScore({ dice: threeDice, card: null, islandOfSkulls: false });
            // 3 monkeys (100) + 2 coins (200) + 1 diamond (100) = 400
            expect(threeResult.score).toBe(400);

            // 4 of a kind
            const fourDice = createDice(['monkey', 'monkey', 'monkey', 'monkey', 'coin', 'coin', 'diamond', 'parrot']);
            const fourResult = calculateScore({ dice: fourDice, card: null, islandOfSkulls: false });
            // 4 monkeys (200) + 2 coins (200) + 1 diamond (100) = 500
            expect(fourResult.score).toBe(500);

            // 5 of a kind
            const fiveDice = createDice(['monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'coin', 'coin', 'diamond']);
            const fiveResult = calculateScore({ dice: fiveDice, card: null, islandOfSkulls: false });
            // 5 monkeys (500) + 2 coins (200) + 1 diamond (100) + full chest bonus (500) = 1300
            expect(fiveResult.score).toBe(1300);

            // 6 of a kind
            const sixDice = createDice(['monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'coin', 'diamond']);
            const sixResult = calculateScore({ dice: sixDice, card: null, islandOfSkulls: false });
            // 6 monkeys (1000) + 1 coin (100) + 1 diamond (100) + full chest bonus (500) = 1700
            expect(sixResult.score).toBe(1700);

            // 7 of a kind
            const sevenDice = createDice(['monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'coin']);
            const sevenResult = calculateScore({ dice: sevenDice, card: null, islandOfSkulls: false });
            // 7 monkeys (2000) + 1 coin (100) + full chest bonus (500) = 2600
            expect(sevenResult.score).toBe(2600);

            // 8 of a kind
            const eightDice = createDice(['monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey']);
            const eightResult = calculateScore({ dice: eightDice, card: null, islandOfSkulls: false });
            // 8 monkeys (4000) + full chest bonus (500) = 4500
            expect(eightResult.score).toBe(4500);
        });
    });
});