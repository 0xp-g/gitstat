"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Flame, Target, TrendingDown } from "lucide-react"

export default function RiskAlerts({ data }) {
   const alerts = []

   // 1. Burnout Risk Detection
   // Contributors with very high activity may be at risk
   const highActivityThreshold = 30 // commits
   const burnoutCandidates = data.filter((c) => c.totalCommits > highActivityThreshold)

   burnoutCandidates.forEach((contributor) => {
      alerts.push({
         type: "burnout",
         severity: "high",
         icon: Flame,
         color: "text-orange-500",
         bgColor: "bg-orange-500/20",
         borderColor: "border-orange-500/30",
         title: "Burnout Risk",
         message: `${contributor.username} has ${contributor.totalCommits} commits. Consider workload distribution.`,
         contributor: contributor.username,
      })
   })

   // 2. Single Point of Failure
   // Check if one contributor has >50% of total impact
   const totalImpact = data.reduce((sum, c) => sum + (c.aiImpactScore || 0), 0)
   const spofCandidates = data.filter((c) => (c.aiImpactScore || 0) / totalImpact > 0.5)

   spofCandidates.forEach((contributor) => {
      const percentage = ((contributor.aiImpactScore / totalImpact) * 100).toFixed(0)
      alerts.push({
         type: "spof",
         severity: "high",
         icon: Target,
         color: "text-red-500",
         bgColor: "bg-red-500/20",
         borderColor: "border-red-500/30",
         title: "Single Point of Failure",
         message: `${contributor.username} owns ${percentage}% of critical impact. Knowledge sharing recommended.`,
         contributor: contributor.username,
      })
   })

   // 3. Declining Contributor Warning
   // Contributors with low activity but previous high impact
   const decliningCandidates = data.filter(
      (c) => c.totalCommits < 5 && (c.heuristicScore || 0) > 20
   )

   decliningCandidates.forEach((contributor) => {
      alerts.push({
         type: "declining",
         severity: "medium",
         icon: TrendingDown,
         color: "text-yellow-500",
         bgColor: "bg-yellow-500/20",
         borderColor: "border-yellow-500/30",
         title: "Reduced Activity",
         message: `${contributor.username} shows reduced contributions despite high capability. Check-in recommended.`,
         contributor: contributor.username,
      })
   })

   // If no alerts, show a positive message
   if (alerts.length === 0) {
      return (
         <Card className="p-6 backdrop-blur-md bg-card/60 border-accent/20 shadow-lg shadow-accent/10">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-accent" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-foreground">No Risk Alerts</h2>
                  <p className="text-sm text-muted-foreground">Team health looks good! No immediate concerns detected.</p>
               </div>
            </div>
         </Card>
      )
   }

   return (
      <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10">
         <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               Attention Needed
            </h2>
            <p className="text-xs text-muted-foreground">
               Items requiring your review
            </p>
         </div>

         <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, index) => (
               <motion.div
                  key={`${alert.type}-${alert.contributor}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${alert.bgColor} border ${alert.borderColor}`}
               >
                  <div className="flex items-start gap-3">
                     <div className={`w-8 h-8 rounded-full ${alert.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <alert.icon className={`w-4 h-4 ${alert.color}`} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <h3 className={`text-sm font-semibold ${alert.color}`}>{alert.title}</h3>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${alert.bgColor} ${alert.color} border border-${alert.color}/20`}>
                              {alert.severity}
                           </span>
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5 line-clamp-2">{alert.message}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {alerts.length > 5 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
               +{alerts.length - 5} more items
            </p>
         )}
      </Card>
   )
}
