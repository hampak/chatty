import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"

const RootLayout = () => {
  return (
    <main className="w-full h-screen bg-red-200s">
      <Outlet />
      <Toaster richColors={true} />
    </main>
  )
}

export default RootLayout