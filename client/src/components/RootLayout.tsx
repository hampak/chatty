import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <main className="w-full h-screen bg-red-200s">
      <Outlet />
    </main>
  )
}

export default RootLayout