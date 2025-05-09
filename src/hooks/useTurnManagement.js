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
    islandOfSkullsPenaltyInfo, // Added from state for proceedToNextTurn
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
    setTurnScore,
    setTurnScoreDetails,
    setTurnPenalties,
    setTurnPenaltyDetails,
    setShowScoreModal,
    setIsGameOver,
    setWinner,
    setVictoryModalVisible, // Keep only one
    setGameLog,
    setIslandOfSkullsPenaltyInfo // Added setter for IoS penalty info
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
    setIslandOfSkullsPenaltyInfo(null); // Reset IoS penalty info
    
    // Log new turn
    if (players[activePlayer]) {
      addToLog(`${players[activePlayer].name}'s turn`);
    }
  }, [
    players, activePlayer, addToLog,
    setCurrentDice, setSelectedDice, setCurrentCard, setRollsRemaining,
    setGamePhase, setIslandOfSkulls, setSkullCount, setSkullRerollUsed,
    setTurnEndsWithSkulls, setAutoEndCountdown, setIslandOfSkullsPenaltyInfo
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
    let playersAfterIoSPenalties = players; // Start with current players from state

    // Apply Island of Skulls penalties if info is present
    if (islandOfSkullsPenaltyInfo) {
      const { penaltyAppliedToOpponents } = islandOfSkullsPenaltyInfo;
      if (penaltyAppliedToOpponents > 0) {
        playersAfterIoSPenalties = players.map((p, i) =>
          i !== activePlayer
            ? { ...p, score: Math.max(0, (p.score || 0) - penaltyAppliedToOpponents) }
            : p
        );
      }
      // Note: setIslandOfSkullsPenaltyInfo(null) will be called after setPlayers
    }

    if (playSounds) soundManager.play('turnEnd');

    // Calculate the active player's turn outcome (for IoS, turnScore and turnPenalties are 0)
    const actualTurnOutcome = turnScore - turnPenalties;

    // Update active player's score based on the (potentially) modified players list
    const finalPlayersList = playersAfterIoSPenalties.map((p, i) =>
      i === activePlayer
        ? { ...p, score: Math.max(0, (p.score || 0) + actualTurnOutcome) }
        : p
    );

    // Single call to setPlayers with the definitive list for this turn
    setPlayers(finalPlayersList);

    // Clear IoS penalty info if it was processed
    if (islandOfSkullsPenaltyInfo) {
      setIslandOfSkullsPenaltyInfo(null);
    }

    // Check for win condition *after* all score updates for the turn
    const currentPlayerFinalData = finalPlayersList[activePlayer]; // Direct access is fine

    if (currentPlayerFinalData && currentPlayerFinalData.score >= pointsToWin) {
        setIsGameOver(true);
        setWinner(currentPlayerFinalData);
        setVictoryModalVisible(true);
        if (playSounds) soundManager.play('victory');
        addToLog(`${currentPlayerFinalData.name} ${t('wins')} ${t('with')} ${currentPlayerFinalData.score} ${t('points')}!`);
        return; // Exit early
    }

    // Move to next player ONLY if no win occurred
    const nextPlayerIndex = (activePlayer + 1) % finalPlayersList.length;
    setActivePlayer(nextPlayerIndex);

    initNewTurn();
  }, [
    players, activePlayer, pointsToWin, turnScore, turnPenalties,
    islandOfSkullsPenaltyInfo, // Dependency for reading its value
    playSounds, t, addToLog,
    setPlayers, setIsGameOver, setWinner, setVictoryModalVisible,
    setActivePlayer, initNewTurn, setIslandOfSkullsPenaltyInfo // Dependency for clearing
  ]);
  
  /**
 * End the current turn
 */
const endTurn = useCallback(() => {
  let shouldShowScoreModal = false;
  let isPotentialWin = false;
  let scoreDataForModal = null;

  // Calculate score if ending turn during decision, rolling, or resolution (due to skulls)
  if (['decision', 'rolling', 'resolution'].includes(gamePhase) && gamePhase !== 'islandResolutionPending') {
     const { immediateWin, scoreData } = calculateScore();
     isPotentialWin = immediateWin;
     scoreDataForModal = scoreData; // Store scoreData to decide on modal display

     // Decide if score modal should be shown (only if not an immediate win)
     // Show modal if score > 0, or penalties > 0, or disqualified (to show 0)
     // unless it's Island of Skulls (no modal needed for standard IoS flow, handled by finalizeIslandOfSkullsTurn)
     if (!isPotentialWin && !scoreData.islandOfSkulls && (scoreData.finalScore !== 0 || scoreData.isDisqualified)) {
        shouldShowScoreModal = true;
     }
  }

  if (isPotentialWin) {
      // Win condition was met. proceedToNextTurn handles final score update and victory.
      proceedToNextTurn();
  } else if (shouldShowScoreModal) {
      // If modal should be shown (and not a win), set state to show it.
      // proceedToNextTurn will be called when the modal is closed by the user.
      setShowScoreModal(true);
  } else if (showScoreModal) {
      // If modal is already showing (e.g., from finalizeIslandOfSkullsTurn),
      // this call to endTurn (likely from modal close button) should proceed.
      setShowScoreModal(false);
      proceedToNextTurn();
  } else {
      // No win, no modal needed/showing (e.g., turn ended with 0 score, not disqualified, not IoS)
      // or if gamePhase was not one that calculates score (e.g. 'drawing' if a card auto-ended turn - though less likely now)
      proceedToNextTurn();
  }
}, [
  gamePhase, showScoreModal,
  calculateScore, proceedToNextTurn, setShowScoreModal
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

    if (skullsCollectedForTurn > 0) {
      const penaltyMultiplier = currentCard?.effect === 'double_score' ? 200 : 100;
      appliedPenalty = skullsCollectedForTurn * penaltyMultiplier;

      if (appliedPenalty > 0) {
        const opponentOldScores = players
          .filter((_, i) => i !== activePlayer)
          .map(p => ({ name: p.name, oldScore: p.score || 0 }));

        // DO NOT update players state here. Deduction happens in proceedToNextTurn.
        // Construct opponentDetails for the modal to show what scores *will be*.
        opponentPenaltyDetails = opponentOldScores.map(opOld => ({
            name: opOld.name,
            oldScore: opOld.oldScore,
            newScore: Math.max(0, (opOld.oldScore || 0) - appliedPenalty), // Show pending new score
        }));
        
        newPenaltyInfo = {
          penaltyAppliedToOpponents: appliedPenalty,
          opponentDetails: opponentPenaltyDetails,
        };

        const opponentNames = players
          .filter((_, i) => i !== activePlayer)
          .map(p => p.name)
          .join(', ');

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
      setIslandOfSkullsPenaltyInfo(newPenaltyInfo); // No penalty means newPenaltyInfo is null
    }

    // Set score details for the active player (on IoS) for the modal
    // The turnScoreDetails for IoS player is now primarily for the isIoSTurnSummary flag in ScoreModal.
    // The actual opponent penalty display is handled by islandOfSkullsPenaltyInfo.
    setTurnScore(0);
    setTurnScoreDetails([t('island_of_skulls_player_score_zero')]); // Keep this for the flag
    setTurnPenalties(0); 
    setTurnPenaltyDetails([]);

    // Reset IoS specific states now that all processing for this turn's value is done
    setIslandSkullsCollectedThisTurn(0);
    setIslandOfSkulls(false); 

    setShowScoreModal(true); 
    setGamePhase('resolution'); 

  }, [
    gamePhase, islandSkullsCollectedThisTurn, players, activePlayer, currentCard, t,
    // setPlayers, // Removed: Player scores are updated in proceedToNextTurn
    setIslandSkullsCollectedThisTurn, setIslandOfSkulls, setGamePhase,
    addToLog, setShowScoreModal, setTurnScore, setTurnScoreDetails, setTurnPenalties, setTurnPenaltyDetails,
    setIslandOfSkullsPenaltyInfo
  ]);
  
  const finalizeIslandOfSkullsTurnRef = { current: finalizeIslandOfSkullsTurn };

  return {
    calculateScoreRef,
    proceedToNextTurnRef,
    initNewTurnRef,
    endTurnRef,
    finalizeIslandOfSkullsTurnRef, // Expose the new function
    addToLog
  };
};

export default useTurnManagement;
