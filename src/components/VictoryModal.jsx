import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const VictoryModal = () => {
  const { victoryModalVisible, winner, resetGame, t } = useGameContext();

  if (!victoryModalVisible || !winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '5px solid #f59e0b',
            width: '90%',
            maxWidth: '500px',
          }}
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
        >
          <h2
            style={{ color: '#f59e0b', marginBottom: '15px', fontSize: '2rem' }}
          >
            {t('game_over')}
          </h2>

          <div style={{ fontSize: '50px', margin: '20px 0' }}>🏆</div>

          <h3 style={{ fontSize: '1.8rem', margin: '20px 0' }}>
            {winner.name} {t('wins')}!
          </h3>

          <p style={{ fontSize: '1.4rem', margin: '20px 0' }}>
            {t('with')}{' '}
            <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>
              {winner.score}
            </span>{' '}
            {t('points')}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '30px',
            }}
          >
            <button
              onClick={resetGame}
              style={{
                ...styles.primaryButton,
                padding: '12px 24px',
                fontSize: '1.1rem',
              }}
            >
              {t('reset_game')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VictoryModal;
