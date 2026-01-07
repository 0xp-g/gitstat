import os
import requests

GITHUB_API = "https://api.github.com"

def fetch_all_commits(owner: str, repo: str):
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN not set")

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    all_commits = []
    page = 1

    while True:
        url = f"{GITHUB_API}/repos/{owner}/{repo}/commits"
        r = requests.get(
            url,
            headers=headers,
            params={"per_page": 100, "page": page}
        )

        if r.status_code != 200:
            raise RuntimeError(r.text)

        data = r.json()
        if not data:
            break

        all_commits.extend(data)
        page += 1

    return all_commits
