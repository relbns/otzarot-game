import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const ScoreModal = () => {
  const {
    scoreModalData, // New state for modal visibility and data
    players, // Still needed for player names
    // activePlayer, // Can get from scoreModalData.details.activePlayerName if passed
    t,
    direction,
    isRTL,
    // currentDice, // Will get from scoreModalData.details
    // currentCard, // Will get from scoreModalData.details
    renderDieFace,
    setScoreModalData, // New setter
    proceedToNextTurn,
    // islandOfSkulls, // Info will be in scoreModalData
    // islandOfSkullsPenaltyInfo // Info will be in scoreModalData
    // turnZombieAttackDetails, // Info will be in scoreModalData
  } = useGameContext();

  if (!scoreModalData) return null;

  const { type, details } = scoreModalData;
  
  // Extract necessary details based on type for convenience
  const activePlayerName = details.activePlayerName || (players[details.activePlayerIndex] ? players[details.activePlayerIndex].name : 'Player'); // Fallback
  const displayCurrentDice = details.currentDice || [];
  const displayCurrentCard = details.currentCard;


  // Handle continue button click - close modal and proceed to next turn
  const handleContinue = () => {
    setScoreModalData(null); // Hide modal
    proceedToNextTurn();
  };

  // Determine if this modal is for an Island of Skulls turn summary
  const isIoSTurnSummary = type === 'ios';
  const isZombieAttackSummary = type === 'zombie';
  
  // For normal turns, extract score details
  const turnScore = type === 'normal' ? details.score : (type === 'zombie' && details.type === 'victory' ? details.points : 0);
  const turnScoreDetails = type === 'normal' ? details.scoreDescription : [];
  const turnPenalties = type === 'normal' ? details.penalties : 0;
  const turnPenaltyDetails = type === 'normal' ? details.penaltyDescription : [];
  const finalScore = type === 'normal' ? details.finalScore : turnScore; // For ZA victory, finalScore is the 1200

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
            {activePlayerName} {t('turn_score')}
          </h2>
          
          {/* Zombie Attack Outcome Section */}
          {isZombieAttackSummary && (
            <div style={{ margin: '15px 0', textAlign: 'center' }}>
              {details.type === 'victory' && (
                <h3 style={{ color: '#a3e635' }}>
                  {t('zombie_attack_modal_victory_player', { playerName: details.playerName })}
                </h3>
              )}
              {details.type === 'failed' && (
                <>
                  <h3 style={{ color: '#ef4444' }}>
                    {t('zombie_attack_modal_failed_opponents_share')}
                  </h3>
                  {details.opponentAwards && details.opponentAwards.length > 0 && (
                    <div style={{ marginTop: '10px', color: '#cbd5e1' }}>
                      {details.opponentAwards.map((award, index) => (
                        <div key={index}>
                          {t('zombie_attack_opponent_award', { opponentName: award.name, pointsAwarded: award.pointsAwarded })}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Show current card (only if not Zombie Attack special display) */}
          {displayCurrentCard && !isZombieAttackSummary && (
            <div style={{ margin: '0 0 15px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 5px', color: '#a3e635' }}>
                {isRTL ? displayCurrentCard.hebrewName : displayCurrentCard.name}
              </h3>
              <div style={{ fontSize: '24px' }}>{displayCurrentCard.icon}</div>
              <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                {isRTL
                  ? displayCurrentCard.hebrewDescription
                  : displayCurrentCard.description}
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
              {displayCurrentDice.map((die, index) => (
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

          {/* Display score details or Island of Skulls summary (only if not Zombie Attack special display) */}
          {!isZombieAttackSummary && isIoSTurnSummary ? (
            <div style={{ margin: '15px 0' }}>
              <h3 style={{ color: '#fca5a5', textAlign: 'center', marginBottom: '10px' }}>
                🏝️ {t('island_of_skulls_turn_ended_banner')} 🏝️
              </h3>
              {/* Opponent score changes section */}
              {details.islandOfSkullsPenaltyInfo && details.islandOfSkullsPenaltyInfo.opponentDetails && details.islandOfSkullsPenaltyInfo.opponentDetails.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ color: '#a3e635', textAlign: 'center', marginBottom: '10px' }}>
                    {t('opponent_score_changes')}
                  </h4>
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.3)',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {details.islandOfSkullsPenaltyInfo.opponentDetails.map((op, index) => (
                      <div key={index} style={{ margin: '5px 0', color: '#cbd5e1' }}>
                        {op.name}: {op.oldScore} - {details.islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents} = {op.newScore}
                        {op.oldScore - details.islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents < 0 && op.newScore === 0 && (
                          ` (${t('ios_score_would_be_negative', { calculated: op.oldScore - details.islandOfSkullsPenaltyInfo.penaltyAppliedToOpponents })})`
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !isZombieAttackSummary && type === 'normal' ? ( // Normal score display
            <>
              {/* Display normal score details if score > 0 */}
              {details.score > 0 && (
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
                    {details.scoreDescription.map((detail, index) => (
                      <div key={index} style={{ margin: '5px 0' }}>
                        • {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display penalty details (if any) */}
              {details.penalties > 0 && (
                <div>
                  <h3
                    style={{
                      margin: '0 0 10px',
                      color: '#ef4444',
                      textAlign: 'center',
                    }}
                  >
                    {t('penalties')}:&nbsp;<span dir="ltr">-{details.penalties}</span>
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
                    {details.penaltyDescription.map((detail, index) => (
                      <div key={index} style={{ margin: '5px 0' }}>
                        • {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null } {/* End of normal score display */}

          {/* Display final score or impact score */}
          {(isIoSTurnSummary || type === 'normal' || (isZombieAttackSummary && details.type === 'victory')) && (
            <h2
              style={{
                margin: '15px 0',
                color: '#f59e0b',
                textAlign: 'center',
              }}
            >
              {isIoSTurnSummary 
                ? <>{t('turn_impact_score')}:&nbsp;<span dir="ltr">{(details.islandOfSkullsPenaltyInfo?.penaltyAppliedToOpponents || 0) === 0 ? 0 : `-${details.islandOfSkullsPenaltyInfo?.penaltyAppliedToOpponents || 0}`}</span></>
                : (type === 'normal' 
                    ? <>{t('final_score')}:&nbsp;<span dir="ltr">{details.finalScore === 0 ? 0 : details.finalScore}</span></> 
                    : (isZombieAttackSummary && details.type === 'victory'
                        ? <>{t('final_score')}:&nbsp;<span dir="ltr">{finalScore === 0 ? 0 : finalScore}</span></>
                        : null))
              }
            </h2>
          )}

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
