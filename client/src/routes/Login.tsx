import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card"
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

const serverURL = import.meta.env.VITE_API_URL

console.log(serverURL)

const Login = () => {
  return (
    <div className="w-full h-full flex items-center justify-center px-2">
      <Card className="w-[400px] flex flex-col items-center">
        <CardHeader className="text-xl font-semibold text-center">Welcome to Chatty :)</CardHeader>
        <CardContent className="w-full flex flex-col items-center space-y-4">
          <a
            className="flex items-center p-2 border rounded-lg px-4 w-3/4 text-center justify-evenly hover:bg-gray-100 transition-all hover:cursor-pointer"
            href={serverURL ? `${serverURL}/api/auth/google` : `/api/auth/google`}
          >
            <FaGoogle className="text-blue-500" />
            <span className="font-semibold">Start with Google</span>
          </a>
          <div className="flex items-center p-2 border rounded-lg px-4 w-3/4 text-center justify-evenly hover:bg-gray-100 transition-all hover:cursor-pointer">
            <FaGithub className="text-gray-700" />
            <span className="font-semibold">Start with Github</span>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            to="/"
            className="text-xs text-gray-700 hover:underline hover:underline-offset-1 transition-all hover:cursor-pointer"
          >
            Go Back
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login