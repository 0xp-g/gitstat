"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, GitCommit, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react"

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const hasData = sessionStorage.getItem("gitpulse_has_data") === "true"

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", route: "/overview", active: location.pathname === "/overview" },
    { icon: TrendingUp, label: "Heuristic", route: "/heuristic", active: location.pathname === "/heuristic" },
    { icon: Sparkles, label: "AI", route: "/ai", active: location.pathname === "/ai" },
    { icon: GitCommit, label: "Commit Feed", route: "/commits", active: location.pathname === "/commits" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 240 }}
          className="h-screen bg-card border-r border-border sticky top-0"
        >
          <div className="p-6 flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-primary">
                GitPulse
              </motion.h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="px-3 space-y-2">
            {navItems.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start"
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
