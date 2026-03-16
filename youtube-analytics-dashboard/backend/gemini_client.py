import os
from schema_builder import build_system_prompt
import json
from google import genai
from google.genai import types

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)

async def generate_charts(query: str, history: list) -> dict:
    prompt = f"User Query: {query}\n"
    if history:
        prompt += f"Prior Chat Context: {json.dumps(history)}\n"

    client = get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=build_system_prompt(),
            response_mime_type="application/json"
        )
    )
    if not response.text:
        raise ValueError("Empty response from Gemini pass 1")
    return json.loads(response.text)

async def generate_insight(query: str, data: list) -> str:
    data_str = str(data)[:3000]
    prompt = f"User Question: {query}\nSQL Data Results: {data_str}"

    system = "You are a data analyst for a YouTube analytics dashboard. Given a user query and the resulting SQL data, write a ONE-SENTENCE, plain-English summary of the insight. No technical jargon. No markdown formatting. Just the narrative text."

    client = get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system
        )
    )
    if not response.text:
        return "No narrative available for this insight."
    return response.text.strip()
