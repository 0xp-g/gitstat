/**
 * Transforms raw backend commit data into developer-centric metrics
 * for the dashboard.
 */
export const transformCommitsToDeveloperData = (backendResponse, issuesResp = null) => {
   const { commits, repo } = backendResponse;

   if (!commits || !Array.isArray(commits)) {
      return [];
   }

   const developers = {};

   // 1. Process Commits
   commits.forEach((commit) => {
      const authorName = commit.author || 'Unknown';
      const stats = commit.total_stats || { additions: 0, deletions: 0 };
      const analysis = commit.analysis || {};

      if (!developers[authorName]) {
         developers[authorName] = {
            username: authorName,
            totalCommits: 0,
            totalImpactScore: 0,
            totalHeuristicScore: 0,
            linesAdded: 0,
            linesDeleted: 0,
            commits: [],
            solvedIssues: [],
            productionCommits: [] // Explicitly init
         };
      }

      const dev = developers[authorName];
      dev.totalCommits += 1;
      dev.linesAdded += stats.additions;
      dev.linesDeleted += stats.deletions;
      dev.totalImpactScore += analysis.impact_score || 0;

      // Store individual commit for "Production Commits" list
      const commitObj = {
         summary: commit.message.split('\n')[0],
         impact: analysis.impact_score ? Math.round(analysis.impact_score / 10) : 0,
         date: new Date(commit.date).toISOString().split('T')[0],
         rawScore: analysis.impact_score
      };

      dev.commits.push(commitObj);
      dev.productionCommits.push(commitObj); // Ensure this is populated
   });

   // 2. Process Issues (if available)
   if (issuesResp && issuesResp.data) {
      issuesResp.data.forEach(issue => {
         // Determine credit: 'solved_by' >> 'closed_by' 
         // If 'solved_by' isn't set, fallback is already handled in backend, but let's be safe.
         const solver = issue.solved_by || issue.closed_by;

         if (solver) {
            // Initiate dev if not exists (e.g. someone who only closes issues but no commits in range)
            if (!developers[solver]) {
               developers[solver] = {
                  username: solver,
                  totalCommits: 0,
                  totalImpactScore: 0,
                  totalHeuristicScore: 0,
                  linesAdded: 0,
                  linesDeleted: 0,
                  commits: [],
                  solvedIssues: [],
                  productionCommits: []
               };
            }

            developers[solver].solvedIssues.push({
               id: issue.issue_number,
               title: issue.issue_title,
               complexity: issue.complexity_score,
               url: issue.issue_url
            });
         }
      });
   }

   // 3. Calculate averages and assign quadrants
   return Object.values(developers).map(dev => {
      const avgImpact = dev.totalCommits > 0 ? Math.round(dev.totalImpactScore / dev.totalCommits) : 0;
      const heuristicScore = Math.min(100, avgImpact + 10);

      return {
         username: dev.username,
         totalCommits: dev.totalCommits,
         aiImpactScore: avgImpact,
         heuristicScore: heuristicScore,
         linesAdded: dev.linesAdded,
         linesDeleted: dev.linesDeleted,
         quadrant: determineQuadrant(dev.totalCommits, avgImpact),
         productionCommits: dev.productionCommits
            .sort((a, b) => b.rawScore - a.rawScore)
            .slice(0, 5), // Top 5
         solvedIssues: dev.solvedIssues.sort((a, b) => b.complexity - a.complexity)
      };
   });
};

const determineQuadrant = (commits, impact) => {
   if (impact > 80 && commits > 20) return 'Superstar';
   if (impact > 70 && commits < 20) return 'Silent Architect'; // High impact, low volume
   if (commits > 50) return 'Maintainer'; // High volume, lower impact
   return 'Newcomer';
};
