import { useState, useRef, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
    CalendarIcon,
    MoreHorizontal,
    Pencil,
    Trash2,
    User,
    ChevronDown,
    ChevronUp,
    Maximize2,
    Clock,
    AlertCircle,
    MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useTasksStore from "@/store/task.store";
// import type { KanbanTask } from "@/lib/types"
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import useGlobalStore from '@/store/global.store';
import useTask from '@/lib/hooks/useTask';
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from '@/lib/config/config';
import { buildSelect } from '@/lib/utilities/input';
import { caseCamelToSentence } from '@/lib/utilities/string';
import { twMerge } from 'tailwind-merge';

// interface TaskCardProps {
//   task: KanbanTask
//   groupId: number
//   isDragging?: boolean
// }

export function TaskCard ( { task, groupId, isDragging } ) {
    const {
        updateTask,
        deleteTask,
        tags: availableTags,
        // users: availableUsers,
    } = useTasksStore();

    const { usersData: availableUsers, setUsersData } = useGlobalStore();

    const {
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleChange,
        handleSubmitRouting,
        handleBulkUpdateTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleReorderTasks,
        handleOpenTaskNotes,
        updateOrderFieldById,
    } = useTask();

    const [ taskDataLocal, setTaskDataLocal ] = useState( task );
    const [ formData, setFormData ] = useState( task );
    const [ isEditing, setIsEditing ] = useState( false );
    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ isMaximized, setIsMaximized ] = useState( false );
    const [ title, setTitle ] = useState( task.title );
    const [ description, setDescription ] = useState( task.description || '' );
    const [ timestampDue, setTimestampDue ] = useState(
        task.timestampDue ? new Date( task.timestampDue ) : undefined,
    );
    const [ status, setStatus ] = useState( task.status || 'none' );
    const [ priority, setPriority ] = useState( task.priority || 'none' );
    const [ difficulty, setDifficulty ] = useState( task.difficulty || 'none' );
    const [ completeness, setCompleteness ] = useState( task.completeness || 0 );
    const [ isCalendarOpen, setIsCalendarOpen ] = useState( false );
    const [ location, setLocation ] = useState( task.location || '' );
    const [ selectedUserId, setSelectedUserId ] = useState(
        task?.userId || null,
    );
    const [ selectedTagIds, setSelectedTagIds ] = useState(
        task?.categories?.map( ( cat, idx ) => idx ) || [],
    );
    const [ isPinned, setIsPinned ] = useState( task.isPinned || false );
    const contentRef = useRef( null );
    const [ contentHeight, setContentHeight ] = useState( 0 );

    // Update content height when expanded state changes
    useEffect( () => {
        if ( contentRef.current ) {
            setContentHeight( isExpanded ? contentRef.current.scrollHeight : 0 );
        }
    }, [ isExpanded, description, task.categories ] );

    const handleAddTask = async () => {
        // Create the new task data.
        if ( newTaskTitle.trim() === "" ) return;
        let updatedTask = { title: newTaskTitle };
        updatedTask[ groupByField ] = groupId;

        // Update the server.
        let result = await handleUpdateTask( updatedTask );
        if ( result ) {
            // Update the state local to the app.
            addTask( updatedTask, groupId );
        }

        // Clear out state values.
        setNewTaskTitle( "" );
        setIsAddingTask( false );
    };

    const handleSave = async () => {
        // Update the server.
        let updatedTask = {
            // Original task data
            ...task,

            // ...overridden by new, local edited task data.
            title,
            description: description || null,
            timestampDue: timestampDue || null,
            priority,
            difficulty,
            completeness,
            status,
            location,
            userId: selectedUserId && selectedUserId !== '0'
                ? Number( selectedUserId )
                : null,
            categories: selectedTagIds
                .map( ( id ) => {
                    const tag = availableTags.find( ( t ) => t.id === id );
                    return tag ? tag.name : '';
                } )
                .filter( Boolean ),
            isPinned,
        };

        updateTask( task._id, updatedTask );

        let result = await handleUpdateTask( updatedTask );
        // if ( result ) {
        //     // Update the state local to the app.
        //     updateTask( task._id, updatedTask );
        // }

        setIsEditing( false );
    };

    const handleDelete = async () => {
        // Update the data store.
        deleteTask( task._id );

        // Update the server after. 
        let deletedTask = await handleDeleteTask( task );
    };

    const getDueDateColor = () => {
        if ( !timestampDue ) return 'text-muted-foreground';

        const today = new Date();
        today.setHours( 0, 0, 0, 0 );

        const taskDate = new Date( timestampDue );
        taskDate.setHours( 0, 0, 0, 0 );

        if ( taskDate < today ) return 'text-destructive';
        if ( taskDate.getTime() === today.getTime() ) return 'text-warning';
        return 'text-muted-foreground';
    };

    const getPriorityColor = () => {
        switch ( priority ) {
            case 'critical':
            case 'asap':
            case 'urgent':
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
            case 'none':
                return 'bg-green-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getDifficultyBadge = () => {
        switch ( difficulty ) {
            case 'extreme':
            case 'very high':
            case 'high':
                return 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'medium':
                return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low':
            case 'very low':
            case 'none':
                return 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    const getStatusBadge = () => {
        switch ( status ) {
            case 'completed':
                return 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'inProgress':
                return 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'waitingRequirements':
            case 'postponed':
                return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'cancelled':
                return 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'new':
                return 'bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default:
                return 'bg-gray-200 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const toggleExpand = () => {
        if ( !isEditing ) {
            setIsExpanded( !isExpanded );
        }
    };

    return (
        <>
            <Card
                className={ twMerge(
                    `z-100`,
                    `mb-1.5 transition-all duration-200 hover:shadow-md`,
                    isDragging ? 'opacity-50' : 'opacity-100',
                    isEditing ? 'cursor-default' : 'cursor-pointer',
                ) }
                onClick={ !isEditing ? toggleExpand : undefined }>
                <CardHeader className='p-1.5 pb-0 flex flex-row justify-between items-start'>
                    <div className='flex items-start space-x-1 w-full'>
                        <div
                            className={ `w-0.5 h-full rounded-full ${ getPriorityColor() }` }
                            style={ { minHeight: '20px' } }></div>
                        <div className='flex-1'>
                            { isEditing ? (
                                <Input
                                    value={ title }
                                    onChange={ ( e ) => setTitle( e.target.value ) }
                                    className='font-medium text-xs h-6'
                                    placeholder='Task title'
                                    onClick={ ( e ) => e.stopPropagation() }
                                />
                            ) : (
                                <h3 className='font-medium text-xs'>
                                    { task.title }
                                </h3>
                            ) }
                        </div>
                    </div>
                    <div className='flex items-center space-x-0.5'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-5 w-5'
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            setIsMaximized( true );
                                        } }>
                                        <Maximize2 className='h-3 w-3' />
                                        <span className='sr-only'>
                                            Maximize
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className='text-xs'>View details</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-5 w-5'
                                    onClick={ ( e ) => e.stopPropagation() }>
                                    <MoreHorizontal className='h-3 w-3' />
                                    <span className='sr-only'>Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align='end'
                                className='w-36'>
                                { isEditing ? (
                                    <DropdownMenuItem
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            handleSave();
                                        } }
                                        className='text-xs py-0.5 px-1.5'>
                                        Save
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            setIsEditing( true );
                                            setIsExpanded( true );
                                        } }
                                        className='text-xs py-0.5 px-1.5'>
                                        <Pencil className='mr-1 h-3 w-3' />
                                        Edit
                                    </DropdownMenuItem>
                                ) }
                                <DropdownMenuItem
                                    onClick={ ( e ) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    } }
                                    className='text-destructive text-xs py-0.5 px-1.5'>
                                    <Trash2 className='mr-1 h-3 w-3' />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className='p-1.5'>
                    { isEditing ? (
                        <div
                            className='space-y-1.5'
                            onClick={ ( e ) => e.stopPropagation() }>
                            <MarkdownEditor
                                value={ description }
                                onChange={ setDescription }
                                minHeight='100px'
                                maxHeight='200px'
                            />

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Priority</label>
                                { buildSelect( {
                                    placeholder: 'Priority',
                                    opts: TODO_PRIORITY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                                    value: priority,
                                    initialData: priority,
                                    key: 'priority',
                                    handleChange: setPriority,
                                } ) }
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Status</label>
                                { buildSelect( {
                                    placeholder: 'Status',
                                    opts: TODO_STATUS_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                                    value: status,
                                    initialData: status,
                                    key: 'status',
                                    handleChange: setStatus,
                                } ) }
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Difficulty</label>
                                { buildSelect( {
                                    placeholder: 'Difficulty',
                                    opts: TODO_DIFFICULTY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                                    value: difficulty,
                                    initialData: difficulty,
                                    key: 'difficulty',
                                    handleChange: setDifficulty,
                                } ) }
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Completeness</label>
                                <div className='flex items-center space-x-1'>
                                    <Input
                                        type='range'
                                        min='0'
                                        max='100'
                                        value={ completeness }
                                        onChange={ ( e ) =>
                                            setCompleteness(
                                                Number.parseInt( e.target.value ),
                                            )
                                        }
                                        className='w-full h-1.5'
                                    />
                                    <span className='text-xs w-6 text-right'>
                                        { completeness }%
                                    </span>
                                </div>
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Location</label>
                                <Input
                                    value={ location }
                                    onChange={ ( e ) =>
                                        setLocation( e.target.value )
                                    }
                                    placeholder='Task location'
                                    className='h-6 text-xs'
                                />
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Assignee</label>
                                <Select
                                    value={ selectedUserId }
                                    onValueChange={ setSelectedUserId }>
                                    <SelectTrigger className='w-full h-6 text-xs'>
                                        <SelectValue placeholder='Assign to...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value='0'
                                            className='text-xs py-0.5'>
                                            Unassigned
                                        </SelectItem>
                                        { availableUsers && availableUsers?.length > 0 && availableUsers.map( ( user ) => (
                                            <SelectItem
                                                key={ user?.id }
                                                value={ user?.id.toString() }
                                                className='text-xs py-0.5'>
                                                { user?.username }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-0.5'>
                                <label className='text-xs font-medium'>Categories</label>
                                <div className='flex flex-wrap gap-0.5'>
                                    { availableTags.map( ( tag ) => (
                                        <Badge
                                            key={ tag.id }
                                            variant='outline'
                                            className={ `cursor-pointer text-xs py-0 px-1 ${ selectedTagIds.includes( tag.id )
                                                ? 'bg-opacity-100'
                                                : 'bg-opacity-20'
                                                }` }
                                            style={ {
                                                backgroundColor:
                                                    selectedTagIds.includes(
                                                        tag.id,
                                                    )
                                                        ? tag.color
                                                        : 'transparent',
                                                color: selectedTagIds.includes(
                                                    tag.id,
                                                )
                                                    ? '#fff'
                                                    : tag.color,
                                                borderColor: tag.color,
                                            } }
                                            onClick={ () => {
                                                setSelectedTagIds( ( prev ) =>
                                                    prev.includes( tag.id )
                                                        ? prev.filter(
                                                            ( id ) =>
                                                                id !==
                                                                tag.id,
                                                        )
                                                        : [ ...prev, tag.id ],
                                                );
                                            } }>
                                            { tag.name }
                                        </Badge>
                                    ) ) }
                                </div>
                            </div>

                            <div className='space-y-0.5'>
                                <div className='flex items-center'>
                                    <label className='text-xs font-medium flex-1'>Pinned</label>
                                    <Button
                                        variant={
                                            isPinned ? 'default' : 'outline'
                                        }
                                        size='sm'
                                        className='h-6 text-xs px-2'
                                        onClick={ () => setIsPinned( !isPinned ) }>
                                        { isPinned ? 'Pinned' : 'Pin Task' }
                                    </Button>
                                </div>
                            </div>

                            <Popover
                                open={ isCalendarOpen }
                                onOpenChange={ setIsCalendarOpen }>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={ `w-full justify-start text-left font-normal text-xs h-6 ${ !timestampDue &&
                                            'text-muted-foreground'
                                            }` }
                                        size='sm'>
                                        <CalendarIcon className='mr-1 h-3 w-3' />
                                        { timestampDue
                                            ? format( timestampDue, 'PPP' )
                                            : 'Set due date' }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={ timestampDue }
                                        onSelect={ ( date ) => {
                                            setTimestampDue( date );
                                            setIsCalendarOpen( false );
                                        } }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <div className='flex justify-end space-x-1 pt-1'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-6 text-xs px-1.5'
                                    onClick={ () => {
                                        setIsEditing( false );
                                        setTitle( task.title );
                                        setDescription( task.description || '' );
                                        setTimestampDue(
                                            task.timestampDue
                                                ? new Date( task.timestampDue )
                                                : undefined,
                                        );
                                        setPriority( task.priority || 'none' );
                                        setDifficulty(
                                            task.difficulty || 'none',
                                        );
                                        setCompleteness( task.completeness || 0 );
                                        setStatus( task.status || 'none' );
                                        setLocation( task.location || '' );
                                        setSelectedUserId(
                                            task.userId?.toString() || '0',
                                        );
                                        setSelectedTagIds(
                                            task.categories?.map(
                                                ( cat, idx ) => idx,
                                            ) || [],
                                        );
                                        setIsPinned( task.isPinned || false );
                                    } }>
                                    Cancel
                                </Button>
                                <Button
                                    size='sm'
                                    className='h-6 text-xs px-1.5'
                                    onClick={ handleSave }>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            { description && (
                                <div className='text-xs text-muted-foreground mb-1 line-clamp-2'>
                                    { description }
                                </div>
                            ) }

                            <div className='flex flex-wrap gap-0.5 mb-1'>
                                { task.categories?.map( ( category, idx ) => (
                                    <Badge
                                        key={ idx }
                                        style={ {
                                            backgroundColor:
                                                availableTags[
                                                    idx % availableTags.length
                                                ]?.color || '#888',
                                        } }
                                        className='text-xs py-0 px-1'>
                                        { category }
                                    </Badge>
                                ) ) }
                            </div>

                            <motion.div
                                animate={ { height: contentHeight } }
                                transition={ { duration: 0.2 } }
                                className='overflow-hidden'>
                                <div ref={ contentRef }>
                                    <AnimatePresence>
                                        { isExpanded && (
                                            <motion.div
                                                initial={ { opacity: 0 } }
                                                animate={ { opacity: 1 } }
                                                exit={ { opacity: 0 } }
                                                className='pt-1 space-y-1.5'>
                                                { task.completeness !==
                                                    undefined && (
                                                        <div className='space-y-0.5'>
                                                            <div className='flex justify-between text-xs'>
                                                                <span>Completeness</span>
                                                                <span>{ task.completeness }%</span>
                                                            </div>
                                                            <div className='h-1 w-full bg-background rounded-full overflow-hidden'>
                                                                <div
                                                                    className='h-full bg-primary'
                                                                    style={ {
                                                                        width: `${ task.completeness }%`,
                                                                    } }></div>
                                                            </div>
                                                        </div>
                                                    ) }

                                                { task.priority &&
                                                    task.priority !==
                                                    'none' && (
                                                        <div className='flex items-center text-xs'>
                                                            <AlertCircle className='h-3 w-3 mr-0.5' />
                                                            <span className='capitalize'>
                                                                { task.priority }{ ' ' }
                                                                Priority
                                                            </span>
                                                        </div>
                                                    ) }

                                                { task.difficulty &&
                                                    task.difficulty !==
                                                    'none' && (
                                                        <div className='flex items-center text-xs'>
                                                            <AlertCircle className='h-3 w-3 mr-0.5' />
                                                            <span className='capitalize'>{ task.difficulty }{ ' ' }Difficulty</span>
                                                        </div>
                                                    ) }

                                                { task.status &&
                                                    task.status !== 'none' && (
                                                        <div className='flex items-center text-xs'>
                                                            <Badge
                                                                className={ `text-xs py-0 px-1 ${ getStatusBadge() }` }>
                                                                { task.status }
                                                            </Badge>
                                                        </div>
                                                    ) }

                                                { task.location && (
                                                    <div className='flex items-center text-xs'>
                                                        <MapPin className='h-3 w-3 mr-0.5' />
                                                        <span>{ task.location }</span>
                                                    </div>
                                                ) }

                                                { task.subtaskIds &&
                                                    task.subtaskIds.length >
                                                    0 && (
                                                        <div className='space-y-0.5'>
                                                            <div className='text-xs font-medium'>
                                                                Subtasks
                                                            </div>
                                                            <div className='text-xs text-muted-foreground'>
                                                                {
                                                                    task
                                                                        .subtaskIds
                                                                        .length
                                                                }{ ' ' }
                                                                subtask
                                                                { task.subtaskIds
                                                                    .length !==
                                                                    1
                                                                    ? 's'
                                                                    : '' }
                                                            </div>
                                                        </div>
                                                    ) }

                                                { task && task?.notes &&
                                                    task.notes.length > 0 && (
                                                        <div className='space-y-0.5'>
                                                            <div className='text-xs font-medium'>
                                                                Notes
                                                            </div>
                                                            { task.notes.map(
                                                                ( note, i ) => (
                                                                    <div
                                                                        key={ i }
                                                                        className='text-xs text-muted-foreground'>
                                                                        { note }
                                                                    </div>
                                                                ),
                                                            ) }
                                                        </div>
                                                    ) }
                                            </motion.div>
                                        ) }
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </>
                    ) }
                </CardContent>
                <CardFooter className='p-1.5 pt-0 flex justify-between items-center'>
                    <div className='flex items-center'>
                        { task.userId ? (
                            <Avatar className='h-4 w-4'>
                                <AvatarImage
                                    src={
                                        availableUsers.find(
                                            ( u ) => u.id === task.userId,
                                        )?.avatarUrl || ''
                                    }
                                    alt={
                                        availableUsers.find(
                                            ( u ) => u.id === task.userId,
                                        )?.name || ''
                                    }
                                />
                                <AvatarFallback className='text-[8px]'>
                                    { availableUsers
                                        .find( ( u ) => u.id === task.userId )
                                        ?.name?.charAt( 0 ) || 'U' }
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <User className='h-3 w-3 text-muted-foreground' />
                        ) }
                    </div>

                    <div className='flex items-center space-x-1'>
                        <div
                            className={ `text-xs flex items-center ${ getDueDateColor() }` }>
                            { timestampDue && (
                                <>
                                    <CalendarIcon className='mr-0.5 h-3 w-3' />
                                    { format( new Date( timestampDue ), 'MMM d' ) }
                                </>
                            ) }
                        </div>

                        { !isEditing && (
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-4 w-4'
                                onClick={ ( e ) => {
                                    e.stopPropagation();
                                    toggleExpand();
                                } }>
                                { isExpanded ? (
                                    <ChevronUp className='h-3 w-3' />
                                ) : (
                                    <ChevronDown className='h-3 w-3' />
                                ) }
                            </Button>
                        ) }
                    </div>
                </CardFooter>
            </Card>

            {/* Task Details Dialog */ }
            <Dialog
                open={ isMaximized }
                onOpenChange={ setIsMaximized }>
                <DialogContent className='max-w-lg p-3'>
                    <DialogHeader className='pb-1'>
                        <DialogTitle className='flex items-center space-x-1 text-base'>
                            <div
                                className={ `w-1 h-4 rounded-full ${ getPriorityColor() }` }></div>
                            <span>{ task.title }</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className='grid grid-cols-3 gap-3'>
                        <div className='col-span-2 space-y-3'>
                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>
                                    Description
                                </h4>
                                <MarkdownEditor
                                    value={ description }
                                    onChange={ setDescription }
                                    minHeight='150px'
                                    maxHeight='300px'
                                />
                            </div>

                            { task.subtaskIds && task.subtaskIds.length > 0 && (
                                <div>
                                    <h4 className='text-xs font-medium mb-0.5'>
                                        Subtasks
                                    </h4>
                                    <div className='text-xs text-muted-foreground'>
                                        { task.subtaskIds.length } subtask
                                        { task.subtaskIds.length !== 1
                                            ? 's'
                                            : '' }
                                    </div>
                                </div>
                            ) }

                            { task.notes && task.notes.length > 0 && (
                                <div>
                                    <h4 className='text-xs font-medium mb-0.5'>Notes</h4>
                                    <div className='space-y-0.5'>
                                        { task.notes.map( ( note, i ) => (
                                            <div
                                                key={ i }
                                                className='text-xs text-muted-foreground'>
                                                { note }
                                            </div>
                                        ) ) }
                                    </div>
                                </div>
                            ) }

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Categories</h4>
                                <div className='flex flex-wrap gap-0.5'>
                                    { task.categories?.map( ( category, idx ) => (
                                        <Badge
                                            key={ idx }
                                            style={ {
                                                backgroundColor:
                                                    availableTags[
                                                        idx %
                                                        availableTags.length
                                                    ]?.color || '#888',
                                            } }
                                            className='text-xs py-0 px-1'>
                                            { category }
                                        </Badge>
                                    ) ) }
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Status</h4>
                                <Badge
                                    variant='outline'
                                    className={ `capitalize text-xs py-0 px-1 ${ getStatusBadge() }` }>
                                    { task.status || 'None' }
                                </Badge>
                            </div>

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Priority</h4>
                                <Badge
                                    variant='outline'
                                    className='capitalize text-xs py-0 px-1'
                                    style={ {
                                        backgroundColor: getPriorityColor(),
                                        color: '#fff',
                                    } }>
                                    { task.priority || 'None' }
                                </Badge>
                            </div>

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Difficulty</h4>
                                <Badge
                                    variant='outline'
                                    className={ `capitalize text-xs py-0 px-1 ${ getDifficultyBadge() }` }>
                                    { task.difficulty || 'None' }
                                </Badge>
                            </div>

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Assignee</h4>
                                { task.userId ? (
                                    <div className='flex items-center space-x-1'>
                                        <Avatar className='h-4 w-4'>
                                            <AvatarImage
                                                src={
                                                    availableUsers.find(
                                                        ( u ) =>
                                                            u.id ===
                                                            task.userId,
                                                    )?.avatarUrl || ''
                                                }
                                                alt={
                                                    availableUsers.find(
                                                        ( u ) =>
                                                            u.id ===
                                                            task.userId,
                                                    )?.name || ''
                                                }
                                            />
                                            <AvatarFallback className='text-[8px]'>
                                                { availableUsers
                                                    .find(
                                                        ( u ) =>
                                                            u.id ===
                                                            task.userId,
                                                    )
                                                    ?.name?.charAt( 0 ) || 'U' }
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className='text-xs'>
                                            { availableUsers.find(
                                                ( u ) => u.id === task.userId,
                                            )?.name || 'Unknown' }
                                        </span>
                                    </div>
                                ) : (
                                    <span className='text-xs text-muted-foreground'>
                                        Unassigned
                                    </span>
                                ) }
                            </div>

                            { task.location && (
                                <div>
                                    <h4 className='text-xs font-medium mb-0.5'>Location</h4>
                                    <div className='flex items-center text-xs'>
                                        <MapPin className='h-3 w-3 mr-0.5' />
                                        <span>{ task.location }</span>
                                    </div>
                                </div>
                            ) }

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Due Date</h4>
                                { task.timestampDue ? (
                                    <div
                                        className={ `text-xs flex items-center ${ getDueDateColor() }` }>
                                        <CalendarIcon className='mr-1 h-3 w-3' />
                                        { format(
                                            new Date( task.timestampDue ),
                                            'PPP',
                                        ) }
                                    </div>
                                ) : (
                                    <span className='text-xs text-muted-foreground'>
                                        No due date
                                    </span>
                                ) }
                            </div>

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Completeness</h4>
                                <div className='space-y-0.5'>
                                    <div className='h-1 w-full bg-secondary rounded-full overflow-hidden'>
                                        <div
                                            className='h-full bg-primary'
                                            style={ {
                                                width: `${ task.completeness || 0
                                                    }%`,
                                            } }></div>
                                    </div>
                                    <div className='text-xs text-right'>
                                        { task.completeness || 0 }%
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className='text-xs font-medium mb-0.5'>Created</h4>
                                <div className='text-xs flex items-center text-muted-foreground'>
                                    <Clock className='mr-1 h-3 w-3' />
                                    { format( new Date( task.createdAt ), 'PPP' ) }
                                </div>
                            </div>

                            <div className='pt-3 flex justify-end space-x-1'>
                                <Button
                                    variant='outline'
                                    className='h-6 text-xs px-1.5'
                                    onClick={ () => {
                                        setIsMaximized( false );
                                        setIsEditing( true );
                                        setIsExpanded( true );
                                    } }>
                                    <Pencil className='mr-1 h-3 w-3' />
                                    Edit
                                </Button>
                                <Button
                                    variant='destructive'
                                    className='h-6 text-xs px-1.5'
                                    onClick={ () => {
                                        setIsMaximized( false );
                                        handleDelete();
                                    } }>
                                    <Trash2 className='mr-1 h-3 w-3' />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
