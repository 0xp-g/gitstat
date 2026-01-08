"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import DashboardLayout from "./components/DashboardLayout"
import OverviewPage from "./pages/OverviewPage"
import HeuristicPage from "./pages/HeuristicPage"
import AIPage from "./pages/AIPage"
import CommitsPage from "./pages/CommitsPage"
import TeamsPage from "./pages/TeamsPage"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Only clear data once on the very first login, not on subsequent renders
    if (isLoggedIn && !hasInitialized) {
      sessionStorage.removeItem("gitpulse_search_executed")
      sessionStorage.removeItem("gitpulse_has_data")
      sessionStorage.removeItem("gitpulse_data")
      // Always redirect to overview on login
      navigate("/overview", { replace: true })
      setHasInitialized(true)
    }
  }, [isLoggedIn, hasInitialized, navigate])

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/heuristic" element={<HeuristicPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/commits" element={<CommitsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </DashboardLayout>
  )
}

export default App
