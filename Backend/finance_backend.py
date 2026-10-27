
from flask import Blueprint, jsonify, request

from extensions import db
from models import Event, Expense, Sponsor


finance_bp = Blueprint("finance_bp", __name__, url_prefix="/api/finance")


def get_event(event_id):
    return db.session.get(Event, event_id)


def error_response(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code


def parse_amount(value):
    try:
        amount = float(value)
        if amount < 0:
            return None
        return amount
    except (TypeError, ValueError):
        return None


# -------------------------
# EVENT BUDGET
# -------------------------

@finance_bp.route("/events/<int:event_id>/budget", methods=["PUT"])
def update_budget(event_id):
    event = get_event(event_id)

    if event is None:
        return error_response("Event not found.", 404)

    data = request.get_json(silent=True) or {}
    amount = parse_amount(data.get("budget"))

    if amount is None:
        return error_response("Budget must be a valid non-negative number.")

    event.budget = amount
    db.session.commit()

    return jsonify({
        "success": True,
        "budget": event.budget,
        "message": "Budget updated successfully."
    })


# -------------------------
# EXPENSES
# -------------------------

@finance_bp.route("/events/<int:event_id>/expenses", methods=["GET"])
def get_expenses(event_id):
    event = get_event(event_id)

    if event is None:
        return error_response("Event not found.", 404)

    expenses = Expense.query.filter_by(event_id=event_id).order_by(
        Expense.id.desc()
    ).all()

    return jsonify([expense.to_dict() for expense in expenses])


@finance_bp.route("/events/<int:event_id>/expenses", methods=["POST"])
def create_expense(event_id):
    if get_event(event_id) is None:
        return error_response("Event not found.", 404)

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    amount = parse_amount(data.get("amount"))

    if not name:
        return error_response("Expense name is required.")

    if amount is None:
        return error_response("Amount must be a valid non-negative number.")

    expense = Expense(
        event_id=event_id,
        name=name,
        category=str(data.get("category") or "Other").strip(),
        amount=amount,
        date=data.get("date"),
        description=data.get("description", ""),
        status=str(data.get("status") or "Pending").strip(),
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({
        "success": True,
        "expense": expense.to_dict()
    }), 201


@finance_bp.route(
    "/events/<int:event_id>/expenses/<int:expense_id>",
    methods=["PUT"]
)
def update_expense(event_id, expense_id):
    expense = Expense.query.filter_by(
        id=expense_id,
        event_id=event_id
    ).first()

    if expense is None:
        return error_response("Expense not found for this event.", 404)

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return error_response("Expense name cannot be empty.")
        expense.name = name

    if "amount" in data:
        amount = parse_amount(data["amount"])
        if amount is None:
            return error_response("Amount must be a valid non-negative number.")
        expense.amount = amount

    if "category" in data:
        expense.category = str(data["category"] or "Other").strip()

    if "date" in data:
        expense.date = data["date"]

    if "description" in data:
        expense.description = data["description"] or ""

    if "status" in data:
        expense.status = str(data["status"] or "Pending").strip()

    db.session.commit()

    return jsonify({
        "success": True,
        "expense": expense.to_dict()
    })


@finance_bp.route(
    "/events/<int:event_id>/expenses/<int:expense_id>",
    methods=["DELETE"]
)
def delete_expense(event_id, expense_id):
    expense = Expense.query.filter_by(
        id=expense_id,
        event_id=event_id
    ).first()

    if expense is None:
        return error_response("Expense not found for this event.", 404)

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"success": True, "message": "Expense deleted successfully."})


# -------------------------
# SPONSORSHIPS
# -------------------------

@finance_bp.route("/events/<int:event_id>/sponsors", methods=["GET"])
def get_sponsors(event_id):
    if get_event(event_id) is None:
        return error_response("Event not found.", 404)

    sponsors = Sponsor.query.filter_by(event_id=event_id).order_by(
        Sponsor.id.desc()
    ).all()

    return jsonify([sponsor.to_dict() for sponsor in sponsors])


@finance_bp.route("/events/<int:event_id>/sponsors", methods=["POST"])
def create_sponsor(event_id):
    if get_event(event_id) is None:
        return error_response("Event not found.", 404)

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    amount = parse_amount(data.get("amount"))

    if not name:
        return error_response("Sponsor name is required.")

    if amount is None:
        return error_response("Sponsorship amount must be a valid non-negative number.")

    sponsor = Sponsor(
        event_id=event_id,
        name=name,
        amount=amount,
        status=str(data.get("status") or "Pending").strip(),
    )

    db.session.add(sponsor)
    db.session.commit()

    return jsonify({
        "success": True,
        "sponsor": sponsor.to_dict()
    }), 201


@finance_bp.route(
    "/events/<int:event_id>/sponsors/<int:sponsor_id>",
    methods=["PUT"]
)
def update_sponsor(event_id, sponsor_id):
    sponsor = Sponsor.query.filter_by(
        id=sponsor_id,
        event_id=event_id
    ).first()

    if sponsor is None:
        return error_response("Sponsor not found for this event.", 404)

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return error_response("Sponsor name cannot be empty.")
        sponsor.name = name

    if "amount" in data:
        amount = parse_amount(data["amount"])
        if amount is None:
            return error_response("Sponsorship amount must be a valid non-negative number.")
        sponsor.amount = amount

    if "status" in data:
        sponsor.status = str(data["status"] or "Pending").strip()

    db.session.commit()

    return jsonify({
        "success": True,
        "sponsor": sponsor.to_dict()
    })


@finance_bp.route(
    "/events/<int:event_id>/sponsors/<int:sponsor_id>",
    methods=["DELETE"]
)
def delete_sponsor(event_id, sponsor_id):
    sponsor = Sponsor.query.filter_by(
        id=sponsor_id,
        event_id=event_id
    ).first()

    if sponsor is None:
        return error_response("Sponsor not found for this event.", 404)

    db.session.delete(sponsor)
    db.session.commit()

    return jsonify({"success": True, "message": "Sponsor deleted successfully."})
