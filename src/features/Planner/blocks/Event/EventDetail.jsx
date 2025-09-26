import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import { ArrowBigLeft, ArrowBigRight, PenIcon, Save, TrashIcon } from 'lucide-react';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { formatDate, formatDateTime, getPrettyDate, getPrettyDateTime, getPrettyTime } from '@/lib/utilities/time';
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext';

const EventDetail = ( props ) => {
    const {
        editingMode = false,
        parentPath = '/dash/planner/events',
    } = props;

    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas,
        getSchema,
        data,
        getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const {
        requestFetchEvents, setRequestFetchEvents,
        eventsData, setEventsData,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        selectedEvent, setSelectedEvent,
        selectedDate, setSelectedDate,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        handleInputChange,
        handleChange,
        // handleEditEventStart,
        // handleEditEventSubmit,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCancel,
    } = usePlanner();

    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { hash, pathname, search } = location;
    const path = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );
    // const path = pathname?.split( '/' );
    // const endpoint = path?.[ path.indexOf( parentPath ) + 1 ];
    // const pathnames = path?.filter( ( x ) => x );
    const event = useMemo( () => ( eventsData.find( ( e ) => e?._id === id ) ), [ endpoint ] );

    const formRef = useRef();

    const [ eventData, setEventData ] = useState( id ? eventsData.find( ( e ) => e._id === id ) : {} );

    let allData = getData();
    // const schema = getSchema( 'event' );
    // console.log( "EventDetail.jsx :: id = ", id, " :: ", "pathname = ", pathname, " :: ", "endpoint = ", endpoint );

    useEffect( () => {
        if ( endpoint && id ) {
            if ( id !== eventsData?._id ) {
                // Page changed, update data for new id.
                setEventData( eventsData.find( ( e ) => e._id === id ) );
            }
        }
    }, [ endpoint ] );


    // const schema = getSchemaForDataType( 'event' );

    const buildControls = () => {
        return (

            <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                <div className={ `flex flex-row justify-center items-center gap-2` }>
                    <Link to={ `${ parentPath }` }>
                        <Button
                            size={ 'sm' }
                            variant={ `outline` }
                            className={ `rounded-lg` }
                        >
                            <ArrowBigLeft className={ `!size-5 aspect-square self-center` } />
                        </Button>
                    </Link>
                    <Button
                        size={ 'sm' }
                        variant={ `outline` }
                        className={ `rounded-lg` }
                        onClick={ () => {
                            if ( editingMode ) {
                                handleEditSubmit( event, 'event' );
                                navigate( `${ parentPath }/${ id }/detail` );
                            }
                            else {
                                handleEditStart( event, 'event' );
                                navigate( `${ parentPath }/${ id }/edit` );
                            }
                        } }>
                        { editingMode === true
                            ? <Save className={ `!size-5 aspect-square self-center` } />
                            : <PenIcon className={ `!size-5 aspect-square self-center` } />
                        }
                    </Button>
                    <Button
                        size={ 'sm' }
                        variant={ `destructive` }
                        className={ `rounded-lg` }
                        onClick={ () => {
                            handleDeleteStart( event?._id, event, setEventsData );
                        } }>
                        <TrashIcon className={ `!size-5 aspect-square self-center` } />
                    </Button>
                </div>
            </div>
        );
    };

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) {
                acc[ key ] = value.toISOString();
            } else {
                acc[ key ] = value;
            }
            return acc;
        }, {} );

        console.log( 'Form submitted with data:', processedData );
        // Here you would typically send the processedData to your backend
        handleEditSubmit( formData );
    };

    return (
        <Card className='event-detail'>
            <CardHeader className={ `flex flex-col w-full justify-center gap-2 items-start whitespace-nowrap ` }>

                { buildControls() }
                { event?.title && (
                    <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                        { event?.title }
                    </CardTitle>
                ) }
                <div className={ `flex flex-row w-full justify-start items-center` }>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 capitalize font-sans` }>{ `Starts: ${ getPrettyDateTime( new Date( event?.start ) ) }` }</Badge>
                    <div
                        className={ `flex flex-row w-6 border-b border-2 border-opacity-60 border-primary-purple-800 h-0 justify-center items-center` }></div>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 capitalize font-sans` }>{ `End: ${ getPrettyDateTime( new Date( event?.end ) ) }` }</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <h2 className='text-3xl font-semibold mb-2'>Summary</h2>
                <div className={ `flex flex-row w-full gap-4` }>
                    <h2 className='text-lg font-semibold text-nowrap capitalize font-sans'>{ `Starts: ${ getPrettyDateTime( new Date( event?.start ) ) }` }</h2>
                    <h2 className='text-lg font-semibold text-nowrap capitalize font-sans'>{ `End: ${ getPrettyDateTime( new Date( event?.end ) ) }` }</h2>
                </div>
                <div className={ `flex flex-col gap-2` }>
                    {/* { eventSchema && utils.val.isObject( eventSchema ) && ( */ }
                    { event && (
                        <FormGenerator
                            ref={ formRef }
                            debug={ true }
                            viewMode={ !editingMode }
                            setData={ setEventsData }
                            refData={ allData }
                            data={ event }
                            initialData={ event }
                            dataType={ 'event' }
                            schema={ getSchema( 'event' ) }
                            // schema={ schemas?.app?.planner?.event ?? getSchema( 'event' ) }
                            showFormData={ true }
                            showFormModel={ true }
                            showFormSchema={ true }
                            onChange={ ( e ) => {
                                const { name, value } = e.target;
                                console.log(
                                    'EventDetail :: CardContent ==> FormGenerator :: onChange triggered :: name, value = ',
                                    name,
                                    value,
                                );
                                if ( event && Object.keys( event ).includes( name ) ) {
                                    if ( handleChange ) {
                                        handleChange( name, value, data, setData );
                                    }
                                    /* setEventsData( {
                                        ...data,
                                        [ name ]: value,
                                    } ); */
                                }
                            } }
                            // onCancel={ () => handleCancel() }
                            onSubmit={ ( data ) => handleEditSubmit( data, 'event' ) }
                            inputMaxWidth={ 10 }
                            inputMaxHeight={ 32 }
                        />
                    ) }
                    {/* ) } */ }
                </div>

                { buildControls() }
            </CardContent>
        </Card>
    );
};

export default EventDetail;
