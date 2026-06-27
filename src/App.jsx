/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { useEffect, useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import mqtt from "mqtt";

import {
    getLatLng,
    getUpdateDicts,
    extractUpdateDictsfromJson,
    VesselState,
} from "./utilities.js";
import { VesselTable } from "./VesselTable";
import { About } from "./About";
import { BoatMarker } from "./BoatMarker";
import { Breadcrumbs } from "./Breadcrumbs.jsx";
import { FollowBoatControl } from "./FollowBoat";
import { google_key } from "./google-api-key.js";
import { boatOptions, mqttOptions, historyOptions } from "../flyer.config.js";
import "./App.css";

function App() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // vesselState holds the current values. They are unformatted.
    const [vesselState, setVesselState] = useState(new VesselState());
    // history holds the vessel states going back in time
    const [history, setHistory] = useState([]);
    // Current status
    const [status, setStatus] = useState(boatOptions.defaultStatus);

    // Because this app relies on fetching history records from the WF data server, and on an
    // external connection to the MQTT broker, the internal state must be synchronized in a
    // "useEffect" function. Set up the connection and subscriptions.
    useEffect(() => {
        // Fetch initial history
        console.log(`Fetching initial history from ${historyOptions.history_url}`);
        const now = Date.now();
        const startTime = now - historyOptions.historyHours * 3600.0 * 1000.0;
        const url = `${historyOptions.history_url}?start=${startTime}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                // Merge the historical data into an array of VesselState object
                const historyStates = data.map((item) =>
                    new VesselState().mergeUpdates(extractUpdateDictsfromJson(item)),
                );
                setHistory(historyStates);
                // Set the initial vessel state to the last state in the history.
                if (historyStates.length > 0) {
                    const lastState = historyStates[historyStates.length - 1];
                    setVesselState(lastState);
                }
            })
            .catch((err) => console.error("Error fetching history:", err));

        // Now connect to the MQTT broker.
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

        // Subscribe to the topics we care about
        const prefix = `${mqttOptions.prefix}/${mqttOptions.MMSI}/`;
        for (const addressField of [
            "FTMWV",
            "GPGLL",
            "GPVTG",
            "HEHDT",
            "IIMDA",
            "IIRSA",
            "SDDPT",
            "TIROT",
            "WIMWV",
        ]) {
            client.subscribe(prefix + addressField);
            console.log(`Subscribed to ${prefix + addressField}`);
        }
        // Finally, subscribe to the status topic
        client.subscribe("status");

        // Return a function that will get called when it's time to clean up.
        return () => {
            if (client) {
                client.end((err) => err && console.log("Error closing MQTT connection:", err));
                setClient(null);
            }
        };
        // Explicitly list no dependencies. This will cause this "useEffect()" to get run only once.
    }, []);

    // This useEffect() is used to set up the message handler. It is solely dependent on
    // the `client` variable, which means it gets run only once --- when `client` is initially
    // established.
    useEffect(() => {
        if (client) {
            // Set up the message handler
            client.on("message", function (topic, message) {
                if (topic === "status") {
                    setStatus(message.toString());
                } else {
                    const updateDicts = getUpdateDicts(topic, JSON.parse(message.toString()));
                    setVesselState((v) => {
                        return new VesselState(v).mergeUpdates(updateDicts);
                    });
                }
            });
            client.on("error", (err) => console.error(err));
        }
    }, [client]);

    // boatPosition holds the current vessel position, or null if it has not
    // been established yet.
    const boatPosition = getLatLng(vesselState);

    return (
        <div style={{ height: "400px", width: "100%", padding: "50px" }}>
            <p>
                <a href="https://westernflyer.org">
                    <img
                        style={{ width: "300px" }}
                        src="/flyer-map/assets_logo_trans.png"
                        alt="Logo"
                    />
                </a>
            </p>
            <header className="entry-header">
                <h1 className="entry-title">Where&apos;s the Flyer?</h1>
            </header>
            <p>
                <strong>
                    <em>Status</em>
                </strong>{" "}
                <span style={{ float: "right" }}>
                    <a href="/flyer-map/status.html">Change</a>
                </span>
            </p>
            <p>{status}</p>
            <img
                className="center"
                style={{ marginBottom: "20px" }}
                src={"/flyer-map/underline-short.png"}
                alt="Underline"
            />
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
                        mapId="FLYER_MAP_ID"
                    >
                        <Breadcrumbs history={history} />
                        <BoatMarker
                            boatPosition={boatPosition}
                            heading={vesselState.getField("hdg_true")?.value}
                            cog={vesselState.getField("cog_true")?.value}
                            sog={vesselState.getField("sog_knots")?.value}
                            windSpeed={vesselState.getField("tws_knots")?.value}
                            windDirection={vesselState.getField("twd_true")?.value}
                        />
                        <FollowBoatControl boatPosition={boatPosition} />
                    </Map>
                )) || <p className="fetching">Waiting for a valid vessel position...</p>}
            </APIProvider>
            <div style={{ padding: "20px" }}>
                <VesselTable vesselState={vesselState} />
                <div style={{ paddingLeft: "16px" }}>
                    <About />
                </div>
            </div>
        </div>
    );
}

export default App;
