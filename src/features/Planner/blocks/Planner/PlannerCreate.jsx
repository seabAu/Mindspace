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
import { DateTimeLocal } from '@/lib/config/types';

const PlannerCreate = ( props ) => {
    const {
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
        requestFetchEvents, setRequestFetchEvents,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        selectedEvent, setSelectedEvent,
        selectedLog, setSelectedLog,
        calendarsData, setCalendarsData,
        selectedCalendar, setSelectedCalendar,
        selectedDate, setSelectedDate,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleCancel,
    } = usePlanner();

    const { id } = useParams();
    const [ formData, setFormData ] = useState( null );

    let allData = getData();

    const schema = getSchema( 'planner' );
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
        handleCreateSubmit( formData, 'planner' );
    };

    return (
        <div className={ `w-full h-full overflow-hidden p-4` }>
            <h1 className='text-2xl font-bold h-full '>
                { `Create New Planner` }
            </h1>

            <div className={ `w-full h-full overflow-hidden` }>

                <h1 className="text-3xl font-bold">{ `Create Log` }</h1>
                <div className={ `px-2 border border-dashed border-brand-washedBlue-200` }>
                    { plannerSchema && utils.val.isObject( plannerSchema ) ? (
                        <FormGenerator
                            debug={ false }
                            showOptional={ true } // Show all fields by default. 
                            customFields={ [] }
                            data={ formData }
                            setData={ setFormData }
                            refData={ allData }
                            initialData={ { workspaceId: workspaceId } }
                            model={ plannerSchema ?? getSchema( 'planner' ) }
                            schema={ plannerSchema ?? getSchema( 'planner' ) }
                            onUpdate={ ( updatedData ) => {
                                if ( updatedData && Object.keys( updatedData )?.length > 0 ) {
                                    setFormData( updatedData );
                                }
                            } }
                            onChange={ ( e ) => {
                                const { name, value } = e.target;
                                if ( formData && Object.keys( formData )?.includes( name ) ) {
                                    if ( handleChange ) handleChange( name, value, formData, setData );
                                    setFormData( { ...formData, [ name ]: value } );
                                }
                            } }
                            onCancel={ handleCancel }
                            onSubmit={ ( data ) => handleSubmit( data ) }
                            inputMaxWidth={ 10 }
                            inputMaxHeight={ 32 }
                        />
                    ) : ( <Spinner variant={ 'circles' } size={ 'md' } overlay={ false } /> ) }
                </div>
            </div>
        </div>
    );
};

export default PlannerCreate;

//     /* 
//         const handleSubmit = ( formData ) => {
//             // Convert DateTimeLocal objects to ISO strings for submission
//             const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
//                 if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
//                 else { acc[ key ] = value; }
//                 return acc;
//             }, {} );
    
//             console.log( 'Form submitted with data:', processedData );
//             // Here you would typically send the processedData to your backend
//             handleEditSubmit( formData );
//         };
//     */