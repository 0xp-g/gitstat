"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
   Radar,
   RadarChart,
   PolarGrid,
   PolarAngleAxis,
   PolarRadiusAxis,
   ResponsiveContainer
} from "recharts"
import { BrainCircuit, Users, Zap, TrendingUp, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { fetchRepoCommits } from "../services/api"
import { transformCommitsToDeveloperData } from "../utils/transformers"

export default function SoftSkillsPage() {
   const [developers, setDevelopers] = useState([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      // Load data directly from session storage (shared with Overview)
      const storedData = sessionStorage.getItem("gitpulse_data");

      if (storedData) {
         try {
            const parsedData = JSON.parse(storedData);
            setDevelopers(parsedData ? parsedData.sort((a, b) => (b.softSkills?.leadership || 0) - (a.softSkills?.leadership || 0)) : []);
         } catch (e) {
            console.error("Failed to parse stored data", e);
         }
      }
      setLoading(false);
   }, [])

   if (loading) {
      return <div className="p-8 text-center text-muted-foreground">Analyzing behavioral patterns...</div>
   }

   return (
      <div className="space-y-8">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
         >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
               Soft Skills Analysis
            </h1>
            <p className="text-muted-foreground text-lg">
               Behavioral insights
            </p>
         </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((dev, index) => (
               <motion.div
                  key={dev.username}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
               >
                  <Card className="p-6 backdrop-blur-md bg-card/40 border-primary/10 shadow-xl overflow-hidden relative group hover:border-primary/30 transition-all">
                     <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="h-20 w-20 bg-primary/10 rounded-full blur-2xl" />
                     </div>

                     <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500/50 flex items-center justify-center p-[2px]">
                           <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                              <span className="text-lg font-bold">{dev.username.substring(0, 2).toUpperCase()}</span>
                           </div>
                        </div>
                        <div>
                           <h3 className="text-xl font-bold">{dev.username}</h3>
                           <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              {getRoleTitle(dev.softSkills)}
                           </p>
                        </div>
                     </div>

                     <div className="h-[250px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                              { subject: 'Leadership', A: dev.softSkills.leadership, fullMark: 100 },
                              { subject: 'Communication', A: dev.softSkills.communication, fullMark: 100 },
                              { subject: 'Growth', A: dev.softSkills.growth, fullMark: 100 },
                              { subject: 'Collaboration', A: dev.softSkills.collaboration, fullMark: 100 },
                           ]}>
                              <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                 name={dev.username}
                                 dataKey="A"
                                 stroke="#a855f7"
                                 strokeWidth={2}
                                 fill="#a855f7"
                                 fillOpacity={0.3}
                              />
                           </RadarChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="mt-4 grid grid-cols-2 gap-4">
                        <SkillMetric icon={Users} label="Leadership" value={dev.softSkills.leadership} color="text-purple-400" />
                        <SkillMetric icon={MessageSquare} label="Communication" value={dev.softSkills.communication} color="text-blue-400" />
                        <SkillMetric icon={TrendingUp} label="Growth" value={dev.softSkills.growth} color="text-green-400" />
                        <SkillMetric icon={Zap} label="Collab" value={dev.softSkills.collaboration} color="text-amber-400" />
                     </div>
                  </Card>
               </motion.div>
            ))}
         </div>
      </div>
   )
}

function SkillMetric({ icon: Icon, label, value, color }) {
   return (
      <div className="flex items-center gap-2">
         <Icon className={`w-4 h-4 ${color}`} />
         <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
            <span className="text-sm font-bold">{value}%</span>
         </div>
      </div>
   )
}

function getRoleTitle(skills) {
   if (skills.leadership > 80) return "Team Lead"
   if (skills.growth > 85) return "Rising Star"
   if (skills.communication > 80) return "Communicator"
   if (skills.collaboration > 80) return "Team Player"
   return "Contributor"
}
