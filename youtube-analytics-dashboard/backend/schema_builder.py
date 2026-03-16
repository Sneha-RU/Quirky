from database import db
import json

BASE_SCHEMA = """
TABLE: videos
COLUMNS:
- timestamp (Datetime): Video publish/engagement datetime (YYYY-MM-DD HH:MM:SS)
- video_id (String): Unique video identifier (e.g. VID_589765)
- category (String): Content genre (e.g. Vlogs, Tech Reviews)
- language (String): Primary video language
- region (String): 2-letter country code (e.g. US, UK)
- duration_sec (Integer): Video length in seconds
- views (Integer): Total view count
- likes (Integer): Total like count
- comments (Integer): Total comment count
- shares (Integer): Total share count
- sentiment_score (Float): Audience sentiment polarity (-1.0 to 1.0)
- ads_enabled (Boolean): Whether monetization is active (1 or 0 in sqlite usually)

COMPUTED COLUMNS (always use these exactly if asked):
engagement_rate = (likes + comments + shares) / NULLIF(views, 0)
like_ratio      = likes / NULLIF(views, 0)
duration_min    = duration_sec / 60.0
"""

RULES = """
RULES:
1. Return ONLY valid JSON. No markdown, no preamble.
2. Never use column names or enum values not listed above.
3. If the question cannot be answered from this schema, return:
   { "error": "insufficient_data", "reason": "..." }
4. Never fabricate data values or invent filter values.
5. Always include a confidenceScore (0.0 to 1.0) representing how well the SQL matches the intent.
6. The database is SQLite3. Write valid SQLite3 syntax. Avoid complex functions not in SQLite3. To get the month/year, use strftime. Use `CAST(SUM() AS FLOAT)` for division to avoid integer division.

OUTPUT SCHEMA:
{
  "charts": [
    {
      "chartType": "line|bar|area|pie|donut|scatter|kpi_card|heatmap",
      "title": "...",
      "subtitle": "...",
      "sqlQuery": "SELECT ...",
      "xKey": "...",
      "yKey": "...",
      "colorKey": "...",
      "confidenceScore": 0.8
    }
  ]
}

Make sure `xKey` and `yKey` exactly match the aliases of the columns returning the metric and dimension in your `sqlQuery`. `colorKey` should be used if there is a secondary dimension to slice by.
For chart selection, follow these deterministic rules:
- timestamp in GROUP BY -> line or area chart
- 2 categorical dimensions -> grouped bar or heatmap
- sentiment_score as primary Y axis -> scatter or bar
- ads_enabled as dimension -> donut/pie or side-by-side bar
- single metric + multiple categories (>6) -> bar (horizontal in frontend)
- single metric + multiple categories (<=6) -> bar (vertical)
- correlation between 2 continuous metrics -> scatter
- single summary number -> kpi_card
- region x category cross-tab -> heatmap
"""

def build_system_prompt() -> str:
    enums = db.get_enums()
    
    enum_str = "VALID ENUMS:\n"
    if "category" in enums:
        enum_str += f"  category: {json.dumps(enums['category'])}\n"
    if "language" in enums:
        enum_str += f"  language: {json.dumps(enums['language'])}\n"
    if "region" in enums:
        enum_str += f"  region: {json.dumps(enums['region'])}\n"

    prompt = (
        "You are a SQL and data visualization expert for a YouTube analytics dashboard.\n\n"
        f"{BASE_SCHEMA}\n{enum_str}\n{RULES}"
    )
    return prompt
