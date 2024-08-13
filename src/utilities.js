import dayjs from 'dayjs';

const unitInfo = {
    "navigation.position.latitude": {
        label: "Latitude",
        unit: "º"
    },
    "navigation.position.longitude": {
        label: "Longitude",
        unit: "º"
    },
    "navigation.speedOverGround": {
        label: "Speed over ground",
        unit: " m/s"
    },
    "navigation.courseOverGroundTrue": {
        label: "Course over ground",
        unit: "ºT"
    },
    "environment.depth.belowTransducer": {
        label: "Depth",
        unit: " m"
    },
    "environment.water.temperature": {
        label: "Water temperature",
        unit: "ºK"
    }
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

class InfoDict {
    constructor(key, label, value, unit, update_time) {
        this.key = key;
        this.label = label;
        this.value = value;
        this.unit = unit;
        this.update_time = update_time;
    }
}

// Extract data out of the parsed JSON object.
export function getUpdateDicts(signalk_obj) {

    let updates = [];
    for (let update of signalk_obj.updates) {
        for (let value of update.values) {
            if (value.path === 'navigation.position') {
                updates.push(new InfoDict('navigation.position.latitude', 'Latitude', value.value.latitude, ' °', update.timestamp))
                updates.push(new InfoDict('navigation.position.longitude', 'Longitude', value.value.longitude, ' °', update.timestamp))
            } else {
                updates.push(new InfoDict(value.path, unitInfo[value.path].label, value.value, unitInfo[value.path].unit, update.timestamp))
            }
        }
    }
    return updates;
}
