
import { addDays, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { TimelineViewWidget } from "./Timeline";
import * as utils from 'akashatools';
import { CONTENT_HEADER_HEIGHT, tasksUpcomingDate } from "@/lib/config/constants";
import useGlobalStore from "@/store/global.store";
import useTasksStore from "@/store/task.store";
import useTask from "@/lib/hooks/useTask";
import { useMemo, useState } from "react";
import { isPastDue } from "@/lib/utilities/time";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Separator } from "@/components/ui/separator";

const tasksByDate = {
    "2025-07-19": [
        { id: 1, label: "Team Standup", completed: true },
        { id: 2, label: "Finalize Q3 report", completed: false },
    ],
    "2025-07-20": [ { id: 4, label: "Design new landing page", completed: false } ],
};

export function EventsAndTasksWidget ( { onDateChange, selectedDate, timeBlocks } ) {
    const {
        debug, setDebug,
        data, setData, getData,
        schemas, getSchema,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    let allData = getData();
    const [ isCollapsed, setIsCollapsed ] = useState( false );

    const {
        // Values
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        todoLists, setTodoLists,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
        columns, setColumns,
        activeListId, setActiveListId,
        getTaskById,
        createTask, addTask, updateTask, deleteTask,
    } = useTasksStore();

    const {
        handleUpdateTask,
        handleEditSubmit,
        handleCreateSubmit,
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTodayTasks,
        handleGetTasksDueBy,
    } = useTask();

    // const selectedDateKey = useMemo( () => ( format( new Date( selectedDate ), "yyyy-MM-dd" ) ), [ selectedDate ] );

    // const [ tasksLocalData, setTasksLocalData ] = useState( tasksData ? tasksData : null );
    const tasksLocalData = useMemo( () => ( tasksData ), [ tasksData ] );

    const overdueTasks = useMemo( () => ( handleGetOverdueTasks( tasksLocalData ) ), [ tasksLocalData, selectedDate ] );
    const todayDueTasks = useMemo( () => ( handleGetTodayTasks( tasksLocalData ) ), [ tasksLocalData, selectedDate ] );
    const upcomingDueTasks = useMemo( () => ( handleGetTasksDueBy( tasksLocalData, addDays( new Date( selectedDate || Date.now() ), tasksUpcomingDate ) ) ), [ tasksLocalData, selectedDate ] );
    const pinnedTasks = useMemo( () => ( handleGetPinnedTasks( tasksLocalData ) ), [ tasksLocalData, selectedDate ] );
    const currentTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => !isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData, selectedDate ] );
    const pastDueTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData, selectedDate ] );



    // const selectedTasks = tasksByDate[ selectedDateKey ] || [];
    const selectedTasks = useMemo( () => {
        // return [
        //     ...( overdueTasks || [] ),
        //     ...( pinnedTasks || [] ),
        //     ...( currentTasks || [] ),
        //     ...( todayDueTasks || [] ),
        //     ...( upcomingDueTasks || [] ),
        // ];
        let dueDate = addDays( new Date( selectedDate || Date.now() ), tasksUpcomingDate );
        return handleGetTodayTasks( tasksLocalData );
    }, [ tasksLocalData, selectedDate ] );

    console.log( 'EventsAndTasksWidget :: selectedDate = ', selectedDate );

    return (
        <Card
            className={ `w-full flex-grow flex flex-col min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 2.5 ) }rem`,
            } }>
            <Collapsible defaultOpen={ !isCollapsed } className='group/collapsible'>
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                    <CollapsibleTrigger className={ `flex flex-row w-full items-center justify-stretch` }>
                        <ChevronRight className={ `transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                        <div className="flex-row items-center justify-between w-full">
                            <CardTitle>Today's Agenda</CardTitle>
                            <CardDescription>Your schedule and tasks for the day.</CardDescription>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent className={ `w-full h-full flex-1` }>
                    <CardContent className="flex-grow flex flex-col lg:flex-row h-full max-h-full overflow-hidden items-stretch justify-start !gap-2 !px-2 !py-0">
                        <div className={ `border rounded-lg flex-row overflow-hidden min-h-[200px] min-w-min lg:min-h-min items-center p-2 lg:flex-col ` }>
                            <div className="rounded-lg lg:w-full items-center lg:justify-stretch lg:items-start justify-center min-h-min border-r-2 border-b-0 lg:border-r-0 lg:border-b-2 max-w-1/2 flex-shrink">
                                <Calendar
                                    mode="single"
                                    selected={ selectedDate }
                                    onSelect={ onDateChange }
                                    gridSize={ 8 }
                                    gridGap={ 0 }
                                    className="w-full justify-start items-center self-center aspect-square"
                                    // classNames={ { root: "w-auto", month: "w-full justify-center items-center", table: "w-full", caption_label: "text-base" } }
                                />
                            </div>

                            {/* Tasks list in left sub-sidebar */ }
                            {/* <div className={ `flex` }> */ }
                            <div className={ `flex-grow justify-stretch self-start relative row-span-3 gap-2 h-max lg:max-h-1/2 lg:max-h-full flex-1 p-2 lg:w-full max-w-1/2` }>
                                <h3 className="font-semibold text-lg">Tasks for { format( new Date( selectedDate || Date.now() ), "MMMM d" ) }</h3>
                                <div className="gap-2 h-full max-h-full min-h-full overflow-auto relative">
                                    { selectedTasks && utils.val.isValidArray( selectedTasks, true ) ? (
                                        selectedTasks.map( ( task ) => (
                                            <div key={ task?._id } className="flex items-center space-x-2">
                                                <Checkbox id={ `task-${ task?._id }` } checked={ task?.completed } onCheckedChange={ ( checked ) => ( handleUpdateTask( { ...task, completed: !task?.completed } ) ) } />
                                                <Label
                                                    htmlFor={ `task-${ task?._id }` }
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    { task?.title }
                                                </Label>
                                            </div>
                                        ) )
                                    ) : (
                                        <p className="text-sm text-muted-foreground pt-2">No tasks for this day.</p>
                                    ) }
                                </div>
                            </div>
                        </div>
                        {/* </div> */ }

                        {/* Timeline for events in main area. */ }
                        <div className="w-full lg:w-3/4 lg:pl-4 h-2/3 lg:h-full h-full max-h-full min-h-full">
                            <div className="gap-2 h-full max-h-full min-h-full overflow-hidden">
                                { selectedDate && (
                                    <TimelineViewWidget
                                        timeBlocks={ timeBlocks }
                                        onDateChange={ onDateChange }
                                        selectedDate={ selectedDate }
                                    />
                                ) }
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
