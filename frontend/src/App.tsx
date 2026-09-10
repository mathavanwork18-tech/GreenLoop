import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PwaInstallProvider } from './context/PwaInstallContext'
import InstallModal from './components/install/InstallModal'
import UpdateToast from './components/install/UpdateToast'
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
import { ShopPage } from './pages/shop'
import { RecyclerPage } from './pages/recycler'
import { AdminPage } from './pages/admin'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

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
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/recycler" element={<RecyclerPage />} />
        <Route path="/admin" element={<AdminPage />} />
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
        </PwaInstallProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
