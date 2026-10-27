from flask import Blueprint, jsonify, request

from extensions import db
from models import Vendor, VendorAssignment, Event


vendor_bp = Blueprint("vendor_bp", __name__)

# Helper

def get_vendor_or_404(vendor_id):
    vendor = db.session.get(Vendor, vendor_id)

    if vendor is None:
        return None, (
            jsonify({
                "success": False,
                "error": "Vendor not found."
            }),
            404,
        )

    return vendor, None

# GET ALL VENDORS

@vendor_bp.route("/api/vendors", methods=["GET"])
def get_vendors():
    vendors = Vendor.query.order_by(Vendor.id.desc()).all()

    return jsonify({
        "success": True,
        "data": [vendor.to_dict() for vendor in vendors]
    })

# GET SINGLE VENDOR

@vendor_bp.route("/api/vendors/<int:vendor_id>", methods=["GET"])
def get_vendor(vendor_id):
    vendor, error = get_vendor_or_404(vendor_id)

    if error:
        return error

    return jsonify({
        "success": True,
        "data": vendor.to_dict()
    })

# CREATE VENDOR

@vendor_bp.route("/api/vendors", methods=["POST"])
def create_vendor():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    service_type = str(
        data.get("service_type", data.get("service", ""))
    ).strip()
    phone = str(data.get("phone", "")).strip()
    email = str(data.get("email", "")).strip()

    if not name:
        return jsonify({
            "success": False,
            "error": "Vendor name is required."
        }), 400

    if not service_type:
        return jsonify({
            "success": False,
            "error": "Service type is required."
        }), 400

    if not phone:
        return jsonify({
            "success": False,
            "error": "Phone number is required."
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "error": "Email is required."
        }), 400

    # Generate vendor code
    last_vendor = Vendor.query.order_by(
        Vendor.id.desc()
    ).first()

    if last_vendor:
        vendor_code = f"VEN-{last_vendor.id + 1:03d}"
    else:
        vendor_code = "VEN-001"

    vendor = Vendor(
        vendor_code=vendor_code,
        name=name,
        service_type=service_type,
        phone=phone,
        email=email,
        overall_rating=float(data.get("overall_rating", 0) or 0),
        quality_rating=float(data.get("quality_rating", 0) or 0),
        timeliness_rating=float(
            data.get("timeliness_rating", 0) or 0
        ),
        cost_rating=float(
            data.get("cost_rating", 0) or 0
        ),
        communication_rating=float(
            data.get("communication_rating", 0) or 0
        ),
    )

    db.session.add(vendor)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor created successfully.",
        "data": vendor.to_dict()
    }), 201

# UPDATE VENDOR

@vendor_bp.route("/api/vendors/<int:vendor_id>", methods=["PUT"])
def update_vendor(vendor_id):
    vendor, error = get_vendor_or_404(vendor_id)

    if error:
        return error

    data = request.get_json(silent=True) or {}

    if "name" in data:
        vendor.name = str(data["name"]).strip()

    if "service_type" in data:
        vendor.service_type = str(
            data["service_type"]
        ).strip()

    elif "service" in data:
        vendor.service_type = str(
            data["service"]
        ).strip()

    if "phone" in data:
        vendor.phone = str(data["phone"]).strip()

    if "email" in data:
        vendor.email = str(data["email"]).strip()

    rating_fields = [
        "overall_rating",
        "quality_rating",
        "timeliness_rating",
        "cost_rating",
        "communication_rating",
    ]

    for field in rating_fields:
        if field in data:
            try:
                setattr(
                    vendor,
                    field,
                    float(data[field])
                )
            except (TypeError, ValueError):
                return jsonify({
                    "success": False,
                    "error": f"Invalid value for {field}."
                }), 400

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor updated successfully.",
        "data": vendor.to_dict()
    })

# DELETE VENDOR

@vendor_bp.route("/api/vendors/<int:vendor_id>", methods=["DELETE"])
def delete_vendor(vendor_id):
    vendor, error = get_vendor_or_404(vendor_id)

    if error:
        return error

    db.session.delete(vendor)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor deleted successfully."
    })

# ASSIGN VENDOR TO EVENT

@vendor_bp.route(
    "/api/vendors/<int:vendor_id>/assign",
    methods=["POST"]
)
def assign_vendor(vendor_id):
    vendor, error = get_vendor_or_404(vendor_id)

    if error:
        return error

    data = request.get_json(silent=True) or {}

    event_id = data.get("event_id")

    if event_id is None:
        return jsonify({
            "success": False,
            "error": "event_id is required."
        }), 400

    # Try database numeric ID first
    event = None

    try:
        event = db.session.get(Event, int(event_id))
    except (TypeError, ValueError):
        event = None

    # Try event_id such as EVT-101
    if event is None:
        event = Event.query.filter_by(
            event_id=str(event_id)
        ).first()

    if event is None:
        return jsonify({
            "success": False,
            "error": "Event not found."
        }), 404

    existing = VendorAssignment.query.filter_by(
        vendor_id=vendor.id,
        event_id=event.id
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "error": "Vendor is already assigned to this event."
        }), 409

    assignment = VendorAssignment(
        vendor_id=vendor.id,
        event_id=event.id,
        status=data.get("status", "Assigned"),
        notes=data.get("notes", ""),
    )

    db.session.add(assignment)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor assigned successfully.",
        "data": assignment.to_dict()
    }), 201

# REMOVE VENDOR ASSIGNMENT

@vendor_bp.route(
    "/api/vendors/<int:vendor_id>/assignments/<int:assignment_id>",
    methods=["DELETE"]
)
def remove_vendor_assignment(vendor_id, assignment_id):
    assignment = VendorAssignment.query.filter_by(
        id=assignment_id,
        vendor_id=vendor_id
    ).first()

    if assignment is None:
        return jsonify({
            "success": False,
            "error": "Assignment not found."
        }), 404

    db.session.delete(assignment)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor assignment removed successfully."
    })

# UPDATE VENDOR RATINGS

@vendor_bp.route(
    "/api/vendors/<int:vendor_id>/ratings",
    methods=["PUT"]
)
def update_vendor_ratings(vendor_id):
    vendor, error = get_vendor_or_404(vendor_id)

    if error:
        return error

    data = request.get_json(silent=True) or {}

    rating_fields = [
        "overall_rating",
        "quality_rating",
        "timeliness_rating",
        "cost_rating",
        "communication_rating",
    ]

    for field in rating_fields:
        if field in data:
            try:
                value = float(data[field])

                if value < 0 or value > 5:
                    return jsonify({
                        "success": False,
                        "error": (
                            f"{field} must be between 0 and 5."
                        )
                    }), 400

                setattr(vendor, field, value)

            except (TypeError, ValueError):
                return jsonify({
                    "success": False,
                    "error": f"Invalid value for {field}."
                }), 400

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Vendor ratings updated successfully.",
        "data": vendor.to_dict()
    })