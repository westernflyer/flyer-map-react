/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import PropTypes from "prop-types";

import { markerOptions } from "../flyer.config.js";
import { getPixelDistance, latLngAtBearing } from "./utilities";

/**
 * Component that displays a line for COG/SOG.
 *
 * @param {object} props
 * @param {google.maps.LatLng | google.maps.LatLngLiteral} props.boatPosition - Boat position
 * @param {number} props.cog - The course over ground in radians. 0=N, pi/180=E, etc.
 * @param {number} props.sog - The speed over ground in meters/second
 * @param {number} [props.duration] - The line will extend this many seconds in the
 *   future. Default is 600 (10 minutes).
 * @returns {JSX.Element} - An InfoWindow located at the end of the COG line that will be shown on mouseover
 */
export const COGLine = (props) => {
    const { boatPosition, cog, sog } = props;
    // Provide a default duration of 10 minutes
    const duration = props.duration || 600;

    const [pixelDistance, setPixelDistance] = useState(null);
    const [projection, setProjection] = useState(null);
    const [zoom, setZoom] = useState(0);

    // Retrieve the map instance
    const map = useMap();

    // Add a listener for when the zoom changes. This speeds up the
    // repositioning of the COG line when zooming in and out.
    useEffect(() => {
        map.addListener("zoom_changed", () => {
            setZoom(map.getZoom());
        });
    }, [map]);

    useEffect(() => {
        setProjection(map.getProjection());
        setZoom(map.getZoom());
        const scale = zoom ? Math.pow(2, zoom) : null;
        // Make sure we have all the data we need
        if (map && projection && boatPosition && cog != null && sog != null && zoom != null && scale != null) {
            // Calculate how far the boat will go in duration seconds
            const distance_meters = sog * duration;
            // Calculate where the boat will end up at that time
            const endBoatPosition = latLngAtBearing(boatPosition, distance_meters, cog);
            // Calculate its pixel distance
            setPixelDistance(getPixelDistance(scale, projection, boatPosition, endBoatPosition));
        }
    }, [map, projection, zoom, boatPosition, cog, sog, duration]);

    return (
        <>
            {pixelDistance != null && pixelDistance >= markerOptions.minCOGLength &&
                <div style={{
                    // Make sure we rotate around the base of line.
                    transformOrigin: "center bottom",
                    transform: "rotate(" + cog + "rad)",
                }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10" height={pixelDistance + 10}
                        stroke="purple"
                        fill="none">
                        <line x1="5" y1={pixelDistance + 10} x2="5" y2={10} />
                        <circle cx="5" cy="10" r="2" />
                    </svg>
                </div>
            }
        </>
    );
};

COGLine.propTypes = {
    boatPosition: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
    }),
    cog: PropTypes.number,
    sog: PropTypes.number,
    duration: PropTypes.number,
};
