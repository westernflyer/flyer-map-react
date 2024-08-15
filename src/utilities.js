import dayjs from "dayjs";
import * as units from "./units";

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
            if (value.path === "navigation.position") {
                updates.push(
                    new Update(
                        "navigation.position.latitude",
                        value.value.latitude,
                        units.signalKUnits[value.path],
                        dayjs(update.timestamp),
                    ),
                );
                updates.push(
                    new Update(
                        "navigation.position.longitude",
                        value.value.longitude,
                        units.signalKUnits[value.path],
                        dayjs(update.timestamp),
                    ),
                );
            } else {
                updates.push(
                    new Update(
                        value.path,
                        value.value,
                        units.signalKUnits[value.path],
                        dayjs(update.timestamp),
                    ),
                );
            }
        }
    }
    return updates;
}

export class VesselState {
    constructor(oldState) {
        Object.assign(this, oldState);
    }

    mergeUpdates(updates) {
        for (let update of updates) {
            this[update.key] = update;
        }
    }
}

export class FormattedState {
    constructor(oldState) {
        Object.assign(this, oldState);
    }

    mergeUpdates(updates) {
        for (let update of updates) {
            this[update.key] = formatUpdate(update);
        }
    }
}

export function formatUpdate(update) {
    // The unit group a key belongs to. This will be something
    // like 'group_temperature'
    const unit_group = units.unit_group[update.key];
    // The desired unit to be used for that group. This will be something
    // like 'degree_C'
    const selected_unit = units.unitSelection[unit_group];
    // Convert if necessary
    const value =
        update.unit === selected_unit
            ? update.value
            : units.conversionDict[update.unit][selected_unit](update.value);
    // Format the value and convert to string. 12.34567 becomes
    // something like "12.3"
    const formattedValue = units.formattedValue(value, selected_unit);
    // Get an appropriate label for the unit. Something like "°C".
    const unit_label = units.unitLabels[selected_unit];

    // Now put it all together:
    return {
        key: update.key,
        label: units.pathLabels[update.key],
        value: formattedValue + unit_label,
        last_update: units.formattedValue(update.last_update, "unix_epoch"),
    };
}
