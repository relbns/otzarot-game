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
    turnEndsWithSkulls, // Add turnEndsWithSkulls here
    t
  } = state;
  
  const {
    setPlayers,
    setActivePlayer,
    setCurrentDice,
    setSelectedDice,
    setCurrentCard,
    setRollsRemaining,
    setGamePhase,
    setIslandOfSkulls,
    setSkullCount,
    setSkullRerollUsed,
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    setTurnScore,
    setTurnScoreDetails,
    setTurnPenalties,
    setTurnPenaltyDetails,
    setShowScoreModal,
    setIsGameOver,
    setWinner,
    setVictoryModalVisible, // Keep only one
    setGameLog
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
    
    // Log new turn
    if (players[activePlayer]) {
      addToLog(`${players[activePlayer].name}'s turn`);
    }
  }, [
    players, activePlayer, addToLog,
    setCurrentDice, setSelectedDice, setCurrentCard, setRollsRemaining,
    setGamePhase, setIslandOfSkulls, setSkullCount, setSkullRerollUsed,
    setTurnEndsWithSkulls, setAutoEndCountdown
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
    finalScore
  } = calculateTurnScore({
    currentDice,
    currentCard,
    islandOfSkulls,
    t,
    DICE_FACES,
    players,
    activePlayer
  });

  // Update turn score state for display in modal/log
  setTurnScore(score);
  setTurnScoreDetails(scoreDescription);
  setTurnPenalties(penalties);
  setTurnPenaltyDetails(penaltyDescription);

  // --- Log score details ---
  if (score > 0 && !islandOfSkulls) {
    addToLog(`${players[activePlayer].name} ${t('scored')} ${score} ${t('points')}!`);
    scoreDescription.forEach(desc => addToLog(`- ${desc}`));
  } else if (islandOfSkulls) {
    addToLog(`${players[activePlayer].name} ${t('island_of_skulls_log')}`);
  } else if (isDisqualified && score > 0) {
    // Saved by treasure chest
    addToLog(`${players[activePlayer].name} ${t('disqualified_but_saved')} ${score} ${t('points')} ${t('with_treasure_chest')}!`);
    scoreDescription.forEach(desc => addToLog(`- ${desc}`));
  } else if (isDisqualified) {
    // Disqualified, no chest save
    const skullCount = currentDice.filter(d => d.face === 'skull').length;
    addToLog(`${players[activePlayer].name} ${t('disqualified_log')} ${skullCount} ${t('skull_count')} ${t('and_scored_zero')}.`);
  } else if (score === 0 && penalties === 0) {
    // Ended turn normally with zero score
    addToLog(`${players[activePlayer].name} ${t('ended_turn_no_score')}.`);
  }
  // Log penalties if any
  if (penalties > 0) {
    addToLog(`${players[activePlayer].name} ${t('has_penalties')}: -${penalties} ${t('points')}`);
    penaltyDescription.forEach(desc => addToLog(`- ${desc}`));
  }
  // Log final score if it's relevant (score > 0 or penalties > 0)
  if (finalScore !== 0 && (score > 0 || penalties > 0) && !islandOfSkulls) {
     addToLog(`${t('final_score_log')}: ${finalScore} ${t('points')}`);
  }

  // --- Check for potential win condition ---
  let potentialWin = false;
  // Win check only applies if not disqualified and not on Island of Skulls
  if (!islandOfSkulls && !isDisqualified) {
    const currentScore = players[activePlayer]?.score || 0;
    const potentialNewScore = currentScore + finalScore; // Use finalScore from calculation
    if (potentialNewScore >= pointsToWin) {
      potentialWin = true;
      // DO NOT update state here, just flag the potential win
    }
  }

  // Handle zombie attack player update side effect
  // This happens regardless of potentialWin, as it affects opponents
  if (updatedPlayers) {
    setPlayers(updatedPlayers);
    // If zombie attack happened, it negates any potential win for the active player this turn
    potentialWin = false;
  }

  // Return the potential win status and the score data needed by endTurn
  return {
      immediateWin: potentialWin,
      // Pass back key data needed for modal logic in endTurn
      scoreData: { score, penalties, finalScore, isDisqualified, islandOfSkulls }
  };

}, [
  // Dependencies: state values read, setters called, external functions used
  currentDice, currentCard, islandOfSkulls, players, activePlayer, pointsToWin, t,
  addToLog, setTurnScore, setTurnScoreDetails, setTurnPenalties, setTurnPenaltyDetails,
  setPlayers // Keep setPlayers dependency for zombie attack side effect
]);

  /**
   * Proceed to the next turn (only called for non-winning turns now)
   */
  const proceedToNextTurn = useCallback(() => {
    if (playSounds) soundManager.play('turnEnd');

    if (playSounds) soundManager.play('turnEnd');

    // Update the score for the player who just finished their turn
    const finalScoreForTurn = Math.max(0, turnScore - turnPenalties);
    let updatedPlayersList = players; // Start with current players

    // Apply score update if applicable (not island, positive score, or disqualified with chest)
    // Note: calculateTurnScore handles disqualified score logic, so we use turnScore/turnPenalties here
    const isDisqualifiedWithChest = turnEndsWithSkulls && currentCard?.effect === 'store_dice' && turnScore > 0;
    if ((!islandOfSkulls && !turnEndsWithSkulls && finalScoreForTurn > 0) || isDisqualifiedWithChest) {
       updatedPlayersList = players.map((p, i) => // Create the updated list
         i === activePlayer
           ? { ...p, score: (p.score || 0) + finalScoreForTurn } // Ensure p.score exists
           : p
       );
       setPlayers(updatedPlayersList); // Update the state here
    } else if (turnEndsWithSkulls && !isDisqualifiedWithChest) {
       // If disqualified without chest, ensure score doesn't change positively
       // Penalties might apply via zombie attack, handled in calculateScore
    }


    // Check for win condition *after* score update, *before* switching player
    const currentPlayerFinalData = updatedPlayersList.find((p, i) => i === activePlayer); // Find player data safely

    if (currentPlayerFinalData && currentPlayerFinalData.score >= pointsToWin) {
        setIsGameOver(true);
        setWinner(currentPlayerFinalData);
        setVictoryModalVisible(true); // Show victory modal
        if (playSounds) soundManager.play('victory');
        addToLog(`${currentPlayerFinalData.name} ${t('wins')} ${t('with')} ${currentPlayerFinalData.score} ${t('points')}!`);
        // Do NOT proceed to next player or init new turn
        return; // Exit early
    }

    // Move to next player ONLY if no win occurred
    const nextPlayerIndex = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayerIndex);

    // Initialize new turn
    initNewTurn();
  }, [
    players, activePlayer, pointsToWin,
    turnScore, turnPenalties, islandOfSkulls, turnEndsWithSkulls, currentCard, // Ensure turnEndsWithSkulls is here
    playSounds, t, addToLog,
    setPlayers, setIsGameOver, setWinner, setVictoryModalVisible, setActivePlayer, initNewTurn
  ]);
  
  /**
 * End the current turn
 */
const endTurn = useCallback(() => {
  let shouldShowScoreModal = false;
  let isPotentialWin = false;

  // Calculate score only if ending turn during decision or rolling phase
  if (gamePhase === 'decision' || gamePhase === 'rolling') {
     const { immediateWin, scoreData } = calculateScore(); // Get win status and score data
     isPotentialWin = immediateWin; // Store if a win is possible this turn

     // Decide if score modal should be shown (only if not an immediate win)
     // Show modal if score > 0, or penalties > 0, or disqualified (to show 0)
     // unless it's Island of Skulls (no modal needed)
     if (!isPotentialWin && !scoreData.islandOfSkulls && (scoreData.finalScore !== 0 || scoreData.isDisqualified)) {
        shouldShowScoreModal = true;
        setShowScoreModal(true); // Set state to show modal
     }
  }

  // If a win is potentially happening OR the score modal is already showing
  if (isPotentialWin) {
      // Win condition was met in calculateScore check.
      // proceedToNextTurn will handle the final score update and victory modal display.
      // We call it directly here because no score modal interaction is needed.
      proceedToNextTurn();
  } else if (showScoreModal) {
      // If score modal is currently showing (set by previous logic or this call),
      // close it first, then proceed to update score and check win condition finally.
      setShowScoreModal(false);
      proceedToNextTurn(); // Proceed only after closing modal
  } else if (!shouldShowScoreModal && (gamePhase === 'decision' || gamePhase === 'rolling')) {
      // Turn ended during decision/rolling, but score was 0 and not disqualified (no modal shown)
      proceedToNextTurn();
  } else if (gamePhase !== 'decision' && gamePhase !== 'rolling') {
     // If turn ended automatically (e.g., skulls timeout, drawing phase end?)
     // and score modal wasn't triggered above, proceed directly.
     proceedToNextTurn();
  }
}, [
  gamePhase, showScoreModal, // Keep showScoreModal dependency
  calculateScore, proceedToNextTurn, setShowScoreModal // Keep setters/functions
]);
  
  // Create refs for functions to avoid stale closures
  const calculateScoreRef = { current: calculateScore };
  const proceedToNextTurnRef = { current: proceedToNextTurn };
  const initNewTurnRef = { current: initNewTurn };
  const endTurnRef = { current: endTurn };
  
  return {
    calculateScoreRef,
    proceedToNextTurnRef,
    initNewTurnRef,
    endTurnRef,
    addToLog
  };
};

export default useTurnManagement;
