"use client";

import { ZUSTAND_SETTINGS_STORE_BACKUP_NAME } from "@/lib/config/constants";
import useGlobalStore from "@/store/global.store";
import { useSettingsStore } from "@/store/settings.store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

/* export interface UserSettings {
    avatar: string;
    fullName: string;
    email: string;
    phone: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    fontSize: number;
    theme: "light" | "dark" | "system";
    layout: "default" | "compact" | "expanded";
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        accountActivity: boolean;
        newFeatures: boolean;
        marketing: boolean;
        frequency: "real-time" | "daily" | "weekly";
        quietHoursStart: string;
        quietHoursEnd: string;
    };
    privacy: {
        analyticsSharing: boolean;
        personalizedAds: boolean;
        visibility: "public" | "private";
        dataRetention: "6-months" | "1-year" | "2-years" | "indefinite";
    };
}
 */
const defaultSettings = {
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    fullName: "Dollar Singh",
    email: "dollar.singh@example.com",
    phone: "+1 (555) 123-4567",
    timezone: "utc-8",
    language: "en",
    currency: "usd",
    dateFormat: "mm-dd-yyyy",
    fontSize: 16,
    theme: "system",
    layout: "default",
    notifications: {
        email: true,
        push: true,
        sms: false,
        accountActivity: true,
        newFeatures: true,
        marketing: false,
        frequency: "real-time",
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
    },
    privacy: {
        analyticsSharing: true,
        personalizedAds: false,
        visibility: "public",
        dataRetention: "1-year",
    },
};

/* interface SettingsContextType {
    settings: UserSettings;
    updateSettings: ( newSettings: Partial<UserSettings> ) => void;
    updateNotificationSettings: ( settings: Partial<UserSettings[ "notifications" ]> ) => void;
    updatePrivacySettings: ( settings: Partial<UserSettings[ "privacy" ]> ) => void;
} */

const gradients = {
    spectrum: [
        '#000000',
        '#01031f',
        '#010335',
        '#1c024e',
        '#50026e',
        '#8f0385',
        '#b50367',
        '#e5032e',
        '#fc491f',
        '#fdad51',
        '#fef48b',
        '#effecb',
        '#f2f4ec',
    ]
};

const SettingsContext = createContext( undefined );

export function SettingsProvider ( { children } ) {
    const settings = useSettingsStore();
    const {
        theme,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        colorsHex,
        fontFamily,
        fontSize,
        fontWeight,
        uiDensity,
        paddingScale,
        marginScale,
        borderRadius,
        borderRadiusPx,
        borderSize,
        boxShadowStrength,
        animationsEnabled,
        highContrastMode,
        reducedMotion,
        sidebarCollapsed,
        sidebarPosition,
        headerHeight,
        enabledPages,
        notificationsEnabled,
        notificationSound,
        developerMode,
        experimentalFeatures,
        customCSS,
        activePresetId,
        themePresets,
        savedTheme,
        themeDefinitions,
        integrations, setIntegrations,
        updateIntegrations,
        scheduleApply,
        updateSetting,
        updateSettings: updateSettingsState,
        updateNestedSetting, setColorHex,
        getThemePayloadFromState,
        saveTheme,
        saveThemeAsPreset,
        applyPreset,
        getCssVariables,
        applySettings,
        clearCustomColors,
        resetToDefaults,

        loadingSettings, setLoadingSettings,
        errorSettings, setErrorSettings
    } = useSettingsStore();


    const {
        debug, setDebug,
        data,
        getData, setData,
        user, setUser,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    // const [ settings, setSettings ] = useState( () => {
    //     // Try to load settings from localStorage during initialization
    //     if ( typeof window !== "undefined" ) {
    //         const savedSettings = localStorage.getItem( "userSettings" );
    //         if ( savedSettings ) {
    //             return JSON.parse( savedSettings );
    //         }
    //     }
    //     return defaultSettings;
    // } );

    // Save settings to localStorage whenever they change
    useEffect( () => {
        localStorage.setItem( ZUSTAND_SETTINGS_STORE_BACKUP_NAME, JSON.stringify( settings ) );
    }, [ settings ] );

    useEffect( () => {
        console.log( "SettingsContext :: applying settings on initial load." );
        settings.applySettings();
    }, [] );

    const updateSettings = ( newSettings ) => {
        settings.updateSettings( newSettings );
        // setSettings( ( prev ) => ( { ...prev, ...newSettings } ) );
    };

    const updateNotificationSettings = ( notificationSettings ) => {
        settings.updateSetting( 'notifications', notificationSettings );
        // setSettings( ( prev ) => ( {
        //     ...prev,
        //     notifications: { ...prev.notifications, ...notificationSettings },
        // } ) );
    };

    const updatePrivacySettings = ( privacySettings ) => {
        settings.updateSetting( 'privacy', privacySettings );
        // setSettings( ( prev ) => ( {
        //     ...prev,
        //     privacy: { ...prev.privacy, ...privacySettings },
        // } ) );
    };

    const handleBackupSettings = useCallback( async () => {
        setLoadingSettings( true );
        try {
            const result = await updateSettings( {
                userId: user.id || null,
                data: settings,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            console.log( "useSettings.js :: handleBackupSettings :: backing up user's settings :: result = ", result );
        } catch ( error ) {
            console.error( "useSettings.js :: handleBackupSettings :: ERROR backing up user's settings :: error = ", error );
        } finally {
            setLoadingSettings( false );
        }
    }, [ user, workspaceId, theme ] );

    const handleSaveSettings = useCallback( async () => {
        // Save settings to server.
        setLoadingSettings( true );
        try {
            const result = await saveSettings( {
                userId: user.id || null,
                data: settings,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            console.log( "useSettings.js :: handleSaveSettings :: saving user's settings :: result = ", result );
        } catch ( error ) {
            console.error( "useSettings.js :: handleSaveSettings :: ERROR saving user's settings :: error = ", error );
        } finally {
            setLoadingSettings( false );
        }
    }, [ user, workspaceId, theme, settings ] );

    const handleFetchSettings = useCallback( async () => {
        setLoadingSettings( true );
        const result = await fetchSettings( {
            userId: user.id || null,
            workspaceId,
            stateSetter: ( result ) => {
                if ( utils.val.isDefined( result ) ) {
                    updateSettings( result );
                    return result;
                }
            },
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );
        console.log( "useSettings.js :: Fetching user's settings :: result = ", result, " :: ", "workspaceId = '", workspaceId, "'" );

        setLoadingSettings( false );
        if ( utils.val.isDefined( result ) ) {
            updateSettings( result );
            return result;
        }
        else {
            return null;
        }
    }, [ settings ] );

    return (
        <SettingsContext.Provider
            value={ {
                ...settings,
                updateSettings,
                updateNotificationSettings,
                updatePrivacySettings,
                handleBackupSettings,
                handleSaveSettings,
                handleFetchSettings,
            } }
        >
            { children }
        </SettingsContext.Provider>
    );
}

export function useSettingsContext () {
    const context = useContext( SettingsContext );
    if ( context === undefined ) {
        throw new Error( "useSettingsContext must be used within a SettingsProvider" );
    }
    return context;
}

