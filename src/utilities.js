// These are the units used by the incoming SignalK paths:
const signalKUnits = {
    "navigation.position.latitude": "degree_geo",
    "navigation.position.longitude": "degree_geo",
    "navigation.speedOverGround": " meter_per_second",
    "navigation.courseOverGroundTrue": "degree_true",
    "environment.depth.belowTransducer": "meter",
    "environment.depth.belowKeel": "meter",
    "environment.water.temperature": "degree_K"
}

// What label to use for a given unit
const unitLabels = {
    "degree_geo": "º",
    "meter_per_second": " m/s",
    "degree_true": "ºT",
    "meter": " m",
    "degree_K": "ºK",
    "degree_C": "°C",
    "knot": " kn"
}

// What label to use for a given SignalK path
const pathLabels = {
    "navigation.position.latitude": "Latitude",
    "navigation.position.longitude": "Longitude",
    "navigation.speedOverGround": "Speed over ground",
    "navigation.courseOverGroundTrue": "Course over ground",
    "environment.depth.belowTransducer": "Depth below transducer",
    "environment.depth.belowKeel": "Depth below keel",
    "environment.water.temperature": "Water temperature"
}

// What unit to display
const unitSelection = {
    group_geo: 'degree_geo',
    group_direction: 'degree_true',
    group_temperature: 'degree_C',
    group_depth: 'meter',
    group_speed: 'knot',
    group_distance: 'nautical_mile',
}

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
    constructor(key, value, unit, last_update) {
        this.key = key;
        this.value = value;
        this.unit = unit;
        this.last_update = last_update;
    }
}

// Extract data out of the parsed JSON object.
export function getUpdateDicts(signalk_obj) {

    let updates = [];
    for (let update of signalk_obj.updates) {
        for (let value of update.values) {
            if (value.path === 'navigation.position') {
                updates.push(new Update('navigation.position.latitude', value.value.latitude, 'degree_geo', update.timestamp));
                updates.push(new Update('navigation.position.longitude', value.value.longitude, 'degree_geo', update.timestamp));
            } else {
                updates.push(new Update(value.path, value.value, signalKUnits[value.path], update.timestamp));
            }
        }
    }
    return updates;
}

export class VesselState {
    constructor(state) {
        this.state = state || {};
    }

    mergeUpdates(updates) {
        for (let update of updates) {
            this.state[update.key] = update;
        }
    }
}

export function formatInfo(vesselState) {
    for (let key in Object.keys(vesselState.state)) {

    }
}