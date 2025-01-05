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
 @param {object} props
 @param {{lat:number, lng:number}} props.latLng - The latitude/longitude of the boat
 */
export function FollowBoatControl(props) {
    const { latLng } = props;
    const [followBoat, setFollowBoat] = useState(false);

    // Toggle follow mode
    const toggleFollow = () => {
        setFollowBoat(!followBoat);
    };

    // Retrieve the map instance
    const map = useMap();

    // If in "follow" mode, automatically recenter the map on the boat
    useEffect(() => {
        if (followBoat && map && latLng) {
            map.setCenter(latLng);
        }
    }, [followBoat, map, latLng]);

    // Add a listener for when the map is dragged. That means the user does
    // not want to follow the boat.
    useEffect(() => {
        map.addListener("dragend",
            () => setFollowBoat(false));
    }, [map]);

    return (
        <MapControl position={ControlPosition.TOP_LEFT}>
            <button
                style={{
                    marginTop: "20px",
                }}
                onClick={toggleFollow}
            >
                {followBoat ? "Stop following" : "Follow boat"}
            </button>
        </MapControl>
    );

}

FollowBoatControl.propTypes = {
    latLng: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
    }).isRequired,
};
