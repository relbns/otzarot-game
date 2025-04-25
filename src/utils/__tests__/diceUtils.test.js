import {
    renderDieFace,
    generateDiceAnimation,
    canSelectDie,
    canPutInTreasureChest,
    getDieState,
    areAllDiceUsed,
    isPlayerDisqualified,
    getDieClasses
} from '../diceUtils';
import { getRandomFace } from '../../logic/dice';

// Mock the getRandomFace function
jest.mock('../../logic/dice', () => ({
    getRandomFace: jest.fn()
}));

describe('Dice Utilities', () => {
    describe('renderDieFace', () => {
        test('returns correct emoji for each face', () => {
            expect(renderDieFace('coin')).toBe('🪙');
            expect(renderDieFace('diamond')).toBe('💎');
            expect(renderDieFace('swords')).toBe('⚔️');
            expect(renderDieFace('monkey')).toBe('🐒');
            expect(renderDieFace('parrot')).toBe('🦜');
            expect(renderDieFace('skull')).toBe('💀');
            expect(renderDieFace('blank')).toBe('');
        });

        test('returns the input for unknown faces', () => {
            expect(renderDieFace('unknown')).toBe('unknown');
        });
    });

    describe('generateDiceAnimation', () => {
        beforeEach(() => {
            // Reset mock before each test
            getRandomFace.mockReset();
        });

        test('generates animation sequence with correct length', () => {
            getRandomFace
                .mockReturnValueOnce('coin')
                .mockReturnValueOnce('diamond')
                .mockReturnValueOnce('swords')
                .mockReturnValueOnce('monkey')
                .mockReturnValueOnce('parrot');

            const sequence = generateDiceAnimation(5);
            expect(sequence).toHaveLength(5);
            expect(sequence).toEqual(['coin', 'diamond', 'swords', 'monkey', 'parrot']);
        });

        test('uses provided final face', () => {
            getRandomFace
                .mockReturnValueOnce('coin')
                .mockReturnValueOnce('diamond')
                .mockReturnValueOnce('swords');

            const sequence = generateDiceAnimation(4, 'skull');
            expect(sequence).toHaveLength(4);
            expect(sequence).toEqual(['coin', 'diamond', 'swords', 'skull']);
        });
    });

    describe('canSelectDie', () => {
        test('can select normal dice', () => {
            const die = { face: 'coin', locked: false, inTreasureChest: false };
            expect(canSelectDie(die)).toBe(true);
        });

        test('cannot select locked dice', () => {
            const die = { face: 'coin', locked: true, inTreasureChest: false };
            expect(canSelectDie(die)).toBe(false);
        });

        test('cannot select dice in treasure chest', () => {
            const die = { face: 'coin', locked: false, inTreasureChest: true };
            expect(canSelectDie(die)).toBe(false);
        });

        test('cannot select skulls without sorceress', () => {
            const die = { face: 'skull', locked: false, inTreasureChest: false };
            expect(canSelectDie(die)).toBe(false);
        });

        test('can select skulls with sorceress', () => {
            const die = { face: 'skull', locked: false, inTreasureChest: false };
            expect(canSelectDie(die, true)).toBe(true);
        });
    });

    describe('canPutInTreasureChest', () => {
        test('can put normal dice in treasure chest', () => {
            const die = { face: 'coin', locked: false };
            expect(canPutInTreasureChest(die, true)).toBe(true);
        });

        test('cannot put skulls in treasure chest', () => {
            const die = { face: 'skull', locked: false };
            expect(canPutInTreasureChest(die, true)).toBe(false);
        });

        test('cannot put locked dice in treasure chest', () => {
            const die = { face: 'coin', locked: true };
            expect(canPutInTreasureChest(die, true)).toBe(false);
        });

        test('cannot put dice in treasure chest if not available', () => {
            const die = { face: 'coin', locked: false };
            expect(canPutInTreasureChest(die, false)).toBe(false);
        });
    });

    describe('getDieState', () => {
        test('returns correct state for locked die', () => {
            const die = { locked: true, inTreasureChest: false, selected: false };
            expect(getDieState(die)).toBe('locked');
        });

        test('returns correct state for die in treasure chest', () => {
            const die = { locked: false, inTreasureChest: true, selected: false };
            expect(getDieState(die)).toBe('chest');
        });

        test('returns correct state for selected die', () => {
            const die = { locked: false, inTreasureChest: false, selected: true };
            expect(getDieState(die)).toBe('selected');
        });

        test('returns correct state for normal die', () => {
            const die = { locked: false, inTreasureChest: false, selected: false };
            expect(getDieState(die)).toBe('normal');
        });
    });

    describe('areAllDiceUsed', () => {
        test('returns true when all dice contribute to score', () => {
            const dice = [
                { face: 'coin' },     // contributes (individual value)
                { face: 'coin' },     // contributes (individual value)
                { face: 'coin' },     // contributes (individual value)
                { face: 'diamond' },  // contributes (individual value)
                { face: 'diamond' },  // contributes (individual value)
                { face: 'monkey' },   // part of set of 3
                { face: 'monkey' },   // part of set of 3
                { face: 'monkey' }    // part of set of 3
            ];
            expect(areAllDiceUsed(dice)).toBe(true);
        });

        test('returns false when skulls are present', () => {
            const dice = [
                { face: 'coin' },
                { face: 'coin' },
                { face: 'coin' },
                { face: 'diamond' },
                { face: 'diamond' },
                { face: 'monkey' },
                { face: 'monkey' },
                { face: 'skull' }     // skull never contributes
            ];
            expect(areAllDiceUsed(dice)).toBe(false);
        });

        test('returns false when some dice do not form sets', () => {
            const dice = [
                { face: 'coin' },
                { face: 'coin' },
                { face: 'coin' },
                { face: 'diamond' },
                { face: 'diamond' },
                { face: 'monkey' },   // only 2 monkeys (not a set)
                { face: 'monkey' },   // only 2 monkeys (not a set)
                { face: 'parrot' }    // single parrot (not a set)
            ];
            expect(areAllDiceUsed(dice)).toBe(false);
        });
    });

    describe('isPlayerDisqualified', () => {
        test('returns true with 3 skulls', () => {
            const dice = [
                { face: 'coin' },
                { face: 'coin' },
                { face: 'coin' },
                { face: 'diamond' },
                { face: 'diamond' },
                { face: 'skull' },
                { face: 'skull' },
                { face: 'skull' }
            ];
            expect(isPlayerDisqualified(dice)).toBe(true);
        });

        test('returns true with more than 3 skulls', () => {
            const dice = [
                { face: 'coin' },
                { face: 'coin' },
                { face: 'skull' },
                { face: 'skull' },
                { face: 'skull' },
                { face: 'skull' },
                { face: 'diamond' },
                { face: 'diamond' }
            ];
            expect(isPlayerDisqualified(dice)).toBe(true);
        });

        test('returns false with less than 3 skulls', () => {
            const dice = [
                { face: 'coin' },
                { face: 'coin' },
                { face: 'coin' },
                { face: 'diamond' },
                { face: 'diamond' },
                { face: 'monkey' },
                { face: 'skull' },
                { face: 'skull' }
            ];
            expect(isPlayerDisqualified(dice)).toBe(false);
        });
    });

    describe('getDieClasses', () => {
        test('returns correct classes for normal die', () => {
            const die = { face: 'coin', locked: false, inTreasureChest: false };
            const classes = getDieClasses(die, false);

            expect(classes).toEqual({
                die: true,
                'die--locked': false,
                'die--chest': false,
                'die--selected': false,
                'die--skull': false,
                'die--rerollable': true,
                'die--sorceress-skull': false
            });
        });

        test('returns correct classes for locked die', () => {
            const die = { face: 'coin', locked: true, inTreasureChest: false };
            const classes = getDieClasses(die, false);

            expect(classes).toEqual({
                die: true,
                'die--locked': true,
                'die--chest': false,
                'die--selected': false,
                'die--skull': false,
                'die--rerollable': false,
                'die--sorceress-skull': false
            });
        });

        test('returns correct classes for die in treasure chest', () => {
            const die = { face: 'coin', locked: false, inTreasureChest: true };
            const classes = getDieClasses(die, false);

            expect(classes).toEqual({
                die: true,
                'die--locked': false,
                'die--chest': true,
                'die--selected': false,
                'die--skull': false,
                'die--rerollable': false,
                'die--sorceress-skull': false
            });
        });

        test('returns correct classes for selected die', () => {
            const die = { face: 'coin', locked: false, inTreasureChest: false };
            const classes = getDieClasses(die, true);

            expect(classes).toEqual({
                die: true,
                'die--locked': false,
                'die--chest': false,
                'die--selected': true,
                'die--skull': false,
                'die--rerollable': true,
                'die--sorceress-skull': false
            });
        });

        test('returns correct classes for skull die', () => {
            const die = { face: 'skull', locked: false, inTreasureChest: false };
            const classes = getDieClasses(die, false);

            expect(classes).toEqual({
                die: true,
                'die--locked': false,
                'die--chest': false,
                'die--selected': false,
                'die--skull': true,
                'die--rerollable': false,
                'die--sorceress-skull': false
            });
        });

        test('returns correct classes for skull die with sorceress', () => {
            const die = { face: 'skull', locked: false, inTreasureChest: false };
            const classes = getDieClasses(die, false, true);

            expect(classes).toEqual({
                die: true,
                'die--locked': false,
                'die--chest': false,
                'die--selected': false,
                'die--skull': true,
                'die--rerollable': true,
                'die--sorceress-skull': true
            });
        });
    });
});