/**
 * Transforms raw backend commit data into developer-centric metrics
 * for the dashboard.
 */
export const transformCommitsToDeveloperData = (backendResponse) => {
   const { commits, repo } = backendResponse;

   if (!commits || !Array.isArray(commits)) {
      return [];
   }

   const developers = {};

   commits.forEach((commit) => {
      const authorName = commit.author || 'Unknown';
      const stats = commit.total_stats || { additions: 0, deletions: 0 };
      const analysis = commit.analysis || {};

      if (!developers[authorName]) {
         developers[authorName] = {
            username: authorName,
            totalCommits: 0,
            totalImpactScore: 0,
            totalHeuristicScore: 0, // Placeholder if not in backend
            linesAdded: 0,
            linesDeleted: 0,
            commits: []
         };
      }

      const dev = developers[authorName];
      dev.totalCommits += 1;
      dev.linesAdded += stats.additions;
      dev.linesDeleted += stats.deletions;
      dev.totalImpactScore += analysis.impact_score || 0;

      // Store individual commit for "Production Commits" list
      dev.commits.push({
         summary: commit.message.split('\n')[0], // First line of message
         impact: analysis.impact_score ? Math.round(analysis.impact_score / 10) : 0, // Scale to 1-10
         date: new Date(commit.date).toISOString().split('T')[0],
         rawScore: analysis.impact_score
      });
   });

   // Calculate averages and assign quadrants
   return Object.values(developers).map(dev => {
      const avgImpact = dev.totalCommits > 0 ? Math.round(dev.totalImpactScore / dev.totalCommits) : 0;

      // Heuristic score is mocked/derived for now as backend sends 'impact_score'
      // We can map impact score to heuristic score or just use same value
      const heuristicScore = Math.min(100, avgImpact + 10); // Slight boost for visuals

      return {
         username: dev.username,
         totalCommits: dev.totalCommits,
         aiImpactScore: avgImpact,
         heuristicScore: heuristicScore,
         linesAdded: dev.linesAdded,
         linesDeleted: dev.linesDeleted,
         quadrant: determineQuadrant(dev.totalCommits, avgImpact),
         productionCommits: dev.commits
            .sort((a, b) => b.rawScore - a.rawScore) // Sort by impact
            .slice(0, 3), // Top 3
         solvedIssues: [] // Backend doesn't link issues yet
      };
   });
};

const determineQuadrant = (commits, impact) => {
   if (impact > 80 && commits > 20) return 'Superstar';
   if (impact > 70 && commits < 20) return 'Silent Architect'; // High impact, low volume
   if (commits > 50) return 'Maintainer'; // High volume, lower impact
   return 'Newcomer';
};
