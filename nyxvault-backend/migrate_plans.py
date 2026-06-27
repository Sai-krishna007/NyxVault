import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'nyxvault.db')
print("DB Path:", db_path)

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET plan = 'Enterprise'")
        conn.commit()
        conn.close()
        print("Successfully updated all users to Enterprise plan.")
    except Exception as e:
        print("Error during migration:", e)
else:
    print("Database file does not exist yet.")
