import sqlite3
import pandas as pd
import json

# Setup an in-memory SQLite database with shared cache so it can be accessed
# by different threads in FastAPI
DB_URI = "file:youtube?mode=memory&cache=shared"

class Database:
    def __init__(self):
        self.enums = {}

    def get_connection(self):
        return sqlite3.connect(DB_URI, uri=True, check_same_thread=False)

    def load_csv(self, csv_file_path: str):
        print(f"Loading data from {csv_file_path}...")
        df = pd.read_csv(csv_file_path)
        
        # Load into sqlite
        conn = self.get_connection()
        df.to_sql("videos", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df)} rows into 'videos' table.")
        
        self.extract_enums(df)
        conn.close()
        
    def extract_enums(self, df: pd.DataFrame):
        self.enums["category"] = sorted([str(x) for x in df["category"].dropna().unique()])
        self.enums["language"] = sorted([str(x) for x in df["language"].dropna().unique()])
        self.enums["region"] = sorted([str(x) for x in df["region"].dropna().unique()])

        print("Extracted Enums:", json.dumps(self.enums, indent=2))
        
    def get_enums(self):
        return self.enums

db = Database()
