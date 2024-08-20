import { Link } from "react-router-dom"

const NotFound = () => {

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <span className="mb-2">Oops! This page doesn't seem to exist :(</span>
        <Link
          to="/dashboard"
          className="text-lg hover:underline hover:underline-offset-1 transition-all hover:cursor-pointer text-center w-fit p-2 bg-black text-white rounded-lg"
        >
          Go Back to you Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound