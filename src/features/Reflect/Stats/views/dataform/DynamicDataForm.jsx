import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import * as utils from 'akashatools';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
// import { DataItemRow as DataItemRowBasic } from "@/features/Reflect/Stats/components/DataItemRow";
import { usePagination } from "@/features/Reflect/Stats/hooks/usePagination";
import { filterItems } from "@/features/Reflect/Stats/utils/dataUtils";
import { Download, Plus, Save, Trash2, Upload, X } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { useFilteredData } from "@/features/Reflect/Stats/hooks/useFilteredData";
import useReflect from "@/lib/hooks/useReflect";
import useStatsStore from "@/store/stats.store";
import useGlobalStore from "@/store/global.store";
import { DATA_TYPES } from "@/lib/config/config";
import { d8 } from "@/lib/utilities/time";
// import DataItemRow from "@/features/Reflect/components/DataItemRow";
// import ActionBar from "@/features/Reflect/components/ActionBar/ActionBar";
// import FilterBar from "@/features/Reflect/components/FilterBar/FilterBar";
// import DataTable from "@/features/Reflect/components/DataTable/DataTable";
import DataValueInput from "@/features/Reflect/Stats/components/DataForm/DataValueInput";
import DataItemRow from "@/features/Reflect/Stats/components/DataTable/DataItemRow";
import ActionBar from "@/features/Reflect/Stats/components/ActionBar/ActionBar";
import FilterBar from "@/features/Reflect/Stats/components/FilterBar/FilterBar";
import DataTable from "@/features/Reflect/Stats/components/DataTable/DataTable";
import { useStatsContext } from "@/features/Reflect/Stats/contexts/StatsContext";
import DataTypeSelect from "../../components/DataForm/DataTypeSelect";
import DataKeyDropdown from "../../components/DataForm/DataKeyDropdown";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";
import { invalid } from "@/lib/utilities/data";

const DynamicDataForm = ( { showRowLabels = false } ) => {
    const {
        // Stats store data
        requestFetchStats, setRequestFetchStats,
        statsData, setStatsData,
        selectedDate, setSelectedDate,
        selectedEndDate, setSelectedEndDate,
        activePageTab, setActivePageTab,
        showSidebarCalendar, setShowSidebarCalendar,
        toggleShowSidebarCalendar,
        activeSidebarTab, setActiveSidebarTab,
        sidebarOpen, setSidebarOpen,
        handleDateSelect,
        clearDateSelection,
        toggleSidebar,
        error, setError,
        clearError,
        itemsPerPage, setStatsPerPage,
        getAllUniqueDataKeys,
        addStat,
        addStats,
        insertStat,
        createStat,
        updateStat,
        updateMany,
        deleteStat,
        deleteStats,
        rearrangeStats,
        exportStats,
        fetchStats,
        importStats,
        getStatById,
        getStatsByType,
        getStatsByDateRange,

        // Habits store data
        habits,
        loading,
        visibleHabits, setVisibleHabits,
        activeTab, setActiveTab,
        toggleHabitVisibility,
        loadHabits,
        createHabit,
        updateHabitActivity,
        getActiveHabits,
        getVisibleHabits,
        getHabitsForDate,
        getActivityForDate,
    } = useReflectContext();

    const workspaceId = useGlobalStore( ( state ) => state.workspaceId );
    const user = useGlobalStore( ( state ) => state.user );
    const schemas = useGlobalStore( ( state ) => state.schemas );

    const {
        // Handler functions
        handleExport,
        handleImportData,
        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
        handleFetchStatsById,
        handleCloneStats,
        handleCreateStats,
        handleUpdateStats,
        handleDeleteStats,
        handleCancel,

        // Config values
        columns,

        // State variables
        dialogType, setDialogType,
        dialogData, setDialogData,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,
    } = useReflect();

    const [ dataKey, setDataKey ] = useState( "" );
    const [ dataType, setDataType ] = useState( "String" );
    const [ dataValue, setDataValue ] = useState( "" );
    const [ dataTimeStamp, setDataTimeStamp ] = useState( selectedDate ? new Date( selectedDate ) : new Date( Date.now() ) );
    const [ searchTerm, setSearchTerm ] = useState( "" );
    const [ filterType, setFilterType ] = useState( "all" );
    const [ filterKey, setFilterKey ] = useState( "all" );
    const [ editingId, setEditingId ] = useState( null );
    const [ sortConfig, setSortConfig ] = useState( { key: "timeStamp", direction: "desc" } );

    const [ selectedStats, setSelectedStats ] = useState( [] );
    const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
    const [ isImportDialogOpen, setIsImportDialogOpen ] = useState( false );
    const [ importData, setImportData ] = useState( "" );
    const [ importError, setImportError ] = useState( "" );
    const [ dragIndex, setDragIndex ] = useState( null );
    const fileInputRef = useRef( null );

    // Clear any store errors when component unmounts
    useEffect( () => {
        return () => {
            if ( error ) clearError();
        };
    }, [ error, clearError ] );

    // Filter items based on search term, filter type, and selected date
    // const { filteredStats } = useFilteredData(
    //   items,
    //   {
    //     // Filters
    //     searchTerm,
    //     filterType,
    //     selectedDate,
    //     selectedEndDate
    //   }
    // );

    const filteredStats = useMemo( () => {
        return filterItems(
            // Stats
            statsData,
            {
                // Filters
                searchTerm,
                filterType,
                filterKey,
                selectedDate,
                selectedEndDate
            }
        );
    }, [ statsData, searchTerm, filterKey, filterType, selectedDate, selectedEndDate ] );

    const sortData = ( items ) => {
        if ( utils.val.isValidArray( items, true ) ) {
            const sorted = [ ...items ];
            sorted.sort( ( a, b ) => {
                if ( sortConfig.key === "timeStamp" ) {
                    const dateA = new Date( a?.timeStamp || 0 );
                    const dateB = new Date( b?.timeStamp || 0 );
                    return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
                } else if ( sortConfig.key === "dataKey" ) {
                    return sortConfig.direction === "asc" ? a?.dataKey?.localeCompare( b?.dataKey ) : b?.dataKey?.localeCompare( a?.dataKey );
                } else if ( sortConfig.key === "dataType" ) {
                    return sortConfig.direction === "asc"
                        ? a.dataType.localeCompare( b.dataType )
                        : b.dataType.localeCompare( a.dataType );
                }
                return 0;
            } );
            return sorted;
        }
    };

    // Sort filtered items
    const sortedStats = useMemo( () => {
        return sortData( filteredStats );
    }, [ statsData, filteredStats, searchTerm, filterKey, filterType, sortConfig ] );

    // Filter, then sort. 
    const [ filteredData, setFilteredData ] = useState( filteredStats );
    const [ sortedData, setSortedData ] = useState( sortedStats );
    const [ renderData, setRenderData ] = useState( sortedData );

    // Pagination
    // const {
    //   totalPages,
    //   paginatedStats: currentStats,
    //   currentPage, setCurrentPage,
    //   itemsPerPage, setStatsPerPage,
    //   paginatedStats,
    //   paginationInfo,
    // } = usePagination( {
    //   items: sortedData,
    //   initialPage: 1,
    //   initialStatsPerPage: 25,
    // } );

    useEffect( () => {
        // Something changed that requires re-calculating what items are shown and in what order.
        let filtered = filterItems(
            // Stats
            statsData,
            {
                // Filters
                searchTerm,
                filterType,
                filterKey,
                selectedDate,
                selectedEndDate,
            }
        );
        setFilteredData( filtered );

        let sorted = sortData( filtered );
        setSortedData( sorted );

        setRenderData( sorted );

        console.log( "DynamicDataForm.jsx :: filtering and sorting changed [statsData, filterKey, filterType, searchTerm, sortConfig, selectedDate, selectedEndDate] ==> [", statsData, filterKey, filterType, searchTerm, sortConfig, selectedDate, selectedEndDate, "], :: [filteredData, sortedData] = [", [ filtered, sorted ], "]" );

    }, [ statsData, filterKey, filterType, searchTerm, sortConfig, selectedDate, selectedEndDate ] );

    // Handle form submission
    /* const handleSubmit = useCallback(
      async ( e ) => {
        e.preventDefault();
        if ( !dataKey.trim() ) return;
  
  
        if ( editingId ) {
          // Updating an item.
          const editedStat = {
            _id: editingId,
            dataKey,
            dataType,
            dataValue,
            entryType: "String",
            timeStamp: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
          };
          let result = await handleUpdateStats( editingId, editedStat );
          if ( result ) {
            console.log( "DynamicDataForm :: HandleSubmit :: edit mode :: result = ", result, " :: ", "editedStat = ", editedStat );
            updateStat( editingId, result );
            setEditingId( null );
          }
        } else {
          // Creating a new item.
          const newStat = {
            // _id: editingId || Date.now().toString(),
            userId: user && utils.val.isObject( user ) ? user?.id : null,
            workspaceId: workspaceId,
            dataKey,
            dataType,
            dataValue,
            entryType: "String",
            timeStamp: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
          };
          let result = await handleCreateStats( newStat );
          if ( result ) {
            console.log( "DynamicDataForm :: HandleSubmit :: add mode :: result = ", result, " :: ", "newStat = ", newStat );
            addStat( result );
          }
        }
  
        // Reset form
        setDataKey( "" );
        setDataType( "String" );
        setDataValue( "" );
      },
      [ dataKey, dataType, dataValue, editingId, addStat, updateStat ],
    ); */

    // Handle form submission
    const handleCreate = async ( e ) => {
        e.preventDefault();
        if ( dataKey === null || dataKey === undefined || !dataKey.trim() ) return;

        // Creating a new item.
        const newStat = {
            // _id: editingId || Date.now().toString(),
            userId: user && utils.val.isObject( user ) ? user?.id : null,
            workspaceId: workspaceId,
            dataKey,
            dataType,
            dataValue,
            entryType: dataType,
            timeStamp: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
        };

        // addStat( newStat );
        let result = await handleCreateStats( newStat );
        if ( result ) {
            // addStat( result );
            setStatsData( [ result, ...statsData ] );
            console.log( "DynamicDataForm :: handleCreate :: result = ", result, " :: ", "newStat = ", newStat );
        }

        // Reset form
        setDataKey( "" );
        setDataType( "String" );
        setDataValue( "" );
    };

    // Add a new item with the selected date if provided
    const handleAddStat = useCallback( async () => {
        try {
            // const newStat = addStat();
            let timeStamp = new Date( dataTimeStamp ? dataTimeStamp : ( selectedDate ? selectedDate : Date.now() ) );
            // if ( selectedDate ) {
            //   // Set the timeStamp to the selected date
            //   timeStamp = new Date( selectedDate );

            //   // If we're in a date range, randomly pick a time within the range
            //   const startTime = selectedDate;
            //   const endTime = selectedEndDate;
            //   if ( selectedEndDate ) {
            //     const randomTime = startTime + Math.random() * ( endTime - startTime );
            //     timeStamp.setTime( randomTime );
            //   } else {
            //     // Set a random time within the day
            //     timeStamp.setHours( Math.floor( Math.random() * 24 ), Math.floor( Math.random() * 60 ), 0, 0 );
            //   }

            //   //  * 24), Math.floor(Math.random() * 60), 0, 0);

            //   // Update the item with the new timeStamp
            //   // setTimeout( () => {
            //   //     updateStat( newStat._id, {
            //   //         timeStamp,
            //   //         // If we have an end date, add it to the metadata
            //   //         _metadata: selectedEndDate
            //   //             ? `Range: ${ selectedDate.toISOString() } to ${ selectedEndDate.toISOString() }`
            //   //             : "",
            //   //     } );
            //   // }, 10 );
            // }

            // Merge the timestamp in with the data. 
            const newStat = {
                userId: user && utils.val.isObject( user ) ? user?.id : null,
                workspaceId: workspaceId,
                timeStamp: timeStamp.getTime(),
                startTime: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
                endTime: new Date( selectedEndDate ? selectedEndDate : Date.now() ).getTime(),
                entryType: "String",
                // dataKey: `dataKey_${ statsData?.length + 1 }`,
                dataKey: null,
                dataType: "String",
                dataValue: "",
                tags: [
                    'stats',
                    d8.getMonthName( new Date( Date.now() ), 'long' ),
                    new Date( Date.now() ).getMonth(),
                    new Date( Date.now() ).getDate(),
                    new Date( Date.now() ).getFullYear(),
                ],
                category: "stats",
                _metadata: selectedEndDate
                    // If we have an end date, add it to the metadata
                    ? `Range: ${ selectedDate.toISOString() } to ${ selectedEndDate.toISOString() }`
                    : "",
            };

            console.log( "DynamicDataForm :: handleAddStat :: newStat = ", newStat );

            let res = await handleCreateStats( newStat );
            if ( res && utils.val.isObject( res ) ) { addStat( res ); }
            else { return null; }
        } catch ( error ) {
            console.error( "Error adding new item:", error );
        }
    }, [ addStat, selectedDate, selectedEndDate, updateStat, statsData, dataTimeStamp ] );

    // Handle edit
    const handleEdit = useCallback( ( item ) => {
        setEditingId( item?._id );
        setDataKey( item.dataKey );
        setDataType( item.dataType );
        setDataValue( item.dataValue );
        setDataTimeStamp( item.timeStamp );
    }, [] );

    // Handle sort
    const handleSort = useCallback( ( key ) => {
        setSortConfig( ( prevConfig ) => ( {
            key,
            direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
        } ) );
    }, [] );

    // Reset form when editing is cancelled
    const handleCancelEdit = useCallback( () => {
        setEditingId( null );
        setDataKey( "" );
        setDataType( "String" );
        setDataValue( "" );
        setDataTimeStamp( null );
    }, [] );

    // Clear all filters
    const handleClearFilters = useCallback( () => {
        setSearchTerm( "" );
        setFilterType( "all" );
        setFilterKey( "all" );
        clearDateSelection();
    }, [ clearDateSelection ] );

    // Memoize the search input change handler
    const handleSearchChange = useCallback( ( value ) => {
        setSearchTerm( value );
    }, [] );

    // Memoize the filter key change handler
    const handleFilterKeyChange = useCallback( ( value ) => {
        // console.log( "handleFilterKeyChange :: value = ", value );
        setFilterKey( value );
    }, [] );

    // Memoize the filter type change handler
    const handleFilterTypeChange = useCallback( ( value ) => {
        setFilterType( value );
    }, [] );

    // Memoize the data key change handler
    const handleDataKeyChange = useCallback( ( value ) => {
        setDataKey( value );
    }, [] );

    // Memoize the data value change handler
    const handleDataValueChange = useCallback( ( value ) => {
        setDataValue( value );
    }, [] );

    // Memoize the data type change handler
    const handleDataTypeChange = useCallback( ( value ) => {
        setDataType( value );
    }, [] );

    // Memoize the data timestamp change handler
    const handleDataTimestampChange = useCallback( ( value ) => {
        setDataTimeStamp(
            value && new Date( value ) instanceof Date
                ? new Date( value )
                : new Date( Date.now() )
        );
    }, [] );

    // Memoize the delete handler
    const handleDelete = useCallback(
        async ( id ) => {
            let result = await handleDeleteStats( id );
            if ( result ) deleteStat( id );
        },
        [ deleteStat, handleDeleteStats ],
    );

    const handleDeleteSelected = useCallback( async () => {
        let results = [];
        if ( utils.val.isValidArray( selectedStats, true ) ) {
            results = selectedStats?.map( async ( id ) => ( await handleDeleteStats( id ) ) );
        }
        if ( results.every( ( result ) => ( result ) ) ) {
            console.alert( "All selected items were successfully deleted." );
        }
        deleteStats( selectedStats );
        setSelectedStats( [] );
        setIsDeleteDialogOpen( false );

        // handleDeleteStats( selectedStats );
    }, [ selectedStats, deleteStats ] );

    const handleDragStart = useCallback( ( e, index ) => {
        setDragIndex( index );
        e.dataTransfer.effectAllowed = "move";
    }, [] );

    const handleDragOver = useCallback(
        ( index ) => {
            if ( dragIndex === null || dragIndex === index ) return;
            rearrangeStats( dragIndex, index );
            setDragIndex( index );
        },
        [ dragIndex, rearrangeStats ],
    );

    const handleDragEnd = useCallback( () => {
        setDragIndex( null );
    }, [] );

    const handleRowSelect = useCallback( ( ids, checked ) => {
        setSelectedStats( ( prev ) => {
            if ( checked ) {
                return [ ...new Set( [ ...prev, ...ids ] ) ];
            } else {
                return prev.filter( ( id ) => !ids.includes( id ) );
            }
        } );
    }, [] );

    const handleImportClick = useCallback( () => {
        fileInputRef.current?.click();
    }, [] );

    const handleFileChange = useCallback( ( e ) => {
        const file = e.target.files?.[ 0 ];
        if ( !file ) return;

        const reader = new FileReader();
        reader.onload = ( event ) => {
            setImportData( event.target?.result );
            setIsImportDialogOpen( true );
        };
        reader.readAsText( file );

        // Reset the input
        e.target.value = "";
    }, [] );

    const handleImportConfirm = useCallback( () => {
        try {
            // Update local data.
            const importedData = importStats( importData );

            // Update server by adding all new items. 
            if ( utils.val.isValidArray( importedData, true ) ) {
                handleImportData( importedData );
            }
            if ( success ) {
                setIsImportDialogOpen( false );
                setImportError( "" );
            } else {
                setImportError( "Invalid data format. Please provide a valid JSON array." );
            }
        } catch ( error ) {
            setImportError( "Error importing data: " + error.message );
        }
    }, [ importData, importStats ] );

    // Define action buttons
    const actionButtons = useMemo(
        () => [
            {
                icon: <Plus className={ `h-4 w-4` } />,
                label: "New",
                onClick: handleAddStat,
                variant: "default",
                className: "bg-washed-blue-600 hover:bg-washed-blue-700 text-white h-8 text-xs",
            },
            {
                icon: <Download className={ `h-4 w-4` } />,
                label: "Export",
                onClick: handleExport,
                variant: "outline",
                className: "bg-sextary-600 border-sextary-400/40 text-white h-8 text-xs",
            },
            {
                icon: <Upload className={ `h-4 w-4` } />,
                label: "Import",
                onClick: handleImportClick,
                variant: "outline",
                className: "bg-sextary-600 border-sextary-400/40 text-white h-8 text-xs",
            },
            ...( selectedStats.length > 0
                ? [ {
                    icon: <Trash2 className={ `h-4 w-4` } />,
                    label: `Delete (${ selectedStats.length })`,
                    onClick: () => setIsDeleteDialogOpen( true ),
                    variant: "destructive",
                    className: "bg-red-900 hover:bg-red-800 text-white h-8 text-xs",
                } ]
                : [] ),
        ],
        [
            handleExport,
            handleImportClick,
            selectedStats.length,
            selectedStats,
            setIsDeleteDialogOpen
        ],
    );

    // Define add button and stats
    const bottomActions = useMemo(
        () => [
            {
                render: () => (
                    <div className="text-xs text-neutral-400">
                        { filteredStats.length } total items
                        { selectedStats.length > 0 && ` (${ selectedStats.length } selected)` }
                    </div>
                ),
            },
        ],
        [ handleAddStat, filteredStats.length, selectedStats.length ],
    );

    // useEffect( () => {
    //     console.log( "DynamicDataForm.jsx :: one of these variables just changed: [statsData, searchTerm, filterType, filterKey, selectedDate, selectedEndDate] ==> [", statsData, searchTerm, filterType, filterKey, selectedDate, selectedEndDate, "], :: [filteredStats, sortedData] = [", [ filteredStats, sortedData ], "]" );
    // }, [ statsData, searchTerm, filterType, filterKey, selectedDate, selectedEndDate, filteredStats, sortedData ] );

    return (
        <div className="flex flex-col h-full overflow-hidden gap-2 px-2 py-2">
            {/* Header Controls */ }
            <div className={ `flex flex-col bg-sextary-500 rounded-lg text-white` }>
                <Card className="hover:bg-primary-purple-800/20 border-sextary-400 shrink-0 px-2">
                    <div className={ `flex flex-row w-full justify-stretch items-stretch` }>
                        <ActionBar actions={ actionButtons } />
                        <Input
                            type="file"
                            ref={ fileInputRef }
                            onChange={ handleFileChange }
                            accept=".json"
                            className="hidden"
                        />
                        <FilterBar
                            searchTerm={ searchTerm }
                            onSearchChange={ handleSearchChange }
                            filterOptions={ DATA_TYPES }
                            selectedKeyFilter={ filterKey }
                            onKeyFilterChange={ handleFilterKeyChange }
                            selectedTypeFilter={ filterType }
                            onTypeFilterChange={ handleFilterTypeChange }
                            className={ `px-2` }
                            searchPlaceholder="Search..."
                            clearFiltersButton={ ( searchTerm || filterType !== "all" || selectedDate ) && (
                                <Button variant="ghost" size="sm" onClick={ handleClearFilters } className="h-8 rounded-lg text-xs">
                                    <X className="h-3 w-3 mr-1" />
                                    Clear Filters
                                </Button>
                            ) }
                        />
                    </div>
                </Card>
            </div>

            <div className="flex items-center justify-between gap-2 shrink-0">

                { ( selectedDate && new Date( selectedDate ) instanceof Date ) && (
                    <div className="text-sm text-neutral-400 flex items-center">
                        <span>Showing entries for: { new Date( selectedDate ).toLocaleDateString() }</span>
                        <Button variant="ghost" size="sm" onClick={ clearDateSelection } className="ml-1 h-6 w-6 p-0">
                            <X className="h-3 w-3 " />
                        </Button>
                    </div>
                ) }
            </div>

            {/* Add/Edit Form */ }
            <Card className="hover:bg-primary-purple-800/20 border-sextary-400 shrink-0 px-2">
                <CardContent className="!p-0">
                    <form onSubmit={ handleCreate } className="">
                        <div className="flex flex-row flex-nowrap justify-stretch items-center gap-4">

                            <div className={ `h-full flex flex-shrink items-center justify-center gap-2` }>
                                <Label htmlFor="dataKey">Key</Label>
                                {/* <Input id="dataKey" className={ `h-8` } value={ dataKey } onChange={ handleDataKeyChange } placeholder="Enter key" required /> */ }

                                <DataKeyDropdown
                                    value={ dataKey }
                                    onChange={ handleDataKeyChange }
                                    onBlur={ () => validateAndSetErrors() }
                                    error={ {} }
                                />
                            </div>

                            <div className={ `h-full flex flex-shrink items-center justify-center gap-2` }>
                                <Label htmlFor="dataType">Type</Label>
                                <DataTypeSelect
                                    className={ `!py-1 !px-1 gap-2 h-8` }
                                    fieldName={ `dataType` }
                                    fieldLabel={ `Type` }
                                    value={ dataType }
                                    handleChange={ handleDataTypeChange }
                                />
                                {/* <Select value={ dataType } onValueChange={ handleDataTypeChange }>
                  <SelectTrigger className="gap-2 h-8" id="dataType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    { DATA_TYPES.map( ( o ) => ( <SelectItem key={ o?.value } value={ o?.value }>{ o?.label }</SelectItem> ) ) }
                  </SelectContent>
                </Select> */}
                            </div>


                            <div className={ `flex-1 flex-grow items-center justify-center gap-2` }>
                                {/* <Label htmlFor="dataValue">Value</Label> */ }
                                <DataValueInput
                                    id="timeStamp"
                                    dataType={ "DateTime" }
                                    value={ dataTimeStamp }
                                    onChange={ handleDataTimestampChange }
                                    compact={ false }
                                />
                            </div>

                            <div className={ `flex-1 flex-grow items-center justify-center gap-2` }>
                                {/* <Label htmlFor="dataValue">Value</Label> */ }
                                <DataValueInput
                                    id="dataValue"
                                    dataType={ dataType }
                                    value={ dataValue }
                                    onChange={ handleDataValueChange }
                                    compact={ false }
                                />
                            </div>

                            <div className={ `flex flex-shrink items-center justify-center gap-2` }>
                                { editingId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={ handleCancelEdit }
                                    >
                                        Cancel
                                    </Button>
                                ) }
                                <Button
                                    className={ `px-2 py-1 self-center` }
                                    size={ 'xs' }
                                    type="submit"
                                    disabled={ invalid( dataKey ) }
                                >
                                    { editingId ? "Update" : "Add" }
                                </Button>
                            </div>

                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Data Table */ }
            { renderData && utils.val.isValidArray( renderData, true ) && renderData.length > 0 ? (
                <DataTable
                    actionBar={ <ActionBar actions={ bottomActions } /> }
                    // data={ currentStats ?? filteredStats }
                    data={ renderData ?? statsData }
                    columns={ columns }
                    renderRow={ ( item, index ) => (
                        <DataItemRow
                            item={ item }
                            index={ index }
                            showRowLabels={ showRowLabels }
                            onEdit={ handleEdit }
                            onDelete={ handleDelete }
                        />
                    ) }
                    onRowSelect={ handleRowSelect }
                    selectedRows={ selectedStats }
                    enableDragAndDrop={ true }
                    onDragStart={ handleDragStart }
                    onDragEnd={ handleDragEnd }
                    onDragOver={ handleDragOver }
                    emptyMessage={ `No items found. Try adjusting your filters or add a new item.` }
                    handleSort={ handleSort }
                    sortConfig={ sortConfig }
                />

            ) : (
                <div className="p-2 text-center text-Neutrals/neutrals-8">No items found</div>
            ) }


            {/* Delete Confirmation Dialog */ }
            <Dialog open={ isDeleteDialogOpen } onOpenChange={ setIsDeleteDialogOpen }>
                <DialogContent className="border-sextary-700/40 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to delete { selectedStats.length } item{ selectedStats.length !== 1 ? "s" : "" }? This
                        action cannot be undone.
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={ () => setIsDeleteDialogOpen( false ) }
                            className="bg-background border-gray-600 text-white"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={ handleDeleteSelected }
                            className="bg-red-900 hover:bg-red-800 text-white"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */ }
            <Dialog open={ isImportDialogOpen } onOpenChange={ setIsImportDialogOpen }>
                <DialogContent className="border-sextary-700/40 text-white">
                    <DialogHeader>
                        <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="mb-2">Review the data before importing:</p>
                        <div className="bg-background px-2 rounded-md max-h-40 overflow-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{ importData }</pre>
                        </div>
                        { importError && <div className="mt-2 text-red-500 text-xs">{ importError }</div> }
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={ () => setIsImportDialogOpen( false ) }
                            className="bg-background border-gray-600 text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={ handleImportConfirm }
                            className="bg-washed-blue-600 hover:bg-washed-blue-700 text-white"
                        >
                            <Save className="h-3 w-3 mr-1" />
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DynamicDataForm;
