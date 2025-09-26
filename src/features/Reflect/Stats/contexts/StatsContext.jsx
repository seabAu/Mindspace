import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import useStatsStore from "@/store/stats.store";
import { generateSampleData } from "../utils/sampleDataGenerator";
import * as utils from 'akashatools';

const StatsContext = createContext( null );

export function StatsProvider ( { children, initialData = [] } ) {
    const store = useStatsStore();
    // const [ selectedDate, setSelectedDate ] = useState( null );
    // const [ selectedEndDate, setSelectedEndDate ] = useState( null );
    // const [ activeSidebarTab, setActiveSidebarTab ] = useState( "list" );
    // const [ sidebarOpen, setSidebarOpen ] = useState( true );
    // const [ showCalendar, setShowCalendar ] = useState( false );

    // Initialize with sample data if empty
    // useEffect( () => {
    //     if ( store.items.length === 0 ) {
    //         if ( initialData.length > 0 ) {
    //             store.setItems( initialData );
    //         } else {
    //             const sampleData = generateSampleData( 100 );
    //             store.setItems( sampleData );
    //         }
    //     }
    // }, [ store, initialData ] );

    // // Function to handle date selection
    // const handleDateSelect = useCallback( ( date, endDate = null ) => {
    //   store.setSelectedDate( date );
    //   store.setSelectedEndDate( endDate );
    // }, [] );

    // // Function to clear date selection
    // const clearDateSelection = useCallback( () => {
    //   store.setSelectedDate( null );
    //   store.setSelectedEndDate( null );
    // }, [] );

    // // Function to toggle sidebar
    // const toggleSidebar = useCallback( () => {
    //   store.setSidebarOpen( ( prev ) => !prev );
    // }, [] );

    // const toggleCalendar = useCallback( () => {
    //   setShowCalendar( ( prev ) => !prev );
    // }, [] );

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ( {
            ...store,
            // selectedDate,
            // selectedEndDate,
            // handleDateSelect,
            // clearDateSelection,
            // activeSidebarTab,
            // setActiveSidebarTab,
            // sidebarOpen,
            // setSidebarOpen,
            // toggleSidebar,
        } ),
        [
            store,
            // selectedDate,
            // selectedEndDate,
            // handleDateSelect,
            // clearDateSelection,
            // activeSidebarTab,
            // setActiveSidebarTab,
            // sidebarOpen,
            // setSidebarOpen,
            // toggleSidebar,
        ],
    );

    return <StatsContext.Provider value={ contextValue }>{ children }</StatsContext.Provider>;
}

export function useStatsContext () {
    const context = useContext( StatsContext );
    if ( !context ) {
        throw new Error( "useStatsContext must be used within a StatsProvider" );
    }
    return context;
}
