import React, { useEffect, useMemo, useState } from 'react';
import {
    Check,
    ChevronRight,
    PlusSquareIcon,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Checkbox } from '@/components/ui/checkbox';
import * as utils from 'akashatools';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import PlannerDialogWrapper from '../../components/dialog/PlannerDialogWrapper';

const CalendarSelector = ( props ) => {
    const {
        onClickItem,
        selectedDate,
        setSelectedDate,
    } = props;

    const {
        debug,
        setDebug,
        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchEvents,
        setRequestFetchEvents,
        requestFetchCalendars,
        setRequestFetchCalendars,
        requestFetchPlanners, setRequestFetchPlanners,
        plannerData, setPlannerData,
        addPlanner, updatePlanner, deletePlanner,
        eventsData,
        setEventsData,
        selectedEvent,
        setSelectedEvent,
        calendarsData,
        setCalendarsData,
        addCalendar, updateCalendar, deleteCalendar,
        // selectedDate,
        // setSelectedDate,
    } = usePlannerStore();

    const {
        // VARIABLES
        plannerSchema,
        calendarSchema,
        eventSchema,
        conversionEventSchema,
        handleFetchPlannerData,
        handleInitializeData, // For initializing data for a given data type for a form. 
        handleInitializePlannerData, // For initializing all data for this dashboard on load.
        handleGetCalendarsData,
        handleGetPlannersData,
        handleGetEventsData,
        handleGetCalendarsWithEvents,
        handleGetEventsInDateRangeData,

        // HANDLER FUNCTIONS
        handleToggleActive,
        handleConvertEvents,
        handleInputChange,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleCancel,
    } = usePlanner();

    // const [ selectorGroups, setSelectorGroups ] = useState( [] );

    // useEffect( () => {
    //     setSelectorGroups( [
    //         {
    //             title: "Calendars",
    //             items: calendarsData,
    //             setItems: setCalendarsData,
    //             onClick: ( item ) => {
    //                 // onClickItem( item );
    //                 handleToggleActive( item );
    //                 if ( utils.val.isValidArray( calendarsData, true ) ) {
    //                     // let updatedCalendars = calendarsData.map( ( c ) => (
    //                     //     ( c?._id === item?._id )
    //                     //         ? ( { ...c, isActive: !item?.isActive } )
    //                     //         : ( c ) )
    //                     // );

    //                     // setCalendarsData( updatedCalendars );
    //                     updateCalendar( item?._id, { ...c, isActive: !item?.isActive } );
    //                 }
    //             }
    //         },
    //         {
    //             title: "Planners",
    //             items: plannerData,
    //             setItems: setPlannerData,
    //             onClick: ( item ) => {
    //                 // onClickItem( item );
    //                 // handleToggleActive( item );
    //                 // if ( utils.val.isValidArray( plannerData, true ) ) {
    //                 //     let updatedPlanners = plannerData.map( ( c ) => (
    //                 //         ( c?._id === item?._id )
    //                 //             ? ( { ...c, isActive: !item?.isActive } )
    //                 //             : ( c ) )
    //                 //     );

    //                 //     setPlannerData( updatedPlanners );
    //                 // }
    //                 updatePlanner( item?._id, { isActive: !item?.isActive } );
    //             }
    //         },
    //     ] );

    // }, [ calendarsData, plannerData ] );

    const selectorGroups = useMemo( () => ( [
        {
            title: "Calendars",
            dataType: 'calendar',
            items: calendarsData,
            setItems: setCalendarsData,
            onClick: ( item ) => {
                // onClickItem( item );
                handleToggleActive( item );
                if ( utils.val.isValidArray( calendarsData, true ) ) {
                    // let updatedCalendars = calendarsData.map( ( c ) => (
                    //     ( c?._id === item?._id )
                    //         ? ( { ...c, isActive: !item?.isActive } )
                    //         : ( c ) )
                    // );

                    // setCalendarsData( updatedCalendars );
                    updateCalendar( item?._id, { isActive: !item?.isActive } );
                }
            }
        },
        {
            title: "Planners",
            dataType: 'planner',
            items: plannerData,
            setItems: setPlannerData,
            onClick: ( item ) => {
                // onClickItem( item );
                // handleToggleActive( item );
                // if ( utils.val.isValidArray( plannerData, true ) ) {
                //     let updatedPlanners = plannerData.map( ( c ) => (
                //         ( c?._id === item?._id )
                //             ? ( { ...c, isActive: !item?.isActive } )
                //             : ( c ) )
                //     );

                //     setPlannerData( updatedPlanners );
                // }
                updatePlanner( item?._id, { isActive: !item?.isActive } );
            }
        },
    ] ), [ calendarsData, plannerData ] );

    // console.log( "CalendarSelector :: ", "selectorGroups = ", selectorGroups );

    const buildCalendarSelectorGroups = ( items ) => {
        let elements = [];
        if ( utils.val.isValidArray( items, true ) ) {
            items.forEach( ( selectorGroup, index ) => {
                // console.log( "CalendarSelector :: selectorGroup = ", selectorGroup );
                let id = `calendar-selector-item-${ selectorGroup?.title }-${ utils.rand.rand( 1e6, 0 ) }`;
                let selectorGroupTitle = selectorGroups?.[ index ]?.title;
                let selectorGroupItems = selectorGroups?.[ index ]?.items;
                let selectorGroupSetItem = selectorGroups?.[ index ]?.setItems;
                let selectorGroupOnClickCallback = selectorGroups?.[ index ]?.onClick;

                elements.push(
                    <React.Fragment key={ id }>
                        <SidebarGroup
                            id={ id }
                            key={ selectorGroupTitle }
                            className={ `py-0 group-data-[collapsible=icon]:hidden` }
                        >
                            <Collapsible
                                // defaultOpen={ index === 0 }
                                defaultOpen={ true }
                                className="group/collapsible"
                            >
                                <SidebarGroupLabel
                                    asChild
                                    className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-primary-foreground hover:text-sidebar-accent-foreground"
                                >
                                    <CollapsibleTrigger>
                                        { selectorGroup?.title }{ " " }
                                        <Button
                                            size={ `icon` }
                                            variant={ `ghost` }
                                            onClick={ () => { handleCreateStart( {}, selectorGroup?.dataType || 'calendar' ); } }>
                                            <PlusSquareIcon className={ `aspect-square size-4` } />
                                        </Button>
                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            { utils.val.isValidArray( selectorGroupItems, true )
                                                ? ( selectorGroupItems.map( ( item, itemIndex ) => { return buildSelectorGroupItem( item, itemIndex, selectorGroupOnClickCallback ); } )
                                                ) : ( <></> ) }
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarGroup>
                        <SidebarSeparator className="mx-0" />
                    </React.Fragment>
                );
            } );
        };

        return (
            <div className={ `calendar-selector-groups-container !w-full !p-0` }>
                { elements }
            </div>
        );
    };

    const buildSelectorGroupItem = ( item, index, onClickCallback = () => { } ) => {
        if ( item ) {

            let cid = `item-selector-item-${ item?.title }-${ utils.rand.rand( 1e6, 0 ) }`;
            // let isActive = item?.isActive || false;
            return (
                <SidebarMenuItem
                    key={ cid }
                    id={ cid }
                    className={ `!w-full !p-0 cursor-pointer` }
                    onClick={ () => {
                        // onClickItem( item );
                        // handleToggleActive( item );
                        // if ( utils.val.isValidArray( calendarsData, true ) ) {
                        //     let updatedCalendars = calendarsData.map( ( c ) => (
                        //         ( c?._id === item?._id )
                        //             ? ( { ...c, isActive: !item?.isActive } )
                        //             : ( c ) )
                        //     );

                        //     setCalendarsData( updatedCalendars );
                        // }
                        if ( onClickCallback ) onClickCallback( item );
                    } }
                >
                    <SidebarMenuButton>
                        <div
                            // data-isActive={ item?.isActive ? item.isActive : false }
                            className={ `group/item-item flex items-center justify-center text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary cursor-pointer` }
                        >
                            <div
                                className={ `flex items-center space-x-2 cursor-pointer` }>
                                <Switch
                                    className={ `` }
                                    id={ `item-toggle-active-${ item?.title }-${ item?._id }` }
                                    key={ `item-toggle-active-${ item?.title }-${ item?._id }` }
                                    name={ `item-toggle-active-${ item?.title }-${ item?._id }` }
                                    size={ 5 }
                                    defaultChecked={ item?.isActive ?? false }
                                    onCheckedChange={ ( checked ) => {
                                        // isActive = !!checked;
                                        // if ( utils.val.isValidArray( calendarsData, true ) ) {
                                        //     let updatedCalendars = calendarsData.map( ( c ) => (
                                        //         ( c?._id === item?._id )
                                        //             ? ( { ...c, isActive: checked } )
                                        //             : ( c ) )
                                        //     );

                                        //     setCalendarsData( updatedCalendars );
                                        //     handleToggleActive( item );
                                        // }
                                        if ( onClickCallback ) {
                                            onClickCallback( item );
                                        }
                                    } }
                                />
                                {/* <Checkbox
                                    id={ `${ item?.title }` }
                                    // checked={ active }
                                    defaultChecked={ isActive }
                                    required={ false }
                                    onCheckedChange={ () => {
                                        isActive = !isActive;
                                    } }
                                    onClick={ () => {
                                        handleToggleActive( item );
                                        if ( onClickItem ) { onClickItem( item ); }
                                    } }
                                /> */}
                                <Label
                                    htmlFor={ `${ item?.title }` }
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                >
                                    { item?.title }
                                </Label>
                            </div>
                        </div>

                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }
    };

    useEffect( () => {
        // On workspace change, wipe and re-fetch calendars and planners. 
        handleGetCalendarsData();
        handleGetPlannersData();
    }, [ workspaceId ] );

    return (
        <>
            { buildCalendarSelectorGroups( selectorGroups ) }
            <PlannerDialogWrapper />
        </>
    );
};


export default CalendarSelector;
