import React, { useState, useEffect, useRef } from "react";
import {
    Bell,
    Check,
    Globe,
    Home,
    Keyboard,
    LinkIcon,
    Lock,
    Menu,
    MessageCircle,
    Paintbrush,
    Settings,
    Video,
} from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as utils from 'akashatools';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import TimezoneSelect from "@/components/Time/TimezoneSelect";
import { useNav } from "@/lib/providers/NavProvider";

const data = {
    nav: [
        {
            title: "Home",
            target: "home",
            icon: Home,
            onClick: () => { },
        },
        {
            title: "Notifications",
            target: "notifications",
            icon: Bell,
            onClick: () => { },
        },
        {
            title: "Navigation",
            target: "navigation",
            icon: Menu,
            onClick: () => { },
        },
        {
            title: "Appearance",
            target: "appearance",
            icon: Paintbrush,
            onClick: () => { },
        },
        {
            title: "Messages & media",
            target: "messages-media",
            icon: MessageCircle,
            onClick: () => { },
        },
        {
            title: "Language & region",
            target: "language-region",
            icon: Globe,
            onClick: () => { },
        },
        {
            title: "Accessibility",
            target: "accessibility",
            icon: Keyboard,
            onClick: () => { },
        },
        {
            title: "Mark as read",
            target: "mark-as-read",
            icon: Check,
            onClick: () => { },
        },
        {
            title: "Audio & video",
            target: "audio-video",
            icon: Video,
            onClick: () => { },
        },
        {
            title: "Connected accounts",
            target: "connected-accounts",
            icon: LinkIcon,
            onClick: () => { },
        },
        {
            title: "Privacy & visibility",
            target: "privacy-visibility",
            icon: Lock,
            onClick: () => { },
        },
        {
            title: "Advanced",
            target: "advanced",
            icon: Settings,
            onClick: () => { },
        },
    ],
};
const SettingsMenu = ( props ) => {
    const { children, defaults, options } = props;

    const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings();
    const [ selectedAvatar, setSelectedAvatar ] = useState( settings?.avatar ?? '' );

    // const location = useLocation();
    // const navigate = useNavigate();
    // const { hash, pathname, search } = location;
    // const path = pathname?.split( '/' );
    // const endpoint = path?.[ path.indexOf( 'planner' ) + 1 ];

    const {
        getPath,
        getPathFrom,
        getRelativePath,
        location,
        navigate,
        hash,
        pathname,
        search,
        path,
        pathnames,
    } = useNav();

    const [ activeSettingsView, setActiveSettingsView ] = useState();
    const settingsViews = data.nav.map( ( v ) => ( v?.title ) );
    const relPath = getRelativePath( 'settings' );

    // relpathu

    return (
        <SidebarProvider className={ `items-start flex h-full relative overflow-hidden max-h-[90vh]` }>
            <Sidebar collapsible="none" className={ `md:flex h-full overflow-auto max-h-screen min-h-screen` }>
                <SidebarHeader>
                    <div className={ `flex flex-row justify-start items-center w-full h-full` }>
                        <div className={ `text-start font-bold text-nowrap text-xl px-4 py-2 border rounded-xl w-full` }>
                            { `Settings` }
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className={ `h-full p-0` }>
                    <SidebarGroup className={ `h-full p-0` }>
                        <SidebarGroupContent className={ `h-full p-0` }>

                            <SidebarMenu className={ `h-full p-0` }>

                                {/* Settings sidebar nav */ }
                                {/* Build the sidebar nav for the settings menu. */ }
                                { data.nav.map( ( item ) => (
                                    <SidebarMenuItem key={ item?.title }>
                                        <SidebarMenuButton
                                            asChild

                                            isActive={ item?.target === activeSettingsView }
                                        >
                                            <div className={ `` }>
                                                <item.icon />
                                                <Link to={ `../settings/${ item?.target }` } onClick={ () => ( setActiveSettingsView( item?.target ?? 'home' ) ) }>
                                                    { item?.title }
                                                </Link>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ) ) }

                            </SidebarMenu>

                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <main className="flex w-full h-full min-h-[480px] flex-1 flex-col overflow-hidden">

                <header className={ `flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12` }>
                    <div className={ `flex items-center gap-2 px-4` }>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink onClick={ () => {
                                        setActiveSettingsView( 'home' );
                                        navigate( '../settings' );
                                    } }>
                                        Settings
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                { relPath && utils.val.isValidArray( relPath, true ) && relPath?.map( ( p, i ) => {
                                    return (
                                        <>
                                            { i > 0 && <BreadcrumbSeparator className="hidden md:block" /> }
                                            <BreadcrumbItem>
                                                <Link
                                                    to={ `../settings/${ p }` }
                                                    onClick={ () => ( setActiveSettingsView( p ?? 'home' ) ) }
                                                    className={ `` }
                                                >
                                                    { data.nav.find( ( v ) => ( v?.target === p ) )?.title }
                                                </Link>
                                                {/* <BreadcrumbLink
                                                    className={ `` }
                                                    onClick={ () => { setActiveSettingsView( p ); navigate( `../${ p }` ); } }
                                                >
                                                    { data.nav.find( ( v ) => ( v?.target === p ) )?.title }
                                                </BreadcrumbLink> */}
                                            </BreadcrumbItem>
                                        </>
                                    );
                                } ) }
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 bg-muted/50">
                    {/* { Array.from( { length: 10 } ).map( ( v, i ) => (
                        <div
                            key={ i }
                            onClick={ () => ( setActiveSettingsView( v?.title ?? 'Home' ) ) }
                            className="aspect-video max-w-3xl rounded-xl hover:bg-muted/20"
                        />
                    ) ) } */}
                    <Routes>
                        <Route path={ `home` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `notifications` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className={ `flex justify-between items-center w-full flex-row flex-grow` }>
                                            <span className="font-medium">Daily Reminders</span>
                                            <Switch size={ 6 } defaultChecked={ false } className={ `w-10` } />
                                            {/* <Button variant="outline">On</Button> */ }
                                        </div>
                                        <div className={ `flex justify-between items-center w-full flex-row flex-grow` }>
                                            <span className="font-medium">Weekly Progress</span>
                                            <Switch size={ 6 } defaultChecked={ false } className={ `w-10` } />
                                            {/* <Button variant="outline">On</Button> */ }
                                        </div>
                                        <div className={ `flex justify-between items-center w-full flex-row flex-grow` }>
                                            <span className="font-medium">Achievement Alerts</span>
                                            <Switch size={ 6 } defaultChecked={ false } className={ `w-10` } />
                                            {/* <Button variant="outline">On</Button> */ }
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>
                        } />
                        <Route path={ `navigation` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `appearance` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `messages-media` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `language-region` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                                <TimezoneSelect value={ settings.timezone } onValueChange={ ( value ) => updateSettings( { timezone: value } ) } />
                            </div>
                        } />
                        <Route path={ `accessibility` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `mark-as-read` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `audio-video` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `connected-accounts` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `privacy-visibility` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                        <Route path={ `advanced` } element={
                            <div className={ `` }>
                                <h3 className={ `` }>
                                    { data.nav.find( ( v ) => ( v?.target === activeSettingsView ) )?.title }
                                </h3>
                            </div>
                        } />
                    </Routes>

                </div>

            </main>

        </SidebarProvider>
    );
};

export default SettingsMenu;