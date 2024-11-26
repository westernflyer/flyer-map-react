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


// React function component to show a marker for the boat position and heading
export const BoatMarker = (props) => {
    const { latLng, heading, cog, sog } = props;
    return (
        <div>
            <AdvancedMarker
                key={"flyer"}
                position={latLng}
                title={"Western Flyer"}
            >
                <div
                    style={{
                        transform: "translate(0px,25px) rotate(" + heading + "rad)",
                    }}
                >
                    <img src={"/flyer-map/red_boat.svg"}
                         alt="Boat position" />
                </div>
            </AdvancedMarker>
            <COGLine boatPosition={latLng} cog={cog} sog={sog}></COGLine>
        </div>
    );
};

BoatMarker.propTypes = {
    latLng: PropTypes.objectOf(PropTypes.number),
    heading: PropTypes.number,
    cog: PropTypes.number,
    sog: PropTypes.number,
};
