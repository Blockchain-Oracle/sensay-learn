"use client"

import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { syncUser } from "@/lib/auth/user-sync-action"

export function useAuth() {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await login()
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sync user with database when authenticated
  useEffect(() => {
    if (authenticated && user && ready) {
      syncUser(user).catch(console.error)
    }
  }, [authenticated, user, ready])

  return {
    ready,
    authenticated,
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  }
}
