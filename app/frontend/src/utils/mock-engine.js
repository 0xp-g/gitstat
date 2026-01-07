// Mock data generation engine for the dashboard

export const generateMockData = (type = 'overview') => {
  // Developer impact data for ImpactMatrix and ComparativeChart
  const developerData = [
    {
      username: 'john_doe',
      totalCommits: 145,
      aiImpactScore: 88,
      heuristicScore: 92,
      linesAdded: 2500,
      linesDeleted: 800,
      quadrant: 'Superstar',
      productionCommits: [
        { summary: 'feat: Add user authentication', impact: 9, date: '2024-01-05' },
        { summary: 'feat: Implement OAuth2 flow', impact: 8, date: '2024-01-04' },
        { summary: 'fix: Resolve login redirect issue', impact: 7, date: '2024-01-03' },
      ],
      solvedIssues: [
        { title: 'Auth flow broken on mobile', complexity: 8, date: '2024-01-05' },
        { title: 'Session timeout issue', complexity: 6, date: '2024-01-04' },
      ],
    },
    {
      username: 'jane_smith',
      totalCommits: 98,
      aiImpactScore: 85,
      heuristicScore: 88,
      linesAdded: 1800,
      linesDeleted: 600,
      quadrant: 'Superstar',
      productionCommits: [
        { summary: 'fix: Resolve memory leak in component', impact: 9, date: '2024-01-05' },
        { summary: 'perf: Optimize rendering performance', impact: 8, date: '2024-01-03' },
        { summary: 'refactor: Clean up event handlers', impact: 6, date: '2024-01-02' },
      ],
      solvedIssues: [
        { title: 'Memory leaks in React hooks', complexity: 9, date: '2024-01-05' },
        { title: 'Performance regression', complexity: 7, date: '2024-01-03' },
      ],
    },
    {
      username: 'bob_johnson',
      totalCommits: 220,
      aiImpactScore: 65,
      heuristicScore: 75,
      linesAdded: 3200,
      linesDeleted: 2100,
      quadrant: 'Maintainer',
      productionCommits: [
        { summary: 'docs: Update API documentation', impact: 5, date: '2024-01-05' },
        { summary: 'chore: Update dependencies', impact: 4, date: '2024-01-04' },
        { summary: 'ci: Fix GitHub Actions workflow', impact: 5, date: '2024-01-03' },
      ],
      solvedIssues: [
        { title: 'Build pipeline failing', complexity: 5, date: '2024-01-04' },
      ],
    },
    {
      username: 'alice_brown',
      totalCommits: 45,
      aiImpactScore: 92,
      heuristicScore: 89,
      linesAdded: 800,
      linesDeleted: 250,
      quadrant: 'Silent Architect',
      productionCommits: [
        { summary: 'refactor: Rewrite database layer', impact: 10, date: '2024-01-05' },
        { summary: 'arch: Implement caching strategy', impact: 9, date: '2024-01-03' },
      ],
      solvedIssues: [
        { title: 'Database scaling issues', complexity: 10, date: '2024-01-05' },
        { title: 'Query performance critical', complexity: 9, date: '2024-01-03' },
      ],
    },
    {
      username: 'charlie_wilson',
      totalCommits: 25,
      aiImpactScore: 72,
      heuristicScore: 68,
      linesAdded: 400,
      linesDeleted: 150,
      quadrant: 'Newcomer',
      productionCommits: [
        { summary: 'feat: Add dark mode toggle', impact: 4, date: '2024-01-04' },
        { summary: 'style: Update button styles', impact: 2, date: '2024-01-02' },
      ],
      solvedIssues: [
        { title: 'UI styling inconsistencies', complexity: 3, date: '2024-01-04' },
      ],
    },
    {
      username: 'diana_prince',
      totalCommits: 156,
      aiImpactScore: 78,
      heuristicScore: 82,
      linesAdded: 2100,
      linesDeleted: 950,
      quadrant: 'Maintainer',
      productionCommits: [
        { summary: 'feat: Add user profile page', impact: 7, date: '2024-01-05' },
        { summary: 'fix: Resolve CORS issues', impact: 6, date: '2024-01-04' },
        { summary: 'test: Add integration tests', impact: 5, date: '2024-01-02' },
      ],
      solvedIssues: [
        { title: 'CORS blocking requests', complexity: 7, date: '2024-01-04' },
        { title: 'Missing integration tests', complexity: 6, date: '2024-01-02' },
      ],
    },
    {
      username: 'eve_taylor',
      totalCommits: 67,
      aiImpactScore: 88,
      heuristicScore: 85,
      linesAdded: 1200,
      linesDeleted: 400,
      quadrant: 'Superstar',
      productionCommits: [
        { summary: 'feat: Implement search functionality', impact: 8, date: '2024-01-05' },
        { summary: 'perf: Optimize search queries', impact: 7, date: '2024-01-04' },
      ],
      solvedIssues: [
        { title: 'Search slow with large datasets', complexity: 8, date: '2024-01-05' },
      ],
    },
    {
      username: 'frank_miller',
      totalCommits: 34,
      aiImpactScore: 76,
      heuristicScore: 72,
      linesAdded: 600,
      linesDeleted: 200,
      quadrant: 'Newcomer',
      productionCommits: [
        { summary: 'fix: Fix typo in readme', impact: 1, date: '2024-01-04' },
        { summary: 'style: Format code', impact: 1, date: '2024-01-02' },
      ],
      solvedIssues: [
        { title: 'Documentation typos', complexity: 1, date: '2024-01-04' },
      ],
    },
  ];

  const baseCommits = [
    {
      id: '1',
      message: 'feat: Add user authentication',
      author: 'John Doe',
      date: new Date(2024, 0, 1),
      insertions: 250,
      deletions: 50,
    },
    {
      id: '2',
      message: 'fix: Resolve memory leak in component',
      author: 'Jane Smith',
      date: new Date(2024, 0, 2),
      insertions: 45,
      deletions: 120,
    },
    {
      id: '3',
      message: 'docs: Update API documentation',
      author: 'Bob Johnson',
      date: new Date(2024, 0, 3),
      insertions: 300,
      deletions: 10,
    },
    {
      id: '4',
      message: 'refactor: Simplify data processing',
      author: 'Alice Brown',
      date: new Date(2024, 0, 4),
      insertions: 180,
      deletions: 200,
    },
    {
      id: '5',
      message: 'perf: Optimize database queries',
      author: 'Charlie Wilson',
      date: new Date(2024, 0, 5),
      insertions: 100,
      deletions: 75,
    },
  ];

  const metrics = {
    totalCommits: 145,
    totalContributors: 12,
    avgCommitsPerDay: 4.2,
    codeQuality: 87,
    performanceScore: 92,
    testCoverage: 78,
  };

  const heuristics = [
    {
      id: '1',
      name: 'Code Complexity',
      score: 85,
      trend: 'up',
      description: 'Cyclomatic complexity analysis',
    },
    {
      id: '2',
      name: 'Test Coverage',
      score: 78,
      trend: 'stable',
      description: 'Unit test coverage percentage',
    },
    {
      id: '3',
      name: 'Documentation',
      score: 72,
      trend: 'down',
      description: 'Code documentation completeness',
    },
    {
      id: '4',
      name: 'Performance',
      score: 92,
      trend: 'up',
      description: 'Runtime performance metrics',
    },
  ];

  const insights = [
    {
      id: '1',
      type: 'bug',
      severity: 'high',
      title: 'Potential null reference in data handler',
      description: 'Line 234 in dataProcessor.js could throw NullPointerException',
      file: 'src/utils/dataProcessor.js',
      line: 234,
    },
    {
      id: '2',
      type: 'performance',
      severity: 'medium',
      title: 'Inefficient loop detected',
      description: 'Nested loop in calculateMetrics could be optimized',
      file: 'src/services/metrics.js',
      line: 102,
    },
    {
      id: '3',
      type: 'security',
      severity: 'high',
      title: 'SQL injection vulnerability',
      description: 'User input not properly sanitized in query',
      file: 'src/db/queries.js',
      line: 45,
    },
  ];

  const chartData = [
    { name: 'Mon', commits: 4, insertions: 240, deletions: 160 },
    { name: 'Tue', commits: 3, insertions: 200, deletions: 220 },
    { name: 'Wed', commits: 5, insertions: 290, deletions: 100 },
    { name: 'Thu', commits: 4, insertions: 200, deletions: 180 },
    { name: 'Fri', commits: 6, insertions: 340, deletions: 120 },
    { name: 'Sat', commits: 2, insertions: 120, deletions: 80 },
    { name: 'Sun', commits: 1, insertions: 60, deletions: 40 },
  ];

  switch (type) {
    case 'commits':
      return baseCommits;
    case 'metrics':
      return metrics;
    case 'heuristics':
      return heuristics;
    case 'insights':
      return insights;
    case 'chart':
      return chartData;
    case 'developers':
      return developerData;
    default:
      return developerData;
  }
};

export const getCommitStats = () => {
  return {
    today: 12,
    thisWeek: 67,
    thisMonth: 245,
    totalByAuthor: {
      'John Doe': 45,
      'Jane Smith': 38,
      'Bob Johnson': 52,
      'Alice Brown': 35,
      'Charlie Wilson': 28,
      Others: 47,
    },
  };
};

export const getPerformanceMetrics = () => {
  return {
    buildTime: 2.4,
    testTime: 5.2,
    deploymentTime: 3.1,
    averageResponseTime: 245,
    errorRate: 0.23,
    uptime: 99.97,
  };
};
