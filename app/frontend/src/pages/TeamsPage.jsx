"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Users, Search, Loader2, FolderGit2, Trash2, Edit } from "lucide-react"
import ContributorSelector from "@/components/ContributorSelector"
import { fetchContributors } from "@/services/api"

// Helper functions for localStorage
const TEAMS_KEY = "gitpulse_teams"

const getTeams = () => {
   try {
      if (typeof window === "undefined") return []
      const stored = localStorage.getItem(TEAMS_KEY)
      return stored ? JSON.parse(stored) : []
   } catch (e) {
      return []
   }
}

const saveTeams = (teams) => {
   try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams))
   } catch (e) {
      console.error("Failed to save teams:", e)
   }
}

export default function TeamsPage() {
   const navigate = useNavigate()
   const [teams, setTeams] = useState(() => getTeams())
   const [repoUrl, setRepoUrl] = useState("")
   const [contributors, setContributors] = useState([])
   const [selectedContributors, setSelectedContributors] = useState([])
   const [teamName, setTeamName] = useState("")
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
   const [currentRepo, setCurrentRepo] = useState(null)

   const handleFetchContributors = async () => {
      setError(null)
      if (!repoUrl.trim()) {
         setError("Please enter a repository URL")
         return
      }

      // Parse owner/repo from URL
      let owner, repo
      try {
         const parts = repoUrl.replace("https://github.com/", "").split("/")
         if (parts.length >= 2) {
            owner = parts[0]
            repo = parts[1]
         } else {
            throw new Error("Invalid URL format")
         }
      } catch (e) {
         setError("Invalid GitHub URL. Use format: https://github.com/owner/repo")
         return
      }

      setIsLoading(true)
      setContributors([])
      setSelectedContributors([])

      try {
         const data = await fetchContributors(owner, repo)
         setContributors(data.contributors)
         setCurrentRepo({ owner, repo })
      } catch (error) {
         setError(`Failed to fetch contributors: ${error.message}`)
      } finally {
         setIsLoading(false)
      }
   }

   const handleCreateTeam = () => {
      if (!teamName.trim() || selectedContributors.length === 0) return

      const newTeam = {
         id: `team-${Date.now()}`,
         name: teamName.trim(),
         repo: currentRepo,
         members: selectedContributors,
         createdAt: new Date().toISOString(),
      }

      const updatedTeams = [...teams, newTeam]
      setTeams(updatedTeams)
      saveTeams(updatedTeams)

      // Reset form
      setTeamName("")
      setSelectedContributors([])
   }

   const handleDeleteTeam = (teamId) => {
      const updatedTeams = teams.filter((t) => t.id !== teamId)
      setTeams(updatedTeams)
      saveTeams(updatedTeams)
   }

   return (
      <>
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
               Squad Management
            </h1>
            <p className="text-muted-foreground mt-2">
               Fetch contributors from a repo and split them into teams
            </p>
            <div className="flex gap-4 mt-4">
               <Button
                  variant="outline"
                  onClick={() => navigate("/teams/compare")}
                  className="border-primary/20 hover:bg-primary/10"
               >
                  <Users className="w-4 h-4 mr-2" />
                  Compare Teams
               </Button>
            </div>
         </div>

         {/* Repo Input Section */}
         <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[300px]">
                  <label className="text-sm text-muted-foreground mb-2 block">Repository URL</label>
                  <Input
                     value={repoUrl}
                     onChange={(e) => setRepoUrl(e.target.value)}
                     placeholder="https://github.com/owner/repo"
                     className="bg-background/50 border-primary/30"
                  />
               </div>
               <Button
                  onClick={handleFetchContributors}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
               >
                  {isLoading ? (
                     <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                     </>
                  ) : (
                     <>
                        <Search className="w-4 h-4 mr-2" />
                        Fetch Contributors
                     </>
                  )}
               </Button>
            </div>
            {error && (
               <div className="mt-3 text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
                  {error}
               </div>
            )}
         </Card>

         {/* Contributors & Team Creation */}
         {contributors.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
               {/* Contributors List */}
               <ContributorSelector
                  contributors={contributors}
                  selectedContributors={selectedContributors}
                  onSelectionChange={setSelectedContributors}
               />

               {/* Team Creation Form */}
               <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                     <Plus className="w-4 h-4 text-primary" />
                     Create Team from Selection
                  </h3>

                  <div className="space-y-4">
                     <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Team Name</label>
                        <Input
                           value={teamName}
                           onChange={(e) => setTeamName(e.target.value)}
                           placeholder="e.g., Frontend Squad"
                           className="bg-background/50 border-primary/30"
                        />
                     </div>

                     <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                        <div className="text-sm text-muted-foreground mb-1">Repository</div>
                        <div className="flex items-center gap-2 text-foreground">
                           <FolderGit2 className="w-4 h-4 text-primary" />
                           {currentRepo?.owner}/{currentRepo?.repo}
                        </div>
                     </div>

                     <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                        <div className="text-sm text-muted-foreground mb-1">Members</div>
                        <div className="flex items-center gap-2 text-foreground">
                           <Users className="w-4 h-4 text-primary" />
                           {selectedContributors.length} selected
                        </div>
                     </div>

                     <Button
                        onClick={handleCreateTeam}
                        disabled={!teamName.trim() || selectedContributors.length === 0}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                     >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Team
                     </Button>
                  </div>
               </Card>
            </div>
         )}

         {/* Existing Teams */}
         <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Your Teams ({teams.length})</h2>
         </div>

         {teams.length === 0 ? (
            <Card className="p-8 backdrop-blur-md bg-card/60 border-primary/20 text-center">
               <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
               <p className="text-muted-foreground">No teams yet. Fetch contributors to create your first team.</p>
            </Card>
         ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
               {teams.map((team, index) => (
                  <motion.div
                     key={team.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                  >
                     <Card
                        onClick={() => navigate(`/teams/${team.id}`)}
                        className="p-5 backdrop-blur-md bg-card/60 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:scale-[1.02]"
                     >
                        <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                 <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-foreground">{team.name}</h3>
                                 <p className="text-xs text-muted-foreground">
                                    {team.repo?.owner}/{team.repo?.repo}
                                 </p>
                              </div>
                           </div>
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                 e.stopPropagation()
                                 handleDeleteTeam(team.id)
                              }}
                              className="h-8 w-8 hover:bg-destructive/20 text-destructive"
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                           <Users className="w-4 h-4" />
                           {(team.members || []).length} members
                        </div>

                        {/* Member Avatars */}
                        <div className="flex flex-wrap gap-1">
                           {(team.members || []).slice(0, 8).map((member) => (
                              <span
                                 key={member}
                                 className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30"
                              >
                                 {member}
                              </span>
                           ))}
                           {(team.members || []).length > 8 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                 +{(team.members || []).length - 8} more
                              </span>
                           )}
                        </div>
                     </Card>
                  </motion.div>
               ))}
            </div >
         )
         }
      </>
   )
}
