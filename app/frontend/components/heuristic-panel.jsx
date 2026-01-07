"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp, Code, ChevronLeft, ChevronRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function HeuristicPanel({ data }) {
  const sortedData = [...data].sort((a, b) => b.heuristicScore - a.heuristicScore)

  const [currentPage, setCurrentPage] = useState(1)
  const contributorsPerPage = 10
  const totalPages = Math.ceil(sortedData.length / contributorsPerPage)

  const startIndex = (currentPage - 1) * contributorsPerPage
  const endIndex = startIndex + contributorsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const churnData = sortedData.slice(0, 8).map((contributor) => ({
    name: contributor.username,
    added: contributor.linesAdded,
    deleted: contributor.linesDeleted,
  }))

  const impactTrendData = sortedData.slice(0, 8).map((contributor) => ({
    name: contributor.username,
    score: contributor.heuristicScore,
  }))

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
        <h1 className="text-3xl font-bold">Heuristic Analysis</h1>
        <p className="text-muted-foreground mt-2">Structural intensity and code impact metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rankings List */}
        <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Contributors
            </h2>
            <p className="text-sm text-muted-foreground">Ranked by structural intensity</p>
          </div>

          <div className="space-y-3 mb-6">
            {paginatedData.map((contributor, index) => {
              const isRefactorKing = contributor.linesDeleted > contributor.linesAdded * 2

              return (
                <motion.div
                  key={contributor.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-background/50 border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{contributor.username}</span>
                        {isRefactorKing && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Refactor King
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{contributor.quadrant}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{contributor.heuristicScore}</div>
                      <div className="text-xs text-muted-foreground">Impact Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Commits</div>
                      <div className="font-medium">{contributor.totalCommits}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Added</div>
                      <div className="font-medium text-green-500">+{contributor.linesAdded}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Deleted</div>
                      <div className="font-medium text-red-500">-{contributor.linesDeleted}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
                    className={`min-w-[40px] h-10 px-3 rounded-md transition-all ${
                      currentPage === page
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
          <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-green-500" />
                Code Churn Analysis
              </h2>
              <p className="text-sm text-muted-foreground">Lines added vs deleted</p>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="added" fill="#10b981" name="Lines Added" />
                  <Bar dataKey="deleted" fill="#ef4444" name="Lines Deleted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Impact Score Comparison
              </h2>
              <p className="text-sm text-muted-foreground">Top contributors by score</p>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={impactTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    name="Impact Score"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
