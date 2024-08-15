import React, {useState, useEffect} from 'react';
import './App.css';

import mqtt from 'mqtt';
import {getUpdateDicts, VesselState, FormattedState} from "./utilities.js";
import { signalKUnits} from "./units.js";

import DataTable from 'react-data-table-component';

const tableColumns = [
    {
        name: 'Path',
        selector: row => row.key,
    },
    {
        name: 'Property',
        selector: row => row.label,
    },
    {
        name: 'Value',
        selector: row => row.value,
    },
    {
        name: 'Last update',
        selector: row => row.last_update,
    },
]

let client = mqtt.connect(
    'ws://localhost:8080',
    {clientId: "flyer-client-" + Math.floor(Math.random() * 10000)}
);

// Subscribe to all the topics we know about
Object.keys(signalKUnits).forEach(key => {
    client.subscribe("signalk/+/" + key)
})

function App() {
    // Sets default React state
    const [vesselState, setVesselState] = useState(new VesselState());
    const [formattedState, setFormattedState] = useState(new FormattedState());
    useEffect(() => {
        if (client) {
            client.on('message', function (topic, message) {
                const updateDicts = getUpdateDicts(JSON.parse(message.toString()));
                vesselState.mergeUpdates(updateDicts)
                setVesselState(new VesselState(vesselState));
                formattedState.mergeUpdates(updateDicts);
                setFormattedState(new FormattedState(formattedState));
            })
        }
    }, [client]);


    return (
        <div className="App">
            <header className="App-header">
                <div className="table-style">
                    <DataTable
                        data={Object.values(formattedState)}
                        columns={tableColumns}
                        title={"Current values"}
                        responsive
                    />
                </div>
            </header>
        </div>
    );

}

export default App;
