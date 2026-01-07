"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import OverviewPage from "@/components/overview-page"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return isLoggedIn ? <OverviewPage /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />
}
