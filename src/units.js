/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dayjs from "dayjs";

// These are the units used by the incoming SignalK paths:
export const signalKUnits = {
  "navigation.position": "dd.dd",
  "navigation.speedOverGround": "meter_per_second",
  "navigation.courseOverGroundTrue": "radian",
  "navigation.speedThroughWater": "meter_per_second",
  "navigation.headingTrue": "radian",
  "navigation.log": "meter",
  "environment.depth.belowSurface": "meter",
  "environment.depth.belowTransducer": "meter",
  "environment.depth.belowKeel": "meter",
  "environment.wind.speedOverGround": "meter_per_second",
  "environment.wind.speedTrue" : "meter_per_second",
  "environment.wind.directionTrue": "radian",
  "environment.wind.speedApparent": "meter_per_second",
  "environment.wind.angleApparent": "radian",
  "environment.water.temperature": "degree_K",
  "environment.outside.pressure": "pascal",
  last_update: "unix_epoch",
};

// Which unit group each path belongs to.
const unitGroup = {
  "navigation.position.latitude": "group_latitude",
  "navigation.position.longitude": "group_longitude",
  "navigation.speedOverGround": "group_speed",
  "navigation.courseOverGroundTrue": "group_direction",
  "navigation.speedThroughWater": "group_speed",
  "navigation.headingTrue": "group_direction",
  "navigation.log": "group_distance",
  "environment.depth.belowSurface": "group_depth",
  "environment.depth.belowTransducer": "group_depth",
  "environment.depth.belowKeel": "group_depth",
  "environment.wind.speedOverGround": "group_speed",
  "environment.wind.speedTrue" : "group_speed",
  "environment.wind.directionTrue": "group_direction",
  "environment.wind.speedApparent": "group_speed",
  "environment.wind.angleApparent": "group_direction",
  "environment.water.temperature": "group_temperature",
  "environment.outside.pressure": "group_pressure",
  last_update: "group_time",
};

// Which label to use for a given unit
const unitLabels = {
  meter_per_second: " m/s",
  degree_true: "º",
  kilometer: " km",
  meter: " m",
  nautical_mile: " nm",
  degree_C: "°C",
  degree_F: "°F",
  degree_K: "ºK",
  knot: " kn",
  pascal: " Pa",
  millibar: " mbar",
};

// Which label to use for a given SignalK path
export const pathLabels = {
  "navigation.position.latitude": "Latitude",
  "navigation.position.longitude": "Longitude",
  "navigation.speedOverGround": "Speed over ground",
  "navigation.courseOverGroundTrue": "Course over ground",
  "navigation.speedThroughWater": "Speed through water",
  "navigation.headingTrue": "Heading",
  "navigation.log": "Log",
  "environment.depth.belowSurface": "Water depth",
  "environment.depth.belowTransducer": "Depth below transducer",
  "environment.depth.belowKeel": "Depth below keel",
  "environment.wind.speedOverGround": "Wind speed (true)",
  "environment.wind.speedTrue" : "Wind speed (true)",
  "environment.wind.directionTrue": "Wind direction (true)",
  "environment.wind.speedApparent": "Wind speed (apparent)",
  "environment.wind.angleApparent": "Wind direction (apparent)",
  "environment.water.temperature": "Water temperature",
  "environment.outside.pressure": "Pressure",
  last_update: "Last update",
};

// What unit to display for each unit group
const unitSelection = {
  group_latitude: "dd mm.mm",
  group_longitude: "dd mm.mm",
  group_direction: "degree_true",
  group_temperature: "degree_C",
  group_depth: "meter",
  group_speed: "knot",
  group_distance: "nautical_mile",
  group_time: "unix_epoch",
  group_pressure: "millibar",
};

// Convert between units
const conversionDict = {
  degree_K: {
    degree_C: (x) => x - 273.15,
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
    degree_true: (x) => 57.295779513 * x,
  },
  pascal: {
    millibar: (x) => x / 100.0,
  },
};

// Take an update from the broker, and format it for presentation.
export function formatUpdate(update) {
  let labeledVal;

  // The unit group a key belongs to. This will be something
  // like 'group_temperature'
  const unit_group = unitGroup[update.key];

  // Special case for formatting latitude and longitude:
  if (unit_group === "group_latitude" || unit_group === "group_longitude") {
    labeledVal = formatLatLon(update.value, unit_group, update.unit);
  } else {
    labeledVal = formatValue(update.value, unit_group, update.unit);
  }

  // Now put it all together:
  return {
    key: update.key,
    label: pathLabels[update.key],
    value: labeledVal,
    last_update: formatValue(update.last_update, "group_time", "unix_epoch"),
  };
}

/**
 * Convert a value to an approprate unit, then format it. Add a unit label.
 * @param {float} value - The value to be formatted
 * @param {string} unit_group - The unit group the value belongs to
 * @param {string} unit - The unit the value is in.
 */
function formatValue(value, unit_group, unit) {
  let fval;

  // The desired unit to be used for that group. This will be something
  // like 'degree_C'
  const selected_unit = unitSelection[unit_group];

  // Convert if necessary
  const convertedValue =
    unit === selected_unit ? value : conversionDict[unit][selected_unit](value);
  switch (selected_unit) {
    case "degree_C":
    case "degree_F":
    case "degree_K":
      fval = convertedValue.toFixed(1);
      break;
    case "millibar":
      fval = convertedValue.toFixed(1);
      break;
    case "pascal":
      fval = convertedValue.toFixed(0);
      break;
    case "degree_true":
      fval = convertedValue.toFixed(0);
      break;
    case "meter_per_second":
    case "knot":
      fval = convertedValue.toFixed(1);
      break;
    case "meter":
      fval = convertedValue.toFixed(1);
      break;
    case "nautical_mile":
    case "kilometer":
      fval = convertedValue.toFixed(1);
      break;
    case "unix_epoch":
      fval = dayjs(convertedValue).format("YYYY-MM-DD HH:mm:ss");
      break;
    default:
      fval = String(convertedValue);
  }
  // Get an appropriate label for the unit. Something like "°C".
  const unit_label = unitLabels[selected_unit] || "";
  // Attach the unit label and return
  return fval + unit_label;
}

// Format a latitude or longitude
function formatLatLon(value, unit_group, unit) {
  let fval, hemisphere;
  console.assert(unit === "dd.dd", "Expected decimal degrees.");

  // The desired "unit" to be used. It's not really a unit, rather how
  // latitude and longitude will be formated.
  // Something like 'dd.dd' or 'dd mm.mm'
  const selected_unit = unitSelection[unit_group];

  if (selected_unit === "dd.dd") {
    fval = value.toFixed(4) + "°";
  } else if (selected_unit === "dd mm.mm") {
    const degrees = Math.floor(Math.abs(value));
    const minutes = (Math.abs(value) - degrees) * 60.0;
    fval = degrees.toFixed(0) + "° " + minutes.toFixed(1) + "'";
  }
  if (unit_group === "group_latitude") hemisphere = value >= 0 ? "N" : "S";
  else hemisphere = value >= 0 ? "E" : "W";
  return fval + hemisphere;
}
