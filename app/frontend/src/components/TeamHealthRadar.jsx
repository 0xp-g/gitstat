"use client"

import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"

export default function TeamHealthRadar({ data }) {
   // Calculate team health metrics
   const totalCommits = data.reduce((sum, c) => sum + c.totalCommits, 0)
   const avgImpact = data.reduce((sum, c) => sum + (c.aiImpactScore || 0), 0) / data.length
   const uniqueContributors = data.length
   const avgHeuristic = data.reduce((sum, c) => sum + (c.heuristicScore || 0), 0) / data.length

   // Calculate each axis (normalized to 0-100)
   const radarData = [
      {
         metric: "Velocity",
         value: Math.min(totalCommits * 2, 100),
         fullMark: 100,
      },
      {
         metric: "Quality",
         value: Math.min(avgHeuristic, 100),
         fullMark: 100,
      },
      {
         metric: "Collaboration",
         value: Math.min(uniqueContributors * 15, 100),
         fullMark: 100,
      },
      {
         metric: "Impact",
         value: Math.min(avgImpact, 100),
         fullMark: 100,
      },
      {
         metric: "Consistency",
         value: Math.min(
            100 - (Math.max(...data.map((c) => c.totalCommits)) - Math.min(...data.map((c) => c.totalCommits))),
            100
         ),
         fullMark: 100,
      },
   ]

   const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
         return (
            <div className="backdrop-blur-md bg-card/90 border border-white/10 rounded-lg p-3 shadow-xl">
               <p className="font-semibold text-foreground">{payload[0].payload.metric}</p>
               <p className="text-sm text-primary">{payload[0].value.toFixed(0)}%</p>
            </div>
         )
      }
      return null
   }

   return (
      <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10">
         <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
               <Activity className="w-6 h-6 text-cyan-400" />
               Team Health Radar
            </h2>
            <p className="text-sm text-muted-foreground">
               Overall team performance across 5 key dimensions
            </p>
         </div>

         <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis
                     dataKey="metric"
                     tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                     angle={30}
                     domain={[0, 100]}
                     tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  />
                  <Radar
                     name="Team Health"
                     dataKey="value"
                     stroke="#a855f7"
                     fill="#a855f7"
                     fillOpacity={0.4}
                     strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
               </RadarChart>
            </ResponsiveContainer>
         </div>

         {/* Metric Summary */}
         <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-white/10">
            {radarData.map((item) => (
               <div key={item.metric} className="text-center">
                  <div className="text-xs text-muted-foreground">{item.metric}</div>
                  <div className="text-lg font-bold text-primary">{item.value.toFixed(0)}%</div>
               </div>
            ))}
         </div>
      </Card>
   )
}
