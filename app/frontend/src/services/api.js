
const API_BASE_URL = 'http://localhost:8000';

export const fetchRepoCommits = async (owner, repo, limit = 50, include_ai = true) => {
   try {
      const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/commits?limit=${limit}&include_ai=${include_ai}`, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching repo commits:', error);
      throw error;
   }
};

export const fetchContributors = async (owner, repo, limit = 30) => {
   try {
      const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/contributors?limit=${limit}`, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching contributors:', error);
      throw error;
   }
};

export const fetchClosedIssues = async (repoUrl, limit = 20) => {
   try {
      // The backend expects full repoUrl, e.g. "https://github.com/owner/repo"
      const response = await fetch(`${API_BASE_URL}/issues/closed?repo_url=${encodeURIComponent(repoUrl)}&limit=${limit}`, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching closed issues:', error);
      throw error;
   }
};

export const analyzeCommit = async (commitData) => {
   try {
      const response = await fetch(`${API_BASE_URL}/analysis/commit`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(commitData),
      });

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
   } catch (error) {
      console.error('Error analyzing commit:', error);
      throw error;
   }
};
