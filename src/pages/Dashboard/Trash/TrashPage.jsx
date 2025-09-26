import React, { useContext, createContext, useEffect, useState, useId, useMemo, useCallback } from 'react';
import Content from '@/components/Page/Content';
import {
    BellRing,
    Blocks,
    Box,
    Calendar,
    CalendarCheck,
    CalendarCheck2,
    DatabaseBackup,
    File,
    Folder,
    Goal,
    House,
    ListCheck,
    ListChecks,
    LucideLaptopMinimalCheck,
    NotebookPen,
    PanelsTopLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useStatsStore from '@/store/stats.store';
import useNotesStore from '@/store/note.store';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import useTasksStore from '@/store/task.store';
import { caseCamelToSentence } from '@/lib/utilities/string';
import * as utils from 'akashatools';
import FlexibleTable from '@/components/Table/FlexibleTable';
import useNotificationsStore from '@/store/notification.store';
import useReminderStore from '@/store/reminder.store';

const TrashPage = ( props ) => {
    const {
        title,
        data,
        defaultView = 'tasks'
    } = props;

    const getSchema = useGlobalStore( ( state ) => state.getSchema );
    const statsData = useStatsStore( ( state ) => state.statsData );
    const filesData = useNotesStore( ( state ) => state.filesData );
    const foldersData = useNotesStore( ( state ) => state.foldersData );
    const recentNotesData = useNotesStore( ( state ) => state.recentNotesData );
    const plannerData = usePlannerStore( ( state ) => state.plannerData );
    const eventsData = usePlannerStore( ( state ) => state.eventsData );
    const logsData = usePlannerStore( ( state ) => state.logsData );
    const calendarsData = usePlannerStore( ( state ) => state.calendarsData );
    const tasksData = useTasksStore( ( state ) => state.tasksData );
    const goalsData = useTasksStore( ( state ) => state.goalsData );
    const todoLists = useTasksStore( ( state ) => state.todoLists );
    const todoListGroups = useTasksStore( ( state ) => state.customGroups );
    const workspacesData = useGlobalStore( ( state ) => state.workspacesData );
    // const notifications = useGlobalStore( ( state ) => state.notifications );
    // const reminders = useGlobalStore( ( state ) => state.reminders );
    const notificationData = useNotificationsStore( ( state ) => state.notificationData );
    const reminderData = useReminderStore( ( state ) => state.reminderData );


    const trashItemsOptions = [
        { value: 'stats', schemaKey: 'stat', label: 'Stats', icon: File },
        { value: 'files', schemaKey: 'file', label: 'Files', icon: File },
        { value: 'folders', schemaKey: 'folder', label: 'Folders', icon: Folder },
        { value: 'recentNotes', schemaKey: 'file', label: 'Recent Notes', icon: NotebookPen },
        { value: 'planner', schemaKey: 'planner', label: 'Planner', icon: Calendar },
        { value: 'events', schemaKey: 'event', label: 'Events', icon: CalendarCheck2 },
        { value: 'logs', schemaKey: 'log', label: 'Logs', icon: DatabaseBackup },
        { value: 'calendars', schemaKey: 'calendar', label: 'Calendars', icon: File },
        { value: 'tasks', schemaKey: 'task', label: 'Tasks', icon: CalendarCheck },
        { value: 'goals', schemaKey: 'taskGoal', label: 'Goals', icon: Goal },
        { value: 'todoLists', schemaKey: 'todoList', label: 'Todo Lists', icon: ListCheck },
        { value: 'todoListGroups', schemaKey: 'todoListGroup', label: 'Todo List Groups', icon: ListChecks },
        { value: 'workspaces', schemaKey: 'workspace', label: 'workspaces', icon: Blocks },
        { value: 'notifications', schemaKey: 'notification', label: 'notifications', icon: BellRing },
        { value: 'reminders', schemaKey: 'reminder', label: 'reminders', icon: LucideLaptopMinimalCheck },
    ];

    const getArchivedItems = useCallback(
        ( type ) => {
            switch ( type ) {
                case 'stats':
                    if ( utils.val.isValidArray( statsData, true ) ) return statsData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'files':
                    if ( utils.val.isValidArray( filesData, true ) ) return filesData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'folders':
                    if ( utils.val.isValidArray( foldersData, true ) ) return foldersData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'recentNotes':
                    if ( utils.val.isValidArray( recentNotesData, true ) ) return recentNotesData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'planner':
                    if ( utils.val.isValidArray( plannerData, true ) ) return plannerData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'events':
                    if ( utils.val.isValidArray( eventsData, true ) ) return eventsData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'logs':
                    if ( utils.val.isValidArray( logsData, true ) ) return logsData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'calendars':
                    if ( utils.val.isValidArray( calendarsData, true ) ) return calendarsData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'tasks':
                    if ( utils.val.isValidArray( tasksData, true ) ) return tasksData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'goals':
                    if ( utils.val.isValidArray( goalsData, true ) ) return goalsData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'todoLists':
                    if ( utils.val.isValidArray( todoLists, true ) ) return todoLists.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'todoListGroups':
                    if ( utils.val.isValidArray( todoListGroups, true ) ) return todoListGroups.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'workspaces':
                    if ( utils.val.isValidArray( workspacesData, true ) ) return workspacesData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'notifications':
                    if ( utils.val.isValidArray( notificationData, true ) ) return notificationData.filter( ( item ) => ( item?.inTrash ) );
                    break;
                case 'reminders':
                    if ( utils.val.isValidArray( reminderData, true ) ) return reminderData.filter( ( item ) => ( item?.inTrash ) );
                    break;

                default:
                    return [];
                    break;
            }
        },
        [
            statsData,
            filesData,
            foldersData,
            recentNotesData,
            plannerData,
            eventsData,
            logsData,
            calendarsData,
            tasksData,
            goalsData,
            todoLists,
            todoListGroups,
            workspacesData,
            notificationData,
            reminderData,
        ] );


    return (
        <Content.Container>

            <Content.Header
                className={ `flex flex-row justify-center items-center h-min w-full flex-shrink-1 border rounded-lg` }
            >
                <div className={ `flex-shrink` }>
                    { `Trash` }
                </div>
            </Content.Header>

            <Content.Body
                className={ `flex flex-col gap-2 justify-stretch items-stretch h-full min-h-90 w-full max-w-full px-1 ` }
            >
                <div className={ `min-h-full min-w-full w-full h-full overflow-hidden` }>

                    <Tabs
                        defaultValue={
                            defaultView && String( defaultView ) !== ''
                                ? trashItemsOptions[ trashItemsOptions?.findIndex( ( opt ) => ( opt?.value === defaultView ) ) || 0 ]?.value
                                : trashItemsOptions[ 0 ]?.value
                        }
                        orientation='vertical'
                        className='flex w-full gap-2 !h-full overflow-hidden'
                    >
                        <TabsList className="flex-col justify-start border-2 border-white/10 p-0 h-min rounded-lg">
                            { trashItemsOptions.map( ( type, index ) => (
                                <TooltipProvider delayDuration={ 0 }>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <TabsTrigger value={ type.value } className="py-3 border hover:border-white/10 transition-all duration-400 ease-in-out rounded-lg">
                                                    <span className="relative">
                                                        <type.icon size={ 16 } strokeWidth={ 1 } aria-hidden="true" className={ `stroke-2 size-6 p-0 m-0` } />
                                                        {/* <House size={ 16 } strokeWidth={ 1 } aria-hidden="true" /> */ }
                                                        <Badge variant={ 'destructive' } className="absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[12px]/[.875rem] font-bold transition-opacity group-data-[state=inactive]:opacity-50 text-center aspect-square">
                                                            { getArchivedItems( type.value )?.length }
                                                        </Badge>
                                                    </span>
                                                </TabsTrigger>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="px-2 py-1 text-xs">
                                            { type.label }
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) ) }
                        </TabsList>
                        <div className="h-full min-h-[90vh] flex-grow rounded-lg border border-border text-start overflow-hidden">
                            { trashItemsOptions.map( ( type, index ) => {
                                const items = getArchivedItems( type.value );
                                const typeSchema = getSchema( type?.schemaKey ?? '' );
                                return (
                                    <TabsContent value={ type.value } className={ `h-full w-full overflow-auto` }>
                                        <p className="px-4 py-1.5 text-xs text-muted-foreground">{ type.label }</p>
                                        { utils.val.isValidArray( items, true ) && ( <FlexibleTable
                                            input={ items }
                                            setInput={ () => { } }
                                            customColumnConfig={
                                                typeSchema
                                                    && utils.val.isObject( typeSchema )
                                                    && Object.keys( typeSchema ).length > 0
                                                    ? Object.keys( typeSchema ).map( ( key, itemIndex ) => ( {
                                                        id: key,
                                                        index: itemIndex,
                                                        header: caseCamelToSentence( key ),
                                                        accessorKey: key,
                                                        width: 125,
                                                        priority: itemIndex,
                                                        // cell: ( row ) => { handleFormatCell( row, key, typeSchema ); },
                                                    } ) )
                                                    : (
                                                        items?.length > 0
                                                            ? Object.keys( items[ 0 ] ).map( ( key, itemIndex ) => ( {
                                                                id: key,
                                                                index: itemIndex,
                                                                header: caseCamelToSentence( key ),
                                                                accessorKey: key,
                                                                width: 100,
                                                                priority: itemIndex,
                                                            } ) )
                                                            : []
                                                    )
                                            }
                                            // columns={
                                            //     items?.length > 0
                                            //         ? Object.keys( items[ 0 ] ).map( ( key, itemIndex ) => ( {
                                            //             id: key,
                                            //             index: itemIndex,
                                            //             header: caseCamelToSentence( key ),
                                            //             accessorKey: key,
                                            //             width: 100,
                                            //             priority: itemIndex,
                                            //         } ) )
                                            //         : []
                                            // }
                                            settings={ [] }
                                            layout={ [] }
                                            options={ [] }
                                            rowOnClick={ ( row ) => { console.log( 'TrashPage :: Table :: rowOnClick triggered: row = ', row ); } }
                                            cellOnClick={ ( cell ) => { console.log( 'TrashPage :: Table :: cellOnClick triggered: row = ', cell ); } }
                                            setShowSidePanel={ () => { } }
                                            setSidePanelID={ () => { } }
                                            isFilterable={ true }
                                            isSortable={ true }
                                            useRowActions={ true }
                                            rowActions={ [] }
                                        /> ) }
                                        {/* <Table
                                            isFetching={ false }
                                            isFilterable={ true }
                                            isSortable={ true }
                                            dataName={ "" }
                                            tableData={ items }
                                            setShowSidePanel={ () => { } }
                                            setSidePanelID={ () => { } }
                                            rowOnClick={ ( row ) => { console.log( 'TrashPage :: Table :: rowOnClick triggered: row = ', row ); } }
                                            cellOnClick={ ( cell ) => { console.log( 'TrashPage :: Table :: cellOnClick triggered: row = ', cell ); } }
                                            useRowActions={ true }
                                            rowActions={ [] }
                                        /> */}
                                    </TabsContent>
                                );
                            } ) }
                        </div>
                    </Tabs>

                </div>
            </Content.Body>

        </Content.Container>
    );
};

export default TrashPage;
