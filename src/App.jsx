import React, {useState, useEffect} from 'react';
import './App.css';

import mqtt from 'mqtt';
import {getUpdateDicts, VesselState} from "./utilities.js";

import DataTable from 'react-data-table-component';

const tableColumns = [
    {
        name: 'Path',
        selector: row => row.key,
    },
    {
        name: 'Value',
        selector: row => row.value,
    },
    {
        name: 'Unit',
        selector: row => row.unit,
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

client.subscribe("signalk/+/navigation.position");
client.subscribe("signalk/+/navigation.speedOverGround")
client.subscribe("signalk/+/navigation.courseOverGroundTrue")
client.subscribe("signalk/+/environment.depth.belowTransducer")
client.subscribe("signalk/+/environment.water.temperature")

function App() {
    // Sets default React state
    const [vesselState, setVesselState] = useState(new VesselState());
    useEffect(() => {
        if (client) {
            client.on('message', function (topic, message) {
                const updateDicts = getUpdateDicts(JSON.parse(message.toString()));
                vesselState.mergeUpdates(updateDicts)
                setVesselState(new VesselState(vesselState.state));
            })
        }
    }, [client]);


    return (
        <div className="App">
            <header className="App-header">
                <div className="table-style">
                    <DataTable
                        data={Object.values(vesselState.state)}
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
