import React, { useEffect, useState } from "react";
import { Card, CardContent, Skeleton, IconButton } from "@mui/material";
import { formatTemp } from "../utils/utils";
import { Star, StarBorder } from "@mui/icons-material";

const Forecast = ({
  forecastData,
  unit,
  loading,
  weatherData,
  favorites,
  addFavorite,
  removeFavorite,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState(null);

  // You can choose 6 or 12
  const items = forecastData?.list ?? [];
  const nextHours = items.slice(0, 6);

  // check if in favorites
  useEffect(() => {
    if (!weatherData?.name) return;
    const city = favorites.find(
      (c) => c.name.toLowerCase() === weatherData.name.toLowerCase()
    );
    if (city) {
      setIsFavorite(true);
      setFavId(city._id);
    } else {
      setIsFavorite(false);
      setFavId(null);
    }
  }, [weatherData, favorites]);

  // toggle favorite
  const toggleFavorite = async () => {
    if (!isFavorite) {
      const city = {
        name: weatherData.name,
        country: weatherData.sys?.country,
      };
      await addFavorite(city);
    } else {
      if (favId) await removeFavorite(favId);
    }
  };

  // Loading skeletons
  if (loading) {
    return (
      <Card
        className="w-full max-w-4xl bg-white shadow-xl rounded-2xl"
        aria-busy="true"
      >
        <CardContent>
          <Skeleton variant="text" width={220} height={28} />
          <div className="flex gap-3 sm:gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 bg-gray-100 rounded-xl min-w-[100px] sm:min-w-[120px]"
              >
                <Skeleton variant="text" width={64} />
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" width={56} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData?.main || !nextHours.length) return null;

  const { main, weather, name, sys } = weatherData;
  const condition = weather?.[0]?.description ?? "";

  if (!nextHours.length) return null;

  return (
    <Card
      elevation={0}
      className="w-full md:max-w-4xl max-w-sm bg-white shadow-xl rounded-2xl"
      role="region"
      aria-label="Weather forecast for the next hours"
    >
      <CardContent className="bg-[#708090] rounded-4xl">
        {/* --- TOP SECTION: City + Current Weather --- */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {name}, {sys?.country}
            </h2>

            <h1 className="text-6xl font-bold mt-1 text-white">
              {formatTemp(main?.temp, unit)}
            </h1>

            {/* Favorite Icon */}
            <IconButton
              onClick={toggleFavorite}
              className="absolute top-2 right-2 text-white"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isFavorite ? (
                <Star style={{ color: "yellow" }} />
              ) : (
                <StarBorder style={{ color: "white" }} />
              )}
            </IconButton>
          </div>
          <div className="text-right">
            <img
              src={`http://openweathermap.org/img/wn/${weather?.[0]?.icon}@2x.png`}
              alt={`${condition} icon`}
              className="w-24"
            />
            <p className="capitalize text-lg text-white font-semibold">
              {condition}
            </p>
            <p className="text-md text-white font-semibold">
              H: {formatTemp(main?.temp_max, unit)} L:{" "}
              {formatTemp(main?.temp_min, unit)}
            </p>
          </div>
        </div>

        <div
          className="flex gap-3 pb-[1em] sm:gap-4 overflow-x-auto scrollbar-hide"
          role="list"
          aria-label="Scrollable hourly forecast"
        >
          {nextHours.map((item, idx) => {
            const timeStr = new Date(item.dt * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Precipitation: probability (pop 0–1 → %) and rain volume (mm)
            const popPct = Math.round((item.pop ?? 0) * 100);
            const rainMm = item.rain?.["3h"] ?? 0;
            const desc = item.weather?.[0]?.description ?? "weather";
            const icon = item.weather?.[0]?.icon;

            const aria = `Forecast at ${timeStr}: ${formatTemp(
              item.main?.temp,
              unit
            )}, ${desc}, precipitation ${popPct}%${
              rainMm ? `, rain ${rainMm} mm` : ""
            }`;

            return (
              <div
                key={idx}
                role="listitem"
                tabIndex={0}
                aria-label={aria}
                className="flex flex-col items-center p-3 sm:p-4 rounded-3xl min-w-[110px] sm:min-w-[90px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <p className="text-xs sm:text-sm font-medium text-white">
                  {timeStr}
                </p>

                <img
                  src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={`Forecast: ${desc}`}
                  className="w-12 sm:w-18"
                />

                <p className="font-bold text-sm sm:text-base text-white">
                  {formatTemp(item.main?.temp, unit)}
                </p>

                {/* Precipitation row */}
                <p
                  className="text-xs sm:text-sm text-white mt-1"
                  aria-label={`Precipitation ${popPct} percent`}
                >
                  ☔ {popPct}% {rainMm ? `• ${rainMm} mm` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Forecast;
