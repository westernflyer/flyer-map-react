/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import {genWindBarb} from "./genWindBarb";


/**
 * Component that generates a wind barb
 *
 * @param {object} props
 * @param {number} props.windSpeed - Wind speed in m/s
 * @param {number} props.windDirection - Wind direction in radians. 0=N
 * @returns {JSX.Element}
 * @constructor
 */
export const WindBarb = (props) => {
    const { windSpeed, windDirection } = props;

    return (
        <div
            style={{
                transform: "rotate(" + windDirection + "rad)",
            }}
        >
            {windSpeed && windDirection &&
                <div
                    dangerouslySetInnerHTML={{ __html: genWindBarb(windSpeed) }}
                />
            }
        </div>
    );
};

WindBarb.propTypes = {
    windSpeed: PropTypes.number,
    windDirection: PropTypes.number,
};
