/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "./App.css";

const MapGuide = () => {
    return (
        <>
            <h2>Map guide</h2>
            <img src={"/flyer-map2/boat sample.png"}
                 style={{float: "right"}}
                 width="155"
                 height="173"
                 alt="Image interpreting boat icon" />
            <p>
                The black line is a <a href={"https://www.weather.gov/hfo/windbarbinfo"}>wind
                barb</a> that shows the wind direction and speed. It
                points&nbsp;<i>from</i>&nbsp;the direction of the wind. The
                purple line with the small circle on the end is the course over
                ground. Its length represents how far the boat will travel in 10
                minutes. Finally, the boat is oriented along the
                boat&apos;s&nbsp;<i>heading</i>. Putting it all together, in
                the image to the right, the boat is heading southwest, the wind is
                between 8 and 12 knots from the west, and the course over ground
                is south.
            </p>
        </>
    );
};

export const About = () => {
    return (
        <div className="about">
            <MapGuide />
            <h2 style={{clear:"right"}}>About</h2>
            <p>
                Data originates on an NMEA 2000 network, flows through a{" "}
                <a
                    href={
                        "https://actisense.com/products/pro-ndc-1e2k/"
                    }
                >
                    Actisense PRO-NDC-1E2K gateway
                </a>
                , then to a <a href={"https://signalk.org/"}>SignalK
                server</a> running
                on a low-powered Linux server. From there, updates are published
                to an{" "}
                <a href={"https://mqtt.org/"}>MQTT broker</a>. The client
                browser
                receives the updates from the broker via a websocket connection.
            </p>
            <p>
                The Google Maps and &ldquo;Current Values&rdquo; table are
                updated using&nbsp;
                <a href={"https://react.dev/"}>React</a>.
            </p>
            <p>
                The source code can be found in the{" "}
                <a href={"https://github.com/tkeffer/flyer-map-react"}>
                    <span className={"tty"}>flyer-map-react</span>
                </a>{" "}
                repository.
            </p>
        </div>
    );
};
