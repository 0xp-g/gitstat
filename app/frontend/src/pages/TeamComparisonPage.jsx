"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2, Check, BarChart2 } from "lucide-react"
import { fetchRepoCommits } from "@/services/api"
import { transformCommitsToDeveloperData } from "@/utils/transformers"
import ComparativeChart from "@/components/ComparativeChart"
import TeamHealthRadar from "@/components/TeamHealthRadar"

const TEAMS_KEY = "gitpulse_teams"

export default function TeamComparisonPage() {
   const navigate = useNavigate()
   const [teams, setTeams] = useState([])
   const [selectedTeamIds, setSelectedTeamIds] = useState([])
   const [comparisonData, setComparisonData] = useState(null)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState(null)

   useEffect(() => {
      if (typeof window === "undefined") return
      setTeams(JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]"))
   }, [])

   const toggleTeam = (id) => {
      setSelectedTeamIds(prev =>
         prev.includes(id)
            ? prev.filter(t => t !== id)
            : [...prev, id]
      )
   }

   const handleCompare = async () => {
      if (selectedTeamIds.length < 2) {
         setError("Select at least 2 teams to compare")
         return
      }

      setLoading(true)
      setError(null)

      try {
         const selectedTeams = teams.filter(t => selectedTeamIds.includes(t.id))

         // Group teams by repo to minimize API calls
         const repoCache = {}

         const teamsWithMetrics = await Promise.all(selectedTeams.map(async (team) => {
            const repoKey = `${team.repo.owner}/${team.repo.repo}`

            // Fetch or reuse cached repo data
            if (!repoCache[repoKey]) {
               repoCache[repoKey] = await fetchRepoCommits(team.repo.owner, team.repo.repo, 100)
            }

            const backendData = repoCache[repoKey]
            const allDevelopers = transformCommitsToDeveloperData(backendData)

            // Filter to team members
            const memberSet = new Set(team.members || [])
            const teamDevelopers = allDevelopers.filter(d => memberSet.has(d.username))

            // Calculate aggregate team metrics
            const totalCommits = teamDevelopers.reduce((sum, d) => sum + d.totalCommits, 0)
            const totalHeuristic = teamDevelopers.reduce((sum, d) => sum + (d.heuristicScore || 0), 0)
            const totalAiImpact = teamDevelopers.reduce((sum, d) => sum + (d.aiImpactScore || 0), 0)
            const avgHeuristic = teamDevelopers.length > 0 ? totalHeuristic / teamDevelopers.length : 0
            const avgAiImpact = teamDevelopers.length > 0 ? totalAiImpact / teamDevelopers.length : 0

            return {
               ...team,
               developers: teamDevelopers,
               metrics: {
                  totalCommits,
                  avgHeuristic: Math.round(avgHeuristic),
                  avgAiImpact: Math.round(avgAiImpact),
                  memberCount: teamDevelopers.length
               },
               // Data for ComparativeChart (expects username, heuristicScore, aiImpactScore)
               chartData: {
                  username: team.name,
                  heuristicScore: avgHeuristic,
                  aiImpactScore: avgAiImpact
               }
            }
         }))

         setComparisonData(teamsWithMetrics)

      } catch (err) {
         console.error(err)
         setError("Failed to fetch comparison data")
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="flex items-center justify-between">
            <div>
               <Button
                  variant="ghost"
                  className="pl-0 hover:bg-transparent hover:text-primary mb-2"
                  onClick={() => navigate("/teams")}
               >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Teams
               </Button>
               <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Team Comparison
               </h1>
            </div>
         </div>

         {/* Selection Area */}
         <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Select Teams to Compare</h3>
            <div className="flex flex-wrap gap-3 mb-6">
               {teams.map(team => (
                  <div
                     key={team.id}
                     onClick={() => toggleTeam(team.id)}
                     className={`
                        cursor-pointer px-4 py-2 rounded-lg border transition-all flex items-center gap-2
                        ${selectedTeamIds.includes(team.id)
                           ? "bg-primary/20 border-primary text-primary"
                           : "bg-background/50 border-white/10 hover:border-white/20"}
                     `}
                  >
                     {selectedTeamIds.includes(team.id) ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                     <span className="font-medium">{team.name}</span>
                     <span className="text-xs text-muted-foreground ml-1">({team.repo?.repo})</span>
                  </div>
               ))}

               {teams.length === 0 && (
                  <p className="text-muted-foreground">No teams available. Create some teams first.</p>
               )}
            </div>

            <Button
               onClick={handleCompare}
               disabled={selectedTeamIds.length < 2 || loading}
               className="bg-gradient-to-r from-primary to-secondary text-white"
            >
               {loading ? (
                  <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Comparing...
                  </>
               ) : (
                  <>
                     <BarChart2 className="w-4 h-4 mr-2" />
                     Compare Selected ({selectedTeamIds.length})
                  </>
               )}
            </Button>

            {error && (
               <div className="mt-4 text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
                  {error}
               </div>
            )}
         </Card>

         {/* Results Area */}
         {comparisonData && (
            <div className="space-y-8">
               {/* 1. Bar Chart Comparison */}
               <ComparativeChart data={comparisonData.map(d => d.chartData)} />

               {/* 2. Side-by-Side Team Cards */}
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparisonData.map(team => (
                     <Card key={team.id} className="p-5 backdrop-blur-md bg-card/40 border-primary/10">
                        <div className="text-center mb-4">
                           <h3 className="font-bold text-lg text-primary">{team.name}</h3>
                           <p className="text-xs text-muted-foreground">{team.repo?.owner}/{team.repo?.repo}</p>
                        </div>

                        <div className="h-[250px] mb-4">
                           <TeamHealthRadar data={team.developers} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                           <div className="bg-background/40 p-2 rounded">
                              <div className="text-muted-foreground text-xs">Commits</div>
                              <div className="font-bold">{team.metrics.totalCommits}</div>
                           </div>
                           <div className="bg-background/40 p-2 rounded">
                              <div className="text-muted-foreground text-xs">Members</div>
                              <div className="font-bold">{team.metrics.memberCount}</div>
                           </div>
                           <div className="bg-background/40 p-2 rounded">
                              <div className="text-muted-foreground text-xs">Avg Heuristic</div>
                              <div className="font-bold">{team.metrics.avgHeuristic}</div>
                           </div>
                           <div className="bg-background/40 p-2 rounded">
                              <div className="text-muted-foreground text-xs">Avg Impact</div>
                              <div className="font-bold">{team.metrics.avgAiImpact}</div>
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
