import { createContext, useContext, useEffect, useState } from "react";

import { User } from "../../types";

import axios from "axios";

const UserContext = createContext<{ user: User | null; loading: boolean } | null>(null)

export default function UserProvider({
  children
}: { children: React.ReactNode }) {

  const serverURL = import.meta.env.VITE_API_URL
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const checkUser = async () => {

      try {
        const response = await axios.get(serverURL ? `${serverURL}/api/user` : "/api/user", {
          withCredentials: true,
        })

        const { data, status } = response

        console.log(data)

        if (status === 200) {
          setUser(data)
        } else if (status === 401) {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [serverURL])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }

  return context
}