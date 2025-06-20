
1. add hadoc multiplayer:
# 🚀 **Add WebRTC Multiplayer Capabilities to the current Game**

I want this game to have a multiplayer capabilities without adding server.
please add WebRTC aside to the current local game capability

feature:
### **1. if you choose Host/Guest Game Flow**
- **Host Flow**: Select method → Host Game → Generate 4-letter code → Share URL
- **Guest Flow**: Select method → Join Game → Enter code → Auto-connect
- **Auto-Join Flow**: Click shared URL → Auto-detect code → Optional name → Join
- allow up to 4 peopele to connect, the host decide when the room is closed and the game begins and then none can come in. if he wants he can open the room again but then the game reset.

### **2. Smart URL Sharing System**
- Generate shareable URLs: `yoursite.com/?code=AB12&method=webrtc`
- Auto-detect query parameters on app load
- Show beautiful "Join Game?" prompt with game code
- Native share API + clipboard fallback
- Clear URL after processing

### **3. Robust WebRTC Implementation**
- **Multiple CDN fallbacks** for PeerJS library loading
- **Proper error handling** with clear user messages
- **Connection state tracking** with visual feedback
- **Automatic reconnection** and timeout management
- **Message synchronization** between host and guest

### **4. Professional UX/UI**
- **Toast notifications** for all user feedback
- **Loading states** with spinners and clear messages

### **5. Connection Status Management**
- **Connection badges** showing method and code
- **Visual role indicators**: Host (📤 share icon), Guest (🔗 connected icon)
- **Real-time status updates** during connection process
- **Error recovery** with retry options

## 🛠 **Technical Implementation Required:**

### **File Structure to Create:**
```
src/
├── components/
│   ├── ConnectionSetup.jsx      # Method selection & setup UI
│   ├── ConnectionBadge.jsx      # Shows connection status & code
│   ├── AutoJoinPrompt.jsx       # Auto-join from URL prompt
│   └──  # Your existing game components
├── services/
│   ├── ConnectionService.js     # WebRTC connection handling
│   └── # Your existing game logic
├── hooks/
│   ├── useConnection.js         # Connection state management
│   └── # Your existing game hooks
└── utils/
    └── helpers.js               # URL handling & utilities
```

### **Core Services to Implement:**

**ConnectionService.js** features:
- PeerJS integration with fallback CDNs
- Host/guest connection management
- Message passing with error handling
- Connection state tracking
- Proper cleanup and disconnection

**useConnection.js** hook features:
- Method selection state management
- Host/guest role handling
- Game code generation and storage
- Share URL functionality with query params
- Auto-join detection and processing

### **Message Protocol to Implement:** can changed with your implamantation to work for the specific game
```javascript
// Connection handshake
{ type: 'playerInfo', name: 'PlayerName' }
{ type: 'gameStart', hostStarts: true, hostName: 'Host' }

// Game-specific messages (adapt to your game)
{ type: 'move', data: yourGameMoveData }
{ type: 'gameState', state: yourGameState }
{ type: 'newGame' }

// Connection management
{ type: 'ping' } // Connection check
{ type: 'disconnect' }
```


2. currently there is a 3 rolls per turn, i want to make it configurable, it should be 3 or no limitation (except for the storm that has 2 rolls in the turn)
3. fix zombis card, and add option to just click on the roll button and not actively choose each dice
4. manual review and clean code.
4. write test for the current logic.