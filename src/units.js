// These are the units used by the incoming SignalK paths:
export const signalKUnits = {
    "navigation.position": "degree_geo",
    "navigation.speedOverGround": " meter_per_second",
    "navigation.courseOverGroundTrue": "radian",
    "environment.depth.belowTransducer": "meter",
    "environment.depth.belowKeel": "meter",
    "environment.water.temperature": "degree_K",
    "last_update" : "unix_epoch",
}

export const unit_group = {
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
export const unitLabels = {
    "degree_geo": "º",
    "meter_per_second": " m/s",
    "degree_true": "ºT",
    "meter": " m",
    "degree_K": "ºK",
    "degree_C": "°C",
    "knot": " kn"
}

// What label to use for a given SignalK path
export const pathLabels = {
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
export const unitSelection = {
    group_geo: 'degree_geo',
    group_direction: 'degree_true',
    group_temperature: 'degree_C',
    group_depth: 'meter',
    group_speed: 'knot',
    group_distance: 'nautical_mile',
    group_time: 'unix_epoch',
}

export const conversionDict = {
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
