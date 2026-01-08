"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Bug, GitCommit, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function AIInsightsPanel({ data }) {
  const [activeTab, setActiveTab] = useState("production")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const productionLogic = data
    .filter((d) => d.productionCommits && d.productionCommits.length > 0)
    .flatMap((d) =>
      d.productionCommits.map((commit) => ({
        username: d.username,
        ...commit,
      })),
    )
    .sort((a, b) => b.impact - a.impact)

  const issueResolutions = data
    .filter((d) => d.solvedIssues && d.solvedIssues.length > 0)
    .flatMap((d) =>
      d.solvedIssues.map((issue) => ({
        username: d.username,
        ...issue,
      })),
    )
    .sort((a, b) => b.complexity - a.complexity)

  const currentData = activeTab === "production" ? productionLogic : issueResolutions
  const totalPages = Math.ceil(currentData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = currentData.slice(startIndex, endIndex)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const commitCategoryData = [
    { name: "Production Logic", value: productionLogic.length, color: "#a855f7" },
    { name: "Bug Fixes", value: issueResolutions.length, color: "#f472b6" },
    { name: "Refactoring", value: data.filter((d) => d.linesDeleted > d.linesAdded).length, color: "#22d3ee" },
    { name: "Feature Work", value: data.filter((d) => d.totalCommits > 20).length, color: "#facc15" },
  ]

  const aiImpactData = data
    .map((contributor) => {
      const totalAIImpact =
        (contributor.productionCommits?.reduce((sum, c) => sum + c.impact, 0) || 0) +
        (contributor.solvedIssues?.reduce((sum, i) => sum + i.complexity * 10, 0) || 0)
      return {
        name: contributor.username,
        impact: totalAIImpact,
      }
    })
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 6)

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-2">Semantic impact analysis and intelligent code assessment</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTabChange("production")}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "production"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
            : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
        >
          Production Logic
        </button>
        <button
          onClick={() => handleTabChange("issues")}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "issues"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
            : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
        >
          Issue Resolutions
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Insights List */}
        <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {activeTab === "production" ? "Production Logic" : "Issue Resolutions"}
            </h2>
            <p className="text-sm text-muted-foreground">Semantic impact analysis</p>
          </div>

          <div className="space-y-3 mb-6">
            {activeTab === "production" ? (
              <>
                {paginatedData.map((commit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-background/50 border border-white/10 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <GitCommit className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{commit.username}</span>
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                            Impact: {commit.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1 whitespace-pre-wrap font-mono text-xs bg-black/40 p-2 rounded border border-white/5">{commit.message}</p>
                        {commit.summary && commit.summary !== "Waiting for AI analysis..." && (
                          <p className="text-xs text-muted-foreground line-clamp-2 italic border-l-2 border-primary/30 pl-2">
                            AI: {commit.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                {paginatedData.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-background/50 border border-white/10 hover:border-destructive/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <Bug className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{issue.username}</span>
                          <Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                            #{issue.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Complexity:</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < issue.complexity ? "bg-destructive" : "bg-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] h-10 px-3 rounded-md transition-all ${currentPage === page
                      ? "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/50"
                      : "bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10 h-[450px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-foreground" />
                Commit Category Distribution
              </h2>
              <p className="text-sm text-muted-foreground">Breakdown of work types</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commitCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#a855f7"
                    dataKey="value"
                  >
                    {commitCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 10%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Detected Impact by Contributor
              </h2>
              <p className="text-sm text-muted-foreground">Combined semantic impact scores</p>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiImpactData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 10%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="impact" fill="#22d3ee" name="AI Impact Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
