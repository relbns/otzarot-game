# Otzarot - The Pirate Treasure Dice Game

![Otzarot Game Banner](https://via.placeholder.com/1200x300?text=Otzarot+Game)

Otzarot (Hebrew: אוצרות או צרות, "Treasures") is a digital adaptation of a pirate-themed dice and card game of luck and strategy. Will you collect treasures or encounter troubles on your quest for pirate fortune?

## 🏴‍☠️ Game Overview

Otzarot is a turn-based dice game where players roll for combinations, collect treasures, and navigate the perils of fortune cards. The first player to reach 8,000 points wins—but beware the skulls that can end your turn prematurely!

**Key Features:**

- Roll 8 dice with various symbols (coins, diamonds, swords, monkeys, parrots, and skulls)
- Draw Fortune Cards that modify gameplay rules and scoring
- Navigate special events like the Island of Skulls
- Build sets to maximize your score
- Play with 2-4 players locally or against AI opponents (currently only local game)

## 🎲 How to Play

1. On your turn, draw a Fortune Card that may affect your dice rolls or scoring
2. Roll all 8 dice and choose which to keep and which to re-roll
3. You can roll up to 3 times total per turn
4. Beware: rolling 3 or more skulls ends your turn with 0 points!
5. Score points based on sets of symbols, with coins and diamonds worth individual points
6. First player to reach 8,000 points triggers the final round

## 🚀 Getting Started

### Play Online

Visit [https://relbns.github.io/otzarot-game](https://relbns.github.io/otzarot-game) to play the latest version instantly in your browser!

### Local Development

```bash
# Clone the repository
git clone https://github.com/relbns/otzarot-game.git

# Navigate to project directory
cd otzarot-game

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## ⚙️ Technical Stack

- React 19
- Framer Motion for animations
- Vite for fast development and optimized builds
- GitHub Pages for frontend hosting

## 🗺️ Development Roadmap

### Phase 1: Local Gameplay

- Complete game mechanics and scoring
- Local multiplayer on the same device
- Bilingual support (Hebrew and English)
- Responsive design for all screen sizes

### Phase 2: AI Opponents - TBD

- Play against computer opponents with 3 difficulty levels
- Single-player campaign mode
- Extended game statistics

### Phase 3: Online Multiplayer - TBD

- Online matchmaking
- User accounts and profiles
- Leaderboards and achievements
- Cloud save functionality

## 🌐 Language Support

Otzarot fully supports both Hebrew (RTL) and English (LTR) interfaces.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original board game design by [Haim Shafir]
- Card and dice artwork by [Emojies 🤪]
- Sound effects from [Device Source]

---

Made with ❤️ and ☕ by Ariel Benesh
Game rights reserved to Haim Shafir. I recommend buying the physical board game, it's a true pleasure.
