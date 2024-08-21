/*
 * Configuration settings
 */

export const mqttOptions = {
    // The URL for the MQTT broker
    // brokerUrl : "ws://localhost:8080",
    brokerUrl : "ws://acme.com:8080",

    // The client ID to be used for the MQTT connection
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000),

    // The username and password as required by the broker, if any
    username: undefined,
    password: undefined,

    // Which SignalK ID to listen to. Use '+' for all IDs.
    vesselId: "+",
};

export const tableOptions = {
    // What to present in the table, and in what order:
    order: [
        "navigation.position.latitude",
        "navigation.position.longitude",
        "navigation.speedOverGround",
        "navigation.courseOverGroundTrue",
        "navigation.speedThroughWater",
        "navigation.headingTrue",
        "navigation.log",
        "environment.depth.belowSurface",
        "environment.depth.belowTransducer",
        "environment.depth.belowKeel",
        "environment.wind.speedOverGround",
        "environment.wind.directionTrue",
        "environment.wind.speedApparent",
        "environment.wind.angleApparent",
        "environment.water.temperature",
        "environment.outside.pressure",
    ],
};
