import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { socket } from "@/utils/io"
import { useUser } from "../context/UserProvider"

const LogoutAlert = ({ children }: { children: React.ReactNode }) => {

  const serverURL = import.meta.env.VITE_API_URL
  const { user } = useUser()

  const handleLogout = () => {
    socket.emit("logout", user?.id)

    window.location.href = `${serverURL ? `${serverURL}/api/auth/logout` : "/api/auth/logout"}`
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Would you like to log out?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* <a
            href={serverURL ? `${serverURL}/api/auth/logout` : "/api/auth/logout"}
          > */}
          <AlertDialogAction className="" onClick={handleLogout}>
            Log Out
          </AlertDialogAction>
          {/* </a> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LogoutAlert