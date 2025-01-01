/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import mqtt from "mqtt";

import {
    VesselState,
    FormattedState,
    getUpdateDicts,
    getLatLng,
} from "./utilities.js";
import { VesselTable } from "./VesselTable";
import { About } from "./About";
import { BoatMarker } from "./BoatMarker";
import { signalKUnits } from "./units.js";
import { google_key } from "./google-api-key.js";
import { mqttOptions } from "../flyer.config.js";
import "./App.css";


function App() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // vesselState holds the current values. They are unformatted.
    const [vesselState, setVesselState] = useState(new VesselState());
    // formattedState holds the current values as formatted strings.
    const [formattedState, setFormattedState] = useState(new FormattedState());

    // Because this app relies on an external connection to the MQTT broker,
    // internal state must be synchronized in a "useEffect" function. Set up
    // the connection and subscriptions.
    useEffect(() => {
        // Connect to the broker.
        const client = mqtt.connect(mqttOptions.brokerUrl, {
            clientId: mqttOptions.clientId,
            username: mqttOptions.username,
            password: mqttOptions.password,
        });
        setClient(client);
        console.log(
            "Connected to broker",
            mqttOptions.brokerUrl,
            "as client",
            mqttOptions.clientId,
        );

        // How we subscribe depends on the SignalK plugin in use
        if (mqttOptions.plugIn === "signalk-mqtt-gw") {
            client.subscribe("signalk/delta");
        } else if (mqttOptions.plugIn === "signalk-mqtt-push") {
            // Subscribe to all the topics we know about
            Object.keys(signalKUnits).forEach((key) => {
                const topic = `signalk/${mqttOptions.vesselId}/${key}`;
                client.subscribe(topic);
                console.log("Subscribed to topic", topic);
            });
        } else {
            console.log("Unknown MQTT plugin:", mqttOptions.plugIn);
            throw new Error(`Unknown MQTT plugin: ${mqttOptions.plugIn}`);
        }

        // Return a function that will get called when it's time to clean up.
        return () => {
            if (client) {
                client.end(
                    (err) => err && console.log("Error closing MQTT connection:", err),
                );
                setClient(null);
            }
        };
        // Explicitly list no dependencies. This will cause this "useEffect()" to get run only once.
    }, []);

    // This useEffect() is used to synchronize between an arrival of a message
    // and the internal state.
    useEffect(() => {
        if (client) {
            client.on("message", function(topic, message) {
                const updateDicts = getUpdateDicts(JSON.parse(message.toString()));
                setVesselState((v) => new VesselState(v.mergeUpdates(updateDicts)));
                setFormattedState(
                    (f) => new FormattedState(f.mergeUpdates(updateDicts)),
                );
            });
            client.on("error", (err) => console.error(err));
        }
        // Setting 'client' as the sole dependency ensures that the function only
        // gets called when client changes. That is, on initial establishment of
        // the client connection. Otherwise, new handlers would get established on
        // every refresh.
    }, [client]);

    // Use boat heading, but if it's not available, substitute COG
    let boatDir = vesselState["navigation.headingTrue"]?.value;
    if (boatDir == null)
        boatDir = vesselState["navigation.courseOverGroundTrue"]?.value;

    // Use environment.wind.speedTrue, but if it's not available,
    // then environment.wind.speedOverGround
    let windSpeed = vesselState["environment.wind.speedTrue"]?.value;
    if (windSpeed == null)
        windSpeed = vesselState["environment.wind.speedOverGround"]?.value;

    // latLng holds the current vessel position, or null if it has not been established yet.
    const latLng = getLatLng(vesselState);

    return (
        <div style={{ height: "400px", width: "100%", padding: "50px" }}>
            <header className="entry-header">
                <h1 className="entry-title">Where&apos;s the Flyer?</h1>
            </header>
            <p>If no position appears after a few seconds, it&apos;s because
                power is off on the boat.</p>
            <p><a href={"https://westernflyer.org"}>Back to the Western Flyer
                Foundation website</a></p>
            <APIProvider
                apiKey={`${google_key}`}
                onLoad={() => console.log("Maps API has loaded.")}
            >
                {(latLng && (
                    <Map
                        defaultZoom={10}
                        defaultCenter={latLng}
                        streetViewControl={false}
                        scaleControl={true}
                        mapId="DEMO_MAP_ID">
                        <BoatMarker latLng={latLng}
                                    heading={boatDir}
                                    cog={vesselState["navigation.courseOverGroundTrue"]?.value}
                                    sog={vesselState["navigation.speedOverGround"]?.value}
                                    windSpeed={windSpeed}
                                    windDirection={vesselState["environment.wind.directionTrue"]?.value}
                        />

                    </Map>
                )) || (
                    <p className="fetching">Waiting for a valid vessel
                        position...</p>
                )}
            </APIProvider>
            <div style={{ padding: "20px" }}>
                <VesselTable formattedState={formattedState} />
                <div style={{ paddingLeft: "16px" }}>
                    <About />
                </div>
            </div>
        </div>
    );
}

export default App;
