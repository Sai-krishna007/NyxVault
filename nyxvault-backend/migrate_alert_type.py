"""
migrate_alert_type.py
Add alert_type column to the existing alerts table.
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'nyxvault.db')
print('DB path:', db_path)
print('Exists:', os.path.exists(db_path))

con = sqlite3.connect(db_path)
cur = con.cursor()

cur.execute('PRAGMA table_info(alerts)')
cols = [row[1] for row in cur.fetchall()]
print('Current alert columns:', cols)

if 'alert_type' not in cols:
    sql = "ALTER TABLE alerts ADD COLUMN alert_type VARCHAR(50) NOT NULL DEFAULT 'system'"
    cur.execute(sql)
    con.commit()
    print('Migration OK: alert_type column added.')
else:
    print('alert_type column already exists — nothing to do.')

con.close()
