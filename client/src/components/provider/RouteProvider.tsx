import { socket } from "@/utils/io";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "./UserProvider";

interface RouteContext {
  currentRoute: {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state: boolean
  } | null;
  isConnected: boolean
}

type CurrentRouteValue = {
  hash: string;
  key: string;
  pathname: string;
  search: string;
  state: boolean
} | null

const RouteContext = createContext<RouteContext | undefined>(undefined)

export default function RouteProvider({ children }: { children: React.ReactNode }) {

  const [currentRoute, setCurrentRoute] = useState<CurrentRouteValue | null>(null)
  const previousChatroomId = useRef<string | undefined>(undefined)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useUser()

  const location = useLocation()

  useEffect(() => {

    if (user === null) return

    setCurrentRoute(location)

    const chatroomId = location.pathname.includes("/chat/")
      ? location.pathname.split("/chat/")[1]
      : null;

    // when user navigates to a page other than a chatroom (which includes the dashboard page + not found page etc)
    if (!chatroomId && previousChatroomId.current) {
      console.log("User navigated out of current chatroom to dashboard or other page!");
      socket.emit("leaveChatroom", previousChatroomId.current, user.id);
      previousChatroomId.current = undefined;
      setIsConnected(false)
    }

    // when user navigates from a chatroom to another chatroom
    if (chatroomId && chatroomId !== previousChatroomId.current) {
      console.log("User navigated to a new chatroom!")

      if (previousChatroomId.current) {
        socket.emit("leaveChatroom", previousChatroomId.current, user.id)
      }

      socket.emit("connectedToRoom", chatroomId, user.id)

      socket.off("joinedChatroom")

      socket.on("joinedChatroom", () => {
        console.log("Joined chatroom:", chatroomId);
        setIsConnected(true)
        previousChatroomId.current = chatroomId;
      });
    }

    return () => {
      socket.off("joinedChatroom")
      socket.off("connectedToRoom")
    }
  }, [location, user])

  return (
    <RouteContext.Provider value={{ currentRoute, isConnected }}>
      {children}
    </RouteContext.Provider>
  )
}

export const useCurrentRoute = () => {
  const context = useContext(RouteContext)

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context
}