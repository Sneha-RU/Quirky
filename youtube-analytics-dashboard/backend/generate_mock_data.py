import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

NUM_ROWS = 500

categories = ["Tech Reviews", "Vlogs", "Gaming", "Education", "Comedy", "Music"]
languages = ["English", "Japanese", "Urdu", "Spanish", "Hindi", "French"]
regions = ["US", "UK", "JP", "PK", "BR", "IN", "CA"]

def random_date(start, end):
    return start + timedelta(seconds=np.random.randint(0, int((end - start).total_seconds())))

start_date = datetime(2023, 1, 1)
end_date = datetime(2024, 12, 31)

data = []
for i in range(NUM_ROWS):
    timestamp = random_date(start_date, end_date).strftime('%Y-%m-%d %H:%M:%S')
    video_id = f"VID_{np.random.randint(100000, 999999)}"
    category = np.random.choice(categories)
    language = np.random.choice(languages)
    region = np.random.choice(regions)
    duration_sec = np.random.randint(60, 3600)
    views = np.random.randint(1000, 5000000)
    engagement_factor = np.random.uniform(0.01, 0.15)
    
    likes = int(views * engagement_factor * np.random.uniform(0.5, 0.9))
    comments = int(views * engagement_factor * np.random.uniform(0.05, 0.2))
    shares = int(views * engagement_factor * np.random.uniform(0.05, 0.1))
    
    sentiment_score = round(np.random.uniform(-0.8, 1.0), 2)
    ads_enabled = bool(np.random.choice([True, False], p=[0.8, 0.2]))
    
    data.append([
        timestamp, video_id, category, language, region, duration_sec,
        views, likes, comments, shares, sentiment_score, ads_enabled
    ])

df = pd.DataFrame(data, columns=[
    "timestamp", "video_id", "category", "language", "region", "duration_sec",
    "views", "likes", "comments", "shares", "sentiment_score", "ads_enabled"
])

os.makedirs("data", exist_ok=True)
df.to_csv("data/youtube_content.csv", index=False)
print("Created data/youtube_content.csv with", NUM_ROWS, "rows.")
