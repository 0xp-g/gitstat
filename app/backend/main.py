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

@app.get("/repos/{owner}/{repo}/contributors")
def get_contributors(owner: str, repo: str, limit: int = 30):
    """
    Fetches contributors for a repository.
    Returns: list of {username, avatar_url, contributions}
    """
    headers = get_github_headers()
    url = f"https://api.github.com/repos/{owner}/{repo}/contributors?per_page={limit}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        contributors = response.json()
        
        return {
            "repo": f"{owner}/{repo}",
            "count": len(contributors),
            "contributors": [
                {
                    "username": c["login"],
                    "avatar_url": c["avatar_url"],
                    "contributions": c["contributions"],
                    "profile_url": c["html_url"]
                }
                for c in contributors
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch contributors: {str(e)}")

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

    # 2. Loop through each commit
    for commit in commits_summary:
        sha = commit["sha"]
        detail_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        
        try:
            r_detail = requests.get(detail_url, headers=headers)
            r_detail.raise_for_status()
            data = r_detail.json()
            
            stats = data.get("stats", {}) 
            files = data.get("files", [])
            
            file_changes = []
            for f in files:
                file_changes.append({
                    "filename": f["filename"],
                    "status": f["status"],
                    "additions": f["additions"],
                    "deletions": f["deletions"],
                    "patch": f.get("patch", "") 
                })

            # --- FIX STARTS HERE ---
            
            # 1. Create the dictionary and assign it to a variable FIRST
            commit_payload = {
                "sha": sha,
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "total_stats": stats,
                "files": file_changes
            }
            
            # 2. Now run heuristics on that variable
            analysis = apply_heuristics(commit_payload)
            
            # 3. Inject the analysis results back into the payload
            commit_payload["analysis"] = analysis

            # 4. Append ONLY ONCE
            detailed_results.append(commit_payload)
            
            # --- FIX ENDS HERE ---

        except Exception as e:
            print(f"Skipping commit {sha} due to error: {e}")
            continue

    return {
        "repo": f"{owner}/{repo}",
        "count": len(detailed_results),
        "commits": detailed_results
    }

def apply_heuristics(commit_data):
    """
    Input: commit_data dict with 'files', 'total_stats', 'message'
    Output: dict with 'impact_score', 'category', 'tags', 'primary_language'
    """
    stats = commit_data.get("total_stats", {"additions": 0, "deletions": 0, "total": 0})
    files = commit_data.get("files", [])
    message = commit_data.get("message", "").lower()

    additions = stats.get("additions", 0)
    deletions = stats.get("deletions", 0)
    total_changes = additions + deletions

    # 1. Impact Score (weighted)
    # Feature work (additions) feels "heavier" than deleting code
    impact_score = min(int(additions * 1.2 + deletions * 0.8), 100)

    # 2. Determine Category
    category = "Uncategorized"
    tags = []

    is_docs_only = bool(files) and all(f['filename'].endswith(('.md', '.txt')) for f in files)
    is_license_only = bool(files) and all(f['filename'].endswith('LICENSE') for f in files)

    # Category rules (priority order)
    if is_docs_only:
        category = "Documentation"
        tags.append("docs")
    elif is_license_only:
        category = "License Update"
        tags.append("legal")
    elif any(k in message for k in ["merge", "merged", "merging"]):
        category = "Merge"
        tags.append("maintenance")
    elif total_changes > 200 or len(files) > 10:
        category = "Major Feature"
        tags.append("high-impact")
    # Safe division: deletions > 0 check prevents ZeroDivisionError
    elif deletions > 0 and additions > 0 and 0.8 <= (additions / deletions) <= 1.2:
        category = "Refactor"
        tags.append("cleanup")
    elif any(k in message for k in ["fix", "bug", "patch", "issue"]):
        category = "Bug Fix"
        tags.append("bugfix")
    elif total_changes < 10:
        category = "Tiny Change"
        tags.append("minor")
    else:
        category = "Feature Work"

    # 3. Detect Risk & Sentiment
    if len(files) > 5 or total_changes > 100:
        tags.append("high-risk")
    
    if deletions > additions * 2:
        tags.append("destructive")  # e.g. removing dead code
        
    if len(files) == 0:
        tags.append("empty-commit")

    # Fun/Smart: Detect Panic or Urgency
    if any(k in message for k in ["oops", "whoops", "asap", "urgent", "damn", "hotfix"]):
        tags.append("urgent-fix")

    # 4. Detect Complexity (heuristic)
    if any(f['filename'].endswith(('.py', '.java', '.cpp', '.js', '.ts', '.tsx')) for f in files) and total_changes > 50:
        tags.append("complex-change")

    return {
        "impact_score": impact_score,
        "category": category,
        "tags": tags,
        # Ensure your helper function 'detect_language' is still defined in the file!
        "primary_language": detect_language(files)
    }
def detect_language(files):
    # Simple extension checker
    ext_map = {".py": "Python", ".js": "JavaScript", ".tsx": "React", ".css": "CSS", ".html": "HTML"}
    counts = {}
    for f in files:
        for ext, lang in ext_map.items():
            if f["filename"].endswith(ext):
                counts[lang] = counts.get(lang, 0) + 1
    
    # Return the most frequent language found, or "Mixed"
    if not counts: return "Misc"
    return max(counts, key=counts.get)