import { useCallback, useEffect, useState } from "react"

const DATA_KEY = "gitpulse_repo_data"
const HAS_DATA_KEY = "gitpulse_has_data"

export function useRepositoryData() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem(DATA_KEY)
      if (storedData) {
        try {
          setData(JSON.parse(storedData))
        } catch (e) {
          console.error("Failed to parse stored data:", e)
          sessionStorage.removeItem(DATA_KEY)
          sessionStorage.removeItem(HAS_DATA_KEY)
        }
      }
    }
  }, [])

  const setRepositoryData = useCallback((newData: any) => {
    setData(newData)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DATA_KEY, JSON.stringify(newData))
      sessionStorage.setItem(HAS_DATA_KEY, "true")
    }
  }, [])

  const clearRepositoryData = useCallback(() => {
    setData(null)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DATA_KEY)
      sessionStorage.removeItem(HAS_DATA_KEY)
    }
  }, [])

  const hasData = data !== null

  return {
    data,
    hasData,
    setRepositoryData,
    clearRepositoryData,
    isLoading,
    setIsLoading,
  }
}
