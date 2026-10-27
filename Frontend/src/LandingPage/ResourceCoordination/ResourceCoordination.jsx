import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Monitor,
  Mic,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./ResourceCoordination.css";

function ResourceCoordination() {
  const navigate = useNavigate();

  return (
    <section className="resource-coordination" id="resources">

      <div className="resource-container">

        {/* Left Content */}

        <motion.div
          className="resource-content"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >

          <span className="resource-label">
            RESOURCE COORDINATION
          </span>

          <h2>
            Everything you need.
            <br />
            <span>Right where it belongs.</span>
          </h2>

          <p>
            Keep track of equipment, staff, venues,
            and other event resources from a single
            coordination view. Know what is available,
            allocated, and ready before your event begins.
          </p>

          <div className="resource-check-list">

            <div>
              <CheckCircle2 size={25} />
              <span>Track resource availability</span>
            </div>

            <div>
              <CheckCircle2 size={25} />
              <span>Allocate resources to events</span>
            </div>

            <div>
              <CheckCircle2 size={25} />
              <span>Monitor event readiness</span>
            </div>

          </div>

          {/* Working Resource Hub Button */}

          <motion.button
            className="resource-hub-button"
            onClick={() => navigate("/resources")}
            whileHover={{
              scale: 1.03,
              x: 3,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            Explore Resource Hub
            <ArrowRight size={20} />
          </motion.button>

        </motion.div>

        {/* Right Resource Dashboard */}

        <motion.div
          className="resource-preview"
          initial={{
            opacity: 0,
            x: 50,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
        >

          <div className="resource-preview-header">

            <div>
              <span>Resource Overview</span>
              <h3>Tech Fest 2026</h3>
            </div>

            <div className="resource-ready">
              88% Ready
            </div>

          </div>

          <div className="resource-stats">

            <div>
              <strong>12</strong>
              <span>Total Resources</span>
            </div>

            <div>
              <strong>8</strong>
              <span>Allocated</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Available</span>
            </div>

          </div>

          <div className="resource-list">

            <div className="resource-item">

              <div className="resource-item-icon">
                <Monitor size={22} />
              </div>

              <div className="resource-item-info">
                <strong>Projector</strong>
                <span>Equipment</span>
              </div>

              <span className="resource-quantity">
                2 Available
              </span>

              <span className="resource-status available">
                ● Available
              </span>

            </div>

            <div className="resource-item">

              <div className="resource-item-icon">
                <Mic size={22} />
              </div>

              <div className="resource-item-info">
                <strong>Microphone</strong>
                <span>Audio</span>
              </div>

              <span className="resource-quantity">
                6 Available
              </span>

              <span className="resource-status allocated">
                ● Allocated
              </span>

            </div>

            <div className="resource-item">

              <div className="resource-item-icon">
                <Users size={22} />
              </div>

              <div className="resource-item-info">
                <strong>Event Staff</strong>
                <span>Team</span>
              </div>

              <span className="resource-quantity">
                8 Assigned
              </span>

              <span className="resource-status ready">
                ● Ready
              </span>

            </div>

          </div>

          <div className="resource-progress">

            <div className="resource-progress-header">
              <span>Resource Allocation</span>
              <strong>88%</strong>
            </div>

            <div className="resource-progress-bar">
              <span></span>
            </div>

            <p>
              Most required resources are ready for this event.
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default ResourceCoordination;