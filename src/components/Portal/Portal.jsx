import React from 'react';
import { createPortal } from 'react-dom';
import * as utils from 'akashatools';

const Portal = ( props ) => {
    const {
        targetElement = null,
        targetElementId = '',
        children,
    } = props;
    return (
        <>
            { children
                ? createPortal(
                    children,
                    ( targetElement !== null
                        ? targetElement
                        : document.getElementById( targetElementId ) )
                )
                : <></> }
        </>
    );
};

export default Portal;