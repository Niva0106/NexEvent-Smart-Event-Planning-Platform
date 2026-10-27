
import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Api";
import "./Dashboard.css";

const FALLBACK_EVENTS = [
  {
    id: 1,
    name: "Tech Fest 2026",
    date: "2026-03-15",
    start_time: "10:00",
    end_time: "17:00",
    venue: "Main Auditorium",
    city: "Visakhapatnam",
    attendees: 350,
    status: "Upcoming",
  },
  {
    id: 2,
    name: "AI Workshop",
    date: "2026-04-10",
    start_time: "09:30",
    end_time: "13:00",
    venue: "Innovation Hall",
    city: "Visakhapatnam",
    attendees: 120,
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Python Bootcamp",
    date: "2026-04-20",
    start_time: "10:00",
    end_time: "16:00",
    venue: "Training Center",
    city: "Visakhapatnam",
    attendees: 200,
    status: "Planning",
  },
];

const FALLBACK_TASKS = [
  {
    id: 1,
    title: "Confirm venue arrangements",
    event: "Tech Fest 2026",
    completed: true,
  },
  {
    id: 2,
    title: "Finalize speaker list",
    event: "AI Workshop",
    completed: true,
  },
  {
    id: 3,
    title: "Review vendor quotations",
    event: "Python Bootcamp",
    completed: false,
  },
  {
    id: 4,
    title: "Prepare event materials",
    event: "Tech Fest 2026",
    completed: false,
  },
];

const formatDate = (value) => {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEventName = (event) =>
  event?.name ||
  event?.event_name ||
  event?.eventName ||
  "Untitled Event";

const getEventDate = (event) =>
  event?.date ||
  event?.event_date ||
  event?.eventDate ||
  "";

const getEventStart = (event) =>
  event?.start_time ||
  event?.startTime ||
  "";

const getEventEnd = (event) =>
  event?.end_time ||
  event?.endTime ||
  "";

const getEventVenue = (event) =>
  event?.venue ||
  event?.venue_name ||
  event?.venueName ||
  event?.location ||
  "Venue not available";

const getEventAttendees = (event) =>
  Number(
    event?.attendees ??
      event?.attendee_count ??
      event?.attendeeCount ??
      0
  );

function Dashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [tasks, setTasks] = useState(FALLBACK_TASKS);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  /*
   * These are the dashboard milestone values requested for the
   * final-year project presentation/demo.
   */
  const totalEvents = 7;
  const completedTasks = 12;
  const totalBudget = 820000;
  const pendingTasks = 5;

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setBackendError(false);

        const [eventsResponse, tasksResponse] = await Promise.allSettled([
          api.get("/api/events"),
          api.get("/api/tasks"),
        ]);

        if (!mounted) return;

        if (eventsResponse.status === "fulfilled") {
          const responseData = eventsResponse.value?.data;

          const eventList = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.events)
            ? responseData.events
            : [];

          if (eventList.length > 0) {
            setEvents(eventList);
          }
        }

        if (tasksResponse.status === "fulfilled") {
          const responseData = tasksResponse.value?.data;

          const taskList = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.tasks)
            ? responseData.tasks
            : [];

          if (taskList.length > 0) {
            setTasks(taskList);
          }
        }

        if (
          eventsResponse.status === "rejected" &&
          tasksResponse.status === "rejected"
        ) {
          setBackendError(true);
        }
      } catch (error) {
        if (mounted) {
          setBackendError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const displayedEvents = events.slice(0, 3);
  const displayedTasks = tasks.slice(0, 4);

  const upcomingEvents = events.filter((event) => {
    const eventDate = getEventDate(event);

    if (!eventDate) return true;

    const date = new Date(eventDate);

    if (Number.isNaN(date.getTime())) return true;

    return date >= new Date();
  });

  const completedTaskCount = tasks.filter(
    (task) =>
      task?.completed === true ||
      task?.is_completed === true ||
      task?.status === "completed" ||
      task?.status === "Completed"
  ).length;

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      {/* Aurora background */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <main className="dashboard-container">
        {/* Hero */}
        <section className="dashboard-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>NexEvent Dashboard</span>
            </div>

            <h1>
              Manage events.
              <span> Create experiences.</span>
            </h1>

            <p>
              Keep your events, resources, schedules, teams and budgets
              organized from one intelligent workspace.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => goTo("/events")}
              >
                <Plus size={18} />
                Create Event
              </button>

              <button
                type="button"
                className="dashboard-secondary-button"
                onClick={() => goTo("/analytics")}
              >
                <BarChart3 size={18} />
                View Analytics
              </button>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            <div className="hero-orbit-center">
              <LayoutDashboard size={34} />
            </div>

            <div className="floating-mini-card floating-card-one">
              <CalendarDays size={17} />
              <div>
                <strong>{totalEvents}</strong>
                <span>Events</span>
              </div>
            </div>

            <div className="floating-mini-card floating-card-two">
              <CheckCircle2 size={17} />
              <div>
                <strong>{completedTasks}</strong>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main statistics */}
        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="stat-icon">
              <CalendarDays size={23} />
            </div>

            <div className="stat-content">
              <span>Total Events</span>
              <strong>{totalEvents}</strong>
              <small>Events in your workspace</small>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={23} />
            </div>

            <div className="stat-content">
              <span>Completed Tasks</span>
              <strong>{completedTasks}</strong>
              <small>Tasks completed successfully</small>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">
              <IndianRupee size={23} />
            </div>

            <div className="stat-content">
              <span>Total Budget</span>
              <strong>
                ₹{totalBudget.toLocaleString("en-IN")}
              </strong>
              <small>Planned event budget</small>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">
              <ListChecks size={23} />
            </div>

            <div className="stat-content">
              <span>Pending Tasks</span>
              <strong>{pendingTasks}</strong>
              <small>Tasks waiting for action</small>
            </div>
          </div>
        </section>

        {/* Milestone section */}
        <section className="dashboard-milestone-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-eyebrow">
                Milestone 4
              </span>

              <h2>Event Management at a Glance</h2>

              <p>
                Monitor the most important areas of your event planning
                workflow.
              </p>
            </div>

            <div className="dashboard-section-icon">
              <Sparkles size={21} />
            </div>
          </div>

          <div className="dashboard-milestone-grid">
            <div className="dashboard-milestone-card">
              <div className="milestone-card-top">
                <div className="milestone-card-icon">
                  <BarChart3 size={21} />
                </div>

                <span>Analytics</span>
              </div>

              <h3>Attendance Analytics</h3>

              <p>
                Track registrations, attendance and event performance
                through meaningful insights.
              </p>

              <button
                type="button"
                className="dashboard-milestone-actions"
                onClick={() => goTo("/analytics")}
              >
                Explore Analytics
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dashboard-milestone-card">
              <div className="milestone-card-top">
                <div className="milestone-card-icon">
                  <Boxes size={21} />
                </div>

                <span>Resources</span>
              </div>

              <h3>Resource Coordination</h3>

              <p>
                Coordinate event resources and get explainable
                rule-based recommendations.
              </p>

              <button
                type="button"
                className="dashboard-milestone-actions"
                onClick={() => goTo("/resource-allocation")}
              >
                Manage Resources
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dashboard-milestone-card">
              <div className="milestone-card-top">
                <div className="milestone-card-icon">
                  <IndianRupee size={21} />
                </div>

                <span>Budget</span>
              </div>

              <h3>Event & Budget Analytics</h3>

              <p>
                Review event finances, expenses and overall budget
                utilization in one place.
              </p>

              <button
                type="button"
                className="dashboard-milestone-actions"
                onClick={() => goTo("/analytics")}
              >
                View Budget
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dashboard-milestone-card">
              <div className="milestone-card-top">
                <div className="milestone-card-icon">
                  <FileText size={21} />
                </div>

                <span>Finalization</span>
              </div>

              <h3>Reports & Finalization</h3>

              <p>
                Generate final event reports and review important
                project outcomes.
              </p>

              <button
                type="button"
                className="dashboard-milestone-actions"
                onClick={() => goTo("/reports")}
              >
                Open Reports
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="dashboard-milestone-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-eyebrow">
                Quick Access
              </span>

              <h2>Everything you need</h2>

              <p>
                Jump directly into the most-used NexEvent modules.
              </p>
            </div>
          </div>

          <div className="dashboard-milestone-grid">
            <div className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <CalendarDays size={21} />
              </div>

              <div className="dashboard-action-content">
                <h3>Events</h3>
                <p>Create and manage your events.</p>
              </div>

              <div className="dashboard-action-buttons">
                <button type="button" onClick={() => goTo("/events")}>
                  Open
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <Boxes size={21} />
              </div>

              <div className="dashboard-action-content">
                <h3>Resources</h3>
                <p>Coordinate inventory and allocation.</p>
              </div>

              <div className="dashboard-action-buttons">
                <button
                  type="button"
                  onClick={() => goTo("/resources")}
                >
                  Open
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <Users size={21} />
              </div>

              <div className="dashboard-action-content">
                <h3>Team</h3>
                <p>Manage event teams and responsibilities.</p>
              </div>

              <div className="dashboard-action-buttons">
                <button type="button" onClick={() => goTo("/team")}>
                  Open
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="dashboard-action-card">
              <div className="dashboard-action-icon">
                <FileText size={21} />
              </div>

              <div className="dashboard-action-content">
                <h3>Reports</h3>
                <p>Review and export event reports.</p>
              </div>

              <div className="dashboard-action-buttons">
                <button type="button" onClick={() => goTo("/reports")}>
                  Open
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Shortage / notification alert */}
        <section className="dashboard-shortage-alert">
          <div className="dashboard-shortage-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <strong>Resource Coordination</strong>
            <p>
              Review your resource allocation before finalizing
              upcoming events.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goTo("/resource-allocation")}
          >
            Check Resources
            <ArrowRight size={16} />
          </button>
        </section>

        {/* Content area */}
        <section className="dashboard-content-grid">
          {/* Upcoming events */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">Schedule</span>
                <h2>Upcoming Events</h2>
              </div>

              <button
                type="button"
                className="panel-link"
                onClick={() => goTo("/events")}
              >
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-empty-state">
                <div className="loading-spinner" />
                <p>Loading events...</p>
              </div>
            ) : displayedEvents.length === 0 ? (
              <div className="dashboard-empty-state">
                <CalendarDays size={30} />
                <p>No upcoming events available.</p>
              </div>
            ) : (
              <div className="event-list">
                {displayedEvents.map((event, index) => (
                  <button
                    type="button"
                    className="dashboard-event-item"
                    key={event?.id || event?.event_id || index}
                    onClick={() =>
                      event?.id
                        ? goTo(`/events/${event.id}`)
                        : goTo("/events")
                    }
                  >
                    <div className="event-date-box">
                      <CalendarDays size={17} />
                      <strong>
                        {getEventDate(event)
                          ? new Date(getEventDate(event)).getDate()
                          : "--"}
                      </strong>
                      <span>
                        {getEventDate(event)
                          ? new Date(
                              getEventDate(event)
                            ).toLocaleDateString("en-IN", {
                              month: "short",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="event-item-details">
                      <h3>{getEventName(event)}</h3>

                      <div className="event-meta">
                        <span>
                          <Clock3 size={14} />
                          {getEventStart(event) || "--"}{" "}
                          {getEventEnd(event)
                            ? `- ${getEventEnd(event)}`
                            : ""}
                        </span>

                        <span>
                          <MapPin size={14} />
                          {getEventVenue(event)}
                        </span>

                        <span>
                          <Users size={14} />
                          {getEventAttendees(event)} attendees
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={19} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">Productivity</span>
                <h2>Task Overview</h2>
              </div>

              <button
                type="button"
                className="panel-link"
                onClick={() => goTo("/tasks")}
              >
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-empty-state">
                <div className="loading-spinner" />
                <p>Loading tasks...</p>
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="dashboard-empty-state">
                <ListChecks size={30} />
                <p>No tasks available.</p>
              </div>
            ) : (
              <div className="task-list">
                {displayedTasks.map((task, index) => {
                  const isCompleted =
                    task?.completed === true ||
                    task?.is_completed === true ||
                    task?.status === "completed" ||
                    task?.status === "Completed";

                  return (
                    <div
                      className="dashboard-task-item"
                      key={task?.id || index}
                    >
                      <div
                        className={`task-check ${
                          isCompleted ? "completed" : ""
                        }`}
                      >
                        {isCompleted && <CheckCircle2 size={17} />}
                      </div>

                      <div className="task-details">
                        <strong>
                          {task?.title ||
                            task?.name ||
                            task?.task_name ||
                            "Event task"}
                        </strong>

                        <span>
                          {task?.event ||
                            task?.event_name ||
                            task?.eventName ||
                            "NexEvent"}
                        </span>
                      </div>

                      <ChevronRight size={17} />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="dashboard-empty-state" style={{ marginTop: 18 }}>
              <small>
                {completedTaskCount > 0
                  ? `${completedTaskCount} tasks are marked complete in the current task data.`
                  : "Keep working through your event checklist."}
              </small>
            </div>
          </div>
        </section>

        {/* Backend status */}
        {backendError && (
          <div className="dashboard-shortage-alert">
            <div className="dashboard-shortage-icon">
              <AlertTriangle size={21} />
            </div>

            <div>
              <strong>Using dashboard demo data</strong>
              <p>
                Some live backend data could not be loaded, so NexEvent
                is showing the project demo information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;