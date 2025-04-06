/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import mqtt from "mqtt";

import {
    FormattedState,
    getLatLng,
    getUpdateDicts,
    VesselState,
} from "./utilities.js";
import { VesselTable } from "./VesselTable";
import { About } from "./About";
import { BoatMarker } from "./BoatMarker";
import { FollowBoatControl } from "./FollowBoat";
import { google_key } from "./google-api-key.js";
import { boatOptions, mqttOptions } from "../flyer.config.js";
import "./App.css";


function App() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // vesselState holds the current values. They are unformatted.
    const [vesselState, setVesselState] = useState(new VesselState());
    // formattedState holds the current values as formatted strings.
    const [formattedState, setFormattedState] = useState(new FormattedState());
    // Current status
    const [status, setStatus] = useState(boatOptions.defaultStatus);

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

        const prefix = `${mqttOptions.prefix}/${mqttOptions.MMSI}/`;
        // Subscribe to the topics we care about
        for (const nmeaType of ['GLL','HDT','MDA','MWV', 'RSA', 'VTG'])
        {
            client.subscribe(prefix + nmeaType);
            console.log(`Subscribed to ${prefix + nmeaType}`);
        }
        client.subscribe("status");

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
                if (topic === "status") {
                    setStatus(message.toString());
                } else {
                    const updateDicts = getUpdateDicts(topic, JSON.parse(message.toString()));
                    setVesselState((v) => new VesselState(v.mergeUpdates(updateDicts)));
                    setFormattedState(
                        (f) => new FormattedState(f.mergeUpdates(updateDicts)),
                    );
                }
            });
            client.on("error", (err) => console.error(err));
        }
        // Setting 'client' as the sole dependency ensures that the function only
        // gets called when client changes. That is, on initial establishment of
        // the client connection. Otherwise, new handlers would get established on
        // every refresh.
    }, [client]);

    // boatPosition holds the current vessel position, or null if it has not been established yet.
    const boatPosition = getLatLng(vesselState);

    return (
        <div style={{ height: "400px", width: "100%", padding: "50px" }}>
            <p><a href="https://westernflyer.org"><img  style={{width: "300px"}} src="/flyer-map/assets_logo_trans.png" alt="Logo"/></a></p>
            <header className="entry-header">
                <h1 className="entry-title">Where&apos;s the Flyer?</h1>
            </header>
            <p><strong><em>Status</em></strong> <span style={{float: "right"}}><a
                href="/flyer-map/status.html">Change</a></span></p>
            <p>{status}</p>
            <img className="center" style={{ marginBottom: "20px" }}
                 src={"/flyer-map/underline-short.png"} alt="Underline" />
            <APIProvider
                apiKey={`${google_key}`}
                onLoad={() => console.log("Maps API has loaded.")}
            >
                {(boatPosition && (
                    <Map
                        defaultZoom={10}
                        defaultCenter={boatPosition}
                        streetViewControl={false}
                        scaleControl={true}
                        mapId="FLYER_MAP_ID">
                        <BoatMarker boatPosition={boatPosition}
                                    heading={vesselState["hdg_true"]?.value}
                                    cog={vesselState["cog_true"]?.value}
                                    sog={vesselState["sog_true"]?.value}
                                    windSpeed={vesselState["tws_knots"]?.value}
                                    windDirection={vesselState["twd_true"]?.value}
                        />
                        <FollowBoatControl
                            boatPosition={boatPosition} />
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
