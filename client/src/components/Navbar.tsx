import { Link } from "react-router-dom"
import { Button } from "./ui/button"

const Navbar = () => {
  return (
    <nav className="w-full p-5 border border-b flex justify-between items-center">
      <h1 className="text-xl font-semibold">Chatty</h1>
      <Button>
        <Link
          to="/login"
        >
          Get Started
        </Link>
      </Button>
    </nav>
  )
}

export default Navbar