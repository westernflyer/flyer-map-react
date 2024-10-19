/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from "react";
import Fader from "react-fader";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import mqtt from "mqtt";

import {
  VesselState,
  FormattedState,
  getUpdateDicts,
  getLatLng,
  orderArray,
} from "./utilities.js";
import { About } from "./About";
import { signalKUnits } from "./units.js";
import { google_key } from "./google-api-key.js";
import { mqttOptions, tableOptions } from "../flyer.config.js";
import "./App.css";

const tableColumns = [
  {
    name: "Property",
    selector: (row) => row.label,
  },
  {
    name: "Value",
    selector: (row) => <Fader>{row.value}</Fader>,
  },
  {
    name: "Last update",
    selector: (row) => <Fader>{row.last_update}</Fader>,
  },
  {
    name: "SignalK path",
    selector: (row) => <span className={"tty"}>{row.key}</span>,
  },
];

// React function component to show a table of current values.
function VesselTable(props) {
  const { formattedState } = props;
  return (
    <DataTable
      data={orderArray(tableOptions.order, formattedState)}
      columns={tableColumns}
      title={<h2> Current values</h2>}
      responsive
    />
  );
}

VesselTable.propTypes = {
  formattedState: PropTypes.objectOf(PropTypes.object),
};

// React function component to show a marker for the boat position and heading
function BoatMarker(props) {
  const { latLng, heading } = props;
  return (
    <AdvancedMarker key={"flyer"} position={latLng} title={"Western Flyer"}>
      <div
        style={{
          transform: "translate(9px,22px) rotate(" + heading + "rad)",
        }}
      >
        <img src="/flyer-map/red_boat.svg" alt="Boat position" />
      </div>
    </AdvancedMarker>
  );
}

BoatMarker.propTypes = {
  latLng: PropTypes.objectOf(PropTypes.number),
  heading: PropTypes.number,
};

function App() {
  // client is the MQTT connection.
  const [client, setClient] = useState(null);
  // vesselState holds the current values. They are unformatted.
  const [vesselState, setVesselState] = useState(new VesselState());
  // formattedState holds the current values as formatted strings.
  const [formattedState, setFormattedState] = useState(new FormattedState());

  // Because this app relies on an external connection to the MQTT broker,
  // internal state must be synchronized in a "useEffect" function.
  useEffect(() => {
    // Connect to the broker.
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

    // Subscribe to all the topics we know about
    Object.keys(signalKUnits).forEach((key) => {
      const topic = `signalk/${mqttOptions.vesselId}/${key}`;
      client.subscribe(topic);
      console.log("Subscribed to topic", topic);
    });

    // Return a function that will get called when it's time to clean up.
    return () => {
      if (client) {
        client.end(
          (err) => err && console.log("Error closing MQTT connection:", err),
        );
        setClient(null);
      }
    };
  }, []);

  // This useEffect() is used to synchronize between an arrival of a message
  // and the internal state.
  useEffect(() => {
    if (client) {
      client.on("message", function (topic, message) {
        const updateDicts = getUpdateDicts(JSON.parse(message.toString()));
        setVesselState((v) => new VesselState(v.mergeUpdates(updateDicts)));
        setFormattedState(
          (f) => new FormattedState(f.mergeUpdates(updateDicts)),
        );
      });
      client.on("error", (err) => console.error(err));
    }
    // Setting 'client' as the sole dependency ensures that the function only
    // gets called when client changes. That is, on initial establishment of
    // the client connection. Otherwise, new handlers would get established on
    // every refresh.
  }, [client]);

  // Use boat heading, but if it's not available, substitute COG
  let boatDir = vesselState["navigation.headingTrue"]?.value;
  if (boatDir == null)
    boatDir = vesselState["navigation.courseOverGroundTrue"]?.value;

  // latLng holds the current vessel position, or null if it has not been established yet.
  const latLng = getLatLng(vesselState);

  return (
    <div style={{ height: "400px", width: "100%", padding: "50px" }}>
      <header className="entry-header">
        <h1 className="entry-title">Where&apos;s the Flyer?</h1>
      </header>
      <APIProvider
        apiKey={`${google_key}`}
        onLoad={() => console.log("Maps API has loaded.")}
      >
        {(latLng && (
          <Map
            defaultZoom={10}
            defaultCenter={latLng}
            streetViewControl={false}
            mapId="DEMO_MAP_ID">
            <BoatMarker latLng={latLng} heading={boatDir} />
          </Map>
        )) || (
          <p className="fetching">Waiting for a valid vessel position...</p>
        )}
      </APIProvider>
      <p>No, the Flyer is not roaming around the Pacific! This is a simulation.</p>
      <div style={{ padding: "20px" }}>
        <VesselTable formattedState={formattedState} />
        <div style={{ paddingLeft: "16px" }}>
          <About />
        </div>
      </div>
    </div>
  );
}

export default App;
