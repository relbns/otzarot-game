/**
 * Game Initialization Hook
 * 
 * This file contains hooks for initializing and resetting the game.
 */
import { useCallback, useEffect } from 'react';
import { CARDS } from '../constants';
import { createNewDeck } from '../utils/gameUtils';
import soundManager from '../utils/SoundManager';

/**
 * Hook for game initialization and reset
 * @param {Object} state - Current game state
 * @param {Object} setters - State setters
 * @param {Object} refs - Function refs
 * @returns {Object} Game initialization functions
 */
export const useGameInitialization = (state, setters, refs) => {
  const {
    playerCount,
    language,
    playSounds,
    t
  } = state;
  
  const {
    setLanguage,
    setPlayers,
    setActivePlayer,
    setGamePhase,
    setIsGameOver,
    setWinner,
    setGameLog,
    setShowStartForm,
    setGameStarted,
    setDeck,
    setVictoryModalVisible
  } = setters;
  
  const { initNewTurnRef } = refs;
  
  /**
   * Add a message to the game log
   */
  const addToLog = useCallback((message) => {
    setGameLog((prevLog) => [message, ...prevLog]);
  }, [setGameLog]);
  
  /**
   * Load saved settings from localStorage
   */
  useEffect(() => {
    const savedPoints = localStorage.getItem('otzarot_targetPoints');
    if (savedPoints) setters.setPointsToWin(parseInt(savedPoints));
    
    const savedSounds = localStorage.getItem('otzarot_soundsEnabled');
    if (savedSounds !== null) setters.setPlaySounds(savedSounds === 'true');
  }, [setters]);
  
  /**
   * Update sound manager when playSounds changes
   */
  useEffect(() => {
    soundManager.setEnabled(playSounds);
  }, [playSounds]);
  
  /**
   * Initialize a new game
   */
  const initializeGame = useCallback((playerNames, selectedLanguage) => {
    // Update language if provided
    if (selectedLanguage && selectedLanguage !== language) {
      setLanguage(selectedLanguage);
    }
    
    // Initialize players with provided names or defaults
    const newPlayers = Array(playerCount).fill(null).map((_, i) => ({
      id: i + 1,
      name: playerNames && playerNames[i] && playerNames[i].trim() !== '' 
        ? playerNames[i] 
        : `Player ${i + 1}`,
      score: 0
    }));
    
    // Set initial game state
    setPlayers(newPlayers);
    setActivePlayer(0);
    setGamePhase('waiting');
    setIsGameOver(false);
    setWinner(null);
    setGameLog([t('welcome')]);
    setShowStartForm(false);
    setGameStarted(true);
    
    // Initialize deck
    const newDeck = createNewDeck(CARDS);
    setDeck(newDeck);
  }, [
    playerCount, language, t,
    setLanguage, setPlayers, setActivePlayer, setGamePhase,
    setIsGameOver, setWinner, setGameLog, setShowStartForm,
    setGameStarted, setDeck
  ]);
  
  /**
   * Start the game
   */
  const startGame = useCallback(() => {
    setGameStarted(true);
    
    if (playSounds) soundManager.play('gameStart');
    
    addToLog(t('lets_play'));
    
    // Initialize a new turn when the game starts
    if (initNewTurnRef.current) {
      initNewTurnRef.current();
    }
  }, [
    playSounds, t, addToLog, initNewTurnRef,
    setGameStarted
  ]);
  
  /**
   * Reset the game
   */
  const resetGame = useCallback(() => {
    console.log('resetGame called');
    
    // First update UI state
    setGameStarted(false);
    setShowStartForm(true);
    setGameLog([]);
    setIsGameOver(false);
    setWinner(null);
    setVictoryModalVisible(false);
    
    // Reset game state
    setPlayers(Array(playerCount).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      score: 0
    })));
    setActivePlayer(0);
    setGamePhase('waiting');
    
    // Play sound effect if enabled
    if (playSounds && soundManager) {
      try {
        soundManager.play('button');
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  }, [
    playerCount, playSounds,
    setGameStarted, setShowStartForm, setGameLog,
    setIsGameOver, setWinner, setVictoryModalVisible,
    setPlayers, setActivePlayer, setGamePhase
  ]);
  
  return {
    initializeGame,
    startGame,
    resetGame
  };
};

export default useGameInitialization;
