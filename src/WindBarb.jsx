/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

const WIDTH = 40;       // The width of the SVG element box
const HEIGHT = 80;      // Its height
const SPACE = 10;       // The space along the shaft between barbs
const FULLBARB = 14;    // The delta-x and delta-y of a full barb
const TOPMARGIN = 20;   // The distance from the top of the box to the top of the barb
/**
 * Component that generates a wind barb as an SVG element. It will be vertically
 * oriented with the base of the shaft down, and the barbs up (as if indicating
 * a northern wind).
 *
 * @param {object} props
 * @param {number} props.windSpeed - The wind speed in knots
 * @returns {JSXElement}
 */
const SVGWindBarb = (props) => {
    const { windSpeed } = props;

    let remainingSpeed = windSpeed;

    let svgParts = [];

    // Draw the shaft. It will be a vertical line, 80 units long, running from
    // y=20 at the top, to y=100 at the bottom. It will be centered at x=20 in
    // the box.
    svgParts.push(`<line x1=${WIDTH / 2} y1=${TOPMARGIN} x2=${WIDTH / 2} y2=${HEIGHT} />`);

    // Start at the top of the shaft
    let yPos = TOPMARGIN;

    // Wind speeds between 3 and 8 kn traditionally have a little space between
    // the end of the shaft and the barb, so move down a bit.
    if (remainingSpeed >= 3 && remainingSpeed < 8)
        yPos += SPACE / 2;

    function addPennant() {
        // Use a closed path to draw a pennant
        svgParts.push(`<path d="M${WIDTH / 2} ${yPos} v ${-FULLBARB} h ${FULLBARB}z"/>`);
        yPos += SPACE;
    }

    function addBarb(length) {
        svgParts.push(`<line x1=${WIDTH / 2} y1="${yPos}" x2="${WIDTH / 2 + length}" y2="${yPos - length}"/>`);
        yPos += SPACE;
    }

    while (remainingSpeed >= 48) {
        addPennant();
        remainingSpeed -= 50;
    }
    while (remainingSpeed >= 8) {
        addBarb(FULLBARB);
        remainingSpeed -= 10;
    }
    if (remainingSpeed >= 3) {
        addBarb(FULLBARB / 2);
    }

    const svgStmt = `<svg
                xmlns="http://www.w3.org/2000/svg"
                width="${WIDTH}" height="${HEIGHT}"
                stroke="black"
                fill="black">
                ${svgParts.join(" ")}
            </svg>`;

    return (
        <div
            // Despite the scary name, this function is perfectly safe in this
            // context because we control its input parameter.
            dangerouslySetInnerHTML={{ __html: svgStmt }}
        />
    );
};

SVGWindBarb.propTypes = {
    windSpeed: PropTypes.number,
};

/**
 * Component that generates a properly rotated wind barb
 *
 * @param {object} props
 * @param {number} props.windSpeed - Wind speed in knots
 * @param {number} props.windDirection - Wind direction in degrees. 0=N, 90=E, etc.
 * @returns {JSX.Element} - An SVG with a wind barb
 * @constructor
 */
export const WindBarb = (props) => {
    const { windSpeed, windDirection } = props;

    return (
        <>
            {windSpeed && windDirection != null &&
                <div style={{
                    // Make sure we rotate around the base of the shaft.
                    transformOrigin: "center bottom",
                    transform: "rotate(" + windDirection + "deg)",
                }}>
                    <SVGWindBarb windSpeed={windSpeed} />
                </div>
            }
        </>
    );
};

WindBarb.propTypes = {
    windSpeed: PropTypes.number,
    windDirection: PropTypes.number,
};
