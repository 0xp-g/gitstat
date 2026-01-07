"use client"

import DashboardLayout from "@/components/dashboard-layout"
import AIInsightsPanel from "@/components/ai-insights-panel"
import { Suspense, useEffect, useState } from "react"
import { useRepositoryData } from "@/hooks/useRepositoryData"
import { AlertCircle } from "lucide-react"

function AIContent() {
  const { data, hasData } = useRepositoryData()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!hasData || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Repository Data</h3>
          <p className="text-muted-foreground mb-4">Please run Pulse Search from the Overview tab first</p>
          <a href="/dashboard/overview" className="text-primary hover:underline">
            Go to Overview →
          </a>
        </div>
      </div>
    )
  }

  return <AIInsightsPanel data={data} />
}

export default function AIPage() {
  return (
    <DashboardLayout activeRoute="ai">
      <Suspense fallback={<div>Loading...</div>}>
        <AIContent />
      </Suspense>
    </DashboardLayout>
  )
}
