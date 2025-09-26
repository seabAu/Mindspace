/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo, } from 'react';
import { ChevronRight } from 'lucide-react';

// Utilities
import * as utils from 'akashatools';
import { buildSelect } from '@/lib/utilities/input';
import usePlanner from '@/lib/hooks/usePlanner';
import { cn } from '@/lib/utilities/style';
import clsx from 'clsx';
import { addDays, addMonths, format, isSameMonth } from 'date-fns';

// Constants / Config

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

const DashboardLeftSidebar = () => {
    // Display all available endpoints, at least the top-level ones.
    // Optional :: May want to add the full nav tree with dropdowns for any pages that have subpages.

    const {
        routesConfig,
        userNavConfig,
        buildNavTree
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
            let startingRoute = routesConfig?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
            if ( startingRoute ) {
                // startingRoute = startingRoute?.find( ( route ) => ( route.endpoint === 'dash' ) ) || null;
                let startingRoutePages = startingRoute?.hasOwnProperty( 'pages' ) ? startingRoute?.pages : [];
                return (
                    startingRoutePages
                        .filter(
                            ( nav ) =>
                                // nav?.active &&
                                nav?.enabled &&
                                // nav?.useSidebar &&
                                // nav?.sidebarElement !== null,
                                nav?.element !== null
                        )
                    // ?.map( ( nav ) => ( {
                    //     _id: nav?.title,
                    //     title: nav?.title,
                    //     url: nav?.url,
                    //     target: nav?.target,
                    //     icon: url?.icon,
                    //     pages: [
                    //         ...Object.keys( nav ).map( ( key, index ) => ( {
                    //             title: `${ key }: ${ nav?.[ key ] }`,
                    //             detail: `${ nav?.[ key ] }`,
                    //         } ) ),
                    //     ],
                    //     ...nav,
                    // } ) )
                );
            }
        }
    }, [ routesConfig ] );

    return (
        <div
            className={ `w-full flex flex-col flex-grow justify-stretch items-center` }>
            { buildNavTree( navSidebarConfig ) }
            {/* <Nav.List
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
                        ' :: ', 'items = ', routesConfig,
                        ' :: ', 'onClickItem triggered :: item = ', item,
                        ' :: ', 'navigating to: ', item?.url
                    );

                    navigate( item?.url );
                } }
            /> */}
        </div>
    );
};

export default DashboardLeftSidebar;
