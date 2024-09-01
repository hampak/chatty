import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import RootLayout from './components/RootLayout'
import { SocketProvider } from './components/context/SocketContext'
import UserProvider from './components/provider/UserProvider'
import TanstackProvider from './components/provider/TanstackProvider'
import './index.css'
import Chat from './routes/Chat'
import Dashboard from './routes/Dashboard'
import LandingPage from './routes/LandingPage'
import Login from './routes/Login'
import NotFound from './routes/NotFound'
import { checkAuthStatus } from './utils'
import UserContext from './components/context/UserContext'

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
          <SocketProvider>
            <DashboardLayout />
          </SocketProvider>
        </UserProvider>
      }
      loader={async () => await checkAuthStatus()}
    >
      <Route
        path=""
        element={
          <Dashboard />
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
      <UserContext>
        <RouterProvider router={router} />
      </UserContext>
    </TanstackProvider>
  </StrictMode>
)