"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Crown, Trophy, TrendingUp, Users, Sparkles, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Cell
} from "recharts"

export default function ImpactDashboard() {
   const [developers, setDevelopers] = useState([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      // Load data from session storage
      const storedData = sessionStorage.getItem("gitpulse_data")

      if (storedData) {
         try {
            const parsedData = JSON.parse(storedData)
            // Sort by Combined Impact Score (Desc)
            const sorted = parsedData.sort((a, b) => (b.combinedImpactScore || 0) - (a.combinedImpactScore || 0))
            setDevelopers(sorted)
         } catch (e) {
            console.error("Failed to parse stored data", e)
         }
      }
      setLoading(false)
   }, [])

   if (loading) {
      return <div className="p-8 text-center text-muted-foreground animate-pulse">Calculating final impact scores...</div>
   }

   if (developers.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Activity className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-muted-foreground">No Data Available</h2>
            <p className="text-muted-foreground mt-2">Run a Pulse Search on the Overview page first.</p>
         </div>
      )
   }

   const topPerformer = developers[0]

   return (
      <div className="space-y-8 pb-12">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
         >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
               Impact Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg">
               The ultimate holistic metric combining Technical Excellence (60%) and Soft Skills (40%).
            </p>
         </motion.div>

         {/* Top Performer Spotlight */}
         {topPerformer && (
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
            >
               <Card className="relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-8">
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                     <Crown className="w-40 h-40 text-orange-500 rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                     <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center p-[3px] shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                           <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                              <span className="text-3xl font-bold text-white">{topPerformer.username.substring(0, 2).toUpperCase()}</span>
                           </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                           <Trophy className="w-3 h-3" /> #1
                        </div>
                     </div>

                     <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-1">{topPerformer.username}</h2>
                        <p className="text-orange-300 font-semibold mb-4 text-lg">Most Impactful Contributor</p>

                        <div className="flex gap-6 justify-center md:justify-start">
                           <div className="text-center">
                              <div className="text-3xl font-black text-white">{topPerformer.combinedImpactScore}</div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Combined</div>
                           </div>
                           <div className="w-px bg-white/10" />
                           <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{topPerformer.aiImpactScore}</div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Tech</div>
                           </div>
                           <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{topPerformer.softSkills.average}</div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Soft</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>
            </motion.div>
         )}

         {/* Main Stats Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Leaderboard Column */}
            <div className="lg:col-span-2 space-y-4">
               <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Rankings
               </h3>
               <div className="space-y-3">
                  {developers.map((dev, idx) => (
                     <motion.div
                        key={dev.username}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                     >
                        <Card className={`p-4 flex items-center gap-4 transition-all hover:bg-white/5 ${idx === 0 ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 bg-black/20'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}>
                              {idx + 1}
                           </div>

                           <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-lg">{dev.username}</span>
                                 <span className="text-xl font-bold text-primary">{dev.combinedImpactScore}</span>
                              </div>

                              {/* Progress Bar Visualization */}
                              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden flex">
                                 <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${(dev.aiImpactScore * 0.6)}%` }}
                                    title={`Technical: ${dev.aiImpactScore}`}
                                 />
                                 <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${(dev.softSkills.average * 0.4)}%` }}
                                    title={`Soft Skills: ${dev.softSkills.average}`}
                                 />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                 <span>Tech Impact: {dev.aiImpactScore}</span>
                                 <span>Soft Skills: {dev.softSkills.average}</span>
                              </div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Analytics Column */}
            <div className="space-y-6">
               <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" /> Distribution
               </h3>

               <Card className="p-6 bg-black/20 border-white/10">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Score Composition</h4>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={developers.slice(0, 5)} layout="vertical" barGap={2}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                           <XAxis type="number" domain={[0, 100]} hide />
                           <YAxis type="category" dataKey="username" width={70} tick={{ fill: '#888', fontSize: 12 }} />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                           />
                           <Bar dataKey="aiImpactScore" name="Technical" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                           <Bar dataKey="softSkills.average" name="Soft Skills" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex gap-4 justify-center text-xs text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm" /> Technical
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-sm" /> Soft Skills
                     </div>
                  </div>
               </Card>

               <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                  <div className="flex items-start gap-4">
                     <Sparkles className="w-8 h-8 text-indigo-400 mt-1" />
                     <div>
                        <h4 className="font-bold text-indigo-100 mb-1">Holistic Evaluation</h4>
                        <p className="text-sm text-indigo-200/70">
                           This score prevents "code machines" from dominating if they lack communication, while rewarding leaders who enable others.
                        </p>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   )
}
