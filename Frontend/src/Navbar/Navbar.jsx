
import { motion } from "framer-motion";
import {
  ArrowRight,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nexEventDarkMode") === "true";
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("nexEventDarkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMenuOpen(false);
  };

  const goToLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    {
      name: "Features",
      action: () => scrollToSection("features"),
    },
    {
      name: "How It Works",
      action: () => scrollToSection("how-it-works"),
    },
    {
      name: "Resources",
      action: () => scrollToSection("resources"),
    },
    {
      name: "Pricing",
      action: () => scrollToSection("pricing"),
    },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
    >
      <div className="navbar-container">
        <button
          className="navbar-logo"
          onClick={() => navigate("/")}
        >
          <span>NexEvent</span>
        </button>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Dark Mode Toggle */}
          <motion.button
            className="theme-toggle"
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </motion.button>

          <button
            className="login-btn"
            onClick={goToLogin}
          >
            Login
          </button>

          <motion.button
            className="get-started-btn"
            onClick={goToLogin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <div className="mobile-actions">
          <motion.button
            className="theme-toggle mobile-theme-toggle"
            onClick={toggleDarkMode}
            whileTap={{ scale: 0.94 }}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </motion.button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
            >
              {link.name}
            </button>
          ))}

          <button
            className="mobile-login"
            onClick={goToLogin}
          >
            Login
          </button>

          <button
            className="mobile-start"
            onClick={goToLogin}
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;
