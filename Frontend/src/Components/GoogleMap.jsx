import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./GoogleMap.css";

/* ---------------------------------------
   Leaflet marker fix
--------------------------------------- */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ---------------------------------------
   India default location
--------------------------------------- */

const INDIA_CENTER = [20.5937, 78.9629];

/* ---------------------------------------
   Fix Leaflet map size
--------------------------------------- */

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    // Initial resize after the component becomes visible
    const timer1 = setTimeout(resizeMap, 100);
    const timer2 = setTimeout(resizeMap, 400);
    const timer3 = setTimeout(resizeMap, 800);

    // Observe changes to the map container
    let resizeObserver;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeMap();
      });

      resizeObserver.observe(map.getContainer());
    }

    window.addEventListener("resize", resizeMap);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      window.removeEventListener(
        "resize",
        resizeMap
      );

      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [map]);

  return null;
}

/* ---------------------------------------
   Automatically fit map to markers/route
--------------------------------------- */

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13, {
        animate: true,
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 13,
      animate: true,
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [points, map]);

  return null;
}

/* ---------------------------------------
   Main component
--------------------------------------- */

function GoogleMap({
  latitude,
  longitude,
  eventName = "Event Venue",

  startLatitude,
  startLongitude,

  startLocation = "Starting Location",
}) {
  /* ---------------------------------------
     Convert coordinates to numbers
  --------------------------------------- */

  const eventLat = Number(latitude);
  const eventLng = Number(longitude);

  const startLat = Number(startLatitude);
  const startLng = Number(startLongitude);

  /* ---------------------------------------
     Validate Indian coordinates
  --------------------------------------- */

  const hasEventLocation =
    Number.isFinite(eventLat) &&
    Number.isFinite(eventLng) &&
    eventLat >= 6 &&
    eventLat <= 38 &&
    eventLng >= 68 &&
    eventLng <= 98;

  const hasStartLocation =
    Number.isFinite(startLat) &&
    Number.isFinite(startLng) &&
    startLat >= 6 &&
    startLat <= 38 &&
    startLng >= 68 &&
    startLng <= 98;

  /* ---------------------------------------
     Event position
  --------------------------------------- */

  const eventPosition = hasEventLocation
    ? [eventLat, eventLng]
    : INDIA_CENTER;

  /* ---------------------------------------
     Starting position
  --------------------------------------- */

  const startPosition = hasStartLocation
    ? [startLat, startLng]
    : null;

  /* ---------------------------------------
     Route state
  --------------------------------------- */

  const [route, setRoute] = useState([]);

  const [routeInfo, setRouteInfo] =
    useState(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  /* ---------------------------------------
     Load road route using OSRM
  --------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      /*
       * No route if we don't have both locations.
       */
      if (
        !hasEventLocation ||
        !hasStartLocation
      ) {
        setRoute([]);
        setRouteInfo(null);
        setRouteLoading(false);
        setRouteError("");

        return;
      }

      /*
       * Same location
       */
      if (
        Math.abs(startLat - eventLat) < 0.00001 &&
        Math.abs(startLng - eventLng) < 0.00001
      ) {
        setRoute([eventPosition]);

        setRouteInfo({
          distance: "0.0",
          duration: "0",
        });

        setRouteLoading(false);
        setRouteError("");

        return;
      }

      try {
        setRouteLoading(true);
        setRouteError("");

        /*
         * OSRM format:
         *
         * longitude,latitude
         */

        const coordinates =
          `${startLng},${startLat};` +
          `${eventLng},${eventLat}`;

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${coordinates}` +
          `?overview=full&geometries=geojson`;

        console.log("OSRM route:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (
          data.code !== "Ok" ||
          !data.routes ||
          data.routes.length === 0
        ) {
          throw new Error(
            "No route returned"
          );
        }

        const selectedRoute = data.routes[0];

        const routePoints =
          selectedRoute.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

        if (cancelled) {
          return;
        }

        setRoute(routePoints);

        setRouteInfo({
          distance: (
            selectedRoute.distance / 1000
          ).toFixed(1),

          duration: Math.max(
            1,
            Math.round(
              selectedRoute.duration / 60
            )
          ),
        });
      } catch (error) {
        console.error(
          "Route error:",
          error
        );

        if (!cancelled) {
          /*
           * Keep the map working even if
           * OSRM is unavailable.
           */

          setRoute([]);
          setRouteInfo(null);

          setRouteError(
            "Road route is currently unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setRouteLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    eventLat,
    eventLng,
    startLat,
    startLng,
    hasEventLocation,
    hasStartLocation,
  ]);

  /* ---------------------------------------
     Map points for automatic zoom
  --------------------------------------- */

  const mapPoints = [];

  if (hasEventLocation) {
    mapPoints.push(eventPosition);
  }

  if (hasStartLocation) {
    mapPoints.push(startPosition);
  }

  if (route.length > 1) {
    mapPoints.push(...route);
  }

  /* ---------------------------------------
     Render
  --------------------------------------- */

  return (
    <div
      className="google-map-wrapper"
      style={{
        width: "100%",
        minHeight: "420px",
      }}
    >
      <MapContainer
        center={eventPosition}
        zoom={hasEventLocation ? 13 : 5}
        scrollWheelZoom={true}
        className="event-map"
        style={{
          width: "100%",
          height: "420px",
          minHeight: "420px",
        }}
      >
        {/* OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fix Leaflet sizing */}
        <MapResizeHandler />

        {/* Starting marker */}
        {hasStartLocation && (
          <Marker position={startPosition}>
            <Popup>
              <strong>
                Starting Location
              </strong>

              <br />

              {startLocation}

              <br />

              🇮🇳 India
            </Popup>
          </Marker>
        )}

        {/* Event marker */}
        <Marker position={eventPosition}>
          <Popup>
            <strong>
              {eventName}
            </strong>

            <br />

            Event Venue

            <br />

            🇮🇳 India
          </Popup>
        </Marker>

        {/* Actual road route */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "#2563eb",
              weight: 6,
              opacity: 0.9,
            }}
          />
        )}

        {/* Automatic zoom */}
        <MapBounds
          points={
            mapPoints.length > 0
              ? mapPoints
              : [INDIA_CENTER]
          }
        />
      </MapContainer>

      {/* Route information */}
      <div className="map-route-panel">
        {routeLoading && (
          <div className="route-loading">
            <span className="route-spinner" />

            Finding Indian road route...
          </div>
        )}

        {!routeLoading && routeInfo && (
          <div className="route-info">
            <div className="route-info-item">
              <span className="route-icon">
                🚗
              </span>

              <div>
                <strong>
                  {routeInfo.distance} km
                </strong>

                <span>
                  Distance
                </span>
              </div>
            </div>

            <div className="route-info-item">
              <span className="route-icon">
                ⏱️
              </span>

              <div>
                <strong>
                  {routeInfo.duration} min
                </strong>

                <span>
                  Estimated drive
                </span>
              </div>
            </div>
          </div>
        )}

        {!routeLoading && routeError && (
          <div className="route-error">
            ⚠️ {routeError}
          </div>
        )}

        {!routeLoading &&
          !hasStartLocation && (
            <div className="route-error">
              📍 Add a starting location
              to calculate a road route.
            </div>
          )}
      </div>
    </div>
  );
}

export default GoogleMap;