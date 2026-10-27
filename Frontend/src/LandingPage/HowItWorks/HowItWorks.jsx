import { motion } from "framer-motion";
import {
  CalendarPlus,
  Layers3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <CalendarPlus size={24} />,
      title: "Create Your Event",
      description:
        "Add your event details, date, time, venue, and other requirements in one place.",
    },
    {
      number: "02",
      icon: <Layers3 size={24} />,
      title: "Coordinate Resources",
      description:
        "Allocate venues, equipment, staff, and other resources while keeping everything organized.",
    },
    {
      number: "03",
      icon: <CheckCircle2 size={24} />,
      title: "Track & Resolve",
      description:
        "Monitor event readiness, identify scheduling conflicts, and keep your event on track.",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works-container">

        <motion.div
          className="how-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">HOW IT WORKS</span>

          <h2>
            From planning to execution,
            <span> everything stays connected.</span>
          </h2>

          <p>
            Manage your event journey from one intelligent workspace.
            Create events, coordinate resources, and keep track of
            everything that matters.
          </p>
        </motion.div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-wrapper" key={step.number}>

              <motion.div
                className="step-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                whileHover={{ y: -8 }}
              >
                <div className="step-top">
                  <span className="step-number">{step.number}</span>

                  <div className="step-icon">
                    {step.icon}
                  </div>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                <div className="step-line"></div>
              </motion.div>

              {index < steps.length - 1 && (
                <motion.div
                  className="step-arrow"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2 + 0.3,
                  }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;