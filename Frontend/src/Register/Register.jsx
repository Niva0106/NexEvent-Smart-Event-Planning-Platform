import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get existing users
    const existingUsers =
      JSON.parse(localStorage.getItem("eventflowUsers")) || [];

    // Check existing email
    const userExists = existingUsers.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      setError(
        "An account with this email already exists."
      );
      return;
    }

    // Create new user
    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    // Save user
    localStorage.setItem(
      "eventflowUsers",
      JSON.stringify([
        ...existingUsers,
        newUser,
      ])
    );

    setSuccess(
      "Account created successfully! Redirecting to login..."
    );

    // Go to login
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="register-page">

      {/* Back Home */}
      <button
        className="register-back"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="register-container">

        {/* Left Side */}
        <motion.div
          className="register-info"
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

          <div className="register-logo">
            <span>EF</span>
            EventFlow
          </div>

          <h1>
            Start planning
            <br />
            <span>smarter.</span>
          </h1>

          <p>
            Create your EventFlow account and start
            organizing events, resources and teams
            from one intelligent platform.
          </p>

          <div className="register-benefits">

            <div>
              <span>✓</span>
              Manage your events
            </div>

            <div>
              <span>✓</span>
              Coordinate resources
            </div>

            <div>
              <span>✓</span>
              Track event readiness
            </div>

          </div>

        </motion.div>

        {/* Register Card */}
        <motion.div
          className="register-card"
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

          <div className="register-card-header">

            <h2>Create Account</h2>

            <p>
              Create your EventFlow account to get started.
            </p>

          </div>

          <form onSubmit={handleRegister}>

            {/* Name */}
            <div className="register-field">

              <label>Full Name</label>

              <div className="register-input-wrapper">

                <User size={18} />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Email */}
            <div className="register-field">

              <label>Email Address</label>

              <div className="register-input-wrapper">

                <Mail size={18} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Password */}
            <div className="register-field">

              <label>Password</label>

              <div className="register-input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
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

            {/* Confirm Password */}
            <div className="register-field">

              <label>Confirm Password</label>

              <div className="register-input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="register-success">
                {success}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="register-submit"
            >
              Create Account
            </button>

          </form>

          {/* Login Link */}
          <div className="register-login">

            Already have an account?

            <button
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </motion.div>

      </div>
    </div>
  );
}

export default Register;