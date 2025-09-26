import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useTasksStore from "@/store/task.store";
import * as utils from 'akashatools';
import useGlobalStore from "@/store/global.store";

// interface AddTaskDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   columnId: number | null
// }

export function AddTaskDialog ( { open, onOpenChange, columnId } ) {

    const {
        addTask,
        addColumn,
        tags: availableTags,
        tasksData,
    } = useTasksStore();

    const { usersData: availableUsers } = useGlobalStore();


    const [ title, setTitle ] = useState( "" );
    const [ description, setDescription ] = useState( "" );
    const [ timestampDue, setDueDate ] = useState( undefined );
    const [ isCalendarOpen, setIsCalendarOpen ] = useState( false );
    const [ priority, setPriority ] = useState( "medium" );
    const [ difficulty, setDifficulty ] = useState( "medium" );
    const [ selectedUserId, setSelectedUserId ] = useState( "" );
    const [ selectedTagIds, setSelectedTagIds ] = useState( [] );
    const [ columnTitle, setColumnTitle ] = useState( "" );
    const [ isAddingColumn, setIsAddingColumn ] = useState( columnId === null );
    const [ parentTaskId, setParentTaskId ] = useState( "0" );

    // Get all tasks for parent task selection
    const topLevelTasks = tasksData.filter( task => !task?.parentTaskId );

    // Reset form when dialog opens
    useEffect( () => {
        if ( open ) {
            setTitle( "" );
            setDescription( "" );
            setDueDate( undefined );
            setPriority( "medium" );
            setDifficulty( "medium" );
            setSelectedUserId( "" );
            setSelectedTagIds( [] );
            setColumnTitle( "" );
            setIsAddingColumn( columnId === null );
            setParentTaskId( "0" );
        }
    }, [ open, columnId ] );

    const handleSubmit = () => {
        if ( isAddingColumn ) {
            if ( columnTitle.trim() === "" ) return;

            addColumn( { title: columnTitle } );
            onOpenChange( false );
        } else {
            if ( title.trim() === "" || ( !columnId && parentTaskId === "0" ) ) return;

            const user = selectedUserId ? availableUsers.find( ( u ) => u.id.toString() === selectedUserId ) || null : null;

            const tags = selectedTagIds
                .map( ( id ) => {
                    const tag = availableTags.find( ( t ) => t.id === id );
                    return tag ? { id: tag.id, name: tag.name, color: tag.color } : null;
                } )
                .filter( Boolean );

            // If adding as a subtask
            if ( parentTaskId !== "0" ) {
                const parentTaskId = Number.parseInt( parentTaskId );
                const parentTask = tasksData.find( t => t.id === parentTaskId );

                if ( parentTask ) {
                    // Find the column of the parent task
                    const parentColumn = getFilteredColumns().find( col =>
                        col.tasks.some( t => t.id === parentTaskId )
                    );

                    if ( parentColumn ) {
                        addTask( {
                            title,
                            description: description || null,
                            timestampDue: timestampDue || null,
                            priority,
                            difficulty,
                            user,
                            tags,
                        }, parentColumn.id,
                            parentTaskId
                        );

                        onOpenChange( false );
                        return;
                    }
                }
            }

            // Regular task addition
            if ( columnId ) {
                addTask( {
                    title,
                    description: description || null,
                    timestampDue: timestampDue || null,
                    priority,
                    difficulty,
                    user,
                    tags,
                },
                    columnId
                );
            }

            onOpenChange( false );
        }
    };

    // Helper function to get filtered columns
    const getFilteredColumns = () => {
        return useTasksStore.getState().getFilteredColumns();
    };

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="max-w-sm p-3">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base">{ isAddingColumn ? "Add New Column" : "Add New Task" }</DialogTitle>
                </DialogHeader>

                { isAddingColumn
                    ? (
                        <div className="space-y-2 py-2">
                            <div className="space-y-1">
                                <label htmlFor="column-title" className="text-xs font-medium">
                                    Column Title
                                </label>
                                <Input
                                    id="column-title"
                                    value={ columnTitle }
                                    onChange={ ( e ) => setColumnTitle( e.target.value ) }
                                    placeholder="Enter column title..."
                                    className="h-6 text-xs"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            <div className="space-y-1">
                                <label htmlFor="task-title" className="text-xs font-medium">
                                    Task Title
                                </label>
                                <Input
                                    id="task-title"
                                    value={ title }
                                    onChange={ ( e ) => setTitle( e.target.value ) }
                                    placeholder="Enter task title..."
                                    className="h-6 text-xs"
                                />
                            </div>

                            { !columnId && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Parent Task (Optional)</label>
                                    <Select value={ parentTaskId } onValueChange={ setParentTaskId }>
                                        <SelectTrigger className="h-6 text-xs">
                                            <SelectValue placeholder="Select parent task?..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0" className="text-xs py-0.5">None (Top Level Task)</SelectItem>
                                            { topLevelTasks.map( task => (
                                                <SelectItem key={ task?.id } value={ task?.id.toString() } className="text-xs py-0.5">
                                                    { task?.title }
                                                </SelectItem>
                                            ) ) }
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) }

                            <div className="space-y-1">
                                <label htmlFor="task-description" className="text-xs font-medium">
                                    Description
                                </label>
                                <textarea
                                    id="task-description"
                                    value={ description }
                                    onChange={ ( e ) => setDescription( e.target.value ) }
                                    placeholder="Enter task description..."
                                    rows={ 2 }
                                    className="min-h-[60px] text-xs w-full rounded-sm border border-input bg-transparent px-1.5 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Due Date</label>
                                    <Popover open={ isCalendarOpen } onOpenChange={ setIsCalendarOpen }>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={ `w-full justify-start text-left font-normal h-6 text-xs ${ !timestampDue && "text-muted-foreground" }` }
                                            >
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                { timestampDue ? format( timestampDue, "PPP" ) : "Select date" }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={ timestampDue }
                                                onSelect={ ( date ) => {
                                                    setDueDate( date );
                                                    setIsCalendarOpen( false );
                                                } }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Priority</label>
                                    <Select value={ priority } onValueChange={ setPriority }>
                                        <SelectTrigger className="h-6 text-xs">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low" className="text-xs py-0.5">Low</SelectItem>
                                            <SelectItem value="medium" className="text-xs py-0.5">Medium</SelectItem>
                                            <SelectItem value="high" className="text-xs py-0.5">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Difficulty</label>
                                    <Select value={ difficulty } onValueChange={ setDifficulty }>
                                        <SelectTrigger className="h-6 text-xs">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low" className="text-xs py-0.5">Easy</SelectItem>
                                            <SelectItem value="medium" className="text-xs py-0.5">Medium</SelectItem>
                                            <SelectItem value="high" className="text-xs py-0.5">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ) }

            </DialogContent>
        </Dialog>
    );
}