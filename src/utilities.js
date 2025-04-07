/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dayjs from "dayjs";
import { formatUpdate } from "./units";

/*
    The MQTT object looks something like this:
    {
        "latitude": 31.854926666666668,
        "longitude": -116.62007166666666,
        "timeUTC": "01:00:13",
        "gll_mode": "D",
        "sentence_type": "GLL",
        "timestamp": 1743717957
    }
 */
class Update {
  /**
   * @constructor
   * @param {string} key - An appropriate, unique key. Somethng like "longitude".
   * @param {float} value - The updated value
   * @param {dayjs.Dayjs} last_update - The time the value was last updated.
   */
  constructor(key, value, last_update) {
    this.key = key;
    this.value = value;
    this.last_update = last_update;
  }
}

// Extract data out of the parsed JSON SignalK object.
export function getUpdateDicts(topic, mqttObject) {
  let updates = [];
  for (const key in mqttObject) {
    updates.push(new Update(key, mqttObject[key], dayjs(mqttObject.timestamp)));
  }
  return updates;
}

// Extract the vessel position out of the vessel state
export function getLatLng(vesselState) {
  let boatPosition = null;
  if (vesselState["latitude"] != null) {
    boatPosition = {
      lat: vesselState["latitude"].value,
      lng: vesselState["longitude"].value,
    };
  }
  return boatPosition;
}

// This will accumulate the updates.
export class VesselState {
  constructor(oldState) {
    Object.assign(this, oldState);
  }

  mergeUpdates(updates) {
    for (let update of updates) {
      this[update.key] = update;
    }
    return this;
  }
}

// This will format the updates, then accumulate them.
export class FormattedState {
  constructor(oldState) {
    Object.assign(this, oldState);
  }

  mergeUpdates(updates) {
    for (let update of updates) {
      this[update.key] = formatUpdate(update);
    }
    return this;
  }
}

/**
 * Extract attributes from an object in a given ordering
 * @param {Array[String]} ordering - The ordering of the final results
 * @param {object} obj - Object to be deconstructed into an array
 * @returns {Array[obj]}
 */
export function orderArray(ordering, obj) {
  return ordering.reduce((partial, x) => {
    // Only include non-null objects
    if (obj[x] != null) {
      partial.push(obj[x]);
    }
    return partial;
  }, []);
}

/**
 *
 * @param latLng {{lng: number, lat: number}}
 * @param distance_nm {number} Distance in nm
 * @param bearing_degrees {number} Bearing in degrees (0=N; 90=E)
 * @returns {{lng: number, lat: number}}
 */
export function latLngAtBearing(latLng, distance_nm, bearing_degrees) {
  const R = 3443.8; // Earth's radius in nm
  const angular_distance = distance_nm / R;
  const lat1_radians = (latLng.lat * Math.PI) / 180; // Convert to radians
  const lng1_radians = (latLng.lng * Math.PI) / 180;
  const bearing_radians = (bearing_degrees * Math.PI) / 180;

  const lat2_radians = Math.asin(
    Math.sin(lat1_radians) * Math.cos(angular_distance) +
      Math.cos(lat1_radians) *
        Math.sin(angular_distance) *
        Math.cos(bearing_radians),
  );
  const lng2_radians =
    lng1_radians +
    Math.atan2(
      Math.sin(bearing_radians) *
        Math.sin(angular_distance) *
        Math.cos(lat1_radians),
      Math.cos(angular_distance) -
        Math.sin(lat1_radians) * Math.sin(lat2_radians),
    );

  return {
    lat: (lat2_radians * 180) / Math.PI,
    lng: (lng2_radians * 180) / Math.PI,
  };
}

export function getPixelDistance(scale, projection, latLng1, latLng2) {
  // Convert the LatLng positions to pixel positions
  const point1 = projection.fromLatLngToPoint(latLng1);
  const point2 = projection.fromLatLngToPoint(latLng2);

  // Scale them to actual pixel positions at the current zoom level
  const pixel1 = { x: point1.x * scale, y: point1.y * scale };
  const pixel2 = { x: point2.x * scale, y: point2.y * scale };

  // Calculate the Euclidean distance in pixels and return
  return Math.sqrt(
    Math.pow(pixel2.x - pixel1.x, 2) + Math.pow(pixel2.y - pixel1.y, 2),
  );
}
