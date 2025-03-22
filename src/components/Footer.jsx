import React from 'react';
import { useGameContext } from '../context/GameContext';

const Footer = () => {
  const { t } = useGameContext();
  const currentYear = new Date().getFullYear();

  return (
    <div
      style={{
        padding: '10px',
        textAlign: 'center',
        fontSize: '0.8rem',
        opacity: 0.7,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <p>
        © {currentYear} {t('copyright')}
      </p>
    </div>
  );
};

export default Footer;
