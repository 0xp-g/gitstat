from fastapi import FastAPI
import requests, asyncio, httpx
from fastapi import FastAPI, Depends
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from pydantic import BaseModel
from fastapi import HTTPException
from app.backend.logic import fetch_all_commits
import os
from app.backend.ai_reviewer import get_real_ai_review
import asyncio

token = os.getenv("GITHUB_TOKEN")

# Import our other files
from app.backend.database import create_db_and_tables, get_session
#ROOT_DIR = Path(__file__).resolve().parents[2]
#load_dotenv(ROOT_DIR / ".env")

app = FastAPI()




import json
from fastapi import Response

# Helper Functions
def parse_github_repo(url: str):
    """
    Parses 'owner' and 'repo' from a GitHub URL or 'owner/repo' string.
    """
    if "github.com" in url:
        parts = url.rstrip("/").split("/")
        if len(parts) >= 2:
            return parts[-2], parts[-1]
    elif "/" in url:
        parts = url.split("/")
        if len(parts) == 2:
            return parts[0], parts[1]
    raise ValueError("Invalid repository URL or format")

def gh_get(url: str):
    """
    Wrapper for GitHub API GET requests with headers.
    """
    headers = get_github_headers()
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def compute_description_complexity(body: str):
    """
    Heuristic to score issue complexity based on description length and formatting.
    Returns: (score [1-5], reasoning [str])
    """
    if not body:
        return 1, "Empty description"
        
    score = 1
    reasons = []
    
    # Length
    length = len(body)
    if length > 2000:
        score += 2
        reasons.append("Long description")
    elif length > 500:
        score += 1
        reasons.append("Detailed description")
        
    # Code blocks
    if "```" in body:
        score += 1
        reasons.append("Contains code snippets")
        
    # Lists (steps to reproduce)
    if "- [ ]" in body or "1. " in body:
        score += 1
        reasons.append("Structured list/steps")
        
    return min(score, 5), ", ".join(reasons)

def get_issue_solver(owner: str, repo: str, issue_number: int):
    """
    Attempts to find who solved the issue by checking closed events (e.g. via PR).
    """
    try:
        # Fetch events for the issue
        events = gh_get(f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/events")
        
        for event in events:
            # Look for 'closed' event with commit_id (merged PR)
            # or 'referenced' by a PR that was merged
            if event["event"] == "closed":
                # If closed by a commit/PR
                if event.get("commit_id"):
                     # This gets tricky, usually we want the PR author.
                     # For now, if 'actor' is present, return them.
                     if event.get("actor"):
                         return event["actor"]["login"]
            
    except Exception:
        pass
    return None

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
async def get_commits(owner: str, repo: str, limit: int = 10, include_ai: bool = True):
    """
    Fetches latest commits asynchronously to avoid timeouts.
    """
    headers = get_github_headers()
    list_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page={limit}"
    
    async with httpx.AsyncClient() as client:
        # 1. Get the list of commits (Metadata only)
        try:
            r_list = await client.get(list_url, headers=headers)
            r_list.raise_for_status()
            commits_summary = r_list.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch list: {str(e)}")

        # 2. Prepare tasks for fetching details in parallel
        tasks = []
        for commit in commits_summary:
            sha = commit["sha"]
            detail_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
            tasks.append(client.get(detail_url, headers=headers))
        
        # 3. Execute all requests concurrently
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        detailed_results = []

        # 4. Process results and prepare for AI analysis
        payloads_to_analyze = []

        for i, response in enumerate(responses):
            commit_summary = commits_summary[i]
            sha = commit_summary["sha"]

            # Handle failed requests gracefully
            if isinstance(response, Exception) or response.status_code != 200:
                print(f"Error fetching commit {sha}: {response}")
                # Don't skip, provide a fallback entry so history isn't "inaccurate" (missing items)
                payloads_to_analyze.append({
                    "sha": sha,
                    "message": commit_summary["commit"]["message"],
                    "author": commit_summary["commit"]["author"]["name"],
                    "author_login": commit_summary["author"]["login"] if commit_summary.get("author") else None,
                    "date": commit_summary["commit"]["author"]["date"],
                    "total_stats": {"additions": 0, "deletions": 0},
                    "files": [],
                    "analysis": {
                        "impact_score": 0,
                        "category": "Fetch Error",
                        "tags": ["error"],
                        "primary_language": "Unknown",
                        "review_summary": "Failed to fetch commit details from GitHub.",
                        "quality_score": 0,
                        "complexity": "Unknown",
                        "risk_level": "Unknown"
                    }
                })
                continue

            data = response.json()
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

            # Create payload
            commit_payload = {
                "sha": sha,
                "message": commit_summary["commit"]["message"],
                "author": commit_summary["commit"]["author"]["name"],
                "author_login": commit_summary["author"]["login"] if commit_summary.get("author") else None,
                "date": commit_summary["commit"]["author"]["date"],
                "total_stats": stats,
                "files": file_changes
            }
            
            payloads_to_analyze.append(commit_payload)

        # 5. Run AI Analysis + Heuristics in Parallel
        # Use a semaphore to limit concurrency and avoid 429 Too Many Requests
        semaphore = asyncio.Semaphore(3)

        # Load cache once for efficiency
        cache = load_cache()

        async def analyze_commit(payload):
            sha = payload["sha"]
            
            # Check if we have cached AI analysis
            if sha in cache and cache[sha].get("impact_score", 0) > 0 and "heuristic" not in str(cache[sha].get("review_summary", "")).lower():
                 payload["analysis"] = cache[sha]
                 return payload

            # Otherwise, run heuristics
            heuristic_data = apply_heuristics(payload)
            payload["analysis"] = heuristic_data
            
            # If AI is requested (and not cached), run it
            if include_ai:
                async with semaphore:
                    # Run Real AI analysis (slower, so we thread it)
                    ai_data = await asyncio.to_thread(get_real_ai_review, payload)
                    
                    # Merge: AI data overwrites heuristics where applicable, or complements it
                    final_analysis = {**heuristic_data, **ai_data}
                    
                    # Ensure impact_score comes from AI if valid (AI returns 0-100)
                    if ai_data.get("impact_score") and ai_data.get("impact_score") > 0:
                         final_analysis["impact_score"] = ai_data["impact_score"]

                    payload["analysis"] = final_analysis
            
            return payload

        if payloads_to_analyze:
            detailed_results = await asyncio.gather(*[analyze_commit(p) for p in payloads_to_analyze])
        else:
            detailed_results = []

        # Update User Persistence Cache
        user_stats = update_user_stats(owner, repo, detailed_results)
    
    return {
        "repo": f"{owner}/{repo}",
        "count": len(detailed_results),
        "commits": detailed_results,
        "user_stats": user_stats
    }

class CommitPayload(BaseModel):
    sha: str
    message: str
    author: str
    author_login: str | None = None
    date: str
    total_stats: dict
    files: list

# Simple JSON Cache for AI Results
CACHE_FILE = "ai_cache.json"
# Cache for User Aggregated Stats
USER_CACHE_FILE = "user_cache.json"

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f)
    except:
        pass

def load_user_cache():
    if os.path.exists(USER_CACHE_FILE):
        try:
            with open(USER_CACHE_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_user_cache(cache):
    try:
        with open(USER_CACHE_FILE, "w") as f:
            # Ensure we serialize sets to lists if needed
            # For simplicity, we'll store processed_shas as lists in the dict
            json.dump(cache, f, default=lambda x: list(x) if isinstance(x, set) else x)
    except:
        pass

def update_user_stats(owner, repo, commits):
    """
    Updates the persistent user cache with new commit data.
    """
    cache = load_user_cache()
    repo_key = f"{owner}/{repo}"
    
    if repo_key not in cache:
        cache[repo_key] = {}
        
    updated = False
    
    for commit in commits:
        username = commit.get("author", "Unknown")
        sha = commit.get("sha")
        analysis = commit.get("analysis", {})
        
        # We need a valid impact score to count it
        impact = analysis.get("impact_score", 0)
        
        if username not in cache[repo_key]:
            cache[repo_key][username] = {
                "total_impact": 0,
                "commit_count": 0,
                "lines_added": 0,
                "lines_deleted": 0,
                "processed_shas": []
            }
            
        user_entry = cache[repo_key][username]
        
        # Check if already processed
        if sha not in user_entry["processed_shas"]:
            # First time seeing this SHA
            user_entry["total_impact"] += impact
            user_entry["commit_count"] += 1
            user_entry["lines_added"] += commit.get("total_stats", {}).get("additions", 0)
            user_entry["lines_deleted"] += commit.get("total_stats", {}).get("deletions", 0)
            
            # Use dict to store scan history for updates {sha: impact}
            if isinstance(user_entry["processed_shas"], list):
                # Migration: convert list to dict (assume old stored impact was heuristic 0 if undefined)
                user_entry["processed_shas"] = {s: 0 for s in user_entry["processed_shas"]}
            
            user_entry["processed_shas"][sha] = impact
            updated = True
        else:
            # SHA exists, check for update
            if isinstance(user_entry["processed_shas"], list):
                 user_entry["processed_shas"] = {s: 0 for s in user_entry["processed_shas"]}
            
            old_impact = user_entry["processed_shas"].get(sha, 0)
            if old_impact != impact:
                # Update score difference
                user_entry["total_impact"] = user_entry["total_impact"] - old_impact + impact
                user_entry["processed_shas"][sha] = impact
                updated = True
            
    if updated:
        save_user_cache(cache)
        
    return cache[repo_key]

@app.post("/analysis/commit")
def analyze_single_commit(payload: CommitPayload):
    """
    On-demand AI analysis for a single commit.
    Used for progressive loading.
    """
    # Check cache first
    cache = load_cache()
    if payload.sha in cache:
        return cache[payload.sha]

    # Convert Pydantic model to dict
    data = payload.dict()
    
    # 1. Re-apply heuristics (fast)
    heuristic_data = apply_heuristics(data)
    
    # 2. Run Real AI
    ai_data = get_real_ai_review(data)
    
    # 3. Merge
    final_analysis = {**heuristic_data, **ai_data}
    final_analysis["analysis_type"] = "ai" # Mark as Real AI
    
    if ai_data.get("impact_score") and ai_data.get("impact_score") > 0:
        final_analysis["impact_score"] = ai_data["impact_score"]
    
    # Save to cache if it was a successful AI response (not a fallback error)
    summary = final_analysis.get("review_summary", "")
    if "AI quota exceeded" not in summary and "AI analysis failed" not in summary:
        cache[payload.sha] = final_analysis
        save_cache(cache)
        
    # Update User Stats with new AI score (this handles re-processing logic)
    # We construct a minimal commit object for the update function
    commit_obj = data.copy()
    commit_obj["analysis"] = final_analysis
    update_user_stats(data.get("author_name") or data.get("author", "Unknown").split("/")[0], data.get("repo_name") or "unknown/repo", [commit_obj])
        
    return final_analysis

@app.get("/issues/closed")
def get_closed_issues(repo_url: str, limit: int = 10):
    """
    Get closed GitHub issues from a repository.
    """
    try:
        owner, repo = parse_github_repo(repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        issues = gh_get(
            f"https://api.github.com/repos/{owner}/{repo}/issues?state=closed&per_page={limit}"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch issues: {str(e)}")

    results = []

    for issue in issues:
        # Skip PRs masquerading as issues
        if "pull_request" in issue:
            continue

        complexity_score, reasoning = compute_description_complexity(
            issue.get("body", "")
        )

        # Extract the person who created the issue
        created_by = issue.get("user", {}).get("login") if issue.get("user") else None
        
        # Extract the person who closed the issue
        closed_by_user = None
        if issue.get("closed_by"):
            closed_by_user = issue["closed_by"].get("login")

        # Find the person who actually solved/fixed the issue
        solver = get_issue_solver(owner, repo, issue["number"])
        
        # Fallback: if no specific solver found via events, assume closer is solver (often true for maintainers)
        # OR leave it empty. Let's use closed_by as fallback if solver is None
        if not solver:
            solver = closed_by_user

        results.append({
            "issue_number": issue["number"],
            "issue_title": issue["title"],
            "issue_description": issue["body"],
            "issue_url": issue["html_url"],
            "state": issue["state"],
            "created_by": created_by,
            "closed_by": closed_by_user,
            "solved_by": solver,
            "complexity_score": complexity_score,
            "complexity_reasoning": reasoning,
            "closed_at": issue.get("closed_at")
        })

    return Response(
        content=json.dumps(
            {
                "repository": f"{owner}/{repo}",
                "closed_issues_analyzed": len(results),
                "data": results
            },
            indent=2
        ),
        media_type="application/json"
    )

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
    complexity_score = 1
    if any(f['filename'].endswith(('.py', '.java', '.cpp', '.js', '.ts', '.tsx')) for f in files):
        if total_changes > 200: complexity_score = 5
        elif total_changes > 100: complexity_score = 3
        elif total_changes > 50: complexity_score = 2
    
    return {
        "impact_score": impact_score,
        "heuristic_impact_score": impact_score, # Preserve original score
        "category": category,
        "tags": tags,
        "complexity": complexity_score,
        "analysis_type": "heuristic", # Explicitly mark as heuristic
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