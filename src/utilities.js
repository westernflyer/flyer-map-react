/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import dayjs from "dayjs";
import { formatUpdate } from "./units";
import { fieldOptions } from "../flyer.config";

/**
 * A parsed MQTT message payload.
 *
 * Each message has a timestamp plus a variable set of data fields depending
 * on the MQTT sentence type.
 *
 * @typedef {Object.<string, string|number|boolean|null>} MqttObject
 * @property {number} timestamp - Message timestamp, usually milliseconds since Unix epoch.
 * @property {string} sentence_type - The type of sentence, e.g. "GLL".
 *
 * For sentence type GLL, this would look like:
 * {
 *     "latitude": 36.805795,
 *     "longitude": -121.785685,
 *     "timeUTC": "20:52:38",
 *     "gll_mode": "D",
 *     "sentence_type": "GLL",
 *     "timestamp": 1782420758158
 * }
 */

class Update {
    /**
     * @constructor
     * @param {string} dataFieldKey - The key for a field. Something like "GPGLL_longitude".
     * @param {float} dataFieldValue - The value for the field.
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

/**
 * The state of the vessel, represented as an object full of Update objects.
 *
 * Typically, it looks something like this:
 *
 * {
 *     "timestamp": "2026-06-26T19:13:00.000Z",
 *     "FTMWV_awa": {
 *         "dataFieldKey": "FTMWV_awa",
 *         "value": 82,
 *         "last_update": "2026-06-26T19:13:00.000Z"
 *     },
 *     "FTMWV_aws_knots": {
 *         "dataFieldKey": "FTMWV_aws_knots",
 *         "value": 10.6,
 *         "last_update": "2026-06-26T19:13:00.000Z"
 *     },
 *     "GPGLL_latitude": {
 *         "dataFieldKey": "GPGLL_latitude",
 *         "value": 36.80578833333333,
 *         "last_update": "2026-06-26T19:13:00.000Z"
 *     },
 *     "GPGLL_longitude": {
 *         "dataFieldKey": "GPGLL_longitude",
 *         "value": -121.785685,
 *         "last_update": "2026-06-26T19:13:00.000Z"
 *     },
 *     ...
 * }
 */
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
    // Some fields can appear in multiple sentence types. This function picks the right one to use.
    getField(field){
        const dataFieldKey = fieldOptions[field];
        return this[dataFieldKey];
    }
}

/**
 * Format the vessel state for display.
 * @typedef {Object} FormattedUpdate
 * @property {string} dataFieldKey
 * @property {string} label
 * @property {string} value
 * @property {string} last_update
 * @param {VesselState} vesselState
 * @returns {Object.<string, FormattedUpdate>}
 */
export function formatVesselState(vesselState) {
    const formattedState = {};
    for (const key in vesselState) {
        if (key !== "timestamp") {
            formattedState[key] = formatUpdate(vesselState[key]);
        }
    }
    return formattedState;
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
 * @param {{lng: number, lat: number}} latLng
 * @param {number} distance_nm - Distance in nm
 * @param {number} bearing_degrees - Bearing in degrees (0=N; 90=E)
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
