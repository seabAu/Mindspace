import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react";

// Use absolute imports with @/ prefix
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CONTENT_HEADER_HEIGHT, SIDEBAR_WIDTH_ICON, SIDEBAR_WIDTH_LEFT, SIDEBAR_WIDTH_RIGHT } from '@/lib/config/constants';
import { twMerge } from 'tailwind-merge';

export function NestedSidebarWrapper ( props ) {
    const {
        side = 'left',
        openSidebar = true,
        setOpenSidebar = () => { },
        sidebarWidth,
        keyboardShortcut = 'ctrl+b',
        resizable = false,
        // containerClassNames,
        // nav = [], // Icons-sidebar nav/header items
        // navClassNames,
        // header = [], // Icons-sidebar content items
        // headerClassNames,
        // footer = [], // Icons-sidebar footer items
        // footerClassNames,
        // contentSidebarHeader = [],
        // contentSidebarHeaderClassNames,
        // contentSidebarContent = [],
        // contentSidebarContentClassNames,
        // userData = {},
        // useMobileDialog = false,
        children,
    } = props;

    const [ useMobileDialog, setUseMobileDialog ] = useState( false );

    // const [ contentItems, setContentItems ] = useState( generateContentItems( 10 ) );

    let sidebarStyle = {
        '--sidebar-width':
            ( resizable
                ? ( `${ sidebarWidth + SIDEBAR_WIDTH_ICON }rem` )
                : ( side === 'right'
                    ? ( `${ SIDEBAR_WIDTH_RIGHT + SIDEBAR_WIDTH_ICON }rem` )
                    : ( side === 'left'
                        ? ( `${ SIDEBAR_WIDTH_LEFT + SIDEBAR_WIDTH_ICON }rem` )
                        : ( `${ SIDEBAR_WIDTH_LEFT + SIDEBAR_WIDTH_ICON }rem` )
                    )
                ) ),
        '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
    };

    return (
        <>
            <SidebarProvider
                side={ side }
                style={ {
                    ...sidebarStyle,
                    // '--dash-width': `100vw`,
                    // width: `calc(${ 100 }vw-${ SIDEBAR_WIDTH_LEFT + SIDEBAR_WIDTH_ICON }rem)`
                } }
                // defaultOpen={ openSidebar }
                defaultOpen={ openSidebar && children !== null }
                // open={ openSidebar }
                // onOpenChange={ setOpenSidebar }
                // state={ openSidebar ? 'expanded' : 'collapsed' }
                // className={ twMerge( `w-[--dash-width] max-w-[--dash-width] min-w-[--dash-width] !overflow-auto`, containerClassNames ) }
                keyboardShortcut={
                    keyboardShortcut
                        ? keyboardShortcut
                        : ( side === 'right'
                            ? ( SIDEBAR_RIGHT_KEYBOARD_SHORTCUT )
                            : ( side === 'left'
                                ? ( SIDEBAR_LEFT_KEYBOARD_SHORTCUT )
                                : ( SIDEBAR_LEFT_KEYBOARD_SHORTCUT )
                            )
                        )
                }
            >
                <NestedSidebar
                    openSidebar={ openSidebar }
                    setOpenSidebar={ setOpenSidebar }
                    useMobileDialog={ useMobileDialog }
                    setUseMobileDialog={ setUseMobileDialog }
                    children={ null }
                    { ...props }
                />
                <SidebarInset
                    // className={ `w-[calc(100vw-var(--sidebar-width))] max-w-[calc(100vw-var(--sidebar-width))] min-w-[calc(100vw-var(--sidebar-width))]` }
                    // style={ {
                    //     '--dash-content-width': `calc(100vw-var(--sidebar-width))`,
                    // } }
                    className={ `h-full w-full max-w-full min-w-min !overflow-auto ` }
                >
                    {/* { children && children } */ }
                </SidebarInset>
            </SidebarProvider>
            { children && children }
        </>
    );
}

export function NestedSidebar ( {
    openSidebar = true,
    setOpenSidebar = () => { },
    side = 'left',
    sidebarWidth,
    resizable = false,
    nav, // Icons-sidebar nav/header items
    navClassNames,
    header, // Icons-sidebar content items
    headerClassNames,
    footer, // Icons-sidebar footer items
    footerClassNames,
    contentSidebarHeader,
    contentSidebarHeaderClassNames,
    contentSidebarContent,
    contentSidebarContentClassNames,
    userData = {}, /* = {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
    } */
    useMobileDialog = false,
    children,
    ...props
} ) {
    // const [ activeItem, setActiveItem ] = useState( nav.find( ( item ) => item.isActive ) || nav[ 0 ] );
    const { open, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();
    const [ dialogOpen, setDialogOpen ] = useState( false );

    const toggleSidebar = ( e ) => {
        e.preventDefault();
        setOpenSidebar( !openSidebar );
    };

    useEffect( () => {
        // On component mount, set initial sidebar state.
        setOpen( openSidebar );
    }, [] );

    // Handle mobile sidebar opening
    useEffect( () => {
        if ( isMobile && useMobileDialog ) {
            setDialogOpen( openMobile );
        }
    }, [ isMobile, openMobile, useMobileDialog ] );

    let sidebarStyle = {
        '--sidebar-width':
            ( resizable
                ? ( `${ sidebarWidth }rem` )
                : ( side === 'right'
                    ? ( `${ SIDEBAR_WIDTH_RIGHT + SIDEBAR_WIDTH_ICON }rem` )
                    : ( side === 'left'
                        ? ( `${ SIDEBAR_WIDTH_LEFT + SIDEBAR_WIDTH_ICON }rem` )
                        : ( `${ SIDEBAR_WIDTH_LEFT + SIDEBAR_WIDTH_ICON }rem` )
                    )
                ) ),
        '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
    };

    /* Icon sidebar - always visible on desktop, collapsible on tablet */
    const IconSidebar = (
        <Sidebar
            collapsible="none"
            className={ `!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r !p-0` }
            style={ sidebarStyle }
        >

            { header && (
                <SidebarHeader
                    height={ `${ CONTENT_HEADER_HEIGHT }rem` }

                    // className={ twMerge( `sidebar-header border-b border-sidebar-border h-${ CONTENT_HEADER_HEIGHT } bg-sextary-400 z-50 shadow-[0px_2px_2px_2px_rgba(0,_0,_0,_0.25)] `, className && className ) }
                    className={
                        twMerge(
                            `h-[--header-height] w-full !m-0 !p-0`,
                            `flex flex-row flex-nowrap items-center justify-center`,
                            `sidebar-header border-b border-sidebar-border !z-50`,
                            `w-full p-0`,
                            `border-b border-sidebar-border !h-[${ CONTENT_HEADER_HEIGHT }rem] flex flex-row w-full flex-nowrap items-center justify-stretch`,
                            `focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)]`,
                            ``,
                            headerClassNames
                        )
                    }
                    style={ {
                        '--header-height': `${ CONTENT_HEADER_HEIGHT }rem`,
                    } }
                >
                    <SidebarMenu className={ `w-full !p-0 h-auto` }>
                        {/* { header } */ }
                        <div className={ `flex flex-1 flex-col justify-center items-center !w-full !h-full` }>
                            <SidebarTrigger
                                className={ `flex !w-full !h-full !size-10` }
                                onClick={ () => {
                                    if ( setOpenSidebar ) {
                                        setOpenSidebar( !openSidebar );
                                        setOpen( !openSidebar );
                                    }
                                    setOpen( !open );
                                    setOpenSidebar( !open );
                                } }
                            />
                        </div>
                    </SidebarMenu>
                </SidebarHeader>
            ) }

            { nav && ( <SidebarContent
                className={ twMerge(
                    `!p-0 !px-0 !py-0 w-full`,
                    navClassNames
                ) }>
                <SidebarGroup className={ twMerge(
                    `w-full h-auto border-y !p-0`,
                    `!p-0 !px-0 !py-0 border-y`,
                ) }>
                    <SidebarGroupContent className="!p-0 !px-0 !py-0 md:px-0">
                        <SidebarMenu className={ `w-full !p-0 !px-0 !py-0` }>
                            { nav }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent> ) }

            { footer && (
                <SidebarFooter
                    className={ twMerge(
                        `w-full h-auto border-y !p-0`,
                        ` focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)] `,
                        footerClassNames,
                    ) }
                >
                    { footer }
                </SidebarFooter>
            ) }
        </Sidebar>
    );

    /* Content sidebar - visible on desktop and tablet, hidden on mobile */
    const ContentSidebar = (
        <Sidebar
            collapsible="none"
            className={ twMerge(
                `focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)]`,
                `hidden md:flex w-full p-0 overflow-auto`,
            ) }
            style={ {
                '--sidebar-width':
                    ( resizable
                        ? ( `${ sidebarWidth }rem` )
                        : ( side === 'right'
                            ? ( `${ SIDEBAR_WIDTH_RIGHT }rem` )
                            : ( side === 'left'
                                ? ( `${ SIDEBAR_WIDTH_LEFT }rem` )
                                : ( `${ SIDEBAR_WIDTH_LEFT }rem` )
                            )
                        ) ),
                '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
            } }>

            <SidebarHeader /* className="gap-3.5 border-b p-4" */
                className={ `w-full border-b p-0 h-[--header-height]` }
                style={ {
                    '--header-height': `${ CONTENT_HEADER_HEIGHT }rem`,
                } }
            >
                {/* <div className="flex w-full items-center justify-between"> */ }
                {/* <div className="text-base font-medium text-foreground">{ "On This Page" }</div> */ }
                {/* <Label className="flex items-center gap-2 text-sm">
                        <span>Unreads</span>
                        <Switch className="shadow-none" />
                    </Label> */}
                { contentSidebarHeader }
                {/* </div> */ }
                {/* <SidebarInput placeholder="Type to search..." /> */ }
            </SidebarHeader>

            <SidebarContent className={ `!p-0 !overflow-hidden` }>
                <SidebarGroup className={ `!px-0 !py-0 !p-0 !overflow-hidden` }>
                    <SidebarGroupContent
                        className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-y-auto !p-0` }
                        style={ {
                            '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem`,
                        } }
                    >
                        { contentSidebarContent }
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    );

    // Main sidebar component
    const MainSidebar = (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
            { ...props }
        >
            {/* Icon sidebar - always visible on desktop, collapsible on tablet */ }
            { IconSidebar }

            {/* Content sidebar - visible on desktop and tablet, hidden on mobile */ }
            { ContentSidebar }
        </Sidebar>
    );

    // Mobile view using Dialog
    if ( isMobile && useMobileDialog ) {
        return (
            <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
                <DialogContent className="p-0 max-w-[85vw] sm:max-w-md h-full">
                    { MainSidebar }
                </DialogContent>
            </Dialog>
        );
    }

    // Mobile view using Sheet
    if ( isMobile ) {
        return (
            <Sheet open={ openMobile } onOpenChange={ setOpenMobile }>
                <SheetContent side="left" className="p-0 w-[85vw] sm:max-w-md">
                    { MainSidebar }
                </SheetContent>
            </Sheet>
        );
    }

    return MainSidebar;
}

export function MobileViewToggle ( { onChange, defaultChecked = false } ) {
    const [ useDialog, setUseDialog ] = useState( defaultChecked );

    const handleChange = ( checked ) => {
        setUseDialog( checked );
        onChange( checked );
    };

    return (
        <div className="flex items-center space-x-2">
            <Switch id="mobile-view-mode" checked={ useDialog } onCheckedChange={ handleChange } />
            <Label htmlFor="mobile-view-mode">Use Dialog for Mobile</Label>
        </div>
    );
}

export function MobileSidebarTrigger () {
    const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
    if ( !isMobile ) return null;
    return (
        <Button variant="ghost" size="icon" onClick={ () => setOpenMobile( true ) } className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
        </Button>
    );
}

/* { contentItems.length > 0 ? (
        contentItems.map( ( item ) => (
            <a
                href="#"
                key={ item.id }
                className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
                <div className="flex w-full items-center gap-2">
                    <span>{ item.name }</span> <span className="ml-auto text-xs">{ item.date }</span>
                </div>
                <span className="font-medium">{ item.subject }</span>
                <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">{ item.teaser }</span>
            </a>
        ) )
    ) : (
        <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            No items to display
        </div>
    ) } 
*/