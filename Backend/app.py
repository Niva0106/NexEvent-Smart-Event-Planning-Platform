
import os
import uuid
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import inspect, text

from extensions import db
from models import Event
from conflict_utils import (
    find_venue_conflict,
    validate_time_range,
)
from finance_backend import finance_bp

# ----------APP CONFIGURATION----------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "app.db")

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False



# ----------CORS CONFIGURATION----------

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5177",
                "http://127.0.0.1:5177",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "http://localhost:5175",
                "http://127.0.0.1:5175",
                "https://nexevent-7kek.onrender.com",
            ]
        }
    },
    supports_credentials=True,
)


db.init_app(app)


# ----------BLUEPRINTS----------

try:
    from payment_qr_backend import payment_bp

    app.register_blueprint(payment_bp)

    print("Payment blueprint registered successfully.")

except Exception as e:
    print("Payment blueprint could not be registered:", e)


try:
    from resource_recommendation_backend import resource_recommendation_bp

    app.register_blueprint(resource_recommendation_bp)

    print("Resource recommendation blueprint registered successfully.")

except Exception as e:
    print(
        "Resource recommendation blueprint could not be registered:",
        e
    )


try:
    from resource_inventory_backend import resource_inventory_bp

    app.register_blueprint(resource_inventory_bp)

    print("Resource inventory blueprint registered successfully.")

except Exception as e:
    print("Resource inventory blueprint could not be registered:", e)


try:
    from vendor_backend import vendor_bp

    app.register_blueprint(vendor_bp)

    print("Vendor blueprint registered successfully.")

except Exception as e:
    print("Vendor blueprint could not be registered:", e)


try:
    from milestone4_backend import milestone4_bp

    app.register_blueprint(milestone4_bp)

    print("Milestone 4 blueprint registered successfully.")

except Exception as e:
    print("Milestone 4 blueprint could not be registered:", e)

try:
    from attendance_backend import attendance_bp

    app.register_blueprint(attendance_bp)

    print("Attendance blueprint registered successfully.")

except Exception as e:
    print(
        "Attendance blueprint could not be registered:",
        e
    )

try:
    from finance_backend import finance_bp

    app.register_blueprint(finance_bp)

    print("Finance blueprint registered successfully.")

except Exception as e:
    print("Finance blueprint could not be registered:", e)

# ----------HELPER FUNCTIONS----------

def safe_int(value, default=0):
    try:
        if value is None or value == "":
            return default

        return int(value)

    except (ValueError, TypeError):
        return default


def safe_float(value, default=0):
    try:
        if value is None or value == "":
            return default

        return float(value)

    except (ValueError, TypeError):
        return default


def clean_value(value, default=None):
    """
    Convert database values into JSON-safe values.
    """

    if value is None:
        return default

    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            pass

    return value


def generate_event_id():
    """
    Generate an event ID such as EVT-ABC123.
    """

    while True:

        event_id = f"EVT-{uuid.uuid4().hex[:6].upper()}"

        try:

            existing = Event.query.filter_by(
                event_id=event_id
            ).first()

            if not existing:
                return event_id

        except Exception:
            return event_id


def get_event_columns():
    """
    Return actual Event model column names.
    """

    return {
        column.key
        for column in Event.__table__.columns
    }


# ----------EVENT SERIALIZER----------

def serialize_event(event):
    """
    Convert Event database object into frontend-safe JSON.

    Both snake_case and camelCase fields are returned so
    the existing frontend can read the values correctly.
    """

    if event is None:
        return None

    event_date = clean_value(
        getattr(event, "date", None),
        ""
    )

    start_time = clean_value(
        getattr(event, "start_time", None),
        ""
    )

    end_time = clean_value(
        getattr(event, "end_time", None),
        ""
    )

    name = getattr(
        event,
        "name",
        ""
    )

    venue = getattr(
        event,
        "venue",
        ""
    )

    city = getattr(
        event,
        "city",
        ""
    )

    attendees = safe_int(
        getattr(event, "attendees", 0),
        0
    )

    status = getattr(
        event,
        "status",
        "Planning"
    )

    budget = safe_float(
        getattr(event, "budget", 0),
        0
    )

    event_id = getattr(
        event,
        "event_id",
        None
    )

    latitude = getattr(
        event,
        "latitude",
        None
    )

    longitude = getattr(
        event,
        "longitude",
        None
    )

    event_type = getattr(
        event,
        "event_type",
        None
    )

    description = getattr(
        event,
        "description",
        None
    )

    organizer = getattr(
        event,
        "organizer",
        None
    )

    price_inr = getattr(
        event,
        "price_inr",
        0
    )

    resources = getattr(
        event,
        "resources",
        ""
    )

    return {

        # ----------------------------------------------------
        # ID
        # ----------------------------------------------------

        "id":
            getattr(event, "id", None),

        "event_id":
            event_id,

        "eventId":
            event_id,


        # ----------------------------------------------------
        # NAME
        # ----------------------------------------------------

        "name":
            name,

        "event_name":
            name,

        "eventName":
            name,


        # ----------------------------------------------------
        # DATE
        # ----------------------------------------------------

        "date":
            event_date,

        "event_date":
            event_date,

        "eventDate":
            event_date,


        # ----------------------------------------------------
        # TIME
        # ----------------------------------------------------

        "start_time":
            start_time,

        "startTime":
            start_time,

        "end_time":
            end_time,

        "endTime":
            end_time,


        # ----------------------------------------------------
        # VENUE
        # ----------------------------------------------------

        "venue":
            venue,

        "venue_name":
            venue,

        "venueName":
            venue,

        "location":
            venue,


        # ----------------------------------------------------
        # CITY
        # ----------------------------------------------------

        "city":
            city,

        "location_city":
            city,


        # ----------------------------------------------------
        # ATTENDEES
        # ----------------------------------------------------

        "attendees":
            attendees,

        "attendee_count":
            attendees,

        "attendeeCount":
            attendees,


        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        "status":
            status or "Planning",


        # ----------------------------------------------------
        # BUDGET
        # ----------------------------------------------------

        "budget":
            budget,


        # ----------------------------------------------------
        # PRICE
        # ----------------------------------------------------

        "price_inr":
            safe_float(price_inr, 0),

        "priceINR":
            safe_float(price_inr, 0),


        # ----------------------------------------------------
        # RESOURCES
        # ----------------------------------------------------

        "resources":
            resources or "",


        # ----------------------------------------------------
        # OPTIONAL INFORMATION
        # ----------------------------------------------------

        "event_type":
            event_type,

        "eventType":
            event_type,

        "description":
            description,

        "organizer":
            organizer,


        # ----------------------------------------------------
        # COORDINATES
        # ----------------------------------------------------

        "latitude":
            latitude,

        "longitude":
            longitude,
    }


# CONFLICT SERIALIZER

def serialize_conflict_event(event):

    if event is None:
        return None

    data = serialize_event(event)

    return {
        "id": data.get("id"),
        "event_id": data.get("event_id"),
        "eventId": data.get("eventId"),
        "name": data.get("name"),
        "event_name": data.get("event_name"),
        "venue": data.get("venue"),
        "date": data.get("date"),
        "start_time": data.get("start_time"),
        "startTime": data.get("startTime"),
        "end_time": data.get("end_time"),
        "endTime": data.get("endTime"),
        "city": data.get("city"),
        "attendees": data.get("attendees"),
    }


# ----------DATABASE MIGRATION----------

def migrate_database():

    try:

        inspector = inspect(
            db.engine
        )

        if "events" not in inspector.get_table_names():
            return

        columns = {
            column["name"]
            for column in inspector.get_columns(
                "events"
            )
        }

        migrations = []

        if "city" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN city VARCHAR(120)"
            )

        if "latitude" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN latitude FLOAT"
            )

        if "longitude" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN longitude FLOAT"
            )

        if "status" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN status VARCHAR(50)"
            )

        if "attendees" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN attendees INTEGER"
            )

        if "budget" not in columns:
            migrations.append(
                "ALTER TABLE events "
                "ADD COLUMN budget FLOAT"
            )

        for sql in migrations:

            try:

                db.session.execute(
                    text(sql)
                )

                db.session.commit()

            except Exception as migration_error:

                db.session.rollback()

                print(
                    "Migration warning:",
                    migration_error
                )

    except Exception as e:

        print(
            "Database migration warning:",
            e
        )


# ----------HEALTH CHECK----------

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "status": "ok",
        "message": "NexEvent backend is running"
    }), 200


# ----------GET ALL EVENTS----------

@app.route(
    "/api/events",
    methods=["GET"]
)
def get_events():

    try:

        events = Event.query.order_by(
            Event.id.asc()
        ).all()

        return jsonify([
            serialize_event(event)
            for event in events
        ]), 200

    except Exception as e:

        print(
            "GET /api/events ERROR:",
            e
        )

        return jsonify({
            "error":
                "Failed to fetch events",
            "details":
                str(e)
        }), 500


# ----------GET SINGLE EVENT----------

@app.route(
    "/api/events/<int:event_id>",
    methods=["GET"]
)
def get_event(event_id):

    try:

        event = db.session.get(
            Event,
            event_id
        )

        if not event:

            return jsonify({
                "error":
                    "Event not found"
            }), 404

        return jsonify(
            serialize_event(event)
        ), 200

    except Exception as e:

        print(
            "GET EVENT ERROR:",
            e
        )

        return jsonify({
            "error":
                "Failed to fetch event",
            "details":
                str(e)
        }), 500


# ----------CREATE EVENT----------

@app.route(
    "/api/events",
    methods=["POST"]
)
def create_event():

    try:

        data = request.get_json(
            silent=True
        )

        print("\n" + "=" * 70)
        print("CREATE EVENT REQUEST")
        print("=" * 70)
        print(
            "Request origin:",
            request.headers.get("Origin")
        )
        print(
            "Request data:",
            data
        )
        print("=" * 70)


        # ----------------------------------------------------
        # REQUEST VALIDATION
        # ----------------------------------------------------

        if not data:

            return jsonify({
                "error":
                    "Request body is empty or invalid JSON"
            }), 400


        # ----------------------------------------------------
        # BASIC INFORMATION
        # ----------------------------------------------------

        name = str(
            data.get(
                "name",
                ""
            )
        ).strip()

        date = str(
            data.get(
                "date",
                ""
            )
        ).strip()

        start_time = str(
            data.get(
                "startTime",
                data.get(
                    "start_time",
                    ""
                )
            )
        ).strip()

        end_time = str(
            data.get(
                "endTime",
                data.get(
                    "end_time",
                    ""
                )
            )
        ).strip()

        venue = str(
            data.get(
                "venue",
                ""
            )
        ).strip()

        city = str(
            data.get(
                "city",
                ""
            )
        ).strip()


        # ----------------------------------------------------
        # REQUIRED FIELDS
        # ----------------------------------------------------

        if not name:

            return jsonify({
                "error":
                    "Event name is required"
            }), 400

        if not date:

            return jsonify({
                "error":
                    "Event date is required"
            }), 400

        if not start_time:

            return jsonify({
                "error":
                    "Start time is required"
            }), 400

        if not end_time:

            return jsonify({
                "error":
                    "End time is required"
            }), 400

        if not venue:

            return jsonify({
                "error":
                    "Venue is required"
            }), 400


        # ----------------------------------------------------
        # DATE VALIDATION
        # ----------------------------------------------------

        try:

            datetime.strptime(
                date,
                "%Y-%m-%d"
            )

        except ValueError:

            return jsonify({
                "error":
                    "Date must be in YYYY-MM-DD format"
            }), 400


        # ----------------------------------------------------
        # TIME VALIDATION
        # ----------------------------------------------------

        valid_time, time_error = (
            validate_time_range(
                start_time,
                end_time
            )
        )

        if not valid_time:

            return jsonify({
                "error":
                    time_error
            }), 400


        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        latitude = safe_float(
            data.get("latitude"),
            None
        )

        longitude = safe_float(
            data.get("longitude"),
            None
        )


        # ----------------------------------------------------
        # VENUE CONFLICT DETECTION
        # ----------------------------------------------------

        conflict = find_venue_conflict(
            Event,
            date,
            venue,
            start_time,
            end_time
        )

        if conflict:

            conflict_data = (
                serialize_conflict_event(
                    conflict
                )
            )

            print("\n" + "!" * 70)
            print("VENUE CONFLICT DETECTED")
            print(
                "Existing event:",
                conflict_data
            )
            print("!" * 70 + "\n")

            return jsonify({

                "error":
                    "Venue conflict detected",

                "message":
                    "Another event is already scheduled "
                    "at this venue during the selected time.",

                "conflict":
                    conflict_data

            }), 409


        # ----------------------------------------------------
        # EVENT DETAILS
        # ----------------------------------------------------

        attendees = safe_int(
            data.get(
                "attendees"
            ),
            0
        )

        budget = safe_float(
            data.get(
                "budget"
            ),
            0
        )

        status = str(
            data.get(
                "status",
                "Planning"
            )
        ).strip()

        if not status:
            status = "Planning"


        # ----------------------------------------------------
        # EVENT ID
        # ----------------------------------------------------

        event_id = generate_event_id()


        # ----------------------------------------------------
        # EVENT COLUMNS
        # ----------------------------------------------------

        event_columns = (
            get_event_columns()
        )


        event_values = {

            "event_id":
                event_id,

            "name":
                name,

            "date":
                date,

            "start_time":
                start_time,

            "end_time":
                end_time,

            "venue":
                venue,

            "city":
                city if city else None,

            "latitude":
                latitude,

            "longitude":
                longitude,

            "attendees":
                attendees,

            "status":
                status,
        }


        if "budget" in event_columns:

            event_values["budget"] = budget


        event_values = {
            key: value
            for key, value in event_values.items()
            if key in event_columns
        }


        # ----------------------------------------------------
        # CREATE EVENT
        # ----------------------------------------------------

        event = Event(
            **event_values
        )


        # ----------------------------------------------------
        # OPTIONAL MODEL FIELDS
        # ----------------------------------------------------

        if hasattr(
            event,
            "event_type"
        ):

            event.event_type = str(
                data.get(
                    "eventType",
                    data.get(
                        "event_type",
                        "general"
                    )
                )
            ).strip()


        if hasattr(
            event,
            "description"
        ):

            event.description = str(
                data.get(
                    "description",
                    ""
                )
            ).strip()


        if hasattr(
            event,
            "organizer"
        ):

            event.organizer = str(
                data.get(
                    "organizer",
                    ""
                )
            ).strip()


        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        db.session.add(
            event
        )

        db.session.commit()


        print(
            "Event created successfully:",
            event_id
        )


        return jsonify({

            "success":
                True,

            "message":
                "Event created successfully",

            "event":
                serialize_event(event)

        }), 201


    except Exception as e:

        db.session.rollback()

        print("\n" + "=" * 70)
        print("CREATE EVENT ERROR")
        print(
            type(e).__name__,
            ":",
            str(e)
        )
        print("=" * 70)

        return jsonify({

            "error":
                "Failed to create event",

            "details":
                str(e)

        }), 500


# ----------UPDATE EVENT----------

@app.route(
    "/api/events/<int:event_id>",
    methods=["PUT", "PATCH"]
)
def update_event(event_id):

    try:

        event = db.session.get(
            Event,
            event_id
        )

        if not event:

            return jsonify({
                "error":
                    "Event not found"
            }), 404


        data = request.get_json(
            silent=True
        ) or {}


        # ----------------------------------------------------
        # PROPOSED VALUES
        # ----------------------------------------------------

        proposed_name = (
            str(data["name"]).strip()
            if "name" in data
            else str(
                getattr(
                    event,
                    "name",
                    ""
                )
            ).strip()
        )


        proposed_date = (
            str(data["date"]).strip()
            if "date" in data
            else str(
                getattr(
                    event,
                    "date",
                    ""
                )
            ).strip()
        )


        if "startTime" in data:

            proposed_start_time = str(
                data["startTime"]
            ).strip()

        elif "start_time" in data:

            proposed_start_time = str(
                data["start_time"]
            ).strip()

        else:

            proposed_start_time = str(
                getattr(
                    event,
                    "start_time",
                    ""
                )
            ).strip()


        if "endTime" in data:

            proposed_end_time = str(
                data["endTime"]
            ).strip()

        elif "end_time" in data:

            proposed_end_time = str(
                data["end_time"]
            ).strip()

        else:

            proposed_end_time = str(
                getattr(
                    event,
                    "end_time",
                    ""
                )
            ).strip()


        proposed_venue = (
            str(data["venue"]).strip()
            if "venue" in data
            else str(
                getattr(
                    event,
                    "venue",
                    ""
                )
            ).strip()
        )


        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        if not proposed_name:

            return jsonify({
                "error":
                    "Event name is required"
            }), 400


        if not proposed_date:

            return jsonify({
                "error":
                    "Event date is required"
            }), 400


        if not proposed_start_time:

            return jsonify({
                "error":
                    "Start time is required"
            }), 400


        if not proposed_end_time:

            return jsonify({
                "error":
                    "End time is required"
            }), 400


        if not proposed_venue:

            return jsonify({
                "error":
                    "Venue is required"
            }), 400


        # ----------------------------------------------------
        # DATE
        # ----------------------------------------------------

        try:

            datetime.strptime(
                proposed_date,
                "%Y-%m-%d"
            )

        except ValueError:

            return jsonify({
                "error":
                    "Date must be in YYYY-MM-DD format"
            }), 400


        # ----------------------------------------------------
        # TIME
        # ----------------------------------------------------

        valid_time, time_error = (
            validate_time_range(
                proposed_start_time,
                proposed_end_time
            )
        )

        if not valid_time:

            return jsonify({
                "error":
                    time_error
            }), 400


        # ----------------------------------------------------
        # UPDATE CONFLICT DETECTION
        # ----------------------------------------------------

        conflict = find_venue_conflict(
            Event,
            proposed_date,
            proposed_venue,
            proposed_start_time,
            proposed_end_time,
            exclude_event_id=event.id
        )

        if conflict:

            conflict_data = (
                serialize_conflict_event(
                    conflict
                )
            )

            return jsonify({

                "error":
                    "Venue conflict detected",

                "message":
                    "Another event is already scheduled "
                    "at the selected venue during this time.",

                "conflict":
                    conflict_data

            }), 409


        # ----------------------------------------------------
        # APPLY BASIC FIELDS
        # ----------------------------------------------------

        event.name = proposed_name

        event.date = proposed_date

        event.start_time = (
            proposed_start_time
        )

        event.end_time = (
            proposed_end_time
        )

        event.venue = proposed_venue


        # ----------------------------------------------------
        # CITY
        # ----------------------------------------------------

        if "city" in data:

            if hasattr(
                event,
                "city"
            ):

                event.city = (
                    str(
                        data["city"]
                    ).strip()
                    if data["city"]
                    else None
                )


        # ----------------------------------------------------
        # COORDINATES
        # ----------------------------------------------------

        if "latitude" in data:

            if hasattr(
                event,
                "latitude"
            ):

                event.latitude = safe_float(
                    data["latitude"],
                    None
                )


        if "longitude" in data:

            if hasattr(
                event,
                "longitude"
            ):

                event.longitude = safe_float(
                    data["longitude"],
                    None
                )


        # ----------------------------------------------------
        # ATTENDEES
        # ----------------------------------------------------

        if "attendees" in data:

            if hasattr(
                event,
                "attendees"
            ):

                event.attendees = safe_int(
                    data["attendees"],
                    0
                )


        # ----------------------------------------------------
        # BUDGET
        # ----------------------------------------------------

        if "budget" in data:

            if hasattr(
                event,
                "budget"
            ):

                event.budget = safe_float(
                    data["budget"],
                    0
                )


        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        if "status" in data:

            if hasattr(
                event,
                "status"
            ):

                event.status = str(
                    data["status"]
                ).strip()


        # ----------------------------------------------------
        # OPTIONAL FIELDS
        # ----------------------------------------------------

        if hasattr(
            event,
            "event_type"
        ):

            if "eventType" in data:

                event.event_type = str(
                    data["eventType"]
                ).strip()

            elif "event_type" in data:

                event.event_type = str(
                    data["event_type"]
                ).strip()


        if hasattr(
            event,
            "description"
        ):

            if "description" in data:

                event.description = str(
                    data["description"]
                ).strip()


        if hasattr(
            event,
            "organizer"
        ):

            if "organizer" in data:

                event.organizer = str(
                    data["organizer"]
                ).strip()


        # ----------------------------------------------------
        # SAVE UPDATE
        # ----------------------------------------------------

        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Event updated successfully",

            "event":
                serialize_event(event)

        }), 200


    except Exception as e:

        db.session.rollback()

        print(
            "UPDATE EVENT ERROR:",
            e
        )

        return jsonify({

            "error":
                "Failed to update event",

            "details":
                str(e)

        }), 500


# ----------DELETE EVENT----------

@app.route(
    "/api/events/<int:event_id>",
    methods=["DELETE"]
)
def delete_event(event_id):

    try:

        print(
            f"DELETE /api/events/{event_id}"
        )


        event = db.session.get(
            Event,
            event_id
        )


        if not event:

            return jsonify({
                "error":
                    "Event not found"
            }), 404


        db.session.delete(
            event
        )

        db.session.commit()


        print(
            "Event deleted successfully:",
            event_id
        )


        return jsonify({

            "success":
                True,

            "message":
                "Event deleted successfully"

        }), 200


    except Exception as e:

        db.session.rollback()

        print(
            "DELETE EVENT ERROR:",
            e
        )

        return jsonify({

            "error":
                "Failed to delete event",

            "details":
                str(e)

        }), 500


# ERROR HANDLERS

@app.errorhandler(404)
def handle_404(error):

    return jsonify({
        "error":
            "Route not found"
    }), 404


@app.errorhandler(405)
def handle_405(error):

    return jsonify({
        "error":
            "Method not allowed"
    }), 405


@app.errorhandler(500)
def handle_500(error):

    print(
        "INTERNAL SERVER ERROR:",
        error
    )

    return jsonify({

        "error":
            "Internal server error",

        "details":
            str(error)

    }), 500


# ----------DATABASE INITIALIZATION----------

def initialize_database():

    with app.app_context():

        try:

            db.create_all()

            print(
                "Database tables initialized."
            )

            migrate_database()

        except Exception as e:

            print(
                "Database initialization error:",
                e
            )


# DEMO EVENT SEEDING

def seed_demo_events():

    with app.app_context():

        try:

            if Event.query.count() > 0:
                return


            event_columns = (
                get_event_columns()
            )


            demo_events = [

                {
                    "event_id":
                        "EVT-101",

                    "name":
                        "Tech Fest 2026",

                    "date":
                        "2026-03-15",

                    "start_time":
                        "10:00",

                    "end_time":
                        "17:00",

                    "venue":
                        "Main Auditorium",

                    "city":
                        "Bengaluru",

                    "latitude":
                        12.9716,

                    "longitude":
                        77.5946,

                    "attendees":
                        350,

                    "budget":
                        250000,

                    "status":
                        "Planning",
                },


                {
                    "event_id":
                        "EVT-102",

                    "name":
                        "AI Workshop",

                    "date":
                        "2026-04-05",

                    "start_time":
                        "09:30",

                    "end_time":
                        "13:00",

                    "venue":
                        "Seminar Hall",

                    "city":
                        "Hyderabad",

                    "latitude":
                        17.3850,

                    "longitude":
                        78.4867,

                    "attendees":
                        120,

                    "budget":
                        120000,

                    "status":
                        "Planning",
                },
            ]


            for event_data in demo_events:

                budget = event_data.get(
                    "budget",
                    0
                )


                safe_event_data = {
                    key: value
                    for key, value in event_data.items()
                    if key != "budget"
                    and key in event_columns
                }


                event = Event(
                    **safe_event_data
                )


                if "budget" in event_columns:

                    event.budget = budget


                db.session.add(
                    event
                )


            db.session.commit()


            print(
                "Demo events seeded."
            )


        except Exception as e:

            db.session.rollback()

            print(
                "Demo event seeding warning:",
                e
            )


# ----------START APPLICATION----------

if __name__ == "__main__":

    initialize_database()

    seed_demo_events()


    print("\n" + "=" * 70)
    print("NEXEVENT BACKEND")
    print("=" * 70)

    print(
        "Backend URL : "
        "http://127.0.0.1:5000"
    )

    print(
        "Health URL  : "
        "http://127.0.0.1:5000/api/health"
    )

    print(
        "Events URL  : "
        "http://127.0.0.1:5000/api/events"
    )

    print(
        "Frontend    : "
        "http://localhost:5177"
    )

    print("=" * 70 + "\n")


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
