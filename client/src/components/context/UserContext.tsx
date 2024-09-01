import { useUser } from "../provider/UserProvider"

const UserContext = ({ children }: { children: React.ReactNode }) => {

  const { loading, user } = useUser()

  if (loading || !user) {
    return null
  }

  return children
}

export default UserContext