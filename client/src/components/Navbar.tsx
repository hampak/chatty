import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { useUser } from "./context/UserProvider"
import { ImSpinner8 } from "react-icons/im";
import { useUser } from "./provider/UserProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";


const Navbar = () => {

  const { user, isPending: loading } = useUser()

  return (
    <nav className="w-full p-5 border border-b flex justify-between items-center">
      <h1 className="text-xl font-semibold">Chatty</h1>
      {
        loading ? (
          <ImSpinner8 className="animate-spin h-6 w-6 text-gray-700" />
        ) : (
          user ? (
            <Button className="">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.picture} />
                </Avatar>
                <p>
                  Dashboard
                </p>
              </Link>
            </Button >
          ) : (
            <Button>
              <Link
                to="/login"
              >
                Get Started
              </Link>
            </Button >
          )
        )
      }
      {/* {
        !user || loading ? (
          <Button>
            <ImSpinner8 className="animate-spin h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user.picture} />
              </Avatar>
              <p>
                Dashboard
              </p>
            </Link>
          </Button>
        )
      } */}
    </nav >
  )
}

export default Navbar