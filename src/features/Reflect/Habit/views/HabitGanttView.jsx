import { useEffect, useMemo, useRef, useState } from 'react';
import { format, differenceInCalendarDays, startOfDay, isDate } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import useReflectStore from '@/store/reflect.store';
import { useVirtualDays } from '../lib/use-virtual-days';
import { getPrettyDateTime } from '@/lib/utilities/time';
import { Switch } from '@/components/ui/switch';
import useReflect from '@/lib/hooks/useReflect';
import HabitForm from '../blocks/HabitForm/HabitForm';
import { DeleteIcon, EditIcon } from 'lucide-react';
import * as utils from 'akashatools';

const COL_WIDTH = 64; // px, consistent width for all day columns
const STICKY_COL_WIDTH = 180; // px, consistent width for habit column
const EDGE_THRESHOLD_PX = 80; // px from edges to trigger lazy-load
const BATCH_SIZE = 14;

const HabitGanttView = () => {
    const {
        habitsData, setHabitsData,
        getActiveHabits, getInactiveHabits,
        selectedHabitsDate,
        setSelectedHabitsDate,
        getActivityForDate,
        updateHabitActivity,
        updateHabit, createHabit, deleteHabit,
        getHabitById,
        toggleHabitActive,
    } = useReflectStore();

    const {
        // State variables
        dialogType, setDialogType,
        dialogData, setDialogData,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,

        ///////////////////////////// Stats/Data hooks /////////////////////////////
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
        columns: STATS_DATATABLE_COLUMNS,

        ///////////////////////////// Habits hooks /////////////////////////////
        handleFetchHabitById,
        handleFetchAllHabits,
        handleCreateHabit,
        handleUpdateHabit,
        handleCloneHabit,
        handleDeleteHabitStart,
        handleDeleteHabit,
    } = useReflect();

    // const habits = getActiveHabits();
    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );
    const inactiveHabits = useMemo( () => ( getInactiveHabits() ), [ habitsData ] );

    // Virtualized days around the selected date
    const {
        days,
        startDate,
        extendLeft,
        extendRight,
        ensureDateInRange,
        consumePendingScrollDate,
    } = useVirtualDays( {
        initialDate: new Date( selectedHabitsDate ),
        initialDays: 28,
        batchSize: BATCH_SIZE,
    } );

    const [ customModalOpen, setCustomModalOpen ] = useState( false );
    const [ customModalData, setCustomModalData ] = useState( {
        habitId: '',
        date: '',
        notes: '',
    } );
    const [ validationError, setValidationError ] = useState( '' );
    const [ gotoOpen, setGotoOpen ] = useState( false );
    const [ gotoDate, setGotoDate ] = useState( startOfDay( new Date() ) );
    const [ habitFormData, setHabitFormData ] = useState( null );
    const [ isEditingHabit, setIsEditingHabit ] = useState( false );
    const [ showHabitForm, setShowHabitForm ] = useState( false );

    const handleSetEditingHabit = ( habit ) => {
        setHabitFormData( habit );
        setIsEditingHabit( true );
        setShowHabitForm( true );
    };


    // Refs for scrolling
    const scrollRef = useRef( null );

    // Shared go-to function used by both "Today" and "Go To" buttons
    const goToDate = ( date ) => {
        if ( date instanceof Date || isDate( date ) ) {
            const day = startOfDay( date );
            setSelectedHabitsDate( day );
            ensureDateInRange( day );
        }
    };

    // After days change, if a pending scroll date exists, scroll to that column
    useEffect( () => {
        const target = consumePendingScrollDate();
        if ( !target || !scrollRef.current ) return;

        const index = Math.max( 0, differenceInCalendarDays( target, startDate ) );
        const left = index * COL_WIDTH; // left offset of the day columns
        // account for sticky habit column width
        scrollRef.current.scrollLeft = left;
    }, [ days, startDate, consumePendingScrollDate ] );

    // Lazy load when reaching scroll edges
    const handleHorizontalScroll = () => {
        const el = scrollRef.current;
        if ( !el ) return;
        const atLeft = el.scrollLeft <= EDGE_THRESHOLD_PX;
        const atRight =
            el.scrollLeft + el.clientWidth >=
            el.scrollWidth - EDGE_THRESHOLD_PX;

        if ( atLeft ) {
            // We extend left; to keep visual position, adjust scrollLeft after extending
            const beforeWidth = el.scrollWidth;
            extendLeft( BATCH_SIZE );
            // Defer to next paint to maintain position
            requestAnimationFrame( () => {
                const addedWidth = BATCH_SIZE * COL_WIDTH;
                el.scrollLeft += addedWidth;
            } );
        } else if ( atRight ) {
            extendRight( BATCH_SIZE );
        }
    };

    // Render helpers
    const handleToggleChange = async ( habitId, date, checked ) => {
        // First handle the client-side state update.
        let result = updateHabitActivity( habitId, date, checked ? 1 : 0, '' );

        if ( result ) {
            // Then pass it along to the server.
            let data = await handleUpdateHabit( habitId, result );
        }
    };

    const handleValueChange = async ( habit, date, value ) => {
        const numValue = Number.parseFloat( value );
        if (
            habit.minValue !== null &&
            !Number.isNaN( numValue ) &&
            numValue < habit.minValue
        ) {
            setValidationError( `Value must be at least ${ habit.minValue }` );
            return;
        }
        if (
            habit.maxValue !== null &&
            !Number.isNaN( numValue ) &&
            numValue > habit.maxValue
        ) {
            setValidationError( `Value must be at most ${ habit.maxValue }` );
            return;
        }
        setValidationError( '' );

        // First handle the client-side state update.
        let result = updateHabitActivity(
            habit?._id,
            date,
            Number.isNaN( numValue ) ? 0 : numValue,
            '',
        );

        if ( result ) {
            // Then pass it along to the server.
            let data = await handleUpdateHabit( habit?._id, result );
        }
    };

    const handleCustomClick = ( habitId, date ) => {
        const activity = getActivityForDate( habitId, date ) || {};
        setCustomModalData( {
            habitId,
            date: date.toISOString(),
            notes: activity?.notes || '',
        } );
        setCustomModalOpen( true );
    };

    const handleCustomSave = async () => {
        let result = updateHabitActivity(
            customModalData.habitId,
            customModalData.date,
            0,
            customModalData.notes,
        );

        if ( result ) {
            // Then pass it along to the server.
            let data = await handleUpdateHabit( customModalData.habitId, result );
            if ( data ) {
                setCustomModalOpen( false );
                setCustomModalData( { habitId: '', date: '', notes: '' } );
            }
        }
    };

    const renderCell = ( habit, date ) => {
        const activity = getActivityForDate( habit._id, date );
        const key = `${ habit._id }-${ date.toISOString() }`;

        switch ( habit.inputType ) {
            case 'toggle':
                return (
                    <Switch
                        key={ key }
                        size={ 4 }
                        id={ key }
                        className={ `h-3 w-3` }
                        defaultChecked={ activity?.value === 1 }
                        onCheckedChange={ ( checked ) =>
                            handleToggleChange( habit._id, date, checked )
                        }
                    />
                );
            case 'value': {
                const input = (
                    <Input
                        key={ key }
                        type='number'
                        value={ activity?.value ?? '' }
                        onChange={ ( e ) =>
                            handleValueChange( habit, date, e.target.value )
                        }
                        className='w-[56px] h-6 text-center text-xs p-1'
                        min={ habit.minValue ?? undefined }
                        max={ habit.maxValue ?? undefined }
                    />
                );
                const hasValidation =
                    habit.minValue !== null || habit.maxValue !== null;
                if ( hasValidation && validationError ) {
                    return (
                        <Popover>
                            <PopoverTrigger asChild>{ input }</PopoverTrigger>
                            <PopoverContent className='w-auto p-2'>
                                <Alert className='p-1'>
                                    <AlertDescription className='text-xs'>
                                        { validationError }
                                    </AlertDescription>
                                </Alert>
                            </PopoverContent>
                        </Popover>
                    );
                }
                return input;
            }
            case 'custom':
                return (
                    <div className='flex items-center justify-center'>
                        <Button
                            key={ key }
                            variant='outline'
                            size='sm'
                            onClick={ () => handleCustomClick( habit._id, date ) }
                            className='w-[56px] h-6 text-xs p-0'>
                            { activity?.notes ? '📝' : '➕' }
                        </Button>
                    </div>
                );
            default:
                return (
                    <div
                        key={ key }
                        className='w-[56px] h-6'
                    />
                );
        }
    };

    // Header controls (compact)
    const headerControls = (
        <div className='flex items-center gap-2 mb-2'>
            <Button
                size='sm'
                variant='outline'
                className='h-7 px-2 text-xs bg-transparent'
                onClick={ () => goToDate( new Date() ) }>
                Today
            </Button>

            <Popover
                open={ gotoOpen }
                onOpenChange={ setGotoOpen }>
                <PopoverTrigger asChild>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-7 px-2 text-xs bg-transparent'>
                        Pick Date
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-2'>
                    <CalendarPicker
                        mode='single'
                        selected={ gotoDate }
                        onSelect={ ( d ) => d && setGotoDate( startOfDay( d ) ) }
                        initialFocus
                    />
                    <div className='flex justify-end pt-2'>
                        <Button
                            size='sm'
                            className='h-7 px-2 text-xs'
                            onClick={ () => {
                                setGotoOpen( false );
                                goToDate( gotoDate || new Date() );
                            } }>
                            Go To
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div className='text-xs text-muted-foreground ml-auto'>
                Showing { days?.length } days from{ ' ' }
                { getPrettyDateTime( new Date( startDate || new Date() ) ) }
            </div>
        </div>
    );

    const renderHabitsTable = ( habits ) => {
        if ( utils.val.isValidArray( habits, true ) ) {
            return (

                <div
                    ref={ scrollRef }
                    className='h-full min-h-full max-h-full overflow-auto border rounded mx-2'
                    onScroll={ handleHorizontalScroll }>
                    <table className='w-max h-full border-collapse'>
                        {/* Sticky first column width via colgroup */ }
                        <colgroup>
                            <col style={ { width: STICKY_COL_WIDTH } } />
                            { days.map( ( _, i ) => (
                                <col
                                    key={ i }
                                    style={ { width: COL_WIDTH } }
                                />
                            ) ) }
                        </colgroup>

                        <thead>
                            <tr>
                                <th className='sticky left-0 top-0 bg-background z-10 border-b p-1 text-left'>
                                    <div className='text-sm font-medium px-2'>
                                        Habit
                                    </div>
                                </th>
                                { days.map( ( day ) => (
                                    <th
                                        key={ new Date( day ).toISOString() }
                                        className='border-b p-1 text-center'
                                        style={ { width: COL_WIDTH } }
                                        title={ format( new Date( day ), 'PPPP' ) }>
                                        <div className='text-[10px]'>
                                            { format( new Date( day ), 'EEE' ) }
                                        </div>
                                        <div className='text-xs font-medium'>
                                            { format( new Date( day ), 'M/d' ) }
                                        </div>
                                    </th>
                                ) ) }
                            </tr>
                        </thead>

                        <tbody className={ `w-full h-full overflow-y-auto relative` }>
                            { habits.map( ( habit ) => (
                                <tr
                                    className={ `h-full p-0 hover:!bg-[${ String( habit.color ) }22]/20` }
                                    key={ habit._id }
                                    style={ {
                                        backgroundColor: `${ habit.color }22`,
                                    } }
                                >
                                    <td
                                        className={ `sticky left-0 bg-background z-10 border-b p-1 hover:bg-[${ String( habit.color ) }] saturate-50 backdrop-blur-sm fill-mode-backwards p-1` }
                                        style={ {
                                            backgroundColor: `${ habit.color }22`,
                                        } }
                                    >
                                        <div className='flex items-center gap-2 !border-r-[0.1rem] !border-r-border'>
                                            <div
                                                className={ `${ habit?.isActive ? 'size-4' : 'size-2' } aspect-square rounded-full` }
                                                style={ {
                                                    backgroundColor: habit.color,
                                                } }
                                                onClick={ async () => {
                                                    console.log( "Toggling habit: ", habit );
                                                    // toggleHabitActive( habit._id );
                                                    setHabitsData(
                                                        habitsData?.map( ( h ) => ( h?._id === habit?.id ? { ...h, isActive: !h?.isActive } : h ) )
                                                    );
                                                    const result = await handleUpdateHabit( habit?._id, { ...habit, isActive: !habit?.isActive } );
                                                } }
                                            />
                                            <div className='justify-between flex-row w-full'>
                                                <div className='min-w-0 p-0'>
                                                    <div className='text-sm font-medium truncate'>
                                                        { habit.title }
                                                    </div>
                                                    <div className='text-xs text-muted-foreground capitalize'>
                                                        { habit.inputType }
                                                    </div>
                                                </div>
                                                <div className='p-0'>
                                                    <Button
                                                        className={ `rounded-xl` }
                                                        variant='ghost'
                                                        size={ `icon` }
                                                        onClick={ () => ( handleSetEditingHabit( habit ) ) }
                                                    >
                                                        <EditIcon className={ `aspect-square size-4 p-0 m-0` } />
                                                    </Button>
                                                    <Button
                                                        className={ `rounded-xl` }
                                                        variant='ghost'
                                                        size={ `icon` }
                                                        onClick={ () => ( handleDeleteHabit( habit?._id ) ) }
                                                    >
                                                        <DeleteIcon className={ `aspect-square size-4 p-0 m-0` } />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    { days.map( ( day ) => (
                                        <td
                                            key={ `${ habit._id }-${ day.toISOString() }` }
                                            className={ `h-full border-b border-x hover:!bg-[#${ String( habit.color ) }] p-1 text-center align-middle` }
                                            style={ {
                                                width: COL_WIDTH,
                                            } }
                                        >
                                            { renderCell( habit, day ) }
                                        </td>
                                    ) ) }
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className='w-full max-w-full max-h-[80vh] overflow-hidden p-2'>
            { headerControls }

            <div className='w-full max-w-full space-y-4'>
                <div className='w-full space-y-4 overflow-y-auto min-h-full max-h-full h-full relative'>
                    <div className="self-center text-left text-lg">Active Habits</div>
                    { utils.val.isValidArray( activeHabits, true ) && renderHabitsTable( activeHabits ) }
                </div>
                <div className='w-full space-y-4 overflow-y-auto min-h-full max-h-full h-full relative'>
                    <div className="self-center text-left text-lg">Inactive Habits</div>
                    { utils.val.isValidArray( inactiveHabits, true ) && renderHabitsTable( inactiveHabits ) }
                </div>
            </div>


            { showHabitForm && habitFormData && (
                <HabitForm
                    habit={ habitFormData }
                    onSubmit={ async ( data ) => {
                        // Create a habit with the correct fieldNames. 
                        let updatedHabit = updateHabit( data?._id || habitFormData?._id, data );

                        const result = await handleUpdateHabit( data?._id || habitFormData?._id, data );
                        if ( result ) {
                            // addHabit( result );
                            setShowHabitForm( false );
                        }
                    } }
                    onCancel={ () => {
                        setShowHabitForm( false );
                        setHabitFormData( null );
                        if ( isEditingHabit ) setIsEditingHabit( false );
                    } }
                />
            ) }

            {/* Custom note modal */ }
            <Dialog
                open={ customModalOpen }
                onOpenChange={ setCustomModalOpen }>
                <DialogContent className='max-w-md p-2'>
                    <DialogHeader>
                        <DialogTitle className='text-lg'>
                            Edit Custom Note
                        </DialogTitle>
                    </DialogHeader>
                    <div className='space-y-2'>
                        <Textarea
                            value={ customModalData.notes }
                            onChange={ ( e ) =>
                                setCustomModalData( ( prev ) => ( {
                                    ...prev,
                                    notes: e.target.value,
                                } ) )
                            }
                            placeholder='Enter your notes for this day...'
                            rows={ 3 }
                            className='text-sm'
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={ () => setCustomModalOpen( false ) }
                            size='sm'
                            className='h-7'>
                            Cancel
                        </Button>
                        <Button
                            onClick={ handleCustomSave }
                            size='sm'
                            className='h-7'>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HabitGanttView;
