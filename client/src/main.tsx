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
      path="/login"
      element={<Login />}
    />
    <Route
      path="/dashboard"
      element={
        <UserProvider>
          <Dashboard />
        </UserProvider>
      }
      loader={async () => await checkAuthStatus()}
    />
    <Route
      path="*"
      element={<NotFound />}
    />
  </Route>
))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <UserProvider> */}
    <RouterProvider router={router} />
    <Toaster richColors />
    {/* </UserProvider> */}
  </StrictMode>
)