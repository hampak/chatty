import { useUser } from "@/components/provider/UserProvider"

const Dashboard = () => {

  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <div className="bg-blue-100s h-full w-full flex items-center justify-center">
      <span className="text-lg font-semibold">
        Hello :) Create or continue with a chat!
        {user.id}
      </span>
    </div>
  )
}

export default Dashboard