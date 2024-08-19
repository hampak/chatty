import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { useUser } from "./context/UserProvider"
import { ImSpinner8 } from "react-icons/im";


const Navbar = () => {

  const { user, loading } = useUser()

  console.log(user)

  return (
    <nav className="w-full p-5 border border-b flex justify-between items-center">
      <h1 className="text-xl font-semibold">Chatty</h1>
      {
        loading ? (
          <ImSpinner8 className="animate-spin h-6 w-6 text-gray-700" />
        ) : (
          user ? (
            <Button>
              <Link
                to="/dashboard"
              >
                Dashboard
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
    </nav >
  )
}

export default Navbar