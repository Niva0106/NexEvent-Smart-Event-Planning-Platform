from datetime import datetime

from flask import Blueprint, jsonify, request

from extensions import db
from models import Event, Registration, AttendanceRecord


attendance_bp = Blueprint(
    "attendance",
    __name__,
)


# ----------CHECK IN ONE PARTICIPANT----------

@attendance_bp.route(
    "/api/attendance/check-in",
    methods=["POST"],
)
def check_in_participant():

    data = request.get_json(
        silent=True
    ) or {}

    registration_id = str(
        data.get("registration_id", "")
    ).strip()

    event_id = str(
        data.get("event_id", "")
    ).strip()

    if not registration_id:
        return jsonify({
            "success": False,
            "error": "Registration ID is required.",
        }), 400

    if not event_id:
        return jsonify({
            "success": False,
            "error": "Event ID is required.",
        }), 400


    # ---------------------------------------------------------
    # FIND EVENT
    # ---------------------------------------------------------

    event = Event.query.filter_by(
        event_id=event_id
    ).first()

    if not event:
        try:
            event = Event.query.filter_by(
                id=int(event_id)
            ).first()
        except (ValueError, TypeError):
            event = None

    if not event:
        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    event_id = event.event_id


    # ---------------------------------------------------------
    # FIND REGISTRATION
    # ---------------------------------------------------------

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:
        return jsonify({
            "success": False,
            "error": "Registration not found.",
        }), 404


    # ---------------------------------------------------------
    # CHECK PAYMENT
    # ---------------------------------------------------------

    if registration.payment_status != "SUCCESS":
        return jsonify({
            "success": False,
            "error": "This registration has not completed payment.",
        }), 400


    # ---------------------------------------------------------
    # MAKE SURE REGISTRATION BELONGS TO THIS EVENT
    # ---------------------------------------------------------
    registration_event_id = str(registration.event_id).strip()

    valid_event_ids = {
        str(event.event_id).strip(),
        str(event.id).strip(),
    }

    if registration_event_id not in valid_event_ids:
        return jsonify({
            "success": False,
            "error": "This participant is registered for a different event.",
        }), 400



    # ---------------------------------------------------------
    # CHECK IF ALREADY CHECKED IN
    # ---------------------------------------------------------

    existing = AttendanceRecord.query.filter_by(
        registration_id=registration.registration_id
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "already_checked_in": True,
            "error": "Participant has already checked in.",
            "participant": {
                "registration_id":
                    registration.registration_id,

                "name":
                    registration.name,

                "email":
                    registration.email,

                "event_id":
                    registration.event_id,

                "checked_in_at":
                    existing.checked_in_at.isoformat(),
            },
        }), 409


    # ---------------------------------------------------------
    # CREATE ATTENDANCE RECORD
    # ---------------------------------------------------------

    attendance = AttendanceRecord(
        registration_id=registration.registration_id,
        event_id=event_id,
        checked_in_at=datetime.utcnow(),
    )

    db.session.add(attendance)
    db.session.commit()


    # ---------------------------------------------------------
    # GET CURRENT COUNT
    # ---------------------------------------------------------

    checked_in_count = AttendanceRecord.query.filter_by(
        event_id=event_id
    ).count()

    registered_count = Registration.query.filter_by(
        event_id=event_id,
        payment_status="SUCCESS",
    ).count()


    attendance_rate = (
        (checked_in_count / registered_count) * 100
        if registered_count > 0
        else 0
    )


    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return jsonify({

        "success": True,

        "message":
            "Participant checked in successfully.",

        "participant": {

            "registration_id":
                registration.registration_id,

            "name":
                registration.name,

            "email":
                registration.email,

            "event_id":
                registration.event_id,

            "checked_in_at":
                attendance.checked_in_at.isoformat(),
        },

        "attendance": {

            "registered":
                registered_count,

            "checked_in":
                checked_in_count,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),
        },

    }), 201


# ---------- GET ATTENDANCE COUNTS FOR ONE EVENT ----------

@attendance_bp.route(
    "/api/attendance/event/<string:event_id>",
    methods=["GET"],
)
def get_event_attendance(event_id):
    # Accept either the public event ID or the internal numeric ID.
    event = Event.query.filter_by(
        event_id=event_id
    ).first()

    if not event:
        try:
            event = Event.query.filter_by(
                id=int(event_id)
            ).first()
        except (ValueError, TypeError):
            event = None

    if not event:
        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    # Always use the public event ID for attendance queries.
    public_event_id = event.event_id

    registered_count = Registration.query.filter_by(
        event_id=public_event_id,
        payment_status="SUCCESS",
    ).count()

    checked_in_count = AttendanceRecord.query.filter_by(
        event_id=public_event_id
    ).count()

    attendance_rate = (
        (checked_in_count / registered_count) * 100
        if registered_count > 0
        else 0
    )

    return jsonify({
        "success": True,
        "attendance": {
            "registered": registered_count,
            "checked_in": checked_in_count,
            "attendance_rate": round(attendance_rate, 2),
        },
    }), 200


# ---------- GET PARTICIPANT LIST FOR ONE EVENT ----------

@attendance_bp.route(
    "/api/attendance/event/<string:event_id>/participants",
    methods=["GET"],
)
def get_event_participants(event_id):
    # Find the event using its public event ID first.
    event = Event.query.filter_by(event_id=event_id).first()

    # Also support the internal database ID.
    if not event:
        try:
            event = Event.query.filter_by(id=int(event_id)).first()
        except (ValueError, TypeError):
            event = None

    if not event:
        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    # Existing registrations may store either event ID format.
    valid_event_ids = [
        str(event.event_id),
        str(event.id),
    ]

    registrations = (
        Registration.query
        .filter(Registration.event_id.in_(valid_event_ids))
        .order_by(Registration.name)
        .all()
    )

    # Get attendance records for these registrations.
    registration_ids = [
        registration.registration_id
        for registration in registrations
    ]

    if registration_ids:
        attendance_records = (
            AttendanceRecord.query
            .filter(
                AttendanceRecord.registration_id.in_(registration_ids),
                AttendanceRecord.event_id == str(event.event_id),
            )
            .all()
        )
    else:
        attendance_records = []

    checked_in_ids = {
        record.registration_id
        for record in attendance_records
    }

    return jsonify({
        "success": True,
        "participants": [
            {
                "name": registration.name,
                "registration_id": registration.registration_id,
                "attended": (
                    registration.registration_id in checked_in_ids
                ),
            }
            for registration in registrations
        ],
    }), 200
