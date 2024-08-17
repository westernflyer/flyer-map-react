/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import mqtt from "mqtt";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import DataTable from "react-data-table-component";
import PropTypes from "prop-types";

import { getUpdateDicts, VesselState, FormattedState } from "./utilities.js";
import { signalKUnits } from "./units.js";
import { google_key } from "./google-api-key.js";

const brokerUrl = "ws://localhost:8080";

const tableColumns = [
    {
        name: "Path",
        selector: (row) => row.key,
    },
    {
        name: "Property",
        selector: (row) => row.label,
    },
    {
        name: "Value",
        selector: (row) => row.value,
    },
    {
        name: "Last update",
        selector: (row) => row.last_update,
    },
];

// React function component to show a table of current values.
function VesselTable(props) {
    const { formattedState } = props;
    return (
        <DataTable
            data={Object.values(formattedState)}
            columns={tableColumns}
            title={"Current values"}
            responsive
        />
    );
}

VesselTable.propTypes = {
    formattedState: PropTypes.array,
};

function App() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // vesselState holds the current values. They are unformatted.
    const [vesselState, setVesselState] = useState(new VesselState());
    // formattedState holds the current values. They are all formattedstrings.
    const [formattedState, setFormattedState] = useState(new FormattedState());

    // Because this app relies on an external connection to the MQTT broker,
    // internal state must be synchronized in a 'useEffect" function.
    useEffect(() => {
        // Connect to the broker.
        const client = mqtt.connect(brokerUrl, {
            clientId: "flyer-client-" + Math.floor(Math.random() * 10000),
        });
        setClient(client);

        // Subscribe to all the topics we know about
        Object.keys(signalKUnits).forEach((key) => {
            const topic = "signalk/+/" + key;
            client.subscribe(topic);
            console.log("Subscribed to topic", topic);
        });

        // Return a function that will get called when it's time to cleanup.
        return () => {
            client.end();
            setClient(null);
        };
    }, []);

    // This useEffect() is used to synchronize between an arrival of a message
    // and the internal state.
    useEffect(() => {
        if (client) {
            client.on("message", function (topic, message) {
                const updateDicts = getUpdateDicts(
                    JSON.parse(message.toString()),
                );
                setVesselState(
                    (v) => new VesselState(v.mergeUpdates(updateDicts)),
                );
                setFormattedState(
                    (f) => new FormattedState(f.mergeUpdates(updateDicts)),
                );
            });
        }
    }, [client]);

    const lat = vesselState["navigation.position.latitude"]?.value || 36.8;
    const lng = vesselState["navigation.position.longitude"]?.value || -121.9;

    return (
        <div style={{ height: "400px", width: "100%", padding: "50px" }}>
            <header className="entry-header">
                <h1 className="entry-title">Where is Flyer?</h1>
            </header>
            <StrictMode>
                <APIProvider
                    apiKey={`${google_key}`}
                    onLoad={() => console.log("Maps API has loaded.")}
                >
                    <Map
                        defaultZoom={10}
                        defaultCenter={{ lat: 36.8, lng: -121.9 }}
                        center={{ lat: lat, lng: lng }}
                        mapId="DEMO_MAP_ID"
                    >
                        <AdvancedMarker
                            key={"flyer"}
                            position={{ lat: lat, lng: lng }}
                        />
                    </Map>
                </APIProvider>
                <div style={{ padding: "20px" }}>
                    <VesselTable formattedState={formattedState} />
                </div>
            </StrictMode>
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
