from flask import Blueprint, jsonify, request

from extensions import db
from models import Event


# MILESTONE 4 BLUEPRINT

milestone4_bp = Blueprint(
    "milestone4",
    __name__,
    url_prefix="/api/milestone4",
)


# ATTENDANCE STORAGE

attendance_data = {}

# HELPER FUNCTIONS

def safe_non_negative_integer(value, default=None):
    """
    Convert a value into a non-negative integer.
    """

    try:
        number = int(value)

        if number < 0:
            return default

        return number

    except (TypeError, ValueError):
        return default


def get_event_by_id(event_id):

    return db.session.get(
        Event,
        event_id
    )


def calculate_attendance_rate(
    registered,
    checked_in
):

    if registered > 0:

        return (
            checked_in / registered
        ) * 100

    return 0


def calculate_expected_attendance(
    registered
):
   
    return int(
        registered * 0.90
    )



def get_attendance_for_event(event_id):

    from models import Registration, AttendanceRecord

    event = db.session.get(Event, event_id)

    if event is None:
        return {
            "registered": 0,
            "checked_in": 0,
        }

    # Match both internal and public event IDs.
    event_ids = [
        str(event.id),
        str(event.event_id),
    ]

    registered = Registration.query.filter(
        db.or_(
            Registration.event_id.in_(event_ids),
        ),
        Registration.payment_status == "SUCCESS",
    ).count()

    checked_in = AttendanceRecord.query.filter_by(
        event_id=event.event_id
    ).count()

    return {
        "registered": registered,
        "checked_in": checked_in,
    }



# =============================================================
# HEALTH CHECK
# =============================================================

@milestone4_bp.route(
    "/health",
    methods=["GET"]
)
def milestone4_health():

    return jsonify({
        "success": True,
        "milestone": "Milestone 4",
        "status": "Analytics and finalization APIs are working.",
    })

# 1. RECORD ATTENDANCE SUMMARY

@milestone4_bp.route(
    "/attendance",
    methods=["POST"]
)
def record_attendance():

    data = request.get_json(
        silent=True
    ) or {}

    # ---------------------------------------------------------
    # EVENT ID
    # ---------------------------------------------------------

    raw_event_id = data.get(
        "event_id"
    )

    event_id = safe_non_negative_integer(
        raw_event_id
    )

    if event_id is None:

        return jsonify({
            "success": False,
            "error": "A valid event_id is required.",
        }), 400

    event = get_event_by_id(
        event_id
    )

    if event is None:

        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    # ---------------------------------------------------------
    # REGISTERED PARTICIPANTS
    # ---------------------------------------------------------

    registered = safe_non_negative_integer(
        data.get("registered")
    )

    if registered is None:

        return jsonify({
            "success": False,
            "error": (
                "Registered participants must be "
                "a non-negative number."
            ),
        }), 400

    # ---------------------------------------------------------
    # CHECKED-IN PARTICIPANTS
    # ---------------------------------------------------------

    checked_in = safe_non_negative_integer(
        data.get("checked_in")
    )

    if checked_in is None:

        return jsonify({
            "success": False,
            "error": (
                "Checked-in participants must be "
                "a non-negative number."
            ),
        }), 400

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    if checked_in > registered:

        return jsonify({
            "success": False,
            "error": (
                "Checked-in participants cannot be "
                "greater than registered participants."
            ),
        }), 400

    # ---------------------------------------------------------
    # SAVE
    # ---------------------------------------------------------

    attendance_data[event_id] = {
        "registered": registered,
        "checked_in": checked_in,
    }

    attendance_rate = calculate_attendance_rate(
        registered,
        checked_in
    )

    expected_attendance = (
        calculate_expected_attendance(
            registered
        )
    )

    return jsonify({

        "success": True,

        "message":
            "Attendance summary saved successfully.",

        "data": {

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "expected_attendance":
                expected_attendance,
        }

    }), 201


# 2. GET ATTENDANCE FOR ONE EVENT

@milestone4_bp.route(
    "/attendance/<int:event_id>",
    methods=["GET"]
)
def get_event_attendance(event_id):

    event = get_event_by_id(
        event_id
    )

    if event is None:

        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    attendance = get_attendance_for_event(
        event_id
    )

    registered = attendance[
        "registered"
    ]

    checked_in = attendance[
        "checked_in"
    ]

    attendance_rate = (
        calculate_attendance_rate(
            registered,
            checked_in
        )
    )

    expected_attendance = (
        calculate_expected_attendance(
            registered
        )
    )

    return jsonify({

        "success": True,

        "data": {

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "date":
                event.date,

            "venue":
                event.venue,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "expected_attendance":
                expected_attendance,
        }

    })

# 3. GET ALL ATTENDANCE DATA

@milestone4_bp.route(
    "/attendance",
    methods=["GET"]
)
def get_all_attendance():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    results = []

    for event in events:

        attendance = (
            get_attendance_for_event(
                event.id
            )
        )

        registered = attendance[
            "registered"
        ]

        checked_in = attendance[
            "checked_in"
        ]

        attendance_rate = (
            calculate_attendance_rate(
                registered,
                checked_in
            )
        )

        expected_attendance = (
            calculate_expected_attendance(
                registered
            )
        )

        results.append({

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "date":
                event.date,

            "venue":
                event.venue,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "expected_attendance":
                expected_attendance,
        })

    return jsonify({

        "success": True,

        "count":
            len(results),

        "data":
            results,

    })

# 4. ATTENDANCE ANALYTICS

@milestone4_bp.route(
    "/analytics/attendance",
    methods=["GET"]
)
def attendance_analytics():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    analytics = []

    total_registered = 0
    total_checked_in = 0

    for event in events:

        attendance = (
            get_attendance_for_event(
                event.id
            )
        )

        registered = attendance[
            "registered"
        ]

        checked_in = attendance[
            "checked_in"
        ]

        attendance_rate = (
            calculate_attendance_rate(
                registered,
                checked_in
            )
        )

        expected_attendance = (
            calculate_expected_attendance(
                registered
            )
        )

        total_registered += registered
        total_checked_in += checked_in

        analytics.append({

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "expected_attendance":
                expected_attendance,
        })

    overall_attendance_rate = (
        calculate_attendance_rate(
            total_registered,
            total_checked_in
        )
    )

    return jsonify({

        "success": True,

        "summary": {

            "total_events":
                len(events),

            "total_registered":
                total_registered,

            "total_checked_in":
                total_checked_in,

            "overall_attendance_rate":
                round(
                    overall_attendance_rate,
                    2
                ),
        },

        "events":
            analytics,

    })

# 5. ATTENDANCE ESTIMATION

@milestone4_bp.route(
    "/attendance/<int:event_id>/estimate",
    methods=["GET"]
)
def attendance_estimation(event_id):

    event = get_event_by_id(
        event_id
    )

    if event is None:

        return jsonify({
            "success": False,
            "error": "Event not found.",
        }), 404

    attendance = get_attendance_for_event(
        event_id
    )

    registered = attendance[
        "registered"
    ]

    if event_id not in attendance_data:

        return jsonify({

            "success": False,

            "error": (
                "Attendance data is not available "
                "for this event."
            ),

        }), 404

    expected_attendance = (
        calculate_expected_attendance(
            registered
        )
    )

    return jsonify({

        "success": True,

        "data": {

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "registered":
                registered,

            "expected_attendance":
                expected_attendance,

            "estimation_method":
                "90% of registered participants",

            "note":
                (
                    "This is a planning estimate "
                    "and not machine learning."
                ),
        }

    })

# 6. EVENT ANALYTICS

@milestone4_bp.route(
    "/analytics/events",
    methods=["GET"]
)
def event_analytics():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    results = []

    for event in events:

        attendance = (
            get_attendance_for_event(
                event.id
            )
        )

        registered = attendance[
            "registered"
        ]

        checked_in = attendance[
            "checked_in"
        ]

        attendance_rate = (
            calculate_attendance_rate(
                registered,
                checked_in
            )
        )

        # -----------------------------------------------------
        # EXPENSES
        # -----------------------------------------------------

        spent = 0

        try:

            from models import Expense

            expense_records = (
                Expense.query
                .filter_by(
                    event_id=event.id
                )
                .all()
            )

            spent = sum(
                float(
                    getattr(
                        expense,
                        "amount",
                        0
                    ) or 0
                )
                for expense in expense_records
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            spent = 0

        # -----------------------------------------------------
        # SPONSORSHIP
        # -----------------------------------------------------

        sponsorship = 0

        try:

            from models import Sponsor

            sponsor_records = (
                Sponsor.query
                .filter_by(
                    event_id=event.id
                )
                .all()
            )

            sponsorship = sum(
                float(
                    getattr(
                        sponsor,
                        "amount",
                        0
                    ) or 0
                )
                for sponsor in sponsor_records
                if str(
                    getattr(
                        sponsor,
                        "status",
                        ""
                    )
                ).strip().lower()
                == "confirmed"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            sponsorship = 0

        # -----------------------------------------------------
        # BUDGET
        # -----------------------------------------------------

        budget = float(
            getattr(
                event,
                "budget",
                0
            ) or 0
        )

        remaining = (
            budget - spent
        )

        results.append({

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "date":
                event.date,

            "venue":
                event.venue,

            "status":
                event.status,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "budget":
                budget,

            "expenses":
                spent,

            "sponsorship":
                sponsorship,

            "remaining_budget":
                remaining,

        })

    return jsonify({

        "success": True,

        "count":
            len(results),

        "data":
            results,

    })


# =============================================================
# 7. BUDGET ANALYTICS
# =============================================================

@milestone4_bp.route(
    "/analytics/budget",
    methods=["GET"]
)
def budget_analytics():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    results = []

    total_budget = 0
    total_expenses = 0
    total_sponsorship = 0

    for event in events:

        event_id = event.id

        budget = float(
            getattr(
                event,
                "budget",
                0
            ) or 0
        )

        # -----------------------------------------------------
        # EXPENSES
        # -----------------------------------------------------

        spent = 0

        try:

            from models import Expense

            expense_records = (
                Expense.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            spent = sum(
                float(
                    getattr(
                        expense,
                        "amount",
                        0
                    ) or 0
                )
                for expense in expense_records
                if str(
                    getattr(
                        expense,
                        "status",
                        ""
                    )
                ).strip().lower()
                    != "rejected"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            spent = 0

        # -----------------------------------------------------
        # SPONSORSHIP
        # -----------------------------------------------------

        sponsorship = 0

        try:

            from models import Sponsor

            sponsor_records = (
                Sponsor.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            sponsorship = sum(
                float(
                    getattr(
                        sponsor,
                        "amount",
                        0
                    ) or 0
                )
                for sponsor in sponsor_records
                if str(
                    getattr(
                        sponsor,
                        "status",
                        ""
                    )
                ).strip().lower()
                    == "confirmed"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            sponsorship = 0

        remaining = (
            budget - spent
        )

        status = (
            "Over Budget"
            if remaining < 0
            else "Within Budget"
        )

        total_budget += budget
        total_expenses += spent
        total_sponsorship += sponsorship

        results.append({

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "planned_budget":
                budget,

            "expenses":
                spent,

            "sponsorship":
                sponsorship,

            "remaining_budget":
                remaining,

            "status":
                status,

        })

    overall_balance = (
        total_budget
        + total_sponsorship
        - total_expenses
    )

    return jsonify({

        "success": True,

        "summary": {

            "total_planned_budget":
                total_budget,

            "total_expenses":
                total_expenses,

            "total_sponsorship":
                total_sponsorship,

            "overall_balance":
                overall_balance,
        },

        "events":
            results,

    })

# 8. EVENT COMPARISON

@milestone4_bp.route(
    "/analytics/compare",
    methods=["GET"]
)
def compare_events():

    first_id = safe_non_negative_integer(
        request.args.get(
            "first_event_id"
        )
    )

    second_id = safe_non_negative_integer(
        request.args.get(
            "second_event_id"
        )
    )

    if first_id is None:

        return jsonify({
            "success": False,
            "error": (
                "first_event_id is required."
            ),
        }), 400

    if second_id is None:

        return jsonify({
            "success": False,
            "error": (
                "second_event_id is required."
            ),
        }), 400

    if first_id == second_id:

        return jsonify({
            "success": False,
            "error": (
                "Please select two different events."
            ),
        }), 400

    first_event = get_event_by_id(
        first_id
    )

    second_event = get_event_by_id(
        second_id
    )

    if first_event is None:

        return jsonify({
            "success": False,
            "error": (
                "First event was not found."
            ),
        }), 404

    if second_event is None:

        return jsonify({
            "success": False,
            "error": (
                "Second event was not found."
            ),
        }), 404

    first_attendance = (
        get_attendance_for_event(
            first_id
        )
    )

    second_attendance = (
        get_attendance_for_event(
            second_id
        )
    )

    first_registered = (
        first_attendance[
            "registered"
        ]
    )

    second_registered = (
        second_attendance[
            "registered"
        ]
    )

    first_checked_in = (
        first_attendance[
            "checked_in"
        ]
    )

    second_checked_in = (
        second_attendance[
            "checked_in"
        ]
    )

    first_rate = (
        calculate_attendance_rate(
            first_registered,
            first_checked_in
        )
    )

    second_rate = (
        calculate_attendance_rate(
            second_registered,
            second_checked_in
        )
    )

    # ---------------------------------------------------------
    # EXPENSE HELPER
    # ---------------------------------------------------------

    def get_event_expenses(event_id):

        try:

            from models import Expense

            records = (
                Expense.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            return sum(
                float(
                    getattr(
                        record,
                        "amount",
                        0
                    ) or 0
                )
                for record in records
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            return 0

    first_expense = (
        get_event_expenses(
            first_id
        )
    )

    second_expense = (
        get_event_expenses(
            second_id
        )
    )

    # ---------------------------------------------------------
    # COMPARISON RESPONSE
    # ---------------------------------------------------------

    return jsonify({

        "success": True,

        "metrics": [

            {
                "metric":
                    "Registered Participants",

                "first_event":
                    first_registered,

                "second_event":
                    second_registered,
            },

            {
                "metric":
                    "Checked-in Participants",

                "first_event":
                    first_checked_in,

                "second_event":
                    second_checked_in,
            },

            {
                "metric":
                    "Attendance Rate",

                "first_event":
                    round(
                        first_rate,
                        2
                    ),

                "second_event":
                    round(
                        second_rate,
                        2
                    ),
            },

            {
                "metric":
                    "Budget",

                "first_event":
                    float(
                        getattr(
                            first_event,
                            "budget",
                            0
                        ) or 0
                    ),

                "second_event":
                    float(
                        getattr(
                            second_event,
                            "budget",
                            0
                        ) or 0
                    ),
            },

            {
                "metric":
                    "Expenses",

                "first_event":
                    first_expense,

                "second_event":
                    second_expense,
            },
        ],

        "first_event": {

            "id":
                first_event.id,

            "event_id":
                first_event.event_id,

            "name":
                first_event.name,
        },

        "second_event": {

            "id":
                second_event.id,

            "event_id":
                second_event.event_id,

            "name":
                second_event.name,
        },

    })

# 9. FINAL EVENT REPORT

@milestone4_bp.route(
    "/reports/final",
    methods=["GET"]
)
def final_event_report():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    reports = []

    for event in events:

        event_id = event.id

        attendance = (
            get_attendance_for_event(
                event_id
            )
        )

        registered = attendance[
            "registered"
        ]

        checked_in = attendance[
            "checked_in"
        ]

        attendance_rate = (
            calculate_attendance_rate(
                registered,
                checked_in
            )
        )

        expected_attendance = (
            calculate_expected_attendance(
                registered
            )
        )

        budget = float(
            getattr(
                event,
                "budget",
                0
            ) or 0
        )

        # -----------------------------------------------------
        # EXPENSES
        # -----------------------------------------------------

        spent = 0

        try:

            from models import Expense

            records = (
                Expense.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            spent = sum(
                float(
                    getattr(
                        record,
                        "amount",
                        0
                    ) or 0
                )
                for record in records
                if str(
                    getattr(
                        record,
                        "status",
                        ""
                    )
                ).strip().lower()
                    != "rejected"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            spent = 0

        # -----------------------------------------------------
        # SPONSORSHIP
        # -----------------------------------------------------

        sponsorship = 0

        try:

            from models import Sponsor

            records = (
                Sponsor.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            sponsorship = sum(
                float(
                    getattr(
                        record,
                        "amount",
                        0
                    ) or 0
                )
                for record in records
                if str(
                    getattr(
                        record,
                        "status",
                        ""
                    )
                ).strip().lower()
                    == "confirmed"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            sponsorship = 0

        remaining_budget = (
            budget - spent
        )

        # -----------------------------------------------------
        # RESOURCE STATUS
        # -----------------------------------------------------

        resource_status = []

        try:

            from models import Resource

            resource_records = (
                Resource.query
                .filter_by(
                    event_id=event_id
                )
                .all()
            )

            for resource in resource_records:

                required = safe_non_negative_integer(
                    getattr(
                        resource,
                        "required",
                        0
                    ),
                    0
                )

                available = safe_non_negative_integer(
                    getattr(
                        resource,
                        "available",
                        0
                    ),
                    0
                )

                if available >= required:

                    status = "Sufficient"

                    difference = (
                        available - required
                    )

                else:

                    shortage = (
                        required - available
                    )

                    status = "Shortage"

                    difference = shortage

                resource_status.append({

                    "resource":
                        getattr(
                            resource,
                            "name",
                            "Resource"
                        ),

                    "required":
                        required,

                    "available":
                        available,

                    "status":
                        status,

                    "difference":
                        difference,

                })

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            resource_status = []

        reports.append({

            "event_id":
                event.id,

            "event_code":
                event.event_id,

            "event_name":
                event.name,

            "date":
                event.date,

            "venue":
                event.venue,

            "status":
                event.status,

            "registered":
                registered,

            "checked_in":
                checked_in,

            "attendance_rate":
                round(
                    attendance_rate,
                    2
                ),

            "expected_attendance":
                expected_attendance,

            "planned_budget":
                budget,

            "total_expenses":
                spent,

            "sponsorship":
                sponsorship,

            "remaining_budget":
                remaining_budget,

            "resource_status":
                resource_status,

        })

    return jsonify({

        "success": True,

        "generated_at":
            __import__(
                "datetime"
            ).datetime.utcnow().isoformat()
            + "Z",

        "count":
            len(reports),

        "reports":
            reports,

    })

# 10. FINAL DASHBOARD SUMMARY

@milestone4_bp.route(
    "/dashboard",
    methods=["GET"]
)
def final_dashboard():

    events = (
        Event.query
        .order_by(
            Event.id.asc()
        )
        .all()
    )

    total_registered = 0
    total_checked_in = 0

    total_budget = 0
    total_expenses = 0
    total_sponsorship = 0

    for event in events:

        attendance = (
            get_attendance_for_event(
                event.id
            )
        )

        total_registered += (
            attendance[
                "registered"
            ]
        )

        total_checked_in += (
            attendance[
                "checked_in"
            ]
        )

        total_budget += float(
            getattr(
                event,
                "budget",
                0
            ) or 0
        )

        # -----------------------------------------------------
        # EXPENSES
        # -----------------------------------------------------

        try:

            from models import Expense

            records = (
                Expense.query
                .filter_by(
                    event_id=event.id
                )
                .all()
            )

            total_expenses += sum(
                float(
                    getattr(
                        record,
                        "amount",
                        0
                    ) or 0
                )
                for record in records
                if str(
                    getattr(
                        record,
                        "status",
                        ""
                    )
                ).strip().lower()
                    != "rejected"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            pass

        # -----------------------------------------------------
        # SPONSORSHIP
        # -----------------------------------------------------

        try:

            from models import Sponsor

            records = (
                Sponsor.query
                .filter_by(
                    event_id=event.id
                )
                .all()
            )

            total_sponsorship += sum(
                float(
                    getattr(
                        record,
                        "amount",
                        0
                    ) or 0
                )
                for record in records
                if str(
                    getattr(
                        record,
                        "status",
                        ""
                    )
                ).strip().lower()
                    == "confirmed"
            )

        except (
            ImportError,
            AttributeError,
            Exception
        ):

            pass

    overall_attendance = (
        calculate_attendance_rate(
            total_registered,
            total_checked_in
        )
    )

    overall_balance = (
        total_budget
        + total_sponsorship
        - total_expenses
    )

    return jsonify({

        "success": True,

        "dashboard": {

            "total_events":
                len(events),

            "total_registered":
                total_registered,

            "total_checked_in":
                total_checked_in,

            "overall_attendance":
                round(
                    overall_attendance,
                    2
                ),

            "total_planned_budget":
                total_budget,

            "total_expenses":
                total_expenses,

            "total_sponsorship":
                total_sponsorship,

            "overall_balance":
                overall_balance,

        },

    })

# 11. SYSTEM TESTS

@milestone4_bp.route(
    "/system-tests",
    methods=["GET"]
)
def system_tests():

    passed = 0
    failed = 0

    tests = []

    # ---------------------------------------------------------
    # TEST 1 — EVENTS
    # ---------------------------------------------------------

    try:

        events_are_valid = isinstance(
            Event.query.all(),
            list
        )

    except Exception:

        events_are_valid = False

    if events_are_valid:

        passed += 1

        tests.append({

            "name":
                "Event storage",

            "status":
                "PASS",

            "message":
                "Event storage is working.",

        })

    else:

        failed += 1

        tests.append({

            "name":
                "Event storage",

            "status":
                "FAIL",

            "message":
                "Event storage error.",

        })

    # ---------------------------------------------------------
    # TEST 2 — ATTENDANCE
    # ---------------------------------------------------------

    valid_attendance = all(

        data.get(
            "checked_in",
            0
        )
        <=
        data.get(
            "registered",
            0
        )

        for data in attendance_data.values()

    )

    if valid_attendance:

        passed += 1

        tests.append({

            "name":
                "Attendance validation",

            "status":
                "PASS",

            "message":
                "Attendance validation passed.",

        })

    else:

        failed += 1

        tests.append({

            "name":
                "Attendance validation",

            "status":
                "FAIL",

            "message":
                "Attendance validation failed.",

        })

    # ---------------------------------------------------------
    # TEST 3 — EVENT REFERENCES
    # ---------------------------------------------------------

    valid_references = all(

        get_event_by_id(
            event_id
        )
        is not None

        for event_id in attendance_data.keys()

    )

    if valid_references:

        passed += 1

        tests.append({

            "name":
                "Attendance-event references",

            "status":
                "PASS",

            "message":
                "Attendance-event references passed.",

        })

    else:

        failed += 1

        tests.append({

            "name":
                "Attendance-event references",

            "status":
                "FAIL",

            "message":
                "Invalid attendance-event reference.",

        })

    # ---------------------------------------------------------
    # RESULT
    # ---------------------------------------------------------

    return jsonify({

        "success":
            failed == 0,

        "tests_passed":
            passed,

        "tests_failed":
            failed,

        "total_tests":
            passed + failed,

        "tests":
            tests,

        "message":
            (
                "All basic system tests passed."
                if failed == 0
                else
                "Some tests failed. Please check the system."
            ),

    })
