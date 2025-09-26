import React from "react";
import * as utils from 'akashatools';

function TableSubTable ( props ) {
    const {
        data,
        containerID,
        tableID,
        classes = "",
        styles = {},
        debug = false
    } = props;

    if ( debug ) console.log( "Table.TableSubTable.JS :: props = ", props );
    // Convert an object into a vertically-aligned table meant to be contained in the cell of a parent table, with recursion.
    const obj2SubTable = ( input, containerID, tableID ) => {
        if ( debug ) console.log( "TableSubTable.JS :: obj2SubTable :: ", input, containerID, tableID );
        let subtable = [];
        if ( input ) {
            if ( typeof input === "object" ) {
                let idPrefix = `table-${ tableID }-sub-table-${ containerID }`;
                subtable.push(
                    <tbody
                        className="sub-table-body"
                        key={ idPrefix + `-body` }
                        id={ idPrefix + `-body` }>
                        { Object.entries( input ).map( ( prop, index ) => {
                            // For each object in the array.
                            if ( typeof prop[ 1 ] === "object" ) {
                                prop[ 1 ] = obj2SubTable( prop[ 1 ] );
                            }
                            return (
                                <tr
                                    className="sub-table-row"
                                    key={ idPrefix + `-row-${ index }` }
                                    id={ idPrefix + `-row-${ index }` }>
                                    <td
                                        className="sub-table-cell-key"
                                        key={ idPrefix + `-row-${ index }-cell-key-${ prop[ 0 ] } ` }
                                        id={ idPrefix + `-row-${ index }-cell-key-${ prop[ 0 ] }` }>
                                        { prop[ 0 ] }
                                    </td>
                                    <td
                                        className="sub-table-cell-value"
                                        key={ idPrefix + `-row-${ index }-cell-value-${ prop[ 0 ] } ` }
                                        id={ idPrefix + `-row-${ index }-cell-value-${ prop[ 0 ] }` }>
                                        { prop[ 1 ] }
                                    </td>
                                </tr>
                            );
                        } ) }
                    </tbody>,
                );
            } else if ( utils.val.isValidArray( input, true ) ) {
                input.forEach( ( val, valIndex ) => {
                    subtable.push( obj2SubTable( val, `${ containerID }-${ valIndex }`, tableID ) );
                    // return (
                    //     <TableSubTable
                    //         data={val}
                    //         containerID={`${rowIndex}-${cellIndex}-${cellKey}-${valIndex}`}
                    //         tableID={`${tableID}`}
                    //     />
                    // );
                } );
            }
        }
        return subtable;
    };

    const containerStyles = {
        ...styles,
    };

    return (
        <table
            className={ `sub-table ${ classes ? classes : "" }` }
            style={ containerStyles }
            key={ `table-${ tableID }-sub-table-${ containerID }` }>
            { data && typeof data === "object" && obj2SubTable( data, containerID, tableID ) }
        </table>
    );
}

export default TableSubTable;
