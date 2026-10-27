
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Plus,
  Search,
  Trash2,
  X,
  CircleAlert,
  CircleCheck,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../Services/Api";
import "./Events.css";

const initialForm = {
  name: "",
  date: "",
  start_time: "",
  end_time: "",
  venue: "",
  city: "",
  attendees: "",
  price_inr: "",
  status: "Planning",
  resources: "",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Venue conflict returned by Flask.
  const [conflict, setConflict] = useState(null);

  // ---------------------------------------------------------
  // LOAD EVENTS
  // ---------------------------------------------------------

  const loadEvents = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await api.events.getAll();

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load events:", error);

      setPageError(
        error?.message ||
          "Unable to load events. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ---------------------------------------------------------
  // FILTER EVENTS
  // ---------------------------------------------------------

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        String(event.name || "")
          .toLowerCase()
          .includes(query) ||
        String(event.venue || "")
          .toLowerCase()
          .includes(query) ||
        String(event.city || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        String(event.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  // ---------------------------------------------------------
  // STATS
  // ---------------------------------------------------------

  const stats = useMemo(() => {
    const total = events.length;

    const confirmed = events.filter(
      (event) =>
        String(event.status || "").toLowerCase() === "confirmed"
    ).length;

    const planning = events.filter(
      (event) =>
        String(event.status || "").toLowerCase() === "planning"
    ).length;

    const attendees = events.reduce(
      (totalAttendees, event) =>
        totalAttendees + Number(event.attendees || 0),
      0
    );

    return {
      total,
      confirmed,
      planning,
      attendees,
    };
  }, [events]);

  // ---------------------------------------------------------
  // FORM CHANGE
  // ---------------------------------------------------------

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // If the user changes any conflict-related field,
    // remove the old conflict message.
    if (
      name === "venue" ||
      name === "date" ||
      name === "start_time" ||
      name === "end_time"
    ) {
      setConflict(null);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // CREATE EVENT
  // ---------------------------------------------------------

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    setSaving(true);
    setConflict(null);

    try {
      const payload = {
        name: form.name.trim(),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        venue: form.venue.trim(),
        city: form.city.trim(),
        attendees: Number(form.attendees || 0),
        price_inr: Number(form.price_inr || 0),
        status: form.status,
        resources: form.resources.trim(),
      };

      const createdEvent = await api.events.create(payload);

      console.log("Event created:", createdEvent);

      // Add returned event immediately if backend returns it.
      if (createdEvent) {
        setEvents((previous) => [
          ...previous,
          createdEvent,
        ]);
      } else {
        // Otherwise reload from backend.
        await loadEvents();
      }

      setForm(initialForm);
      setConflict(null);
      setShowModal(false);

      alert("Event created successfully.");
    } catch (error) {
      console.error("Create event error:", error);

      // -------------------------------------------------------
      // IMPORTANT:
      // Flask should return HTTP 409 for venue conflict.
      // -------------------------------------------------------

      if (Number(error?.status) === 409) {
        const conflictData =
          error?.data?.conflict ||
          error?.response?.data?.conflict ||
          null;

        if (
          conflictData &&
          typeof conflictData === "object"
        ) {
          setConflict(conflictData);
        } else {
          setConflict({
            message:
              error?.data?.error ||
              error?.message ||
              "A venue conflict was detected.",
          });
        }

        // Keep modal open.
        setShowModal(true);

        return;
      }

      alert(
        error?.message ||
          "Unable to create event."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // DELETE EVENT
  // ---------------------------------------------------------

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.events.delete(event.id);

      setEvents((previous) =>
        previous.filter(
          (item) => item.id !== event.id
        )
      );

      alert("Event deleted successfully.");
    } catch (error) {
      console.error("Delete event error:", error);

      alert(
        error?.message ||
          "Unable to delete event."
      );
    }
  };

  // ---------------------------------------------------------
  // MODAL
  // ---------------------------------------------------------

  const openCreateModal = () => {
    setForm(initialForm);
    setConflict(null);
    setShowModal(true);
  };

  const closeCreateModal = () => {
    if (saving) {
      return;
    }

    setForm(initialForm);
    setConflict(null);
    setShowModal(false);
  };

  // ---------------------------------------------------------
  // VIEW EVENT
  // ---------------------------------------------------------

  const handleViewEvent = (event) => {
    navigate(`/events/${event.id}`);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="events-page">
      <div className="events-content">

        {/* HEADER */}
        <div className="events-header">
          <div>
            <p className="events-eyebrow">
              EVENT MANAGEMENT
            </p>

            <h1>Events</h1>

            <p>
              Create, monitor and manage all your
              events from one place.
            </p>
          </div>

          <button
            type="button"
            className="events-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>

        {/* STATS */}
        <div className="events-stats">

          <div className="event-stat-card">
            <div className="event-stat-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>Total Events</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="event-stat-card">
            <div className="event-stat-icon">
              <CircleCheck size={20} />
            </div>

            <div>
              <span>Confirmed</span>
              <strong>{stats.confirmed}</strong>
            </div>
          </div>

          <div className="event-stat-card">
            <div className="event-stat-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Planning</span>
              <strong>{stats.planning}</strong>
            </div>
          </div>

          <div className="event-stat-card">
            <div className="event-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Total Attendees</span>
              <strong>
                {stats.attendees.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

        </div>

        {/* SEARCH + FILTER */}
        <div className="events-toolbar">

          <div className="events-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search events, venues or cities..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="events-filter">
            {["All", "Planning", "Confirmed"].map(
              (status) => (
                <button
                  type="button"
                  key={status}
                  className={
                    statusFilter === status
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>
              )
            )}
          </div>

        </div>

        {/* PAGE ERROR */}
        {pageError && (
          <div className="events-page-error">
            <CircleAlert size={18} />

            <span>{pageError}</span>

            <button
              type="button"
              onClick={loadEvents}
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="events-loading">
            Loading events...
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          filteredEvents.length === 0 && (
            <div className="events-empty">
              <CalendarDays size={40} />

              <h2>No events found</h2>

              <p>
                Create your first event or change
                the search/filter.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
              >
                <Plus size={17} />
                Create Event
              </button>
            </div>
          )}

        {/* EVENTS */}
        {!loading &&
          filteredEvents.length > 0 && (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <div
                  className="event-card"
                  key={event.id}
                >

                  <div className="event-card-top">

                    <span
                      className={`event-status ${
                        String(
                          event.status || ""
                        ).toLowerCase() ===
                        "confirmed"
                          ? "confirmed"
                          : "planning"
                      }`}
                    >
                      {String(
                        event.status || ""
                      ).toLowerCase() ===
                      "confirmed" ? (
                        <CircleCheck size={13} />
                      ) : (
                        <Clock3 size={13} />
                      )}

                      {event.status ||
                        "Planning"}
                    </span>

                    <span>
                      {event.event_id ||
                        `EVT-${event.id}`}
                    </span>

                  </div>

                  <div className="event-card-heading">

                    <div className="event-title-icon">
                      <CalendarDays size={22} />
                    </div>

                    <div>
                      <h2>{event.name}</h2>

                      <p>
                        {event.venue ||
                          "Venue not specified"}
                      </p>
                    </div>

                  </div>

                  <div className="event-card-info">

                    <div className="event-info-row">
                      <CalendarDays size={16} />

                      <span>
                        {formatDate(event.date)}
                      </span>
                    </div>

                    <div className="event-info-row">
                      <Clock3 size={16} />

                      <span>
                        {event.start_time || "--"}
                        {" - "}
                        {event.end_time || "--"}
                      </span>
                    </div>

                    <div className="event-info-row">
                      <MapPin size={16} />

                      <span>
                        {event.city ||
                          "Location not specified"}
                      </span>
                    </div>

                    <div className="event-info-row">
                      <Users size={16} />

                      <span>
                        {Number(
                          event.attendees || 0
                        ).toLocaleString("en-IN")}
                        {" attendees"}
                      </span>
                    </div>

                  </div>

                  <div className="event-card-footer">

                    <span>
                      ₹
                      {Number(
                        event.price_inr || 0
                      ).toLocaleString("en-IN")}
                    </span>

                    <span>
                      {event.venue || "Venue"}
                    </span>

                  </div>

                  <div className="event-actions">

                    <button
                      type="button"
                      className="event-action-button"
                      onClick={() =>
                        handleViewEvent(event)
                      }
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
                      type="button"
                      className="event-action-button delete-action"
                      onClick={() =>
                        handleDelete(event)
                      }
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}
      </div>

      {/* =====================================================
          CREATE EVENT MODAL
          ===================================================== */}

      {showModal && (
        <div
          className="event-modal-backdrop"
          onMouseDown={closeCreateModal}
        >
          <div
            className="event-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="event-modal-header">

              <div>
                <p className="events-eyebrow">
                  NEW EVENT
                </p>

                <h2>Create Event</h2>

                <p>
                  Enter the event information below.
                </p>
              </div>

              <button
                type="button"
                className="event-modal-close"
                onClick={closeCreateModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================================
                CONFLICT ALERT
                ================================================= */}

            {conflict && (
              <div className="event-conflict-alert">

                <div className="event-conflict-icon">
                  <CircleAlert size={22} />
                </div>

                <div className="event-conflict-content">

                  <strong>
                    Venue Conflict Detected
                  </strong>

                  <p>
                    This venue is already booked
                    during the selected date and
                    time.
                  </p>

                  <div className="event-conflict-details">

                    <div>
                      <span>
                        Existing Event
                      </span>

                      <strong>
                        {conflict.name ||
                          conflict.existing_event ||
                          "Existing event"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Venue
                      </span>

                      <strong>
                        {conflict.venue ||
                          form.venue ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          conflict.date ||
                            form.date
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Time
                      </span>

                      <strong>
                        {conflict.start_time ||
                          "--"}
                        {" - "}
                        {conflict.end_time ||
                          "--"}
                      </strong>
                    </div>

                  </div>

                  {conflict.message && (
                    <p className="event-conflict-message">
                      {conflict.message}
                    </p>
                  )}

                  <span className="event-conflict-tip">
                    Please choose another venue
                    or change the event time.
                  </span>

                </div>

                <button
                  type="button"
                  className="event-conflict-close"
                  onClick={() =>
                    setConflict(null)
                  }
                  aria-label="Close conflict"
                >
                  <X size={17} />
                </button>

              </div>
            )}

            {/* FORM */}
            <form
              className="event-form"
              onSubmit={handleCreateEvent}
            >

              <div className="event-form-grid">

                <label>
                  <span>Event Name</span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Tech Fest 2026"
                    required
                  />
                </label>

                <label>
                  <span>City</span>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Visakhapatnam"
                  />
                </label>

                <label>
                  <span>Date</span>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={
                      handleInputChange
                    }
                    required
                  />
                </label>

                <label>
                  <span>Venue</span>

                  <input
                    type="text"
                    name="venue"
                    value={form.venue}
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Main Auditorium"
                    required
                  />
                </label>

                <label>
                  <span>Start Time</span>

                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={
                      handleInputChange
                    }
                    required
                  />
                </label>

                <label>
                  <span>End Time</span>

                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={
                      handleInputChange
                    }
                    required
                  />
                </label>

                <label>
                  <span>Attendees</span>

                  <input
                    type="number"
                    min="0"
                    name="attendees"
                    value={form.attendees}
                    onChange={
                      handleInputChange
                    }
                    placeholder="350"
                  />
                </label>

                <label>
                  <span>Price (INR)</span>

                  <input
                    type="number"
                    min="0"
                    name="price_inr"
                    value={form.price_inr}
                    onChange={
                      handleInputChange
                    }
                    placeholder="500"
                  />
                </label>

                <label>
                  <span>Status</span>

                  <select
                    name="status"
                    value={form.status}
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="Planning">
                      Planning
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>
                  </select>
                </label>

                <label className="event-form-full">
                  <span>Resources</span>

                  <input
                    type="text"
                    name="resources"
                    value={form.resources}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Projector, Microphone, Staff"
                  />
                </label>

              </div>

              <div className="event-form-actions">

                <button
                  type="button"
                  className="event-cancel-button"
                  onClick={closeCreateModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="events-primary-button"
                  disabled={saving}
                >
                  <Plus size={17} />

                  {saving
                    ? "Creating..."
                    : "Create Event"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
