import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password;

    // Empty fields
    if (!enteredEmail || !enteredPassword) {
      setError("Please enter your email and password.");
      return;
    }

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    const adminEmail = "admin@nexevent.com";
    const adminPassword = "NexEvent123";

    if (
      enteredEmail === adminEmail &&
      enteredPassword === adminPassword
    ) {
      localStorage.setItem("eventflowLoggedIn", "true");

      localStorage.setItem(
        "eventflowCurrentUser",
        JSON.stringify({
          name: "Admin",
          email: adminEmail,
        })
      );

      navigate("/dashboard");
      return;
    }

    // =====================================================
    // REGISTERED USERS
    // =====================================================

    let existingUsers = [];

    try {
      existingUsers =
        JSON.parse(
          localStorage.getItem("eventflowUsers")
        ) || [];
    } catch {
      existingUsers = [];
    }

    const user = existingUsers.find(
      (registeredUser) =>
        String(registeredUser.email || "")
          .trim()
          .toLowerCase() === enteredEmail &&
        String(registeredUser.password || "") ===
          enteredPassword
    );

    if (user) {
      localStorage.setItem("eventflowLoggedIn", "true");

      localStorage.setItem(
        "eventflowCurrentUser",
        JSON.stringify({
          name: user.name,
          email: user.email,
        })
      );

      navigate("/dashboard");
      return;
    }

    // =====================================================
    // INVALID LOGIN
    // =====================================================

    setError(
      "Invalid email or password. Please check your credentials."
    );
  };

  return (
    <div className="login-page">
      <button
        type="button"
        className="login-back"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="login-container">
        {/* Left Side */}
        <motion.div
          className="login-message"
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <div className="login-logo">
            <span>NE</span>
            NexEvent
          </div>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Manage your events, coordinate resources,
            and keep your entire event workflow
            organized from one intelligent platform.
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="login-card"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
        >
          <div className="login-card-header">
            <h2>Login</h2>

            <p>
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="login-field">
              <label>Email Address</label>

              <div className="login-input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label>Password</label>

              <div className="login-input-wrapper">
                <Lock size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Options */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setError(
                    "Password recovery will be connected to the backend later."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="login-submit"
            >
              Login
            </button>
          </form>

          {/* Register */}
          <div className="create-account">
            Don't have an account?

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;