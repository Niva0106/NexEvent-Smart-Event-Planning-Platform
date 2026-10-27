import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <section className="hero">
      <div className="hero-background-glow"></div>

      <div className="hero-container">
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            SMART EVENT PLANNING PLATFORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Plan your next
            <br />
            event
            <br />
            <span>with everything</span>
            <br />
            <span>connected.</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Create your event, coordinate resources, manage your team, and keep
            every important detail organized from one place.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              type="button"
              className="hero-primary-button"
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight size={20} />
            </button>

            <button
              type="button"
              className="hero-secondary-button"
              onClick={handleDashboard}
            >
              Explore Dashboard
            </button>
          </motion.div>

          <motion.div
            className="hero-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Start organizing your event in one workspace.
          </motion.div>
        </div>

        <div className="hero-visual">
          <motion.div
            className="hero-orbit hero-orbit-one"
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="hero-orbit hero-orbit-two"
            animate={{ rotate: -360 }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="hero-resource-card hero-resource-card-top"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="hero-resource-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <small>UPCOMING</small>
              <strong>Tech Fest 2026</strong>
            </div>
          </motion.div>

          <motion.div
            className="hero-dashboard-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="hero-dashboard-header">
              <div>
                <small>EVENT CONTROL CENTER</small>
                <h3>Tech Fest 2026</h3>
              </div>

              <div className="hero-status">
                <CheckCircle2 size={16} />
                Ready
              </div>
            </div>

            <div className="hero-readiness">
              <div className="hero-readiness-header">
                <span>Event Readiness</span>
                <strong>86%</strong>
              </div>

              <div className="hero-progress">
                <div style={{ width: "86%" }}></div>
              </div>
            </div>

            <div className="hero-dashboard-stats">
              <div>
                <strong>24</strong>
                <span>Resources</span>
              </div>

              <div>
                <strong>18</strong>
                <span>Tasks</span>
              </div>

              <div>
                <strong>320</strong>
                <span>Attendees</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-resource-card hero-resource-card-bottom"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="hero-resource-icon">
              <Users size={22} />
            </div>

            <div>
              <small>TEAM</small>
              <strong>12 Members</strong>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;