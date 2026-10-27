import sqlite3

connection = sqlite3.connect("app.db")
cursor = connection.cursor()

schedule_data = [
    (
        "EVT-101",
        "10:00",
        "17:00",
        350,
        "Planning",
        "Projector,Microphone,Event Staff",
    ),
    (
        "EVT-102",
        "09:30",
        "13:00",
        120,
        "Planning",
        "Projector,Event Staff",
    ),
    (
        "EVT-103",
        "10:00",
        "16:00",
        80,
        "Confirmed",
        "Projector,Chairs",
    ),
    (
        "EVT-104",
        "11:00",
        "14:00",
        250,
        "Planning",
        "Projector,Microphone",
    ),
]

for event_id, start_time, end_time, attendees, status, resources in schedule_data:
    cursor.execute(
        """
        UPDATE events
        SET
            start_time = ?,
            end_time = ?,
            attendees = ?,
            status = ?,
            resources = ?
        WHERE event_id = ?
        """,
        (
            start_time,
            end_time,
            attendees,
            status,
            resources,
            event_id,
        ),
    )

connection.commit()
connection.close()

print("Schedule data populated successfully.")