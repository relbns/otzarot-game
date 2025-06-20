/**
 * Turn Management Hook
 * 
 * This file contains hooks for managing game turns, including ending turns,
 * calculating scores, and determining game over conditions.
 */
import { useCallback } from 'react';
import { DICE_FACES } from '../constants';
import { calculateTurnScore } from '../utils/scoreCalculator';
import { createInitialDice } from '../utils/gameUtils';
import soundManager from '../utils/SoundManager';

/**
 * Hook for turn management
 * @param {Object} state - Current game state
 * @param {Object} setters - State setters
 * @returns {Object} Turn management functions and refs
 */
export const useTurnManagement = (state, setters) => {
  const {
    gamePhase,
    showScoreModal,
    currentDice,
    currentCard,
    islandOfSkulls,
    players,
    activePlayer,
    isGameOver,
    winner,
    pointsToWin,
    playSounds,
    turnScore,
    turnPenalties,
    turnEndsWithSkulls,
    islandSkullsCollectedThisTurn, // Added from state
    // islandOfSkullsPenaltyInfo, // Will be part of scoreModalData.details if needed
    // turnZombieAttackDetails, // Will be part of scoreModalData.details if needed
    scoreModalData, // Consuming new state
    // currentCard, // Removed duplicate, it's already destructured above
    t
  } = state;
  
  const {
    setPlayers,
    setActivePlayer,
    setCurrentDice,
    setSelectedDice,
    setCurrentCard, // Restore setCurrentCard from setters
    setRollsRemaining,
    setGamePhase,
    setIslandOfSkulls,
    setIslandSkullsCollectedThisTurn, // Added setter
    setSkullCount,
    setSkullRerollUsed,
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    // setTurnScore, // Removed
    // setTurnScoreDetails, // Removed
    // setTurnPenalties, // Removed
    // setTurnPenaltyDetails, // Removed
    setScoreModalData, // Using new setter
    setIsGameOver,
    setWinner,
    setVictoryModalVisible, // Keep only one
    setGameLog,
    // setIslandOfSkullsPenaltyInfo, // Removed
    // setTurnZombieAttackDetails, // Removed
  } = setters;

  /**
   * Add a message to the game log
   */
  const addToLog = useCallback((message) => {
    setGameLog((prevLog) => [message, ...prevLog]);
  }, [setGameLog]);
  
  /**
   * Initialize a new turn
   */
  const initNewTurn = useCallback(() => {
    // Create new dice
    const newDice = createInitialDice(8);
    
    // Reset turn state
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
    // setIslandOfSkullsPenaltyInfo(null); // This line was causing the error, as the setter is removed.
    // setTurnZombieAttackDetails(null); // This was also for a removed state.
    
    // Log new turn
    if (players[activePlayer]) {
      addToLog(`${players[activePlayer].name}'s turn`);
    }
  }, [
    players, activePlayer, addToLog,
    setCurrentDice, setSelectedDice, setCurrentCard, setRollsRemaining,
    setGamePhase, setIslandOfSkulls, setSkullCount, setSkullRerollUsed,
    setTurnEndsWithSkulls, setAutoEndCountdown // Removed setIslandOfSkullsPenaltyInfo from dependencies
  ]);
  
  /**
 * Calculate score for the current turn.
 * Updates turn score state for modal/log.
 * Checks for potential win condition based on calculated score.
 * Handles zombie attack side effect.
 * Returns an object: { immediateWin: boolean, scoreData: object }
 */
const calculateScore = useCallback(() => {
  // Calculate score using the score calculator utility
  const {
    score,
    scoreDescription,
    penalties,
    penaltyDescription,
    isDisqualified,
    updatedPlayers, // Captures potential player state changes from zombie attack
    finalScore,
    zombieAttackOutcomeDetails, // Destructure the new details
  } = calculateTurnScore({
    currentDice,
    currentCard,
    islandOfSkulls,
    t,
    DICE_FACES,
    players,
    activePlayer
  });

  // --- Log score details ---
  // (Logging can remain similar, or be adapted based on the new structure if needed)
  if (score > 0 && !islandOfSkulls && !zombieAttackOutcomeDetails) { // Don't log standard score if ZA handled it
    addToLog(`${players[activePlayer].name} ${t('scored')} ${score} ${t('points')}!`);
    scoreDescription.forEach(desc => addToLog(`- ${desc}`));
  } else if (islandOfSkulls) {
    addToLog(`${players[activePlayer].name} ${t('island_of_skulls_log')}`);
  } else if (zombieAttackOutcomeDetails?.type === 'victory') {
    addToLog(`${players[activePlayer].name} ${t('zombie_attack_modal_victory_player', { playerName: players[activePlayer].name })}`);
  } else if (zombieAttackOutcomeDetails?.type === 'failed') {
    addToLog(`${players[activePlayer].name} ${t('zombie_attack_modal_failed_opponents_share')}`);
    zombieAttackOutcomeDetails.opponentAwards.forEach(award => {
      addToLog(`- ${t('zombie_attack_opponent_award', { opponentName: award.name, pointsAwarded: award.pointsAwarded })}`);
    });
  } else if (isDisqualified && score > 0) {
    addToLog(`${players[activePlayer].name} ${t('disqualified_but_saved')} ${score} ${t('points')} ${t('with_treasure_chest')}!`);
    scoreDescription.forEach(desc => addToLog(`- ${desc}`));
  } else if (isDisqualified) {
    const skullCount = currentDice.filter(d => d.face === 'skull').length;
    addToLog(`${players[activePlayer].name} ${t('disqualified_log')} ${skullCount} ${t('skull_count')} ${t('and_scored_zero')}.`);
  } else if (score === 0 && penalties === 0 && !zombieAttackOutcomeDetails) {
    addToLog(`${players[activePlayer].name} ${t('ended_turn_no_score')}.`);
  }

  if (penalties > 0) {
    addToLog(`${players[activePlayer].name} ${t('has_penalties')}: -${penalties} ${t('points')}`);
    penaltyDescription.forEach(desc => addToLog(`- ${desc}`));
  }
  if (finalScore !== 0 && (score > 0 || penalties > 0) && !islandOfSkulls && !zombieAttackOutcomeDetails) {
     addToLog(`${t('final_score_log')}: ${finalScore} ${t('points')}`);
  }
  
  // --- Player Score Update ---
  let newPlayersState = players; // Start with current players state
  if (updatedPlayers) {
    // If calculateTurnScore provided a comprehensive updatedPlayers array (e.g., for Zombie Attack), use it.
    newPlayersState = updatedPlayers;
  } else if (!islandOfSkulls) {
    // If no updatedPlayers from calculateTurnScore (e.g., for standard cards not modifying other players),
    // apply the active player's finalScore for this turn.
    // This path should ideally not be hit if updatedPlayers is always returned correctly.
    const activePlayerData = newPlayersState[activePlayer];
    if (activePlayerData) {
      newPlayersState = newPlayersState.map((p, index) =>
        index === activePlayer
          ? { ...p, score: (p.score || 0) + finalScore }
          : p
      );
    }
  }
  setPlayers(newPlayersState); // Set the determined new player state

  // --- Check for potential win condition AFTER scores are set ---
  // Use newPlayersState for the most current view for win checking within this turn's logic
  let potentialWin = false;
  if (!islandOfSkulls && !isDisqualified) {
    const currentPlayerState = newPlayersState[activePlayer];
    if (currentPlayerState && (currentPlayerState.score || 0) >= pointsToWin) {
      potentialWin = true;
    }
  }
  
  // Return all data needed for `endTurn` to construct `scoreModalData`
  // Note: The actual win check that transitions game state happens in `proceedToNextTurn`
  // using the fully updated `players` state from context.
  return {
      score, // Score for the active player this turn
      scoreDescription, 
      penalties, 
      penaltyDescription, 
      isDisqualified, 
      finalScore, // Final score for the active player this turn
      zombieAttackOutcomeDetails,
      // updatedPlayers is not returned as its effect is applied via setPlayers(newPlayersState)
  };

}, [
  currentDice, currentCard, islandOfSkulls, players, activePlayer, pointsToWin, t,
  addToLog, 
  setPlayers 
]);

  /**
   * Proceed to the next turn
   */
  const proceedToNextTurn = useCallback(() => {
    // Scores for the turn (active player's gain/loss, opponent changes for ZA/IoS)
    // should have already been applied to the `players` state by the `calculateScore` -> `setPlayers` call,
    // or by `finalizeIslandOfSkullsTurn` -> `setPlayers`.
    // So, `players` state here is the definitive list after the turn's events.

    if (playSounds) soundManager.play('turnEnd');

    // Check for win condition *after* all score updates for the turn
    const currentPlayerFinalData = players[activePlayer]; 

    if (currentPlayerFinalData && currentPlayerFinalData.score >= pointsToWin) {
        setIsGameOver(true);
        setWinner(currentPlayerFinalData);
        setVictoryModalVisible(true);
        if (playSounds) soundManager.play('victory');
        addToLog(`${currentPlayerFinalData.name} ${t('wins')} ${t('with')} ${currentPlayerFinalData.score} ${t('points')}!`);
        return; 
    }

    // Move to next player ONLY if no win occurred
    const nextPlayerIndex = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayerIndex);

    initNewTurn();
  }, [
    players, // Depends on the `players` state which should be up-to-date
    activePlayer, pointsToWin, 
    playSounds, t, addToLog,
    // No longer needs turnScore, turnPenalties, islandOfSkullsPenaltyInfo directly
    // setPlayers, // setPlayers is called within calculateScore now
    setIsGameOver, setWinner, setVictoryModalVisible,
    setActivePlayer, initNewTurn, 
    // setIslandOfSkullsPenaltyInfo // Not needed as separate state
  ]);
  
  /**
 * End the current turn
 */
const endTurn = useCallback(() => {
  if (['decision', 'rolling', 'resolution'].includes(gamePhase) && gamePhase !== 'islandResolutionPending') {
    const turnOutcome = calculateScore(); // This now calls setPlayers internally

    // Construct scoreModalData based on turnOutcome
    let modalDetails = {};
    let modalType = 'normal';

    if (turnOutcome.zombieAttackOutcomeDetails) {
      modalType = 'zombie';
      modalDetails = {
        ...turnOutcome.zombieAttackOutcomeDetails,
        // Include dice and card for display consistency if needed by modal
        currentDice, 
        currentCard,
        activePlayerName: players[activePlayer].name,
      };
    } else if (islandOfSkulls) { // This case should be handled by finalizeIslandOfSkullsTurn
      // This block might be redundant if finalizeIslandOfSkullsTurn is always called for IoS
      modalType = 'ios';
      // modalDetails would need islandOfSkullsPenaltyInfo, which is no longer a separate state
      // This needs to be sourced from the result of handleIslandOfSkullsRoll or similar
      // For now, assuming finalizeIslandOfSkullsTurn handles IoS modal display
    } else {
      // Normal turn outcome
      modalType = 'normal';
      modalDetails = {
        score: turnOutcome.score,
        scoreDescription: turnOutcome.scoreDescription,
        penalties: turnOutcome.penalties,
        penaltyDescription: turnOutcome.penaltyDescription,
        finalScore: turnOutcome.finalScore,
        isDisqualified: turnOutcome.isDisqualified,
        currentDice,
        currentCard,
        activePlayerName: players[activePlayer].name,
      };
    }
    
    // Show modal if there's something to show (ZA outcome, or score/penalty)
    if (modalType === 'zombie' || 
        (modalType === 'normal' && (turnOutcome.finalScore !== 0 || turnOutcome.isDisqualified))
    ) {
      setScoreModalData({ type: modalType, details: modalDetails });
    } else {
      // No modal needed (e.g., normal turn, 0 score, not disqualified)
      // proceedToNextTurn will be called because scoreModalData is null
      proceedToNextTurn();
    }
  } else if (gamePhase === 'islandResolutionPending') {
    // This case should be handled by finalizeIslandOfSkullsTurn setting the modal data
    // If it's called from here, it means something went wrong or it's a direct "End Turn" click
    // For now, let finalizeIslandOfSkullsTurn manage its own modal display.
  } else {
    // If not in a phase that calculates score, just proceed
    proceedToNextTurn();
  }
}, [
  gamePhase, players, activePlayer, currentDice, currentCard, islandOfSkulls, // Added dependencies
  calculateScore, proceedToNextTurn, setScoreModalData 
]);
  
  // Create refs for functions to avoid stale closures
  const calculateScoreRef = { current: calculateScore };
  const proceedToNextTurnRef = { current: proceedToNextTurn };
  const initNewTurnRef = { current: initNewTurn };
  const endTurnRef = { current: endTurn };

  /**
   * Finalize the Island of Skulls turn after player interaction.
   * Calculates and applies penalties, then proceeds to end the turn normally.
   */
  const finalizeIslandOfSkullsTurn = useCallback(() => {
    if (gamePhase !== 'islandResolutionPending') {
      console.warn('finalizeIslandOfSkullsTurn called outside of islandResolutionPending phase');
      return;
    }

    const skullsCollectedForTurn = islandSkullsCollectedThisTurn; // Capture value before reset
    let opponentPenaltyDetails = [];
    let appliedPenalty = 0;
    let newPenaltyInfo = null; // To store the penalty info for setting state once

    let finalPlayers = [...players]; // Start with a copy of current players

    if (skullsCollectedForTurn > 0) {
      const penaltyMultiplier = currentCard?.effect === 'double_score' ? 200 : 100;
      appliedPenalty = skullsCollectedForTurn * penaltyMultiplier;

      if (appliedPenalty > 0) {
        const opponentDetailsForModal = [];
        finalPlayers = players.map((p, i) => {
          if (i !== activePlayer) {
            const oldScore = p.score || 0;
            const newScore = Math.max(0, oldScore - appliedPenalty);
            opponentDetailsForModal.push({ name: p.name, oldScore, newScore, penalty: appliedPenalty });
            return { ...p, score: newScore };
          }
          return p;
        });
        
        newPenaltyInfo = { // This structure is for the modal details
          penaltyAppliedToOpponents: appliedPenalty,
          opponentDetails: opponentDetailsForModal,
        };

        const opponentNames = players.filter((_, i) => i !== activePlayer).map(p => p.name).join(', ');
        if (opponentNames) {
          const captainMsg = penaltyMultiplier === 200 ? t('captain_doubles_penalty_ios') : '';
          addToLog(
            `${t('island_of_skulls_summary_log', { skulls: skullsCollectedForTurn })} ` +
            `${opponentNames} ${t('lose')} ${appliedPenalty} ${t('points')}. ${captainMsg}`
          );
        }
      }
    } else {
      addToLog(t('island_of_skulls_no_skulls_collected_log'));
    }

    // Apply player score updates from IoS penalties
    setPlayers(finalPlayers);

    // Prepare data for the modal
    const modalData = {
      type: 'ios',
      details: {
        activePlayerName: players[activePlayer].name, // Name of the player whose turn it was
        currentDice, // Show the dice state at the end of IoS
        currentCard, // Show the active card
        islandOfSkullsPenaltyInfo: newPenaltyInfo, // Contains opponent details and penalty amount
        // IoS player scores 0 for themselves this turn.
        score: 0, 
        scoreDescription: [t('island_of_skulls_player_score_zero')],
        penalties: 0,
        penaltyDescription: [],
        finalScore: 0,
        isDisqualified: false, // Not disqualified in the traditional sense on IoS
      }
    };
    setScoreModalData(modalData);

    // Reset IoS specific states now that all processing for this turn's value is done
    setIslandSkullsCollectedThisTurn(0);
    setIslandOfSkulls(false); 
    setGamePhase('resolution'); // Game phase moves to resolution, modal will show

  }, [
    gamePhase, islandSkullsCollectedThisTurn, players, activePlayer, currentCard, t, currentDice, // Added currentDice
    setPlayers, // Added setPlayers
    setIslandSkullsCollectedThisTurn, setIslandOfSkulls, setGamePhase,
    addToLog, setScoreModalData, // Replaced setShowScoreModal and individual score setters
  ]);
  
  const finalizeIslandOfSkullsTurnRef = { current: finalizeIslandOfSkullsTurn }; // Keep this for IoS button

  return {
    calculateScoreRef, // Still useful if called directly elsewhere (e.g. by game actions)
    proceedToNextTurnRef,
    initNewTurnRef,
    endTurnRef,
    finalizeIslandOfSkullsTurnRef,
    addToLog
  };
};

export default useTurnManagement;
