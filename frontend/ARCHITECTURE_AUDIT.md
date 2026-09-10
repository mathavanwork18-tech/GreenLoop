# GREEN LOOP — ARCHITECTURE AUDIT & REFACTOR SPECIFICATION

**Audit Date**: September 2026  
**Auditor**: Antigravity AI  
**Project**: Green Loop (Circular E-Waste Mobile Web Platform)  
**Workspace**: `c:\Users\ADMIN\Downloads\e-waste10th try\green-loop`

---

## 1. Executive Summary

The Green Loop codebase has evolved into a rich, full-featured circular economy application containing:
- Authentication & Multi-Role support (General User, Local Shop, Recycler, Admin)
- Live WebRTC Camera capture, canvas frame extraction, and device presets
- AI Circular Scan & valuation engine
- Search, voice search, and category/distance/condition filters
- Interactive Leaflet ecosystem map with recycler drop-offs and pickup modals
- Green Coin wallet, 7-day streak, daily missions, and 7-step pickup tracking
- Complete profile editor, active sessions, and password management
- AI floating drawer assistant (*Ask Green AI*)

However, several files have become large and monolithic:
- `HomePage.tsx` (~1,200 lines) combined header, search, filters, recommendations, post feed, nearby shops, and post detail modal.
- `AccountPage.tsx` (~800 lines) combined header, role dashboard, rewards store, leaderboards, support tickets, and language switcher.
- `PostPage.tsx` (~650 lines) combined WebRTC camera controls, canvas frame grabber, AI scanning, multi-step form, and safety checklists.
- `ActivityPage.tsx` (~790 lines) combined coin redeem script, 7-day streak, daily missions, pickup tracker, certificates list, and coin history.
- `AppShell.tsx` (~420 lines) mixed layout shell with global navigation and quick action buttons.

---

## 2. Inventory of Current Modules

| Current File | Lines | Primary Responsibilities | Target Refactored Structure |
|---|---|---|---|
| `src/App.tsx` | ~50 lines | Routing & Context setup | `src/app/App.tsx`, `src/app/router.tsx`, `src/app/providers.tsx` |
| `src/pages/home/HomePage.tsx` | ~1,200 lines | Feed, search, filters, nearby | `src/pages/home/` with 9 modular component folders |
| `src/pages/map/MapPage.tsx` | ~450 lines | Leaflet map, pickup modal, bulk drive | `src/pages/map/` with `MapContainer`, `MapFilters`, `PartnerList`, `Modals` |
| `src/pages/post/PostPage.tsx` | ~650 lines | Live camera, AI scan, form, preview | `src/pages/post/` with `Camera`, `AIAnalysis`, `ListingForm`, `Preview` |
| `src/pages/activity/ActivityPage.tsx` | ~790 lines | Wallet, missions, tracker, history | `src/pages/activity/` with `ActivityHeader`, `DailyMissions`, `Wallet`, `PickupTracker` |
| `src/pages/account/AccountPage.tsx` | ~800 lines | Profile, rewards, leaderboard, role | `src/pages/account/` with `ProfileHeader`, `RewardsStore`, `RoleDashboard`, `Security` |
| `src/pages/account/EditProfilePage.tsx` | ~650 lines | Profile photo, details, prefs, privacy | `src/pages/account/EditProfile/` |
| `src/pages/auth/LoginPage.tsx` | ~160 lines | Login form & validation | `src/pages/auth/Login/` |
| `src/pages/auth/RegisterPage.tsx` | ~200 lines | Registration form & role select | `src/pages/auth/Register/` |

---

## 3. Separation of Concerns & Refactoring Goals

1. **Feature Isolation**: Every major page has its own self-contained folder containing its components, hooks, services, and types.
2. **Shared Component Pruning**: Global components in `src/components/` (`ui/`, `navigation/`, `feedback/`, `eco/`) are strictly multi-page reusable.
3. **Dedicated Layering**:
   - `src/app/`: Bootstrap, providers, router, app configuration.
   - `src/layouts/`: Public, Auth, User, Shop, Recycler, and Admin layout shells.
   - `src/services/`: Central API layer with isolated feature domains (`auth`, `users`, `posts`, `maps`, `ai`, `activity`, `chat`, `notifications`).
   - `src/hooks/`: Global shared utility hooks.
   - `src/types/`: Single source of truth for domain interfaces.
   - `src/constants/`: Central route paths, category tokens, level tiers.
   - `src/utils/`: Pure utilities (formatting, validation, date, image compression).
4. **Zero Regressions**: All existing functionality (WebRTC camera, AI scan, Coin wallet scripts, role switching, map interactions, filters) preserved without breaking changes.
