import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Search,
  Users,
  X,
  Trash2,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Venues.css";

function Venues() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const [venues, setVenues] = useState([
    {
      id: 1,
      name: "Main Auditorium",
      location: "College Campus",
      capacity: 1000,
      status: "Available",
    },
    {
      id: 2,
      name: "Seminar Hall",
      location: "Block A",
      capacity: 300,
      status: "Available",
    },
    {
      id: 3,
      name: "Open Ground",
      location: "College Campus",
      capacity: 2000,
      status: "Available",
    },
  ]);

  const bubbles = [
    {
      className: "venues-bubble venues-bubble-1",
      animate: {
        x: [0, 70, -35, 0],
        y: [0, 35, 80, 0],
        scale: [1, 1.12, 0.94, 1],
      },
      duration: 12,
    },
    {
      className: "venues-bubble venues-bubble-2",
      animate: {
        x: [0, -80, 30, 0],
        y: [0, 60, -25, 0],
        scale: [1, 0.9, 1.08, 1],
      },
      duration: 15,
    },
    {
      className: "venues-bubble venues-bubble-3",
      animate: {
        x: [0, 55, -45, 0],
        y: [0, -35, 55, 0],
        scale: [1, 1.1, 0.95, 1],
      },
      duration: 13,
    },
    {
      className: "venues-bubble venues-bubble-4",
      animate: {
        x: [0, -60, 45, 0],
        y: [0, -55, 35, 0],
        scale: [1, 0.92, 1.1, 1],
      },
      duration: 16,
    },
    {
      className: "venues-bubble venues-bubble-5",
      animate: {
        x: [0, 40, -65, 0],
        y: [0, 50, -30, 0],
        scale: [1, 1.08, 0.93, 1],
      },
      duration: 14,
    },
    {
      className: "venues-bubble venues-bubble-6",
      animate: {
        x: [0, -45, 65, 0],
        y: [0, 35, -45, 0],
        scale: [1, 0.94, 1.12, 1],
      },
      duration: 17,
    },
    {
      className: "venues-bubble venues-bubble-7",
      animate: {
        x: [0, 65, -30, 0],
        y: [0, -40, 45, 0],
        scale: [1, 1.1, 0.95, 1],
      },
      duration: 11,
    },
  ];

  const filteredVenues = venues.filter((venue) =>
    `${venue.name} ${venue.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddVenue = (e) => {
    e.preventDefault();

    if (!venueName.trim() || !location.trim() || !capacity) {
      return;
    }

    const newVenue = {
      id: Date.now(),
      name: venueName.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      status: "Available",
    };

    setVenues((currentVenues) => [...currentVenues, newVenue]);

    setVenueName("");
    setLocation("");
    setCapacity("");

    setShowAddModal(false);
  };

  const handleDeleteVenue = () => {
    if (!selectedVenue) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedVenue.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setVenues((currentVenues) =>
      currentVenues.filter((venue) => venue.id !== selectedVenue.id)
    );

    setSelectedVenue(null);
  };

  return (
    <div className="venues-page">
      {/* Moving background bubbles */}
      <div className="venues-bubble-layer" aria-hidden="true">
        {bubbles.map((bubble, index) => (
          <motion.span
            key={index}
            className={bubble.className}
            animate={bubble.animate}
            transition={{
              duration: bubble.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="venues-content">
        {/* Back button is kept completely separate from the page header */}
        <motion.div
          className="venues-back-row"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            className="venues-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>

        {/* Page header */}
        <motion.header
          className="venues-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="venues-title-area">
            <motion.div
              className="venues-title-icon"
              initial={{ scale: 0.7, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Building2 size={25} />
            </motion.div>

            <div>
              <span className="venues-eyebrow">VENUE MANAGEMENT</span>
              <h1>Venues</h1>
              <p>
                Manage your event venues and their available capacity.
              </p>
            </div>
          </div>

          {/* Add Venue pushed to the RIGHT */}
          <motion.button
            type="button"
            className="venues-add-button"
            onClick={() => setShowAddModal(true)}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={20} />
            <span>Add Venue</span>
          </motion.button>
        </motion.header>

        {/* Search toolbar */}
        <motion.div
          className="venues-toolbar"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="venues-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <span className="venues-count">
            {filteredVenues.length}{" "}
            {filteredVenues.length === 1 ? "venue" : "venues"}
          </span>
        </motion.div>

        {/* Venue cards */}
        <motion.div
          className="venues-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {filteredVenues.map((venue) => (
            <motion.div
              className="venue-card"
              key={venue.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 22,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              whileHover={{
                y: -7,
                transition: { duration: 0.2 },
              }}
            >
              <div className="venue-card-top">
                <div className="venue-icon">
                  <MapPin size={25} />
                </div>

                <span className="venue-status">{venue.status}</span>
              </div>

              <h2>{venue.name}</h2>

              <div className="venue-location">
                <MapPin size={17} />
                <span>{venue.location}</span>
              </div>

              <div className="venue-capacity">
                <Users size={21} />

                <span>
                  Capacity: <strong>{venue.capacity}</strong> guests
                </span>
              </div>

              <button
                type="button"
                className="venue-view-button"
                onClick={() => setSelectedVenue(venue)}
              >
                View Venue
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredVenues.length === 0 && (
          <motion.div
            className="venues-empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MapPin size={40} />
            <h3>No venues found</h3>
            <p>Try searching with a different venue name.</p>
          </motion.div>
        )}
      </div>

      {/* Add Venue Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="venue-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="venue-modal"
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="venue-modal-header">
                <div>
                  <span className="venue-modal-eyebrow">
                    VENUE MANAGEMENT
                  </span>
                  <h2>Add Venue</h2>
                  <p>Add a new venue to your event system.</p>
                </div>

                <button
                  type="button"
                  className="venue-modal-close"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddVenue}>
                <div className="venue-form-field">
                  <label>Venue Name</label>
                  <input
                    type="text"
                    placeholder="Enter venue name"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                  />
                </div>

                <div className="venue-form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Enter venue location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="venue-form-field">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>

                <div className="venue-modal-actions">
                  <button
                    type="button"
                    className="venue-cancel-button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="venue-save-button"
                  >
                    <Plus size={17} />
                    Add Venue
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Venue Details Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            className="venue-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVenue(null)}
          >
            <motion.div
              className="venue-details-modal"
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="venue-details-header">
                <div className="venue-details-icon">
                  <MapPin size={28} />
                </div>

                <button
                  type="button"
                  className="venue-modal-close"
                  onClick={() => setSelectedVenue(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="venue-details-content">
                <span className="venue-details-status">
                  {selectedVenue.status}
                </span>

                <h2>{selectedVenue.name}</h2>

                <div className="venue-detail-row">
                  <MapPin size={19} />

                  <div>
                    <span>Location</span>
                    <strong>{selectedVenue.location}</strong>
                  </div>
                </div>

                <div className="venue-detail-row">
                  <Users size={19} />

                  <div>
                    <span>Capacity</span>
                    <strong>{selectedVenue.capacity} guests</strong>
                  </div>
                </div>
              </div>

              <div className="venue-details-actions">
                <button
                  type="button"
                  className="venue-delete-button"
                  onClick={handleDeleteVenue}
                >
                  <Trash2 size={17} />
                  Delete Venue
                </button>

                <button
                  type="button"
                  className="venue-details-close-button"
                  onClick={() => setSelectedVenue(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Venues;