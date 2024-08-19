import { redirect } from "react-router-dom"

const checkAuthStatus = async () => {
  try {
    const response = await fetch("/api/auth/check-auth", {
      credentials: "include"
    })

    if (response.status !== 200) {
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