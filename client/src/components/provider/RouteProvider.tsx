import { useState, createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteContext = {
  hash: string;
  key: string;
  pathname: string;
  search: string;
  state: boolean
} | null

const RouteContext = createContext<RouteContext>(null)

export default function RouteProvider({ children }: { children: React.ReactNode }) {

  const [currentRoute, setCurrentRoute] = useState<RouteContext>(null)

  const location = useLocation()

  useEffect(() => {
    setCurrentRoute(location)
  }, [location])

  return (
    <RouteContext.Provider value={currentRoute}>
      {children}
    </RouteContext.Provider>
  )
}

export const useCurrentRoute = () => {
  const context = useContext(RouteContext)

  if (!context) return

  return context
}