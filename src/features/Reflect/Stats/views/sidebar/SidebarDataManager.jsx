import React, { useState, useCallback, useMemo } from "react";
import * as utils from 'akashatools';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Upload, Filter, Search, X, Calendar, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import SidebarDataItem from "@/features/Reflect/Stats/components/SidebarDataItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { filterItems } from "@/features/Reflect/Stats/utils/dataUtils";
import { memo } from "react";
import useReflect from "@/lib/hooks/useReflect";
import { DATA_TYPES } from "@/lib/config/config";
import SidebarDatePicker from "./SidebarDatePicker";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";
import { getPrettyDate } from "@/lib/utilities/time";

const SidebarDataManager = memo( () => {
    const {
        statsData,
        requestFetchStats, setRequestFetchStats,
        showSidebarCalendar,
        setShowSidebarCalendar,
        toggleShowSidebarCalendar,
        addStat, createStat,
        exportStats,
        importStats,
        selectedDate,
        selectedEndDate,
        clearDateSelection,
        handleDateSelect,
    } = useReflectContext();
    const [ searchTerm, setSearchTerm ] = useState( "" );
    const [ filterType, setFilterType ] = useState( "" );
    const [ showFilters, setShowFilters ] = useState( false );
    // const [ showSidebarCalendar, setShowSidebarCalendar ] = useState( false );
    const fileInputRef = React.useRef( null );

    // Filter items based on search term and filter type - memoized
    const filteredStats = useMemo( () => {
        return filterItems( statsData, {
            searchTerm,
            filterType,
            selectedDate,
            selectedEndDate,
        } );
    }, [
        statsData,
        searchTerm,
        filterType,
        selectedDate,
        selectedEndDate
    ] );

    const { handleCreateStats, handleUpdateStats } = useReflect();

    const handleAddStat = useCallback( async () => {
        const newStat = createStat(
            -1,
            {
                timeStamp: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
                startTime: new Date( selectedDate ? selectedDate : Date.now() ).getTime(),
                endTime: new Date( selectedEndDate ? selectedEndDate : Date.now() ).getTime(),
            }
        );
        let result = await handleCreateStats( newStat );
    }, [ addStat ] );

    const handleExport = useCallback( () => {
        const dataStr = exportStats();
        const blob = new Blob( [ dataStr ], { type: "application/json" } );
        const url = URL.createObjectURL( blob );

        const a = document.createElement( "a" );
        a.href = url;
        a.download = "data-items.json";
        document.body.appendChild( a );
        a.click();
        document.body.removeChild( a );
        URL.revokeObjectURL( url );
    }, [ exportStats ] );

    const handleImportClick = useCallback( () => {
        fileInputRef.current?.click();
    }, [] );

    const handleFileChange = useCallback(
        ( e ) => {
            const file = e.target.files?.[ 0 ];
            if ( !file ) return;

            const reader = new FileReader();
            reader.onload = ( event ) => {
                if ( event.target?.result ) {
                    importStats( event.target.result.toString() );
                }
            };
            reader.readAsText( file );

            // Reset the input
            e.target.value = "";
        },
        [ importStats ],
    );

    const handleSearchChange = useCallback( ( e ) => {
        setSearchTerm( e.target.value );
    }, [] );

    const handleClearSearch = useCallback( () => {
        setSearchTerm( "" );
    }, [] );

    const handleFilterTypeChange = useCallback( ( value ) => {
        setFilterType( value );
    }, [] );

    const toggleFilters = useCallback( () => {
        setShowFilters( ( prev ) => !prev );
    }, [] );

    const handleCalendarSelect = useCallback(
        ( date ) => {
            if ( date ) {
                handleDateSelect( date );
            }
            setShowSidebarCalendar( false );
        },
        [ handleDateSelect ],
    );

    console.log( "SidebarDataManager :: selectedDate = ", selectedDate );

    return (
        <div
            className={ `bg-sidebar-background flex flex-col justify-between items-stretch h-full min-h-full max-h-full text-foreground !max-w-full overflow-hidden border-r !p-0` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem`,
            } }>
            <SidebarInset className={ `!p-0 !py-0 !px-0 !m-0 !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden ` }>
                {/* Header */ }
                <SidebarHeader className={ `sticky !p-0 flex-shrink` }>

                    <div className="flex flex-col flex-shrink top-0 left-0 right-0 overflow-hidden">
                        <div className="flex justify-between items-center border-b">
                            {/* <h2 className="text-sm font-bold">Data Manager</h2> */ }
                            <div className="flex flex-row justify-stretch items-center px-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={ () => {
                                        setRequestFetchStats( true );
                                        // handleFetchStats();
                                    } }
                                >
                                    <RefreshCcw className={ `size-3 aspect-square` } />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={ toggleFilters }>
                                    <Filter className="size-3 aspect-square" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={ toggleShowSidebarCalendar }>
                                    <Calendar className="size-3 aspect-square" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={ handleExport }>
                                    <Download className="size-3 aspect-square" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={ handleImportClick }>
                                    <Upload className="size-3 aspect-square" />
                                </Button>
                                <input type="file" ref={ fileInputRef } onChange={ handleFileChange } accept=".json" className="hidden" />
                            </div>
                        </div>

                        {/* Search and Filters */ }
                        <div className="border-b relative">
                            <div className="flex flex-row flex-nowrap relative justify-stretch items-center">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 aspect-square text-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={ searchTerm }
                                    onChange={ handleSearchChange }
                                    className="pl-7 h-7 text-foreground text-xs"
                                />
                                { searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
                                        onClick={ handleClearSearch }
                                    >
                                        <X className="size-3 aspect-square" />
                                    </Button>
                                ) }
                            </div>

                            { showFilters && (
                                <Select value={ filterType } onValueChange={ handleFilterTypeChange }>
                                    <SelectTrigger className="h-7 text-foreground text-xs">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent className="text-foreground">
                                        { DATA_TYPES.map( ( type ) => (
                                            <SelectItem key={ type.value } value={ type.value } className="text-xs">
                                                { type.label }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            ) }

                            { ( showSidebarCalendar ) && (
                                <div className="rounded-md w-full justify-center items-center">

                                    <SidebarDatePicker
                                        // selectedDate={ selectedDate }
                                        // handleDateSelect={ handleCalendarSelect }
                                        // clearDateSelection={ clearDateSelection }
                                        showControls={ false }
                                    />
                                    {/* <CalendarComponent
                                        mode="single"
                                        selected={ selectedDate }
                                        onSelect={ handleCalendarSelect }
                                        className="rounded-md p-2"
                                    /> */}
                                    <div className="flex justify-between items-center h-full w-full">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={ clearDateSelection }
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-7 text-xs text-foreground bg-sidebar-background"
                                            // bg-primary-purple-600/20 hover:bg-primary-purple-700/40
                                            onClick={ () => setShowSidebarCalendar( false ) }
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            ) }
                        </div>

                        {/* Date filter indicator */ }
                        { selectedDate && (
                            <div className="border-b border-washed-blue-900/30 flex justify-between items-center">
                                {/* <span className="text-xs text-foreground">Date: { format( selectedDate, "MMM d, yyyy" ) }</span> */ }
                                <span className="text-xs text-foreground">Date: { getPrettyDate( selectedDate ) }</span>
                                { selectedDate?.hasOwnProperty( 'from' ) && selectedDate?.hasOwnProperty( 'to' ) ? (
                                    <div className={ `` }>
                                        <span className={ `text-xs text-foreground` }>
                                            { getPrettyDate( selectedDate?.from ) }
                                        </span>
                                        <span className={ `text-xs text-foreground` }>
                                            { getPrettyDate( selectedDate?.to ) }
                                        </span>
                                    </div>
                                )
                                    : (
                                        <span className={ `text-xs text-foreground` }>
                                            { getPrettyDate( selectedDate ) }
                                        </span>
                                    ) }
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 p-0 text-foreground hover:text-washed-blue-100"
                                    onClick={ clearDateSelection }
                                >
                                    <X className="size-3 aspect-square" />
                                </Button>
                            </div>
                        ) }
                        <div className={ `border-t px-2 py-0 flex flex-row flex-shrink justify-between items-center w-full h-full sticky` }>
                            {/* Footer */ }
                            <span className="text-center text-xs text-foreground">{ filteredStats.length } items</span>
                            <Button size="sm" className="h-6 text-foreground bg-sidebar-background" onClick={ handleAddStat }>
                                Add Stat
                            </Button>
                        </div>

                    </div>

                </SidebarHeader>

                {/* Stat List - Fixed with ScrollArea */ }
                <SidebarContent className={ `!h-full !flex-1 !overflow-hidden sticky !p-0 bg-sidebar-background` }>
                    <div className="flex flex-col flex-grow flex-1 min-h-0 overflow-auto pb-48">
                        {/* <ScrollArea className={ `h-max flex-1` }> */ }
                        { filteredStats.length > 0 ? (
                            filteredStats.map( ( item ) => ( <SidebarDataItem key={ item._id } item={ item } /> ) )
                        ) : (
                            <div className="text-center py-4 text-xs text-foreground">No items found</div>
                        ) }
                        {/* </ScrollArea> */ }
                    </div>
                </SidebarContent>

            </SidebarInset>
        </div>
    );
} );

SidebarDataManager.displayName = "SidebarDataManager";

export default SidebarDataManager;
