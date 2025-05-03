/**
 * Game Actions Hook
 * 
 * This file contains hooks for game actions like drawing cards, rolling dice, etc.
 */
import { useCallback } from 'react';
import { CARDS } from '../constants';
import { getRandomFace, createNewDeck } from '../utils/gameUtils';
import { handleInitialCardEffects, processCardEffectDice, handleIslandOfSkullsRoll } from '../utils/cardEffects';
import soundManager from '../utils/SoundManager';

/**
 * Hook for game actions
 * @param {Object} state - Current game state
 * @param {Object} setters - State setters
 * @param {Object} refs - Function refs
 * @returns {Object} Game action functions
 */
export const useGameActions = (state, setters, refs) => {
  const {
    gamePhase,
    deck,
    currentDice,
    selectedDice,
    rollsRemaining,
    islandOfSkulls,
    currentCard,
    skullRerollUsed,
    players,
    activePlayer,
    language,
    playSounds,
    t,
    // Dev settings from state
    devNextCardId,
    devNextDiceRoll
  } = state;

  const {
    setDeck,
    setCurrentCard,
    setIsCardFlipping,
    setShowShuffleNotification,
    setGamePhase,
    setCurrentDice,
    setSelectedDice,
    setRollsRemaining,
    setSkullCount,
    setSkullRerollUsed,
    setIslandOfSkulls,
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    setIsDiceRolling,
    setPlayers,
    // Dev setters
    setDevNextCardId,
    setDevNextDiceRoll
  } = setters;

  const { calculateScoreRef } = refs;
  
  /**
   * Add a message to the game log
   */
  const addToLog = useCallback((message) => {
    setters.setGameLog((prevLog) => [message, ...prevLog]);
  }, [setters]);
  
  /**
   * Draw a card from the deck (or use dev setting)
   */
  const drawCardFromDeck = useCallback((currentDeck) => {
    let drawnCard = null;
    let updatedDeck = currentDeck;
    let devCardUsed = false;

    // Check for dev setting first
    if (process.env.NODE_ENV === 'development' && devNextCardId) {
      drawnCard = CARDS.find(c => c.id.toString() === devNextCardId);
      if (drawnCard) {
        addToLog(`[DEV] Using specified card: ${drawnCard.name}`);
        devCardUsed = true;
        // setDevNextCardId(null); // DO NOT Clear setting after use
        // Note: We don't modify the actual deck when using a dev card for simplicity
      } else {
        addToLog(`[DEV] Specified card ID ${devNextCardId} not found. Drawing random.`);
      }
    }

    // If no dev card was used or found, draw normally
    if (!drawnCard && currentDeck && currentDeck.length > 0) {
      drawnCard = currentDeck[0];
      updatedDeck = currentDeck.slice(1);
    }

    // Proceed if we have a card (either dev or drawn)
    if (drawnCard) {
      setDeck(updatedDeck); // Update deck only if we drew normally
      setCurrentCard(drawnCard);

      if (playSounds) soundManager.play('cardDraw');

      const cardName = language === 'he' ? drawnCard.hebrewName : drawnCard.name;
      const cardDesc = language === 'he' ? drawnCard.hebrewDescription : drawnCard.description;
      
      // Log only if it wasn't a dev card already logged
      if (!devCardUsed) {
        const cardName = language === 'he' ? drawnCard.hebrewName : drawnCard.name;
        const cardDesc = language === 'he' ? drawnCard.hebrewDescription : drawnCard.description;
        addToLog(`${players[activePlayer].name} ${t('draw_card')}: ${cardName} - ${cardDesc}`);
      }

      // Special handling for Zombie Attack card
      if (drawnCard.effect === 'zombie_attack') {
        addToLog(`${players[activePlayer].name} ${t('zombie_attack_start')}`);
      }
      
      // Handle card effects
      const { newDice, modifiedDice, skullsAdded } = handleInitialCardEffects({
        card: drawnCard,
        currentDice,
        addToLog,
        t,
        playerName: players[activePlayer].name
      });
      
      setCurrentDice(newDice);
      
      if (skullsAdded > 0) {
        setSkullCount(prev => prev + skullsAdded);
      }
      
      if (modifiedDice) {
        // Process dice after card effects
        setTimeout(() => {
          const {
            rolledDice,
            currentSkulls,
            gamePhase: newGamePhase,
            turnEndsWithSkulls,
            autoEndCountdown,
            shouldCalculateScore
          } = processCardEffectDice({
            dice: newDice,
            addToLog,
            t,
            playerName: players[activePlayer].name
          });
          
          setCurrentDice(rolledDice);
          setSkullCount(currentSkulls);
          setGamePhase(newGamePhase);
          setTurnEndsWithSkulls(turnEndsWithSkulls);
          setAutoEndCountdown(autoEndCountdown);
          setRollsRemaining(prev => prev - 1);
          
          if (shouldCalculateScore && calculateScoreRef.current) {
            calculateScoreRef.current();
          }
        }, 800);
      } else {
        setGamePhase('rolling');
      }
    } else {
      console.error('Failed to draw card from deck');
      setGamePhase('rolling');
    }
    
    setIsCardFlipping(false);
  }, [
    language, players, activePlayer, currentDice, playSounds, addToLog, t, deck, // Added deck dependency
    setDeck, setCurrentCard, setCurrentDice, setGamePhase, setSkullCount,
    setTurnEndsWithSkulls, setAutoEndCountdown, setRollsRemaining, setIsCardFlipping,
    calculateScoreRef,
    // Dev dependencies
    devNextCardId, setDevNextCardId
  ]);

  /**
   * Draw a card
   */
  const drawCard = useCallback(() => {
    if (gamePhase !== 'drawing') return;
    
    setIsCardFlipping(true);
    let currentDeck = deck;
    
    if (!currentDeck || currentDeck.length === 0) {
      setShowShuffleNotification(true);
      const newDeck = createNewDeck(CARDS);
      currentDeck = newDeck;
      setDeck(newDeck);
      addToLog(t('deck_shuffled'));
      
      setTimeout(() => {
        setShowShuffleNotification(false);
        setTimeout(() => drawCardFromDeck(currentDeck), 600);
      }, 1500);
    } else {
      setTimeout(() => drawCardFromDeck(currentDeck), 600);
    }
  }, [
    gamePhase, deck, addToLog, t, drawCardFromDeck,
    setIsCardFlipping, setShowShuffleNotification, setDeck
  ]);
  
  /**
   * Roll the dice
   */
  const rollDice = useCallback(() => {
    try {
      
      // Check if roll is allowed
      if (!['rolling', 'decision'].includes(gamePhase)) {
        return;
      }
      
      if (rollsRemaining <= 0 && !islandOfSkulls) {
        return;
      }
    } catch (error) {
      console.error('Error in rollDice:', error);
    }
    
    // Check for storm card restriction
    if (currentCard?.effect === 'storm' && rollsRemaining <= 1) {
      addToLog(`${players[activePlayer].name} ${t('storm_max_rolls')}`);
      return;
    }
    
    // Special handling for Zombie Attack card
    const isZombieAttack = currentCard?.effect === 'zombie_attack';
    
    // Check for sorceress card
    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    const isSorceressRerollAttempt = selectedDice.length === 1 && 
      currentDice[selectedDice[0]]?.face === 'skull';
    
    // Check minimum dice selection
    if (gamePhase === 'decision' && !islandOfSkulls && 
        selectedDice.length < 2 && 
        !(isSorceressAvailable && isSorceressRerollAttempt)) {
      addToLog(`${players[activePlayer].name} ${t('min_2_dice_reroll')}`);
      return;
    }
    
    // Start rolling animation
    setIsDiceRolling(true);
    if (playSounds) soundManager.play('diceRoll');
    
    // Prepare the new dice state first, but don't update state yet
    let newDice = [...currentDice];
    let diceToRollIndexes = [];
    
    if (gamePhase === 'rolling') {
      // Roll all dice in initial roll
      diceToRollIndexes = currentDice.map((_, i) => i);
    } else if (islandOfSkulls) {
      // In Island of Skulls, roll non-skull, non-locked dice
      diceToRollIndexes = currentDice.reduce((acc, d, i) => 
        (d.face !== 'skull' && !d.locked) ? [...acc, i] : acc, []);
    } else {
      // Roll selected dice
      diceToRollIndexes = selectedDice;
    }
    
    // Handle sorceress card
    let sorceressUsedThisRoll = false;
    if (currentCard?.effect === 'reroll_skull' && !skullRerollUsed && 
        selectedDice.length === 1 && currentDice[selectedDice[0]]?.face === 'skull' && 
        gamePhase === 'decision') {
      diceToRollIndexes = selectedDice;
      sorceressUsedThisRoll = true;
    }
    
    // Apply the animation delay
    setTimeout(() => {
      // If using sorceress, mark it as used
      if (sorceressUsedThisRoll) {
        setSkullRerollUsed(true);
        addToLog(`${players[activePlayer].name} ${t('sorceress_used')}`);
      }
      
      // Handle Island of Skulls separately
      if (islandOfSkulls) {
        const {
          newDice,
          gamePhase: newGamePhase,
          updatedPlayers,
          shouldCalculateScore
        } = handleIslandOfSkullsRoll({
          currentDice,
          diceToRollIndexes,
          currentCard,
          addToLog,
          t,
          playerName: players[activePlayer].name,
          players,
          activePlayer
        });
        
        setCurrentDice(newDice);
        setSelectedDice([]);
        setGamePhase(newGamePhase);
        setPlayers(updatedPlayers);

        // If the Skull Island roll succeeded (no new skulls), reset the flag
        if (newGamePhase === 'resolution') {
          setIslandOfSkulls(false); 
        }
        
        if (shouldCalculateScore && calculateScoreRef.current) {
          calculateScoreRef.current();
        }
        
        setIsDiceRolling(false);
        return;
      }
      
      // Roll the dice, potentially using dev settings
      let devDiceUsed = false;
      const devRoll = process.env.NODE_ENV === 'development' ? devNextDiceRoll : null;

      const newDice = currentDice.map((die, i) => {
        if (diceToRollIndexes.includes(i) && !die.locked && !die.inTreasureChest) {
          let face;
          // Use dev setting if available for this die index
          if (devRoll && devRoll[i] !== null) {
            face = devRoll[i];
            devDiceUsed = true; // Mark that at least one dev die was used
          } else {
            face = getRandomFace(); // Otherwise, roll randomly
          }
          return { ...die, face: face, selected: false };
        }
        return die; // Keep die as is if not rolling
      });

      if (devDiceUsed) {
        addToLog(`[DEV] Using specified dice results (Random for unspecified).`);
        // setDevNextDiceRoll(null); // DO NOT Clear setting after use
      }

      setCurrentDice(newDice);
      setSelectedDice([]);
      
      // Count skulls from the dice roll
      const rolledSkulls = newDice.filter(d => d.face === 'skull').length;
      
      // Add skulls from the card effect
      let cardSkulls = 0;
      if (currentCard?.effect === 'start_with_1_skull') {
        cardSkulls = 1;
      } else if (currentCard?.effect === 'start_with_2_skulls') {
        cardSkulls = 2;
      }
      const totalSkulls = rolledSkulls + cardSkulls;
      
      // Update the displayed skull count (might need UI adjustment if you want to show card skulls separately)
      setSkullCount(totalSkulls); 
      
      // Handle Zombie Attack card - lock all non-skull, non-sword dice
      if (isZombieAttack) {
        const zombieLockedDice = newDice.map(die => {
          if (die.face !== 'skull' && die.face !== 'swords' && !die.inTreasureChest) {
            return { ...die, locked: true };
          }
          return die;
        });
        
        // Check if only skulls and swords remain
        const nonSkullSwordCount = zombieLockedDice.filter(
          d => !d.locked && !d.inTreasureChest && d.face !== 'skull' && d.face !== 'swords'
        ).length;
        
        if (nonSkullSwordCount === 0) {
          // Zombie Attack complete - calculate score
          setCurrentDice(zombieLockedDice);
          addToLog(`${players[activePlayer].name} ${t('zombie_attack_complete')}`);
          setGamePhase('resolution');
          
          if (calculateScoreRef.current) {
            calculateScoreRef.current();
          }
          setIsDiceRolling(false);
          return;
        }
        
        setCurrentDice(zombieLockedDice);
      }
      
      // Check for Island of Skulls (4+ total skulls on initial roll)
      if (gamePhase === 'rolling' && totalSkulls >= 4) {
        // Lock all non-skull dice
        const lockedDice = newDice.map(d => 
          d.face !== 'skull' ? { ...d, locked: true } : d
        );
        
        setIslandOfSkulls(true);
        setCurrentDice(lockedDice);
        const logMsg = cardSkulls > 0 
          ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`
          : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`;
        addToLog(logMsg);
        setGamePhase('decision');
      } 
      // Check for 3+ total skulls (turn ends)
      else if (totalSkulls >= 3) {
        // Lock all skull dice from the roll
        const lockedDice = newDice.map(d => 
          d.face === 'skull' ? { ...d, locked: true } : d
        );
        
        setCurrentDice(lockedDice);
        setTurnEndsWithSkulls(true);
        const logMsg = cardSkulls > 0
          ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`
          : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`;
        addToLog(logMsg);
        setGamePhase('resolution');
        
        if (calculateScoreRef.current) {
          calculateScoreRef.current();
        }
      } 
      // Normal roll
      else {
        if (gamePhase === 'rolling') {
          addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
        } else if (!sorceressUsedThisRoll) {
          addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
        }
        
        setRollsRemaining(prev => prev - 1);
        setGamePhase('decision');
        
        if (rollsRemaining === 1) {
          addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
        }
      }
      
      setIsDiceRolling(false);
    }, 800);
  }, [
    gamePhase, rollsRemaining, islandOfSkulls, currentDice, selectedDice,
    players, activePlayer, currentCard, skullRerollUsed, playSounds,
    addToLog, t, calculateScoreRef,
    setIsDiceRolling, setCurrentDice, setSelectedDice, setSkullCount,
    setIslandOfSkulls, setTurnEndsWithSkulls, setGamePhase, setRollsRemaining,
    setSkullRerollUsed, setPlayers,
    // Dev dependencies
    devNextDiceRoll, setDevNextDiceRoll
  ]);

  /**
   * Toggle die selection for rerolling
   */
  const toggleDieSelection = useCallback((index) => {
    // Prevent selection during Skull Island or while rolling
    if (islandOfSkulls || state.isDiceRolling || gamePhase !== 'decision') return;
    
    const die = currentDice[index];
    if ((die.locked && die.face !== 'skull') || die.inTreasureChest) return;
    
    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    
    // Handle skull selection (only with sorceress card)
    if (die.face === 'skull') {
      if (isSorceressAvailable) {
        setSelectedDice(prev => prev.includes(index) ? [] : [index]);
      }
      return;
    }
    
    // Handle normal die selection
    setSelectedDice(prev => {
      // If a skull is already selected with sorceress, replace it
      if (isSorceressAvailable && prev.some(i => currentDice[i].face === 'skull')) {
        return [index];
      }
      
      // Toggle selection
      return prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index];
    });
  }, [
    currentDice, gamePhase, currentCard, skullRerollUsed, state.isDiceRolling,
    setSelectedDice
  ]);
  
  /**
   * Toggle treasure chest for a die (for treasure chest card)
   */
  const toggleTreasureChest = useCallback((dieIndex) => {
    // Check if treasure chest action is allowed
    if (!currentCard || currentCard.effect !== 'store_dice' || 
        gamePhase !== 'decision' || 
        islandOfSkulls || // <-- Add this check
        currentDice[dieIndex].face === 'skull' || 
        state.isDiceRolling) {
      return;
    }
    
    const die = currentDice[dieIndex];
    
    // Cycle through states: selected -> in chest -> neither
    let newState;
    
    if (selectedDice.includes(dieIndex)) {
      // If selected, move to treasure chest
      newState = { selected: false, inTreasureChest: true, locked: false };
      addToLog(`${players[activePlayer].name} ${t('placed_in_chest')} ${t(die.face)}`);
    } else if (die.inTreasureChest) {
      // If in treasure chest, remove from chest (neither selected nor in chest)
      newState = { selected: false, inTreasureChest: false, locked: false };
      addToLog(`${players[activePlayer].name} ${t('removed_from_chest')} ${t(die.face)}`);
    } else {
      // If neither, select for reroll
      newState = { selected: true, inTreasureChest: false, locked: false };
      addToLog(`${players[activePlayer].name} ${t('selected_for_reroll')} ${t(die.face)}`);
    }
    
    // Update die state
    setCurrentDice(prev => prev.map((d, i) => 
      i === dieIndex 
        ? { ...d, ...newState } 
        : d
    ));
    
    // Update selected dice
    if (newState.selected) {
      setSelectedDice(prev => [...prev, dieIndex]);
    } else {
      setSelectedDice(prev => prev.filter(idx => idx !== dieIndex));
    }
  }, [
    currentCard, gamePhase, currentDice, selectedDice, state.isDiceRolling,
    players, activePlayer, addToLog, t,
    setCurrentDice, setSelectedDice
  ]);

  return {
    drawCard,
    rollDice,
    toggleDieSelection,
    toggleTreasureChest,
    addToLog
  };
};

export default useGameActions;
