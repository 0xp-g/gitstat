"use client"

import { useEffect, useState } from "react"
import { generateMockData } from "@/utils/mock-engine"
import { Card } from "@/components/ui/card"
import { GitCommit, Calendar } from "lucide-react"
import { motion } from "framer-motion"

export default function CommitsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if search was actually executed
    const checkData = () => {
      const searchExecuted = sessionStorage.getItem("gitpulse_search_executed") === "true"

      if (!searchExecuted) {
        setData(null)
        setLoading(false)
        return
      }

      const hasData = sessionStorage.getItem("gitpulse_has_data") === "true"
      const storedData = sessionStorage.getItem("gitpulse_data")

      if (hasData && storedData) {
        try {
          setData(JSON.parse(storedData))
        } catch (e) {
          setData(null)
        }
      } else {
        setData(null)
      }
      setLoading(false)
    }

    checkData()

    // Listen for clear event
    const handleClear = () => {
      setData(null)
    }
    window.addEventListener("gitpulse-clear", handleClear)

    // Listen for storage changes
    const handleStorageChange = () => {
      checkData()
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("gitpulse-clear", handleClear)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const allCommits = data
    ? data
      .flatMap((contributor) =>
        (contributor.productionCommits || []).map((commit) => ({
          ...commit,
          username: contributor.username,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        })),
      )
      .sort((a, b) => b.impact - a.impact)
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return data ? (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commit Feed</h1>
          <p className="text-muted-foreground mt-2">Real-time feed of high-impact commits</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{allCommits.length}</div>
          <div className="text-sm text-muted-foreground">Total Commits</div>
        </div>
      </div>

      <div className="grid gap-4">
        {allCommits.map((commit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <GitCommit className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">{commit.username}</span>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      Impact: {commit.impact}
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-md border border-white/5 mb-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Commit Message</p>
                    <p className="text-sm text-foreground font-mono whitespace-pre-wrap">{commit.message}</p>
                    {commit.summary && commit.summary !== "Waiting for AI analysis..." && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 text-primary">AI Insight</p>
                        <p className="text-sm text-muted-foreground italic">{commit.summary}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {commit.date}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Please run Pulse Search from the Overview page</p>
      </div>
    </div>
  )
}
