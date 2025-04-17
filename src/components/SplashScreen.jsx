import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { styles } from '../constants';
import { useGameContext } from '../context/GameContext';
import InstructionsPage from './InstructionsPage';
import AboutModal from './AboutModal';

const SplashScreen = ({ onStartGame, onSettings }) => {
  const { t } = useGameContext();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  if (showInstructions) {
    return <InstructionsPage onBack={() => setShowInstructions(false)} />;
  }

  return (
    <motion.div
      className="splash-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Game logo/title */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            color: '#f59e0b',
            marginBottom: '10px',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '20px',
          }}
        >
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Pirate themed decoration */}
      <motion.div
        style={{ fontSize: '80px', marginBottom: '40px' }}
        initial={{ rotate: -15, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        🏴‍☠️ 🎲 💰
      </motion.div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <motion.button
          onClick={onStartGame}
          style={{
            ...styles.primaryButton,
            fontSize: '1.2rem',
            padding: '15px 30px',
          }}
          whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.1 }  }}
          transition={{ delay: 0.7 }}
        >
          {t('lets_play')}
        </motion.button>

        <motion.button
          onClick={onSettings}
          style={{
            ...styles.secondaryButton,
            fontSize: '1.1rem',
            padding: '12px 25px',
          }}
          whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.1 }  }}
          transition={{ delay: 0.75 }}
        >
          {t('settings')}
        </motion.button>

        <motion.button
          onClick={() => setShowInstructions(true)}
          style={{
            ...styles.secondaryButton,
            fontSize: '1.1rem',
            padding: '12px 25px',
            background: 'linear-gradient(to right, #0ea5e9, #38bdf8)'
          }}
          whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.1 }  }}
          transition={{ delay: 0.8 }}
        >
          {t('instructions')}
        </motion.button>

        <motion.button
          onClick={() => setShowAbout(true)}
          style={{
            background: 'linear-gradient(to right, #475569, #64748b)',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 25px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            fontSize: '1.1rem',
          }}
          whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.1 }  }}
          transition={{ delay: 0.9 }}
        >
          {t('about')}
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20px',
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.8,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.2 }}
      >
        <p>
          © {new Date().getFullYear()} {t('copyright')}
        </p>
      </motion.div>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </motion.div>
  );
};

export default SplashScreen;
