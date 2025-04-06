/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Fader from "react-fader";
import DataTable from "react-data-table-component";
import { orderArray } from "./utilities.js";
import { tableOptions } from "../flyer.config.js";
import PropTypes from "prop-types";

const tableColumns = [
    {
        name: "Property",
        selector: (row) => row.label,
    },
    {
        name: "Value",
        selector: (row) => <Fader>{row.value}</Fader>,
    },
    {
        name: "Last update",
        selector: (row) => <Fader>{row.last_update}</Fader>,
    },
    // {
    //     name: "Key",
    //     selector: (row) => <span className={"tty"}>{row.key}</span>,
    // },
];

/**
 * React function component that shows a table of current values.
 *
 * @param {object} props
 * @param {FormattedState} props.formattedState
 * @returns {JSX.Element}
 */
export function VesselTable(props) {
    const { formattedState } = props;
    return (
        <DataTable
            data={orderArray(tableOptions.order, formattedState)}
            columns={tableColumns}
            title={<h2> Current values</h2>}
            responsive
        />
    );
}

VesselTable.propTypes = {
    formattedState: PropTypes.objectOf(PropTypes.object),
};
