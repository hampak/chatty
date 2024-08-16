import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <div className="w-full h-screen">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout