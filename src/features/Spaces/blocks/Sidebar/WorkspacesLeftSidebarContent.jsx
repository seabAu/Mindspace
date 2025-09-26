/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo } from 'react';
import {
    ArrowDownLeftSquare,
    ArrowDownRightSquare,
    CalendarArrowUp,
    CalendarFoldIcon,
    CalendarMinus,
    CalendarPlus,
    CheckSquare,
    ChevronRight,
    PenBoxIcon,
} from "lucide-react";

// Utilities
import * as utils from 'akashatools';
import { addDays } from 'date-fns';

// Constants / Config
import {
    DATE_PICKER_OPTIONS,
} from '@/lib/config/constants';

// Data stores
import useGlobalStore from '@/store/global.store';

// Components
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import Nav from '@/components/Nav/Nav';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Collapse from '@/components/Collapsible/Collapse';
import useWorkspace from '@/lib/hooks/useWorkspace';

const WorkspacesLeftSidebarContent = () => {
    // Display upcoming events.
    // Ordered by proximity, lower = further away. 
    // Create inputs to set date range and filter order / asc | desc

    let [ searchParams, setSearchParams ] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;

    const {
        debug, setDebug,
        getWorkspaces,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        // getWorkspaces,
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
    } = useWorkspace();

    let sidebarControls = [ {
        enabled: true,
        index: 0,
        id: 'context-menu-item-workspace-open',
        key: 'context-menu-item-workspace-open',
        type: 'button',
        shortcut: 'ctrl+shift+a',
        name: "openWorkspace",
        label: "Open Workspace",
        icon: <ArrowDownRightSquare className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Workspaces nav list :: context :: open :: item = ', item );
            // navigate( `/dashboard/workspaces/${ item?._id }` );
            if ( item ) { handleSetFocusedWorkspace( item ); }
        },
        useTooltip: false,
        tooltipInfo: '',
    }, {
        enabled: true,
        index: 1,
        id: 'context-menu-item-workspace-setactive',
        key: 'context-menu-item-workspace-setactive',
        type: 'button',
        shortcut: 'ctrl+shift+a', // '⌘⇧O',
        name: "setWorkspaceActive",
        label: "Set Workspace As Active",
        icon: <CheckSquare className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Workspaces nav list :: context :: set active :: item = ', item );
            // navigate( `/dashboard/workspaces/${ item?._id }` );
            if ( item ) { handleSetActiveWorkspace( item ); }
        },
        useTooltip: false,
        tooltipInfo: '',
    }, {
        enabled: true,
        index: 2,
        id: 'context-menu-item-workspace-clone',
        key: 'context-menu-item-workspace-clone',
        type: 'button',
        shortcut: 'ctrl+shift+a', // '⌘⇧O',
        name: "cloneWorkspace",
        label: "Clone Workspace",
        icon: <CalendarFoldIcon className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Workspaces nav list :: context :: clone :: item = ', item );
            if ( item ) {
                handleCreateStart( item, 'workspace' );
                handleClone( item );
            }
        },
        useTooltip: false,
        tooltipInfo: '',
    }, {
        enabled: true,
        index: 3,
        id: 'context-menu-item-workspace-update',
        key: 'context-menu-item-workspace-update',
        type: 'button',
        shortcut: 'ctrl+shift+e', // '⌘⇧O',
        name: "editWorkspace",
        label: "Edit Workspace ",
        icon: <PenBoxIcon className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Workspaces nav list :: context :: edit workspace :: item = ', item );
            // navigate( `/dashboard/planner/events/${ item?._id }/edit` );
            if ( item ) {
                handleEditStart( item, 'workspace' );
            }
        },
        useTooltip: false,
        tooltipInfo: '',
    }, {
        enabled: true,
        index: 4,
        id: 'context-menu-item-workspace-delete',
        key: 'context-menu-item-workspace-delete',
        type: 'button',
        shortcut: 'ctrl+shift+a', // '⌘⇧O',
        name: "deleteWorkspace",
        label: "Delete Workspace",
        icon: <CalendarMinus className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Workspaces nav list :: context :: delete workspace :: item = ', item );
            if ( item && utils.val.isObject( item ) ) {
                if ( item?._id ) { handleDeleteWorkspace( item?._id ); }
            }
        },
        useTooltip: false,
        tooltipInfo: '',
    }
    ];

    return (
        <div className={ `w-full !overflow-auto !max-h-full h-auto block justify-start place-items-start` }>
            { workspacesData && workspaceId && ( utils.val.isValidArray( workspacesData, true )
                ? ( <>
                    <Nav.List
                        label={ 'Workspaces' }
                        controls={ sidebarControls }
                        useSearch={ true }
                        searchField={ 'title' }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a - b ) } // TODO :: Add alphabetical sort
                        collapsible={ true }
                        collapsibleDefaultOpen={ true }
                        items={ workspacesData }
                        maxShow={ workspacesData.length < 20 ? workspacesData.length : 20 }
                        activeItem={ activeWorkspace }
                        className={ `gap-1 p-0 m-0 w-full` }
                        itemClassname={ `!px-1 !py-2 h-auto rounded-md` }
                        itemIconClassNames={ `stroke-[0.1rem] text-primaryPurple px-1` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Workspaces sidebar dropdown list :: items = ", workspacesData, " :: ", "onClickItem triggered :: item = ", item );
                            if ( item ) {
                                handleEditStart( item, 'workspace' );
                            }
                            // navigate( `/dash/workspaces/spaces/${ item?._id }/edit` );
                        } }
                    />
                </> )
                : ( <Spinner /> ) )
            }
        </div>
    );
};

export default WorkspacesLeftSidebarContent;

