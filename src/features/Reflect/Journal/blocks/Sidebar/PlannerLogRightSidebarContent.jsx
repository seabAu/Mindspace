import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { Spinner } from '@/components/Loader/Spinner';
import { twMerge } from 'tailwind-merge';
import DateInput from '@/components/Calendar/DateInput';
import { SidebarSeparator } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowBigRightDashIcon, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { CalendarBody, CalendarDate, CalendarDatePagination, CalendarDatePicker, CalendarHeader, CalendarItem, CalendarMonthPicker, CalendarProvider, CalendarYearPicker } from '@/features/Planner/blocks/Calendar/Calendar';
import { DateTimeLocal } from '@/lib/config/types';
import PlannerDialog from '@/features/Planner/components/dialog/PlannerDialog';
import { getPrettyDate } from '@/lib/utilities/time';
import useReflectStore from '@/store/reflect.store';
import useReflect from '@/lib/hooks/useReflect';

const PlannerLogRightSidebarContent = ( props ) => {
    const {
        // log,
        // setLog,
        // updateLog,
        parentPath,
        classNames
    } = props;

    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const {
        requestFetchLogs, setRequestFetchLogs,
        selectedLog, setSelectedLog,
        logsData, setLogsData,
        addLog, updateLog, deleteLog, sortLogs,
        getLogByDate,
        selectedDate, setSelectedDate,
    } = useReflectStore();

    const {
        initialLogData,

        // HANDLER FUNCTIONS
        // >> enerci
        // >> Generic handlers
        handleCreateStart, handleCreateSubmit,
        handleEditStart, handleEditSubmit,
        handleCancel,

        // >> Logs handlers
        handleFetchLogById,
        handleFetchLogs,
        handleCloneLog,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,

        // GETTERS / SETTERS
        dialogDataSchema, setDialogDataSchema,
        logSchema, setLogSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        showGotoDialog, setShowGotoDialog,
        logDialogOpen, setLogDialogOpen,
        isNotesSidebarOpen, setIsNotesSidebarOpen,
        notesOpen, setNotesOpen, notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        handleOpenLogNotes,
    } = useReflect();

    // const { logs, removeLog } = useLogs();
    const [ newLogData, setNewLogData ] = useState( {} );
    const [ logFormModel, setLogFormModel ] = useState( null );
    const [ logFormData, setLogFormData ] = useState( null );
    const [ logFormSchema, setLogFormSchema ] = useState( null );

    let allData = getData();
    /* useEffect( () => {
        if ( !utils.val.isDefined( logFormSchema ) ) { setLogFormSchema( ( prev ) => ( getSchemaForDataType( 'log' ) ) ); }
    }, [] ); */

    useEffect( () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            if ( logFormSchema === null ) setLogFormSchema( getSchema( 'log' ) );
        }
    }, [] );

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
            else { acc[ key ] = value; }
            return acc;
        }, {}
        );

        console.log( "Form submitted with data:", processedData );
        // Here you would typically send the processedData to your backend
        handleCreateLog( formData );
    };

    const handleDateChange = useCallback(
        ( day ) => {
            // setSelectedDate( day );
            // If we have a log for this day, begin editing it.
            // If not, begin the process of creating a new log.
            let log = ( getLogByDate( new Date( day ) ) );
            if ( log ) {
                handleEditStart( log, 'log' );
                setSelectedLog( log );
                setDialogType( 'add' );
                setLogFormData( log );
            }
            else {
                handleCreateStart( { date: new Date( day ), title: `Log entry for ${ getPrettyDate( day ) }` }, 'log' );
                setDialogType( 'edit' );
                setLogFormData( { date: new Date( day ) } );
            }
        }
        , [ logsData, selectedDate ]
    );

    // const earliestYear =
    //     logsData
    //         ?.map( ( log ) => new Date( log?.date ).getFullYear() )
    //         ?.sort()
    //         ?.at( 0 ) ?? new Date().getFullYear();

    // const latestYear =
    //     logsData
    //         ?.map( ( log ) => new Date( log?.date ).getFullYear() )
    //         ?.sort()
    //         ?.at( -1 ) ?? new Date().getFullYear();

    return (
        <div
            className={ `w-full h-full overflow-auto p-2` }>

            {/* <div className={ `w-full flex flex-col flex-grow` }>
                <DateInput
                    mode={ `single` }
                    date={ selectedDate }
                    setDate={ setSelectedDate }
                />
                <SidebarSeparator className="mx-0" />

                { utils.val.isValidArray( calendarsData, true ) && (
                    <CalendarSelector
                        // setCalendars={ setCalendarsData }
                        onClickItem={ ( calendar ) => { handleToggleActive( calendar ); } }
                        selectedDate={ selectedDate } setSelectedDate={ setSelectedDate }
                    />
                ) }
            </div> */}

            <Tabs defaultOpen='list' defaultValue="list" className={ `w-full justify-center !col-span-12 flex flex-col items-stretch` }>
                <TabsList className={ `flex flex-row items-center justify-center h-auto rounded-[0.5rem] text-sextary-100 bg-sextary` }>
                    <TabsTrigger value="new" className={ `w-auto h-6 rounded-[0.5rem] flex-grow justify-center items-center text-lg px-2 py-1` }>New</TabsTrigger>
                    { logsData?.length && ( <TabsTrigger value="list" className={ `w-auto h-6 rounded-[0.5rem] flex-grow justify-center items-center text-lg px-2 py-1` }>List</TabsTrigger> ) }
                </TabsList>

                { logsData?.length > 0 && (
                    <TabsContent value="list" className={ `transition-all duration-500 ease-in-out` }>
                        <div className={ `w-full flex flex-col flex-grow` }>
                            {/* <DatePicker
                                selectedDate={ selectedDate ?? new Date( Date.now() ) }
                                setSelectedDate={ setSelectedDate }
                            /> */}

                            <CalendarProvider>
                                <CalendarDate className={ `overflow-hidden` }>
                                    <CalendarDatePicker className={ `px-0 gap-0 items-stretch justify-stretch max-w-full w-full` }>
                                        <CalendarMonthPicker />
                                        <CalendarYearPicker
                                            start={ new Date().getFullYear() - 10 }
                                            end={ new Date( Date.now() ).getFullYear() + 10 }
                                        />
                                        <CalendarDatePagination />
                                    </CalendarDatePicker>
                                </CalendarDate>
                                <CalendarHeader />
                                <CalendarBody
                                    features={ logsData }
                                    selectedDate={ selectedDate }
                                    onDayClick={ ( day ) => {
                                        console.log( "PlannerLogRightSidebarContent :: CalendarBody :: onDayClick :: day = ", day );
                                        setSelectedDate( day );
                                    } }
                                    onDayDoubleClick={ ( day ) => {
                                        console.log( "PlannerLogRightSidebarContent :: CalendarBody :: onDayDoubleClick :: day = ", day );
                                        setSelectedDate( day );
                                        handleDateChange( day );
                                    } }
                                >
                                    {/* { utils.val.isValidArray( logsData, true )
                                        && ( logsData?.map( ( log ) => {
                                            return (
                                                <CalendarItem
                                                    key={ log?._id }
                                                    feature={ log?.date }
                                                />
                                            );
                                        } ) ) } */}
                                    { ( { feature } ) => <CalendarItem key={ feature?._id } feature={ feature } /> }
                                </CalendarBody>
                            </CalendarProvider>

                            {/* <DateInput
                                mode={ `single` }
                                date={ selectedDate }
                                setDate={ setSelectedDate }
                            /> */}

                            <SidebarSeparator className="mx-0" />

                            {/* { utils.val.isValidArray( calendarsData, true ) && (
                                <CalendarSelector
                                    // setCalendars={ setCalendarsData }
                                    onClickItem={ ( calendar ) => { handleToggleActive( calendar ); } }
                                    selectedDate={ selectedDate } setSelectedDate={ setSelectedDate }
                                />
                            ) } */}
                        </div>

                        <div className={ twMerge( `flex flex-col w-full h-auto p-2 gap-2 border border-2 rounded-lg` ) }>

                            { utils.val.isValidArray( logsData, true )
                                ? ( logsData?.map( ( log ) => {
                                    if (
                                        log &&
                                        utils.ao.hasAll( log, [
                                            '_id',
                                            'date',
                                            'title',
                                            'summary',
                                        ] )
                                    ) {
                                        return (
                                            <div className={ twMerge( `flex flex-col w-full h-auto p-2 gap-2 border border-2 rounded-lg` ) }
                                                id={ log?._id }
                                                key={ log?._id }>
                                                <div className={ twMerge( `` ) }>
                                                    { new Date(
                                                        log?.date,
                                                    ).toLocaleDateString() }
                                                </div>
                                                <div className={ twMerge( `` ) }>{ log?.title }</div>
                                                <div className={ twMerge( `` ) }>{ log?.summary }</div>
                                                <div className={ twMerge( `` ) }>
                                                    <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                                                        <Link to={ `/dash/journal/${ log?._id }` }>
                                                            <Button variant='outline'>
                                                                <ArrowBigRightDashIcon />
                                                            </Button>
                                                        </Link>
                                                        <Link to={ `/dash/journal/${ log?._id }/edit` }>
                                                            <Button variant='outline'>Edit</Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                } ) )
                                : ( <Spinner
                                    variant={ 'circles' }
                                    size={ 'md' }
                                    color={ 'currentColor' }
                                    overlay={ false }
                                    className={ `` }
                                /> ) }
                        </div>
                    </TabsContent>
                ) }

                <TabsContent value="new" className={ `transition-all duration-500 ease-in-out` }>
                    <h1 className='text-2xl font-bold '>
                        { `New Log for (${ new Date(
                            Date.now(),
                        ).toLocaleDateString() })` }
                    </h1>

                    <div className={ `w-full h-full overflow-hidden` }>
                        <div className={ `w-full h-full justify-start px-2 border border-dashed border-brand-washedBlue-200` }>
                            { logFormSchema && utils.val.isObject( logFormSchema ) ? (
                                <FormGenerator
                                    debug={ false }
                                    showSidebar={ true }
                                    showOptional={ true } // Show all fields by default. 
                                    customFields={ [] }
                                    classNames={ `justify-start` }
                                    setData={ setLogFormData }
                                    model={ logFormModel }
                                    data={ logFormData }
                                    // data={ initialLogData }
                                    refData={ allData }
                                    dataType={ dialogDataType }
                                    // initialData={ logFormData }
                                    initialData={ initialLogData }
                                    schema={ logFormSchema }
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        if ( data && Object.keys( data )?.includes( name ) ) {
                                            if ( handleChange ) handleChange( name, value, data, setData );
                                            setLogFormData( { ...data, [ name ]: value } );
                                        }
                                    } }
                                    onCancel={ handleCancel }
                                    onSubmit={ ( data ) => handleSubmit( data ) }
                                    inputMaxWidth={ 10 }
                                    inputMaxHeight={ 32 }
                                />
                            ) : ( <Spinner
                                variant={ 'circles' }
                                size={ 'md' }
                                color={ 'currentColor' }
                                overlay={ false }
                                className={ `` }
                            /> ) }
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="new" className={ `` }>
                    <div className={ `flex flex-row gap-4 transition-all duration-400 ease-in-out flex-shrink` }>
                        <Collapsible defaultOpen={ true } className="group/collapsible">
                            <Label
                                className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <CollapsibleTrigger>
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </Label>
                            <CollapsibleContent>
                                <div className={ `flex flex-col items-stretch justify-stretch` }>
                                    {/* { buildFormControls() } */ }
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                    </div>

                    <div className={ `flex flex-col items-stretch justify-stretch h-full transition-all duration-400 ease-in-out w-full flex-grow` }>
                    </div>
                </TabsContent>

            </Tabs>
            {/* { isCreating === true && (
                <PlannerDialog
                    data={ modalData ?? {} }
                    setData={ setModalData }
                    refData={ allData }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ isCreating }
                    setDialogOpen={ setIsCreating }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, dialogDataType ?? 'event' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ 'add' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}

            {/* Edit Dialog */ }
            {/* { isEditing === true && (
                <PlannerDialog
                    data={ selectedLog ?? modalData }
                    refData={ allData }
                    setData={ setModalData } // { setSelectedLog }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ isEditing }
                    setDialogOpen={ setIsEditing }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, dialogDataType ?? 'event' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ 'edit' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}

            { dialogType === 'add' && (
                <PlannerDialog
                    data={ logFormData }
                    setData={ setLogFormData }
                    dataSchema={ logFormSchema || getSchema( 'log' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( logFormData, 'log' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) }

            {/* Edit Dialog */ }
            { dialogType === 'edit' && (
                <PlannerDialog
                    data={ logFormData }
                    refData={ allData }
                    setData={ setLogFormData } // { setSelectedEvent }
                    dataSchema={ logFormSchema || getSchema( 'log' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( logFormData, 'log' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) }

            {/* Open Dialog */ }
            {/* { open === true && isEditing === false && isCreating === false && (
                <PlannerDialog
                    data={ selected ?? modalData }
                    refData={ allData }
                    setData={ setSelectedLog }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ open }
                    setDialogOpen={ setOpen }
                    // handleSubmit={ handleCancel }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ 'view' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}
        </div>
    );
};

export default PlannerLogRightSidebarContent;
