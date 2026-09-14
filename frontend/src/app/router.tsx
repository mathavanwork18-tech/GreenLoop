import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import UserLayout from '../layouts/UserLayout'
import AuthLayout from '../layouts/AuthLayout'
import { HomePage } from '../pages/home'
import { MapPage } from '../pages/map'
import { PostPage } from '../pages/post'
import { ActivityPage } from '../pages/activity'
import { AccountPage, EditProfilePage } from '../pages/account'
import { LoginPage } from '../pages/auth/Login'
import { RegisterPage } from '../pages/auth/Register'
import { ForgotPasswordPage } from '../pages/auth/ForgotPassword'
import { MarketplacePage } from '../pages/marketplace'
import { TransactionsPage } from '../pages/transactions'
import { PickupPage } from '../pages/pickup'
import { ChatPage } from '../pages/chat'
import { NotificationsPage } from '../pages/notifications'
import { RewardsPage } from '../pages/rewards'
import { MissionsPage } from '../pages/missions'
import { ImpactPage } from '../pages/impact'
import { SupportPage } from '../pages/support'
import { ShopPage } from '../pages/shop'
import { RecyclerPage } from '../pages/recycler'

export const router = createBrowserRouter([
  // Core user app with layout shell
  {
    path: ROUTES.HOME,
    element: (
      <UserLayout>
        <HomePage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.MAP,
    element: (
      <UserLayout>
        <MapPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.POST,
    element: (
      <UserLayout>
        <PostPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.ACTIVITY,
    element: (
      <UserLayout>
        <ActivityPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.ACCOUNT,
    element: (
      <UserLayout>
        <AccountPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.ACCOUNT_EDIT,
    element: (
      <UserLayout>
        <EditProfilePage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.MARKETPLACE,
    element: (
      <UserLayout>
        <MarketplacePage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.TRANSACTIONS,
    element: (
      <UserLayout>
        <TransactionsPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.PICKUP,
    element: (
      <UserLayout>
        <PickupPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.CHAT,
    element: (
      <UserLayout>
        <ChatPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.NOTIFICATIONS,
    element: (
      <UserLayout>
        <NotificationsPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.REWARDS,
    element: (
      <UserLayout>
        <RewardsPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.MISSIONS,
    element: (
      <UserLayout>
        <MissionsPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.IMPACT,
    element: (
      <UserLayout>
        <ImpactPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.SUPPORT,
    element: (
      <UserLayout>
        <SupportPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.SHOP,
    element: (
      <UserLayout>
        <ShopPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.RECYCLER,
    element: (
      <UserLayout>
        <RecyclerPage />
      </UserLayout>
    ),
  },
  {
    path: ROUTES.ADMIN,
    element: <Navigate to={ROUTES.HOME} replace />,
  },

  // Auth pages
  {
    path: ROUTES.LOGIN,
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },
])
