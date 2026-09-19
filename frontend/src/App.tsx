import { Routes, Route, Navigate } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PwaInstallProvider } from './context/PwaInstallContext'
import InstallModal from './components/install/InstallModal'
import UpdateToast from './components/install/UpdateToast'
import { normalizeRole } from './services/role/roleService'

// General User Components (100% Preserved Existing Dashboard)
import AppShell from './components/AppShell'
import { LoginPage } from './pages/auth/Login'
import { RegisterPage } from './pages/auth/Register'
import { ForgotPasswordPage } from './pages/auth/ForgotPassword'
import { HomePage } from './pages/home'
import { MapPage } from './pages/map'
import { PostPage } from './pages/post'
import { ActivityPage } from './pages/activity'
import { AccountPage, EditProfilePage } from './pages/account'
import { MarketplacePage } from './pages/marketplace'
import { TransactionsPage } from './pages/transactions'
import { PickupPage } from './pages/pickup'
import { ChatPage } from './pages/chat'
import { NotificationsPage } from './pages/notifications'
import { RewardsPage } from './pages/rewards'
import { MissionsPage } from './pages/missions'
import { ImpactPage } from './pages/impact'
import { SupportPage } from './pages/support'

// Local Shop / Company Marketplace Dashboard
import {
  LocalShopAppShell,
  LocalShopHomePage,
  LocalShopMapPage,
  LocalShopPostPage,
  LocalShopOrdersPage,
  LocalShopAccountPage,
} from './pages/shop'

function AppRoutes() {
  const { isAuthenticated, isInitializing, user } = useAuth()

  // Initializing session gate: prevent premature redirect to login/register during cold start
  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 14,
          }}
        />
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Loading Green Loop...
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Determining secure authentication state...
        </div>
      </div>
    )
  }

  // Unauthenticated Flow
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Centralized role resolution from database profile
  // Current roles strictly: 1. GENERAL USER, 2. LOCAL SHOP / COMPANY
  const userRole = normalizeRole(user?.role)

  // 1. LOCAL SHOP / COMPANY MARKETPLACE DASHBOARD (Home | Map | Post | Orders | Account)
  if (userRole === 'shop' || userRole === 'company') {
    return (
      <LocalShopAppShell>
        <Routes>
          <Route path="/" element={<LocalShopHomePage />} />
          <Route path="/shop" element={<LocalShopHomePage />} />
          <Route path="/map" element={<LocalShopMapPage />} />
          <Route path="/shop/map" element={<LocalShopMapPage />} />
          <Route path="/post" element={<LocalShopPostPage />} />
          <Route path="/shop/post" element={<LocalShopPostPage />} />
          <Route path="/orders" element={<LocalShopOrdersPage />} />
          <Route path="/shop/orders" element={<LocalShopOrdersPage />} />
          <Route path="/account" element={<LocalShopAccountPage />} />
          <Route path="/shop/account" element={<LocalShopAccountPage />} />
          <Route path="/account/edit" element={<EditProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Strict Role Guard: Any other route redirects to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocalShopAppShell>
    )
  }

  // 3. GENERAL USER DASHBOARD (100% PRESERVED EXISTING DASHBOARD)
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/edit" element={<EditProfilePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/pickup" element={<PickupPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/support" element={<SupportPage />} />
        {/* Strict Role Guard: Any other route (e.g. /shop/*, /company/*, /admin/*) redirects to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PwaInstallProvider>
          <AppRoutes />
          <InstallModal />
          <UpdateToast />
          <SpeedInsights />
          <Analytics />
        </PwaInstallProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
