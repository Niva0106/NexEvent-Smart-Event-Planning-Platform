"""
Shared Flask extension instances.

Kept in their own module so both `app.py` and `payment_qr_backend.py`
can import the same `db` object without circular imports.
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
