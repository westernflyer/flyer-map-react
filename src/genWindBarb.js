/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { conversionDict } from "./units.js";

const WIDTH = 40;       // The width of the SVG element
const HEIGHT = 80;      // Its height
const SPACE = 16;       // The space along the shaft between barbsx
const FULLBARB = 14;    // The delta-x and delta-y of a full barb

/**
 * Generate a wind barb as an SVG element
 *
 * @param {number} windSpeed - The wind speed in meters per second
 * @returns {string}
 */
export function genWindBarb(windSpeed) {
    // Convert from m/s to knots
    let remainingSpeed = conversionDict["meter_per_second"]["knot"](windSpeed);

    let svgParts = [];

    // Draw the shaft. It will be 80 units long.
    svgParts.push("<line x1=\"20\" y1=\"20\" x2=\"20\" y2=\"100\"/>");

    // Start at the top of the shaft
    let yPos = 20;

    // Wind speeds between 5 and 10 kn traditionally have a little space between
    // the end of the shaft and the barb.
    if (remainingSpeed >= 5 && remainingSpeed < 10)
        yPos += SPACE / 2;

    function addPennant() {
        // Use a closed path to draw a pennant
        svgParts.push(`<path d="M20 ${yPos} v ${-FULLBARB} h ${FULLBARB}z"/>`);
        yPos += SPACE;
    }

    function addBarb(length) {
        svgParts.push(`<line x1="20" y1="${yPos}" x2="${20 + length}" y2="${yPos - length}"/>`);
        yPos += SPACE;
    }

    while (remainingSpeed >= 50) {
        addPennant();
        remainingSpeed -= 50;
    }
    while (remainingSpeed >= 10) {
        addBarb(FULLBARB);
        remainingSpeed -= 10;
    }
    if (remainingSpeed >= 5) {
        addBarb(FULLBARB / 2);
    }

    return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="${WIDTH}" height="${HEIGHT}"
    stroke="black"
    fill="black">
    ${svgParts.join(" ")}
</svg>`;
}
