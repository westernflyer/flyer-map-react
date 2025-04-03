/*
 * Configuration settings
 */

export const boatOptions = {
    defaultStatus: "If no position appears after a few seconds, it is because " +
        "power is off on the boat."
}

export const mqttOptions = {
    // The URL for the MQTT broker
    brokerUrl : "ws://localhost:8080",
    // or for secure websockets:
    //   brokerUrl : "wss://mydomain.com:9001
    //brokerUrl: "wss://projects.westernflyer.org:9001",

    // The client ID to be used for the MQTT connection
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000),

    // The username and password as required by the broker, if any
    username: undefined,
    password: undefined,

    prefix : "nmea",

    // Which MMSI to listen to. Use '+' to listen to all IDs.
    MMSI: "+",
};

export const tableOptions = {
    // What to present in the table, and in what order:
    order: [
        "latitude",
        "longitude",
        "sog_knots",
        "cog_true",
        "hdg_true",
        "depth_meters",
        "tws_knots",
        "twd_true",
        "aws_knots",
        "awa",
        "temperature_water_celsius",
        "temperature_air_celsius",
        "rudder_angle",
    ],
};

export const markerOptions = {
    minCOGLength: 5,
};
