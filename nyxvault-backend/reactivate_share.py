import sqlite3

db_path = r'C:\Users\saikr\.gemini\antigravity\scratch\nyxvault-backend\instance\nyxvault.db'
print("Updating database at:", db_path)

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Update the status and views for SL-8747 to reactivate it
    c.execute("UPDATE shares SET status='active', views=0 WHERE id='SL-8747'")
    conn.commit()
    
    # Verify the update
    c.execute("SELECT id, file, status, views, expiry FROM shares WHERE id='SL-8747'")
    row = c.fetchone()
    print("Verification - Updated Row:", row)
    
    conn.close()
    print("Database updated and share reactivated successfully!")
except Exception as e:
    print("Error updating database:", e)
