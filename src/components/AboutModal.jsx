import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const AboutModal = ({ onClose }) => {
  const { t } = useGameContext();
  const version = __APP_VERSION__;

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
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '3px solid #f59e0b',
            width: '90%',
            maxWidth: '500px',
          }}
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ color: '#f59e0b', marginBottom: '15px' }}>
            {t('about')} {t('title')}
          </h2>

          <div style={{ fontSize: '40px', margin: '20px 0' }}>🏴‍☠️ 🎲 💰</div>

          <div style={{ margin: '20px 0', lineHeight: '1.6' }}>
            <p>
              <strong>{t('version')}:</strong> {version}
            </p>
            <a
              href="https://www.shafirgames.com/ourgames/otzarot"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              {t('copyright_game')}
            </a>

            <p>{t('copyright_web')}</p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(to right, #eab308, #f59e0b)',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 25px',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
              marginTop: '20px',
            }}
          >
            {t('close')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
