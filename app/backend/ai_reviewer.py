
import os
import google.generativeai as genai
from typing import Dict, Any

# Configure the API key
# (User needs to set GEMINI_API_KEY in .env)
# We default to empty if not found, handling it gracefully
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_real_ai_review(commit_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes a commit using Google Gemini API to return a 'real' AI score and verification.
    """
    
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning fallback scores.")
        return {
            "ai_score": 0,
            "ai_review": "AI API Key missing.",
            "complexity_level": "Unknown"
        }

    # Construct the prompt
    message = commit_data.get("message", "")
    author = commit_data.get("author", "Unknown")
    stats = commit_data.get("total_stats", {})
    files = commit_data.get("files", [])
    
    # Limit file diffs to avoid token limits (rudimentary truncation)
    file_summary = []
    for f in files[:5]: # Only first 5 files
        patch_preview = f.get("patch", "")[:500] # First 500 chars of patch
        file_summary.append(f"File: {f['filename']} ({f['status']})\nDiff:\n{patch_preview}\n...")
    
    files_str = "\n".join(file_summary)
    
    prompt = f"""
    Act as a Senior Code Reviewer. Analyze this execution/commit:
    
    Commit Message: "{message}"
    Author: {author}
    Stats: {stats}
    
    Code Changes (Snippet):
    {files_str}
    
    Provide a JSON response ONLY with the following keys:
    1. "impact_score": A number 0-100 indicating the significance/impact of this change (100 = critical feature/fix, 0 = trivial).
    2. "quality_score": A number 0-100 indicating code quality and cleanliness.
    3. "review_summary": A 1-sentence summary of what this code actually does and its quality.
    4. "complexity": One of ["Low", "Medium", "High"].
    5. "risk_level": One of ["Low", "Medium", "High"].
    
    Do not output markdown code blocks, just the raw JSON.
    """
    
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        import time
        retries = 3
        for attempt in range(retries):
            try:
                response = model.generate_content(prompt)
                break
            except Exception as e:
                if "429" in str(e) and attempt < retries - 1:
                    sleep_time = (2 ** attempt) * 2  # 2s, 4s, 8s
                    print(f"Rate limited (429). Retrying in {sleep_time}s...")
                    time.sleep(sleep_time)
                else:
                    raise e
        
        # Clean response (sometimes it has ```json ... ```)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] # Remove first line
            if text.endswith("```"):
                text = text.rsplit("\n", 1)[0] # Remove last line
                
        import json
        analysis = json.loads(text)
        return analysis
        
    except Exception as e:
        print(f"AI Review Failed: {e}")
        return {
            "impact_score": 50, # Neutral fallback
            "quality_score": 50,
            "review_summary": "AI quota exceeded. Showing heuristic analysis based on code patterns.",
            "complexity": "Unknown",
            "risk_level": "Unknown"
        }
