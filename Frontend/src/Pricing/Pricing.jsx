import { Check } from "lucide-react";
import "./Pricing.css";

function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <span>PRICING</span>
          <h2>Simple plans for every event team.</h2>
          <p>
            Choose a plan that fits your event planning and coordination needs.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <p className="pricing-description">
              For small event teams getting started.
            </p>

            <div className="pricing-price">
              <strong>Free</strong>
            </div>

            <button className="pricing-button">
              Get Started
            </button>

            <div className="pricing-features">
              <div>
                <Check size={17} />
                Event management
              </div>

              <div>
                <Check size={17} />
                Resource tracking
              </div>

              <div>
                <Check size={17} />
                Basic event reports
              </div>

              <div>
                <Check size={17} />
                Team coordination
              </div>
            </div>
          </div>

          <div className="pricing-card pricing-card-featured">
            <div className="pricing-popular">
              Popular
            </div>

            <h3>Professional</h3>
            <p className="pricing-description">
              For teams managing multiple events.
            </p>

            <div className="pricing-price">
              <strong>₹999</strong>
              <span>/ month</span>
            </div>

            <button className="pricing-button">
              Get Started
            </button>

            <div className="pricing-features">
              <div>
                <Check size={17} />
                Everything in Starter
              </div>

              <div>
                <Check size={17} />
                Resource allocation
              </div>

              <div>
                <Check size={17} />
                Conflict detection
              </div>

              <div>
                <Check size={17} />
                Advanced reports
              </div>

              <div>
                <Check size={17} />
                Smart insights
              </div>
            </div>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <p className="pricing-description">
              For organizations with larger event operations.
            </p>

            <div className="pricing-price">
              <strong>Custom</strong>
            </div>

            <button className="pricing-button">
              Contact Us
            </button>

            <div className="pricing-features">
              <div>
                <Check size={17} />
                Everything in Professional
              </div>

              <div>
                <Check size={17} />
                Multiple event teams
              </div>

              <div>
                <Check size={17} />
                Advanced coordination
              </div>

              <div>
                <Check size={17} />
                Custom support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;