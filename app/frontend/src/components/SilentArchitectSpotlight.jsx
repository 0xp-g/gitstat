"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Award, TrendingUp, Eye, EyeOff } from "lucide-react"

export default function SilentArchitectSpotlight({ data }) {
   // Calculate Silent Architect Score: High Impact / Low Activity
   const scoredData = data.map((contributor) => {
      const impactScore = contributor.aiImpactScore || 0
      const activityScore = Math.max(contributor.totalCommits * 0.3, 1)
      const silentScore = (impactScore * 0.7) / activityScore

      return {
         ...contributor,
         silentScore: silentScore.toFixed(2),
         isHidden: contributor.totalCommits < 10 && impactScore > 30, // Low visibility but high impact
      }
   })

   // Get top 3 Silent Architects
   const silentArchitects = scoredData
      .filter((c) => c.quadrant === "Silent Architect" || c.isHidden)
      .sort((a, b) => b.silentScore - a.silentScore)
      .slice(0, 3)

   if (silentArchitects.length === 0) {
      return null
   }

   return (
      <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
               <Award className="w-6 h-6 text-yellow-400" />
               Silent Architect Spotlight
            </h2>
            <p className="text-sm text-muted-foreground">
               High-impact contributors who may be overlooked
            </p>
         </div>

         <div className="grid md:grid-cols-3 gap-4">
            {silentArchitects.map((architect, index) => (
               <motion.div
                  key={architect.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30"
               >
                  {index === 0 && (
                     <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50">
                        <Award className="w-4 h-4 text-black" />
                     </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        {architect.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-semibold text-foreground">{architect.username}</h3>
                        <p className="text-xs text-muted-foreground">{architect.quadrant}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                           <EyeOff className="w-3 h-3" />
                           Visibility
                        </span>
                        <span className="text-foreground">{architect.totalCommits} commits</span>
                     </div>

                     <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                           <TrendingUp className="w-3 h-3" />
                           Impact
                        </span>
                        <span className="text-primary font-semibold">{architect.aiImpactScore}</span>
                     </div>

                     {/* Impact vs Activity Bar */}
                     <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Impact vs Activity</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                           <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              style={{
                                 width: `${Math.min((architect.aiImpactScore / Math.max(architect.totalCommits, 1)) * 10, 100)}%`,
                              }}
                           />
                        </div>
                     </div>

                     <div className="text-center mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-muted-foreground">Silent Score</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                           {architect.silentScore}
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </Card>
   )
}
