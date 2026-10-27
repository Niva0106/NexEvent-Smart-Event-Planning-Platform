
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";


/* ============================================================
   COMMON REQUEST FUNCTION
   ============================================================ */

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("API request:", {
    url,
    method: options.method || "GET",
  });

  try {
    const requestOptions = {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    };

    /*
     * Only send Content-Type when there is actually a body.
     *
     * This is especially important for DELETE requests because
     * DELETE requests without a body do not need
     * application/json.
     */
    if (options.body) {
      requestOptions.headers["Content-Type"] =
        "application/json";
    }

    const response = await fetch(
      url,
      requestOptions
    );

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    console.log("API response:", {
      url,
      method: options.method || "GET",
      status: response.status,
      data,
    });


    /* --------------------------------------------------------
       HTTP ERROR
       -------------------------------------------------------- */

    if (!response.ok) {
      const message =
        (
          data &&
          typeof data === "object" &&
          (
            data.error ||
            data.message ||
            data.details
          )
        ) ||
        `Request failed with status ${response.status}`;

      const error = new Error(message);

      error.status = response.status;
      error.data = data;

      throw error;
    }


    /* --------------------------------------------------------
       SUCCESS
       -------------------------------------------------------- */

    return data;


  } catch (error) {

    /*
     * Fetch TypeError normally means:
     *
     * - backend unavailable
     * - CORS failure
     * - network failure
     *
     * HTTP errors created above are normal Error objects and
     * should not be converted into a fake "backend unavailable"
     * message.
     */

    if (
      error instanceof TypeError &&
      !error.status &&
      !error.data
    ) {
      console.error(
        "Network / CORS error:",
        error
      );

      throw new Error(
        `Unable to connect to the NexEvent backend at ${API_BASE_URL}. ` +
        `Please make sure the Flask server is running on port 5000.`
      );
    }

    console.error(
      "API request failed:",
      error
    );

    throw error;
  }
}


/* ============================================================
   EVENTS
   ============================================================ */

const events = {

  async getAll() {
    return request("/api/events");
  },


  async getById(id) {
    return request(`/api/events/${id}`);
  },


  async create(eventData) {
    return request("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },


  async update(id, eventData) {
    return request(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },


  async delete(id) {
    return request(`/api/events/${id}`, {
      method: "DELETE",
    });
  },

};


/* ============================================================
   VENDORS
   ============================================================ */

const vendors = {

  async getAll() {
    return request("/api/vendors");
  },


  async create(vendorData) {
    return request("/api/vendors", {
      method: "POST",
      body: JSON.stringify(vendorData),
    });
  },


  async update(id, vendorData) {
    return request(`/api/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(vendorData),
    });
  },


  async delete(id) {
    return request(`/api/vendors/${id}`, {
      method: "DELETE",
    });
  },


  async assign(id, assignmentData) {
    return request(`/api/vendors/${id}/assign`, {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  },


  async removeAssignment(vendorId, assignmentId) {
    return request(
      `/api/vendors/${vendorId}/assignments/${assignmentId}`,
      {
        method: "DELETE",
      }
    );
  },


  async updateRatings(id, ratingData) {
    return request(`/api/vendors/${id}/ratings`, {
      method: "PUT",
      body: JSON.stringify(ratingData),
    });
  },

};


/* ============================================================
   BUDGET & FINANCE
   ============================================================ */

const finance = {
  async updateBudget(eventId, amount) {
    return request(`/api/finance/events/${eventId}/budget`, {
      method: "PUT",
      body: JSON.stringify({ budget: Number(amount) }),
    });
  },

  async getExpenses(eventId) {
    return request(`/api/finance/events/${eventId}/expenses`);
  },

  async createExpense(eventId, expenseData) {
    return request(`/api/finance/events/${eventId}/expenses`, {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  },

  async updateExpense(eventId, expenseId, expenseData) {
    return request(
      `/api/finance/events/${eventId}/expenses/${expenseId}`,
      {
        method: "PUT",
        body: JSON.stringify(expenseData),
      }
    );
  },

  async deleteExpense(eventId, expenseId) {
    return request(
      `/api/finance/events/${eventId}/expenses/${expenseId}`,
      {
        method: "DELETE",
      }
    );
  },

  async getSponsors(eventId) {
    return request(`/api/finance/events/${eventId}/sponsors`);
  },

  async createSponsor(eventId, sponsorData) {
    return request(`/api/finance/events/${eventId}/sponsors`, {
      method: "POST",
      body: JSON.stringify(sponsorData),
    });
  },

  async updateSponsor(eventId, sponsorId, sponsorData) {
    return request(
      `/api/finance/events/${eventId}/sponsors/${sponsorId}`,
      {
        method: "PUT",
        body: JSON.stringify(sponsorData),
      }
    );
  },

  async deleteSponsor(eventId, sponsorId) {
    return request(
      `/api/finance/events/${eventId}/sponsors/${sponsorId}`,
      {
        method: "DELETE",
      }
    );
  },
};

/* ============================================================
   PAYMENT
   ============================================================ */

const payment = {

  async createOrder(paymentData) {
    return request("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },


  async verify(paymentData) {
    return request("/api/payment/verify", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },


  async cancel(paymentData) {
    return request("/api/payment/cancel", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },


  async getStatus(registrationId) {
    return request(
      `/api/payment/status/${registrationId}`
    );
  },

};

/* ============================================================
   ATTENDANCE CHECK-IN
   ============================================================ */

const attendance = {

  async checkIn(registrationId, eventId) {
    return request(
      "/api/attendance/check-in",
      {
        method: "POST",

        body: JSON.stringify({
          registration_id: registrationId,
          event_id: eventId,
        }),
      }
    );
  },


  async getByEvent(eventId) {
    return request(
      `/api/attendance/event/${eventId}`
    );
  },

  async getParticipants(eventId) {
    return request(
      `/api/attendance/event/${eventId}/participants`
    );
  },

};

/* ============================================================
   MILESTONE 4
   ============================================================ */

const milestone4 = {

  async health() {
    return request("/api/milestone4/health");
  },


  async getAttendance() {
    return request("/api/milestone4/attendance");
  },


  async getAttendanceByEvent(eventId) {
    return request(
      `/api/milestone4/attendance/${eventId}`
    );
  },


  async saveAttendance(attendanceData) {
    return request(
      "/api/milestone4/attendance",
      {
        method: "POST",
        body: JSON.stringify(attendanceData),
      }
    );
  },


  async getAttendanceAnalytics() {
    return request(
      "/api/milestone4/analytics/attendance"
    );
  },


  async getAttendanceEstimate(eventId) {
    return request(
      `/api/milestone4/attendance/${eventId}/estimate`
    );
  },


  async getEventAnalytics() {
    return request(
      "/api/milestone4/analytics/events"
    );
  },


  async getBudgetAnalytics() {
    return request(
      "/api/milestone4/analytics/budget"
    );
  },


  async compareEvents(event1Id, event2Id) {
    return request(
      `/api/milestone4/analytics/compare?event1_id=${event1Id}&event2_id=${event2Id}`
    );
  },


  async getFinalReports() {
    return request(
      "/api/milestone4/reports/final"
    );
  },


  async getDashboard() {
    return request(
      "/api/milestone4/dashboard"
    );
  },


  async getSystemTests() {
    return request(
      "/api/milestone4/system-tests"
    );
  },

};


/* ============================================================
   HEALTH
   ============================================================ */

const health = {

  async check() {
    return request("/api/health");
  },

};


/* ============================================================
   MAIN API OBJECT
   ============================================================ */

const api = {

  events,
  vendors,
  finance,
  payment,
  attendance,
  milestone4,
  health,

  getEvents: events.getAll,
  getEvent: events.getById,
  createEvent: events.create,
  updateEvent: events.update,
  deleteEvent: events.delete,

  request,

};


/* ============================================================
   EXPORTS
   ============================================================ */

export {
  api,
  events,
  vendors,
  finance,
  payment,
  milestone4,
  health,
  request,
};

export default api;
