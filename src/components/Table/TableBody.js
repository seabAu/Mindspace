import React from "react";
import * as utils from 'akashatools';
import TableSubTable from "./TableSubTable";
import Button from "../Button";

function TableBody ( props ) {
    const {
        // isVisible,
        // isFetching,
        tableID,
        tableData,
        tableKeys,
        hideColumns,
        rowOnClick = ( e ) => { },
        cellOnClick = ( e ) => { },
        actionsEnabled = true,
        rowActions,
        debug = false,
    } = props;

    const buildRow = ( rowData, rowIndex = 0 ) => {
        // let columnKeys = tableKeys.map( ( key, index ) => { return key.value; })
        let rowCells = [];

        // Object.entries(rowData).forEach((prop, cellIndex) => {
        tableKeys.forEach( ( columnKey, cellIndex ) => {
            // For each cell.
            let cellData = {};
            let value = "-";
            if ( rowData.hasOwnProperty( columnKey ) ) {
                value = rowData[ columnKey ];
            }
            Object.defineProperty( cellData, columnKey, {
                value: value,
            } );

            if ( columnKey === "actions" ) {
                let rowButtons = [];
                if ( utils.val.isValidArray( rowActions, true ) && actionsEnabled ) {
                    rowActions.forEach( ( action, actionIndex ) => {
                        if ( debug ) console.log( `table body action = `, action );
                        rowButtons.push(
                            <Button
                                key={ `table-${ tableID }-row-${ rowIndex }-action-button-${ actionIndex }` }
                                id={ `table-${ tableID }-row-${ rowIndex }-action-button-${ actionIndex }` }
                                name={ action.name }
                                label={ action.name }
                                icon={ action.icon }
                                type={ action.type }
                                onClick={ ( e ) => { action.onClick( rowIndex, rowData ); } }
                            />,
                        );
                    } );
                }
                rowCells.push( buildCell( columnKey, rowButtons, rowIndex, cellIndex ) );
            } else {
                rowCells.push(
                    buildCell( columnKey, value, rowIndex, cellIndex ),
                );
            }
        } );
        // if ( debug ) console.log( `table body rowActions = `, rowActions, " :: tableData = ", tableData, " :: rowData = ", rowData, " :: rowCells = ", rowCells, " :: tableKeys = ", tableKeys );

        return (
            <tr
                data-index={ `${ rowIndex }` }
                key={ `table-${ tableID }-row-${ rowIndex }` }
                id={ `table-${ tableID }-row-${ rowIndex }` }
                className={ `row-${ rowIndex
                    //getIsVisible(index, pageNum, entriesPerPage, [])
                    //    ? "row-visible"
                    //    : "row-hidden"
                    }` }
                onClick={ ( rowIndex ) => {
                    rowOnClick( rowIndex, rowData );
                } }>
                { rowCells }
            </tr>
        );
    };

    // if ( debug ) console.log( "tablebody.js :: rowActions = ", rowActions, " :: hideColumns = ", hideColumns );
    const buildCell = ( cellKey, cellValue, rowIndex, cellIndex ) => {
        // let data = cellData[Object.keys(cellData)[0]];
        // let key = cellData[0];
        // let value = cellData[1];
        return (
            <td
                data-label={ `${ cellKey }` }
                key={ `table-${ tableID }-cell-${ rowIndex }-${ cellIndex }-${ cellKey }` }
                id={ `table-${ tableID }-cell-${ rowIndex }-${ cellIndex }-${ cellKey }` }
                rowSpan="1"
                className={ `col-cell ${ utils.val.isObject( cellValue ) ? `sub-table-container` : `` } ${ hideColumns.includes( cellKey ) ? " col-hidden" : "" }` }
                onClick={ ( cellIndex ) => {
                    cellOnClick( cellIndex, cellValue );
                } }>
                { utils.val.isObject( cellValue ) || ( utils.val.isValidArray( cellValue, true ) && cellKey !== "actions" ) ? (
                    <TableSubTable
                        data={ cellValue }
                        containerID={ `${ rowIndex }-${ cellIndex }-${ cellKey }` }
                        tableID={ `${ tableID }` }></TableSubTable>
                ) : utils.val.isValidArray( cellValue, true ) && cellKey !== "actions" ? (
                    cellValue.map( ( val, valIndex ) => {
                        return (
                            <TableSubTable
                                data={ val }
                                containerID={ `${ rowIndex }-${ cellIndex }-${ cellKey }-${ valIndex }` }
                                tableID={ `${ tableID }` }
                            />
                        );
                    } )
                ) : (
                    cellValue
                ) }
            </td>
        );
    };

    return (
        <tbody>
            { tableData.map( ( object, rowIndex ) => {
                // For each row.
                return buildRow( object, rowIndex );
            } ) }
        </tbody>
    );
}

export default TableBody;
