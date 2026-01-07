import { transformCommitsToDeveloperData } from './frontend/src/utils/transformers.js';

const mockBackendResponse = {
   repo: "owner/repo",
   count: 2,
   commits: [
      {
         sha: "123",
         message: "feat: Test commit 1",
         author: "UserA",
         date: "2023-01-01T00:00:00Z",
         total_stats: { additions: 100, deletions: 50, total: 150 },
         files: [],
         analysis: {
            impact_score: 80,
            category: "Feature",
            tags: ["test"],
            primary_language: "Python"
         }
      },
      {
         sha: "456",
         message: "fix: Test commit 2",
         author: "UserA",
         date: "2023-01-02T00:00:00Z",
         total_stats: { additions: 10, deletions: 5, total: 15 },
         files: [],
         analysis: {
            impact_score: 30,
            category: "Bug Fix",
            tags: ["fix"],
            primary_language: "Python"
         }
      }
   ]
};

try {
   console.log("Testing Transformer...");
   const result = transformCommitsToDeveloperData(mockBackendResponse);

   if (result.length !== 1) {
      throw new Error(`Expected 1 developer, got ${result.length}`);
   }

   const dev = result[0];
   if (dev.username !== "UserA") throw new Error("Wrong username");
   if (dev.totalCommits !== 2) throw new Error("Wrong total commits");

   // Impact score avg: (80 + 30) / 2 = 55
   if (dev.aiImpactScore !== 55) throw new Error(`Wrong impact score: ${dev.aiImpactScore}`);

   console.log("Transformer OK");
   console.log(JSON.stringify(result, null, 2));

} catch (e) {
   console.error("FAILED:", e);
   process.exit(1);
}
