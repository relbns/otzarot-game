import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import soundManager from '../utils/SoundManager'; // Import soundManager

const SettingsScreen = () => { // Remove onBack prop
  const navigate = useNavigate(); // Use navigate hook
  const { t, language, isRTL, setLanguage, setPointsToWin, setPlaySounds } =
    useGameContext();

  // Local state for settings
  const [targetPoints, setTargetPoints] = useState(8000);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load target points setting
    const savedPoints = localStorage.getItem('otzarot_targetPoints');
    if (savedPoints) {
      setTargetPoints(parseInt(savedPoints));
    }

    // Load sound settings
    const savedSounds = localStorage.getItem('otzarot_soundsEnabled');
    if (savedSounds !== null) {
      setSoundsEnabled(savedSounds === 'true');
    }
  }, []);

  // Save settings
  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('otzarot_targetPoints', targetPoints.toString());
    localStorage.setItem('otzarot_soundsEnabled', soundsEnabled.toString());

    // Update context
    setPointsToWin(targetPoints);
    setPlaySounds(soundsEnabled);

    // Navigate back
    soundManager.play('button'); // Play sound on save/back
    navigate(-1); // Go back to the previous route
  };

  const handleBackClick = () => {
    soundManager.play('button'); // Play sound on back click
    navigate(-1); // Go back to the previous route
  };

  return (
    <motion.div
      className="settings-screen"
      style={{
        padding: '20px',
        direction: isRTL ? 'rtl' : 'ltr',
        margin: '0 auto',
        height: '100vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h1 style={{ color: '#f59e0b', margin: 0 }}>{t('settings')}</h1>
        <motion.button
          onClick={handleBackClick} // Use new handler
          style={{
            ...styles.secondaryButton,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRTL ? `${t('back')} ←` : `← ${t('back')}`}
        </motion.button>
      </div>

      <div
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          color: '#ffffff', /* Improving contrast with white text */
        }}
      >
        <h2 style={{ marginTop: 0, color: '#f59e0b' }}>{t('game_settings')}</h2>

        {/* Points to Win Setting */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            {t('points_to_win')}: {targetPoints}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              min="2000"
              max="16000"
              step="1000"
              value={targetPoints}
              onChange={(e) => setTargetPoints(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#ffffff' }}>{targetPoints}</span>
          </div>
        </div>

        {/* Sound Settings */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <input
              type="checkbox"
              checked={soundsEnabled}
              onChange={(e) => setSoundsEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 'bold' }}>{t('play_sounds')}</span>
          </label>
        </div>

        {/* Language Setting */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            {t('language')}:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              ...styles.formControl,
              padding: '10px',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <option value="en">{t('english')}</option>
            <option value="he">{t('hebrew')}</option>
          </select>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <motion.button
          onClick={saveSettings}
          style={{
            ...styles.primaryButton,
            padding: '12px 30px',
            fontSize: '1.1rem',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('save_settings')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;
