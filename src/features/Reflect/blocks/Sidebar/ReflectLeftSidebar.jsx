// Top-level left-side sidebar for the reflect dashboard homepage. 

/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo, } from 'react';
import { ChevronRight } from 'lucide-react';

// Utilities
import * as utils from 'akashatools';

// Data stores
import useGlobalStore from '@/store/global.store';

// Components
import Nav from '@/components/Nav/Nav';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { twMerge } from 'tailwind-merge';
import { useNav } from '@/lib/providers/NavProvider';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const ReflectLeftSidebar = () => {
    // Display all available endpoints, at least the top-level ones.
    // Optional :: May want to add the full nav tree with dropdowns for any pages that have subpages.

    const {
        routesConfig,
        userNavConfig,
        getBreadcrumbs
    } = useNav();

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        data, setData,
        user, setUser,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken, settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        // getWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,

        notifications, setNotifications,
        activeNotifications, setActiveNotifications,
        addNotification,
        dismissNotification,
        reminders, setReminders,
        activeReminders, setActiveReminders,
    } = useGlobalStore();

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { GetLocal, SetLocal } = useLocalStorage();

    const navSidebarConfig = useMemo( () => {
        if ( routesConfig && utils.val.isValidArray( routesConfig, true ) ) {
            // Get first nested level.
            let startingRoute = routesConfig?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
            let startingRoutePages = [];
            if ( startingRoute ) {
                // Second nested level.
                startingRoutePages = startingRoute?.hasOwnProperty( 'pages' ) ? startingRoute?.pages : [];
                startingRoute = startingRoutePages?.find( ( route ) => ( route.endpoint === 'reflect' ) ) || null;
            }
            if ( startingRoute ) {
                // Check to see if there are pages here. 
                let startingRoutePages = startingRoute?.hasOwnProperty( 'pages' ) ? startingRoute?.pages : [];
                return (
                    startingRoutePages
                        .filter(
                            ( nav ) =>
                                nav?.enabled &&
                                nav?.element !== null
                        )
                );
            }
        }
    }, [ routesConfig ] );

    return (
        <div
            className={ `w-full flex flex-col flex-grow justify-stretch items-center px-2` }>
            <Nav.List
                label={ 'Home' }
                controls={ null }
                useSearch={ false }
                // searchField={ 'title' }
                collapsible={ false }
                collapsibleDefaultOpen={ true }
                // items={ [ navSidebarConfig?.map( ( nav ) => ( { ...nav, icon: nav?.icon ? <nav.icon /> : null } ) ) ] }
                items={ navSidebarConfig }
                maxShow={ 25 }
                activeItem={ dashboardActive }
                className={ `gap-1 w-full` }
                itemClassname={ `h-auto px-2 border border-transparent border-[0.1rem] hover:border-[0.1rem] !p-0 !m-0 transition-color duration-200 ease-in-out !outline-none` }
                itemIconClassNames={ `stroke-[0.1rem] text-primaryPurple px-1` }
                onClickItem={ ( item ) => {
                    console.log(
                        'Dashboard',
                        ' :: ', 'DashboardHome left-side sidebar dropdown list',
                        ' :: ', 'onClickItem triggered :: item = ', item,
                        ' :: ', 'navigating to: ', item?.url
                    );

                    navigate( item?.url );
                } }
            />
        </div>
    );
};

export default ReflectLeftSidebar;
