import { createContext, useContext, useEffect, useState } from "react";

import { redirect } from "react-router-dom";
import { User } from "../../types";

import axios from "axios"

const UserContext = createContext<{ user: User | null; loading: boolean } | undefined>(undefined)

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
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw redirect("/login")
  }

  return context
}