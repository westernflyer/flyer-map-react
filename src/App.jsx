/*
    Based on the article https://www.preciouschicken.com/blog/posts/a-taste-of-mqtt-in-react/
 */
import React, { useState, Fragment } from 'react';
import './App.css';

import mqtt from 'mqtt';
let options = {
    // clientId uniquely identifies client
    // choose any string you wish
    clientId: 'b0908853'
};
let client  = mqtt.connect('ws://localhost:8080', options);

// preciouschicken.com is the MQTT topic
client.subscribe('preciouschicken.com');

function App() {
    let note;
    client.on('message', function (topic, message) {
        note = message.toString();
        // Updates React state with message
        setMesg(note);
        console.log(note);
    });

    // Sets default React state
    const [mesg, setMesg] = useState(<Fragment><em>nothing heard</em></Fragment>);

    return (
        <div className="App">
            <header className="App-header">
                <h1>A taste of MQTT in React</h1>
                <p>The message is: {mesg}</p>
                <p>
                    <a href="https://www.preciouschicken.com/blog/posts/a-taste-of-mqtt-in-react/"
                       style={{
                           color: 'white'
                       }}>preciouschicken.com/blog/posts/a-taste-of-mqtt-in-react/</a>
                </p>
            </header>
        </div>
    );
}

export default App;
