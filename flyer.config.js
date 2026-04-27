/*
 * Configuration settings
 */

export const boatOptions = {
    defaultStatus: "If no position appears after a few seconds, it is because " +
        "power is off on the boat."
}

export const mqttOptions = {
    // The URL for the MQTT broker
    // brokerUrl : "ws://localhost:8080",
    // or for secure websockets:
    //   brokerUrl : "wss://mydomain.com:9001
    brokerUrl: "wss://projects.westernflyer.org:9001",

    // The client ID to be used for the MQTT connection
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000),

    // The username and password as required by the broker, if any
    username: undefined,
    password: undefined,

    prefix : "nmea-debug",

    // Which MMSI to listen to. Use '+' to listen to all IDs.
    MMSI: 368323170,
};

export const historyOptions = {
  // Where to get the initial history data from.
  // When testing, to avoid a CORS error when running the client locally, set up a proxy:
  //     npx local-cors-proxy --proxyUrl https://projects.westernflyer.org
  // then use the following history_url:
  history_url: `http://localhost:8010/proxy/api/v1/data/${mqttOptions.MMSI}/`,

  // history_url: `https://projects.westernflyer.org/api/v1/data/${mqttOptions.MMSI}/`
};

export const tableOptions = {
    // What to present in the table, and in what order:
    order: [
        "GPGLL_latitude",
        "GPGLL_longitude",
        "GPRMC_cog_true",
        "GPVTG_sog_knots",
        "HEHDT_hdg_true",
        "IIMDA_tws_knots",
        "IIMDA_twd_true",
        "IIMWV_aws_knots",
        "IIMWV_awa",
        "WIMWV_aws_knots",
        "FTMWV_aws_knots",
        "WIMWV_awa",
        "FTMWV_awa",
        "IIMDA_pressure_millibars",
        "IIMDA_temperature_air_celsius",
        "IIMDA_temperature_water_celsius",
        "IIRSA_rudder_angle",
        "SDDPT_depth_below_transducer_meters",
        "TIROT_rate_of_turn",
    ],
};

export const markerOptions = {
    minCOGLength: 5,
};
