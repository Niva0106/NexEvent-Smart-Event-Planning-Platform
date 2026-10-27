import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

import { api } from "../Services/Api";

import "./Attendance.css";


function Attendance() {

  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] =
    useState("");

  const [selectedEventBackendId, setSelectedEventBackendId] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [scanning, setScanning] =
    useState(false);


  /* =========================================================
     LOAD EVENTS
     ========================================================= */

  useEffect(() => {

    const loadEvents = async () => {

      try {

        const data =
          await api.events.getAll();

        const eventList =
          Array.isArray(data)
            ? data
            : data?.events || [];

        setEvents(eventList);

      } catch (err) {

        setError(
          err.message ||
          "Unable to load events."
        );

      }

    };

    loadEvents();

  }, []);


  /* =========================================================
     START QR SCANNER
     ========================================================= */

  useEffect(() => {

    if (!selectedEventBackendId) {
      return;
    }

    setResult(null);
    setError("");
    setScanning(true);


    const scanner =
      new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250,
          },

          rememberLastUsedCamera: true,
        },

        false
      );


    const handleSuccess =
      async (decodedText) => {

        try {

          /*
           * The current NexEvent QR contains
           * the registration ID directly.
           *
           * Example:
           * REG-20261008-F5B33D
           *
           * This also supports a future
           * multi-line QR format.
           */

          let registrationId =
            decodedText.trim();


          if (
            decodedText.includes(
              "REGISTRATION_ID="
            )
          ) {

            const match =
              decodedText.match(
                /REGISTRATION_ID=([^\r\n]+)/
              );

            if (match) {

              registrationId =
                match[1].trim();

            }

          }


          /*
           * Stop the camera scanner before
           * sending the check-in request.
           */
          await scanner.clear();

          setScanning(false);


          /*
           * Debug information.
           *
           * Example:
           *
           * selectedEvent:
           * EVT-102
           *
           * selectedEventBackendId:
           * 2
           *
           * The backend needs the numeric
           * database event ID.
           */

          console.log(
            "CHECK-IN VALUES:",
            registrationId,
            selectedEvent,
            selectedEventBackendId
          );


          /*
           * Send the registration ID and
           * INTERNAL database event ID.
           *
           * Example:
           *
           * EVT-102 -> 2
           */

          const response =
            await api.attendance.checkIn(
              registrationId,
              selectedEventBackendId
            );


          setResult(response);

          setError("");


        } catch (err) {

          /*
           * Make sure the scanner is stopped
           * even if the API request fails.
           */

          await scanner.clear()
            .catch(() => {});


          setScanning(false);

          setResult(null);

          setError(
            err.message ||
            "Unable to check in participant."
          );

        }

      };


    const handleFailure = () => {

      /*
       * QR scanning produces many normal
       * "no QR found" messages while scanning.
       *
       * We intentionally ignore them.
       */

    };


    scanner.render(
      handleSuccess,
      handleFailure
    );


    /*
     * Cleanup when the selected event
     * changes or the page is left.
     */

    return () => {

      scanner.clear()
        .catch(() => {});

    };

  }, [selectedEventBackendId]);


  /* =========================================================
     EVENT SELECTION
     ========================================================= */

  const handleEventChange = (e) => {

    const publicEventId =
      e.target.value;


    setSelectedEvent(
      publicEventId
    );

    setResult(null);
    setError("");


    /*
     * Find the selected event in the
     * list returned by the backend.
     */

    const selectedEventObject =
      events.find(
        (event) =>
          String(
            event.event_id
          ) === String(
            publicEventId
          )
      );


    /*
     * No event selected.
     */

    if (!selectedEventObject) {

      setSelectedEventBackendId("");

      return;

    }


    /*
     * IMPORTANT:
     *
     * The frontend/public event ID can be:
     *
     * EVT-102
     *
     * But registrations and attendance
     * use the internal database ID:
     *
     * 2
     *
     * The events API currently returns:
     *
     * {
     *   event_id: "EVT-102",
     *   id: 2,
     *   name: "AI Workshop"
     * }
     */

    const backendEventId =
      selectedEventObject.id ??
      selectedEventObject.database_id ??
      selectedEventObject.backend_event_id;


    if (!backendEventId) {

      setSelectedEventBackendId("");

      setError(
        "Unable to find the internal event ID."
      );

      return;

    }


    setSelectedEventBackendId(
      String(backendEventId)
    );

  };


  /* =========================================================
     START NEXT SCAN
     ========================================================= */

  const handleScanNext = () => {

    setResult(null);
    setError("");


    /*
     * Clear the backend event ID first.
     *
     * This causes the scanner effect to stop.
     */

    setSelectedEventBackendId("");


    /*
     * Start the scanner again after the
     * previous scanner has been cleaned up.
     */

    setTimeout(() => {

      const selectedEventObject =
        events.find(
          (event) =>
            String(
              event.event_id
            ) === String(
              selectedEvent
            )
        );


      if (!selectedEventObject) {
        return;
      }


      const backendEventId =
        selectedEventObject.id ??
        selectedEventObject.database_id ??
        selectedEventObject.backend_event_id;


      if (!backendEventId) {

        setError(
          "Unable to find the internal event ID."
        );

        return;

      }


      setSelectedEventBackendId(
        String(backendEventId)
      );

    }, 100);

  };


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="attendance-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="attendance-header">

        <div>

          <h1>
            Attendance Check-in
          </h1>

          <p>
            Scan participant QR codes at the
            event entrance.
          </p>

        </div>

      </div>


      {/* =====================================================
          EVENT SELECT
          ===================================================== */}

      <div className="attendance-card">

        <label>
          Select Event
        </label>


        <select
          value={selectedEvent}
          onChange={handleEventChange}
        >

          <option value="">
            Select an event
          </option>


          {events.map((event) => (

            <option
              key={
                event.event_id ||
                event.id
              }
              value={
                event.event_id
              }
            >

              {event.name}

            </option>

          ))}

        </select>

      </div>


      {/* =====================================================
          SCANNER
          ===================================================== */}

      {selectedEventBackendId && !result && (

        <div className="attendance-card">

          <h2>
            Scan QR Code
          </h2>


          <p>
            Ask the participant to show
            their NexEvent QR code.
          </p>


          <div
            id="qr-reader"
            className="qr-reader"
          />


          {scanning && (

            <p className="scanner-status">
              Camera is ready. Point it at the QR code.
            </p>

          )}

        </div>

      )}


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {result?.success && (

        <div className="attendance-success">


          <div className="success-icon">
            ✓
          </div>


          <h2>
            Check-in Successful
          </h2>


          <h3>
            {result.participant?.name}
          </h3>


          <p>
            Registration ID:
            {" "}
            {result.participant?.registration_id}
          </p>


          <div className="attendance-count">


            <div>

              <strong>
                {result.attendance?.checked_in}
              </strong>

              <span>
                Checked In
              </span>

            </div>


            <div>

              <strong>
                {result.attendance?.registered}
              </strong>

              <span>
                Registered
              </span>

            </div>


            <div>

              <strong>
                {result.attendance?.attendance_rate}%
              </strong>

              <span>
                Attendance
              </span>

            </div>


          </div>


          <button
            onClick={handleScanNext}
          >
            Scan Next Participant
          </button>


        </div>

      )}


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="attendance-error">


          <strong>
            Check-in failed
          </strong>


          <p>
            {error}
          </p>


          <button
            onClick={handleScanNext}
          >
            Try Again
          </button>


        </div>

      )}


    </div>

  );

}


export default Attendance;