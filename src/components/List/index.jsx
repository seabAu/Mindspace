// Generalized unordered list generator from provided data.
import React, { useContext, createContext, useEffect, useState, useCallback } from 'react';
import * as utils from 'akashatools';

const List = ( { data, setData, classNames, listClassNames, listItemClassNames, styles } ) => {
    return ( utils.val.isValidArray( data, true )
        && ( Object.keys( data ).map( ( k, i ) => {
            let v = data[ k ];
            return (
                <li className={ `properties-item flex flex-row flex-grow w-full gap-2` }>
                    <div className={ `properties-item-key w-1/6 flex flex-shrink` }>
                        { JSON.stringify( k, null, 4 ) }
                    </div>{ `: ` }
                    <div className={ `properties-item-value flex flex-grow w-5/6 overflow-hidden flex-wrap whitespace-pre-wrap` }>
                        { JSON.stringify( v, null, 4 ) }
                    </div>
                </li>
            );
        } ) )
    );
};

export default List;
