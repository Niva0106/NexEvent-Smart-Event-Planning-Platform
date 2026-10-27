# NexEvent – Smart Event Planning Platform

**Infosys Springboard Virtual Internship 7.0 Project**

NexEvent is a full-stack web application designed to simplify event planning and coordination through a centralized platform. It helps organizers manage events, coordinate venues and resources, handle registrations, track expenses, and monitor event preparation through a unified dashboard.

Developed as part of the **Infosys Springboard Virtual Internship 7.0**, this project demonstrates the practical application of full-stack development, database management, API integration, and deployment.

## 🌐 Live Application

- **Live Demo:** [NexEvent](https://nexevent-7kek.onrender.com)
- **GitHub Repository:** [NexEvent – Smart Event Planning Platform](https://github.com/Niva0106/NexEvent-Smart-Event-Planning-Platform)

> Note: The application may take a little time to load if the backend is inactive.

## 🎯 Project Objective

To build a centralized event management platform that improves coordination between organizers, venues, vendors, resources, and participants while reducing manual effort and making event planning more efficient.

## ✨ Features

- **Event Management** – Create, organize, and manage event details.
- **Venue Management** – Maintain venue information and coordinate event locations.
- **Resource Management** – Track and allocate resources required for events.
- **Smart Resource Recommendations** – Recommend suitable resources based on event requirements.
- **Event Registration** – Provide a dedicated workflow for participant registration.
- **QR-Based Registration** – Support QR-based registration workflows and email confirmations.
- **Vendor Management** – Manage vendors and event-related services.
- **Budget and Expense Tracking** – Record and monitor event expenses.
- **Task Management** – Organize event tasks and track preparation activities.
- **Team Coordination** – Manage team members and responsibilities.
- **Dashboard and Analytics** – View event information and relevant metrics in one place.
- **Notifications and Announcements** – Support event updates and communication.
- **Demo Payment Workflow** – Demonstrate payment-related functionality for event registrations.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python, Flask |
| Database | SQLite |
| API Communication | REST APIs |
| Email Service | Resend |
| Payment Workflow | Razorpay Demo Integration |
| Deployment | Render and frontend hosting |

## 🏗️ System Architecture

NexEvent follows a client-server architecture in which the React frontend communicates with the Flask backend through REST APIs.

```text
             User
               |
               v
        React Frontend
               |
               v
         Flask Backend
               |
               v
        SQLite Database
               |
      ---------------------
      |         |         |
    Events   Resources  Registrations
      |         |         |
    Vendors   Expenses    Tasks

       External Integrations
       ---------------------
       Resend Email Service
       Razorpay Demo Workflow
```

## 🚀 Deployment

The application is deployed as separate frontend and backend services.

- **Frontend:** Provides the user interface for event planning and management.
- **Backend:** Handles API requests, application logic, and database operations.
- **Database:** SQLite stores event-related information and application records.
- **External Services:** Resend supports email delivery, while the payment workflow demonstrates payment-related functionality.

## 🎓 Internship Details

- **Program:** Infosys Springboard Virtual Internship 7.0
- **Project:** NexEvent – Smart Event Planning Platform
- **Domain:** Python Full Stack Development

### Key Learning Outcomes

- Developing full-stack web applications using React and Flask.
- Designing and integrating REST APIs.
- Managing relational data using SQLite.
- Implementing event registration and resource coordination workflows.
- Integrating external services for email communication.
- Deploying frontend and backend applications.
- Understanding database-driven application development.

## 🔮 Future Enhancements

- Advanced event scheduling and resource conflict detection.
- Enhanced analytics and reporting.
- Improved authentication and role-based access control.
- Production-ready payment processing and verification.
- More robust database hosting, backups, and persistence.
- Automated reminders and expanded notification features.

---

*Developed as part of the Infosys Springboard Virtual Internship 7.0.*
