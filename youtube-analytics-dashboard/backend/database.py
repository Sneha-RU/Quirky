import sqlite3
import pandas as pd
import json

class Database:
    def __init__(self):
        self.enums = {}
        # Keep a single persistent connection alive for the lifetime of the app.
        # In-memory SQLite databases are destroyed when all connections close,
        # so we must never close this one.
        self._conn = sqlite3.connect(":memory:", check_same_thread=False)

    def get_connection(self):
        """Return the persistent shared connection."""
        return self._conn

    def load_csv(self, csv_file_path: str):
        print(f"Loading data from {csv_file_path}...")
        df = pd.read_csv(csv_file_path)

        # Load into the persistent in-memory sqlite connection
        df.to_sql("videos", self._conn, if_exists="replace", index=False)
        self._conn.commit()
        print(f"Loaded {len(df)} rows into 'videos' table.")

        self.extract_enums(df)

    def extract_enums(self, df: pd.DataFrame):
        self.enums["category"] = sorted([str(x) for x in df["category"].dropna().unique()])
        self.enums["language"] = sorted([str(x) for x in df["language"].dropna().unique()])
        self.enums["region"] = sorted([str(x) for x in df["region"].dropna().unique()])
        print("Extracted Enums:", json.dumps(self.enums, indent=2))

    def get_enums(self):
        return self.enums

db = Database()
