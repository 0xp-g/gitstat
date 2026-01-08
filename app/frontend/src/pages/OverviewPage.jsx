"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import ImpactMatrix from "@/components/ImpactMatrix"
import ComparativeChart from "@/components/ComparativeChart"
import SilentArchitectSpotlight from "@/components/SilentArchitectSpotlight"
import TeamHealthRadar from "@/components/TeamHealthRadar"
import TrendAnalysis from "@/components/TrendAnalysis"
import RiskAlerts from "@/components/RiskAlerts"
import { fetchRepoCommits, fetchClosedIssues, analyzeCommit } from "@/services/api"
import { transformCommitsToDeveloperData } from "@/utils/transformers"

export default function OverviewPage() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/0xp-g/time_limit_exceeded_E210")
  const [dateRange, setDateRange] = useState("30")
  const [commitLimit, setCommitLimit] = useState("50")
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
      const limit = parseInt(commitLimit) || 50;

      // Fetch data in parallel (fast mode, no AI Analysis initially)
      const [rawData, issuesData] = await Promise.all([
        fetchRepoCommits(owner, repo, limit, false),
        fetchClosedIssues(repoUrl, 30) // Limit issues to 30 for now
      ]);

      // 1. Immediate Render with Heuristic Data
      const transformedData = transformCommitsToDeveloperData(rawData, issuesData);
      setData(transformedData);

      // Cache initial results
      sessionStorage.setItem("gitpulse_search_executed", "true")
      sessionStorage.setItem("gitpulse_has_data", "true")
      sessionStorage.setItem("gitpulse_data", JSON.stringify(transformedData))

      setIsScanning(false) // Stop global loading spinner, allowing UI to show

      // 2. Progressive Hydration (Background AI Analysis)
      // Iterate through commits and enrich them
      let currentCommits = [...rawData.commits];

      // We'll process them sequentially to avoid overwhelming the 3-semaphore backend
      // and to provide a smooth "streaming" update effect.
      for (let i = 0; i < currentCommits.length; i++) {
        try {
          // Check if we need to analyze (skip if we already have Real AI data from cache)
          const commitAnalysis = currentCommits[i].analysis;
          if (commitAnalysis && commitAnalysis.analysis_type === "ai") {
            continue;
          }

          const enrichedAnalysis = await analyzeCommit(currentCommits[i]);

          // Update the specific commit
          currentCommits[i] = { ...currentCommits[i], analysis: enrichedAnalysis };

          // Re-transform with new data
          const updatedData = transformCommitsToDeveloperData({ ...rawData, commits: currentCommits }, issuesData);

          // Update UI
          setData(updatedData);

          // Update Cache
          sessionStorage.setItem("gitpulse_data", JSON.stringify(updatedData));

        } catch (e) {
          console.error(`Failed to analyze commit ${currentCommits[i].sha}:`, e);
          // Continue to next even if one fails
        }
      }

    } catch (error) {
      console.error("Scanning failed:", error);
      setError(`Failed to scan repository: ${error.message || "Unknown error"}`);
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

            <div className="w-32">
              <label className="text-sm text-muted-foreground mb-2 block">No. of Commits</label>
              <Input
                type="number"
                value={commitLimit}
                onChange={(e) => setCommitLimit(e.target.value)}
                placeholder="50"
                min="1"
                max="100"
                className="bg-card border-white/10"
              />
            </div>

            <Button
              onClick={handlePulseSearch}
              disabled={isScanning}
              className="bg-foreground text-background hover:bg-foreground/90 shadow-lg"
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
                className="border-white/20 hover:bg-secondary/20"
              >
                Clear
              </Button>
            )}
          </div>
          {error && (
            <div className="text-destructive text-sm px-1 font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
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

            {/* New Dashboard Panels */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <SilentArchitectSpotlight data={data} />
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <TeamHealthRadar data={data} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <RiskAlerts data={data} />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <TrendAnalysis data={data} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
