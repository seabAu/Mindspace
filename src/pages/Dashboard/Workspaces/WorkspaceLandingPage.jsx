'use client';

/**
 * WorkspaceLandingPage - Handles workspace initialization and data loading
 * Replaces the cluttered APIBuffer with a more organized approach
 */
import { useEffect, useState, useCallback } from 'react';
import * as utils from 'akashatools';
import useAuthState from '@/lib/hooks/useAuthState';
import useAuth from '@/lib/hooks/useAuth';
import useGlobalStore from '@/store/global.store';
import useWorkspace from '@/lib/hooks/useWorkspace';
import { Spinner } from '@/components/Loader/Spinner';
import { useNav } from '@/lib/providers/NavProvider';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CalendarIcon,
    FileIcon,
    CheckSquareIcon,
    BookOpenIcon,
    FolderIcon,
    ActivityIcon,
    ArrowRightIcon,
    PlusIcon,
    LucideLayoutDashboard,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    getAllWorkspacesStats,
    getWorkspaceRecentActivity,
} from '@/lib/services/workspaceService';
import { useNavigate } from 'react-router-dom';
import useSettings from '@/lib/hooks/useSettings';
import { useSettingsStore } from '@/store/settings.store';

/**
 * WorkspaceLoader component - Now serves as workspaces landing dashboard
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.Component} WorkspaceLoader with children or workspace dashboard
 */
const WorkspaceLandingPage = ( { children } ) => {
    const [ isInitializing, setIsInitializing ] = useState( true );
    const [ initializationStage, setInitializationStage ] = useState( '' );
    const [ workspacesStats, setWorkspacesStats ] = useState( [] );
    const [ recentActivity, setRecentActivity ] = useState( {} );
    const [ selectedWorkspace, setSelectedWorkspace ] = useState( null );
    const [ showWorkspaceDashboard, setShowWorkspaceDashboard ] = useState( false );

    const {
        // isAuthenticated,
        hasValidWorkspace,
        // workspaceId,
        // workspacesData,
        handleWorkspaceChange,
    } = useAuthState();

    const {
        user, setUser,
        loading, setLoading,
        error, setError,
        wipeData, fullWipeData,
        userToken, setUserToken,
        userLoggedIn, setUserLoggedIn,
        workspacesData, setWorkspacesData,
        workspaceId, setWorkspaceId,
        activeWorkspace, setActiveWorkspace,
    } = useGlobalStore();

    const { settings } = useSettingsStore();

    const {
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
    } = useWorkspace();
    // const { navigate, routesConfig } = useNav();
    const navigate = useNavigate();

    const navigateToDocument = useCallback(
        ( documentId, dataType ) => {
            if ( !documentId || !dataType ) return;

            const typeMap = {
                note: '/dash/notes',
                task: '/dash/todo',
                todo: '/dash/todo',
                event: '/dash/planner/events',
                calendar: '/dash/planner/calendars',
                planner: '/dash/planner/planners',
                log: '/dash/reflect/journal',
                journal: '/dash/reflect/journal',
                habit: '/dash/reflect/habit',
                goal: '/dash/todo',
            };
            const basePath = typeMap[ dataType.toLowerCase() ] || '/dash/home';
            const detailPath = `${ basePath }/${ documentId }/detail`;

            console.log( `[v0] Navigating to ${ dataType } document:`, detailPath );
            navigate( detailPath );
        },
        [ navigate ],
    );

    const isAuthenticated = useCallback( () => {
        return ( !!( user && userToken && userLoggedIn === true ) );
    }, [ user ] );

    const fetchWorkspacesStats = useCallback( async () => {
        try {
            setInitializationStage( 'Loading workspace statistics...' );
            const stats = await getAllWorkspacesStats();
            setWorkspacesStats( stats );

            const activityPromises = stats.map( async ( workspace ) => {
                const activity = await getWorkspaceRecentActivity(
                    workspace?._id,
                    5,
                );
                return { workspaceId: workspace?._id, activity };
            } );

            const activities = await Promise.all( activityPromises );
            const activityMap = activities.reduce(
                ( acc, { workspaceId, activity } ) => {
                    acc[ workspaceId ] = activity;
                    return acc;
                },
                {},
            );

            setRecentActivity( activityMap );
            console.log(
                'WorkspaceLandingPage :: fetchWorkspacesStats :: stats = ',
                stats,
                ' :: ',
                'activitiesMap = ',
                activitiesMap,
            );
        } catch ( error ) {
            console.error( 'Error fetching workspace stats:', error );
            setError( error.message || 'Failed to load workspace statistics' );
        }
    }, [ setError ] );

    const shouldShowWorkspaceDashboard = useCallback(
        async ( override ) => {
            let shouldOverride = isAuthenticated() && (
                // Otherwise overridden. 
                override === true
                || // No workspaces available.
                !utils.val.isValidArray( workspacesData, true )
                || // No active workspace selected.
                !workspaceId
            );

            setShowWorkspaceDashboard( shouldOverride );
        }
        , [
            user,
            workspaceId,
            workspacesData,
        ]
    );

    const initializeWorkspaces = useCallback( async () => {
        const authenticated = isAuthenticated();
        if ( !authenticated || !user?.id ) return;
        console.log( 'WorkspaceLandingPage :: initializeWorkspaces :: authenticated = ', authenticated );

        try {
            setIsInitializing( true );
            setInitializationStage( 'Loading workspaces...' );

            let workspaces = await handleFetchWorkspaces();
            console.log( 'WorkspaceLandingPage :: initializeWorkspaces :: after API call :: workspaces = ', workspaces );

            if (
                workspaces &&
                Array.isArray( workspaces ) &&
                workspaces.length > 0
            ) {
                setWorkspacesData( workspaces );

                const activeWorkspaceData = workspaces.find( ( w ) => w.active );

                console.log( 'WorkspaceLandingPage :: fetchWorkspacesStats :: workspaces = ', workspaces, ' :: ', 'activeWorkspaceData = ', activeWorkspaceData );
                // setShowWorkspaceDashboard( true );
                setInitializationStage( 'Choose workspace' );

                if ( !utils.val.isValidArray( workspaces, true ) ) {
                    // Preemptively return and force-show workspaces dashboard.
                    // shouldShowWorkspaceDashboard();
                    // setShowWorkspaceDashboard( true );
                    // return;
                }
                if ( !settings?.showWorkspaceStats ) {
                    return;
                }

                if ( activeWorkspaceData ) {
                    wipeData();
                    setWorkspaceId( activeWorkspaceData?._id );
                    setActiveWorkspace( activeWorkspaceData );
                    setInitializationStage( 'Workspace ready' );
                    console.log( "WorkspaceLandingPage :: initializeWorkspaces :: case: activeWorkspaceData is valid :: workspacesStatsData = ", workspacesStatsData );
                    // setShowWorkspaceDashboard( false );
                } else {
                    const workspacesStatsData = await fetchWorkspacesStats();
                    console.log( "WorkspaceLandingPage :: initializeWorkspaces :: case: activeWorkspaceData is invalid :: workspacesStatsData = ", workspacesStatsData );
                    // setShowWorkspaceDashboard( true );
                    setInitializationStage( 'Choose workspace' );
                }
            } else {
                setInitializationStage( 'No workspaces found' );
                setWorkspacesData( [] );
                // setShowWorkspaceDashboard( true );
            }
        } catch ( error ) {
            console.error(
                'WorkspaceLandingPage: Error initializing workspaces:',
                error,
            );
            setError( error.message || 'Failed to load workspaces' );
        } finally {
            setIsInitializing( false );
        }
    }, [
        // isAuthenticated,
        user?.id,
        // handleFetchWorkspaces,
        // setWorkspacesData,
        // setWorkspaceId,
        // setActiveWorkspace,
        // setError,
        // fetchWorkspacesStats,
    ] );

    const handleSelectWorkspace = useCallback(
        async ( workspace ) => {
            setSelectedWorkspace( workspace );

            // Fetch stats for this workspace if it isn't here already. 
            let wsStats = await fetchWorkspacesStats();

        }
        , [
            // selectedWorkspace,
            workspacesData,
            // workspaceId,
            // activeWorkspace,
        ]
    );

    const handleActivateWorkspace = useCallback(
        async ( workspace ) => {
            try {
                setLoading( true );
                setInitializationStage( `Activating ${ workspace.title }...` );

                await handleSetActiveWorkspace( workspace );
                // setWorkspaceId( workspace?._id );
                // setActiveWorkspace( workspace );
                setShowWorkspaceDashboard( false );

                console.log(
                    'WorkspaceLandingPage :: handleActivateWorkspace :: workspace = ',
                    workspace,
                );
                handleWorkspaceChange( workspace?._id );
            } catch ( error ) {
                console.error( 'Error selecting workspace:', error );
                setError( error.message || 'Failed to select workspace' );
            } finally {
                setLoading( false );
                setInitializationStage( '' );
            }
        },
        [
            selectedWorkspace,
            handleSetActiveWorkspace,
            setWorkspaceId,
            setActiveWorkspace,
            handleWorkspaceChange,
            setLoading,
            setError,
        ],
    );

    const renderWorkspaceCard = useCallback(
        ( workspace ) => {
            const stats = workspacesStats.find(
                ( w ) => w?._id === workspace?._id,
            );
            const activity = recentActivity[ workspace?._id ] || {};

            // if ( !stats ) return null;

            return (
                <Card
                    key={ workspace?._id }
                    className={ twMerge(
                        `h-full w-full hover:shadow-lg transition-shadow cursor-pointer group justify-between flex-grow items-baseline`,
                        selectedWorkspace?._id === workspace?._id && `border-green-900`
                    ) }
                >
                    <CardHeader className={ `p-4 m-0 items-start justify-between space-y-4 !gap-4` }>
                        <div className='flex w-full flex-grow flex-1  flex-row items-center justify-between'>
                            <div className='flex items-center w-full flex-grow flex-1 justify-between space-x-3'>
                                <span className={ `min-h-8 min-w-8 size-8 aspect-square justify-start` }>
                                    { workspace.logo &&
                                        [
                                            "Folder",
                                            "Workspace",
                                            "File",
                                            "Data",
                                        ].includes( workspace.logo ) ? (
                                        workspace.logo === 'Folder'
                                            ? ( <FolderIcon className='w-8 h-8 text-primary' /> )
                                            : (
                                                workspace.logo === 'Workspace'
                                                    ? ( <LucideLayoutDashboard className='w-8 h-8 text-primary' /> )
                                                    : ( <img
                                                        src={
                                                            workspace.logo || '/placeholder.svg'
                                                        }
                                                        alt={ workspace.title }
                                                        className='w-8 h-8 rounded'
                                                    /> ) )
                                    ) : (
                                        <LucideLayoutDashboard className='w-8 h-8 text-primary' />
                                    ) }
                                </span>
                                <div className={ `flex-1 w-full flex-grow text-left px-2` }>
                                    <CardTitle className='text-lg'>
                                        { workspace.title }
                                    </CardTitle>
                                    <CardDescription className='text-sm'>
                                        { workspace.description ||
                                            'No description' }
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge
                                className={ `items-start justify-start` }
                                variant={
                                    workspace.active ? 'default' : 'secondary'
                                }>
                                { workspace.active ? 'Active' : 'Inactive' }
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className='p-4 flex space-y-4 items-stretch justify-stretch h-fit w-full'>
                        { stats && (
                            <>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <CheckSquareIcon className='w-4 h-4 text-blue-500' />
                                        <span className='text-sm'>
                                            <span className='font-semibold'>
                                                { stats.tasks?.total || 0 }
                                            </span>{ ' ' }
                                            Tasks
                                        </span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <FileIcon className='w-4 h-4 text-green-500' />
                                        <span className='text-sm'>
                                            <span className='font-semibold'>
                                                { stats.notes?.total || 0 }
                                            </span>{ ' ' }
                                            Notes
                                        </span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <CalendarIcon className='w-4 h-4 text-purple-500' />
                                        <span className='text-sm'>
                                            <span className='font-semibold'>
                                                { stats.events?.total || 0 }
                                            </span>{ ' ' }
                                            Events
                                        </span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <BookOpenIcon className='w-4 h-4 text-orange-500' />
                                        <span className='text-sm'>
                                            <span className='font-semibold'>
                                                { stats.logs?.total || 0 }
                                            </span>{ ' ' }
                                            Logs
                                        </span>
                                    </div>
                                </div>

                                { activity.recent && activity.recent.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='text-sm font-medium flex items-center'>
                                            <ActivityIcon className='w-4 h-4 mr-1' />
                                            Recent Activity
                                        </h4>
                                        <div className='space-y-1'>
                                            { activity.recent
                                                .slice( 0, 3 )
                                                .map( ( item, index ) => (
                                                    <div
                                                        key={ index }
                                                        className='flex items-center justify-between text-xs text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted/50'
                                                        onClick={ () =>
                                                            navigateToDocument(
                                                                item?._id,
                                                                item.type,
                                                            )
                                                        }>
                                                        <span className='truncate flex-1'>
                                                            { item.title }
                                                        </span>
                                                        <span className='ml-2 flex-shrink-0'>
                                                            { formatDistanceToNow(
                                                                new Date(
                                                                    item.updatedAt,
                                                                ),
                                                                { addSuffix: true },
                                                            ) }
                                                        </span>
                                                    </div>
                                                ) ) }
                                        </div>
                                    </div>
                                ) }
                            </>
                        ) }

                        <CardFooter className='w-full h-min flex self-stretch items-end space-x-2 p-4 p-2 m-0'>
                            <Button
                                onClick={ () => handleActivateWorkspace( workspace ) }
                                className='flex-1'
                                variant={
                                    workspace.active ? 'default' : 'outline'
                                }>
                                { workspace.active ? 'Continue' : 'Select' }
                                <ArrowRightIcon className='w-4 h-4 ml-1' />
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={ () => handleSelectWorkspace( workspace ) }>
                                Details
                            </Button>
                        </CardFooter>
                    </CardContent>
                </Card>
            );
        },
        [
            workspacesStats,
            recentActivity,
            navigateToDocument,
            handleActivateWorkspace,
        ],
    );

    useEffect( () => {
        const authenticated = isAuthenticated();
        console.log( 'WorkspaceLandingPage :: useEffect isAuth check :: authenticated = ', authenticated, " :: ", "user = ", user );
        if ( authenticated && user?.id ) {
            initializeWorkspaces();
        }
    }, [ user?.id ] );

    if ( isInitializing ) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen space-y-4'>
                <Spinner
                    variant='circle'
                    size='xl'
                    color='currentColor'
                    className='text-primary'
                />
                { initializationStage && (
                    <p className='text-sm text-muted-foreground animate-pulse'>
                        { initializationStage }
                    </p>
                ) }
            </div>
        );
    }

    console.log( "WorkspaceLandingPage :: onComponentMount :: showWorkspaceDashboard = ", showWorkspaceDashboard, " :: ", "workspacesData = ", workspacesData, " :: ", "workspaceId = ", workspaceId, " :: ", "isAuthenticated() = ", isAuthenticated() );

    if (
        isAuthenticated() && (
            // Otherwise overridden. 
            showWorkspaceDashboard === true
            || // No workspaces available.
            !utils.val.isValidArray( workspacesData, true )
            || // No active workspace selected.
            !workspaceId
        )
    ) {
        return (
            <WorkspacesGrid
                renderWorkspaceCard={ renderWorkspaceCard }
                workspacesData={ workspacesData }
                workspaceId={ workspaceId }
            />
        );
    }

    else {
        return children;
    }
};

import React from 'react';
import { twMerge } from 'tailwind-merge';

export const WorkspacesGrid = ( {
    workspacesData,
    workspaceId,
    renderWorkspaceCard,
} ) => {
    const {
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
    } = useWorkspace();
    return (
        <div className='min-h-screen bg-background p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
                <div className='text-center space-y-4'>
                    <h1 className='text-4xl font-bold text-foreground'>
                        Your Workspaces
                    </h1>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        { workspacesData && workspacesData.length > 0
                            ? 'Choose a workspace to continue, or create a new one to get started.'
                            : 'Welcome! Create your first workspace to begin organizing your productivity.' }
                    </p>
                </div>

                { workspacesData && workspacesData.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        { workspacesData.map( renderWorkspaceCard ) }
                    </div>
                ) : (
                    <div className='text-center space-y-6'>
                        <div className='w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center'>
                            <FolderIcon className='w-12 h-12 text-muted-foreground' />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-semibold'>
                                No workspaces yet
                            </h2>
                            <p className='text-muted-foreground'>
                                Create your first workspace to start
                                organizing your tasks, notes, and projects.
                            </p>
                        </div>
                    </div>
                ) }

                <div className='text-center'>
                    <Button
                        size='lg'
                        onClick={ () => {
                            console.log( 'Create workspace clicked' );
                            handleCreateStart();
                        } }
                        className='cursor-pointer px-8'>
                        <PlusIcon className='w-5 h-5 mr-2' />
                        Create New Workspace
                    </Button>
                </div>
            </div>
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

WorkspaceLandingPage.Grid = WorkspacesGrid;

export default WorkspaceLandingPage;
