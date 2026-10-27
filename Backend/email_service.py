import os
import resend

from dotenv import load_dotenv


# Always load the .env file from the Backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


RESEND_API_KEY = os.getenv("RESEND_API_KEY")

MAIL_FROM_NAME = os.getenv(
    "MAIL_FROM_NAME",
    "NexEvent",
)

RESEND_FROM_EMAIL = os.getenv(
    "RESEND_FROM_EMAIL",
)


def send_registration_email(
    registration,
    event,
    qr_url,
):


    if not RESEND_API_KEY:
        raise ValueError(
            "RESEND_API_KEY is not configured"
        )

    if not RESEND_FROM_EMAIL:
        raise ValueError(
            "RESEND_FROM_EMAIL is not configured"
        )

    recipient = registration.email

    subject = (
        f"Thanks for registering for {event.name} - NexEvent"
    )

    participant_name = (
        registration.name or "Participant"
    )

    registration_id = (
        registration.registration_id
    )

    event_date = event.date or "Not specified"

    event_time = ""

    if event.start_time and event.end_time:
        event_time = (
            f"{event.start_time} - {event.end_time}"
        )
    elif event.start_time:
        event_time = event.start_time

    venue = event.venue or "Event Venue"

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <style>
        body {{
            margin: 0;
            padding: 0;
            background: #f4f7fb;
            font-family: Arial, sans-serif;
            color: #1f2937;
        }}

        .container {{
            max-width: 620px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
        }}

        .header {{
            padding: 28px;
            background: linear-gradient(
                135deg,
                #2563eb,
                #7c3aed
            );
            color: white;
        }}

        .header h1 {{
            margin: 0;
            font-size: 28px;
        }}

        .header p {{
            margin: 8px 0 0;
            opacity: 0.9;
        }}

        .content {{
            padding: 30px;
        }}

        .success {{
            padding: 16px;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            color: #065f46;
            margin: 20px 0;
        }}

        .details {{
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }}

        .row {{
            padding: 8px 0;
        }}

        .label {{
            font-weight: bold;
            color: #64748b;
        }}

        .qr-button {{
            display: inline-block;
            padding: 14px 24px;
            background: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            margin-top: 12px;
        }}

        .note {{
            margin-top: 24px;
            padding: 14px;
            background: #fff7ed;
            border-radius: 10px;
            color: #9a3412;
        }}

        .footer {{
            padding: 20px 30px;
            background: #f8fafc;
            color: #64748b;
            font-size: 13px;
            text-align: center;
        }}
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>NexEvent</h1>
        <p>Smart Event Planning & Resource Coordination</p>
    </div>

    <div class="content">

        <h2>Thanks for registering, {participant_name}!</h2>

        <div class="success">
            Your registration and demo payment have been
            successfully completed.
        </div>

        <div class="details">

            <div class="row">
                <span class="label">Event:</span>
                {event.name}
            </div>

            <div class="row">
                <span class="label">Registration ID:</span>
                {registration_id}
            </div>

            <div class="row">
                <span class="label">Date:</span>
                {event_date}
            </div>

            <div class="row">
                <span class="label">Time:</span>
                {event_time or "Not specified"}
            </div>

            <div class="row">
                <span class="label">Venue:</span>
                {venue}
            </div>

            <div class="row">
                <span class="label">Payment:</span>
                Successful
            </div>

        </div>

        <h3>Your Entry QR Code</h3>

        <p>
            Please keep this email safe. Open the button below
            to view your QR code. You can show this QR code
            at the venue entrance for check-in.
        </p>

        <a
            href="{qr_url}"
            class="qr-button"
        >
            View My QR Code
        </a>

        <div class="note">
            Please keep your QR code ready when you arrive
            at the event venue.
        </div>

    </div>

    <div class="footer">
        This is an automated email from NexEvent.
        <br>
        Smart Event Planning Platform
    </div>

</div>

</body>
</html>
"""

    text_body = f"""
Thanks for registering for {event.name}!

Hello {participant_name},

Your registration and demo payment have been
successfully completed.

Event: {event.name}
Registration ID: {registration_id}
Date: {event_date}
Time: {event_time or "Not specified"}
Venue: {venue}
Payment: Successful

View your QR Code:
{qr_url}

Please keep this QR code ready when you arrive
at the event venue.

Thank you,
NexEvent
"""

    # Configure Resend
    resend.api_key = RESEND_API_KEY

    # Send email through Resend HTTPS API
    params = {
        "from": f"{MAIL_FROM_NAME} <{RESEND_FROM_EMAIL}>",
        "to": [recipient],
        "subject": subject,
        "html": html_body,
        "text": text_body,
    }

    resend.Emails.send(params)

    print(
        f"Registration email sent to {recipient}"
    )

    return True