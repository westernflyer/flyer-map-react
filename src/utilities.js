/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import dayjs from "dayjs";
import { formatUpdate } from "./units";
import { fieldOptions } from "../flyer.config";

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
     * @param {string} dataFieldKey - The key for a field. Something like "GPGLL_longitude".
     * @param {float} dataFieldValue - The updated value
     * @param {dayjs.Dayjs} last_update - The time the dataFieldValue was last updated.
     */
    constructor(dataFieldKey, dataFieldValue, last_update) {
        this.dataFieldKey = dataFieldKey;
        this.value = dataFieldValue;
        this.last_update = last_update;
    }
}

/**
 * Given a topic and a parsed MQTT object, flatten its components into an array of Update objects.
 *
 * @param {string} topic - The MQTT topic string used to derive keys for the updates.
 * @param {Object} mqttObject - The parsed MQTT message object containing data fields and a timestamp.
 * @return {Array<Update>} An array of Update objects containing keys, values, and a timestamp.

 * For example, given an MQTT object that looks like this:
 *
 * {
 *     "latitude": 36.805795,
 *     "longitude": -121.785685,
 *     "timeUTC": "20:52:38",
 *     "gll_mode": "D",
 *     "sentence_type": "GLL",
 *     "timestamp": 1782420758158
 * }
 * The results would look like this:
 * [
 *     {
 *         "dataFieldKey": "GPGLL_latitude",
 *         "value": 36.805795,
 *         "last_update": "2026-06-25T20:52:38.158Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_longitude",
 *         "value": -121.785685,
 *         "last_update": "2026-06-25T20:52:38.158Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_timeUTC",
 *         "value": "20:52:38",
 *         "last_update": "2026-06-25T20:52:38.158Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_gll_mode",
 *         "value": "D",
 *         "last_update": "2026-06-25T20:52:38.158Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_sentence_type",
 *         "value": "GLL",
 *         "last_update": "2026-06-25T20:52:38.158Z"
 *     }
 * ]
 */

export function getUpdateDicts(topic, mqttObject) {
    const updates = [];
    const timestamp = dayjs(mqttObject.timestamp);
    for (const dataField in mqttObject) {
        if (dataField !== "timestamp") {
            const dataFieldKey= topic.split("/")[2] + "_" + dataField;
            updates.push(new Update(dataFieldKey, mqttObject[dataField], timestamp));
        }
    }
    return updates;
}

/**
 * Very similar to the above, except that it works with objects returned from the WF data server.
 *
 * @param {Object} apiObject - The JSON object as returned by the WF data server.
 *                             Expected to include a `timestamp` key and other fields.
 * @return {Array<Update>} An array of Update objects, each containing a key, value, and a
 * timestamp as a dayjs object.
 *
 * For example, for an object that looks like this:
 * {
 *     "mmsi": 368323170,
 *     "timestamp": 1782378240000,
 *     "FTMWV_awa": 34,
 *     "FTMWV_aws_knots": 2.4,
 *     "GPGLL_latitude": 36.80578333333333,
 *     "GPGLL_longitude": -121.78568333333334,
 *     ...
 *
 * The results would look like this:
 *
 * [
 *     {
 *         "dataFieldKey": "FTMWV_awa",
 *         "value": 34,
 *         "last_update": "2026-06-25T09:04:00.000Z"
 *     },
 *     {
 *         "dataFieldKey": "FTMWV_aws_knots",
 *         "value": 2.4,
 *         "last_update": "2026-06-25T09:04:00.000Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_latitude",
 *         "value": 36.80578333333333,
 *         "last_update": "2026-06-25T09:04:00.000Z"
 *     },
 *     {
 *         "dataFieldKey": "GPGLL_longitude",
 *         "value": -121.78568333333334,
 *         "last_update": "2026-06-25T09:04:00.000Z"
 *     },
 *     ...
 * ]
 */
export function extractUpdateDictsfromJson(apiObject) {
    let updates = [];
    const timestamp = dayjs(apiObject.timestamp);
    for (const dataFieldKey in apiObject) {
        if (dataFieldKey !== "timestamp" && dataFieldKey !== "mmsi") {
            updates.push(new Update(dataFieldKey, apiObject[dataFieldKey], timestamp));
        }
    }
    return updates;
}

/**
 * Retrieves the latitude and longitude coordinates from the vessel state object.
 *
 * @param {VesselState} vesselState - The state object of the vessel, which should contain
 * position data.
 * @return {Object|null} An object containing `lat` and `lng` properties if both are present,
 * otherwise null.
 */
export function getLatLng(vesselState) {
    let boatPosition = null;
    const lat = vesselState.getField("latitude")?.value;
    const lon = vesselState.getField("longitude")?.value;
    if (lat != null && lon != null) {
        boatPosition = {
            lat: lat,
            lng: lon,
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
        for (const update of updates) {
            this[update.dataFieldKey] = update;
            this.timestamp = update.last_update;
        }
        return this;
    }
    getField(field){
        const dataFieldKey = fieldOptions[field];
        return this[dataFieldKey];
    }
}

// This will format the updates, then accumulate them.
export class FormattedState {
    constructor(oldState) {
        Object.assign(this, oldState);
    }

    mergeUpdates(updates) {
        for (const update of updates) {
            this[update.dataFieldKey] = formatUpdate(update);
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
 * Given a latitude and longitude, calculate the position at a specified distance and bearing.
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
            Math.cos(lat1_radians) * Math.sin(angular_distance) * Math.cos(bearing_radians),
    );
    const lng2_radians =
        lng1_radians +
        Math.atan2(
            Math.sin(bearing_radians) * Math.sin(angular_distance) * Math.cos(lat1_radians),
            Math.cos(angular_distance) - Math.sin(lat1_radians) * Math.sin(lat2_radians),
        );

    return {
        lat: (lat2_radians * 180) / Math.PI,
        lng: (lng2_radians * 180) / Math.PI,
    };
}

/**
 * Calculates the Euclidean distance in pixels between two geographical points
 * based on the given scale and map projection.
 *
 * @param {number} scale - The scale factor, typically determined by the current zoom level of the map.
 * @param {google.maps.Projection} projection - A Google Maps projection object. Provides
 *      methods for converting geographical coordinates to pixel coordinates.
 * @param {google.maps.LatLng} latLng1 - The first geographical point, containing latitude and longitude.
 * @param {google.maps.LatLng} latLng2 - The second geographical point, containing latitude and longitude.
 * @return {number} The distance in pixels between the two geographical points.
 */
export function getPixelDistance(scale, projection, latLng1, latLng2) {
    // Convert the LatLng positions to pixel positions
    const point1 = projection.fromLatLngToPoint(latLng1);
    const point2 = projection.fromLatLngToPoint(latLng2);

    // Scale them to actual pixel positions at the current zoom level
    const pixel1 = { x: point1.x * scale, y: point1.y * scale };
    const pixel2 = { x: point2.x * scale, y: point2.y * scale };

    // Calculate the Euclidean distance in pixels and return
    return Math.sqrt(Math.pow(pixel2.x - pixel1.x, 2) + Math.pow(pixel2.y - pixel1.y, 2));
}
