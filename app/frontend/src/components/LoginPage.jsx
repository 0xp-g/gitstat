"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Lock, User } from "lucide-react"

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()
    if (username && password) {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-md bg-card/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-xl mb-4"
            >
              <Code2 className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">GitPulse</h1>
            <p className="text-muted-foreground text-sm">Discover Your Silent Architects</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/50"
              >
                Access Dashboard
              </Button>
            </motion.div>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">Use any credentials to access the demo</p>
        </div>
      </motion.div>
    </div>
  )
}
