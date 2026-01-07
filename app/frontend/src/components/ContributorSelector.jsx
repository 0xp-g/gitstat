"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Search, Users, UserPlus, UserMinus } from "lucide-react"

export default function ContributorSelector({
   contributors,
   selectedContributors,
   onSelectionChange,
}) {
   const [searchQuery, setSearchQuery] = useState("")

   const filteredContributors = contributors.filter((c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
   )

   const handleToggle = (username) => {
      if (selectedContributors.includes(username)) {
         onSelectionChange(selectedContributors.filter((u) => u !== username))
      } else {
         onSelectionChange([...selectedContributors, username])
      }
   }

   const handleSelectAll = () => {
      onSelectionChange(contributors.map((c) => c.username))
   }

   const handleDeselectAll = () => {
      onSelectionChange([])
   }

   return (
      <Card className="p-4 backdrop-blur-md bg-card/60 border-primary/20">
         {/* Header */}
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
               <Users className="w-4 h-4 text-primary" />
               Contributors ({contributors.length})
            </h3>
            <div className="flex gap-2">
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs hover:bg-primary/20"
               >
                  <UserPlus className="w-3 h-3 mr-1" />
                  All
               </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs hover:bg-destructive/20"
               >
                  <UserMinus className="w-3 h-3 mr-1" />
                  None
               </Button>
            </div>
         </div>

         {/* Search */}
         <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search contributors..."
               className="pl-10 bg-background/50 border-primary/30"
            />
         </div>

         {/* Selection Count */}
         <div className="text-sm text-muted-foreground mb-3">
            {selectedContributors.length} of {contributors.length} selected
         </div>

         {/* Contributors Grid */}
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
            {filteredContributors.map((contributor, index) => {
               const isSelected = selectedContributors.includes(contributor.username)

               return (
                  <motion.div
                     key={contributor.username}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: index * 0.02 }}
                     onClick={() => handleToggle(contributor.username)}
                     className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${isSelected
                           ? "bg-primary/20 border border-primary/50"
                           : "bg-background/50 border border-white/10 hover:border-primary/30"
                        }`}
                  >
                     {/* Checkbox */}
                     <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary text-white" : "bg-muted border border-white/20"
                           }`}
                     >
                        {isSelected && <Check className="w-3 h-3" />}
                     </div>

                     {/* Avatar */}
                     <img
                        src={contributor.avatar_url}
                        alt={contributor.username}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                     />

                     {/* Info */}
                     <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                           {contributor.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                           {contributor.contributions} commits
                        </div>
                     </div>
                  </motion.div>
               )
            })}
         </div>
      </Card>
   )
}
