import React from 'react';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const GameHeader = () => {
  const { t } = useGameContext();

  return (
    <header style={styles.header}>
      <h1 style={styles.headerTitle}>{t('title')}</h1>
      <p style={{ margin: '2px 0 0', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
        {t('subtitle')}
      </p>
    </header>
  );
};

export default GameHeader;
