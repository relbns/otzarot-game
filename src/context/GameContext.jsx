import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef, // Import useRef
} from 'react';
import { DICE_FACES, CARDS, translations } from '../constants';
import soundManager from '../utils/SoundManager';

// Create context
export const GameContext = createContext();

// Custom hook for using the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
  // ============================
  // State Management
  // ============================

  const [language, setLanguage] = useState('he');
  const [playerCount, setPlayerCount] = useState(2);
  const [showStartForm, setShowStartForm] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
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
  const [islandOfSkulls, setIslandOfSkulls] = useState(false);
  const [skullCount, setSkullCount] = useState(0);
  const [skullRerollUsed, setSkullRerollUsed] = useState(false);
  const [turnEndsWithSkulls, setTurnEndsWithSkulls] = useState(false);
  const [autoEndCountdown, setAutoEndCountdown] = useState(0);
  const [currentDice, setCurrentDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [showShuffleNotification, setShowShuffleNotification] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [turnScore, setTurnScore] = useState(0);
  const [turnScoreDetails, setTurnScoreDetails] = useState([]);
  const [turnPenalties, setTurnPenalties] = useState(0);
  const [turnPenaltyDetails, setTurnPenaltyDetails] = useState([]);
  const [pointsToWin, setPointsToWin] = useState(8000);
  const [playSounds, setPlaySounds] = useState(true);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);

  const isRTL = language === 'he';
  const direction = isRTL ? 'rtl' : 'ltr';
  const t = useCallback((key) => translations[language][key] || key, [language]); // Memoize t function

  // Refs for functions to handle potential stale closures in callbacks/effects
  const calculateScoreRef = useRef();
  const proceedToNextTurnRef = useRef();
  const initNewTurnRef = useRef();
  const endTurnRef = useRef();

  // ============================
  // Effects
  // ============================

  useEffect(() => {
    const savedPoints = localStorage.getItem('otzarot_targetPoints');
    if (savedPoints) setPointsToWin(parseInt(savedPoints));
    const savedSounds = localStorage.getItem('otzarot_soundsEnabled');
    if (savedSounds !== null) setPlaySounds(savedSounds === 'true');
  }, []);

  useEffect(() => {
    if (gameStarted && initNewTurnRef.current) {
      initNewTurnRef.current();
    }
  }, [gameStarted]);

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

  useEffect(() => {
    soundManager.setEnabled(playSounds);
  }, [playSounds]);

  // ============================
  // Game Logic Helpers
  // ============================

  const getRandomFace = useCallback(() => {
    const playableFaces = DICE_FACES.filter((face) => face !== 'blank');
    return playableFaces[Math.floor(Math.random() * playableFaces.length)];
  }, []);

  const addToLog = useCallback((message) => {
    setGameLog((prevLog) => [message, ...prevLog]);
  }, []);

  initNewTurnRef.current = useCallback(() => {
    const newDice = Array(8).fill(null).map((_, index) => ({
      id: index, face: 'blank', selected: false, locked: false, inTreasureChest: false,
    }));
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
    if (players[activePlayer]) {
       addToLog(`${players[activePlayer].name}'s turn`);
    }
  }, [players, activePlayer, addToLog]);

  const renderDieFace = useCallback((face) => {
    const faceSymbols = { coin: '🪙', diamond: '💎', swords: '⚔️', monkey: '🐒', parrot: '🦜', skull: '💀', blank: '' };
    return faceSymbols[face] || face;
  }, []);

  const calculateSetValue = useCallback((count) => {
    switch (count) {
      case 3: return 100; case 4: return 200; case 5: return 500;
      case 6: return 1000; case 7: return 2000; case 8: return 4000;
      default: return 0;
    }
  }, []);

  const calculateBaseScore = useCallback((diceCounts, scoreDescription) => {
    let totalScore = 0;
    Object.entries(diceCounts).forEach(([face, count]) => {
      if (count >= 3 && face !== 'skull') {
        const setScore = calculateSetValue(count);
        totalScore += setScore;
        scoreDescription.push(`${count} ${t(face)}s (set): ${setScore} ${t('points')}`);
      }
    });
    if (diceCounts.coin > 0) {
      const coinScore = diceCounts.coin * 100;
      totalScore += coinScore;
      scoreDescription.push(`${diceCounts.coin} ${t('coin')}s (individual): ${coinScore} ${t('points')}`);
    }
    if (diceCounts.diamond > 0) {
      const diamondScore = diceCounts.diamond * 100;
      totalScore += diamondScore;
      scoreDescription.push(`${diceCounts.diamond} ${t('diamond')}s (individual): ${diamondScore} ${t('points')}`);
    }
    return totalScore;
  }, [calculateSetValue, t]);

  // ============================
  // Game Actions
  // ============================

  const handleInitialCardEffects = useCallback((card) => {
    if (!card) return;
    let newDice = [...currentDice];
    let modifiedDice = false;

    switch (card.effect) {
      case 'start_with_gold':
        for (let i = 0; i < newDice.length; i++) if (newDice[i].face === 'blank') { newDice[i] = { ...newDice[i], face: 'coin', locked: false, lockedByCard: true }; modifiedDice = true; break; }
        addToLog(`${players[activePlayer].name} ${t('start_with_gold')}`);
        break;
      case 'start_with_diamond':
        for (let i = 0; i < newDice.length; i++) if (newDice[i].face === 'blank') { newDice[i] = { ...newDice[i], face: 'diamond', locked: false, lockedByCard: true }; modifiedDice = true; break; }
        addToLog(`${players[activePlayer].name} ${t('start_with_diamond')}`);
        break;
      case 'start_with_1_skull':
        for (let i = 0; i < newDice.length; i++) if (newDice[i].face === 'blank') { newDice[i] = { ...newDice[i], face: 'skull', locked: true }; modifiedDice = true; break; }
        setSkullCount((prev) => prev + 1);
        addToLog(`${players[activePlayer].name} ${t('start_with_1_skull')}`);
        break;
      case 'start_with_2_skulls':
        let skullsAdded = 0;
        for (let i = 0; i < newDice.length && skullsAdded < 2; i++) if (newDice[i].face === 'blank') { newDice[i] = { ...newDice[i], face: 'skull', locked: true }; skullsAdded++; modifiedDice = true; }
        setSkullCount((prev) => prev + skullsAdded);
        addToLog(`${players[activePlayer].name} ${t('start_with_2_skulls')}`);
        break;
      default: break;
    }

    setCurrentDice(newDice);

    if (modifiedDice) {
      setTimeout(() => {
        let rolledDice = newDice.map(die => (die.face === 'blank' && !die.locked) ? { ...die, face: getRandomFace() } : die);
        const currentSkulls = rolledDice.filter(d => d.face === 'skull').length;
        setSkullCount(currentSkulls);

        if (currentSkulls >= 3) {
          rolledDice = rolledDice.map(die => die.face === 'skull' ? { ...die, locked: true } : die);
          setTurnEndsWithSkulls(true);
          setAutoEndCountdown(5);
          addToLog(`${players[activePlayer].name} ${t('rolled')} ${currentSkulls} ${t('skulls')} ${t('from_card')}! ${t('turn_ends')}.`);
          setGamePhase('resolution');
          if (calculateScoreRef.current) calculateScoreRef.current();
        } else {
          setGamePhase('decision');
        }
        setCurrentDice(rolledDice);
        setRollsRemaining(prev => prev - 1);
      }, 800);
    } else {
      setGamePhase('rolling');
    }
  }, [currentDice, players, activePlayer, t, addToLog, getRandomFace, setSkullCount, setCurrentDice, setGamePhase, setRollsRemaining, setTurnEndsWithSkulls, setAutoEndCountdown]);

  const drawCardFromDeck = useCallback((currentDeck) => {
    if (currentDeck && currentDeck.length > 0) {
      const drawnCard = currentDeck[0];
      const updatedDeck = currentDeck.slice(1);
      setDeck(updatedDeck);
      setCurrentCard(drawnCard);
      if (playSounds) soundManager.play('cardDraw');
      const cardName = language === 'he' ? drawnCard.hebrewName : drawnCard.name;
      const cardDesc = language === 'he' ? drawnCard.hebrewDescription : drawnCard.description;
      addToLog(`${players[activePlayer].name} ${t('draw_card')}: ${cardName} - ${cardDesc}`);
      handleInitialCardEffects(drawnCard);
    } else {
      console.error('Failed to draw card from deck');
      setGamePhase('rolling');
    }
    setIsCardFlipping(false);
  }, [language, players, activePlayer, addToLog, t, playSounds, handleInitialCardEffects, setDeck, setCurrentCard, setGamePhase, setIsCardFlipping]);

  const drawCard = useCallback(() => {
    if (gamePhase !== 'drawing') return;
    setIsCardFlipping(true);
    let currentDeck = deck;
    if (!currentDeck || currentDeck.length === 0) {
      setShowShuffleNotification(true);
      let newDeck = [];
      CARDS.forEach(card => { for (let i = 0; i < (card.timesShown || 1); i++) newDeck.push({ ...card }); });
      for (let i = newDeck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]; }
      currentDeck = newDeck;
      setDeck(newDeck);
      addToLog(t('deck_shuffled'));
      setTimeout(() => { setShowShuffleNotification(false); setTimeout(() => drawCardFromDeck(currentDeck), 600); }, 1500);
    } else {
      setTimeout(() => drawCardFromDeck(currentDeck), 600);
    }
  }, [gamePhase, deck, addToLog, t, drawCardFromDeck]);

  calculateScoreRef.current = useCallback(() => {
    const combinedCounts = {}; DICE_FACES.forEach(face => combinedCounts[face] = 0);
    currentDice.forEach(die => { if (die.face !== 'blank') combinedCounts[die.face]++; });

    let score = 0; let scoreDescription = []; let penalties = 0; let penaltyDescription = [];
    const isDisqualified = combinedCounts.skull >= 3;

    if (islandOfSkulls) {
      score = 0; scoreDescription.push(t('island_of_skulls_no_score'));
    } else if (isDisqualified) {
      addToLog(`${players[activePlayer].name} ${t('disqualified_log')} ${combinedCounts.skull} ${t('skull_count')}!`);
      score = 0;
      if (currentCard?.effect === 'store_dice') {
        const chestCounts = {}; DICE_FACES.forEach(f => chestCounts[f] = 0);
        currentDice.forEach(d => { if (d.inTreasureChest) chestCounts[d.face]++; });
        if (Object.values(chestCounts).some(c => c > 0)) {
          scoreDescription.push(t('treasure_chest_saved_log'));
          score = calculateBaseScore(chestCounts, scoreDescription);
        } else { scoreDescription.push(t('disqualified_no_points')); }
      } else { scoreDescription.push(t('disqualified_no_points')); }
      if (currentCard?.effect === 'truce' && combinedCounts.swords > 0) {
        penalties += combinedCounts.swords * 500;
        penaltyDescription.push(`${t('truce_penalty_log')} (${combinedCounts.swords} ${t('swords')}): -${combinedCounts.swords * 500} ${t('points')}`);
      }
    } else { // Normal Scoring
      const cardEffect = currentCard?.effect; let tempCounts = { ...combinedCounts };
      if (cardEffect) { // Check if there is a card effect
        switch (cardEffect) {
          case 'double_score': score = calculateBaseScore(tempCounts, scoreDescription) * 2; scoreDescription.push(`${t('captain_effect')}: ${t('score_doubled')}`); break;
          case 'store_dice': score = calculateBaseScore(tempCounts, scoreDescription); break;
          case 'monkey_business':
            const mpCount = tempCounts.monkey + tempCounts.parrot; let mpScore = 0;
            if (mpCount >= 3) { mpScore = calculateSetValue(mpCount); scoreDescription.push(`${mpCount} ${t('monkey')}/${t('parrot')} (set): ${mpScore} ${t('points')}`); }
            score += mpScore; tempCounts.monkey = 0; tempCounts.parrot = 0;
            score += calculateBaseScore(tempCounts, scoreDescription); break;
          case 'storm':
            if (tempCounts.coin > 0) { score += tempCounts.coin * 200; scoreDescription.push(`${tempCounts.coin} ${t('coin')}s (${t('doubled')}): ${tempCounts.coin * 200} ${t('points')}`); }
            if (tempCounts.diamond > 0) { score += tempCounts.diamond * 200; scoreDescription.push(`${tempCounts.diamond} ${t('diamond')}s (${t('doubled')}): ${tempCounts.diamond * 200} ${t('points')}`); } break;
          case 'sea_battle_2': case 'sea_battle_3': case 'sea_battle_4':
            const reqSwords = parseInt(cardEffect.slice(-1)); const bonus = currentCard.bonus || 0;
            if (tempCounts.swords >= reqSwords) { score = bonus; scoreDescription.push(`${t('sea_battle_success')} (${reqSwords} ${t('swords')}): ${bonus} ${t('points')}`); }
            else { score = 0; penalties = bonus; penaltyDescription.push(`${t('sea_battle_fail')} (${t('needed')} ${reqSwords}, ${t('got')} ${tempCounts.swords}): -${bonus} ${t('points')}`); } break;
          case 'truce': tempCounts.swords = 0; score = calculateBaseScore(tempCounts, scoreDescription); scoreDescription.push(`${t('truce_effect')}: ${t('swords_no_score')}`); break;
          case 'midas_touch':
            let midasScore = 0; if (tempCounts.coin > 0) { midasScore += tempCounts.coin * 200; scoreDescription.push(`${tempCounts.coin} ${t('coin')}s (${t('doubled')}): ${tempCounts.coin * 200} ${t('points')}`); }
            tempCounts.coin = 0; midasScore += calculateBaseScore(tempCounts, scoreDescription); score = midasScore; break;
          case 'diamond_mine':
            let dmScore = 0; if (tempCounts.diamond > 0) { dmScore += tempCounts.diamond * 300; scoreDescription.push(`${tempCounts.diamond} ${t('diamond')}s (${t('tripled')}): ${tempCounts.diamond * 300} ${t('points')}`); }
            tempCounts.diamond = 0; dmScore += calculateBaseScore(tempCounts, scoreDescription); score = dmScore; break;
          case 'zombie_attack':
            if (tempCounts.swords >= 5) { score = 1200; scoreDescription.push(`${t('zombie_attack_victory')} (${tempCounts.swords} ${t('swords')}): 1200 ${t('points')}`); }
            else { score = 0; const oppCount = players.length - 1; if (oppCount > 0) { const ptsPerOpp = Math.floor(1200 / oppCount); penaltyDescription.push(`${t('zombie_attack_failed')}: ${t('opponents_share_points')}`); const updatedPs = players.map((p, i) => i !== activePlayer ? { ...p, score: p.score + ptsPerOpp } : p); setPlayers(updatedPs); addToLog(`${t('zombie_attack_failed')}! ${t('each_opponent_gains')} ${ptsPerOpp} ${t('points')}.`); } } break;
          default: score = calculateBaseScore(tempCounts, scoreDescription); break;
        }
      } else { // No card drawn
        score = calculateBaseScore(combinedCounts, scoreDescription);
      }
    } // End Normal Scoring

    // Full Chest Bonus
    let finalScoringDiceCount = 0;
    const canApplyFullChest = !isDisqualified && !islandOfSkulls && !['sea_battle_2', 'sea_battle_3', 'sea_battle_4', 'zombie_attack'].includes(currentCard?.effect);
    if (canApplyFullChest) {
      let contributingCounts = { ...combinedCounts };
      if (currentCard?.effect === 'storm') contributingCounts = { coin: combinedCounts.coin, diamond: combinedCounts.diamond };
      else if (currentCard?.effect === 'truce') contributingCounts.swords = 0;
      finalScoringDiceCount = Object.entries(contributingCounts).reduce((acc, [f, c]) => (f !== 'skull' && c > 0) ? acc + c : acc, 0);
      if (finalScoringDiceCount === 8) { score += 500; scoreDescription.push(`${t('full_chest_bonus')}: 500 ${t('points')}`); }
    }

    // Final Score and State Updates
    const finalScore = Math.max(0, score - penalties);
    if (!islandOfSkulls) {
      const updatedPlayers = players.map((p, i) => i === activePlayer ? { ...p, score: p.score + finalScore } : p);
      setPlayers(updatedPlayers);
    }

    setTurnScore(score); setTurnScoreDetails(scoreDescription); setTurnPenalties(penalties); setTurnPenaltyDetails(penaltyDescription);
    setShowScoreModal(true);

    // Logging
    if (score > 0 && !islandOfSkulls) { addToLog(`${players[activePlayer].name} ${t('scored')} ${score} ${t('points')}!`); scoreDescription.forEach(desc => addToLog(`- ${desc}`)); }
    else if (islandOfSkulls) { addToLog(`${players[activePlayer].name} ${t('island_of_skulls_log')}`); }
    else if (isDisqualified && score > 0) { addToLog(`${players[activePlayer].name} ${t('disqualified_but_saved')} ${score} ${t('points')} ${t('with_treasure_chest')}!`); scoreDescription.forEach(desc => addToLog(`- ${desc}`)); }
    else if (isDisqualified) { addToLog(`${players[activePlayer].name} ${t('disqualified_log')} ${combinedCounts.skull} ${t('skull_count')} ${t('and_scored_zero')}.`); }
    else if (score === 0 && penalties === 0) { addToLog(`${players[activePlayer].name} ${t('ended_turn_no_score')}.`); }
    if (penalties > 0) { addToLog(`${players[activePlayer].name} ${t('has_penalties')}: -${penalties} ${t('points')}`); penaltyDescription.forEach(desc => addToLog(`- ${desc}`)); }
    if (penalties > 0 || (score > 0 && !islandOfSkulls)) { addToLog(`${t('final_score_log')}: ${finalScore} ${t('points')}`); }

    // Check Game Over
    const currentPlayer = players.find(p => p.id === players[activePlayer].id);
    // Use the score from the *updated* players array for the check
    const currentPlayerState = players.map((p, i) => i === activePlayer ? { ...p, score: p.score + finalScore } : p)[activePlayer];
    const currentPlayerNewScore = currentPlayerState?.score || 0;

    if (!islandOfSkulls && currentPlayerNewScore >= pointsToWin) {
      if (!isGameOver) {
        setIsGameOver(true); setWinner(currentPlayerState); // Use updated player state
        addToLog(`${currentPlayerState.name} ${t('crossed_finish_line')} ${pointsToWin} ${t('points')}! ${t('final_round_begins')}`);
      } else {
        // Use updated score for comparison
        if (winner && currentPlayerNewScore > winner.score) setWinner(currentPlayerState);
      }
    }
  }, [currentDice, currentCard, players, activePlayer, islandOfSkulls, calculateBaseScore, calculateSetValue, addToLog, t, language, setTurnScore, setTurnScoreDetails, setTurnPenalties, setTurnPenaltyDetails, setShowScoreModal, setPlayers, setIsGameOver, setWinner, pointsToWin, isGameOver, winner]); // Added missing dependencies

  const rollDice = useCallback(() => {
    if (!['rolling', 'decision'].includes(gamePhase)) return;
    if (rollsRemaining <= 0 && !islandOfSkulls) return;
    if (currentCard?.effect === 'storm' && rollsRemaining <= 1) { addToLog(`${players[activePlayer].name} ${t('storm_max_rolls')}`); return; }

    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    const isSorceressRerollAttempt = selectedDice.length === 1 && currentDice[selectedDice[0]]?.face === 'skull';

    if (gamePhase === 'decision' && !islandOfSkulls && selectedDice.length < 2 && !(isSorceressAvailable && isSorceressRerollAttempt)) {
      addToLog(`${players[activePlayer].name} ${t('min_2_dice_reroll')}`); return;
    }

    setIsDiceRolling(true); if (playSounds) soundManager.play('diceRoll');

    setTimeout(() => {
      let diceToRollIndexes = [];
      if (gamePhase === 'rolling') diceToRollIndexes = currentDice.map((_, i) => i);
      else if (islandOfSkulls) diceToRollIndexes = currentDice.reduce((acc, d, i) => (d.face !== 'skull' && !d.locked) ? [...acc, i] : acc, []);
      else diceToRollIndexes = selectedDice;

      let sorceressUsedThisRoll = false;
      if (isSorceressAvailable && isSorceressRerollAttempt && gamePhase === 'decision') {
        diceToRollIndexes = selectedDice; setSkullRerollUsed(true); sorceressUsedThisRoll = true;
        addToLog(`${players[activePlayer].name} ${t('sorceress_used')}`);
      }

      const newDice = currentDice.map((die, i) => (diceToRollIndexes.includes(i) && !die.locked && !die.inTreasureChest) ? { ...die, face: getRandomFace(), selected: false } : die);
      setCurrentDice(newDice); setSelectedDice([]);
      const currentSkulls = newDice.filter(d => d.face === 'skull').length; setSkullCount(currentSkulls);

      if (islandOfSkulls) {
        const newlyRolledSkulls = newDice.filter((d, i) => diceToRollIndexes.includes(i) && d.face === 'skull').length;
        if (newlyRolledSkulls === 0) {
          addToLog(`${players[activePlayer].name} ${t('no_skulls_in_island')}. ${t('turn_ends')}.`);
          setGamePhase('resolution'); if (calculateScoreRef.current) calculateScoreRef.current();
        } else {
          addToLog(`${players[activePlayer].name} ${t('rolled')} ${newlyRolledSkulls} ${t('new_skulls_on_island')}.`);
          const lockedSkullDice = newDice.map(d => d.face === 'skull' ? { ...d, locked: true } : d); setCurrentDice(lockedSkullDice);
          const penaltyMult = currentCard?.effect === 'double_score' ? 200 : 100; const penaltyPts = newlyRolledSkulls * penaltyMult;
          const updatedPs = players.map((p, i) => i !== activePlayer ? { ...p, score: Math.max(0, p.score - penaltyPts) } : p); setPlayers(updatedPs);
          const oppNames = players.filter((_, i) => i !== activePlayer).map(p => p.name).join(', '); const penaltyMsg = penaltyMult === 200 ? t('captain_doubles_penalty') : '';
          addToLog(`${oppNames} ${t('lose')} ${penaltyPts} ${t('points')} ${penaltyMsg}`);
          setGamePhase('decision');
        }
      } else if (gamePhase === 'rolling' && currentSkulls >= 4) {
        setIslandOfSkulls(true); const lockedDice = newDice.map(d => d.face !== 'skull' ? { ...d, locked: true } : d); setCurrentDice(lockedDice);
        addToLog(`${players[activePlayer].name} ${t('rolled')} ${currentSkulls} ${t('skulls')}! ${t('enters_island_of_skulls')}`); setGamePhase('decision');
      } else if (currentSkulls >= 3) {
        const lockedDice = newDice.map(d => d.face === 'skull' ? { ...d, locked: true } : d); setCurrentDice(lockedDice); setTurnEndsWithSkulls(true);
        addToLog(`${players[activePlayer].name} ${t('rolled')} ${currentSkulls} ${t('skulls')}! ${t('turn_ends')}.`); setGamePhase('resolution'); if (calculateScoreRef.current) calculateScoreRef.current();
      } else {
        if (gamePhase === 'rolling') addToLog(`${players[activePlayer].name} ${t('roll_dice')}.`);
        else if (!sorceressUsedThisRoll) addToLog(`${players[activePlayer].name} ${t('reroll_selected')}.`);
        setRollsRemaining(prev => prev - 1); setGamePhase('decision');
        if (rollsRemaining === 1) addToLog(`${players[activePlayer].name} ${t('last_roll_log')}`);
      }
      setIsDiceRolling(false);
    }, 800);
  }, [gamePhase, rollsRemaining, islandOfSkulls, currentDice, selectedDice, players, activePlayer, currentCard, skullRerollUsed, playSounds, addToLog, getRandomFace, t, setSkullCount, setTurnEndsWithSkulls, setGamePhase, setRollsRemaining, setIslandOfSkulls, setSkullRerollUsed, setIsDiceRolling, setSelectedDice, setPlayers]); // Added missing dependencies

  const toggleDieSelection = useCallback((index) => {
    if (isDiceRolling || gamePhase !== 'decision') return;
    const die = currentDice[index];
    if ((die.locked && die.face !== 'skull') || die.inTreasureChest) return;

    const isSorceressAvailable = currentCard?.effect === 'reroll_skull' && !skullRerollUsed;
    if (die.face === 'skull') {
      if (isSorceressAvailable) setSelectedDice(prev => prev.includes(index) ? [] : [index]);
      return;
    }
    setSelectedDice(prev => prev.includes(index) ? prev.filter(i => i !== index) : (isSorceressAvailable && prev.some(i => currentDice[i].face === 'skull')) ? [index] : [...prev, index]);
  }, [isDiceRolling, gamePhase, currentDice, currentCard, skullRerollUsed, setSelectedDice]);

  const toggleTreasureChest = useCallback((dieIndex) => {
    if (!currentCard || currentCard.effect !== 'store_dice' || gamePhase !== 'decision' || currentDice[dieIndex].face === 'skull' || isDiceRolling) return;
    const die = currentDice[dieIndex];
    setCurrentDice(prev => prev.map((d, i) => i === dieIndex ? { ...d, inTreasureChest: !d.inTreasureChest, locked: !d.inTreasureChest, selected: false } : d));
    setSelectedDice(prev => prev.filter(idx => idx !== dieIndex));
    addToLog(`${players[activePlayer].name} ${die.inTreasureChest ? t('removed_from_chest') : t('placed_in_chest')} ${t(die.face)}`);
  }, [currentCard, gamePhase, currentDice, isDiceRolling, players, activePlayer, addToLog, t, setCurrentDice, setSelectedDice]);

  endTurnRef.current = useCallback(() => {
    if (gamePhase === 'decision' || gamePhase === 'rolling') {
      if (calculateScoreRef.current) calculateScoreRef.current();
    } else if (showScoreModal) {
      setShowScoreModal(false); // Closing modal will trigger proceedToNextTurn via Modal component
    } else {
       if (proceedToNextTurnRef.current) proceedToNextTurnRef.current();
    }
  }, [gamePhase, showScoreModal, setShowScoreModal]);

  proceedToNextTurnRef.current = useCallback(() => {
    if (playSounds) soundManager.play('turnEnd');
    const gameShouldEnd = isGameOver && activePlayer === players.length - 1;

    if (gameShouldEnd) {
      // Use the winner state which should have been updated by calculateScore
      const finalWinner = winner || players.reduce((highest, current) => (current.score > highest.score ? current : highest), players[0]);
      setWinner(finalWinner); // Ensure winner state is correct if needed
      addToLog(`${t('game_over')}! ${finalWinner.name} ${t('wins')} ${t('with')} ${finalWinner.score} ${t('points')}!`);
      setVictoryModalVisible(true);
      if (playSounds) soundManager.play('victory');
      return;
    }

    const nextPlayerIndex = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayerIndex);
    if (initNewTurnRef.current) initNewTurnRef.current();
  }, [players, activePlayer, isGameOver, winner, playSounds, t, addToLog, setWinner, setVictoryModalVisible, setActivePlayer]); // Added winner dependency

  // ============================
  // Game Initialization
  // ============================

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
    
    setPlayers(newPlayers);
    setActivePlayer(0);
    setGamePhase('waiting');
    setIsGameOver(false);
    setWinner(null);
    setGameLog([t('welcome')]);
    setShowStartForm(false);
    setGameStarted(true); // Set gameStarted to true so the GameBoard will render
    
    // Initialize deck
    let newDeck = [];
    CARDS.forEach(card => {
      for (let i = 0; i < (card.timesShown || 1); i++) {
        newDeck.push({ ...card });
      }
    });
    
    // Shuffle deck using Fisher-Yates algorithm
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    setDeck(newDeck);
  }, [playerCount, language, t, setLanguage, setPlayers, setActivePlayer, setGamePhase, setIsGameOver, setWinner, setGameLog, setShowStartForm, setDeck]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    if (playSounds) soundManager.play('gameStart');
    addToLog(t('lets_play'));
    // Initialize a new turn when the game starts
    if (initNewTurnRef.current) {
      initNewTurnRef.current();
    }
  }, [setGameStarted, playSounds, addToLog, t]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setShowStartForm(true);
    setGameLog([]);
    setIsGameOver(false);
    setWinner(null);
    setVictoryModalVisible(false);
    if (playSounds) soundManager.play('reset');
  }, [setGameStarted, setShowStartForm, setGameLog, setIsGameOver, setWinner, setVictoryModalVisible, playSounds]);

  // ============================
  // Context Value
  // ============================

  const contextValue = {
    language, playerCount, showStartForm, gameStarted, direction, isRTL,
    players, activePlayer,
    gamePhase, rollsRemaining, isGameOver, winner,
    islandOfSkulls, skullCount, skullRerollUsed, turnEndsWithSkulls, autoEndCountdown,
    currentDice, selectedDice, currentCard,
    isCardFlipping, isDiceRolling, gameLog, showShuffleNotification,
    showScoreModal, turnScore, turnScoreDetails, turnPenalties, turnPenaltyDetails,
    pointsToWin, setPointsToWin, playSounds, setPlaySounds, victoryModalVisible, setVictoryModalVisible,
    setPlayerCount, setLanguage, initializeGame, startGame, resetGame,
    drawCard, rollDice, toggleDieSelection, endTurn: endTurnRef.current, renderDieFace,
    calculateScore: calculateScoreRef.current, toggleTreasureChest, t,
    proceedToNextTurn: proceedToNextTurnRef.current,
    setShowScoreModal,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};
