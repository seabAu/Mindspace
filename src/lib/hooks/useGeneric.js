import { useCallback, useEffect, useReducer, useState } from 'react';
import API from '../services/api';
import useError from '../hooks/useError';
import useData from './useData';
import axios from 'axios';
import * as utils from 'akashatools';
import { mapObj2Obj } from '../utilities/obj';
import FormGenerator from '@/components/Form/FormGenerator';
import { handleApiRequest, handleSuccess, handleError, validateInputs } from '../utilities/fetch';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import { Button } from '@/components/ui/button';
import { Delete, Edit, FileQuestion, FolderOpen, Plus } from 'lucide-react';
import {
    fetchAllDocuments,
    fetchDocumentById,
    fetchDocumentsByFilter,
    createDocument,
    updateDocument,
    deleteDocument,
} from '../services/metaService';


/*  // Generic API request handler
    const handleApiRequest = async ( {
        method = "get",
        url,
        data = {},
        params = {},
        requiredFields = [],
        successCallback,
        stateSetter,
        errorCallback,
    } ) => {
        try {
            if ( requiredFields.length ) validateInputs( data, requiredFields );

            const response = await API[ method ]( url, { data, params } );

            if ( stateSetter ) stateSetter( response.data.data );
            if ( successCallback ) successCallback( response.data.data );

            return response.data.data;
        } catch ( error ) {
            if ( errorCallback ) errorCallback( error?.response?.data?.message || 'Error' );
            return null;
        }
    };

    // Helper function for validating inputs against schema
    const validateInputs = ( inputs, requiredFields ) => {
        for ( const field of requiredFields ) {
            if ( !inputs[ field ] ) throw new Error( `${ field } is required` );
        }
    };

*/

// Example for meta handler functions
export const useGeneric = ( props ) => {
    const {
        // State control variables passed in as props.
        state, setState,
        schema, setSchema,
        initialData, setInitialData,
        loadingGeneric, setLoadingGeneric,
        errorGeneric, setErrorGeneric,

        // External / use-specific handlers.
        handleChangeGeneric,
    } = props;

    // Error handling.
    const {
        error, setError,
        loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError();

    // Utility functions for state management
    const {
        handleSetData,
        handleReplaceSetData,
        handleDeleteSetData,
        handleFilterSetData,
        handleInsertSetData,
    } = useData;

    // const [ state, setState ] = useState( {} );
    // const [ loading, setLoading ] = useState( false );
    // const [ error, setError ] = useState( null );

    // Helper function to safely make API calls
    const safeApiCall = useCallback( async ( apiCall ) => {
        setIsLoading( true );
        setError( null );
        try {
            const response = await apiCall();
            setIsLoading( false );
            return response.data;
        } catch ( err ) {
            setIsLoading( false );
            setError( err.response?.data?.message || 'An unexpected error occurred.' );
            throw err;
        }
    }, [] );

    const handleFetchDocuments = useCallback(
        async ( {
            endpoint,
            params = {},
            stateSetter,
            successCallback,
            errorCallback,
        } ) => {
            const result = await handleApiRequest( {
                method: 'get',
                url: `${ endpoint }`,
                params,
                // stateSetter: setState,
                // errorCallback: setError,
                stateSetter,
                successCallback,
                errorCallback,
            } );
            return result;
        },
        [],
    );

    const handleCreateDocument = useCallback(
        async ( {
            endpoint,
            data,
            stateSetter,
            successCallback,
            errorCallback,
        } ) => {
            const result = await handleApiRequest( {
                method: 'post',
                url: `${ endpoint }`,
                data,
                stateSetter: ( newData ) => {
                    // setState( ( prev ) => [ ...prev, newData ] ),
                    handleInsertSetData( newData, stateSetter );
                },
                // errorCallback: setError,
                successCallback,
                errorCallback,
            } );
            return result;
        },
        [],
    );

    const handleUpdateDocument = useCallback(
        async ( {
            endpoint,
            id,
            updates,
            stateSetter,
            successCallback,
            errorCallback,
        } ) => {
            const result = await handleApiRequest( {
                method: 'put',
                url: `${ endpoint }/${ id }`,
                data: updates,
                stateSetter: ( updatedData ) =>
                    handleReplaceSetData( id, updatedData, stateSetter ),
                // errorCallback: setError,
                successCallback,
                errorCallback,
            } );
            return result;
        },
        [],
    );

    const handleDeleteDocument = useCallback(
        async ( {
            endpoint,
            id,
            stateSetter,
            successCallback,
            errorCallback,
        } ) => {
            const result = await handleApiRequest( {
                method: 'delete',
                url: `${ endpoint }/${ id }`,
                stateSetter: () => handleDeleteSetData( id, stateSetter ),
                // errorCallback: setError,
                successCallback,
                errorCallback,
            } );
            return result;
        },
        [],
    );

    // General handler functions
    const handleChange = ( { data, setData, name, value } ) => {
        setData( { ...data, [ name ]: value } );
    };

    const handleCreateStart = ( { setModalState, initialData = {} } ) => {
        setModalState( { isOpen: true, viewType: 'add', data: initialData } );
    };

    const handleCreateSubmit = async ( {
        apiFunction,
        data,
        successCallback,
        errorCallback
    } ) => {
        try {
            const result = await apiFunction( data );
            if ( successCallback ) successCallback( result );
        } catch ( err ) {
            if ( errorCallback ) errorCallback( err );
        }
    };

    const handleEditStart = ( { setModalState, data } ) => {
        setModalState( { isOpen: true, viewType: 'edit', data } );
    };

    const handleEditSubmit = async ( {
        apiFunction,
        data,
        successCallback,
        errorCallback
    } ) => {
        try {
            const result = await apiFunction( data );
            if ( successCallback ) successCallback( result );
        } catch ( err ) {
            if ( errorCallback ) errorCallback( err );
        }
    };

    const handleDeleteStart = ( {
        setConfirmDialogState,
        data,
        onConfirm,
        onCancel
    } ) => {
        setConfirmDialogState( {
            isOpen: true,
            data,
            onConfirm,
            onCancel
        } );
    };

    const handleDeleteSubmit = async ( {
        apiFunction,
        id,
        stateSetter,
        successCallback,
        errorCallback
    } ) => {
        try {
            const result = await apiFunction( id );
            if ( successCallback ) successCallback( result );
        } catch ( err ) {
            if ( errorCallback ) errorCallback( err );
        }
    };
    /* 
        const handleFetchDocuments = async ( {
            apiFunction,
            stateSetter,
            successCallback,
            errorCallback
        } ) => {
            try {
                const data = await apiFunction();
                if ( stateSetter ) stateSetter( data );
            } catch ( err ) {
                if ( errorCallback ) errorCallback( err );
            }
        };
     */

    const handleToggleActive = ( {
        data,
        id,
        setState,
        toggleCallback,
    } ) => {
        const updatedData = data.map( item => ( {
            ...item,
            active: item._id === id
        } ) );

        setState( updatedData );

        const activeItem = updatedData.find( item => item._id === id );
        if ( toggleCallback ) toggleCallback( activeItem );
    };

    return {
        state, setState,
        schema, setSchema,
        error, setError,
        loading, setLoading,
        handleError,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleToggleActive,
        handleFetchDocuments,
        handleCreateDocument,
        handleUpdateDocument,
        handleDeleteDocument,
    };
};



export const useMetafunction = () => {
    const {
        activeWorkspace,
        setActiveWorkspace,
        // workspaceId,
        setWorkspaceId,
        data,
        getData,
        setData,
    } = useGlobalStore();

    const {
        requestFetchEvents,
        setRequestFetchEvents,
        requestFetchLogs,
        setRequestFetchLogs,
        requestFetchCalendars,
        setRequestFetchCalendars,
        plannerData,
        setPlannerData,
        eventsData,
        setEventsData,
        selectedEvent,
        setSelectedEvent,
        logsData,
        setLogsData,
        selectedLog,
        setSelectedLog,
        calendarsData,
        setCalendarsData,
    } = usePlannerStore();

    // Error handling.
    const {
        error, setError,
        loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError();

    // Modal state values
    const [ dialogType, setDialogType ] = useState( 'none' );
    const dialogTypes = [ 'add', 'view', 'edit', 'delete', 'none' ];
    const [ dataSchema, seDataSchema ] = useState( {} );
    const [ dialogData, setDialogData ] = useState( {} );
    const [ dialogInitialData, setDialogInitialData ] = useState( {} ); // For create-new event modal
    const [ open, setOpen ] = useState( false );
    const [ isCreating, setIsCreating ] = useState( false );
    const [ isEditing, setIsEditing ] = useState( false );

    // Toggle for dialog for logs menu.
    const [ logDialogOpen, setLogDialogOpen ] = useState( false );

    const handleConvertSchemas = ( data, conversionTransformSchema ) => {
        let convertedData = [];
        if ( utils.val.isValidArray( data, true ) ) {
            let dataTemp = mapObj2Obj( data, conversionTransformSchema );
            dataTemp.forEach( ( item, index ) => {
                if ( utils.val.isAO( item ) ) convertedData.push( e );
            } );
        }

        return [ ...( convertedData ? convertedData : [] ) ];
    };

    const handleDeleteStart = async ( id, data, setData ) => {
        // Deletes object with _id "id" in data and sets the new Data on successful confirm and send.
        if ( window.confirm( 'Are you sure you want to delete this?' ) ) {
            return handleDeleteSubmit( id, data, setData );
        } else {
            handleCancel();
        }
    };

    const handleDeleteSubmit = async ( id, data, setData ) => {
        try {
            if ( utils.ao.hasAll( data, [ '_id' ] ) ) {
                let result = await deleteDocument( {
                    id,
                    endpoint,
                    stateSetter,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                } );
                if ( result === null ) {
                    let deleteItem = data?.find( ( item ) => item._id === id );
                    // setData( data?.filter( ( item ) => item?._id && item?._id !== id ) );
                    setData( ( prev ) => prev.filter( ( item ) => item?._id !== id ) );
                }
            }
        } catch ( error ) {
            console.error( 'Error deleting File:', error );
        } finally {
            // Cleanup afterward.
            handleCancel();
        }
    };

    const handleChange = ( data, field, value ) => {
        if ( data && field && value ) {
            setDialogData( { ...data, [ field ]: value } );
        }
    };

    const handleCreateStart = ( data ) => {
        if ( data ) {
            setSelectedLog( null );
            setDialogOpen( true );

            setSelectedLog( null );
            setDialogType( 'add' );
            setDialogInitialData( data );
            setDialogData( data );
            setOpen( true );
            setIsCreating( true );
            setIsEditing( false );
        }
    };

    const handleCreateSubmit = async ( {
        endpoint,
        data,
        requiredFields,
        stateSetter,
    } ) => {
        // Send data to server, and push results (if valid) to the local events list.
        if ( data ) {
            let result = await createDocument( {
                endpoint,
                data: { ...data },
                requiredFields,
                stateSetter,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result ) {
                let resultData = handleConvertEvents( data );
                setData( [ ...data, resultData ] );
            }
        }
    };

    const handleEditStart = ( data ) => {
        if ( data ) {
            setLogDialogOpen( true );
            setDialogType( 'add' );
            setDialogInitialData( data );
            setDialogData( data );
            setOpen( true );
            setIsEditing( true );
            setIsCreating( false );
        }
    };

    const handleEditSubmit = async ( {
        endpoint,
        data,
        requiredFields,
        stateSetter,
    } ) => {
        // Send data to server, and push results (if valid) to the local events list.
        if ( data ) {
            let result = await updateDocument( {
                id: data?._id,
                data,
                endpoint,
                requiredFields,
                stateSetter,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            if ( result ) {
                let updatedEventData = mapObj2Obj( data, conversionEventSchema );
                // Update the globally saved events data. Make sure to use our schema, not usePlanner's.
                setEventsData( [
                    ...eventsData.filter( ( e ) => e?._id !== result?._id ),
                    result,
                ] );
                handleCancel();

                // Return the converted data for the calendar to actually use.
                return updatedEventData;
            }
        }
    };

    const handleOpenEventStart = ( initialData ) => {
        if ( initialData ) {
            setDialogType( 'view' );
            setDialogInitialData( initialData );
            setDialogData( initialData );
            setOpen( true );
            setIsCreating( false );
            setIsEditing( false );
        }
    };

    const handleCancel = () => {
        // Cleanup.
        setDialogType( 'none' );
        setDialogInitialData( {} );
        setDialogData( {} );
        setOpen( false );
        setIsEditing( false );
        setIsCreating( false );
    };

    const handleToggleActive = async ( {
        data,
        setData,
        activeItem,
        updateAPICall,
        activeFieldName = 'active',
        errorCallback,
        successCallback,
    } ) => {
        // Get currently active workspace and set its 'active' value to false, send to server.
        let updatedItem = { ...activeItem };
        updatedItem[ activeFieldName ] = true;
        updatedData.push( updatedItem );
        let result = await updateAPICall( {
            id: activeItem?._id,
            data: updatedItem, // { ...item, active: true },
            stateSetter: setState,
            successCallback,
            errorCallback,
        } );

        setData( [
            ...data.map( ( item ) => {
                if ( item?._id === result?._id ) { return result; }
                else { return w; }
            } ),
        ] );

        if ( utils.val.isValidArray( data, true ) ) {
            let updatedData = data.map( ( item, index ) => {
                if ( item?._id === activeItem?._id ) {
                    // The one we clicked on
                    if ( result ) { return result; }
                }
                else {
                    // All others.
                    return item;
                }
            } );

            setCalendarsData( updatedData );
        }
    };

    const handleToggle = async ( {
        item,
        active = false,
        updateAPICall,
        activeFieldName = 'active',
        // stateSetter,
        errorCallback,
        successCallback,
    } ) => {
        let updatedItem = { ...item };
        updatedItem[ activeFieldName ] = false;
        updatedData.push( updatedItem );

        let result = await updateAPICall( {
            id: item?._id,
            data: updatedItem,
            // stateSetter: setState,
            successCallback,
            errorCallback,
        } );

        return ( [
            ...data.map( ( item ) => {
                if ( item?._id === result?._id ) { return result; }
                else { return w; }
            } ),
        ] );
    };

    // Function to SWITCH which object in an array is the active one.
    const handleSwitchActive = async ( {
        data,
        activeItem,
        setData,
        updateAPICall,
        activeFieldName = 'active',
        errorCallback,
        successCallback,
    } ) => {
        // Get currently active data and set its 'active' value to false, send to server.
        if ( utils.val.isValidArray( data, true ) ) {
            let updatedData = [];
            data?.forEach( async ( item ) => {
                if (
                    item &&
                    Object.keys( item ).includes( activeFieldName ) &&
                    item?._id === activeItem?._id &&
                    item[ activeFieldName ] === false
                ) {
                    // Set this one active. Replace with updated document.
                    /* 
                    // let newActive = !item[ activeFieldName ];
                    // let updatedItem = { ...data, active: true }
                    let updatedItem = { ...item };
                    updatedItem[ activeFieldName ] = true;
                    updatedData.push( updatedItem );

                    let result = await updateAPICall( {
                        id: item?._id,
                        data: updatedItem, // { ...item, active: true },
                        stateSetter: setState,
                        successCallback,
                        errorCallback,
                    } );
                    setData( [
                        ...data.map( ( item ) => {
                            if ( item?._id === result?._id ) {
                                return result;
                            } else {
                                return w;
                            }
                        } ),
                    ] ); */

                    let result = handleToggle( {
                        item,
                        active: true,
                        activeFieldName,
                        updateAPICall,
                        // stateSetter,
                        errorCallback,
                        successCallback,
                    } );
                    setData( result );
                } else {
                    // All others.
                    if ( item?.active ) {
                        // Set this one inactive.
                        /* 
                            let updatedItem = { ...item };
                            updatedItem[ activeFieldName ] = false;
                            updatedData.push( updatedItem );
                            // updatedData.push( { ...item, active: false } );
                            let result = await updateAPICall( {
                                id: item?._id,
                                data: updatedItem, // { ...item, active: false },
                                stateSetter: setState,
                                successCallback,
                                errorCallback,
                            } );
                            setData( [
                                ...data.map( ( item ) => {
                                    if ( item?._id === result?._id ) {
                                        return result;
                                    } else {
                                        return w;
                                    }
                                } ),
                            ] );
                        */

                        let result = handleToggle( {
                            item,
                            active: false,
                            activeFieldName,
                            updateAPICall,
                            // stateSetter,
                            errorCallback,
                            successCallback,
                        } );
                        setData( result );
                    } else {
                        // Do nothing.
                        updatedData.push( item );
                    }
                }
            } );
        }

        setData( updatedData );
    };

    // On workspace ID change, fetch events and other data.
    const handleFetchAllDocuments = async ( {
        endpoint,
        params,
        stateSetter,
    } ) => {
        const res = await fetchAllDocuments( {
            endpoint,
            params,
            stateSetter,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        if ( utils.val.isValidArray( res, true ) ) {
            stateSetter( [ ...res ] );
        }
    };

    const handleBuildDialog = ( {
        data,
        setData, // For onchange
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        type = '',
        dialogType,
        dataType, // Name of type of data being represented.
    } ) => {
        let title = `${ [ 'New', 'View', 'Edit', 'Delete', 'None' ][
            dialogTypes( dialogType )
        ]
            } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let description = `${ [ 'Create New', 'View a', 'Edit a', 'Delete a', 'None' ][
            dialogTypes( dialogType )
        ]
            } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let allData = getData();
        return (
            <Dialog
                // isOpen={ logDialogOpen || !!selectedLog }
                onClose={ handleClose }
                title={ title }
                open={ dialogOpen }
                onOpenChange={ setDialogOpen }
                className={ `flex flex-col` }>
                <DialogTrigger asChild>
                    <Button
                        className={ `select-none` }
                        variant='outline'>
                        { dialogType === 'add' ? (
                            <Plus />
                        ) : dialogType === 'edit' ? (
                            <Edit />
                        ) : dialogType === 'delete' ? (
                            <Delete />
                        ) : dialogType === 'open' ? (
                            <FolderOpen />
                        ) : (
                            <FileQuestion />
                        ) }
                    </Button>
                </DialogTrigger>

                <DialogContent
                    className={ `flex flex-col sm:max-w-[${ 425 }px] max-h-modal overflow-y-auto` }>
                    <DialogHeader>
                        <DialogTitle>
                            { `${ [ 'New', 'View', 'Edit', 'Delete', 'None' ][
                                dialogTypes.indexOf(
                                    type,
                                )
                            ]
                                } Log` }
                        </DialogTitle>
                        <DialogDescription>
                            { `${ [
                                'Create New',
                                'View a',
                                'Edit an',
                                'Delete a',
                                'None',
                            ][
                                dialogTypes.indexOf(
                                    type,
                                )
                            ]
                                } Log` }
                        </DialogDescription>
                    </DialogHeader>
                    <div className={ `flex flex-col gap-2` }>
                        <FormGenerator
                            refData={ allData }
                            schema={ dataSchema }
                            initialData={ selectedLog || null }
                            onSubmit={ ( data ) =>
                                selectedLog
                                    ? handleUpdateLog( selectedLog?._id, data )
                                    : handleCreateLog( data )
                            }
                        />
                    </div>

                    <DialogFooter className='sm:justify-start'>
                        <DialogClose asChild>
                            <Button
                                type='submit'
                                onClick={ () => {
                                    handleSubmit( initialData );
                                } }>
                                { dialogType === 'add' ? ( <Plus /> )
                                    : dialogType === 'edit' ? ( <Edit /> )
                                        : dialogType === 'delete' ? ( <Delete /> )
                                            : dialogType === 'open' ? ( <FolderOpen /> )
                                                : ( <FileQuestion /> )
                                }
                                {
                                    `${ [
                                        'Create',
                                        'Save Update',
                                        'Delete',
                                        'Close',
                                        'None',
                                    ][ dialogTypes.indexOf( dialogType ) ] }`
                                }
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return {
        // VARIABLES
        plannerSchema,
        calendarSchema,
        eventSchema,
        conversionEventSchema,
        logSchema,
        logSchemaTypes,

        // HANDLER FUNCTIONS
        handleConvertSchemas,
        handleDeleteStart,
        handleDeleteSubmit,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleOpenEventStart,
        handleCancel,
        handleToggleActive,
        handleToggle,
        handleSwitchActive,
        handleFetchAllDocuments,
        handleBuildDialog,

        // GETTERS / SETTERS
        dataSchema, seDataSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogInitialData, setDialogInitialData,
        open, setOpen,
        isCreating, setIsCreating,
        isEditing, setIsEditing,
    };
};

// export default useMetafunction;

// export default useGeneric;
