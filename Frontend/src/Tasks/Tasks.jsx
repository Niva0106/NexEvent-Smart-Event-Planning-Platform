import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Plus,
  Search,
  Trash2,
  User,
  X,
  Sparkles,
  CircleDashed,
  ListChecks,
  CircleCheckBig,
} from "lucide-react";
import "./Tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Confirm Main Auditorium",
      description:
        "Verify venue availability and final booking.",
      event: "Tech Fest 2026",
      assignee: "Rahul",
      dueDate: "2026-03-15",
      priority: "High",
      status: "todo",
    },
    {
      id: 2,
      title: "Allocate Projector",
      description:
        "Reserve projector equipment for the main event.",
      event: "Tech Fest 2026",
      assignee: "Priya",
      dueDate: "2026-03-16",
      priority: "High",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Prepare Event Staff",
      description:
        "Confirm staff availability for event day.",
      event: "Tech Fest 2026",
      assignee: "Arjun",
      dueDate: "2026-03-17",
      priority: "Medium",
      status: "in-progress",
    },
    {
      id: 4,
      title: "Create Attendee List",
      description:
        "Prepare the current registration list.",
      event: "AI Workshop",
      assignee: "Sneha",
      dueDate: "2026-03-18",
      priority: "Medium",
      status: "completed",
    },
    {
      id: 5,
      title: "Confirm Speakers",
      description:
        "Finalize speaker participation and timings.",
      event: "Python Bootcamp",
      assignee: "Vikram",
      dueDate: "2026-03-19",
      priority: "Low",
      status: "todo",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    event: "Tech Fest 2026",
    assignee: "",
    dueDate: "",
    priority: "Medium",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(searchValue) ||
        task.event.toLowerCase().includes(searchValue) ||
        task.assignee.toLowerCase().includes(searchValue);

      const matchesPriority =
        filterPriority === "All" ||
        task.priority === filterPriority;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, filterPriority]);

  const todoTasks = filteredTasks.filter(
    (task) => task.status === "todo"
  );

  const progressTasks = filteredTasks.filter(
    (task) => task.status === "in-progress"
  );

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description,
      event: task.event,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
    });

    setShowModal(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...form,
              }
            : task
        )
      );
    } else {
      setTasks((current) => [
        ...current,
        {
          id: Date.now(),
          ...form,
          status: "todo",
        },
      ]);
    }

    setShowModal(false);
    setEditingTask(null);
    setForm(emptyForm);
  };

  const deleteTask = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
  };

  const moveTask = (id, status) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getColumnCount = (status) =>
    filteredTasks.filter(
      (task) => task.status === status
    ).length;

  const TaskCard = ({ task }) => {
    return (
      <article className="task-card">
        <div className="task-card-glow" />

        <div className="task-card-header">
          <span
            className={`task-priority ${task.priority.toLowerCase()}`}
          >
            {task.priority}
          </span>

          <div className="task-menu">
            <button
              type="button"
              title="Edit task"
              onClick={() => openEditModal(task)}
            >
              <Edit3 size={14} />
            </button>

            <button
              type="button"
              title="Delete task"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="task-card-main"
          onClick={() => openTaskDetails(task)}
        >
          <h3>{task.title}</h3>

          <p>{task.description}</p>

          <div className="task-event">
            <CalendarDays size={13} />
            <span>{task.event}</span>
          </div>
        </button>

        <div className="task-card-footer">
          <div className="task-assignee">
            <span className="assignee-avatar">
              {task.assignee
                ? task.assignee.charAt(0).toUpperCase()
                : "?"}
            </span>

            <span>
              {task.assignee || "Unassigned"}
            </span>
          </div>

          <span className="task-due-date">
            <Clock3 size={12} />
            {formatDate(task.dueDate)}
          </span>
        </div>

        <div className="task-move">
          {task.status !== "todo" && (
            <button
              type="button"
              onClick={() =>
                moveTask(task.id, "todo")
              }
            >
              To Do
            </button>
          )}

          {task.status !== "in-progress" && (
            <button
              type="button"
              onClick={() =>
                moveTask(task.id, "in-progress")
              }
            >
              In Progress
            </button>
          )}

          {task.status !== "completed" && (
            <button
              type="button"
              onClick={() =>
                moveTask(task.id, "completed")
              }
            >
              Complete
            </button>
          )}
        </div>
      </article>
    );
  };

  const TaskColumn = ({
    title,
    status,
    tasks: columnTasks,
    icon,
  }) => {
    return (
      <section className="task-column">
        <div className="column-header">
          <div className="column-title">
            <span
              className={`column-dot ${status}`}
            />

            <div className="column-heading-text">
              <h2>{title}</h2>
              <span>
                {columnTasks.length}{" "}
                {columnTasks.length === 1
                  ? "task"
                  : "tasks"}
              </span>
            </div>

            <span className="column-count">
              {columnTasks.length}
            </span>
          </div>

          {status === "todo" && (
            <button
              type="button"
              className="column-add"
              onClick={openCreateModal}
              title="Add task"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="column-icon">
          {icon}
        </div>

        <div className="column-content">
          {columnTasks.length === 0 ? (
            <div className="empty-column">
              <CheckCircle2 size={28} />

              <strong>No tasks here</strong>

              <span>
                Tasks will appear here when
                added to this stage.
              </span>
            </div>
          ) : (
            columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="tasks-page">
      {/* PAGE DECORATION */}

      <div className="tasks-aurora tasks-aurora-one" />
      <div className="tasks-aurora tasks-aurora-two" />
      <div className="tasks-aurora tasks-aurora-three" />

      <div className="tasks-floating-bubbles">
        <span className="tasks-bubble bubble-one" />
        <span className="tasks-bubble bubble-two" />
        <span className="tasks-bubble bubble-three" />
        <span className="tasks-bubble bubble-four" />
        <span className="tasks-bubble bubble-five" />
      </div>

      <div className="tasks-content">
        {/* HEADER */}

        <header className="tasks-header">
          <div className="tasks-heading-area">
            <div className="tasks-title-icon">
              <Sparkles size={19} />
            </div>

            <div>
              <span className="tasks-eyebrow">
                EVENT WORKFLOW
              </span>

              <h1>Tasks</h1>

              <p>
                Organize event preparation and
                track every task from planning
                to completion.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="create-task-btn"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Create Task
          </button>
        </header>

        {/* SUMMARY */}

        <div className="task-summary">
          <div className="task-summary-card total">
            <div className="summary-icon">
              <ListChecks size={19} />
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>

          <div className="task-summary-card todo">
            <div className="summary-icon">
              <CircleDashed size={19} />
            </div>

            <div>
              <span>To Do</span>
              <strong>
                {getColumnCount("todo")}
              </strong>
            </div>
          </div>

          <div className="task-summary-card progress">
            <div className="summary-icon">
              <Clock3 size={19} />
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {getColumnCount("in-progress")}
              </strong>
            </div>
          </div>

          <div className="task-summary-card completed">
            <div className="summary-icon">
              <CircleCheckBig size={19} />
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {getColumnCount("completed")}
              </strong>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="tasks-toolbar">
          <div className="task-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search tasks, events or assignees..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="priority-filter">
            <span>Priority</span>

            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(e.target.value)
              }
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <ChevronDown size={14} />
          </div>
        </div>

        {/* KANBAN BOARD */}

        <div className="kanban-board">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={todoTasks}
            icon={<CircleDashed size={25} />}
          />

          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={progressTasks}
            icon={<Clock3 size={25} />}
          />

          <TaskColumn
            title="Completed"
            status="completed"
            tasks={completedTasks}
            icon={<CircleCheckBig size={25} />}
          />
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div
          className="tasks-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="tasks-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="tasks-modal-header">
              <div>
                <span className="tasks-eyebrow">
                  TASK MANAGEMENT
                </span>

                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>
              </div>

              <button
                type="button"
                className="tasks-modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="task-form">
              <div className="form-field">
                <label>Task Title</label>

                <input
                  type="text"
                  placeholder="Enter task title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Description</label>

                <textarea
                  rows="3"
                  placeholder="Describe the task..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-two-columns">
                <div className="form-field">
                  <label>Event</label>

                  <select
                    value={form.event}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event: e.target.value,
                      })
                    }
                  >
                    <option>
                      Tech Fest 2026
                    </option>

                    <option>
                      AI Workshop
                    </option>

                    <option>
                      Python Bootcamp
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Priority</label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="form-two-columns">
                <div className="form-field">
                  <label>Assignee</label>

                  <div className="input-with-icon">
                    <User size={15} />

                    <input
                      type="text"
                      placeholder="Team member"
                      value={form.assignee}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          assignee:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dueDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="tasks-modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-save"
                onClick={saveTask}
              >
                {editingTask
                  ? "Save Changes"
                  : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}

      {showDetails && selectedTask && (
        <div
          className="tasks-modal-overlay"
          onClick={() =>
            setShowDetails(false)
          }
        >
          <div
            className="task-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="tasks-modal-header">
              <div>
                <span className="tasks-eyebrow">
                  TASK DETAILS
                </span>

                <h2>
                  {selectedTask.title}
                </h2>
              </div>

              <button
                type="button"
                className="tasks-modal-close"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <p className="details-description">
              {selectedTask.description}
            </p>

            <div className="details-grid">
              <div>
                <span>Event</span>
                <strong>
                  {selectedTask.event}
                </strong>
              </div>

              <div>
                <span>Assignee</span>
                <strong>
                  {selectedTask.assignee ||
                    "Unassigned"}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {selectedTask.priority}
                </strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>
                  {formatDate(
                    selectedTask.dueDate
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedTask.status ===
                  "todo"
                    ? "To Do"
                    : selectedTask.status ===
                      "in-progress"
                    ? "In Progress"
                    : "Completed"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="details-close-btn"
              onClick={() =>
                setShowDetails(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;