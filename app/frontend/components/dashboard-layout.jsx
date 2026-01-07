"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, GitCommit, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRepositoryData } from "@/hooks/useRepositoryData"

export default function DashboardLayout({ children, activeRoute }) {
  const router = useRouter()
  const { hasData } = useRepositoryData()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", route: "/dashboard/overview", active: activeRoute === "overview" },
    {
      icon: TrendingUp,
      label: "Heuristic",
      route: "/dashboard/heuristic",
      active: activeRoute === "heuristic",
    },
    { icon: Sparkles, label: "AI", route: "/dashboard/ai", active: activeRoute === "ai" },
    {
      icon: GitCommit,
      label: "Commit Feed",
      route: "/dashboard/commits",
      active: activeRoute === "commits",
    },
  ]

  if (!mounted) return null

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
                onClick={() => router.push(item.route)}
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
