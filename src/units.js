/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dayjs from "dayjs";

// Which unit label to use for a given key
const unitLabel = {
  altitude_meter: " m",
  awa: "º",
  aws_knots: " kn",
  aws_kph: " km/h",
  aws_mps: " m/s",
  cog_magnetic: "º",
  cog_true: "º",
  dew_point_celsius: "ºC",
  hdg_true: "º",
  humidity_relative: "%",
  magnetic_variation: "º",
  pressure_bars: " bar",
  pressure_millibars: " mbar",
  pressure_inches: " inHg",
  rate_of_turn: "º/min",
  rudder_angle: "º",
  sog_knots: " kn",
  sog_kph: " km/h",
  temperature_air_celsius: "ºC",
  temperature_water_celsius: "ºC",
  timeUTC: "Time (UTC)",
  twd_magnetic: "º",
  twd_true: "º",
  tws_knots: " kn",
  tws_mps: " m/s",
};

// Which descriptive label to use for a given key
export const descriptiveLabel = {
  altitude_meter: "Altitude",
  awa: "Apparent wind angle",
  aws_knots: "Apparent wind speed",
  aws_kph: "Apparent wind speed",
  aws_mps: "Apparent wind speed",
  cog_magnetic: "Course over ground (magnetic)",
  cog_true: "Course over ground (true)",
  dew_point_celsius: "Dew point",
  fix_quality: "Fix quality",
  hdg_true: "Heading (true)",
  hdop: "Horizontal dilution of precision",
  humidity_relative: "Relative humidity",
  latitude: "Latitude",
  longitude: "Longitude",
  magnetic_variation: "Magnetic variation",
  num_satellites: "Number of satellites",
  pressure_bars: "Pressure",
  pressure_inches: "Pressure",
  pressure_millibars: "Pressure",
  rate_of_turn: "Rate of turn",
  rudder_angle: "Rudder angle",
  sog_knots: "Speed over ground",
  sog_kph: "Speed over ground",
  temperature_air_celsius: "Air temperature",
  temperature_water_celsius: "Water temperature",
  timeUTC: "Time (UTC)",
  twd_magnetic: "True wind direction (magnetic)",
  twd_true: "True wind direction (true)",
  tws_knots: "True wind speed",
  tws_mps: "True wind speed",
};

// Convert between units (not presently used)
/*
export const conversionDict = {
  degree_K: {
    degree_C: (x) => x - 273.15,
  },
  degree_angle: {
    radian: (x) => (x * Math.PI) / 180.0,
  },
  degree_true: {
    radian: (x) => (x * Math.PI) / 180.0,
  },
  iso8601: {
    unix_epoch: (x) => dayjs(x).valueOf(),
  },
  knot: {
    kilometer_per_second: (x) => 1.852 * x,
    meter_per_second: (x) => 0.5144444444 * x,
  },
  kilometer_per_second: {
    knot: (x) => 0.539957 * x,
    meter_per_second: (x) => 0.277778 * x,
  },
  meter: {
    foot: (x) => 3.280839895 * x,
    nautical_mile: (x) => 0.000539957 * x,
    kilometer: (x) => x / 1000.0,
  },
  meter_per_second: {
    knot: (x) => 1.94384449 * x,
    mile_per_hour: (x) => (3600 * x) / 1609.34,
    km_per_hour: (x) => 3.6 * x,
  },
  radian: {
    degree_angle: (x) => 57.295779513 * x,
    degree_true: (x) => 57.295779513 * x,
  },
  pascal: {
    millibar: (x) => x / 100.0,
  },
  unix_epoch: {
    iso8601: (x) => dayjs(x).toISOString(),
  },
};
*/


// Take an update from the broker, and format it for presentation.
export function formatUpdate(update) {
  let labeledVal;

  // Special case for formatting latitude and longitude:
  if (update.key === "latitude" || update.key === "longitude") {
    labeledVal = formatLatLon(update.key, update.value);
  } else {
    labeledVal = formatValue(update.key, update.value);
  }

  // Now put it all together:
  return {
    key: update.key,
    label: descriptiveLabel[update.key],
    value: labeledVal,
    last_update: formatValue("last_update", update.last_update),
  };
}

/**
 * Format a value. Add a unit label.
 * @param {string} key - The key (e.g., "tws_knots")
 * @param {number} value - The value to be formatted
 */
export function formatValue(key, value) {
  let fval;

  if (value === null) {
    return null;
  }

  switch (key) {
    case "altitude_meter":
    case "awa":
    case "cog_magnetic":
    case "cog_true":
    case "dew_point_celsius":
    case "fix_quality":
    case "hdg_true":
    case "hdop":
    case "humidity_relative":
    case "num_satellites":
    case "twd_magnetic":
    case "twd_true":
      fval = value.toFixed(0);
      break;
    case "aws_knots":
    case "aws_kph":
    case "aws_mps":
    case "magnetic_variation":
    case "pressure_millibars":
    case "rate_of_turn":
    case "rudder_angle":
    case "sog_knots":
    case "sog_kph":
    case "temperature_air_celsius":
    case "temperature_water_celsius":
    case "tws_knots":
    case "tws_mps":
      fval = value.toFixed(1);
      break;
    case "pressure_inches":
      fval = value.toFixed(2);
      break;
    case "pressure_bars:":
      fval = value.toFixed(3);
      break;
    case "timestamp":
    case "last_update":
      fval = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      break;
    default:
      fval = String(value);
  }
  // Get an appropriate label for the unit. Something like "°C".
  const unit_label = unitLabel[key] || "";
  // Attach the unit label and return
  return fval + unit_label;
}

// Format a latitude or longitude
function formatLatLon(key, value) {
  let hemisphere;
  const degrees = Math.floor(Math.abs(value));
  const minutes = (Math.abs(value) - degrees) * 60.0;
  const fval = degrees.toFixed(0) + "° " + minutes.toFixed(1) + "'";
  if (key === "latitude") hemisphere = value >= 0 ? "N" : "S";
  else hemisphere = value >= 0 ? "E" : "W";
  return fval + hemisphere;
}
