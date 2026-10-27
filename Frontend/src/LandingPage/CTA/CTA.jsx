import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Layers3,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./CTA.css";

function CTA() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <section className="cta-section">
      <div className="cta-glow cta-glow-one"></div>
      <div className="cta-glow cta-glow-two"></div>

      <div className="cta-container">

        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <span className="cta-label">
            READY TO GET STARTED?
          </span>

          <h2>
            Plan your next event
            <br />
            <span>with everything connected.</span>
          </h2>

          <p>
            Create your event, coordinate resources, manage your team,
            and keep every important detail organized from one place.
          </p>

          <div className="cta-buttons">
            <motion.button
              type="button"
              className="cta-primary-btn"
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              type="button"
              className="cta-secondary-btn"
              onClick={handleDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Dashboard
            </motion.button>
          </div>

          <div className="cta-note">
            <CheckCircle2 size={16} />
            <span>Start organizing your event in one workspace.</span>
          </div>
        </motion.div>

        <motion.div
          className="cta-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="cta-card cta-card-one"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="cta-card-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>UPCOMING EVENT</span>
              <strong>Tech Fest 2026</strong>
            </div>
          </motion.div>

          <motion.div
            className="cta-card cta-card-two"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="cta-card-icon">
              <Layers3 size={20} />
            </div>

            <div>
              <span>RESOURCE STATUS</span>
              <strong>86% Ready</strong>
            </div>

            <div className="cta-status-dot"></div>
          </motion.div>

          <div className="cta-center-card">
            <div className="cta-center-icon">
              ✦
            </div>

            <span>EVENT CONTROL CENTER</span>

            <strong>
              Everything
              <br />
              connected.
            </strong>

            <div className="cta-progress">
              <div></div>
            </div>

            <small>Event readiness</small>
          </div>

          <div className="cta-orbit orbit-one"></div>
          <div className="cta-orbit orbit-two"></div>
        </motion.div>

      </div>
    </section>
  );
}

export default CTA;