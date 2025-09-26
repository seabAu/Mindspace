// This just produces an array of modular nav components that are parented by whatever called on it. 
// Later this may expand into something more full spectrum.
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    Folder,
    ArrowUpRight,
    AudioWaveform,
    BadgeCheck,
    Bell,
    Blocks,
    BoxesIcon,
    CalendarCheck,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    Cog,
    Command,
    CreditCard,
    File,
    FileIcon,
    FolderIcon,
    Home,
    Inbox,
    LogOut,
    MessageCircleQuestion,
    MoreHorizontal,
    PersonStanding,
    Plus,
    RefreshCwIcon,
    Search,
    Settings2,
    Sparkles,
    StarOff,
    Trash2,
    Link2Icon,
    MoreHorizontalIcon,
    ArrowBigDown,
    ArrowBigUp,
    UserCircle,
} from "lucide-react";

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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from '@/components/ui/label';

import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

import * as utils from 'akashatools';
import "./nav.css";
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { buildContextItems, buildNav } from '@/lib/utilities/nav';
import { Spinner } from '@/components/Loader/Spinner';
import GenericContextMenu from '@/components/ContextMenu/ContextMenu';
import { Input } from '@/components/ui/input';
import { twMerge } from 'tailwind-merge';
import { NAV_ICON_HEIGHT, NAV_ICON_WIDTH } from '@/lib/config/constants';
import { invalid } from '@/lib/utilities/data';
import Droplist from '../Droplist';
import { FaUserGear } from 'react-icons/fa6';

const Nav = ( {
    children,
    enabled = true,
    items = [],
    controls = [],
    type = "default",
    layout = "column",
    collapsible,
    collapsibleDefaultOpen,
    maxShow = 5,
    useSearch,
    searchField,
    onClickItem,
    ...props
} ) => {

    const renderNavButtons = () => {
        switch ( type ) {
            case "items":
                return <Nav.Items items={ items } controls={ controls } { ...props } />;
            case "info":
                return <Nav.Info items={ items } controls={ controls } { ...props } />;
            case "list":
                return <Nav.List items={ items } controls={ controls } { ...props } />;
            case "dropdown":
                return <Nav.Dropdown items={ items } controls={ controls } { ...props } />;
            case "side":
                return <Nav.Side items={ items } controls={ controls } { ...props } />;
            case "switcher":
                return <Nav.Switcher items={ items } controls={ controls } { ...props } />;
            case "collapse":
                return <Nav.Collapse items={ items } controls={ controls } { ...props } />;
            case "context":
                return <Nav.Context items={ items } controls={ controls } { ...props } />;
            case "user":
                return <Nav.User items={ items } controls={ controls } { ...props } />;
            case "directory":
                return <Nav.Directory items={ items } controls={ controls } { ...props } />;
            default:
                return children;
        }
    };

    // const renderControls = useMemo( () => buildNav( controls ), [ controls ] );
    const renderNav = useMemo( () => renderNavButtons( items ), [ items, enabled, renderNavButtons /* , controls */ ] );

    return (
        <div className={ `nav-container nav-${ layout }` }>
            { utils.val.isValidArray( items, true ) ? (
                collapsible
                    ? ( <Nav.CollapsibleList
                        { ...props }
                        collapsible={ collapsible }
                        collapsibleDefaultOpen={ collapsibleDefaultOpen }
                    >
                        { enabled ? renderNav : null }
                    </Nav.CollapsibleList> )
                    : ( renderNav )
            ) : <Spinner /> }
        </div>
    );
};

/**
 * Navigation builder component.
 * @param {Object} props - The props for the component.
 * @param {Array} props.controls - Array of navigation controls.
 * @param {string} props.parentClasses - Additional classes for the parent container.
 * @param {string} props.navClasses - Additional classes for the nav elements.
 * @param {Function} props.setShowDropdown - Function to control dropdown visibility.
 */
const Items = ( props ) => {
    const {
        label = '',
        items,
        controls,
        parentClasses = "",
        navClasses = "",
        setShowDropdown,
        collapsible,
        collapsibleDefaultOpen,
    } = props;
    const renderControls = useMemo( () => buildNav( controls ), [ controls, buildNav ] );

    return (
        <ul className={ parentClasses }>
            { label ? <SidebarGroupLabel>{ `${ utils.str.toCapitalCase( label ) } ` }</SidebarGroupLabel> : <></> }
            {/* { utils.val.isValidArray( items, true ) ? renderNav : <Spinner /> } */ }
            { utils.val.isValidArray( controls, true ) ? (
                collapsible
                    ? ( <Nav.CollapsibleList { ...props } collapsible={ collapsible } collapsibleDefaultOpen={ collapsibleDefaultOpen }>{ renderControls }</Nav.CollapsibleList> )
                    : ( renderControls )
            ) : <Spinner /> }
        </ul>
    );
};

Nav.Items = Items;

const Info = ( props ) => {
    const {
        label = '',
        items,
        controls = [],
        activeItem,
        setActiveItem
    } = props;

    const navigate = useNavigate();

    const buildSidebarNavItems = ( navItems ) => {
        // console.log( "Nav :: sidebarnav :: buildSidebarnavitems :: Re-rendering: items = ", items );

        return (
            <SidebarMenu
                // { ...props }
                className={ `gap-0 p-0` }
            >
                {// utils.ao.has( nav, "items" ) ? (
                    items ? (
                        utils.val.isValidArray( items, true ) && (
                            items.map(
                                ( item, index ) => {
                                    const {
                                        title,
                                        url,
                                        target,
                                        icon,
                                        badge,
                                        active,
                                    } = item;
                                    // console.log( "sidebarNav :: title, active, url, badge = ", title, active, url, badge );

                                    let id = title ? `sidebar-nav-item-${ title }-${ index }` : `sidebar-nav-item-${ index }`;
                                    return (
                                        <SidebarMenuItem
                                            id={ id }
                                            key={ id }
                                            className={ `select-none outline-none cursor-pointer p-0 h-6 m-0 focus:outline-none` }
                                        >
                                            <SidebarMenuButton
                                                className={ `px-2 h-6 m-0 focus:outline-none` }
                                                asChild
                                                isActive={
                                                    activeItem
                                                        ? activeItem === target
                                                        : (
                                                            active
                                                                ? active
                                                                : false
                                                        )
                                                }
                                            >
                                                <div
                                                    className={ `` }
                                                    // to={ url ? `#${ url; } ` : '#' }
                                                    onClick={ () => {
                                                        if ( setActiveItem ) {
                                                            setActiveItem( target ? target : url );
                                                        }
                                                        navigate(
                                                            // url ? `#${ url; } ` : '#'
                                                            url ? url : "#"
                                                        );
                                                    } }
                                                >
                                                    {/* Show icon on nav menu item. */ }
                                                    { item?.icon && item?.icon != '' && item?.icon !== undefined ? <item.icon /> : <></> }
                                                    { title ? ( <span>{ title }</span> ) : <></> }
                                                </div>
                                            </SidebarMenuButton>
                                            { !invalid( badge ) ? <SidebarMenuBadge>{ badge }</SidebarMenuBadge> : <></> }
                                        </SidebarMenuItem>
                                    );
                                }
                            )
                        )
                    ) : ( <></> ) }
            </SidebarMenu>
        );
    };

    const renderNav = useMemo( () => buildSidebarNavItems( items ), [ items, buildSidebarNavItems ] );

    return (
        <SidebarGroup className={ `group-data-[collapsible=icon]:w-fit gap-1 p-` }>
            { label ? <SidebarGroupLabel>{ `${ utils.str.toCapitalCase( label ) } ` }</SidebarGroupLabel> : <></> }
            { label && <Nav.Label className={ `!h-auto !m-0` } label={ label } /> }

            { utils.val.isValidArray( items, true ) ? renderNav : <Spinner /> }
        </SidebarGroup>
    );
};

Nav.Info = Info;

const Dropdown = ( props ) => {
    const {
        items = [],
        controls = [],
        activeItem,
        label = '',
        maxShow = 5,
        useSearch,
        searchField,
        onClickItem,
        className,
        itemClassname,
    } = props;

    const [ showMore, setShowMore ] = useState( false );
    const [ searchContent, setSearchContent ] = useState( '' );
    const [ renderItems, setRenderItems ] = useState( items );
    /* 
        useEffect( () => {
            // setRenderItems( 
            //     utils.val.isValidArray( items, true )
            //     ? utils.ao.filterDataFast( items, { key: searchField, value: value } ) 
            //     : []
            // );
            setRenderItems(
                utils.val.isValidArray( items, true )
                    ? ( useSearch && utils.val.isValid( searchField )
                        ? ( items?.filter( ( v, i ) => {
                            if ( searchContent !== '' ) {
                                if ( v && utils.val.isObject( v ) && v?.hasOwnProperty( searchField ) ) {
                                    return String( v?.[ searchField ] )?.contains( searchContent );
                                }
                                else {
                                    return false;
                                }
                            }
                            else {
                                return true;
                            }
                        } ) )
                        : ( items )
                    )
                    : ( [] )
            );
        }, [ items ] );
     */
    const buildDropdownNavItems = ( data ) => {
        if ( utils.val.isValidArray( data, true ) ) {
            return (
                <SidebarGroupContent className={ `h-full flex flex-col justify-start items-stretch flex-grow` }>
                    { utils.val.isValidArray( data, true )
                        && ( <SidebarMenu className={ `h-full flex flex-col justify-start items-stretch flex-grow ${ className } gap-0 pl-2 w-full ` }>
                            { data?.filter( ( val, index ) => {
                                // console.log( "Val = ", val );
                                if ( useSearch && searchField !== '' && searchContent !== '' ) {
                                    if ( val && utils.val.isObject( val ) && val?.hasOwnProperty( searchField ) ) {
                                        return String( val?.[ searchField ] )?.contains( searchContent );
                                    }
                                    else { return true; }
                                }
                                else { return true; }
                            } )?.map( ( item, index ) => {
                                if ( utils.ao.has( item, 'pages' ) ) {
                                    let id = `workspaces-nav-${ item?.title }-${ index }`;
                                    let showItem = ( ( !showMore && index < maxShow ) || ( showMore ) );

                                    return (
                                        <Collapsible
                                            // className={ `${ itemClassname }` }
                                            className={ twMerge(
                                                `py-0 px-0 m-0 ${ itemClassname }`,
                                                !showItem
                                                    ? '!h-0 !opacity-0 !p-0 !m-0 !size-0'
                                                    : `h-6 opacity-100`,
                                                "transition-all duration-500 ease-in-out",
                                            ) }/* 
                                            className={ twMerge(
                                                `select-none outline-none cursor-pointer text-washed-blue-600 `,
                                                !showItem && '!hidden',
                                                itemClassname,
                                                // ( isFiltered && 'hidden' ),
                                            ) } */
                                            id={ id }
                                            key={ id }
                                        >
                                            <SidebarMenuItem
                                                className={ twMerge(
                                                    `select-none outline-none cursor-pointer text-washed-blue-600 `,
                                                    // !( ( !showMore && index < maxShow ) || ( showMore ) ) && '!hidden',
                                                    // ( isFiltered && 'hidden' ),
                                                ) }
                                            >
                                                <SidebarMenuButton
                                                    asChild
                                                    className={ ` ml-4 items-center` }
                                                >
                                                    <div className={ `w-full flex flex-row justify-stretch` }>
                                                        {/* { item?.iconId && item.iconId !== '' && ( <item.iconId className={ `` } /> ) } */ }
                                                        { item?.icon && <span className={ `!text-primary-800` }>{ item?.icon }</span> }
                                                        { item?.title && <span className={ `!text-washed-purple-700` }>{ item?.title }</span> }
                                                        { item?.detail && <span className={ `!text-primary-800` }>{ item?.detail }</span> }
                                                    </div>
                                                </SidebarMenuButton>

                                                <CollapsibleTrigger
                                                    className={ ` py-0 px-0` }
                                                    asChild
                                                >
                                                    <SidebarMenuAction
                                                        className="py-0 px-0 left-0 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                                                        showOnHover
                                                    >
                                                        <ChevronRight className={ `py-0 px-0 w-4 h-4 ` } />
                                                    </SidebarMenuAction>
                                                </CollapsibleTrigger>

                                                {/* <SidebarMenuAction showOnHover><FolderIcon /></SidebarMenuAction> */ }
                                                {/* <SidebarMenuAction showOnHover><FileIcon /></SidebarMenuAction> */ }
                                                {/* <SidebarMenuAction showOnHover><Plus /></SidebarMenuAction> */ }

                                                <CollapsibleContent>
                                                    <SidebarMenuSub
                                                        className={ `overflow-hidden gap-0 ` }
                                                    >
                                                        { item?.pages?.map( ( page, pageIndex ) => {
                                                            let showSubItem = ( ( !showMore && pageIndex < maxShow ) || ( showMore ) );
                                                            if ( utils.ao.has( page, 'pages' ) ) {
                                                                return (
                                                                    <>
                                                                        {/* <SidebarMenuAction
                                                                            className="py-0 px-0 left-0 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                                                                            showOnHover
                                                                        >
                                                                            <ChevronRight className={ `py-0 px-0 w-4 h-4 ` } />
                                                                        </SidebarMenuAction> */}
                                                                        <Nav.Dropdown
                                                                            label={ page?.title ?? `Subitem #${ index }` }
                                                                            controls={ controls }
                                                                            useSearch={ false }
                                                                            searchField={ '' }
                                                                            items={ page?.pages }
                                                                            maxShow={ maxShow }
                                                                            activeItem={ activeItem }
                                                                            className={ `!h-fit gap-1 p-0 m-0 w-full` }
                                                                            itemClassname={ `p-0 h-fit` }
                                                                            onClickItem={ onClickItem }
                                                                        />
                                                                    </>
                                                                );

                                                                // return ( buildDropdownNavItems( page?.pages ) );
                                                            }
                                                            else
                                                                return (
                                                                    <SidebarMenuSubItem
                                                                        key={ `${ page?.title }-${ pageIndex }` }
                                                                        className={ twMerge(
                                                                            `select-none outline-none cursor-pointer !text-primary-800 `,
                                                                            !showSubItem
                                                                                ? '!h-0 !opacity-0 !p-0 !m-0 !size-0'
                                                                                : `h-6 opacity-100`,
                                                                            "transition-all duration-500 ease-in-out",
                                                                            // ( isFiltered && 'hidden' ),
                                                                        ) }
                                                                    >
                                                                        {
                                                                            showSubItem && <SidebarMenuSubButton asChild>
                                                                                <div className={ `w-full flex flex-row justify-stretch` }>
                                                                                    {/* { item?.iconId && item.iconId !== '' && ( <item.iconId className={ `` } /> ) } */ }
                                                                                    { item?.icon && <span className={ `!text-primary-200` }>{ item?.icon }</span> }
                                                                                    { item?.title && <span className={ `!text-primary-800` }>{ item?.title }</span> }
                                                                                    { item?.detail && <span className={ `!text-primary-800` }>{ item?.detail }</span> }
                                                                                </div>
                                                                            </SidebarMenuSubButton>
                                                                        }
                                                                    </SidebarMenuSubItem>
                                                                );
                                                        } ) }
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }
                                else {
                                    // Instead, return a navlist. 
                                    let id = `workspaces-navlist-${ item?.title }-${ index }`;
                                    let showItem = ( ( !showMore && index < maxShow ) || ( showMore ) );
                                    return (
                                        <SidebarMenuItem
                                            id={ id }
                                            key={ id }
                                            className={ twMerge(
                                                `py-0 px-0 m-0 ${ itemClassname }`,
                                                !showItem
                                                    ? '!h-0 !opacity-0 !p-0 !m-0 !size-0'
                                                    : `h-6 opacity-100`,
                                                "transition-all duration-500 ease-in-out",
                                            ) }
                                        >
                                            <SidebarMenuButton
                                                asChild
                                                className={ `${ itemClassname } gap-y-[0.1rem] !py-2` }
                                                onClick={
                                                    () => {
                                                        console.log( "Open :: ", item );
                                                        if ( onClickItem ) { onClickItem( item ); }
                                                    }
                                                }
                                            >
                                                <div className={ `w-full flex flex-row justify-stretch` }>
                                                    {/* { item?.iconId && item.iconId !== '' && ( <item.iconId className={ `` } /> ) } */ }
                                                    { item?.icon && <span className={ `!text-primary-200` }>{ item?.icon }</span> }
                                                    { item?.title && <span className={ `!text-primary-600 w-full` }>{ item?.title }</span> }
                                                    { item?.detail && <span className={ `!text-primary-600 w-full` }>{ item?.detail }</span> }
                                                </div>
                                            </SidebarMenuButton>

                                            {/* <SidebarMenuAction showOnHover><Plus /></SidebarMenuAction> */ }
                                        </SidebarMenuItem>
                                    );
                                }
                            }
                            ) }

                            <NavShowMore
                                showMore={ showMore }
                                setShowMore={ setShowMore }
                            />
                        </SidebarMenu>
                        ) }
                </SidebarGroupContent>
            );
        }
    };

    // const renderNav = useMemo( () => buildDropdownNavItems( items ), [ items ] );
    // const renderNav = useMemo( () => buildDropdownNavItems( renderItems ), [ renderItems ] );
    const renderNav = useMemo( () => buildDropdownNavItems( items ), [ items, showMore, buildDropdownNavItems ] );

    return (
        <SidebarGroup
            className={ `relative flex min-w-0 flex-col group-data-[collapsible=icon]:w-fit gap-1 p-0 !overflow-y-auto !h-full !max-h-full !min-h-fit !p-0` }
        >

            { useSearch && searchField && (
                <Input
                    // className={ `md:w-[100px] lg:w-[300px]` }
                    className={ `w-full` }
                    placeholder={ `Search...` }
                    type={ `search` }
                    defaultValue={ searchContent }
                    onChange={ ( e ) => {
                        let { id, name, value } = e?.target;
                        if ( searchContent !== value ) {
                            setSearchContent( value );
                            // Update renderItems.
                            // setRenderItems( utils.ao.filterDataFast( items, { key: searchField, value: value } ) );
                        }
                    } }
                />
            ) }
            {/* { label ? <SidebarGroupLabel className={ `!h-auto !m-0` }>{ `${ utils.str.toCapitalCase( label ) } ` }</SidebarGroupLabel> : <></> } */ }
            { label && <Nav.Label className={ `!h-auto !m-0` } label={ label } /> }

            <div className={ `h-full w-full max-w-full overflow-auto relative !p-0` }>
                { utils.val.isValidArray( items, true ) ? renderNav : <Spinner /> }
            </div>
        </SidebarGroup>
    );
};

Nav.Dropdown = Dropdown;

// Basic nav items listing for a sidebar. 
const Side = ( props ) => {
    const {
        label = '',
        items,
        controls = [],
        activeItem, setActiveItem,
        collapseMode = 'icon', // ICON | OFFCANVAS | NONE
        labelClassNames = '',
        groupClassNames = '',
        itemClassNames = '',
        itemLabelClassNames = '',
        itemIconClassNames = '',
        itemBadgeClassNames = '',
    } = props;

    const navigate = useNavigate();

    // const [ ...items ] = utils.ao.has( nav, "items" )
    //     ? (
    //         Array.isArray( nav.items )
    //             ? nav.items
    //             : []
    //     ) : ( [] );

    // console.log( "SIDEBARNAV :: items = ", items );

    const buildSidebarNavItems = useCallback( ( navItems ) => {
        // console.log( "Nav :: sidebarnav :: buildSidebarnavitems :: Re-rendering: items = ", items );

        return (
            <SidebarMenu
                // { ...props }
                className={ `gap-0 p-0 m-0` }
            >
                {
                    // utils.ao.has( nav, "items" ) ? (
                    items ? (
                        utils.val.isValidArray( items, true ) && (
                            items.map(
                                ( item, index ) => {
                                    const {
                                        title,
                                        url,
                                        target,
                                        icon,
                                        badge,
                                        active,
                                    } = item;
                                    // console.log( "sidebarNav :: title, active, url, badge = ", title, active, url, badge );

                                    let id = title
                                        ? `sidebar-nav-item-${ title }-${ index }`
                                        : `sidebar-nav-item-${ index }`;

                                    return (
                                        <SidebarMenuItem
                                            id={ id }
                                            key={ id }
                                            className={ twMerge(
                                                `select-none outline-none cursor-pointer focus:outline-none`,
                                                `!gap-0`,

                                                collapseMode === 'icon' &&
                                                `group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-12`,

                                                collapseMode === 'none' &&
                                                `!m-0 !p-0 !py-0 !px-0 !justify-center !items-center !self-center !h-auto !max-h-14 !w-12 !max-w-full !min-w-auto`,

                                                itemClassNames,
                                            ) }
                                        >
                                            <SidebarMenuButton
                                                tooltip={ {
                                                    children: item.title,
                                                    hidden: false,
                                                } }
                                                onClick={ () => {
                                                    // if ( setActiveItem ) { setActiveItem( target ? target : url ); }
                                                    if ( setActiveItem ) { setActiveItem( target ?? url ); }
                                                    navigate( url ? url : "#" ); // url ? `#${ url; } ` : '#'
                                                } }
                                                className={ twMerge(
                                                    `select-none outline-none cursor-pointer focus:outline-none`,
                                                    `!p-0 !py-0 !px-0 !m-0`,
                                                    // `group-data-[collapsible=icon]:!justify-center`,
                                                    // `group-data-[collapsible=icon]:!items-center`,
                                                    // `group-data-[collapsible=icon]:!self-center`,
                                                    // `h-8 w-8`
                                                    collapseMode === 'icon' &&
                                                    `group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-12`,

                                                    collapseMode === 'none' && `flex !size-10 !m-0 !p-0 !py-0 !px-0 !justify-center !items-center !self-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-12 !h-12 !max-h-14 !w-12 !max-w-full !min-w-auto`,

                                                    itemClassNames,
                                                ) }
                                                asChild
                                                isActive={
                                                    activeItem === target
                                                }
                                            >
                                                <div
                                                    className={ twMerge(
                                                        `select-none outline-none cursor-pointer focus:outline-none `,
                                                        collapseMode === 'icon' && `group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!justify-center group-[collapsible=icon]:!justify-center`,

                                                        collapseMode === 'none' && `flex items-center !size-10 !w-full`,
                                                        // `group-data-[collapsible=icon]:!h-8`,
                                                        // `group-data-[collapsible=icon]:!w-8`,
                                                        // `group-data-[collapsible=icon]:!p-1`,
                                                        // `group-data-[collapsible=icon]:!p-0`,
                                                        // `group-data-[collapsible=icon]:!h-full`,
                                                        // `p-0 px-2 m-0`,
                                                        // `group-data-[collapsible=icon]:!size-10`,
                                                        // `group-data-[collapsible=icon]:!w-full`,
                                                        // `group-data-[collapsible=icon]:!justify-center group-[collapsible=icon]:!justify-center`,
                                                    ) }
                                                // className={ twMerge(
                                                //     `select-none outline-none cursor-pointer focus:outline-none`,
                                                //     // `group-data-[collapsible=icon]:!self-center`,
                                                // ) }
                                                // to={ url ? `#${ url; } ` : '#' }
                                                >
                                                    {/* Show icon on nav menu item. */ }
                                                    { item?.icon
                                                        && item?.icon != ''
                                                        && item?.icon !== undefined
                                                        ? ( <item.icon
                                                            className={ twMerge(
                                                                `select-none outline-none cursor-pointer focus:outline-none`,
                                                                collapseMode === 'icon' &&
                                                                `group-data-[collapsible=icon]:!w-[--collapsed-icon-width] group-data-[collapsible=icon]:!h-[--collapsed-icon-height] group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!px-1 group-data-[collapsible=icon]:!stroke-primary-200 group-data-[collapsible=icon]:!stroke-1`,

                                                                collapseMode === 'none' &&
                                                                `select-none outline-none cursor-pointer focus:outline-none !size-fit !w-[--collapsed-icon-width] !h-[--collapsed-icon-height] !py-1 !px-1 !stroke-muted-foreground !stroke-1`,

                                                                itemIconClassNames,
                                                            ) }
                                                            style={ {
                                                                // '--collapsed-icon-width': `${ NAV_ICON_WIDTH }rem`,
                                                                // '--collapsed-icon-height': `${ NAV_ICON_HEIGHT }rem`,
                                                                maxWidth: '100%',
                                                            } }
                                                        /> )
                                                        : <></>
                                                    }
                                                    { title
                                                        ? (
                                                            <span className={ twMerge(
                                                                `group-data-[collapsible=icon]:hidden`,
                                                                `group-data-[collapsible=none]:hidden`,
                                                                `h-full w-full flex items-center`,
                                                                `text-sm !font-extralight`,
                                                                itemLabelClassNames,
                                                            ) }>
                                                                { title }
                                                            </span>
                                                        )
                                                        : <></>
                                                    }
                                                </div>
                                            </SidebarMenuButton>
                                            { !invalid( badge ) ? <SidebarMenuBadge
                                                className={ twMerge(
                                                    `absolute right-0 max-h-4 bg-bodyprimary rounded-full text-white font-bold self-center justify-center items-center !max-w-md h-fit m-1 !p-1 group-data-[collapsible=none]:!block`,
                                                    itemBadgeClassNames,
                                                ) }
                                            >{ badge }</SidebarMenuBadge> : <></> }
                                        </SidebarMenuItem>
                                    );
                                }
                            )
                        )
                    ) : (
                        <></>
                    )
                }
            </SidebarMenu>
        );
    }, [ items ] );

    const renderNav = useMemo( () => buildSidebarNavItems( items ), [ items, buildSidebarNavItems ] );

    return (
        <SidebarGroup
            className={ twMerge(
                collapseMode === 'icon' && `!p-0 justify-center items-center self-center h-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!items-center group-data-[collapsible=icon]:!self-center`,

                collapseMode === 'none' && `!p-0 !w-full !justify-center !items-center !self-center`,
                groupClassNames
            ) }
        >
            { label && <Nav.Label label={ label } /> }

            { utils.val.isValidArray( items, true ) ? renderNav : <Spinner /> }
        </SidebarGroup>
    );
};

Nav.Side = Side;

// Basic, generic list of nav items
const List = ( props ) => {
    const {
        label,
        items = [],
        selectedItem = null,
        controls = [],
        maxShow = 5,
        onClickItem = () => { },
        onDoubleClickItem = () => { },
        useSearch = false,
        searchField,
        useSort = false,
        sortField,
        sortFunc,
        className = '',
        itemClassname = '',
        itemIconClassNames = '',
        collapsible,
        collapsibleDefaultOpen,
        useDropdownControls = false,
        loadingType = 'dots',
        useLoader = true,
        showSubtitle = false,
        showSubtitleKey,
        subtitleRender = ( item ) => { },
    } = props;

    /*  // The schema for controls is as follows: 
        {
            enabled: true,
            index: 0,
            id: '',
            key: '',
            type: 'button',
            shortcut?: '',
            name: "home",
            label: "Home",
            link: '/',
            icon: <FaSwatchbook className="fa fa-2x control-button-icon icon" />,
            classes: `control-list-item`,
            onClick: ( e ) => { },
            useTooltip: true,
            tooltipInfo: '',
            controls?: [ list of sub-items if type === 'group' ],
            disabled?: true/false,
            inset?: true/false,
        }
    */

    const { isMobile } = useSidebar();
    const [ showMore, setShowMore ] = useState( false );
    const [ sortAscending, setSortAscending ] = useState( false );
    const [ filters, setFilters ] = useState( null );
    const [ searchContent, setSearchContent ] = useState( '' );
    const [ renderItems, setRenderItems ] = useState( items );
    sortAscending;
    const buildItemContextMenu =
        useCallback(
            ( controls, item, index, children ) => {
                // console.log( "Nav :: nav.js :: buildItemContextMenu :: Re-rendering: item = ", item, " :: ", "controls = ", controls );
                let id = item?.title
                    ? `nav-list-item-${ item?.title }-${ index }`
                    : `nav-list-item-${ 'noname' }-${ index }`;
                return (
                    <GenericContextMenu
                        id={ id }
                        key={ id }
                        className={ `select-none outline-none cursor-pointer p-0 h-6 m-0 focus:outline-none` }
                        refItemData={ item }
                        controls={ controls }
                    >
                        { children ? ( children ) : ( <MoreHorizontalIcon /> ) }
                    </GenericContextMenu>
                );
            }
            , [ items ] );

    const buildButtonDropdown = useCallback( ( item, controls ) => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        showOnHover
                        className={ `select-none outline-none cursor-pointer` }
                    >
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56 rounded-lg"
                    side={ isMobile ? "bottom" : "right" }
                    align={ isMobile ? "end" : "start" }
                >
                    <DropdownMenuItem
                        onClick={
                            () => {
                                console.log( "Remove :: ", item );
                            }
                        }
                    >
                        <StarOff className="text-muted-foreground" />
                        <span>{ `Remove from ${ utils.str.toCapitalCase( item?.title ) } ` }</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={ () => { console.log( "Copy :: ", item ); } }
                    >
                        <Link2Icon className="text-muted-foreground" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={
                            () => {
                                console.log( "Nav.List :: onClick :: item = ", item );
                                if ( onClickItem ) { onClickItem( item ); }
                            }
                        }
                    >
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={ () => { console.log( "Delete :: ", item ); } }
                    >
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }, [ items, selectedItem ] );

    const searchFilterPredicate = ( val, index ) => {
        // console.log( "Val = ", val, " :: ", "val?.[searchField] = ", val?.[ searchField ] );
        if ( useSearch && searchField !== '' && searchContent !== '' ) {
            if ( val && utils.val.isObject( val ) && val?.hasOwnProperty( searchField ) ) {
                let fieldValue = val?.[ searchField ];
                return fieldValue.toString()?.contains( searchContent );
            }
            else { return true; }
        }
        else { return true; }
    };

    const sortPredicate = ( navItems ) => (
        ( useSort === true && navItems && utils.val.isValidArray( navItems, true )
            && utils.val.isDefined( sortField )
            && navItems[ 0 ]?.hasOwnProperty( 'sortField' )
        )
            ? ( navItems.sort( ( a, b ) => (
                sortAscending
                    ? ( Number( a?.[ sortField ] ) - Number( b?.[ sortField ] ) )
                    : ( Number( b?.[ sortField ] ) - Number( a?.[ sortField ] ) )
            ) ) )
            : ( navItems )
    );

    const buildSidebarNavItems = useCallback( ( navItems ) => {
        // console.log( "Nav :: sidebarnav :: buildSidebarnavitems :: Re-rendering: items = ", items );

        if ( useSort ) {
            navItems = navItems?.sort( sortPredicate
                /* ( a, b ) => (
                sortAscending
                    ? ( Number( a?.[ sortField ] ) - Number( b?.[ sortField ] ) )
                    : ( Number( b?.[ sortField ] ) - Number( a?.[ sortField ] ) )
            ) */ );
        }

        return (
            <SidebarMenu
                className={ `!gap-0 p-0 m-0 !w-full h-full overflow-y-auto ${ className }` }
            >
                { utils.val.isValidArray( navItems, true )
                    ? navItems?.sort( sortPredicate )?.map( ( item, index ) => {
                        // const {
                        //     title,
                        //     url,
                        //     target,
                        //     icon,
                        //     badge,
                        //     active,
                        // } = item;
                        // let id = title ? `sidebar-nav-item-${ title }-${ index }` : `sidebar-nav-item-${ index }`;
                        // if ( ( !showMore && index < maxShow ) || ( showMore ) ) {
                        let title = item?.title ? item?.title : 'N/A';
                        // let subtitle = ( showSubtitle === true && showSubtitleKey !== '' && item?.hasOwnProperty( showSubtitleKey ) ? item?.[ showSubtitleKey ] : 'N/A' );
                        let subtitle = ( showSubtitle === true && subtitleRender ? subtitleRender( item ) : 'N/A' );
                        let id = `navlist-${ index }-${ item?.title }`;
                        let isFiltered = false;
                        if ( useSearch
                            && searchContent !== ''
                            && searchField !== '' ) {
                            if ( item?.hasOwnProperty( searchField ) ) {
                                let fieldValue = item?.[ searchField ].toString();
                                if ( utils.val.isValid( fieldValue ) ) {
                                    isFiltered = !JSON.stringify( fieldValue ).toLowerCase().includes( searchContent );
                                }
                            }
                        }

                        let showItem = ( ( !showMore && index < maxShow ) || ( showMore ) );

                        // console.log( "item = ", item, " :: ", " item?.[ searchField ] = ", item?.[ searchField ], " :: ", "isFiltered = ", isFiltered );
                        let element = (
                            <SidebarMenuItem
                                id={ id }
                                key={ id }
                                className={ twMerge(
                                    `w-full !p-0 !m-0 opacity-100`,
                                    `select-none outline-none cursor-pointer`,
                                    ( !showItem || isFiltered )
                                        ? '!opacity-0 !h-0 !size-0 !border-none !px-0 !py-0'
                                        : `!opacity-100 !h-auto`,
                                    "transition-all duration-500 ease-in-out",
                                    selectedItem?._id === item?._id ? `outline border` : ``,
                                    `!bg-transparent !outline-none !outline-transparent`,
                                ) }
                                onClick={ ( e ) => { e.preventDefault(); if ( onClickItem ) { onClickItem( item ); } } }
                                onDoubleClick={
                                    () => {
                                        console.log( "Nav.List :: onDoubleClick :: item = ", item );
                                        if ( onDoubleClickItem ) { onDoubleClickItem( item ); }
                                    } }
                            >
                                <SidebarMenuButton
                                    asChild
                                    className={ `!p-0 !m-0 w-full !h-auto ${ itemClassname }` }
                                >
                                    <div
                                        className={ `p-0 m-0 w-full` }
                                        key={ item?.title }
                                    >
                                        <div
                                            className={ `p-0 m-0 w-full flex-row justify-around items-center h-content` }
                                            key={ item?.title }
                                        >
                                            {/* <File className={ `w-1/12 stroke-1 aspect-square p-0 m-0 text-xs mx-2` } /> */ }
                                            { item?.icon
                                                && item?.icon != ''
                                                && item?.icon !== undefined
                                                ? ( <item.icon
                                                    className={ twMerge(
                                                        `select-none outline-none cursor-pointer focus:outline-none`,
                                                        itemIconClassNames,
                                                    ) }
                                                    style={ {
                                                        // '--collapsed-icon-width': `${ NAV_ICON_WIDTH }rem`,
                                                        // '--collapsed-icon-height': `${ NAV_ICON_HEIGHT }rem`,
                                                        maxWidth: '100%',
                                                    } }
                                                /> )
                                                : <></>
                                            }
                                            <div className={ `flex flex-col w-10/12` }>
                                                <span className={ `overflow-hidden text-ellipsis text-muted-foreground h-min text-nowrap` }>{ item?.title }</span>
                                                { showSubtitle === true && showSubtitleKey !== '' && subtitle !== 'N/A' && (
                                                    <span className={ `font-thin w-full overflow-hidden text-ellipsis max-w-full text-muted-foreground text-nowrap` }>{ subtitle }</span>
                                                ) }
                                            </div>
                                        </div>
                                    </div>
                                </SidebarMenuButton>
                                { buildButtonDropdown === true && utils.val.isValidArray( controls, true ) && buildButtonDropdown( item, controls ) }
                            </SidebarMenuItem>
                        );

                        if ( utils.val.isValidArray( controls, true ) ) {
                            return ( buildItemContextMenu( controls, item, index, element ) );
                        }
                        else { return ( element ); }
                        // }
                        // else { return ( <></> ); }
                    } )
                    : <></> }
                { items?.length > maxShow && (
                    <NavShowMore
                        showMore={ showMore }
                        setShowMore={ setShowMore }
                    />
                ) }
            </SidebarMenu>
        );
    }, [
        items,
        showMore,
        searchContent,
        sortAscending,
        // ...[ ( useSort ? sortAscending : [] ) ]
    ] );

    const renderNav = useMemo( () => buildSidebarNavItems( items ), [ items, showMore, searchContent, buildSidebarNavItems ] );

    return (
        <SidebarGroup className={ `group-data-[collapsible=icon]:w-fit !p-0 !overflow-y-auto h-auto` }>
            { utils.val.isValidArray( items, true ) && ( useSearch && searchContent || true )
                ? <Nav.CollapsibleList { ...props } collapsible={ collapsible } collapsibleDefaultOpen={ collapsibleDefaultOpen }>

                    { ( useSearch || useSort ) && (
                        <div className={ `flex-row w-full h-full justify-stretch items-center p-0` }>
                            { useSearch && searchField && (
                                <Input
                                    // className={ `md:w-[100px] lg:w-[300px]` }
                                    className={ `w-full !h-6` }
                                    placeholder={ `Search...` }
                                    type={ `search` }
                                    defaultValue={ searchContent }
                                    onChange={ ( e ) => {
                                        let { id, name, value } = e?.target;
                                        if ( searchContent !== value ) {
                                            setSearchContent( value );
                                            // console.log( "Nav.List :: setSearchContent :: value = ", value, " :: ", "results = ", utils.ao.filterDataFast( items, [ { key: searchField, value: value } ] ) );
                                            // Update renderItems.
                                            // setRenderItems( utils.ao.filterDataFast( items, { key: searchField, value: value } ) );
                                        }
                                    } }
                                />
                            ) }
                            { useSort && sortField && (
                                <Button
                                    variant={ `outline` }
                                    size={ `xs` }
                                    className={ `flex flex-grow !h-6` }
                                    onClick={ () => setSortAscending( !sortAscending ) }
                                >
                                    { sortAscending ? <ArrowBigDown /> : <ArrowBigUp /> }
                                </Button>
                            ) }
                        </div>
                    ) }

                    { label && collapsible === false && <Nav.Label label={ label } /> }

                    { renderNav }
                </Nav.CollapsibleList>
                : ( useLoader === true ? <Spinner
                    variant={ loadingType }
                    size={ 'md' }
                    color={ 'currentColor' }
                    overlay={ false }
                /> : <></> )
            }
        </SidebarGroup>
    );
};

Nav.List = List;

const NavLabel = ( { label, className } ) => {
    return (
        <>
            { utils.val.isDefined( label ) && (
                <SidebarGroupLabel className={ `justify-between leading-4 text-base !p-0 ${ className }` }>
                    { utils.val.isString( label ) ? <div className={ `leading-4 text-center text-secondary-500` }>{ `${ utils.str.toCapitalCase( label ) }` }</div> : label }
                </SidebarGroupLabel>
            ) }
        </>
    );
};

Nav.Label = NavLabel;

const NavShowMore = ( props ) => {
    const {
        showMore,
        setShowMore
    } = props;

    return (
        <>
            { showMore !== undefined
                && showMore !== null
                && setShowMore
                && (
                    <SidebarMenuItem
                        className={ `text-sidebar-foreground/70 justify-center items-center w-full bg-sidebar-accent p-0 m-0 h-6 ${ showMore ? '' : '' } bottom-0 right-0 left-0 overflow-hidden` }
                    >
                        <SidebarMenuButton
                            className={ `text-sidebar-foreground/70 w-full p-0 m-0 h-7 bottom-0` }
                            onClick={ () => { setShowMore( !showMore ); } }
                        >
                            <MoreHorizontal />
                            <span className={ `m-0 p-0` }>{
                                showMore
                                    ? ( `Less` )
                                    : ( `More` )
                            }</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ) }
        </>
    );
};

// List of nav items in a dropdown select input field. 
const Switcher = ( props ) => {
    const {
        items = [],
        active = {},
        label = '',
        useToggle = false,
        keyMatches = {},
        onSetActive = () => { },
        renderFooter,
    } = props;

    const [ activeItem, setActiveItem ] = useState(
        active ? ( active ) : (
            utils.val.isValidArray( items, true )
                ? ( items[ 0 ] )
                : { title: 'No item selected', icon: '' }
        )
    );

    /*  Schema: {
            id: ws?._id,
            title: ws?.title,
            logo: ws?.logo,
            icon: ws?.icon,
            plan: 'Default',
            ...ws,
        };
    */

    const buildSwitcherNav = useCallback( ( items ) => {
        if ( items ) {
            return (
                <SidebarMenu
                    className={ `w-full !p-0 m-0 inline` }
                >
                    { !items && <></> }
                    {/* { !items && <Spinner /> } */ }
                    { items && (
                        <SidebarMenuItem
                            className={ `w-full p-0` }
                        >
                            <DropdownMenu
                                className={ `w-full p-0` }
                            >
                                <DropdownMenuTrigger
                                    className={ `w-full p-0` }
                                    asChild
                                >
                                    <SidebarMenuButton
                                        className={ `w-full p-0 m-0 flex flex-row justify-stretch items-center` }
                                    >
                                        { activeItem?.icon && activeItem.icon != "" && <activeItem.icon className="size-3" /> }
                                        {
                                            // <Icon name={ activeItem?.logo } className={ `size-3` } />
                                        }
                                        <span className="truncate font-semibold px-2">
                                            { active ? active?.title : ( label ? label : '' ) }
                                        </span>
                                        <ChevronDown className="opacity-50" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 rounded-lg"
                                    align="start"
                                    side="bottom"
                                    sideOffset={ 4 }
                                >
                                    { ( utils.val.isObject( active ) || label !== '' ) && (
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                            { active ? active?.title : ( label ? label : '' ) }
                                        </DropdownMenuLabel>
                                    ) }
                                    { items.map( ( item, index ) => {
                                        // Uese the keymatching property to get the right data value.

                                        let data = {};
                                        if ( keyMatches[ 'title' ] ) {
                                            let keyname = keyMatches[ 'title' ];
                                            data.title = item[ keyname ];
                                        }
                                        if ( keyMatches[ 'icon' ] ) {
                                            let keyname = keyMatches[ 'icon' ];
                                            data.icon = item[ keyname ];
                                        }
                                        let id = `dropdown-nav-item-${ data?.title }-${ index }`;
                                        return (
                                            <DropdownMenuItem
                                                id={ id }
                                                key={ id }
                                                onClick={ () => {
                                                    setActiveItem( item );
                                                    if ( onSetActive ) {
                                                        onSetActive( item );
                                                    }
                                                } }
                                                className={ `gap-2 py-2 px-1 ${ active?._id === item?._id ? 'border border-muted' : '' }` }>
                                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                                    { data?.icon ? <data.icon className="size-4 shrink-0" /> : <></> }
                                                </div>
                                                { data?.title }
                                                <DropdownMenuShortcut>⌘{ index + 1 }</DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        );
                                    } ) }
                                    { renderFooter && ( <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="gap-2 py-2 px-1">
                                            { renderFooter }
                                        </DropdownMenuItem>
                                    </> ) }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    ) }
                </SidebarMenu>
            );
        }
    }, [ items ] );

    const renderSwitcherNav = () => useMemo( () => buildSwitcherNav( items ), [ items, buildSwitcherNav ] );

    return (
        <>
            { utils.val.isValidArray( items, true ) && renderSwitcherNav() }
        </>
    );
};

Nav.Switcher = Switcher;

// Collapsible nav list
const Collapse = ( props ) => {
    const {
        label = '',
        items = [],
        controls = [],
        maxShow = 5,
        onClickItem,
    } = props;

    return (
        <SidebarGroup className={ `!w-full !p-0` }>
            {/* <SidebarGroupLabel>{ utils.str.toCapitalCase( label ) }</SidebarGroupLabel> */ }
            { label && <Nav.Label className={ `` } label={ label } /> }

            <SidebarGroupContent className={ `!w-full !p-0` }>
                <SidebarMenu>
                    { utils.val.isValidArray( items, true ) && items.map( ( item, index ) => {
                        let id = `sidebar-collapsible-menu-item-${ item?.title ? item?.title : '' }-${ index }`;
                        if ( utils.ao.has( item, 'pages' ) ) {
                            return (
                                <Collapsible
                                    // key={ item?.name }
                                    id={ id }
                                    key={ id }
                                >
                                    <SidebarMenuItem
                                        className={ `py-0 px-0` }
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            className={ `py-0 px-0` }
                                        >
                                            <a href="#">
                                                <span>{ item?.emoji }</span>
                                                <span>{ item?.title }</span>
                                            </a>
                                        </SidebarMenuButton>

                                        <CollapsibleTrigger
                                            className={ `py-0 px-0` }
                                            asChild
                                        >
                                            <SidebarMenuAction
                                                className="py-0 px-0 left-0 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                                                showOnHover
                                            >
                                                <ChevronRight
                                                    className={ `py-0 px-0 w-4 h-4 ` }
                                                />
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>

                                        <SidebarMenuAction showOnHover>
                                            <Plus />
                                        </SidebarMenuAction>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                { item.pages.map( ( page, pageIndex ) => {
                                                    let page_id = `sidebar-collapsible-menu-item-${ item?.title ? item?.title : '' }-${ index }-page-${ pageIndex }`;
                                                    return (
                                                        <SidebarMenuSubItem
                                                            // key={ page?.name }
                                                            id={ page_id }
                                                            key={ page_id }
                                                        >
                                                            <SidebarMenuSubButton asChild>
                                                                <a href="#">
                                                                    <span>{ page?.icon ?? page?.emoji }</span>
                                                                    <span>{ page?.title }</span>
                                                                </a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                } ) }
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        }
                        else {
                            // Instead, return a navlist. 
                            return (
                                <SidebarMenuItem
                                    id={ id }
                                    key={ id }
                                    // key={ item?.name }
                                    className={ `py-0 px-0` }
                                >
                                    <SidebarMenuButton
                                        asChild
                                        className={ `py-0 px-0` }
                                    >
                                        <a href="#">
                                            <span>{ item?.emoji }</span>
                                            <span>{ item?.title }</span>
                                        </a>
                                    </SidebarMenuButton>

                                    <SidebarMenuAction showOnHover>
                                        <Plus />
                                    </SidebarMenuAction>
                                </SidebarMenuItem>
                            );
                        }
                    }
                    ) }

                    <NavShowMore
                        showMore={ showMore }
                        setShowMore={ setShowMore }
                    />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

Nav.Collapse = Collapse;

// N-Nested directory tree ideal for file system displays and bulleted point lists with arbitrary levels of indentation.
const Context = ( props ) => {
    const {
        label,
        headerBtns,
        controls,
        items,
        children, // Filled in by the actual button itself. 
    } = props;

    // console.log( "NavDirectory :: items = ", items );
    const renderContextItems = useMemo( () => buildContextItems( items ), [ items, buildContextItems ] );
    const renderHeaderBtns = useMemo( () => buildNav( headerBtns ), [ headerBtns, buildNav ] );

    return (
        <SidebarGroup className={ `sidebar-nav-header group-data-[collapsible=icon]:w-fit p-0 text-nowrap whitespace-nowrap overflow-ellipsis ` }>
            <SidebarGroupContent className={ `items-center justify-stretch flex flex-row flex-nowrap h-auto px-1` }>
                {/* { label && (
                    <div className={ `sidebar-nav-header-label h-full w-full` }>
                        <SidebarGroupLabel className={ ` h-full w-full` }>{ label }</SidebarGroupLabel>
                    </div>
                ) } */}
                { label && <Nav.Label className={ `h-full w-full` } label={ label } /> }


                { utils.val.isValidArray( headerBtns, true ) && (
                    <SidebarGroupAction className={ `p-0 m-0 h-full relative top-0 right-0 w-auto` }>
                        <div className={ `sidebar-nav-header-controls h-full w-full` }>
                            {/* { buildNav( headerBtns ) } */ }
                            { renderHeaderBtns() }
                        </div>
                    </SidebarGroupAction>
                ) }

                { items && utils.val.isValidArray( items, true )
                    // ? ( renderContextItems( items ) )
                    ? ( renderContextItems() )
                    : ( <DropdownMenuLabel className="text-xs text-muted-foreground">
                        { `There are no items to show. ` }
                    </DropdownMenuLabel> ) }

            </SidebarGroupContent>

        </SidebarGroup>
    );
};

Nav.Context = Context;

// Nav items specific to a user management dropdown, typically housed above a sidebar or in a sidebar's header. 
const User = ( props ) => {
    const {
        user,
        nav,
        onRender,
        header,
        footer,
    } = props;

    const { isMobile } = useSidebar();

    const buildGroupNavItem = useCallback( ( nav ) => {
        if ( utils.ao.has( nav, 'nav' ) ) {
            let groupNavElements = [];
            let groupNav = nav?.nav;
            // console.log( 'buildGroupNavItem :: groupNav = ', groupNav );
            groupNav.forEach( ( groupNavItem, groupNavIndex ) => {
                // const n = buildNav( groupNavItem, groupNavIndex );
                // const n = buildNav( groupNavItem, `sidebar-group-nav`, `sidebar-group-nav-item` );
                groupNavElements.push( buildNav( groupNavItem, `sidebar-group-nav`, `sidebar-group-nav-item` ) );
            } );

            // buildNav( groupNav, `sidebar-group-nav`, `sidebar-group-nav-item` )
            return ( <DropdownMenuGroup>
                { groupNavElements }
            </DropdownMenuGroup>
            );
        }
        else {
            return ( <></> );
        }
    }, [ nav, user ] );

    const buildNavDropdownItem = useCallback( ( nav, index ) => {
        if ( nav ) {
            let id = `nav-dropdown-item-${ nav?.label }-${ index }`;
            if ( nav?.type === 'separator' ) {
                return (
                    <DropdownMenuSeparator
                        id={ id }
                        key={ id }
                    />
                );
            }
            if ( nav?.type === 'group' ) {
                if ( utils.ao.has( nav, 'nav' ) ) {
                    return buildGroupNavItem( nav );
                }
            }
            else if ( nav?.type === 'render' ) {
                if ( utils.ao.has( nav, 'onRender' ) ) {
                    return nav.onRender( user );
                }
            }
            else if ( nav?.type === 'button' ) {
                return (
                    <DropdownMenuGroup
                        id={ id }
                        key={ id }
                    >
                        <DropdownMenuItem
                            onClick={ () => {
                                if ( nav?.onClick ) {
                                    nav.onClick();
                                }
                            } }
                        >
                            {/* { nav?.logo && <img src={ nav?.logo } height={ `0.125rem` } width={ `0.125rem` } /> } */ }
                            { nav?.icon && nav?.icon != "" && (
                                nav.icon
                                // <nav.icon className={ `` } />
                            ) }
                            { nav?.label && nav?.label }
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                );
            }
            else { return ( <></> ); }
        }
        else { return ( <></> ); }
    }, [ nav, user ] );

    const buildUserMenu = useCallback( ( user ) => {
        if ( user ) {
            // utils.rand.rand( 1e6, 0 ) 
            let id = `nav-user-menu-dropdown-item-${ user?.id }`;
            return (
                <DropdownMenu
                    className={ `w-auto h-auto p-0 m-0` }
                >
                    <DropdownMenuTrigger
                        key={ `${ id }-trigger` }
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground items-center !px-0 !self-center"
                        asChild
                    >
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground items-center justify-center !px-0 !p-0 !self-center rounded-full aspect-square max-h-full max-w-full"
                        >
                            <UserCircle className={ `aspect-square max-h-full max-w-full w-full rounded-full self-center items-center justify-center !size-12 !p-0 !stroke-[0.05rem]` } />

                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        key={ `${ id }-content` }
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={ isMobile ? "bottom" : "right" }
                        align="start"
                        sideOffset={ 4 }
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-10 w-10 rounded-full">
                                    <AvatarImage src={ user?.avatar } alt={ user?.name } />
                                    <AvatarFallback className="rounded-lg"><FaUserGear className={ `min-h-6 min-w-6 p-0` } /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 text-left text-sm leading-tight flex-col">
                                    <span className="truncate font-semibold">{ user?.display_name || user?.username || user?.name }</span>
                                    <span className="truncate text-xs text-muted-foreground">{ user?.email }</span>
                                </div>
                                {/* <div className="flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{ user?.name }</span>
                                    <span className="truncate text-xs">{ user?.email }</span>
                                </div> */}
                            </div>
                        </DropdownMenuLabel>

                        { utils.val.isValidArray( nav?.nav, true ) && (
                            nav?.nav?.map( ( item, index ) => {
                                // const userNavElements = buildNav( item, index );
                                return (
                                    <>
                                        { buildNavDropdownItem( item, index ) }
                                    </>
                                );
                            } )
                        ) }

                    </DropdownMenuContent>
                </DropdownMenu >
            );
        }
    }, [ user ] );

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                { utils.val.isObject( user ) && ( buildUserMenu( user ) ) }
            </SidebarMenuItem>

        </SidebarMenu>
    );
};

Nav.User = User;

// N-Nested directory tree ideal for file system displays and bulleted point lists with arbitrary levels of indentation.
const Directory = ( props ) => {
    const {
        label,
        controls,
        items,
        headerBtns,
    } = props;

    // console.log( "NavDirectory :: items = ", items );

    return (
        <SidebarGroup className={ `sidebar-nav-header group-data-[collapsible=icon]:hidden p-0 text-nowrap whitespace-nowrap overflow-ellipsis ` }>
            <SidebarGroupContent className={ `items-center justify-stretch flex flex-row flex-nowrap h-auto px-1` }>

                { label && (
                    <div className={ `sidebar-nav-header-label h-full w-full` }>
                        <SidebarGroupLabel className={ ` h-full w-full` }>
                            { label }
                        </SidebarGroupLabel>
                    </div>
                ) }

                { utils.val.isValidArray( headerBtns, true ) && (
                    <SidebarGroupAction className={ `p-0 m-0 h-full relative top-0 right-0 w-auto` }>
                        <div className={ `sidebar-nav-header-controls h-full w-full` }>
                            { buildNav( headerBtns ) }
                        </div>
                    </SidebarGroupAction>
                ) }

            </SidebarGroupContent>

            { items && utils.val.isValidArray( items, true )
                ? ( <SidebarGroupContent>
                    <SidebarMenu>
                        <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-start items-stretch w-full h-full px-2 py-2` }>
                            <Droplist
                                label={ label || 'Nav Directory Tree' }
                                data={ items }
                                layout={ "default" }
                                display={ "block" }
                                flexDirection={ "column" }
                                fillArea={ true }
                                height={ "auto" }
                                width={ "auto" }
                                showControls={ true }
                                expandable={ true }
                                compact={ true }
                                collapse={ false }
                                classes={ "" }
                                styles={ { width: `100%` } }
                                debug={ false }
                            />
                        </ul>
                    </SidebarMenu>
                </SidebarGroupContent> )
                : ( <DropdownMenuLabel className="text-xs text-muted-foreground">
                    { `There are no items to show. ` }
                </DropdownMenuLabel> )
            }
        </SidebarGroup>
    );
};

Nav.Directory = Directory;

const CollapsibleList = ( { label, collapsible = true, collapsibleDefaultOpen = false, open, setOpen, children } ) => {
    const [ isOpen, setIsOpen ] = useState( true );
    return (
        collapsible
            ? (
                <React.Fragment key={ `nav-collapsible-menu-dropdown` }>
                    <SidebarGroup
                        className={ `group-data-[collapsible=icon]:w-full` }
                    >
                        <Collapsible defaultOpen={ collapsibleDefaultOpen ? collapsibleDefaultOpen : isOpen } className="group/collapsible w-full">
                            <SidebarGroupLabel
                                asChild
                                className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <CollapsibleTrigger className={ `h-auto w-full !p-0 !m-0` }>
                                    <div className={ `h-auto w-full text-sm text-primary-600 align-text-bottom font-sans font-extrabold px-2` }>
                                        <Nav.Label label={ label } className={ `w-full` } />
                                    </div>
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        { children }
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                    <SidebarSeparator className="mx-0" />
                </React.Fragment>
            )
            : ( children )
    );
};

Nav.CollapsibleList = CollapsibleList;

export default Nav;

/* { user?.avatar !== ''
        ? (
            <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground items-center !px-0 !self-center rounded-full aspect-square max-h-full max-w-full h-10 w-full rounded-full self-center items-center justify-center border"
            >
                
                <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage src={ user?.avatar } alt={ user?.name } />
                    <AvatarFallback className="rounded-lg">{ user?.name }</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{ user?.name }</span>
                    <span className="truncate text-xs">{ user?.email }</span>
                </div> 
                <UserCircle className={ `aspect-square max-h-full max-w-full h-10 w-full rounded-full self-center items-center justify-center border` } />

            </SidebarMenuButton>
        )
        : (
            <UserCircle className={ `aspect-square max-h-full max-w-full h-10 w-full rounded-full self-center items-center justify-center size-4 border` } />
        )
    } 
*/
