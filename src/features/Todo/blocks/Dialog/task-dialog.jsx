
import { useState, useEffect, useId } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Crosshair, FlipHorizontal } from "lucide-react";
import { format, isValid, addDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import useTasksStore from "@/store/task.store";
import * as utils from 'akashatools';
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from "@/lib/config/config";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { buildSelect } from "@/lib/utilities/input";
import useGlobalStore from "@/store/global.store";
import useTask from "@/lib/hooks/useTask";
import { stringToColor } from "@/lib/utilities/color";
import { DATE_PICKER_OPTIONS } from "@/lib/config/constants";
import DatePicker from "@/components/Calendar/DatePicker";
import { twMerge } from "tailwind-merge";
// import { Popover } from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusSelect } from "@/features/Todo/components/Fields/StatusSelect";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/Badge/StatusBadge";
import { generateRandomString } from "@/lib/utilities/random";
import { arrSafeTernary } from "@/lib/utilities/data";
// import type { KanbanTask } from "@/lib/types"
// 
// interface TaskDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   task?: KanbanTask | null
//   groupId?: number | null
//   defaultDate?: Date | null
//   defaultEndDate?: Date | null
// }

export function TodoDialog ( {
    open,
    onOpenChange,
    task = null,
    groupId = null,
    defaultDate = null,
    defaultEndDate = null,
} ) {
    const {
        groupByField,
        groupByFieldMode,
        activeListId,
        createTask,
        addTask,
        updateTask,
        tags: availableTags,
        // users: availableUsers,
        tasksData,
        groups, customGroups,
        tags, setTags, getTags, addTag, createTag, getAllTags, initTags,
    } = useTasksStore();

    const { user, usersData, workspaceId, workspacesData } = useGlobalStore();

    const {
        initializeNewTask,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleBulkUpdateTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleReorderTasks,
        handleOpenTaskNotes,
    } = useTask();


    const [ taskFormData, setTaskFormData ] = useState( {} );
    const [ title, setTitle ] = useState( "" );
    const [ description, setDescription ] = useState( "" );
    const [ timestampDue, setDueDate ] = useState( undefined );
    const [ endDate, setEndDate ] = useState( undefined );
    const [ isCalendarOpen, setIsCalendarOpen ] = useState( false );
    const [ calendarOpenFor, setCalendarOpenFor ] = useState( null );
    const [ selectedUserId, setSelectedUserId ] = useState( "" );
    const [ newTagsText, setNewTagsText ] = useState( "" );
    const [ selectedTagIds, setSelectedTagIds ] = useState( [] );
    const [ allTags, setAllTags ] = useState( availableTags ? availableTags : [] );
    const [ parentTaskId, setParentTaskId ] = useState( null );
    const [ selectedColumnId, setSelectedColumnId ] = useState( "" );
    const [ notes, setNotes ] = useState( "" );
    const [ estimatedHours, setEstimatedHours ] = useState( "1" );

    // Get all tasks for parent task selection
    const topLevelTasks = tasksData?.filter( ( task ) => !task?.parentTaskId );

    const buildTagsOptionsData = ( tagOptions ) => {
        const tags = tagOptions
            .map( ( tag ) => {
                if ( tag && utils.val.isObject( tag ) ) {
                    const existingTag = allTags.find( ( t ) => t.name === tag.name );
                    return existingTag
                        ? null
                        : {
                            id: generateRandomString( 12 ),
                            name: tag.name,
                            color: tag.color ?? stringToColor( tag?.name )
                        };
                }
                else {
                    const existingTag = allTags.find( ( t ) => t.name === tag );
                    return existingTag
                        ? null
                        : {
                            id: generateRandomString( 12 ),
                            name: tag,
                            color: stringToColor( tag )
                        };
                }
            } )
            .filter( Boolean );

        return tags;
    };

    // Initialize form when dialog opens
    useEffect( () => {
        console.log( "Task-dialog :: open = ", open, " :: ", "task = ", task, " :: ", "groupId = ", groupId, " :: ", "defaultDate = ", defaultDate );
        if ( open ) {
            if ( task ) {
                // Editing existing task
                // setTitle( task?.title );
                // setDescription( task?.description || "" );
                // setDueDate( task?.timestampDue && isValid( new Date( task?.timestampDue ) ) ? new Date( task?.timestampDue ) : undefined );
                // setEndDate( task?.timestampDue && isValid( new Date( task?.timestampDue ) ) ? new Date( task?.timestampDue ) : undefined );
                // setStatus( task?.status || 'new' );
                // setPriority( task?.priority || "medium" );
                // setDifficulty( task?.difficulty || "medium" );
                // setSelectedUserId( task?.user?.id.toString() || "" );
                const allTagsList = getAllTags();
                setSelectedTagIds( task?.tags.map( ( tag ) => {
                    if ( tag && utils.val.isObject( tag ) && tag?.hasOwnProperty( 'name' ) ) { return tag?.name; }
                    else { return tag; }
                } ) );

                setAllTags( buildTagsOptionsData( allTagsList ) );

                // setParentTaskId( task?.parentTaskId?.toString() || "0" );
                // setNotes( task?.notes?.join( "\n\n" ) || "" );
                setEstimatedHours( task?.completeness?.toString() || "1" );

                // Find the column this task belongs to
                const allGroups = [
                    ...arrSafeTernary( groups ),
                    { _id: null, workspaceId: workspaceId, todoListId: activeListId, userId: user?.id, user: user, title: 'Uncategorized' }
                ];

                const taskGroup = groups?.find( ( group ) => group?.taskIds.some( ( t ) => t === task?._id ) ) || null;
                setSelectedColumnId( taskGroup?._id.toString() || "" );
                setTaskFormData( {
                    ...task,
                    [ 'notes' ]: task?.notes && utils.val.isValidArray( task?.notes, true ) ? task?.notes.join( '\n\n' ) : ""
                } );
            } else {
                // Creating new task

                let fallbackGroup = groups?.[ 0 ]?._id.toString() || "uncategorizedGroup";
                if ( fallbackGroup === 'uncategorizedGroup' ) {
                    if ( groups?.length > 2 ) {
                        fallbackGroup = groups[ 1 ]?._id.toString();
                    }
                    else {
                        fallbackGroup = null;
                    }
                }

                let newTaskData = createTask( {
                    // [ groupByField ]: groupId?.toString() || groups[ 0 ]?.id.toString() || "",
                    todoListGroupId: groupId?.toString() || fallbackGroup,
                    todoListId: activeListId,
                },
                    parentTaskId,
                    activeListId,
                    groupId?.toString() || groups?.[ 0 ]?._id.toString() || ""
                );

                setSelectedTagIds( [] );
                setEstimatedHours( 1 );
                setSelectedColumnId( groupId?.toString() || groups?.[ 0 ]?._id.toString() || "" );
                setTaskFormData( newTaskData );
            }
        }
    }, [ open, task, groupId, defaultDate, defaultEndDate, groups ] );

    const handleSubmit = async () => {
        if ( taskFormData?.title?.trim() === "" ) return;

        // const targetColumnId = Number.parseInt( selectedColumnId );
        // if ( isNaN( targetColumnId ) ) return;

        // const user = selectedUserId ? availableUsers.find( ( u ) => u.id.toString() === selectedUserId ) || null : null;

        const tags = selectedTagIds
            .map( ( id ) => {
                const tag = allTags.find( ( t ) => t.id === id );
                return tag
                    ? {
                        id: tag.id ?? tag,
                        name: tag.name ?? tag,
                        color: tag.color ?? stringToColor( tag?.name ?? tag )
                    }
                    : null;
            } )
            .filter( Boolean );

        // Process notes
        const notesArray = taskFormData?.hasOwnProperty( 'notes' ) &&
            utils.val.isString( taskFormData?.notes )
            && taskFormData?.notes?.length > 0
            && taskFormData?.notes?.trim()
            ? taskFormData?.notes?.split( "\n\n" ).filter( Boolean )
            : [];

        let submittedTaskData = {
            ...task,
            ...taskFormData,
            notes: notesArray,
            tags: tags?.map( ( t ) => ( t?.name ) ),
        };

        if ( task ) {
            // Update existing task
            let result = await handleUpdateTask( submittedTaskData );
            if ( result ) {
                updateTask( result?._id, result );
                onOpenChange( false );
            }
        } else {
            // Create new task
            let result = await handleCreateTask( submittedTaskData );
            if ( result ) {
                addTask( result, submittedTaskData?.parentTaskId ?? null );
                onOpenChange( false );
            }
        }

        // onOpenChange( false );
    };

    return (
        <Dialog open={ open } onOpenChange={ () => onOpenChange() }>
            <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />
            <DialogContent
                className={ twMerge(
                    `w-full min-w-[60vw] max-w-[50vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 425 }px] max-h-modal flex flex-col `,
                    `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200`,
                    `max-w-md p-0`,
                ) }>
                <DialogHeader className="p-2 gap-2">
                    <DialogTitle className="text-xl font-extrabold ">{ taskFormData && taskFormData?.hasOwnProperty( '_id' ) && utils.val.isDefined( taskFormData?._id ) ? "Edit Task" : "Add New Task" }</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 py-2 max-h-[70vh] overflow-y-auto p-2">
                    <div className="">
                        <Label htmlFor="task-title" className="text-xs font-medium">
                            Task Title
                        </Label>
                        <Input
                            id={ `task-title` }
                            key={ `task-title` }
                            value={ taskFormData?.title }
                            onChange={ ( e ) => setTaskFormData( { ...taskFormData, [ 'title' ]: e.target.value } ) }
                            placeholder="Enter task title..."
                            className="h-6 text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 justify-center items-start">
                        <div className="">
                            <Label htmlFor="task-description" className="text-xs font-medium">
                                Description
                            </Label>
                            <Textarea
                                id={ `task-description` }
                                key={ `task-description` }
                                value={ taskFormData?.description }
                                onChange={ ( e ) => setTaskFormData( { ...taskFormData, [ 'description' ]: e.target.value } ) }
                                placeholder="Enter task description..."
                                rows={ 2 }
                                className="flex-1 min-h-[80px] text-xs w-full rounded-sm border border-input bg-transparent px-1.5 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="flex flex-col">
                            <div className="">
                                <Label className="text-xs font-medium">Group</Label>
                                <Select
                                    id={ `task-group` }
                                    key={ `task-group` }
                                    value={ selectedColumnId }
                                    onValueChange={ setSelectedColumnId }
                                >
                                    <SelectTrigger className="h-6 text-xs">
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        { utils.val.isValidArray( groups, true ) && groups.map( ( group ) => (
                                            <SelectItem
                                                key={ group?._id }
                                                value={ group?._id }
                                                className="text-xs"
                                            >
                                                { group?.title }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="">
                                <Label className="text-xs font-medium">Parent Task (Optional)</Label>
                                <Select value={ taskFormData?.parentTaskId } onValueChange={ setParentTaskId }>
                                    <SelectTrigger className="h-6 text-xs">
                                        <SelectValue placeholder="Select parent task?..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0" className="text-xs">
                                            None (Top Level Task)
                                        </SelectItem>
                                        { utils.val.isValidArray( topLevelTasks, true ) && topLevelTasks
                                            .filter( ( t ) => t._id !== task?._id ) // Can't be its own parent
                                            .map( ( t ) => (
                                                <SelectItem key={ String( t?._id ) } value={ String( t?._id ) } className="text-xs">
                                                    { t?.title }
                                                </SelectItem>
                                            ) ) }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Assignee</Label>
                                <Select value={ taskFormData?.userId } onValueChange={ ( value ) => setTaskFormData( { ...taskFormData, [ 'userId' ]: value } ) }>
                                    <SelectTrigger className="h-6 text-xs">
                                        <SelectValue placeholder="Assign to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0" className="text-xs">
                                            Unassigned
                                        </SelectItem>
                                        { utils.val.isValidArray( usersData, true ) && usersData.map( ( user ) => (
                                            <SelectItem key={ String( user?.id ) } value={ String( user?.id ) } className="text-xs">
                                                { user?.username }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Start Date</Label>
                                <Popover
                                    modal
                                    open={ isCalendarOpen && calendarOpenFor === 'timestampStarted' }
                                    onOpenChange={ () => {
                                        setIsCalendarOpen( !isCalendarOpen );
                                        if ( !isCalendarOpen === true ) setCalendarOpenFor( 'timestampStarted' );
                                        else setCalendarOpenFor( null );
                                    } }
                                >
                                    <PopoverTrigger>
                                        <Button
                                            variant="outline"
                                            className={ `w-full justify-start text-left font-normal h-6 text-xs ${ !taskFormData?.timestampStarted && "text-muted-foreground" }` }
                                        >
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            { taskFormData?.timestampStarted && isValid( taskFormData?.timestampStarted ) ? format( taskFormData?.timestampStarted, "PPP" ) : "Select date" }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={ `w-auto p-0` }>
                                        <Calendar
                                            className={ `z-[2000]` }
                                            mode="single"
                                            selected={ new Date( taskFormData?.timestampStarted ) }
                                            onSelect={ ( date ) => {
                                                // If end date is not set or is before the new start date, update it
                                                if ( !taskFormData?.timestampDue || ( date && taskFormData?.timestampDue < date ) ) {
                                                    setTaskFormData( { ...taskFormData, [ 'timestampStarted' ]: ( date ? addDays( date, 1 ) : undefined ) } );
                                                }
                                                else { setTaskFormData( { ...taskFormData, [ 'timestampStarted' ]: date } ); }
                                                setIsCalendarOpen( false );
                                            } }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Completed Date</Label>
                                <Popover
                                    modal
                                    open={ isCalendarOpen && calendarOpenFor === 'timestampCompleted' }
                                    onOpenChange={ () => {
                                        setIsCalendarOpen( !isCalendarOpen );
                                        if ( !isCalendarOpen === true ) setCalendarOpenFor( 'timestampCompleted' );
                                        else setCalendarOpenFor( null );
                                    } }
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={ `w-full justify-start text-left font-normal h-6 text-xs ${ !taskFormData?.timestampCompleted && "text-muted-foreground" }` }
                                        >
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            { taskFormData?.timestampCompleted && isValid( taskFormData?.timestampCompleted ) ? format( taskFormData?.timestampCompleted, "PPP" ) : "Select date" }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            className={ `z-[2000]` }
                                            mode="single"
                                            selected={ new Date( taskFormData?.timestampCompleted ) }
                                            onSelect={ ( date ) => {
                                                setTaskFormData( { ...taskFormData, [ 'timestampCompleted' ]: date } );
                                                setIsCalendarOpen( false );
                                            } }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Estimated Date</Label>
                                <Popover
                                    modal
                                    open={ isCalendarOpen && calendarOpenFor === 'timestampEstimated' }
                                    onOpenChange={ () => {
                                        setIsCalendarOpen( !isCalendarOpen );
                                        if ( !isCalendarOpen === true ) setCalendarOpenFor( 'timestampEstimated' );
                                        else setCalendarOpenFor( null );
                                    } }
                                >
                                    <PopoverTrigger>
                                        <Button
                                            variant="outline"
                                            className={ `flex-1 !w-full justify-stretch items-center !min-w-full text-left font-normal h-6 text-xs ${ !taskFormData?.timestampEstimated && "text-muted-foreground" }` }
                                        >
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            { taskFormData?.timestampEstimated && isValid( taskFormData?.timestampEstimated ) ? format( taskFormData?.timestampEstimated, "PPP" ) : "Select date" }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={ `w-auto p-0` }>
                                        <Calendar
                                            className={ `z-[2000]` }
                                            mode="single"
                                            selected={ new Date( taskFormData?.timestampEstimated ) }
                                            onSelect={ ( date ) => {
                                                // If end date is not set or is before the new start date, update it
                                                if ( !taskFormData?.timestampDue || ( date && taskFormData?.timestampDue < date ) ) {
                                                    setTaskFormData( { ...taskFormData, [ 'timestampEstimated' ]: ( date ? addDays( date, 1 ) : undefined ) } );
                                                }
                                                else { setTaskFormData( { ...taskFormData, [ 'timestampEstimated' ]: date } ); }
                                                setIsCalendarOpen( false );
                                            } }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Due Date</Label>
                                <Popover
                                    modal
                                    open={ isCalendarOpen && calendarOpenFor === 'timestampDue' }
                                    onOpenChange={ () => {
                                        setIsCalendarOpen( !isCalendarOpen );
                                        if ( !isCalendarOpen === true ) setCalendarOpenFor( 'timestampDue' );
                                        else setCalendarOpenFor( null );
                                    } }
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={ `w-full justify-start text-left font-normal h-6 text-xs ${ !taskFormData?.timestampDue && "text-muted-foreground" }` }
                                        >
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            { taskFormData?.timestampDue && isValid( taskFormData?.timestampDue ) ? format( taskFormData?.timestampDue, "PPP" ) : "Select date" }
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            className={ `z-[2000]` }
                                            mode="single"
                                            selected={ new Date( taskFormData?.timestampDue ) }
                                            onSelect={ ( date ) => {
                                                setTaskFormData( { ...taskFormData, [ 'timestampDue' ]: date } );
                                                setIsCalendarOpen( false );
                                            } }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Estimated Hours</Label>
                                <Input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={ estimatedHours }
                                    onChange={ ( e ) => setEstimatedHours( e.target.value ) }
                                    className="h-6 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                            <div className={ `gap-4` }>
                                <StatusSelect
                                    placeholder={ 'Priority' }
                                    fieldName={ `priority` }
                                    options={ TODO_PRIORITY_OPTIONS }
                                    selected={ taskFormData?.priority ?? 'none' }
                                    onSelect={ ( name, value ) => ( setTaskFormData( { ...taskFormData, [ 'priority' ]: value } ) ) }
                                />
                            </div>

                            <div className={ `gap-4` }>
                                <StatusSelect
                                    placeholder={ 'Difficulty' }
                                    fieldName={ `difficulty` }
                                    options={ TODO_DIFFICULTY_OPTIONS }
                                    selected={ taskFormData?.difficulty ?? 'none' }
                                    onSelect={ ( name, value ) => ( setTaskFormData( { ...taskFormData, [ 'difficulty' ]: value } ) ) }
                                />
                            </div>

                            <div className={ `gap-4` }>
                                <StatusSelect
                                    placeholder={ 'Status' }
                                    fieldName={ `status` }
                                    options={ TODO_STATUS_OPTIONS }
                                    selected={ taskFormData?.status ?? 'none' }
                                    onSelect={ ( name, value ) => ( setTaskFormData( { ...taskFormData, [ 'status' ]: value } ) ) }
                                />
                            </div>
                        </div>

                    </div>


                    <div className="">
                        <Label className="text-xs font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-0.5">
                            { allTags.map( ( tag ) => (
                                <div className={ `` }>
                                    <Badge
                                        key={ `tag-${ tag?.id ?? tag?.name }` }
                                        variant="outline"
                                        className={ `cursor-pointer text-xs py-0 px-1 ${ selectedTagIds.includes( tag.name )
                                            ? "bg-opacity-100"
                                            : "bg-opacity-20"
                                            }` }
                                        style={ {
                                            backgroundColor: selectedTagIds.includes( tag.name )
                                                ? tag.color
                                                : "transparent",
                                            color: selectedTagIds.includes( tag.name )
                                                ? "#fff"
                                                : tag.color,
                                            borderColor: tag.color,
                                        } }
                                        onClick={ () => {
                                            setSelectedTagIds( ( prev ) =>
                                                prev.includes( tag.name )
                                                    ? prev.filter( ( id ) => id !== tag.name )
                                                    : [ ...prev, tag.name ],
                                            );
                                        } }
                                    // onClick={ () => {
                                    //     setTaskFormData( {
                                    //         ...taskFormData,
                                    //         tags: (
                                    //             taskFormData?.tags?.includes( tag )
                                    //                 ? taskFormData?.tags?.filter( ( t ) => t !== tag )
                                    //                 : [ ...taskFormData?.tags, tag ]
                                    //         )
                                    //     } );
                                    // } }
                                    >
                                        {/* { tag.name } */ }
                                        { String( tag?.name ) }
                                    </Badge>
                                </div>
                            ) ) }

                            <Input
                                id={ `task-add-tag` }
                                key={ `task-add-tag` }
                                type={ 'text' }
                                defaultValue={ utils.val.isValidArray( taskFormData?.tags, true ) ? taskFormData?.tags?.join( ', ' ) : '' }
                                onChange={ ( e ) => {
                                    const value = e.target.value;
                                    // setTaskFormData( { ...taskFormData, [ 'tags' ]: [ ...( utils.val.isValidArray( taskFormData?.tags, true ) ? taskFormData?.tags : [] ), value ] } );
                                    setNewTagsText( value );
                                } }
                                onBlur={ () => {
                                    // const newTags = taskFormData?.tags;
                                    const newTags = newTagsText && newTagsText !== "" && newTagsText?.length > 0 ? newTagsText?.split( ', ' ) : [];
                                    // const newTagsData = ( utils.val.isValidArray( newTags, true ) ? newTags?.split( ', ' ) : '' );
                                    const newTagsData = ( utils.val.isValidArray( newTags, true ) ? buildTagsOptionsData( newTags ) : [] );
                                    setTaskFormData( { ...taskFormData, [ 'tags' ]: [ ...( utils.val.isValidArray( taskFormData?.tags, true ) ? taskFormData?.tags : [] ), ...( utils.val.isValidArray( newTagsData, true ) ? newTagsData : [] ) ] } );
                                    setAllTags( [ ...( utils.val.isValidArray( allTags, true ) ? allTags : [] ), ...( utils.val.isValidArray( newTagsData, true ) ? newTagsData : [] ) ] );
                                } }
                                placeholder="Add tag(s)"
                                className="h-6 text-xs"
                            />

                            {/* <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 bg-white p-8">
                                { allTags?.map( ( tag, index ) => (
                                    <StatusBadge key={ tag } status={ tag } onStatusChange={ ( value ) => setTaskFormData( { ...taskFormData, [ 'tags' ]: [ ...taskFormData?.tags, value ] } ) } statusOrder={ allTags } />
                                ) ) }
                            </div> */}

                        </div>
                    </div>

                    <div className="">
                        <Label htmlFor="task-notes" className="text-xs font-medium">
                            Notes
                        </Label>
                        <MarkdownEditor
                            value={ taskFormData?.notes }
                            onChange={ ( value ) => setTaskFormData( { ...taskFormData, [ 'notes' ]: value } ) }
                            placeholder="Add notes here..."
                            minHeight="150px"
                            maxHeight="200px"
                        />
                    </div>
                </div>

                <DialogFooter className="p-2 gap-2">
                    <Button variant="outline" className="h-6 text-xs" onClick={ () => onOpenChange( false ) }>
                        Cancel
                    </Button>
                    <Button className="h-6 text-xs" onClick={ handleSubmit }>
                        { taskFormData ? "Save Changes" : "Add Task" }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


/* <DatePicker
    className={ `mb-2 p-0 w-full z-[2000]` }
    usePopover={ true }
    useSelect={ true }
    selectKey={ '' }
    selectValue={ DATE_PICKER_OPTIONS[ 0 ]?.value }
    selectOnChange={ ( k, v ) => { } }
    options={ DATE_PICKER_OPTIONS }
    selectedDate={ taskFormData?.timestampStarted }
    setSelectedDate={ ( date ) => {
        // If end date is not set or is before the new start date, update it
        if ( !taskFormData?.timestampDue || ( date && taskFormData?.timestampDue < date ) ) {
            setTaskFormData( { ...taskFormData, [ 'timestampStarted' ]: ( date ? addDays( date, 1 ) : undefined ) } );
        }
        else { setTaskFormData( { ...taskFormData, [ 'timestampStarted' ]: date } ); }
        setIsCalendarOpen( false );
    } }
    mode={ `single` }
    showOutsideDays={ true }
    footer={ <></> }
    placeholder={ "Due Date" }
/> */