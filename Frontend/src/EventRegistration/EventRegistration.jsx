import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Mail,
  Phone,
  User,
} from "lucide-react";

import "./EventRegistration.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000";

function EventRegistration({
  eventId: propEventId = null,
  eventPrice = 499,
}) {
  const { eventId: routeEventId } = useParams();

  // =========================================================
  // GET EVENT ID
  // =========================================================

  const eventId =
    propEventId ||
    routeEventId ||
    null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCapacity, setLoadingCapacity] = useState(true);

  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);

  // =========================================================
  // CAPACITY
  // =========================================================

  const [capacity, setCapacity] = useState(null);
  const [event, setEvent] = useState(null);

  // =========================================================
  // RESOLVE EVENT ID
  // =========================================================

  const resolveEventId = async () => {
    if (!eventId) {
      throw new Error(
        "Event ID is missing. Please open registration from a valid event."
      );
    }

    // -------------------------------------------------------
    // Numeric database ID
    // -------------------------------------------------------

    const numericEventId = Number(eventId);

    if (
      Number.isInteger(numericEventId) &&
      numericEventId > 0
    ) {
      return numericEventId;
    }

    // -------------------------------------------------------
    // EVT-101 style ID
    // -------------------------------------------------------

    const response = await fetch(
      `${API_BASE_URL}/api/events`
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Unable to load events from the server."
      );
    }

    const events = Array.isArray(data)
      ? data
      : data?.events || [];

    const requestedId =
      String(eventId)
        .trim()
        .toLowerCase();

    const matchedEvent = events.find(
      (event) => {
        const possibleIds = [
          event?.id,
          event?.event_id,
          event?.eventId,
          event?.code,
          event?.event_code,
          event?.eventCode,
        ];

        return possibleIds.some(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value)
              .trim()
              .toLowerCase() === requestedId
        );
      }
    );

    if (!matchedEvent) {
      throw new Error(
        `Event "${eventId}" was not found in the backend.`
      );
    }

    const resolvedId =
      matchedEvent.id ||
      matchedEvent.event_id;

    if (
      !Number.isInteger(
        Number(resolvedId)
      )
    ) {
      throw new Error(
        "The selected event does not have a valid database ID."
      );
    }

    return Number(resolvedId);
  };

  // =========================================================
  // LOAD EVENT CAPACITY
  // =========================================================
  const loadEventDetails = async () => {
    try {
      const resolvedEventId = await resolveEventId();

      const response = await fetch(
        `${API_BASE_URL}/api/events`
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to load event details."
        );
      }

      const events = Array.isArray(data)
        ? data
        : data?.events || [];

      const selectedEvent = events.find(
        (item) =>
          Number(item?.id) === resolvedEventId ||
          Number(item?.event_id) === resolvedEventId
      );

      if (!selectedEvent) {
        throw new Error(
          "The selected event could not be found."
        );
      }

      setEvent(selectedEvent);
    } catch (err) {
      console.error(
        "Event details loading error:",
        err
      );
    }
  };
  const loadEventCapacity = async () => {
    try {
      setLoadingCapacity(true);
      setError("");

      const resolvedEventId =
        await resolveEventId();

      const response = await fetch(
        `${API_BASE_URL}/api/payment/capacity/${resolvedEventId}`
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to check event capacity."
        );
      }

      setCapacity(data);

      if (data?.is_full) {
        setError(
          "This event is full. Please choose another event."
        );
      }
    } catch (err) {
      console.error(
        "Capacity loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to check event availability."
      );
    } finally {
      setLoadingCapacity(false);
    }
  };

  // =========================================================
  // LOAD CAPACITY WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadEventDetails();
    loadEventCapacity();
  }, [eventId]);

  // =========================================================
  // CREATE DEMO PAYMENT ORDER
  // =========================================================

  const createDemoPaymentOrder = async () => {
    const resolvedEventId =
      await resolveEventId();

    console.log(
      "Original event ID:",
      eventId
    );

    console.log(
      "Resolved backend event ID:",
      resolvedEventId
    );

    const response = await fetch(
      `${API_BASE_URL}/api/payment/create-order`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          event_id: resolvedEventId,

          name: name.trim(),

          email: email.trim(),

          phone: phone.replace(
            /\D/g,
            ""
          ),

          amount: Number(event?.price_inr ?? eventPrice) || 0,
        }),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log(
      "Demo payment order response:",
      data
    );

    // -------------------------------------------------------
    // EVENT FULL
    // -------------------------------------------------------

    if (
      response.status === 409 &&
      data?.event_full
    ) {
      setCapacity((previous) => ({
        ...(previous || {}),
        capacity:
          data?.capacity ??
          previous?.capacity ??
          0,
        registered:
          data?.registered ??
          previous?.registered ??
          0,
        available: 0,
        is_full: true,
      }));

      throw new Error(
        data?.error ||
          "This event is full. Please choose another event."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.details ||
          data?.error ||
          data?.message ||
          `Registration server returned status ${response.status}.`
      );
    }

    return data;
  };

  // =========================================================
  // VERIFY DEMO PAYMENT
  // =========================================================

  const verifyDemoPayment = async (
    registrationId,
    orderId
  ) => {
    const demoPaymentId =
      `DEMO_PAY_${Date.now()}`;

    const response = await fetch(
      `${API_BASE_URL}/api/payment/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          registration_id:
            registrationId,

          razorpay_order_id:
            orderId,

          razorpay_payment_id:
            demoPaymentId,

          razorpay_signature:
            "DEMO_SIGNATURE",
        }),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log(
      "Demo payment verification response:",
      data
    );

    // -------------------------------------------------------
    // EVENT BECAME FULL
    // -------------------------------------------------------

    if (
      response.status === 409 &&
      data?.event_full
    ) {
      setCapacity((previous) => ({
        ...(previous || {}),
        capacity:
          data?.capacity ??
          previous?.capacity ??
          0,
        registered:
          data?.registered ??
          previous?.registered ??
          0,
        available: 0,
        is_full: true,
      }));

      throw new Error(
        data?.error ||
          "This event became full before your payment could be completed. Please choose another event."
      );
    }

    if (!response.ok) {
      const backendDetails =
        data?.details ||
        data?.error ||
        data?.message;

      throw new Error(
        backendDetails ||
          `Registration verification failed with status ${response.status}.`
      );
    }

    return data;
  };

  // =========================================================
  // HANDLE REGISTRATION
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -------------------------------------------------------
    // Do not allow registration while capacity is loading
    // -------------------------------------------------------

    if (loadingCapacity) {
      setError(
        "Checking event availability. Please wait a moment."
      );

      return;
    }

    // -------------------------------------------------------
    // Frontend capacity protection
    // -------------------------------------------------------

    if (capacity?.is_full) {
      setError(
        "This event is full. Please choose another event."
      );

      return;
    }

    // -------------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------------

    if (!name.trim()) {
      setError(
        "Please enter your name."
      );

      return;
    }

    // -------------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------------

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );

      return;
    }

    // -------------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------------

    if (!phone.trim()) {
      setError(
        "Please enter your phone number."
      );

      return;
    }

    const cleanPhone =
      phone.replace(
        /\D/g,
        ""
      );

    if (
      cleanPhone.length !== 10
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    // -------------------------------------------------------
    // EVENT ID VALIDATION
    // -------------------------------------------------------

    if (!eventId) {
      setError(
        "Event information is missing. Please go back and select an event again."
      );

      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------------------
      // CREATE DEMO PAYMENT ORDER
      // -----------------------------------------------------

      const data =
        await createDemoPaymentOrder();

      if (!data) {
        throw new Error(
          "The registration server returned an empty response."
        );
      }

      // -----------------------------------------------------
      // READ REGISTRATION
      // -----------------------------------------------------

      const registrationData =
        data.registration;

      if (!registrationData) {
        throw new Error(
          data.error ||
            data.details ||
            "Registration details were not returned by the server."
        );
      }

      const registrationId =
        registrationData.registration_id;

      if (!registrationId) {
        throw new Error(
          "Registration ID was not returned by the server."
        );
      }

      // -----------------------------------------------------
      // READ ORDER
      // -----------------------------------------------------

      const orderData =
        data.order;

      if (!orderData) {
        throw new Error(
          "Payment order details were not returned by the server."
        );
      }

      const orderId =
        orderData.id;

      if (!orderId) {
        throw new Error(
          "Payment order ID was not returned by the server."
        );
      }

      console.log(
        "Registration ID:",
        registrationId
      );

      console.log(
        "Demo Order ID:",
        orderId
      );

      // -----------------------------------------------------
      // SIMULATE PAYMENT PROCESSING
      // -----------------------------------------------------

      await new Promise(
        (resolve) => {
          setTimeout(
            resolve,
            1200
          );
        }
      );

      // -----------------------------------------------------
      // VERIFY DEMO PAYMENT
      // -----------------------------------------------------

      const verifyData =
        await verifyDemoPayment(
          registrationId,
          orderId
        );

      // -----------------------------------------------------
      // SHOW SUCCESS
      // -----------------------------------------------------

      if (
        !verifyData.registration
      ) {
        throw new Error(
          "Payment was successful, but registration details were not returned."
        );
      }

      setRegistration(
        verifyData.registration
      );

      setLoading(false);

    } catch (err) {
      console.error(
        "Demo payment error:",
        err
      );

      setError(
        err?.message ||
          "Unable to complete registration."
      );

      setLoading(false);
    }
  };

  // =========================================================
  // SUCCESS SCREEN
  // =========================================================

  if (registration) {
    return (
      <div className="event-registration-card">

        <div className="registration-success">

          <div className="success-icon">
            <CheckCircle2 size={30} />
          </div>

          <span className="registration-label">
            REGISTRATION CONFIRMED
          </span>

          <h3>
            You're registered!
          </h3>

          <p>
            Your payment was successful
            and your event registration has
            been completed.
          </p>

          {/* =================================================
              EMAIL CONFIRMATION
          ================================================= */}

          <div className="registration-email-notice">

            <div className="registration-email-icon">
              <Mail size={22} />
            </div>

            <div>
              <strong>
                Your details have been sent to your email
              </strong>

              <p>
                Your registration confirmation and
                entry QR code have been sent to:
              </p>

              <strong>
                {registration.email}
              </strong>

              <p>
                Please check your inbox and keep the
                QR code ready for event check-in.
              </p>
            </div>

          </div>

          {/* =================================================
              REGISTRATION INFORMATION
          ================================================= */}

          <div className="registration-info">

            <div>
              <span>
                Registration ID
              </span>

              <strong>
                {registration.registration_id}
              </strong>
            </div>

            <div>
              <span>
                Name
              </span>

              <strong>
                {registration.name}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {registration.email}
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {registration.phone}
              </strong>
            </div>

            <div>
              <span>
                Payment
              </span>

              <strong className="payment-success">
                <CheckCircle2 size={15} />
                Successful
              </strong>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // REGISTRATION FORM
  // =========================================================

  const isEventFull =
    capacity?.is_full === true;

  return (
    <div className="event-registration-card">

      <div className="registration-header">

        <div>

          <span className="registration-label">
            EVENT REGISTRATION
          </span>

          <h3>
            {event?.name || "Register for this event"}
          </h3>

          <div className="registration-event-details">
            {event?.date && (
              <span>
                📅 {event.date}
              </span>
            )}

            {event?.venue && (
              <span>
                📍 {event.venue}
              </span>
            )}
          </div>

          <p>
            Complete your registration
            to receive your entry QR code
            by email.
          </p>

        </div>

        <div className="registration-price">

          <span>
            Registration
          </span>

          <strong>
            ₹{event?.price_inr ?? eventPrice}
          </strong>

        </div>

      </div>

      {/* =====================================================
          EVENT CAPACITY
      ===================================================== */}

      {capacity && (
        <div
          className={`registration-capacity ${
            isEventFull
              ? "registration-capacity-full"
              : ""
          }`}
        >
          <div>
            <span>
              Event Capacity : &nbsp;
            </span>

            <strong>
              {capacity.registered} / {capacity.capacity}
            </strong>
          </div>

          <div>
            <span>
  {isEventFull
    ? "Status"
    : <>Available Seats&nbsp;:&nbsp;</>}
</span>

            <strong>
              {isEventFull
                ? "FULL"
                : capacity.available}
            </strong>
          </div>
        </div>
      )}

      {/* =====================================================
          FULL EVENT MESSAGE
      ===================================================== */}

      {isEventFull && (
        <div className="registration-error">
          This event is full. Please choose another event.
        </div>
      )}
<br/>
      <form onSubmit={handleSubmit}>

        {/* =================================================
            NAME
        ================================================= */}

        <div className="registration-field">

          <label>
            Full Name
          </label>

          <div className="registration-input">

            <User size={17} />

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              disabled={isEventFull}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =================================================
            EMAIL
        ================================================= */}

        <div className="registration-field">

          <label>
            Email Address
          </label>

          <div className="registration-input">

            <Mail size={17} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              disabled={isEventFull}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =================================================
            PHONE
        ================================================= */}

        <div className="registration-field">

          <label>
            Phone Number
          </label>

          <div className="registration-input">

            <Phone size={17} />

            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phone}
              maxLength={10}
              disabled={isEventFull}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && !isEventFull && (
          <div className="registration-error">
            {error}
          </div>
        )}

        {/* =================================================
            PAYMENT BUTTON
        ================================================= */}

        <button
          type="submit"
          className="registration-pay-button"
          disabled={
            loading ||
            loadingCapacity ||
            isEventFull
          }
        >

          {loadingCapacity ? (
            <>
              <span className="registration-spinner"></span>

              Checking Availability...
            </>
          ) : isEventFull ? (
            <>
              <CheckCircle2 size={18} />

              Event Full
            </>
          ) : loading ? (
            <>
              <span className="registration-spinner"></span>

              Processing Registration...
            </>
          ) : (
            <>
              <CreditCard size={18} />

              Register & Pay ₹
              {event?.price_inr ?? eventPrice}

              <ArrowRight size={17} />
            </>
          )}

        </button>

      </form>

      {/* =================================================
          PAYMENT NOTE
      ================================================= */}

      <div className="registration-secure-note">

        <CheckCircle2 size={15} />

        Secure payment • Registration confirmed

      </div>

    </div>
  );
}

export default EventRegistration;