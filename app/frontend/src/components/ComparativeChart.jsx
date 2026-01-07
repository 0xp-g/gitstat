import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Trophy } from "lucide-react"

export default function ComparativeChart({ data }) {
  const chartData = [...data]
    .sort((a, b) => {
      const aValue = a.heuristicScore * 0.6 + a.aiImpactScore * 0.4
      const bValue = b.heuristicScore * 0.6 + b.aiImpactScore * 0.4
      return bValue - aValue
    })
    .slice(0, 10)
    .map((d) => ({
      name: d.username,
      heuristic: d.heuristicScore,
      aiImpact: d.aiImpactScore,
      total: d.heuristicScore * 0.6 + d.aiImpactScore * 0.4,
    }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md bg-card/90 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary">Heuristic: {payload[0].value}</p>
            <p className="text-sm text-accent">AI Impact: {payload[1].value}</p>
            <p className="text-sm text-foreground font-semibold border-t border-white/10 pt-1 mt-1">
              Total Value: {payload[0].payload.total.toFixed(1)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Total Value Contribution
        </h2>
        <p className="text-sm text-muted-foreground">Combined heuristic and AI-weighted rankings</p>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
              iconType="circle"
            />
            <Bar dataKey="heuristic" stackId="a" fill="#8b5cf6" name="Heuristic Score" radius={[0, 0, 0, 0]} />
            <Bar dataKey="aiImpact" stackId="a" fill="#22c55e" name="AI Impact Score" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
