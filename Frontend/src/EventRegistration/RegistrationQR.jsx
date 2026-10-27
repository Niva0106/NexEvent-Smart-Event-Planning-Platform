import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Mail,
  QrCode,
  User,
  AlertCircle,
  LoaderCircle,
  TicketCheck,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const formatEventDate = (dateValue) => {
  if (!dateValue) return "Not specified";

  const value = String(dateValue).trim();

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return value;
};

const formatTime = (timeValue) => {
  if (!timeValue) return "";

  const value = String(timeValue).trim();

  const timeMatch = value.match(/^(\d{1,2}):(\d{2})/);

  if (!timeMatch) return value;

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

function RegistrationQR() {
  const { registrationId: rawRegistrationId } = useParams();

  const registrationId = rawRegistrationId
    ? decodeURIComponent(rawRegistrationId)
    : "";

  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!registrationId) {
        setError("Registration ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/payment/status/${encodeURIComponent(
            registrationId
          )}`
        );

        const text = await response.text();

        let data = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Request failed with status ${response.status}`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.error || "Registration information could not be loaded."
          );
        }

        if (!data?.registration) {
          throw new Error("Registration details were not found.");
        }

        if (data.registration.payment_status !== "SUCCESS") {
          throw new Error("Payment for this registration is not completed.");
        }

        setRegistration(data.registration);
        setEvent(data.event || null);
      } catch (err) {
        console.error("Registration QR error:", err);

        setError(
          err?.message ||
            "Failed to load registration details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId]);

  const handleDownloadQR = async () => {
    if (!registrationId) return;

    try {
      setDownloading(true);

      const qrUrl = `${API_BASE_URL}/api/registration/${encodeURIComponent(
        registrationId
      )}/qr`;

      const response = await fetch(qrUrl);

      if (!response.ok) {
        throw new Error("QR code could not be downloaded.");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${registrationId}-QR.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("QR download error:", err);

      alert(
        err?.message ||
          "Unable to download the QR code. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="registration-page">
        <div className="registration-background">
          <div className="bubble bubble-one"></div>
          <div className="bubble bubble-two"></div>
          <div className="bubble bubble-three"></div>
          <div className="bubble bubble-four"></div>
        </div>

        <div className="registration-loading-card">
          <div className="loading-icon">
            <LoaderCircle size={42} className="spin" />
          </div>

          <h2>Loading Registration</h2>

          <p>
            Please wait while we retrieve your registration details.
          </p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registration-page">
        <div className="registration-background">
          <div className="bubble bubble-one"></div>
          <div className="bubble bubble-two"></div>
          <div className="bubble bubble-three"></div>
          <div className="bubble bubble-four"></div>
        </div>

        <div className="registration-error-card">
          <div className="error-icon">
            <AlertCircle size={42} />
          </div>

          <h2>Registration Not Available</h2>

          <p>{error}</p>

          {registrationId && (
            <div className="error-registration-id">
              <span>Registration ID</span>
              <strong>{registrationId}</strong>
            </div>
          )}

          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  const participantName =
    registration?.name ||
    registration?.participant_name ||
    registration?.full_name ||
    "Participant";

  const participantEmail =
    registration?.email ||
    registration?.participant_email ||
    "Not specified";

  const eventName =
    event?.name ||
    registration?.event_name ||
    registration?.event_title ||
    registration?.event_id ||
    "Event";

  const eventDate =
    event?.date ||
    registration?.event_date ||
    registration?.date ||
    null;

  const eventVenue =
    event?.venue ||
    registration?.event_venue ||
    registration?.venue ||
    "Not specified";

  const startTime = event?.start_time
    ? formatTime(event.start_time)
    : "";

  const endTime = event?.end_time
    ? formatTime(event.end_time)
    : "";

  const eventTime =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime || endTime || "";

  const qrImageUrl = `${API_BASE_URL}/api/registration/${encodeURIComponent(
    registrationId
  )}/qr`;

  return (
    <div className="registration-page">
      <div className="registration-background">
        <div className="bubble bubble-one"></div>
        <div className="bubble bubble-two"></div>
        <div className="bubble bubble-three"></div>
        <div className="bubble bubble-four"></div>
      </div>

      <div className="registration-container">
        <div className="brand-section">
          <div className="brand-icon">
            <TicketCheck size={30} />
          </div>

          <div>
            <h1>NexEvent</h1>
            <p>Event Management Platform</p>
          </div>
        </div>

        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">
              <CheckCircle2 size={34} />
            </div>

            <div>
              <h2>Registration Confirmed</h2>

              <p>
                Your registration has been successfully completed.
              </p>
            </div>
          </div>

          <div className="confirmation-banner">
            <CheckCircle2 size={20} />

            <span>
              Payment successful • Registration confirmed
            </span>
          </div>

          <div className="main-content">
            <div className="details-section">
              <div className="section-heading">
                <CalendarDays size={21} />

                <h3>Event Details</h3>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <CalendarDays size={20} />
                </div>

                <div className="detail-content">
                  <span>Event</span>
                  <strong>{eventName}</strong>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <CalendarDays size={20} />
                </div>

                <div className="detail-content">
                  <span>Date</span>
                  <strong>{formatEventDate(eventDate)}</strong>
                </div>
              </div>

              {eventTime && (
                <div className="detail-card">
                  <div className="detail-icon">
                    <Clock3 size={20} />
                  </div>

                  <div className="detail-content">
                    <span>Time</span>
                    <strong>{eventTime}</strong>
                  </div>
                </div>
              )}

              <div className="detail-card">
                <div className="detail-icon">
                  <MapPin size={20} />
                </div>

                <div className="detail-content">
                  <span>Venue</span>
                  <strong>{eventVenue}</strong>
                </div>
              </div>
            </div>

            <div className="qr-section">
              <div className="qr-title">
                <QrCode size={21} />

                <h3>Your QR Code</h3>
              </div>

              <div className="qr-wrapper">
                <img
                  src={qrImageUrl}
                  alt={`QR code for registration ${registrationId}`}
                  className="qr-image"
                />
              </div>

              <p className="qr-instruction">
                Show this QR code at the event entrance for
                verification.
              </p>

              <button
                className="download-button"
                onClick={handleDownloadQR}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <LoaderCircle size={19} className="spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={19} />
                    Download QR Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="participant-section">
            <div className="section-heading">
              <User size={21} />

              <h3>Participant Details</h3>
            </div>

            <div className="participant-grid">
              <div className="participant-detail">
                <User size={19} />

                <div>
                  <span>Name</span>
                  <strong>{participantName}</strong>
                </div>
              </div>

              <div className="participant-detail">
                <Mail size={19} />

                <div>
                  <span>Email</span>
                  <strong>{participantEmail}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="registration-id-section">
            <span>Registration ID</span>

            <strong>{registrationId}</strong>
          </div>
        </div>

        <div className="footer">
          <p>
            Powered by <strong>NexEvent</strong>
          </p>

          <span>
            Please keep your registration ID and QR code safe.
          </span>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .registration-page {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow-x: hidden;
    padding: 40px 20px;
    background:
      radial-gradient(
        circle at top left,
        rgba(124, 58, 237, 0.25),
        transparent 35%
      ),
      radial-gradient(
        circle at bottom right,
        rgba(79, 70, 229, 0.22),
        transparent 35%
      ),
      #0f0b1f;
    color: #ffffff;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .registration-background {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    filter: blur(2px);
    opacity: 0.2;
    animation: floatBubble 10s ease-in-out infinite;
  }

  .bubble-one {
    width: 240px;
    height: 240px;
    background: #8b5cf6;
    top: 5%;
    left: -80px;
  }

  .bubble-two {
    width: 180px;
    height: 180px;
    background: #6366f1;
    top: 45%;
    right: -60px;
    animation-delay: 2s;
  }

  .bubble-three {
    width: 130px;
    height: 130px;
    background: #a78bfa;
    bottom: 5%;
    left: 10%;
    animation-delay: 4s;
  }

  .bubble-four {
    width: 100px;
    height: 100px;
    background: #818cf8;
    top: 20%;
    right: 15%;
    animation-delay: 6s;
  }

  @keyframes floatBubble {
    0%,
    100% {
      transform: translateY(0) translateX(0);
    }

    50% {
      transform: translateY(-25px) translateX(15px);
    }
  }

  .registration-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1050px;
    margin: 0 auto;
  }

  .brand-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    margin-bottom: 30px;
  }

  .brand-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(124, 58, 237, 0.25);
    border: 1px solid rgba(167, 139, 250, 0.35);
    color: #c4b5fd;
  }

  .brand-section h1 {
    margin: 0;
    font-size: 27px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .brand-section p {
    margin: 3px 0 0;
    color: #a8a0ba;
    font-size: 13px;
  }

  .success-card {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(24, 18, 43, 0.82);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border-radius: 26px;
    padding: 30px;
    box-shadow:
      0 25px 70px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .success-header {
    display: flex;
    align-items: center;
    gap: 17px;
    margin-bottom: 22px;
  }

  .success-icon {
    width: 62px;
    height: 62px;
    flex-shrink: 0;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(74, 222, 128, 0.25);
    color: #4ade80;
  }

  .success-header h2 {
    margin: 0 0 5px;
    font-size: 27px;
    font-weight: 750;
  }

  .success-header p {
    margin: 0;
    color: #aaa2bb;
    font-size: 14px;
  }

  .confirmation-banner {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 13px 16px;
    margin-bottom: 28px;
    border-radius: 13px;
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.18);
    color: #86efac;
    font-size: 13px;
    font-weight: 600;
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 35px;
    align-items: start;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 16px;
    color: #c4b5fd;
  }

  .section-heading h3 {
    margin: 0;
    color: #ffffff;
    font-size: 17px;
    font-weight: 700;
  }

  .detail-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 15px;
    margin-bottom: 11px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .detail-icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    background: rgba(124, 58, 237, 0.12);
  }

  .detail-content {
    min-width: 0;
  }

  .detail-content span,
  .participant-detail span {
    display: block;
    color: #8f879f;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .detail-content strong {
    display: block;
    color: #f5f3f7;
    font-size: 14px;
    font-weight: 600;
    word-break: break-word;
  }

  .qr-section {
    padding: 22px;
    border-radius: 19px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
  }

  .qr-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #c4b5fd;
    margin-bottom: 17px;
  }

  .qr-title h3 {
    margin: 0;
    color: #ffffff;
    font-size: 17px;
  }

  .qr-wrapper {
    width: 230px;
    height: 230px;
    padding: 12px;
    margin: 0 auto 16px;
    border-radius: 17px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .qr-instruction {
    margin: 0 auto 18px;
    max-width: 270px;
    color: #9790a5;
    font-size: 12px;
    line-height: 1.6;
  }

  .download-button {
    width: 100%;
    min-height: 45px;
    border: none;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(
      135deg,
      #7c3aed,
      #6366f1
    );
    color: #ffffff;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .download-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
  }

  .download-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .participant-section {
    margin-top: 32px;
    padding-top: 27px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .participant-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .participant-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #a78bfa;
  }

  .participant-detail strong {
    color: #f5f3f7;
    font-size: 14px;
    font-weight: 600;
    word-break: break-word;
  }

  .registration-id-section {
    margin-top: 24px;
    padding: 17px;
    text-align: center;
    border-radius: 14px;
    background: rgba(124, 58, 237, 0.08);
    border: 1px dashed rgba(167, 139, 250, 0.25);
  }

  .registration-id-section span {
    display: block;
    color: #8f879f;
    font-size: 11px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .registration-id-section strong {
    color: #c4b5fd;
    font-size: 14px;
    letter-spacing: 0.6px;
    word-break: break-all;
  }

  .footer {
    text-align: center;
    margin-top: 24px;
  }

  .footer p {
    margin: 0 0 5px;
    color: #888095;
    font-size: 12px;
  }

  .footer strong {
    color: #a78bfa;
  }

  .footer span {
    color: #625c6d;
    font-size: 11px;
  }

  .registration-loading-card,
  .registration-error-card {
    position: relative;
    z-index: 1;
    width: min(480px, 100%);
    margin: 15vh auto 0;
    padding: 38px 30px;
    text-align: center;
    border-radius: 24px;
    background: rgba(24, 18, 43, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
  }

  .loading-icon,
  .error-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-icon {
    color: #a78bfa;
    background: rgba(124, 58, 237, 0.12);
  }

  .error-icon {
    color: #f87171;
    background: rgba(239, 68, 68, 0.1);
  }

  .registration-loading-card h2,
  .registration-error-card h2 {
    margin: 0 0 8px;
    font-size: 23px;
  }

  .registration-loading-card p,
  .registration-error-card p {
    margin: 0;
    color: #9991a8;
    font-size: 14px;
    line-height: 1.6;
  }

  .error-registration-id {
    margin-top: 20px;
    padding: 13px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
  }

  .error-registration-id span {
    display: block;
    color: #777080;
    font-size: 11px;
    margin-bottom: 5px;
  }

  .error-registration-id strong {
    color: #c4b5fd;
    font-size: 13px;
    word-break: break-all;
  }

  .retry-button {
    margin-top: 22px;
    padding: 11px 22px;
    border: none;
    border-radius: 10px;
    background: #7c3aed;
    color: #ffffff;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
  }

  .retry-button:hover {
    background: #6d28d9;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 800px) {
    .registration-page {
      padding: 25px 14px;
    }

    .success-card {
      padding: 22px;
    }

    .main-content {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .qr-section {
      max-width: 430px;
      width: 100%;
      margin: 0 auto;
    }
  }

  @media (max-width: 560px) {
    .brand-section {
      margin-bottom: 22px;
    }

    .brand-icon {
      width: 47px;
      height: 47px;
      border-radius: 14px;
    }

    .brand-section h1 {
      font-size: 23px;
    }

    .success-card {
      padding: 18px;
      border-radius: 20px;
    }

    .success-header {
      align-items: flex-start;
    }

    .success-icon {
      width: 52px;
      height: 52px;
      border-radius: 15px;
    }

    .success-header h2 {
      font-size: 21px;
    }

    .success-header p {
      font-size: 12px;
    }

    .participant-grid {
      grid-template-columns: 1fr;
    }

    .qr-wrapper {
      width: 205px;
      height: 205px;
    }

    .confirmation-banner {
      align-items: flex-start;
    }
  }
`;

export default RegistrationQR;