import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    // workspaces,
    // loading,
    // error,
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
} from './../services/workspaceService.js';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from '@/components/ui/Card';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';

import * as utils from 'akashatools';
import useGlobalStore from '@/store/global.store.js';
import useError from './useError.js';
import { arrSafeTernary } from '../utilities/data.js';
import { Edit, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input.jsx';


export const useWorkspace = ( useSuccessToast = false ) => {
    /*
        const {
            // Debug state
            debug,
            setDebug,

            // Data state
            user,
            setUser,

            workspaceId,
            setWorkspaceId,
            workspacesData,
            setWorkspacesData,
            activeWorkspace,
            setActiveWorkspace,
        } = useStore(); 
    */

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        data, setData,
        user, setUser,
        usersData, setUsersData,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken,
        settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        openSidebar, setOpenSidebar,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const { error, setError, loading, setLoading, handleError, handleErrorCallback, handleSuccessCallback } = useError( useSuccessToast );

    const form = useForm();

    const [ errorWorkspace, setErrorWorkspace ] = useState( null );
    const [ loadingWorkspace, setLoadingWorkspace ] = useState( false );
    const [ isCreating, setIsCreating ] = useState( false ); // Controls the "Add Workspace" Dialog
    const [ isEditing, setIsEditing ] = useState( false ); // Controls the "Edit Workspace" Dialog
    const [ editingWorkspace, setEditingWorkspace ] = useState( null ); // Workspace currently being edited
    const [ newWorkspace, setNewWorkspace ] = useState( {} ); // New workspace form state
    const [ focusedWorkspace, setFocusedWorkspace ] = useState( null ); // Tracks the active workspace
    const [ enableSave, setEnableSave ] = useState( false );
    const [ workspaceSchema, setWorkspaceSchema ] = useState();

    const workspaceModel = {
        editorIds: { type: [ String ], default: [ {} ] },
        userId: { type: String, default: {} },
        active: { type: Boolean, default: false },
        title: { type: String, default: '' },
        description: { type: String, default: '' }, settings: { type: Object, default: {} },
        style: { type: Object, default: {} },
        inTrash: { type: Boolean, default: false },
        data: { type: String, default: '' },
        logo: { type: String, default: '' },
        iconId: { type: String, default: '' },
        bannerUrl: { type: String, default: '' },
    };

    let workspaceInitialSchema = {
        editorIds: [ {} ],
        userId: {},
        active: false,
        title: '',
        description: '', settings: {},
        style: {},
        inTrash: false,
        data: '',
        logo: '',
        iconId: '',
        bannerUrl: '',
    };

    const handleSyncActiveWorkspace = ( ws ) => {
        if ( utils.val.isValidArray( ws, true ) ) {
            // Find out which workspace is currently active, according to the server. 
            ws.some( ( workspace ) => {
                if ( workspace?.active ) {
                    setActiveWorkspace( workspace );
                    setWorkspaceId( workspace?._id );
                }
            } );
        }
    };

    const handleFetchWorkspaces = async () => {
        // const tree = await fetchFullFolderTree();
        // const ws = await fetchWorkspaces();
        const result = await fetchWorkspaces( {
            userId: user?.id || null,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        // if ( debug === true ) 
        console.log( 'Fetching workspaces :: result = ', result );
        setWorkspacesData( result );
        if ( result && result.length > 0 ) {
            // if ( utils.val.isValidArray( result, true ) ) {
            //     // Find out which workspace is currently active, according to the server. 
            //     result.some( ( workspace ) => {
            //         if ( workspace?.active ) {
            //             setActiveWorkspace( workspace );
            //             setWorkspaceId( workspace?._id );
            //         }
            //     } );
            // }
            handleSyncActiveWorkspace( result );
            return result;
        }
        else {
            return null;
        }
    };

    useEffect( () => {
        // Fetch data for the current dashboard view.
        // setWorkspacesData( handleFetchWorkspaces() );
        handleFetchWorkspaces();
    }, [] );

    const handleAddWorkspace = async () => {
        // if ( debug === true ) console.log( "handleAddWorkspace :: newWorkspace = ", newWorkspace );
        try {
            let data = {
                ...newWorkspace,
                userId: user?.id,
                editorIds: [ user?.id ],
            };
            let result = await createWorkspace( { data, errorCallback: handleErrorCallback, successCallback: handleSuccessCallback } );
            if ( debug === true )
                console.log( "Workspaces.jsx :: handleAddWorkspace :: newWorkspace = ", newWorkspace, " :: ", "data = ", data, " :: ", "result = ", result );

            if ( result ) {
                setWorkspacesData( [ ...arrSafeTernary( workspacesData ), result ] );
            }

            // Cleanup afterward.
            handleCreateCancel();
        } catch ( error ) {
            console.error( 'Error creating workspace:', error );
        }
    };

    const handleCloneWorkspace = async ( data ) => {
        if ( window.confirm( 'Are you sure you want to clone this workspace?' ) ) {
            try {
                if ( utils.val.isObject( data ) ) {
                    let valtemp = { ...data };
                    valtemp = utils.ao.filterKeys( data, [ "_id" ] );
                    data = valtemp;

                    let cloned = await createEvent( {
                        workspaceId,
                        data,
                        errorCallback: handleErrorCallback,
                        successCallback: handleSuccessCallback,
                    } );
                    if ( cloned ) {
                        // Result not null, successful.
                        // Insert into list.
                        setWorkspacesData( [ ...workspacesData, cloned ] );
                        handleCancel();
                    }
                }
            } catch ( error ) {
                console.error( 'Error cloning workspace:', error );
            } finally {
                // Cleanup afterward.
                handleCreateCancel();
            }
        }
    };

    const handleEditWorkspace = async () => {
        // if ( debug === true ) console.log( "handleEditWorkspace :: editingWorkspace = ", editingWorkspace );
        try {
            let result = await updateWorkspace( {
                id: editingWorkspace?._id,
                data: editingWorkspace,
                errorCallback: handleErrorCallback,
            } );

            if ( result ) {
                setWorkspacesData( [ ...workspacesData.filter( ( w ) => w?._id !== editingWorkspace?._id ), result ] );
            }
            // Cleanup on successful completion.
            handleEditCancel();
        } catch ( error ) {
            console.error( 'Error updating workspace:', error );
        }
    };

    const handleEditStart = ( workspace ) => {
        // Start editing a workspace
        if ( workspace ) {
            setIsEditing( true );
            setEditingWorkspace( workspace );
        }
    };

    const handleCreateStart = () => {
        // Start editing a workspace
        setIsCreating( true );
        setNewWorkspace( workspaceInitialSchema );
    };

    const handleEditCancel = () => {
        setIsEditing( false );
        setEditingWorkspace( null );
        setEnableSave( false );
    };

    const handleCreateCancel = () => {
        setIsCreating( false );
        setNewWorkspace( null );
        setEnableSave( false );
    };

    const handleDeleteWorkspace = async ( id ) => {
        if ( window.confirm( 'Are you sure you want to delete this workspace?' ) ) {
            try {
                let result = await deleteWorkspace( {
                    id,
                    errorCallback: handleErrorCallback,
                    successCallback: handleSuccessCallback,
                } );
                if ( result ) {
                    setWorkspacesData( [ ...workspacesData.filter( ( w ) => w?._id !== id ) ] );
                }
            } catch ( error ) {
                console.error( 'Error deleting workspace:', error );
            } finally {
                // Cleanup afterward.
                handleCreateCancel();
            }
        }
    };

    const handleSetFocusedWorkspace = ( workspace ) => {
        if ( debug === true ) console.log( 'Setting focused workspace to: ', workspace );
        setFocusedWorkspace( workspace );
    };

    const handleSetActiveWorkspace = async ( workspace, useToggle = false ) => {

        // if ( debug === true )
        console.log( 'Setting active workspace to: ', workspace );
        // Get currently active workspace and set its 'active' value to false, send to server.
        if ( utils.val.isValidArray( workspacesData, true ) ) {

            // Get currently active workspace.
            let activeWS = workspacesData?.find( ( ws ) => ( ws?.active === true ) );

            let updatedWorkspaces = [];
            workspacesData.forEach( async ( ws, index ) => {
                if ( ws ) {
                    if ( ws?._id === workspace._id ) {
                        // This is the workspace we're turning on. 
                        let workspaceData = { ...workspace };
                        if ( ws?.active === false ) {
                            // Set this one active.
                            workspaceData = { ...workspaceData, active: true };
                        }
                        else {
                            if ( useToggle === true ) {
                                // Toggle it off rather than doing nothing. 
                                workspaceData = { ...workspaceData, active: false };
                            }
                        }

                        // Replace with updated workspace document.
                        updatedWorkspaces.push( workspaceData );
                        let result = await updateWorkspace( {
                            id: workspace._id,
                            data: workspaceData,
                            // successCallback: handleSuccessCallback,
                            // errorCallback: handleErrorCallback,
                        } );
                        console.log( "Activate :: result = ", result );
                        setWorkspacesData( [
                            ...workspacesData.map( ( w ) => {
                                if ( w?._id === result?._id ) {
                                    return result;
                                } else {
                                    return w;
                                }
                            } ),
                        ] );
                    } else {
                        // All others.
                        if ( ws?.active ) {
                            // Set this one inactive.
                            updatedWorkspaces.push( { ...ws, active: false } );
                            let result = await updateWorkspace( {
                                id: ws._id,
                                data: { ...ws, active: false },
                                // successCallback: handleSuccessCallback,
                                // errorCallback: handleErrorCallback,
                            } );
                            console.log( "Deactivate :: result = ", result );
                            setWorkspacesData( [
                                ...workspacesData.map( ( w ) => {
                                    if ( w?._id === result?._id ) { return result; }
                                    else { return w; }
                                } ),
                            ] );
                        } else {
                            // Do nothing.
                            updatedWorkspaces.push( ws );
                        }
                    }
                }
            } );

            if ( debug === true )
                console.log( 'updatedWorkspaces = ', updatedWorkspaces, ' :: ', 'workspacesData = ', workspacesData );
            // setWorkspacesData( updatedWorkspaces );
        }

        if ( ( workspaceId !== workspace._id ) ) {
            // Then do the opposite for the supplied workspace, send to server.
            setActiveWorkspace( workspace );
            setWorkspaceId( workspace?._id );
        }
        else {
            if ( useToggle ) {
                // Toggle off the active workspace; 
                setActiveWorkspace( null );
                setWorkspaceId( null );
            }
        }

        // let result = await updateWorkspace( workspace._id, { ...workspace, active: true } );
    };

    const handleInputChange = ( e, isEdit = false ) => {
        const { name, value } = e?.target;
        if ( debug === true )
            console.log(
                'WorkspaceGrid',
                ' :: ', 'handleInputChange',
                ' :: ', 'e.target = ', e.target.id,
                ' :: ', 'name = ', name,
                ' :: ', 'value = ', value,
                ' :: ', 'isEdit = ', isEdit,
            );
        if ( isEdit ) {
            // Editing mode.
            setEditingWorkspace( { ...editingWorkspace, [ name ]: value } );
        } else {
            // New item mode.
            setNewWorkspace( { ...newWorkspace, [ name ]: value } );
        }

        // Lastly, set enableSave to true if not already.
        if ( !enableSave ) setEnableSave( true );
    };


    const buildDialog = (
        initialData,
        setInitialData,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        mode = 'add'
    ) => {
        return (

            <Dialog
                title={ `Create new Workspace` }
                open={ dialogOpen }
                onOpenChange={ setDialogOpen }
            >

                <DialogTrigger asChild>
                    <Button
                        className={ `select-none` }
                        variant="outline"
                    >
                        { mode === 'add' ? ( <Plus /> ) : ( <Edit /> ) }
                    </Button>
                </DialogTrigger>

                <DialogContent
                    className="sm:max-w-[425px]"
                >
                    <DialogHeader>
                        <DialogTitle>
                            { mode === 'add' ? ( `Create Workspace` ) : ( `Edit Workspace` ) }
                        </DialogTitle>
                        <DialogDescription>
                            { mode === 'add' ? ( `Create a new Workspace` ) : ( `Edit a Workspace` ) }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-2">

                        {/* <DynamicForm
                            data={ workspaceSchema }
                            setFormData={ ( e ) => {
                                handleInputChange( e );
                            } }
                            handleSubmit={ () => {
                                if ( mode === 'add' ) {
                                    handleAddWorkspace();
                                }
                                else if ( mode === 'edit' ) {
                                    handleEditWorkspace();
                                }
                            } }
                            handleCancel={ () => {
                                if ( mode === 'add' ) {
                                    handleCreateCancel();
                                }
                                else if ( mode === 'edit' ) {
                                    handleEditCancel();
                                }
                            } }
                            handleCreate={ () => { handleAddWorkspace(); } }
                            handleUpdate={ () => { handleEditWorkspace(); } }
                        /> */}

                        {/* <Form
                            debug={ true }
                            showViewport={ true }
                            // viewportOverride={}
                            // initialData={portfolioData.about}
                            // initialData={portfolioData.projects[0]}
                            // formModel={ initialData }
                            // initialData={ initialData }
                            formModel={ workspaceSchema }
                            initialData={ initialData }
                            onSubmit={ ( values ) => {
                                handleSubmit( values );
                            } }
                            layout={ `block` }
                            viewportLayout={ `column` }
                            data={ initialData }
                            setData={ ( e ) => { } }
                            onChange={ ( e ) => {
                                handleInputChange( e );
                            } }
                            styles={ '' }
                            classes={ "" }
                        /> */}

                        <div className="flex flex-col justify-start items-start gap-2">
                            <div className="gap-1 grid grid-cols-2 w-full">
                                <Label className="text-xs font-medium">Editors</Label>
                                <Select
                                    value={ initialData?.userId }
                                    multiple={ true }
                                    onValueChange={
                                        ( value ) => {
                                            if ( isEditing ) {
                                                setEditingWorkspace( { ...editingWorkspace, [ 'editorIds' ]: value } );
                                            } else {
                                                setNewWorkspace( { ...newWorkspace, [ 'editorIds' ]: value } );
                                            }
                                        } }
                                >
                                    <SelectTrigger className="h-6 text-xs">
                                        <SelectValue placeholder="Allow to edit..." />
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
                        </div>

                        <div className="flex flex-col justify-start items-start gap-2">
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                placeholder={ `Title` }
                                defaultValue={ initialData?.title ? initialData?.title : '' }
                                className="col-span-3"
                                onChange={ ( e ) => handleInputChange( e ) }
                            />
                        </div>

                        <div className="flex flex-col justify-start items-start gap-2">
                            <Input
                                type="text"
                                id="description"
                                name="description"
                                placeholder={ `Description` }
                                defaultValue={ initialData?.description ? initialData?.description : '' }
                                className="col-span-3"
                                onChange={ ( e ) => handleInputChange( e ) }
                            />
                        </div>

                        <div className="flex flex-col justify-start items-start gap-2">
                            <Input
                                type="text"
                                id="bannerUrl"
                                name="bannerUrl"
                                placeholder={ `Banner URL` }
                                defaultValue={ initialData?.bannerUrl ? initialData?.bannerUrl : '' }
                                className="col-span-3"
                                onChange={ ( e ) => handleInputChange( e ) }
                            />
                        </div>

                        <div className="flex flex-col justify-start items-start gap-2">
                            <Input
                                type="text"
                                id="logo"
                                name="logo"
                                placeholder={ `Logo` }
                                defaultValue={ initialData?.logo ? initialData?.logo : '' }
                                className="col-span-3"
                                onChange={ ( e ) => handleInputChange( e ) }
                            />
                        </div>

                        <div className="flex flex-row w-full h-auto justify-start items-start gap-2">
                            <Label
                                id={ `active` }
                                htmlFor={ `active` }
                                className={ `` }
                            >
                                Active (focused) workspace?
                            </Label>
                            <Switch
                                id={ `active` }
                                defaultChecked={ initialData?.active ? initialData?.active : '' }
                                onCheckedChange={ ( checked ) => {
                                    if ( isEditing ) {
                                        setEditingWorkspace( { ...editingWorkspace, [ 'active' ]: checked } );
                                    } else {
                                        setNewWorkspace( { ...newWorkspace, [ 'active' ]: checked } );
                                    }
                                } }
                            />
                        </div>

                        <div className="flex flex-col justify-start items-start gap-2">
                            <Label
                                id={ `inTrash` }
                                htmlFor={ `inTrash` }
                                className={ `` }
                            >
                                In trash?
                            </Label>
                            <Switch
                                id={ `inTrash` }
                                defaultChecked={ initialData?.inTrash ? initialData?.inTrash : '' }
                                onCheckedChange={ ( checked ) => {
                                    if ( isEditing ) {
                                        setEditingWorkspace( { ...editingWorkspace, [ 'inTrash' ]: checked } );
                                    } else {
                                        setNewWorkspace( { ...newWorkspace, [ 'inTrash' ]: checked } );
                                    }
                                } }
                            />
                        </div>

                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                onClick={ () => {
                                    if ( mode === 'add' ) { handleAddWorkspace(); }
                                    else if ( mode === 'edit' ) { handleEditWorkspace(); }
                                } }
                            >
                                { mode === 'add' ? 'Create' : 'Save' }
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };


    // Exported values and methods
    return {
        // VARIABLES
        workspaceModel,
        workspaceSchema, setWorkspaceSchema,
        workspaceInitialSchema,

        // HANDLER FUNCTIONS
        buildDialog,
        handleFetchWorkspaces,
        handleSyncActiveWorkspace,
        handleAddWorkspace,
        handleCloneWorkspace,
        handleEditWorkspace,
        handleEditStart,
        handleCreateStart,
        handleEditCancel,
        handleCreateCancel,
        handleDeleteWorkspace,
        handleSetFocusedWorkspace,
        handleSetActiveWorkspace,
        handleInputChange,

        // GETTERS / SETTERS
        isCreating, setIsCreating,
        isEditing, setIsEditing,
        editingWorkspace, setEditingWorkspace,
        newWorkspace, setNewWorkspace,
        focusedWorkspace, setFocusedWorkspace,
        enableSave, setEnableSave,

        errorWorkspace, setErrorWorkspace,
        loadingWorkspace, setLoadingWorkspace,
    };
};

export default useWorkspace;

// useEffect( () => {
//     console.table(
//         [
//             { name: 'isCreating', value: isCreating },
//             { name: 'isEditing', value: isEditing },
//             { name: 'enableSave', value: enableSave },
//             { name: 'newWorkspace', value: newWorkspace },
//             { name: 'editingWorkspace', value: editingWorkspace },
//             { name: 'focusedWorkspace', value: focusedWorkspace },
//         ],
//         [ 'name', 'value' ],
//     );
// }, [ isCreating, isEditing, newWorkspace, editingWorkspace, focusedWorkspace, enableSave ] );

/*  useEffect( () => {
        // Fetch data for the current dashboard view.
        const getWorkspaces = async () => {
            const ws = await fetchWorkspaces();
            setWorkspacesData( ws );
        };

        getWorkspaces();
    }, [] );

    // Automatically fetch workspaces when the hook is used
    useEffect( () => {
        // if ( debug === true ) console.log( "useWorkspace :: workspaces update = ", workspaces );
    }, [ workspaces ] );
*/
