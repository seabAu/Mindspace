// Multi-state toggle switch https://codepen.io/magnus16/pen/grzqMz

import React from 'react'
import {
    FaTimes,
    FaCircleXmark,
    FaCircleCheck 
} from "react-icons/fa6";


const Toggle = ( props ) => {
    
    const {
        states,
        classes,
        debug
    } = props;

    // Make this generate the states via JSON definitions.
    return (
        <div className="tw-toggle">
            <input type="radio" name="toggle" value="false" />
            <label className="toggle toggle-yes">
                <FaTimes className="fa fa-times"/>
            </label>
            <input checked type="radio" name="toggle" value="-1" />
            <label className="toggle toggle-yes">
                <FaCircleXmark className="fa fa-times"/>
            </label>
            <input type="radio" name="toggle" value="true" />
            <label className="toggle toggle-yes">
                <FaCircleCheck  className="fa fa-times"/>
            </label>
            <span></span>
        </div>
    );
}

export default Toggle
