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
        // setDevNextCardId(null); // DO NOT Clear setting after use - Reverted as per user request
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
    const isZombieAttack = currentCard?.effect === 'zombie_attack'; // Define isZombieAttack early

    try {
      // Check if roll is allowed
      if (!['rolling', 'decision'].includes(gamePhase)) {
        return;
      }
      
      // This check is for standard game, not Zombie Attack or IoS.
      // Zombie Attack doesn't use rollsRemaining. Island of Skulls has its own logic.
      if (!isZombieAttack && !islandOfSkulls && rollsRemaining <= 0) {
        return;
      }
    } catch (error) {
      console.error('Error in rollDice:', error);
      return; // Return if initial checks fail
    }
    
    // Check for storm card restriction (only if not Zombie Attack)
    if (!isZombieAttack && currentCard?.effect === 'storm' && rollsRemaining <= 1) {
      addToLog(`${players[activePlayer].name} ${t('storm_max_rolls')}`);
      return;
    }
    
    // Check minimum dice selection - Always applies in decision phase if not IoS or Zombie Attack
    // isZombieAttack is already defined
    if (!isZombieAttack && gamePhase === 'decision' && !islandOfSkulls && selectedDice.length < 2) {
      addToLog(`${players[activePlayer].name} ${t('min_2_dice_reroll')}`);
      return;
    }

    // Determine if Sorceress effect is available *before* the roll
    const isSorceressEffectAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;

    // Determine if the Sorceress ability is being *used* in this roll
    // This happens if the effect is available AND a skull is included in the selected dice (length >= 2)
    let sorceressUsedThisRoll = false;
    if (isSorceressEffectAvailable && gamePhase === 'decision') {
      const includesSkull = selectedDice.some(index => currentDice[index]?.face === 'skull');
      if (includesSkull) {
        // We know selectedDice.length >= 2 because of the check above
        sorceressUsedThisRoll = true;
      }
    }

    // Start rolling animation
    setIsDiceRolling(true);
    if (playSounds) soundManager.play('diceRoll');

    // Prepare diceToRollIndexes based on action type
    let diceToRollIndexes = [];
    if (isZombieAttack) {
      if (gamePhase === 'rolling') { // Initial roll for Zombie Attack
        diceToRollIndexes = currentDice.map((_, i) => i); // Roll all dice
      } else { // Subsequent rolls for Zombie Attack (gamePhase === 'decision')
        diceToRollIndexes = selectedDice; // Use player's selection
        const canRollAnyDie = currentDice.some(d => d.face !== 'skull' && d.face !== 'swords' && !d.inTreasureChest);
        if (diceToRollIndexes.length === 0 && canRollAnyDie) {
          addToLog(`${players[activePlayer].name}: For Zombie Attack, you must select at least one non-skull, non-sword die to roll.`);
          setIsDiceRolling(false); // Ensure rolling animation stops if it was started
          return;
        }
      }
    } else if (gamePhase === 'rolling') { // Initial roll (not Zombie Attack)
      diceToRollIndexes = currentDice.map((_, i) => i);
    } else if (islandOfSkulls) { // Island of Skulls roll
      diceToRollIndexes = currentDice.reduce((acc, d, i) =>
        (d.face !== 'skull' && !d.locked) ? [...acc, i] : acc, []);
    } else { // Normal reroll (gamePhase === 'decision' and not IoS, not Zombie Attack)
      diceToRollIndexes = selectedDice;
    }

    // Apply the animation delay
    setTimeout(() => {
      // Set skullRerollUsed to true AFTER the roll completes if the ability was used
      if (sorceressUsedThisRoll) {
        setSkullRerollUsed(true);
        addToLog(`${players[activePlayer].name} ${t('sorceress_used')}`);
      }

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
          addToLog,
          t,
          playerName: players[activePlayer].name
        });
        
        setCurrentDice(newDiceFromIoSRoll);
        setSelectedDice([]);

        if (newlyRolledSkullsOnThisRoll > 0) {
          setIslandSkullsCollectedThisTurn(prev => (prev || 0) + newlyRolledSkullsOnThisRoll);
        }

        if (shouldEndIoSRolling) { // IoS rolling is done
          setGamePhase('islandResolutionPending'); 
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
        // A die is rerolled if it's in diceToRollIndexes AND it's not in the treasure chest.
        // Skulls are normally locked, but Sorceress allows rerolling one selected skull.
        const isSelected = diceToRollIndexes.includes(i);
        const isNormallyLocked = die.locked && die.face !== 'skull'; // Non-skulls are locked if die.locked is true
        const isLockedSkull = die.face === 'skull'; // Skulls are inherently locked unless Sorceress allows reroll

        // Check if Sorceress was available *before* the roll to allow rerolling a selected locked skull
        const canRerollLockedSkullWithSorceress = isSelected && isLockedSkull && isSorceressEffectAvailable;

        const canRerollThisDie = isSelected &&
                                 !die.inTreasureChest &&
                                 !isNormallyLocked && // Cannot reroll normally locked non-skulls
                                 (!isLockedSkull || canRerollLockedSkullWithSorceress); // Can reroll non-skulls, or skulls only with Sorceress

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
      
      // Update the displayed skull count
      setSkullCount(totalSkulls); 
      
      // Handle Zombie Attack card specific logic after dice are rolled
      if (isZombieAttack) {
        // Rule: Skulls and Swords are locked. Other dice are re-rolled.
        const processedZombieDice = newDice.map(die => {
          const shouldLock = (die.face === 'skull' || die.face === 'swords');
          return { 
            ...die, 
            locked: die.inTreasureChest || shouldLock, // Lock if in chest or if skull/sword
            selected: false // Ensure dice are not marked as selected for next Zombie roll
          };
        });
        setCurrentDice(processedZombieDice); // Update dice state with newly locked skulls/swords

        // Check if all dice are either skull, sword, or in treasure chest
        const remainingDiceToRollForZombie = processedZombieDice.filter(
          d => !d.inTreasureChest && d.face !== 'skull' && d.face !== 'swords'
        ).length;

        if (remainingDiceToRollForZombie === 0) {
          // Zombie Attack rolling is complete
          addToLog(`${players[activePlayer].name} ${t('zombie_attack_complete')}`);
          setGamePhase('resolution');
          if (calculateScoreRef.current) {
            calculateScoreRef.current();
          }
          setIsDiceRolling(false);
          return; // End further processing in rollDice for this turn
        } else {
          // Continue Zombie Attack: set game phase to decision to allow next roll
          setGamePhase('decision'); 
          // No roll decrement here, Zombie Attack allows continuous rolling
        }
      }
      // IMPORTANT: The following else if / else block should only run if NOT Zombie Attack
      else { // Not Zombie Attack: Standard game logic for skulls, IoS, and roll progression
        // Check for Island of Skulls (4+ total skulls on initial roll)
        const isSeaBattleCard = currentCard?.effect?.startsWith('sea_battle_');
        if (gamePhase === 'rolling' && totalSkulls >= 4 && !isSeaBattleCard) { // Already checked !isZombieAttack by being in this else block
          const islandDiceSetup = newDice.map(d => 
            d.face === 'skull' ? { ...d, locked: true } : { ...d, locked: false }
          );
          setIslandOfSkulls(true);
          setCurrentDice(islandDiceSetup);
          setIslandSkullsCollectedThisTurn(totalSkulls); 

          const logMsg = cardSkulls > 0 
            ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`
            : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`;
          addToLog(logMsg);
          addToLog(`${players[activePlayer].name} ${t('starts_island_with')} ${totalSkulls} ${t('skulls_collected')}.`);
          setGamePhase('decision'); 
        } 
        // Check for 3+ total skulls (and not Zombie Attack, not IoS entry)
        else if (totalSkulls >= 3) { // Already checked !isZombieAttack
          const lockedDice = newDice.map(d => 
            d.face === 'skull' ? { ...d, locked: true } : d
          );
          setCurrentDice(lockedDice);

          const logMsg = cardSkulls > 0
              ? `${players[activePlayer].name} ${t('rolled')} ${rolledSkulls} + ${cardSkulls} (card) = ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`
              : `${players[activePlayer].name} ${t('rolled')} ${totalSkulls} ${t('skulls')}! ${t('turn_ends')}.`;
          addToLog(logMsg);
          setGamePhase('resolution'); 
          
          if (calculateScoreRef.current) {
            calculateScoreRef.current();
          }
        } 
        // Normal roll (less than 3 skulls, not Island of Skulls, not Zombie Attack)
        else { // This 'else' is part of the !isZombieAttack block
          // Standard logging for initial roll or reroll
          if (gamePhase === 'rolling') { // Initial roll of the turn
            addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
            if (rollsRemaining === 1 && !isZombieAttack) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`); // Check !isZombieAttack here too
            setRollsRemaining(prev => prev - 1);
          } else if (gamePhase === 'decision') { // Reroll phase (Sorceress or normal, but not Zombie Attack)
            if (sorceressUsedThisRoll) {
               addToLog(`${players[activePlayer].name} ${t('rerolled_with_sorceress')}`);
            } else {
               addToLog(`${players[activePlayer].name} ${t('reroll_selected')}`);
               if (rollsRemaining === 1 && !isZombieAttack) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`); // Check !isZombieAttack
               setRollsRemaining(prev => prev - 1);
            }
          }
          setGamePhase('decision');
        }
      } // End of standard game logic (else block for !isZombieAttack)
      
      // Logging for Zombie Attack (occurs if isZombieAttack is true, outside the 'else' above)
      if (isZombieAttack) {
        if (gamePhase === 'rolling') { // Initial roll for Zombie Attack
          addToLog(`${players[activePlayer].name} ${t('zombie_attack_roll_initial')}`);
        } else if (gamePhase === 'decision') { // Re-roll for Zombie Attack
          // This log will now occur *after* the dice are processed and gamePhase is set back to 'decision'
          // if the Zombie Attack is not yet complete.
          // The check for remainingDiceToRollForZombie determines if we log completion or continue.
          const remainingDiceToRollForZombie = newDice.filter(
            d => !d.inTreasureChest && d.face !== 'skull' && d.face !== 'swords'
          ).length;
          if (remainingDiceToRollForZombie > 0) {
             addToLog(`${players[activePlayer].name} ${t('zombie_attack_reroll_selected')}`);
          }
          // If remainingDiceToRollForZombie is 0, the 'zombie_attack_complete' log is already handled.
        }
        // Note: setGamePhase('decision') for continuation of Zombie Attack is handled within its specific block
      }
      
      setIsDiceRolling(false);
    }, 800);
  }, [
    gamePhase, rollsRemaining, islandOfSkulls, currentDice, selectedDice,
    players, activePlayer, currentCard, skullRerollUsed, playSounds,
    addToLog, t, calculateScoreRef,
    setIsDiceRolling, setCurrentDice, setSelectedDice, setSkullCount,
    setIslandOfSkulls, setIslandSkullsCollectedThisTurn, 
    setTurnEndsWithSkulls, setAutoEndCountdown, 
    setGamePhase, setRollsRemaining,
    setSkullRerollUsed, setPlayers,
    // Dev dependencies
    devNextDiceRoll, setDevNextDiceRoll,
    setDevNextCardId 
  ]);

  /**
   * Toggle die selection for rerolling
   */
  const toggleDieSelection = useCallback((index) => {
    const isZombieAttackActive = currentCard?.effect === 'zombie_attack';

    if (state.isDiceRolling) return; // Always block if dice are physically rolling

    if (isZombieAttackActive) {
      if (gamePhase !== 'decision') return; // Only allow selection in decision phase for ZA

      const die = currentDice[index];
      // For Zombie Attack, can only select dice that are NOT skull, NOT sword, and NOT in treasure chest
      if (die.face === 'skull' || die.face === 'swords' || die.inTreasureChest) {
        return;
      }
      // Standard selection toggle for eligible dice in Zombie Attack
      setSelectedDice(prevSelected => 
        prevSelected.includes(index) 
          ? prevSelected.filter(i => i !== index) 
          : [...prevSelected, index]
      );
      return; // Zombie Attack selection handled
    }

    // --- Original logic for non-Zombie Attack follows ---
    // Prevent selection during Skull Island, or if not in decision phase
    if (islandOfSkulls || gamePhase !== 'decision') {
      return;
    }

    const die = currentDice[index];
    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed; 

    // Prevent selection of dice in treasure chest.
    if (die.inTreasureChest) return;
    // Prevent selection of normally locked dice (non-skulls)
    if (die.locked && die.face !== 'skull') return;
    // Prevent selection of skulls if Sorceress is not available or already used
    if (die.face === 'skull' && !isSorceressAvailable) return;

    setSelectedDice(prevSelected => {
        let newSelectedDice = [...prevSelected];
        const isCurrentlySelected = newSelectedDice.includes(index);
        const currentlySelectedSkullIndex = newSelectedDice.find(selectedIndex => currentDice[selectedIndex].face === 'skull');

        if (die.face === 'skull') {
            // If Sorceress is available, allow selection/deselection of ONE skull.
            if (isSorceressAvailable) {
                if (isCurrentlySelected) {
                    // Clicking an already selected skull: deselect it
                    newSelectedDice = newSelectedDice.filter(i => i !== index);
                } else {
                    // Clicking a new skull: Only allow if no other skull is selected
                    if (currentlySelectedSkullIndex === undefined) {
                        newSelectedDice.push(index);
                    } else {
                        // A skull is already selected, do nothing (or maybe flash a message?)
                        // For now, just prevent selecting a second skull
                    }
                }
            } 
            // If Sorceress not available, this point shouldn't be reached due to earlier check
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
