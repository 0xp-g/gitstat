"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import DashboardLayout from "./components/DashboardLayout"
import OverviewPage from "./pages/OverviewPage"
import HeuristicPage from "./pages/HeuristicPage"
import AIPage from "./pages/AIPage"
import SoftSkillsPage from "./pages/SoftSkillsPage"
import ImpactDashboard from "./pages/ImpactDashboard" // NEW
import CommitsPage from "./pages/CommitsPage"
import TeamsPage from "./pages/TeamsPage"
import TeamDetailsPage from "./pages/TeamDetailsPage"
import TeamComparisonPage from "./pages/TeamComparisonPage"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
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
        <Route path="/soft-skills" element={<SoftSkillsPage />} />
        <Route path="/impact" element={<ImpactDashboard />} /> {/* NEW */}
        <Route path="/commits" element={<CommitsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/compare" element={<TeamComparisonPage />} />
        <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
      </Routes>
    </DashboardLayout>
  )
}

export default App
