/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dayjs from "dayjs";
import { formatUpdate, signalKUnits } from "./units";

/*
    A SignalK object looks like:
    {
        "context": "vessels.urn:mrn:imo:mmsi:367199590",
        "updates": [{
            "timestamp": "2024-08-07T22:49:02.000Z",
            "$source": "Velocityyd.YD",
            "values": [{"path": "navigation.position", "value": {"longitude": -122.65223, "latitude": 45.601395}}]
        }]

    or like

    {
        "context": "vessels.urn:mrn:imo:mmsi:367199590",
        "updates": [{
            "timestamp": "2024-08-11T20:52:41.018Z",
            "$source": "velocity2000.127",
            "values": [{"path": "navigation.speedOverGround", "value": 0}]
        }]
    }
    }
 */

class Update {
    /**
     * @constructor
     * @param {string} key - An appropriate, unique key. This is usually
     * the SignalK path
     * @param {float} value - The updated value
     * @param {float} unit - The unit the value is in
     * @param {dayjs.Dayjs} last_update - The time the value was last updated.
     */
    constructor(key, value, unit, last_update) {
        this.key = key;
        this.value = value;
        this.unit = unit;
        this.last_update = last_update;
    }
}

// Extract data out of the parsed JSON SignalK object.
export function getUpdateDicts(signalk_obj) {
    let updates = [];
    for (let update of signalk_obj.updates) {
        for (let value of update.values) {
            // Special treatment for position: flatten it
            // into latitude and longitude:
            if (value.path === "navigation.position") {
                updates.push(
                    new Update(
                        "navigation.position.latitude",
                        value.value.latitude,
                        signalKUnits[value.path],
                        dayjs(update.timestamp),
                    ),
                );
                updates.push(
                    new Update(
                        "navigation.position.longitude",
                        value.value.longitude,
                        signalKUnits[value.path],
                        dayjs(update.timestamp),
                    ),
                )
                ;
            } else {
                if (value.path === "environment.wind.speedOverGround"){
                    updates.push(
                        new Update(
                            value.path,
                            4 * .514445,
                            signalKUnits[value.path],
                            dayjs(update.timestamp),
                        ),
                    );

                } else {
                    updates.push(
                        new Update(
                            value.path,
                            value.value,
                            signalKUnits[value.path],
                            dayjs(update.timestamp),
                        ),
                    );
                }
            }
        }
    }
    return updates;
}

// Extract latLng out of the vessel state
export function getLatLng(vesselState) {
    let latLng = null;
    if (vesselState["navigation.position.latitude"] != null) {
        latLng = {
            lat: vesselState["navigation.position.latitude"].value,
            lng: vesselState["navigation.position.longitude"].value,
        };
    }
    return latLng;
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
 * @param distance {number} Distance in meters
 * @param bearing_radians {number} Bearing in radians (0=north)
 * @returns {{lng: number, lat: number}}
 */
export function latLngAtBearing(latLng, distance, bearing_radians) {

    const R = 6371e3; // Earth's radius in meters
    const lat1_radians = (latLng.lat * Math.PI) / 180; // Convert to radians
    const lng1_radians = (latLng.lng * Math.PI) / 180;
    const angular_distance = distance / R;

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

    const newLatLng = {
        lat: (lat2_radians * 180) / Math.PI,
        lng: (lng2_radians * 180) / Math.PI,
    };

    return newLatLng;
}

export function getPixelDistance(scale, projection, latLng1, latLng2) {
    // Convert the LatLng positions to pixel positions
    const point1 = projection.fromLatLngToPoint(latLng1);
    const point2 = projection.fromLatLngToPoint(latLng2);

    // Scale them to actual pixel positions at the current zoom level
    const pixel1 = { x: point1.x * scale, y: point1.y * scale };
    const pixel2 = { x: point2.x * scale, y: point2.y * scale };

    // Calculate the Euclidean distance in pixels
    const pixelDistance = Math.sqrt(Math.pow(pixel2.x - pixel1.x, 2) + Math.pow(pixel2.y - pixel1.y, 2));

    return pixelDistance;
}