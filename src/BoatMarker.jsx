/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

import "./App.css";

// React function component to show a marker for the boat position and heading
export const BoatMarker = (props) => {
  const { latLng, heading } = props;
  return (
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
  );
}

BoatMarker.propTypes = {
  latLng: PropTypes.objectOf(PropTypes.number),
  heading: PropTypes.number,
};
