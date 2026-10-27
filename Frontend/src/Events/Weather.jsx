import { useEffect, useState } from "react";

function Weather({ latitude, longitude }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
        );

        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (loading) {
    return <div className="weather">Loading weather...</div>;
  }

  if (!weather) {
    return <div className="weather">Weather unavailable</div>;
  }

  return (
    <div className="weather">
      <h3>Weather</h3>

      <div className="weather-info">
        <p>
          🌡️ {weather.current.temperature_2m}°C
        </p>

        <p>
          💧 {weather.current.relative_humidity_2m}%
        </p>

        <p>
          💨 {weather.current.wind_speed_10m} km/h
        </p>
      </div>
    </div>
  );
}

export default Weather;