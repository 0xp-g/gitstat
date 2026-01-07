
const API_BASE_URL = 'http://localhost:8000';

export const fetchRepoCommits = async (owner, repo, limit = 50) => {
   try {
      const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/commits?limit=${limit}`, {
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
