import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";
import { api } from "../Services/Api";
import "./Insights.css";

function Insights() {
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsResult, vendorsResult] = await Promise.allSettled([
        api.events.getAll(),
        api.vendors.getAll(),
      ]);

      let eventList = [];
      let vendorList = [];

      if (eventsResult.status === "fulfilled") {
        const data = eventsResult.value;

        if (Array.isArray(data)) {
          eventList = data;
        } else if (Array.isArray(data?.events)) {
          eventList = data.events;
        } else if (Array.isArray(data?.data)) {
          eventList = data.data;
        }
      }

      if (vendorsResult.status === "fulfilled") {
        const data = vendorsResult.value;

        if (Array.isArray(data)) {
          vendorList = data;
        } else if (Array.isArray(data?.vendors)) {
          vendorList = data.vendors;
        } else if (Array.isArray(data?.data)) {
          vendorList = data.data;
        }
      }

      setEvents(eventList);
      setVendors(vendorList);

      if (
        eventsResult.status === "rejected" &&
        vendorsResult.status === "rejected"
      ) {
        throw eventsResult.reason;
      }
    } catch (err) {
      console.error("Insights loading error:", err);
      setError(err?.message || "Unable to load insights.");
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (event) =>
    event?.name ||
    event?.event_name ||
    event?.eventName ||
    event?.title ||
    "Unnamed Event";

  const getEventDate = (event) =>
    event?.date ||
    event?.event_date ||
    event?.eventDate ||
    event?.start_date ||
    null;

  const getNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(String(value).replace(/[^0-9.-]/g, ""));

    return Number.isFinite(number) ? number : 0;
  };

  const getBudget = (event) =>
    getNumber(
      event?.budget ??
        event?.total_budget ??
        event?.totalBudget ??
        event?.estimated_budget ??
        event?.estimatedBudget ??
        event?.cost
    );

  const getRegistrations = (event) =>
    getNumber(
      event?.registrations ??
        event?.registration_count ??
        event?.registrationCount ??
        event?.attendees ??
        event?.participants ??
        event?.registered_users
    );

  const getEventStatus = (event) => {
    const status = String(
      event?.status || event?.event_status || ""
    ).toLowerCase();

    if (status.includes("cancel")) {
      return "cancelled";
    }

    if (status.includes("complete")) {
      return "completed";
    }

    if (
      status.includes("ongoing") ||
      status.includes("progress") ||
      status.includes("active")
    ) {
      return "ongoing";
    }

    const dateValue = getEventDate(event);

    if (dateValue) {
      const date = new Date(dateValue);

      if (!Number.isNaN(date.getTime())) {
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date < today) {
          return "completed";
        }

        if (date.getTime() === today.getTime()) {
          return "ongoing";
        }
      }
    }

    return "upcoming";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date not specified";
    }

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

  const formatCurrency = (value) =>
    `₹${getNumber(value).toLocaleString("en-IN")}`;

  const statistics = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    let cancelled = 0;
    let totalBudget = 0;
    let totalRegistrations = 0;

    events.forEach((event) => {
      const status = getEventStatus(event);

      if (status === "upcoming") upcoming++;
      if (status === "ongoing") ongoing++;
      if (status === "completed") completed++;
      if (status === "cancelled") cancelled++;

      totalBudget += getBudget(event);
      totalRegistrations += getRegistrations(event);
    });

    const totalEvents = events.length;

    return {
      totalEvents,
      upcoming,
      ongoing,
      completed,
      cancelled,
      totalBudget,
      totalRegistrations,
      averageRegistrations:
        totalEvents > 0
          ? Math.round(totalRegistrations / totalEvents)
          : 0,
      averageBudget:
        totalEvents > 0
          ? Math.round(totalBudget / totalEvents)
          : 0,
      completionRate:
        totalEvents > 0
          ? Math.round((completed / totalEvents) * 100)
          : 0,
      totalVendors: vendors.length,
    };
  }, [events, vendors]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => {
        const status = getEventStatus(event);

        return status === "upcoming" || status === "ongoing";
      })
      .sort((a, b) => {
        const dateA = new Date(getEventDate(a) || 0).getTime();
        const dateB = new Date(getEventDate(b) || 0).getTime();

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [events]);

  const statusItems = [
    {
      label: "Upcoming",
      value: statistics.upcoming,
      icon: CalendarDays,
      className: "upcoming",
    },
    {
      label: "Ongoing",
      value: statistics.ongoing,
      icon: Clock3,
      className: "ongoing",
    },
    {
      label: "Completed",
      value: statistics.completed,
      icon: CheckCircle2,
      className: "completed",
    },
    {
      label: "Cancelled",
      value: statistics.cancelled,
      icon: AlertCircle,
      className: "cancelled",
    },
  ];

  const bubbles = [
    {
      className: "insights-bubble bubble-one",
      animate: {
        x: [0, 65, -25, 0],
        y: [0, -45, 25, 0],
        scale: [1, 1.12, 0.95, 1],
      },
      duration: 7,
    },
    {
      className: "insights-bubble bubble-two",
      animate: {
        x: [0, -55, 30, 0],
        y: [0, 35, -30, 0],
        scale: [1, 0.93, 1.1, 1],
      },
      duration: 8,
    },
    {
      className: "insights-bubble bubble-three",
      animate: {
        x: [0, 50, -40, 0],
        y: [0, -55, 30, 0],
        scale: [1, 1.1, 0.96, 1],
      },
      duration: 6.5,
    },
    {
      className: "insights-bubble bubble-four",
      animate: {
        x: [0, -45, 35, 0],
        y: [0, -30, 45, 0],
        scale: [1, 0.94, 1.08, 1],
      },
      duration: 9,
    },
    {
      className: "insights-bubble bubble-five",
      animate: {
        x: [0, 60, -35, 0],
        y: [0, 40, -45, 0],
        scale: [1, 1.08, 0.94, 1],
      },
      duration: 7.5,
    },
    {
      className: "insights-bubble bubble-six",
      animate: {
        x: [0, -40, 35, 0],
        y: [0, 50, -35, 0],
        scale: [1, 0.92, 1.1, 1],
      },
      duration: 8.5,
    },
    {
      className: "insights-bubble bubble-seven",
      animate: {
        x: [0, 50, -35, 0],
        y: [0, -35, 45, 0],
        scale: [1, 1.1, 0.95, 1],
      },
      duration: 6,
    },
  ];

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-bubble-field">
          {bubbles.map((bubble, index) => (
            <motion.span
              key={index}
              className={bubble.className}
              animate={bubble.animate}
              transition={{
                duration: bubble.duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="insights-loading">
          <div className="insights-spinner"></div>
          <h2>Loading insights...</h2>
          <p>Preparing your event analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      {/* MOVING BUBBLES */}
      <div className="insights-bubble-field">
        {bubbles.map((bubble, index) => (
          <motion.span
            key={index}
            className={bubble.className}
            animate={bubble.animate}
            transition={{
              duration: bubble.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* HEADER */}
      <motion.div
        className="insights-header"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="insights-title-row">
          <motion.div
            className="insights-title-icon"
            animate={{
              y: [0, -5, 0],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <BarChart3 size={24} />
          </motion.div>

          <div>
            <h1 className="Title">Insights</h1>

            <p className="Para">
              Understand your event performance at a glance.
            </p>
          </div>
        </div>

        <motion.button
          className="insights-refresh-button"
          onClick={loadInsights}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <TrendingUp size={17} />
          Refresh
        </motion.button>
      </motion.div>

      {/* ERROR */}
      {error && (
        <motion.div
          className="insights-error"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />

          <div>
            <strong>Some data could not be loaded</strong>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* SUMMARY CARDS */}
      <div className="insights-summary-grid">
        <motion.div
          className="insight-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          whileHover={{ y: -7 }}
        >
          <div className="insight-card-top">
            <div className="insight-icon purple">
              <CalendarDays size={22} />
            </div>

            <span className="insight-card-label">
              Total Events
            </span>
          </div>

          <div className="insight-card-value">
            {statistics.totalEvents}
          </div>

          <div className="insight-card-footer">
            <span>Events in your system</span>
            <ArrowUpRight size={15} />
          </div>
        </motion.div>

        <motion.div
          className="insight-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55 }}
          whileHover={{ y: -7 }}
        >
          <div className="insight-card-top">
            <div className="insight-icon blue">
              <Users size={22} />
            </div>

            <span className="insight-card-label">
              Registrations
            </span>
          </div>

          <div className="insight-card-value">
            {statistics.totalRegistrations.toLocaleString("en-IN")}
          </div>

          <div className="insight-card-footer">
            <span>
              Avg. {statistics.averageRegistrations} per event
            </span>
            <ArrowUpRight size={15} />
          </div>
        </motion.div>

        <motion.div
          className="insight-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.55 }}
          whileHover={{ y: -7 }}
        >
          <div className="insight-card-top">
            <div className="insight-icon green">
              <IndianRupee size={22} />
            </div>

            <span className="insight-card-label">
              Total Budget
            </span>
          </div>

          <div className="insight-card-value budget-value">
            {formatCurrency(statistics.totalBudget)}
          </div>

          <div className="insight-card-footer">
            <span>
              Avg. {formatCurrency(statistics.averageBudget)}
            </span>
            <ArrowUpRight size={15} />
          </div>
        </motion.div>

        <motion.div
          className="insight-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.55 }}
          whileHover={{ y: -7 }}
        >
          <div className="insight-card-top">
            <div className="insight-icon orange">
              <BriefcaseBusiness size={22} />
            </div>

            <span className="insight-card-label">
              Vendors
            </span>
          </div>

          <div className="insight-card-value">
            {statistics.totalVendors}
          </div>

          <div className="insight-card-footer">
            <span>Available vendors</span>
            <ArrowUpRight size={15} />
          </div>
        </motion.div>
      </div>

      {/* ANALYTICS */}
      <div className="insights-main-grid">
        {/* EVENT STATUS */}
        <motion.section
          className="insights-panel"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.65 }}
        >
          <div className="panel-header">
            <div>
              <h2>Event Status</h2>
              <p>Current status of all events</p>
            </div>

            <div className="panel-header-icon">
              <BarChart3 size={19} />
            </div>
          </div>

          <div className="status-list">
            {statusItems.map((item, index) => {
              const Icon = item.icon;

              const percentage =
                statistics.totalEvents > 0
                  ? Math.round(
                      (item.value / statistics.totalEvents) * 100
                    )
                  : 0;

              return (
                <motion.div
                  className="status-row"
                  key={item.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.5 + index * 0.08,
                    duration: 0.4,
                  }}
                >
                  <div className="status-row-top">
                    <div className="status-name">
                      <div
                        className={`status-icon ${item.className}`}
                      >
                        <Icon size={17} />
                      </div>

                      <span>{item.label}</span>
                    </div>

                    <strong>{item.value}</strong>
                  </div>

                  <div className="status-progress">
                    <motion.div
                      className={`status-progress-fill ${item.className}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        delay: 0.7 + index * 0.1,
                        duration: 0.8,
                      }}
                    />
                  </div>

                  <span className="status-percentage">
                    {percentage}% of all events
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* PERFORMANCE */}
        <motion.section
          className="insights-panel"
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.65 }}
        >
          <div className="panel-header">
            <div>
              <h2>Performance Overview</h2>
              <p>Key indicators for your events</p>
            </div>

            <div className="panel-header-icon">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="performance-list">
            {[
              {
                icon: CheckCircle2,
                label: "Completion Rate",
                value: `${statistics.completionRate}%`,
              },
              {
                icon: Users,
                label: "Average Registrations",
                value: statistics.averageRegistrations,
              },
              {
                icon: IndianRupee,
                label: "Average Budget",
                value: formatCurrency(statistics.averageBudget),
              },
              {
                icon: CalendarDays,
                label: "Upcoming Events",
                value: statistics.upcoming,
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  className="performance-item"
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.55 + index * 0.08,
                    duration: 0.45,
                  }}
                >
                  <div className="performance-icon">
                    <Icon size={20} />
                  </div>

                  <div className="performance-content">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* UPCOMING EVENTS */}
      <motion.section
        className="insights-panel upcoming-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.65 }}
      >
        <div className="panel-header">
          <div>
            <h2>Upcoming Events</h2>
            <p>Your next scheduled events</p>
          </div>

          <div className="upcoming-count">
            {upcomingEvents.length} shown
          </div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="empty-insights">
            <CalendarDays size={36} />

            <h3>No upcoming events</h3>

            <p>
              Create an event to start seeing upcoming
              schedules here.
            </p>
          </div>
        ) : (
          <div className="upcoming-events-list">
            {upcomingEvents.map((event, index) => {
              const status = getEventStatus(event);

              return (
                <motion.div
                  className="upcoming-event"
                  key={
                    event?.id ||
                    event?.event_id ||
                    event?.eventId ||
                    index
                  }
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.65 + index * 0.08,
                    duration: 0.45,
                  }}
                  whileHover={{ x: 6 }}
                >
                  <div className="event-date-box">
                    <CalendarDays size={19} />
                  </div>

                  <div className="upcoming-event-content">
                    <h3>{getEventName(event)}</h3>

                    <div className="upcoming-event-meta">
                      <span>
                        {formatDate(getEventDate(event))}
                      </span>

                      {event?.venue && (
                        <>
                          <span className="meta-dot">•</span>
                          <span>{event.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`event-status-badge ${status}`}
                  >
                    {status}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* FOOTER INSIGHT */}
      <motion.section
        className="insight-highlight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.65 }}
        whileHover={{ y: -4 }}
      >
        <motion.div
          className="highlight-icon"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <TrendingUp size={25} />
        </motion.div>

        <div className="highlight-content">
          <h2>Your Event Snapshot</h2>

          <p>
            You currently have{" "}
            <strong>{statistics.totalEvents}</strong>{" "}
            event
            {statistics.totalEvents !== 1 ? "s" : ""} and{" "}
            <strong>{statistics.upcoming}</strong>{" "}
            upcoming event
            {statistics.upcoming !== 1 ? "s" : ""}.
            {statistics.totalRegistrations > 0
              ? ` There are ${statistics.totalRegistrations.toLocaleString(
                  "en-IN"
                )} registrations across your events.`
              : " Registration data will appear as attendees register."}
          </p>
        </div>
      </motion.section>
    </div>
  );
}

export default Insights;