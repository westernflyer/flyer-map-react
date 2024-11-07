/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from "react";
import PropTypes from "prop-types";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

import "./App.css";

export const LineMarker = (props) => {
  const { latLng, heading } = props;
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const flightPlanCoordinates = [
      { lat: 37.772, lng: -122.214 },
      { lat: 21.291, lng: -157.821 },
      { lat: -18.142, lng: 178.431 },
      { lat: -27.467, lng: 153.027 },
    ];
    const flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    flightPath.setMap(map);

  }, [map]);

  return <>...</>;
};

// React function component to show a marker for the boat position and heading
export const BoatMarker = (props) => {
  const { latLng, heading } = props;
  return (
    <div>
    <AdvancedMarker key={"flyer"}
                    position={latLng}
                    title={"Western Flyer"}
                    anchorPoint={"CENTER"}>
      <div
        style={{
          transform: "translate(9px,22px) rotate(" + heading + "rad)",
        }}
      >
        <img src="/flyer-map/red_boat.svg" alt="Boat position" />
      </div>
    </AdvancedMarker>
    <LineMarker></LineMarker>
    </div>
  );
}

BoatMarker.propTypes = {
  latLng: PropTypes.objectOf(PropTypes.number),
  heading: PropTypes.number,
};

