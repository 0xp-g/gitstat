"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderGit2, Activity, TrendingUp, Edit, Trash2 } from "lucide-react"

export default function TeamCard({ team, stats, onEdit, onDelete, onSelect }) {
   const totalContributors = stats?.contributors || 0
   const totalCommits = stats?.totalCommits || 0
   const avgImpact = stats?.avgImpact || 0
   const healthScore = stats?.healthScore || 0

   return (
      <motion.div
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         className="cursor-pointer"
         onClick={() => onSelect(team)}
      >
         <Card className="p-5 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10 hover:border-primary/40 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                     <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h3 className="font-bold text-foreground text-lg">{team.name}</h3>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3" />
                        {team.repos.length} {team.repos.length === 1 ? "repository" : "repositories"}
                     </p>
                  </div>
               </div>

               <div className="flex gap-1">
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => {
                        e.stopPropagation()
                        onEdit(team)
                     }}
                     className="h-8 w-8 hover:bg-primary/20"
                  >
                     <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => {
                        e.stopPropagation()
                        onDelete(team.id)
                     }}
                     className="h-8 w-8 hover:bg-destructive/20 text-destructive"
                  >
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                     <Users className="w-3 h-3" />
                     Contributors
                  </div>
                  <div className="text-xl font-bold text-foreground">{totalContributors}</div>
               </div>

               <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                     <Activity className="w-3 h-3" />
                     Commits
                  </div>
                  <div className="text-xl font-bold text-foreground">{totalCommits}</div>
               </div>

               <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                     <TrendingUp className="w-3 h-3" />
                     Avg Impact
                  </div>
                  <div className="text-xl font-bold text-primary">{avgImpact.toFixed(1)}</div>
               </div>

               <div className="p-3 rounded-lg bg-background/50 border border-white/10">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                     Health
                  </div>
                  <div className="text-xl font-bold text-accent">{healthScore}%</div>
               </div>
            </div>

            {/* Repo Tags */}
            <div className="flex flex-wrap gap-2">
               {team.repos.slice(0, 3).map((repo, i) => (
                  <span
                     key={i}
                     className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30"
                  >
                     {repo.repo}
                  </span>
               ))}
               {team.repos.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                     +{team.repos.length - 3} more
                  </span>
               )}
            </div>
         </Card>
      </motion.div>
   )
}
