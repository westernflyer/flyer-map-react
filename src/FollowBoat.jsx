/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import { MapControl, ControlPosition, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

/**
 * Creates a control that recenters the map to follow the boat as it moves
 *
 * @param {object} props
 * @param {google.maps.LatLng | google.maps.LatLngLiteral | null} props.boatPosition - Boat position
 * @param {boolean} props.followBoat - Whether to follow the boat
 * @param {function} props.setFollowBoat - Function to set follow boat mode
 */
export function FollowBoatControl(props) {
    const { boatPosition, followBoat, setFollowBoat } = props;

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
        if (!map) return;
        const listener = map.addListener("dragend", () => setFollowBoat(false));
        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [map, setFollowBoat]);

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
    followBoat: PropTypes.bool.isRequired,
    setFollowBoat: PropTypes.func.isRequired,
};
