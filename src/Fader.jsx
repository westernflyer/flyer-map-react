/**
 * Copyright (c) 2024-present Tom Keffer <tkeffer@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { useRef } from "react";
import PropTypes from "prop-types";
import { CSSTransition, SwitchTransition } from "react-transition-group";

/**
 * A component that provides a fade transition when its children change.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const Fader = ({ children }) => {
    const nodeRef = useRef(null);
    return (
        <SwitchTransition mode="out-in">
            <CSSTransition
                key={children}
                nodeRef={nodeRef}
                addEndListener={(done) => {
                    nodeRef.current.addEventListener("transitionend", done, false);
                }}
                classNames="fade"
            >
                <div ref={nodeRef}>{children}</div>
            </CSSTransition>
        </SwitchTransition>
    );
};

Fader.propTypes = {
    children: PropTypes.node,
};

export default Fader;
