/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import { genWindBarb } from "./genWindBarb";

/**
 * Component that generates a wind barb
 *
 * @param {object} props
 * @param {number} props.windSpeed - Wind speed in m/s
 * @param {number} props.windDirection - Wind direction in radians. 0=N
 * @returns {JSX.Element} - An SVG with a wind barb
 * @constructor
 */
export const WindBarb = (props) => {
    const { windSpeed, windDirection } = props;

    return (
        <>
            {windSpeed && windDirection &&
                <div style={{
                    // Make sure we rotate around the base of the shaft.
                    transformOrigin: "center bottom",
                    transform: "rotate(" + windDirection + "rad)",
                }}
                    // Despite the scary name, this function is perfectly safe
                    // because we control its input parameter.
                     dangerouslySetInnerHTML={{ __html: genWindBarb(windSpeed) }}
                />
            }
        </>
    );
};

WindBarb.propTypes = {
    windSpeed: PropTypes.number,
    windDirection: PropTypes.number,
};
