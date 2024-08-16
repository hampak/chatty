import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './components/RootLayout'
import './index.css'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import { checkAuthStatus } from './utils'

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<RootLayout />}>
    <Route index path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={<Dashboard />}
      loader={async () => await checkAuthStatus()}
    />
    <Route path="*" element={(
      <div>Not Found</div>
    )} />
  </Route>
))

function App() {
  return (
    <RouterProvider router={router} />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
