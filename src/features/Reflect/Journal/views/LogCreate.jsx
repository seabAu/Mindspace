import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import * as utils from 'akashatools';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useGlobalStore from '@/store/global.store';
import FormGenerator from '@/components/Form/FormGenerator';
import { Spinner } from '@/components/Loader/Spinner';
import { DateTimeLocal } from '@/lib/config/types';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext';
import { DailyLogForm } from '../blocks/DailyLogForm/DailyLogForm';
import { produce } from 'immer';
import useReflect from '@/lib/hooks/useReflect';

const LogCreate = ( props ) => {
    const {
        // log,
        // setLog,
        // updateLog,
        // logSchema,
        logDate = new Date( Date.now() ),
        parentPath = '/dash/reflect/journal',
        classNames
    } = props;

    const {
        user,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const {
        // VARIABLES
        // logSchema, setLogSchema,
        initialLogData,
        handleGetSchemas,
        getSchemaForDataType,

        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleFetchLogById,
        handleFetchLogs,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,
    } = useReflect();

    const { id } = useParams();
    // const { logs, removeLog } = useLogs();
    const [ newLogData, setNewLogData ] = useState( {} );
    const [ logFormModel, setLogFormModel ] = useState( null );
    const [ logFormData, setLogFormData ] = useState( {
        workspaceId: workspaceId,
        userId: user?.id ?? null,
        date: logDate,
    } );
    // const [ plannerLogSchema, setPlannerLogSchema ] = useState( null );

    let allData = getData();

    const logSchema = getSchema( 'log' );

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

    const updateLogData = ( updater ) => {
        setLogFormData( produce( updater ) );
    };

    return (
        <div className={ `w-full h-full overflow-hidden p-0` }>
            <h1 className='text-2xl font-bold h-full '>
                { `New Log for (${ new Date(
                    Date.now(),
                ).toLocaleDateString() })` }
            </h1>

            <div className={ `w-full h-full overflow-hidden` }>

                <div className={ `px-2 border-brand-washedBlue-200` }>
                    { logSchema && utils.val.isObject( logSchema ) ? (
                        <>
                            <DailyLogForm
                                data={ logFormData }
                                setData={ setLogFormData }
                                onUpdate={ updateLogData }
                                onSubmit={ ( data ) => ( handleCreateSubmit( data, 'log' ) ) }
                            />
                        </>
                    ) : ( <Spinner variant={ 'circles' } size={ 'md' } overlay={ false } /> ) }
                </div>
            </div>
        </div>
    );
};

export default LogCreate;
