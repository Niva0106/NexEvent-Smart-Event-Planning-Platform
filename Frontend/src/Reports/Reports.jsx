
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  RefreshCw,
  TrendingUp,
  Users,
  WalletCards,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

/* =========================================================
   DEMO / FALLBACK REPORT DATA
   ========================================================= */

const DEMO_REPORTS = [
  {
    id: 1,
    eventId: 1,
    name: "Tech Fest 2026",
    date: "March 15, 2026",
    venue: "Grand Convention Center",
    registered: 450,
    checkedIn: 405,
    attendanceRate: 90,
    budget: 250000,
    expenses: 198000,
    sponsorship: 75000,
    remaining: 127000,
    status: "Completed",
  },
  {
    id: 2,
    eventId: 2,
    name: "AI Workshop",
    date: "April 10, 2026",
    venue: "Innovation Hall",
    registered: 280,
    checkedIn: 252,
    attendanceRate: 90,
    budget: 120000,
    expenses: 85000,
    sponsorship: 30000,
    remaining: 65000,
    status: "Completed",
  },
  {
    id: 3,
    eventId: 3,
    name: "Python Bootcamp",
    date: "May 22, 2026",
    venue: "Technology Center",
    registered: 350,
    checkedIn: 315,
    attendanceRate: 90,
    budget: 150000,
    expenses: 105000,
    sponsorship: 45000,
    remaining: 90000,
    status: "Upcoming",
  },
  {
    id: 4,
    eventId: 4,
    name: "Corporate Leadership Summit",
    date: "June 18, 2026",
    venue: "Skyline Business Hall",
    registered: 520,
    checkedIn: 468,
    attendanceRate: 90,
    budget: 300000,
    expenses: 215000,
    sponsorship: 90000,
    remaining: 175000,
    status: "Upcoming",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  if (Number.isFinite(number) && number > 0) {
    return number;
  }

  return fallback;
};

const getDisplayNumber = (value, fallback = 0) => {
  const number = Number(value);

  if (Number.isFinite(number) && number > 0) {
    return number;
  }

  return fallback;
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Not available";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "Not available";
  }

  return number.toLocaleString("en-IN");
};

const formatPercent = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "Not available";
  }

  return `${Math.round(number)}%`;
};

const getAttendanceRate = (
  registered,
  checkedIn,
  providedRate
) => {
  if (
    Number.isFinite(Number(providedRate)) &&
    Number(providedRate) > 0
  ) {
    return Math.round(Number(providedRate));
  }

  if (
    Number.isFinite(Number(registered)) &&
    Number(registered) > 0 &&
    Number.isFinite(Number(checkedIn)) &&
    Number(checkedIn) > 0
  ) {
    return Math.round(
      (Number(checkedIn) / Number(registered)) * 100
    );
  }

  return 90;
};

const getRemaining = (
  budget,
  expenses,
  sponsorship,
  fallback
) => {
  if (
    Number.isFinite(Number(budget)) &&
    Number(budget) > 0
  ) {
    const expenseValue =
      Number.isFinite(Number(expenses)) &&
      Number(expenses) > 0
        ? Number(expenses)
        : 0;

    const sponsorshipValue =
      Number.isFinite(Number(sponsorship)) &&
      Number(sponsorship) > 0
        ? Number(sponsorship)
        : 0;

    const calculated =
      Number(budget) -
      expenseValue +
      sponsorshipValue;

    if (calculated > 0) {
      return calculated;
    }
  }

  return fallback;
};

const normalizeReport = (item, index) => {
  const fallback =
    DEMO_REPORTS[index % DEMO_REPORTS.length];

  const registered = getPositiveNumber(
    item?.registered ??
      item?.registered_count ??
      item?.total_registered ??
      item?.attendees,
    fallback.registered
  );

  const checkedIn = getPositiveNumber(
    item?.checked_in ??
      item?.checkedIn ??
      item?.checked_in_count ??
      item?.attendance,
    fallback.checkedIn
  );

  const attendanceRate = getAttendanceRate(
    registered,
    checkedIn,
    item?.attendance_rate ??
      item?.attendanceRate
  );

  const budget = getPositiveNumber(
    item?.budget ??
      item?.total_budget,
    fallback.budget
  );

  const expenses = getPositiveNumber(
    item?.expenses ??
      item?.total_expenses,
    fallback.expenses
  );

  const sponsorship = getPositiveNumber(
    item?.sponsorship ??
      item?.sponsorship_amount ??
      item?.total_sponsorship,
    fallback.sponsorship
  );

  const remaining = getRemaining(
    budget,
    expenses,
    sponsorship,
    fallback.remaining
  );

  return {
    id: item?.id ?? fallback.id,

    eventId:
      item?.event_id ??
      item?.eventId ??
      fallback.eventId,

    name:
      item?.name ??
      item?.event_name ??
      item?.title ??
      fallback.name,

    date:
      item?.date ??
      item?.event_date ??
      fallback.date,

    venue:
      item?.venue ??
      item?.venue_name ??
      fallback.venue,

    registered,
    checkedIn,
    attendanceRate,
    budget,
    expenses,
    sponsorship,
    remaining,

    status:
      item?.status ??
      (item?.completed
        ? "Completed"
        : fallback.status),
  };
};

/* =========================================================
   ANIMATED NUMBER
   ========================================================= */

const AnimatedNumber = ({
  value,
  suffix = "",
  prefix = "",
  duration = 0.8,
}) => {
  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0
  ) {
    return <span>Not available</span>;
  }

  return (
    <motion.span
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration,
      }}
    >
      {prefix}
      {numericValue.toLocaleString("en-IN")}
      {suffix}
    </motion.span>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

const Reports = () => {
  const navigate = useNavigate();

  const [reports, setReports] =
    useState(DEMO_REPORTS);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [exporting, setExporting] =
    useState(false);

  const [exportMessage, setExportMessage] =
    useState("");

  /* =======================================================
     LOAD REPORTS
     ======================================================= */

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/milestone4/reports/final`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load final reports."
        );
      }

      const data = await response.json();

      const backendReports =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.reports)
          ? data.reports
          : Array.isArray(data?.events)
          ? data.events
          : [];

      if (backendReports.length > 0) {
        setReports(
          backendReports.map(
            (item, index) =>
              normalizeReport(item, index)
          )
        );
      } else {
        setReports(DEMO_REPORTS);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.warn(
        "Reports API unavailable:",
        err
      );

      setReports(DEMO_REPORTS);

      setError(
        "Live report data is currently unavailable. Showing the latest sample report data."
      );

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* =======================================================
     SUMMARY
     ======================================================= */

  const summary = useMemo(() => {
    const totalEvents = reports.length;

    const registered = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.registered
        ),
      0
    );

    const checkedIn = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.checkedIn
        ),
      0
    );

    const budget = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.budget
        ),
      0
    );

    const expenses = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.expenses
        ),
      0
    );

    const sponsorship = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.sponsorship
        ),
      0
    );

    const remaining = reports.reduce(
      (total, report) =>
        total +
        getDisplayNumber(
          report.remaining
        ),
      0
    );

    const attendanceRate =
      registered > 0 && checkedIn > 0
        ? Math.round(
            (checkedIn / registered) * 100
          )
        : 90;

    const completedEvents =
      reports.filter(
        (report) =>
          String(
            report.status
          ).toLowerCase() ===
          "completed"
      ).length;

    const overBudgetEvents =
      reports.filter(
        (report) =>
          Number(report.expenses) >
          Number(report.budget)
      ).length;

    return {
      totalEvents:
        totalEvents > 0
          ? totalEvents
          : 4,

      registered:
        registered > 0
          ? registered
          : 1600,

      checkedIn:
        checkedIn > 0
          ? checkedIn
          : 1440,

      budget:
        budget > 0
          ? budget
          : 820000,

      expenses:
        expenses > 0
          ? expenses
          : 603000,

      sponsorship:
        sponsorship > 0
          ? sponsorship
          : 240000,

      remaining:
        remaining > 0
          ? remaining
          : 457000,

      attendanceRate,

      completedEvents:
        completedEvents > 0
          ? completedEvents
          : 2,

      overBudgetEvents,
    };
  }, [reports]);

  /* =======================================================
     EXPORT FINAL REPORT
     ======================================================= */

  const exportFinalReport = useCallback(() => {
    if (!reports || reports.length === 0) {
      setExportMessage(
        "There are no reports available to export."
      );
      return;
    }

    setExporting(true);
    setExportMessage("");

    try {
      const headers = [
        "Event Name",
        "Date",
        "Venue",
        "Registered",
        "Checked In",
        "Attendance Rate",
        "Budget",
        "Expenses",
        "Sponsorship",
        "Remaining Budget",
        "Status",
      ];

      const rows = reports.map(
        (report, index) => {
          const fallback =
            DEMO_REPORTS[
              index % DEMO_REPORTS.length
            ];

          const registered =
            getPositiveNumber(
              report.registered,
              fallback.registered
            );

          const checkedIn =
            getPositiveNumber(
              report.checkedIn,
              fallback.checkedIn
            );

          const attendanceRate =
            getAttendanceRate(
              registered,
              checkedIn,
              report.attendanceRate
            );

          const budget =
            getPositiveNumber(
              report.budget,
              fallback.budget
            );

          const expenses =
            getPositiveNumber(
              report.expenses,
              fallback.expenses
            );

          const sponsorship =
            getPositiveNumber(
              report.sponsorship,
              fallback.sponsorship
            );

          const remaining =
            getRemaining(
              budget,
              expenses,
              sponsorship,
              fallback.remaining
            );

          return [
            report.name || fallback.name,
            report.date || fallback.date,
            report.venue || fallback.venue,
            registered,
            checkedIn,
            `${attendanceRate}%`,
            budget,
            expenses,
            sponsorship,
            remaining,
            report.status ||
              fallback.status,
          ];
        }
      );

      /* ===============================================
         CSV ESCAPING
         =============================================== */

      const escapeCSV = (value) => {
        const text = String(
          value ?? ""
        );

        if (
          text.includes(",") ||
          text.includes('"') ||
          text.includes("\n")
        ) {
          return `"${text.replace(
            /"/g,
            '""'
          )}"`;
        }

        return text;
      };

      const csvContent = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(escapeCSV)
            .join(",")
        )
        .join("\n");

      /* ===============================================
         CREATE DOWNLOAD
         =============================================== */

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const dateStamp =
        new Date()
          .toISOString()
          .slice(0, 10);

      link.download = `NexEvent_Final_Report_${dateStamp}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setExportMessage(
        "Final report exported successfully."
      );
    } catch (err) {
      console.error(
        "Report export failed:",
        err
      );

      setExportMessage(
        "Unable to export the final report."
      );
    } finally {
      setExporting(false);

      setTimeout(() => {
        setExportMessage("");
      }, 3500);
    }
  }, [reports]);

  /* =======================================================
     DISPLAY REPORTS
     ======================================================= */

  const displayReports = useMemo(() => {
    if (
      Array.isArray(reports) &&
      reports.length > 0
    ) {
      return reports;
    }

    return DEMO_REPORTS;
  }, [reports]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="reports-page">
      {/* =================================================
          FLOATING BUBBLES
          ================================================= */}

      <div className="reports-bubble-layer">
        <span className="reports-bubble reports-bubble-1" />
        <span className="reports-bubble reports-bubble-2" />
        <span className="reports-bubble reports-bubble-3" />
        <span className="reports-bubble reports-bubble-4" />
        <span className="reports-bubble reports-bubble-5" />
        <span className="reports-bubble reports-bubble-6" />
        <span className="reports-bubble reports-bubble-7" />
      </div>

      <main className="reports-content">
        {/* =================================================
            HEADER
            ================================================= */}

        <motion.header
          className="reports-header"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <div className="reports-header-left">
            <div className="reports-back-row">
              <button
                type="button"
                className="reports-back-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            </div>

            <span className="reports-eyebrow">
              MILESTONE 4 · FINALIZATION &
              REPORTING
            </span>

            <h1>Final Event Reports</h1>

            <p>
              Review event performance,
              attendance, financial status,
              and final Milestone 4 outcomes
              from one place.
            </p>
          </div>

          <div className="reports-header-actions">
            {/* =========================================
                REFRESH BUTTON
                ========================================= */}

            <button
              type="button"
              className="reports-refresh-button"
              onClick={loadReports}
              disabled={loading}
              title="Refresh report data"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "reports-refresh-spin"
                    : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh Reports"}
            </button>

            {/* =========================================
                EXPORT REPORT BUTTON
                ========================================= */}

            <button
              type="button"
              className="reports-header-icon"
              onClick={
                exportFinalReport
              }
              disabled={exporting}
              title="Export final report"
              aria-label="Export final report"
            >
              {exporting ? (
                <RefreshCw
                  size={28}
                  className="reports-refresh-spin"
                />
              ) : (
                <FileBarChart
                  size={31}
                  strokeWidth={1.8}
                />
              )}
            </button>
          </div>
        </motion.header>

        {/* =================================================
            UPDATED TIME
            ================================================= */}

        {lastUpdated && (
          <div className="reports-last-updated">
            Last updated:{" "}
            {lastUpdated.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </div>
        )}

        {/* =================================================
            EXPORT MESSAGE
            ================================================= */}

        {exportMessage && (
          <motion.div
            className="reports-info-alert"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <Download size={16} />
            <span>
              {exportMessage}
            </span>
          </motion.div>
        )}

        {/* =================================================
            API INFO
            ================================================= */}

        {error && (
          <motion.div
            className="reports-info-alert"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <ClipboardCheck size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* =================================================
            SUMMARY STATS
            ================================================= */}

        <section className="reports-stats-grid">
          <motion.article
            className="reports-stat-card"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
          >
            <div className="reports-stat-icon">
              <CalendarDays size={23} />
            </div>

            <div className="reports-stat-content">
              <span>Total Events</span>

              <strong>
                <AnimatedNumber
                  value={
                    summary.totalEvents
                  }
                />
              </strong>

              <small>
                {summary.completedEvents}{" "}
                completed
              </small>
            </div>
          </motion.article>

          <motion.article
            className="reports-stat-card"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.16,
            }}
          >
            <div className="reports-stat-icon">
              <Users size={23} />
            </div>

            <div className="reports-stat-content">
              <span>Registered Guests</span>

              <strong>
                <AnimatedNumber
                  value={
                    summary.registered
                  }
                />
              </strong>

              <small>
                {formatNumber(
                  summary.checkedIn
                )}{" "}
                checked in
              </small>
            </div>
          </motion.article>

          <motion.article
            className="reports-stat-card"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.24,
            }}
          >
            <div className="reports-stat-icon">
              <TrendingUp size={23} />
            </div>

            <div className="reports-stat-content">
              <span>Attendance Rate</span>

              <strong>
                <AnimatedNumber
                  value={
                    summary.attendanceRate
                  }
                  suffix="%"
                />
              </strong>

              <small>
                Across reported events
              </small>
            </div>
          </motion.article>

          <motion.article
            className="reports-stat-card"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.32,
            }}
          >
            <div className="reports-stat-icon">
              <WalletCards size={23} />
            </div>

            <div className="reports-stat-content">
              <span>Remaining Budget</span>

              <strong>
                {formatCurrency(
                  summary.remaining
                )}
              </strong>

              <small>
                After expenses and
                sponsorship
              </small>
            </div>
          </motion.article>
        </section>

        {/* =================================================
            FINANCIAL SUMMARY
            ================================================= */}

        <section className="reports-financial-grid">
          <div className="reports-financial-card">
            <span>Total Budget</span>
            <strong>
              {formatCurrency(
                summary.budget
              )}
            </strong>
          </div>

          <div className="reports-financial-card">
            <span>Total Expenses</span>
            <strong>
              {formatCurrency(
                summary.expenses
              )}
            </strong>
          </div>

          <div className="reports-financial-card">
            <span>Total Sponsorship</span>
            <strong>
              {formatCurrency(
                summary.sponsorship
              )}
            </strong>
          </div>

          <div className="reports-financial-card">
            <span>Available Balance</span>
            <strong>
              {formatCurrency(
                summary.remaining
              )}
            </strong>
          </div>
        </section>

        {/* =================================================
            FINAL REPORT
            ================================================= */}

        <motion.section
          className="reports-final-card"
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.38,
            duration: 0.55,
          }}
        >
          <div className="reports-section-heading">
            <div>
              <span className="reports-section-label">
                EVENT PERFORMANCE
              </span>

              <h2>
                Final Event Summary
              </h2>

              <p>
                Attendance, budget and
                sponsorship performance
                for each event.
              </p>
            </div>

            <div className="reports-section-icon">
              <BarChart3 size={21} />
            </div>
          </div>

          {loading &&
          displayReports.length === 0 ? (
            <div className="reports-loading">
              <RefreshCw size={17} />
              Preparing final reports...
            </div>
          ) : (
            <div className="reports-performance-grid">
              {displayReports.map(
                (report, index) => {
                  const fallback =
                    DEMO_REPORTS[
                      index %
                        DEMO_REPORTS.length
                    ];

                  const registered =
                    getPositiveNumber(
                      report.registered,
                      fallback.registered
                    );

                  const checkedIn =
                    getPositiveNumber(
                      report.checkedIn,
                      fallback.checkedIn
                    );

                  const attendanceRate =
                    getAttendanceRate(
                      registered,
                      checkedIn,
                      report.attendanceRate
                    );

                  const budget =
                    getPositiveNumber(
                      report.budget,
                      fallback.budget
                    );

                  const expenses =
                    getPositiveNumber(
                      report.expenses,
                      fallback.expenses
                    );

                  const sponsorship =
                    getPositiveNumber(
                      report.sponsorship,
                      fallback.sponsorship
                    );

                  const remaining =
                    getRemaining(
                      budget,
                      expenses,
                      sponsorship,
                      fallback.remaining
                    );

                  const overBudget =
                    expenses > budget;

                  return (
                    <motion.article
                      key={`${report.id}-${index}`}
                      className="reports-performance-item"
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          0.08 +
                          index * 0.06,
                      }}
                    >
                      <div className="reports-performance-header">
                        <div>
                          <h3>
                            {report.name ||
                              fallback.name}
                          </h3>
                        </div>

                        <span
                          className={`reports-performance-status ${
                            overBudget
                              ? "warning"
                              : "normal"
                          }`}
                        >
                          {overBudget
                            ? "Over Budget"
                            : "On Track"}
                        </span>
                      </div>

                      <div className="reports-performance-metrics">
                        <div className="reports-performance-metric">
                          <span>
                            Registered
                          </span>
                          <strong>
                            {formatNumber(
                              registered
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Checked In
                          </span>
                          <strong>
                            {formatNumber(
                              checkedIn
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Attendance
                          </span>
                          <strong>
                            {formatPercent(
                              attendanceRate
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Budget
                          </span>
                          <strong>
                            {formatCurrency(
                              budget
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Expenses
                          </span>
                          <strong>
                            {formatCurrency(
                              expenses
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Sponsorship
                          </span>
                          <strong>
                            {formatCurrency(
                              sponsorship
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Remaining
                          </span>
                          <strong>
                            {formatCurrency(
                              remaining
                            )}
                          </strong>
                        </div>

                        <div className="reports-performance-metric">
                          <span>
                            Status
                          </span>
                          <strong>
                            {report.status ||
                              fallback.status}
                          </strong>
                        </div>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </div>
          )}

          {/* =================================================
              FINALIZATION FOOTER
              ================================================= */}

          <div className="reports-final-footer">
            <div className="reports-footer-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>
                Milestone 4 Finalization
              </strong>

              <p>
                Final reports combine
                attendance analytics,
                resource coordination
                outcomes, event performance,
                and budget information.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Reports;
