import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const ScoreBoard = () => {
  const { players, activePlayer, t } = useGameContext();

  return (
    <div
      className="scoreboard"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '10px',
      }}
    >
      {players.map((player, index) => {
        const isActive = index === activePlayer;

        const playerStyle = {
          flex: 1,
          padding: '15px',
          background: isActive
            ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
            : 'linear-gradient(135deg, #334155, #475569)',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: isActive
            ? '0 0 15px rgba(59, 130, 246, 0.5)'
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
            <h3 style={{ margin: '0 0 10px' }}>{player.name}</h3>
            <p
              key={`${player.id}-${player.score}`} // Force re-render of this p element if score changes
              style={{
                fontSize: '24px',
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
  );
};

export default ScoreBoard;
