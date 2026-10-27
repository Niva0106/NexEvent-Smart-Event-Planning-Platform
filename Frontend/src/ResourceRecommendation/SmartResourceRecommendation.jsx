
import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  Loader2,
  Monitor,
  Mic,
  Package,
  RefreshCw,
  Sparkles,
  Table2,
  UserRound,
  Users,
  Volume2,
} from "lucide-react";

import "./SmartResourceRecommendation.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const eventTypes = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "exhibition", label: "Exhibition" },
  { value: "celebration", label: "Celebration" },
  { value: "corporate", label: "Corporate Event" },
  { value: "webinar", label: "Webinar" },
  { value: "general", label: "General Event" },
];

function getResourceIcon(name) {
  const value = String(name || "").toLowerCase();

  if (value.includes("projector")) return Monitor;
  if (value.includes("microphone")) return Mic;
  if (value.includes("speaker")) return Volume2;
  if (value.includes("staff")) return UserRound;
  if (value.includes("chair")) return Users;
  if (value.includes("table")) return Table2;

  return Package;
}

function SmartResourceRecommendation({
  onApplyRecommendations,
}) {
  const [attendees, setAttendees] = useState("");
  const [eventType, setEventType] = useState("conference");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();

    const count = Number(attendees);

    if (!count || count <= 0) {
      setError("Please enter a valid attendee count.");
      return;
    }

    setLoading(true);
    setError("");
    setApplied(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resources/recommend`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendees: count,
            event_type: eventType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate recommendations."
        );
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      setRecommendations([]);
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAttendees("");
    setEventType("conference");
    setRecommendations([]);
    setError("");
    setApplied(false);
  };

  const handleApply = () => {
    if (typeof onApplyRecommendations === "function") {
      onApplyRecommendations(recommendations);
    }

    setApplied(true);
  };

  return (
    <section className="smart-resource-section">
      {/* HEADER */}
      <div className="smart-resource-header">
        <div className="smart-resource-heading">
          <div className="smart-resource-icon">
            <Brain size={24} />
          </div>

          <div>
            <span className="smart-resource-eyebrow">
              RESOURCE PLANNING
            </span>

            <h2>Smart Resource Recommendation</h2>

            <p>
              Get explainable resource suggestions based on
              attendee count and event type.
            </p>
          </div>
        </div>

        <div className="smart-resource-badge">
          <Sparkles size={14} />
          Rule-Based
        </div>
      </div>

      {/* FORM */}
      <form
        className="smart-resource-form"
        onSubmit={handleGenerate}
      >
        <div className="smart-resource-field">
          <label htmlFor="attendees">
            Expected Attendees
          </label>

          <input
            id="attendees"
            type="number"
            min="1"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Example: 350"
            disabled={loading}
          />
        </div>

        <div className="smart-resource-field">
          <label htmlFor="eventType">
            Event Type
          </label>

          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            disabled={loading}
          >
            {eventTypes.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="smart-resource-generate"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="smart-resource-spinner"
              />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Generate Recommendations
            </>
          )}
        </button>
      </form>

      {/* RESET */}
      <button
        type="button"
        className="smart-resource-reset"
        onClick={handleReset}
        disabled={loading}
      >
        <RefreshCw size={14} />
        Reset
      </button>

      {/* ERROR */}
      {error && (
        <div className="smart-resource-error">
          {error}
        </div>
      )}

      {/* RESULTS */}
      {recommendations.length > 0 && (
        <div className="smart-resource-results">
          <div className="smart-resource-results-header">
            <div>
              <h3>Recommended Resources</h3>

              <p>
                Suggested quantities for {attendees} attendees
              </p>
            </div>

            <span>
              {recommendations.length} Resources
            </span>
          </div>

          <div className="smart-resource-grid">
            {recommendations.map((resource, index) => {
              const Icon = getResourceIcon(resource.name);

              return (
                <div
                  className="smart-resource-card"
                  key={`${resource.name}-${index}`}
                >
                  <div className="smart-resource-card-top">
                    <div className="smart-resource-card-icon">
                      <Icon size={20} />
                    </div>

                    <strong>{resource.quantity}</strong>
                  </div>

                  <h4>{resource.name}</h4>

                  <span className="smart-resource-category">
                    {resource.category}
                  </span>

                  <p>{resource.reason}</p>
                </div>
              );
            })}
          </div>

          {/* APPLY */}
          <div className="smart-resource-apply">
            <div className="smart-resource-apply-text">
              <CheckCircle2 size={21} />

              <div>
                <h4>Use these recommendations?</h4>

                <p>
                  Review the suggested quantities and use
                  them while allocating resources.
                </p>
              </div>
            </div>

            {applied ? (
              <div className="smart-resource-applied">
                <CheckCircle2 size={17} />
                Recommendations Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
              >
                <CheckCircle2 size={17} />
                Use Recommendations
              </button>
            )}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading &&
        recommendations.length === 0 &&
        !error && (
          <div className="smart-resource-empty">
            <Brain size={30} />

            <h3>Ready to recommend resources</h3>

            <p>
              Enter expected attendees and event type above.
            </p>
          </div>
        )}
    </section>
  );
}

export default SmartResourceRecommendation;
