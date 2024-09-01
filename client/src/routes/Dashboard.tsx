import { useUser } from "@/components/provider/UserProvider"

const Dashboard = () => {

  const { user } = useUser()

  return (
    <div className="bg-blue-100s h-full w-full flex items-center justify-center">
      <span className="text-lg font-semibold">
        Hello :) Create or continue with a chat!
        {user ? user.id : "Not fetched yet"}
      </span>
    </div>
  )
}

export default Dashboard