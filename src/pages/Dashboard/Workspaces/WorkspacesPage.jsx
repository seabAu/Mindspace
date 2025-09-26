
import React, { useState, useEffect } from 'react';
import useWorkspace from '@/lib/hooks/useWorkspace';
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

// import {
//     useFormField,
//     Form,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormDescription,
//     FormMessage,
//     FormField,
// } from '@/components/ui/Form';

import {
    Input,
} from '@/components/ui/Input';
import { Check, CheckSquare, Edit, Maximize, Minimize, Plus, PlusCircle, Save, Square, X } from 'lucide-react';
import * as utils from 'akashatools';
import Form from '@/components/Form';
import Content from '@/components/Page/Content';
import useGlobalStore from '@/store/global.store';
import { CONTENT_HEADER_HEIGHT, ROUTES_WORKSPACE_PAGE } from '@/lib/config/constants';
import { DashboardPageContent } from '../DashboardPage';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WorkspacesPage = ( props ) => {
    const {
        children
    } = props;

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        requestFetchSchemas, setRequestFetchSchemas,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        data, setData, getData,
        schemas, setSchemas, fetchSchemas,
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
        fetchWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    const {
        // VARIABLES
        workspaceSchema,

        // HANDLER FUNCTIONS
        handleFetchWorkspaces,
        handleAddWorkspace,
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
    } = useWorkspace();

    // console.log( "Workspaces Page :: workspacesData = ", workspacesData );

    return (
        <>
            <Content.Container
                // className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] overflow-auto !items-start !justify-stretch !p-0 !m-0 !gap-1 mx-auto my-auto max-w-full !px-2` }
                className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !p-0` }
                style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem` } }
                centered={ false }
            >

                <Content.Header
                    className={ `flex flex-row justify-center items-center w-full h-min` }
                >
                    <div className={ `text-center font-bold text-nowrap text-2xl` }>
                        { workspaceId && `Active: ${ workspacesData?.find( ( ws ) => ( ws._id === workspaceId ) )?.title }` }
                    </div>
                </Content.Header>

                <Content.Body
                    className={ `flex flex-col gap-2 justify-center items-center h-full w-full max-w-full px-1` }
                >
                    { workspacesData && <WorkspaceGrid /> }
                </Content.Body>
            </Content.Container>
        </>
    );
};

const WorkspaceGrid = ( props ) => {
    const {
        children
    } = props;

    const {
        user,
        usersData,
        debug,
        setDebug,
        requestFetchWorkspaces,
        setRequestFetchWorkspaces,
        getWorkspaces,
        workspaceId,
        setWorkspaceId,
        workspacesData,
        setWorkspacesData,
        activeWorkspace,
        setActiveWorkspace,
    } = useGlobalStore();

    const {
        // VARIABLES
        workspaceSchema,

        // HANDLER FUNCTIONS
        handleFetchWorkspaces,
        handleAddWorkspace,
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
        buildDialog,
    } = useWorkspace();

    const renderWorkspaceCard = ( workspace ) => {

        if ( workspace ) {
            const {
                editorIds,
                userId,
                active,
                title,
                description,
                settings,
                style,
                inTrash,
                data,
                logo,
                iconId,
                bannerUrl,
            } = workspace;

            if ( workspace?._id ) {
                return (
                    <Card key={ workspace?._id } className={ `bg-sextuary-600 ${ workspace?._id === workspaceId ? '' : 'opacity-20 bg-opacity-20' } hover:opacity-100 transition-all duration-100 ease-in` }>
                        <CardHeader
                            className={ `w-full m-0 p-0 flex flex-col gap-2 bg-sextary-400` }
                        >
                            <div className={ `flex-row flex-nowrap px-2 py-1 overflow-hidden justify-between` }>
                                <h3 className={ `flex-grow flex-nowrap overflow-ellipsis text-nowrap max-w-[50%]` }>{ workspace?.title }</h3>
                                <div className={ `flex space-x-1 flex-shrink flex-nowrap items-end content-end min-w-fit` }>

                                    <Button
                                        className={ `rounded-sm aspect-square m-0 size-2 p-2 self-center` }
                                        onClick={ () => {
                                            if ( editingWorkspace ) { handleEditCancel(); } // Currently editing.
                                            else { handleEditStart( workspace ); } // Not currently editing.
                                        } }
                                        size="xs"
                                        variant="ghost"
                                    >
                                        { ( editingWorkspace?._id === workspace?._id )
                                            ? ( <Save /> )
                                            : ( <Edit /> ) }
                                    </Button>

                                    <Button
                                        className={ `rounded-sm aspect-square m-0 size-2 p-2 self-center` }
                                        onClick={ () => {
                                            if ( focusedWorkspace ) { handleSetFocusedWorkspace( {} ); }
                                            else { handleSetFocusedWorkspace( workspace ); }
                                        } }
                                        size="xs"
                                        variant="ghost"
                                    >
                                        { ( focusedWorkspace?._id === workspace?._id
                                            ? ( <Minimize /> )
                                            : ( <Maximize /> )
                                        ) }
                                    </Button>

                                    <Button
                                        className={ `rounded-sm aspect-square m-0 size-2 p-2 self-center` }
                                        onClick={ () => { handleSetActiveWorkspace( workspace ); } }
                                        size={ `xs` }
                                        variant={ workspaceId?._id === workspace._id ? 'secondary' : 'ghost' }
                                    >
                                        { workspaceId?._id === workspace._id
                                            ? ( <CheckSquare /> )
                                            : ( <Square /> ) }
                                    </Button>

                                    <Button
                                        className={ `rounded-sm aspect-square m-0 size-2 p-2 self-center` }
                                        onClick={ () => handleDeleteWorkspace( workspace?._id ) }
                                        size="xs"
                                        variant="destructive"
                                    >
                                        <X />
                                    </Button>

                                </div>
                            </div>
                        </CardHeader>

                        <CardContent
                            className={ `w-full m-0 p-2 flex flex-col gap-2` }
                        >

                            <div className={ `flex flex-row gap-2 flex-nowrap justify-stretch items-stretch` }>
                                {/* <strong className={ `text-sm` }>
                                    { `Description: ` }
                                </strong> */}
                                <p className={ `text-sm flex items-center` }>
                                    { workspace?.description || 'No description' }
                                </p>
                            </div>

                            <div className={ `flex flex-row gap-2 flex-nowrap` }>
                                <strong className={ `text-sm` }>
                                    { `Active: ` }
                                </strong>
                                <p className={ `text-sm flex items-center` }>
                                    { workspace?.active ? 'Yes' : 'No' }
                                </p>
                            </div>

                            <div className={ `flex flex-row gap-2 flex-nowrap` }>
                                <strong className={ `text-sm` }>
                                    { `Editors: ` }
                                </strong>
                                <p className={ `text-sm flex items-center` }>
                                    { workspace?.editorIds?.length || 0 }
                                </p>
                            </div>

                        </CardContent>

                        <CardFooter className={ `p-2 w-full max-h-12 self-end flex-shrink border-t` }>
                            <Button
                                onClick={ () => handleSetFocusedWorkspace( workspace ) }
                                variant="secondary"
                                size={ `xs` }
                                className={ `py-1 px-2 rounded-2xl` }
                            >
                                Open
                            </Button>
                        </CardFooter>


                    </Card>
                );
            }
        }
    };

    return (

        <div className="grid grid-cols-1 h-min sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {/* Add Workspace Card */ }
            <Card onClick={ () => handleCreateStart() } className="cursor-pointer">
                <CardContent className="flex justify-center items-center h-full hover:text-secondaryAlt-200">
                    <PlusCircle className={ `text-8xl font-bold size-10` } />
                </CardContent>
            </Card>

            {/* Workspace Cards */ }
            <>
                { workspacesData && utils.val.isValidArray( workspacesData, true ) && workspacesData.map( ( ws, index ) => {
                    // console.log( "Workspaces Grid :: ws = ", ws );
                    if ( ws ) { return ( renderWorkspaceCard( ws ) ); }
                } ) }
            </>

            <>
                {/* Create Workspace Dialog */ }
                { isCreating && buildDialog(
                    newWorkspace,
                    setNewWorkspace,
                    isCreating,
                    setIsCreating,
                    handleAddWorkspace,
                    'add'
                ) }

                {/* Edit Workspace Dialog */ }
                { isEditing && buildDialog(
                    editingWorkspace,
                    setEditingWorkspace,
                    isEditing,
                    setIsEditing,
                    handleEditWorkspace,
                    'edit'
                ) }
            </>

        </div>

    );
};

WorkspacesPage.Grid = WorkspaceGrid;

export default WorkspacesPage;

/*
    useEffect( () => {
        console.table( [
            {
                name: 'isCreating',
                value: isCreating
            },
            {
                name: 'isEditing',
                value: isEditing
            },
            {
                name: 'enableSave',
                value: enableSave
            },
            {
                name: 'newWorkspace',
                value: newWorkspace
            },
            {
                name: 'editingWorkspace',
                value: editingWorkspace
            },
            {
                name: 'focusedWorkspace',
                value: focusedWorkspace
            }
        ], [
            "name",
            "value"
        ] );
 
    }, [
        isCreating,
        isEditing,
        newWorkspace,
        editingWorkspace,
        focusedWorkspace,
        enableSave
    ] );
*/
/*
    useEffect( () => {
        // Fetch data for the current dashboard view. 
        const getWorkspaces = async () => {
            const ws = await fetchAllWorkspaces();
            setWorkspacesData( ws );
        };
 
        getWorkspaces();
    }, [] ); 
*/
