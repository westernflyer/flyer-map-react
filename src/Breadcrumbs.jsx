/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef, useMap } from "@vis.gl/react-google-maps";
import { FormattedState, orderArray } from "./utilities";
import { tableOptions } from "../flyer.config.js";

/**
 * React component to show the breadcrumb trail of the boat.
 * 
 * @param {object} props
 * @param {Array<VesselState>} props.history - Array of historical vessel states
 */
export const Breadcrumbs = ({ history }) => {
    const path = useMemo(() => {
        return history
            .map(state => ({
                lat: state["latitude"]?.value,
                lng: state["longitude"]?.value
            }))
            .filter(pos => pos.lat && pos.lng);
    }, [history]);

    return (
        <>
            <Polyline
                path={path}
                strokeColor="#4d7685"
                strokeOpacity={0.5}
                strokeWeight={2}
            />
            {history.map((state, index) => (
                <BreadcrumbMarker key={index} state={state} />
            ))}
        </>
    );
};

const Polyline = (props) => {
    const map = useMap();
    const [polyline, setPolyline] = useState(null);

    useEffect(() => {
        if (map && typeof google !== 'undefined' && !polyline) {
            setPolyline(new google.maps.Polyline(props));
        }
    }, [map, polyline, props]);

    useEffect(() => {
        if (!polyline) return;
        polyline.setPath(props.path);
    }, [props.path, polyline]);

    useEffect(() => {
        if (!polyline) return;
        const { path, ...options } = props;
        polyline.setOptions(options);
    }, [props, polyline]);

    useEffect(() => {
        if (!polyline) return;
        polyline.setMap(map);
        return () => polyline.setMap(null);
    }, [map, polyline]);

    return null;
};

const BreadcrumbMarker = ({ state }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const position = {
        lat: state["latitude"]?.value,
        lng: state["longitude"]?.value
    };

    if (!position.lat || !position.lng) return null;

    const formattedState = new FormattedState().mergeUpdates(Object.values(state).filter(v => v.key));

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setInfowindowOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setInfowindowOpen(false);
        }, 200);
    };

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                position={position}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4d7685',
                    borderRadius: '50%',
                    border: '1px solid white'
                }} />
            </AdvancedMarker>
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    onCloseClick={() => setInfowindowOpen(false)}
                    disableAutoPan={true}
                >
                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
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
        <div style={{ fontSize: '12px', color: '#000' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>Time:</strong> {timestamp?.format('YYYY-MM-DD HH:mm:ss')}</p>
            <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                    {data.map(row => (
                        <tr key={row.key} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '2px 0' }}>{row.label}</td>
                            <td style={{ padding: '2px 0 2px 10px', textAlign: 'right' }}>{row.value}</td>
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
};

BreadcrumbMarker.propTypes = {
    state: PropTypes.object.isRequired,
};

Polyline.propTypes = {
    path: PropTypes.arrayOf(
        PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        })
    ).isRequired,

    strokeColor: PropTypes.string,
    strokeOpacity: PropTypes.number,
    strokeWeight: PropTypes.number,
};

Polyline.defaultProps = {
    strokeColor: "#4d7685",
    strokeOpacity: 0.5,
    strokeWeight: 2,
};
