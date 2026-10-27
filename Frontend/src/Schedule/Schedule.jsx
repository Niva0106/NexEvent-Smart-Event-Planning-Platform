
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { api } from "../Services/Api";

import "./Schedule.css";

function Schedule() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOCAL DATE FORMATTER
  ========================================================= */

  function formatLocalDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* =========================================================
     CONVERT BACKEND DATE
  ========================================================= */

  function convertBackendDate(dateString) {
    if (!dateString) {
      return "";
    }

    const cleanDate = String(dateString).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return cleanDate;
    }

    const match = cleanDate.match(
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
    );

    if (match) {
      const day = match[1].padStart(2, "0");
      const monthName = match[2].toLowerCase();
      const year = match[3];

      const monthMap = {
        january: "01",
        february: "02",
        march: "03",
        april: "04",
        may: "05",
        june: "06",
        july: "07",
        august: "08",
        september: "09",
        october: "10",
        november: "11",
        december: "12",
      };

      const month = monthMap[monthName];

      if (month) {
        return `${year}-${month}-${day}`;
      }
    }

    return "";
  }

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  function formatTime(time) {
    if (!time) {
      return "";
    }

    const cleanTime = String(time).trim();

    if (!cleanTime.includes(":")) {
      return cleanTime;
    }

    const [hourString, minute] = cleanTime.split(":");

    let hour = Number(hourString);

    if (Number.isNaN(hour)) {
      return cleanTime;
    }

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
  }

  /* =========================================================
     FETCH EVENTS
  ========================================================= */

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.events.getAll();

      const backendEvents = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.events)
        ? response.events
        : [];

      const formattedEvents = backendEvents
        .map((event) => {
          const date = convertBackendDate(event.date);

          const resources = String(event.resources || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

          return {
            id: event.id || event.event_id,

            event_id: event.event_id || event.id,

            name:
              event.name ||
              event.event_name ||
              event.title ||
              "Untitled Event",

            date,

            startTime:
              event.start_time ||
              event.startTime ||
              "09:00",

            endTime:
              event.end_time ||
              event.endTime ||
              "17:00",

            venue:
              event.venue ||
              event.venue_name ||
              event.venueName ||
              "Not specified",

            city:
              event.city ||
              event.location_city ||
              "",

            attendees:
              Number(
                event.attendees ||
                  event.attendee_count ||
                  event.attendeeCount ||
                  0
              ) || 0,

            status: event.status || "Planning",

            resources,
          };
        })
        .filter((event) => event.date);

      console.log("Schedule events:", formattedEvents);

      setEvents(formattedEvents);

      if (formattedEvents.length > 0) {
        setSelectedDate(formattedEvents[0].date);
      } else {
        setSelectedDate(formatLocalDate(new Date()));
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);

      setError(err.message || "Failed to load schedule.");

      setSelectedDate(formatLocalDate(new Date()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* =========================================================
     CALENDAR DAYS
  ========================================================= */

  const days = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const baseDate = new Date(`${selectedDate}T00:00:00`);

    if (Number.isNaN(baseDate.getTime())) {
      return [];
    }

    baseDate.setDate(baseDate.getDate() - 2);

    const result = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);

      date.setDate(baseDate.getDate() + i);

      const iso = formatLocalDate(date);

      result.push({
        iso,

        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),

        number: date.getDate(),

        month: date.toLocaleDateString("en-US", {
          month: "short",
        }),
      });
    }

    return result;
  }, [selectedDate]);

  /* =========================================================
     EVENTS FOR SELECTED DATE
  ========================================================= */

  const selectedDayEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) =>
      String(a.startTime).localeCompare(
        String(b.startTime)
      )
    );

  /* =========================================================
     PREVIOUS DAY
  ========================================================= */

  const previousDay = () => {
    if (!selectedDate) {
      return;
    }

    const date = new Date(`${selectedDate}T00:00:00`);

    date.setDate(date.getDate() - 1);

    setSelectedDate(formatLocalDate(date));
  };

  /* =========================================================
     NEXT DAY
  ========================================================= */

  const nextDay = () => {
    if (!selectedDate) {
      return;
    }

    const date = new Date(`${selectedDate}T00:00:00`);

    date.setDate(date.getDate() + 1);

    setSelectedDate(formatLocalDate(date));
  };

  /* =========================================================
     TODAY
  ========================================================= */

  const goToday = () => {
    const today = formatLocalDate(new Date());

    setSelectedDate(today);
  };

  /* =========================================================
     SAFE SELECTED DATE
  ========================================================= */

  const selectedDateObject = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="schedule-page">
      {/* =====================================================
          BUBBLE BACKGROUND
      ====================================================== */}

      <div className="schedule-bubble bubble-one" />
      <div className="schedule-bubble bubble-two" />
      <div className="schedule-bubble bubble-three" />
      <div className="schedule-bubble bubble-four" />
      <div className="schedule-bubble bubble-five" />
      <div className="schedule-bubble bubble-six" />

      <div className="schedule-glow glow-one" />
      <div className="schedule-glow glow-two" />

      <div className="schedule-content">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="schedule-header">
          <div className="schedule-header-text">
            <span className="schedule-eyebrow">
              EVENT TIMELINE
            </span>

            <h1>Schedule</h1>

            <p>
              View your events, venues, and resource
              coordination across the event timeline.
            </p>
          </div>

          <button
            className="today-btn"
            onClick={goToday}
          >
            <CalendarDays size={17} />
            Today
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="schedule-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            CALENDAR
        ====================================================== */}

        <section className="calendar-card">
          <div className="calendar-navigation">
            <button
              className="calendar-arrow"
              onClick={previousDay}
              aria-label="Previous day"
            >
              <ChevronLeft size={19} />
            </button>

            <div className="calendar-title">
              <strong>
                {selectedDateObject
                  ? selectedDateObject.toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Loading..."}
              </strong>

              <span>
                {selectedDayEvents.length} event
                {selectedDayEvents.length !== 1
                  ? "s"
                  : ""}{" "}
                scheduled
              </span>
            </div>

            <button
              className="calendar-arrow"
              onClick={nextDay}
              aria-label="Next day"
            >
              <ChevronRight size={19} />
            </button>
          </div>

          {/* ===================================================
              DAY STRIP
          =================================================== */}

          <div className="day-strip">
            {days.map((day) => (
              <button
                key={day.iso}
                className={`day-item ${
                  selectedDate === day.iso
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedDate(day.iso)
                }
              >
                <span>{day.day}</span>

                <strong>{day.number}</strong>

                <small>{day.month}</small>

                {events.some(
                  (event) => event.date === day.iso
                ) && <i />}
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            TIMELINE
        ====================================================== */}

        <section className="timeline-section">
          <div className="timeline-heading">
            <div>
              <span className="section-label">
                DAILY SCHEDULE
              </span>

              <h2>
                {selectedDateObject
                  ? selectedDateObject.toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Loading..."}
              </h2>
            </div>

            {/* NO CONFLICT LEGEND */}
          </div>

          {/* ===================================================
              LOADING
          =================================================== */}

          {loading ? (
            <div className="empty-day">
              <div className="empty-icon">
                <CalendarDays size={35} />
              </div>

              <h3>Loading schedule...</h3>

              <p>
                Fetching events from the backend.
              </p>
            </div>
          ) : (
            <div className="timeline">
              {/* ===============================================
                  NO EVENTS
              =============================================== */}

              {selectedDayEvents.length === 0 && (
                <div className="empty-day">
                  <div className="empty-icon">
                    <CalendarDays size={35} />
                  </div>

                  <h3>No events scheduled</h3>

                  <p>
                    There are no events planned for
                    this date.
                  </p>
                </div>
              )}

              {/* ===============================================
                  EVENT CARDS
              =============================================== */}

              {selectedDayEvents.map((event, index) => (
                <div
                  className="timeline-row"
                  key={event.id}
                  style={{
                    "--event-index": index,
                  }}
                >
                  {/* TIME */}

                  <div className="timeline-time">
                    <strong>
                      {formatTime(event.startTime)}
                    </strong>

                    <span>
                      {formatTime(event.endTime)}
                    </span>
                  </div>

                  {/* TIMELINE LINE */}

                  <div className="timeline-line">
                    <div className="timeline-dot" />
                  </div>

                  {/* EVENT CARD */}

                  <button
                    className="schedule-event-card"
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    <div className="event-card-top">
                      <div className="event-badges">
                        <span
                          className={`event-status ${String(
                            event.status
                          ).toLowerCase()}`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="event-clock-icon">
                        <Clock3 size={17} />
                      </div>
                    </div>

                    <h3>{event.name}</h3>

                    <div className="event-card-details">
                      <span>
                        <MapPin size={14} />
                        {event.venue}
                      </span>

                      <span>
                        <Users size={14} />
                        {event.attendees} attendees
                      </span>
                    </div>

                    <div className="resource-preview">
                      <Package size={14} />

                      {event.resources.length > 0 ? (
                        event.resources
                          .slice(0, 3)
                          .map((resource) => (
                            <span key={resource}>
                              {resource}
                            </span>
                          ))
                      ) : (
                        <span>No resources</span>
                      )}

                      {event.resources.length > 3 && (
                        <span>
                          +
                          {event.resources.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          EVENT DETAILS MODAL
      ====================================================== */}

      {selectedEvent && (
        <div
          className="schedule-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="schedule-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-decoration modal-bubble-one" />
            <div className="modal-decoration modal-bubble-two" />

            <div className="modal-top">
              <div>
                <span className="section-label">
                  EVENT DETAILS
                </span>

                <h2>{selectedEvent.name}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedEvent(null)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* EVENT INFORMATION */}

            <div className="modal-event-info">
              <div className="detail-item">
                <div className="detail-icon">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <span>Date</span>

                  <strong>
                    {new Date(
                      `${selectedEvent.date}T00:00:00`
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </strong>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Time</span>

                  <strong>
                    {formatTime(
                      selectedEvent.startTime
                    )}{" "}
                    –{" "}
                    {formatTime(
                      selectedEvent.endTime
                    )}
                  </strong>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Venue</span>

                  <strong>
                    {selectedEvent.venue}
                  </strong>

                  {selectedEvent.city && (
                    <small>
                      {selectedEvent.city}
                    </small>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Attendees</span>

                  <strong>
                    {selectedEvent.attendees}
                  </strong>
                </div>
              </div>
            </div>

            {/* RESOURCES */}

            <div className="modal-resources">
              <span className="section-label">
                ALLOCATED RESOURCES
              </span>

              <div className="modal-resource-list">
                {selectedEvent.resources.length > 0 ? (
                  selectedEvent.resources.map(
                    (resource) => (
                      <div
                        key={resource}
                        className="modal-resource"
                      >
                        <Package size={15} />
                        {resource}
                      </div>
                    )
                  )
                ) : (
                  <div className="modal-resource">
                    No resources allocated yet
                  </div>
                )}
              </div>
            </div>

            <button
              className="modal-done"
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
