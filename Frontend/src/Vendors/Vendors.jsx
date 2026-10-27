
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Users,
  BriefcaseBusiness,
  CalendarDays,
  X,
  Link2,
  Award,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react";
import { api } from "../Services/Api";

import "./Vendors.css";

/* =========================================================
   DEMO DATA
   Used only when backend has no vendor/event records.
   ========================================================= */

const DEMO_VENDORS = [
  {
    id: 101,
    vendor_code: "VEN-101",
    name: "SoundWave Productions",
    service_type: "Audio & Stage",
    phone: "+91 98765 43210",
    email: "contact@soundwave.example.com",
    overall_rating: 4.8,
    quality_rating: 5,
    timeliness_rating: 4.8,
    cost_rating: 4.5,
    communication_rating: 4.9,
    assignments: [
      {
        assignment_id: "A-101",
        event_id: 1,
        event_name: "Tech Fest 2026",
      },
    ],
  },
  {
    id: 102,
    vendor_code: "VEN-102",
    name: "FreshBite Catering",
    service_type: "Catering",
    phone: "+91 91234 56780",
    email: "events@freshbite.example.com",
    overall_rating: 4.7,
    quality_rating: 4.9,
    timeliness_rating: 4.7,
    cost_rating: 4.5,
    communication_rating: 4.7,
    assignments: [
      {
        assignment_id: "A-102",
        event_id: 1,
        event_name: "Tech Fest 2026",
      },
      {
        assignment_id: "A-103",
        event_id: 2,
        event_name: "AI Workshop",
      },
    ],
  },
  {
    id: 103,
    vendor_code: "VEN-103",
    name: "Elegant Moments",
    service_type: "Decoration",
    phone: "+91 99887 66554",
    email: "hello@elegantmoments.example.com",
    overall_rating: 4.6,
    quality_rating: 4.8,
    timeliness_rating: 4.5,
    cost_rating: 4.4,
    communication_rating: 4.7,
    assignments: [],
  },
  {
    id: 104,
    vendor_code: "VEN-104",
    name: "PixelFrame Media",
    service_type: "Photography & Media",
    phone: "+91 90123 45678",
    email: "studio@pixelframe.example.com",
    overall_rating: 4.9,
    quality_rating: 5,
    timeliness_rating: 4.9,
    cost_rating: 4.7,
    communication_rating: 5,
    assignments: [
      {
        assignment_id: "A-104",
        event_id: 1,
        event_name: "Tech Fest 2026",
      },
    ],
  },
  {
    id: 105,
    vendor_code: "VEN-105",
    name: "SecureGuard Services",
    service_type: "Security",
    phone: "+91 93456 78901",
    email: "operations@secureguard.example.com",
    overall_rating: 4.5,
    quality_rating: 4.6,
    timeliness_rating: 4.5,
    cost_rating: 4.4,
    communication_rating: 4.5,
    assignments: [
      {
        assignment_id: "A-105",
        event_id: 3,
        event_name: "Python Bootcamp",
      },
    ],
  },
  {
    id: 106,
    vendor_code: "VEN-106",
    name: "SwiftRide Events",
    service_type: "Transportation",
    phone: "+91 87654 32109",
    email: "bookings@swiftride.example.com",
    overall_rating: 4.4,
    quality_rating: 4.5,
    timeliness_rating: 4.3,
    cost_rating: 4.4,
    communication_rating: 4.4,
    assignments: [],
  },
];

const DEMO_EVENTS = [
  {
    id: 1,
    name: "Tech Fest 2026",
    date: "2026-11-15",
  },
  {
    id: 2,
    name: "AI Workshop",
    date: "2026-11-20",
  },
  {
    id: 3,
    name: "Python Bootcamp",
    date: "2026-12-05",
  },
  {
    id: 4,
    name: "Corporate Leadership Summit",
    date: "2026-12-15",
  },
];


/* =========================================================
   VENDORS PAGE
   ========================================================= */

function Vendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    service: "",
    phone: "",
    email: "",
  });

  const [selectedEventId, setSelectedEventId] = useState("");
  const [vendorFee, setVendorFee] = useState("");

  const [ratingForm, setRatingForm] = useState({
    quality: 5,
    timeliness: 5,
    cost: 5,
    communication: 5,
  });

  const [loading, setLoading] = useState(true);

  const [dataSource, setDataSource] = useState("demo");

  const services = [
    "Audio & Stage",
    "Catering",
    "Decoration",
    "Photography & Media",
    "Security",
    "Transportation",
    "Other",
  ];


  /* =========================================================
     NORMALIZE API RESPONSES
     ========================================================= */

  const normalizeListResponse = (response, type) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (type === "vendors" && Array.isArray(response?.vendors)) {
      return response.vendors;
    }

    if (type === "events" && Array.isArray(response?.events)) {
      return response.events;
    }

    return [];
  };


  /* =========================================================
     FETCH VENDORS + EVENTS
     ========================================================= */

  const fetchVendorsData = async () => {
    setLoading(true);

    try {
      const [vendorsRes, eventsRes] = await Promise.all([
        api.vendors.getAll(),
        api.events.getAll(),
      ]);

      const apiVendors = normalizeListResponse(
        vendorsRes,
        "vendors"
      );

      const apiEvents = normalizeListResponse(
        eventsRes,
        "events"
      );

      /*
       * If the backend contains records, use them.
       * Otherwise show useful demo data.
       */
      if (apiVendors.length > 0) {
        setVendors(apiVendors);
        setDataSource("backend");
      } else {
        setVendors(DEMO_VENDORS);
        setDataSource("demo");
      }

      if (apiEvents.length > 0) {
        setEvents(apiEvents);
      } else {
        setEvents(DEMO_EVENTS);
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);

      /*
       * Backend unavailable:
       * keep the page usable with demo data.
       */
      setVendors(DEMO_VENDORS);
      setEvents(DEMO_EVENTS);
      setDataSource("demo");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchVendorsData();
  }, []);


  /* =========================================================
     FILTER VENDORS
     ========================================================= */

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const searchValue = search.toLowerCase();

      const vendorName = (
        vendor.name || ""
      ).toLowerCase();

      const vendorId = (
        vendor.vendor_code ||
        vendor.id ||
        ""
      )
        .toString()
        .toLowerCase();

      const vendorService = (
        vendor.service_type ||
        vendor.service ||
        ""
      ).toLowerCase();

      const matchesSearch =
        vendorName.includes(searchValue) ||
        vendorId.includes(searchValue) ||
        vendorService.includes(searchValue);

      const service =
        vendor.service_type ||
        vendor.service ||
        "";

      const matchesService =
        serviceFilter === "All" ||
        service === serviceFilter;

      return matchesSearch && matchesService;
    });
  }, [vendors, search, serviceFilter]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalVendors = vendors.length;

  const assignedVendors = vendors.filter((vendor) => {
    const assignments =
      vendor.assignments ||
      vendor.assignedEvents ||
      [];

    return assignments.length > 0;
  }).length;

  const availableVendors =
    totalVendors - assignedVendors;

  const totalAssignments = vendors.reduce(
    (total, vendor) => {
      const assignments =
        vendor.assignments ||
        vendor.assignedEvents ||
        [];

      return total + assignments.length;
    },
    0
  );

  const averageRating =
    totalVendors > 0
      ? (
          vendors.reduce(
            (sum, vendor) =>
              sum +
              Number(
                vendor.overall_rating || 5
              ),
            0
          ) / totalVendors
        ).toFixed(1)
      : "5.0";


  /* =========================================================
     CREATE MODAL
     ========================================================= */

  const openCreateModal = () => {
    setEditingVendor(null);

    setForm({
      name: "",
      service: "",
      phone: "",
      email: "",
    });

    setShowModal(true);
  };


  /* =========================================================
     EDIT MODAL
     ========================================================= */

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);

    setForm({
      name: vendor.name || "",
      service:
        vendor.service_type ||
        vendor.service ||
        "",
      phone: vendor.phone || "",
      email: vendor.email || "",
    });

    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
  };


  /* =========================================================
     CREATE / UPDATE VENDOR
     ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.service) {
      alert(
        "Please provide vendor name and service type."
      );
      return;
    }

    try {
      if (editingVendor) {
        await api.vendors.update(
          editingVendor.id,
          {
            name: form.name.trim(),
            service_type: form.service,
            phone: form.phone.trim(),
            email: form.email.trim(),
          }
        );
      } else {
        await api.vendors.create({
          name: form.name.trim(),
          service_type: form.service,
          phone: form.phone.trim(),
          email: form.email.trim(),
        });
      }

      closeModal();

      /*
       * Once the user successfully creates/updates
       * backend data, reload from the backend.
       */
      await fetchVendorsData();
    } catch (error) {
      console.error(
        "Failed to save vendor:",
        error
      );

      alert(
        error.message ||
          "Failed to save vendor."
      );
    }
  };


  /* =========================================================
     DELETE VENDOR
     ========================================================= */

  const handleDelete = async (vendorId) => {
    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    if (!vendor) return;

    const assignments =
      vendor.assignments ||
      vendor.assignedEvents ||
      [];

    if (assignments.length > 0) {
      alert(
        "This vendor is currently assigned to an event. Remove event assignments before deleting."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete vendor "${vendor.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.vendors.delete(vendorId);

      await fetchVendorsData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to delete vendor."
      );
    }
  };


  /* =========================================================
     ASSIGN VENDOR
     ========================================================= */

  const openAssignModal = (vendor) => {
    setSelectedVendor(vendor);

    setSelectedEventId(
      events.length > 0
        ? events[0].id
        : ""
    );

    setVendorFee("");
    setShowAssignModal(true);
  };


  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedVendor(null);
    setSelectedEventId("");
    setVendorFee("");
  };


  const assignVendor = async () => {
    if (!selectedVendor || !selectedEventId) {
      return;
    }

    /*
     * Demo records are not stored in the backend.
     * Inform the user instead of pretending the assignment
     * was permanently saved.
     */
    if (dataSource === "demo") {
      const selectedEvent = events.find(
        (event) =>
          String(event.id) ===
          String(selectedEventId)
      );

      const newAssignment = {
        assignment_id: `DEMO-${Date.now()}`,
        event_id: Number(selectedEventId),
        event_name:
          selectedEvent?.name ||
          "Selected Event",
      };

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                assignments: [
                  ...(vendor.assignments || []),
                  newAssignment,
                ],
              }
            : vendor
        )
      );

      closeAssignModal();
      return;
    }

    try {
      await api.vendors.assign(
        selectedVendor.id,
        {
          event_id: Number(selectedEventId),
          status: "Assigned",
          notes: vendorFee
            ? `Contract Fee: ₹${Number(
                vendorFee
              )}`
            : "",
        }
      );

      closeAssignModal();

      await fetchVendorsData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to assign vendor."
      );
    }
  };


  /* =========================================================
     REMOVE ASSIGNMENT
     ========================================================= */

  const removeAssignment = async (
    vendorId,
    assignmentId
  ) => {
    /*
     * Allow demo assignments to be removed locally.
     */
    if (dataSource === "demo") {
      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === vendorId
            ? {
                ...vendor,
                assignments: (
                  vendor.assignments || []
                ).filter(
                  (assignment) =>
                    assignment.assignment_id !==
                    assignmentId
                ),
              }
            : vendor
        )
      );

      return;
    }

    try {
      await api.vendors.removeAssignment(
        vendorId,
        assignmentId
      );

      await fetchVendorsData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to remove assignment."
      );
    }
  };


  /* =========================================================
     RATING
     ========================================================= */

  const openRatingModal = (vendor) => {
    setSelectedVendor(vendor);

    setRatingForm({
      quality:
        vendor.quality_rating || 5,
      timeliness:
        vendor.timeliness_rating || 5,
      cost:
        vendor.cost_rating || 5,
      communication:
        vendor.communication_rating || 5,
    });

    setShowRatingModal(true);
  };


  const handleRateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVendor) return;

    const quality = Number(
      ratingForm.quality
    );

    const timeliness = Number(
      ratingForm.timeliness
    );

    const cost = Number(
      ratingForm.cost
    );

    const communication = Number(
      ratingForm.communication
    );

    const overall =
      (
        quality +
        timeliness +
        cost +
        communication
      ) / 4;

    /*
     * Demo vendor rating is updated locally.
     */
    if (dataSource === "demo") {
      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                quality_rating: quality,
                timeliness_rating: timeliness,
                cost_rating: cost,
                communication_rating:
                  communication,
                overall_rating: Number(
                  overall.toFixed(1)
                ),
              }
            : vendor
        )
      );

      setShowRatingModal(false);
      setSelectedVendor(null);

      return;
    }

    try {
      await api.vendors.updateRatings(
        selectedVendor.id,
        {
          quality_rating: quality,
          timeliness_rating: timeliness,
          cost_rating: cost,
          communication_rating:
            communication,
          overall_rating: Number(
            overall.toFixed(1)
          ),
        }
      );

      setShowRatingModal(false);
      setSelectedVendor(null);

      await fetchVendorsData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to update ratings."
      );
    }
  };


  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="vendors-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="vendors-header">
        <div>
          <button
            className="vendors-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="vendors-eyebrow">
            VENDOR MANAGEMENT
          </div>

          <h1>Vendors</h1>

          <p>
            Manage external service providers,
            coordinate event assignments, and
            track vendor performance.
          </p>
        </div>

        <button
          className="add-vendor-btn"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Vendor
        </button>
      </div>


      {/* ===================================================
          DATA SOURCE NOTICE
          =================================================== */}

      {dataSource === "demo" && (
        <div className="vendors-demo-notice">
          <BriefcaseBusiness size={17} />

          <span>
            Showing sample vendor data. Your
            backend vendor records will appear
            automatically when available.
          </span>

          <button
            onClick={fetchVendorsData}
            title="Refresh vendor data"
          >
            Refresh
          </button>
        </div>
      )}


      {/* ===================================================
          STATS
          =================================================== */}

      <div className="vendor-stats">

        <div className="vendor-stat-card">
          <div className="vendor-stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Total Vendors</span>
            <strong>{totalVendors}</strong>
          </div>
        </div>


        <div className="vendor-stat-card">
          <div className="vendor-stat-icon assigned">
            <Link2 size={20} />
          </div>

          <div>
            <span>Assigned Vendors</span>
            <strong>{assignedVendors}</strong>
          </div>
        </div>


        <div className="vendor-stat-card">
          <div className="vendor-stat-icon available">
            <BriefcaseBusiness size={20} />
          </div>

          <div>
            <span>Available Vendors</span>
            <strong>{availableVendors}</strong>
          </div>
        </div>


        <div className="vendor-stat-card">
          <div className="vendor-stat-icon assignments">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Total Assignments</span>
            <strong>{totalAssignments}</strong>
          </div>
        </div>


        <div className="vendor-stat-card">
          <div className="vendor-stat-icon rating">
            <Star size={20} />
          </div>

          <div>
            <span>Average Rating</span>
            <strong>
              {averageRating} / 5
            </strong>
          </div>
        </div>

      </div>


      {/* ===================================================
          TOOLBAR
          =================================================== */}

      <div className="vendors-toolbar">

        <div className="vendor-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search vendors by name, service or ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>


        <div className="vendor-filters">

          <button
            className={
              serviceFilter === "All"
                ? "active"
                : ""
            }
            onClick={() =>
              setServiceFilter("All")
            }
          >
            All
          </button>

          {services.map((service) => (
            <button
              key={service}
              className={
                serviceFilter === service
                  ? "active"
                  : ""
              }
              onClick={() =>
                setServiceFilter(service)
              }
            >
              {service}
            </button>
          ))}

        </div>

      </div>


      {/* ===================================================
          DIRECTORY HEADER
          =================================================== */}

      <div className="vendors-section-header">

        <div>
          <div className="vendors-section-eyebrow">
            SERVICE PROVIDERS
          </div>

          <h2>Vendor Directory</h2>

          <p>
            {loading
              ? "Loading vendor records..."
              : `${filteredVendors.length} vendor${
                  filteredVendors.length !== 1
                    ? "s"
                    : ""
                } found`}
          </p>
        </div>

      </div>


      {/* ===================================================
          VENDOR GRID
          =================================================== */}

      <div className="vendors-grid">

        {loading ? (
          <div className="vendors-empty">
            <BriefcaseBusiness size={40} />

            <h3>Loading vendors...</h3>

            <p>
              Connecting to the vendor
              directory.
            </p>
          </div>
        ) : filteredVendors.length > 0 ? (

          filteredVendors.map((vendor) => {
            const vendorAssignments =
              vendor.assignments ||
              vendor.assignedEvents ||
              [];

            const rating = Number(
              vendor.overall_rating || 5
            ).toFixed(1);

            return (
              <motion.div
                key={vendor.id}
                className="vendor-card"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  y: -5,
                }}
                transition={{
                  duration: 0.25,
                }}
              >

                {/* CARD TOP */}

                <div className="vendor-card-top">

                  <div className="vendor-avatar">
                    {vendor.name
                      ?.charAt(0)
                      .toUpperCase() || "V"}
                  </div>

                  <div className="vendor-card-actions">

                    <button
                      onClick={() =>
                        openEditModal(vendor)
                      }
                      title="Edit vendor"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          vendor.id
                        )
                      }
                      title="Delete vendor"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>


                {/* CARD CONTENT */}

                <div className="vendor-card-content">

                  <span className="vendor-id">
                    {vendor.vendor_code ||
                      `VEN-${String(
                        vendor.id
                      ).padStart(3, "0")}`}
                  </span>

                  <h3>{vendor.name}</h3>

                  <p className="vendor-service">
                    {vendor.service_type ||
                      vendor.service ||
                      "General Services"}
                  </p>


                  <div className="vendor-contact-list">

                    <span className="vendor-contact">
                      <Phone size={14} />

                      {vendor.phone ||
                        "Phone not available"}
                    </span>

                    <span className="vendor-contact">
                      <Mail size={14} />

                      {vendor.email ||
                        "Email not available"}
                    </span>

                  </div>


                  <div className="vendor-rating-row">

                    <span className="vendor-rating">
                      <Award size={15} />
                      {rating} / 5.0
                    </span>

                    <button
                      className="evaluate-btn"
                      onClick={() =>
                        openRatingModal(
                          vendor
                        )
                      }
                    >
                      Evaluate
                    </button>

                  </div>

                </div>


                {/* ASSIGNMENTS */}

                <div className="vendor-assignment">

                  <div className="assignment-heading">

                    <span>
                      Assigned Events
                    </span>

                    <strong>
                      {vendorAssignments.length}
                    </strong>

                  </div>


                  {vendorAssignments.length >
                  0 ? (

                    <div className="assignment-list">

                      {vendorAssignments.map(
                        (assignment) => (
                          <div
                            className="assignment-item"
                            key={
                              assignment.assignment_id ||
                              assignment.event_id
                            }
                          >

                            <span>
                              {assignment.event_name ||
                                "Event"}
                            </span>

                            <button
                              onClick={() =>
                                removeAssignment(
                                  vendor.id,
                                  assignment.assignment_id
                                )
                              }
                              title="Remove assignment"
                            >
                              <X size={13} />
                            </button>

                          </div>
                        )
                      )}

                    </div>

                  ) : (

                    <div className="no-assignment">
                      Available for event assignment
                    </div>

                  )}

                </div>


                {/* ASSIGN BUTTON */}

                <button
                  className="assign-vendor-btn"
                  onClick={() =>
                    openAssignModal(
                      vendor
                    )
                  }
                >
                  <Link2 size={16} />
                  Assign to Event
                </button>

              </motion.div>
            );
          })

        ) : (

          <div className="vendors-empty">

            <Users size={40} />

            <h3>No vendors found</h3>

            <p>
              Try changing your search or
              service filter.
            </p>

            <button
              className="add-vendor-btn"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              Add Vendor
            </button>

          </div>

        )}

      </div>


      {/* ===================================================
          ADD / EDIT VENDOR MODAL
          =================================================== */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="vendor-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeModal}
          >

            <motion.div
              className="vendor-modal"
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    {editingVendor
                      ? "Edit Vendor"
                      : "Add Vendor"}
                  </h2>

                  <p>
                    {editingVendor
                      ? "Update vendor information."
                      : "Add a new vendor to your directory."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>

              </div>


              <form onSubmit={handleSubmit}>

                <label>
                  Vendor Name

                  <input
                    type="text"
                    placeholder="Enter vendor name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </label>


                <label>
                  Service Type

                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service:
                          e.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select service
                    </option>

                    {services.map(
                      (service) => (
                        <option
                          key={service}
                          value={service}
                        >
                          {service}
                        </option>
                      )
                    )}

                  </select>
                </label>


                <label>
                  Phone Number

                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone:
                          e.target.value,
                      })
                    }
                  />
                </label>


                <label>
                  Email Address

                  <input
                    type="email"
                    placeholder="vendor@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email:
                          e.target.value,
                      })
                    }
                  />
                </label>


                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >
                    {editingVendor
                      ? "Save Changes"
                      : "Add Vendor"}
                  </button>

                </div>

              </form>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ===================================================
          ASSIGN VENDOR MODAL
          =================================================== */}

      <AnimatePresence>
        {showAssignModal &&
          selectedVendor && (

            <motion.div
              className="vendor-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={
                closeAssignModal
              }
            >

              <motion.div
                className="vendor-modal"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                onMouseDown={(e) =>
                  e.stopPropagation()
                }
              >

                <div className="modal-header">

                  <div>
                    <h2>
                      Assign Vendor
                    </h2>

                    <p>
                      Assign{" "}
                      <strong>
                        {
                          selectedVendor.name
                        }
                      </strong>{" "}
                      to an event.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeAssignModal
                    }
                  >
                    <X size={20} />
                  </button>

                </div>


                <label>
                  Select Event

                  <select
                    value={
                      selectedEventId
                    }
                    onChange={(e) =>
                      setSelectedEventId(
                        e.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Select an event
                    </option>

                    {events.map((event) => (
                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.name}{" "}
                        {event.date
                          ? `(${event.date})`
                          : ""}
                      </option>
                    ))}

                  </select>

                </label>


                <label>
                  Contract Fee (₹)

                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={vendorFee}
                    onChange={(e) =>
                      setVendorFee(
                        e.target.value
                      )
                    }
                  />
                </label>


                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={
                      closeAssignModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={assignVendor}
                    disabled={
                      !selectedEventId
                    }
                  >
                    Assign Vendor
                  </button>

                </div>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>


      {/* ===================================================
          RATING MODAL
          =================================================== */}

      <AnimatePresence>
        {showRatingModal &&
          selectedVendor && (

            <motion.div
              className="rating-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setShowRatingModal(false)
              }
            >

              <motion.div
                className="rating-modal"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <div className="rating-modal-header">

                  <div>
                    <h2>
                      Evaluate{" "}
                      {selectedVendor.name}
                    </h2>

                    <span>
                      Rate vendor across 4
                      metrics (1 to 5)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowRatingModal(
                        false
                      )
                    }
                  >
                    <X size={20} />
                  </button>

                </div>


                <form
                  onSubmit={
                    handleRateSubmit
                  }
                >

                  <div className="rating-grid">

                    <label>
                      Quality (1-5)

                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={
                          ratingForm.quality
                        }
                        onChange={(e) =>
                          setRatingForm({
                            ...ratingForm,
                            quality:
                              e.target.value,
                          })
                        }
                      />
                    </label>


                    <label>
                      Timeliness (1-5)

                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={
                          ratingForm.timeliness
                        }
                        onChange={(e) =>
                          setRatingForm({
                            ...ratingForm,
                            timeliness:
                              e.target.value,
                          })
                        }
                      />
                    </label>


                    <label>
                      Cost Value (1-5)

                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={
                          ratingForm.cost
                        }
                        onChange={(e) =>
                          setRatingForm({
                            ...ratingForm,
                            cost:
                              e.target.value,
                          })
                        }
                      />
                    </label>


                    <label>
                      Communication (1-5)

                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={
                          ratingForm.communication
                        }
                        onChange={(e) =>
                          setRatingForm({
                            ...ratingForm,
                            communication:
                              e.target.value,
                          })
                        }
                      />
                    </label>

                  </div>


                  <div className="rating-modal-actions">

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() =>
                        setShowRatingModal(
                          false
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-btn"
                    >
                      Save Evaluation
                    </button>

                  </div>

                </form>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}

export default Vendors;
