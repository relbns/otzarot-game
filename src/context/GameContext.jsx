import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef
} from 'react';
import { DICE_FACES } from '../constants';
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
  const [skullCount, setSkullCount] = useState(0);
  const [skullRerollUsed, setSkullRerollUsed] = useState(false);
  const [turnEndsWithSkulls, setTurnEndsWithSkulls] = useState(false);
  const [autoEndCountdown, setAutoEndCountdown] = useState(0);
  const [currentDice, setCurrentDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [turnScore, setTurnScore] = useState(0);
  const [turnScoreDetails, setTurnScoreDetails] = useState([]);
  const [turnPenalties, setTurnPenalties] = useState(0);
  const [turnPenaltyDetails, setTurnPenaltyDetails] = useState([]);

  // ============================
  // Language and Translation
  // ============================
  
  const { t, isRTL, direction } = useLanguage(language);

  // ============================
  // Refs for Function Callbacks
  // ============================
  
  const calculateScoreRef = useRef();
  const proceedToNextTurnRef = useRef();
  const initNewTurnRef = useRef();
  const endTurnRef = useRef();

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
    skullCount,
    skullRerollUsed,
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
    setSkullCount,
    setSkullRerollUsed,
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
    setPointsToWin,
    setPlaySounds,
    setVictoryModalVisible
  };
  
  const refs = {
    calculateScoreRef,
    proceedToNextTurnRef,
    initNewTurnRef,
    endTurnRef
  };

  // Initialize turn management hooks
  const turnManagement = useTurnManagement(state, setters);
  
  // Assign function refs
  calculateScoreRef.current = turnManagement.calculateScoreRef.current;
  proceedToNextTurnRef.current = turnManagement.proceedToNextTurnRef.current;
  initNewTurnRef.current = turnManagement.initNewTurnRef.current;
  endTurnRef.current = turnManagement.endTurnRef.current;
  
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
    skullCount,
    skullRerollUsed,
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
    pointsToWin,
    playSounds,
    victoryModalVisible,
    
    // Setters
    setPlayerCount,
    setLanguage,
    setPointsToWin,
    setPlaySounds,
    setShowScoreModal,
    setVictoryModalVisible,
    
    // Game actions
    drawCard: gameActions.drawCard,
    rollDice: gameActions.rollDice,
    toggleDieSelection: gameActions.toggleDieSelection,
    toggleTreasureChest: gameActions.toggleTreasureChest,
    
    // Turn management
    endTurn: endTurnRef.current,
    calculateScore: calculateScoreRef.current,
    proceedToNextTurn: proceedToNextTurnRef.current,
    
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
