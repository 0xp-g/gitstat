const productionCommitSummaries = [
  "Modularized collision detection engine for better performance",
  "Implemented reactive state management for real-time updates",
  "Refactored authentication flow to support OAuth providers",
  "Optimized database queries reducing latency by 40%",
  "Built scalable WebSocket architecture for live notifications",
  "Redesigned error handling with comprehensive logging system",
  "Created reusable component library for UI consistency",
  "Implemented caching layer improving response times significantly",
  "Architected microservices infrastructure for better scalability",
  "Developed automated testing framework with 95% coverage",
]

const issueTemplates = [
  "Memory leak in dashboard component causing crashes",
  "Critical security vulnerability in authentication system",
  "Race condition in concurrent request handling",
  "Performance degradation under high load conditions",
  "Data corruption in edge case scenarios",
  "Cross-browser compatibility issues in production",
  "Null pointer exception in payment processing",
  "Deadlock in database transaction management",
  "API endpoint returning incorrect status codes",
  "Session timeout not properly handling cleanup",
]

function getQuadrant(commits, impact) {
  const commitThreshold = 15
  const impactThreshold = 70

  if (impact >= impactThreshold && commits < commitThreshold) {
    return "Silent Architect"
  } else if (impact >= impactThreshold && commits >= commitThreshold) {
    return "Superstar"
  } else if (impact < impactThreshold && commits < commitThreshold) {
    return "Newcomer"
  } else {
    return "Maintainer"
  }
}

export function generateMockData() {
  const contributors = [
    // Raghav - the Silent Architect
    {
      username: "Raghav",
      totalCommits: 8,
      linesAdded: 1200,
      linesDeleted: 800,
      heuristicScore: 92,
      aiImpactScore: 95,
      quadrant: "Silent Architect",
      productionCommits: [
        {
          summary: "Architected new microservices infrastructure from ground up",
          impact: 98,
        },
        {
          summary: "Refactored core authentication system with zero-trust model",
          impact: 95,
        },
      ],
      solvedIssues: [
        { id: 1247, title: "Critical race condition in payment processor", complexity: 5 },
        { id: 1189, title: "Memory leak causing production crashes", complexity: 5 },
      ],
    },
  ]

  // Generate additional contributors
  const names = [
    "Sarah",
    "Mike",
    "Jessica",
    "David",
    "Emma",
    "Alex",
    "Lisa",
    "Tom",
    "Rachel",
    "Kevin",
    "Nina",
    "Chris",
    "Olivia",
    "James",
  ]

  names.forEach((name, i) => {
    const commits = Math.floor(Math.random() * 35) + 5
    const added = Math.floor(Math.random() * 3000) + 200
    const deleted = Math.floor(Math.random() * 2000) + 100
    const heuristic = Math.floor(Math.random() * 50) + 40
    const aiImpact = Math.floor(Math.random() * 50) + 40

    const prodCommitCount = Math.floor(Math.random() * 3) + 1
    const issueCount = Math.floor(Math.random() * 3) + 1

    contributors.push({
      username: name,
      totalCommits: commits,
      linesAdded: added,
      linesDeleted: deleted,
      heuristicScore: heuristic,
      aiImpactScore: aiImpact,
      quadrant: getQuadrant(commits, aiImpact),
      productionCommits: Array.from({ length: prodCommitCount }, (_, idx) => ({
        summary: productionCommitSummaries[(i * 3 + idx) % productionCommitSummaries.length],
        impact: Math.floor(Math.random() * 30) + 60,
      })),
      solvedIssues: Array.from({ length: issueCount }, (_, idx) => ({
        id: 1000 + i * 100 + idx,
        title: issueTemplates[(i * 2 + idx) % issueTemplates.length],
        complexity: Math.floor(Math.random() * 3) + 2,
      })),
    })
  })

  return contributors
}
