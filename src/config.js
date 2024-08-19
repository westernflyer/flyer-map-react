/*
 * Configuration settings
 */

export const mqttOptions = {
    // The URL for the MQTT broker
    brokerUrl: "mqtt://mydomain.com:8080",
    // brokerUrl : "mqtt://localhost:8080",

    // The client ID to be used for the MQTT connection
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000),

    // The username and password as required by the broker, if any
    username: undefined,
    password: undefined,
};
