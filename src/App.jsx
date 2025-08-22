import "./App.css";
import { useEffect, useState } from "react"; //for state management
import axios from "axios"; //to fetch APIs
import {
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Switch,
} from "@mui/material";
// Two Chid Components
import Forecast from "./components/Forecast.jsx"; // Child component: Forecast (hourly forecast)
import FavoriteCities from "./components/FavoriteCities.jsx";

function App() {
  const [data, setData] = useState({}); //current weather data
  const [forecast, setForecast] = useState({}); //stores forecast data (next hours)
  const [location, setLocation] = useState(""); //what user types in, in textfield (city name)
  const [loading, setLoading] = useState(false); //shows spinner while fetching
  const [error, setError] = useState(""); //stores error messages if API fails
  const [unit, setUnit] = useState("metric"); // "metric" = °C, "imperial" = °F
  const [options, setOptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const isDataEmpty = !data || Object.keys(data).length === 0;

  // fetch favorites once
  const fetchFavorites = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cities");
      setFavorites(res.data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // add city
  const addFavorite = async (city) => {
    try {
      const res = await axios.post("http://localhost:5000/api/cities", city);
      setFavorites((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding favorite:", err);
    }
  };

  // remove city
  const removeFavorite = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cities/${id}`);
      setFavorites(favorites.filter((city) => city._id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Calls both current weather and forecast APIs.
  const fetchWeather = async (query) => {
    setLoading(true);
    setError(""); // clear previous error immediately
    try {
      const weatherRes = await axios.get(
        `http://localhost:5000/api/cities/weather?${query}&unit=${unit}`
      );
      const forecastRes = await axios.get(
        `http://localhost:5000/api/cities/forecast?${query}&unit=${unit}`
      );

      setData(weatherRes.data);
      setForecast(forecastRes.data);
      setError(""); // ensure error is cleared
    } catch (err) {
      console.error("API error:", err);
      setData({});
      setForecast({});
      setError("Could not fetch weather data. Try another location.");
    } finally {
      setLoading(false);
    }
  };

  // Use browser location
  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeather(`lat=${latitude}&lon=${longitude}`);
        },
        () => setError("Location access denied or unavailable.")
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  // Toggle °C / °F
  const handleUnitToggle = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  // Refetch when unit changes
  useEffect(() => {
    if (data?.name) {
      fetchWeather(`q=${encodeURIComponent(data.name)}`);
    }
  }, [unit]);

  // Autocomplete / Fetch city suggestions
  const fetchCitySuggestions = async (input) => {
    if (!input) return setOptions([]);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cities/search?q=${input}`
      );

      setOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCitySuggestions(location);
    }, 300); // delay for 300ms to reduce API calls

    return () => clearTimeout(delayDebounceFn);
  }, [location]);

  return (
    <div className="w-full min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center">
      {/* Skip to content for keyboard/screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-blue-700 font-semibold px-3 py-2 rounded"
      >
        Skip to content
      </a>

      {/* Title */}
      <h4
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6 text-center"
        aria-label="Weather Forecast App"
      >
        Weather Forecast App
      </h4>

      {/* Input + Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 w-full max-w-2xl items-center"
        role="form"
        aria-label="Weather search controls"
      >
        <Autocomplete
          freeSolo
          options={Array.from(
            new Map(options.map((o) => [`${o.name}-${o.country}`, o])).values()
          )}
          getOptionLabel={(city) => `${city.name}, ${city.country}`}
          renderOption={(props, city) => (
            <li {...props} key={`${city.name}-${city.country}`}>
              {city.name}, {city.country}
            </li>
          )}
          inputValue={location}
          onInputChange={(e, newInput, reason) => {
            if (reason === "input") setLocation(newInput);
          }}
          onChange={(e, value) => {
            // Only fetch if value is valid
            if (value?.name) {
              const query = `q=${encodeURIComponent(value.name)}`;
              fetchWeather(query);
              setLocation(""); // clear input after selection
            }
          }}
          sx={{ width: 340 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter city"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = location?.trim();
                  if (trimmed) {
                    const query = `q=${encodeURIComponent(trimmed)}`;
                    fetchWeather(query);
                    setLocation(""); // clear input after Enter
                  }
                }
              }}
            />
          )}
        />

        <Button
          onClick={useMyLocation}
          className="w-full sm:w-auto focus:outline-none bg-[#708090]"
          aria-label="Use my current location"
          sx={{
            backgroundColor: "#708090",
            color: "white",
            "&:hover": {
              backgroundColor: "#5c6a77", // darker shade on hover
            },
          }}
        >
          Use My Location
        </Button>

        {/* °C / °F Toggle */}
        <div
          className="flex items-center gap-2 text-black text-sm sm:text-base"
          role="group"
          aria-label="Temperature unit toggle"
        >
          <span id="c-label">°C</span>
          <Switch
            checked={unit === "imperial"}
            onChange={handleUnitToggle}
            color="default"
          />
          <span id="f-label">°F</span>
        </div>
      </div>

      {/* States */}
      {loading && (
        <CircularProgress color="inherit" aria-label="Loading weather data" />
      )}
      {error && (
        <Alert severity="error" className="mb-4 w-full max-w-md" role="alert">
          {error}
        </Alert>
      )}
      {!loading && !error && isDataEmpty && (
        <p className="text-black text-base sm:text-lg">
          Enter a city or use your location to see weather.
        </p>
      )}

      {/* Content */}
      <main
        id="main-content"
        className="flex flex-col gap-6 w-full items-center"
      >
        <Forecast
          forecastData={forecast}
          unit={unit}
          loading={loading}
          weatherData={data}
          favorites={favorites}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
        />

        {/* Favorite Cities */}
        <FavoriteCities
          favorites={favorites}
          onSelectCity={(cityName) => fetchWeather(`q=${cityName}`)}
          removeFavorite={removeFavorite}
        />
      </main>
    </div>
  );
}

export default App;
