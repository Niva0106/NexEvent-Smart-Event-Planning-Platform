import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <div className="footer-logo">
            <span>NE</span>
            NexEvent
          </div>

          <p>
            A smart event planning platform for managing events,
            resources, teams, and schedules in one place.
          </p>
        </div>

        <div className="footer-column">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#resources">Resources</a>
          <a href="#how-it-works">How It Works</a>
        </div>

        <div className="footer-column">
          <h4>Platform</h4>
          <a href="#features">Event Management</a>
          <a href="#resources">Resource Coordination</a>
          <a href="#features">Reports</a>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Support</a>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          © 2026 EventFlow. Smart event planning platform.
        </span>

        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}

export default Footer;