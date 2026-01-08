
import os
import google.generativeai as genai
from dotenv import load_dotenv
import time

load_dotenv("app/.env")
KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=KEY)

def test_model(model_name):
    print(f"\nTesting {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello, satisfy this request with a short sentence.")
        print(f"Success: {response.text}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

# Test candidates
test_model('gemini-2.0-flash')
test_model('gemini-2.0-flash-lite-preview-02-05')
test_model('gemini-2.0-flash-exp')
