import { redirect } from "react-router-dom"

const checkAuthStatus = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/auth/check-auth", {
      credentials: "include",
      method: "GET"
    })

    if (response.ok) {
      const data = await response.json()
      return {
        user: data
      }
    } else {
      throw redirect("/login")
    }
  } catch (error) {
    throw redirect("/login")
  }
}

export {
  checkAuthStatus
}