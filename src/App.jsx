import React, {useState, useEffect} from 'react';
import './App.css';

import mqtt from 'mqtt';
import {getUpdateDicts} from "./utilities.js";

import {Table} from "antd";

const tableColumns = [
    {
        title: 'Property',
        dataIndex: 'label',
        key: 'key'
    },
    {
        title: 'Last update',
        dataIndex: 'update_time',
        key: 'update_time',
    },
    {
        title: 'Value',
        dataIndex: 'value',
        key: 'update_time'
    },
    {
        title: 'Unit',
        dataIndex: 'unit',
        key: 'unit'
    }
]

let options = {
    // clientId uniquely identifies client
    clientId: "flyer-client-" + Math.floor(Math.random() * 10000)
};

let client = mqtt.connect('ws://localhost:8080', options);

client.subscribe("signalk/+/navigation.position");
client.subscribe("signalk/+/navigation.speedOverGround")
client.subscribe("signalk/+/navigation.courseOverGroundTrue")
client.subscribe("signalk/+/environment.depth.belowTransducer")
client.subscribe("signalk/+/environment.water.temperature")

function App() {
    // Sets default React state
    const [updates, setUpdates] = useState([]);
    useEffect(() => {
        if (client) {
            client.on('message', function (topic, message) {
                const updateDicts = getUpdateDicts(JSON.parse(message.toString()));
                setUpdates(updateDicts);
                console.log(updateDicts);
            })
        }
    }, [client]);


    return (
        <div className="App">
            <header className="App-header">
                <h1>Western Flyer info</h1>
                <Table dataSource={updates} columns={tableColumns} pagination={false}/>
            </header>
        </div>
    );

}

export default App;
