import React from 'react';
// Remove unused imports: useNavigate, motion, soundManager
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';


const GameHeader = () => {
  // Remove navigate hook and isRTL (no longer needed here)
  const { t } = useGameContext();

  // Remove handleBackClick function

  return (
    // Remove relative positioning from header style if no longer needed
    <header style={styles.header}>
      {/* Remove Back Button */}

      {/* Existing Header Content */}
      <h1 style={styles.headerTitle}>{t('title')}</h1>
      <p style={{ margin: '2px 0 0', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
        {t('subtitle')}
      </p>
      {/* Removed extra closing div */}
    </header>
  );
};

export default GameHeader;
