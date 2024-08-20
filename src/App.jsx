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
import { mqttOptions } from "./config.js";

const tableColumns = [
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
    {
        name: "SignalK path",
        selector: (row) => row.key,
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
    formattedState: PropTypes.object,
};

function App() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // vesselState holds the current values. They are unformatted.
    const [vesselState, setVesselState] = useState(new VesselState());
    // formattedState holds the current values. They are all formattedstrings.
    const [formattedState, setFormattedState] = useState(new FormattedState());
    // latLng holds the current vessel position, or null if it has not been established yet.
    const [latLng, setLatLng] = useState(null);

    // Because this app relies on an external connection to the MQTT broker,
    // internal state must be synchronized in a 'useEffect" function.
    useEffect(() => {
        // Connect to the broker.
        const client = mqtt.connect(mqttOptions.brokerUrl, {
            clientId: mqttOptions.clientId,
            username: mqttOptions.username,
            password: mqttOptions.password,
        });
        setClient(client);
        console.log("Connected to broker as client", mqttOptions.clientId);

        // Subscribe to all the topics we know about
        Object.keys(signalKUnits).forEach((key) => {
            const topic = `signalk/${mqttOptions.vesselId}/${key}`;
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

    // If we don't have a vessel position yet, and vesselState has a valid
    // position, then save and use it.
    if (!latLng && vesselState["navigation.position.latitude"] != null) {
        setLatLng({
            lat: vesselState["navigation.position.latitude"].value,
            lng: vesselState["navigation.position.longitude"].value,
        });
    }

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
                    {(latLng && (
                        <Map
                            defaultZoom={10}
                            defaultCenter={latLng}
                            mapId="DEMO_MAP_ID"
                        >
                            <AdvancedMarker
                                key={"flyer"}
                                position={latLng}
                                title={"Western Flyer"}
                            />
                        </Map>
                    )) || (
                        <p className="fetching">
                            Waiting for a valid vessel position...
                        </p>
                    )}
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
