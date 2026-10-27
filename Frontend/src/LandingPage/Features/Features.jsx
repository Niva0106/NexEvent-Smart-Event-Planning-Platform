import { motion } from "framer-motion";
import {
  CalendarDays,
  Layers3,
  MapPin,
  Users,
  Store,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import "./Features.css";

function Features() {
  const features = [
    {
      icon: <CalendarDays size={22} />,
      title: "Event Management",
      description:
        "Create, view, update, and manage your events from one place.",
    },
    {
      icon: <Layers3 size={22} />,
      title: "Resource Coordination",
      description:
        "Track available resources and allocate them to the events that need them.",
    },
    {
      icon: <MapPin size={22} />,
      title: "Venue Management",
      description:
        "Manage venues and identify scheduling conflicts before assigning them.",
    },
    {
      icon: <Users size={22} />,
      title: "Attendee Management",
      description:
        "Register attendees, generate tickets, and keep registration information organized.",
    },
    {
      icon: <Store size={22} />,
      title: "Vendor Management",
      description:
        "Manage vendors, their services, and assignments to events.",
    },
    {
      icon: <ClipboardCheck size={22} />,
      title: "Attendance Tracking",
      description:
        "Track registered attendees and mark their attendance during events.",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Event Reports",
      description:
        "View event information, registrations, attendance, resources, and vendors.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Conflict Awareness",
      description:
        "Identify important scheduling issues so planners can review them early.",
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-container">

        <motion.div
          className="features-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span>PLATFORM FEATURES</span>

          <h2>
            Everything your event
            <br />
            <span>needs in one place.</span>
          </h2>

          <p>
            Bring event planning, resource coordination, people,
            vendors, and reporting together in one organized platform.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              className="feature-card"
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.07,
              }}
              whileHover={{ y: -7 }}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>

              <span className="feature-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <div className="feature-bottom-line"></div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Features;