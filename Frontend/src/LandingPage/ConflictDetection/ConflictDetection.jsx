import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import "./ConflictDetection.css";

function ConflictDetection() {
  const bubbles = [
    {
      className: "conflict-bubble bubble-one",
      animate: {
        x: [0, 70, -30, 0],
        y: [0, -45, 25, 0],
        scale: [1, 1.12, 0.94, 1],
      },
      duration: 7,
    },
    {
      className: "conflict-bubble bubble-two",
      animate: {
        x: [0, -60, 30, 0],
        y: [0, 35, -30, 0],
        scale: [1, 0.92, 1.1, 1],
      },
      duration: 8,
    },
    {
      className: "conflict-bubble bubble-three",
      animate: {
        x: [0, 45, -45, 0],
        y: [0, -55, 30, 0],
        scale: [1, 1.08, 0.96, 1],
      },
      duration: 6,
    },
    {
      className: "conflict-bubble bubble-four",
      animate: {
        x: [0, -50, 40, 0],
        y: [0, -30, 45, 0],
        scale: [1, 0.94, 1.08, 1],
      },
      duration: 9,
    },
    {
      className: "conflict-bubble bubble-five",
      animate: {
        x: [0, 65, -35, 0],
        y: [0, 40, -45, 0],
        scale: [1, 1.1, 0.95, 1],
      },
      duration: 7.5,
    },
    {
      className: "conflict-bubble bubble-six",
      animate: {
        x: [0, -45, 35, 0],
        y: [0, 50, -35, 0],
        scale: [1, 0.93, 1.1, 1],
      },
      duration: 8.5,
    },
    {
      className: "conflict-bubble bubble-seven",
      animate: {
        x: [0, 55, -40, 0],
        y: [0, -35, 50, 0],
        scale: [1, 1.1, 0.94, 1],
      },
      duration: 6.5,
    },
  ];

  return (
    <section className="conflict-detection">
      {/* VISIBLE MOVING BUBBLE BACKGROUND */}
      <div className="conflict-bubble-field">
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

      <div className="conflict-container">
        <motion.div
          className="conflict-visual"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="conflict-card">
            <div className="conflict-card-header">
              <div>
                <span>SMART CHECK</span>
                <h3>Schedule Monitor</h3>
              </div>

              <div className="monitor-status">
                <ShieldCheck size={16} />
                Active
              </div>
            </div>

            <div className="event-check">
              <div className="event-icon">
                <CalendarDays size={20} />
              </div>

              <div className="event-info">
                <strong>Tech Fest 2026</strong>
                <span>March 24 • 10:00 AM</span>
              </div>
            </div>

            <div className="venue-check">
              <div className="venue-icon">
                <MapPin size={19} />
              </div>

              <div>
                <strong>Main Auditorium</strong>
                <span>Venue requested</span>
              </div>
            </div>

            <motion.div
              className="conflict-alert"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="alert-icon">
                <AlertTriangle size={18} />
              </div>

              <div>
                <strong>Scheduling conflict detected</strong>
                <span>
                  Main Auditorium is already assigned at this time.
                </span>
              </div>
            </motion.div>

            <motion.div
              className="resolution"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="resolution-icon">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <strong>Conflict identified</strong>
                <span>
                  Planner can review available alternatives.
                </span>
              </div>

              <RefreshCw size={17} />
            </motion.div>
          </div>

          <div className="visual-glow" />
        </motion.div>

        <motion.div
          className="conflict-content"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="conflict-label">
            CONFLICT DETECTION
          </span>

          <h2>
            Catch conflicts
            <br />
            <span>before they become problems.</span>
          </h2>

          <p>
            Scheduling conflicts can disrupt an event before it even
            begins. The platform checks important scheduling details
            so planners can identify conflicts early and take action.
          </p>

          <div className="conflict-features">
            <div className="conflict-feature">
              <div className="feature-number">01</div>

              <div>
                <strong>Detect</strong>
                <span>
                  Identify overlapping venue schedules.
                </span>
              </div>
            </div>

            <div className="conflict-feature">
              <div className="feature-number">02</div>

              <div>
                <strong>Review</strong>
                <span>
                  See the conflicting event and schedule details.
                </span>
              </div>
            </div>

            <div className="conflict-feature">
              <div className="feature-number">03</div>

              <div>
                <strong>Resolve</strong>
                <span>
                  Review available options before confirming.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ConflictDetection;