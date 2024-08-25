import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './components/RootLayout'
import './index.css'
import LandingPage from './routes/LandingPage'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import { checkAuthStatus } from './utils'
import UserProvider from './components/context/UserProvider'
import NotFound from './routes/NotFound'
import { Toaster } from './components/ui/sonner'
import TanstackProvider from './components/provider/TanstackProvider'
import Chat from './routes/Chat'
import DashboardLayout from './components/DashboardLayout'

const router = createBrowserRouter(createRoutesFromElements(
  <Route
    path="/"
    element={<RootLayout />}
  >
    <Route
      index
      element={
        <UserProvider>
          <LandingPage />
        </UserProvider>
      }
    />

    <Route
      path="login"
      element={<Login />}
    />

    <Route
      path="dashboard"
      element={
        <UserProvider>
          <DashboardLayout />
        </UserProvider>
      }
      loader={async () => await checkAuthStatus()}
    >
      <Route
        path=""
        element={
          <UserProvider>
            <Dashboard />
          </UserProvider>
        }
      />
      <Route path="chat/:chatId" element={<Chat />} />
    </Route>

    <Route
      path="*"
      element={<NotFound />}
    />
  </Route>
))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackProvider>
      {/* <UserProvider> */}
      <RouterProvider router={router} />
      <Toaster richColors />
      {/* </UserProvider> */}
    </TanstackProvider>
  </StrictMode>
)