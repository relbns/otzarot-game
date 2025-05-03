import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';
import ShuffleNotification from './ShuffleNotification';
import ScoreModal from './ScoreModal';
import VictoryModal from './VictoryModal';
import DevControls from './DevControls';
import soundManager from '../utils/SoundManager';
import './OtzarotGame.css';

// Inner component that uses GameContext
const OtzarotGame = () => {
  const navigate = useNavigate();
  const {
    showStartForm,
    direction,
    t,
    isRTL,
    resetGame,
    isDevControlsOpen,
    setIsDevControlsOpen
  } = useGameContext();

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  const handleSettingsClick = () => {
    soundManager.play('button');
    navigate('/settings');
  };

  // Toggle Dev Controls panel
  const handleToggleDevControls = () => {
    soundManager.play('button'); // Optional sound
    setIsDevControlsOpen(prev => !prev); // Toggle the state
  };

  const handleBackToSetupClick = () => {
    soundManager.play('button');
    resetGame(); // Call resetGame to go back to setup (Used when game is active)
  };

  // New handler for navigating back from PlayerSetupScreen to Splash
  const handleBackToSplashClick = () => {
    soundManager.play('button');
    navigate('/'); // Navigate to the splash screen route
  };

  // Define specific styles for each button
  const commonButtonStyle = { // Base styles for both
    border: 'none',
    borderRadius: '6px',
    padding: '8px 15px',
    color: 'white',
    cursor: 'pointer',
    fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const settingsButtonStyle = {
    ...commonButtonStyle,
    background: 'linear-gradient(to right, #4b5563, #6b7280)', // Original grey gradient
  };

  const backButtonStyle = {
    ...commonButtonStyle, // Base styles first
    ...styles.secondaryButton, // Apply orange style from constants
  };


  return (
    <div className="game-container" style={containerStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          position: 'relative',
        }}
      >
        <GameHeader />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {showStartForm ? (
            <motion.button
              onClick={handleBackToSplashClick}
              style={backButtonStyle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <><span className="button-text">{t('back')}</span> ←</> : <>← <span className="button-text">{t('back')}</span></>}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleBackToSetupClick}
              style={backButtonStyle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <><span className="button-text">{t('back')}</span> ←</> : <>← <span className="button-text">{t('back')}</span></>}
            </motion.button>
          )}

          <motion.button
            onClick={handleSettingsClick}
            style={settingsButtonStyle}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             ⚙️ <span className="button-text">{t('settings')}</span>
           </motion.button>

           {/* Dev Controls Toggle Button */}
           {process.env.NODE_ENV === 'development' && (
             <motion.button
               onClick={handleToggleDevControls} // Use toggle handler
               style={{
                 ...commonButtonStyle,
                 background: isDevControlsOpen
                   ? 'linear-gradient(to right, #ef4444, #f87171)' // Red when open
                   : 'linear-gradient(to right, #f59e0b, #fbbf24)', // Orange when closed
                 color: isDevControlsOpen ? 'white' : '#1e3a8a'
               }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               🛠️ <span className="button-text">Dev</span>
             </motion.button>
           )}
         </div>
      </div>

      {showStartForm ? (
        <PlayerSetupScreen />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            // Adjust height calculation if header padding changed significantly
            height: `calc(100vh - ${styles.header.height || '60px'} - 20px)`, // Approximate height adjustment
            overflow: 'hidden',
          }}
        >
          <GameBoard />
          {/* Overlay notifications and modals */}
          <ShuffleNotification />
          <ScoreModal />
          <VictoryModal />
        </div>
      )}
      {/* Render DevControls conditionally based on context state */}
      <DevControls />
    </div>
  );
};

export default OtzarotGame;
