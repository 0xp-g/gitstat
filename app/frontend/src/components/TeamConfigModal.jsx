"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Trash2, Users, FolderGit2 } from "lucide-react"

export default function TeamConfigModal({ isOpen, onClose, onSave, editTeam = null }) {
   const [teamName, setTeamName] = useState(editTeam?.name || "")
   const [repos, setRepos] = useState(editTeam?.repos || [{ owner: "", repo: "" }])

   const handleAddRepo = () => {
      setRepos([...repos, { owner: "", repo: "" }])
   }

   const handleRemoveRepo = (index) => {
      setRepos(repos.filter((_, i) => i !== index))
   }

   const handleRepoChange = (index, field, value) => {
      const updated = [...repos]
      updated[index][field] = value
      setRepos(updated)
   }

   const handleSave = () => {
      const validRepos = repos.filter((r) => r.owner.trim() && r.repo.trim())
      if (!teamName.trim() || validRepos.length === 0) return

      const team = {
         id: editTeam?.id || `team-${Date.now()}`,
         name: teamName.trim(),
         repos: validRepos,
         createdAt: editTeam?.createdAt || new Date().toISOString(),
      }
      onSave(team)
      onClose()
   }

   if (!isOpen) return null

   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
         >
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-lg bg-card border border-primary/20 rounded-2xl p-6 shadow-2xl shadow-primary/20"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                     </div>
                     <h2 className="text-xl font-bold text-foreground">
                        {editTeam ? "Edit Team" : "Create New Team"}
                     </h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                     <X className="w-5 h-5" />
                  </Button>
               </div>

               {/* Team Name */}
               <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-2 block">Team Name</label>
                  <Input
                     value={teamName}
                     onChange={(e) => setTeamName(e.target.value)}
                     placeholder="e.g., Frontend Squad"
                     className="bg-background/50 border-primary/30"
                  />
               </div>

               {/* Repositories */}
               <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-sm text-muted-foreground">Repositories</label>
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddRepo}
                        className="text-primary hover:text-primary/80"
                     >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Repo
                     </Button>
                  </div>

                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                     {repos.map((repo, index) => (
                        <motion.div
                           key={index}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="flex items-center gap-2"
                        >
                           <FolderGit2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                           <Input
                              value={repo.owner}
                              onChange={(e) => handleRepoChange(index, "owner", e.target.value)}
                              placeholder="owner"
                              className="bg-background/50 border-primary/30 flex-1"
                           />
                           <span className="text-muted-foreground">/</span>
                           <Input
                              value={repo.repo}
                              onChange={(e) => handleRepoChange(index, "repo", e.target.value)}
                              placeholder="repository"
                              className="bg-background/50 border-primary/30 flex-1"
                           />
                           {repos.length > 1 && (
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleRemoveRepo(index)}
                                 className="text-destructive hover:text-destructive/80 flex-shrink-0"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           )}
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Actions */}
               <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1 border-white/20">
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSave}
                     className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
                     disabled={!teamName.trim() || !repos.some((r) => r.owner && r.repo)}
                  >
                     {editTeam ? "Save Changes" : "Create Team"}
                  </Button>
               </div>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   )
}
