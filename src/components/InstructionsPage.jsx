import React from 'react';
import { motion } from 'framer-motion';
import { styles } from '../constants';
import { useGameContext } from '../context/GameContext';

const InstructionsPage = ({ onBack }) => {
  const { t, language } = useGameContext();

  // PDF links based on language
  const pdfLink =
    language === 'he'
      ? 'https://www.shafirgames.com/_files/ugd/af942b_7018078677804ccab25315a0e37cd6ac.pdf'
      : 'https://www.shafirgames.com/_files/ugd/af942b_8a54dc68797340458c51e99b2427f3b6.pdf';

  return (
    <motion.div
      className="instructions-page"
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        height: '100vh',
        overflowY: 'auto',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        onClick={onBack}
        style={{
          ...styles.secondaryButton,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← {t('back')}
      </motion.button>

      <h1 style={{ color: '#f59e0b', marginBottom: '20px' }}>
        {t('instructions')}
      </h1>

      <div
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <h2>{t('game_objective')}</h2>
        <p>{t('game_objective_text')}</p>

        <h2>{t('game_components')}</h2>
        <ul>
          <li>{t('components_dice')}</li>
          <li>{t('components_cards')}</li>
        </ul>

        <h2>{t('how_to_play')}</h2>
        <p>{t('how_to_play_text')}</p>

        <h2>{t('scoring')}</h2>
        <h3>{t('scoring_sets')}</h3>
        <ul>
          <li>
            3 {t('of_a_kind')}: 100 {t('points')}
          </li>
          <li>
            4 {t('of_a_kind')}: 200 {t('points')}
          </li>
          <li>
            5 {t('of_a_kind')}: 500 {t('points')}
          </li>
          <li>
            6 {t('of_a_kind')}: 1,000 {t('points')}
          </li>
          <li>
            7 {t('of_a_kind')}: 2,000 {t('points')}
          </li>
          <li>
            8 {t('of_a_kind')}: 4,000 {t('points')}
          </li>
        </ul>

        <h3>{t('scoring_treasure')}</h3>
        <p>{t('scoring_treasure_text')}</p>

        <h3>{t('scoring_full_chest')}</h3>
        <p>{t('scoring_full_chest_text')}</p>

        <h2>{t('fortune_cards')}</h2>
        <p>{t('fortune_cards_text')}</p>

        <h2>{t('end_game')}</h2>
        <p>{t('end_game_text')}</p>

        <h2>{t('skull_island')}</h2>
        <p>{t('skull_island_text')}</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <a
          href={pdfLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 25px',
            borderRadius: '6px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          {t('download_rules')} (PDF)
        </a>
      </div>
    </motion.div>
  );
};

export default InstructionsPage;
