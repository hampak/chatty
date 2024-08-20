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
    <Route index element={<LandingPage />} />
    <Route
      path="/login"
      element={<Login />}
    />
    <Route
      path="/dashboard"
      element={<Dashboard />}
      loader={async () => await checkAuthStatus()}
    />
    <Route
      path="*"
      element={<NotFound />}
    />
  </Route>
))

function App() {
  return (
    <RouterProvider router={router} />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
      <Toaster richColors />
    </UserProvider>
  </StrictMode>,
)
