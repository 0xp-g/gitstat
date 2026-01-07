import { Card } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"

export default function ImpactMatrix({ data }) {
  const maxCommits = Math.max(...data.map((d) => d.totalCommits))
  const maxImpact = Math.max(...data.map((d) => d.aiImpactScore))

  const midCommits = maxCommits / 2
  const midImpact = maxImpact / 2

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="backdrop-blur-md bg-card/90 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground">{data.username}</p>
          <p className="text-sm text-muted-foreground">Commits: {data.totalCommits}</p>
          <p className="text-sm text-muted-foreground">Impact Score: {data.aiImpactScore}</p>
          <p className="text-sm text-muted-foreground">Total Changed: {data.linesAdded + data.linesDeleted} lines</p>
          <p className="text-sm text-primary font-medium mt-1">{data.quadrant}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6 backdrop-blur-md bg-card/40 border-white/10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Impact Matrix</h2>
        <p className="text-sm text-muted-foreground">Developer positioning by activity vs. logic impact</p>
      </div>

      <div className="h-[500px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 80, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

            <XAxis
              type="number"
              dataKey="totalCommits"
              name="Activity Frequency"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            >
              <Label
                value="Activity Frequency (Commits)"
                position="bottom"
                offset={40}
                style={{ fill: "rgba(255,255,255,0.7)" }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="aiImpactScore"
              name="Logic Impact"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            >
              <Label
                value="Logic Impact Score"
                angle={-90}
                position="left"
                offset={40}
                style={{ fill: "rgba(255,255,255,0.7)" }}
              />
            </YAxis>

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine x={midCommits} stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" />
            <ReferenceLine y={midImpact} stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" />

            <Scatter name="Developers" data={data} fill="#a855f7">
              {data.map((entry, index) => (
                <circle
                  key={index}
                  r={10}
                  fill={
                    entry.quadrant === "Silent Architect"
                      ? "#a855f7"
                      : entry.quadrant === "Superstar"
                        ? "#22d3ee"
                        : entry.quadrant === "Maintainer"
                          ? "#f472b6"
                          : "#facc15"
                  }
                  style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
                  opacity={0.9}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant labels */}
        <div className="absolute top-8 left-16 text-xs text-muted-foreground font-medium">Silent Architect</div>
        <div className="absolute top-8 right-24 text-xs text-primary font-bold">Superstar</div>
        <div className="absolute bottom-24 left-16 text-xs text-muted-foreground/60 font-medium">Newcomer</div>
        <div className="absolute bottom-24 right-24 text-xs text-primary/80 font-medium">Maintainer</div>
      </div>
    </Card>
  )
}
