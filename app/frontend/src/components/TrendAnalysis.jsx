"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function TrendAnalysis({ data }) {
   // Simulate weekly trend data based on contributor activity patterns
   // In production, this would come from actual time-series data
   const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

   // Get top 5 contributors for trend lines
   const topContributors = [...data]
      .sort((a, b) => b.totalCommits - a.totalCommits)
      .slice(0, 5)

   // Generate simulated trend data
   const trendData = weeks.map((week, weekIndex) => {
      const weekData = { week }
      topContributors.forEach((contributor) => {
         // Simulate weekly distribution of commits
         const baseCommits = contributor.totalCommits / 4
         const variance = Math.random() * 0.4 + 0.8 // 0.8 to 1.2
         weekData[contributor.username] = Math.round(baseCommits * variance * (weekIndex + 1) / 2.5)
      })
      return weekData
   })

   // Neon color palette for lines
   const colors = ["#a855f7", "#22d3ee", "#f472b6", "#facc15", "#4ade80"]

   const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
         return (
            <div className="backdrop-blur-md bg-card/90 border border-white/10 rounded-lg p-3 shadow-xl">
               <p className="font-semibold text-foreground mb-2">{label}</p>
               {payload.map((entry, index) => (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                     {entry.name}: {entry.value} commits
                  </p>
               ))}
            </div>
         )
      }
      return null
   }

   return (
      <Card className="p-6 backdrop-blur-md bg-card/60 border-primary/20 shadow-lg shadow-primary/10">
         <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
               <TrendingUp className="w-6 h-6 text-green-400" />
               Contribution Trends
            </h2>
            <p className="text-sm text-muted-foreground">
               Week-over-week activity for top contributors
            </p>
         </div>

         <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                     dataKey="week"
                     stroke="rgba(255,255,255,0.5)"
                     tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                     stroke="rgba(255,255,255,0.5)"
                     tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                     wrapperStyle={{ paddingTop: "10px" }}
                     iconType="circle"
                  />
                  {topContributors.map((contributor, index) => (
                     <Line
                        key={contributor.username}
                        type="monotone"
                        dataKey={contributor.username}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4, fill: colors[index % colors.length] }}
                        activeDot={{ r: 6 }}
                     />
                  ))}
               </LineChart>
            </ResponsiveContainer>
         </div>
      </Card>
   )
}
