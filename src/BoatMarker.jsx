/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from "react";
import PropTypes from "prop-types";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

import { latLngAtBearing } from "./utilities";
import "./App.css";

/**
 * Component that displays a line for COG/SOG.
 *
 * @param {object} props
 * @param {{lat:number, lng:number}} props.latLng - The latitude/longitude of the boat
 * @param {number} props.cog - The course over ground. 0=N, 90=E, etc.
 * @param {number} props.sog - The speed over ground in knots
 * @param {number} [props.duration] - The line will extend this many seconds in the
 *   future. Default is 600 (10 minutes).
 * @returns {JSX.Element} - The rendered JSX line.
 */
export const LineMarker = (props) => {
  let { latLng, cog, sog, duration } = props;

  duration = duration || 600;
  const map = useMap();

  useEffect(() => {
    if (!map || latLng == null || cog == null || sog == null) return;

    // Convert from nm to meters
    const distance_meters = sog * duration * 1852 / 3600;
    const endLatLng = latLngAtBearing(latLng, distance_meters, cog);
    const pathCoordinates = [latLng, endLatLng];
    console.log("pathCoordinates=", pathCoordinates, "; distance=", distance_meters, "; cog=", cog);

    const cogPath = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 1,
    });

    cogPath.setMap(map);
  }, [map, cog, duration, latLng, sog]);

  return <>...</>;
};

LineMarker.propTypes = {
  latLng: PropTypes.objectOf(PropTypes.number),
  cog: PropTypes.number,
  sog: PropTypes.number,
  duration: PropTypes.number,
};

// React function component to show a marker for the boat position and heading
export const BoatMarker = (props) => {
  const { latLng, heading } = props;
  return (
    <div>
      <AdvancedMarker
        key={"flyer"}
        position={latLng}
        title={"Western Flyer"}
        anchorPoint={"CENTER"}
      >
        <div
          style={{
            transform: "translate(9px,22px) rotate(" + heading + "rad)",
          }}
        >
          <img src="/flyer-map/red_boat.svg" alt="Boat position" />
        </div>
      </AdvancedMarker>
      <LineMarker latLng={latLng} cog={heading} sog={10}></LineMarker>
    </div>
  );
};

BoatMarker.propTypes = {
  latLng: PropTypes.objectOf(PropTypes.number),
  heading: PropTypes.number,
};
