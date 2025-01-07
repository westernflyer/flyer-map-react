/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import { MapControl, ControlPosition, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

/**
 * Creates a control that recenters the map to follow the boat as it moves
 *
 * @param {object} props
 * @param {google.maps.LatLng | google.maps.LatLngLiteral | null} props.boatPosition - Boat position
 */
export function FollowBoatControl(props) {
    const { boatPosition } = props;
    // Start out following the boat:
    const [followBoat, setFollowBoat] = useState(true);

    // Retrieve the map instance
    const map = useMap();

    // If in "follow" mode, automatically recenter the map on the boat
    useEffect(() => {
        if (followBoat && map && boatPosition) {
            map.setCenter(boatPosition);
        }
    }, [followBoat, map, boatPosition]);

    // Add a listener for when the map is dragged. That means the user does
    // not want to follow the boat.
    useEffect(() => {
        map.addListener("dragend",
            () => setFollowBoat(false));
    }, [map]);

    return (
        <MapControl position={ControlPosition.TOP_LEFT}>
            <button
                style={{ marginTop: "20px" }}
                onClick={() => setFollowBoat(!followBoat)}
            >
                {followBoat ? "Stop following" : "Follow boat"}
            </button>
        </MapControl>
    );

}

FollowBoatControl.propTypes = {
    boatPosition: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
    }),
};
