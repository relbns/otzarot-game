// src/context/GameContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { DICE_FACES, CARDS, translations } from '../constants';

// Create context
export const GameContext = createContext();

// Custom hook for using the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
    // Game state
    const [activePlayer, setActivePlayer] = useState(0);
    const [players, setPlayers] = useState([
        { id: 1, name: 'Player 1', score: 0 },
        { id: 2, name: 'Player 2', score: 0 },
    ]);
    const [gamePhase, setGamePhase] = useState('waiting'); // waiting, drawing, rolling, decision, resolution
    const [currentDice, setCurrentDice] = useState([]);
    const [selectedDice, setSelectedDice] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [rollsRemaining, setRollsRemaining] = useState(3);
    const [islandOfSkulls, setIslandOfSkulls] = useState(false);
    const [skullCount, setSkullCount] = useState(0);
    const [gameLog, setGameLog] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [isCardFlipping, setIsCardFlipping] = useState(false);
    const [isDiceRolling, setIsDiceRolling] = useState(false);
    const [language, setLanguage] = useState('en'); // 'en' for English, 'he' for Hebrew
    const [playerCount, setPlayerCount] = useState(2);
    const [showStartForm, setShowStartForm] = useState(true);

    // Translation helper
    const t = (key) => translations[language][key] || key;

    // RTL support
    const isRTL = language === 'he';
    const direction = isRTL ? 'rtl' : 'ltr';

    // Initialize game with players
    const initializeGame = (playerNames, selectedLanguage) => {
        const initialPlayers = playerNames.map((name, index) => ({
            id: index + 1,
            name: name || `Player ${index + 1}`,
            score: 0,
        }));

        setPlayers(initialPlayers);

        // Update language if changed
        if (selectedLanguage && selectedLanguage !== language) {
            setLanguage(selectedLanguage);
        }

        setShowStartForm(false);
        startGame();
    };

    // Initialize dice
    useEffect(() => {
        if (gameStarted) {
            initNewTurn();
        }
    }, [gameStarted]);

    // Helper function to initialize a new turn
    const initNewTurn = () => {
        // Create new dice
        const newDice = Array(8)
            .fill(null)
            .map((_, index) => ({
                id: index,
                face: getRandomFace(),
                selected: false,
                locked: false,
            }));

        setCurrentDice(newDice);
        setSelectedDice([]);
        setCurrentCard(null);
        setRollsRemaining(3);
        setGamePhase('drawing');
        setIslandOfSkulls(false);
        setSkullCount(0);

        addToLog(`${players[activePlayer].name}'s turn`);
    };

    // Get random dice face
    const getRandomFace = () => {
        const randomIndex = Math.floor(Math.random() * DICE_FACES.length);
        return DICE_FACES[randomIndex];
    };

    // Add message to game log
    const addToLog = (message) => {
        setGameLog((prevLog) => [message, ...prevLog]);
    };

    // Start the game
    const startGame = () => {
        setGameStarted(true);
        setGamePhase('drawing');
        addToLog(t('start_game') + '!');
    };

    // Draw a card
    const drawCard = () => {
        if (gamePhase !== 'drawing') return;

        setIsCardFlipping(true);

        // Add delay for animation
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * CARDS.length);
            const card = CARDS[randomIndex];

            setCurrentCard(card);
            setGamePhase('rolling');

            const cardName = language === 'he' ? card.hebrewName : card.name;
            const cardDesc =
                language === 'he' ? card.hebrewDescription : card.description;

            addToLog(
                `${players[activePlayer].name} ${t(
                    'draw_card'
                )}: ${cardName} - ${cardDesc}`
            );

            setIsCardFlipping(false);
        }, 600);
    };

    // Roll dice
    const rollDice = () => {
        if (gamePhase !== 'rolling' && gamePhase !== 'decision') return;
        if (rollsRemaining <= 0 && !islandOfSkulls) return;

        setIsDiceRolling(true);

        // Add delay for animation
        setTimeout(() => {
            // Roll all dice in first roll, or selected dice in subsequent rolls
            const newDice = currentDice.map((die, index) => {
                // Don't roll locked dice
                if (die.locked) return die;

                // Roll all dice in first roll, or only selected dice in rerolls
                if (gamePhase === 'rolling' || selectedDice.includes(index)) {
                    return {
                        ...die,
                        face: getRandomFace(),
                        selected: false,
                    };
                }

                return die;
            });

            setCurrentDice(newDice);
            setSelectedDice([]);

            // Check for Island of Skulls
            if (gamePhase === 'rolling') {
                const skulls = newDice.filter((die) => die.face === 'skull').length;

                if (skulls >= 3 && !islandOfSkulls) {
                    // Lock skull dice
                    const lockedDice = newDice.map((die) => {
                        if (die.face === 'skull') {
                            return { ...die, locked: true };
                        }
                        return die;
                    });

                    setCurrentDice(lockedDice);
                    setIslandOfSkulls(true);
                    setSkullCount(skulls);
                    addToLog(
                        `${players[activePlayer].name} ${t('roll_dice')} ${skulls} ${t(
                            'skull_count'
                        )} - ${t('in_skull_island')}`
                    );
                } else {
                    addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
                }
            } else {
                addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
            }

            // Handle Island of Skulls
            if (islandOfSkulls) {
                const newSkulls = newDice.filter((die) => die.face === 'skull').length;
                setSkullCount(newSkulls);

                if (newSkulls === 0) {
                    addToLog(
                        `${players[activePlayer].name} ${t('no_skulls_in_island')}.`
                    );
                } else {
                    // Apply penalty to other players based on the card effect
                    const otherPlayerIndices = [];
                    for (let i = 0; i < players.length; i++) {
                        if (i !== activePlayer) {
                            otherPlayerIndices.push(i);
                        }
                    }

                    const updatedPlayers = [...players];
                    const penaltyPoints = newSkulls * 100;

                    otherPlayerIndices.forEach((idx) => {
                        updatedPlayers[idx].score = Math.max(
                            0,
                            updatedPlayers[idx].score - penaltyPoints
                        );
                    });

                    setPlayers(updatedPlayers);

                    const otherPlayerNames = otherPlayerIndices
                        .map((idx) => players[idx].name)
                        .join(', ');
                    addToLog(
                        `${players[activePlayer].name} ${t('roll_dice')} ${newSkulls} ${t(
                            'skull_count'
                        )}! ${otherPlayerNames} ${t('loses')} ${penaltyPoints} ${t(
                            'points'
                        )}.`
                    );
                }
            } else {
                // Decrement rolls remaining
                setRollsRemaining((prevRolls) => prevRolls - 1);

                // Move to decision phase if rolls remaining
                if (rollsRemaining > 1) {
                    setGamePhase('decision');
                } else {
                    // Final roll - calculate score
                    calculateScore();
                    setGamePhase('resolution');
                }
            }

            setIsDiceRolling(false);
        }, 800);
    };

    // Toggle dice selection
    const toggleDieSelection = (index) => {
        if (gamePhase !== 'decision' || currentDice[index].locked || isDiceRolling)
            return;

        setSelectedDice((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((i) => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    // Calculate diamond value (exponential for 3+ diamonds)
    const calculateDiamondValue = (count) => {
        if (count <= 2) {
            return count * 100;
        } else {
            // Exponential scoring for 3+ diamonds
            return Math.pow(2, count) * 100;
        }
    };

    // Calculate base score without special card effects
    const calculateBaseScore = (faceCounts, scoreDescription) => {
        let score = 0;

        // Score for coins
        if (faceCounts.coin > 0) {
            const coinScore = faceCounts.coin * 100;
            score += coinScore;
            scoreDescription.push(`${faceCounts.coin} Coins: ${coinScore} points`);
        }

        // Score for diamonds
        if (faceCounts.diamond > 0) {
            const diamondScore = calculateDiamondValue(faceCounts.diamond);
            score += diamondScore;
            scoreDescription.push(
                `${faceCounts.diamond} Diamonds: ${diamondScore} points`
            );
        }

        // Score for monkeys
        if (faceCounts.monkey > 0) {
            const monkeyScore = faceCounts.monkey * 100;
            score += monkeyScore;
            scoreDescription.push(
                `${faceCounts.monkey} Monkeys: ${monkeyScore} points`
            );
        }

        // Score for parrots
        if (faceCounts.parrot > 0) {
            const parrotScore = faceCounts.parrot * 100;
            score += parrotScore;
            scoreDescription.push(
                `${faceCounts.parrot} Parrots: ${parrotScore} points`
            );
        }

        // Score for swords
        if (faceCounts.swords > 0) {
            const swordScore = faceCounts.swords * 100;
            score += swordScore;
            scoreDescription.push(
                `${faceCounts.swords} Swords: ${swordScore} points`
            );
        }

        return score;
    };

    // Calculate score based on dice and card
    const calculateScore = () => {
        // Count dice faces
        const faceCounts = {};
        DICE_FACES.forEach((face) => (faceCounts[face] = 0));

        currentDice.forEach((die) => {
            if (!die.locked) {
                faceCounts[die.face]++;
            }
        });

        let score = 0;
        let scoreDescription = [];

        // Apply card effect to score calculation
        if (currentCard) {
            switch (currentCard.effect) {
                case 'double_score':
                    // Captain - double final score
                    score = calculateBaseScore(faceCounts, scoreDescription) * 2;
                    scoreDescription.push(`${currentCard.name}: Score doubled!`);
                    break;

                case 'monkey_business':
                    // Monkey Business - monkeys and parrots count together
                    const monkeyParrotCount = faceCounts.monkey + faceCounts.parrot;
                    if (monkeyParrotCount > 0) {
                        const monkeyParrotValue = Math.pow(monkeyParrotCount, 2) * 100;
                        score += monkeyParrotValue;
                        scoreDescription.push(
                            `${monkeyParrotCount} Monkeys & Parrots: ${monkeyParrotValue} points`
                        );
                    }

                    // Add other dice values
                    if (faceCounts.coin > 0) {
                        score += faceCounts.coin * 100;
                        scoreDescription.push(
                            `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
                        );
                    }

                    if (faceCounts.diamond > 0) {
                        const diamondValue = calculateDiamondValue(faceCounts.diamond);
                        score += diamondValue;
                        scoreDescription.push(
                            `${faceCounts.diamond} Diamonds: ${diamondValue} points`
                        );
                    }

                    if (faceCounts.swords > 0) {
                        score += faceCounts.swords * 100;
                        scoreDescription.push(
                            `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
                        );
                    }
                    break;

                case 'storm':
                    // Storm - only coins and diamonds count, but their value is doubled
                    if (faceCounts.coin > 0) {
                        const coinValue = faceCounts.coin * 200;
                        score += coinValue;
                        scoreDescription.push(
                            `${faceCounts.coin} Coins (doubled): ${coinValue} points`
                        );
                    }

                    if (faceCounts.diamond > 0) {
                        const diamondValue = calculateDiamondValue(faceCounts.diamond) * 2;
                        score += diamondValue;
                        scoreDescription.push(
                            `${faceCounts.diamond} Diamonds (doubled): ${diamondValue} points`
                        );
                    }
                    break;

                case 'sea_battle':
                    // Sea Battle - bonus for swords
                    const swordBonus = faceCounts.swords * 200;
                    score += swordBonus;
                    scoreDescription.push(
                        `${faceCounts.swords} Swords (Sea Battle): ${swordBonus} points`
                    );

                    // Add regular scoring for other dice
                    if (faceCounts.coin > 0) {
                        score += faceCounts.coin * 100;
                        scoreDescription.push(
                            `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
                        );
                    }

                    if (faceCounts.diamond > 0) {
                        const diamondValue = calculateDiamondValue(faceCounts.diamond);
                        score += diamondValue;
                        scoreDescription.push(
                            `${faceCounts.diamond} Diamonds: ${diamondValue} points`
                        );
                    }

                    if (faceCounts.monkey > 0) {
                        score += faceCounts.monkey * 100;
                        scoreDescription.push(
                            `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
                        );
                    }

                    if (faceCounts.parrot > 0) {
                        score += faceCounts.parrot * 100;
                        scoreDescription.push(
                            `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
                        );
                    }
                    break;

                case 'midas_touch':
                    // Midas Touch - double coin value
                    if (faceCounts.coin > 0) {
                        const coinValue = faceCounts.coin * 200;
                        score += coinValue;
                        scoreDescription.push(
                            `${faceCounts.coin} Coins (doubled): ${coinValue} points`
                        );
                    }

                    // Regular scoring for other dice
                    if (faceCounts.diamond > 0) {
                        const diamondValue = calculateDiamondValue(faceCounts.diamond);
                        score += diamondValue;
                        scoreDescription.push(
                            `${faceCounts.diamond} Diamonds: ${diamondValue} points`
                        );
                    }

                    if (faceCounts.monkey > 0) {
                        score += faceCounts.monkey * 100;
                        scoreDescription.push(
                            `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
                        );
                    }

                    if (faceCounts.parrot > 0) {
                        score += faceCounts.parrot * 100;
                        scoreDescription.push(
                            `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
                        );
                    }

                    if (faceCounts.swords > 0) {
                        score += faceCounts.swords * 100;
                        scoreDescription.push(
                            `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
                        );
                    }
                    break;

                case 'diamond_mine':
                    // Diamond Mine - triple diamond value
                    if (faceCounts.diamond > 0) {
                        const diamondValue = calculateDiamondValue(faceCounts.diamond) * 3;
                        score += diamondValue;
                        scoreDescription.push(
                            `${faceCounts.diamond} Diamonds (tripled): ${diamondValue} points`
                        );
                    }

                    // Regular scoring for other dice
                    if (faceCounts.coin > 0) {
                        score += faceCounts.coin * 100;
                        scoreDescription.push(
                            `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
                        );
                    }

                    if (faceCounts.monkey > 0) {
                        score += faceCounts.monkey * 100;
                        scoreDescription.push(
                            `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
                        );
                    }

                    if (faceCounts.parrot > 0) {
                        score += faceCounts.parrot * 100;
                        scoreDescription.push(
                            `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
                        );
                    }

                    if (faceCounts.swords > 0) {
                        score += faceCounts.swords * 100;
                        scoreDescription.push(
                            `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
                        );
                    }
                    break;

                default:
                    // Default scoring for any other card
                    score = calculateBaseScore(faceCounts, scoreDescription);
                    break;
            }
        } else {
            // No card - use default scoring
            score = calculateBaseScore(faceCounts, scoreDescription);
        }

        // Update player score
        const updatedPlayers = [...players];
        updatedPlayers[activePlayer].score += Math.max(0, score);
        setPlayers(updatedPlayers);

        const scoreLog = `${players[activePlayer].name} ${t('scored')} ${score} ${t(
            'points'
        )}!`;
        addToLog(scoreLog);

        // Detailed score breakdown
        scoreDescription.forEach((desc) => {
            addToLog(`- ${desc}`);
        });

        // Check if game is over
        if (updatedPlayers[activePlayer].score >= 8000) {
            setIsGameOver(true);
            setWinner(updatedPlayers[activePlayer]);
            addToLog(
                `${t('game_over')} ${updatedPlayers[activePlayer].name} ${t(
                    'wins'
                )} ${t('with')} ${updatedPlayers[activePlayer].score} ${t('points')}!`
            );
        }
    };

    // End current turn
    const endTurn = () => {
        if (!isGameOver) {
            // Switch to next player
            const nextPlayer = (activePlayer + 1) % players.length;
            setActivePlayer(nextPlayer);
            initNewTurn();
        }
    };

    // Reset the game
    const resetGame = () => {
        setShowStartForm(true);
        setGamePhase('waiting');
        setCurrentDice([]);
        setSelectedDice([]);
        setCurrentCard(null);
        setRollsRemaining(3);
        setIslandOfSkulls(false);
        setSkullCount(0);
        setGameLog([]);
        setIsGameOver(false);
        setWinner(null);
        setGameStarted(false);
        setActivePlayer(0);
    };

    // Render dice face
    const renderDieFace = (face) => {
        const faceSymbols = {
            coin: '🪙',
            diamond: '💎',
            swords: '⚔️',
            monkey: '🐒',
            parrot: '🦜',
            skull: '💀',
        };

        return faceSymbols[face] || face;
    };

    // Value object to provide through context
    const contextValue = {
        // State
        activePlayer,
        players,
        gamePhase,
        currentDice,
        selectedDice,
        currentCard,
        rollsRemaining,
        islandOfSkulls,
        skullCount,
        gameLog,
        isGameOver,
        winner,
        gameStarted,
        isCardFlipping,
        isDiceRolling,
        language,
        playerCount,
        showStartForm,
        direction,
        isRTL,

        // Methods
        setPlayerCount,
        setLanguage,
        initializeGame,
        initNewTurn,
        drawCard,
        rollDice,
        toggleDieSelection,
        endTurn,
        resetGame,
        renderDieFace,
        t,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};