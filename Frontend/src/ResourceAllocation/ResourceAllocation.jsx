
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import "./ResourceAllocation.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function ResourceAllocation() {
  const [events] = useState([
    {
      id: 1,
      name: "Tech Fest 2026",
      date: "March 20, 2026",
      venue: "Main Auditorium",
      attendees: 350,
      eventType: "conference",
    },
    {
      id: 2,
      name: "AI Workshop",
      date: "March 24, 2026",
      venue: "Seminar Hall",
      attendees: 120,
      eventType: "workshop",
    },
    {
      id: 3,
      name: "Python Bootcamp",
      date: "March 28, 2026",
      venue: "Computer Lab",
      attendees: 200,
      eventType: "workshop",
    },
  ]);

  const [resources, setResources] = useState([
    {
      id: 1,
      name: "Projector",
      category: "Equipment",
      total: 5,
      allocated: 2,
    },
    {
      id: 2,
      name: "Microphone",
      category: "Equipment",
      total: 10,
      allocated: 7,
    },
    {
      id: 3,
      name: "Event Staff",
      category: "Staff",
      total: 20,
      allocated: 12,
    },
    {
      id: 4,
      name: "Chairs",
      category: "Furniture",
      total: 500,
      allocated: 350,
    },
    {
      id: 5,
      name: "Tables",
      category: "Furniture",
      total: 80,
      allocated: 55,
    },
    {
      id: 6,
      name: "Speakers",
      category: "Equipment",
      total: 8,
      allocated: 6,
    },
  ]);

  const [allocations, setAllocations] = useState([
    {
      id: 1,
      eventId: 1,
      resourceId: 1,
      quantity: 1,
    },
    {
      id: 2,
      eventId: 1,
      resourceId: 2,
      quantity: 2,
    },
    {
      id: 3,
      eventId: 2,
      resourceId: 3,
      quantity: 4,
    },
    {
      id: 4,
      eventId: 3,
      resourceId: 4,
      quantity: 100,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState(1);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Smart recommendation states */
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);
  const [recommendationError, setRecommendationError] =
    useState("");

  const selectedEventData = events.find(
    (event) => event.id === Number(selectedEvent)
  );

  const eventAllocations = allocations.filter(
    (allocation) => allocation.eventId === Number(selectedEvent)
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) =>
      resource.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const availableResources = resources.filter(
    (resource) => resource.total - resource.allocated > 0
  );

  /*
   * Generate smart resource recommendations
   *
   * The backend uses a rule-based and explainable recommendation
   * system based on attendee count and event type.
   */
  const generateRecommendations = async () => {
    if (!selectedEventData) return;

    setRecommendationLoading(true);
    setRecommendationError("");
    setRecommendations([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resources/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendees: Number(selectedEventData.attendees),
            event_type: selectedEventData.eventType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate resource recommendations."
        );
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      setRecommendationError(
        err.message ||
          "Unable to connect to the resource recommendation service."
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  /*
   * Match a recommended resource with our local inventory.
   */
  const findInventoryResource = (recommendationName) => {
    const normalizedRecommendation = recommendationName
      .toLowerCase()
      .replace(/s$/, "");

    return resources.find((resource) => {
      const normalizedResource = resource.name
        .toLowerCase()
        .replace(/s$/, "");

      return (
        normalizedResource === normalizedRecommendation ||
        normalizedResource.includes(normalizedRecommendation) ||
        normalizedRecommendation.includes(normalizedResource)
      );
    });
  };

  /*
   * Calculate current availability for a recommended resource.
   */
  const getRecommendationStatus = (recommendation) => {
    const required = Number(
      recommendation.required ?? recommendation.quantity ?? 0
    );

    const inventoryResource = findInventoryResource(
      recommendation.name
    );

    if (!inventoryResource) {
      return {
        required,
        available: 0,
        shortage: required,
        status: "Not in inventory",
      };
    }

    const available =
      inventoryResource.total - inventoryResource.allocated;

    return {
      required,
      available,
      shortage: Math.max(0, required - available),
      status:
        available >= required ? "Sufficient" : "Shortage",
    };
  };

  /*
   * Apply all recommendations that can currently be fulfilled.
   */
  const applyRecommendations = () => {
    if (!recommendations.length) return;

    let appliedCount = 0;
    let skippedCount = 0;

    const newAllocations = [];
    const allocationUpdates = {};

    recommendations.forEach((recommendation) => {
      const required = Number(
        recommendation.required ?? recommendation.quantity ?? 0
      );

      const inventoryResource = findInventoryResource(
        recommendation.name
      );

      if (!inventoryResource || required <= 0) {
        skippedCount += 1;
        return;
      }

      const currentAvailable =
        inventoryResource.total -
        inventoryResource.allocated -
        (allocationUpdates[inventoryResource.id] || 0);

      if (currentAvailable <= 0) {
        skippedCount += 1;
        return;
      }

      const quantityToApply = Math.min(
        required,
        currentAvailable
      );

      allocationUpdates[inventoryResource.id] =
        (allocationUpdates[inventoryResource.id] || 0) +
        quantityToApply;

      newAllocations.push({
        id:
          Date.now() +
          Math.random(),
        eventId: Number(selectedEvent),
        resourceId: inventoryResource.id,
        quantity: quantityToApply,
      });

      appliedCount += 1;
    });

    if (appliedCount === 0) {
      setRecommendationError(
        "No recommended resources could be allocated with the current inventory."
      );
      return;
    }

    setResources((currentResources) =>
      currentResources.map((resource) => ({
        ...resource,
        allocated:
          resource.allocated +
          (allocationUpdates[resource.id] || 0),
      }))
    );

    setAllocations((currentAllocations) => [
      ...currentAllocations,
      ...newAllocations,
    ]);

    setSuccess(
      `${appliedCount} recommended resource${
        appliedCount !== 1 ? "s" : ""
      } applied to ${selectedEventData.name}${
        skippedCount > 0
          ? ` (${skippedCount} unavailable)`
          : ""
      }.`
    );

    setTimeout(() => {
      setSuccess("");
    }, 4000);

    generateRecommendations();
  };

  const openAllocationModal = () => {
    setSelectedResource("");
    setQuantity(1);
    setError("");
    setShowModal(true);
  };

  const allocateResource = () => {
    setError("");
    setSuccess("");

    const resource = resources.find(
      (item) => item.id === Number(selectedResource)
    );

    if (!resource) {
      setError("Please select a resource.");
      return;
    }

    const requestedQuantity = Number(quantity);

    if (!requestedQuantity || requestedQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    const available = resource.total - resource.allocated;

    if (requestedQuantity > available) {
      setError(
        `Only ${available} ${resource.name}${
          available !== 1 ? "s" : ""
        } available.`
      );
      return;
    }

    setResources((currentResources) =>
      currentResources.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              allocated: item.allocated + requestedQuantity,
            }
          : item
      )
    );

    setAllocations((currentAllocations) => [
      ...currentAllocations,
      {
        id: Date.now(),
        eventId: Number(selectedEvent),
        resourceId: resource.id,
        quantity: requestedQuantity,
      },
    ]);

    setShowModal(false);

    setSuccess(
      `${resource.name} allocated successfully to ${selectedEventData.name}.`
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);

    if (recommendations.length > 0) {
      setTimeout(() => {
        generateRecommendations();
      }, 100);
    }
  };

  const removeAllocation = (allocation) => {
    const resource = resources.find(
      (item) => item.id === allocation.resourceId
    );

    if (!resource) return;

    setResources((currentResources) =>
      currentResources.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              allocated: Math.max(
                0,
                item.allocated - allocation.quantity
              ),
            }
          : item
      )
    );

    setAllocations((currentAllocations) =>
      currentAllocations.filter(
        (item) => item.id !== allocation.id
      )
    );

    setSuccess(
      `${resource.name} allocation removed successfully.`
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);

    if (recommendations.length > 0) {
      setTimeout(() => {
        generateRecommendations();
      }, 100);
    }
  };

  const getResource = (resourceId) =>
    resources.find((resource) => resource.id === resourceId);

  const totalAllocated = eventAllocations.reduce(
    (sum, allocation) => sum + allocation.quantity,
    0
  );

  const recommendationShortages = recommendations.filter(
    (recommendation) =>
      getRecommendationStatus(recommendation).shortage > 0
  );

  return (
    <div className="allocation-page">

      {/* Header */}
      <div className="allocation-header">
        <div>
          <span className="allocation-eyebrow">
            RESOURCE COORDINATION
          </span>

          <h1>Resource Allocation</h1>

          <p>
            Coordinate event resources manually or generate a
            smart resource plan based on expected attendance.
          </p>
        </div>

        <button
          className="allocation-primary-btn"
          onClick={openAllocationModal}
        >
          <Package size={18} />
          Allocate Resource
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="allocation-success">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Event selector */}
      <section className="event-selector-card">
        <div className="selector-heading">
          <div>
            <span className="section-label">SELECT EVENT</span>
            <h2>Choose an event to manage resources</h2>
          </div>

          <div className="selected-event-badge">
            {eventAllocations.length} allocations
          </div>
        </div>

        <div className="event-selector-row">
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setRecommendations([]);
              setRecommendationError("");
            }}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          {selectedEventData && (
            <div className="selected-event-info">
              <strong>{selectedEventData.name}</strong>

              <span>{selectedEventData.date}</span>

              <span>{selectedEventData.venue}</span>

              <span>
                <Users size={14} />
                {selectedEventData.attendees} expected attendees
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Smart Resource Planning */}
      <section className="smart-planning-section">
        <div className="smart-planning-header">
          <div className="smart-planning-title">
            <div className="smart-icon">
              <Brain size={21} />
            </div>

            <div>
              <span className="section-label">
                MILESTONE 1 · RESOURCE COORDINATION
              </span>

              <h2>Smart Resource Planning</h2>

              <p>
                Generate explainable resource requirements using
                expected attendance and event type.
              </p>
            </div>
          </div>

          <button
            className="generate-plan-btn"
            onClick={generateRecommendations}
            disabled={recommendationLoading}
          >
            {recommendationLoading ? (
              <>
                <RefreshCw size={17} className="spin-icon" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Generate Resource Plan
              </>
            )}
          </button>
        </div>

        {selectedEventData && (
          <div className="planning-details">
            <div className="planning-detail">
              <span>EXPECTED ATTENDANCE</span>
              <strong>
                <Users size={16} />
                {selectedEventData.attendees}
              </strong>
            </div>

            <div className="planning-detail">
              <span>EVENT TYPE</span>
              <strong>
                {selectedEventData.eventType
                  .replace("-", " ")
                  .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                  )}
              </strong>
            </div>

            <div className="planning-detail">
              <span>VENUE</span>
              <strong>{selectedEventData.venue}</strong>
            </div>
          </div>
        )}

        {recommendationError && (
          <div className="recommendation-error">
            <AlertTriangle size={18} />
            <span>{recommendationError}</span>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendation-results">

            <div className="recommendation-results-top">
              <div>
                <span className="section-label">
                  RESOURCE REQUIREMENTS
                </span>

                <h3>
                  Recommended resources for{" "}
                  {selectedEventData?.name}
                </h3>
              </div>

              <div className="recommendation-summary">
                {recommendationShortages.length > 0 ? (
                  <span className="summary-shortage">
                    <AlertTriangle size={15} />
                    {recommendationShortages.length} shortage
                    {recommendationShortages.length !== 1
                      ? "s"
                      : ""}
                  </span>
                ) : (
                  <span className="summary-ready">
                    <CheckCircle2 size={15} />
                    Plan is fully supported
                  </span>
                )}
              </div>
            </div>

            <div className="recommendation-grid">
              {recommendations.map((recommendation, index) => {
                const status =
                  getRecommendationStatus(recommendation);

                return (
                  <div
                    className={`recommendation-card ${
                      status.shortage > 0
                        ? "has-shortage"
                        : "is-sufficient"
                    }`}
                    key={`${recommendation.name}-${index}`}
                  >
                    <div className="recommendation-card-top">
                      <div className="recommendation-resource-icon">
                        <Package size={18} />
                      </div>

                      {status.shortage > 0 ? (
                        <span className="recommendation-status shortage">
                          <AlertTriangle size={13} />
                          {status.status}
                        </span>
                      ) : (
                        <span className="recommendation-status sufficient">
                          <CheckCircle2 size={13} />
                          {status.status}
                        </span>
                      )}
                    </div>

                    <h4>{recommendation.name}</h4>

                    <div className="recommendation-numbers">
                      <div>
                        <span>Required</span>
                        <strong>{status.required}</strong>
                      </div>

                      <div>
                        <span>Available</span>
                        <strong>{status.available}</strong>
                      </div>
                    </div>

                    {status.shortage > 0 && (
                      <div className="shortage-message">
                        Short by{" "}
                        <strong>{status.shortage}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="recommendation-footer">
              <p>
                Recommendations are generated using the project's
                rule-based resource planning logic.
              </p>

              <button
                className="apply-recommendations-btn"
                onClick={applyRecommendations}
              >
                <CheckCircle2 size={17} />
                Apply Available Recommendations
              </button>
            </div>
          </div>
        )}

        {!recommendationLoading &&
          recommendations.length === 0 &&
          !recommendationError && (
            <div className="recommendation-empty">
              <div className="empty-plan-icon">
                <Sparkles size={25} />
              </div>

              <div>
                <strong>Ready to create a resource plan</strong>
                <p>
                  Generate recommendations to compare event
                  requirements with your available inventory.
                </p>
              </div>
            </div>
          )}
      </section>

      {/* Stats */}
      <div className="allocation-stats">
        <div className="allocation-stat">
          <div className="stat-icon purple">
            <Package size={19} />
          </div>

          <div>
            <span>Total Allocated</span>
            <strong>{totalAllocated}</strong>
          </div>
        </div>

        <div className="allocation-stat">
          <div className="stat-icon blue">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Resource Types</span>
            <strong>{eventAllocations.length}</strong>
          </div>
        </div>

        <div className="allocation-stat">
          <div className="stat-icon green">
            <Package size={19} />
          </div>

          <div>
            <span>Available Resources</span>
            <strong>{availableResources.length}</strong>
          </div>
        </div>
      </div>

      {/* Allocated resources */}
      <section className="allocated-section">
        <div className="section-top">
          <div>
            <span className="section-label">
              CURRENT ALLOCATIONS
            </span>

            <h2>{selectedEventData?.name}</h2>
          </div>

          <div className="resource-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="allocation-table-wrapper">
          <table className="allocation-table">
            <thead>
              <tr>
                <th>RESOURCE</th>
                <th>CATEGORY</th>
                <th>ALLOCATED</th>
                <th>AVAILABLE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {eventAllocations.map((allocation) => {
                const resource = getResource(
                  allocation.resourceId
                );

                if (!resource) return null;

                const available =
                  resource.total - resource.allocated;

                return (
                  <tr key={allocation.id}>
                    <td>
                      <div className="resource-name">
                        <div className="resource-icon">
                          <Package size={17} />
                        </div>

                        <div>
                          <strong>{resource.name}</strong>
                          <span>
                            Total: {resource.total}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {resource.category}
                      </span>
                    </td>

                    <td>
                      <strong>{allocation.quantity}</strong>
                    </td>

                    <td>{available}</td>

                    <td>
                      <span className="status-badge allocated">
                        Allocated
                      </span>
                    </td>

                    <td>
                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeAllocation(allocation)
                        }
                        title="Remove allocation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {eventAllocations.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-allocation">
                      <Package size={32} />

                      <h3>No resources allocated</h3>

                      <p>
                        Start by allocating resources to this
                        event.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Resource inventory */}
      <section className="availability-section">
        <div className="section-top">
          <div>
            <span className="section-label">
              RESOURCE INVENTORY
            </span>

            <h2>Available resources</h2>
          </div>
        </div>

        <div className="resource-grid">
          {filteredResources.map((resource) => {
            const available =
              resource.total - resource.allocated;

            const percentage =
              resource.total > 0
                ? Math.round(
                    (available / resource.total) * 100
                  )
                : 0;

            return (
              <div
                className="availability-card"
                key={resource.id}
              >
                <div className="availability-card-top">
                  <div className="availability-icon">
                    <Package size={19} />
                  </div>

                  <span className="category-badge">
                    {resource.category}
                  </span>
                </div>

                <h3>{resource.name}</h3>

                <div className="quantity-row">
                  <span>Available</span>
                  <strong>{available}</strong>
                </div>

                <div className="availability-bar">
                  <div
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="availability-footer">
                  <span>
                    {resource.allocated} allocated
                  </span>

                  <span>{resource.total} total</span>
                </div>

                <button
                  className="quick-allocate"
                  onClick={() => {
                    setSelectedResource(resource.id);
                    setQuantity(1);
                    setError("");
                    setShowModal(true);
                  }}
                  disabled={available === 0}
                >
                  Allocate
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Allocation Modal */}
      {showModal && (
        <div
          className="allocation-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="allocation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-label">
                  RESOURCE ALLOCATION
                </span>

                <h2>Allocate Resource</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-event">
              <span>Event</span>

              <strong>{selectedEventData?.name}</strong>
            </div>

            <div className="form-group">
              <label>Select Resource</label>

              <select
                value={selectedResource}
                onChange={(e) =>
                  setSelectedResource(e.target.value)
                }
              >
                <option value="">
                  Choose a resource
                </option>

                {resources.map((resource) => {
                  const available =
                    resource.total - resource.allocated;

                  return (
                    <option
                      key={resource.id}
                      value={resource.id}
                      disabled={available === 0}
                    >
                      {resource.name} — {available} available
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>Required Quantity</label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />
            </div>

            {error && (
              <div className="allocation-error">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={allocateResource}
              >
                <CheckCircle2 size={17} />
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceAllocation;
