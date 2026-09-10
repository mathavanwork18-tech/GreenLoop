# Green Loop — Give Your E-Waste a Second Life

**Green Loop** is a circular e-waste ecosystem platform connecting citizens, certified recycling facilities, and authorized repair shops to divert hazardous electronic waste from landfills.

---

## Key Features

- **PWA Installation System**: Full Progressive Web App supporting standalone installation across Android, Windows, macOS, and iOS.
- **Smart E-Waste Catalog & Valuation**: Automated category classification and EcoCoins reward estimation.
- **Eco-Hub Locator**: Interactive map pinpointing certified collection centers and repair hubs.
- **Pickup Scheduling & Doorstep Collection**: Real-time status tracking from request to certified disposal.
- **Green AI Assistant**: AI-powered conversational guidance for disposal guidelines and e-waste diagnostics.
- **EcoPoints & Leaderboards**: Gamified sustainability incentives and verified recycling certificates.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router v7, Vanilla CSS Design System
- **PWA**: Web App Manifest, Service Worker caching (`vite-plugin-pwa`), standalone display
- **Backend**: Node.js, Express REST API
- **Icons**: Scalable vector SVG assets

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Install Root Dependencies**:
   ```bash
   npm install
   ```

2. **Install Frontend & Backend Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Run Fullstack Development Server**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

4. **Production Build**:
   ```bash
   cd frontend && npm run build
   ```

---

## License

MIT License
