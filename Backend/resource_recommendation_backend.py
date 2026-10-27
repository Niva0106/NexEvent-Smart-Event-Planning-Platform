from flask import Blueprint, jsonify, request


resource_recommendation_bp = Blueprint(
    "resource_recommendation",
    __name__,
    url_prefix="/api/resources",
)

# Helper functions

def safe_int(value, default=0):
    try:
        number = int(float(value))
        return max(number, 0)
    except (TypeError, ValueError):
        return default


def normalize_event_type(event_type):
    value = str(event_type or "").strip().lower()

    if value in {"conference", "seminar", "summit"}:
        return "conference"

    if value in {"workshop", "training", "bootcamp"}:
        return "workshop"

    if value in {"exhibition", "expo", "exposition"}:
        return "exhibition"

    if value in {"wedding", "celebration", "party"}:
        return "celebration"

    if value in {"corporate", "corporate event", "meeting"}:
        return "corporate"

    if value in {"webinar", "online"}:
        return "webinar"

    return "general"


def calculate_recommendations(attendees, event_type):
    """
    Generates explainable resource recommendations based on
    attendee count and event type.

    This is intentionally rule-based so the recommendation
    logic is transparent and easy to explain during a viva.
    """

    attendees = max(safe_int(attendees, 0), 1)

    normalized_type = normalize_event_type(event_type)

    # --------------------------------------------------------
    # Basic resources
    # --------------------------------------------------------

    chairs = attendees

    # One registration counter for approximately every
    # 150 attendees, with a minimum of one.
    registration_counters = max(1, (attendees + 149) // 150)

    # Event staff:
    # 1 staff member for approximately every 75 attendees.
    event_staff = max(2, (attendees + 74) // 75)

    # --------------------------------------------------------
    # Projectors
    # --------------------------------------------------------

    if attendees <= 100:
        projectors = 1
    elif attendees <= 300:
        projectors = 2
    elif attendees <= 600:
        projectors = 3
    elif attendees <= 1000:
        projectors = 4
    else:
        projectors = max(5, (attendees + 249) // 250)

    # --------------------------------------------------------
    # Microphones
    # --------------------------------------------------------

    if normalized_type == "conference":
        microphones = max(2, min(8, (attendees + 124) // 125))
    elif normalized_type == "workshop":
        microphones = max(1, min(6, (attendees + 199) // 200))
    elif normalized_type == "exhibition":
        microphones = max(2, min(6, (attendees + 249) // 250))
    elif normalized_type == "celebration":
        microphones = max(3, min(10, (attendees + 99) // 100))
    elif normalized_type == "corporate":
        microphones = max(2, min(6, (attendees + 149) // 150))
    else:
        microphones = max(2, min(6, (attendees + 149) // 150))

    # --------------------------------------------------------
    # Speakers
    # --------------------------------------------------------

    if attendees <= 100:
        speakers = 1
    elif attendees <= 300:
        speakers = 2
    elif attendees <= 700:
        speakers = 4
    else:
        speakers = max(4, (attendees + 199) // 200)

    # --------------------------------------------------------
    # Tables
    # --------------------------------------------------------

    if normalized_type == "conference":
        tables = max(1, (attendees + 9) // 10)
    elif normalized_type == "workshop":
        tables = max(1, (attendees + 7) // 8)
    elif normalized_type == "exhibition":
        tables = max(5, (attendees + 19) // 20)
    elif normalized_type == "celebration":
        tables = max(1, (attendees + 9) // 10)
    elif normalized_type == "corporate":
        tables = max(1, (attendees + 7) // 8)
    else:
        tables = max(1, (attendees + 9) // 10)

    # --------------------------------------------------------
    # Event-type-specific resources
    # --------------------------------------------------------

    if normalized_type == "conference":
        special_resources = [
            {
                "name": "Stage Lights",
                "quantity": max(2, min(8, (attendees + 149) // 150)),
                "reason": "Conference sessions benefit from dedicated presentation lighting.",
                "category": "Production",
            },
            {
                "name": "Podium",
                "quantity": 1,
                "reason": "Recommended for speakers and formal presentations.",
                "category": "Presentation",
            },
        ]

    elif normalized_type == "workshop":
        special_resources = [
            {
                "name": "Whiteboards",
                "quantity": max(1, (attendees + 24) // 25),
                "reason": "Interactive workshops benefit from collaborative writing areas.",
                "category": "Training",
            },
            {
                "name": "Extension Boards",
                "quantity": max(2, (attendees + 24) // 25),
                "reason": "Recommended for participant laptops and equipment.",
                "category": "Electrical",
            },
        ]

    elif normalized_type == "exhibition":
        special_resources = [
            {
                "name": "Display Stands",
                "quantity": max(5, (attendees + 24) // 25),
                "reason": "Exhibitions require dedicated areas for displays and demonstrations.",
                "category": "Exhibition",
            },
            {
                "name": "Information Desks",
                "quantity": max(1, (attendees + 199) // 200),
                "reason": "Helps visitors find exhibitors and event information.",
                "category": "Support",
            },
        ]

    elif normalized_type == "celebration":
        special_resources = [
            {
                "name": "Stage Lights",
                "quantity": max(4, min(12, (attendees + 99) // 100)),
                "reason": "Celebrations usually require enhanced lighting for the main stage or activity area.",
                "category": "Production",
            },
            {
                "name": "Decoration Tables",
                "quantity": max(3, (attendees + 49) // 50),
                "reason": "Additional tables are useful for decorations, gifts and refreshments.",
                "category": "Decoration",
            },
        ]

    elif normalized_type == "corporate":
        special_resources = [
            {
                "name": "Conference Tables",
                "quantity": max(2, (attendees + 9) // 10),
                "reason": "Corporate meetings benefit from structured seating and discussion areas.",
                "category": "Furniture",
            },
            {
                "name": "Presentation Clickers",
                "quantity": max(1, min(5, (attendees + 199) // 200)),
                "reason": "Useful for multiple presentations and speakers.",
                "category": "Presentation",
            },
        ]

    elif normalized_type == "webinar":
        special_resources = [
            {
                "name": "Web Cameras",
                "quantity": max(1, min(4, (attendees + 249) // 250)),
                "reason": "Multiple camera angles can improve online event production.",
                "category": "Online",
            },
            {
                "name": "Streaming Systems",
                "quantity": 1,
                "reason": "Required for reliable online event broadcasting.",
                "category": "Online",
            },
        ]

    else:
        special_resources = [
            {
                "name": "Information Desks",
                "quantity": max(1, (attendees + 199) // 200),
                "reason": "Helps attendees with registration and event information.",
                "category": "Support",
            },
            {
                "name": "Extension Boards",
                "quantity": max(2, (attendees + 99) // 100),
                "reason": "Provides additional power access for event equipment.",
                "category": "Electrical",
            },
        ]

    recommendations = [
        {
            "name": "Chairs",
            "quantity": chairs,
            "reason": f"One chair is recommended for each of the {attendees} expected attendees.",
            "category": "Furniture",
        },
        {
            "name": "Projectors",
            "quantity": projectors,
            "reason": f"{projectors} projector(s) are recommended for an audience of {attendees}.",
            "category": "Audio Visual",
        },
        {
            "name": "Microphones",
            "quantity": microphones,
            "reason": f"{microphones} microphone(s) are recommended for this {normalized_type} event.",
            "category": "Audio Visual",
        },
        {
            "name": "Speakers",
            "quantity": speakers,
            "reason": f"{speakers} speaker(s) are recommended for clear audio coverage.",
            "category": "Audio Visual",
        },
        {
            "name": "Event Staff",
            "quantity": event_staff,
            "reason": f"Approximately one staff member per 75 attendees is recommended.",
            "category": "Staff",
        },
        {
            "name": "Registration Counters",
            "quantity": registration_counters,
            "reason": f"One registration counter is recommended for approximately every 150 attendees.",
            "category": "Registration",
        },
        {
            "name": "Tables",
            "quantity": tables,
            "reason": f"Tables are adjusted according to the selected {normalized_type} event type.",
            "category": "Furniture",
        },
    ]

    recommendations.extend(special_resources)

    return recommendations

# Recommendation API

@resource_recommendation_bp.route(
    "/recommend",
    methods=["POST"],
)
def recommend_resources():
    try:
        data = request.get_json(silent=True) or {}

        attendees = safe_int(data.get("attendees"), 0)
        event_type = data.get("event_type", "general")

        if attendees <= 0:
            return jsonify(
                {
                    "success": False,
                    "error": "Attendee count must be greater than 0.",
                }
            ), 400

        recommendations = calculate_recommendations(
            attendees,
            event_type,
        )

        return jsonify(
            {
                "success": True,
                "attendees": attendees,
                "event_type": normalize_event_type(event_type),
                "recommendations": recommendations,
            }
        )

    except Exception as error:
        print(
            "Resource recommendation error:",
            error,
        )

        return jsonify(
            {
                "success": False,
                "error": "Unable to generate resource recommendations.",
            }
        ), 500