/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StrictMode, useEffect, useState } from "react";
import mqtt from "mqtt";
import { createRoot } from "react-dom/client";
import { mqttOptions } from "../flyer.config.js";
import "./App.css";

function Status() {
    // client is the MQTT connection.
    const [client, setClient] = useState(null);
    // Current status
    const [status, setStatus] = useState("");

    // Because this app relies on an external connection to the MQTT broker,
    // internal state must be synchronized in a "useEffect" function. Set up
    // the connection and subscriptions.
    useEffect(() => {
        // Connect to the broker.
        const client = mqtt.connect(mqttOptions.brokerUrl,
            {
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

        // Subscribe to status
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
        // Explicitly list no dependencies. This will cause this "useEffect()"
        // to be run only once.
    }, []);

    // This useEffect() is used to synchronize between an arrival of a message
    // and the internal state.
    useEffect(() => {
        if (client) {
            client.on("message", function(topic, message) {
                if (topic === "status") {
                    setStatus(message.toString());
                }
            });
            client.on("error", (err) => console.error(err));
        }
        // Setting 'client' as the sole dependency ensures that the function only
        // gets called when client changes. That is, on initial establishment of
        // the client connection. Otherwise, new handlers would get established on
        // every refresh.
    }, [client]);

    // This is fired when the form is submitted
    function handleStatusUpdate(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const formData = new FormData(event.target);
        const newStatus = formData.get("new_status");
        const c = mqtt.connect(mqttOptions.brokerUrl, {
            clientId: mqttOptions.clientId + "-status",
            username: formData.get("uname").trim(),
            password: formData.get("pword").trim(),
        });
        c.publish("status", newStatus, { retain: true }, () => c.end());
    }

    return (
        <div>
            <h1>Change the status line</h1>

            <p><strong><em>Present status:</em></strong></p>
            <p className="status-line">{status}</p>

            <form onSubmit={handleStatusUpdate}>
                <p><strong><em><label htmlFor="new_status">New
                    status: </label></em></strong></p>
                <textarea className="status-line" id="new_status"
                          name="new_status" rows={5} cols={80}
                          defaultValue={status} autoFocus />
                <p>Only pure text is accepted: no HTML. Any newlines will be
                    ignored.</p>
                <label htmlFor="uname">Username: </label>
                <input type="text" id="uname" name="uname" maxLength={30}
                       required /><br /><br />
                <label htmlFor="pword">Password: </label>
                <input type="text" id="pword" name="pword" maxLength={30}
                       required /><br /><br />
                <button type="submit">Submit</button>
            </form>
        </div>);
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Status />
    </StrictMode>,
);
