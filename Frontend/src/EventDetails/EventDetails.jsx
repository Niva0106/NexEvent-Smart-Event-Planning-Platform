import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../Services/Api";
import GoogleMap from "../Components/GoogleMap";

import "./EventDetails.css";

const INDIA_CENTER = {
  latitude: 20.5937,
  longitude: 78.9629,
};

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95 && code <= 99) return "⛈️";

  return "🌤️";
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Freezing Drizzle",
    57: "Freezing Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Showers",
    81: "Moderate Showers",
    82: "Heavy Showers",
    85: "Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail",
  };

  return descriptions[code] || "Weather Conditions";
}

/* =========================================================
   UNIQUE WEATHER ANIMATION
========================================================= */

function WeatherAnimation({ code }) {
  const weatherCode = Number(code);

  const isClear = weatherCode === 0;

  const isPartlyCloudy =
    weatherCode === 1 || weatherCode === 2;

  const isCloudy = weatherCode === 3;

  const isFog =
    weatherCode === 45 || weatherCode === 48;

  const isDrizzle =
    weatherCode >= 51 && weatherCode <= 57;

  const isRain =
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82);

  const isSnow =
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86);

  const isThunderstorm =
    weatherCode >= 95 && weatherCode <= 99;

  /* CLEAR SKY */

  if (isClear) {
    return (
      <div className="weather-animation weather-clear">
        <div className="sun-glow" />

        <div className="sun-core">☀</div>

        <span className="sun-ray ray-1" />
        <span className="sun-ray ray-2" />
        <span className="sun-ray ray-3" />
        <span className="sun-ray ray-4" />
        <span className="sun-ray ray-5" />
        <span className="sun-ray ray-6" />
        <span className="sun-ray ray-7" />
        <span className="sun-ray ray-8" />

        <div className="weather-particle particle-1" />
        <div className="weather-particle particle-2" />
        <div className="weather-particle particle-3" />
      </div>
    );
  }

  /* PARTLY CLOUDY */

  if (isPartlyCloudy) {
    return (
      <div className="weather-animation weather-partly-cloudy">
        <div className="small-sun">
          <div className="small-sun-core">☀</div>
        </div>

        <div className="cloud cloud-back">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud-front">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  /* CLOUDY */

  if (isCloudy) {
    return (
      <div className="weather-animation weather-cloudy">
        <div className="cloud cloud-1">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud-2">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud-3">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  /* FOG */

  if (isFog) {
    return (
      <div className="weather-animation weather-fog">
        <div className="fog-layer fog-layer-1" />
        <div className="fog-layer fog-layer-2" />
        <div className="fog-layer fog-layer-3" />

        <div className="fog-sun">☀</div>
      </div>
    );
  }

  /* THUNDERSTORM */

  if (isThunderstorm) {
    return (
      <div className="weather-animation weather-thunderstorm">
        <div className="storm-cloud">
          <span />
          <span />
          <span />
        </div>

        <div className="lightning lightning-1">
          ⚡
        </div>

        <div className="lightning lightning-2">
          ⚡
        </div>

        <div className="rain-drops">
          {Array.from({ length: 18 }).map(
            (_, index) => (
              <span
                key={index}
                style={{
                  "--delay": `${index * 0.08}s`,
                  "--left": `${5 + index * 5}%`,
                }}
              />
            )
          )}
        </div>
      </div>
    );
  }

  /* SNOW */

  if (isSnow) {
    return (
      <div className="weather-animation weather-snow">
        <div className="snow-cloud">
          <span />
          <span />
          <span />
        </div>

        <div className="snow-particles">
          {Array.from({ length: 22 }).map(
            (_, index) => (
              <span
                key={index}
                style={{
                  "--delay": `${index * 0.12}s`,
                  "--left": `${3 + index * 4.5}%`,
                  "--size": `${4 + (index % 4)}px`,
                }}
              />
            )
          )}
        </div>
      </div>
    );
  }

  /* RAIN / DRIZZLE */

  if (isRain || isDrizzle) {
    return (
      <div className="weather-animation weather-rain">
        <div className="rain-cloud">
          <span />
          <span />
          <span />
        </div>

        <div className="rain-drops">
          {Array.from({
            length: isDrizzle ? 12 : 22,
          }).map((_, index) => (
            <span
              key={index}
              style={{
                "--delay": `${index * 0.09}s`,
                "--left": `${3 + index * 4.5}%`,
              }}
            />
          ))}
        </div>

        <div className="rain-splash splash-1" />
        <div className="rain-splash splash-2" />
        <div className="rain-splash splash-3" />
      </div>
    );
  }

  /* DEFAULT */

  return (
    <div className="weather-animation weather-partly-cloudy">
      <div className="small-sun">
        <div className="small-sun-core">☀</div>
      </div>

      <div className="cloud cloud-front">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/* =========================================================
   WEATHER PRECAUTIONS
========================================================= */

function getWeatherPrecautions(weather) {
  if (!weather?.current) {
    return [];
  }

  const current = weather.current;

  const precautions = [];

  const temperature = Number(
    current.temperature_2m
  );

  const windSpeed = Number(
    current.wind_speed_10m
  );

  const humidity = Number(
    current.relative_humidity_2m
  );

  const visibility =
    current.visibility !== undefined
      ? Number(current.visibility)
      : null;

  const precipitation =
    current.precipitation !== undefined
      ? Number(current.precipitation)
      : 0;

  const cloudCover =
    current.cloud_cover !== undefined
      ? Number(current.cloud_cover)
      : 0;

  const code = Number(
    current.weather_code
  );

  /* THUNDERSTORM */

  if (code >= 95 && code <= 99) {
    precautions.push({
      title: "Thunderstorm Alert",
      text:
        "Avoid outdoor activities during thunderstorms. Secure temporary structures and protect electrical equipment.",
      icon: "⛈️",
      level: "high",
    });
  }

  /* RAIN */

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    precipitation > 0
  ) {
    precautions.push({
      title: "Rain Protection",
      text:
        "Keep rain covers and umbrellas ready. Provide sheltered areas for attendees and protect event equipment.",
      icon: "🌧️",
      level:
        precipitation >= 5 || code >= 65
          ? "high"
          : "medium",
    });
  }

  /* SNOW */

  if (
    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86)
  ) {
    precautions.push({
      title: "Snow Conditions",
      text:
        "Keep walkways clear and provide warm indoor or sheltered areas for attendees.",
      icon: "❄️",
      level: "medium",
    });
  }

  /* TEMPERATURE */

  if (temperature >= 38) {
    precautions.push({
      title: "Extreme Heat",
      text:
        "Provide drinking water, shaded areas and adequate ventilation for attendees.",
      icon: "🌡️",
      level: "high",
    });
  } else if (temperature >= 32) {
    precautions.push({
      title: "High Temperature",
      text:
        "Keep attendees hydrated and provide shaded or ventilated areas.",
      icon: "☀️",
      level: "medium",
    });
  }

  /* WIND */

  if (windSpeed >= 40) {
    precautions.push({
      title: "Strong Wind",
      text:
        "Secure banners, tents, decorations and other temporary structures.",
      icon: "🌬️",
      level: "high",
    });
  } else if (windSpeed >= 25) {
    precautions.push({
      title: "Moderate Wind",
      text:
        "Check temporary structures, outdoor decorations and signage before the event.",
      icon: "💨",
      level: "medium",
    });
  }

  /* HUMIDITY */

  if (humidity >= 80) {
    precautions.push({
      title: "High Humidity",
      text:
        "Ensure good ventilation and provide comfortable indoor areas where possible.",
      icon: "💧",
      level: "medium",
    });
  }

  /* VISIBILITY / FOG */

  if (
    (code === 45 || code === 48) ||
    (visibility !== null &&
      Number.isFinite(visibility) &&
      visibility < 3000)
  ) {
    precautions.push({
      title: "Low Visibility",
      text:
        "Use clear signage and ensure entrances and pathways are well illuminated.",
      icon: "🌫️",
      level: "medium",
    });
  }

  /* HEAVY CLOUD COVER */

  if (
    cloudCover >= 85 &&
    code < 51 &&
    code !== 95 &&
    code !== 96 &&
    code !== 97 &&
    code !== 98 &&
    code !== 99
  ) {
    precautions.push({
      title: "Overcast Conditions",
      text:
        "Keep indoor lighting and backup arrangements ready for reduced natural light.",
      icon: "☁️",
      level: "low",
    });
  }

  /* REMOVE DUPLICATES */

  const uniquePrecautions =
    precautions.filter(
      (precaution, index, array) =>
        index ===
        array.findIndex(
          (item) =>
            item.title ===
            precaution.title
        )
    );

  /* PRIORITY */

  const levelPriority = {
    high: 1,
    medium: 2,
    low: 3,
  };

  uniquePrecautions.sort(
    (a, b) =>
      levelPriority[a.level] -
      levelPriority[b.level]
  );

  /* MAXIMUM 3 */

  if (uniquePrecautions.length > 0) {
    return uniquePrecautions.slice(0, 3);
  }

  /* NORMAL WEATHER */

  return [
    {
      title: "Weather Conditions Look Good",
      text:
        "Current conditions do not indicate any major weather-related concerns for the event.",
      icon: "✅",
      level: "low",
    },
  ];
}

function formatResources(resources) {
  if (!resources) {
    return [];
  }

  if (Array.isArray(resources)) {
    return resources;
  }

  return String(resources)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStatusClass(status) {
  const value = String(
    status || "Planning"
  ).toLowerCase();

  if (value === "confirmed") {
    return "status-confirmed";
  }

  if (value === "completed") {
    return "status-completed";
  }

  if (value === "cancelled") {
    return "status-cancelled";
  }

  return "status-planning";
}

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  const financeEventId = event?.id;

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("overview");

  const [weather, setWeather] =
    useState(null);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [weatherError, setWeatherError] =
    useState("");

  const [animatedTemperature, setAnimatedTemperature] =
    useState(0);

  const [attendanceData, setAttendanceData] = useState({
    registered: 0,
    checked_in: 0,
  });

  const [registrationLink, setRegistrationLink] = useState("");

  const [participants, setParticipants] = useState([]);

  const [participantsLoading, setParticipantsLoading] = useState(false);

  const [participantsError, setParticipantsError] = useState("");

  const [showParticipants, setShowParticipants] = useState(false);

  const [plannedBudget, setPlannedBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState("");
  const [financeMessage, setFinanceMessage] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    category: "Other",
    amount: "",
    date: "",
    description: "",
    status: "Pending",
  });

  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    amount: "",
    status: "Pending",
  });

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingSponsorId, setEditingSponsorId] = useState(null);

    const loadFinanceData = async (eventId) => {
    try {
      setFinanceLoading(true);
      setFinanceError("");
      setFinanceMessage("");

      const [expenseData, sponsorData] = await Promise.all([
        api.finance.getExpenses(eventId),
        api.finance.getSponsors(eventId),
      ]);

      setExpenses(
        Array.isArray(expenseData)
          ? expenseData
          : expenseData?.expenses || []
      );

      setSponsors(
        Array.isArray(sponsorData)
          ? sponsorData
          : sponsorData?.sponsors || []
      );
    } catch (err) {
      console.error("Finance loading error:", err);
      setFinanceError(
        "Unable to load financial records. Please check the backend connection."
      );
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "finance" || !event?.id) {
      return;
    }

    const budget = Number(event.budget) || 0;

    setPlannedBudget(budget);
    setBudgetInput(String(budget));

    loadFinanceData(event.id);
  }, [activeTab, event?.id, event?.budget]);

  const saveBudget = async (e) => {
    e.preventDefault();

    const amount = Number(budgetInput);

    if (!Number.isFinite(amount) || amount < 0) {
      setFinanceError("Enter a valid budget of zero or more.");
      return;
    }

    try {
      setFinanceError("");
      setFinanceMessage("");

      await api.finance.updateBudget(financeEventId, amount);

      setPlannedBudget(amount);
      setEvent((previous) => ({
        ...previous,
        budget: amount,
      }));

      setFinanceMessage("Planned budget updated successfully.");
    } catch (err) {
      console.error("Budget update error:", err);
      setFinanceError("Could not save the budget.");
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      name: "",
      category: "Other",
      amount: "",
      date: "",
      description: "",
      status: "Pending",
    });

    setEditingExpenseId(null);
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    const amount = Number(expenseForm.amount);

    if (!expenseForm.name.trim()) {
      setFinanceError("Enter an expense name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFinanceError("Expense amount must be greater than zero.");
      return;
    }

    const payload = {
      ...expenseForm,
      name: expenseForm.name.trim(),
      amount,
    };

    try {
      setFinanceError("");
      setFinanceMessage("");

      if (editingExpenseId !== null) {
        await api.finance.updateExpense(
          financeEventId,
          editingExpenseId,
          payload
        );
      } else {
        await api.finance.createExpense(financeEventId, payload);
      }

      await loadFinanceData(financeEventId);
      resetExpenseForm();
      setFinanceMessage("Expense saved successfully.");
    } catch (err) {
      console.error("Expense save error:", err);
      setFinanceError("Could not save the expense.");
    }
  };

  const editExpense = (expense) => {
    setEditingExpenseId(expense.id);

    setExpenseForm({
      name: expense.name || "",
      category: expense.category || "Other",
      amount: String(expense.amount ?? ""),
      date: expense.date || "",
      description: expense.description || "",
      status: expense.status || "Pending",
    });

    setFinanceError("");
    setFinanceMessage("");
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      setFinanceError("");
      setFinanceMessage("");

      await api.finance.deleteExpense(financeEventId, expenseId);
      await loadFinanceData(financeEventId);

      setFinanceMessage("Expense deleted successfully.");
    } catch (err) {
      console.error("Expense deletion error:", err);
      setFinanceError("Could not delete the expense.");
    }
  };

  const resetSponsorForm = () => {
    setSponsorForm({
      name: "",
      amount: "",
      status: "Pending",
    });

    setEditingSponsorId(null);
  };

  const saveSponsor = async (e) => {
    e.preventDefault();

    const amount = Number(sponsorForm.amount);

    if (!sponsorForm.name.trim()) {
      setFinanceError("Enter a sponsor name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFinanceError("Sponsorship amount must be greater than zero.");
      return;
    }

    const payload = {
      ...sponsorForm,
      name: sponsorForm.name.trim(),
      amount,
    };

    try {
      setFinanceError("");
      setFinanceMessage("");

      if (editingSponsorId !== null) {
        await api.finance.updateSponsor(
          financeEventId,
          editingSponsorId,
          payload
        );
      } else {
        await api.finance.createSponsor(financeEventId, payload);
      }

      await loadFinanceData(financeEventId);
      resetSponsorForm();
      setFinanceMessage("Sponsorship saved successfully.");
    } catch (err) {
      console.error("Sponsorship save error:", err);
      setFinanceError("Could not save the sponsorship.");
    }
  };

  const editSponsor = (sponsor) => {
    setEditingSponsorId(sponsor.id);

    setSponsorForm({
      name: sponsor.name || "",
      amount: String(sponsor.amount ?? ""),
      status: sponsor.status || "Pending",
    });

    setFinanceError("");
    setFinanceMessage("");
  };

  const deleteSponsor = async (sponsorId) => {
    if (!window.confirm("Delete this sponsorship?")) return;

    try {
      setFinanceError("");
      setFinanceMessage("");

      await api.finance.deleteSponsor(financeEventId, sponsorId);
      await loadFinanceData(financeEventId);

      setFinanceMessage("Sponsorship deleted successfully.");
    } catch (err) {
      console.error("Sponsorship deletion error:", err);
      setFinanceError("Could not delete the sponsorship.");
    }
  };

  /* LOAD EVENT */
  
  useEffect(() => {
    if (activeTab === "attendees" && event?.event_id) {
      loadAttendanceData(event.event_id);
      loadParticipants(event.event_id);
    }
  }, [activeTab, event?.event_id]);


  const loadAttendanceData = async (eventId) => {
    try {
      const data = await api.attendance.getByEvent(eventId);

      if (data?.success && data?.attendance) {
        setAttendanceData({
          registered: data.attendance.registered || 0,
          checked_in: data.attendance.checked_in || 0,
        });
      }
    } catch (err) {
      console.error("Attendance loading error:", err);

      setAttendanceData({
        registered: 0,
        checked_in: 0,
      });
    }
  };


  const loadParticipants = async (eventId) => {
    try {
      setParticipantsLoading(true);
      setParticipantsError("");

      const data = await api.attendance.getParticipants(eventId);

      if (data?.success && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      } else {
        setParticipants([]);
        setParticipantsError("Unable to load participants.");
      }
    } catch (err) {
      console.error("Participant loading error:", err);
      setParticipants([]);
      setParticipantsError(
        "Unable to load participants. Please try again."
      );
    } finally {
      setParticipantsLoading(false);
    }
  };


  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.events.getAll();

        let events = [];

        if (Array.isArray(response)) {
          events = response;
        } else if (
          Array.isArray(response?.data)
        ) {
          events = response.data;
        } else if (
          Array.isArray(response?.events)
        ) {
          events = response.events;
        }

        const selectedEvent =
          events.find(
            (item) =>
              String(item.id) ===
                String(id) ||
              String(item.event_id) ===
                String(id)
          );

        if (!selectedEvent) {
          throw new Error(
            "Event not found."
          );
        }

        const latitude =
          selectedEvent.latitude ??
          selectedEvent.lat ??
          selectedEvent.location
            ?.latitude ??
          selectedEvent.location?.lat ??
          INDIA_CENTER.latitude;

        const longitude =
          selectedEvent.longitude ??
          selectedEvent.lng ??
          selectedEvent.lon ??
          selectedEvent.location
            ?.longitude ??
          selectedEvent.location?.lng ??
          INDIA_CENTER.longitude;

        await loadAttendanceData(
          selectedEvent.event_id || selectedEvent.id
        );

        if (cancelled) return;

        setEvent({
          id: selectedEvent.id,

          event_id:
            selectedEvent.event_id,

          name:
            selectedEvent.name ||
            "Untitled Event",

          date:
            selectedEvent.date ||
            "Date not available",

          start_time:
            selectedEvent.start_time ||
            "Not available",

          end_time:
            selectedEvent.end_time ||
            "Not available",

          venue:
            selectedEvent.venue ||
            "Venue not available",

          attendees:
            selectedEvent.attendees || 0,

          status:
            selectedEvent.status ||
            "Planning",

          price_inr:
            selectedEvent.price_inr || 0,

          budget:
            selectedEvent.budget || 0,

          resources:
            selectedEvent.resources || "",

          latitude: Number(latitude),

          longitude: Number(longitude),
        });
      } catch (err) {
        console.error(
          "Event details error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load event."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* WEATHER COORDINATES */

  const coordinates = useMemo(() => {
    if (!event) {
      return INDIA_CENTER;
    }

    const latitude = Number(
      event.latitude
    );

    const longitude = Number(
      event.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return INDIA_CENTER;
    }

    return {
      latitude,
      longitude,
    };
  }, [event]);

  /* LOAD WEATHER */

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setWeatherLoading(true);
        setWeatherError("");

        const latitude =
          Number(coordinates.latitude);

        const longitude =
          Number(coordinates.longitude);

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}` +
          `&current=` +
          `temperature_2m,` +
          `relative_humidity_2m,` +
          `apparent_temperature,` +
          `precipitation,` +
          `weather_code,` +
          `cloud_cover,` +
          `wind_speed_10m,` +
          `visibility` +
          `&timezone=auto`;

        console.log(
          "Open-Meteo request:",
          url
        );

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Weather service unavailable."
          );
        }

        const data =
          await response.json();

        if (cancelled) return;

        setWeather(data);
      } catch (err) {
        console.error(
          "Weather error:",
          err
        );

        if (!cancelled) {
          setWeather(null);

          setWeatherError(
            "Weather information is temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [coordinates]);

  /* ANIMATED TEMPERATURE */

  useEffect(() => {
    if (
      weather?.current
        ?.temperature_2m ===
        undefined ||
      weather?.current
        ?.temperature_2m === null
    ) {
      return;
    }

    const target =
      Math.round(
        Number(
          weather.current
            .temperature_2m
        )
      );

    let current = 0;

    setAnimatedTemperature(0);

    const difference =
      target - current;

    const steps = Math.max(
      Math.abs(difference),
      1
    );

    const duration = 1200;

    const intervalTime =
      duration / steps;

    const timer = setInterval(() => {
      if (current === target) {
        clearInterval(timer);
        return;
      }

      current +=
        difference > 0 ? 1 : -1;

      setAnimatedTemperature(
        current
      );

      if (current === target) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () =>
      clearInterval(timer);
  }, [weather]);

  

  const resources = formatResources(
    event?.resources
  );

  const precautions =
    getWeatherPrecautions(weather);

  const hasHighRiskPrecaution =
    precautions.some(
      (precaution) =>
        precaution.level === "high"
    );

  /* =========================================================
     REGISTRATION VALUES
  ========================================================= */

  const registrationEventId =
    event?.event_id ||
    event?.id ||
    id;

  const registrationPrice =
    Number(event?.price_inr) > 0
      ? Number(event.price_inr)
      : 499;
  
  // FINANCE HELPERS

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const expenseTotal = expenses.reduce(
    (total, expense) =>
      total + (Number(expense.amount) || 0),
    0
  );

  const confirmedSponsorships = sponsors
    .filter(
      (sponsor) =>
        String(sponsor.status).toLowerCase() === "confirmed"
    )
    .reduce(
      (total, sponsor) =>
        total + (Number(sponsor.amount) || 0),
      0
    );

  const remainingBudget = plannedBudget - expenseTotal;

  const availableFunds =
    plannedBudget + confirmedSponsorships - expenseTotal;

  /* LOADING */

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="event-loading">
          <div className="event-loading-spinner" />

          <p>
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  /* ERROR */

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="event-error">

          <div className="event-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to load event
          </h2>

          <p>
            {error ||
              "Event could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/events")
            }
          >
            Back to Events
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="event-details-page">

      {/* HERO */}

      <section className="event-hero">

        <div className="event-hero-content">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/events")
            }
          >
            ← Back to Events
          </button>

          <div className="event-hero-row">

            <div>

              <div className="event-id">
                {event.event_id ||
                  `EVT-${event.id}`}
              </div>

              <h1>
                {event.name}
              </h1>

              <div className="event-hero-meta">

                <span>
                  📅 {event.date}
                </span>

                <span>
                  🕐 {event.start_time} -{" "}
                  {event.end_time}
                </span>

                <span>
                  📍 {event.venue}
                </span>

              </div>

            </div>

            <div
              className={`event-status ${getStatusClass(
                event.status
              )}`}
            >
              {event.status}
            </div>

          </div>

        </div>

      </section>

      {/* TABS */}

      <section className="event-tabs-wrapper">

        <div className="event-tabs">

          <button
            className={
              activeTab === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>

          <button
            className={
              activeTab === "resources"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("resources")
            }
          >
            Resources
          </button>

          <button
            className={
              activeTab === "attendees"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("attendees")
            }
          >
            Attendees
          </button>

          <button
            className={
              activeTab === "vendors"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("vendors")
            }
          >
            Vendors
          </button>

          <button
            className={activeTab === "finance" ? "active" : ""}
            onClick={() => setActiveTab("finance")}
          >
            💰 Budget & Finance
          </button>

        </div>

      </section>

      {/* MAIN */}

      <main className="event-details-content">

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeTab === "overview" && (
          <>

            {/* SUMMARY */}

            <section className="event-summary-grid">

              <div className="event-summary-card">

                <span className="summary-icon">
                  📅
                </span>

                <div>
                  <span>Date</span>

                  <strong>
                    {event.date}
                  </strong>
                </div>

              </div>

              <div className="event-summary-card">

                <span className="summary-icon">
                  🕐
                </span>

                <div>
                  <span>Time</span>

                  <strong>
                    {event.start_time} -{" "}
                    {event.end_time}
                  </strong>
                </div>

              </div>

              <div className="event-summary-card">

                <span className="summary-icon">
                  👥
                </span>

                <div>
                  <span>Attendees</span>

                  <strong>
                    {event.attendees}
                  </strong>
                </div>

              </div>

              <div className="event-summary-card">

                <span className="summary-icon">
                  💰
                </span>

                <div>
                  <span>Registration</span>

                  <strong>
                    ₹{event.price_inr}
                  </strong>
                </div>

              </div>

            </section>

            {/* LOCATION */}

            <section className="event-location-card">

              <div className="section-heading">

                <div>
                  <h2>
                    Event Location
                  </h2>

                  <p>
                    Event venue and Indian
                    driving route.
                  </p>
                </div>

                <div className="india-badge">
                  🇮🇳 India
                </div>

              </div>

              <div className="location-info">

                <div>

                  <strong>
                    {event.venue}
                  </strong>

                  <span>
                    Latitude:{" "}
                    {coordinates.latitude.toFixed(
                      4
                    )}
                  </span>

                  <span>
                    Longitude:{" "}
                    {coordinates.longitude.toFixed(
                      4
                    )}
                  </span>

                </div>

              </div>

              <GoogleMap
                latitude={
                  coordinates.latitude
                }
                longitude={
                  coordinates.longitude
                }
                eventName={event.name}
              />

            </section>

            {/* WEATHER */}

            <section className="event-weather-card">

              <div className="section-heading">

                <div>
                  <h2>
                    Weather
                  </h2>

                  <p>
                    Live weather conditions at
                    the event location.
                  </p>
                </div>

                <div className="weather-india-badge">
                  🇮🇳 India
                </div>

              </div>

              {weatherLoading ? (
                <div className="weather-loading">

                  <div className="weather-loading-animation">

                    <div className="loading-sun" />

                    <div className="loading-orbit orbit-1" />

                    <div className="loading-orbit orbit-2" />

                  </div>

                  <div className="weather-loading-spinner" />

                  <p>
                    Reading local weather
                    conditions...
                  </p>

                </div>
              ) : weatherError ? (
                <div className="weather-error">

                  <div className="weather-error-icon">
                    🌦️
                  </div>

                  <h3>
                    Weather unavailable
                  </h3>

                  <p>
                    {weatherError}
                  </p>

                </div>
              ) : weather?.current ? (
                <div className="weather-content">

                  <div className="weather-main">

                    <div className="weather-animation-container">

                      <WeatherAnimation
                        code={
                          weather.current
                            .weather_code
                        }
                      />

                    </div>

                    <div className="weather-condition-pill">

                      <span className="condition-dot" />

                      Live Conditions

                    </div>

                    <div className="weather-temperature animated-temperature">

                      {animatedTemperature}

                      <span>
                        °C
                      </span>

                    </div>

                    <div className="weather-description">

                      {getWeatherDescription(
                        weather.current
                          .weather_code
                      )}

                    </div>

                    <div className="weather-location">
                      📍 Event Location, India
                    </div>

                  </div>

                  <div className="weather-details-grid">

                    <div className="weather-detail">

                      <div className="weather-detail-icon">
                        🌡️
                      </div>

                      <div>

                        <span>
                          Feels Like
                        </span>

                        <strong>
                          {Math.round(
                            weather.current
                              .apparent_temperature
                          )}
                          °C
                        </strong>

                      </div>

                    </div>

                    <div className="weather-detail">

                      <div className="weather-detail-icon">
                        💧
                      </div>

                      <div>

                        <span>
                          Humidity
                        </span>

                        <strong>
                          {
                            weather.current
                              .relative_humidity_2m
                          }
                          %
                        </strong>

                      </div>

                    </div>

                    <div className="weather-detail">

                      <div className="weather-detail-icon">
                        💨
                      </div>

                      <div>

                        <span>
                          Wind
                        </span>

                        <strong>
                          {Math.round(
                            weather.current
                              .wind_speed_10m
                          )}{" "}
                          km/h
                        </strong>

                      </div>

                    </div>

                    <div className="weather-detail">

                      <div className="weather-detail-icon">
                        ☁️
                      </div>

                      <div>

                        <span>
                          Cloud Cover
                        </span>

                        <strong>
                          {
                            weather.current
                              .cloud_cover
                          }
                          %
                        </strong>

                      </div>

                    </div>

                  </div>

                  <div className="weather-source">
                    Weather data provided by
                    Open-Meteo
                  </div>

                </div>
              ) : null}

            </section>

            {/* WEATHER PRECAUTIONS */}

            {weather?.current && (
              <section className="weather-precautions-card">

                <div className="section-heading">

                  <div>

                    <h2>
                      Weather Precautions
                    </h2>

                    <p>
                      Recommended actions based
                      on current weather conditions.
                    </p>

                  </div>

                  <div
                    className={`precaution-status ${
                      hasHighRiskPrecaution
                        ? "precaution-status-warning"
                        : "precaution-status-normal"
                    }`}
                  >
                    {hasHighRiskPrecaution
                      ? "⚠ Attention Required"
                      : precautions.length === 1 &&
                        precautions[0].level ===
                          "low"
                      ? "✓ Conditions Normal"
                      : "ℹ Keep in Mind"}
                  </div>

                </div>

                <div className="precautions-grid">

                  {precautions.map(
                    (precaution, index) => (
                      <div
                        key={`${precaution.title}-${index}`}
                        className={`precaution-card precaution-${precaution.level}`}
                      >

                        <div className="precaution-icon">
                          {precaution.icon}
                        </div>

                        <div className="precaution-content">

                          <h3>
                            {precaution.title}
                          </h3>

                          <p>
                            {precaution.text}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>
            )}

          </>
        )}

        {/* =====================================================
            RESOURCES
        ===================================================== */}

        {activeTab === "resources" && (
          <section className="event-tab-card">

            <div className="section-heading">

              <div>

                <h2>
                  Event Resources
                </h2>

                <p>
                  Resources planned for this
                  event.
                </p>

              </div>

            </div>

            {resources.length > 0 ? (
              <div className="resources-grid">

                {resources.map(
                  (resource, index) => (
                    <div
                      className="resource-detail-card"
                      key={`${resource}-${index}`}
                    >

                      <div className="resource-detail-icon">
                        📦
                      </div>

                      <div>

                        <h3>
                          {resource}
                        </h3>

                        <p>
                          Required for event
                          operations
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="empty-state">

                <div>
                  📦
                </div>

                <h3>
                  No resources assigned
                </h3>

                <p>
                  Resources have not been
                  assigned to this event yet.
                </p>

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            ATTENDEES + REGISTRATION
        ===================================================== */}

        {activeTab === "attendees" && (
          <section className="event-tab-card">

            <div className="section-heading">

              <div>

                <h2>
                  Attendees & Registration
                </h2>

                <p>
                  Register for this event and
                  complete your payment securely.
                </p>

              </div>

              <div className="attendee-tab-badge">
                👥 {event.attendees} Expected
              </div>

            </div>

            {/* ATTENDEE COUNT */}

            <div className="attendee-large-card">

              <div className="attendee-icon">
                👥
              </div>

              <div>

                <strong>
                  {event.attendees}
                </strong>

                <span>
                  Expected Attendees
                </span>

              </div>

            </div>

            <div className="attendee-stats-grid">

              <div className="attendee-stat-card">
                <span className="attendee-stat-icon">📝</span>
                <div>
                  <strong>{attendanceData.registered}</strong>
                  <span>Registered</span>
                </div>
              </div>

              <div className="attendee-stat-card">
                <span className="attendee-stat-icon">✅</span>
                <div>
                  <strong>{attendanceData.checked_in}</strong>
                  <span>Attended</span>
                </div>
              </div>
            </div>

            <div className="view-participants-actions">
              <button
                type="button"
                className="view-participants-button"
                onClick={() => setShowParticipants((previous) => !previous)}
                aria-expanded={showParticipants}
              >
                {showParticipants ? "Hide Participants" : "View Participants"}
              </button>
            </div>

            {showParticipants && (
              <div className="participant-list-section">
                <div className="section-heading">
                  <div>
                    <h2>Participant List</h2>
                    <p>View registrations and attendance status.</p>
                  </div>

                  <div className="attendee-tab-badge">
                    {participants.length} Participants
                  </div>
                </div>

                {participantsLoading ? (
                  <p className="participant-message">
                    Loading participants...
                  </p>
                ) : participantsError ? (
                  <div className="empty-state">
                    <p>{participantsError}</p>

                    <button
                      type="button"
                      onClick={() => loadParticipants(event.event_id)}
                    >
                      Try Again
                    </button>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="empty-state">
                    <div>👥</div>
                    <h3>No participants registered yet</h3>
                    <p>Registered participants will appear here.</p>
                  </div>
                ) : (
                  <div className="participant-table-wrapper">
                    <table className="participant-table">
                      <thead>
                        <tr>
                          <th>Participant Name</th>
                          <th>Registration ID</th>
                          <th>Attendance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {participants.map((participant) => (
                          <tr key={participant.registration_id}>
                            <td>{participant.name || "Name unavailable"}</td>

                            <td>{participant.registration_id}</td>

                            <td>
                              <span
                                className={
                                  participant.attended
                                    ? "participant-attended"
                                    : "participant-not-attended"
                                }
                              >
                                {participant.attended
                                  ? "Attended"
                                  : "Not Attended"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="public-registration-card">
              <div className="public-registration-header">
                <div>
                  <h3>Registration Form</h3>

                  <p>
                    Generate a public registration form that can be
                    shared with event participants.
                  </p>
                </div>

                <div className="public-registration-icon">
                  📝
                </div>
              </div>

              {!registrationLink ? (
                <button
                  type="button"
                  className="generate-registration-button"
                  onClick={() => {
                    const link =
                      `${window.location.origin}/register/${registrationEventId}`;

                    setRegistrationLink(link);

                    navigator.clipboard
                      .writeText(link)
                      .then(() => {
                        alert("Registration form link copied!");
                      })
                      .catch(() => {
                        alert("Registration form generated!");
                      });
                  }}
                >
                  Generate & Copy Registration Form
                </button>
              ) : (
                <div className="generated-registration-form">

                  <div className="registration-success-message">
                    <span>✓</span>
                    <div>
                      <strong>Registration Form Generated</strong>
                      <p>
                        This form is ready to be shared with
                        participants.
                      </p>
                    </div>
                  </div>

                  <div className="registration-link-box">
                    <input
                      type="text"
                      value={registrationLink}
                      readOnly
                    />
                  </div>

                  <div className="registration-link-actions">

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          registrationLink
                        );

                        alert("Registration form link copied!");
                      }}
                    >
                      📋 Copy Link
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.open(
                          registrationLink,
                          "_blank"
                        );
                      }}
                    >
                      🔗 Open Form
                    </button>

                  </div>

                </div>
              )}
            </div>

          </section>
        )}

        {/* =====================================================
            VENDORS
        ===================================================== */}

        {activeTab === "vendors" && (
          <section className="event-tab-card">

            <div className="section-heading">

              <div>

                <h2>
                  Vendors
                </h2>

                <p>
                  Vendor coordination for this
                  event.
                </p>

              </div>

            </div>

            <div className="empty-state">

              <div>
                🤝
              </div>

              <h3>
                Vendor management
              </h3>

              <p>
                Vendor assignments can be
                managed from the Vendors module.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/vendors")
                }
              >
                Manage Vendors
              </button>

            </div>

          </section>
        )}

        {/* =====================================================
            BUDGET & FINANCIAL MANAGEMENT
        ===================================================== */}

        {activeTab === "finance" && (
          <section className="event-tab-card finance-section">

            <div className="section-heading">
              <div>
                <h2>Budget & Financial Management</h2>
                <p>
                  Manage the planned budget, track expenses,
                  and record event sponsorships.
                </p>
              </div>
            </div>

            {financeError && (
              <div className="finance-message finance-error">
                {financeError}
              </div>
            )}

            {financeMessage && (
              <div className="finance-message finance-success">
                {financeMessage}
              </div>
            )}

            {/* FINANCIAL SUMMARY */}

            <div className="finance-summary-grid">
              <div className="finance-summary-card">
                <span>Planned Budget</span>
                <strong>{formatINR(plannedBudget)}</strong>
              </div>

              <div className="finance-summary-card">
                <span>Recorded Expenses</span>
                <strong>{formatINR(expenseTotal)}</strong>
              </div>

              <div className="finance-summary-card">
                <span>Confirmed Sponsorships</span>
                <strong>{formatINR(confirmedSponsorships)}</strong>
              </div>

              <div className="finance-summary-card">
                <span>Remaining Budget</span>
                <strong
                  className={remainingBudget < 0 ? "finance-negative" : ""}
                >
                  {formatINR(remainingBudget)}
                </strong>
              </div>

              <div className="finance-summary-card">
                <span>Available Funds</span>
                <strong
                  className={availableFunds < 0 ? "finance-negative" : ""}
                >
                  {formatINR(availableFunds)}
                </strong>
              </div>
            </div>

            {remainingBudget < 0 && (
              <div className="finance-message finance-error">
                ⚠️ Expenses exceed the planned budget by{" "}
                {formatINR(Math.abs(remainingBudget))}.
              </div>
            )}

            {/* EDIT PLANNED BUDGET */}

            <div className="finance-panel">
              <h3>Set Planned Budget</h3>

              <form className="finance-form finance-budget-form" onSubmit={saveBudget}>
                <label>
                  Planned budget (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    required
                  />
                </label>

                <button type="submit" disabled={financeLoading}>
                  Save Budget
                </button>
              </form>
            </div>

            {/* EXPENSE MANAGEMENT */}

            <div className="finance-panel">
              <h3>
                {editingExpenseId !== null ? "Edit Expense" : "Add Expense"}
              </h3>

              <form className="finance-form" onSubmit={saveExpense}>
                <label>
                  Expense name
                  <input
                    value={expenseForm.name}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, name: e.target.value })
                    }
                    placeholder="e.g. Venue decoration"
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                  >
                    <option>Other</option>
                    <option>Venue</option>
                    <option>Food</option>
                    <option>Decoration</option>
                    <option>Equipment</option>
                    <option>Marketing</option>
                    <option>Transport</option>
                    <option>Staff</option>
                  </select>
                </label>

                <label>
                  Amount (₹)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                  />
                </label>

                <label>
                  Status
                  <select
                    value={expenseForm.status}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, status: e.target.value })
                    }
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </label>

                <label className="finance-full-width">
                  Description
                  <textarea
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional details about this expense"
                    rows="3"
                  />
                </label>

                <div className="finance-form-actions finance-full-width">
                  <button type="submit">
                    {editingExpenseId !== null ? "Update Expense" : "Add Expense"}
                  </button>

                  {editingExpenseId !== null && (
                    <button
                      type="button"
                      className="finance-secondary-button"
                      onClick={resetExpenseForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="finance-panel">
              <h3>Expense Records</h3>

              {financeLoading ? (
                <p>Loading financial records...</p>
              ) : expenses.length === 0 ? (
                <div className="empty-state">
                  <div>🧾</div>
                  <h3>No expenses recorded</h3>
                  <p>Add an expense using the form above.</p>
                </div>
              ) : (
                <div className="finance-table-wrapper">
                  <table className="finance-table">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            <strong>{expense.name}</strong>
                            {expense.description && (
                              <p>{expense.description}</p>
                            )}
                          </td>
                          <td>{expense.category || "Other"}</td>
                          <td>{formatINR(expense.amount)}</td>
                          <td>{expense.date || "—"}</td>
                          <td>
                            <span className="finance-status">
                              {expense.status || "Pending"}
                            </span>
                          </td>
                          <td>
                            <div className="finance-row-actions">
                              <button
                                type="button"
                                onClick={() => editExpense(expense)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="finance-delete-button"
                                onClick={() => deleteExpense(expense.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SPONSORSHIP MANAGEMENT */}

            <div className="finance-panel">
              <h3>
                {editingSponsorId !== null
                  ? "Edit Sponsorship"
                  : "Add Sponsorship"}
              </h3>

              <form className="finance-form" onSubmit={saveSponsor}>
                <label>
                  Sponsor name
                  <input
                    value={sponsorForm.name}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, name: e.target.value })
                    }
                    placeholder="e.g. ABC Technologies"
                    required
                  />
                </label>

                <label>
                  Sponsorship amount (₹)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={sponsorForm.amount}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, amount: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    value={sponsorForm.status}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, status: e.target.value })
                    }
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Rejected</option>
                  </select>
                </label>

                <div className="finance-form-actions finance-full-width">
                  <button type="submit">
                    {editingSponsorId !== null
                      ? "Update Sponsorship"
                      : "Add Sponsorship"}
                  </button>

                  {editingSponsorId !== null && (
                    <button
                      type="button"
                      className="finance-secondary-button"
                      onClick={resetSponsorForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="finance-panel">
              <h3>Sponsorship Records</h3>

              {financeLoading ? (
                <p>Loading sponsorships...</p>
              ) : sponsors.length === 0 ? (
                <div className="empty-state">
                  <div>🤝</div>
                  <h3>No sponsorships recorded</h3>
                  <p>Add a sponsor using the form above.</p>
                </div>
              ) : (
                <div className="finance-table-wrapper">
                  <table className="finance-table">
                    <thead>
                      <tr>
                        <th>Sponsor</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sponsors.map((sponsor) => (
                        <tr key={sponsor.id}>
                          <td>{sponsor.name}</td>
                          <td>{formatINR(sponsor.amount)}</td>
                          <td>
                            <span className="finance-status">
                              {sponsor.status || "Pending"}
                            </span>
                          </td>
                          <td>
                            <div className="finance-row-actions">
                              <button
                                type="button"
                                onClick={() => editSponsor(sponsor)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="finance-delete-button"
                                onClick={() => deleteSponsor(sponsor.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default EventDetails;