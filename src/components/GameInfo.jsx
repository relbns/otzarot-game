import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const GameInfo = () => {
  const { 
    players, 
    activePlayer, 
    isGameOver, 
    winner, 
    islandOfSkulls, 
    skullCount, 
    gamePhase, 
    rollsRemaining,
    currentCard, // Added currentCard
    resetGame, 
    t 
  } = useGameContext();

  return (
    <div className="info-and-scores-container" style={{ width: '100%' }}>
      <motion.div
        className="game-info"
        style={{
          ...styles.gameInfo,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
        <h2 style={{ margin: '0 0 2px', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            {t('current_player')}: {players[activePlayer].name}
          </h2>
          <p style={{ margin: '0', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>
            {isGameOver ? (
              <strong>
                {t('game_over')} {winner.name} {t('wins')}!
              </strong>
            ) : islandOfSkulls ? (
              <strong style={{ color: '#ef4444' }}>
                ☠️ {t('in_skull_island')} - {skullCount} {t('skull_count')} ☠️
                <br />
                <span style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.8rem)', fontWeight: 'normal' }}>
                  {t('skull_island_rule')}
                </span>
              </strong>
            ) : (
              `${t('phase')}: ${gamePhase} | ${t(
                'rolls_remaining'
              )}: ${currentCard?.effect === 'storm' && (gamePhase === 'rolling' || gamePhase === 'decision') ? rollsRemaining - 1 : rollsRemaining}`
            )}
          </p>
        </div>
        
        <button
          onClick={resetGame}
          style={{
            ...styles.dangerButton,
            padding: '6px 12px',
            fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
          }}
          title={t('reset_game_tooltip')}
        >
          🔄 {t('reset_game')}
        </button>
      </motion.div>

      {/* Integrated ScoreBoard */}
      <div
        className="scoreboard"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        {players.map((player, index) => {
          const isActive = index === activePlayer;
          
          const playerStyle = {
            flex: 1,
            minWidth: 0,
            padding: '8px',
            background: isActive
              ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
              : 'linear-gradient(135deg, #334155, #475569)',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: isActive
              ? '0 0 10px rgba(59, 130, 246, 0.5)'
              : '0 2px 4px rgba(0, 0, 0, 0.2)',
          };
          
          return (
            <motion.div
              key={player.id}
              style={playerStyle}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 style={{ margin: '0 0 2px', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>{player.name}</h3>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  fontWeight: 'bold',
                  margin: '0',
                  color: player.score >= 8000 ? '#fcd34d' : '#e2e8f0',
                }}
              >
                {player.score} {t('points')}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GameInfo;
