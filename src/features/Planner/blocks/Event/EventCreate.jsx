import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import { ArrowBigLeft, ArrowBigRight, X } from 'lucide-react';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { formatDate, formatDateTime } from '@/lib/utilities/time';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext';

const EventCreate = ( props ) => {
    const {
        // event,
        // updateEvent,
        parentPath,
    } = props;

    const {
        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
        schemas,
        setSchemas,
        getSchema,
        data,
        getData, // setData,
        debug,
        setDebug,
    } = useGlobalStore();

    const {
        eventsData,
        setEventsData,
        loading: loadingPlanner,
        setLoading: setLoadingPlanner,
        error: errorPlanner,
        setError: setErrorPlanner,
    } = usePlannerStore();

    const {
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
    // const { logs, removeLog } = useLogs();
    const [ newEventData, setNewEventData ] = useState( {} );
    let allData = getData();
    const schema = getSchema( 'event' );

    // console.log( "EventCreate.jsx :: id = ", id, " :: ", "pathname = ", pathname, " :: ", "endpoint = ", endpoint );

    /* 
        const handleSubmit = ( formData ) => {
            // Convert DateTimeLocal objects to ISO strings for submission
            const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
                if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
                else { acc[ key ] = value; }
                return acc;
            }, {} );
    
            console.log( 'Form submitted with data:', processedData );
            // Here you would typically send the processedData to your backend
            handleEditSubmit( formData );
        };
    */

    return (
        <Card className='event-detail event-create w-full'>
            <CardHeader className={ `flex flex-col w-full justify-center gap-2 items-start whitespace-nowrap ` }>
                <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                    <h2 className='text-3xl font-semibold mb-2'>Create New Event</h2>
                </CardTitle>
            </CardHeader>
            <CardContent className={ `overflow-auto` }>
                <div className={ `flex flex-row w-full gap-4` }>
                    { newEventData?.start && ( <h2 className='text-lg font-semibold'>{ `Starts: ${ formatDateTime( new Date( newEventData?.start ) )
                        ?.split( 'T' )
                        ?.join( ' at ' ) }` }</h2> ) }
                    { newEventData?.end && ( <h2 className='text-lg font-semibold'>{ `Ends: ${ formatDateTime( new Date( newEventData?.end ) )
                        ?.split( 'T' )
                        ?.join( ' at ' ) }` }</h2> ) }
                </div>
                <div className={ `flex flex-col gap-2` }>
                    {/* { eventSchema && utils.val.isObject( eventSchema ) && ( */ }
                    { newEventData && (
                        <FormGenerator
                            debug={ true }
                            setData={ setEventsData }
                            refData={ allData }
                            initialData={ newEventData }
                            dataType={ 'event' }
                            schema={ getSchema( 'event' ) }
                            showFormData={ true }
                            showFormModel={ true }
                            showFormSchema={ true }
                            onChange={ ( e ) => {
                                const { name, value } = e.target;
                                setNewEventData( { ...newEventData, [ name ]: value } );
                            } }
                            // onChange={ ( e ) => {
                            //     const { name, value } = e.target;
                            //     console.log(
                            //         'EventCreate :: CardContent ==> FormGenerator :: onChange triggered :: name, value = ',
                            //         name,
                            //         value,
                            //     );
                            //     setNewEventData( {
                            //         ...newEventData,
                            //         [ name ]: value
                            //     } );
                            //     if ( event && Object.keys( event ).includes( name ) ) {
                            //         if ( handleChange ) {
                            //             handleChange( name, value, data, setData );
                            //         }
                            //     }
                            // } }
                            // onCancel={ () => handleCancel() }
                            onSubmit={ async ( data ) => {
                                let result = await handleCreateSubmit( data, 'event' );
                                if ( result ) navigate( `..` );
                            } }
                            inputMaxWidth={ 10 }
                            inputMaxHeight={ 32 }
                        />
                    ) }
                    {/* ) } */ }
                </div>

            </CardContent>

            <CardFooter>

                <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                    <Link to={ `..` }>
                        <Button variant='outline' className={ `space-x-2` }>
                            <ArrowBigLeft />
                        </Button>
                    </Link>
                    <Button variant='destructive' onClick={ () => { handleCancel(); } }>
                        <X />
                        Cancel
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default EventCreate;
