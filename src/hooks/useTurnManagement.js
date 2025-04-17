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
    setVictoryModalVisible,
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
   * Calculate score for the current turn
   */
  const calculateScore = useCallback(() => {
    // Calculate score using the score calculator
    const {
      score,
      scoreDescription,
      penalties,
      penaltyDescription,
      isDisqualified,
      updatedPlayers,
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
    
    // Update score state
    setTurnScore(score);
    setTurnScoreDetails(scoreDescription);
    setTurnPenalties(penalties);
    setTurnPenaltyDetails(penaltyDescription);
    
    // Store the final score for this turn in a ref to use when proceeding to next turn
    const finalScoreForTurn = finalScore;
    
    // Update players if needed (for zombie attack)
    if (updatedPlayers) {
      setPlayers(updatedPlayers);
    } else if (!islandOfSkulls) {
      // Update player scores (except for Island of Skulls)
      const updatedPlayers = players.map((p, i) => 
        i === activePlayer 
          ? { ...p, score: p.score + finalScore } 
          : p
      );
      setPlayers(updatedPlayers);
    }
    
    // Show score modal
    setShowScoreModal(true);
    
    // Add score to log
    if (score > 0 && !islandOfSkulls) {
      addToLog(`${players[activePlayer].name} ${t('scored')} ${score} ${t('points')}!`);
      scoreDescription.forEach(desc => addToLog(`- ${desc}`));
    } else if (islandOfSkulls) {
      addToLog(`${players[activePlayer].name} ${t('island_of_skulls_log')}`);
    } else if (isDisqualified && score > 0) {
      addToLog(`${players[activePlayer].name} ${t('disqualified_but_saved')} ${score} ${t('points')} ${t('with_treasure_chest')}!`);
      scoreDescription.forEach(desc => addToLog(`- ${desc}`));
    } else if (isDisqualified) {
      const skullCount = currentDice.filter(d => d.face === 'skull').length;
      addToLog(`${players[activePlayer].name} ${t('disqualified_log')} ${skullCount} ${t('skull_count')} ${t('and_scored_zero')}.`);
    } else if (score === 0 && penalties === 0) {
      addToLog(`${players[activePlayer].name} ${t('ended_turn_no_score')}.`);
    }
    
    // Log penalties
    if (penalties > 0) {
      addToLog(`${players[activePlayer].name} ${t('has_penalties')}: -${penalties} ${t('points')}`);
      penaltyDescription.forEach(desc => addToLog(`- ${desc}`));
    }
    
    // Log final score
    if (penalties > 0 || (score > 0 && !islandOfSkulls)) {
      addToLog(`${t('final_score_log')}: ${finalScore} ${t('points')}`);
    }
    
    // Check for game over condition
    const currentPlayerState = players.map((p, i) => 
      i === activePlayer 
        ? { ...p, score: p.score + finalScore } 
        : p
    )[activePlayer];
    
    const currentPlayerNewScore = currentPlayerState?.score || 0;
    
    if (!islandOfSkulls && currentPlayerNewScore >= pointsToWin) {
      if (!isGameOver) {
        setIsGameOver(true);
        setWinner(currentPlayerState);
        addToLog(`${currentPlayerState.name} ${t('crossed_finish_line')} ${pointsToWin} ${t('points')}! ${t('final_round_begins')}`);
      } else {
        // Update winner if current player has higher score
        if (winner && currentPlayerNewScore > winner.score) {
          setWinner(currentPlayerState);
        }
      }
    }
    
    // Return the final score for this turn
    return finalScoreForTurn;
  }, [
    currentDice, currentCard, islandOfSkulls, players, activePlayer,
    isGameOver, winner, pointsToWin, t, addToLog,
    setTurnScore, setTurnScoreDetails, setTurnPenalties, setTurnPenaltyDetails,
    setPlayers, setShowScoreModal, setIsGameOver, setWinner
  ]);
  
  /**
   * Proceed to the next turn
   */
  const proceedToNextTurn = useCallback(() => {
    if (playSounds) soundManager.play('turnEnd');
    
    // Check if game should end
    const gameShouldEnd = isGameOver && activePlayer === players.length - 1;
    
    if (gameShouldEnd) {
      // Determine final winner
      const finalWinner = winner || players.reduce(
        (highest, current) => (current.score > highest.score ? current : highest),
        players[0]
      );
      
      // Ensure winner state is correct
      setWinner(finalWinner);
      
      // Log game over
      addToLog(`${t('game_over')}! ${finalWinner.name} ${t('wins')} ${t('with')} ${finalWinner.score} ${t('points')}!`);
      
      // Show victory modal
      setVictoryModalVisible(true);
      
      if (playSounds) soundManager.play('victory');
      return;
    }
    
    // We don't need to update the player's score here as it's already updated in calculateScore
    // This was causing a double-counting issue
    
    // Move to next player
    const nextPlayerIndex = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayerIndex);
    
    // Initialize new turn
    initNewTurn();
  }, [
    players, activePlayer, isGameOver, winner, playSounds, t, addToLog,
    turnScore, turnPenalties, islandOfSkulls,
    setWinner, setVictoryModalVisible, setActivePlayer, setPlayers, initNewTurn
  ]);
  
  /**
   * End the current turn
   */
  const endTurn = useCallback(() => {
    if (gamePhase === 'decision' || gamePhase === 'rolling') {
      // Calculate score if ending turn during decision or rolling phase
      calculateScore();
    } else if (showScoreModal) {
      // Close score modal and proceed to next turn
      setShowScoreModal(false);
    } else {
      // Proceed to next turn
      proceedToNextTurn();
    }
  }, [
    gamePhase, showScoreModal, calculateScore, proceedToNextTurn,
    setShowScoreModal
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
