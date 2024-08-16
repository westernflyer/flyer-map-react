import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";

import mqtt from "mqtt";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import DataTable from "react-data-table-component";

import { getUpdateDicts, VesselState, FormattedState } from "./utilities.js";
import { signalKUnits } from "./units.js";

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

let client = mqtt.connect("ws://localhost:8080", {
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000),
});

// Subscribe to all the topics we know about
Object.keys(signalKUnits).forEach((key) => {
    client.subscribe("signalk/+/" + key);
});

function VesselTable() {
    // Sets default React state
    const [vesselState, setVesselState] = useState(new VesselState());
    const [formattedState, setFormattedState] = useState(new FormattedState());
    useEffect(() => {
        if (client) {
            client.on("message", function (topic, message) {
                const updateDicts = getUpdateDicts(
                    JSON.parse(message.toString()),
                );
                vesselState.mergeUpdates(updateDicts);
                setVesselState(new VesselState(vesselState));
                formattedState.mergeUpdates(updateDicts);
                setFormattedState(new FormattedState(formattedState));
            });
        }
    }, [client]);

    return (
        <DataTable
            data={Object.values(formattedState)}
            columns={tableColumns}
            title={"Current values"}
            responsive
        />
    );
}

const App = () => (
    <div style={{ height: "400px", width: "100%", padding: "50px" }}>
        <header className="entry-header">
            <h1 className="entry-title">Where is Flyer?</h1>
        </header>
        <StrictMode>
            <APIProvider
                apiKey={"AIzaSyBylqNRwGbPrkbK8oh6E9y_fzyNaZumyRs"}
                onLoad={() => console.log("Maps API has loaded.")}
            >
                <Map
                    defaultZoom={10}
                    defaultCenter={{lat: 36.8, lng: -121.9}}
                    mapId="DEMO_MAP_ID"
                >
                    <AdvancedMarker
                        key={"flyer"}
                        position={null}
                    />
                </Map>
            </APIProvider>
            <div style={{ padding: "20px" }}>
                <VesselTable />
            </div>
        </StrictMode>
    </div>
);

const root = createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
