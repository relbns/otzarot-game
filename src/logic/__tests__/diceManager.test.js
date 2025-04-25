import {
    initializeDice,
    handleFirstRoll,
    handleReroll,
    handleIslandOfSkullsRoll,
    handleDieSelection,
    handleTreasureChest,
    handleCardEffects,
    isZombieAttackComplete,
    handleZombieAttackLocking,
    validateReroll,
    shouldEnterIslandOfSkulls,
    getDiceInTreasureChest,
    getDiceLockedStates,
    getRollableDiceIndices,
    getDiceStateSummary
} from '../diceManager';

// Mock the dice module
jest.mock('../dice', () => ({
    createInitialDice: jest.fn(),
    performFirstRoll: jest.fn(),
    rollDice: jest.fn(),
    toggleDieSelection: jest.fn(),
    toggleTreasureChest: jest.fn(),
    getIslandOfSkullsRollableIndices: jest.fn(),
    lockDiceWithFace: jest.fn(),
    countDiceFace: jest.fn(),
    applyInitialCardEffects: jest.fn(),
    rollIslandOfSkulls: jest.fn(),
    areAllUnlockedDiceOfFaces: jest.fn()
}));

// Import the mocked functions
import {
    createInitialDice,
    performFirstRoll,
    rollDice,
    toggleDieSelection,
    toggleTreasureChest,
    getIslandOfSkullsRollableIndices,
    lockDiceWithFace,
    countDiceFace,
    applyInitialCardEffects,
    rollIslandOfSkulls,
    areAllUnlockedDiceOfFaces
} from '../dice';

describe('Dice Manager', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('initializeDice', () => {
        test('calls createInitialDice and returns the result', () => {
            const mockDice = [{ id: 0, face: 'blank' }];
            createInitialDice.mockReturnValue(mockDice);

            const result = initializeDice();

            expect(createInitialDice).toHaveBeenCalled();
            expect(result).toBe(mockDice);
        });
    });

    describe('handleFirstRoll', () => {
        test('calls performFirstRoll and returns new dice with skull count', () => {
            const initialDice = [{ id: 0, face: 'blank' }];
            const rolledDice = [{ id: 0, face: 'coin' }];

            performFirstRoll.mockReturnValue(rolledDice);
            countDiceFace.mockReturnValue(0); // No skulls

            const result = handleFirstRoll(initialDice);

            expect(performFirstRoll).toHaveBeenCalledWith(initialDice);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: rolledDice,
                skullCount: 0,
                isIslandOfSkulls: false,
                isDisqualified: false
            });
        });

        test('enters Island of Skulls with 4+ skulls', () => {
            const initialDice = [{ id: 0, face: 'blank' }];
            const rolledDice = [{ id: 0, face: 'skull' }];
            const lockedDice = [{ id: 0, face: 'skull', locked: true }];

            performFirstRoll.mockReturnValue(rolledDice);
            countDiceFace.mockReturnValue(4); // 4 skulls
            lockDiceWithFace.mockReturnValue(lockedDice);

            const result = handleFirstRoll(initialDice);

            expect(performFirstRoll).toHaveBeenCalledWith(initialDice);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(lockDiceWithFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: lockedDice,
                skullCount: 4,
                isIslandOfSkulls: true,
                isDisqualified: false
            });
        });

        test('disqualifies with 3 skulls', () => {
            const initialDice = [{ id: 0, face: 'blank' }];
            const rolledDice = [{ id: 0, face: 'skull' }];
            const lockedDice = [{ id: 0, face: 'skull', locked: true }];

            performFirstRoll.mockReturnValue(rolledDice);
            countDiceFace.mockReturnValue(3); // 3 skulls
            lockDiceWithFace.mockReturnValue(lockedDice);

            const result = handleFirstRoll(initialDice);

            expect(performFirstRoll).toHaveBeenCalledWith(initialDice);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(lockDiceWithFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: lockedDice,
                skullCount: 3,
                isIslandOfSkulls: false,
                isDisqualified: true
            });
        });
    });

    describe('handleReroll', () => {
        test('rerolls selected dice and returns updated state', () => {
            const initialDice = [{ id: 0, face: 'coin' }, { id: 1, face: 'diamond' }];
            const selectedDice = [0];
            const rolledDice = [{ id: 0, face: 'parrot' }, { id: 1, face: 'diamond' }];

            rollDice.mockReturnValue(rolledDice);
            countDiceFace.mockReturnValue(0); // No skulls

            const result = handleReroll(initialDice, selectedDice);

            expect(rollDice).toHaveBeenCalledWith(initialDice, selectedDice);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: rolledDice,
                skullCount: 0,
                isDisqualified: false
            });
        });

        test('disqualifies with 3+ skulls and locks them', () => {
            const initialDice = [{ id: 0, face: 'coin' }, { id: 1, face: 'diamond' }];
            const selectedDice = [0, 1];
            const rolledDice = [{ id: 0, face: 'skull' }, { id: 1, face: 'skull' }];
            const lockedDice = [
                { id: 0, face: 'skull', locked: true },
                { id: 1, face: 'skull', locked: true }
            ];

            rollDice.mockReturnValue(rolledDice);
            countDiceFace.mockReturnValue(3); // 3 skulls (including existing skull)
            lockDiceWithFace.mockReturnValue(lockedDice);

            const result = handleReroll(initialDice, selectedDice);

            expect(rollDice).toHaveBeenCalledWith(initialDice, selectedDice);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(lockDiceWithFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: lockedDice,
                skullCount: 3,
                isDisqualified: true
            });
        });
    });

    describe('handleIslandOfSkullsRoll', () => {
        test('rolls appropriate dice and returns results', () => {
            const initialDice = [
                { id: 0, face: 'skull', locked: true },
                { id: 1, face: 'coin' }
            ];
            const rollableIndices = [1];
            const rolledDice = [
                { id: 0, face: 'skull', locked: true },
                { id: 1, face: 'skull', locked: true }
            ];

            getIslandOfSkullsRollableIndices.mockReturnValue(rollableIndices);
            rollIslandOfSkulls.mockReturnValue({
                dice: rolledDice,
                newSkullCount: 1
            });
            countDiceFace.mockReturnValue(2); // Total skulls

            const result = handleIslandOfSkullsRoll(initialDice);

            expect(getIslandOfSkullsRollableIndices).toHaveBeenCalledWith(initialDice);
            expect(rollIslandOfSkulls).toHaveBeenCalledWith(initialDice, rollableIndices);
            expect(countDiceFace).toHaveBeenCalledWith(rolledDice, 'skull');
            expect(result).toEqual({
                dice: rolledDice,
                newSkullCount: 1,
                totalSkullCount: 2,
                isRoundOver: false
            });
        });

        test('ends round when no new skulls are rolled', () => {
            const initialDice = [
                { id: 0, face: 'skull', locked: true },
                { id: 1, face: 'coin' }
            ];
            const rollableIndices = [1];
            const rolledDice = [
                { id: 0, face: 'skull', locked: true },
                { id: 1, face: 'coin' }
            ];

            getIslandOfSkullsRollableIndices.mockReturnValue(rollableIndices);
            rollIslandOfSkulls.mockReturnValue({
                dice: rolledDice,
                newSkullCount: 0
            });
            countDiceFace.mockReturnValue(1); // Total skulls

            const result = handleIslandOfSkullsRoll(initialDice);

            expect(result).toEqual({
                dice: rolledDice,
                newSkullCount: 0,
                totalSkullCount: 1,
                isRoundOver: true
            });
        });
    });

    describe('handleDieSelection', () => {
        test('delegates to toggleDieSelection and returns result', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const selectedDice = [];
            const index = 0;
            const isSorceressAvailable = false;
            const expectedResult = { dice, selectedDice: [0] };

            toggleDieSelection.mockReturnValue(expectedResult);

            const result = handleDieSelection(dice, selectedDice, index, isSorceressAvailable);

            expect(toggleDieSelection).toHaveBeenCalledWith(dice, selectedDice, index, isSorceressAvailable);
            expect(result).toBe(expectedResult);
        });
    });

    describe('handleTreasureChest', () => {
        test('delegates to toggleTreasureChest and returns result', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const selectedDice = [];
            const index = 0;
            const expectedResult = {
                dice: [{ id: 0, face: 'coin', inTreasureChest: true }],
                selectedDice: []
            };

            toggleTreasureChest.mockReturnValue(expectedResult);

            const result = handleTreasureChest(dice, selectedDice, index);

            expect(toggleTreasureChest).toHaveBeenCalledWith(dice, selectedDice, index);
            expect(result).toBe(expectedResult);
        });
    });

    describe('handleCardEffects', () => {
        test('delegates to applyInitialCardEffects and returns result', () => {
            const dice = [{ id: 0, face: 'blank' }];
            const card = { effect: 'start_with_gold' };
            const newDice = [{ id: 0, face: 'coin' }];
            const expectedResult = { dice: newDice, skullsAdded: 0 };

            applyInitialCardEffects.mockReturnValue(expectedResult);

            const result = handleCardEffects(dice, card);

            expect(applyInitialCardEffects).toHaveBeenCalledWith(dice, card);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('isZombieAttackComplete', () => {
        test('delegates to areAllUnlockedDiceOfFaces and returns result', () => {
            const dice = [{ id: 0, face: 'skull' }, { id: 1, face: 'swords' }];

            areAllUnlockedDiceOfFaces.mockReturnValue(true);

            const result = isZombieAttackComplete(dice);

            expect(areAllUnlockedDiceOfFaces).toHaveBeenCalledWith(dice, ['skull', 'swords']);
            expect(result).toBe(true);
        });
    });

    describe('handleZombieAttackLocking', () => {
        test('locks all non-skull, non-sword dice', () => {
            const dice = [
                { id: 0, face: 'skull' },
                { id: 1, face: 'swords' },
                { id: 2, face: 'coin' },
                { id: 3, face: 'diamond', inTreasureChest: true },
                { id: 4, face: 'monkey' }
            ];

            const result = handleZombieAttackLocking(dice);

            // Skull and swords should not be locked
            expect(result[0].locked).toBeUndefined();
            expect(result[1].locked).toBeUndefined();

            // Coin and monkey should be locked
            expect(result[2].locked).toBe(true);

            // Diamond is in treasure chest, should not be locked
            expect(result[3].locked).toBeUndefined();

            // Monkey should be locked
            expect(result[4].locked).toBe(true);
        });
    });

    describe('validateReroll', () => {
        test('returns invalid when no rolls remaining', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const selectedDice = [0];
            const gameState = {
                rollsRemaining: 0,
                islandOfSkulls: false,
                currentCard: null,
                skullRerollUsed: false
            };

            const result = validateReroll(dice, selectedDice, gameState);

            expect(result).toEqual({
                isValid: false,
                reason: 'no_rolls_remaining'
            });
        });

        test('returns invalid with storm card and last roll', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const selectedDice = [0];
            const gameState = {
                rollsRemaining: 1,
                islandOfSkulls: false,
                currentCard: { effect: 'storm' },
                skullRerollUsed: false
            };

            const result = validateReroll(dice, selectedDice, gameState);

            expect(result).toEqual({
                isValid: false,
                reason: 'storm_max_rolls'
            });
        });

        test('returns invalid with less than 2 dice selected', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const selectedDice = [0];
            const gameState = {
                rollsRemaining: 2,
                islandOfSkulls: false,
                currentCard: null,
                skullRerollUsed: false
            };

            const result = validateReroll(dice, selectedDice, gameState);

            expect(result).toEqual({
                isValid: false,
                reason: 'min_2_dice_reroll'
            });
        });

        test('returns valid with sorceress skull reroll', () => {
            const dice = [{ id: 0, face: 'skull' }];
            const selectedDice = [0];
            const gameState = {
                rollsRemaining: 2,
                islandOfSkulls: false,
                currentCard: { effect: 'reroll_skull' },
                skullRerollUsed: false
            };

            const result = validateReroll(dice, selectedDice, gameState);

            expect(result).toEqual({
                isValid: true,
                isSorceressSkullReroll: true
            });
        });

        test('returns valid for normal reroll', () => {
            const dice = [{ id: 0, face: 'coin' }, { id: 1, face: 'diamond' }];
            const selectedDice = [0, 1];
            const gameState = {
                rollsRemaining: 2,
                islandOfSkulls: false,
                currentCard: null,
                skullRerollUsed: false
            };

            const result = validateReroll(dice, selectedDice, gameState);

            expect(result).toEqual({
                isValid: true,
                isSorceressSkullReroll: false
            });
        });
    });

    describe('shouldEnterIslandOfSkulls', () => {
        test('returns true with 4+ skulls on first roll', () => {
            expect(shouldEnterIslandOfSkulls(4, 'rolling')).toBe(true);
        });

        test('returns false with less than 4 skulls', () => {
            expect(shouldEnterIslandOfSkulls(3, 'rolling')).toBe(false);
        });

        test('returns false if not on first roll', () => {
            expect(shouldEnterIslandOfSkulls(4, 'decision')).toBe(false);
        });
    });

    describe('getDiceInTreasureChest', () => {
        test('returns dice in treasure chest', () => {
            const dice = [
                { id: 0, face: 'coin' },
                { id: 1, face: 'diamond', inTreasureChest: true },
                { id: 2, face: 'monkey', inTreasureChest: true }
            ];

            const result = getDiceInTreasureChest(dice);

            expect(result).toEqual([
                { id: 1, face: 'diamond', inTreasureChest: true },
                { id: 2, face: 'monkey', inTreasureChest: true }
            ]);
        });
    });

    describe('getDiceLockedStates', () => {
        test('returns correct locked states', () => {
            const dice = [
                { id: 0, face: 'coin', locked: false },
                { id: 1, face: 'diamond', locked: true },
                { id: 2, face: 'skull', locked: false },
                { id: 3, face: 'parrot', inTreasureChest: true, locked: false },
                { id: 4, face: 'skull', locked: false }
            ];

            const result = getDiceLockedStates(dice);

            // Coin: not locked
            // Diamond: locked
            // Skull: auto-locked
            // Parrot: in treasure chest, not locked
            // Skull: auto-locked
            expect(result).toEqual([false, true, true, false, true]);
        });

        test('handles sorceress availability for skulls', () => {
            const dice = [
                { id: 0, face: 'coin', locked: false },
                { id: 1, face: 'diamond', locked: true },
                { id: 2, face: 'skull', locked: false }
            ];

            const result = getDiceLockedStates(dice, true); // Sorceress available

            // Coin: not locked
            // Diamond: locked
            // Skull: not auto-locked due to sorceress
            expect(result).toEqual([false, true, false]);
        });
    });

    describe('getRollableDiceIndices', () => {
        test('uses getIslandOfSkullsRollableIndices for Island of Skulls', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const isIslandOfSkulls = true;
            const selectedDice = [0];
            const rollableIndices = [1, 2, 3];

            getIslandOfSkullsRollableIndices.mockReturnValue(rollableIndices);

            const result = getRollableDiceIndices(dice, isIslandOfSkulls, selectedDice);

            expect(getIslandOfSkullsRollableIndices).toHaveBeenCalledWith(dice);
            expect(result).toBe(rollableIndices);
        });

        test('returns selected dice for normal gameplay', () => {
            const dice = [{ id: 0, face: 'coin' }];
            const isIslandOfSkulls = false;
            const selectedDice = [0, 1];

            const result = getRollableDiceIndices(dice, isIslandOfSkulls, selectedDice);

            expect(result).toBe(selectedDice);
        });
    });

    describe('getDiceStateSummary', () => {
        test('returns correct summary of dice state', () => {
            const dice = [
                { id: 0, face: 'coin', selected: true },
                { id: 1, face: 'coin' },
                { id: 2, face: 'diamond' },
                { id: 3, face: 'skull', locked: true },
                { id: 4, face: 'skull', locked: true },
                { id: 5, face: 'parrot', inTreasureChest: true },
                { id: 6, face: 'monkey' },
                { id: 7, face: 'swords' }
            ];

            const result = getDiceStateSummary(dice);

            expect(result).toEqual({
                coin: 2,
                diamond: 1,
                swords: 1,
                monkey: 1,
                parrot: 1,
                skull: 2,
                treasureChestCount: 1,
                lockedCount: 2,
                selectedCount: 1,
                isDisqualified: false,
                isFullChest: true
            });
        });

        test('handles disqualification', () => {
            const dice = [
                { id: 0, face: 'coin' },
                { id: 1, face: 'skull' },
                { id: 2, face: 'skull' },
                { id: 3, face: 'skull' }
            ];

            const result = getDiceStateSummary(dice);

            expect(result.isDisqualified).toBe(true);
        });

        test('handles incomplete dice set', () => {
            const dice = [
                { id: 0, face: 'coin' },
                { id: 1, face: 'blank' }
            ];

            const result = getDiceStateSummary(dice);

            expect(result.isFullChest).toBe(false);
        });
    });
});