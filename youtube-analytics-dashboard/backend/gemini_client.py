import os
from database import db
from schema_builder import build_system_prompt

import google.generativeai as genai
import json

def get_model():
    # Configure inside so that we pick up env vars dynamically
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    
    return genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=build_system_prompt(),
        generation_config={"response_mime_type": "application/json"}
    )

def get_narrative_model():
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)

    return genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction="You are a data analyst for a YouTube analytics dashboard. Given a user query and the resulting SQL data, write a ONE-SENTENCE, plain-English summary of the insight. No technical jargon. No markdown formatting. Just the narrative text."
    )

async def generate_charts(query: str, history: list) -> dict:
    prompt = f"User Query: {query}\n"
    if history:
        prompt += f"Prior Chat Context: {json.dumps(history)}\n"
        
    model = get_model()
    response = model.generate_content(prompt)
    if not response.text:
        raise ValueError("Empty response from Gemini pass 1")
    return json.loads(response.text)

async def generate_insight(query: str, data: list) -> str:
    # Cap the data output sent to Gemini to prevent passing enormous contexts
    data_str = str(data)[:3000]
    prompt = f"User Question: {query}\nSQL Data Results: {data_str}"
    
    narrative_model = get_narrative_model()
    response = narrative_model.generate_content(prompt)
    if not response.text:
        return "No narrative available for this insight."
    return response.text.strip()
