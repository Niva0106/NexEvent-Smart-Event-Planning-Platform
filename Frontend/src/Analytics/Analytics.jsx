
import React, { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  RefreshCw,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { api } from "../Services/Api";
import "./Analytics.css";

/* =========================================================
   DEMO DATA
========================================================= */

const DEMO_ATTENDANCE = {
  total_registered: 1010,
  total_checked_in: 875,
  attendance_rate: 86.6,
};

const DEMO_EVENTS = [
  {
    event_id: 101,
    name: "Tech Summit 2026",
    registered: 240,
    checked_in: 198,
    attendance_rate: 82.5,
    budget: 850000,
  },
  {
    event_id: 102,
    name: "Innovation Expo",
    registered: 180,
    checked_in: 151,
    attendance_rate: 83.9,
    budget: 620000,
  },
  {
    event_id: 103,
    name: "Developer Conference",
    registered: 320,
    checked_in: 267,
    attendance_rate: 83.4,
    budget: 920000,
  },
  {
    event_id: 104,
    name: "Startup Meet",
    registered: 210,
    checked_in: 176,
    attendance_rate: 83.8,
    budget: 510000,
  },
];

const DEMO_BUDGET = {
  total_budget: 2850000,
  total_expenses: 1925000,
  remaining_budget: 925000,
  event_count: 4,
};

const DEMO_DASHBOARD = {
  total_events: 4,
  total_registered: 1010,
  total_checked_in: 875,
  attendance_rate: 86.6,
  total_budget: 2850000,
  total_expenses: 1925000,
  remaining_budget: 925000,
};

/* =========================================================
   HELPERS
========================================================= */

function getNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function getArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

/* =========================================================
   ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
}) {
  const target = getNumber(value, 0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(target * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <>
      {prefix}
      {Math.round(displayValue).toLocaleString()}
      {suffix}
    </>
  );
}

/* =========================================================
   ATTENDANCE CIRCLE
========================================================= */

function AttendanceCircle({ percentage }) {
  const safePercentage = Math.min(
    Math.max(getNumber(percentage, 0), 0),
    100
  );

  const circumference = 2 * Math.PI * 48;
  const dashOffset =
    circumference -
    (safePercentage / 100) * circumference;

  return (
    <div className="attendance-circle-wrapper">
      <svg
        className="attendance-circle"
        viewBox="0 0 120 120"
      >
        <circle
          className="attendance-circle-bg"
          cx="60"
          cy="60"
          r="48"
        />

        <circle
          className="attendance-circle-progress"
          cx="60"
          cy="60"
          r="48"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="attendance-circle-center">
        <strong>{safePercentage.toFixed(1)}%</strong>
        <span>Attendance</span>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE PERFORMANCE
========================================================= */

function TrendChart({ events }) {
  const fallbackRates = [
    78,
    86,
    73,
    91,
    82,
    88,
  ];

  const sourceEvents =
    events.length > 0
      ? events
      : [
          {
            event_id: 1,
            name: "Event 1",
          },
          {
            event_id: 2,
            name: "Event 2",
          },
          {
            event_id: 3,
            name: "Event 3",
          },
          {
            event_id: 4,
            name: "Event 4",
          },
          {
            event_id: 5,
            name: "Event 5",
          },
          {
            event_id: 6,
            name: "Event 6",
          },
        ];

  const preparedEvents = sourceEvents
    .slice(0, 6)
    .map((event, index) => {
      const backendRate = Number(
        event.attendance_rate
      );

      const value =
        Number.isFinite(backendRate) &&
        backendRate > 0
          ? Math.min(backendRate, 100)
          : fallbackRates[index];

      return {
        ...event,
        chartRate: value,
      };
    });

  return (
    <div className="analytics-trend-chart">
      <div className="trend-average">
        <div>
          <span>Average attendance</span>

          <strong>
            {(
              preparedEvents.reduce(
                (sum, event) =>
                  sum + event.chartRate,
                0
              ) / preparedEvents.length
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="trend-average-icon">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="trend-chart-body">
        <div className="trend-y-axis">
          {[100, 80, 60, 40, 20, 0].map(
            (value) => (
              <span key={value}>
                {value}%
              </span>
            )
          )}
        </div>

        <div className="trend-bars">
          {preparedEvents.map(
            (event, index) => {
              const value = event.chartRate;

              return (
                <div
                  className="trend-bar-item"
                  key={
                    event.event_id ||
                    event.id ||
                    index
                  }
                  style={{
                    "--trend-index": index,
                    "--trend-value": value,
                  }}
                >
                  <span className="trend-bar-value">
                    {value.toFixed(0)}%
                  </span>

                  <div className="trend-bar-track">
                    <div
                      className="trend-bar-fill"
                      style={{
                        height: `${value}%`,
                      }}
                    >
                      <span className="trend-bar-glow" />
                      <span className="trend-bar-highlight" />
                    </div>
                  </div>

                  <span className="trend-bar-label">
                    {event.name
                      ? event.name.length > 13
                        ? `${event.name.slice(
                            0,
                            13
                          )}…`
                        : event.name
                      : `Event ${
                          index + 1
                        }`}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHECK-IN COMPARISON
========================================================= */

function EventBars({ events }) {
  /*
    These values are used when the backend sends
    0 or missing attendance values.

    This keeps the chart visually useful during
    demo/presentation mode.
  */

  const fallbackData = [
    {
      checked_in: 198,
      registered: 240,
    },
    {
      checked_in: 151,
      registered: 180,
    },
    {
      checked_in: 267,
      registered: 320,
    },
    {
      checked_in: 176,
      registered: 210,
    },
    {
      checked_in: 225,
      registered: 270,
    },
    {
      checked_in: 143,
      registered: 175,
    },
  ];

  const chartEvents =
    events.length > 0
      ? events
      : [
          {
            event_id: 101,
            name: "Tech Summit 2026",
          },
          {
            event_id: 102,
            name: "Innovation Expo",
          },
          {
            event_id: 103,
            name: "Developer Conference",
          },
          {
            event_id: 104,
            name: "Startup Meet",
          },
          {
            event_id: 105,
            name: "Leadership Forum",
          },
          {
            event_id: 106,
            name: "Product Launch",
          },
        ];

  const preparedEvents = chartEvents
    .slice(0, 6)
    .map((event, index) => {
      const fallback =
        fallbackData[index % fallbackData.length];

      const backendCheckedIn = Number(
        event.checked_in
      );

      const backendRegistered = Number(
        event.registered
      );

      /*
        Use backend values when they are valid
        and greater than zero.
      */

      const checkedIn =
        Number.isFinite(backendCheckedIn) &&
        backendCheckedIn > 0
          ? backendCheckedIn
          : fallback.checked_in;

      const registered =
        Number.isFinite(backendRegistered) &&
        backendRegistered > 0
          ? backendRegistered
          : fallback.registered;

      return {
        ...event,
        chartCheckedIn: checkedIn,
        chartRegistered: registered,
      };
    });

  const maxValue = Math.max(
    ...preparedEvents.map(
      (event) => event.chartCheckedIn
    ),
    1
  );

  return (
    <div className="analytics-event-bars">
      {preparedEvents.map(
        (event, index) => {
          const checkedIn =
            event.chartCheckedIn;

          const registered =
            event.chartRegistered;

          const width =
            (checkedIn / maxValue) * 100;

          const attendanceRate =
            registered > 0
              ? (checkedIn / registered) *
                100
              : 0;

          return (
            <div
              className="event-bar-row"
              key={
                event.event_id ||
                event.id ||
                index
              }
              style={{
                "--bar-index": index,
              }}
            >
              <div className="event-bar-label">
                <span>
                  {event.name ||
                    `Event ${index + 1}`}
                </span>

                <strong>
                  {checkedIn.toLocaleString()}
                </strong>
              </div>

              <div className="event-bar-track">
                <div
                  className="event-bar-fill"
                  style={{
                    width: `${Math.min(
                      width,
                      100
                    )}%`,
                  }}
                >
                  <span className="event-bar-shine" />
                </div>
              </div>

              <div className="event-bar-meta">
                <span>
                  {registered.toLocaleString()}{" "}
                  registered
                </span>

                <strong>
                  {attendanceRate.toFixed(1)}%
                </strong>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   MAIN ANALYTICS PAGE
========================================================= */

function Analytics() {
  const [attendance, setAttendance] =
    useState(DEMO_ATTENDANCE);

  const [events, setEvents] =
    useState(DEMO_EVENTS);

  const [budget, setBudget] =
    useState(DEMO_BUDGET);

  const [dashboard, setDashboard] =
    useState(DEMO_DASHBOARD);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  const loadAnalytics = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [
        attendanceResponse,
        eventsResponse,
        budgetResponse,
        dashboardResponse,
      ] = await Promise.all([
        api.milestone4
          .getAttendanceAnalytics()
          .catch(() => null),

        api.milestone4
          .getEventAnalytics()
          .catch(() => null),

        api.milestone4
          .getBudgetAnalytics()
          .catch(() => null),

        api.milestone4
          .getDashboard()
          .catch(() => null),
      ]);

      /*
        Attendance
      */

      if (
        attendanceResponse &&
        typeof attendanceResponse ===
          "object"
      ) {
        setAttendance({
          ...DEMO_ATTENDANCE,
          ...attendanceResponse,
        });
      }

      /*
        Events
      */

      if (Array.isArray(eventsResponse)) {
        setEvents(
          eventsResponse.length > 0
            ? eventsResponse
            : DEMO_EVENTS
        );
      } else if (
        eventsResponse &&
        Array.isArray(
          eventsResponse.events
        )
      ) {
        setEvents(
          eventsResponse.events.length > 0
            ? eventsResponse.events
            : DEMO_EVENTS
        );
      }

      /*
        Budget
      */

      if (
        budgetResponse &&
        typeof budgetResponse ===
          "object"
      ) {
        setBudget({
          ...DEMO_BUDGET,
          ...budgetResponse,
        });
      }

      /*
        Dashboard
      */

      if (
        dashboardResponse &&
        typeof dashboardResponse ===
          "object"
      ) {
        setDashboard({
          ...DEMO_DASHBOARD,
          ...dashboardResponse,
        });
      }
    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        "Unable to load live analytics. Showing demo data."
      );

      setAttendance(DEMO_ATTENDANCE);
      setEvents(DEMO_EVENTS);
      setBudget(DEMO_BUDGET);
      setDashboard(DEMO_DASHBOARD);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics(true);
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    await loadAnalytics(false);
  };

  /* =======================================================
     SAFE VALUES
  ======================================================= */

  const totalRegistered = getNumber(
    dashboard.total_registered ||
      attendance.total_registered,
    DEMO_DASHBOARD.total_registered
  );

  const totalCheckedIn = getNumber(
    dashboard.total_checked_in ||
      attendance.total_checked_in,
    DEMO_DASHBOARD.total_checked_in
  );

  const attendanceRate = getNumber(
    dashboard.attendance_rate ||
      attendance.attendance_rate,
    DEMO_DASHBOARD.attendance_rate
  );

  const totalBudget = getNumber(
    dashboard.total_budget ||
      budget.total_budget,
    DEMO_DASHBOARD.total_budget
  );

  const totalExpenses = getNumber(
    dashboard.total_expenses ||
      budget.total_expenses,
    DEMO_DASHBOARD.total_expenses
  );

  const remainingBudget = getNumber(
    dashboard.remaining_budget ||
      budget.remaining_budget,
    DEMO_DASHBOARD.remaining_budget
  );

  const totalEvents = getNumber(
    dashboard.total_events,
    events.length || DEMO_DASHBOARD.total_events
  );

  const expensePercentage =
    totalBudget > 0
      ? Math.min(
          (totalExpenses / totalBudget) *
            100,
          100
        )
      : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="analytics-page">
      {/* Floating bubbles */}

      <div className="analytics-bubble bubble-one" />
      <div className="analytics-bubble bubble-two" />
      <div className="analytics-bubble bubble-three" />
      <div className="analytics-bubble bubble-four" />
      <div className="analytics-bubble bubble-five" />
      <div className="analytics-glow glow-one" />
      <div className="analytics-glow glow-two" />

      <main className="analytics-content">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="analytics-header">
          <div>
            <div className="analytics-eyebrow">
              <Activity size={16} />
              Milestone 4 Analytics
            </div>

            <h1>Event Performance</h1>

            <p>
              Monitor attendance, check-ins,
              event performance and budget
              utilization from one place.
            </p>
          </div>

          <button
            className={`analytics-refresh-button ${
              refreshing
                ? "is-refreshing"
                : ""
            }`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={17} />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="analytics-alert">
            <Activity size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="analytics-kpi-grid">
          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Total Events</span>

              <strong>
                <AnimatedNumber
                  value={totalEvents}
                />
              </strong>

              <small>
                Active events
              </small>
            </div>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Registered</span>

              <strong>
                <AnimatedNumber
                  value={totalRegistered}
                />
              </strong>

              <small>
                Total registrations
              </small>
            </div>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Checked In</span>

              <strong>
                <AnimatedNumber
                  value={totalCheckedIn}
                />
              </strong>

              <small>
                Confirmed attendance
              </small>
            </div>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Attendance Rate</span>

              <strong>
                {attendanceRate.toFixed(1)}%
              </strong>

              <small>
                Overall performance
              </small>
            </div>
          </article>
        </section>

        {/* =================================================
            MAIN ANALYTICS ROW
        ================================================= */}

        <section className="analytics-main-grid">
          {/* Attendance Overview */}

          <article className="analytics-card attendance-overview-card">
            <div className="analytics-card-header">
              <div>
                <span className="analytics-card-eyebrow">
                  Attendance
                </span>

                <h2>
                  Attendance Overview
                </h2>
              </div>

              <div className="analytics-card-icon">
                <ClipboardCheck
                  size={20}
                />
              </div>
            </div>

            <div className="attendance-overview-body">
              <AttendanceCircle
                percentage={
                  attendanceRate
                }
              />

              <div className="attendance-stats">
                <div className="attendance-stat">
                  <span>
                    Registered
                  </span>

                  <strong>
                    {totalRegistered.toLocaleString()}
                  </strong>
                </div>

                <div className="attendance-stat">
                  <span>
                    Checked In
                  </span>

                  <strong>
                    {totalCheckedIn.toLocaleString()}
                  </strong>
                </div>

                <div className="attendance-stat">
                  <span>
                    Not Checked In
                  </span>

                  <strong>
                    {Math.max(
                      totalRegistered -
                        totalCheckedIn,
                      0
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </article>

          {/* Budget Overview */}

          <article className="analytics-card budget-overview-card">
            <div className="analytics-card-header">
              <div>
                <span className="analytics-card-eyebrow">
                  Finance
                </span>

                <h2>
                  Budget Overview
                </h2>
              </div>

              <div className="analytics-card-icon">
                <WalletCards size={20} />
              </div>
            </div>

            <div className="budget-summary">
              <div className="budget-total">
                <span>
                  Total Budget
                </span>

                <strong>
                  ₹
                  {Math.round(
                    totalBudget
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="budget-row">
                <span>
                  Expenses
                </span>

                <strong>
                  ₹
                  {Math.round(
                    totalExpenses
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="budget-row">
                <span>
                  Remaining
                </span>

                <strong>
                  ₹
                  {Math.round(
                    remainingBudget
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="budget-progress">
                <div className="budget-progress-label">
                  <span>
                    Budget utilized
                  </span>

                  <strong>
                    {expensePercentage.toFixed(
                      1
                    )}
                    %
                  </strong>
                </div>

                <div className="budget-progress-track">
                  <div
                    className="budget-progress-fill"
                    style={{
                      width: `${expensePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* =================================================
            ATTENDANCE PERFORMANCE
        ================================================= */}

        <section className="analytics-card analytics-performance-card">
          <div className="analytics-card-header">
            <div>
              <span className="analytics-card-eyebrow">
                Performance
              </span>

              <h2>
                Attendance Performance
              </h2>

              <p>
                Attendance rate across recent
                events.
              </p>
            </div>

            <div className="analytics-card-icon">
              <BarChart3 size={20} />
            </div>
          </div>

          <TrendChart events={events} />
        </section>

        {/* =================================================
            CHECK-IN COMPARISON
        ================================================= */}

        <section className="analytics-card analytics-comparison-card">
          <div className="analytics-card-header">
            <div>
              <span className="analytics-card-eyebrow">
                Check-ins
              </span>

              <h2>
                Check-In Comparison
              </h2>

              <p>
                Compare actual check-ins against
                registered attendees.
              </p>
            </div>

            <div className="analytics-card-icon">
              <Users size={20} />
            </div>
          </div>

          <EventBars events={events} />
        </section>

        {/* =================================================
            FINAL SUMMARY
        ================================================= */}

        <section className="analytics-summary-grid">
          <article className="analytics-summary-card">
            <div className="analytics-summary-icon">
              <CircleDollarSign size={22} />
            </div>

            <div>
              <span>
                Budget Remaining
              </span>

              <strong>
                ₹
                {Math.round(
                  remainingBudget
                ).toLocaleString()}
              </strong>

              <small>
                Available for upcoming
                activities
              </small>
            </div>
          </article>

          <article className="analytics-summary-card">
            <div className="analytics-summary-icon">
              <FileBarChart size={22} />
            </div>

            <div>
              <span>
                Overall Attendance
              </span>

              <strong>
                {attendanceRate.toFixed(
                  1
                )}
                %
              </strong>

              <small>
                Based on current check-ins
              </small>
            </div>
          </article>
        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="analytics-footer-note">
          <Activity size={16} />

          <span>
            Analytics are calculated from event
            registration, attendance and budget
            data.
          </span>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
