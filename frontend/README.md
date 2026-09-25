# Green Loop — E-Waste Management & Circular Electronics Platform ♻️⚡

> 🌐 **Live Web Application:** [https://green-loopoffical.vercel.app/](https://green-loopoffical.vercel.app/)

![Green Loop](https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80)

**Green Loop** is a production-grade, interactive E-Waste Management web application designed to connect consumers, repair technicians, and TNPCB-authorized recycling facilities. Built with **React 19**, **TypeScript**, **Vite**, and **Leaflet OpenStreetMap**.

---

## 🚀 Key Features

- 🗺️ **Advanced Smart E-Waste Map**:
  - Browser Geolocation API with live GPS accuracy ring.
  - Haversine Distance algorithm ($R = 6371\text{ km}$) with dynamic radius filtering (1 km – 50 km).
  - Smart grid-based marker clustering for dense urban areas.
  - Branded markers for E-Waste Devices (📦), Parts & Scrap (🔧), Repair Hubs (🏪), and Certified Recyclers (♻️).
  - Floating glassmorphism preview cards and 100% viewport locked experience (`100dvh`).

- 🤖 **AI-Powered Circular Device Diagnostics**:
  - Live WebRTC camera capture & photo scanning.
  - Hardware model detection, condition estimation, and material breakdown.
  - Automated fair-market valuation and circular recycling recommendations.

- 🌿 **Green Coins & Circular Economy Rewards**:
  - Earn Green Coins for responsible drop-offs, repairs, and daily eco-missions.
  - Real-time wallet ledger with voucher redemption codes (`ECO100`, `CLEAN250`, `GREEN500`).
  - Tier progression from *Eco Beginner* to *Planet Guardian*.

- 📜 **Official TNPCB Recycling Certificates**:
  - Digitally signed compliance certificates for hazardous materials & battery neutralizations.
  - Material recovery breakdown (Copper, Gold, Lithium, Cobalt, Aluminum).

- 🔒 **Role-Based Architecture & Security**:
  - Distinct workflows for General Users, Local Repair Shops, Certified Recyclers, and State Admins.
  - Complete profile editing with camera snapshots, session manager, and privacy controls.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Modern CSS3 (Glassmorphism, CSS Variables, Responsive Viewports)
- **Map & Geolocation**: Leaflet (`^1.9.4`), React-Leaflet (`^5.0.0`), OpenStreetMap
- **Icons**: Custom Feather/Lucide-inspired SVG Icon System
- **State & Storage**: React Context API, LocalStorage persistence with cross-component event broadcasting

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone <your-new-repository-url>
cd green-loop
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
MIT License © 2026 Green Loop Team.
