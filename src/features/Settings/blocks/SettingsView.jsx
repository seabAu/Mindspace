"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Save,
    Palette,
    PaintBucket,
    SlidersHorizontal,
    Sparkles,
    XIcon,
    PlusIcon,
    RefreshCwIcon,
    Loader2,
    RefreshCw,
    CloudUploadIcon,
    Mail,
    Phone,
    Bell,
    MessageSquare,
    SaveIcon,
} from "lucide-react";
import * as utils from "akashatools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { AdvancedBreadcrumbs } from "@/components/advanced-breadcrumbs";
import ColorField from "@/features/Settings/blocks/ColorField";
import { SETTINGS_DEFAULT_THEMES, useSettingsStore } from "@/store/settings.store";
import { buildSelect } from "@/lib/utilities/input";
import { caseCamelToSentence } from "@/lib/utilities/string";
import useSettings from "@/lib/hooks/useSettings";
import useGlobalStore from "@/store/global.store";
import { isValidEmail, isValidPhoneNumber } from "@/lib/utilities/validation";
import useAuth from "@/lib/hooks/useAuth";


const intentPairs = [
    { bg: "primary", fg: "primaryFg", label: "Primary" },
    { bg: "secondary", fg: "secondaryFg", label: "Secondary" },
    { bg: "muted", fg: "mutedFg", label: "Muted" },
    { bg: "accent", fg: "accentFg", label: "Accent" },
    { bg: "destructive", fg: "destructiveFg", label: "Destructive" },
];

const surfacePairs = [
    { bg: "background", fg: "foreground", label: "Background" },
    { bg: "cardBg", fg: "cardFg", label: "Card" },
    { bg: "popoverBg", fg: "popoverFg", label: "Popover" },
];

const lineColors = [
    { key: "border", label: "Border" },
    { key: "input", label: "Input" },
    { key: "ring", label: "Ring" },
];

const sidebarPairs = [
    { key: "sidebarBackground", label: "Sidebar Background" },
    { key: "sidebarForeground", label: "Sidebar Foreground" },
    { key: "sidebarPrimary", label: "Sidebar Primary" },
    { key: "sidebarPrimaryForeground", label: "Sidebar Primary Foreground" },
    { key: "sidebarAccent", label: "Sidebar Accent" },
    { key: "sidebarAccentForeground", label: "Sidebar Accent Foreground" },
    { key: "sidebarBorder", label: "Sidebar Border" },
    { key: "sidebarRing", label: "Sidebar Ring" },
];

/**
 * Main settings view component with comprehensive configuration options
 * @param {Object} props - Component props
 * @returns {JSX.Element} Settings interface
 */
export default function Settings ( props ) {
    const { handleFetchSettings, handleBackupSettings } = useSettings();
    const { handleUpdateUser } = useAuth();
    const settings = useSettingsStore();
    const { user, workspaceId } = useGlobalStore();

    const {
        setActiveTab, activeTab,
        requestFetchSettings,
        setRequestFetchSettings,
        loadingSettings,
        setLoadingSettings,
        errorSettings,
        setErrorSettings,
        emailNotifications,
        updateEmailNotifications,
        smsNotifications,
        updateSmsNotifications,
        pushNotifications,
        updatePushNotifications,
        toastNotifications,
        updateToastNotifications,
    } = useSettingsStore();

    const [ presetName, setPresetName ] = useState( "My Theme" );
    const [ emailContact, setEmailContact ] = useState( emailNotifications?.contact || "" );
    const [ SMSContact, setSMSContact ] = useState( smsNotifications?.contact || "" );

    // Apply persisted settings on mount and load user presets
    useEffect( () => {
        settings.applySettings();
        try {
            const raw = localStorage.getItem( "user-theme-presets" );
            if ( raw ) {
                const parsed = JSON.parse( raw );
                if ( Array.isArray( parsed ) && parsed.length ) {
                    const ids = new Set( settings.themePresets.map( ( p ) => p.id ) );
                    const merged = [ ...settings.themePresets ];
                    parsed.forEach( ( p ) => {
                        if ( !ids.has( p.id ) ) merged.push( p );
                    } );
                    settings.updateSettings( { themePresets: merged } );
                }
            }
        } catch { }
    }, [] );

    const pageKeys = useMemo( () => Object.keys( settings.enabledPages || {} ), [ settings.enabledPages ] );
    const userPresets = settings.themePresets.filter( ( p ) => !p.builtIn );

    /**
     * Handles theme selection including presets
     * @param {string} value - Selected theme value
     */
    const handleThemeSelect = ( value ) => {
        if ( value.startsWith( "preset:" ) ) {
            const id = value.replace( "preset:", "" );
            settings.applyPreset( id );
        } else {
            settings.updateSetting( "theme", value );
        }
    };

    /**
     * Handles email notification opt-in toggle
     * @param {boolean} enabled - Whether email notifications are enabled
     */
    const handleEmailOptIn = async ( enabled ) => {
        let update;

        // Prep update object.
        if ( enabled && !emailNotifications.contact ) {
            // Use user's email if available
            const userEmail = user?.email || "";
            update = {
                enabled: enabled,
                contact: userEmail,
                verified: isValidEmail( userEmail ),
            };
        } else {
            update = {
                ...emailNotifications,
                enabled: enabled,
            };
        }

        // Update the user data stored on the server; notification contact method permissions are stored in the user, not just settings, for A10 compliance. 
        try {
            let result = await handleUpdateUser( user?.id, {
                emailOptInConsent: enabled
            } );
            console.log( `Successfully updated email opt-in notification consent: `, result );
        } catch ( error ) {
            console.error( `Error updating email opt-in notification consent: ${ error.message }` );
        }

        // Update local state.
        updateEmailNotifications( update );
    };

    /**
     * Handles SMS notification opt-in toggle
     * @param {boolean} enabled - Whether SMS notifications are enabled
     */
    const handleSmsOptIn = async ( enabled ) => {
        let update;

        // Prep update object.
        if ( enabled && !smsNotifications.contact ) {
            // Use user's email if available
            const userPhone = user?.phone || "";
            update = {
                enabled: enabled,
                contact: userPhone,
                verified: isValidPhoneNumber( userPhone ),
            };
        } else {
            update = {
                ...smsNotifications,
                enabled: enabled,
            };
        }

        // Update the user data stored on the server; notification contact method permissions are stored in the user, not just settings, for A10 compliance. 
        try {
            let result = await handleUpdateUser( user?.id, {
                phoneOptInConsent: enabled
            } );
            console.log( `Successfully updated email opt-in notification consent: `, result );
        } catch ( error ) {
            console.error( `Error updating email opt-in notification consent: ${ error.message }` );
        }

        // Update local state.
        updateSmsNotifications( update );
        if ( enabled && !smsNotifications.contact ) {
            // Use user's contact if available
            const userPhone = user?.contact || "";
            updateSmsNotifications( {
                enabled,
                contact: userPhone,
                verified: false,
            } );
        } else {
            updateSmsNotifications( { enabled } );
        }
    };

    const handleUpdateEmailContact = async ( contact ) => {
        updateEmailNotifications( { contact: contact } );

        // Update the user data stored on the server; notification contact method permissions are stored in the user, not just settings, for A10 compliance. 
        try {
            let result = await handleUpdateUser( user?.id, {
                emailNotificationContact: contact
            } );
            console.log( `Successfully updated email notification contact: `, result );
        } catch ( error ) {
            console.error( `Error updating email notification contact: ${ error.message }` );
        }

    };

    const handleUpdateSMSContact = async ( contact ) => {
        updateSmsNotifications( { contact: contact } );

        // Update the user data stored on the server; notification contact method permissions are stored in the user, not just settings, for A10 compliance. 
        try {
            let result = await handleUpdateUser( user?.id, {
                phoneNotificationContact: contact
            } );
            console.log( `Successfully updated SMS notification contact: `, result );
        } catch ( error ) {
            console.error( `Error updating SMS notification contact: ${ error.message }` );
        }

    };


    /**
     * Handles push notification opt-in toggle with browser permission
     * @param {boolean} enabled - Whether push notifications are enabled
     */
    const handlePushOptIn = async ( enabled ) => {
        await updatePushNotifications( { enabled } );
    };

    useEffect( () => {
        if ( requestFetchSettings ) {
            // setLoadingSettings( true );
            setRequestFetchSettings( false );
            handleFetchSettings();
            // setLoadingSettings( false );
        }
    }, [ requestFetchSettings ] );

    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b gradient-header">
                <div className="w-full"></div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-2">
                    <h1 className="text-xl font-bold">Settings</h1>
                    <Button onClick={ () => settings.applySettings() }>
                        <Save className="mr-1 size-3 aspect-square" />
                        Apply Changes
                    </Button>

                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={ () => setRequestFetchSettings( true ) }
                            disabled={ loadingSettings }
                            className="w-auto aspect-auto rounded-lg inline-flex"
                        >
                            { loadingSettings ? (
                                <Loader2 className="!size-6 aspect-square animate-spin" />
                            ) : (
                                <RefreshCw className="size-6 aspect-square" />
                            ) }
                            Reload
                        </Button>

                        <Button
                            onClick={ () => handleBackupSettings() }
                            disabled={ loadingSettings }
                            className="w-auto aspect-auto rounded-lg inline-flex"
                        >
                            { loadingSettings ? (
                                <Loader2 className="!size-6 aspect-square animate-spin" />
                            ) : (
                                <CloudUploadIcon className="size-6 aspect-square" />
                            ) }
                            Cloud Backup
                        </Button>
                    </div>
                </div>

                <Tabs
                    defaultValue={ activeTab || `appearance` }
                    value={ activeTab || `appearance` }
                    onValueChange={ setActiveTab }
                    //    className="flex-1 overflow-hidden"
                    className="flex-grow w-full h-full space-y-2"
                >
                    <div className="px-2">
                        <TabsList className="rounded-lg">
                            <TabsTrigger className="!h-full rounded-lg" value="appearance">
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger className="!h-full rounded-lg" value="notifications">
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger className="!h-full rounded-lg" value="integrations">
                                Integrations
                            </TabsTrigger>
                            <TabsTrigger className="!h-full rounded-lg" value="accessibility">
                                Accessibility
                            </TabsTrigger>
                            <TabsTrigger className="!h-full rounded-lg" value="advanced">
                                Advanced
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-auto p-2 space-y-3 border-y my-2 mx-2">
                        {/* Appearance with sub-tabs */ }
                        <TabsContent value="appearance" className="mt-0 space-y-3">
                            {/* Toolbar: Theme selector and save actions */ }
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Palette className="h-4 w-4" />
                                        Theme & Presets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Select Theme</Label>
                                        { buildSelect( {
                                            placeholder: "Select Theme",
                                            opts: [
                                                ...SETTINGS_DEFAULT_THEMES.map( ( opt ) => ( { value: opt.value, name: opt.label } ) ),
                                                ...( userPresets.length > 0
                                                    ? userPresets.map( ( p ) => ( { value: `preset:${ p.id }`, name: p.name } ) )
                                                    : [] ),
                                            ],
                                            key: "theme",
                                            value: settings.activePresetId ? `preset:${ settings.activePresetId }` : settings.theme,
                                            initialData: settings.activePresetId ? `preset:${ settings.activePresetId }` : settings.theme,
                                            handleChange: ( key, value ) => handleThemeSelect( value ),
                                            className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                        } ) }
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Preset Name</Label>
                                        <Input
                                            value={ presetName }
                                            onChange={ ( e ) => setPresetName( e.target.value ) }
                                            placeholder="Theme name"
                                            className="h-7 text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Use Save or Save as Preset to store your current configuration.
                                        </p>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <Button className="h-8" onClick={ () => settings.saveTheme( presetName ) }>
                                            <Save className="size-3 aspect-square mr-1" /> Save Theme
                                        </Button>
                                        <Button
                                            className="h-8 bg-transparent"
                                            variant="outline"
                                            onClick={ () => settings.saveThemeAsPreset( presetName ) }
                                        >
                                            <Sparkles className="size-3 aspect-square mr-1" /> Save as Preset
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sub-tabs under Appearance */ }
                            <Tabs defaultValue="general" className="space-y-3">
                                <TabsList className="rounded-lg">
                                    <TabsTrigger className="!h-full rounded-lg" value="general">
                                        General
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="page-colors">
                                        Page Colors
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="intents">
                                        Intents
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="sidebar-colors">
                                        Sidebar
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="typography">
                                        Typography
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="layout">
                                        Layout
                                    </TabsTrigger>
                                    <TabsTrigger className="!h-full rounded-lg" value="cards">
                                        Cards
                                    </TabsTrigger>
                                </TabsList>

                                {/* General */ }
                                <TabsContent value="general" className="mt-0">
                                    <Card className="gradient-card border-border/50 card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm">General Appearance</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">High Contrast Mode</Label>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Increase contrast</span>
                                                    <Switch
                                                        checked={ settings.highContrastMode }
                                                        onCheckedChange={ ( checked ) => settings.updateSetting( "highContrastMode", checked ) }
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Animations</Label>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        { settings.animationsEnabled ? "Enabled" : "Disabled" }
                                                    </span>
                                                    <Switch
                                                        checked={ settings.animationsEnabled }
                                                        onCheckedChange={ ( checked ) => settings.updateSetting( "animationsEnabled", checked ) }
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Reduced Motion</Label>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Minimize animation</span>
                                                    <Switch
                                                        checked={ settings.reducedMotion }
                                                        onCheckedChange={ ( checked ) => settings.updateSetting( "reducedMotion", checked ) }
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-3">
                                                <Card className="gradient-card border-border/50 card-compact">
                                                    <CardHeader>
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <PaintBucket className="h-4 w-4" />
                                                            Quick Colors
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <ColorField
                                                            label="Background"
                                                            value={ settings.backgroundColor }
                                                            onChange={ ( hex ) => settings.updateSetting( "backgroundColor", hex ) }
                                                        />
                                                        <ColorField
                                                            label="Text"
                                                            value={ settings.textColor }
                                                            onChange={ ( hex ) => settings.updateSetting( "textColor", hex ) }
                                                        />
                                                        <ColorField
                                                            label="Primary"
                                                            value={ settings.primaryColor }
                                                            onChange={ ( hex ) => settings.updateSetting( "primaryColor", hex ) }
                                                        />
                                                        <ColorField
                                                            label="Secondary"
                                                            value={ settings.secondaryColor }
                                                            onChange={ ( hex ) => settings.updateSetting( "secondaryColor", hex ) }
                                                        />
                                                        <ColorField
                                                            label="Accent"
                                                            value={ settings.accentColor }
                                                            onChange={ ( hex ) => settings.updateSetting( "accentColor", hex ) }
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Page Colors */ }
                                <TabsContent value="page-colors" className="mt-0 space-y-3">
                                    <Card className="gradient-card border-border card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Surfaces</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            { surfacePairs.map( ( p ) => (
                                                <div key={ p.bg } className="grid grid-cols-2 gap-3">
                                                    <ColorField
                                                        label={ `${ p.label } BG` }
                                                        value={ settings?.colorsHex?.[ p.bg ] || "" }
                                                        onChange={ ( hex ) => settings.setColorHex( p.bg, hex ) }
                                                    />
                                                    <ColorField
                                                        label={ `${ p.label } FG` }
                                                        value={ settings?.colorsHex?.[ p.fg ] || "" }
                                                        onChange={ ( hex ) => settings.setColorHex( p.fg, hex ) }
                                                    />
                                                </div>
                                            ) ) }
                                            { lineColors.map( ( c ) => (
                                                <ColorField
                                                    key={ c.key }
                                                    label={ c.label }
                                                    value={ settings?.colorsHex?.[ c.key ] || "" }
                                                    onChange={ ( hex ) => settings.setColorHex( c.key, hex ) }
                                                />
                                            ) ) }
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Intents */ }
                                <TabsContent value="intents" className="mt-0">
                                    <Card className="gradient-card border-border/50 card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Intents</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            { intentPairs.map( ( p ) => (
                                                <div key={ p.bg } className="grid grid-cols-2 gap-3">
                                                    <ColorField
                                                        label={ `${ p.label } BG` }
                                                        value={ settings?.colorsHex?.[ p.bg ] || "" }
                                                        onChange={ ( hex ) => settings.setColorHex( p.bg, hex ) }
                                                    />
                                                    <ColorField
                                                        label={ `${ p.label } FG` }
                                                        value={ settings?.colorsHex?.[ p.fg ] || "" }
                                                        onChange={ ( hex ) => settings.setColorHex( p.fg, hex ) }
                                                    />
                                                </div>
                                            ) ) }
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Sidebar Colors */ }
                                <TabsContent value="sidebar-colors" className="mt-0">
                                    <Card className="gradient-card border-border/50 card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Sidebar</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            { sidebarPairs.map( ( p ) => (
                                                <ColorField
                                                    key={ p.key }
                                                    label={ p.label }
                                                    value={ settings?.colorsHex?.[ p.key ] || "" }
                                                    onChange={ ( hex ) => settings.setColorHex( p.key, hex ) }
                                                />
                                            ) ) }
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Typography */ }
                                <TabsContent value="typography" className="mt-0">
                                    <Card className="gradient-card border-border/50 card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Typography</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Font Family</Label>
                                                { buildSelect( {
                                                    placeholder: "Font Family",
                                                    opts: [
                                                        { value: "Inter, sans-serif", name: "Inter" },
                                                        { value: "'Roboto', sans-serif", name: "Roboto" },
                                                        { value: "'Open Sans', sans-serif", name: "Open Sans" },
                                                        { value: "'Montserrat', sans-serif", name: "Montserrat" },
                                                        { value: "'SF Pro Display', sans-serif", name: "SF Pro" },
                                                    ],
                                                    key: "fontFamily",
                                                    value: settings.fontFamily,
                                                    initialData: settings.fontFamily,
                                                    handleChange: ( key, value ) => settings.updateSetting( "fontFamily", value ),
                                                    className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                                } ) }
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Font Size</Label>
                                                { buildSelect( {
                                                    placeholder: "Font Size",
                                                    opts: [
                                                        { value: "small", name: "Small" },
                                                        { value: "medium", name: "Medium" },
                                                        { value: "large", name: "Large" },
                                                        { value: "x-large", name: "Extra Large" },
                                                    ],
                                                    key: "fontSize",
                                                    value: settings.fontSize,
                                                    initialData: settings.fontSize,
                                                    handleChange: ( key, value ) => settings.updateSetting( "fontSize", value ),
                                                    className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                                } ) }
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Font Weight</Label>
                                                { buildSelect( {
                                                    placeholder: "Font Weight",
                                                    opts: [
                                                        { value: "light", name: "Light" },
                                                        { value: "normal", name: "Normal" },
                                                        { value: "medium", name: "Medium" },
                                                        { value: "bold", name: "Bold" },
                                                    ],
                                                    key: "fontWeight",
                                                    value: settings.fontWeight,
                                                    initialData: settings.fontWeight,
                                                    handleChange: ( key, value ) => settings.updateSetting( "fontWeight", value ),
                                                    className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                                } ) }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Layout */ }
                                <TabsContent value="layout" className="mt-0 space-y-3">
                                    <Card className="gradient-card border-border/50 card-compact">
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <SlidersHorizontal className="h-4 w-4" />
                                                Density & Spacing
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">UI Density</Label>
                                                { buildSelect( {
                                                    placeholder: "UI Density",
                                                    opts: [
                                                        { value: "compact", name: "Compact" },
                                                        { value: "default", name: "Default" },
                                                        { value: "comfortable", name: "Comfortable" },
                                                    ],
                                                    key: "uiDensity",
                                                    value: settings.uiDensity,
                                                    initialData: settings.uiDensity,
                                                    handleChange: ( key, value ) => settings.updateSetting( "uiDensity", value ),
                                                    className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                                } ) }
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">
                                                    Padding Scale: { settings.paddingScale.toFixed( 2 ) }x
                                                </Label>
                                                <input
                                                    type="range"
                                                    min={ 0.6 }
                                                    max={ 1.6 }
                                                    step={ 0.05 }
                                                    value={ settings.paddingScale }
                                                    onChange={ ( e ) => settings.updateSetting( "paddingScale", Number.parseFloat( e.target.value ) ) }
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Margin Scale: { settings.marginScale.toFixed( 2 ) }x</Label>
                                                <input
                                                    type="range"
                                                    min={ 0.6 }
                                                    max={ 1.6 }
                                                    step={ 0.05 }
                                                    value={ settings.marginScale }
                                                    onChange={ ( e ) => settings.updateSetting( "marginScale", Number.parseFloat( e.target.value ) ) }
                                                    className="w-full"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        {/* Notifications */ }
                        <TabsContent value="notifications" className="mt-0 space-y-3">
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">General Notification Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Enable Notifications</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Receive notifications</span>
                                            <Switch
                                                checked={ settings.notificationsEnabled }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "notificationsEnabled", checked ) }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Play Sound</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Audio for alerts</span>
                                            <Switch
                                                checked={ settings.notificationSound }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "notificationSound", checked ) }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Frequency</Label>
                                        { buildSelect( {
                                            placeholder: "Frequency",
                                            opts: [
                                                { value: "immediately", name: "Immediately" },
                                                { value: "hourly", name: "Hourly Digest" },
                                                { value: "daily", name: "Daily Digest" },
                                                { value: "weekly", name: "Weekly Digest" },
                                            ],
                                            key: "notificationFrequency",
                                            value: settings.notificationFrequency || "immediately",
                                            initialData: settings.notificationFrequency || "immediately",
                                            handleChange: ( key, value ) => settings.updateSetting( "notificationFrequency", value ),
                                            className: "w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs",
                                        } ) }
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Email Notifications */ }
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Email Address</Label>
                                            <Input
                                                type="email"
                                                defaultValue={ emailNotifications.contact }
                                                onChange={ ( e ) => setEmailContact( e.target.value ) }
                                                placeholder="your@email.com"
                                                className="h-7 text-xs"
                                            />
                                            <Button
                                                variant={ `ghost` }
                                                size={ `icon` }
                                                onClick={ () => handleUpdateEmailContact( emailContact ) }
                                            >
                                                <SaveIcon className={ `size-4 aspect-square` } />
                                            </Button>
                                            { emailNotifications.contact && !emailNotifications.verified && (
                                                <p className="text-[10px] text-yellow-600">Email not verified</p>
                                            ) }
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Enable Email Notifications</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    { emailNotifications.enabled ? "Enabled" : "Disabled" }
                                                </span>
                                                <Switch checked={ emailNotifications.enabled } onCheckedChange={ handleEmailOptIn } />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SMS Notifications */ }
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        SMS Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Phone Number</Label>
                                            <Input
                                                type="tel"
                                                defaultValue={ smsNotifications.contact }
                                                onChange={ ( e ) => setSMSContact( e.target.value ) }
                                                placeholder="+1234567890"
                                                className="h-7 text-xs"
                                            />
                                            <Button
                                                variant={ `ghost` }
                                                size={ `icon` }
                                                onClick={ () => handleUpdateSMSContact( SMSContact ) }
                                            >
                                                <SaveIcon className={ `size-4 aspect-square` } />
                                            </Button>
                                            { smsNotifications.contact && !smsNotifications.verified && (
                                                <p className="text-[10px] text-yellow-600">Phone number not verified</p>
                                            ) }
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Enable SMS Notifications</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    { smsNotifications.enabled ? "Enabled" : "Disabled" }
                                                </span>
                                                <Switch checked={ smsNotifications.enabled } onCheckedChange={ handleSmsOptIn } />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Push Notifications */ }
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        Push Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Enable Desktop Push Notifications</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                { pushNotifications.permission === "granted"
                                                    ? "Granted"
                                                    : pushNotifications.permission === "denied"
                                                        ? "Denied"
                                                        : "Not requested" }
                                            </span>
                                            <Switch checked={ pushNotifications.enabled } onCheckedChange={ handlePushOptIn } />
                                        </div>
                                        { pushNotifications.permission === "denied" && (
                                            <p className="text-[10px] text-red-600">
                                                Push notifications are blocked. Please enable them in your browser settings.
                                            </p>
                                        ) }
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Toast/Alert Notifications */ }
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Toast & Alert Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Enable Toast/Alert Notifications</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                { toastNotifications.enabled ? "Enabled" : "Disabled" }
                                            </span>
                                            <Switch
                                                checked={ toastNotifications.enabled }
                                                onCheckedChange={ ( enabled ) => updateToastNotifications( { enabled } ) }
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Show in-app toast messages and alert dialogs</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Integrations */ }
                        <TabsContent value="integrations" className="mt-0">
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <div className="flex flex-row justify-between">
                                        <CardTitle className="text-sm">Integrations</CardTitle>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-7 aspect-square rounded-lg"
                                            onClick={ () => {
                                                if (
                                                    window.confirm(
                                                        "Are you sure you want to reset your integrations and API keys? This is a non recoverable change.",
                                                    )
                                                ) {
                                                    try {
                                                        settings.updateIntegrations( "reset", "", "", 0 );
                                                    } catch ( error ) {
                                                        console.error( "ERROR: Failed to reset settings: ", error );
                                                    }
                                                }
                                            } }
                                        >
                                            <RefreshCwIcon className="size-4 aspect-square" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="gap-2">
                                    { Object.keys( settings?.integrations )?.map( ( key ) => {
                                        const typeDetails = settings?.integrations?.[ key ];
                                        const actions = Object.keys( typeDetails );

                                        if ( actions && Array.isArray( actions ) && actions.length > 0 ) {
                                            return (
                                                <div key={ key } className="flex flex-col w-full">
                                                    <Label className="text-xs font-medium">{ caseCamelToSentence( key ) }</Label>
                                                    <div className="flex flex-col w-full">
                                                        { actions.map( ( action ) => {
                                                            const actionValue = typeDetails?.[ action ];

                                                            return (
                                                                <div
                                                                    key={ `settings-integrations-${ action }-${ key }` }
                                                                    className="flex items-center justify-between gap-2 rounded-md p-2"
                                                                >
                                                                    <div className="grid grid-cols-6 space-y-1 w-full">
                                                                        <Label className="col-span-1 text-xs font-medium">
                                                                            { caseCamelToSentence( action ) }
                                                                        </Label>

                                                                        <div className="col-span-5 flex-col w-full">
                                                                            { utils.val.isValidArray( actionValue, true ) ? (
                                                                                <div className="">
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="size-7 aspect-square bg-transparent"
                                                                                        onClick={ () => {
                                                                                            settings.updateIntegrations( key, `add-${ action }`, "" );
                                                                                        } }
                                                                                    >
                                                                                        <PlusIcon className="size-4 aspect-square" />
                                                                                    </Button>
                                                                                    { actionValue.map( ( val, valIndex ) => {
                                                                                        return (
                                                                                            <div key={ valIndex } className="col-span-3 flex-col w-full">
                                                                                                <p className="w-full max-w-full truncate overflow-ellipsis">{ val }</p>
                                                                                                <div className="flex-row w-full items-center justify-center">
                                                                                                    <Input
                                                                                                        value={ val }
                                                                                                        onChange={ ( e ) => {
                                                                                                            settings.updateIntegrations(
                                                                                                                key,
                                                                                                                `update-${ action }`,
                                                                                                                e.target.value,
                                                                                                                valIndex,
                                                                                                            );
                                                                                                        } }
                                                                                                        placeholder={ `${ key }-${ action }` }
                                                                                                        className="h-7 w-full flex-grow text-xs"
                                                                                                    />
                                                                                                    <Button
                                                                                                        size="icon"
                                                                                                        variant="outline"
                                                                                                        className="size-7 aspect-square bg-transparent"
                                                                                                        onClick={ () => {
                                                                                                            settings.updateIntegrations( key, `remove-${ action }`, "", valIndex );
                                                                                                        } }
                                                                                                    >
                                                                                                        <XIcon className="size-4 aspect-square" />
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    } ) }
                                                                                </div>
                                                                            ) : (
                                                                                <Input
                                                                                    defaultValue={ actionValue }
                                                                                    onChange={ ( e ) => settings.updateIntegrations( key, action, e.target.value ) }
                                                                                    placeholder={ `${ key }-${ action }` }
                                                                                    className="h-7 w-full flex-grow text-xs"
                                                                                />
                                                                            ) }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        } ) }
                                                    </div>
                                                </div>
                                            );
                                        }
                                    } ) }
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Accessibility */ }
                        <TabsContent value="accessibility" className="mt-0">
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Accessibility Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">High Contrast Mode</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Increase contrast</span>
                                            <Switch
                                                checked={ settings.highContrastMode }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "highContrastMode", checked ) }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Animations</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                { settings.animationsEnabled ? "Enabled" : "Disabled" }
                                            </span>
                                            <Switch
                                                checked={ settings.animationsEnabled }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "animationsEnabled", checked ) }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Reduced Motion</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Minimize animation</span>
                                            <Switch
                                                checked={ settings.reducedMotion }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "reducedMotion", checked ) }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Page Visibility</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    { pageKeys.map( ( pageKey ) => (
                                        <div key={ pageKey } className="space-y-1">
                                            <Label className="text-xs font-medium">{ caseCamelToSentence( pageKey ) }</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    { settings.enabledPages[ pageKey ] ? "Visible" : "Hidden" }
                                                </span>
                                                <Switch
                                                    checked={ settings.enabledPages[ pageKey ] }
                                                    onCheckedChange={ ( checked ) => settings.updateNestedSetting( "enabledPages", pageKey, checked ) }
                                                />
                                            </div>
                                        </div>
                                    ) ) }
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Advanced */ }
                        <TabsContent value="advanced" className="mt-0 space-y-3">
                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Advanced</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Developer Mode</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Enable advanced features</span>
                                            <Switch
                                                checked={ settings.developerMode }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "developerMode", checked ) }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Experimental Features</Label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Try upcoming features</span>
                                            <Switch
                                                checked={ settings.experimentalFeatures }
                                                onCheckedChange={ ( checked ) => settings.updateSetting( "experimentalFeatures", checked ) }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gradient-card border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Custom CSS</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        value={ settings.customCSS }
                                        onChange={ ( e ) => settings.updateSetting( "customCSS", e.target.value ) }
                                        className="w-full min-h-[140px] rounded-md border border-input bg-background p-2 text-xs font-mono"
                                        placeholder="/* Add your custom CSS here */"
                                    />
                                    <div className="pt-2 flex justify-between">
                                        <Button
                                            variant="outline"
                                            className="h-7 text-xs bg-transparent"
                                            onClick={ () => settings.resetToDefaults() }
                                        >
                                            Reset All Settings
                                        </Button>
                                        <Button className="h-7 text-xs" onClick={ () => settings.applySettings() }>
                                            Apply Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}
