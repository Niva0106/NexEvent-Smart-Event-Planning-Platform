import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Users,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import "./DashboardPreview.css";

function DashboardPreview() {
  return (
    <section className="dashboard-preview">
      <div className="dashboard-preview-container">

        <motion.div
          className="dashboard-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span>YOUR EVENT CONTROL CENTER</span>

          <h2>
            See everything.
            <br />
            <span>Control everything.</span>
          </h2>

          <p>
            Get a clear overview of your events, resources, tasks,
            schedules, and potential issues from one central dashboard.
          </p>
        </motion.div>

        <motion.div
          className="dashboard-window"
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
        >
          <div className="dashboard-window-top">
            <div className="window-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="window-title">
              NexEvent / Dashboard
            </div>

            <div className="window-user">
              AK
            </div>
          </div>

          <div className="dashboard-layout">

            <aside className="dashboard-sidebar">
              <div className="sidebar-logo">
                <span>NE</span>
                NexEvent
              </div>

              <div className="sidebar-menu">
                <div className="sidebar-item active">
                  <Layers3 size={16} />
                  Dashboard
                </div>

                <div className="sidebar-item">
                  <CalendarDays size={16} />
                  Events
                </div>

                <div className="sidebar-item">
                  <Layers3 size={16} />
                  Resources
                </div>

                <div className="sidebar-item">
                  <Clock3 size={16} />
                  Schedule
                </div>

                <div className="sidebar-item">
                  <Users size={16} />
                  Team
                </div>
              </div>
            </aside>

            <div className="dashboard-main">

              <div className="dashboard-welcome">
                <div>
                  <span>MONDAY, MARCH 16</span>
                  <h3>Good morning, Sahithi 👋</h3>
                </div>

                <button>
                  View Event
                  <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="preview-stats">

                <div className="preview-stat">
                  <div className="preview-stat-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <strong>04</strong>
                    <span>Upcoming Events</span>
                  </div>
                </div>

                <div className="preview-stat">
                  <div className="preview-stat-icon">
                    <Layers3 size={17} />
                  </div>

                  <div>
                    <strong>86%</strong>
                    <span>Resource Ready</span>
                  </div>
                </div>

                <div className="preview-stat">
                  <div className="preview-stat-icon">
                    <Users size={17} />
                  </div>

                  <div>
                    <strong>42</strong>
                    <span>Team Members</span>
                  </div>
                </div>

                <div className="preview-stat">
                  <div className="preview-stat-icon">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <strong>24</strong>
                    <span>Tasks Done</span>
                  </div>
                </div>

              </div>

              <div className="dashboard-grid">

                <div className="upcoming-card">
                  <div className="preview-card-header">
                    <div>
                      <span>UPCOMING EVENT</span>
                      <h4>Tech Fest 2026</h4>
                    </div>

                    <span className="event-status">
                      Planning
                    </span>
                  </div>

                  <div className="event-details">
                    <div>
                      <CalendarDays size={15} />
                      March 24, 2026
                    </div>

                    <div>
                      <Clock3 size={15} />
                      10:00 AM
                    </div>

                    <div>
                      <Users size={15} />
                      350 Attendees
                    </div>
                  </div>

                  <div className="readiness-preview">
                    <div>
                      <span>Event Readiness</span>
                      <strong>86%</strong>
                    </div>

                    <div className="readiness-track">
                      <div></div>
                    </div>
                  </div>
                </div>

                <div className="issues-card">
                  <div className="preview-card-header">
                    <div>
                      <span>ATTENTION</span>
                      <h4>Items to Review</h4>
                    </div>

                    <AlertTriangle size={18} />
                  </div>

                  <div className="issue-item">
                    <span className="issue-dot"></span>
                    <div>
                      <strong>2 resources</strong>
                      <span>Need allocation</span>
                    </div>
                  </div>

                  <div className="issue-item">
                    <span className="issue-dot"></span>
                    <div>
                      <strong>1 schedule</strong>
                      <span>Needs review</span>
                    </div>
                  </div>

                  <div className="issue-item">
                    <span className="issue-dot"></span>
                    <div>
                      <strong>3 tasks</strong>
                      <span>Due this week</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="activity-card">
                <div className="preview-card-header">
                  <div>
                    <span>RECENT ACTIVITY</span>
                    <h4>Event Coordination</h4>
                  </div>

                  <span className="activity-live">
                    Live
                  </span>
                </div>

                <div className="activity-list">

                  <div className="activity-item">
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>Projector allocated</strong>
                      <span>Tech Fest 2026 • 5 min ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <Users size={16} />
                    <div>
                      <strong>8 staff members assigned</strong>
                      <span>Tech Fest 2026 • 18 min ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <CalendarDays size={16} />
                    <div>
                      <strong>Event schedule updated</strong>
                      <span>Workshop • 32 min ago</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default DashboardPreview;