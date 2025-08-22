// Format time (hour only)
export const formatHour = (timestamp) =>
  new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

// Temperature label
export const formatTemp = (value, unit) =>
  value !== undefined && value !== null
    ? `${Math.round(value)}°${unit === "metric" ? "C" : "F"}`
    : "--";

// // Wind speed label
// export const formatWind = (value, unit) =>
//   value !== undefined && value !== null
//     ? `${Math.round(value)} ${unit === "metric" ? "m/s" : "mph"}`
//     : "--";
