import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useLayoutEffect
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
  // State Declarations
  // ============================

  // --- Settings ---
  const [language, setLanguage] = useState('he');
  const [playerCount, setPlayerCount] = useState(2);
  const [pointsToWin, setPointsToWin] = useState(8000);
  const [playSounds, setPlaySounds] = useState(true);

  // --- UI State ---
  // Note: Some UI states (like modals, notifications, animations) could potentially
  // be managed locally in relevant components for better separation of concerns.
  const [showStartForm, setShowStartForm] = useState(true);
  const [gameStarted, setGameStarted] = useState(false); // Core game flow state
  const [showShuffleNotification, setShowShuffleNotification] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameLog, setGameLog] = useState([]);

  // --- Core Game State ---
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

  // --- Turn-Specific State ---
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

  // --- Developer Settings State ---
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

  // ============================
  // Custom Hooks Setup
  // ============================

  // --- State & Setters Aggregation for Hooks ---
  // Note: Passing the entire state/setters objects couples hooks tightly.
  // Consider refactoring hooks to accept only the specific state/setters they need.
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
    endTurnRef
  };

  // Initialize turn management hooks
  const turnManagement = useTurnManagement(state, setters);
  
  // Assign function refs
  calculateScoreRef.current = turnManagement.calculateScoreRef.current;
  proceedToNextTurnRef.current = turnManagement.proceedToNextTurnRef.current;
  initNewTurnRef.current = turnManagement.initNewTurnRef.current;
  endTurnRef.current = turnManagement.endTurnRef.current;
  
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
    // ================== Game State ==================
    gameStarted,
    players,
    activePlayer,
    gamePhase,
    rollsRemaining,
    isGameOver,
    winner,
    deck, // Added deck state for completeness, though not previously exposed
    currentCard,
    currentDice,
    selectedDice,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,
    islandOfSkulls,
    skullCount,
    skullRerollUsed,
    turnEndsWithSkulls,

    // ================== UI State ==================
    showStartForm,
    isCardFlipping,
    isDiceRolling,
    gameLog,
    showShuffleNotification,
    showScoreModal,
    victoryModalVisible,
    autoEndCountdown, // Related to UI feedback during skull end turn

    // ================== Settings ==================
    language,
    playerCount,
    pointsToWin,
    playSounds,

    // ================== Language/Text ==================
    direction,
    isRTL,
    t, // Translation function

    // ================== Developer State ==================
    devNextCardId,
    devNextDiceRoll,
    isDevControlsOpen,

    // ================== Setters ==================
    // Settings Setters
    setPlayerCount,
    setLanguage,
    setPointsToWin,
    setPlaySounds,
    // UI Setters
    setShowScoreModal,
    setVictoryModalVisible,
    // Dev Setters
    setDevNextCardId,
    setDevNextDiceRoll,
    setIsDevControlsOpen,

    // ================== Game Actions ==================
    drawCard: gameActions.drawCard,
    rollDice: gameActions.rollDice,
    toggleDieSelection: gameActions.toggleDieSelection,
    toggleTreasureChest: gameActions.toggleTreasureChest,

    // ================== Turn Management ==================
    endTurn: endTurnRef.current,
    calculateScore: calculateScoreRef.current, // Re-added: Needed by components for score calculation/display logic
    proceedToNextTurn: proceedToNextTurnRef.current, // Re-added: Needed by components to advance the turn

    // ================== Game Lifecycle ==================
    initializeGame: gameInitialization.initializeGame,
    startGame: gameInitialization.startGame,
    resetGame: gameInitialization.resetGame,

    // ================== Utilities ==================
    renderDieFace,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
