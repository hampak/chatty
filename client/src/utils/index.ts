import axios from "axios"
import { redirect } from "react-router-dom"

const serverURL = import.meta.env.VITE_API_URL

const checkAuthStatus = async () => {
  try {
    const response = await axios.get(serverURL ? `${serverURL}/api/auth/check-auth` : "/api/auth/check-auth",
      {
        withCredentials: true
      })

    const { status } = response

    if (status !== 200) {
      throw redirect("/login")
    }

    return null
  } catch {
    throw redirect("/login")
  }
}

export {
  checkAuthStatus
}