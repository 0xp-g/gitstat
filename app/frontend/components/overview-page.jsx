"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import ImpactMatrix from "@/components/impact-matrix"
import ComparativeChart from "@/components/comparative-chart"
import { generateMockData } from "@/utils/mock-engine"
import DashboardLayout from "@/components/dashboard-layout"
import { useRepositoryData } from "@/hooks/useRepositoryData"

export default function OverviewPage() {
  const router = useRouter()
  const { data, setRepositoryData, clearRepositoryData, setIsLoading, isLoading } = useRepositoryData()
  const [repoUrl, setRepoUrl] = useState("")
  const [dateRange, setDateRange] = useState("30")
  const [isScanning, setIsScanning] = useState(false)

  // Initialize from stored data
  useEffect(() => {
    // Component is mounted, data should be loaded from hook
  }, [])

  const handlePulseSearch = () => {
    if (!repoUrl.trim()) {
      alert("Please enter a repository URL")
      return
    }
    setIsScanning(true)
    setTimeout(() => {
      const mockData = generateMockData()
      setRepositoryData(mockData)
      setIsScanning(false)
    }, 2000)
  }

  const handleClear = () => {
    setRepoUrl("")
    clearRepositoryData()
  }

  return (
    <DashboardLayout activeRoute="overview">
      {/* Top Control Bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border p-6 -mt-6 -mx-6 mb-6">
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
            disabled={isScanning || !repoUrl.trim()}
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

          {data && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ImpactMatrix data={data} />
            </motion.div>

            {/* Comparative Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ComparativeChart data={data} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
