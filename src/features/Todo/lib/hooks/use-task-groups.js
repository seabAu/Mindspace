
import { useMemo } from "react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, isValid } from "date-fns";
import * as utils from 'akashatools';
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from "@/lib/config/config";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { randomColor } from "@/lib/utilities/color";

/* export type GroupByOption =
  | "status"
  | "priority"
  | "difficulty"
  | "assignee"
  | "timestampDue"
  | "tags"
  | "completion"
  | "custom"

export interface TaskGroup {
  id: string
  title: string
  tasks: KanbanTask[]
  color?: string
}

interface UseTaskGroupsOptions {
  tasks: KanbanTask[]
  groupBy: GroupByOption
  customGroups?: { id: string; title: string; filter: (task: KanbanTask) => boolean; color?: string }[]
} */

export function useTaskGroups ( { tasks, groupBy, customGroups = [] } ) {
    const groups = useMemo( () => {
        if ( groupBy === "custom" && customGroups.length > 0 ) {
            return customGroups.map( ( group ) => ( {
                id: group.id,
                title: group.title,
                tasks: tasks?.filter( group.filter ),
                color: group.color,
            } ) );
        }

        switch ( groupBy ) {
            case "priority":
            case "difficulty":
            case "status":

                let columnNames = [];
                if ( groupBy === 'status' ) columnNames = TODO_STATUS_OPTIONS;
                else if ( groupBy === 'difficulty' ) columnNames = TODO_DIFFICULTY_OPTIONS;
                else if ( groupBy === 'priority' ) columnNames = TODO_PRIORITY_OPTIONS;

                let groups = [];
                if ( utils.val.isValidArray( columnNames, true ) ) {
                    return columnNames?.map( ( colName, colIndex ) => {
                        return ( {
                            id: colName,
                            type: groupBy,
                            index: colIndex,
                            title: caseCamelToSentence( colName ),
                            tasks: tasks?.filter( ( task ) => task?.[ groupBy ] === colName )?.sort( ( a, b ) => a.index - b.index ),
                            color: randomColor(),
                        } );
                    } );
                }
                else {
                    return columnNames?.map( ( colName, colIndex ) => {
                        return {
                            id: colName,
                            type: groupBy,
                            index: colIndex,
                            title: caseCamelToSentence( colName ),
                            tasks: tasks?.filter( ( task ) => task?.[ groupBy ] === colName )?.sort( ( a, b ) => a.index - b.index ),
                            color: randomColor(),
                        };
                    } );
                }

                return [
                    {
                        id: "todo",
                        title: "To Do",
                        tasks: tasks?.filter( ( task ) => task.status === "todo" ),
                        color: "#3B82F6", // blue
                    },
                    {
                        id: "in_progress",
                        title: "In Progress",
                        tasks: tasks?.filter( ( task ) => task.status === "in_progress" ),
                        color: "#F59E0B", // amber
                    },
                    {
                        id: "done",
                        title: "Done",
                        tasks: tasks?.filter( ( task ) => task.status === "done" ),
                        color: "#10B981", // green
                    },
                ];
            /* 
                        case "priority":
                            return [
                                {
                                    id: "high",
                                    title: "High Priority",
                                    tasks: tasks?.filter( ( task ) => task.priority === "high" ),
                                    color: "#EF4444", // red
                                },
                                {
                                    id: "medium",
                                    title: "Medium Priority",
                                    tasks: tasks?.filter( ( task ) => task.priority === "medium" ),
                                    color: "#F59E0B", // amber
                                },
                                {
                                    id: "low",
                                    title: "Low Priority",
                                    tasks: tasks?.filter( ( task ) => task.priority === "low" ),
                                    color: "#10B981", // green
                                },
                                {
                                    id: "unset",
                                    title: "No Priority",
                                    tasks: tasks?.filter( ( task ) => !task.priority ),
                                    color: "#6B7280", // gray
                                },
                            ];
            
                        case "difficulty":
                            return [
                                {
                                    id: "high",
                                    title: "Hard",
                                    tasks: tasks?.filter( ( task ) => task.difficulty === "high" ),
                                    color: "#EF4444", // red
                                },
                                {
                                    id: "medium",
                                    title: "Medium",
                                    tasks: tasks?.filter( ( task ) => task.difficulty === "medium" ),
                                    color: "#F59E0B", // amber
                                },
                                {
                                    id: "low",
                                    title: "Easy",
                                    tasks: tasks?.filter( ( task ) => task.difficulty === "low" ),
                                    color: "#10B981", // green
                                },
                                {
                                    id: "unset",
                                    title: "No Difficulty",
                                    tasks: tasks?.filter( ( task ) => !task.difficulty ),
                                    color: "#6B7280", // gray
                                },
                            ];
             */
            case "assignee":
                // Get unique assignees
                const assignees = new Map();
                tasks.forEach( ( task ) => {
                    if ( task.hasOwnProperty( 'user' ) && task.user ) {
                        assignees.set( task.user.id, task.user.name );
                    }
                } );

                return [
                    ...Array.from( assignees.entries() ).map( ( [ id, name ] ) => ( {
                        id: id.toString(),
                        title: name,
                        tasks: tasks?.filter( ( task ) => task.user?.id === id ),
                        color: `hsl(${ ( id * 137 ) % 360 }, 70%, 45%)`, // Generate a color based on id
                    } ) ),
                    {
                        id: "unassigned",
                        title: "Unassigned",
                        tasks: tasks?.filter( ( task ) => !task.user ),
                        color: "#6B7280", // gray
                    },
                ];

            case "timestampDue":
                const today = new Date();
                today.setHours( 0, 0, 0, 0 );

                const thisWeekStart = startOfWeek( today );
                const thisWeekEnd = endOfWeek( today );

                const nextWeekStart = new Date( thisWeekEnd );
                nextWeekStart.setDate( nextWeekStart.getDate() + 1 );

                const nextWeekEnd = new Date( nextWeekStart );
                nextWeekEnd.setDate( nextWeekStart.getDate() + 6 );

                return [
                    {
                        id: "overdue",
                        title: "Overdue",
                        tasks: tasks?.filter( ( task ) => {
                            if ( !task.timestampDue ) return false;
                            try {
                                const timestampDue = typeof task.timestampDue === "string" ? parseISO( task.timestampDue ) : new Date( task.timestampDue );
                                return isValid( timestampDue ) && timestampDue < today;
                            } catch {
                                return false;
                            }
                        } ),
                        color: "#EF4444", // red
                    },
                    {
                        id: "today",
                        title: "Today",
                        tasks: tasks?.filter( ( task ) => {
                            if ( !task.timestampDue ) return false;
                            try {
                                const timestampDue = typeof task.timestampDue === "string" ? parseISO( task.timestampDue ) : new Date( task.timestampDue );
                                if ( !isValid( timestampDue ) ) return false;

                                const taskDate = new Date( timestampDue );
                                taskDate.setHours( 0, 0, 0, 0 );
                                return taskDate.getTime() === today.getTime();
                            } catch {
                                return false;
                            }
                        } ),
                        color: "#3B82F6", // blue
                    },
                    {
                        id: "this-week",
                        title: "This Week",
                        tasks: tasks?.filter( ( task ) => {
                            if ( !task.timestampDue ) return false;
                            try {
                                const timestampDue = typeof task.timestampDue === "string" ? parseISO( task.timestampDue ) : new Date( task.timestampDue );
                                if ( !isValid( timestampDue ) ) return false;

                                const taskDate = new Date( timestampDue );
                                taskDate.setHours( 0, 0, 0, 0 );

                                return taskDate > today && isWithinInterval( taskDate, { start: thisWeekStart, end: thisWeekEnd } );
                            } catch {
                                return false;
                            }
                        } ),
                        color: "#10B981", // green
                    },
                    {
                        id: "next-week",
                        title: "Next Week",
                        tasks: tasks?.filter( ( task ) => {
                            if ( !task.timestampDue ) return false;
                            try {
                                const timestampDue = typeof task.timestampDue === "string" ? parseISO( task.timestampDue ) : new Date( task.timestampDue );
                                if ( !isValid( timestampDue ) ) return false;

                                const taskDate = new Date( timestampDue );
                                taskDate.setHours( 0, 0, 0, 0 );

                                return isWithinInterval( taskDate, { start: nextWeekStart, end: nextWeekEnd } );
                            } catch {
                                return false;
                            }
                        } ),
                        color: "#8B5CF6", // purple
                    },
                    {
                        id: "future",
                        title: "Future",
                        tasks: tasks?.filter( ( task ) => {
                            if ( !task.timestampDue ) return false;
                            try {
                                const timestampDue = typeof task.timestampDue === "string" ? parseISO( task.timestampDue ) : new Date( task.timestampDue );
                                if ( !isValid( timestampDue ) ) return false;

                                const taskDate = new Date( timestampDue );
                                taskDate.setHours( 0, 0, 0, 0 );

                                return taskDate > nextWeekEnd;
                            } catch {
                                return false;
                            }
                        } ),
                        color: "#6B7280", // gray
                    },
                    {
                        id: "no-date",
                        title: "No Due Date",
                        tasks: tasks?.filter( ( task ) => !task.timestampDue ),
                        color: "#9CA3AF", // gray
                    },
                ];

            case "tags":
                // Get unique tags
                const tagMap = new Map();
                tasks.forEach( ( task ) => {
                    task.tags.forEach( ( tag ) => {
                        tagMap.set( tag.id, { name: tag.name, color: tag.color } );
                    } );
                } );

                return [
                    ...Array.from( tagMap.entries() ).map( ( [ id, tag ] ) => ( {
                        id: id.toString(),
                        title: tag.name,
                        tasks: tasks?.filter( ( task ) => task.tags.some( ( t ) => t.id === id ) ),
                        color: tag.color,
                    } ) ),
                    {
                        id: "no-tags",
                        title: "No Tags",
                        tasks: tasks?.filter( ( task ) => task.tags.length === 0 ),
                        color: "#6B7280", // gray
                    },
                ];

            case "completion":
                return [
                    {
                        id: "completed",
                        title: "Completed",
                        tasks: tasks?.filter( ( task ) => task.isCompleted ),
                        color: "#10B981", // green
                    },
                    {
                        id: "not-completed",
                        title: "Not Completed",
                        tasks: tasks?.filter( ( task ) => !task.isCompleted ),
                        color: "#EF4444", // red
                    },
                ];

            default:
                return [
                    {
                        id: "all",
                        title: "All Tasks",
                        tasks: tasks,
                        color: "#3B82F6", // blue
                    },
                ];
        }
    }, [ tasks, groupBy, customGroups ] );

    return groups;
}
