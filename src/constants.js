// src/constants.js

// Dice faces constants
export const DICE_FACES = ['coin', 'diamond', 'swords', 'monkey', 'parrot', 'skull', 'blank'];

// Cards data
export const CARDS = [
  {
    id: 1,
    name: 'Captain',
    description: 'Your score is doubled!',
    hebrewName: 'קברניט',
    hebrewDescription: 'הנקודות מוכפלות!',
    type: 'special',
    effect: 'double_score',
    icon: '👨‍✈️',
    timesShown: 3
  },
  {
    id: 2,
    name: 'Sorceress',
    description: 'You can reroll one skull!',
    hebrewName: 'קוסמת',
    hebrewDescription: 'ניתן להטיל שוב קוביית גולגולת אחת!',
    type: 'special',
    effect: 'reroll_skull',
    icon: '🧙‍♀️',
    timesShown: 3
  },
  {
    id: 3,
    name: 'Treasure Chest',
    description: 'Store dice for safety.',
    hebrewName: 'תיבת האוצר',
    hebrewDescription: 'ניתן לשמור קוביות בבטחה.',
    type: 'special',
    effect: 'store_dice',
    icon: '🧰',
    timesShown: 3
  },
  {
    id: 4,
    name: 'Storm',
    description: 'Only gold and diamonds count. Their value is doubled!',
    hebrewName: 'סופה',
    hebrewDescription: 'רק זהב ויהלומים נחשבים, ערכם מוכפל!',
    type: 'special',
    effect: 'storm',
    icon: '🌪️',
    timesShown: 2
  },
  {
    id: 5,
    name: 'Monkey Business',
    description: 'Monkeys and parrots count together!',
    hebrewName: 'מאנקי ביזנס',
    hebrewDescription: 'קופים ותוכים נספרים יחד!',
    type: 'special',
    effect: 'monkey_business',
    icon: '🐒🦜',
    timesShown: 3
  },
  {
    id: 6,
    name: 'Sea Battle',
    description: 'Collect 2 swords to win bonus points!',
    hebrewName: 'קרב ימי',
    hebrewDescription: 'השג שתי חרבות לבונוס!',
    type: 'special',
    effect: 'sea_battle_2',
    icon: '⚔️⚔️',
    timesShown: 2,
    bonus: 300,
  },
  {
    id: 7,
    name: 'Sea Battle',
    description: 'Collect 3 swords to win bonus points!',
    hebrewName: 'קרב ימי',
    hebrewDescription: 'השג שלוש חרבות לבונוס!',
    type: 'special',
    effect: 'sea_battle_3',
    icon: '⚔️⚔️⚔️',
    timesShown: 2,
    bonus: 500,
  },
  {
    id: 8,
    name: 'Sea Battle',
    description: 'Collect 4 swords to win bonus points!',
    hebrewName: 'קרב ימי',
    hebrewDescription: 'השג ארבע חרבות לבונוס!',
    type: 'special',
    effect: 'sea_battle_4',
    icon: '⚔️⚔️⚔️⚔️',
    timesShown: 1,
    bonus: 1000,
  },
  {
    id: 9,
    name: 'Zombie Attack',
    description: 'Keep rolling until only skulls & swords remain!',
    hebrewName: 'מתקפת זומבים',
    hebrewDescription: 'המשך להטיל עד שיישארו רק חרבות וגולגולות!',
    type: 'special',
    effect: 'zombie_attack',
    icon: '🧟',
    timesShown: 1
  },
  {
    id: 10,
    name: 'Midas Touch',
    description: 'Double the value of coins you collect!',
    hebrewName: 'מגע הזהב',
    hebrewDescription: 'ערך המטבעות מוכפל!',
    type: 'coin',
    effect: 'midas_touch',
    icon: '✨🪙',
    timesShown: 1
  },
  {
    id: 11,
    name: 'Diamond Mine',
    description: 'Triple the value of diamonds you collect!',
    hebrewName: 'מכרה יהלומים',
    hebrewDescription: 'ערך היהלומים משולש!',
    type: 'diamond',
    effect: 'diamond_mine',
    icon: '⛏️💎',
    timesShown: 2
  },
  {
    id: 12,
    name: 'Truce',
    description: 'You must end your turn without swords. If disqualified with swords, you lose 500 points per sword!',
    hebrewName: 'שביתת נשק',
    hebrewDescription: 'חייבים לסיים תור ללא חרבות. אם נפסלים עם חרבות, מאבדים 500 נקודות לכל חרב!',
    type: 'special',
    effect: 'truce',
    icon: '🤝',
    timesShown: 1
  },
  {
    id: 13,
    name: 'Gold',
    description: 'Start your turn with one gold coin.',
    hebrewName: 'זהב',
    hebrewDescription: 'מתחילים את התור עם מטבע זהב אחד.',
    type: 'gold',
    effect: 'start_with_gold',
    icon: '🪙',
    timesShown: 3
  },
  {
    id: 14,
    name: 'Diamond',
    description: 'Start your turn with one diamond.',
    hebrewName: 'יהלום',
    hebrewDescription: 'מתחילים את התור עם יהלום אחד.',
    type: 'diamond',
    effect: 'start_with_diamond',
    icon: '💎',
    timesShown: 3
  },
  {
    id: 15,
    name: 'Skulls',
    description: 'Start your turn with 1 skull.',
    hebrewName: 'גולגולת',
    hebrewDescription: 'מתחילים את התור עם גולגולת אחת.',
    type: 'skull',
    effect: 'start_with_1_skull',
    icon: '💀',
    timesShown: 3
  },
  {
    id: 16,
    name: 'Skulls',
    description: 'Start your turn with 2 skulls.',
    hebrewName: 'גולגולות',
    hebrewDescription: 'מתחילים את התור עם שתי גולגולות.',
    type: 'skull',
    effect: 'start_with_2_skulls',
    icon: '💀💀',
    timesShown: 2
  }

];

// Translations
export const translations = {
  en: {
    title: 'Otzarot Game',
    subtitle: 'The Pirate Treasure Dice Game',
    start_game: 'Start Game',
    reset_game: 'Reset Game',
    roll_dice: 'Roll Dice',
    reroll_selected: 'Roll Selected',
    roll_for_skulls: 'Roll for Skulls',
    end_turn: 'End Turn',
    draw_card: 'Draw Card',
    current_player: 'Current Player',
    phase: 'Phase',
    rolls_remaining: 'Rolls remaining',
    in_skull_island: 'In the Island of Skulls!',
    skull_count: 'skulls',
    game_over: 'Game Over!',
    wins: 'wins!',
    game_log: 'Game Log',
    welcome: 'Welcome to Otzarot!',
    player_setup: 'Player Setup',
    player_name: 'Player Name',
    start: 'Start',
    player_count: 'Number of Players',
    language: 'Language',
    english: 'English',
    hebrew: 'Hebrew',
    click_to_draw: 'Click to Draw a Card',
    waiting_for_card: 'Waiting for Card',
    points: 'points',
    no_skulls_in_island: 'rolled no skulls in the Island of Skulls',
    scored: 'scored',
    with: 'with',
    loses: 'loses',
    deck_shuffled: "Deck shuffled and ready!",
    deck_shuffled_title: "Shuffling Deck",
    deck_shuffled_message: "The deck has been reshuffled and is ready for new adventures!",
    turn_score: "Turn Score",
    points_earned: "Points Earned",
    penalties: "Penalties",
    final_score: "Final Score",
    continue: "Continue",
    game_objective: 'Game Objective',
    game_objective_text: 'Navigate the pirate waters, collecting treasures and avoiding perils. Be the first to reach 8,000 points to win!',
    game_components: 'Game Components',
    components_dice: '8 Dice with various symbols: Coins, Diamonds, Monkeys, Parrots, Swords, and Skulls',
    components_cards: 'Fortune Cards that affect gameplay and scoring',
    how_to_play: 'How to Play',
    how_to_play_text: 'Each turn, draw a card and roll the dice up to three times to collect the best combination. Lock dice between rolls to build your collection.',
    scoring: 'Scoring',
    scoring_sets: 'Sets of Identical Objects',
    of_a_kind: 'of a kind',
    scoring_treasure: 'Diamonds and Gold',
    scoring_treasure_text: 'Each diamond and gold coin is worth 100 points individually, even when not part of a set. They score twice - for their value and for sets they make.',
    scoring_full_chest: 'Full Chest Bonus',
    scoring_full_chest_text: 'A player who generates points with all eight dice receives a bonus of 500 points in addition to their score.',
    fortune_cards: 'Fortune Cards',
    fortune_cards_text: 'Fortune cards provide special bonuses, challenges or penalties that affect your turn.',
    end_game: 'End of the Game',
    end_game_text: 'The game ends when a player crosses 8,000 points. Each other player gets one more turn to try to reach a higher score.',
    skull_island: 'Island of Skulls',
    skull_island_text: 'If you roll 4 or more skulls on your first roll, you enter the Island of Skulls. Instead of scoring points for yourself, you can deduct 100 points from all opponents for each additional skull you collect.',
    dice_rolling: "Dice are rolling...",
    select_dice_to_roll: "Select dice to roll",
    must_roll_at_least_two: "You must roll at least 2 dice",
  },
  he: {
    title: 'אוצרות או צרות',
    subtitle: 'משחק קוביות אוצרות הפיראטים',
    start_game: 'התחל משחק',
    reset_game: 'אפס משחק',
    roll_dice: 'הטל קוביות',
    reroll_selected: 'הטל נבחרות',
    roll_for_skulls: 'הטל לגולגולות',
    end_turn: 'סיים תור',
    draw_card: 'שלוף קלף',
    current_player: 'שחקן נוכחי',
    phase: 'שלב',
    rolls_remaining: 'הטלות שנותרו',
    in_skull_island: 'באי הגולגולות!',
    skull_count: 'גולגולות',
    game_over: 'המשחק נגמר!',
    wins: 'ניצח!',
    game_log: 'יומן משחק',
    welcome: 'ברוכים הבאים לאוצרות!',
    player_setup: 'הגדרת שחקנים',
    player_name: 'שם שחקן',
    start: 'התחל',
    player_count: 'מספר שחקנים',
    language: 'שפה',
    english: 'אנגלית',
    hebrew: 'עברית',
    click_to_draw: 'לחץ לשליפת קלף',
    waiting_for_card: 'ממתין לקלף',
    points: 'נקודות',
    no_skulls_in_island: 'לא הטיל גולגולות באי הגולגולות',
    scored: 'השיג',
    with: 'עם',
    loses: 'מאבד',
    deck_shuffled: "החפיסה עורבבה ומוכנה!",
    deck_shuffled_title: "ערבוב החפיסה",
    deck_shuffled_message: "החפיסה עורבבה ומוכנה להרפתקאות חדשות!",
    turn_score: "ניקוד תור",
    points_earned: "נקודות שהושגו",
    penalties: "קנסות",
    final_score: "ניקוד סופי",
    continue: "המשך",
    lets_play: 'בואו נשחק',
    instructions: 'הוראות',
    about: 'אודות',
    back: 'חזרה',
    close: 'סגור',
    version: 'גרסה',
    download_rules: 'הורד הוראות מלאות',
    copyright: 'כל הזכויות שמורות לחיים שפיר',
    copyright_game: 'כל הזכויות למשחק שמורות לחיים שפיר',
    copyright_web: 'גרסת האינטרנט שמורה לאריאל',
    game_objective: 'מטרת המשחק',
    game_objective_text: 'נווטו במים הפיראטיים, אספו אוצרות והימנעו מסכנות. היו הראשונים להגיע ל-8,000 נקודות כדי לנצח!',
    game_components: 'רכיבי המשחק',
    components_dice: '8 קוביות עם סמלים שונים: מטבעות, יהלומים, קופים, תוכים, חרבות וגולגולות',
    components_cards: 'קלפי מזל המשפיעים על המשחק והניקוד',
    how_to_play: 'איך משחקים',
    how_to_play_text: 'בכל תור, שלפו קלף והטילו את הקוביות עד שלוש פעמים כדי לאסוף את השילוב הטוב ביותר. נעלו קוביות בין ההטלות כדי לבנות את האוסף שלכם.',
    scoring: 'ניקוד',
    scoring_sets: 'סטים של אובייקטים זהים',
    of_a_kind: 'מאותו סוג',
    scoring_treasure: 'יהלומים וזהב',
    scoring_treasure_text: 'כל יהלום ומטבע זהב שווים 100 נקודות בנפרד, גם כאשר אינם חלק מסט. הם מקבלים ניקוד פעמיים - עבור הערך שלהם ועבור הסטים שהם יוצרים.',
    scoring_full_chest: 'בונוס תיבה מלאה',
    scoring_full_chest_text: 'שחקן שמקבל נקודות עם כל שמונה הקוביות מקבל בונוס של 500 נקודות בנוסף לניקוד שלו.',
    fortune_cards: 'קלפי מזל',
    fortune_cards_text: 'קלפי מזל מעניקים בונוסים מיוחדים, אתגרים או קנסות המשפיעים על התור שלכם.',
    end_game: 'סוף המשחק',
    end_game_text: 'המשחק מסתיים כאשר שחקן חוצה 8,000 נקודות. כל שחקן אחר מקבל תור נוסף אחד כדי לנסות להגיע לניקוד גבוה יותר.',
    skull_island: 'אי הגולגולות',
    skull_island_text: 'אם הטלתם 4 גולגולות או יותר בהטלה הראשונה שלכם, אתם נכנסים לאי הגולגולות. במקום לקבל נקודות לעצמכם, אתם יכולים להפחית 100 נקודות מכל היריבים עבור כל גולגולת נוספת שאתם אוספים.',
    dice_rolling: "הקוביות מתגלגלות...",
    select_dice_to_roll: "בחר קוביות להטלה",
    must_roll_at_least_two: "עליך להטיל לפחות 2 קוביות",
  },
};

export const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    color: '#e2e8f0',
    background: 'linear-gradient(to bottom, #0f172a, #1e3a8a)',
    minHeight: '100vh',
    padding: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  headerTitle: {
    color: '#f59e0b',
    margin: '0',
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  gameInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    background: 'linear-gradient(to right, #1e293b, #334155)',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  primaryButton: {
    background: 'linear-gradient(to right, #2563eb, #3b82f6)',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  secondaryButton: {
    background: 'linear-gradient(to right, #eab308, #f59e0b)',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  dangerButton: {
    background: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  formControl: {
    marginLeft: '10px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #475569',
    background: '#334155',
    color: '#e2e8f0',
  },
  card: {
    background: 'linear-gradient(135deg, #1e293b, #334155)',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  playerActive: {
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  }
};

// Common styles
// export const styles = {
//     container: {
//         maxWidth: '800px',
//         margin: '0 auto',
//         fontFamily: 'Arial, sans-serif',
//         color: '#e2e8f0',
//         background: 'linear-gradient(to bottom, #0f172a, #1e3a8a)',
//         minHeight: '100vh',
//         padding: '20px',
//     },
//     header: {
//         textAlign: 'center',
//         marginBottom: '20px',
//         background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
//         padding: '15px',
//         borderRadius: '8px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
//     },
//     headerTitle: {
//         color: '#f59e0b',
//         margin: '0',
//         textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
//     },
//     gameInfo: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         marginBottom: '20px',
//         background: 'linear-gradient(to right, #1e293b, #334155)',
//         padding: '15px',
//         borderRadius: '8px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
//     },
//     primaryButton: {
//         background: 'linear-gradient(to right, #2563eb, #3b82f6)',
//         border: 'none',
//         borderRadius: '6px',
//         padding: '12px 24px',
//         color: 'white',
//         cursor: 'pointer',
//         fontWeight: 'bold',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
//     },
//     secondaryButton: {
//         background: 'linear-gradient(to right, #eab308, #f59e0b)',
//         border: 'none',
//         borderRadius: '6px',
//         padding: '12px 24px',
//         color: '#0f172a',
//         cursor: 'pointer',
//         fontWeight: 'bold',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
//     },
//     dangerButton: {
//         background: '#ef4444',
//         border: 'none',
//         borderRadius: '4px',
//         padding: '10px 20px',
//         color: 'white',
//         cursor: 'pointer',
//         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
//     },
//     formControl: {
//         marginLeft: '10px',
//         padding: '8px 12px',
//         borderRadius: '4px',
//         border: '1px solid #475569',
//         background: '#334155',
//         color: '#e2e8f0',
//     },
//     card: {
//         background: 'linear-gradient(135deg, #1e293b, #334155)',
//         borderRadius: '8px',
//         padding: '15px',
//         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
//     },
//     playerActive: {
//         background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
//         boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
//     }
// };