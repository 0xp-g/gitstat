"use client"

import { useEffect, useState } from "react"
import AIInsightsPanel from "@/components/AIInsightsPanel"

export default function AIPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if search was actually executed
    const checkData = () => {
      const searchExecuted = sessionStorage.getItem("gitpulse_search_executed") === "true"
      
      if (!searchExecuted) {
        setData(null)
        setLoading(false)
        return
      }

      const hasData = sessionStorage.getItem("gitpulse_has_data") === "true"
      const storedData = sessionStorage.getItem("gitpulse_data")

      if (hasData && storedData) {
        try {
          setData(JSON.parse(storedData))
        } catch (e) {
          setData(null)
        }
      } else {
        setData(null)
      }
      setLoading(false)
    }

    checkData()

    // Listen for clear event
    const handleClear = () => {
      setData(null)
    }
    window.addEventListener("gitpulse-clear", handleClear)

    // Listen for storage changes
    const handleStorageChange = () => {
      checkData()
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("gitpulse-clear", handleClear)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return data ? (
    <AIInsightsPanel data={data} />
  ) : (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Please run Pulse Search from the Overview page</p>
      </div>
    </div>
  )
}
