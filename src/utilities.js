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
        return this;
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
        return this;
    }
}
