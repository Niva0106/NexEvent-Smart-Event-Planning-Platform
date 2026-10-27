import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Team.css";

function Team() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const [members] = useState([
    {
      id: 1,
      name: "Admin User",
      role: "Event Manager",
      email: "admin@eventflow.com",
      phone: "+91 98765 43210",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      role: "Coordinator",
      email: "rahul@example.com",
      phone: "+91 98765 12345",
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Resource Manager",
      email: "priya@example.com",
      phone: "+91 98765 67890",
    },
    {
      id: 4,
      name: "Arjun Reddy",
      role: "Event Volunteer",
      email: "arjun@example.com",
      phone: "+91 98765 24680",
    },
  ]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) =>
      `${member.name} ${member.role} ${member.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [members, search]);

  return (
    <div className="team-page">
      <div className="team-bubble-field" aria-hidden="true">
        <span className="team-bubble bubble-one" />
        <span className="team-bubble bubble-two" />
        <span className="team-bubble bubble-three" />
        <span className="team-bubble bubble-four" />
        <span className="team-bubble bubble-five" />
        <span className="team-bubble bubble-six" />
        <span className="team-bubble bubble-seven" />
      </div>

      <motion.div
        className="team-content"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: "easeOut",
        }}
      >
        <motion.header
          className="team-header"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            duration: 0.5,
          }}
        >
          <div>
            <button
              className="team-back-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <span className="team-eyebrow">
              PEOPLE & COLLABORATION
            </span>

            <h1>Team</h1>

            <p>
              Manage your event team members and their
              responsibilities.
            </p>
          </div>

          <motion.button
            className="team-add-button"
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Plus size={19} />
            Add Team Member
          </motion.button>
        </motion.header>

        <motion.div
          className="team-overview"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.16,
            duration: 0.5,
          }}
        >
          <div className="team-overview-card">
            <div className="team-overview-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Total Members</span>
              <strong>{members.length}</strong>
            </div>
          </div>

          <div className="team-overview-card">
            <div className="team-overview-icon active">
              <ShieldCheck size={21} />
            </div>

            <div>
              <span>Active Members</span>
              <strong>{members.length}</strong>
            </div>
          </div>

          <div className="team-overview-card">
            <div className="team-overview-icon roles">
              <UserRound size={21} />
            </div>

            <div>
              <span>Responsibilities</span>
              <strong>
                {new Set(
                  members.map((member) => member.role)
                ).size}
              </strong>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="team-toolbar"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.23,
            duration: 0.5,
          }}
        >
          <div className="team-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <span className="team-count">
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1
              ? "member"
              : "members"}
          </span>
        </motion.div>

        <motion.div
          className="team-section-heading"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.29,
            duration: 0.45,
          }}
        >
          <div>
            <span>TEAM DIRECTORY</span>
            <h2>Your Event Team</h2>
            <p>
              View team members and their contact
              information.
            </p>
          </div>
        </motion.div>

        <div className="team-grid">
          <AnimatePresence mode="popLayout">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => {
                const initial =
                  member.name
                    .charAt(0)
                    .toUpperCase();

                return (
                  <motion.div
                    className="team-card"
                    key={member.id}
                    initial={{
                      opacity: 0,
                      y: 25,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    transition={{
                      delay: Math.min(
                        index * 0.07,
                        0.4
                      ),
                      duration: 0.45,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      y: -6,
                    }}
                  >
                    <div className="team-card-glow" />

                    <div className="team-card-top">
                      <motion.div
                        className="team-avatar"
                        whileHover={{
                          rotate: 4,
                          scale: 1.05,
                        }}
                      >
                        {initial}
                      </motion.div>

                      <span className="team-status">
                        <span />
                        Active
                      </span>
                    </div>

                    <div className="team-card-main">
                      <span className="team-member-label">
                        TEAM MEMBER
                      </span>

                      <h2>{member.name}</h2>

                      <p className="team-role">
                        {member.role}
                      </p>

                      <div className="team-contact">
                        <div>
                          <Mail size={16} />
                          <span>{member.email}</span>
                        </div>

                        <div>
                          <Phone size={16} />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      className="team-view-button"
                      onClick={() =>
                        setSelectedMember(member)
                      }
                      whileHover={{
                        y: -2,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      <UserRound size={17} />
                      View Member
                    </motion.button>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                className="team-empty"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              >
                <Users size={42} />

                <h3>No team members found</h3>

                <p>
                  Try changing your search
                  criteria.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="team-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSelectedMember(null)
            }
          >
            <motion.div
              className="team-modal"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                className="team-modal-close"
                onClick={() =>
                  setSelectedMember(null)
                }
              >
                <X size={20} />
              </button>

              <div className="team-modal-avatar">
                {selectedMember.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span className="team-modal-eyebrow">
                TEAM MEMBER PROFILE
              </span>

              <h2>{selectedMember.name}</h2>

              <p className="team-modal-role">
                {selectedMember.role}
              </p>

              <div className="team-modal-details">
                <div>
                  <Mail size={18} />
                  <span>
                    {selectedMember.email}
                  </span>
                </div>

                <div>
                  <Phone size={18} />
                  <span>
                    {selectedMember.phone}
                  </span>
                </div>

                <div>
                  <UserRound size={18} />
                  <span>
                    Active Team Member
                  </span>
                </div>
              </div>

              <motion.button
                className="team-modal-button"
                onClick={() =>
                  setSelectedMember(null)
                }
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Team;