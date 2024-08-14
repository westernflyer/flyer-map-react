import dayjs from 'dayjs';
import * as sprintf from 'sprintf-js';

// These are the units used by the incoming SignalK paths:
const signalKUnits = {
    "navigation.position": "degree_geo",
    "navigation.speedOverGround": " meter_per_second",
    "navigation.courseOverGroundTrue": "radian",
    "environment.depth.belowTransducer": "meter",
    "environment.depth.belowKeel": "meter",
    "environment.water.temperature": "degree_K",
    "last_update" : "unix_epoch",
}

const unit_group = {
    "navigation.position.latitude": "group_geo",
    "navigation.position.longitude": "group_geo",
    "navigation.speedOverGround": "group_speed",
    "navigation.courseOverGroundTrue": "group_direction",
    "environment.depth.belowTransducer": "group_depth",
    "environment.depth.belowKeel": "group_depth",
    "environment.water.temperature": "group_temperature",
    "last_update" : "group_time",
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
    "environment.water.temperature": "Water temperature",
    "last_update" : "Last update"
}

// What unit to display
const unitSelection = {
    group_geo: 'degree_geo',
    group_direction: 'degree_true',
    group_temperature: 'degree_C',
    group_depth: 'meter',
    group_speed: 'knot',
    group_distance: 'nautical_mile',
    group_time: 'unix_epoch',
}

const conversionDict = {
    degree_K: {
        'degree_C': x => x - 273.15
    },
    meter: {
        'foot': x => 3.280839895 * x
    },
    meter_per_second: {
        'knot': x => 1.94384449 * x,
        'mile_per_hour': x => 3600 * x / 1609.34,
        'km_per_hour': x => 3.6 * x,
    },
    radian: {
        degree_true: x => 57.295779513 * x
    }
}

const stringFormats = {
    degree_C : "%.1f"
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
                updates.push(new Update('navigation.position.latitude', value.value.latitude, signalKUnits[value.path], dayjs(update.timestamp).unix()));
                updates.push(new Update('navigation.position.longitude', value.value.longitude, signalKUnits[value.path], dayjs(update.timestamp).unix()));
            } else {
                updates.push(new Update(value.path, value.value, signalKUnits[value.path], dayjs(update.timestamp).unix()));
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

export class FormattedInfo {
    constructor(key, value, unit, last_update) {
        this.key = key;
        this.value
    }
}

export function formatInfo(vesselState) {
    let value;
    const state = vesselState.state;
    let formattedInfo = [];
    for (let key in Object.keys(state)) {
        const unit_group = unit_group[key]
        const selected_unit = unitSelection[unit_group];
        if (state.unit === selected_unit) {
            value = state.value;
        } else {
            value = conversionDict[state.unit][selected_unit](state.value);
        }
        const label = unitLabels[selected_unit];
    }
}