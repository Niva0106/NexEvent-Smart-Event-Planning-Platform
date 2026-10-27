
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from extensions import db
from models import InventoryResource


resource_inventory_bp = Blueprint(
    "resource_inventory",
    __name__,
    url_prefix="/api/resources/inventory",
)


# Initial inventory matching the existing Resources.jsx display.
# These records are inserted only when the inventory table is empty.
DEFAULT_RESOURCES = [
    {
        "name": "Projector",
        "category": "Audio Visual",
        "quantity": 5,
        "allocated": 3,
    },
    {
        "name": "Microphone",
        "category": "Audio Visual",
        "quantity": 12,
        "allocated": 7,
    },
    {
        "name": "Event Staff",
        "category": "Staff",
        "quantity": 25,
        "allocated": 18,
    },
    {
        "name": "Chairs",
        "category": "Furniture",
        "quantity": 500,
        "allocated": 350,
    },
    {
        "name": "Tables",
        "category": "Furniture",
        "quantity": 60,
        "allocated": 42,
    },
    {
        "name": "Speakers",
        "category": "Audio Visual",
        "quantity": 10,
        "allocated": 6,
    },
]


def seed_inventory_if_empty():
    if InventoryResource.query.first() is not None:
        return

    for item in DEFAULT_RESOURCES:
        db.session.add(InventoryResource(**item))

    db.session.commit()


def parse_non_negative_integer(value):
    # Reject decimals, negative numbers, booleans, and invalid input.
    if isinstance(value, bool):
        return None

    try:
        parsed = int(value)
    except (TypeError, ValueError, OverflowError):
        return None

    if str(value).strip() != str(parsed) or parsed < 0:
        return None

    return parsed


def find_duplicate_name(name, exclude_id=None):
    query = InventoryResource.query.filter(
        func.lower(InventoryResource.name) == name.lower()
    )

    if exclude_id is not None:
        query = query.filter(InventoryResource.id != exclude_id)

    return query.first()


# GET /api/resources/inventory
@resource_inventory_bp.route("", methods=["GET"])
def get_inventory():
    try:
        seed_inventory_if_empty()

        resources = InventoryResource.query.order_by(
            InventoryResource.id.asc()
        ).all()

        return jsonify([
            resource.to_dict() for resource in resources
        ]), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Failed to load resource inventory."
        }), 500


# POST /api/resources/inventory
@resource_inventory_bp.route("", methods=["POST"])
def create_inventory_resource():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()
    category = str(data.get("category") or "General").strip()
    quantity = parse_non_negative_integer(data.get("quantity"))

    if not name:
        return jsonify({"error": "Resource name is required."}), 400

    if not category:
        category = "General"

    if quantity is None:
        return jsonify({
            "error": "Quantity must be a non-negative whole number."
        }), 400

    if find_duplicate_name(name):
        return jsonify({
            "error": "A resource with this name already exists."
        }), 409

    try:
        resource = InventoryResource(
            name=name,
            category=category,
            quantity=quantity,
            allocated=0,
        )

        db.session.add(resource)
        db.session.commit()

        return jsonify({
            "message": "Resource added successfully.",
            "resource": resource.to_dict(),
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Failed to add resource."
        }), 500


# PUT /api/resources/inventory/<resource_id>
@resource_inventory_bp.route("/<int:resource_id>", methods=["PUT"])
def update_inventory_resource(resource_id):
    resource = db.session.get(InventoryResource, resource_id)

    if resource is None:
        return jsonify({"error": "Resource not found."}), 404

    data = request.get_json(silent=True) or {}

    quantity = parse_non_negative_integer(data.get("quantity"))

    if quantity is None:
        return jsonify({
            "error": "Quantity must be a non-negative whole number."
        }), 400

    if quantity < resource.allocated:
        return jsonify({
            "error": (
                f"Quantity cannot be less than the allocated amount "
                f"({resource.allocated})."
            )
        }), 400

    name = str(data.get("name", resource.name)).strip()
    category = str(data.get("category", resource.category)).strip()

    if not name:
        return jsonify({"error": "Resource name is required."}), 400

    if not category:
        category = "General"

    if find_duplicate_name(name, exclude_id=resource.id):
        return jsonify({
            "error": "A resource with this name already exists."
        }), 409

    try:
        resource.name = name
        resource.category = category
        resource.quantity = quantity

        db.session.commit()

        return jsonify({
            "message": "Resource updated successfully.",
            "resource": resource.to_dict(),
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Failed to update resource."
        }), 500
