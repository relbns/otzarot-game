import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback // Added useCallback
} from 'react';
import { renderDieFace } from '../utils/gameUtils';
import { useLanguage } from '../hooks/useLanguage';
import { useGameActions } from '../hooks/useGameActions';
import { useTurnManagement } from '../hooks/useTurnManagement';
import { useGameInitialization } from '../hooks/useGameInitialization';

// Create context
export const GameContext = createContext();

// Custom hook for using the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
  // ============================
  // State Management
  // ============================

  // Game settings
  const [language, setLanguage] = useState('he');
  const [playerCount, setPlayerCount] = useState(2);
  const [pointsToWin, setPointsToWin] = useState(8000);
  const [playSounds, setPlaySounds] = useState(true);

  // UI state
  const [showStartForm, setShowStartForm] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showShuffleNotification, setShowShuffleNotification] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameLog, setGameLog] = useState([]);

  // Game state
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', score: 0 },
    { id: 2, name: 'Player 2', score: 0 },
  ]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [gamePhase, setGamePhase] = useState('waiting');
  const [rollsRemaining, setRollsRemaining] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Turn state
  const [islandOfSkulls, setIslandOfSkulls] = useState(false);
  const [islandSkullsCollectedThisTurn, setIslandSkullsCollectedThisTurn] = useState(0); // For IoS penalty accumulation
  const [skullCount, setSkullCount] = useState(0);
  const [skullRerollUsed, setSkullRerollUsed] = useState(false); // Restored original name
  // console.log(`[GameProvider] Top level render. skullRerollUsedState: ${skullRerollUsedState}`); // DEBUG REMOVED

  // const setSkullRerollUsed = useCallback((newValue) => { // DEBUG REMOVED
  //   console.log(`[GameContext] WRAPPED setSkullRerollUsed CALLED. NewValue: ${newValue}, Current skullRerollUsedState before set: ${skullRerollUsedState}`); // DEBUG REMOVED
  //   _setSkullRerollUsed(newValue); // DEBUG REMOVED
  // }, [skullRerollUsedState]); // DEBUG REMOVED

  const [turnEndsWithSkulls, setTurnEndsWithSkulls] = useState(false);
  const [autoEndCountdown, setAutoEndCountdown] = useState(0);
  const [currentDice, setCurrentDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [turnScore, setTurnScore] = useState(0);
  const [turnScoreDetails, setTurnScoreDetails] = useState([]);
  const [turnPenalties, setTurnPenalties] = useState(0);
  const [turnPenaltyDetails, setTurnPenaltyDetails] = useState([]);
  const [islandOfSkullsPenaltyInfo, setIslandOfSkullsPenaltyInfo] = useState(null); // For IoS penalty details

  // Developer settings state (only used in development)
  const [devNextCardId, setDevNextCardId] = useState(null); // e.g., 'card-5' or null
  const [devNextDiceRoll, setDevNextDiceRoll] = useState(null); // e.g., ['coin', 'skull', null, ...] or null
  const [isDevControlsOpen, setIsDevControlsOpen] = useState(false); // State for DevControls visibility

  // ============================
  // Language and Translation
  // ============================
  
  const { t, isRTL, direction } = useLanguage(language);

  // ============================
  // Effects for Loading Settings
  // ============================

  // Load settings from localStorage on initial mount
  // Use useLayoutEffect to ensure state is set before first render potentially using it
  useLayoutEffect(() => {
    const savedPoints = localStorage.getItem('otzarot_targetPoints');
    if (savedPoints) {
      const points = parseInt(savedPoints, 10);
      if (!isNaN(points)) {
        setPointsToWin(points);
      }
    }

    const savedSounds = localStorage.getItem('otzarot_soundsEnabled');
    if (savedSounds !== null) {
      setPlaySounds(savedSounds === 'true');
    }

    const savedLang = localStorage.getItem('otzarot_language');
     if (savedLang && (savedLang === 'en' || savedLang === 'he')) {
       setLanguage(savedLang);
     }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save language setting whenever it changes
  useEffect(() => {
    localStorage.setItem('otzarot_language', language);
  }, [language]);


  // ============================
  // Refs for Function Callbacks
  // ============================
  
  const calculateScoreRef = useRef();
  const proceedToNextTurnRef = useRef();
  const initNewTurnRef = useRef();
  const endTurnRef = useRef();
  const finalizeIslandOfSkullsTurnRef = useRef(); // Ref for the new function

  // ============================
  // Custom Hooks
  // ============================
  
  // Group state and setters for hooks
  const state = {
    language,
    playerCount,
    showStartForm,
    gameStarted,
    deck,
    players,
    activePlayer,
    gamePhase,
    rollsRemaining,
    isGameOver,
    winner,
    islandOfSkulls,
    islandSkullsCollectedThisTurn, // Pass to hooks
    skullCount,
    skullRerollUsed, // Pass the state value
    turnEndsWithSkulls,
    autoEndCountdown,
    currentDice,
    selectedDice,
    currentCard,
    isCardFlipping,
    isDiceRolling,
    gameLog,
    showShuffleNotification,
    showScoreModal,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,
    islandOfSkullsPenaltyInfo, // Pass to hooks
    pointsToWin,
    playSounds,
    victoryModalVisible,
    t,
    isRTL,
    direction
  };
  
  const setters = {
    setLanguage,
    setPlayerCount,
    setShowStartForm,
    setGameStarted,
    setDeck,
    setPlayers,
    setActivePlayer,
    setGamePhase,
    setRollsRemaining,
    setIsGameOver,
    setWinner,
    setIslandOfSkulls,
    setIslandSkullsCollectedThisTurn, // Pass to hooks
    setSkullCount,
    setSkullRerollUsed, // Pass the original setter
    setTurnEndsWithSkulls,
    setAutoEndCountdown,
    setCurrentDice,
    setSelectedDice,
    setCurrentCard,
    setIsCardFlipping,
    setIsDiceRolling,
    setGameLog,
    setShowShuffleNotification,
    setShowScoreModal,
    setTurnScore,
    setTurnScoreDetails,
    setTurnPenalties,
    setTurnPenaltyDetails,
    setIslandOfSkullsPenaltyInfo, // Pass to hooks
    setPointsToWin,
    setPlaySounds,
    setVictoryModalVisible,
    // Dev setters
    setDevNextCardId,
    setDevNextDiceRoll,
    setIsDevControlsOpen
  };

  const refs = {
    calculateScoreRef,
    proceedToNextTurnRef,
    initNewTurnRef,
    endTurnRef,
    finalizeIslandOfSkullsTurnRef // Pass ref to useTurnManagement
  };

  // Initialize turn management hooks
  const turnManagement = useTurnManagement(state, setters); // turnManagement now returns finalizeIslandOfSkullsTurnRef
  
  // Assign function refs
  calculateScoreRef.current = turnManagement.calculateScoreRef.current;
  proceedToNextTurnRef.current = turnManagement.proceedToNextTurnRef.current;
  initNewTurnRef.current = turnManagement.initNewTurnRef.current;
  endTurnRef.current = turnManagement.endTurnRef.current;
  finalizeIslandOfSkullsTurnRef.current = turnManagement.finalizeIslandOfSkullsTurnRef.current; // Assign the new function
  
  // Add dev state to the main state object passed to hooks
  state.devNextCardId = devNextCardId;
  state.devNextDiceRoll = devNextDiceRoll;

  // Initialize game actions
  const gameActions = useGameActions(state, setters, refs);

  // Initialize game initialization
  const gameInitialization = useGameInitialization(state, setters, refs);

  // ============================
  // Effects
  // ============================

  // Initialize new turn when game starts
  useEffect(() => {
    if (gameStarted && initNewTurnRef.current) {
      initNewTurnRef.current();
    }
  }, [gameStarted]);

  // Auto end turn countdown
  useEffect(() => {
    let countdownTimer;
    if (turnEndsWithSkulls && autoEndCountdown > 0) {
      countdownTimer = setTimeout(() => setAutoEndCountdown((prev) => prev - 1), 1000);
      if (autoEndCountdown === 1 && endTurnRef.current) {
         setTimeout(() => endTurnRef.current(), 1000);
      }
    }
    return () => clearTimeout(countdownTimer);
  }, [turnEndsWithSkulls, autoEndCountdown]);

  // ============================
  // Context Value
  // ============================

  const contextValue = {
    // State
    language,
    playerCount,
    showStartForm,
    gameStarted,
    direction,
    isRTL,
    players,
    activePlayer,
    gamePhase,
    rollsRemaining,
    isGameOver,
    winner,
    islandOfSkulls,
    islandSkullsCollectedThisTurn, // Expose in context value
    skullCount,
    skullRerollUsed, // Expose the state value
    turnEndsWithSkulls,
    autoEndCountdown,
    currentDice,
    selectedDice,
    currentCard,
    isCardFlipping,
    isDiceRolling,
    gameLog,
    showShuffleNotification,
    showScoreModal,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,
    islandOfSkullsPenaltyInfo, // Expose in context
    pointsToWin,
    playSounds,
    victoryModalVisible,
    // Dev state (read-only for consumers, primarily for DevControls UI)
    devNextCardId,
    devNextDiceRoll,
    isDevControlsOpen, // Expose open state

    // Setters
    setPlayerCount,
    setLanguage,
    setPointsToWin,
    setPlaySounds,
    setShowScoreModal,
    setVictoryModalVisible,
    // Dev Setters (for DevControls component and toggle button)
    setDevNextCardId,
    setDevNextDiceRoll,
    setIsDevControlsOpen, // Expose setter

    // Game actions
    drawCard: gameActions.drawCard,
    rollDice: gameActions.rollDice,
    toggleDieSelection: gameActions.toggleDieSelection,
    toggleTreasureChest: gameActions.toggleTreasureChest,
    
    // Turn management
    endTurn: endTurnRef.current,
    calculateScore: calculateScoreRef.current,
    proceedToNextTurn: proceedToNextTurnRef.current,
    finalizeIslandOfSkullsTurn: finalizeIslandOfSkullsTurnRef.current, // Expose to context consumers
    
    // Game initialization
    initializeGame: gameInitialization.initializeGame,
    startGame: gameInitialization.startGame,
    resetGame: gameInitialization.resetGame,

    // Utilities
    renderDieFace,
    t
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
