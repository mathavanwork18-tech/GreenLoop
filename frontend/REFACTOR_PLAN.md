# GREEN LOOP — MODULAR ARCHITECTURAL REFACTOR PLAN

## Phase 1: Core Foundation & Shared Layer
- [x] Create `src/types/` domain models (`auth.types.ts`, `user.types.ts`, `post.types.ts`, `map.types.ts`, `activity.types.ts`, `api.types.ts`, `common.types.ts`)
- [x] Create `src/constants/` tokens (`routes.ts`, `roles.ts`, `categories.ts`, `levels.ts`, `config.ts`)
- [x] Create `src/utils/` helpers (`formatting.ts`, `validation.ts`, `image.ts`, `date.ts`, `error.ts`)
- [x] Create `src/locales/` localization files (`en/common.json`, `ta/common.json`)
- [x] Create `src/services/` central API architecture (`apiClient.ts`, `auth.api.ts`, `users.api.ts`, `posts.api.ts`, `maps.api.ts`, `activity.api.ts`, `ai.api.ts`)
- [x] Create `src/hooks/` reusable global hooks (`useAuth.ts`, `useTheme.ts`, `useDebounce.ts`, `useMediaQuery.ts`, `useLocalStorage.ts`)
- [x] Create `src/components/ui/`, `src/components/navigation/`, `src/components/feedback/`, `src/components/eco/`
- [x] Create `src/layouts/` (`PublicLayout.tsx`, `AuthLayout.tsx`, `UserLayout.tsx`, `AdminLayout.tsx`)
- [x] Create `src/app/` (`App.tsx`, `router.tsx`, `providers.tsx`, `app.config.ts`)

## Phase 2: Page Modularization (Every Feature In Its Own Folder)
- [x] **Auth Feature**: `src/pages/auth/Login/`, `src/pages/auth/Register/`, `src/pages/auth/ForgotPassword/`
- [x] **Home Feature**: `src/pages/home/` decomposed into 9 clean subcomponents (`HomeHeader`, `HeroSection`, `SearchSection`, `FilterSection`, `RecommendationSection`, `PostFeed`, `NearbySection`, `GreenOpportunity`, `HomeStates`) + hooks + services + types.
- [x] **Map Feature**: `src/pages/map/` decomposed into `MapContainer`, `MapSearch`, `MapFilters`, `PartnerList`, `PartnerDetails`, `Modals` + hooks + services.
- [x] **Post Feature**: `src/pages/post/` decomposed into `Camera` (WebRTC stream & shutter), `ImagePreview`, `AIAnalysis`, `ListingForm`, `PurposeSelector`, `Preview`, `SafetyChecklist` + hooks + schemas + types.
- [x] **Activity Feature**: `src/pages/activity/` decomposed into `ActivityHeader`, `DailyMissions`, `RecentActivity`, `Wallet`, `PickupTracker`, `CertificatesGallery` + hooks + services.
- [x] **Account Feature**: `src/pages/account/` decomposed into `ProfileHeader`, `RoleSwitcher`, `RoleDashboard`, `RewardsStore`, `Leaderboard`, `SettingsMenu`, `HelpSupportModal`, and nested sub-pages `EditProfile/`, `Security/`, `Privacy/`.
- [x] **Additional Feature Modules**: `marketplace/`, `transactions/`, `pickup/`, `chat/`, `notifications/`, `rewards/`, `missions/`, `impact/`, `certificate/`, `support/`, `shop/`, `recycler/`, `admin/`.

## Phase 3: Verification & Quality Assurance
- [x] Update `main.tsx` to point cleanly to `src/app/App.tsx`
- [x] Run `npx tsc --noEmit` to verify type safety
- [x] Run `npm run build` to verify production bundle
- [x] Verify live dev server on `http://localhost:5173/`
