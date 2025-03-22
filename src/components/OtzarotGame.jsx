import React from 'react';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';
import ShuffleNotification from './ShuffleNotification';
import ScoreModal from './ScoreModal';

// Inner component that uses GameContext
const OtzarotGame = () => {
  const { showStartForm, direction, gameStarted } = useGameContext();

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  return (
    <div className="game-container" style={containerStyle}>
      <GameHeader />

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
        </div>
      )}
    </div>
  );
};

export default OtzarotGame;
