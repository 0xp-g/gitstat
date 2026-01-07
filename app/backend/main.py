from fastapi import FastAPI
import requests
from fastapi import FastAPI, Depends
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from pydantic import BaseModel
from fastapi import HTTPException
from app.backend.logic import fetch_all_commits
import os


token = os.getenv("GITHUB_TOKEN")

# Import our other files
from app.backend.database import create_db_and_tables, get_session
#ROOT_DIR = Path(__file__).resolve().parents[2]
#load_dotenv(ROOT_DIR / ".env")

app = FastAPI()




# 1. ALLOW FRONTEND CONNECTION (CRITICAL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. STARTUP EVENT
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def root():
    return {"status": "running"}

def get_github_headers():
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not set")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

@app.get("/repos/{owner}/{repo}/commits")
def get_commits(owner: str, repo: str, limit: int = 10):
    """
    Fetches latest commits AND their specific code changes/stats.
    limit: defaults to 10 to prevent rate-limiting/timeouts.
    """
    headers = get_github_headers()
    
    # 1. Get the list of commits (Metadata only)
    list_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page={limit}"
    try:
        r_list = requests.get(list_url, headers=headers)
        r_list.raise_for_status()
        commits_summary = r_list.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch list: {str(e)}")

    detailed_results = []

    # 2. Loop through each commit and fetch the "files" details immediately
    # This "passes down" the SHA internally so you don't have to do it manually.
    for commit in commits_summary:
        sha = commit["sha"]
        detail_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        
        try:
            r_detail = requests.get(detail_url, headers=headers)
            r_detail.raise_for_status()
            data = r_detail.json()
            
            # Extract exactly what you need
            stats = data.get("stats", {}) # e.g. {"total": 5, "additions": 3, "deletions": 2}
            files = data.get("files", [])
            
            file_changes = []
            for f in files:
                file_changes.append({
                    "filename": f["filename"],
                    "status": f["status"], # modified, added, removed
                    "additions": f["additions"],
                    "deletions": f["deletions"],
                    "patch": f.get("patch", "") # This is the actual code diff!
                })

            detailed_results.append({
                "sha": sha,
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "total_stats": stats,
                "files": file_changes
            })
            
        except Exception as e:
            print(f"Skipping commit {sha} due to error: {e}")
            continue

    return {
        "repo": f"{owner}/{repo}",
        "count": len(detailed_results),
        "commits": detailed_results
    }