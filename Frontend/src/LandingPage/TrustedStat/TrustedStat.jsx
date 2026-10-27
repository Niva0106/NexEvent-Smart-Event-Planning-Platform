import { motion } from "framer-motion";
import {
  CalendarCheck2,
  Layers3,
  Users,
  Zap,
} from "lucide-react";
import "./TrustedStat.css";

function TrustedStats() {
  const stats = [
    {
      icon: <CalendarCheck2 size={21} />,
      number: "2,500+",
      label: "Events Planned",
    },
    {
      icon: <Layers3 size={21} />,
      number: "18K+",
      label: "Resources Coordinated",
    },
    {
      icon: <Users size={21} />,
      number: "8,000+",
      label: "Team Members",
    },
    {
      icon: <Zap size={21} />,
      number: "94%",
      label: "Planning Efficiency",
    },
  ];

  return (
    <section className="trusted-stats">
      <div className="trusted-stats-container">

        <motion.div
          className="stats-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span>BUILT FOR BETTER EVENTS</span>
          <p>
            Everything you need to plan, coordinate,
            and deliver successful events.
          </p>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              className="stat-item"
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{ y: -5 }}
            >
              <div className="stat-icon">
                {stat.icon}
              </div>

              <div className="stat-number">
                {stat.number}
              </div>

              <div className="stat-label">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TrustedStats;