
from datetime import datetime


# ----------TIME HELPERS----------

def normalize_time(time_value):
    
    #Convert different time formats into HH:MM.

    if time_value is None:
        return None

    value = str(time_value).strip()

    if not value:
        return None

    possible_formats = [
        "%H:%M",
        "%H:%M:%S",
    ]

    for time_format in possible_formats:
        try:
            parsed_time = datetime.strptime(
                value,
                time_format
            )

            return parsed_time.strftime("%H:%M")

        except ValueError:
            continue

    return None


def time_to_minutes(time_value):
    
    #Convert HH:MM or HH:MM:SS into minutes.
    
    normalized = normalize_time(time_value)

    if normalized is None:
        return None

    try:
        hours, minutes = normalized.split(":")

        return (
            int(hours) * 60
            + int(minutes)
        )

    except (TypeError, ValueError):
        return None


def times_overlap(
    start_a,
    end_a,
    start_b,
    end_b
):
   
    #Check whether two time ranges overlap.

    start_a_minutes = time_to_minutes(start_a)
    end_a_minutes = time_to_minutes(end_a)

    start_b_minutes = time_to_minutes(start_b)
    end_b_minutes = time_to_minutes(end_b)

    if (
        start_a_minutes is None
        or end_a_minutes is None
        or start_b_minutes is None
        or end_b_minutes is None
    ):
        return False

    # Invalid time ranges should never be considered conflicts.
    if end_a_minutes <= start_a_minutes:
        return False

    if end_b_minutes <= start_b_minutes:
        return False

    return (
        start_a_minutes < end_b_minutes
        and start_b_minutes < end_a_minutes
    )


# =============================================================
# TIME VALIDATION
# =============================================================

def validate_time_range(
    start_time,
    end_time
):

    start_minutes = time_to_minutes(start_time)
    end_minutes = time_to_minutes(end_time)

    if (
        start_minutes is None
        or end_minutes is None
    ):
        return (
            False,
            "Time must be in HH:MM format."
        )

    if end_minutes <= start_minutes:
        return (
            False,
            "End time must be after start time."
        )

    return True, None


#---------TEXT NORMALIZATION----------

def normalize_text(value):

    if value is None:
        return ""

    return " ".join(
        str(value)
        .strip()
        .lower()
        .split()
    )


# ----------DATE NORMALIZATION----------

def normalize_date(date_value):

    if date_value is None:
        return None

    # Python date/datetime objects
    if hasattr(date_value, "strftime"):
        try:
            return date_value.strftime("%Y-%m-%d")
        except Exception:
            pass

    value = str(date_value).strip()

    if not value:
        return None

    # Remove time portion from ISO datetime strings.
    if "T" in value:
        value = value.split("T")[0]

    if " " in value:
        first_part = value.split(" ")[0]

        # Only use the first part if it looks like a date.
        if "-" in first_part:
            value = first_part

    possible_formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d %B %Y",
        "%d %b %Y",
    ]

    for date_format in possible_formats:
        try:
            parsed_date = datetime.strptime(
                value,
                date_format
            )

            return parsed_date.strftime(
                "%Y-%m-%d"
            )

        except ValueError:
            continue

    return value


# ----------VENUE CONFLICT----------

def find_venue_conflict(
    Event,
    date,
    venue,
    start_time,
    end_time,
    exclude_event_id=None
):
    """
    Find an existing event that conflicts with the proposed
    event.

    Conflict conditions:

    1. Same date
    2. Same venue
    3. Overlapping time
    """

    requested_date = normalize_date(date)
    requested_venue = normalize_text(venue)

    if not requested_date:
        return None

    if not requested_venue:
        return None


    try:
        existing_events = Event.query.all()

    except Exception:
        return None


    for existing_event in existing_events:

        if (
            exclude_event_id is not None
            and existing_event.id == exclude_event_id
        ):
            continue

        existing_date = normalize_date(
            getattr(
                existing_event,
                "date",
                None
            )
        )

        if existing_date != requested_date:
            continue


        existing_venue = normalize_text(
            getattr(
                existing_event,
                "venue",
                None
            )
        )

        if existing_venue != requested_venue:
            continue

        existing_start = getattr(
            existing_event,
            "start_time",
            None
        )

        existing_end = getattr(
            existing_event,
            "end_time",
            None
        )

        if times_overlap(
            start_time,
            end_time,
            existing_start,
            existing_end
        ):
            return existing_event

    return None
