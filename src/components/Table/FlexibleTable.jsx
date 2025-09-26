
import { useEffect, useState, useRef, useCallback } from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Filter, ChevronsUpDown, GripHorizontal, ChevronRight, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as utils from 'akashatools';
import './FlexibleTable.css';
import { caseCamelToSentence } from "@/lib/utilities/string";
import { format, isValid, addDays, isDate } from "date-fns";
import DropTable from "../Droplist/droptable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { getValueType } from "@/lib/utilities/data";
import { Checkbox } from "../ui/checkbox";
import { formatDate, formatDateTime, prettyDateTime } from "@/lib/utilities/time";
import { DateTimeLocal } from "@/lib/config/types";
import List from "../List";

const DEFAULT_FIXED_COLUMN_WIDTH = 200; // Default width for columns in fixed mode if none provided. 

// Column definitions
/* const columns = [
    {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: ( row ) => <div className="truncate font-medium">{ row.name }</div>,
        sortUndefined: "last",
        sortDescFirst: false,
        width: 150,
        priority: 1, // Higher priority = shown first in fixed mode
    },
    {
        id: "email",
        header: "Email",
        accessorKey: "email",
        width: 200,
        priority: 2,
    },
    {
        id: "location",
        header: "Location",
        accessorKey: "location",
        cell: ( row ) => (
            <div className="truncate">
                <span className="text-lg leading-none">{ row.flag }</span> { row.location }
            </div>
        ),
        width: 150,
        priority: 4,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        width: 100,
        priority: 3,
    },
    {
        id: "balance",
        header: "Balance",
        accessorKey: "balance",
        cell: ( row ) => {
            const amount = Number.parseFloat( row.balance );
            const formatted = new Intl.NumberFormat( "en-US", {
                style: "currency",
                currency: "USD",
            } ).format( amount );
            return formatted;
        },
        width: 120,
        priority: 5,
    },
    {
        id: "department",
        header: "Department",
        accessorKey: "department",
        width: 150,
        priority: 6,
    },
    {
        id: "role",
        header: "Role",
        accessorKey: "role",
        width: 120,
        priority: 7,
    },
    {
        id: "joinDate",
        header: "Join Date",
        accessorKey: "joinDate",
        width: 120,
        priority: 8,
    },
    {
        id: "lastActive",
        header: "Last Active",
        accessorKey: "lastActive",
        width: 120,
        priority: 9,
    },
    {
        id: "performance",
        header: "Performance",
        accessorKey: "performance",
        width: 120,
        priority: 10,
    },
]; */

function FlexibleTable ( {
    debug = false,
    dataSchema,
    controlsBar, // Extra controls to put on the top bar. 
    tableTitle = '',
    showHelp = false,
    input,
    setInput,
    itemsPerPage = 20,
    columns,
    customColumnConfig = [],
    visibleColumnsDefault,
    layout,
    settings,
    options,
    rowOnClick,
    cellOnClick,
    setShowSidePanel,
    setSidePanelID,
    isFilterable,
    isSortable,
    useRowActions, rowActions,
    useCellActions, cellActions,
    ...props
} ) {
    // State management
    const [ data, setData ] = useState( input );
    const [ displayData, setDisplayData ] = useState( [] );
    const [ sortConfig, setSortConfig ] = useState( [ { key: "title", direction: "asc" } ] );

    const [ columnConfig, setColumnConfig ] = useState( customColumnConfig ?? [] );
    const [ columnWidths, setColumnWidths ] = useState( {} );
    const [ columnOrder, setColumnOrder ] = useState( [] );
    const [ visibleColumns, setVisibleColumns ] = useState( [] );

    const [ filters, setFilters ] = useState( {} );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ pageSize, setPageSize ] = useState( itemsPerPage ?? 20 );
    const [ editingCell, setEditingCell ] = useState( null );
    const [ editValue, setEditValue ] = useState( "" );
    const [ isFixedMode, setIsFixedMode ] = useState( true );
    const [ expandedRows, setExpandedRows ] = useState( {} );
    const [ containerWidth, setContainerWidth ] = useState( 0 );

    const buildColumnConfig = ( tableData ) => {
        return (
            input
                && utils.val.isValidArray( input, true )
                && utils.val.isObject( input?.[ 0 ] )
                ? Object.keys( input[ 0 ] ).map( ( key, itemIndex ) => ( {
                    id: key,
                    index: itemIndex,
                    header: caseCamelToSentence( key ),
                    accessorKey: key,
                    width: 150,
                    priority: itemIndex,
                } ) )
                : []
        );
    };

    // Refs for resizing and reordering
    const tableRef = useRef( null );
    const containerRef = useRef( null );
    const resizingRef = useRef( {
        isResizing: false,
        columnId: null,
        startX: 0,
        startWidth: 0,
    } );
    const dragRef = useRef( {
        isDragging: false,
        columnId: null,
        startIndex: 0,
        currentIndex: 0,
    } );

    // const columnInit = ( input ) => {
    //     if ( utils.val.isValidArray( input, true ) ) {
    //         // setData( input );
    //         // const cfg = buildColumnConfig( input );
    //         // // setColumnConfig( cfg );
    //         // console.log( "FlexibleTable :: cfg for columns = ", cfg, " :: ", "input data = ", input );
    //     }
    // };

    // // Update data if input changes.
    // useEffect( () => { columnInit( input ); }, [ input ] );

    // // Fetch data
    // useEffect( () => { columnInit( input ); }, [] );

    // Initialize column order and widths
    // useEffect( () => {
    //     let cfg = [];
    //     let initialWidths = {};
    //     console.log( "FlexibleTable :: on component mount :: columns input = ", columns, customColumnConfig );
    //     if ( utils.val.isValidArray( columns, true ) ) {
    //         // Use the externally-supplied column config info. 
    //         cfg = columns;
    //         setColumnConfig( cfg );
    //     }
    //     else {
    //         // Not given column config info, generate our own. 
    //         // columnInit( input );

    //         const cfg = buildColumnConfig( input );
    //         setColumnConfig( cfg );
    //     }
    //     cfg.forEach( ( column ) => {
    //         initialWidths[ column.id ] = column.width || DEFAULT_FIXED_COLUMN_WIDTH;
    //     } );
    //     setColumnWidths( initialWidths );

    //     // Initialize column order based on the original order
    //     const initialOrder = cfg.map( ( col ) => col.id );
    //     setColumnOrder( initialOrder );
    // }, [] );

    // Initialize column order and widths
    useEffect( () => {
        let cfg = [];
        let initialWidths = {};
        console.log( "FlexibleTable :: on component mount :: columns input = ", columns, customColumnConfig );
        if ( utils.val.isValidArray( customColumnConfig, true ) ) {
            // Use the externally-supplied column config info. 
            let cfg = [ ...customColumnConfig ];
            setColumnConfig( cfg );
            let initialWidths = cfg.map( ( column ) => ( {
                [ column.id ]: column.width || DEFAULT_FIXED_COLUMN_WIDTH,
            } ) );
            // cfg.forEach( ( column ) => {
            //     initialWidths[ column.id ] = column.width || DEFAULT_FIXED_COLUMN_WIDTH;
            // } );
            setColumnWidths( initialWidths );

            // Initialize column order based on the original order
            const initialOrder = cfg.map( ( col ) => col.id );
            setColumnOrder( initialOrder );
        }
    }, [] );

    // Observe container width for responsive behavior
    useEffect( () => {
        if ( !containerRef.current ) return;

        const resizeObserver = new ResizeObserver( ( entries ) => {
            for ( const entry of entries ) {
                setContainerWidth( entry.contentRect.width );
            }
        } );

        resizeObserver.observe( containerRef.current );

        return () => {
            resizeObserver.disconnect();
        };
    }, [] );

    // Determine visible columns in fixed mode
    useEffect( () => {
        if ( !isFixedMode || containerWidth === 0 ) {
            setVisibleColumns( columnOrder );
            return;
        }

        // Sort columns by priority
        const prioritizedColumns = [ ...columnConfig ].sort( ( a, b ) => a.priority - b.priority );

        // Calculate how many columns can fit
        let availableWidth = containerWidth;
        const visibleColumnIds = [];

        for ( const column of prioritizedColumns ) {
            const columnWidth = columnWidths[ column.id ] || column.width || DEFAULT_FIXED_COLUMN_WIDTH;

            if ( availableWidth >= columnWidth ) {
                visibleColumnIds.push( column.id );
                availableWidth -= columnWidth;
            } else {
                break;
            }
        }

        setVisibleColumns( visibleColumnIds );
    }, [ isFixedMode, containerWidth, columnWidths, columnOrder ] );

    // Apply sorting, filtering, and pagination
    useEffect( () => {
        let processedData = [ ...input ];

        // Apply filters
        Object.keys( filters ).forEach( ( key ) => {
            if ( filters[ key ] ) {
                processedData = processedData.filter( ( item ) => {
                    const value = item[ key ];
                    if ( value === null || value === undefined ) return false;
                    return String( value ).toLowerCase().includes( filters[ key ].toLowerCase() );
                } );
            }
        } );

        // Apply multi-column sorting
        if ( sortConfig.length > 0 ) {
            processedData.sort( ( a, b ) => {
                // Go through each sort config in order
                for ( const sort of sortConfig ) {
                    const { key, direction } = sort;

                    // Handle undefined values
                    if ( a[ key ] === undefined && b[ key ] === undefined ) continue;
                    if ( a[ key ] === undefined ) return direction === "asc" ? 1 : -1;
                    if ( b[ key ] === undefined ) return direction === "asc" ? -1 : 1;

                    // Compare values
                    if ( a[ key ] !== b[ key ] ) {
                        // Handle string comparison
                        if ( typeof a[ key ] === "string" ) {
                            const result = a[ key ].localeCompare( b[ key ] );
                            return direction === "asc" ? result : -result;
                        }

                        // Handle number comparison
                        const result = a[ key ] - b[ key ];
                        return direction === "asc" ? result : -result;
                    }
                }

                return 0; // If all sort keys are equal
            } );
        }

        // Apply pagination
        const startIndex = ( currentPage - 1 ) * pageSize;
        const paginatedData = processedData.slice( startIndex, startIndex + pageSize );

        setDisplayData( paginatedData );
    }, [ input, data, columnConfig, sortConfig, filters, currentPage, pageSize ] );

    // Column resizing handlers
    const handleMouseMove = useCallback( ( e ) => {
        if ( !resizingRef.current.isResizing ) return;

        const { columnId, startX, startWidth } = resizingRef.current;
        const diff = e.clientX - startX;
        const newWidth = Math.max( 50, startWidth + diff ); // Minimum width of 50px

        setColumnWidths( ( prev ) => ( {
            ...prev,
            [ columnId ]: newWidth,
        } ) );
    }, [] );

    const handleMouseUp = useCallback( () => {
        if ( resizingRef.current.isResizing ) {
            resizingRef.current.isResizing = false;
            resizingRef.current.columnId = null;

            document.removeEventListener( "mousemove", handleMouseMove );
            document.removeEventListener( "mouseup", handleMouseUp );
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        if ( dragRef.current.isDragging ) {
            dragRef.current.isDragging = false;
            dragRef.current.columnId = null;

            document.removeEventListener( "mousemove", handleDragMove );
            document.removeEventListener( "mouseup", handleMouseUp );
            document.body.style.cursor = "";
        }
    }, [ handleMouseMove ] );

    const startResize = useCallback(
        ( e, columnId ) => {
            e.preventDefault();
            e.stopPropagation();

            resizingRef.current = {
                isResizing: true,
                columnId,
                startX: e.clientX,
                startWidth: columnWidths[ columnId ] || DEFAULT_FIXED_COLUMN_WIDTH,
            };

            document.addEventListener( "mousemove", handleMouseMove );
            document.addEventListener( "mouseup", handleMouseUp );
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        },
        [ columnWidths, handleMouseMove, handleMouseUp ],
    );

    // Column reordering handlers
    const handleDragMove = useCallback( ( e ) => {
        if ( !dragRef.current.isDragging ) return;

        const headers = Array.from( document.querySelectorAll( "th[data-column-id]" ) );
        const { clientX } = e;

        // Find which column we're hovering over
        for ( let i = 0; i < headers.length; i++ ) {
            const header = headers[ i ];
            const rect = header.getBoundingClientRect();

            if ( clientX >= rect.left && clientX <= rect.right ) {
                dragRef.current.currentIndex = i;
                break;
            }
        }
    }, [] );

    const startDrag = useCallback(
        ( e, columnId, index ) => {
            if ( isFixedMode ) return;

            e.preventDefault();
            e.stopPropagation();

            dragRef.current = {
                isDragging: true,
                columnId,
                startIndex: index,
                currentIndex: index,
            };

            document.addEventListener( "mousemove", handleDragMove );
            document.addEventListener( "mouseup", handleDragEnd );
            document.body.style.cursor = "grabbing";
        },
        [ isFixedMode ],
    );

    const handleDragEnd = useCallback( () => {
        if ( !dragRef.current.isDragging ) return;

        const { startIndex, currentIndex, columnId } = dragRef.current;

        if ( startIndex !== currentIndex ) {
            // Reorder columns
            setColumnOrder( ( prev ) => {
                const newOrder = [ ...prev ];
                const [ removed ] = newOrder.splice( startIndex, 1 );
                newOrder.splice( currentIndex, 0, removed );
                return newOrder;
            } );
        }

        dragRef.current.isDragging = false;
        dragRef.current.columnId = null;

        document.removeEventListener( "mousemove", handleDragMove );
        document.removeEventListener( "mouseup", handleDragEnd );
        document.body.style.cursor = "";
    }, [] );

    // Sorting handler with multi-column support
    const handleSort = ( columnId, e ) => {
        if ( e.shiftKey ) {
            // Add to multi-sort or update existing
            setSortConfig( ( prev ) => {
                const existingIndex = prev.findIndex( ( sort ) => sort.key === columnId );

                if ( existingIndex >= 0 ) {
                    // Toggle direction if already in sort
                    const newConfig = [ ...prev ];
                    newConfig[ existingIndex ] = {
                        ...newConfig[ existingIndex ],
                        direction: newConfig[ existingIndex ].direction === "asc" ? "desc" : "asc",
                    };
                    return newConfig;
                } else {
                    // Add to sort
                    return [ ...prev, { key: columnId, direction: "asc" } ];
                }
            } );
        } else if ( e.ctrlKey || e.metaKey ) {
            // Remove from sort
            setSortConfig( ( prev ) => prev.filter( ( sort ) => sort.key !== columnId ) );
        } else {
            // Replace sort with just this column
            setSortConfig( [ { key: columnId, direction: "asc" } ] );
        }
    };

    // Filter handler
    const handleFilterChange = ( columnId, value ) => {
        setFilters( ( prev ) => ( {
            ...prev,
            [ columnId ]: value,
        } ) );
        setCurrentPage( 1 ); // Reset to first page when filtering
    };

    // Pagination handlers
    const totalPages = Math.ceil(
        data.filter( ( item ) => {
            for ( const key in filters ) {
                if ( filters[ key ] && !String( item[ key ] ).toLowerCase().includes( filters[ key ].toLowerCase() ) ) {
                    return false;
                }
            }
            return true;
        } ).length / pageSize,
    );

    const goToPage = ( page ) => {
        setCurrentPage( Math.max( 1, Math.min( page, totalPages ) ) );
    };

    // Cell editing handlers
    const handleCellDoubleClick = ( rowIndex, columnId, value ) => {
        setEditingCell( { rowIndex, columnId } );
        setEditValue( value );
    };

    const handleCellEdit = ( row, key, value ) => {
        setEditValue( value );
    };

    const saveEdit = () => {
        if ( !editingCell ) return;

        const { rowIndex, columnId } = editingCell;
        const newData = [ ...data ];
        newData[ rowIndex ][ columnId ] = editValue;

        setData( newData );
        setEditingCell( null );
    };

    const cancelEdit = () => {
        setEditingCell( null );
    };

    // Toggle row expansion for hidden columns
    const toggleRowExpansion = ( rowId ) => {
        setExpandedRows( ( prev ) => ( {
            ...prev,
            [ rowId ]: !prev[ rowId ],
        } ) );
    };

    // Get ordered columns based on current column order
    const getOrderedColumns = () => {
        return columnOrder.map( ( id ) => columnConfig.find( ( col ) => col.id === id ) ).filter( Boolean );
    };

    // Get visible columns based on mode
    const getVisibleOrderedColumns = () => {
        if ( !isFixedMode ) {
            return getOrderedColumns();
        }

        return getOrderedColumns().filter( ( col ) => visibleColumns.includes( col.id ) );
    };

    // Get hidden columns for a row
    const getHiddenColumns = () => {
        if ( !isFixedMode ) return [];

        return getOrderedColumns().filter( ( col ) => !visibleColumns.includes( col.id ) );
    };

    // Check if a column is in the sort config
    const getColumnSortIndex = ( columnId ) => {
        return sortConfig.findIndex( ( sort ) => sort.key === columnId );
    };

    // Get sort direction for a column
    const getColumnSortDirection = ( columnId ) => {
        const sortItem = sortConfig.find( ( sort ) => sort.key === columnId );
        return sortItem ? sortItem.direction : null;
    };

    const buildRowActions = ( row, rowIndex, actions ) => {
        let elements = [];
        if ( actions && utils.val.isValidArray( actions, true ) ) {
            actions.forEach( ( action, index ) => {
                elements.push(
                    <TooltipProvider delayDuration={ 0 }>
                        <Tooltip>
                            <TooltipTrigger>
                                { (
                                    action
                                    && action?.hasOwnProperty( 'render' )
                                    && utils.val.isDefined( action?.render ) )
                                    ? ( action?.render( row, rowIndex ) )
                                    : (
                                        <Button
                                            id={ action?.id }
                                            variant={ `ghost` }
                                            size={ 'sm' }
                                            onClick={ () => {
                                                if ( action?.onClick ) {
                                                    action?.onClick( row );
                                                }
                                            } }
                                            className={ `p-2 aspect-square rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center self-center ${ action?.className ? action?.className : '' }` }
                                        >
                                            { action?.icon ? action?.icon : <></> }
                                        </Button>
                                    ) }
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                                { action?.title ? caseCamelToSentence( action?.title ) : '' }
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            } );
        }
        return <div className={ `grid grid-flow-col w-min` }>{ elements }</div>;
    };

    const renderCellContent2 = ( row, column, rowIndex ) => {
        if (
            editingCell
            && editingCell.rowIndex === rowIndex
            && editingCell.columnId === column.accessorKey
        ) {
            return (
                <Input
                    type="text"
                    autoFocus
                    value={ editValue }
                    onChange={ handleCellEdit }
                    onBlur={ saveEdit }
                    onKeyDown={ ( e ) => {
                        if ( e.key === "Enter" ) { saveEdit(); }
                        else if ( e.key === "Escape" ) { cancelEdit(); }
                    } }
                />
            );
        }
        else {
            // Render in the correct way per the data type; only do for arrays, objects, and date-likes.
            const cellValue = column.cell ? column.cell( row ) : row[ column.accessorKey ];
            if ( utils.val.isValidArray( cellValue, true ) ) {

                return ( <DropTable
                    label={ `${ caseCamelToSentence( column?.accessorKey ?? column?.priority ) }` }
                    data={ cellValue }
                    showControls={ true }
                    expandable={ true }
                    compact={ false }
                    collapse={ false }
                    useBackgroundOverlay={ true }
                /> );
            }
            else if ( utils.val.isObject( cellValue ) && !utils.val.isArray( cellValue ) ) {
                return ( <DropTable
                    label={ `${ caseCamelToSentence( column?.accessorKey ?? column?.priority ) }` }
                    data={ cellValue }
                    showControls={ true }
                    expandable={ true }
                    compact={ false }
                    collapse={ false }
                    useBackgroundOverlay={ true }
                /> );
            }
            else if ( ( !!cellValue === cellValue ) && ( cellValue === "true" || cellValue === "false" || cellValue === true || cellValue === false ) ) {
                return (
                    !!cellValue ? <CheckSquare className={ `p-0 m-0 !size-6` } /> : <Square className={ `p-0 m-0 !size-6` } />
                );
            }
            else if ( isDate( cellValue ) ) {
                // return cellValue && isValid( cellValue ) ? format( cellValue, "PPP" ) : new Date( Date.now() );
                return `${ new Date( cellValue ).toLocaleDateString() }, ${ String( new Date( cellValue ).toLocaleTimeString() ) }`;
            }
            else {
                return String( cellValue );
            }
        }

    };

    const renderCellContent = ( row, column, rowIndex ) => {
        // Get the type of this row's value so we can render it properly. 
        const cellKey = column.accessorKey;
        // const cellValue = column.cell ? column.cell( row ) : row[ column.accessorKey ];
        let cellValue;
        if ( column?.cell ) {
            cellValue = column.cell( row );
        }
        else {
            cellValue = row[ column.accessorKey ];
        }

        if ( cellValue === undefined || cellValue === 'undefined' || cellValue === null ) return "-";

        let cellSchema;
        let type = null;
        if ( dataSchema && utils.val.isObject( dataSchema ) && dataSchema?.hasOwnProperty( cellKey ) ) {
            cellSchema = dataSchema?.[ cellKey ];
            if ( utils.val.isValidArray( cellSchema, true ) ) { cellSchema = cellSchema[ 0 ]; }
            if ( cellSchema?.hasOwnProperty( 'type' ) ) type = cellSchema?.type;
            else { type = getValueType( cellValue ); }
        }
        else { type = getValueType( cellValue ); }

        if ( debug === true ) console.log( "FlexibleTable :: renderCellContent :: cellValue, row, column, rowIndex = ", cellValue, row, column, rowIndex, " :: ", "schema = ", dataSchema, " :: ", "type = ", type );

        // return cellValue;

        if (
            editingCell
            && editingCell.rowIndex === rowIndex
            && editingCell.columnId === column.accessorKey
        ) {
            // Is editing this cell. 
            if ( type === "Boolean" ) {
                return (
                    <Checkbox
                        id={ `checkbox-input-${ column.accessorKey }-${ editingCell.columnId }` }
                        defaultChecked={ editValue }
                        onCheckedChange={ () => { handleCellEdit( row, cellKey, !editValue ); } }
                        className={ `` }
                    />
                );
            }
            else {
                return (
                    <Input
                        type="text"
                        autoFocus
                        value={ editValue }
                        onChange={ ( e ) => { handleCellEdit( row, cellKey, e.target.value ); } }
                        onBlur={ saveEdit }
                        onKeyDown={ ( e ) => {
                            if ( e.key === "Enter" ) { saveEdit(); }
                            else if ( e.key === "Escape" ) { cancelEdit(); }
                        } }
                    />
                );
            }
        }
        else {
            // Render in the correct way per the data type; only do for arrays, objects, and date-likes.
            // const cellValue = column?.cell ? column.cell( row ) : row[ column.accessorKey ];
            if ( utils.val.isValidArray( cellValue, true ) ) {
                return ( cellValue.map( ( val, valIndex ) => {
                    return (
                        <li className={ `properties-item flex flex-row flex-grow w-full gap-2` }>
                            <div className={ `properties-item-key w-1/6 flex flex-shrink` }>
                                { valIndex }
                            </div>{ `: ` }
                            <div className={ `properties-item-value flex flex-grow w-5/6 overflow-hidden flex-wrap whitespace-pre-wrap` }>
                                {/* { String( val ) } */ }
                                { formatValueByType( val, type ) }
                            </div>
                        </li>
                    );
                } ) );
                // return ( <List
                //     label={ `${ caseCamelToSentence( column?.accessorKey ?? column?.priority ) }` }
                //     data={ cellValue }
                //     showControls={ true }
                //     expandable={ true }
                //     compact={ false }
                //     collapse={ false }
                //     useBackgroundOverlay={ true }
                // /> );
            }
            else if ( utils.val.isObject( cellValue ) && !utils.val.isArray( cellValue ) ) {
                return (
                    Object.keys( cellValue ).map( ( k, i ) => {
                        if ( k && cellValue.hasOwnProperty( k ) ) {
                            let v = cellValue[ k ];
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
                        }
                    } )
                );

                // return ( <List
                //     label={ `${ caseCamelToSentence( column?.accessorKey ?? column?.priority ) }` }
                //     data={ cellValue }
                //     showControls={ true }
                //     expandable={ true }
                //     compact={ false }
                //     collapse={ false }
                //     useBackgroundOverlay={ true }
                // /> );
            }
            else if ( ( !!cellValue === cellValue ) && ( cellValue === "true" || cellValue === "false" || cellValue === true || cellValue === false ) ) {
                return (
                    !!cellValue ? <CheckSquare className={ `p-0 m-0 !size-6` } /> : <Square className={ `p-0 m-0 !size-6` } />
                );
            }
            else if ( isDate( cellValue ) ) {
                // let formattedCellValue = formatDateTime( new Date( cellValue ) );
                let formattedCellValue = cellValue instanceof DateTimeLocal
                    ? formatDateTime( cellValue )
                    : formatDateTime( new Date( cellValue ) );
                // return cellValue && isValid( cellValue ) ? format( cellValue, "PPP" ) : new Date( Date.now() );
                // return `${ new Date( cellValue ).toLocaleDateString() }, ${ String( new Date( cellValue ).toLocaleTimeString() ) }`;
                // return `${ .toLocaleDateString() }, ${ String( new Date( cellValue ).toLocaleTimeString() ) }`;
                return formattedCellValue;
            }
            else {
                return String( cellValue );
            }
        }

    };

    const formatValueByType = ( cellValue, cellType = "String" ) => {
        if ( cellValue && cellType ) {
            switch ( cellType ) {
                case 'String':
                    return String( cellValue );
                    break;

                case 'Int32':
                case 'Number':
                    return Math.floor( Number( cellValue ) );
                    break;

                case 'Boolean':
                    return !!cellValue;
                    break;

                case 'Decimal':
                    return Number( cellValue );
                    break;

                case 'Date':
                    return prettyDateTime( new Date( cellValue ), true );
                    break;

                case 'DateTime':
                    return prettyDateTime( new Date( cellValue ), true );
                    break;

                case 'DateTimeLocal':
                    return new Date( cellValue ).toISOString();
                    break;

                case 'Array':
                    if ( utils.val.isValidArray( cellValue, true ) ) {
                        return cellValue.map( ( val ) => ( formatValueByType( val, getValueType( cellValue ) ) ) );
                    }
                    else {
                        return cellValue;
                    }
                    break;

                case 'Object':
                    if ( utils.val.isValidArray( Object.keys( cellValue ), true ) ) {
                        return Object.keys( cellValue ).map( ( k ) => (
                            cellValue?.hasOwnProperty( k )
                                ? formatValueByType( cellValue?.[ k ], getValueType( cellValue?.[ k ] ) )
                                : k
                        ) );
                    }
                    else {
                        return cellValue;
                    }
                    break;

                case 'ObjectId':
                    return String( cellValue );
                    break;

                case 'Mixed':
                    return String( cellValue );
                    break;

                default:
                    return String( cellValue );
                    break;
            }
        }
        else {
            return cellValue;
        }
    };

    return (
        <div className={ `bg-background self-center px-4 sm:max-w-[640px] md:max-w-[1024px] xl:max-w-[1536px] overflow-hidden flex-1 flex-col h-full` } ref={ containerRef }>
            <div className="flex justify-between py-1 px-2 items-center overflow-hidden">
                <div className="flex items-center justify-between gap-4 flex-1 w-full">
                    { tableTitle && ( <p className="items-center justify-center text-center text-lg py-1 px-4 text-neutral-500">
                        { tableTitle }
                    </p> ) }
                    <div className="w-auto flex items-center justify-around space-x-2 flex-shrink">
                        <Switch id="table-mode" checked={ isFixedMode } onCheckedChange={ setIsFixedMode } />
                        <Label htmlFor="table-mode" className={ `text-nowrap text-center self-center items-center h-full` }>{ isFixedMode ? "Fixed Mode" : "Flexible Mode" }</Label>
                    </div>
                    <div className="w-full flex items-center justify-start space-x-2 h-auto flex-1">
                        { controlsBar && controlsBar }
                    </div>

                    { showHelp && !isFixedMode && (
                        <p className="text-sm text-neutral-500">Drag column headers to reorder, resize with edge handles</p>
                    ) }

                    { showHelp && isFixedMode && (
                        <p className="text-sm text-neutral-500">
                            Columns adapt to available space, expand rows for hidden data
                        </p>
                    ) }
                </div>
            </div>

            <div className="overflow-auto border rounded-md">
                <div ref={ tableRef } className="w-full h-full flex-1">

                    <Table className="px-2 w-full h-full flex-1 table-fixeed overflow-hidden">

                        <TableHeader className={ `` }>
                            <TableRow className="bg-muted/50">
                                {/* Add empty header cell for the toggle button column when in fixed mode */ }
                                { isFixedMode && getHiddenColumns().length > 0 && (
                                    <TableHead className="w-10" style={ { width: "40px", maxWidth: "40px" } }></TableHead>
                                ) }

                                { getVisibleOrderedColumns().map( ( column, index ) => (
                                    <TableHead
                                        key={ column.id }
                                        className="relative h-10 select-none border-t !p-0 !px-1 !py-0 gap-2 border border-x"
                                        style={ {
                                            width: `${ columnWidths[ column.id ] || DEFAULT_FIXED_COLUMN_WIDTH }px`,
                                            position: "relative",
                                        } }
                                        data-column-id={ column.id }
                                        aria-sort={
                                            getColumnSortDirection( column.id ) === "asc"
                                                ? "ascending"
                                                : getColumnSortDirection( column.id ) === "desc"
                                                    ? "descending"
                                                    : "none"
                                        }
                                    >
                                        <div className="column-header">
                                            { !isFixedMode && (
                                                <div className="column-drag-handle" onMouseDown={ ( e ) => startDrag( e, column.id, index ) }>
                                                    <GripHorizontal size={ 14 } className={ `p-0 aspect-square size-5` } />
                                                </div>
                                            ) }

                                            <div className="column-header-content gap-2 justify-between w-full">
                                                <span className="column-header-name">{ column.header }</span>

                                                <div className={ `column-header-actions flex-shrink w-auto flex-row pr-2` }>

                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                                                <Filter className="h-3 w-3" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium">Filter { column.header }</h4>
                                                                <Input
                                                                    placeholder={ `Filter ${ column.header.toLowerCase() }...` }
                                                                    value={ filters[ column.accessorKey ] || "" }
                                                                    onChange={ ( e ) => handleFilterChange( column.accessorKey, e.target.value ) }
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>

                                                    <div className="sort-indicator" onClick={ ( e ) => handleSort( column.id, e ) }>
                                                        { getColumnSortDirection( column.id ) === "asc" ? (
                                                            <ChevronUp className="shrink-0 opacity-60" size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                                        ) : getColumnSortDirection( column.id ) === "desc" ? (
                                                            <ChevronDown className="shrink-0 opacity-60" size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                                        ) : (
                                                            <ChevronsUpDown className="shrink-0 opacity-30" size={ 16 } strokeWidth={ 2 } />
                                                        ) }

                                                        { getColumnSortIndex( column.id ) > -1 && sortConfig.length > 1 && (
                                                            <span className="sort-index">{ getColumnSortIndex( column.id ) + 1 }</span>
                                                        ) }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        { !isFixedMode && (
                                            <div
                                                className="resize-handle"
                                                onDoubleClick={ ( e ) => {
                                                    e.stopPropagation();
                                                    setColumnWidths( ( prev ) => ( {
                                                        ...prev,
                                                        [ column.id ]: column.width || DEFAULT_FIXED_COLUMN_WIDTH,
                                                    } ) );
                                                } }
                                                onMouseDown={ ( e ) => startResize( e, column.id ) }
                                            />
                                        ) }
                                    </TableHead>
                                ) ) }
                            </TableRow>
                        </TableHeader>

                        <TableBody className={ `w-full h-full flex-1 overflow-auto relative` }>
                            { input && displayData && displayData.length ? (
                                displayData.map( ( row, rowIndex ) => {
                                    const rowKey = row.id || rowIndex;
                                    const hasHiddenColumns = isFixedMode && getHiddenColumns().length > 0;

                                    return (
                                        <>
                                            <TableRow key={ rowKey } data-state={ row.selected && "selected" }>
                                                {/* Add toggle button for hidden columns if in fixed mode */ }
                                                { hasHiddenColumns && (
                                                    <TableCell
                                                        className="w-auto p-0 relative"
                                                    // style={ { width: "40px", maxWidth: "40px" } }
                                                    >
                                                        <div className={ `grid grid-flow-col justify-start items-center p-0` }>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-xl"
                                                                onClick={ () => toggleRowExpansion( rowKey ) }
                                                            >
                                                                <ChevronRight
                                                                    className={ cn( "h-4 w-4 transition-transform", expandedRows[ rowKey ] && "rotate-90" ) }
                                                                />
                                                            </Button>

                                                            { useRowActions && ( <div className={ `w-full ap-1` }>{ buildRowActions( row, rowIndex, rowActions ) }</div> ) }
                                                        </div>
                                                    </TableCell>
                                                ) }

                                                {/* Render visible columns */ }
                                                { getVisibleOrderedColumns().map( ( column ) => (
                                                    <TableCell
                                                        key={ column.id }
                                                        className={ `!p-0 truncate` }
                                                        style={ {
                                                            width: `${ columnWidths[ column.id ] || DEFAULT_FIXED_COLUMN_WIDTH }px`,
                                                            maxWidth: `${ columnWidths[ column.id ] || DEFAULT_FIXED_COLUMN_WIDTH }px`,
                                                        } }
                                                        onDoubleClick={ () =>
                                                            handleCellDoubleClick( rowIndex, column.accessorKey, row[ column.accessorKey ] )
                                                        }
                                                    >
                                                        { renderCellContent( row, column, rowIndex ) }
                                                    </TableCell>
                                                ) ) }
                                            </TableRow>

                                            {/* Hidden columns row - shown when expanded */ }
                                            { hasHiddenColumns && expandedRows[ rowKey ] && (
                                                <TableRow className="hidden-data-row">
                                                    <TableCell
                                                        colSpan={ getVisibleOrderedColumns().length + ( hasHiddenColumns ? 1 : 0 ) }
                                                        className={ `!p-0` }
                                                    >
                                                        <div className="hidden-data-content !gap-0">
                                                            { getHiddenColumns().map( ( column ) => (
                                                                <div key={ column.id } className="p-1 hidden-data-item hover:bg-primary-800/20">
                                                                    <div className="hidden-data-label">{ column.header }</div>
                                                                    {/* <div>{ column.cell ? String( column.cell( row ) ) : String( row[ column.accessorKey ] ) }</div> */ }
                                                                    <div className={ `px-2` }>
                                                                        { renderCellContent( row, column, rowIndex ) }
                                                                    </div>
                                                                </div>
                                                            ) ) }
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) }
                                        </>
                                    );
                                } )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={ getVisibleOrderedColumns().length + ( isFixedMode && getHiddenColumns().length > 0 ? 1 : 0 ) }
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) }
                        </TableBody>

                        <TableFooter className={ `` }>

                        </TableFooter>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */ }
            <div className="flex w-full items-center justify-between space-x-2 py-2 px-2">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={ pageSize.toString() }
                        onValueChange={ ( value ) => {
                            setPageSize( Number( value ) );
                            setCurrentPage( 1 );
                        } }
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={ pageSize } />
                        </SelectTrigger>
                        <SelectContent side="top">
                            { [ 5, 10, 20, 50, 75, 100 ].map( ( size ) => (
                                <SelectItem key={ size } value={ size.toString() }>
                                    { size }
                                </SelectItem>
                            ) ) }
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-neutral-500">
                        Showing { displayData.length } of { data.length } items
                    </p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={ () => goToPage( 1 ) } disabled={ currentPage === 1 }>
                            First
                        </Button>
                        <Button variant="outline" size="sm" onClick={ () => goToPage( currentPage - 1 ) } disabled={ currentPage === 1 }>
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page { currentPage } of { Math.max( 1, totalPages ) }
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={ () => goToPage( currentPage + 1 ) }
                            disabled={ currentPage >= totalPages }
                        >
                            Next
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={ () => goToPage( totalPages ) }
                            disabled={ currentPage >= totalPages }
                        >
                            Last
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FlexibleTable;

