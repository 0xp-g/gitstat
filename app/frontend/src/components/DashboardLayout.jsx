"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, GitCommit, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Users } from "lucide-react"

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const hasData = sessionStorage.getItem("gitpulse_has_data") === "true"

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", route: "/overview", active: location.pathname === "/overview" },
    { icon: Users, label: "Teams", route: "/teams", active: location.pathname === "/teams" },
    { icon: TrendingUp, label: "Heuristic", route: "/heuristic", active: location.pathname === "/heuristic" },
    { icon: Sparkles, label: "AI", route: "/ai", active: location.pathname === "/ai" },
    { icon: GitCommit, label: "Commit Feed", route: "/commits", active: location.pathname === "/commits" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Neon background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 240 }}
          className="h-screen bg-card/80 backdrop-blur-xl border-r border-primary/20 sticky top-0 shadow-lg shadow-primary/10"
        >
          <div className="p-6 flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                GitPulse
              </motion.h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto hover:bg-primary/20"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="px-3 space-y-2">
            {navItems.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${item.active ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30" : "hover:bg-primary/20"}`}
                onClick={() => navigate(item.route)}
              >
                <item.icon className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
