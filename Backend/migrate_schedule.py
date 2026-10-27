import sqlite3

connection = sqlite3.connect("app.db")
cursor = connection.cursor()

columns = {
    row[1]
    for row in cursor.execute("PRAGMA table_info(events)")
}

additions = [
    ("start_time", 'TEXT NOT NULL DEFAULT "09:00"'),
    ("end_time", 'TEXT NOT NULL DEFAULT "17:00"'),
    ("attendees", "INTEGER NOT NULL DEFAULT 0"),
    ("status", 'TEXT NOT NULL DEFAULT "Planning"'),
    ("resources", 'TEXT NOT NULL DEFAULT ""'),
]

for column_name, column_definition in additions:
    if column_name not in columns:
        cursor.execute(
            f"ALTER TABLE events ADD COLUMN {column_name} {column_definition}"
        )

connection.commit()
connection.close()

print("Database updated successfully.")