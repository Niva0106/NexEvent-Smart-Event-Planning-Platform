import {
  ArrowLeft,
  Bell,
  Lock,
  User,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const currentUser =
    JSON.parse(localStorage.getItem("eventflowCurrentUser")) || {
      name: "Admin",
      email: "admin@eventflow.com",
    };

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const closePasswordModal = () => {
    resetPasswordForm();
    setShowPasswordModal(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    const adminEmail = "admin@NexEvent.com";
    const adminPassword = "NexEvent123";

    if (currentUser.email === adminEmail) {
      if (currentPassword !== adminPassword) {
        setPasswordError(
          "Current password is incorrect."
        );
        return;
      }

      localStorage.setItem(
        "eventflowAdminPassword",
        newPassword
      );

      setPasswordSuccess(
        "Password changed successfully."
      );

      setTimeout(() => {
        closePasswordModal();
      }, 1200);

      return;
    }

    const existingUsers =
      JSON.parse(
        localStorage.getItem("eventflowUsers")
      ) || [];

    const userIndex = existingUsers.findIndex(
      (user) =>
        user.email.toLowerCase() ===
        currentUser.email.toLowerCase()
    );

    if (userIndex === -1) {
      setPasswordError(
        "User account could not be found."
      );
      return;
    }

    if (
      existingUsers[userIndex].password !==
      currentPassword
    ) {
      setPasswordError(
        "Current password is incorrect."
      );
      return;
    }

    existingUsers[userIndex].password = newPassword;

    localStorage.setItem(
      "eventflowUsers",
      JSON.stringify(existingUsers)
    );

    setPasswordSuccess(
      "Password changed successfully."
    );

    setTimeout(() => {
      closePasswordModal();
    }, 1200);
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <button
            className="settings-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <h1>Settings</h1>

          <p>
            Manage your EventFlow account and preferences.
          </p>
        </div>
      </header>

      <div className="settings-container">
        <div className="settings-card">
          <div className="settings-card-icon">
            <User size={21} />
          </div>

          <div className="settings-card-content">
            <h2>Profile</h2>

            <p>
              Your account information.
            </p>

            <div className="settings-profile">
              <div className="settings-avatar">
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  {currentUser.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon">
            <Bell size={21} />
          </div>

          <div className="settings-card-content">
            <h2>Notifications</h2>

            <p>
              Manage event and resource notifications.
            </p>

            <label className="settings-toggle-row">
              <span>
                Enable notifications
              </span>

              <input
                type="checkbox"
                defaultChecked
              />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon">
            <Lock size={21} />
          </div>

          <div className="settings-card-content">
            <h2>Security</h2>

            <p>
              Manage your account security settings.
            </p>

            <button
              className="settings-action-button"
              onClick={() =>
                setShowPasswordModal(true)
              }
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div
          className="settings-modal-overlay"
          onClick={closePasswordModal}
        >
          <div
            className="settings-password-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="settings-modal-close"
              onClick={closePasswordModal}
            >
              <X size={20} />
            </button>

            <div className="settings-modal-icon">
              <Lock size={24} />
            </div>

            <h2>Change Password</h2>

            <p>
              Enter your current password and choose a new one.
            </p>

            <form
              onSubmit={handleChangePassword}
              className="settings-password-form"
            >
              <div className="settings-password-field">
                <label>
                  Current Password
                </label>

                <div>
                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-password-field">
                <label>
                  New Password
                </label>

                <div>
                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-password-field">
                <label>
                  Confirm New Password
                </label>

                <div>
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
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

              {passwordError && (
                <div className="settings-password-error">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="settings-password-success">
                  {passwordSuccess}
                </div>
              )}

              <div className="settings-password-actions">
                <button
                  type="button"
                  className="settings-cancel-button"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="settings-save-button"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;