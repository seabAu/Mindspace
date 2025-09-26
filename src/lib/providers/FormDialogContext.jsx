// Used to be a provider of contextualized values for the FormDialog / FormDialogWrapper dialog menu components. 

import { createContext, useState, useContext, useEffect } from "react";
import { DIALOG_TYPE_NAMES } from "@/lib/config/config";
import useGlobalStore from "@/store/global.store";
import * as utils from 'akashatools';

const FormDialogContext = createContext();

export const FormDialogProvider = ( { children } ) => {

    // Imported global state for use in form generation. 
    const {
        user, setUser,
        debug, setDebug,
        data, getData, setData,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        // error, setError,
        // loading, setLoading,
    } = useGlobalStore();

    // Modal state control variables
    // const dialogTypes = [ 'add', 'view', 'edit', 'delete', 'none' ];
    // const [ view, setView ] = useState( '' );
    const [ dialogIsOpen, setDialogIsOpen ] = useState( false );
    const [ onOpenChange, setOnOpenChange ] = useState();
    const [ dialogContent, setDialogContent ] = useState( null );
    const [ selected, setSelected ] = useState( null );
    const [ dialogType, setDialogType ] = useState( 'none' ); // NONE | VIEW | EDIT | ADD | DELETE | GOTO
    const [ dialogData, setDialogData ] = useState( null );
    const [ dialogSchema, setDialogSchema ] = useState( null );
    const [ dialogDataType, setDialogDataType ] = useState( 'none' );
    const [ dialogInitialData, setDialogInitialData ] = useState( null );
    const [ dialogSetDataCallback, setDialogSetDataCallback ] = useState();
    const [ handleOnOpenCallback, setHandleOnOpenCallback ] = useState( () => { console.log( 'FormDialogContext.jsx :: default handleOnOpenCallback called.' ); } );
    const [ handleSubmitCallback, setHandleSubmitCallback ] = useState( () => { console.log( 'FormDialogContext.jsx :: default handleSubmitCallback called.' ); } );
    const [ handleChangeCallback, setHandleChangeCallback ] = useState( () => { console.log( 'FormDialogContext.jsx :: default handleChangeCallback called.' ); } );
    const [ handleCancelCallback, setHandleCancelCallback ] = useState( () => { console.log( 'FormDialogContext.jsx :: default handleCancelCallback called.' ); } );
    const [ handleUpdateCallback, setHandleUpdateCallback ] = useState( () => { console.log( 'FormDialogContext.jsx :: default handleUpdateCallback called.' ); } );
    const [ dialogTrigger, setDialogTrigger ] = useState( null );
    const [ useOverlay, setUseOverlay ] = useState( true );
    const [ description, setDescription ] = useState( '' );
    const [ title, setTitle ] = useState( '' );
    // const [ isCreating, setIsCreating ] = useState( false );
    // const [ isEditing, setIsEditing ] = useState( false );
    // const [ isViewing, setIsViewing ] = useState( false );

    const [ dialogConfig, setDialogConfig ] = useState( {
        type: 'none',
        data: null,
        dataType: 'none',
        initialData: null,
        schema: [],
        open: false,
        onSubmitCallback: () => { console.log( 'FormDialogContext.jsx :: dialogConfig state object :: default onSubmitCallback called.' ); },
        onChangeCallback: () => { console.log( 'FormDialogContext.jsx :: dialogConfig state object :: default onChangeCallback called.' ); },
        onCancelCallback: () => { console.log( 'FormDialogContext.jsx :: dialogConfig state object :: default onCancelCallback called.' ); },
        onUpdateCallback: () => { console.log( 'FormDialogContext.jsx :: dialogConfig state object :: default onUpdateCallback called.' ); },
    } );

    // Handler functions for controlling and updating dialog menu / form state for each specific purpose;

    const handleCancel = () => {
        // Cleanup.
        console.log( 'useFormDialog Context :: handleCancel called. Current dialogDataType = ', dialogDataType, " :: ", "Current dialogType = ", dialogType );
        setDialogData( null );
        setDialogType( 'none' );
        setDialogSchema( null );
        setDialogDataType( 'none' );
        setDialogInitialData( null );
        setOpen( false );
        // setIsEditing( false );
        // setIsCreating( false );
    };

    const handleChange = ( field, value, data, setData ) => {
        if ( data && setData ) { setData( { ...data, [ field ]: value } ); }
        else {
            if ( utils.val.isDefined( dialogData ) && utils.val.isObject( dialogData ) && Object.keys( dialogData )?.includes( field ) ) { setDialogData( { ...dialogData, [ field ]: value } ); }
            else {
                let changedData = dialogData;
                changedData = dialogData[ field ] = value;
                setDialogData( changedData );
            }
        }
    };

    const handleCreateStart = ( data, dataType = "none" ) => {
        if ( utils.val.isDefined( data ) ) {
            setSelected( data );
            setDialogData( data );
            setDialogInitialData( data );
        }
        setDialogDataType( dataType );
        setDialogSchema( getSchemaForDataType( dataType ) );
        setDialogType( 'add' );
        // setOpen( true );
        // setIsCreating( true );
        // setIsEditing( false );
        console.log(
            'useFormDialog Context',
            ' :: ', 'handleCreateStart',
            ' :: ', '(initial) data = ', data,
            ' :: ', 'dataType = ', dataType
        );
    };

    const handleCreateSubmit = ( data, dataType = "none", apiCallbackFn, stateSetter, errorCallback, successCallback ) => {
        // Callback to be called when the form inside the modal is submitted and the dialog modal hits its onClose event. 

    };

    const handleEditStart = ( data, dataType = "none" ) => {
        if ( utils.val.isDefined( data ) ) {
            setSelected( data );
            setDialogData( data );
            setDialogInitialData( data );
        }
        setDialogType( 'edit' );
        setDialogDataType( dataType );
        let schema = getSchema( dataType );
        setDialogSchema( schema );
        // setOpen( false );
        // setIsEditing( true );
        // setIsCreating( false );
        console.log(
            'useFormDialog Context',
            ' :: ', 'handleEditStart',
            ' :: ', 'data = ', data,
            ' :: ', 'dataType = ', dataType
        );
    };

    const handleEditSubmit = ( data, dataType = "none", apiCallbackFn, stateSetter, errorCallback, successCallback ) => {
        // Callback to be called when the form inside the modal is submitted and the dialog modal hits its onClose event. 

    };

    // In the component opening the dialog modal, it'll use this function to fully configure it and prompt it to open.
    // 
    const createDialog = ( {
        data,
        setData,
        initialData,
        // refData,
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'none',
        dataType = 'none', // Name of type of data being represented.   
        dialogTrigger,
        overlay = true,
        debug = false,
        content,
    } ) => {

        let type = dialogType;
        if ( type && DIALOG_TYPE_NAMES?.includes( type?.toString().toLowerCase() ) ) {
            setDialogType( type );
            setTitle( `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( type ) ] } ${ type ? utils.str.toCapitalCase( dataType ) : `none` }` );
            setDescription( `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( type ) ] } ${ type ? utils.str.toCapitalCase( dataType ) : `none` }` );
        }
        if ( !!overlay !== !!useOverlay ) { setUseOverlay( !!overlay ); }
        if ( utils.val.isDefined( dialogTrigger ) ) { setDialogTrigger( dialogTrigger ); }

        // Config the callback functions.
        // if ( utils.val.isDefined( setData ) ) { setDialogSetDataCallback( ( data ) => setData( data ) ); }
        // if ( utils.val.isDefined( setDialogOpen ) ) { setHandleOnOpenCallback( ( open ) => setDialogOpen( !!open ) ); }
        // if ( utils.val.isDefined( handleClose ) ) { setHandleCancelCallback( () => handleClose() ); }
        // if ( utils.val.isDefined( handleChange ) ) { setHandleChangeCallback( ( name, value, data, setData ) => handleChange( name, value, data, setData ) ); } // onOpenChandleChangeallback
        // if ( utils.val.isDefined( handleSubmit ) ) { setHandleSubmitCallback( ( data ) => handleSubmit( data ) ); }


        // if ( utils.val.isDefined( setData ) ) { setDialogSetDataCallback( () => setData ); }
        // if ( utils.val.isDefined( setDialogOpen ) ) { setHandleOnOpenCallback( () => setDialogOpen ); }
        // if ( utils.val.isDefined( handleClose ) ) { setHandleCancelCallback( () => handleClose ); }
        // if ( utils.val.isDefined( handleChange ) ) { setHandleChangeCallback( () => handleChange ); } // onOpenChandleChangeallback
        // if ( utils.val.isDefined( handleSubmit ) ) { setHandleSubmitCallback( () => handleSubmit ); }

        setDialogIsOpen( dialogOpen );
        setDialogSchema( dataSchema );
        setDialogData( data );
        setDialogInitialData( initialData );
        setDialogContent( content );

        return dialogTrigger ? ( dialogTrigger ) : ( <></> );
    };

    return (
        <FormDialogContext.Provider value={ {
            // FUNCTIONS
            createDialog,
            handleCancel,
            handleChange,
            handleEditStart,
            handleEditSubmit,
            handleCreateStart,
            handleCreateSubmit,

            // STATE
            dialogIsOpen, setDialogIsOpen,
            dialogConfig, setDialogConfig,
            onOpenChange, setOnOpenChange,
            dialogContent, setDialogContent,
            dialogInitialData, setDialogInitialData,
            dialogDataType, setDialogDataType,
            dialogSchema, setDialogSchema,
            dialogType, setDialogType,
            dialogData, setDialogData,
            selected, setSelected,
            handleOnOpenCallback, setHandleOnOpenCallback,
            handleSubmitCallback, setHandleSubmitCallback,
            handleChangeCallback, setHandleChangeCallback,
            handleCancelCallback, setHandleCancelCallback,
            handleUpdateCallback, setHandleUpdateCallback,
            dialogSetDataCallback, setDialogSetDataCallback,
            dialogTrigger, setDialogTrigger,
            useOverlay, setUseOverlay,
            description, setDescription,
            title, setTitle,
        } }>
            { children }
        </FormDialogContext.Provider>
    );
};

export const useFormDialog = () => {
    const context = useContext( FormDialogContext );
    if ( context === undefined ) {
        throw new Error( "useFormDialog must be used within a FormDialogProvider" );
    }
    return context;
};
