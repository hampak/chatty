import { createContext, useContext, useEffect, useState } from "react";

import { redirect } from "react-router-dom";
import { User } from "../../types/User";

const UserContext = createContext<{ user: User | null; loading: boolean } | undefined>(undefined)

export default function UserProvider({
  children
}: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include"
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else if (response.status === 401) {
          setUser(null)
        } else {
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