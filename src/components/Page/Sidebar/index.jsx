/*
    This needs to push against the content component on normal size screens, and overlay them on small screens (side panel or canvas)
*/
/* eslint-disable react/prop-types */
import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useId,
    useMemo,
} from 'react';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/sidebar';
// } from '@/components/ui/sidebar-resizable';
import * as utils from 'akashatools';

import useGlobalStore from '@/store/global.store';
import {
    CONTENT_HEADER_HEIGHT,
    SIDEBAR_LEFT_KEYBOARD_SHORTCUT,
    SIDEBAR_RIGHT_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH_ICON,
    SIDEBAR_WIDTH_LEFT,
    SIDEBAR_WIDTH_RIGHT,
} from '@/lib/config/constants';
import { twMerge } from 'tailwind-merge';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// import Icon from '@/components/Icon/Icon';

const Side = ( props ) => {
    const {
        active = true,
        mini = false,
        resizable = true,
        toggleMode = 'rail', // "rail" | "arrow" | "button"
        collapseToOffCanvas = false,
        collapseToIcons = false,
        openSidebar, setOpenSidebar = () => { },
        sidebarContent, setSidebarContent = () => { },
        header,
        nav,
        footer,
        children,
        className,
        headerClasses,
        navClasses,
        contentNavClasses,
        contentClasses,
        footerClasses,
        defaultWidth = SIDEBAR_WIDTH_LEFT,
        width,
        side = 'left',
        keyboardShortcut,
    } = props;

    const [ sidebarWidth, setSidebarWidth ] = useState( width );

    const toggleSidebar = ( e ) => {
        e.preventDefault();
        setOpenSidebar( !openSidebar );
    };

    const resetSidebarWidth = () => {
        setSidebarWidth( SIDEBAR_WIDTH_LEFT );
    };

    // const { sidebarWidth, setSidebarWidth } = useState( isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH );

    // useEffect( () => {
    //   // Set width on component load, allows for differing widths for left/right sidebars.
    //   if ( width ) { setSidebarWidth( width ); }
    // }, [] );

    let sidebarStyle = {
        '--sidebar-width':
            ( resizable
                ? ( `${ sidebarWidth }rem` )
                : ( width
                    ? ( `${ width }rem` )
                    : ( side === 'right'
                        ? ( `${ SIDEBAR_WIDTH_RIGHT }rem` )
                        : ( side === 'left'
                            ? ( `${ SIDEBAR_WIDTH_LEFT }rem` )
                            : ( `${ SIDEBAR_WIDTH_LEFT }rem` )
                        )
                    ) ) ),
        '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
    };

    if ( resizable ) {
        return (
            <SidebarProvider
                open={ openSidebar }
                onOpenChange={ setOpenSidebar }
                state={ openSidebar ? 'expanded' : 'collapsed' }
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
                className={
                    twMerge(
                        // openSidebar ? 'page-sidebar' : 'page-sidebar-active',
                        `sidebar-${ side }-container w-auto`,
                        mini && 'mini',
                        className,
                    ) }
                style={ sidebarStyle }
            >

                <ResizablePanelGroup
                    className={ `!z-[13]` }
                    direction={ `horizontal` }
                >
                    { side === 'right' && (
                        <ResizableHandle
                            // className={ `!z-[11]` }
                            onDoubleClick={ resetSidebarWidth }
                            withHandle
                        />
                    ) }
                    <ResizablePanel
                        defaultSize={ defaultWidth ?? sidebarWidth }
                        minSize={ SIDEBAR_WIDTH_ICON }
                        maxSize={ SIDEBAR_WIDTH_RIGHT }
                        onResize={ ( size ) => setSidebarWidth( size ) }
                        collapsedSize={ SIDEBAR_WIDTH_ICON }
                        collapsible={ true }
                    >
                        <Sidebar
                            // variant: "sidebar | floating | inset"
                            variant={ `sidebar` }
                            // collapsible: "offcanvas | icon | none"
                            { ...{
                                ...( collapseToIcons === true
                                    ? { collapsible: 'icon' }
                                    : ( collapseToOffCanvas === true
                                        ? { collapsible: 'offcanvas' }
                                        : {} )
                                ),
                            } }
                            // className={ `app-sidebar w-full h-full max-h-fit min-h-full overflow-auto` }
                            side={ side }
                        >

                            { header && (
                                <Side.Header
                                    className={ twMerge(
                                        `border-b border-sidebar-border !h-[${ CONTENT_HEADER_HEIGHT }rem] bg-sidebar-background flex flex-row w-full flex-nowrap items-center`,
                                        headerClasses,
                                    ) }
                                    navClasses={ navClasses }
                                >
                                    { toggleMode === 'arrow' && ( <Side.ToggleArrow
                                        size={ 'xs' }
                                        side={ side }
                                        containerHeight={ CONTENT_HEADER_HEIGHT }
                                        openSidebar={ openSidebar }
                                        setOpenSidebar={ setOpenSidebar }
                                    /> ) }
                                    { header }
                                </Side.Header>
                            ) }

                            { ( sidebarContent || children ) && (
                                <Side.Content
                                    className={ contentClasses }
                                    // className={ `${ contentClasses } flex flex-col min-w-[100%] justify-stretch items-stretch w-[100%] p-0 m-0 bg-sidebar-primary` }
                                    contentNavClasses={ contentNavClasses }
                                    toggleSidebar={ toggleSidebar }
                                    openSidebar={ openSidebar }
                                    setOpenSidebar={ setOpenSidebar }
                                    nav={ nav }
                                    side={ side }
                                    { ...props }
                                >
                                    { sidebarContent ? children && children : sidebarContent && sidebarContent }
                                </Side.Content>
                            ) }

                            { footer && (
                                <Side.Footer
                                    className={ footerClasses }
                                >
                                    { footer }
                                </Side.Footer>
                            ) }

                        </Sidebar>
                    </ResizablePanel>
                    { side === 'left' && (
                        <ResizableHandle
                            className={ `!z-[100]` }
                            withHandle
                            onDoubleClick={ resetSidebarWidth }
                        />
                    ) }
                </ResizablePanelGroup>
            </SidebarProvider >
        );
    }
    else {
        return (
            <SidebarProvider
                open={ openSidebar }
                onOpenChange={ setOpenSidebar }
                state={ openSidebar ? 'expanded' : 'collapsed' }
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
                className={ `sidebar-left-container w-auto` }
                style={ sidebarStyle }
            >

                <Sidebar
                    // variant="sidebar | floating | inset"
                    variant={ `sidebar` }
                    // collapsible="offcanvas | icon | none"
                    // collapsible={ `${ collapseToIcons ? 'icon' : 'none' }` }
                    { ...{
                        ...( collapseToIcons === true
                            ? { collapsible: 'icon' }
                            : (
                                collapseToOffCanvas === true
                                    ? { collapsible: 'offcanvas' }
                                    : {}
                            )
                        ),
                    } }
                    side={ side }
                // className={ `app-sidebar w-full h-full max-h-fit min-h-full overflow-auto` }
                // collapsible="none"
                >

                    { header && (
                        <Side.Header
                            height={ `${ CONTENT_HEADER_HEIGHT }rem` }
                            navClasses={ navClasses }
                            className={ twMerge(
                                `border-b border-sidebar-border !h-[${ CONTENT_HEADER_HEIGHT }rem]  px-2 bg-sidebar-background flex flex-row w-full flex-nowrap items-center justify-stretch`,
                                headerClasses,
                            ) }
                        >
                            { toggleMode === 'arrow' && ( <Side.ToggleArrow
                                size={ 'xs' }
                                side={ side }
                                containerHeight={ CONTENT_HEADER_HEIGHT }
                                openSidebar={ openSidebar }
                                setOpenSidebar={ setOpenSidebar }
                            /> ) }
                            { header }
                        </Side.Header>
                    ) }
                    {/* 
                    { header && (
                        <Side.Header
                            navClasses={ navClasses }
                            className={ `border-b h-14 border-sidebar-border h-[${ CONTENT_HEADER_HEIGHT }rem] bg-sidebar-primary flex flex-row w-full flex-nowrap items-center` }
                        >
                            { header }
                        </Side.Header>
                    ) }
                    */}
                    <SidebarRail
                        side={ side }
                        // className={ `sidebar-left-rail ` }
                        className={ twMerge(
                            `sidebar-${ side }-rail w-1 !focus-within:outline-none !focus:outline-none !focus-visible:outline-none`,
                            `hover:bg-quinaryHighlight/60 border-l-brand-primaryPurple !after:z-[10]`,
                            side === 'right' && `!right-[1.5rem] !after:right-[1.5rem]`,
                            side === 'left' && `!right-[-0.5rem] !after:right-[-0.5rem]`,
                        ) }
                        onClick={ ( e ) => {
                            toggleSidebar( e );
                        } }
                        style={ {
                            // right: `-0.5rem`,
                            // left: -`${ SIDEBAR_WIDTH_LEFT } !important`,
                            // right: `${ side === 'right' ? -1.5 : 1.5 }rem !important`,
                            // ...{
                            //     ...( side === 'right' && { right: `1.5rem !important` } ),
                            //     ...( side === 'left' && { left: `-1.5rem !important` } ),
                            // },
                            // right: `-0.5rem !important`,
                            // position: `relative !important`,
                            transformX: `0px`,
                            zIndex: `${ 100 }`,
                            top: `${ CONTENT_HEADER_HEIGHT / 2 }rem`
                        } }
                    />

                    { nav && (
                        <SidebarGroup
                            className={ `focus:shadow-[0px_2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>{ nav }</SidebarGroupContent>
                        </SidebarGroup>
                    ) }

                    <SidebarContent
                        className={ `flex flex-col min-w-[100%] justify-stretch items-stretch w-[100%] p-0 m-0 bg-sidebar-background ${ contentClasses }` }
                        contentNavClasses={ contentNavClasses }
                        toggleSidebar={ toggleSidebar }
                        openSidebar={ openSidebar }
                        setOpenSidebar={ setOpenSidebar }
                        nav={ nav }
                        side={ side }
                        { ...props }
                    >
                        { children && children }
                        { sidebarContent && sidebarContent }
                    </SidebarContent>

                    {/* { ( sidebarContent || children ) && (
                        <Side.Content
                            // className={ contentClasses }
                            className={ `flex flex-col min-w-[100%] justify-stretch items-stretch w-[100%] p-0 m-0 bg-sextary-800 ${ contentClasses }` }
                            contentNavClasses={ contentNavClasses }
                            toggleSidebar={ toggleSidebar }
                            openSidebar={ openSidebar }
                            setOpenSidebar={ setOpenSidebar }
                            nav={ nav }
                            side={ side }
                            { ...props }
                        >
                            { children && children }
                            { sidebarContent && sidebarContent }
                        </Side.Content>
                    ) }
                    */}
                    { footer && (
                        <Side.Footer
                            className={ footerClasses }
                        >
                            { footer }
                        </Side.Footer>
                    ) }

                </Sidebar>

            </SidebarProvider>
        );
    }
};

const Header = ( props ) => {
    const {
        className,
        children,
        height, // = `${ CONTENT_HEADER_HEIGHT }rem`,
        navClasses,
    } = props;
    return (
        <SidebarHeader
            // className={ twMerge( `sidebar-header border-b border-sidebar-border h-${ CONTENT_HEADER_HEIGHT } bg-sidebar-background z-50 shadow-[0px_2px_2px_2px_rgba(0,_0,_0,_0.25)] `, className && className ) }
            className={
                twMerge(
                    `h-[--header-height] w-full !m-0 !p-0`,
                    // `!h-[${ CONTENT_HEADER_HEIGHT }rem] w-full px-2 !m-0 !py-0`,
                    `bg-sidebar-background flex flex-row flex-nowrap items-center justify-center`,
                    `sidebar-header border-b border-sidebar-border !z-50`,
                    className
                )
            }
            style={ {
                '--header-height': `${ CONTENT_HEADER_HEIGHT }rem`,
            } }
        >
            {/* <div className={ `group-data-[collapsible=icon]:opacity-0 flex items-center justify-stretch` }> */ }
            { children && children }
            {/* </div> */ }
        </SidebarHeader>
    );
};

Side.Header = Header;

const Content = ( props ) => {
    const {
        openSidebar,
        setOpenSidebar = () => { },
        toggleSidebar = () => { },
        sidebarContent,
        setSidebarContent = () => { },
        header,
        contentNavClasses,
        side = 'left',
        nav,
        content,
        footer,
        className,
        children,
    } = props;


    return (
        <SidebarContent
            className={ twMerge(
                `sidebar-content`,
                `flex flex-col min-w-[100%] justify-center items-start w-[100%] p-0 m-0 h-full gap-0 !relative !overflow-hidden`,
                className && className,
            ) }
        >
            {/* Navigation buttons */ }
            { nav && (
                <SidebarGroup
                    className={ `focus:shadow-[0px_2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }
                >
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>{ nav }</SidebarGroupContent>
                </SidebarGroup>
            ) }
            <div className={ twMerge(
                `sidebar-content`,
                `h-full w-full max-w-full !overflow-auto relative`,
            ) }>
                { children && children }
                {/* { sidebarContent && sidebarContent } */ }
            </div>

        </SidebarContent>
    );
    /*  return (
            <SidebarContent
                    className={ twMerge( `sidebar-content bg-sidebar-primary`, className && className ) }
                >
                    {
                        nav && (
                            <SidebarGroup
                                // className={ twMerge( `shadow-[0px_2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0`, contentNavClasses && contentNavClasses ) }
                                className={ twMerge( `p-0`, contentNavClasses && contentNavClasses ) }
                            >
                                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                                <SidebarGroupContent>{ nav }</SidebarGroupContent>
                            </SidebarGroup>
                        );
                }

                    { content && content; }
                </SidebarContent >
                );
                */
};

Side.Content = Content;

const Footer = ( props ) => {
    const {
        children,
        className,
    } = props;

    return (
        <SidebarFooter
            // className={ twMerge( `sidebar-footer bg-sidebar-primary shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0`, className && className ) }
            className={ twMerge(
                `sidebar-footer bg-sidebar-primary p-0`,
                `focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0`,
                className && className,
            ) }
        >
            { children && children }
        </SidebarFooter>
    );
};

Side.Footer = Footer;

const SidebarLeft = ( props ) => {
    const {
        openSidebar = true, setOpenSidebar,
        sidebarContent, setSidebarContent,
        collapseToIcons = false,
        header,
        nav,
        footer,
        children,
        className,
    } = props;

    const toggleSidebar = ( e ) => {
        e.preventDefault();
        setOpenSidebar( !openSidebar );

        // Save to local storage.
        // SetLocal(
        //     [ 'mindspace', 'app', 'sidebar', 'primary', 'state' ].join( '_' ),
        //     openSidebarPrimary
        // );
    };

    return (
        <SidebarProvider
            keyboardShortcut={ SIDEBAR_LEFT_KEYBOARD_SHORTCUT }
            className={ `sidebar-left-container w-auto` }
            open={ openSidebar }
            onOpenChange={ setOpenSidebar }
            width={ `${ SIDEBAR_WIDTH_LEFT }rem` }
            state={ openSidebar ? 'expanded' : 'collapsed' }
            side={ 'left' }
            style={ {
                '--sidebar-width': `${ SIDEBAR_WIDTH_LEFT }rem`,
                '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
            } }>
            <Sidebar
                // variant="sidebar | floating | inset"
                variant="sidebar"
                // collapsible="offcanvas | icon | none"
                // className={ `app-sidebar w-full h-full max-h-fit min-h-full overflow-auto` }
                // collapsible={ `${ collapseToIcons ? 'icon' : 'none' }` }
                { ...{
                    ...( collapseToIcons === true
                        ? { collapsible: 'icon' }
                        : {}
                    ),
                } }
                // className={ `border-r-0 bg-sidebar-primary` }
                className={ `sidebar-left border-l-l lg:flex top-0 h-svh left-0 p-0` }
                side={ 'left' }
            // { ...props }
            >
                <SidebarHeader
                    // className={ `border-b border-sidebar-border h-${ CONTENT_HEADER_HEIGHT } bg-sidebar-primary z-50 shadow-[0px_2px_2px_2px_rgba(0,_0,_0,_0.25)] ` }
                    className={ `border-b border-sidebar-border h-${ CONTENT_HEADER_HEIGHT } z-50 focus:shadow-[0px_2px_2px_2px_rgba(0,_0,_0,_0.25)] ` }
                >
                    { header && header }
                </SidebarHeader>

                <SidebarContent
                    className={ `flex flex-col min-w-[100%] justify-start items-stretch w-[100%] p-0 m-0 h-auto` }
                >
                    {/* className={ `border-b ` } */ }
                    {/* Navigation buttons */ }
                    { nav && (
                        <SidebarGroup
                            className={ `focus:shadow-[0px_2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>{ nav }</SidebarGroupContent>
                        </SidebarGroup>
                    ) }
                    { children && children }
                    {/* { sidebarContent && sidebarContent } */ }
                    <SidebarRail
                        side={ 'left' }
                        className={ `sidebar-left-rail ` }
                        onClick={ ( e ) => {
                            toggleSidebar( e );
                        } }
                        style={ {
                            // right: `-0.5rem`,
                            left: -`${ SIDEBAR_WIDTH_LEFT }rem !important`,
                            transformX: `0px`,
                        } }
                    />
                </SidebarContent>

                { footer && (
                    <SidebarFooter
                        className={ `focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }>
                        { footer }
                    </SidebarFooter>
                ) }
            </Sidebar>
        </SidebarProvider>
    );
};

Side.Left = SidebarLeft;

const SidebarRight = ( props ) => {
    const {
        openSidebar = true, setOpenSidebar,
        sidebarContent, setSidebarContent,
        collapseToIcons = false,
        header,
        nav,
        footer,
        className,
        children,
    } = props;

    const toggleSidebar = ( e ) => {
        e.preventDefault();
        setOpenSidebar( !openSidebar );

        // Save to local storage.
        // SetLocal(
        //     [ 'mindspace', 'app', 'sidebar', 'secondary', 'state' ].join( '_' ),
        //     openSidebarSecondary
        // );
    };

    /* {
                    name: "Admin",
                email: "admin@admin.com",
                avatar: "/avatars/shadcn.jpg",
                nav:
                */

    return (
        <SidebarProvider
            keyboardShortcut={ SIDEBAR_RIGHT_KEYBOARD_SHORTCUT }
            className={ `sidebar-right-container w-auto` }
            open={ openSidebar }
            onOpenChange={ setOpenSidebar }
            state={ openSidebar ? 'expanded' : 'collapsed' }
            width={ `${ SIDEBAR_WIDTH_RIGHT }` }
            side={ 'right' }
            style={ {
                '--sidebar-width': `${ SIDEBAR_WIDTH_RIGHT }rem`,
                '--sidebar-width-icon': `${ SIDEBAR_WIDTH_ICON }rem`,
            } }>
            <Sidebar
                // variant="sidebar | floating | inset"
                { ...{
                    ...( collapseToIcons === true
                        ? { collapsible: 'icon' }
                        : {}
                    ),
                } }
                // collapsible={ `${ collapseToIcons ? 'icon' : 'none' }` }
                variant="sidebar"
                // collapsible="offcanvas | icon | none"
                // className={ `app-sidebar w-full h-full max-h-fit min-h-full overflow-auto` }
                // collapsible="none"
                side={ 'right' }
            >
                { header && (
                    <SidebarHeader
                        className={ `border-b h-14 border-sidebar-border h-${ CONTENT_HEADER_HEIGHT } flex flex-row w-full flex-nowrap items-center` }>
                        { header }
                    </SidebarHeader>
                ) }

                <SidebarContent
                    className={ `flex flex-col min-w-[100%] justify-start items-stretch w-[100%] p-0 m-0 h-auto` }>
                    {/* Navigation buttons */ }
                    { nav && (
                        <SidebarGroup
                            className={ `focus:shadow-[0px_2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>{ nav }</SidebarGroupContent>
                        </SidebarGroup>
                    ) }
                    { children && children }
                    { sidebarContent && sidebarContent }
                    <SidebarRail
                        className={ `sidebar-right-rail w-0 !focus-within:outline-none !focus:outline-none !focus-visible:outline-none` }
                        onClick={ ( e ) => {
                            toggleSidebar( e );
                        } }
                        style={ {
                            // right: `-0.5rem`,
                            right: -`${ SIDEBAR_WIDTH_RIGHT }rem !important`,
                            transformX: `0px`,
                        } }
                    />
                </SidebarContent>

                { footer && (
                    <SidebarFooter
                        className={ `focus:shadow-[0px_-2px_6px_2px_rgba(0,_0,_0,_0.25)] p-0` }
                    >
                        { footer }
                    </SidebarFooter>
                ) }
            </Sidebar>
        </SidebarProvider>
    );
};

Side.Right = SidebarRight;

const ToggleArrow = ( props ) => {
    const {
        size = 'xs',
        side = 'left',
        containerHeight,
        openSidebar = true,
        setOpenSidebar = () => { },
        classNames = '',
    } = props;

    return (
        <Button
            className={ twMerge(
                `absolute`,
                side === 'left' && `right-[-1.0rem]`,
                side === 'right' && `left-[-1.0rem]`,
                `border-transparent bg-background hover:border-secondary-50 !cursor-pointer rounded-full border p-1 aspect-square shadow-[0px_2px_4px_0px_rgba(0,_0,_0,_0.15)] hover:shadow-[0px_4px_6px_2px_rgba(0,_0,_0,_0.45)]`,
                `transition-all duration-500`,
                classNames,
            ) }
            style={ {
                top: `${ ( containerHeight ?? CONTENT_HEADER_HEIGHT ) / 20 }rem`,
                zIndex: `1000 !important`,
            } }
            onClick={ ( e ) => { setOpenSidebar( !openSidebar ); } }
            size={ size }
            variant={ `ghost` }
        >
            { side === 'left' ? <LucideArrowLeftRight /> : <LucideArrowLeftRight /> }
        </Button>
    );
};

Side.ToggleArrow = ToggleArrow;

export default Side;
