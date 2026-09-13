import { Routes, Route, Navigate } from 'react-router-dom'
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

// Local Shop Modular Components
import LocalShopAppShell from './features/dashboard/shop/LocalShopAppShell'
import ShopDashboard from './features/dashboard/shop/ShopDashboard'
import ShopInventory from './features/dashboard/shop/ShopInventory'
import ShopPickups from './features/dashboard/shop/ShopPickups'
import ShopTransactions from './features/dashboard/shop/ShopTransactions'
import ShopAnalytics from './features/dashboard/shop/ShopAnalytics'
import ShopNotifications from './features/dashboard/shop/ShopNotifications'
import ShopProfile from './features/dashboard/shop/ShopProfile'

// Company Enterprise Modular Components
import CompanyAppShell from './features/dashboard/company/CompanyAppShell'
import CompanyDashboard from './features/dashboard/company/CompanyDashboard'
import CompanyRequests from './features/dashboard/company/CompanyRequests'
import CompanyInventory from './features/dashboard/company/CompanyInventory'
import CompanyProcessing from './features/dashboard/company/CompanyProcessing'
import CompanyTransactions from './features/dashboard/company/CompanyTransactions'
import CompanyAnalytics from './features/dashboard/company/CompanyAnalytics'
import CompanyReports from './features/dashboard/company/CompanyReports'
import CompanyNotifications from './features/dashboard/company/CompanyNotifications'
import CompanyProfile from './features/dashboard/company/CompanyProfile'

// Green Loop Administrator Modular Components
import AdminAppShell from './features/dashboard/admin/AdminAppShell'
import AdminOverview from './features/dashboard/admin/AdminOverview'
import AdminUsers from './features/dashboard/admin/AdminUsers'
import AdminShops from './features/dashboard/admin/AdminShops'
import AdminCompanies from './features/dashboard/admin/AdminCompanies'
import AdminPosts from './features/dashboard/admin/AdminPosts'
import AdminPickups from './features/dashboard/admin/AdminPickups'
import AdminRecyclingCenters from './features/dashboard/admin/AdminRecyclingCenters'
import AdminReports from './features/dashboard/admin/AdminReports'
import AdminNotifications from './features/dashboard/admin/AdminNotifications'
import AdminRecommendations from './features/dashboard/admin/AdminRecommendations'
import AdminDatabaseHealth from './features/dashboard/admin/AdminDatabaseHealth'
import AdminAnalytics from './features/dashboard/admin/AdminAnalytics'
import AdminAuditLogs from './features/dashboard/admin/AdminAuditLogs'
import AdminSettings from './features/dashboard/admin/AdminSettings'

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

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
  const userRole = normalizeRole(user?.role)

  // 0. GREEN LOOP ADMINISTRATOR CONTROL CENTER (CREATORS: MATHAVAN, VIMAL RAJ, THIRU LOOP)
  if (userRole === 'admin') {
    return (
      <AdminAppShell>
        <Routes>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/pickups" element={<AdminPickups />} />
          <Route path="/admin/centers" element={<AdminRecyclingCenters />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/recommendations" element={<AdminRecommendations />} />
          <Route path="/admin/health" element={<AdminDatabaseHealth />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* Strict Role Guard: Any other route redirects to /admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminAppShell>
    )
  }

  // 1. LOCAL SHOP BUSINESS DASHBOARD
  if (userRole === 'shop') {
    return (
      <LocalShopAppShell>
        <Routes>
          <Route path="/shop" element={<ShopDashboard />} />
          <Route path="/shop/inventory" element={<ShopInventory />} />
          <Route path="/shop/pickups" element={<ShopPickups />} />
          <Route path="/shop/transactions" element={<ShopTransactions />} />
          <Route path="/shop/analytics" element={<ShopAnalytics />} />
          <Route path="/shop/notifications" element={<ShopNotifications />} />
          <Route path="/shop/profile" element={<ShopProfile />} />
          {/* Strict Role Guard: Any other route redirects to /shop */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </LocalShopAppShell>
    )
  }

  // 2. COMPANY ENTERPRISE RECYCLER DASHBOARD
  if (userRole === 'company') {
    return (
      <CompanyAppShell>
        <Routes>
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/company/requests" element={<CompanyRequests />} />
          <Route path="/company/inventory" element={<CompanyInventory />} />
          <Route path="/company/processing" element={<CompanyProcessing />} />
          <Route path="/company/transactions" element={<CompanyTransactions />} />
          <Route path="/company/analytics" element={<CompanyAnalytics />} />
          <Route path="/company/reports" element={<CompanyReports />} />
          <Route path="/company/notifications" element={<CompanyNotifications />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          {/* Strict Role Guard: Any other route redirects to /company */}
          <Route path="*" element={<Navigate to="/company" replace />} />
        </Routes>
      </CompanyAppShell>
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
        </PwaInstallProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
