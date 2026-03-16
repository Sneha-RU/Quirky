from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env variables into os.environ

from database import db
from query_runner import run_query
import gemini_client

app = FastAPI(title="YouTube Analytics Dashboard Backend")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    history: List[Dict[str, str]] = []

@app.on_event("startup")
def startup_event():
    # If the dummy data wrapper generated the file, load it
    csv_path = "data/youtube_content.csv"
    if os.path.exists(csv_path):
        db.load_csv(csv_path)
    else:
        print(f"Warning: {csv_path} not found. Start mock script first.")

@app.post("/api/query")
async def process_query(req: QueryRequest):
    try:
        # Pass 1: Gemini decides chart and SQL
        gemini_res = await gemini_client.generate_charts(req.query, req.history)
        
        # Detect if it returned a soft-error JSON
        if "error" in gemini_res:
            return {
                "error": gemini_res["error"],
                "reason": gemini_res.get("reason", "Unknown reason.")
            }
            
        charts = gemini_res.get("charts", [])
        all_data_for_insight = []
        
        # Pass 2: Execute SQL
        for chart in charts:
            sql = chart.get("sqlQuery", "")
            if not sql:
                continue
            
            data = run_query(sql)
            chart["data"] = data
            all_data_for_insight.extend(data)

        # Build KPI Cards automatically
        # Always run a global top row KPI query
        kpi_sql = """
        SELECT 
            COUNT(*) as "Total Videos",
            CAST(AVG(views) AS INTEGER) as "Avg Views",
            ROUND(AVG(sentiment_score), 2) as "Avg Sentiment Score",
            ROUND(CAST(SUM(CASE WHEN ads_enabled = 1 THEN 1 ELSE 0 END) AS FLOAT) / CAST(COUNT(*) AS FLOAT) * 100, 1) as "Ads Enabled %"
        FROM videos
        """
        kpi_data = run_query(kpi_sql)
        
        # Request narration for the combined outcome
        insight_summary = ""
        if all_data_for_insight:
            insight_summary = await gemini_client.generate_insight(req.query, all_data_for_insight)

        return {
            "charts": charts,
            "kpiRow": kpi_data[0] if kpi_data else {},
            "insightSummary": insight_summary,
            "confidenceScore": sum(c.get("confidenceScore", 0) for c in charts) / len(charts) if charts else 0
        }
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    # Save uploaded file
    file_location = f"data/{file.filename}"
    os.makedirs("data", exist_ok=True)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
        
    # Load into memory SQLite
    db.load_csv(file_location)
    return {
        "status": "success",
        "message": f"Dataset {file.filename} loaded.",
        "enums": db.get_enums(),
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
