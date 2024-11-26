/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from "react";
import { InfoWindow, useMap } from "@vis.gl/react-google-maps";
import PropTypes from "prop-types";

import { latLngAtBearing } from "./utilities";
import { formatValue } from "./units";

/**
 * Component that displays a line for COG/SOG.
 *
 * @param {object} props
 * @param {{lat:number, lng:number}} props.boatPosition - The latitude/longitude of the boat
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

    // The polyline representing the COG vector
    const cogPathRef = useRef(null);
    // The lat/lon position at the end of the line.
    const [infoWindowPosition, setInfoWindowPosition] = useState({lat:null, lng:null});
    // Whether to show an InfoWindow at the end of the line
    const [showCogInfo, setShowCogInfo] = useState(false);

    // Retrieve the map instance
    const map = useMap();

    useEffect(() => {
        if (!cogPathRef.current && map) {
            const cogPath = new window.google.maps.Polyline({
                geodesic: true,
                strokeColor: "white",
                strokeOpacity: 1.0,
                strokeWeight: 1,
            });
            // Attach Polyline to the map
            cogPath.setMap(map);
            // Add listeners for mouseover and mouseout
            cogPath.addListener("mouseover", (e) => {
                setShowCogInfo(true);
                setInfoWindowPosition(e.latLng);
            });
            cogPath.addListener("mouseout", () => {
                setShowCogInfo(false);
            });
            cogPathRef.current = cogPath;
        }
    }, [map]);

    useEffect(() => {
        // Make sure we have all the data we need before setting the path
        if (map && boatPosition && cog != null && sog != null) {
            // Calculate how far the boat will go in duration seconds
            const distance_meters = sog * duration;
            // Calculate and save where the boat will end up in that time
            const endBoatPosition = latLngAtBearing(boatPosition, distance_meters, cog);
            // Construct coordinates out of the two points
            const lineCoordinates = [boatPosition, endBoatPosition];
            // Attach the coordinates to the polyline
            cogPathRef.current.setPath(lineCoordinates);
        }
    }, [map, boatPosition, cog, sog, duration]);

    return (
        <>
            {infoWindowPosition?.lat != null && showCogInfo &&
                <InfoWindow
                    position={infoWindowPosition}
                    headerContent={<h3>Course over ground</h3>}
                >
                    <p>The white line represents the distance the boat will
                        travel over the next {duration / 60} minutes.<br />
                        <br />
                        Speed and direction:&nbsp;
                        {formatValue(sog, "group_speed", "knot")}&nbsp;
                        at {formatValue(cog, "group_direction", "radian")}
                    </p>
                </InfoWindow>
            }
        </>
    );
};


COGLine.propTypes = {
    boatPosition: PropTypes.objectOf(PropTypes.number),
    cog: PropTypes.number,
    sog: PropTypes.number,
    duration: PropTypes.number,
};
