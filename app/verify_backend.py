import requests
import sys
import json

def test_backend():
    try:
        # 1. Test Root
        print("Testing Root Endpoint...")
        r = requests.get("http://localhost:8000/")
        if r.status_code != 200:
            print(f"FAILED: Root endpoint returned {r.status_code}")
            return
        print("Root OK")

        # 2. Test Commits Endpoint (using a public repo that is likely to work)
        # We'll use 'fastapi/fastapi' as a test case, or something smaller if possible.
        # Let's use the user's current repo concept if we knew it, otherwise a popular one.
        print("Testing Commits Endpoint...")
        owner = "tiangolo"
        repo = "fastapi"
        r = requests.get(f"http://localhost:8000/repos/{owner}/{repo}/commits?limit=5")
        
        if r.status_code == 200:
            data = r.json()
            print(f"Commits OK. Fetched {len(data.get('commits', []))} commits.")
            # Validate structure
            if 'commits' in data and len(data['commits']) > 0:
                print("Structure valid.")
            else:
                print("Structure valid (but empty commits).")
        else:
            print(f"FAILED: Commits endpoint returned {r.status_code}")
            print(r.text)
            
    except Exception as e:
        print(f"FAILED: Exception occurred: {e}")

if __name__ == "__main__":
    test_backend()
