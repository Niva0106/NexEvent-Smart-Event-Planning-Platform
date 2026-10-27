import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
  X,
  ClipboardCheck,
} from "lucide-react";

import "./AppLayout.css";

function AppLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const storedUser = localStorage.getItem(
    "eventflowCurrentUser"
  );

  let currentUser = {
    name: "Admin",
    email: "admin@nexevent.com",
  };

  try {
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } catch {
    currentUser = {
      name: "Admin",
      email: "admin@nexevent.com",
    };
  }

  const adminName = currentUser?.name || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("eventflowLoggedIn");
    localStorage.removeItem("eventflowCurrentUser");

    setProfileOpen(false);
    setSidebarOpen(false);

    navigate("/login");
  };

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Events",
      path: "/events",
      icon: CalendarDays,
    },
    {
      label: "Resources",
      path: "/resources",
      icon: Package,
    },
    {
      label: "Resource Allocation",
      path: "/resource-allocation",
      icon: WalletCards,
    },
    {
      label: "Schedule",
      path: "/schedule",
      icon: Activity,
    },
    {
      label: "Tasks",
      path: "/tasks",
      icon: ClipboardList,
    },
    {
      label: "Vendors",
      path: "/vendors",
      icon: Store,
    },
    {
      label: "Team",
      path: "/team",
      icon: Users,
    },
    {
      label: "Conflicts",
      path: "/conflicts",
      icon: ShieldCheck,
    },

    {
      label: "Check-in",
      path: "/attendance",
      icon: ClipboardCheck,
    },

    {
      label: "Insights",
      path: "/insights",
      icon: Activity,
    },

    // Analytics is a normal sidebar item
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },

    {
      label: "Reports",
      path: "/reports",
      icon: FileBarChart,
    },
    {
      label: "Venues",
      path: "/venues",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${
          sidebarOpen ? "app-sidebar-open" : ""
        }`}
      >
        {/* Brand */}
        <div className="app-sidebar-brand">
          <button
            type="button"
            className="app-brand-button"
            onClick={() => navigate("/dashboard")}
          >
            <div className="app-brand-mark">
              NE
            </div>

            <div className="app-brand-text">
              <strong>NexEvent</strong>
              <span>Event Management</span>
            </div>
          </button>

          <button
            type="button"
            className="app-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* Menu title */}
        <div className="app-sidebar-section-title">
          MAIN MENU
        </div>

        {/* Navigation */}
        <nav className="app-sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `app-nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="app-nav-icon">
                  <Icon
                    size={19}
                    strokeWidth={2}
                  />
                </span>

                <span className="app-nav-label">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="app-sidebar-bottom">
          <NavLink
            to="/settings"
            onClick={handleNavigation}
            className={({ isActive }) =>
              `app-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="app-nav-icon">
              <Settings
                size={19}
                strokeWidth={2}
              />
            </span>

            <span className="app-nav-label">
              Settings
            </span>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        {/* Top bar */}
        <header className="app-topbar">
          <button
            type="button"
            className="app-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <div className="app-global-actions">
            {/* Notifications */}
            <button
              type="button"
              className="app-notification-button"
              aria-label="Notifications"
            >
              <Bell
                size={20}
                strokeWidth={2}
              />

              <span className="app-notification-dot" />
            </button>

            {/* Profile */}
            <div className="app-profile-wrapper">
              <button
                type="button"
                className="app-profile-button"
                onClick={() =>
                  setProfileOpen(
                    (previous) => !previous
                  )
                }
              >
                <div className="app-profile-avatar">
                  {adminName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="app-profile-info">
                  <strong>{adminName}</strong>
                  <span>Administrator</span>
                </div>

                <ChevronDown
                  size={17}
                  className={
                    profileOpen
                      ? "app-profile-chevron-open"
                      : ""
                  }
                />
              </button>

              {profileOpen && (
                <div className="app-profile-popup">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings size={17} />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    className="app-profile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="app-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;