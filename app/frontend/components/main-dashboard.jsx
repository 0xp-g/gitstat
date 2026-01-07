"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, GitCommit, Settings, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import ImpactMatrix from "@/components/impact-matrix"
import HeuristicPanel from "@/components/heuristic-panel"
import AIInsightsPanel from "@/components/ai-insights-panel"
import ComparativeChart from "@/components/comparative-chart"
import { generateMockData } from "@/utils/mock-engine"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: GitCommit, label: "Commit Feed", active: false },
  { icon: Settings, label: "Settings", active: false },
]

export default function MainDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [dateRange, setDateRange] = useState("30")
  const [isScanning, setIsScanning] = useState(false)
  const [data, setData] = useState(null)
  const [activeMainTab, setActiveMainTab] = useState("heuristic")

  const handlePulseSearch = () => {
    setIsScanning(true)
    setTimeout(() => {
      setData(generateMockData())
      setIsScanning(false)
    }, 2000)
  }

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
              <Button key={i} variant={item.active ? "secondary" : "ghost"} className="w-full justify-start">
                <item.icon className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Control Bar */}
          <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                  <label className="text-sm text-muted-foreground mb-2 block">Repository URL</label>
                  <Input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="bg-card border-white/10"
                  />
                </div>

                <div className="w-40">
                  <label className="text-sm text-muted-foreground mb-2 block">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-card border border-white/10 text-foreground"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="20">Last 20 days</option>
                    <option value="30">Last 30 days</option>
                  </select>
                </div>

                <Button
                  onClick={handlePulseSearch}
                  disabled={isScanning}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Pulse Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {!data ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-[60vh]"
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Discover Impact</h3>
                    <p className="text-muted-foreground">Enter a repository URL and click Pulse Search to begin</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Impact Matrix */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ImpactMatrix data={data} />
                  </motion.div>

                  <div className="flex gap-4 border-b border-white/10 pb-2">
                    <button
                      onClick={() => setActiveMainTab("heuristic")}
                      className={`px-8 py-4 rounded-t-lg text-base font-bold transition-all ${
                        activeMainTab === "heuristic"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                          : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60"
                      }`}
                    >
                      Heuristic
                    </button>
                    <button
                      onClick={() => setActiveMainTab("ai")}
                      className={`px-8 py-4 rounded-t-lg text-base font-bold transition-all ${
                        activeMainTab === "ai"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                          : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60"
                      }`}
                    >
                      AI
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeMainTab === "heuristic" ? (
                      <motion.div
                        key="heuristic"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <HeuristicPanel data={data} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ai"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AIInsightsPanel data={data} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Comparative Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ComparativeChart data={data} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
