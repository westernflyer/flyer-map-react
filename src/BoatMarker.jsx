/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

import "./App.css";
import { COGLine } from "./COGLine";
import { WindBarb } from "./WindBarb.jsx";


/**
 * React function component to show a marker for the boat position,
 * heading, COG, and true wind.
 *
 * @param {object} props
 * @param {google.maps.LatLng | google.maps.LatLngLiteral | null} props.boatPosition - Boat position
 * @param {number} props.heading - The boat heading in degrees. 0=N, 90=E, etc
 * @param {number} props.cog - The boat's course-over-ground in degrees.
 * @param {number} props.sog - The boat's speed-over-ground in knots.
 * @param {number} props.windSpeed - True wind speed in knots
 * @param {number} props.windDirection - True wind direction in degrees. 0=N
 */
export const BoatMarker = (props) => {
    const {
        boatPosition, heading, cog, sog,
        windSpeed, windDirection,
    } = props;
    return (
        <>
            <AdvancedMarker
                key="flyer-position"
                position={boatPosition}
                title="Western Flyer position"
            >
                <div style={{
                    transform: "translate(0px,25px) rotate(" + heading + "deg)",
                }}>
                    <img src={"/flyer-map2/western flyer.svg"}
                         alt="Boat position" />
                </div>
            </AdvancedMarker>
            <AdvancedMarker
                key="flyer-cog"
                position={boatPosition}
                title="Western Flyer COG"
            >
                <COGLine
                    boatPosition={boatPosition}
                    cog={cog}
                    sog={sog}
                />
            </AdvancedMarker>
            <AdvancedMarker
                key="flyer-wind"
                position={boatPosition}
                title="True wind at Western Flyer"
            >
                <WindBarb
                    windSpeed={windSpeed}
                    windDirection={windDirection}
                />
            </AdvancedMarker>
        </>
    )
        ;
};

BoatMarker.propTypes = {
    boatPosition: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
    }),
    heading: PropTypes.number,
    cog: PropTypes.number,
    sog: PropTypes.number,
    windSpeed: PropTypes.number,
    windDirection: PropTypes.number,
};
