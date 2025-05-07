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
    
    // Check minimum dice selection - Always applies in decision phase if not IoS
    if (gamePhase === 'decision' && !islandOfSkulls && selectedDice.length < 2) {
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
    if (gamePhase === 'rolling') { // Initial roll
      diceToRollIndexes = currentDice.map((_, i) => i);
    } else if (islandOfSkulls) { // Island of Skulls roll
      diceToRollIndexes = currentDice.reduce((acc, d, i) =>
        (d.face !== 'skull' && !d.locked) ? [...acc, i] : acc, []);
    } else { // Normal reroll (gamePhase === 'decision' and not IoS)
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
      const isSeaBattleCard = currentCard?.effect?.startsWith('sea_battle_');
      if (gamePhase === 'rolling' && totalSkulls >= 4 && !isSeaBattleCard) {
        // Lock all skull dice. Non-skull dice remain rollable for Island of Skulls mode.
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
      // Check for 3+ total skulls
      else if (totalSkulls >= 3) {
        // Lock all skull dice from the roll
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
      // Normal roll (less than 3 skulls, not Island of Skulls)
      else {
        let rollConsumed = false;
        if (gamePhase === 'rolling') { // Initial roll of the turn
          addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
          if (rollsRemaining === 1) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
          setRollsRemaining(prev => prev - 1);
          rollConsumed = true; // Flag that a roll happened
        } else if (gamePhase === 'decision') { // Reroll phase (Sorceress or normal)
          // Log differently if Sorceress was used this roll
          if (sorceressUsedThisRoll) {
             // Sorceress reroll doesn't consume a standard roll count
             addToLog(`${players[activePlayer].name} ${t('rerolled_with_sorceress')}`);
             rollConsumed = true; // Still counts as a roll action having happened
          } else {
             // Normal reroll (no Sorceress skull included, or Sorceress not active/used)
             addToLog(`${players[activePlayer].name} ${t('reroll_selected')}`);
             if (rollsRemaining === 1) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
             setRollsRemaining(prev => prev - 1);
             rollConsumed = true;
          }
        }
        // If it was the initial roll (gamePhase === 'rolling'), rollsRemaining was already decremented before the setTimeout

        setGamePhase('decision');
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
    // Prevent selection during Skull Island, while rolling, or if not in decision phase
    if (islandOfSkulls || state.isDiceRolling || gamePhase !== 'decision') {
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
