
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Brain,
  CheckCircle2,
  ClipboardList,
  Package,
  Sparkles,
  Users,
  Plus,
  Pencil,
  Save,
  X,
} from "lucide-react";

import SmartResourceRecommendation from "../ResourceRecommendation/SmartResourceRecommendation";

import "./Resources.css";

const initialResources = [
  {
    id: 1,
    name: "Projector",
    category: "Audio Visual",
    quantity: 5,
    allocated: 3,
    available: 2,
  },
  {
    id: 2,
    name: "Microphone",
    category: "Audio Visual",
    quantity: 12,
    allocated: 7,
    available: 5,
  },
  {
    id: 3,
    name: "Event Staff",
    category: "Staff",
    quantity: 25,
    allocated: 18,
    available: 7,
  },
  {
    id: 4,
    name: "Chairs",
    category: "Furniture",
    quantity: 500,
    allocated: 350,
    available: 150,
  },
  {
    id: 5,
    name: "Tables",
    category: "Furniture",
    quantity: 60,
    allocated: 42,
    available: 18,
  },
  {
    id: 6,
    name: "Speakers",
    category: "Audio Visual",
    quantity: 10,
    allocated: 6,
    available: 4,
  },
];


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function Resources() {
  const [resources, setResources] = useState([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    quantity: "",
  });

  const loadResources = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resources/inventory`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load inventory.");
      }

      setResources(data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const totalResources = resources.reduce(
    (total, resource) => total + Number(resource.quantity || 0),
    0
  );

  const allocatedResources = resources.reduce(
    (total, resource) => total + Number(resource.allocated || 0),
    0
  );

  const availableResources = resources.reduce(
    (total, resource) => total + Number(resource.available || 0),
    0
  );

  const resourceTypes = resources.length;

  const openAddForm = () => {
    setEditingResource(null);
    setFormData({
      name: "",
      category: "General",
      quantity: "",
    });
    setError("");
    setSuccess("");
    setShowResourceForm(true);
  };

  const openEditForm = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      category: resource.category,
      quantity: String(resource.quantity),
    });
    setError("");
    setSuccess("");
    setShowResourceForm(true);
  };

  const closeResourceForm = () => {
    setShowResourceForm(false);
    setEditingResource(null);
    setFormData({
      name: "",
      category: "General",
      quantity: "",
    });
  };

  const handleSubmitResource = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const category = formData.category.trim() || "General";
    const quantity = Number(formData.quantity);

    if (!name) {
      setError("Enter a resource name.");
      return;
    }

    if (
      formData.quantity.trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    if (
      editingResource &&
      quantity < Number(editingResource.allocated || 0)
    ) {
      setError(
        `Quantity cannot be less than the allocated amount (${editingResource.allocated}).`
      );
      return;
    }
    setSaving(true);

    try {
      const isEditing = Boolean(editingResource);

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/resources/inventory/${editingResource.id}`
          : `${API_BASE_URL}/api/resources/inventory`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save the resource.");
      }

      await loadResources();
      closeResourceForm();
      setSuccess(
        isEditing
          ? "Resource updated successfully."
          : "Resource added successfully."
      );
    } catch (err) {
      setError(err.message || "Could not save the resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyRecommendations = async (recommendations) => {
    if (!Array.isArray(recommendations)) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      for (const recommendation of recommendations) {
        const name = String(recommendation?.name || "").trim();
        const quantity = Number(recommendation?.quantity || 0);

        if (
          !name ||
          !Number.isSafeInteger(quantity) ||
          quantity <= 0
        ) {
          continue;
        }

        const existing = resources.find(
          (resource) =>
            resource.name.trim().toLowerCase() === name.toLowerCase()
        );

        const response = await fetch(
          existing
            ? `${API_BASE_URL}/api/resources/inventory/${existing.id}`
            : `${API_BASE_URL}/api/resources/inventory`,
          {
            method: existing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              name,
              category:
                recommendation.category ||
                existing?.category ||
                "General",
              quantity: existing
                ? Math.max(existing.quantity, quantity)
                : quantity,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Could not apply ${name}.`);
        }
      }

      await loadResources();
      setShowRecommendation(false);
      setSuccess("Recommendations saved to inventory.");
    } catch (err) {
      setError(err.message || "Could not apply recommendations.");
      await loadResources();
    } finally {
      setSaving(false);
    }
  };


  return (
    <main className="resources-page">
      <div className="resources-page-bubbles">
        <motion.span
          className="resources-bubble resources-bubble-one"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 35, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <motion.span
          className="resources-bubble resources-bubble-two"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 35, -45, 0],
            scale: [1, 0.92, 1.08, 1],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <motion.span
          className="resources-bubble resources-bubble-three"
          animate={{
            x: [0, 35, -45, 0],
            y: [0, -30, 25, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        <motion.span
          className="resources-bubble resources-bubble-four"
          animate={{
            x: [0, -25, 40, 0],
            y: [0, 25, -35, 0],
            scale: [1, 0.94, 1.06, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="resources-page-content">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <motion.header
          className="resources-page-header"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <div className="resources-header-main">
            <div className="resources-header-icon">
              <Boxes size={27} />
            </div>

            <div>
              <p className="resources-eyebrow">
                Resource Management
              </p>

              <h1>Resources</h1>

              <p className="resources-header-description">
                Track, organize and optimize the resources
                required for your events.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="resources-smart-button"
            onClick={() =>
              setShowRecommendation(
                (previous) => !previous
              )
            }
          >
            <Brain size={18} />

            <span>
              {showRecommendation
                ? "Hide Smart Recommendation"
                : "Smart Recommendation"}
            </span>

            <Sparkles size={15} />
          </button>
        </motion.header>

        {/* =====================================================
            STATISTICS
            ===================================================== */}

        <motion.section
          className="resources-stats-grid"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.08,
          }}
        >
          <div className="resources-stat-card">
            <div className="resources-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>Total Resources</span>
              <strong>{totalResources}</strong>
            </div>
          </div>

          <div className="resources-stat-card">
            <div className="resources-stat-icon">
              <ClipboardList size={20} />
            </div>

            <div>
              <span>Allocated</span>
              <strong>{allocatedResources}</strong>
            </div>
          </div>

          <div className="resources-stat-card">
            <div className="resources-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Available</span>
              <strong>{availableResources}</strong>
            </div>
          </div>

          <div className="resources-stat-card">
            <div className="resources-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Resource Types</span>
              <strong>{resourceTypes}</strong>
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            SMART RESOURCE RECOMMENDATION
            ===================================================== */}

        {showRecommendation && (
          <motion.div
            className="resources-recommendation-wrapper"
            initial={{
              opacity: 0,
              y: 25,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -15,
              height: 0,
            }}
            transition={{
              duration: 0.45,
            }}
          >
            <SmartResourceRecommendation
              onApplyRecommendations={
                handleApplyRecommendations
              }
            />
          </motion.div>
        )}

        {/* =====================================================
            RESOURCE LIST
            ===================================================== */}

        <motion.section
          className="resources-list-section"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.16,
          }}
        >
          <div className="resources-list-header">
            <div>
              <p className="resources-section-eyebrow">
                Inventory
              </p>

              <h2>Available Resources</h2>
            </div>

            <div className="resources-list-header-actions">
              <div className="resources-list-count">
                {resources.length} types
              </div>

              <button
                type="button"
                className="resources-primary-button"
                onClick={openAddForm}
              >
                <Plus size={16} />
                Add Resource
              </button>
            </div>
          </div>

          
          {showResourceForm && (
            <form
              className="resources-edit-form"
              onSubmit={handleSubmitResource}
            >
              <h3>
                {editingResource ? "Edit Resource" : "Add New Resource"}
              </h3>

              <div className="resources-edit-form-grid">
                <label>
                  Resource Name
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Projector"
                    maxLength={200}
                    required
                  />
                </label>

                <label>
                  Category
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                    placeholder="e.g. Audio Visual"
                    maxLength={100}
                  />
                </label>

                <label>
                  Total Quantity
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="Enter quantity"
                    required
                  />
                </label>
              </div>

              {error && (
                <p className="resources-feedback resources-feedback-error" role="alert">
                  {error}
                </p>
              )}

              <div className="resources-edit-form-actions">
                <button
                  type="submit"
                  className="resources-primary-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Resource"}
                </button>

                <button
                  type="button"
                  className="resources-secondary-button"
                  onClick={closeResourceForm}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showResourceForm && error && (
            <p className="resources-feedback resources-feedback-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="resources-feedback resources-feedback-success" role="status">
              {success}
            </p>
          )}


          <div className="resources-table-wrapper">
            <div className="resources-table">
              <div className="resources-table-head">
                <span>Resource</span>
                <span>Category</span>
                <span>Total</span>
                <span>Allocated</span>
                <span>Available</span>
                <span>Actions</span>
              </div>

              {loading && (
                <p className="resources-feedback">Loading inventory...</p>
              )}
              <div className="resources-table-body">
                {!loading && resources.map(
                  (resource, index) => (
                    <motion.div
                      key={resource.id}
                      className="resources-table-row"
                      initial={{
                        opacity: 0,
                        x: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.35,
                        delay:
                          0.05 * index,
                      }}
                    >
                      <div className="resource-name-cell">
                        <div className="resource-row-icon">
                          <Package size={17} />
                        </div>

                        <strong>
                          {resource.name}
                        </strong>
                      </div>

                      <span className="resource-category">
                        {resource.category}
                      </span>

                      <strong className="resource-number">
                        {resource.quantity}
                      </strong>

                      <span className="resource-number">
                        {resource.allocated}
                      </span>

                      <span className="resource-available">
                        {resource.available}
                      </span>

                      <button
                        type="button"
                        className="resources-icon-button"
                        onClick={() => openEditForm(resource)}
                        aria-label={`Edit ${resource.name}`}
                        title="Edit resource"
                      >
                        <Pencil size={15} />
                      </button>

                    </motion.div>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default Resources;