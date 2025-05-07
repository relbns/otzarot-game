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
    islandSkullsCollectedThisTurn, // New state for accumulating IoS skulls
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
    setIslandSkullsCollectedThisTurn, // New setter
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
    
    // Determine if this action is a Sorceress reroll
    const isSorceressEffectActive = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    const isAttemptingSorceressReroll = selectedDice.length === 1 &&
                                     currentDice[selectedDice[0]]?.face === 'skull' &&
                                     gamePhase === 'decision';
    let actuallyUsingSorceressThisRoll = false;

    // Check minimum dice selection (must be before Sorceress logic that might alter selectedDice behavior)
    if (gamePhase === 'decision' && !islandOfSkulls &&
        selectedDice.length < 2 &&
        !(isSorceressEffectActive && isAttemptingSorceressReroll)) {
      addToLog(`${players[activePlayer].name} ${t('min_2_dice_reroll')}`);
      return;
    }

    if (isSorceressEffectActive && isAttemptingSorceressReroll) {
      actuallyUsingSorceressThisRoll = true;
    }

    // Start rolling animation
    setIsDiceRolling(true);
    if (playSounds) soundManager.play('diceRoll');

    // Prepare diceToRollIndexes based on action type
    let diceToRollIndexes = [];
    if (actuallyUsingSorceressThisRoll) {
      diceToRollIndexes = selectedDice;
      setSkullRerollUsed(true); // Mark Sorceress used immediately
      addToLog(`${players[activePlayer].name} ${t('sorceress_used')}`);
    } else if (gamePhase === 'rolling') {
      diceToRollIndexes = currentDice.map((_, i) => i);
    } else if (islandOfSkulls) {
      diceToRollIndexes = currentDice.reduce((acc, d, i) =>
        (d.face !== 'skull' && !d.locked) ? [...acc, i] : acc, []);
    } else { // Normal reroll (not Sorceress, not initial, not IoS)
      diceToRollIndexes = selectedDice;
    }

    // Apply the animation delay
    setTimeout(() => {
      // Sorceress used flag and log moved above to be immediate
      
      // Handle Island of Skulls separately
      if (islandOfSkulls) {
        const {
          newDice: newDiceFromIoSRoll,
          gamePhase: gamePhaseFromIoSRoll,
          newlyRolledSkulls: newlyRolledSkullsOnThisRoll,
          shouldEndIoSRolling
        } = handleIslandOfSkullsRoll({
          currentDice,
          diceToRollIndexes,
          // currentCard, // Not needed by the modified handleIslandOfSkullsRoll for penalty
          addToLog,
          t,
          playerName: players[activePlayer].name
          // players, // Not needed
          // activePlayer // Not needed
        });
        
        setCurrentDice(newDiceFromIoSRoll);
        setSelectedDice([]);

        if (newlyRolledSkullsOnThisRoll > 0) {
          setIslandSkullsCollectedThisTurn(prev => (prev || 0) + newlyRolledSkullsOnThisRoll);
        }

        if (shouldEndIoSRolling) { // IoS rolling is done
          setGamePhase('islandResolutionPending'); // NEW PHASE - wait for player to finalize IoS turn
          // Penalties will be applied and turn advanced when player finalizes from this new phase.
          // setIslandOfSkulls(false) and calculateScoreRef.current() will be handled later.
        } else {
          setGamePhase(gamePhaseFromIoSRoll); // Continue IoS rolling (usually 'decision')
        }
        
        setIsDiceRolling(false);
        return;
      }
      
      // Roll the dice, potentially using dev settings
      let devDiceUsed = false;
      const devRoll = process.env.NODE_ENV === 'development' ? devNextDiceRoll : null;

      const newDice = currentDice.map((die, i) => {
        // A die is rerolled if it's in diceToRollIndexes AND
        // (it's not locked OR it's a Sorceress reroll attempt) AND it's not in the treasure chest.
        const canRerollThisDie = diceToRollIndexes.includes(i) &&
                                 (!die.locked || actuallyUsingSorceressThisRoll) && // Use updated flag
                                 !die.inTreasureChest;

        if (canRerollThisDie) {
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
        if (process.env.NODE_ENV === 'development') {
          setDevNextDiceRoll(null); // Clear dev setting after use in development
        }
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
      // Player cannot enter Island of Skulls if their current card is a Sea Battle card.
      const isSeaBattleCard = currentCard?.effect?.startsWith('sea_battle_');
      if (gamePhase === 'rolling' && totalSkulls >= 4 && !isSeaBattleCard) {
        // Lock all skull dice. Non-skull dice remain rollable for Island of Skulls mode.
        const islandDiceSetup = newDice.map(d => 
          d.face === 'skull' ? { ...d, locked: true } : { ...d, locked: false }
        );
        
        setIslandOfSkulls(true);
        setCurrentDice(islandDiceSetup);
        setIslandSkullsCollectedThisTurn(totalSkulls); // Store initial skulls for later penalty calculation

        const logMsg = cardSkulls > 0 
          ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`
          : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`;
        addToLog(logMsg);
        // Log how many skulls they start IoS with
        addToLog(`${players[activePlayer].name} ${t('starts_island_with')} ${totalSkulls} ${t('skulls_collected')}.`);
        setGamePhase('decision'); // Player proceeds to roll in IoS mode
        // No immediate penalty application here. It will be done at the end of the IoS turn.
      } 
      // Check for 3+ total skulls
      else if (totalSkulls >= 3) {
        const isSorceressStillAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;

        // Lock all skull dice from the roll
        const lockedDice = newDice.map(d => 
          d.face === 'skull' ? { ...d, locked: true } : d
        );
        setCurrentDice(lockedDice);

        if (totalSkulls === 3 && isSorceressStillAvailable) {
          // 3 skulls with Sorceress available: stay in decision phase to allow reroll
          const logMsg = cardSkulls > 0
            ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('sorceress_can_reroll_one_skull')}`
            : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('sorceress_can_reroll_one_skull')}`;
          addToLog(logMsg);
          setGamePhase('decision'); 
          // Player can now choose to reroll one skull or end turn.
        } else {
          // Turn ends if:
          // - 3 skulls and Sorceress is not available (or already used)
          // - 4+ skulls (and not an initial roll triggering Island of Skulls, which is handled above)
          const logMsg = cardSkulls > 0
            ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`
            : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`;
          addToLog(logMsg);
          setGamePhase('resolution'); // Player will click standard "End Turn"
          
          if (calculateScoreRef.current) {
            calculateScoreRef.current();
          }
        }
      } 
      // Normal roll (less than 3 skulls, not Island of Skulls)
      else {
        let rollConsumed = false;
        if (gamePhase === 'rolling') { // Initial roll of the turn
          addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
          if (rollsRemaining === 1) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
          setRollsRemaining(prev => prev - 1);
          rollConsumed = true;
        } else if (gamePhase === 'decision' && !actuallyUsingSorceressThisRoll) { // Normal reroll (not Sorceress)
          addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
          if (rollsRemaining === 1) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
          setRollsRemaining(prev => prev - 1);
          rollConsumed = true;
        }
        // If it was a Sorceress roll (actuallyUsingSorceressThisRoll is true), rollsRemaining is not decremented.
        
        setGamePhase('decision');
      }
      
      setIsDiceRolling(false);
    }, 800);
  }, [
    gamePhase, rollsRemaining, islandOfSkulls, currentDice, selectedDice,
    players, activePlayer, currentCard, skullRerollUsed, playSounds,
    addToLog, t, calculateScoreRef,
    setIsDiceRolling, setCurrentDice, setSelectedDice, setSkullCount,
    setIslandOfSkulls, setIslandSkullsCollectedThisTurn, // Added missing dependency
    setTurnEndsWithSkulls, setAutoEndCountdown, // Added missing dependencies
    setGamePhase, setRollsRemaining,
    setSkullRerollUsed, setPlayers,
    // Dev dependencies
    devNextDiceRoll, setDevNextDiceRoll,
    // Dev setters
    setDevNextCardId // Added missing dependency
  ]);

  /**
   * Toggle die selection for rerolling
   */
  const toggleDieSelection = useCallback((index) => {
    // Prevent selection during Skull Island, while rolling, or if not in decision phase
    if (islandOfSkulls || state.isDiceRolling || gamePhase !== 'decision') return;

    const die = currentDice[index];
    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;

    // Prevent selection of dice in treasure chest.
    // Prevent selection of locked dice UNLESS it's a skull AND Sorceress is available (for the purpose of selecting it for reroll).
    if (die.inTreasureChest) return;
    if (die.locked && !(isSorceressAvailable && die.face === 'skull')) return;

    setSelectedDice(prevSelected => {
        let newSelectedDice = [...prevSelected];
        const isCurrentlySelected = newSelectedDice.includes(index);

        if (die.face === 'skull') {
            // Explicitly check skullRerollUsed here again, even though isSorceressAvailable should cover it.
            // This is a defensive check due to the persistent nature of the reported bug.
            if (isSorceressAvailable && !skullRerollUsed) { 
                // Find if a skull is already selected (Sorceress allows only one skull to be chosen for reroll)
                const currentlySelectedSkullIndex = newSelectedDice.find(selectedIndex => currentDice[selectedIndex].face === 'skull');

                if (isCurrentlySelected) {
                    // Clicking an already selected skull: deselect it
                    newSelectedDice = newSelectedDice.filter(i => i !== index);
                } else {
                    // Clicking a new skull:
                    if (currentlySelectedSkullIndex !== undefined && currentlySelectedSkullIndex !== index) {
                        // If another skull was already selected for Sorceress, deselect it first
                        newSelectedDice = newSelectedDice.filter(i => i !== currentlySelectedSkullIndex);
                    }
                    // Select the new skull (if not already selected)
                    if (!newSelectedDice.includes(index)) {
                         newSelectedDice.push(index);
                    }
                }
            } else {
                // Sorceress not available or already used, cannot select skulls.
                return prevSelected; // No change
            }
        } else { // Non-skull die
            if (isCurrentlySelected) {
                newSelectedDice = newSelectedDice.filter(i => i !== index); // Deselect it
            } else {
                newSelectedDice.push(index); // Select it
            }
        }
        return newSelectedDice;
    });
  }, [
    currentDice, gamePhase, currentCard, skullRerollUsed, islandOfSkulls,
    state.isDiceRolling, setSelectedDice
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
