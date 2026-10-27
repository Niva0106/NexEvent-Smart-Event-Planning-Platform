from extensions import db
from datetime import datetime

# EVENT

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    event_id = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    date = db.Column(
        db.String(100),
        nullable=False,
    )

    venue = db.Column(
        db.String(200),
        nullable=False,
    )

    # INDIA LOCATION

    city = db.Column(
        db.String(100),
        nullable=False,
        default="",
    )

    latitude = db.Column(
        db.Float,
        nullable=True,
    )

    longitude = db.Column(
        db.Float,
        nullable=True,
    )

    # =========================================================
    # EVENT PRICE
    # =========================================================

    price_inr = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    budget = db.Column(
        db.Float,
        nullable=False,
        default=0,
    )

    # SCHEDULE

    start_time = db.Column(
        db.String(20),
        nullable=False,
        default="09:00",
    )

    end_time = db.Column(
        db.String(20),
        nullable=False,
        default="17:00",
    )

    attendees = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="Planning",
    )

    resources = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    # RELATIONSHIPS

    registrations = db.relationship(
        "Registration",
        backref="event",
        lazy=True,
        cascade="all, delete-orphan",
    )

    vendor_assignments = db.relationship(
        "VendorAssignment",
        backref="event",
        lazy=True,
        cascade="all, delete-orphan",
    )

    # TO DICT

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "date": self.date,
            "venue": self.venue,

            # India location
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,

            # Price
            "price_inr": self.price_inr,

            # Schedule
            "start_time": self.start_time,
            "end_time": self.end_time,
            "attendees": self.attendees,
            "status": self.status,
            "resources": self.resources,
        }


# REGISTRATION

class Registration(db.Model):
    __tablename__ = "registrations"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    registration_id = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
    )

    event_id = db.Column(
        db.String(50),
        db.ForeignKey("events.event_id"),
        nullable=False,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    email = db.Column(
        db.String(200),
        nullable=False,
    )

    phone = db.Column(
        db.String(30),
        nullable=False,
    )

    amount = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    # PAYMENT CURRENCY

    currency = db.Column(
        db.String(10),
        nullable=False,
        default="INR",
    )

    payment_status = db.Column(
        db.String(50),
        nullable=False,
        default="created",
    )

    # PAYMENT IDS
    razorpay_order_id = db.Column(
        db.String(200),
    )

    razorpay_payment_id = db.Column(
        db.String(200),
    )

    # QR CODE

    qr_code_path = db.Column(
        db.String(500),
    )

    registration_token = db.Column(
        db.String(500),
        unique=True,
        nullable=True,
    )

    # TO DICT

    def to_dict(self):
        return {
            "id": self.id,
            "registration_id": self.registration_id,
            "event_id": self.event_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "amount": self.amount,
            "currency": self.currency,
            "payment_status": self.payment_status,

            # Existing payment fields
            "razorpay_order_id":
                self.razorpay_order_id,

            "razorpay_payment_id":
                self.razorpay_payment_id,

            # QR fields
            "qr_code_path":
                self.qr_code_path,

            "registration_token":
                self.registration_token,
        }


# VENDOR

class Vendor(db.Model):
    __tablename__ = "vendors"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    vendor_code = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    service_type = db.Column(
        db.String(200),
        nullable=False,
    )

    phone = db.Column(
        db.String(30),
        nullable=False,
    )

    email = db.Column(
        db.String(200),
        nullable=False,
    )

    # VENDOR RATINGS

    overall_rating = db.Column(
        db.Float,
        default=0,
    )

    quality_rating = db.Column(
        db.Float,
        default=0,
    )

    timeliness_rating = db.Column(
        db.Float,
        default=0,
    )

    cost_rating = db.Column(
        db.Float,
        default=0,
    )

    communication_rating = db.Column(
        db.Float,
        default=0,
    )

    # RELATIONSHIP

    assignments = db.relationship(
        "VendorAssignment",
        backref="vendor",
        lazy=True,
        cascade="all, delete-orphan",
    )

    # TO DICT

    def to_dict(self):
        return {
            "id": self.id,
            "vendor_code": self.vendor_code,
            "name": self.name,
            "service_type": self.service_type,
            "phone": self.phone,
            "email": self.email,
            "overall_rating": self.overall_rating,
            "quality_rating": self.quality_rating,
            "timeliness_rating": self.timeliness_rating,
            "cost_rating": self.cost_rating,
            "communication_rating":
                self.communication_rating,

            "assignments": [
                assignment.to_dict()
                for assignment in self.assignments
            ],
        }


# VENDOR ASSIGNMENT

class VendorAssignment(db.Model):
    __tablename__ = "vendor_assignments"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    vendor_id = db.Column(
        db.Integer,
        db.ForeignKey("vendors.id"),
        nullable=False,
    )

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.id"),
        nullable=False,
    )

    status = db.Column(
        db.String(50),
        default="Assigned",
    )

    notes = db.Column(
        db.Text,
        default="",
    )

    # TO DICT

    def to_dict(self):
        return {
            "id": self.id,
            "assignment_id": self.id,
            "vendor_id": self.vendor_id,
            "event_id": self.event_id,

            "event_name": (
                self.event.name
                if self.event
                else None
            ),

            "status": self.status,
            "notes": self.notes,
        }

# ATTENDANCE RECORD

class AttendanceRecord(db.Model):
    __tablename__ = "attendance_records"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    registration_id = db.Column(
        db.String(100),
        db.ForeignKey("registrations.registration_id"),
        unique=True,
        nullable=False,
    )

    event_id = db.Column(
        db.String(50),
        db.ForeignKey("events.event_id"),
        nullable=False,
    )

    checked_in_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


# RESOURCE INVENTORY
class InventoryResource(db.Model):
    __tablename__ = "inventory_resources"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    category = db.Column(
        db.String(100),
        nullable=False,
        default="General",
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    allocated = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    @property
    def available(self):
        return self.quantity - self.allocated

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "quantity": self.quantity,
            "allocated": self.allocated,
            "available": self.available,
        }



# ============================================================
# EVENT EXPENSES
# ============================================================

class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.id"),
        nullable=False,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    category = db.Column(
        db.String(100),
        nullable=False,
        default="Other",
    )

    amount = db.Column(
        db.Float,
        nullable=False,
        default=0,
    )

    date = db.Column(
        db.String(20),
        nullable=True,
    )

    description = db.Column(
        db.Text,
        nullable=True,
        default="",
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="Pending",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "category": self.category,
            "amount": self.amount,
            "date": self.date,
            "description": self.description,
            "status": self.status,
        }


# ============================================================
# EVENT SPONSORSHIPS
# ============================================================

class Sponsor(db.Model):
    __tablename__ = "sponsorships"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.id"),
        nullable=False,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    amount = db.Column(
        db.Float,
        nullable=False,
        default=0,
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="Pending",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "amount": self.amount,
            "status": self.status,
        }
