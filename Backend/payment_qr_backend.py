import os
import secrets
from datetime import datetime

import qrcode
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, send_file
from sqlalchemy import text

from extensions import db
from models import Event, Registration
from email_service import send_registration_email

# LOAD BACKEND .ENV

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)

# BLUEPRINT

payment_bp = Blueprint("payment", __name__)

# CONFIGURATION

QR_DIR = os.path.join(BASE_DIR, "qr_codes")

os.makedirs(QR_DIR, exist_ok=True)

# FRONTEND URL

def get_frontend_url():
    """
    Get the frontend URL from Backend/.env.

    Expected:
        FRONTEND_URL=http://localhost:5177
    """

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "",
    ).strip().rstrip("/")

    if not frontend_url:
        frontend_url = "http://localhost:5177"

    return frontend_url

# REGISTRATION ID

def generate_registration_id():
    """
    Generate a unique registration ID.

    Example:
        REG-20261003-BFC310
    """

    date_part = datetime.now().strftime("%Y%m%d")

    random_part = secrets.token_hex(3).upper()

    return f"REG-{date_part}-{random_part}"

# REGISTRATION TOKEN

def generate_registration_token():
    """
    Generate a secure token for a registration.
    """

    return secrets.token_urlsafe(32)

# DEMO ORDER ID

def generate_demo_order_id():
    """
    Generate a demo payment order ID.
    """

    random_part = secrets.token_hex(4).upper()

    return f"DEMO_ORDER_{random_part}"

# DEMO PAYMENT ID

def generate_demo_payment_id():
    """
    Generate a demo payment ID.
    """

    random_part = secrets.token_hex(4).upper()

    return f"DEMO_PAYMENT_{random_part}"

# QR CODE GENERATION

def generate_qr_code(registration):
    """
    Generate a QR code for the registration.

    The QR code contains the registration ID.
    """

    registration_id = registration.registration_id

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr.add_data(registration_id)

    qr.make(
        fit=True
    )

    qr_image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    filename = f"{registration_id}.png"

    file_path = os.path.join(
        QR_DIR,
        filename,
    )

    qr_image.save(file_path)

    registration.qr_code_path = file_path

    db.session.commit()

    return file_path

# GET EVENT CAPACITY INFORMATION

@payment_bp.route(
    "/api/payment/capacity/<int:event_id>",
    methods=["GET"],
)
def get_event_capacity(event_id):
    """
    Return the current registration capacity for an event.

    Only SUCCESS registrations count as occupied seats.

    Example response:

    {
        "success": true,
        "event_id": 1,
        "event_name": "Tech Fest 2026",
        "capacity": 350,
        "registered": 349,
        "available": 1,
        "is_full": false
    }
    """

    event = Event.query.get(
        event_id
    )

    if not event:

        return jsonify(
            {
                "success": False,
                "error": "Event not found.",
            }
        ), 404

    successful_registrations = (
        Registration.query
        .filter_by(
            event_id=event_id,
            payment_status="SUCCESS",
        )
        .count()
    )

    capacity = int(
        event.attendees or 0
    )

    available = max(
        capacity - successful_registrations,
        0,
    )

    is_full = (
        successful_registrations >= capacity
    )

    return jsonify(
        {
            "success": True,
            "event_id": event.id,
            "event_code": event.event_id,
            "event_name": event.name,
            "capacity": capacity,
            "registered": successful_registrations,
            "available": available,
            "is_full": is_full,
        }
    ), 200

# CREATE PAYMENT ORDER

@payment_bp.route(
    "/api/payment/create-order",
    methods=["POST"],
)
def create_payment_order():

    data = request.get_json(
        silent=True
    ) or {}

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip()

    phone = str(
        data.get("phone", "")
    ).strip()

    event_id = data.get(
        "event_id"
    )

    amount = data.get(
        "amount",
        0,
    )

    # --------------------------------------------------------
    # Validate name
    # --------------------------------------------------------

    if not name:

        return jsonify(
            {
                "error": "Name is required."
            }
        ), 400

    # --------------------------------------------------------
    # Validate email
    # --------------------------------------------------------

    if not email:

        return jsonify(
            {
                "error": "Email is required."
            }
        ), 400

    # --------------------------------------------------------
    # Validate event ID
    # --------------------------------------------------------

    if not event_id:

        return jsonify(
            {
                "error": "Event ID is required."
            }
        ), 400

    try:

        event_id = int(
            event_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return jsonify(
            {
                "error": "Invalid event ID."
            }
        ), 400

    transaction_started = False

    try:

        db.session.execute(
            text("BEGIN IMMEDIATE")
        )

        transaction_started = True

        # ----------------------------------------------------
        # Find event
        # ----------------------------------------------------

        event = Event.query.get(
            event_id
        )

        if not event:

            db.session.rollback()
            transaction_started = False

            return jsonify(
                {
                    "error": "Event not found."
                }
            ), 404

        # ----------------------------------------------------
        # EVENT CAPACITY
        # ----------------------------------------------------

        capacity = int(
            event.attendees or 0
        )

        successful_registrations = (
            Registration.query
            .filter_by(
                event_id=event_id,
                payment_status="SUCCESS",
            )
            .count()
        )

        # ----------------------------------------------------
        # CAPACITY CHECK
        # ----------------------------------------------------

        if successful_registrations >= capacity:

            db.session.rollback()
            transaction_started = False

            return jsonify(
                {
                    "success": False,
                    "event_full": True,
                    "error": (
                        "This event is full. "
                        "Please choose another event."
                    ),
                    "event_id": event.id,
                    "event_name": event.name,
                    "capacity": capacity,
                    "registered": successful_registrations,
                    "available": 0,
                }
            ), 409

        # ----------------------------------------------------
        # CONVERT AMOUNT
        # ----------------------------------------------------

        try:

            amount = float(
                amount or 0
            )

        except (
            TypeError,
            ValueError,
        ):

            amount = 0

        # ----------------------------------------------------
        # CREATE REGISTRATION
        # ----------------------------------------------------

        registration = Registration(
            registration_id=generate_registration_id(),
            registration_token=generate_registration_token(),
            name=name,
            email=email,
            phone=phone,
            event_id=event_id,
            amount=amount,
            payment_status="PENDING",
        )

        db.session.add(
            registration
        )

        db.session.flush()

        # ----------------------------------------------------
        # CREATE DEMO ORDER
        # ----------------------------------------------------

        order_id = generate_demo_order_id()

        registration.order_id = order_id

        db.session.commit()

        transaction_started = False

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify(
            {
                "success": True,
                "message": "Payment order created.",

                "registration": {
                    "id": registration.id,
                    "registration_id": registration.registration_id,
                    "name": registration.name,
                    "email": registration.email,
                    "phone": registration.phone,
                    "event_id": registration.event_id,
                    "amount": registration.amount,
                    "payment_status": registration.payment_status,
                },

                "order": {
                    "id": order_id,
                    "amount": amount,
                    "currency": "INR",
                },

                "capacity": {
                    "maximum": capacity,
                    "registered": successful_registrations,
                    "available": max(
                        capacity - successful_registrations,
                        0,
                    ),
                },
            }
        ), 201

    except Exception as error:

        if transaction_started:

            try:
                db.session.rollback()
            except Exception:
                pass

        else:

            try:
                db.session.rollback()
            except Exception:
                pass

        print(
            "Create payment order error:",
            str(error),
        )

        return jsonify(
            {
                "success": False,
                "error": (
                    "Unable to create the registration."
                ),
                "details": str(error),
            }
        ), 500

# VERIFY PAYMENT

@payment_bp.route(
    "/api/payment/verify",
    methods=["POST"],
)
def verify_payment():

    data = request.get_json(
        silent=True
    ) or {}

    registration_id = str(
        data.get(
            "registration_id",
            "",
        )
    ).strip()

    if not registration_id:

        return jsonify(
            {
                "error": "Registration ID is required."
            }
        ), 400

    # --------------------------------------------------------
    # Find registration
    # --------------------------------------------------------

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:

        return jsonify(
            {
                "error": "Registration not found."
            }
        ), 404

    # --------------------------------------------------------
    # Prevent duplicate successful payment processing
    # --------------------------------------------------------

    if registration.payment_status == "SUCCESS":

        event = Event.query.get(
            registration.event_id
        )

        frontend_url = get_frontend_url()

        qr_url = (
            f"{frontend_url}/registration/"
            f"{registration.registration_id}"
        )

        print(
            "QR EMAIL URL:",
            qr_url,
        )

        return jsonify(
            {
                "success": True,
                "message": "Payment already verified.",
                "registration": {
                    "id": registration.id,
                    "registration_id": registration.registration_id,
                    "name": registration.name,
                    "email": registration.email,
                    "phone": registration.phone,
                    "event_id": registration.event_id,
                    "amount": registration.amount,
                    "payment_status": registration.payment_status,
                },
                "qr_url": qr_url,
                "email_sent": False,
            }
        ), 200

    # --------------------------------------------------------
    # IMPORTANT CAPACITY RECHECK
    # --------------------------------------------------------

    try:

        db.session.execute(
            text("BEGIN IMMEDIATE")
        )

        event = Event.query.get(
            registration.event_id
        )

        if not event:

            db.session.rollback()

            return jsonify(
                {
                    "error": (
                        "Event not found for this registration."
                    )
                }
            ), 404

        capacity = int(
            event.attendees or 0
        )

        successful_registrations = (
            Registration.query
            .filter(
                Registration.event_id == registration.event_id,
                Registration.payment_status == "SUCCESS",
                Registration.id != registration.id,
            )
            .count()
        )

        if successful_registrations >= capacity:

            registration.payment_status = "CANCELLED"

            db.session.commit()

            return jsonify(
                {
                    "success": False,
                    "event_full": True,
                    "error": (
                        "This event became full before "
                        "your payment could be completed. "
                        "Please choose another event."
                    ),
                    "capacity": capacity,
                    "registered": successful_registrations,
                    "available": 0,
                }
            ), 409

        # ----------------------------------------------------
        # Generate demo payment ID
        # ----------------------------------------------------

        payment_id = generate_demo_payment_id()

        registration.payment_status = "SUCCESS"

        registration.paid_at = datetime.now()

        db.session.commit()

    except Exception as error:

        try:
            db.session.rollback()
        except Exception:
            pass

        print(
            "Payment verification capacity error:",
            str(error),
        )

        return jsonify(
            {
                "error": (
                    "Unable to verify payment."
                ),
                "details": str(error),
            }
        ), 500

    # --------------------------------------------------------
    # Generate QR code
    # --------------------------------------------------------

    try:

        generate_qr_code(
            registration
        )

    except Exception as error:

        db.session.rollback()

        return jsonify(
            {
                "error": (
                    "Payment succeeded, "
                    "but QR code generation failed."
                ),
                "details": str(error),
            }
        ), 500

    # --------------------------------------------------------
    # Find event
    # --------------------------------------------------------

    event = Event.query.get(
        registration.event_id
    )

    if not event:

        return jsonify(
            {
                "error": (
                    "Event not found for this registration."
                )
            }
        ), 404

    # --------------------------------------------------------
    # Build frontend QR page URL
    # --------------------------------------------------------

    frontend_url = get_frontend_url()

    qr_url = (
        f"{frontend_url}/registration/"
        f"{registration.registration_id}"
    )

    # --------------------------------------------------------
    # Debug output
    # --------------------------------------------------------

    print(
        "----------------------------------------"
    )

    print(
        "FRONTEND_URL:",
        frontend_url,
    )

    print(
        "REGISTRATION ID:",
        registration.registration_id,
    )

    print(
        "PAYMENT ID:",
        payment_id,
    )

    print(
        "QR EMAIL URL:",
        qr_url,
    )

    print(
        "----------------------------------------"
    )

    # --------------------------------------------------------
    # Send registration email
    # --------------------------------------------------------

    email_sent = False

    try:

        send_registration_email(
            registration=registration,
            event=event,
            qr_url=qr_url,
        )

        email_sent = True

    except Exception as error:

        print(
            "Registration email failed:",
            str(error),
        )

        # Email failure does NOT cancel
        # an already successful payment.

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return jsonify(
        {
            "success": True,
            "message": (
                "Payment verified successfully."
            ),

            "registration": {
                "id": registration.id,
                "registration_id": registration.registration_id,
                "name": registration.name,
                "email": registration.email,
                "phone": registration.phone,
                "event_id": registration.event_id,
                "amount": registration.amount,
                "payment_status": registration.payment_status,
                "payment_id": payment_id,
            },

            "qr_url": qr_url,

            "email_sent": email_sent,
        }
    ), 200

# CANCEL PAYMENT

@payment_bp.route(
    "/api/payment/cancel",
    methods=["POST"],
)
def cancel_payment():

    data = request.get_json(
        silent=True
    ) or {}

    registration_id = str(
        data.get(
            "registration_id",
            "",
        )
    ).strip()

    if not registration_id:

        return jsonify(
            {
                "error": "Registration ID is required."
            }
        ), 400

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:

        return jsonify(
            {
                "error": "Registration not found."
            }
        ), 404

    registration.payment_status = "CANCELLED"

    db.session.commit()

    return jsonify(
        {
            "success": True,
            "message": "Payment cancelled.",
            "registration": {
                "registration_id": registration.registration_id,
                "payment_status": registration.payment_status,
            },
        }
    ), 200

# PAYMENT STATUS

@payment_bp.route(
    "/api/payment/status/<registration_id>",
    methods=["GET"],
)
def payment_status(
    registration_id
):

    registration_id = str(
        registration_id
    ).strip()

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:

        return jsonify(
            {
                "error": "Registration not found."
            }
        ), 404

    event = Event.query.get(
        registration.event_id
    )

    frontend_url = get_frontend_url()

    qr_url = (
        f"{frontend_url}/registration/"
        f"{registration.registration_id}"
    )

    return jsonify(
        {
            "success": True,

            "registration": {
                "id": registration.id,
                "registration_id": registration.registration_id,
                "name": registration.name,
                "email": registration.email,
                "phone": registration.phone,
                "event_id": registration.event_id,
                "amount": registration.amount,
                "payment_status": registration.payment_status,
                "qr_code_path": registration.qr_code_path,
            },

            "event": (
                {
                    "id": event.id,
                    "name": event.name,
                    "date": event.date,
                    "start_time": event.start_time,
                    "end_time": event.end_time,
                    "venue": event.venue,
                }
                if event
                else None
            ),

            "qr_url": qr_url,
        }
    ), 200

# GET QR CODE

@payment_bp.route(
    "/api/registration/<registration_id>/qr",
    methods=["GET"],
)
def get_registration_qr(
    registration_id
):

    registration_id = str(
        registration_id
    ).strip()

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:

        return jsonify(
            {
                "error": "Registration not found."
            }
        ), 404

    if registration.payment_status != "SUCCESS":

        return jsonify(
            {
                "error": "Payment has not been completed."
            }
        ), 400

    qr_path = registration.qr_code_path

    if not qr_path or not os.path.exists(qr_path):

        try:

            generate_qr_code(
                registration
            )

            qr_path = registration.qr_code_path

        except Exception as error:

            return jsonify(
                {
                    "error": "Unable to generate QR code.",
                    "details": str(error),
                }
            ), 500

    return send_file(
        qr_path,
        mimetype="image/png",
        as_attachment=False,
        download_name=(
            f"{registration.registration_id}.png"
        ),
    )

# VALIDATE REGISTRATION

@payment_bp.route(
    "/api/registration/validate",
    methods=["POST"],
)
def validate_registration():

    data = request.get_json(
        silent=True
    ) or {}

    registration_id = str(
        data.get(
            "registration_id",
            "",
        )
    ).strip()

    if not registration_id:

        return jsonify(
            {
                "error": "Registration ID is required."
            }
        ), 400

    registration = Registration.query.filter_by(
        registration_id=registration_id
    ).first()

    if not registration:

        return jsonify(
            {
                "valid": False,
                "message": "Invalid registration ID.",
            }
        ), 404

    if registration.payment_status != "SUCCESS":

        return jsonify(
            {
                "valid": False,
                "message": (
                    "Registration payment is not successful."
                ),
                "registration_id": registration.registration_id,
            }
        ), 400

    event = Event.query.get(
        registration.event_id
    )

    return jsonify(
        {
            "valid": True,
            "message": "Registration is valid.",

            "registration": {
                "id": registration.id,
                "registration_id": registration.registration_id,
                "name": registration.name,
                "email": registration.email,
                "phone": registration.phone,
                "payment_status": registration.payment_status,
            },

            "event": (
                {
                    "id": event.id,
                    "name": event.name,
                    "date": event.date,
                    "start_time": event.start_time,
                    "end_time": event.end_time,
                    "venue": event.venue,
                }
                if event
                else None
            ),
        }
    ), 200