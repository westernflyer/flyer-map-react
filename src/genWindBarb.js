/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { conversionDict } from "./units.js";

const WIDTH = 40;
const HEIGHT = 80;
const SPACE = 16;
const FULLBARB = 14;

export function genWindBarb(windSpeed) {
    // Convert from m/s to knots
    let remainingSpeed = conversionDict["meter_per_second"]["knot"](windSpeed);

    let svgString = `M ${WIDTH / 2} ${HEIGHT} v ${20 - HEIGHT}`;

    // Wind speeds between 5 and 10 kn traditionally have a little space between
    // the end of the shaft and the barb.
    if (remainingSpeed>=5 && remainingSpeed<10)
        svgString += ` m 0 ${SPACE/2}`

    function addPennant() {

    }

    function addBarb(length) {
        svgString += ` l ${length} ${-length} m ${-length} ${length} m 0 ${SPACE}`
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
        addBarb(FULLBARB/2);
    }

    // Return to the beginning of the shaft
    svgString += ` V ${HEIGHT}`

    return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="${WIDTH}" height="${HEIGHT}"
    stroke="black"
    fill="none">
    <path d="${svgString}"/>
</svg>`;
}

console.log(genWindBarb(10))
