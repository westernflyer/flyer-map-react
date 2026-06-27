/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Fader from "./Fader";
import DataTable from "react-data-table-component";
import { formatVesselState, orderArray } from "./utilities.js";
import { tableOptions } from "../flyer.config.js";
import PropTypes from "prop-types";
import { formatUpdate } from "./units.js";

const tableColumns = [
    {
        name: "Property",
        selector: row => row.label,
    },
    {
        name: "Value",
        selector: row => <Fader>{row.value}</Fader>,
    },
    {
        name: "Last update",
        selector: row => <Fader>{row.last_update}</Fader>,
    },
];

/**
 * React function component that shows a table of current values.
 *
 * @param {object} props
 * @param {VesselState} props.vesselState
 * @returns {JSX.Element}
 */
export function VesselTable(props) {
    const { vesselState } = props;
    // Format the contents so they can be used in the DataTable:
    const formattedState = formatVesselState(vesselState);

    return (
        <DataTable
            data={orderArray(tableOptions.order, formattedState)}
            columns={tableColumns}
            title={<h2>Current values</h2>}
            responsive
        />
    );
}

VesselTable.propTypes = {
    vesselState: PropTypes.objectOf(PropTypes.object),
};
