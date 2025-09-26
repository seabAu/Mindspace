import React, { useEffect, useState } from "react";
import TableBody from "./TableBody";
import TableDownload from "./TableDownload";
import TableHead from "./TableHead";
import TablePagination from "./TablePagination";
import TableFoot from "./TableFoot";
// import Select from '../Form/Select';

import * as utils from 'akashatools';
import Input from "../Form/Input";
import "./table.css";

function Table ( props ) {
	// The tableData contains an array of objects. To construct the header, we use just the first object in the array and grab its keys' names.
	const {
		// isVisible,
		isFetching,
		isFilterable,
		isSortable = "true",
		dataName = "",
		tableData,
		setShowSidePanel,
		setSidePanelID,
		rowOnClick = () => { },
		cellOnClick = () => { },
		useRowActions = true,
		rowActions = [], // An array of buttons to add to each row
		debug = false,
	} = props;

	const appendIndex = ( data ) => {
		// Simple routine to add an index key-value pair to each entry in the dataset.
		// TODO :: This can be expanded into a more generalized 'insert column' function.
		return utils.val.isValidArray( data, true ) ? ( data.map( ( obj, index ) => {
			let proparray = Object.entries( obj );
			proparray.unshift( [ "index", index ] );
			return Object.fromEntries( proparray );
		} ) ) : ( data );
	};

	const [ entriesPerPage, setEntriesPerPage ] = useState( 10 );
	const [ pageNum, setPageNum ] = useState( 0 );
	const [ columnsVisible, setColumnsVisible ] = useState( [] );
	const [ filters, setFilters ] = useState( [] );
	const [ renderData, setRenderData ] = useState( appendIndex( tableData ) );
	const [ headers, setHeaders ] = useState( [] );
	const [ tableID, setTableID ] = useState( Math.floor( Math.random() * 1000000 ) );
	const [ showFlattened, setShowFlattened ] = useState( false );

	// Tracking the window size.
	const [ screenWidth, setScreenWidth ] = useState( window.innerWidth );
	const [ screenHeight, setScreenHeight ] = useState( window.innerHeight );
	const updateDimensions = () => {
		setScreenWidth( window.innerWidth );
		setScreenHeight( window.innerHeight );
	};
	useEffect( () => {
		window.addEventListener( "resize", updateDimensions );
		return () => window.removeEventListener( "resize", updateDimensions );
	}, [] );

	const getPageEntries = ( data, page, numPerPage, filters = [] ) => {
		if ( !data ) {
			return [ { Error: "No data." } ];
		}


		let entries = [];
		let startIndex = page * numPerPage;
		let endIndex = page * numPerPage + numPerPage - 1;
		for ( var i = 0; i < data.length; i++ ) {
			if ( data[ i ] ) {
				if ( i >= startIndex && i <= endIndex ) {
					entries.push( data[ i ] );
				}
			}
		}
		return entries;
	};

	const changePage = ( dataLen, page, numPerPage ) => {
		const numPages = Math.ceil( dataLen / parseInt( numPerPage ) );
		if ( page >= 0 && page < numPages ) {
			setTimeout( () => {
				return setPageNum( parseInt( page ) );
			}, 10 );
		}
	};


	useEffect( () => {
		if ( renderData && utils.val.isValidArray( renderData, true ) ) changePage( renderData.length, 0, entriesPerPage );
	}, [ entriesPerPage ] );

	useEffect( () => {
		// Update if the data, filters, or any data-altering options are changed.
		if ( utils.val.isValidArray( tableData, true ) ) {
			let temp = showFlattened
				? utils.ao.flattenObjArray( appendIndex( tableData ) )
				: appendIndex( tableData );
			let headerKeys = utils.ao.getObjKeys( temp[ 0 ] );
			if ( utils.val.isValidArray( rowActions, true ) ) {
				headerKeys.push( {
					id: headerKeys.length,
					key: "actions",
					value: "actions",
					label: "Actions",
				} );
			}
			setHeaders( headerKeys );
			// setRenderData(filterData(temp, filters));
			setRenderData( utils.ao.filterDataFast( temp, filters ) );
		}
	}, [ tableData, filters, showFlattened ] );

	const changeFilters = ( key, filter ) => {
		// Set up to one filter per header key.
		// First check if filters already includes this key.
		if ( filters ) {
			let filterKeys = filters.map( ( item, index ) => {
				return item.key;
			} );
			if ( filterKeys.indexOf( key ) > -1 ) {
				// We already have a filter for this key, update it.
				if ( utils.val.isTruthy( filter )
				) {
					setFilters(
						filters.map( ( item ) => {
							if ( item.key === key ) {
								// Replace with new filter string.
								return { key: item.key, value: filter };
							} else {
								// Return the current value.
								return { key: item.key, value: item.value };
							}
						} ),
					);
				} else {
					// Invalid filter, delete its entry.
					setFilters(
						filters.filter( ( item ) => {
							return item.key !== key;
						} ),
					);
				}
			} else {
				// We don't currently have a filter for this key, add it.
				if (
					utils.val.isTruthy( key ) &&
					utils.val.isTruthy( filter )
				) {
					setFilters( [ ...filters, { key: key, value: filter } ] );
				}
			}
		} else {
			// We don't have any filters yet, so just add it!
			if (
				utils.val.isTruthy( key ) &&
				utils.val.isTruthy( filter )
			) {
				setFilters( { key: key, value: filter } );
			}
		}

		// Prune out any invalid filter entries.
		// if ( filters )
		// {
		//     setFilters(
		//         filters.filter((element) => {
		// 				return (
		// 				utils.val.isTruthy( element.value ) &&
		// 				utils.val.isTruthy( element.key )
		//             );
		//         }),
		//     );
		// }

		// console.log( "changeFilters :: filters is now = ", filters );
		// setRenderData(filterData(renderData, filters));
	};

	const buildTableOptions = () => {
		return (
			<div className="table-options-container">
				<TableDownload
					dataName={ dataName }
					tableData={ tableData }
					downloadFileType="csv"
				/>
				<Input
					fieldType="select"
					fieldLayout="inline"
					label="Set results per page"
					id="table-options-input-set-pagelength"
					key="table-options-input-set-pagelength"
					name="table-options-input-set-pagelength"
					value={ entriesPerPage }
					inputProps={ {
						options: [ 5, 10, 15, 20, 30, 50, 75, 100, 200 ],
						unsetOption: "-",
						// defaultValue: columnsVisible,
						value: columnsVisible,
						multiple: false,
					} }
					multiple={ false }
					disabled={ isFetching ?? "" }
					onChange={ ( value ) => {
						if ( value ) {
							if ( !isNaN( value ) ) {
								if ( value > 0 && value < 200 ) {
									setEntriesPerPage( +value );
								}
							}
						}
					} }
				/>
				{ headers && utils.val.isValidArray( tableData, true ) && (
					<Input
						fieldType="select"
						fieldLayout="inline"
						label="Set Columns"
						id="table-options-input-hideshow-columns"
						key="table-options-input-hideshow-columns"
						name="table-options-input-hideshow-columns"
						// value={columnsVisible}
						inputProps={ {
							options: headers,
							unsetOption: "-",
							// defaultValue: columnsVisible,
							value: columnsVisible,
							multiple: true,
						} }
						multiple={ true }
						dropdown={ true }
						disabled={ isFetching ?? "" }
						onChange={ ( selected ) => {
							if ( selected ) {
								setColumnsVisible( selected );
							}
						} }
					/>
				) }
				<Input
					fieldType="checkbox"
					fieldLayout="inline"
					label="Show Flattened"
					id={ `table-options-input-set-flattened` }
					key={ `table-options-input-set-flattened` }
					name={ `table-options-input-set-flattened` }
					inputProps={ {
						// defaultValue: columnsVisible,
						value: columnsVisible,
					} }
					dropdown={ true }
					multiple={ true }
					disabled={ isFetching ?? "" }
					defaultValue={ showFlattened }
					onChange={ ( event ) => {
						setShowFlattened( event.target.checked );
					} }
				/>
			</div>
		);
	};

	return (
		( utils.val.isValidArray( tableData, true ) ) && (
			<div className="table-container">
				{ buildTableOptions() }
				<div className="table table-fixed-head">
					<table
						//className="table table-fixed-head"
						className="table-responsive"
						data-title={ `${ dataName }` }
						sortable={ isSortable ? "true" : "" }>
						<caption>{ dataName }</caption>
						{ renderData &&
							headers && (
								<TableHead
									tableID={ tableID }
									isFilterable={ isFilterable }
									isSortable={ isSortable ? "true" : "" }
									tableHeadings={ headers }
									// tableHeadings={utils.val.isValidArray(rowActions, true) ? [...headers, 'actions'] : headers }
									changeFilters={ changeFilters }
									headerOnClick={ ( headerIndex, key, order ) => {
										setRenderData( utils.ao.keySortData( renderData, key, order ) );
									} }
									hideColumns={ columnsVisible }
									actionsEnabled={ utils.val.isValidArray( rowActions, true ) }
									debug={ debug }></TableHead>
							) }
						{ renderData && tableData && (
							<TableBody
								tableID={ tableID }
								tableData={ getPageEntries( renderData, pageNum, entriesPerPage, [] ) }
								tableKeys={ headers.map( ( key, index ) => {
									return key.value;
								} ) }
								hideColumns={ columnsVisible }
								rowOnClick={ rowOnClick }
								cellOnClick={ ( cellIndex, cellData ) => { } }
								actionsEnabled={ useRowActions && utils.val.isValidArray( rowActions, true ) }
								rowActions={ rowActions }
								debug={ debug }></TableBody>
						) }
						{ renderData && headers && (
							<TableFoot
								tableID={ tableID }
								tableHeadings={ headers }
								numEntries={ renderData.length }
								entriesPerPage={ parseInt( entriesPerPage ) }
								pageNum={ parseInt( pageNum ) }
								changePage={ changePage }></TableFoot>
						) }
					</table>
				</div>
			</div>
		)

	);
}

export default Table;
