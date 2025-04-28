import React from 'react';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';
import ShuffleNotification from './ShuffleNotification';
import ScoreModal from './ScoreModal';
import VictoryModal from './VictoryModal';
import soundManager from '../utils/SoundManager';

// Inner component that uses GameContext
const OtzarotGame = ({ onSettings }) => {
  const { showStartForm, direction, t } = useGameContext();

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  const handleSettingsClick = () => {
    if (onSettings) {
      soundManager.play('button');
      onSettings();
    }
  };

  return (
    <div className="game-container" style={containerStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <GameHeader />
        <button
          onClick={handleSettingsClick}
          style={{
            background: 'linear-gradient(to right, #4b5563, #6b7280)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 15px',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
            marginLeft: '10px',
          }}
        >
          ⚙️ {t('settings')}
        </button>
      </div>

      {showStartForm ? (
        <PlayerSetupScreen />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
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
