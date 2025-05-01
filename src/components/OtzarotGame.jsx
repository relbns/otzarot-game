import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';
import ShuffleNotification from './ShuffleNotification';
import ScoreModal from './ScoreModal';
import VictoryModal from './VictoryModal';
import soundManager from '../utils/SoundManager';
import './OtzarotGame.css'; // Import the CSS file

// Inner component that uses GameContext
const OtzarotGame = () => {
  const navigate = useNavigate();
  const { showStartForm, direction, t, isRTL, resetGame } = useGameContext(); // Get isRTL and resetGame

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  const handleSettingsClick = () => {
    soundManager.play('button');
    navigate('/settings');
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
          justifyContent: 'space-between', // Keep space between header and buttons
          alignItems: 'center',
          padding: '10px 15px', // Add some padding
          position: 'relative', // Needed for absolute positioning if header grows
        }}
      >
        {/* Revert GameHeader to original placement */}
        <GameHeader />

        {/* Buttons Container */}
        {/* Apply row-reverse for RTL to make Back button visually first (closer to edge) */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}> {/* Reverted gap and removed flexWrap/justifyContent */}
          {/* Back Button - Conditionally renders the correct back action */}
          {showStartForm ? (
            // Back button for Player Setup Screen (goes to Splash)
            <motion.button
              onClick={handleBackToSplashClick} // Use new handler
              style={backButtonStyle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <><span className="button-text">{t('back')}</span> ←</> : <>← <span className="button-text">{t('back')}</span></>}
            </motion.button>
          ) : (
            // Back button for Game Board Screen (goes back to Setup via reset)
            <motion.button
              onClick={handleBackToSetupClick} // Use existing handler
              style={backButtonStyle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <><span className="button-text">{t('back')}</span> ←</> : <>← <span className="button-text">{t('back')}</span></>}
            </motion.button>
          )}

          {/* Settings Button - Always visible */}
          <motion.button
            onClick={handleSettingsClick}
            style={settingsButtonStyle} // Apply specific grey style
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             ⚙️ <span className="button-text">{t('settings')}</span>
           </motion.button>
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
    </div>
  );
};

export default OtzarotGame;
