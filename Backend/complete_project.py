"""
complete_project.py
====================
The COMPLETE integrated backend in a single file — the existing app
(event storage) plus the payment gateway and QR code features, combined.

`app.py` + `models.py` + `payment_qr_backend.py` (separate files) are the
recommended way to run this project day to day, since they keep the new
functionality cleanly separated as requested. This file is provided in
addition, for anyone who wants the whole backend as one script.

Run with:  python complete_project.py
It uses its own SQLite file (complete_project.db) so it never collides
with app.db from the multi-file version.
"""
import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime

import qrcode
import razorpay
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

BASEDIR = os.path.dirname(os.path.abspath(__file__))
QR_CODE_DIR = os.path.join(BASEDIR, "qr_codes")
os.makedirs(QR_CODE_DIR, exist_ok=True)

db = SQLAlchemy()


# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------
class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.String(40), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(60), nullable=True)
    venue = db.Column(db.String(200), nullable=True)
    price_inr = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "name": self.name,
            "date": self.date,
            "venue": self.venue,
            "price_inr": self.price_inr,
        }


class Registration(db.Model):
    __tablename__ = "registrations"

    id = db.Column(db.Integer, primary_key=True)
    registration_id = db.Column(db.String(40), unique=True, nullable=False)
    event_id = db.Column(db.String(40), db.ForeignKey("events.event_id"), nullable=False)
    participant_id = db.Column(db.String(40), nullable=True)

    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(30), nullable=True)

    amount = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="INR")

    payment_status = db.Column(db.String(20), nullable=False, default="PENDING")
    razorpay_order_id = db.Column(db.String(80), nullable=True, index=True)
    razorpay_payment_id = db.Column(db.String(80), nullable=True)

    registration_token = db.Column(db.String(120), nullable=True, unique=True)
    qr_code_path = db.Column(db.String(300), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_public_dict(self):
        return {
            "registration_id": self.registration_id,
            "event_id": self.event_id,
            "name": self.name,
            "email": self.email,
            "payment_status": self.payment_status,
            "amount": self.amount,
            "currency": self.currency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def get_razorpay_client():
    key_id = os.environ.get("RAZORPAY_KEY_ID")
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise RuntimeError(
            "Razorpay credentials are not configured. Set RAZORPAY_KEY_ID "
            "and RAZORPAY_KEY_SECRET in your .env file (see .env.example)."
        )
    return razorpay.Client(auth=(key_id, key_secret))


def generate_registration_id():
    while True:
        candidate = f"REG-{uuid.uuid4().hex[:8].upper()}"
        if not Registration.query.filter_by(registration_id=candidate).first():
            return candidate


def generate_registration_token(app, registration_id):
    random_part = secrets.token_urlsafe(16)
    secret_key = app.config["SECRET_KEY"].encode("utf-8")
    signature = hmac.new(
        secret_key, f"{registration_id}:{random_part}".encode("utf-8"), hashlib.sha256
    ).hexdigest()[:16]
    return f"{random_part}.{signature}"


def token_is_valid(registration, token):
    if not registration.registration_token:
        return False
    return hmac.compare_digest(registration.registration_token, token)


def build_qr_payload(registration):
    return (
        f"REGISTRATION_ID={registration.registration_id}\n"
        f"EVENT_ID={registration.event_id}\n"
        f"TOKEN={registration.registration_token}"
    )


def generate_qr_code(registration):
    payload = build_qr_payload(registration)
    img = qrcode.make(payload)
    filename = f"{registration.registration_id}.png"
    filepath = os.path.join(QR_CODE_DIR, filename)
    img.save(filepath)
    return filepath


# ---------------------------------------------------------------------------
# APP FACTORY
# ---------------------------------------------------------------------------
def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
        BASEDIR, "complete_project.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    CORS(app)

    # ---- existing-style routes -------------------------------------------------
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/events", methods=["GET"])
    def list_events():
        return jsonify([e.to_dict() for e in Event.query.all()])

    # ---- FEATURE 1: payment -----------------------------------------------------
    @app.route("/api/payment/create-order", methods=["POST"])
    def create_order():
        data = request.get_json(silent=True) or {}
        event_id = (data.get("event_id") or "").strip()
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()

        if not event_id or not name or not email:
            return jsonify({"error": "event_id, name and email are required."}), 400

        event = Event.query.filter_by(event_id=event_id).first()
        if not event:
            return jsonify({"error": f"Event '{event_id}' not found."}), 404
        if event.price_inr <= 0:
            return jsonify({"error": "Invalid event amount."}), 400

        amount_paise = event.price_inr * 100
        currency = "INR"

        try:
            client = get_razorpay_client()
        except RuntimeError as exc:
            return jsonify({"error": str(exc)}), 500

        registration_id = generate_registration_id()
        registration = Registration(
            registration_id=registration_id,
            event_id=event.event_id,
            name=name,
            email=email,
            phone=phone,
            amount=amount_paise,
            currency=currency,
            payment_status="PENDING",
        )
        db.session.add(registration)
        db.session.commit()

        try:
            order = client.order.create(
                {
                    "amount": amount_paise,
                    "currency": currency,
                    "receipt": registration_id,
                    "notes": {"registration_id": registration_id, "event_id": event.event_id},
                }
            )
        except Exception as exc:  # noqa: BLE001
            registration.payment_status = "FAILED"
            db.session.commit()
            return jsonify({"error": f"Could not create payment order: {exc}"}), 502

        registration.razorpay_order_id = order["id"]
        db.session.commit()

        return jsonify(
            {
                "registration_id": registration.registration_id,
                "order_id": order["id"],
                "amount": amount_paise,
                "currency": currency,
                "key_id": os.environ.get("RAZORPAY_KEY_ID"),
                "event_name": event.name,
            }
        ), 201

    @app.route("/api/payment/verify", methods=["POST"])
    def verify_payment():
        data = request.get_json(silent=True) or {}
        registration_id = data.get("registration_id")
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not all([registration_id, razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({"error": "Missing payment verification fields."}), 400

        registration = Registration.query.filter_by(registration_id=registration_id).first()
        if not registration:
            return jsonify({"error": "Registration not found."}), 404

        if registration.payment_status == "SUCCESS":
            return jsonify(
                {
                    "status": "SUCCESS",
                    "message": "Payment already verified for this registration.",
                    "registration": registration.to_public_dict(),
                }
            ), 200

        if registration.razorpay_order_id != razorpay_order_id:
            return jsonify({"error": "Order ID does not match this registration."}), 400

        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except RuntimeError as exc:
            return jsonify({"error": str(exc)}), 500
        except razorpay.errors.SignatureVerificationError:
            registration.payment_status = "FAILED"
            db.session.commit()
            return jsonify({"error": "Invalid payment signature.", "status": "FAILED"}), 400

        registration.payment_status = "SUCCESS"
        registration.razorpay_payment_id = razorpay_payment_id
        registration.registration_token = generate_registration_token(app, registration_id)
        db.session.commit()

        try:
            qr_path = generate_qr_code(registration)
            registration.qr_code_path = qr_path
            db.session.commit()
        except Exception as exc:  # noqa: BLE001
            return jsonify(
                {
                    "status": "SUCCESS",
                    "warning": f"Payment verified but QR generation failed: {exc}",
                    "registration": registration.to_public_dict(),
                }
            ), 200

        return jsonify(
            {
                "status": "SUCCESS",
                "registration": registration.to_public_dict(),
                "qr_url": f"/api/registration/{registration_id}/qr",
            }
        ), 200

    @app.route("/api/payment/cancel", methods=["POST"])
    def cancel_payment():
        data = request.get_json(silent=True) or {}
        registration = Registration.query.filter_by(
            registration_id=data.get("registration_id")
        ).first()
        if not registration:
            return jsonify({"error": "Registration not found."}), 404
        if registration.payment_status == "PENDING":
            registration.payment_status = "CANCELLED"
            db.session.commit()
        return jsonify({"status": registration.payment_status}), 200

    @app.route("/api/payment/status/<registration_id>", methods=["GET"])
    def payment_status(registration_id):
        registration = Registration.query.filter_by(registration_id=registration_id).first()
        if not registration:
            return jsonify({"error": "Registration not found."}), 404
        return jsonify(registration.to_public_dict()), 200

    # ---- FEATURE 2: QR ------------------------------------------------------
    @app.route("/api/registration/<registration_id>/qr", methods=["GET"])
    def get_qr_code(registration_id):
        registration = Registration.query.filter_by(registration_id=registration_id).first()
        if not registration:
            return jsonify({"error": "Registration not found."}), 404
        if registration.payment_status != "SUCCESS" or not registration.qr_code_path:
            return jsonify({"error": "QR code not available for this registration."}), 400
        directory, filename = os.path.split(registration.qr_code_path)
        return send_from_directory(directory, filename, mimetype="image/png")

    @app.route("/api/registration/qr/validate", methods=["POST"])
    def validate_qr():
        data = request.get_json(silent=True) or {}
        registration_id = data.get("registration_id")
        token = data.get("token")

        if not registration_id and not token and data.get("raw_text"):
            parsed = {}
            for line in data["raw_text"].splitlines():
                if "=" in line:
                    key, _, value = line.partition("=")
                    parsed[key.strip()] = value.strip()
            registration_id = parsed.get("REGISTRATION_ID")
            token = parsed.get("TOKEN")

        if not registration_id or not token:
            return jsonify({"valid": False, "error": "registration_id and token are required."}), 400

        registration = Registration.query.filter_by(registration_id=registration_id).first()
        if not registration:
            return jsonify({"valid": False, "error": "Registration not found."}), 404

        if not token_is_valid(registration, token):
            return jsonify({"valid": False, "error": "Invalid or forged token."}), 400

        if registration.payment_status != "SUCCESS":
            return jsonify(
                {
                    "valid": False,
                    "registration_id": registration.registration_id,
                    "event_id": registration.event_id,
                    "payment_status": registration.payment_status,
                }
            ), 200

        event = Event.query.filter_by(event_id=registration.event_id).first()
        if not event:
            return jsonify({"valid": False, "error": "Associated event no longer exists."}), 404

        return jsonify(
            {
                "valid": True,
                "registration_id": registration.registration_id,
                "event_id": registration.event_id,
                "event_name": event.name,
                "payment_status": registration.payment_status,
                "name": registration.name,
            }
        ), 200

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"error": "Internal server error."}), 500

    with app.app_context():
        db.create_all()
        if Event.query.first() is None:
            db.session.add(
                Event(
                    event_id="EVT-101",
                    name="Tech Fest 2026",
                    date="15 March 2026",
                    venue="Main Auditorium",
                    price_inr=499,
                )
            )
            db.session.commit()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
