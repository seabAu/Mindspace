
/*  // Example usage.
    import DynamicTable from "@/components/dynamic-table";
    export default function Page () {
        return (
            <div className="container mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Dynamic Table System</h1>
                    <p className="text-muted-foreground">
                        A modern, feature-rich table component with filtering, sorting, pagination, and data import/export
                        capabilities.
                    </p>
                </div>

                <DynamicTable
                    initialData={ sampleData }
                    dataName="Employee Directory"
                    isFilterable={ true }
                    isSortable={ true }
                    useRowActions={ true }
                    rowActions={ rowActions }
                    rowOnClick={ ( rowIndex, rowData ) => {
                        console.log( "Row clicked:", rowIndex, rowData );
                    } }
                    cellOnClick={ ( cellKey, cellValue ) => {
                        console.log( "Cell clicked:", cellKey, cellValue );
                    } }
                />
            </div>
        );
    }
*/

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, ChevronLeft, ChevronRight, Eye, Edit, X } from "lucide-react";
import { mkConfig, generateCsv, download as downloadCsv } from "export-to-csv";
import * as utils from "akashatools";

// Sample data to demonstrate the table functionality
const sampleData = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        department: "Engineering",
        salary: 75000,
        address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
        },
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        age: 28,
        department: "Marketing",
        salary: 65000,
        address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
        },
    },
    {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        age: 35,
        department: "Sales",
        salary: 70000,
        address: {
            street: "789 Pine Rd",
            city: "Chicago",
            state: "IL",
        },
    },
    {
        id: 4,
        name: "Alice Brown",
        email: "alice@example.com",
        age: 32,
        department: "Engineering",
        salary: 80000,
        address: {
            street: "321 Elm St",
            city: "Seattle",
            state: "WA",
        },
    },
    {
        id: 5,
        name: "Charlie Wilson",
        email: "charlie@example.com",
        age: 29,
        department: "Design",
        salary: 68000,
        address: {
            street: "654 Maple Dr",
            city: "Austin",
            state: "TX",
        },
    },
];

// Sample row actions
const rowActions = [
    {
        name: "Edit",
        icon: null,
        type: "button",
        onClick: ( rowIndex, rowData ) => {
            console.log( "Edit clicked for:", rowData );
        },
    },
    {
        name: "Delete",
        icon: null,
        type: "button",
        onClick: ( rowIndex, rowData ) => {
            console.log( "Delete clicked for:", rowData );
        },
    },
];

/**
 * Formats text by capitalizing and replacing underscores with spaces
 * @param {string} text - Text to format
 * @returns {string} Formatted text
 */
const formatText = ( text = "" ) => {
    return utils.str.toCapitalCase( text.toString().includes( "_" ) ? text.split( "_" ).join( " " ) : text );
};

/**
 * Checks if a column should be hidden
 * @param {string} headingId - Column heading ID
 * @param {Array} hideColumns - Array of columns to hide
 * @returns {boolean} Whether column is hidden
 */
const isColumnHidden = ( headingId, hideColumns ) => {
    if ( hideColumns && Array.isArray( hideColumns ) && hideColumns.length > 0 ) {
        return hideColumns.includes( headingId );
    }
    return false;
};

/**
 * Appends index to each data entry
 * @param {Array} data - Array of objects
 * @returns {Array} Data with index added
 */
const appendIndex = ( data ) => {
    return utils.val.isValidArray( data, true )
        ? data.map( ( obj, index ) => {
            const proparray = Object.entries( obj );
            proparray.unshift( [ "index", index ] );
            return Object.fromEntries( proparray );
        } )
        : data;
};

/**
 * Gets paginated entries from data
 * @param {Array} data - Full dataset
 * @param {number} page - Current page number
 * @param {number} numPerPage - Entries per page
 * @returns {Array} Paginated entries
 */
const getPageEntries = ( data, page, numPerPage ) => {
    if ( !data ) return [ { Error: "No data." } ];

    const entries = [];
    const startIndex = page * numPerPage;
    const endIndex = page * numPerPage + numPerPage - 1;

    for ( let i = 0; i < data.length; i++ ) {
        if ( data[ i ] && i >= startIndex && i <= endIndex ) {
            entries.push( data[ i ] );
        }
    }
    return entries;
};

/**
 * SubTable component for nested object rendering
 */
const SubTable = memo( ( { data, containerID, tableID } ) => {
    const obj2SubTable = useCallback( ( input, containerID, tableID ) => {
        if ( !input || typeof input !== "object" ) return null;

        const idPrefix = `table-${ tableID }-sub-table-${ containerID }`;

        return (
            <div className="border border-border rounded-md p-1">
                { Object.entries( input ).map( ( [ key, value ], index ) => (
                    <div key={ `${ idPrefix }-row-${ index }` } className="flex justify-between py-1 text-xs">
                        <span className="font-medium text-muted-foreground">{ formatText( key ) }:</span>
                        <span className="text-foreground">
                            { typeof value === "object" ? (
                                <SubTable data={ value } containerID={ `${ containerID }-${ index }` } tableID={ tableID } />
                            ) : (
                                String( value )
                            ) }
                        </span>
                    </div>
                ) ) }
            </div>
        );
    }, [] );

    return obj2SubTable( data, containerID, tableID );
} );

/**
 * Pagination component
 */
const TablePagination = memo( ( { numEntries, entriesPerPage, pageNum, changePage, tableID } ) => {
    const getPageButtons = useCallback(
        ( dataLen, page, numPerPage ) => {
            const buttons = [];
            const numButtons = Math.ceil( dataLen / numPerPage );

            // Previous button
            buttons.push(
                <Button
                    key="prev"
                    variant="outline"
                    size="sm"
                    onClick={ () => changePage( dataLen, page - 1, numPerPage ) }
                    disabled={ page === 0 }
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>,
            );

            // Page number buttons
            for ( let i = 0; i < numButtons; i++ ) {
                if ( Math.abs( i - page ) < 3 || i === 0 || i === numButtons - 1 ) {
                    buttons.push(
                        <Button
                            key={ i }
                            variant={ i === page ? "default" : "outline" }
                            size="sm"
                            onClick={ () => changePage( dataLen, i, numPerPage ) }
                            className="h-8 w-8 p-0"
                        >
                            { i + 1 }
                        </Button>,
                    );
                }
            }

            // Next button
            buttons.push(
                <Button
                    key="next"
                    variant="outline"
                    size="sm"
                    onClick={ () => changePage( dataLen, page + 1, numPerPage ) }
                    disabled={ page >= numButtons - 1 }
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>,
            );

            return buttons;
        },
        [ changePage ],
    );

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div className="flex gap-2">{ getPageButtons( numEntries, pageNum, entriesPerPage ) }</div>
            <p className="text-sm text-muted-foreground">
                Viewing { pageNum * entriesPerPage + 1 } to { Math.min( pageNum * entriesPerPage + entriesPerPage, numEntries ) } of{ " " }
                { numEntries } entries
            </p>
        </div>
    );
} );

/**
 * File import component with confirmation dialog
 */
const FileImport = memo( ( { onImport, hasExistingData } ) => {
    const [ showConfirm, setShowConfirm ] = useState( false );
    const [ pendingFile, setPendingFile ] = useState( null );

    const handleFileSelect = useCallback(
        ( event ) => {
            const file = event.target.files[ 0 ];
            if ( !file ) return;

            if ( hasExistingData ) {
                setPendingFile( file );
                setShowConfirm( true );
            } else {
                processFile( file );
            }
        },
        [ hasExistingData ],
    );

    const processFile = useCallback(
        ( file ) => {
            const reader = new FileReader();
            reader.onload = ( e ) => {
                try {
                    let data;
                    if ( file.name.endsWith( ".json" ) ) {
                        data = JSON.parse( e.target.result );
                    } else if ( file.name.endsWith( ".csv" ) ) {
                        // Simple CSV parsing - you might want to use a library like papaparse for more robust parsing
                        const lines = e.target.result.split( "\n" );
                        const headers = lines[ 0 ].split( "," ).map( ( h ) => h.trim() );
                        data = lines
                            .slice( 1 )
                            .filter( ( line ) => line.trim() )
                            .map( ( line ) => {
                                const values = line.split( "," ).map( ( v ) => v.trim() );
                                const obj = {};
                                headers.forEach( ( header, index ) => {
                                    obj[ header ] = values[ index ] || "";
                                } );
                                return obj;
                            } );
                    }
                    onImport( data );
                } catch ( error ) {
                    console.error( "Error parsing file:", error );
                }
            };
            reader.readAsText( file );
        },
        [ onImport ],
    );

    const handleConfirm = useCallback( () => {
        if ( pendingFile ) {
            processFile( pendingFile );
            setPendingFile( null );
        }
        setShowConfirm( false );
    }, [ pendingFile, processFile ] );

    return (
        <>
            <div className="flex items-center gap-2">
                <Input type="file" accept=".json,.csv" onChange={ handleFileSelect } className="hidden" id="file-import" />
                <Button variant="outline" size="sm" asChild>
                    <label htmlFor="file-import" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                    </label>
                </Button>
            </div>

            <Dialog open={ showConfirm } onOpenChange={ setShowConfirm }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Replace Existing Data?</DialogTitle>
                        <DialogDescription>
                            You have existing table data. Do you want to replace it with the imported data?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setShowConfirm( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ handleConfirm }>Replace Data</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} );

/**
 * Row details sidebar component
 */
const RowDetailsSidebar = memo( ( { rowData, isOpen, onClose } ) => {
    if ( !rowData ) return null;

    return (
        <Sheet open={ isOpen } onOpenChange={ onClose }>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Row Details</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    { Object.entries( rowData ).map( ( [ key, value ], index ) => (
                        <div key={ index } className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{ formatText( key ) }</span>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                { typeof value === "object" && value !== null ? (
                                    <SubTable data={ value } containerID={ `sidebar-${ index }` } tableID="sidebar" />
                                ) : (
                                    <span className="text-sm">{ String( value ) }</span>
                                ) }
                            </div>
                        </div>
                    ) ) }
                </div>
            </SheetContent>
        </Sheet>
    );
} );

/**
 * Gets the appropriate input type based on value
 * @param {any} value - The value to determine input type for
 * @returns {string} Input type
 */
const getInputType = ( value ) => {
    if ( typeof value === "number" ) return "number";
    if ( typeof value === "boolean" ) return "checkbox";
    if ( typeof value === "string" ) {
        if ( value.length > 255 ) return "textarea";
        if ( value.match( /^\d{4}-\d{2}-\d{2}$/ ) ) return "date";
        if ( value.match( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/ ) ) return "datetime-local";
    }
    return "text";
};

/**
 * Editable cell component for inline editing
 */
const EditableCell = memo( ( { value, onSave, onCancel, isEditing, cellKey, rowIndex } ) => {
    const [ editValue, setEditValue ] = useState( value );
    const inputType = getInputType( value );

    const handleSave = useCallback( () => {
        console.log( "[v0] Saving cell value:", { cellKey, rowIndex, oldValue: value, newValue: editValue } );
        onSave( editValue );
    }, [ editValue, onSave, cellKey, rowIndex, value ] );

    const handleKeyPress = useCallback(
        ( e ) => {
            if ( e.key === "Enter" && inputType !== "textarea" ) {
                handleSave();
            } else if ( e.key === "Escape" ) {
                onCancel();
            }
        },
        [ handleSave, onCancel, inputType ],
    );

    if ( !isEditing ) {
        return (
            <span className="truncate max-w-xs" title={ String( value ) }>
                { String( value ) }
            </span>
        );
    }

    if ( inputType === "textarea" ) {
        return (
            <textarea
                value={ editValue }
                onChange={ ( e ) => setEditValue( e.target.value ) }
                onKeyDown={ handleKeyPress }
                className="w-full h-20 p-2 border border-input bg-background text-sm rounded-md resize-none"
                autoFocus
            />
        );
    }

    if ( inputType === "checkbox" ) {
        return <Checkbox checked={ editValue } onCheckedChange={ setEditValue } autoFocus />;
    }

    return (
        <Input
            type={ inputType }
            value={ editValue }
            onChange={ ( e ) => setEditValue( inputType === "number" ? Number( e.target.value ) : e.target.value ) }
            onKeyDown={ handleKeyPress }
            className="h-8"
            autoFocus
        />
    );
} );

/**
 * Main DynamicTable component
 */
const DynamicTable = ( {
    initialData = [],
    dataName = "Table Data",
    isFilterable = true,
    isSortable = true,
    rowOnClick = () => { },
    cellOnClick = () => { },
    onEdit = null,
    useRowActions = true,
    rowActions = [],
    debug = false,
} ) => {
    // State management
    const [ tableData, setTableData ] = useState( () => {
        console.log( "[v0] Initializing table data:", initialData );
        return initialData;
    } );
    const [ entriesPerPage, setEntriesPerPage ] = useState( 10 );
    const [ pageNum, setPageNum ] = useState( 0 );
    const [ hiddenColumns, setHiddenColumns ] = useState( [] ); // Fixed to use array for hidden columns
    const [ filters, setFilters ] = useState( [] );
    const [ globalSearch, setGlobalSearch ] = useState( "" ); // Added global search state
    const [ showFlattened, setShowFlattened ] = useState( false );
    const [ sortKey, setSortKey ] = useState( "" );
    const [ sortOrder, setSortOrder ] = useState( "asc" );
    const [ selectedRow, setSelectedRow ] = useState( null );
    const [ showSidebar, setShowSidebar ] = useState( false );
    const [ editingCell, setEditingCell ] = useState( null ); // Added editing state: {rowIndex, cellKey}

    const tableID = useMemo( () => Math.floor( Math.random() * 1000000 ), [] );

    const headers = useMemo( () => {
        if ( !utils.val.isValidArray( tableData, true ) ) return [];

        const sampleData = showFlattened ? utils.ao.flattenObjArray( appendIndex( tableData ) ) : appendIndex( tableData );
        const headerKeys = utils.ao.getObjKeys( sampleData[ 0 ] );

        if ( utils.val.isValidArray( rowActions, true ) || useRowActions ) {
            headerKeys.push( {
                id: headerKeys.length,
                key: "actions",
                value: "actions",
                label: "Actions",
            } );
        }
        return headerKeys;
    }, [ tableData, rowActions, useRowActions, showFlattened ] );

    const processedData = useMemo( () => {
        console.log( "[v0] Processing data:", {
            tableDataLength: tableData.length,
            filters,
            globalSearch,
            sortKey,
            sortOrder,
        } );

        if ( !utils.val.isValidArray( tableData, true ) ) return [];

        let temp = showFlattened ? utils.ao.flattenObjArray( appendIndex( tableData ) ) : appendIndex( tableData );

        if ( globalSearch.trim() ) {
            temp = temp.filter( ( row ) => {
                const rowString = JSON.stringify( row ).toLowerCase();
                return rowString.includes( globalSearch.toLowerCase() );
            } );
        }

        // Apply column filters
        temp = utils.ao.filterDataFast( temp, filters );

        // Apply sorting
        if ( sortKey && temp.length > 0 ) {
            temp = utils.ao.keySortData( temp, sortKey, sortOrder );
        }

        console.log( "[v0] Processed data result:", { length: temp.length, sortKey, sortOrder, globalSearch } );
        return temp;
    }, [ tableData, filters, globalSearch, showFlattened, sortKey, sortOrder ] );

    /**
     * Changes the current page
     */
    const changePage = useCallback( ( dataLen, page, numPerPage ) => {
        const numPages = Math.ceil( dataLen / Number.parseInt( numPerPage ) );
        if ( page >= 0 && page < numPages ) {
            setPageNum( Number.parseInt( page ) );
        }
    }, [] );

    /**
     * Updates filters for columns
     */
    const changeFilters = useCallback( ( key, filter ) => {
        setFilters( ( prevFilters ) => {
            if ( !prevFilters ) return filter ? [ { key, value: filter } ] : [];

            const filterKeys = prevFilters.map( ( item ) => item.key );
            const existingIndex = filterKeys.indexOf( key );

            if ( existingIndex > -1 ) {
                if ( utils.val.isTruthy( filter ) ) {
                    return prevFilters.map( ( item ) => ( item.key === key ? { key, value: filter } : item ) );
                } else {
                    return prevFilters.filter( ( item ) => item.key !== key );
                }
            } else {
                return utils.val.isTruthy( key ) && utils.val.isTruthy( filter )
                    ? [ ...prevFilters, { key, value: filter } ]
                    : prevFilters;
            }
        } );
    }, [] );

    /**
     * Handles header click for sorting
     */
    const handleHeaderClick = useCallback( ( headerIndex, key, order ) => {
        console.log( "[v0] Header clicked for sorting:", { key, order } );
        setSortKey( key );
        setSortOrder( order );
    }, [] );

    /**
     * Handles cell edit save
     */
    const handleCellSave = useCallback(
        ( rowIndex, cellKey, newValue ) => {
            console.log( "[v0] Saving cell edit:", { rowIndex, cellKey, newValue } );

            setTableData( ( prevData ) => {
                const newData = [ ...prevData ];
                const actualRowIndex = pageNum * entriesPerPage + rowIndex;

                if ( newData[ actualRowIndex ] ) {
                    // Handle nested object updates
                    const keys = cellKey.split( "." );
                    let current = newData[ actualRowIndex ];

                    for ( let i = 0; i < keys.length - 1; i++ ) {
                        if ( !current[ keys[ i ] ] ) current[ keys[ i ] ] = {};
                        current = current[ keys[ i ] ];
                    }

                    current[ keys[ keys.length - 1 ] ] = newValue;
                }

                return newData;
            } );

            setEditingCell( null );

            // Call user-provided onEdit handler if available
            if ( onEdit ) {
                onEdit( rowIndex, cellKey, newValue );
            }
        },
        [ pageNum, entriesPerPage, onEdit ],
    );

    /**
     * Handles starting cell edit
     */
    const handleCellEdit = useCallback( ( rowIndex, cellKey ) => {
        console.log( "[v0] Starting cell edit:", { rowIndex, cellKey } );
        setEditingCell( { rowIndex, cellKey } );
    }, [] );

    /**
     * Handles canceling cell edit
     */
    const handleCellCancel = useCallback( () => {
        console.log( "[v0] Canceling cell edit" );
        setEditingCell( null );
    }, [] );

    /**
     * Handles cloning a row
     */
    const handleCloneRow = useCallback(
        ( rowIndex ) => {
            setTableData( ( prevData ) => {
                const newData = [ ...prevData ];
                const actualRowIndex = pageNum * entriesPerPage + rowIndex;
                const rowToClone = { ...newData[ actualRowIndex ] };

                // Generate new ID if the row has an id field
                if ( rowToClone.id ) {
                    const maxId = Math.max( ...newData.map( ( row ) => row.id || 0 ) );
                    rowToClone.id = maxId + 1;
                }

                // Insert the cloned row right after the original
                newData.splice( actualRowIndex + 1, 0, rowToClone );
                return newData;
            } );
        },
        [ pageNum, entriesPerPage ],
    );

    /**
     * Downloads table data as CSV
     */
    const downloadData = useCallback( () => {
        const options = {
            filename: `${ dataName.replace( /\s+/g, "_" ) }_Export`,
            fieldSeparator: ",",
            quoteStrings: '"',
            decimalSeparator: ".",
            showLabels: true,
            showTitle: true,
            title: dataName,
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
        };

        const flattenedData = utils.ao.flattenObjArray( tableData );
        const csvConfig = mkConfig( options );
        const csv = generateCsv( csvConfig )( flattenedData );
        downloadCsv( csvConfig )( csv );
    }, [ tableData, dataName ] );

    /**
     * Handles row click to show details
     */
    const handleRowClick = useCallback(
        ( rowIndex, rowData ) => {
            setSelectedRow( rowData );
            setShowSidebar( true );
            rowOnClick( rowIndex, rowData );
        },
        [ rowOnClick ],
    );

    /**
     * Handles data import
     */
    const handleImport = useCallback( ( newData ) => {
        console.log( "[v0] Importing new data:", newData );
        if ( utils.val.isValidArray( newData, true ) ) {
            setTableData( newData );
            setPageNum( 0 );
            setFilters( [] );
            setSortKey( "" );
            setSortOrder( "asc" );
            setGlobalSearch( "" ); // Reset global search on import
        }
    }, [] );

    // Reset page when entries per page changes
    useEffect( () => {
        if ( processedData && utils.val.isValidArray( processedData, true ) ) {
            changePage( processedData.length, 0, entriesPerPage );
        }
    }, [ entriesPerPage, changePage, processedData ] );

    const paginatedData = useMemo( () => {
        return getPageEntries( processedData, pageNum, entriesPerPage );
    }, [ processedData, pageNum, entriesPerPage ] );

    /**
     * Handles global search change
     */
    const handleGlobalSearch = useCallback( ( searchTerm ) => {
        console.log( "[v0] Global search:", searchTerm );
        setGlobalSearch( searchTerm );
        setPageNum( 0 ); // Reset to first page when searching
    }, [] );

    if ( !utils.val.isValidArray( tableData, true ) ) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        { dataName }
                        <FileImport onImport={ handleImport } hasExistingData={ false } />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No data available. Import a JSON or CSV file to get started.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Table Options */ }
            <Card className="p-1">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <FileImport onImport={ handleImport } hasExistingData={ utils.val.isValidArray( tableData, true ) } />

                        <Button variant="outline" size="sm" onClick={ downloadData }>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Search:</label>
                            <Input
                                placeholder="Search entire table..."
                                value={ globalSearch }
                                onChange={ ( e ) => handleGlobalSearch( e.target.value ) }
                                className="w-48"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Rows per page:</label>
                            <Select
                                value={ entriesPerPage.toString() }
                                onValueChange={ ( value ) => setEntriesPerPage( Number.parseInt( value ) ) }
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    { [ 5, 10, 15, 20, 30, 50, 75, 100 ].map( ( num ) => (
                                        <SelectItem key={ num } value={ num.toString() }>
                                            { num }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="flatten" checked={ showFlattened } onCheckedChange={ setShowFlattened } />
                            <label htmlFor="flatten" className="text-sm font-medium">
                                Show flattened
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */ }
            <Card className="p-1">
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            {/* Table Header - Always render headers even when no data */ }
                            <TableHeader>
                                <TableRow>
                                    { headers.map( ( header ) => (
                                        <TableHead
                                            key={ header.key }
                                            className={ `${ isColumnHidden( header.key, hiddenColumns ) ? "hidden" : "" } ${ isSortable ? "cursor-pointer hover:bg-muted" : "" }` }
                                            onClick={ () => {
                                                if ( isSortable && header.key !== "actions" ) {
                                                    const newOrder = sortKey === header.key && sortOrder === "asc" ? "desc" : "asc";
                                                    handleHeaderClick( 0, header.key, newOrder );
                                                }
                                            } }
                                        >
                                            { formatText( header.key ) }
                                            { sortKey === header.key && <span className="ml-1">{ sortOrder === "asc" ? "↑" : "↓" }</span> }
                                        </TableHead>
                                    ) ) }
                                </TableRow>

                                {/* Filter Row - Always render filter row when filterable */ }
                                { isFilterable && (
                                    <TableRow>
                                        { headers.map( ( header ) => (
                                            <TableHead
                                                key={ `filter-${ header.key }` }
                                                className={ isColumnHidden( header.key, hiddenColumns ) ? "hidden" : "" }
                                            >
                                                { header.key !== "actions" && (
                                                    <Input
                                                        placeholder={ `Filter ${ formatText( header.key ) }` }
                                                        className="h-8"
                                                        onChange={ ( e ) => changeFilters( header.key, e.target.value ) }
                                                    />
                                                ) }
                                            </TableHead>
                                        ) ) }
                                    </TableRow>
                                ) }
                            </TableHeader>

                            {/* Table Body */ }
                            <TableBody>
                                { paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={ headers.length } className="text-center py-8 text-muted-foreground">
                                            { globalSearch.trim() || filters.length > 0
                                                ? "No data matches the current search and filters."
                                                : "No data available." }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map( ( row, rowIndex ) => (
                                        <TableRow
                                            key={ rowIndex }
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={ () => handleRowClick( rowIndex, row ) }
                                        >
                                            { headers.map( ( header ) => {
                                                const cellValue = row[ header.key ] || "-";
                                                const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.cellKey === header.key;

                                                return (
                                                    <TableCell
                                                        key={ `${ rowIndex }-${ header.key }` }
                                                        className={ isColumnHidden( header.key, hiddenColumns ) ? "hidden" : "" }
                                                        onClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            cellOnClick( header.key, cellValue );
                                                        } }
                                                        onDoubleClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            if ( header.key !== "actions" && header.key !== "index" && typeof cellValue !== "object" ) {
                                                                handleCellEdit( rowIndex, header.key );
                                                            }
                                                        } }
                                                    >
                                                        { header.key === "actions" ? (
                                                            <div className="flex gap-1">
                                                                { utils.val.isValidArray( rowActions, true ) &&
                                                                    rowActions.map( ( action, actionIndex ) => (
                                                                        <Button
                                                                            key={ actionIndex }
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={ ( e ) => {
                                                                                e.stopPropagation();
                                                                                action.onClick( rowIndex, row );
                                                                            } }
                                                                        >
                                                                            { action.icon && <action.icon className="h-4 w-4 mr-1" /> }
                                                                            { action.name }
                                                                        </Button>
                                                                    ) ) }

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        handleCloneRow( rowIndex );
                                                                    } }
                                                                    title="Clone row"
                                                                >
                                                                    📋
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        if ( editingCell?.rowIndex === rowIndex ) {
                                                                            handleCellCancel();
                                                                        } else {
                                                                            // Start editing the first non-action column
                                                                            const firstEditableHeader = headers.find(
                                                                                ( h ) => h.key !== "actions" && h.key !== "index",
                                                                            );
                                                                            if ( firstEditableHeader ) {
                                                                                handleCellEdit( rowIndex, firstEditableHeader.key );
                                                                            }
                                                                        }
                                                                    } }
                                                                >
                                                                    { editingCell?.rowIndex === rowIndex ? (
                                                                        <X className="h-4 w-4" />
                                                                    ) : (
                                                                        <Edit className="h-4 w-4" />
                                                                    ) }
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        handleRowClick( rowIndex, row );
                                                                    } }
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : typeof cellValue === "object" && cellValue !== null ? (
                                                            <SubTable data={ cellValue } containerID={ `${ rowIndex }-${ header.key }` } tableID={ tableID } />
                                                        ) : header.key !== "index" ? (
                                                            <EditableCell
                                                                value={ cellValue }
                                                                isEditing={ isEditing }
                                                                cellKey={ header.key }
                                                                rowIndex={ rowIndex }
                                                                onSave={ ( newValue ) => handleCellSave( rowIndex, header.key, newValue ) }
                                                                onCancel={ handleCellCancel }
                                                            />
                                                        ) : (
                                                            <span className="truncate max-w-xs" title={ String( cellValue ) }>
                                                                { String( cellValue ) }
                                                            </span>
                                                        ) }
                                                    </TableCell>
                                                );
                                            } ) }
                                        </TableRow>
                                    ) )
                                ) }
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination - Show pagination info even when no results */ }
                    <TablePagination
                        tableID={ tableID }
                        numEntries={ processedData.length }
                        entriesPerPage={ entriesPerPage }
                        pageNum={ pageNum }
                        changePage={ changePage }
                    />
                </CardContent>
            </Card>

            {/* Row Details Sidebar */ }
            <RowDetailsSidebar rowData={ selectedRow } isOpen={ showSidebar } onClose={ () => setShowSidebar( false ) } />
        </div>
    );
};

export default DynamicTable;
