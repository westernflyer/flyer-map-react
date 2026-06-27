/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
    AdvancedMarker,
    InfoWindow,
    useAdvancedMarkerRef,
    useMap,
} from "@vis.gl/react-google-maps";
import { formatVesselState, orderArray } from "./utilities";
import { tableOptions } from "../flyer.config.js";

/**
 * React component to show the breadcrumb trail of the boat.
 *
 * @param {object} props
 * @param {Array<VesselState>} props.history - Array of historical vessel states
 * @param {function} props.setFollowBoat - Function to set follow boat mode
 */
export const Breadcrumbs = ({ history, setFollowBoat }) => {
    const [selectedState, setSelectedState] = useState(null);
    const path = useMemo(() => {
        return history
            .map((state) => ({
                lat: state.getField("latitude")?.value,
                lng: state.getField("longitude")?.value,
            }))
            .filter((pos) => pos.lat && pos.lng);
    }, [history]);

    return (
        <>
            <Polyline path={path} strokeColor="#4d7685" strokeOpacity={0.5} strokeWeight={2} />
            {history.map((state, index) => (
                <BreadcrumbMarker
                    key={index}
                    state={state}
                    isSelected={selectedState === state}
                    onSelect={() => {
                        setSelectedState(state);
                        setFollowBoat(false);
                    }}
                    onClose={() => setSelectedState(null)}
                />
            ))}
        </>
    );
};

const Polyline = ({
                      path,
                      strokeColor = "#4d7685",
                      strokeOpacity = 0.5,
                      strokeWeight = 2
                  }) => {
    const map = useMap();
    const [polyline, setPolyline] = useState(null);

    const options = useMemo(
        () => ({
            path,
            strokeColor,
            strokeOpacity,
            strokeWeight,
        }),
        [path, strokeColor, strokeOpacity, strokeWeight],
    );

    useEffect(() => {
        const g = typeof window !== "undefined" ? window.google : undefined;

        if (map && g?.maps?.Polyline && !polyline) {
            setPolyline(new g.maps.Polyline(options));
        }
    }, [map, polyline, options]);

    useEffect(() => {
        if (!polyline) return;
        polyline.setPath(path);
    }, [path, polyline]);

    useEffect(() => {
        if (!polyline) return;
        polyline.setOptions({
            strokeColor,
            strokeOpacity,
            strokeWeight,
        });
    }, [strokeColor, strokeOpacity, strokeWeight, polyline]);

    useEffect(() => {
        if (!polyline) return;
        polyline.setMap(map);
        return () => polyline.setMap(null);
    }, [map, polyline]);

    return null;
};

const BreadcrumbMarker = ({ state, isSelected, onSelect, onClose }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();

    const position = {
        lat: state.getField("latitude")?.value,
        lng: state.getField("longitude")?.value,
    };

    if (!position.lat || !position.lng) return null;

    // Format the contents so they can be used in the popup windows
    const formattedState = formatVesselState(state);

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                position={position}
                onClick={onSelect}
            >
                <div
                    style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#4d7685",
                        borderRadius: "50%",
                        border: "1px solid white",
                    }}
                />
            </AdvancedMarker>
            {isSelected && (
                <InfoWindow
                    anchor={marker}
                    onCloseClick={onClose}
                    disableAutoPan={false}
                >
                    <div>
                        <HistoricalConditions
                            formattedState={formattedState}
                            timestamp={state.timestamp}
                        />
                    </div>
                </InfoWindow>
            )}
        </>
    );
};

const HistoricalConditions = ({ formattedState, timestamp }) => {
    const data = orderArray(tableOptions.order, formattedState);
    return (
        <div style={{ fontSize: "12px", color: "#000" }}>
            <p style={{ margin: "0 0 5px 0" }}>
                <strong>Time:</strong> {timestamp?.format("YYYY-MM-DD HH:mm:ss")}
            </p>
            <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.dataFieldKey} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "2px 0" }}>{row.label}</td>
                            <td style={{ padding: "2px 0 2px 10px", textAlign: "right" }}>
                                {row.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

HistoricalConditions.propTypes = {
    formattedState: PropTypes.object.isRequired,
    timestamp: PropTypes.object.isRequired,
};

Breadcrumbs.propTypes = {
    history: PropTypes.array.isRequired,
    setFollowBoat: PropTypes.func.isRequired,
};

BreadcrumbMarker.propTypes = {
    state: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

Polyline.propTypes = {
    path: PropTypes.arrayOf(
        PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        }),
    ).isRequired,

    strokeColor: PropTypes.string,
    strokeOpacity: PropTypes.number,
    strokeWeight: PropTypes.number,
};
