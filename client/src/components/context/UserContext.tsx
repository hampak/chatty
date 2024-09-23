import { useUser } from "../provider/UserProvider"

const UserContext = ({ children }: { children: React.ReactNode }) => {

  const { isPending: loading, user } = useUser()

  if (loading || user === null) {
    return null
  }

  return children
}

export default UserContext