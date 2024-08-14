import React, {useState, useEffect} from 'react';
import './App.css';

import mqtt from 'mqtt';
import {getUpdateDicts, VesselState} from "./utilities.js";

import {Table} from "antd";

const tableColumns = [
    {
        title: 'Path',
        dataIndex: 'key',
    },
    {
        title: 'Value',
        dataIndex: 'value',
    },
    {
        title: 'Unit',
        dataIndex: 'unit',
    },
    {
        title: 'Last update',
        dataIndex: 'last_update',
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
                <h1>Western Flyer info</h1>
                <Table
                    dataSource={Object.values(vesselState.state)}
                    columns={tableColumns}
                    pagination={false}/>
            </header>
        </div>
    );

}

export default App;
