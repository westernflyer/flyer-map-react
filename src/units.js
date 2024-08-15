import dayjs from "dayjs";

// These are the units used by the incoming SignalK paths:
export const signalKUnits = {
    "navigation.position": "degree_geo",
    "navigation.speedOverGround": "meter_per_second",
    "navigation.courseOverGroundTrue": "radian",
    "navigation.speedThroughWater" : "meter_per_second",
    "navigation.headingTrue": "radian",
    "environment.depth.belowTransducer": "meter",
    "environment.depth.belowKeel": "meter",
    "environment.wind.speedApparent" : "meter_per_second",
    "environment.wind.angleApparent" : "radian",
    "environment.water.temperature": "degree_K",
    last_update: "unix_epoch",
};

export const unit_group = {
    "navigation.position.latitude": "group_geo",
    "navigation.position.longitude": "group_geo",
    "navigation.speedOverGround": "group_speed",
    "navigation.courseOverGroundTrue": "group_direction",
    "navigation.speedThroughWater" : "group_speed",
    "navigation.headingTrue": "group_direction",
    "environment.depth.belowTransducer": "group_depth",
    "environment.depth.belowKeel": "group_depth",
    "environment.wind.speedApparent" : "group_speed",
    "environment.wind.angleApparent" : "group_direction",
    "environment.water.temperature": "group_temperature",
    last_update: "group_time",
};

// Which label to use for a given unit
export const unitLabels = {
    degree_geo: "º",
    meter_per_second: " m/s",
    degree_true: "ºT",
    meter: " m",
    degree_K: "ºK",
    degree_C: "°C",
    knot: " kn",
};

// Which label to use for a given SignalK path
export const pathLabels = {
    "navigation.position.latitude": "Latitude",
    "navigation.position.longitude": "Longitude",
    "navigation.speedOverGround": "Speed over ground",
    "navigation.courseOverGroundTrue": "Course over ground",
    "navigation.speedThroughWater" : "Speed through water",
    "navigation.headingTrue": "Heading",
    "environment.depth.belowTransducer": "Depth below transducer",
    "environment.depth.belowKeel": "Depth below keel",
    "environment.wind.speedApparent" : "Wind speed (apparent)",
    "environment.wind.angleApparent" : "Wind direction (apparent)",
    "environment.water.temperature": "Water temperature",
    last_update: "Last update",
};

// What unit to display
export const unitSelection = {
    group_geo: "degree_geo",
    group_direction: "degree_true",
    group_temperature: "degree_C",
    group_depth: "meter",
    group_speed: "knot",
    group_distance: "nautical_mile",
    group_time: "unix_epoch",
};

export const conversionDict = {
    degree_K: {
        degree_C: (x) => x - 273.15,
    },
    meter: {
        foot: (x) => 3.280839895 * x,
    },
    meter_per_second: {
        knot: (x) => 1.94384449 * x,
        mile_per_hour: (x) => (3600 * x) / 1609.34,
        km_per_hour: (x) => 3.6 * x,
    },
    radian: {
        degree_true: (x) => 57.295779513 * x,
    },
};

export function formattedValue(value, unit) {
    switch (unit) {
        case "degree_C":
        case "degree_F":
        case "degree_K":
            return value.toFixed(1);
        case "degree_geo":
            return value.toFixed(4);
        case "meter_per_second":
        case "knot":
            return value.toFixed(1);
        case "meter":
            return value.toFixed(0);
        case "nautical_mile":
            return value.toFixed(1);
        case "unix_epoch":
            return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
        default:
            return value;
    }
}
