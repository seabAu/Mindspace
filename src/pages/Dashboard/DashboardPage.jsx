
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, memo } from 'react';
import {
    Plus,
    Maximize,
    Minimize,
    RefreshCwOffIcon,
    LucideLayoutGrid,
    RefreshCcw,
    PlusCircleIcon,
    XOctagonIcon,
    NavigationIcon,
    DatabaseIcon,
    DatabaseBackupIcon,
} from "lucide-react";
import { ExpandableTabs } from '@/components/ui/expandable-tabs';

// Utilities
import * as utils from 'akashatools';
import { HashRouter, Navigate, Route, Router, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardSync from '@/pages/Dashboard/DashboardSync';
import usePlanner from '@/lib/hooks/usePlanner';
import { cn } from '@/lib/utilities/style';
import clsx from 'clsx';
import useWorkspace from '@/lib/hooks/useWorkspace';
import { buttonListToSchema } from '@/lib/utilities/nav';

// Constants / Config
import {
    CONTENT_BREADCRUMBS_HEIGHT,
    CONTENT_HEADER_HEIGHT,
    SIDEBAR_LEFT_KEYBOARD_SHORTCUT,
    SIDEBAR_RIGHT_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH_ICON,
    SIDEBAR_WIDTH_LEFT,
    SIDEBAR_WIDTH_RIGHT,
    SIDEBAR_WIDTH_RIGHT_MINI,
} from '@/lib/config/constants';

// Data stores
import useTasksStore from '@/store/task.store';
import useNotesStore from '@/store/note.store';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';

import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import Loader from '@/components/Loader/Loader';
import { Spinner } from '@/components/Loader/Spinner';
import { ThemeToggle } from '@/components/Theme/ThemeToggle';
import DateTime from '@/components/Time/DateTime';
import Nav from '@/components/Nav/Nav';
import Side from '@/components/Page/Sidebar/index';
import { Button } from "@/components/ui/button";
import Container from "@/components/Page/Container";
import RandomQuote from '@/components/Quote/Quote';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Content from '@/components/Page/Content';
import { twMerge } from 'tailwind-merge';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import NotesRightSidebarContent from '@/features/Note/blocks/Sidebar/NotesRightSidebarContent';
import PlannerRightSidebarContent from '@/features/Planner/blocks/Sidebar/PlannerRightSidebarContent';
import { caseCamelToSentence } from '@/lib/utilities/string';
import { NestedSidebarWrapper } from '@/components/Page/Sidebar/NestedSidebar';
import PlannerLogRightSidebarContent from '@/features/Reflect/Journal/blocks/Sidebar/PlannerLogRightSidebarContent';
import { useNav } from '@/lib/providers/NavProvider';
import useSettings from '@/lib/hooks/useSettings';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ButtonGroup from '@/components/Button/ButtonGroup';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Scrollbar } from '@radix-ui/react-scroll-area';
import ReflectStatsSidebar from '@/features/Reflect/Stats/views/sidebar/ReflectStatsSidebar';
import useStatsStore from '../../store/stats.store';
import { TodoRightSidebarContent, TodoTodayRightSidebarContent } from '@/features/Todo/blocks/Sidebar/TodoRightSidebarContent';
import useReminderStore from '@/store/reminder.store';
import DayFormDialog from '@/blocks/DayFormDialog/DayFormDialog';
import { NotificationsDropdown } from '@/features/Remind/blocks/NotificationsDropdown/NotificationDropdown';
import { DASHBOARD_RIGHT_SIDEBAR_ICONS_CONFIG } from '@/lib/config/config';
import { SettingsDialog } from '@/features/Settings/blocks/SettingsDialog';
import UserProfilePage from '../User/UserProfilePage';
import UserSettingsPage from '../User/UserSettingsPage';
import APIBuffer from '../APIBuffer';
import WorkspaceLandingPage from './Workspaces/WorkspaceLandingPage';
import { invalid } from '@/lib/utilities/data';
import UserSubscriptionStatus from '../User/UserSubscriptionStatus';
import UserBillingPage from '../User/UserBillingPage';

// import Icon from '@/components/Icon/Icon';

const MemoizedWorkspaceLandingPage = memo( WorkspaceLandingPage );
const MemoizedAPIBuffer = memo( APIBuffer );

export function DashboardPage ( props ) {
    // const [ useMobileDialog, setUseMobileDialog ] = useState( false );
    // const [ contentItems, setContentItems ] = useState( generateContentItems( 10 ) );

    const {
        view = '',
        children,
    } = props;

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    const pathnames = path?.filter( ( x ) => x );
    const endpoint = path?.[ path.indexOf( 'dash' ) + 1 ];

    const {
        routesConfig,
        userNavConfig,
        buildBreadcrumbs,
        buildNavTree,
    } = useNav();

    // Get the top-level routes dynamically from routesConfig[pos:'dash'].pages.
    let dashboardLevelPages = useMemo( () => {
        let routesNavConfig = routesConfig?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
        return routesNavConfig?.pages || [];
    }, [ routesConfig ] );

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        user, setUser,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken,
        settingsDialogOpen, setSettingsDialogOpen,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        // getWorkspaces,
        workspaceId, setWorkspaceId,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,

        // Loading and error state
        loading, setLoading,
        error, setError,
        loadingDB, setLoadingDB,
        errorLoadingDB, setErrorLoadingDB,

        sidebarSecondaryActiveTab, setSidebarSecondaryActiveTab,
        sidebarPrimaryActiveTab, setSidebarPrimaryActiveTab,
    } = useGlobalStore();

    const { GetLocal, SetLocal } = useLocalStorage();
    const { handleSetActiveWorkspace } = useWorkspace();

    const schemas = useGlobalStore( ( state ) => state.schemas );
    const fetchSchemas = useGlobalStore( ( state ) => state.fetchSchemas );

    const {
        settings, setSettings,
        handleChangeBackground,
    } = useSettings();


    // if ( debug === true ) 
    console.log( "Dashboard :: renderContent :: workspacesData = ", workspacesData );

    useEffect( () => {
        console.log( "DashboardPage :: useEffect :: onComponentMount :: fetching schemas." );
        if ( invalid( schemas ) ) {
            fetchSchemas();
        }
    }, [] );

    useEffect( () => {
        console.log( "DashboardPage :: useEffect :: workspacesData changed. :: ", workspacesData );
        if ( !utils.val.isValidArray( workspacesData, true ) ) {
            setRequestFetchWorkspaces( true );
        }
    }, [ workspacesData ] );

    // useEffect( () => {
    //     console.log( "DashboardPage :: useEffect :: dashboardActive changed :: dashboardActive = ", dashboardActive );
    //     // Open right sidebar on this view.
    //     if ( dashboardActive === 'planner' ) { setOpenSidebarSecondary( true ); }
    //     else { setOpenSidebarSecondary( false ); }
    // }, [ dashboardActive ] );

    const routeHasSidebar = ( endpoint ) => {
        return (
            utils.val.isValidArray(
                dashboardLevelPages
                    ?.find( ( nav ) => (
                        nav?.endpoint === endpoint
                        && nav?.enabled
                        && nav?.useSidebar
                        && nav?.sidebarElement !== null
                    ) ),
                true
            )
        );
    };

    return (

        <Container
            classNames={ twMerge(
                `dashboard-container`,
                `absolute inset-0 !h-screen !max-h-screen !min-h-screen !w-screen !max-w-screen !min-w-screen !justify-start !items-start`,
                // `!bg-background`,
                settings?.theme?.background
            ) }
        >

            {/* { settingsDialogOpen === true && (
                <SettingsDialog
                    user={ user }
                    setUser={ setUser }
                    isOpen={ settingsDialogOpen }
                    setIsOpen={ setSettingsDialogOpen }
                />
            ) } */}

            <NestedSidebarWrapper
                openSidebar={ openSidebarPrimary }
                setOpenSidebar={ () => ( setOpenSidebarPrimary( !openSidebarPrimary ) ) }
                contentSidebarContent={
                    <
                        // className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !p-0` }
                        // style={ {
                        //     '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem`,
                        // } }
                        >
                        {/* <Route path={ "home" } element={ <>{ `DashboardHomePage Right Sidebar \n\n TODO \n\n Agenda, notifications, updates, analysis, past achievements, goals, etc go here. ` }</> } /> */ }
                        <Tabs
                            defaultValue={ ( routeHasSidebar( endpoint ) && sidebarPrimaryActiveTab ) || `nav-tree` }
                            className={ `flex-1 overflow-hidden` }
                            onValueChange={ ( value ) => { setSidebarPrimaryActiveTab( value ); } }
                        >
                            <TabsList className={ `w-full rounded-sm` }>
                                <TabsTrigger className={ `h-max rounded-lg` } value="nav-tree">
                                    <NavigationIcon className={ `aspect-square size-5 stroke-1` } />
                                </TabsTrigger>
                                {
                                    (
                                        <TabsTrigger className={ `h-max rounded-lg` } value="page-sidebar">
                                            <DatabaseIcon className={ `aspect-square size-5 stroke-1` } />
                                        </TabsTrigger>
                                    ) }
                            </TabsList>
                            <TabsContent value="nav-tree" className="mt-0">
                                { buildNavTree( dashboardLevelPages ) }
                            </TabsContent>

                            <TabsContent value="page-sidebar" className="mt-0">
                                <Routes>
                                    { dashboardLevelPages
                                        ?.filter( ( nav ) => (
                                            nav?.enabled &&
                                            nav?.useSidebar &&
                                            nav?.sidebarElement !== null
                                        ) )
                                        .map( ( nav ) => (
                                            <Route
                                                // path={ nav?.url || `/dash/${ nav?.target }` }
                                                path={ `${ nav?.target }` }
                                                element={ nav?.sidebarElement }
                                            />
                                        ) ) }
                                </Routes>
                            </TabsContent>
                        </Tabs>
                    </>
                }
                contentSidebarHeader={
                    <div className={ `flex flex-row justify-between items-center w-full h-full` }>
                        { utils.val.isValidArray( workspacesData, true ) && (
                            <Nav.Switcher
                                items={ workspacesData }
                                useToggle={ true }
                                label={ '' }
                                keyMatches={ { title: 'title', icon: 'icon' } }
                                active={ activeWorkspace ? activeWorkspace : {} }
                                onSetActive={ ( item ) => { handleSetActiveWorkspace( item, true ); } }
                                renderFooter={
                                    <div
                                        className="flex flex-row w-full gap-2 py-2 px-1"
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            navigate( '/dash/workspaces' );
                                        } }
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                            <Plus className="aspect-square backdrop:size-4" />
                                        </div>
                                        <div className="font-medium text-muted-foreground">
                                            { `Add workspace` }
                                        </div>
                                    </div>
                                }
                            />
                        ) }
                    </div>
                }
                header={ <></> }
                nav={
                    <>
                        { useMemo( () =>
                            <Nav.Side
                                // Collapses down to icons
                                items={ dashboardLevelPages?.filter( ( n ) => n?.enabled && n?.location === 'nav-header' ) }
                                collapseMode={ 'none' }
                                activeItem={ endpoint }
                                setActiveItem={ setDashboardActive }
                                itemLabelClassNames={ `hidden !w-0` }
                                itemIconClassNames={ twMerge( `!w-full !p-1 p-0 px-0 m-0` ) }
                            />
                            , [ dashboardLevelPages, endpoint, dashboardActive ] )
                        }
                    </>
                }
                footer={
                    <> { useMemo( () =>
                    ( <div className={ `flex flex-col justify-center items-center p-0 w-full` }>
                        <Nav.Side
                            collapseMode={ 'none' }
                            itemLabelClassNames={ `hidden !w-0` }
                            itemIconClassNames={ twMerge( `!w-full !p-1 p-0 px-0 m-0 w-full` ) }
                            items={ dashboardLevelPages?.filter( ( n ) => n?.enabled && n?.location === 'nav-footer' ) }
                            activeItem={ endpoint }
                            setActiveItem={ setDashboardActive }
                        />

                        <div className={ `flex flex-row w-full h-auto items-center p-0` }>
                            <Nav.User
                                user={ user }
                                nav={ userNavConfig }
                            />
                        </div>
                    </div> ), [ dashboardActive, endpoint, dashboardLevelPages ] ) }
                    </> }
            >

                {/* DASHBOARD (PAGE) CONTENT */ }
                <>
                    <div
                        className={ twMerge(
                            `dashboard-content-container`,
                            `!w-full !max-w-full !h-full !min-h-full !max-h-full !px-0 mb-0 gap-0 overflow-hidden relative`,
                            `!px-0 mb-0 gap-0 overflow-hidden relative w-full h-full bottom-0 top-0 left-0 right-0 `,
                            `!overflow-hidden`,
                            // `!h-content !max-h-content !min-h-content`,
                            // `!min-h-[calc(100vh-3.75)]`,
                            // `!h-[calc(100vh-${ CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT }rem)] !max-h-[calc(100vh-${ CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT }rem)] !min-h-[calc(100vh-${ CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT }rem)]`,
                            // `absolute inset-0 flex items-center justify-center z-5000 transition-all duration-200 ease-in-out`,
                            // `bg-sextary-600/10 !bg-opacity-10 bg-gradient-to-br from-primary-purple-800/10 via-bodyprimary/0 to-secondaryAlt-300/10`
                        ) }
                        style={ {
                            'maxHeight': `calc(100vh-${ CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT }rem)`,
                            'height': `calc(100vh-${ CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT }rem)`,
                        } }
                    >
                        {/* Dashboard Content Header */ }
                        <DashboardContentHeader
                            // { ...props }
                            className={ twMerge(
                                `dashboard-content-header relative`,
                                `border border-white `,
                                `w-full p-0 m-0 top-0 flex z-10 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)]  items-stretch gap-0`,
                            ) }
                            useClock={ true }
                            openSidebarPrimary={ openSidebarPrimary }
                            openSidebarSecondary={ openSidebarSecondary }
                            setOpenSidebarPrimary={ setOpenSidebarPrimary }
                            setOpenSidebarSecondary={ setOpenSidebarSecondary }
                        />

                        <>{ buildBreadcrumbs() }</>

                        <DashboardContent>
                            <MemoizedWorkspaceLandingPage>
                                <Routes>
                                    { dashboardLevelPages
                                        ?.filter( ( nav ) => (
                                            nav?.enabled &&
                                            nav?.element !== null
                                        ) )
                                        .map( ( nav ) => (
                                            <Route
                                                // path={ nav?.url || `/dash/${ nav?.target }` }
                                                path={ `${ nav?.target }` }
                                                element={ nav?.element }
                                            />
                                        ) ) }
                                    <Route path={ "user/settings" } element={ <UserSettingsPage /> } />
                                    <Route path={ "user/billing" } element={ <UserBillingPage /> } />
                                    <Route path={ "user/profile" } element={ <UserProfilePage /> } />
                                    <Route path={ "user/profile/:id/*" } element={ <UserProfilePage /> } />
                                </Routes>
                            </MemoizedWorkspaceLandingPage>
                        </DashboardContent>
                    </div>
                    <DashboardSidebarRight />
                </>
            </NestedSidebarWrapper>

            <div className={ `flex flex-col w-full items-center justify-center z-5000 gap-4 absolute bottom-2` }>
                <div className={ `flex flex-col w-auto items-center justify-center opacity-30 hover:opacity-80 transition-all duration-150 ease-in-out radius-m-4` }
                    style={ {
                        boxShadow: `0px 2px 4px rgba(0,0,0,.12),0px 8px 12px rgba(0,0,0,.08),0px 8px 16px rgba(0,0,0,.08)`,
                    } }
                >
                    <ExpandableTabs
                        tabs={ dashboardLevelPages?.filter( ( n ) => ( n?.showInMiniNav === true ) ) }
                        onChange={ ( index ) => {
                            let navBtn = dashboardLevelPages?.filter( ( n ) => ( n?.location === 'nav-header' ) )?.[ index ];
                            if ( navBtn ) { navigate( navBtn?.url ); }
                        } }
                        activeColor="text-blue-500"
                        className={ `w-auto border-blue-200 dark:border-blue-800 border-2 border-Neutrals/neutrals-11 bg-background saturate-50 backdrop-blur-md fill-mode-backwards` }
                        style={ {
                            backdropFilter: `blur(1rem)`,
                        } }
                    />
                </div>
            </div>
        </Container>
    );
}


export const DashboardPageContent = ( {
    headerLeftNav = null,
    headerRightNav = null,
    content,
    footer = null,
    buttonList, // Alternate in lieu of having to generate the nav button schema.
    navRoutesList,
    navStorageName = '',
    handleCreateCallback = () => { },
    handleRefreshCallback = () => { },
    handleGetSchemasCallback = () => { },
    navParentEndpoint = '',
    navDefaultViewEndpoint = '',
    showContent = true,
    contentLoading = false,
    loadingSpinnerType = 'orbit',
    classNames = '',
    settings,
    options,
    children,
    ...props
} ) => {
    const { GetLocal, SetLocal } = useLocalStorage();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    let endpoint = path?.[ path.indexOf( navParentEndpoint ) + 1 ];
    console.log( "DashboardPageContent => props = ", props );

    const [ navViewEndpoint, setNavViewEndpoint ] = useState( `${ navParentEndpoint }` );

    const {
        debug, setDebug,
        data, setData, getData,
        schemas, getSchema,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        sidebarSecondaryActiveTab, setSidebarSecondaryActiveTab,
    } = useGlobalStore();

    const handleSetNavViewEndpoint = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = GetLocal( navStorageName );
        endpoint = (
            utils.val.isValidArray( path, true )
                ? ( path.length > path.indexOf( navParentEndpoint )
                    ? ( path?.[ path.indexOf( navParentEndpoint ) + 1 ] )
                    : ( path?.[ path.indexOf( navParentEndpoint ) ] ) )
                : ( null )
        );
        if ( !t || t === '' ) { return endpoint ?? navParentEndpoint; }
        return t;
    };

    return (
        <Content.Container
            className={ `!w-full !min-w-full !max-w-full !h-[100vh] !max-h-[100vh] !min-h-[100vh] overflow-auto !items-start !justify-stretch !p-0 !m-0 !gap-1 mx-auto my-auto !px-2` }
            centered={ false }
        >

            <Content.Header className={ `!flex-shrink font-sans justify-start items-center w-full flex flex-row h-[2.5vh] max-h-[2.5vh] border` }
            // className={ `flex flex-row justify-start items-center h-max w-full rounded-[${ 0.25 }rem] p-0 m-0 gap-0` }
            >
                {/* Nav buttons */ }
                <div className={ `w-full flex flex-row justify-between items-center ` }>
                    { headerLeftNav && headerLeftNav }

                    { handleCreateCallback !== null && ( <Button
                        variant={ 'ghost' }
                        size={ 'sm' }
                        className={ `px-2 m-0 focus:outline-none !max-h-min inset-0 flex-shrink relative focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                        onClick={ handleCreateCallback }
                    >
                        <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                        <h6 className={ `text-center self-center object-center w-auto p-0 text-base` }>
                            { ` New ` }
                        </h6>
                    </Button> ) }

                    { handleRefreshCallback !== null && ( <Button
                        variant={ 'ghost' }
                        size={ 'xs' }
                        className={ `px-4 py-2 m-0 focus:outline-none self-center w-auto focus-within:outline-none focus-visible:outline-none border rounded-r-full !h-7 flex-shrink` }
                        onClick={ handleRefreshCallback }
                    >
                        <RefreshCcw className={ `p-0 m-0 w-min !size-4 hover:animate-rotate transition-all self-center` } />
                    </Button> ) }

                    <div className={ `new-task-button w-full rounded-full overflow-hidden items-center justify-center` }>

                        { utils.val.isValidArray( navRoutesList, true ) && (
                            <ButtonGroup
                                parentRoute={ `./${ navParentEndpoint }` }
                                containerClassNames={ `!bg-background` }
                                dropdownMenuClassNames={ `bg-transparent m-0` }
                                dropdownTriggerClassNames={ `` }
                                dropdownContentClassNames={ `` }
                                // buttons={ taskPageNavBtns }
                                buttons={ utils.val.isValidArray( buttonList, true ) ? buttonList : buttonListToSchema( navRoutesList, navViewEndpoint, handleSetNavViewEndpoint ) }
                                activeValue={ navViewEndpoint }
                                setActiveValue={ setNavViewEndpoint }
                                dropdownTriggerIcon={ <LucideLayoutGrid /> }
                                responsiveBreakpoint={ 980 }
                                // responsiveMode={ 'wrap' }
                                responsiveMode={ 'dropdown' }
                            /> ) }

                        { headerRightNav && headerRightNav }
                    </div>

                </div>

            </Content.Header>


            <div className={ `relative content-body-container !w-full !min-w-full !max-w-full !h-[90vh] !max-h-[90vh] !min-h-[90vh] ${ classNames } !overflow-hidden` }>

                <Content.Body
                    className={ twMerge(
                        `relative flex flex-col gap-2 !min-h-full !h-full !max-h-full !min-w-full !w-full !max-w-full`,
                        "bg-background",
                        `!h-full !w-full`,
                    ) }
                    centered={ false }
                >
                    { ( showContent === true && contentLoading === false )
                        ? ( <ScrollArea
                            className={ twMerge(
                                `scroll-area-container task-interface-container !w-full !max-w-full !min-h-[90vh] !h-[90vh] !max-h-[90vh] !p-2 mb-0 gap-0`,
                                `inset-0 relative bottom-4`,
                                `border-[0.200rem] border-primary-purple-50/10`,
                            ) }
                        >
                            <ScrollBar orientation="horizontal" />
                            <Scrollbar orientation="vertical" />
                        </ScrollArea> )
                        : ( <Spinner
                            variant={ 'grid' }
                            size={ 'xl' }
                            color={ 'currentColor' }
                            overlay={ true }
                            className={ `` }
                        /> ) }


                </Content.Body>
            </div>

            { footer !== null && ( <Content.Footer className={ `flex flex-shrink !h-8 rounded-[${ 0.25 }rem]` }>
                { footer }
            </Content.Footer> ) }

        </Content.Container>
    );
};


export function DashboardContent ( { children } ) {

    const {
        routesConfig,
        userNavConfig,
    } = useNav();

    // let routesNavConfig = routesConfig?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
    // let dashboardLevelPages = routesNavConfig?.pages || [];

    // Get the top-level routes dynamically from routesConfig[pos:'dash'].pages.
    let dashboardLevelPages = useMemo( () => {
        let routesNavConfig = routesConfig?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
        return routesNavConfig?.pages || [];
    }, [ routesConfig ] );

    return (
        <div className={ `flex flex-col h-full w-full justify-center items-center` }>
            <Content.Body
                centered={ false }
                className={ twMerge(
                    `dashboard-content-body`,
                    `!w-full !max-w-full !h-full !min-h-full !max-h-full !px-0 mb-0 gap-0 overflow-hidden relative`,
                    // `w-full !h-full p-0 m-0 top-0 flex z-[15] shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] gap-0`,
                    `!w-full !max-w-full !h-full !min-h-full !max-h-full !px-0 mb-0 gap-0 relative !overflow-hidden`,
                    `!rounded-none`,
                    `flex !justify-start !items-start`,
                ) }
            >
                { children && children }
            </Content.Body>
        </div>
    );
}


export const DashboardContentHeader = ( props ) => {

    const {
        view = '',
        children,
        useClock = true,
        openSidebarPrimary, setOpenSidebarPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
    } = props;

    return (
        <>
            {/* DashboardContentHeader */ }
            <header
                className={ `sticky border-b border-sidebar-border top-0 flex gap-0 z-40 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] justify-center items-between px-0` }
                style={ {
                    height: `${ CONTENT_HEADER_HEIGHT }rem`,
                    maxHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                    minHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                    // width: `${ 100 }% !important`,
                    // maxWidth: `${ 100 }% !important`,
                    // minWidth: `${ 100 }% !important`,
                } }
            >
                <div className={ `max-w-full w-full m-0 px-0 py-0 status-bar flex flex-row justify-stretch items-center h-full max-h-full overflow-hidden` }
                    style={ {
                        height: `${ CONTENT_HEADER_HEIGHT }rem`,
                        maxHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                        minHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                        width: `${ 100 }% !important`,
                        maxWidth: `${ 100 }% !important`,
                        minWidth: `${ 100 }% !important`,
                    } }
                >
                    {/* <div className={ `p-0 m-0 text-lg whitespace-nowrap flex flex-row justify-stretch items-start !w-auto flex-shrink` }>
                    </div> */}
                    <div
                        className={ `justify-stretch items-stretch whitespace-pre-wrap text-ellipsis overflow-hidden flex-grow` }
                        style={ {
                            // maxInlineSize: `200ch`,
                        } }
                    >
                        <RandomQuote className={ `max-h-full overflow-hidden` } />
                    </div>
                    <div
                        className={ `p-0 m-0 text-lg whitespace-nowrap flex flex-row flex-shrink justify-end items-center !min-h-full !max-h-full !h-full self-center` }
                    >


                        <DashboardFormDialogWrapper />
                        {/* <Notify className={ `p-0 m-0 size-10 aspect-square items-center justify-center self-center` } /> */ }
                        <NotificationsDropdown className={ `p-0 m-0 size-10 aspect-square items-center justify-center self-center` } />
                        <ThemeToggle className={ `p-0 m-0 size-10 aspect-square items-center justify-center self-center` } />
                        <DateTime
                            // className={ `p-0 m-0 !min-h-full !h-full items-center justify-between ` }
                            className={ `m-0 w-auto h-10 items-center justify-center self-center` }
                            timerOn={ useClock }
                            locale={ 'en' }
                            timerInterval={ 1000 }
                            returnValueOnly={ false }
                            style={ {
                                height: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                                maxHeight: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                                minHeight: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                            } }
                        />
                        { openSidebarSecondary === false && (
                            <div className={ `w-auto h-full aspect-square` } >
                                <SidebarProvider className={ `!min-h-max !max-h-max w-auto h-full aspect-square` }>
                                    <SidebarTrigger
                                        size="xs"
                                        variant="outline"
                                        className={ `w-auto h-full aspect-square !p-0 !m-0` }
                                        onClick={ () => { setOpenSidebarSecondary( !openSidebarSecondary ); } }
                                    />
                                </SidebarProvider>
                            </div>
                        ) }
                    </div>
                </div>
            </header>
        </>
    );
};



export const DashboardSidebarRight = ( {
    children,
} ) => {

    const {
        debug, setDebug,
        data, setData, wipeData,
        user, setUser,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken,
        settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        sidebarRightMaximized, setSidebarRightMaximized, toggleOpenSidebarRightMaximized,
        notifications, setNotifications,
        activeNotifications, setActiveNotifications, addNotification, dismissNotification,
        reminders, setReminders,
        activeReminders, setActiveReminders,
        sidebarSecondaryActiveTab, setSidebarSecondaryActiveTab,
    } = useGlobalStore();

    const fetchSchemas = useGlobalStore( ( state ) => state.fetchSchemas );
    const schemas = useGlobalStore( ( state ) => state.schemas );
    const { handleCreateStart: plannerHandleCreateStart } = usePlanner();

    // const [ sidebarRightMaximized, setSidebarRightMaximized ] = useState( true );

    return (
        <>
            { dashboardActive !== null && (
                <Side
                    resizable={ false }
                    side={ 'right' }
                    width={ sidebarRightMaximized ? SIDEBAR_WIDTH_RIGHT : SIDEBAR_WIDTH_RIGHT_MINI }
                    defaultWidth={ sidebarRightMaximized ? SIDEBAR_WIDTH_RIGHT : SIDEBAR_WIDTH_RIGHT_MINI }
                    dashboardActive={ dashboardActive }
                    setDashboardActive={ setDashboardActive }
                    openSidebar={ openSidebarSecondary }
                    setOpenSidebar={ setOpenSidebarSecondary }
                    // sidebarContent={ sidebarContentSecondary }
                    setSidebarContent={ setSidebarContentSecondary }
                    header={
                        <div className={ `flex flex-row bg-sidebar-background w-full h-full items-center p-0 h-${ CONTENT_HEADER_HEIGHT }` }>
                            { openSidebarSecondary && (
                                <SidebarTrigger className={ `w-auto h-full aspect-square` } onClick={ () => { setOpenSidebarSecondary( !openSidebarSecondary ); } } />
                            ) }

                            { (
                                <Button
                                    title={ `Refetch Schemas (for input forms)` }
                                    variant={ 'ghost' }
                                    size={ `icon` }
                                    className={ `h-full aspect-square` }
                                    onClick={ () => { setSidebarRightMaximized( !sidebarRightMaximized ); } }
                                >
                                    { sidebarRightMaximized ? <Minimize /> : <Maximize /> }
                                </Button>
                            ) }

                            {/* <Button
                                title={ `Refetch Schemas (for input forms)` }
                                variant={ 'ghost' }
                                size={ `icon` }
                                className={ `h-full aspect-square` }
                                onClick={ () => { fetchSchemas(); } }
                            >
                                <DatabaseBackupIcon />
                            </Button>


                            <Button
                                title={ `Refetch All Data` }
                                variant={ 'ghost' }
                                size={ `icon` }
                                className={ `h-full aspect-square` }
                                onClick={ () => { wipeData(); } }
                            >
                                <XOctagonIcon className={ `size-6 aspect-square !p-0` } />
                            </Button> */}

                            <DashboardSync />

                        </div>
                    }
                    nav={ null }
                    footer={
                        <Routes>
                            <Route path={ "planner/*" } element={
                                <SidebarMenu>
                                    <SidebarMenuButton className={ `bg-background h-8` } onClick={ () => {
                                        console.log( "New Calendar button pressed." );
                                        plannerHandleCreateStart( {}, 'calendar' );
                                    } }
                                    >
                                        <Plus />
                                        <span>New Calendar</span>
                                    </SidebarMenuButton>
                                </SidebarMenu>
                            } />
                        </Routes>
                    }
                >

                    <div className={ `w-full h-full flex flex-grow flex-col ` }>

                        <Tabs
                            defaultValue={ sidebarSecondaryActiveTab }
                            // defaultValue={ sidebarContentSecondary ? sidebarContentSecondary : 'notes' }
                            className={ `flex flex-col w-full h-full p-0 justify-stretch items-stretch overflow-x-hidden` }
                            // onValueChange={ setSidebarContentSecondary }
                            onValueChange={ ( value ) => { setSidebarSecondaryActiveTab( value ); } }
                        >
                            <TabsList className={ `justify-between items-stretch p-0 ` }>
                                { DASHBOARD_RIGHT_SIDEBAR_ICONS_CONFIG.map( ( tab, i ) => {
                                    let label = utils.val.isString( tab?.label )
                                        ? utils.str.toCapitalCase( tab?.label )
                                        : utils.str.toCapitalCase( tab?.label.toString() );
                                    return (
                                        <div className={ `w-auto flex flex-1 px-auto` }>
                                            <TabsTrigger
                                                id={ `dashboard-right-sidebar-tabs-${ tab.name }-${ i }` }
                                                key={ `dashboard-right-sidebar-tabs-${ tab?.name }-${ i }` }
                                                value={ tab?.name }
                                                className={ `m-0 flex flex-1 cursor-default font-extrabold select-none text-[1.125rem] leading-none text-mauve11 outline-none hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black leading-2 !py-0 !px-0 !leading-2 hover:transform-none` }
                                            >
                                                <Button
                                                    title={ label }
                                                    size={ `icon` }
                                                    variant={ `ghost` }
                                                    className={ `size-full` }
                                                >
                                                    <tab.icon className={ `size-7 aspect-square p-0 stroke-[0.100rem]` } />
                                                </Button>
                                            </TabsTrigger>
                                        </div>
                                    );
                                } ) }
                            </TabsList>

                            <TabsContent
                                className={ `!h-full !w-full overflow-hidden relative !p-0` }
                                value='log'
                            >
                                <PlannerLogRightSidebarContent />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full  overflow-hidden relative !p-0` }
                                value='stats'
                            >
                                {/* { 'Stats Sidebar' } */ }
                                {/* <Route path={ "/dash/reflect/stats/*" } element={ <ReflectStatsSidebar /> } /> */ }
                                <ReflectStatsSidebar />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full  overflow-hidden relative !p-0` }
                                value='habits'
                            >
                                <ReflectStatsSidebar />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full overflow-hidden relative !p-0` }
                                value='today'
                            >
                                {/* { 'Today Agenda' } */ }
                                <TodoTodayRightSidebarContent />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full overflow-hidden relative !p-0` }
                                value='note'
                            >
                                <NotesRightSidebarContent />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full  overflow-hidden relative !p-0` }
                                value='plan'
                            >
                                <PlannerRightSidebarContent />
                            </TabsContent>

                            <TabsContent
                                className={ `!h-full !w-full overflow-hidden relative !p-0` }
                                value='tasks'
                            >
                                <TodoRightSidebarContent />
                            </TabsContent>

                        </Tabs>

                    </div>
                </Side> )
            }
        </>
    );
};


export function DashboardFormDialogWrapper ( { children, path } ) {

    const [ dayDialogOpen, setDayDialogOpen ] = useState( false );
    const [ dayDialogInitialData, setDayDialogInitialData ] = useState( {} );

    return (
        <div>
            <Button
                size={ 'sm' }
                variant={ 'outline' }
                className={ `size-10 aspect-square focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                onClick={ () => setDayDialogOpen( true ) }
            >
                <Plus className={ `p-0 m-0 h-full !size-5` } />
            </Button>

            { <DayFormDialog
                mode={ 'day' }
                isOpen={ dayDialogOpen }
                setIsOpen={ setDayDialogOpen }
                initialData={ dayDialogInitialData }
                setData={ setDayDialogInitialData }
                onClose={ () => ( setDayDialogOpen( false ) ) }
            /> }

        </div>
    );
}
