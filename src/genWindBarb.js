/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { conversionDict } from "./units";

export function genWindBarb(windSpeed) {
    // Convert from m/s to knots
    windSpeed = conversionDict["meter_per_second"]["knot"](windSpeed);

    let fullBarbs = Math.floor(windSpeed / 10);
    let halfBarbs = Math.floor((windSpeed % 10) / 5);
    let pennants = Math.floor(windSpeed / 50);

    let svgParts = [];
    let yPosition = 10;

    // Draw the staff
    svgParts.push(`<line x1="10" y1="10" x2="10" y2="${pennants * 10 + fullBarbs * 10 + halfBarbs * 5 + 50}" stroke="black" stroke-width="1"/>`);

    // Draw pennants
    for (let i = 0; i < pennants; i++) {
        svgParts.push(`<polygon points="10,${yPosition} 20,${yPosition} 10,${yPosition + 10}" fill="black"/>`);
        yPosition += 12;
    }

    // Draw full barbs
    for (let i = 0; i < fullBarbs; i++) {
        svgParts.push(`<line x1="10" y1="${yPosition}" x2="25" y2="${yPosition - 5}" stroke="black" stroke-width="1"/>`);
        yPosition += 12;
    }

    // Draw half barbs
    if (halfBarbs > 0) {
        svgParts.push(`<line x1="10" y1="${yPosition}" x2="17.5" y2="${yPosition - 2.5}" stroke="black" stroke-width="1"/>`);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="${pennants * 10 + fullBarbs * 10 + halfBarbs * 5 + 20 + 20}">` + svgParts.join("") + `</svg>`;
}
