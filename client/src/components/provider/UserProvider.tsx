import { createContext, useContext } from "react";

import { User } from "../../types";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// const UserContext = createContext<{ user: User | null; loading: boolean } | null>(null)
const UserContext = createContext<{ user: User | null; isPending: boolean } | null>(null)

export default function UserProvider({
  children
}: { children: React.ReactNode }) {

  const serverURL = import.meta.env.VITE_API_URL
  // const [user, setUser] = useState<User | null>(null)
  // const [loading, setLoading] = useState(true)

  const { data, isPending, isLoading } = useQuery({
    queryKey: ["get_user"],
    queryFn: async () => {
      try {
        const response = await axios.get(serverURL ? `${serverURL}/api/user` : "/api/user", {
          withCredentials: true,
        })
        // console.log("response", response)
        return response.data
      } catch {
        return null
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000
  })

  if (isLoading) return null

  // console.log("data", data)

  return (
    // <UserContext.Provider value={{ user, loading }}>
    //   {children}
    // </UserContext.Provider>
    <UserContext.Provider value={{ user: data, isPending }}>
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