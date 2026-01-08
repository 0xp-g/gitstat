
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("app/.env")
KEY = os.getenv("GEMINI_API_KEY")

if KEY:
    genai.configure(api_key=KEY)
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"{m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
