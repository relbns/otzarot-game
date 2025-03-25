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
  const [language, setLanguage] = useState('he'); // 'en' for English, 'he' for Hebrew
  const [playerCount, setPlayerCount] = useState(2);
  const [showStartForm, setShowStartForm] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [deck, setDeck] = useState([]);

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
  const [showShuffleNotification, setShowShuffleNotification] = useState(false);

  // Score modal state
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [turnScore, setTurnScore] = useState(0);
  const [turnScoreDetails, setTurnScoreDetails] = useState([]);
  const [turnPenalties, setTurnPenalties] = useState(0);
  const [turnPenaltyDetails, setTurnPenaltyDetails] = useState([]);

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

  useEffect(() => {
    let countdownTimer;

    if (turnEndsWithSkulls && autoEndCountdown > 0) {
      countdownTimer = setTimeout(() => {
        setAutoEndCountdown((prev) => prev - 1);
      }, 1000);
    } else if (turnEndsWithSkulls && autoEndCountdown === 0) {
      // When countdown reaches zero, automatically end the turn
      endTurn();
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

      // Update language immediately if changed
      if (selectedLanguage) {
        setLanguage(selectedLanguage);
      }

      setShowStartForm(false);
      startGame();
    },
    [] // Remove language dependency to avoid re-creation
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
        inTreasureChest: false, // Add this property to track treasure chest status
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

  const handleInitialCardEffects = useCallback(
    (card) => {
      if (!card) return;

      let newDice = [...currentDice];
      let modifiedDice = false;

      switch (card.effect) {
        case 'start_with_gold':
          // Find the first blank die and change it to coin
          for (let i = 0; i < newDice.length; i++) {
            if (newDice[i].face === 'blank') {
              newDice[i] = {
                ...newDice[i],
                face: 'coin',
                locked: false, // Lock the die so it can't be rerolled
                lockedByCard: true, // Mark it as locked by card for scoring
              };
              modifiedDice = true;
              break;
            }
          }
          addToLog(`${players[activePlayer].name} ${t('start_with_gold')}`);
          break;

        case 'start_with_diamond':
          // Find the first blank die and change it to diamond
          for (let i = 0; i < newDice.length; i++) {
            if (newDice[i].face === 'blank') {
              newDice[i] = {
                ...newDice[i],
                face: 'diamond',
                locked: false,
                lockedByCard: true, // Mark it as locked by card for scoring
              };
              modifiedDice = true;
              break;
            }
          }
          addToLog(`${players[activePlayer].name} ${t('start_with_diamond')}`);
          break;

        case 'start_with_1_skull':
          // Add one skull
          for (let i = 0; i < newDice.length; i++) {
            if (newDice[i].face === 'blank') {
              newDice[i] = {
                ...newDice[i],
                face: 'skull',
                locked: true,
              };
              modifiedDice = true;
              break;
            }
          }
          setSkullCount((prevCount) => prevCount + 1);
          addToLog(`${players[activePlayer].name} ${t('start_with_1_skull')}`);
          break;

        case 'start_with_2_skulls':
          // Add two skulls
          let skullsAdded = 0;
          for (let i = 0; i < newDice.length && skullsAdded < 2; i++) {
            if (newDice[i].face === 'blank') {
              newDice[i] = {
                ...newDice[i],
                face: 'skull',
                locked: true,
              };
              skullsAdded++;
              modifiedDice = true;
            }
          }
          setSkullCount((prevCount) => prevCount + 2);
          addToLog(`${players[activePlayer].name} ${t('start_with_2_skulls')}`);

          // Check if we have 3+ skulls with the starting skulls
          if (skullCount + 2 >= 3) {
            // Lock all skull dice
            newDice = newDice.map((die) => {
              if (die.face === 'skull') {
                return { ...die, locked: true };
              }
              return die;
            });

            setTurnEndsWithSkulls(true);
            setAutoEndCountdown(15);

            addToLog(
              `${players[activePlayer].name} ${t('roll_dice')} ${
                skullCount + 2
              } ${t('skull_count')} - Turn will end!`
            );
            setGamePhase('resolution');
          }
          break;

        default:
          // No immediate effect for other cards
          break;
      }

      // Update the dice
      setCurrentDice(newDice);

      // After applying card effect, roll the remaining blank dice automatically
      if (modifiedDice) {
        // Wait a short time to show the card effect before rolling
        setTimeout(() => {
          // Only roll dice that are still blank
          const rolledDice = newDice.map((die) => {
            if (die.face === 'blank' && !die.locked) {
              return {
                ...die,
                face: getRandomFace(),
              };
            }
            return die;
          });

          setCurrentDice(rolledDice);
          setGamePhase('decision');

          // Count skulls after rolling
          const skullCount = rolledDice.filter(
            (die) => die.face === 'skull' && !die.locked
          ).length;
          if (skullCount >= 3) {
            // Lock skull dice
            const lockedDice = rolledDice.map((die) => {
              if (die.face === 'skull' && !die.locked) {
                return { ...die, locked: true };
              }
              return die;
            });

            setCurrentDice(lockedDice);
            setTurnEndsWithSkulls(true);
            setAutoEndCountdown(15);

            addToLog(
              `${players[activePlayer].name} ${t(
                'roll_dice'
              )} ${skullCount} ${t('skull_count')} - Turn will end!`
            );
            setGamePhase('resolution');
          }

          // Decrement rolls remaining since we auto-rolled
          setRollsRemaining((prevRolls) => prevRolls - 1);
        }, 800);
      }
    },
    [
      currentDice,
      addToLog,
      t,
      players,
      activePlayer,
      skullCount,
      getRandomFace,
      setSkullCount,
      setTurnEndsWithSkulls,
      setAutoEndCountdown,
      setGamePhase,
      setRollsRemaining,
    ]
  );

  // Draw a card
  const drawCard = useCallback(() => {
    if (gamePhase !== 'drawing') return;

    setIsCardFlipping(true);

    // Create a new deck if it doesn't exist or is empty
    if (!deck || deck.length === 0) {
      // Show shuffle notification
      setShowShuffleNotification(true);

      // Build a new deck
      let newDeck = [];
      CARDS.forEach((card) => {
        // Add each card to the deck based on timesShown value
        for (let i = 0; i < (card.timesShown || 1); i++) {
          newDeck.push({ ...card });
        }
      });

      // Shuffle the deck using Fisher-Yates algorithm
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }

      setDeck(newDeck);

      // Add log entry
      addToLog(t('deck_shuffled'));

      // Close shuffle notification after 1.5 seconds
      setTimeout(() => {
        setShowShuffleNotification(false);

        // Now draw a card after notification is dismissed
        setTimeout(() => {
          const drawnCard = newDeck[0];
          const updatedDeck = newDeck.slice(1);

          setDeck(updatedDeck);
          setCurrentCard(drawnCard);

          // Handle special card effects that start immediately
          handleInitialCardEffects(drawnCard);

          setGamePhase('rolling');

          const cardName =
            language === 'he' ? drawnCard.hebrewName : drawnCard.name;
          const cardDesc =
            language === 'he'
              ? drawnCard.hebrewDescription
              : drawnCard.description;

          addToLog(
            `${players[activePlayer].name} ${t(
              'draw_card'
            )}: ${cardName} - ${cardDesc}`
          );

          setIsCardFlipping(false);
        }, 600);
      }, 1500);

      return;
    }

    // Standard drawing from existing deck
    setTimeout(() => {
      if (deck && deck.length > 0) {
        const drawnCard = deck[0];
        const newDeck = deck.slice(1);

        setDeck(newDeck);
        setCurrentCard(drawnCard);

        // Handle special card effects that start immediately
        handleInitialCardEffects(drawnCard);

        setGamePhase('rolling');

        const cardName =
          language === 'he' ? drawnCard.hebrewName : drawnCard.name;
        const cardDesc =
          language === 'he'
            ? drawnCard.hebrewDescription
            : drawnCard.description;

        addToLog(
          `${players[activePlayer].name} ${t(
            'draw_card'
          )}: ${cardName} - ${cardDesc}`
        );
      } else {
        console.error('Failed to draw card from deck');
      }

      setIsCardFlipping(false);
    }, 600);
  }, [
    gamePhase,
    language,
    players,
    activePlayer,
    addToLog,
    t,
    deck,
    handleInitialCardEffects,
  ]);

  const calculateSetValue = useCallback((count) => {
    if (count < 3) {
      return count * 100; // 100 points per item for 1-2 items
    } else {
      // For sets of 3 or more, use correct scoring from rules:
      // 3 of a kind = 100 points
      // 4 of a kind = 200 points
      // 5 of a kind = 500 points
      // 6 of a kind = 1,000 points
      // 7 of a kind = 2,000 points
      // 8 of a kind = 4,000 points
      switch (count) {
        case 3:
          return 100;
        case 4:
          return 200;
        case 5:
          return 500;
        case 6:
          return 1000;
        case 7:
          return 2000;
        case 8:
          return 4000;
        default:
          return count * 100;
      }
    }
  }, []);

  // Calculate base score without special card effects
  const calculateBaseScore = useCallback(
    (diceCounts, scoreDescription) => {
      let totalScore = 0;

      // Score sets first
      Object.entries(diceCounts).forEach(([face, count]) => {
        if (count >= 3 && face !== 'skull') {
          const setScore = calculateSetValue(count);
          totalScore += setScore;
          scoreDescription.push(
            `${count} ${
              face.charAt(0).toUpperCase() + face.slice(1)
            }s (set): ${setScore} points`
          );
        }
      });

      // Individual values for coins and diamonds (these score twice)
      if (diceCounts.coin > 0) {
        const coinScore = diceCounts.coin * 100;
        totalScore += coinScore;
        scoreDescription.push(
          `${diceCounts.coin} Coins (individual): ${coinScore} points`
        );
      }

      if (diceCounts.diamond > 0) {
        const diamondScore = diceCounts.diamond * 100;
        totalScore += diamondScore;
        scoreDescription.push(
          `${diceCounts.diamond} Diamonds (individual): ${diamondScore} points`
        );
      }

      return totalScore;
    },
    [calculateSetValue]
  );

  // Calculate diamond value (exponential for 3+ diamonds)
  const calculateDiamondValue = useCallback((count) => {
    if (count <= 2) {
      return count * 100;
    } else {
      // Exponential scoring for 3+ diamonds
      return Math.pow(2, count) * 100;
    }
  }, []);

  // Calculate score based on dice and card
  const calculateScore = useCallback(() => {
    // Count regular dice faces (not in treasure chest and not locked)
    const faceCounts = {};
    DICE_FACES.forEach((face) => (faceCounts[face] = 0));

    // Count treasure chest dice separately
    const treasureChestCounts = {};
    DICE_FACES.forEach((face) => (treasureChestCounts[face] = 0));

    // Count card-provided dice (from Gold, Diamond, etc. cards)
    const cardProvidedCounts = {};
    DICE_FACES.forEach((face) => (cardProvidedCounts[face] = 0));

    // Track if dice was provided by card
    let cardProvidedDice = null;

    // Check if current card provides a die
    if (currentCard) {
      if (currentCard.effect === 'start_with_gold') {
        cardProvidedDice = 'coin';
        cardProvidedCounts.coin = 1;
      } else if (currentCard.effect === 'start_with_diamond') {
        cardProvidedDice = 'diamond';
        cardProvidedCounts.diamond = 1;
      }
    }

    // Count dice by location
    currentDice.forEach((die) => {
      if (die.face !== 'blank') {
        if (die.inTreasureChest) {
          treasureChestCounts[die.face]++;
        } else if (
          !die.locked ||
          (cardProvidedDice && die.face === cardProvidedDice)
        ) {
          // Include card-provided dice in regular counts but don't double count
          if (
            !(
              cardProvidedDice &&
              die.face === cardProvidedDice &&
              die.lockedByCard
            )
          ) {
            faceCounts[die.face]++;
          }
        }
      }
    });

    // Combine counts for scoring if not disqualified by skulls
    const combinedCounts = { ...faceCounts };

    // Add treasure chest dice to combined counts
    Object.keys(treasureChestCounts).forEach((face) => {
      combinedCounts[face] += treasureChestCounts[face];
    });

    // Add card-provided dice to combined counts (only if not already counted)
    // This ensures card-provided dice are counted in sets
    Object.keys(cardProvidedCounts).forEach((face) => {
      // Only add if there was a locked die from the card that wasn't counted
      if (cardProvidedDice === face) {
        const cardDieAlreadyCounted = currentDice.some(
          (die) => die.face === face && die.lockedByCard && !die.inTreasureChest
        );

        if (!cardDieAlreadyCounted) {
          combinedCounts[face] += cardProvidedCounts[face];
        }
      }
    });

    let score = 0;
    let scoreDescription = [];
    let penalties = 0;
    let penaltyDescription = [];

    // Log combined counts for debugging
    console.log('Regular dice counts:', faceCounts);
    console.log('Treasure chest dice counts:', treasureChestCounts);
    console.log('Combined counts for scoring:', combinedCounts);

    // Check if player is disqualified by skulls (3 or more skulls)
    const isDisqualified = faceCounts.skull >= 3;

    // If disqualified, we only score treasure chest dice
    if (isDisqualified) {
      addToLog(
        `${players[activePlayer].name} is disqualified with ${faceCounts.skull} skulls!`
      );

      // Treasure chest dice still count even when disqualified
      if (currentCard && currentCard.effect === 'store_dice') {
        scoreDescription.push(
          `Treasure Chest: Dice saved from disqualification`
        );

        // Score only the treasure chest dice
        let treasureChestScore = 0;

        // Calculate sets for dice in treasure chest
        const setCounts = calculateSetCounts(treasureChestCounts);

        // Add set scores
        Object.entries(setCounts).forEach(([face, count]) => {
          if (count >= 3 && face !== 'skull') {
            const setScore = calculateSetValue(count);
            treasureChestScore += setScore;
            scoreDescription.push(
              `${count} ${
                face.charAt(0).toUpperCase() + face.slice(1)
              }s (set): ${setScore} points`
            );
          }
        });

        // Add individual values for diamonds and coins
        if (treasureChestCounts.coin > 0) {
          const coinScore = treasureChestCounts.coin * 100;
          treasureChestScore += coinScore;
          scoreDescription.push(
            `${treasureChestCounts.coin} Coins (individual): ${coinScore} points`
          );
        }

        if (treasureChestCounts.diamond > 0) {
          const diamondScore = treasureChestCounts.diamond * 100;
          treasureChestScore += diamondScore;
          scoreDescription.push(
            `${treasureChestCounts.diamond} Diamonds (individual): ${diamondScore} points`
          );
        }

        score += treasureChestScore;
      } else {
        scoreDescription.push(
          `Disqualified with ${faceCounts.skull} skulls - No points earned`
        );
      }
    }
    // Not disqualified, score normally with card effects
    else {
      // Apply card effect to score calculation
      if (currentCard) {
        switch (currentCard.effect) {
          case 'double_score':
            // Captain - double final score
            score = calculateBaseScore(combinedCounts, scoreDescription) * 2;
            scoreDescription.push(`${currentCard.name}: Score doubled!`);
            break;

          case 'store_dice':
            // Treasure Chest - regular scoring, treasure chest dice already included
            score = calculateBaseScore(combinedCounts, scoreDescription);
            break;

          case 'monkey_business':
            // Monkey Business - monkeys and parrots count together
            const monkeyParrotCount =
              combinedCounts.monkey + combinedCounts.parrot;

            // First check if we have a set of monkeys+parrots
            if (monkeyParrotCount >= 3) {
              const setScore = calculateSetValue(monkeyParrotCount);
              score += setScore;
              scoreDescription.push(
                `${monkeyParrotCount} Monkeys & Parrots (set): ${setScore} points`
              );
            } else if (monkeyParrotCount > 0) {
              // If not a set, score individual values
              score += monkeyParrotCount * 100;
              scoreDescription.push(
                `${monkeyParrotCount} Monkeys & Parrots: ${
                  monkeyParrotCount * 100
                } points`
              );
            }

            // Score sets of other dice
            const setCounts = { ...combinedCounts };
            // Remove monkeys and parrots since we've already counted them together
            setCounts.monkey = 0;
            setCounts.parrot = 0;

            // Score sets
            Object.entries(setCounts).forEach(([face, count]) => {
              if (count >= 3 && face !== 'skull') {
                const setScore = calculateSetValue(count);
                score += setScore;
                scoreDescription.push(
                  `${count} ${
                    face.charAt(0).toUpperCase() + face.slice(1)
                  }s (set): ${setScore} points`
                );
              }
            });

            // Add individual values for diamonds and coins
            if (combinedCounts.coin > 0) {
              const coinScore = combinedCounts.coin * 100;
              score += coinScore;
              scoreDescription.push(
                `${combinedCounts.coin} Coins (individual): ${coinScore} points`
              );
            }

            if (combinedCounts.diamond > 0) {
              const diamondScore = combinedCounts.diamond * 100;
              score += diamondScore;
              scoreDescription.push(
                `${combinedCounts.diamond} Diamonds (individual): ${diamondScore} points`
              );
            }
            break;

          case 'storm':
            // Storm - only coins and diamonds count, but their value is doubled
            if (combinedCounts.coin > 0) {
              const coinValue = combinedCounts.coin * 200;
              score += coinValue;
              scoreDescription.push(
                `${combinedCounts.coin} Coins (doubled): ${coinValue} points`
              );
            }

            if (combinedCounts.diamond > 0) {
              const diamondValue = combinedCounts.diamond * 200;
              score += diamondValue;
              scoreDescription.push(
                `${combinedCounts.diamond} Diamonds (doubled): ${diamondValue} points`
              );
            }
            break;

          case 'sea_battle_2':
          case 'sea_battle_3':
          case 'sea_battle_4':
            // Sea Battle - bonus for swords, or penalty if not enough swords
            const requiredSwords = parseInt(
              currentCard.effect.charAt(currentCard.effect.length - 1)
            );
            const bonus = currentCard.bonus || 0;

            if (combinedCounts.swords >= requiredSwords) {
              // Bonus for having required swords
              score += bonus;
              scoreDescription.push(
                `Sea Battle Bonus (${requiredSwords} swords): ${bonus} points`
              );

              // Continue with normal scoring
              score += calculateBaseScore(combinedCounts, scoreDescription);
            } else {
              // Penalty for not having enough swords
              penalties += bonus;
              penaltyDescription.push(
                `Sea Battle Penalty (missing ${
                  requiredSwords - combinedCounts.swords
                } swords): -${bonus} points`
              );

              // Still score normally
              score += calculateBaseScore(combinedCounts, scoreDescription);
            }
            break;

          case 'truce':
            // Truce - penalty if ending with swords
            if (combinedCounts.swords > 0) {
              penalties += combinedCounts.swords * 500;
              penaltyDescription.push(
                `Truce Penalty (${combinedCounts.swords} swords): -${
                  combinedCounts.swords * 500
                } points`
              );
            }

            // Regular scoring for all dice except swords
            const truceCounts = { ...combinedCounts };
            truceCounts.swords = 0; // Don't count swords

            score += calculateBaseScore(truceCounts, scoreDescription);
            break;

          case 'midas_touch':
            // Midas Touch - double coin value
            if (combinedCounts.coin > 0) {
              const coinValue = combinedCounts.coin * 200;
              score += coinValue;
              scoreDescription.push(
                `${combinedCounts.coin} Coins (doubled): ${coinValue} points`
              );
            }

            // Score sets
            const midasCounts = { ...combinedCounts };
            midasCounts.coin = 0; // Already counted the coins

            // Add scores for other dice
            Object.entries(midasCounts).forEach(([face, count]) => {
              if (count >= 3 && face !== 'skull') {
                const setScore = calculateSetValue(count);
                score += setScore;
                scoreDescription.push(
                  `${count} ${
                    face.charAt(0).toUpperCase() + face.slice(1)
                  }s (set): ${setScore} points`
                );
              }
            });

            // Add individual diamond values
            if (combinedCounts.diamond > 0) {
              const diamondScore = combinedCounts.diamond * 100;
              score += diamondScore;
              scoreDescription.push(
                `${combinedCounts.diamond} Diamonds (individual): ${diamondScore} points`
              );
            }
            break;

          case 'diamond_mine':
            // Diamond Mine - triple diamond value
            if (combinedCounts.diamond > 0) {
              const diamondValue = combinedCounts.diamond * 300;
              score += diamondValue;
              scoreDescription.push(
                `${combinedCounts.diamond} Diamonds (tripled): ${diamondValue} points`
              );
            }

            // Score sets
            const diamondMineCounts = { ...combinedCounts };
            diamondMineCounts.diamond = 0; // Already counted the diamonds

            // Add scores for other dice
            Object.entries(diamondMineCounts).forEach(([face, count]) => {
              if (count >= 3 && face !== 'skull') {
                const setScore = calculateSetValue(count);
                score += setScore;
                scoreDescription.push(
                  `${count} ${
                    face.charAt(0).toUpperCase() + face.slice(1)
                  }s (set): ${setScore} points`
                );
              }
            });

            // Add individual coin values
            if (combinedCounts.coin > 0) {
              const coinScore = combinedCounts.coin * 100;
              score += coinScore;
              scoreDescription.push(
                `${combinedCounts.coin} Coins (individual): ${coinScore} points`
              );
            }
            break;

          case 'zombie_attack':
            // Zombie Attack - must roll until only skulls and swords remain
            // If player has 5+ swords, they win 1200 points
            // Otherwise, opponents share 1200 points equally
            if (combinedCounts.swords >= 5) {
              score += 1200;
              scoreDescription.push(
                `Zombie Attack Victory (${combinedCounts.swords} swords): 1200 points`
              );
            } else {
              // Split 1200 points among opponents
              const opponentCount = players.length - 1;
              if (opponentCount > 0) {
                const pointsPerOpponent = Math.floor(1200 / opponentCount);

                // Add penalty description
                penaltyDescription.push(
                  `Zombie Attack Failed: Opponents share 1200 points`
                );

                // Update opponents' scores
                const updatedPlayers = [...players];
                for (let i = 0; i < players.length; i++) {
                  if (i !== activePlayer) {
                    updatedPlayers[i].score += pointsPerOpponent;
                  }
                }
                setPlayers(updatedPlayers);

                addToLog(
                  `Zombie Attack failed! Each opponent gains ${pointsPerOpponent} points.`
                );
              }
            }

            // Score the swords
            if (combinedCounts.swords > 0) {
              score += combinedCounts.swords * 100;
              scoreDescription.push(
                `${combinedCounts.swords} Swords: ${
                  combinedCounts.swords * 100
                } points`
              );
            }
            break;

          default:
            // Default scoring for any other card
            score = calculateBaseScore(combinedCounts, scoreDescription);
            break;
        }
      } else {
        // No card - use default scoring
        score = calculateBaseScore(combinedCounts, scoreDescription);
      }
    }

    // Add Full Chest bonus (500 points if all 8 dice score points)
    const nonSkullDice =
      combinedCounts.coin +
      combinedCounts.diamond +
      combinedCounts.monkey +
      combinedCounts.parrot +
      combinedCounts.swords;

    if (nonSkullDice === 8) {
      score += 500;
      scoreDescription.push('Full Chest Bonus: 500 points');
    }

    // Apply penalties if any
    const finalScore = Math.max(0, score - penalties);

    // Update player score
    const updatedPlayers = [...players];
    updatedPlayers[activePlayer].score += finalScore;
    setPlayers(updatedPlayers);

    // Save score details for the modal
    setTurnScore(score);
    setTurnScoreDetails(scoreDescription);
    setTurnPenalties(penalties);
    setTurnPenaltyDetails(penaltyDescription);

    // Show score modal
    setShowScoreModal(true);

    // Log the base score
    if (score > 0) {
      addToLog(
        `${players[activePlayer].name} ${t('scored')} ${score} ${t('points')}!`
      );

      // Detailed score breakdown
      scoreDescription.forEach((desc) => {
        addToLog(`- ${desc}`);
      });
    }

    // Log penalties if any
    if (penalties > 0) {
      addToLog(
        `${players[activePlayer].name} has penalties: -${penalties} points`
      );

      // Detailed penalty breakdown
      penaltyDescription.forEach((desc) => {
        addToLog(`- ${desc}`);
      });

      // Log final score after penalties
      addToLog(`Final score after penalties: ${finalScore} points`);
    }

    // Check if we need to end the game
    if (updatedPlayers[activePlayer].score >= 8000) {
      // Player has crossed the finish line - need to flag for final round
      if (!isGameOver) {
        // First player to cross 8000, set game over and mark them as potential winner
        setIsGameOver(true);
        setWinner(updatedPlayers[activePlayer]);
        addToLog(
          `${updatedPlayers[activePlayer].name} crossed 8000 points! Final round begins!`
        );
      } else {
        // We're in the final round, check if this player has the highest score
        if (updatedPlayers[activePlayer].score > winner.score) {
          setWinner(updatedPlayers[activePlayer]);
          addToLog(
            `${updatedPlayers[activePlayer].name} takes the lead with ${updatedPlayers[activePlayer].score} points!`
          );
        }

        // Check if this was the last player in the final round
        if (activePlayer === players.length - 1) {
          // Final player in the final round - declare winner
          addToLog(
            `${t('game_over')} ${winner.name} ${t('wins')} ${t('with')} ${
              winner.score
            } ${t('points')}!`
          );
        }
      }
    }
  }, [
    currentDice,
    currentCard,
    players,
    activePlayer,
    calculateBaseScore,
    calculateDiamondValue,
    addToLog,
    t,
    setTurnScore,
    setTurnScoreDetails,
    setTurnPenalties,
    setTurnPenaltyDetails,
    setShowScoreModal,
    setPlayers,
    setIsGameOver,
    setWinner,
  ]);

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
        // Also make sure we're not rolling blank dice - they should get a face
        if (
          die.face === 'blank' ||
          gamePhase === 'rolling' ||
          selectedDice.includes(index)
        ) {
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

      // Check for Island of Skulls condition (4+ skulls on first roll)
      if (gamePhase === 'rolling') {
        const skulls = newDice.filter((die) => die.face === 'skull').length;

        // Handle Island of Skulls (4+ skulls on first roll)
        if (skulls >= 4 && rollsRemaining === 3) {
          setIslandOfSkulls(true);
          setSkullCount(skulls);

          // Lock all non-skull dice
          const lockedDice = newDice.map((die) => {
            if (die.face !== 'skull') {
              return { ...die, locked: true };
            }
            return die;
          });

          setCurrentDice(lockedDice);
          addToLog(
            `${players[activePlayer].name} rolled ${skulls} skulls and enters the Island of Skulls!`
          );
        }
      } else {
        addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
      }

      // Fix 5: Add skull check after each roll
      // Check for 3+ skulls after roll (if not in Island of Skulls)
      if (!islandOfSkulls) {
        // Count skulls that are not in treasure chest
        const currentSkullCount = newDice.filter(
          (die) => die.face === 'skull' && !die.inTreasureChest
        ).length;

        if (currentSkullCount >= 3) {
          // Lock all skull dice
          const lockedDice = newDice.map((die) => {
            if (die.face === 'skull') {
              return { ...die, locked: true };
            }
            return die;
          });

          setCurrentDice(lockedDice);
          setTurnEndsWithSkulls(true);
          setAutoEndCountdown(15);

          addToLog(
            `${players[activePlayer].name} ${t(
              'roll_dice'
            )} ${currentSkullCount} ${t('skull_count')} - Turn will end!`
          );

          setGamePhase('resolution');
          return; // Exit early since turn is ending
        } else if (gamePhase === 'rolling') {
          addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
        }
      }

      // Fix 6: Update Island of Skulls handling
      if (islandOfSkulls) {
        const newSkulls = newDice.filter(
          (die) => die.face === 'skull' && !die.locked
        ).length;

        if (newSkulls === 0) {
          addToLog(
            `${players[activePlayer].name} ${t('no_skulls_in_island')}.`
          );

          // End turn when no skulls rolled in Island of Skulls
          setGamePhase('resolution');
          setAutoEndCountdown(5);
          setTurnEndsWithSkulls(true);
        } else {
          // Update skull count for penalty calculation
          setSkullCount((prevCount) => prevCount + newSkulls);

          // Lock newly rolled skulls
          const updatedDice = newDice.map((die) => {
            if (die.face === 'skull' && !die.locked) {
              return { ...die, locked: true };
            }
            return die;
          });
          setCurrentDice(updatedDice);

          // Apply penalty to other players based on the newly rolled skulls
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

        // Stay in decision phase to allow more rolls in Island of Skulls
        setGamePhase('decision');
        return; // Exit early since we've handled this special case
      }

      // Only proceed here if not in Island of Skulls and not ending turn with skulls
      if (!turnEndsWithSkulls) {
        // Decrement rolls remaining
        setRollsRemaining((prevRolls) => prevRolls - 1);

        // Move to decision phase if rolls remaining
        setGamePhase('decision');
        // Add a helpful message when they've used all rolls
        if (rollsRemaining === 1) {
          addToLog(
            `${players[activePlayer].name} has used all rolls. Choose to end turn or keep current dice.`
          );
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
    calculateScore,
    setSkullCount,
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    setGamePhase,
    setRollsRemaining,
    setIslandOfSkulls,
  ]);

  const rollDice_old = useCallback(() => {
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
        // Also make sure we're not rolling blank dice - they should get a face
        if (
          die.face === 'blank' ||
          gamePhase === 'rolling' ||
          selectedDice.includes(index)
        ) {
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

      // Check for Island of Skulls condition (4+ skulls on first roll)
      if (gamePhase === 'rolling') {
        const skulls = newDice.filter((die) => die.face === 'skull').length;

        // Handle Island of Skulls (4+ skulls on first roll)
        if (skulls >= 4 && rollsRemaining === 3) {
          setIslandOfSkulls(true);
          setSkullCount(skulls);

          // Lock all non-skull dice
          const lockedDice = newDice.map((die) => {
            if (die.face !== 'skull') {
              return { ...die, locked: true };
            }
            return die;
          });

          setCurrentDice(lockedDice);
          addToLog(
            `${players[activePlayer].name} rolled ${skulls} skulls and enters the Island of Skulls!`
          );
        }
        // Handle normal 3+ skull disqualification
        else if (skulls >= 3 && !islandOfSkulls) {
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
        const newSkulls = newDice.filter(
          (die) => die.face === 'skull' && !die.locked
        ).length;

        if (newSkulls === 0) {
          addToLog(
            `${players[activePlayer].name} ${t('no_skulls_in_island')}.`
          );

          // End turn when no skulls rolled in Island of Skulls
          setGamePhase('resolution');
          setAutoEndCountdown(5);
          setTurnEndsWithSkulls(true);
        } else {
          // Update skull count for penalty calculation
          setSkullCount((prevCount) => prevCount + newSkulls);

          // Lock newly rolled skulls
          const updatedDice = newDice.map((die) => {
            if (die.face === 'skull' && !die.locked) {
              return { ...die, locked: true };
            }
            return die;
          });
          setCurrentDice(updatedDice);

          // Apply penalty to other players based on the newly rolled skulls
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
    calculateScore,
    setSkullCount,
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    setGamePhase,
    setRollsRemaining,
    setIslandOfSkulls,
  ]);

  const checkForIslandOfSkulls = useCallback(
    (dice) => {
      // Only check on first roll (when rollsRemaining === 3)
      if (rollsRemaining !== 3 || gamePhase !== 'rolling') return false;

      // Count skulls
      const skulls = dice.filter((die) => die.face === 'skull').length;

      // Enter Island of Skulls if 4+ skulls on first roll
      if (skulls >= 4) {
        setIslandOfSkulls(true);
        setSkullCount(skulls);

        // Lock all non-skull dice (important for Island of Skulls rules)
        const lockedDice = dice.map((die) => {
          if (die.face !== 'skull') {
            return { ...die, locked: true };
          }
          return die;
        });

        addToLog(
          `${players[activePlayer].name} rolled ${skulls} skulls and enters the Island of Skulls!`
        );

        return lockedDice;
      }

      return false;
    },
    [
      gamePhase,
      rollsRemaining,
      players,
      activePlayer,
      addToLog,
      setIslandOfSkulls,
      setSkullCount,
    ]
  );

  // Helper function to calculate set counts for scoring
  const calculateSetCounts = useCallback((diceCounts) => {
    // Just return the dice counts since we need to know which face makes each set
    return diceCounts;
  }, []);

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

  // function to handle moving dice to/from the treasure chest
  const toggleTreasureChest = useCallback(
    (dieIndex) => {
      // Can only use treasure chest if we have that card
      if (!currentCard || currentCard.effect !== 'store_dice') return;

      // Can't store skulls in the treasure chest
      if (currentDice[dieIndex].face === 'skull') return;

      // Can't store dice during rolling animation
      if (isDiceRolling) return;

      const die = currentDice[dieIndex];
      // Implement the three-state toggle:
      // 1. If die is in treasure chest → remove from chest
      // 2. If die is selected for reroll → move to treasure chest
      // 3. If die is neither → toggle selection for reroll

      if (die.inTreasureChest) {
        // State 1: Die is in treasure chest -> remove it from chest
        setCurrentDice((prev) =>
          prev.map((die, idx) =>
            idx === dieIndex
              ? {
                  ...die,
                  inTreasureChest: false,
                  locked: false,
                  selected: false,
                }
              : die
          )
        );

        // Also remove from selected dice if it was there
        setSelectedDice((prev) => prev.filter((idx) => idx !== dieIndex));

        addToLog(
          `${players[activePlayer].name} removed a ${currentDice[dieIndex].face} from the Treasure Chest`
        );
      } else if (selectedDice.includes(dieIndex)) {
        // State 2: Die is selected for reroll -> move to treasure chest
        setCurrentDice((prev) =>
          prev.map((die, idx) =>
            idx === dieIndex
              ? { ...die, inTreasureChest: true, locked: true, selected: false }
              : die
          )
        );

        // Remove from selected dice
        setSelectedDice((prev) => prev.filter((idx) => idx !== dieIndex));

        addToLog(
          `${players[activePlayer].name} placed a ${currentDice[dieIndex].face} in the Treasure Chest`
        );
      } else {
        // State 3: Die is neither -> select it for reroll
        // This uses the existing toggleDieSelection functionality
        toggleDieSelection(dieIndex);
      }
    },
    [
      currentCard,
      currentDice,
      isDiceRolling,
      players,
      activePlayer,
      addToLog,
      selectedDice,
      toggleDieSelection,
    ]
  );

  // End current turn
  const endTurn = useCallback(() => {
    // If modal is showing, close it
    if (showScoreModal) {
      setShowScoreModal(false);
    }

    // Check if we're in the final round
    if (isGameOver) {
      // If this was the last player in the final round, the game truly ends
      if (activePlayer === players.length - 1) {
        // Game is truly over, we could show a final winner screen here
        return;
      }
    }

    // Switch to next player
    const nextPlayer = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayer);

    // Initialize the new turn for next player
    initNewTurn();
  }, [isGameOver, players.length, activePlayer, showScoreModal, initNewTurn]);

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

    showShuffleNotification,

    // Score modal state
    showScoreModal,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,

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
    calculateScore,
    toggleTreasureChest,
    t,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
