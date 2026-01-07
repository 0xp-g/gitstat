"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import ImpactMatrix from "@/components/ImpactMatrix"
import ComparativeChart from "@/components/ComparativeChart"
import { fetchRepoCommits } from "@/services/api"
import { transformCommitsToDeveloperData } from "@/utils/transformers"

export default function OverviewPage() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/0xp-g/time_limit_exceeded_E210")
  const [dateRange, setDateRange] = useState("30")
  const [isScanning, setIsScanning] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // Load data from sessionStorage on mount
  useEffect(() => {
    const searchExecuted = sessionStorage.getItem("gitpulse_search_executed") === "true"
    const hasData = sessionStorage.getItem("gitpulse_has_data") === "true"

    if (searchExecuted && hasData) {
      const storedData = sessionStorage.getItem("gitpulse_data")
      if (storedData) {
        try {
          setData(JSON.parse(storedData))
        } catch (e) {
          setData(null)
        }
      }
    }

    // Listen for clear event
    const handleClear = () => {
      setData(null)
      setError(null)
      setRepoUrl("")
    }
    window.addEventListener("gitpulse-clear", handleClear)

    return () => {
      window.removeEventListener("gitpulse-clear", handleClear)
    }
  }, [])

  const handlePulseSearch = async () => {
    setError(null)
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL")
      return
    }

    // Parse owner/repo from URL
    // Expected format: https://github.com/owner/repo or just owner/repo
    let owner, repo;
    try {
      const parts = repoUrl.replace("https://github.com/", "").split("/");
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error("Invalid URL format");
      }
    } catch (e) {
      setError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      return;
    }

    setIsScanning(true)
    setData(null) // Clear previous data

    try {
      const rawData = await fetchRepoCommits(owner, repo, 50); // Fetch last 50 commits
      const transformedData = transformCommitsToDeveloperData(rawData);

      setData(transformedData);

      // Cache successful search
      sessionStorage.setItem("gitpulse_search_executed", "true")
      sessionStorage.setItem("gitpulse_has_data", "true")
      sessionStorage.setItem("gitpulse_data", JSON.stringify(transformedData))
    } catch (error) {
      console.error("Scanning failed:", error);
      setError(`Failed to scan repository: ${error.message || "Unknown error"}`);
    } finally {
      setIsScanning(false)
    }
  }

  const handleClearSearch = () => {
    setRepoUrl("")
    setData(null)
    setError(null)
    sessionStorage.removeItem("gitpulse_search_executed")
    sessionStorage.removeItem("gitpulse_has_data")
    sessionStorage.removeItem("gitpulse_data")
    window.dispatchEvent(new Event("gitpulse-clear"))
  }

  return (
    <>
      {/* Top Control Bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border p-6 -mt-6 -mx-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px]">
              <label className="text-sm text-muted-foreground mb-2 block">Repository URL</label>
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className={`bg-card border-white/10 ${error ? "border-red-500" : ""}`}
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


            {data && (
              <Button
                onClick={handleClearSearch}
                variant="outline"
                className="border-white/20 hover:bg-red-500/20"
              >
                Clear
              </Button>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm px-1 font-medium bg-red-500/10 p-2 rounded border border-red-500/20">
              {error}
            </div>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ImpactMatrix data={data} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ComparativeChart data={data} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
