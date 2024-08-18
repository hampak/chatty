import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <main className="w-full h-screen">
      <Outlet />
    </main>
  )
}

export default RootLayout