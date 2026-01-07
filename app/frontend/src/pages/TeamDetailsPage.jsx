"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, Loader2, Users } from "lucide-react"
import { fetchRepoCommits } from "@/services/api"
import { transformCommitsToDeveloperData } from "@/utils/transformers"
import ImpactMatrix from "@/components/ImpactMatrix"
import TeamHealthRadar from "@/components/TeamHealthRadar"
import SilentArchitectSpotlight from "@/components/SilentArchitectSpotlight"
import TrendAnalysis from "@/components/TrendAnalysis"
import RiskAlerts from "@/components/RiskAlerts"
import ComparativeChart from "@/components/ComparativeChart"

const TEAMS_KEY = "gitpulse_teams"

export default function TeamDetailsPage() {
   const { teamId } = useParams()
   const navigate = useNavigate()
   const [team, setTeam] = useState(null)
   const [developerData, setDeveloperData] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)

   useEffect(() => {
      const loadTeamAndData = async () => {
         try {
            // 1. Load Team from LocalStorage
            if (typeof window === "undefined") return
            const storedTeams = JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]")
            const foundTeam = storedTeams.find((t) => t.id === teamId)

            if (!foundTeam) {
               setError("Team not found")
               setLoading(false)
               return
            }

            setTeam(foundTeam)

            // 2. Fetch Data for the Team's Repo
            if (foundTeam.repo) {
               const backendData = await fetchRepoCommits(
                  foundTeam.repo.owner,
                  foundTeam.repo.repo,
                  100
               )

               // 3. Transform Data (this gives us per-developer metrics)
               const allDevelopers = transformCommitsToDeveloperData(backendData)

               // 4. Filter to Team Members Only
               const memberSet = new Set(foundTeam.members || [])
               const teamDevelopers = allDevelopers.filter(dev =>
                  memberSet.has(dev.username)
               )

               setDeveloperData(teamDevelopers)
            }
         } catch (err) {
            console.error(err)
            setError("Failed to load team data")
         } finally {
            setLoading(false)
         }
      }

      loadTeamAndData()
   }, [teamId])

   if (loading) {
      return (
         <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      )
   }

   if (error || !team) {
      return (
         <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-4">{error || "Team not found"}</h2>
            <Button onClick={() => navigate("/teams")}>Back to Teams</Button>
         </div>
      )
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  {team.name}
               </h1>
               <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
                  <div className="flex items-center gap-1">
                     <Users className="w-4 h-4" />
                     {(team.members || []).length} Members
                  </div>
                  <div className="flex items-center gap-1">
                     <Calendar className="w-4 h-4" />
                     {team.repo?.owner}/{team.repo?.repo}
                  </div>
               </div>
            </div>
         </div>

         {/* Member Avatars */}
         <div className="flex flex-wrap gap-2">
            {(team.members || []).map(member => (
               <div key={member} className="flex items-center gap-2 bg-background/50 border border-primary/20 rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-primary">{member}</span>
               </div>
            ))}
         </div>

         {developerData && developerData.length > 0 ? (
            <>
               {/* Key Metrics Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 bg-background/40 border-primary/20 backdrop-blur-sm">
                     <div className="text-muted-foreground text-sm">Team Commits</div>
                     <div className="text-2xl font-bold text-foreground">
                        {developerData.reduce((sum, d) => sum + d.totalCommits, 0)}
                     </div>
                  </Card>
                  <Card className="p-4 bg-background/40 border-primary/20 backdrop-blur-sm">
                     <div className="text-muted-foreground text-sm">Avg Impact</div>
                     <div className="text-2xl font-bold text-foreground">
                        {Math.round(developerData.reduce((sum, d) => sum + d.aiImpactScore, 0) / developerData.length)}
                     </div>
                  </Card>
                  <Card className="p-4 bg-background/40 border-primary/20 backdrop-blur-sm">
                     <div className="text-muted-foreground text-sm">Active Members</div>
                     <div className="text-2xl font-bold text-foreground">{developerData.length}</div>
                  </Card>
                  <Card className="p-4 bg-background/40 border-primary/20 backdrop-blur-sm">
                     <div className="text-muted-foreground text-sm">Total Lines</div>
                     <div className="text-2xl font-bold text-foreground">
                        {developerData.reduce((sum, d) => sum + d.linesAdded, 0).toLocaleString()}
                     </div>
                  </Card>
               </div>

               {/* Main Charts - Same as Overview */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <ImpactMatrix data={developerData} />
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <ComparativeChart data={developerData} />
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <SilentArchitectSpotlight data={developerData} />
               </motion.div>

               <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                     <TeamHealthRadar data={developerData} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                     <RiskAlerts data={developerData} />
                  </motion.div>
               </div>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <TrendAnalysis data={developerData} />
               </motion.div>
            </>
         ) : (
            <Card className="p-8 text-center">
               <p className="text-muted-foreground">No commit data found for this team's members.</p>
            </Card>
         )}
      </div>
   )
}
