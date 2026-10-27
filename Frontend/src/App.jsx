
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AppLayout from "./Components/AppLayout";

// Public pages
import LandingPage from "./LandingPage/LandingPage";
import Login from "./Login/Login";
import Register from "./Register/Register";

// Main application pages
import Dashboard from "./Dashboard/Dashboard";
import Events from "./Events/Events";
import EventDetails from "./EventDetails/EventDetails";
import Resources from "./Resources/Resources";
import ResourceAllocation from "./ResourceAllocation/ResourceAllocation";
import Schedule from "./Schedule/Schedule";
import Tasks from "./Tasks/Tasks";
import Vendors from "./Vendors/Vendors";
import Team from "./Team/Team";
import ConflictDetection from "./LandingPage/ConflictDetection/ConflictDetection";
import Insights from "./Insights/Insights";
import Venues from "./Venues/Venues";
import Settings from "./Settings/Settings";

// Milestone 4
import Analytics from "./Analytics/Analytics";
import Reports from "./Reports/Reports";

// Event registration
import EventRegistration from "./EventRegistration/EventRegistration";
import RegistrationQR from "./EventRegistration/RegistrationQR";
import Attendance from "./Attendance/Attendance";


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("eventflowLoggedIn") === "true";

  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}


/* =========================================================
   APPLICATION ROUTES
   ========================================================= */

function App() {
  return (
    <Routes>

      {/* ===================================================
          PUBLIC ROUTES
          =================================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Public QR registration page */}
      <Route
        path="/registration/:registrationId"
        element={<RegistrationQR />}
      />

      <Route
        path="/register/:eventId"
        element={<EventRegistration />}
      />


      {/* ===================================================
          PROTECTED APPLICATION ROUTES
          =================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* -------------------------------------------------
            DASHBOARD
            ------------------------------------------------- */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* -------------------------------------------------
            EVENT MANAGEMENT
            ------------------------------------------------- */}

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />


        {/* -------------------------------------------------
            RESOURCE MANAGEMENT
            ------------------------------------------------- */}

        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/resource-allocation"
          element={<ResourceAllocation />}
        />


        {/* -------------------------------------------------
            SCHEDULING & TASKS
            ------------------------------------------------- */}

        <Route
          path="/schedule"
          element={<Schedule />}
        />

        <Route
          path="/tasks"
          element={<Tasks />}
        />


        {/* -------------------------------------------------
            VENDORS & TEAM
            ------------------------------------------------- */}

        <Route
          path="/vendors"
          element={<Vendors />}
        />

        <Route
          path="/team"
          element={<Team />}
        />


        {/* -------------------------------------------------
            CONFLICTS & INSIGHTS
            ------------------------------------------------- */}

        <Route
          path="/conflicts"
          element={<ConflictDetection />}
        />

        <Route
          path="/insights"
          element={<Insights />}
        />


        {/* =================================================
            MILESTONE 4
            ANALYTICS, RESOURCE COORDINATION & FINALIZATION
            ================================================= */}

        {/* Attendance Analytics + Event Analytics + Budget */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* Final Event Reports + Export */}
        <Route
          path="/reports"
          element={<Reports />}
        />

        {/* Resource Coordination */}
        <Route
          path="/resource-allocation"
          element={<ResourceAllocation />}
        />


        {/* -------------------------------------------------
            VENUES & SETTINGS
            ------------------------------------------------- */}

        <Route
          path="/venues"
          element={<Venues />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />


        {/* -------------------------------------------------
            EVENT REGISTRATION
            ------------------------------------------------- */}

        <Route
          path="/event-registration/:eventId"
          element={<EventRegistration />}
        />

        <Route
          path="/register/:eventId"
          element={<EventRegistration />}
        />

        <Route
          path="/attendance"
          element={<Attendance />}
        />

      </Route>

      
      {/* ===================================================
          FALLBACK
          =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;
