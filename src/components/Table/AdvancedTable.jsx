import { useEffect, useState, useRef, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Filter, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function AdvancedTable () {
    // State management
    const [ data, setData ] = useState( [] );
    const [ displayData, setDisplayData ] = useState( [] );
    const [ sortConfig, setSortConfig ] = useState( { key: "name", direction: "asc" } );
    const [ columnWidths, setColumnWidths ] = useState( {} );
    const [ filters, setFilters ] = useState( {} );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ pageSize, setPageSize ] = useState( 5 );
    const [ editingCell, setEditingCell ] = useState( null );
    const [ editValue, setEditValue ] = useState( "" );

    // Refs for resizing
    const tableRef = useRef( null );
    const resizingRef = useRef( {
        isResizing: false,
        columnId: null,
        startX: 0,
        startWidth: 0,
    } );

    // Column definitions
    const columns = [
        {
            id: "name",
            header: "Name",
            accessorKey: "name",
            cell: ( row ) => <div className="truncate font-medium">{ row.name }</div>,
            sortUndefined: "last",
            sortDescFirst: false,
            width: 150,
        },
        {
            id: "email",
            header: "Email",
            accessorKey: "email",
            width: 200,
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
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            width: 100,
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
        },
        {
            id: "department",
            header: "Department",
            accessorKey: "department",
            width: 150,
        },
        {
            id: "role",
            header: "Role",
            accessorKey: "role",
            width: 120,
        },
        {
            id: "joinDate",
            header: "Join Date",
            accessorKey: "joinDate",
            width: 120,
        },
        {
            id: "lastActive",
            header: "Last Active",
            accessorKey: "lastActive",
            width: 120,
        },
        {
            id: "performance",
            header: "Performance",
            accessorKey: "performance",
            width: 120,
        },
    ];

    // Initialize column widths
    useEffect( () => {
        const initialWidths = {};
        columns.forEach( ( column ) => {
            initialWidths[ column.id ] = column.width || 150;
        } );
        setColumnWidths( initialWidths );
    }, [] );

    // Fetch data
    useEffect( () => {
        async function fetchPosts () {
            const res = await fetch( "https://res.cloudinary.com/dlzlfasou/raw/upload/users-01_fertyx.json" );
            const fetchedData = await res.json();
            setData( fetchedData.slice( 0, 5 ) ); // Limit to 5 items
        }
        fetchPosts();
    }, [] );

    // Apply sorting, filtering, and pagination
    useEffect( () => {
        let processedData = [ ...data ];

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

        // Apply sorting
        if ( sortConfig.key ) {
            processedData.sort( ( a, b ) => {
                // Handle undefined values
                if ( a[ sortConfig.key ] === undefined ) return sortConfig.direction === "asc" ? 1 : -1;
                if ( b[ sortConfig.key ] === undefined ) return sortConfig.direction === "asc" ? -1 : 1;

                // Handle string comparison
                if ( typeof a[ sortConfig.key ] === "string" ) {
                    return sortConfig.direction === "asc"
                        ? a[ sortConfig.key ].localeCompare( b[ sortConfig.key ] )
                        : b[ sortConfig.key ].localeCompare( a[ sortConfig.key ] );
                }

                // Handle number comparison
                return sortConfig.direction === "asc"
                    ? a[ sortConfig.key ] - b[ sortConfig.key ]
                    : b[ sortConfig.key ] - a[ sortConfig.key ];
            } );
        }

        // Apply pagination
        const startIndex = ( currentPage - 1 ) * pageSize;
        const paginatedData = processedData.slice( startIndex, startIndex + pageSize );

        setDisplayData( paginatedData );
    }, [ data, sortConfig, filters, currentPage, pageSize ] );

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
        if ( !resizingRef.current.isResizing ) return;

        resizingRef.current.isResizing = false;
        resizingRef.current.columnId = null;

        document.removeEventListener( "mousemove", handleMouseMove );
        document.removeEventListener( "mouseup", handleMouseUp );
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, [ handleMouseMove ] );

    const startResize = useCallback(
        ( e, columnId ) => {
            e.preventDefault();
            e.stopPropagation();

            resizingRef.current = {
                isResizing: true,
                columnId,
                startX: e.clientX,
                startWidth: columnWidths[ columnId ] || 150,
            };

            document.addEventListener( "mousemove", handleMouseMove );
            document.addEventListener( "mouseup", handleMouseUp );
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        },
        [ columnWidths, handleMouseMove, handleMouseUp ],
    );

    // Sorting handler
    const handleSort = ( columnId ) => {
        let direction = "asc";
        if ( sortConfig.key === columnId && sortConfig.direction === "asc" ) {
            direction = "desc";
        }
        setSortConfig( { key: columnId, direction } );
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

    const handleCellEdit = ( e ) => {
        setEditValue( e.target.value );
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

    // Calculate total table width
    const getTotalTableWidth = () => {
        return Object.values( columnWidths ).reduce( ( sum, width ) => sum + width, 0 );
    };

    // Render cell content
    const renderCellContent = ( row, column, rowIndex ) => {
        const isEditing = editingCell && editingCell.rowIndex === rowIndex && editingCell.columnId === column.id;

        if ( isEditing ) {
            return (
                <Input
                    value={ editValue }
                    onChange={ handleCellEdit }
                    onBlur={ saveEdit }
                    onKeyDown={ ( e ) => {
                        if ( e.key === "Enter" ) saveEdit();
                        if ( e.key === "Escape" ) cancelEdit();
                    } }
                    autoFocus
                    className="w-full h-8 p-1"
                />
            );
        }

        if ( column.cell ) {
            return column.cell( row );
        }

        return row[ column.accessorKey ];
    };

    return (
        <div className="bg-background max-w-[1000px]">
            <div className="flex justify-between mb-4">
                <div className="flex gap-2 flex-wrap">
                    { columns.map( ( column ) => (
                        <Popover key={ column.id }>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <Filter className="h-3 w-3" />
                                    { column.header }
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
                    ) ) }
                </div>
            </div>

            <div className="overflow-auto border rounded-md">
                <div ref={ tableRef } className="relative">
                    <style jsx global>{ `
            .resize-handle {
              position: absolute;
              right: 0;
              top: 0;
              height: 100%;
              width: 8px;
              background-color: transparent;
              cursor: col-resize;
              z-index: 10;
              touch-action: none;
            }
            
            .resize-handle:hover {
              background-color: rgba(0, 0, 0, 0.1);
            }
            
            .resize-handle:active {
              background-color: rgba(0, 0, 0, 0.2);
            }
            
            .resizing {
              cursor: col-resize;
              user-select: none;
            }
          `}</style>

                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                { columns.map( ( column ) => (
                                    <TableHead
                                        key={ column.id }
                                        className="relative h-10 select-none border-t"
                                        style={ {
                                            width: `${ columnWidths[ column.id ] || 150 }px`,
                                            position: "relative",
                                        } }
                                        aria-sort={
                                            sortConfig.key === column.id
                                                ? sortConfig.direction === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : "none"
                                        }
                                    >
                                        <div
                                            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                                            onClick={ () => handleSort( column.id ) }
                                            onKeyDown={ ( e ) => {
                                                if ( e.key === "Enter" || e.key === " " ) {
                                                    e.preventDefault();
                                                    handleSort( column.id );
                                                }
                                            } }
                                            tabIndex={ 0 }
                                        >
                                            <span className="truncate">{ column.header }</span>
                                            { sortConfig.key === column.id ? (
                                                sortConfig.direction === "asc" ? (
                                                    <ChevronUp className="shrink-0 opacity-60" size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                                ) : (
                                                    <ChevronDown className="shrink-0 opacity-60" size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                                )
                                            ) : (
                                                <ChevronsUpDown className="shrink-0 opacity-30" size={ 16 } strokeWidth={ 2 } />
                                            ) }
                                        </div>
                                        <div
                                            className="resize-handle"
                                            onDoubleClick={ ( e ) => {
                                                e.stopPropagation();
                                                setColumnWidths( ( prev ) => ( {
                                                    ...prev,
                                                    [ column.id ]: column.width || 150,
                                                } ) );
                                            } }
                                            onMouseDown={ ( e ) => startResize( e, column.id ) }
                                        />
                                    </TableHead>
                                ) ) }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            { displayData.length ? (
                                displayData.map( ( row, rowIndex ) => (
                                    <TableRow key={ row.id || rowIndex } data-state={ row.selected && "selected" }>
                                        { columns.map( ( column ) => (
                                            <TableCell
                                                key={ column.id }
                                                className="truncate"
                                                style={ {
                                                    width: `${ columnWidths[ column.id ] || 150 }px`,
                                                    maxWidth: `${ columnWidths[ column.id ] || 150 }px`,
                                                } }
                                                onDoubleClick={ () =>
                                                    handleCellDoubleClick( rowIndex, column.accessorKey, row[ column.accessorKey ] )
                                                }
                                            >
                                                { renderCellContent( row, column, rowIndex ) }
                                            </TableCell>
                                        ) ) }
                                    </TableRow>
                                ) )
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={ columns.length } className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) }
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */ }
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                        Showing { displayData.length } of { data.length } items
                    </p>
                </div>
                <div className="flex items-center space-x-6">
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
                                { [ 5, 10, 20, 50 ].map( ( size ) => (
                                    <SelectItem key={ size } value={ size.toString() }>
                                        { size }
                                    </SelectItem>
                                ) ) }
                            </SelectContent>
                        </Select>
                    </div>
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

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Custom table with resizable and sortable columns made with ShadCN/Radix components
            </p>
        </div>
    );
}

export { AdvancedTable }

