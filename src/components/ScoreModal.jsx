import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const ScoreModal = () => {
  const {
    showScoreModal,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,
    players,
    activePlayer,
    t,
    direction,
    isRTL,
    currentDice,
    currentCard,
    renderDieFace,
    setShowScoreModal,
    proceedToNextTurn,
    islandOfSkulls, // <-- Get islandOfSkulls state
    islandOfSkullsPenaltyInfo // Expected: { penaltyAppliedToOpponents: number, opponentDetails: Array<{name, oldScore, newScore}> }
  } = useGameContext();

  // Calculate final score
  const finalScore = Math.max(0, turnScore - turnPenalties);

  // Determine if this modal is for an Island of Skulls turn summary
  // This relies on turnScore being 0 and turnScoreDetails being set specifically by finalizeIslandOfSkullsTurn
  const isIoSTurnSummary = turnScore === 0 && 
                         turnPenalties === 0 && 
                         turnScoreDetails && 
                         turnScoreDetails.length > 0 && 
                         turnScoreDetails.includes(t('island_of_skulls_player_score_zero'));

  // Handle continue button click - close modal and proceed to next turn
  const handleContinue = () => {
    setShowScoreModal(false);
    proceedToNextTurn();
  };

  if (!showScoreModal) return null;

  return (
    <AnimatePresence>
      <motion.div // Changed back to motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          direction: direction, // Apply RTL/LTR direction
        }}
        initial={{ opacity: 0 }} // Restored initial prop
        animate={{ opacity: 1 }} // Restored animate prop
        exit={{ opacity: 0 }} // Restored exit prop
      >
        <motion.div // Changed back to motion.div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: isRTL ? 'right' : 'left', // Text alignment based on language
            border: '3px solid #f59e0b',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
          overflowY: 'auto',
        }}
        initial={{ scale: 0.8, y: 20 }} // Restored initial prop
        animate={{ scale: 1, y: 0 }} // Restored animate prop
        exit={{ scale: 0.8, y: 20 }} // Restored exit prop
        >
          <h2
            style={{
              margin: '0 0 15px',
              color: '#f59e0b',
              textAlign: 'center',
            }}
          >
            {players[activePlayer].name} {t('turn_score')}
          </h2>

          {/* Show current card */}
          {currentCard && (
            <div style={{ margin: '0 0 15px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 5px', color: '#a3e635' }}>
                {isRTL ? currentCard.hebrewName : currentCard.name}
              </h3>
              <div style={{ fontSize: '24px' }}>{currentCard.icon}</div>
              <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                {isRTL
                  ? currentCard.hebrewDescription
                  : currentCard.description}
              </p>
            </div>
          )}

          {/* Show current dice */}
          <div style={{ margin: '0 0 15px' }}>
            <h3
              style={{
                margin: '0 0 10px',
                color: '#a3e635',
                textAlign: 'center',
              }}
            >
              {t('current_dice')}
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '8px',
              }}
            >
              {currentDice.map((die, index) => (
                <div
                  key={index}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: die.inTreasureChest
                      ? 'linear-gradient(135deg, #b45309, #d97706)'
                      : 'linear-gradient(135deg, #475569, #64748b)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    border:
                      die.locked && !die.inTreasureChest
                        ? '2px solid #ef4444'
                        : die.inTreasureChest
                        ? '2px solid #fcd34d'
                        : '2px solid #94a3b8',
                  }}
                >
                  {die.face !== 'blank' && renderDieFace(die.face)}
                </div>
              ))}
            </div>
          </div>

          {/* Display score details or Island of Skulls summary */}
          {isIoSTurnSummary ? (
            <div style={{ margin: '15px 0' }}>
              <h3 style={{ color: '#fca5a5', textAlign: 'center', marginBottom: '10px' }}>
                🏝️ {t('island_of_skulls_turn_ended_banner')} 🏝️
              </h3>
              {/* Opponent score changes section */}
              {islandOfSkullsPenaltyInfo && islandOfSkullsPenaltyInfo.opponentDetails && islandOfSkullsPenaltyInfo.opponentDetails.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ color: '#a3e635', textAlign: 'center', marginBottom: '10px' }}>
                    {t('opponent_score_changes')} {/* New translation key */}
                  </h4>
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {islandOfSkullsPenaltyInfo.opponentDetails.map((op, index) => (
                      <div key={index} style={{ margin: '5px 0', color: '#cbd5e1' }}>
                        {op.name}: {op.oldScore} - {islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents} = {op.newScore}
                        {op.oldScore - islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents < 0 && op.newScore === 0 && (
                          ` (${t('ios_score_would_be_negative', { calculated: op.oldScore - islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents })})` /* New translation key */
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Display normal score details if score > 0 */}
              {turnScore > 0 && (
                <div>
                  <h3
                    style={{
                      margin: '0 0 10px',
                      color: '#a3e635',
                      textAlign: 'center',
                    }}
                  >
                    {t('points_earned')}: {turnScore}
                  </h3>
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '15px',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {turnScoreDetails.map((detail, index) => (
                      <div key={index} style={{ margin: '5px 0' }}>
                        • {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display penalty details (if any) */}
              {turnPenalties > 0 && (
                <div>
                  <h3
                    style={{
                      margin: '0 0 10px',
                      color: '#ef4444',
                      textAlign: 'center',
                    }}
                  >
                    {t('penalties')}: -{turnPenalties}
                  </h3>
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '15px',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {turnPenaltyDetails.map((detail, index) => (
                      <div key={index} style={{ margin: '5px 0' }}>
                        • {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Display final score or IoS turn impact */}
          <h2
            style={{
              margin: '15px 0',
              color: '#f59e0b',
              textAlign: 'center',
            }}
          >
            {isIoSTurnSummary 
              ? `${t('turn_impact_score')}: -${islandOfSkullsPenaltyInfo?.penaltyAppliedToOpponents || 0}` 
              : `${t('final_score')}: ${finalScore}`}
          </h2>

          {/* Center the button regardless of text direction */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleContinue}
              style={{
                background: 'linear-gradient(to right, #eab308, #f59e0b)',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                marginTop: '10px',
              }}
            >
              {t('continue')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScoreModal;
