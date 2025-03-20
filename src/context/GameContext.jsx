// // src/context/GameContext.js
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { DICE_FACES, CARDS, translations } from '../constants';

// // Create context
// export const GameContext = createContext();

// // Custom hook for using the game context
// export const useGameContext = () => useContext(GameContext);

// // Provider component
// export const GameProvider = ({ children }) => {
//   // Game state
//   const [activePlayer, setActivePlayer] = useState(0);
//   const [players, setPlayers] = useState([
//     { id: 1, name: 'Player 1', score: 0 },
//     { id: 2, name: 'Player 2', score: 0 },
//   ]);
//   const [gamePhase, setGamePhase] = useState('waiting'); // waiting, drawing, rolling, decision, resolution
//   const [currentDice, setCurrentDice] = useState([]);
//   const [selectedDice, setSelectedDice] = useState([]);
//   const [currentCard, setCurrentCard] = useState(null);
//   const [rollsRemaining, setRollsRemaining] = useState(3);
//   const [islandOfSkulls, setIslandOfSkulls] = useState(false);
//   const [skullCount, setSkullCount] = useState(0);
//   const [gameLog, setGameLog] = useState([]);
//   const [isGameOver, setIsGameOver] = useState(false);
//   const [winner, setWinner] = useState(null);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [isCardFlipping, setIsCardFlipping] = useState(false);
//   const [isDiceRolling, setIsDiceRolling] = useState(false);
//   const [language, setLanguage] = useState('en'); // 'en' for English, 'he' for Hebrew
//   const [playerCount, setPlayerCount] = useState(2);
//   const [showStartForm, setShowStartForm] = useState(true);

//   // Translation helper
//   const t = (key) => translations[language][key] || key;

//   // RTL support
//   const isRTL = language === 'he';
//   const direction = isRTL ? 'rtl' : 'ltr';

//   // Initialize game with players
//   const initializeGame = (playerNames, selectedLanguage) => {
//     const initialPlayers = playerNames.map((name, index) => ({
//       id: index + 1,
//       name: name || `Player ${index + 1}`,
//       score: 0,
//     }));

//     setPlayers(initialPlayers);

//     // Update language if changed
//     if (selectedLanguage && selectedLanguage !== language) {
//       setLanguage(selectedLanguage);
//     }

//     setShowStartForm(false);
//     startGame();
//   };

//   // Initialize dice
//   useEffect(() => {
//     if (gameStarted) {
//       initNewTurn();
//     }
//   }, [gameStarted]);

//   // Helper function to initialize a new turn
//   const initNewTurn = () => {
//     // Create new dice with blank faces initially
//     const newDice = Array(8)
//       .fill(null)
//       .map((_, index) => ({
//         id: index,
//         face: 'blank', // Using 'blank' as a placeholder
//         selected: false,
//         locked: false,
//       }));

//     setCurrentDice(newDice);
//     setSelectedDice([]);
//     setCurrentCard(null);
//     setRollsRemaining(3);
//     setGamePhase('drawing');
//     setIslandOfSkulls(false);
//     setSkullCount(0);
//     setSkullRerollUsed(false);

//     addToLog(`${players[activePlayer].name}'s turn`);
//   };

//   // Get random dice face
//   const getRandomFace = () => {
//     const randomIndex = Math.floor(Math.random() * DICE_FACES.length);
//     return DICE_FACES[randomIndex];
//   };

//   // Add message to game log
//   const addToLog = (message) => {
//     setGameLog((prevLog) => [message, ...prevLog]);
//   };

//   // Start the game
//   const startGame = () => {
//     setGameStarted(true);
//     setGamePhase('drawing');
//     addToLog(t('start_game') + '!');
//   };

//   // Draw a card
//   const drawCard = () => {
//     if (gamePhase !== 'drawing') return;

//     setIsCardFlipping(true);

//     // Add delay for animation
//     setTimeout(() => {
//       const randomIndex = Math.floor(Math.random() * CARDS.length);
//       const card = CARDS[randomIndex];

//       setCurrentCard(card);
//       setGamePhase('rolling');

//       const cardName = language === 'he' ? card.hebrewName : card.name;
//       const cardDesc =
//         language === 'he' ? card.hebrewDescription : card.description;

//       addToLog(
//         `${players[activePlayer].name} ${t(
//           'draw_card'
//         )}: ${cardName} - ${cardDesc}`
//       );

//       setIsCardFlipping(false);
//     }, 600);
//   };

//   // Roll dice
//   const rollDice = () => {
//     if (gamePhase !== 'rolling' && gamePhase !== 'decision') return;
//     if (rollsRemaining <= 0 && !islandOfSkulls) return;

//     setIsDiceRolling(true);

//     // Add delay for animation
//     setTimeout(() => {
//       // Roll all dice in first roll, or selected dice in subsequent rolls
//       const newDice = currentDice.map((die, index) => {
//         // Don't roll locked dice
//         if (die.locked) return die;

//         // Roll all dice in first roll, or only selected dice in rerolls
//         if (gamePhase === 'rolling' || selectedDice.includes(index)) {
//           return {
//             ...die,
//             face: getRandomFace(),
//             selected: false,
//           };
//         }

//         return die;
//       });

//       setCurrentDice(newDice);
//       setSelectedDice([]);

//       // Check for skulls
//       if (gamePhase === 'rolling') {
//         const skulls = newDice.filter((die) => die.face === 'skull').length;

//         // 3 or more skulls - end turn immediately (unless this is island of skulls)
//         if (skulls >= 3 && !islandOfSkulls) {
//           // Lock skull dice
//           const lockedDice = newDice.map((die) => {
//             if (die.face === 'skull') {
//               return { ...die, locked: true };
//             }
//             return die;
//           });

//           setCurrentDice(lockedDice);
//           addToLog(
//             `${players[activePlayer].name} ${t('roll_dice')} ${skulls} ${t(
//               'skull_count'
//             )} - Turn ends!`
//           );

//           // End the turn immediately
//           setTimeout(() => {
//             const nextPlayer = (activePlayer + 1) % players.length;
//             setActivePlayer(nextPlayer);
//             initNewTurn();
//           }, 1500); // Short delay so player can see what happened

//           return; // Exit early to prevent further processing
//         } else {
//           addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
//         }
//       } else {
//         addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
//       }

//       // Handle Island of Skulls
//       if (islandOfSkulls) {
//         const newSkulls = newDice.filter((die) => die.face === 'skull').length;
//         setSkullCount(newSkulls);

//         if (newSkulls === 0) {
//           addToLog(
//             `${players[activePlayer].name} ${t('no_skulls_in_island')}.`
//           );
//         } else {
//           // Apply penalty to other players based on the card effect
//           const otherPlayerIndices = [];
//           for (let i = 0; i < players.length; i++) {
//             if (i !== activePlayer) {
//               otherPlayerIndices.push(i);
//             }
//           }

//           const updatedPlayers = [...players];
//           const penaltyPoints = newSkulls * 100;

//           otherPlayerIndices.forEach((idx) => {
//             updatedPlayers[idx].score = Math.max(
//               0,
//               updatedPlayers[idx].score - penaltyPoints
//             );
//           });

//           setPlayers(updatedPlayers);

//           const otherPlayerNames = otherPlayerIndices
//             .map((idx) => players[idx].name)
//             .join(', ');
//           addToLog(
//             `${players[activePlayer].name} ${t('roll_dice')} ${newSkulls} ${t(
//               'skull_count'
//             )}! ${otherPlayerNames} ${t('loses')} ${penaltyPoints} ${t(
//               'points'
//             )}.`
//           );
//         }
//       } else {
//         // Decrement rolls remaining
//         setRollsRemaining((prevRolls) => prevRolls - 1);

//         // Move to decision phase if rolls remaining
//         if (rollsRemaining > 1) {
//           setGamePhase('decision');
//         } else {
//           // Final roll - calculate score
//           calculateScore();
//           setGamePhase('resolution');
//         }
//       }

//       setIsDiceRolling(false);
//     }, 800);
//   };

//   // Track if skull reroll was used with Sorceress
//   const [skullRerollUsed, setSkullRerollUsed] = useState(false);

//   // Toggle dice selection
//   const toggleDieSelection = (index) => {
//     if (isDiceRolling) return;

//     const die = currentDice[index];

//     // Check if trying to select a skull die
//     if (die.face === 'skull') {
//       // Can only select skull if we have Sorceress card and haven't used the reroll yet
//       if (
//         currentCard &&
//         currentCard.effect === 'reroll_skull' &&
//         !skullRerollUsed &&
//         gamePhase === 'decision'
//       ) {
//         setSelectedDice([index]); // Only select this skull
//         setSkullRerollUsed(true); // Mark the ability as used
//         addToLog(
//           `${players[activePlayer].name} uses Sorceress to reroll a skull!`
//         );
//         return;
//       }
//       // Cannot select skulls otherwise
//       return;
//     }

//     // For non-skull dice in decision phase
//     if (gamePhase !== 'decision' || die.locked) return;

//     setSelectedDice((prevSelected) => {
//       if (prevSelected.includes(index)) {
//         return prevSelected.filter((i) => i !== index);
//       } else {
//         return [...prevSelected, index];
//       }
//     });
//   };

//   // Calculate diamond value (exponential for 3+ diamonds)
//   const calculateDiamondValue = (count) => {
//     if (count <= 2) {
//       return count * 100;
//     } else {
//       // Exponential scoring for 3+ diamonds
//       return Math.pow(2, count) * 100;
//     }
//   };

//   // Calculate base score without special card effects
//   const calculateBaseScore = (faceCounts, scoreDescription) => {
//     let score = 0;

//     // Score for coins
//     if (faceCounts.coin > 0) {
//       const coinScore = faceCounts.coin * 100;
//       score += coinScore;
//       scoreDescription.push(`${faceCounts.coin} Coins: ${coinScore} points`);
//     }

//     // Score for diamonds
//     if (faceCounts.diamond > 0) {
//       const diamondScore = calculateDiamondValue(faceCounts.diamond);
//       score += diamondScore;
//       scoreDescription.push(
//         `${faceCounts.diamond} Diamonds: ${diamondScore} points`
//       );
//     }

//     // Score for monkeys
//     if (faceCounts.monkey > 0) {
//       const monkeyScore = faceCounts.monkey * 100;
//       score += monkeyScore;
//       scoreDescription.push(
//         `${faceCounts.monkey} Monkeys: ${monkeyScore} points`
//       );
//     }

//     // Score for parrots
//     if (faceCounts.parrot > 0) {
//       const parrotScore = faceCounts.parrot * 100;
//       score += parrotScore;
//       scoreDescription.push(
//         `${faceCounts.parrot} Parrots: ${parrotScore} points`
//       );
//     }

//     // Score for swords
//     if (faceCounts.swords > 0) {
//       const swordScore = faceCounts.swords * 100;
//       score += swordScore;
//       scoreDescription.push(
//         `${faceCounts.swords} Swords: ${swordScore} points`
//       );
//     }

//     return score;
//   };

//   // Debug helper for card effect calculation
//   const debugCardEffect = (card, faceCounts, calculatedScore) => {
//     console.log('Card Effect Debug:');
//     console.log('Card:', card.name, '(', card.effect, ')');
//     console.log('Dice Counts:', faceCounts);
//     console.log('Calculated Score:', calculatedScore);
//   };

//   // Calculate score based on dice and card
//   const calculateScore = () => {
//     // Count dice faces
//     const faceCounts = {};
//     DICE_FACES.forEach((face) => (faceCounts[face] = 0));

//     currentDice.forEach((die) => {
//       if (!die.locked && die.face !== 'blank') {
//         faceCounts[die.face]++;
//       }
//     });

//     let score = 0;
//     let scoreDescription = [];

//     // Apply card effect to score calculation
//     if (currentCard) {
//       switch (currentCard.effect) {
//         case 'double_score':
//           // Captain - double final score
//           score = calculateBaseScore(faceCounts, scoreDescription) * 2;
//           scoreDescription.push(`${currentCard.name}: Score doubled!`);
//           break;

//         case 'monkey_business':
//           // Monkey Business - monkeys and parrots count together
//           const monkeyParrotCount = faceCounts.monkey + faceCounts.parrot;
//           if (monkeyParrotCount > 0) {
//             const monkeyParrotValue = Math.pow(monkeyParrotCount, 2) * 100;
//             score += monkeyParrotValue;
//             scoreDescription.push(
//               `${monkeyParrotCount} Monkeys & Parrots: ${monkeyParrotValue} points`
//             );
//           }

//           // Add other dice values
//           if (faceCounts.coin > 0) {
//             score += faceCounts.coin * 100;
//             scoreDescription.push(
//               `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
//             );
//           }

//           if (faceCounts.diamond > 0) {
//             const diamondValue = calculateDiamondValue(faceCounts.diamond);
//             score += diamondValue;
//             scoreDescription.push(
//               `${faceCounts.diamond} Diamonds: ${diamondValue} points`
//             );
//           }

//           if (faceCounts.swords > 0) {
//             score += faceCounts.swords * 100;
//             scoreDescription.push(
//               `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
//             );
//           }
//           break;

//         case 'storm':
//           // Storm - only coins and diamonds count, but their value is doubled
//           if (faceCounts.coin > 0) {
//             const coinValue = faceCounts.coin * 200;
//             score += coinValue;
//             scoreDescription.push(
//               `${faceCounts.coin} Coins (doubled): ${coinValue} points`
//             );
//           }

//           if (faceCounts.diamond > 0) {
//             const diamondValue = calculateDiamondValue(faceCounts.diamond) * 2;
//             score += diamondValue;
//             scoreDescription.push(
//               `${faceCounts.diamond} Diamonds (doubled): ${diamondValue} points`
//             );
//           }
//           break;

//         case 'sea_battle':
//           // Sea Battle - bonus for swords
//           const swordBonus = faceCounts.swords * 200;
//           score += swordBonus;
//           scoreDescription.push(
//             `${faceCounts.swords} Swords (Sea Battle): ${swordBonus} points`
//           );

//           // Add regular scoring for other dice
//           if (faceCounts.coin > 0) {
//             score += faceCounts.coin * 100;
//             scoreDescription.push(
//               `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
//             );
//           }

//           if (faceCounts.diamond > 0) {
//             const diamondValue = calculateDiamondValue(faceCounts.diamond);
//             score += diamondValue;
//             scoreDescription.push(
//               `${faceCounts.diamond} Diamonds: ${diamondValue} points`
//             );
//           }

//           if (faceCounts.monkey > 0) {
//             score += faceCounts.monkey * 100;
//             scoreDescription.push(
//               `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
//             );
//           }

//           if (faceCounts.parrot > 0) {
//             score += faceCounts.parrot * 100;
//             scoreDescription.push(
//               `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
//             );
//           }
//           break;

//         case 'midas_touch':
//           // Midas Touch - double coin value
//           if (faceCounts.coin > 0) {
//             const coinValue = faceCounts.coin * 200;
//             score += coinValue;
//             scoreDescription.push(
//               `${faceCounts.coin} Coins (doubled): ${coinValue} points`
//             );
//           }

//           // Regular scoring for other dice
//           if (faceCounts.diamond > 0) {
//             const diamondValue = calculateDiamondValue(faceCounts.diamond);
//             score += diamondValue;
//             scoreDescription.push(
//               `${faceCounts.diamond} Diamonds: ${diamondValue} points`
//             );
//           }

//           if (faceCounts.monkey > 0) {
//             score += faceCounts.monkey * 100;
//             scoreDescription.push(
//               `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
//             );
//           }

//           if (faceCounts.parrot > 0) {
//             score += faceCounts.parrot * 100;
//             scoreDescription.push(
//               `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
//             );
//           }

//           if (faceCounts.swords > 0) {
//             score += faceCounts.swords * 100;
//             scoreDescription.push(
//               `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
//             );
//           }
//           break;

//         case 'diamond_mine':
//           // Diamond Mine - triple diamond value
//           if (faceCounts.diamond > 0) {
//             const diamondValue = calculateDiamondValue(faceCounts.diamond) * 3;
//             score += diamondValue;
//             scoreDescription.push(
//               `${faceCounts.diamond} Diamonds (tripled): ${diamondValue} points`
//             );
//           }

//           // Regular scoring for other dice
//           if (faceCounts.coin > 0) {
//             score += faceCounts.coin * 100;
//             scoreDescription.push(
//               `${faceCounts.coin} Coins: ${faceCounts.coin * 100} points`
//             );
//           }

//           if (faceCounts.monkey > 0) {
//             score += faceCounts.monkey * 100;
//             scoreDescription.push(
//               `${faceCounts.monkey} Monkeys: ${faceCounts.monkey * 100} points`
//             );
//           }

//           if (faceCounts.parrot > 0) {
//             score += faceCounts.parrot * 100;
//             scoreDescription.push(
//               `${faceCounts.parrot} Parrots: ${faceCounts.parrot * 100} points`
//             );
//           }

//           if (faceCounts.swords > 0) {
//             score += faceCounts.swords * 100;
//             scoreDescription.push(
//               `${faceCounts.swords} Swords: ${faceCounts.swords * 100} points`
//             );
//           }
//           break;

//         default:
//           // Default scoring for any other card
//           score = calculateBaseScore(faceCounts, scoreDescription);
//           break;
//       }
//     } else {
//       // No card - use default scoring
//       score = calculateBaseScore(faceCounts, scoreDescription);
//     }

//     // Update player score
//     const updatedPlayers = [...players];
//     updatedPlayers[activePlayer].score += Math.max(0, score);
//     setPlayers(updatedPlayers);

//     const scoreLog = `${players[activePlayer].name} ${t('scored')} ${score} ${t(
//       'points'
//     )}!`;
//     addToLog(scoreLog);

//     // Detailed score breakdown
//     scoreDescription.forEach((desc) => {
//       addToLog(`- ${desc}`);
//     });

//     // Check if game is over
//     if (updatedPlayers[activePlayer].score >= 8000) {
//       setIsGameOver(true);
//       setWinner(updatedPlayers[activePlayer]);
//       addToLog(
//         `${t('game_over')} ${updatedPlayers[activePlayer].name} ${t(
//           'wins'
//         )} ${t('with')} ${updatedPlayers[activePlayer].score} ${t('points')}!`
//       );
//     }

//     // Debug card effect (uncomment to debug)
//     // if (currentCard) {
//     //   debugCardEffect(currentCard, faceCounts, score);
//     // }
//   };

//   // End current turn
//   const endTurn = () => {
//     if (!isGameOver) {
//       // Switch to next player
//       const nextPlayer = (activePlayer + 1) % players.length;
//       setActivePlayer(nextPlayer);
//       initNewTurn();
//     }
//   };

//   // Reset the game
//   const resetGame = () => {
//     setShowStartForm(true);
//     setGamePhase('waiting');
//     setCurrentDice([]);
//     setSelectedDice([]);
//     setCurrentCard(null);
//     setRollsRemaining(3);
//     setIslandOfSkulls(false);
//     setSkullCount(0);
//     setGameLog([]);
//     setIsGameOver(false);
//     setWinner(null);
//     setGameStarted(false);
//     setActivePlayer(0);
//     setSkullRerollUsed(false);
//   };

//   // Render dice face
//   const renderDieFace = (face) => {
//     const faceSymbols = {
//       coin: '🪙',
//       diamond: '💎',
//       swords: '⚔️',
//       monkey: '🐒',
//       parrot: '🦜',
//       skull: '💀',
//       blank: '', // No symbol for blank face
//     };

//     return faceSymbols[face] || face;
//   };

//   // Value object to provide through context
//   const contextValue = {
//     // State
//     activePlayer,
//     players,
//     gamePhase,
//     currentDice,
//     selectedDice,
//     currentCard,
//     rollsRemaining,
//     islandOfSkulls,
//     skullCount,
//     gameLog,
//     isGameOver,
//     winner,
//     gameStarted,
//     isCardFlipping,
//     isDiceRolling,
//     language,
//     playerCount,
//     showStartForm,
//     direction,
//     isRTL,
//     skullRerollUsed,

//     // Methods
//     setPlayerCount,
//     setLanguage,
//     initializeGame,
//     initNewTurn,
//     drawCard,
//     rollDice,
//     toggleDieSelection,
//     endTurn,
//     resetGame,
//     renderDieFace,
//     t,
//   };

//   return (
//     <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
//   );
// };

// src/context/GameContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { DICE_FACES, CARDS, translations } from '../constants';

// Create context
export const GameContext = createContext();

// Custom hook for using the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
  // ============================
  // State Management
  // ============================

  // Game configuration
  const [language, setLanguage] = useState('en'); // 'en' for English, 'he' for Hebrew
  const [playerCount, setPlayerCount] = useState(2);
  const [showStartForm, setShowStartForm] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // Players
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', score: 0 },
    { id: 2, name: 'Player 2', score: 0 },
  ]);
  const [activePlayer, setActivePlayer] = useState(0);

  // Game state
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, drawing, rolling, decision, resolution
  const [rollsRemaining, setRollsRemaining] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Skull-related state
  const [islandOfSkulls, setIslandOfSkulls] = useState(false);
  const [skullCount, setSkullCount] = useState(0);
  const [skullRerollUsed, setSkullRerollUsed] = useState(false);
  const [turnEndsWithSkulls, setTurnEndsWithSkulls] = useState(false);
  const [autoEndCountdown, setAutoEndCountdown] = useState(0);

  // Dice and cards
  const [currentDice, setCurrentDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  // UI state
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameLog, setGameLog] = useState([]);

  // RTL support
  const isRTL = language === 'he';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Translation helper
  const t = (key) => translations[language][key] || key;

  // ============================
  // Effects
  // ============================

  // Initialize dice when game starts
  useEffect(() => {
    if (gameStarted) {
      initNewTurn();
    }
  }, [gameStarted]);

  // Auto-end turn countdown when 3+ skulls are rolled
  useEffect(() => {
    let countdownTimer;

    if (turnEndsWithSkulls && autoEndCountdown > 0) {
      countdownTimer = setTimeout(() => {
        setAutoEndCountdown((prev) => prev - 1);
      }, 1000);

      if (autoEndCountdown === 0) {
        endTurn();
      }
    }

    return () => {
      if (countdownTimer) clearTimeout(countdownTimer);
    };
  }, [turnEndsWithSkulls, autoEndCountdown]);

  // ============================
  // Game Initialization
  // ============================

  // Initialize game with players
  const initializeGame = useCallback(
    (playerNames, selectedLanguage) => {
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
    },
    [language]
  );

  // Start the game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGamePhase('drawing');
    addToLog(t('start_game') + '!');
  }, [t]);

  // Reset the game
  const resetGame = useCallback(() => {
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
    setSkullRerollUsed(false);
    setTurnEndsWithSkulls(false);
    setAutoEndCountdown(0);
  }, []);

  // ============================
  // Game Logic Helpers
  // ============================

  // Get random dice face (excluding blank)
  const getRandomFace = useCallback(() => {
    // Use only real dice faces (exclude 'blank')
    const playableFaces = DICE_FACES.filter((face) => face !== 'blank');
    const randomIndex = Math.floor(Math.random() * playableFaces.length);
    return playableFaces[randomIndex];
  }, []);

  // Add message to game log
  const addToLog = useCallback((message) => {
    setGameLog((prevLog) => [message, ...prevLog]);
  }, []);

  // Initialize a new turn
  const initNewTurn = useCallback(() => {
    // Create new dice with blank faces initially
    const newDice = Array(8)
      .fill(null)
      .map((_, index) => ({
        id: index,
        face: 'blank', // Using 'blank' as a placeholder
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
    setSkullRerollUsed(false);
    setTurnEndsWithSkulls(false);
    setAutoEndCountdown(0);

    addToLog(`${players[activePlayer].name}'s turn`);
  }, [players, activePlayer, addToLog]);

  // Render dice face
  const renderDieFace = useCallback((face) => {
    const faceSymbols = {
      coin: '🪙',
      diamond: '💎',
      swords: '⚔️',
      monkey: '🐒',
      parrot: '🦜',
      skull: '💀',
      blank: '', // No symbol for blank face
    };

    return faceSymbols[face] || face;
  }, []);

  // ============================
  // Game Actions
  // ============================

  // Draw a card
  const drawCard = useCallback(() => {
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
  }, [gamePhase, language, players, activePlayer, addToLog, t]);

  // Roll dice
  const rollDice = useCallback(() => {
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

      // Check for skulls
      if (gamePhase === 'rolling') {
        const skulls = newDice.filter((die) => die.face === 'skull').length;

        // 3 or more skulls - end turn but show button instead of auto-ending
        if (skulls >= 3 && !islandOfSkulls) {
          // Lock skull dice
          const lockedDice = newDice.map((die) => {
            if (die.face === 'skull') {
              return { ...die, locked: true };
            }
            return die;
          });

          setCurrentDice(lockedDice);
          setTurnEndsWithSkulls(true);
          setAutoEndCountdown(15); // Start 15 second countdown

          addToLog(
            `${players[activePlayer].name} ${t('roll_dice')} ${skulls} ${t(
              'skull_count'
            )} - Turn will end!`
          );

          // Change phase to resolution to disable dice rolling
          setGamePhase('resolution');
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
      } else if (!turnEndsWithSkulls) {
        // Only decrement rolls if turn isn't ending with skulls
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
  }, [
    gamePhase,
    rollsRemaining,
    islandOfSkulls,
    currentDice,
    selectedDice,
    players,
    activePlayer,
    turnEndsWithSkulls,
    addToLog,
    getRandomFace,
    t,
  ]);

  // Toggle dice selection
  const toggleDieSelection = useCallback(
    (index) => {
      if (isDiceRolling) return;

      const die = currentDice[index];

      // Check if trying to select a skull die
      if (die.face === 'skull') {
        // Can only select skull if we have Sorceress card and haven't used the reroll yet
        if (
          currentCard &&
          currentCard.effect === 'reroll_skull' &&
          !skullRerollUsed &&
          gamePhase === 'decision'
        ) {
          setSelectedDice([index]); // Only select this skull
          setSkullRerollUsed(true); // Mark the ability as used
          addToLog(
            `${players[activePlayer].name} uses Sorceress to reroll a skull!`
          );
          return;
        }
        // Cannot select skulls otherwise
        return;
      }

      // For non-skull dice in decision phase
      if (gamePhase !== 'decision' || die.locked) return;

      setSelectedDice((prevSelected) => {
        if (prevSelected.includes(index)) {
          return prevSelected.filter((i) => i !== index);
        } else {
          return [...prevSelected, index];
        }
      });
    },
    [
      isDiceRolling,
      currentDice,
      currentCard,
      skullRerollUsed,
      gamePhase,
      players,
      activePlayer,
      addToLog,
    ]
  );

  // End current turn
  const endTurn = useCallback(() => {
    if (!isGameOver) {
      // Switch to next player
      const nextPlayer = (activePlayer + 1) % players.length;
      setActivePlayer(nextPlayer);
      initNewTurn();
    }
  }, [isGameOver, activePlayer, players.length, initNewTurn]);

  // ============================
  // Score Calculation
  // ============================

  // Calculate diamond value (exponential for 3+ diamonds)
  const calculateDiamondValue = useCallback((count) => {
    if (count <= 2) {
      return count * 100;
    } else {
      // Exponential scoring for 3+ diamonds
      return Math.pow(2, count) * 100;
    }
  }, []);

  // Calculate base score without special card effects
  const calculateBaseScore = useCallback(
    (faceCounts, scoreDescription) => {
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
    },
    [calculateDiamondValue]
  );

  // Debug helper for card effect calculation
  const debugCardEffect = useCallback((card, faceCounts, calculatedScore) => {
    console.log('Card Effect Debug:');
    console.log('Card:', card.name, '(', card.effect, ')');
    console.log('Dice Counts:', faceCounts);
    console.log('Calculated Score:', calculatedScore);
  }, []);

  // Calculate score based on dice and card
  const calculateScore = useCallback(() => {
    // Count dice faces
    const faceCounts = {};
    DICE_FACES.forEach((face) => (faceCounts[face] = 0));

    currentDice.forEach((die) => {
      if (!die.locked && die.face !== 'blank') {
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

    // Debug card effect (uncomment to debug)
    // if (currentCard) {
    //   debugCardEffect(currentCard, faceCounts, score);
    // }
  }, [
    currentDice,
    currentCard,
    players,
    activePlayer,
    calculateBaseScore,
    calculateDiamondValue,
    debugCardEffect,
    addToLog,
    t,
  ]);

  // ============================
  // Context Value
  // ============================

  // Value object to provide through context
  const contextValue = {
    // Game configuration
    language,
    playerCount,
    showStartForm,
    gameStarted,
    direction,
    isRTL,

    // Players
    players,
    activePlayer,

    // Game state
    gamePhase,
    rollsRemaining,
    isGameOver,
    winner,

    // Skull-related state
    islandOfSkulls,
    skullCount,
    skullRerollUsed,
    turnEndsWithSkulls,
    autoEndCountdown,

    // Dice and cards
    currentDice,
    selectedDice,
    currentCard,

    // UI state
    isCardFlipping,
    isDiceRolling,
    gameLog,

    // Methods
    setPlayerCount,
    setLanguage,
    initializeGame,
    startGame,
    resetGame,
    drawCard,
    rollDice,
    toggleDieSelection,
    endTurn,
    renderDieFace,
    t,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
