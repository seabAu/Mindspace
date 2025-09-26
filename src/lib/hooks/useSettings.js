"use client";
import React, { useCallback, useState } from 'react';
import * as utils from 'akashatools';
import { useSettingsStore } from '@/store/settings.store';
import { fetchSettings, saveSettings } from '../services/settingsService';
import useGlobalStore from '@/store/global.store';
import useError from './useError';

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

/**
 * Custom hook for managing settings operations
 * @returns {Object} Settings operations and state
 */
const useSettings = ( useSuccessToast = true, useErrorToast = true ) => {
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
        integrations,
        setIntegrations,
        updateIntegrations,
        scheduleApply,
        updateSetting,
        updateSettings,
        updateNestedSetting,
        setColorHex,
        getThemePayloadFromState,
        saveTheme,
        saveThemeAsPreset,
        applyPreset,
        getCssVariables,
        applySettings,
        clearCustomColors,
        resetToDefaults,
        loadingSettings,
        setLoadingSettings,
        errorSettings,
        setErrorSettings,
    } = useSettingsStore();

    const {
        debug,
        setDebug,
        data,
        getData,
        setData,
        user,
        setUser,
        workspacesData,
        setWorkspacesData,
        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
    } = useGlobalStore();

    const {
        // error, setError,
        // loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError( useSuccessToast, useErrorToast );

    /**
     * Handles successful operations
     * @param {any} result - Operation result
     */
    const handleSettingsSuccessCallback = useCallback(
        ( result ) => {
            console.log( "useSettings.js :: Operation successful:", result );
            handleSuccessCallback( result, useSuccessToast || true );
            setErrorSettings( false );
        },
        [ setErrorSettings ],
    );

    /**
     * Handles error operations
     * @param {Error} error - Error object
     */
    const handleSettingsErrorCallback = useCallback(
        ( error ) => {
            console.error( "useSettings.js :: Operation failed:", error );
            handleErrorCallback( result, useErrorToast || true );
            setErrorSettings( true );
        },
        [ setErrorSettings ],
    );

    /**
     * Backs up settings to server
     * @returns {Promise} Backup operation promise
     */
    const handleBackupSettings = useCallback( async () => {
        if ( !utils.val.isDefined( user ) ) {
            // Can't fetch settings, no user selected.
            console.error( "useSettings :: handleBackupSettings :: user is not defined, cannot back up settings." );
            return null;
        }
        setLoadingSettings( true );
        try {
            // Mock backup operation - replace with actual API call
            const settingsData = settings.getSettingsConfig();

            // Simulate API call
            // await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
            const result = await updateSettings( {
                userId: user.id || null,
                data: settings,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );

            console.log( "useSettings.js :: handleSaveSettings :: backing up user's settings :: data = ", settingsData, " :: ", "result = ", result );
            handleSuccessCallback( "Settings backed up successfully" );

            return settingsData;
        } catch ( error ) {
            console.error( "useSettings.js :: handleBackupSettings :: ERROR backing up user's settings :: error =", error );
            handleErrorCallback( error );
            throw error;
        } finally {
            setLoadingSettings( false );
        }
    }, [ settings, handleSuccessCallback, handleErrorCallback, setLoadingSettings ] );

    /**
     * Saves settings to server
     * @returns {Promise} Save operation promise
     */
    const handleSaveSettings = useCallback( async () => {
        if ( !utils.val.isDefined( user ) ) {
            // Can't fetch settings, no user selected.
            console.error( "useSettings :: handleSaveSettings :: user is not defined, cannot save settings." );
            return null;
        }
        setLoadingSettings( true );
        try {
            const settingsData = settings.getSettingsConfig();

            // Mock save operation - replace with actual API call
            // await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
            const result = await updateSettings( {
                userId: user.id || null,
                data: settingsData,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );

            console.log( "useSettings.js :: handleSaveSettings :: saving user's settings :: data = ", settingsData, " :: ", "result = ", result );
            handleSuccessCallback( "Settings saved successfully" );

            return settingsData;
        } catch ( error ) {
            console.error( "useSettings.js :: handleSaveSettings :: ERROR saving user's settings :: error = ", error );
            handleErrorCallback( error );
            throw error;
        } finally {
            setLoadingSettings( false );
        }
    }, [ settings, user, workspaceId, handleSuccessCallback, handleErrorCallback, setLoadingSettings ] );

    /**
     * Fetches settings from server
     * @returns {Promise} Fetch operation promise
     */
    const handleFetchSettings = useCallback( async () => {
        if ( !utils.val.isDefined( user ) ) {
            // Can't fetch settings, no user selected.
            console.error( "useSettings :: handleFetchSettings :: user is not defined, cannot fetch settings." );
            return null;
        }
        setLoadingSettings( true );
        try {
            // Mock fetch operation - replace with actual API call
            // await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

            // Mock settings data
            const mockSettings = {
                theme: "dark",
                fontSize: "medium",
                fontFamily: "Inter, sans-serif",
                notificationsEnabled: true,
                // Add more mock settings as needed
            };

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

            console.log( "useSettings.js :: handleFetchSettings :: fetching user's settings :: result =", result );

            if ( utils.val.isDefined( result ) ) {
                settings.updateSettings( result );
                handleSuccessCallback( "Settings fetched successfully" );
                return result;
            } else {
                handleErrorCallback( new Error( "No settings data received" ) );
                return null;
            }
        } catch ( error ) {
            console.error( "useSettings.js :: handleFetchSettings :: ERROR fetching user's settings :: error =", error );
            handleErrorCallback( error );
            throw error;
        } finally {
            setLoadingSettings( false );
        }
    }, [ settings, user, workspaceId, handleSuccessCallback, handleErrorCallback, setLoadingSettings ] );

    /**
     * Exports settings to JSON file
     * @returns {void}
     */
    const handleExportSettings = useCallback( () => {
        try {
            const settingsData = settings.getSettingsConfig();
            const dataStr = JSON.stringify( settingsData, null, 2 );
            const dataBlob = new Blob( [ dataStr ], { type: "application/json" } );

            const url = URL.createObjectURL( dataBlob );
            const link = document.createElement( "a" );
            link.href = url;
            link.download = `settings-export-${ new Date().toISOString().split( "T" )[ 0 ] }.json`;
            document.body.appendChild( link );
            link.click();
            document.body.removeChild( link );
            URL.revokeObjectURL( url );

            handleSuccessCallback( "Settings exported successfully" );
        } catch ( error ) {
            console.error( "useSettings.js :: handleExportSettings :: ERROR exporting settings:", error );
            handleErrorCallback( error );
        }
    }, [ settings, handleSuccessCallback, handleErrorCallback ] );

    /**
     * Imports settings from JSON file
     * @param {File} file - JSON file containing settings
     * @returns {Promise} Import operation promise
     */
    const handleImportSettings = useCallback(
        async ( file ) => {
            if ( !file || file.type !== "application/json" ) {
                handleErrorCallback( new Error( "Please select a valid JSON file" ) );
                return;
            }

            try {
                const text = await file.text();
                const importedSettings = JSON.parse( text );

                // Validate imported settings structure
                if ( typeof importedSettings !== "object" || importedSettings === null ) {
                    throw new Error( "Invalid settings file format" );
                }

                // Apply imported settings
                if ( importedSettings.themeSettings ) {
                    Object.entries( importedSettings.themeSettings ).forEach( ( [ key, value ] ) => {
                        settings.updateSetting( key, value );
                    } );
                }

                if ( importedSettings.accessibilitySettings ) {
                    Object.entries( importedSettings.accessibilitySettings ).forEach( ( [ key, value ] ) => {
                        settings.updateSetting( key, value );
                    } );
                }

                if ( importedSettings.notificationSettings ) {
                    Object.entries( importedSettings.notificationSettings ).forEach( ( [ key, value ] ) => {
                        settings.updateSetting( key, value );
                    } );
                }

                settings.applySettings();
                handleSuccessCallback( "Settings imported successfully" );
            } catch ( error ) {
                console.error( "useSettings.js :: handleImportSettings :: ERROR importing settings:", error );
                handleErrorCallback( error );
            }
        },
        [ settings, handleSuccessCallback, handleErrorCallback ],
    );

    /**
     * Resets settings to factory defaults
     * @returns {void}
     */
    const handleResetToDefaults = useCallback( () => {
        try {
            settings.resetToDefaults();
            handleSuccessCallback( "Settings reset to defaults" );
        } catch ( error ) {
            console.error( "useSettings.js :: handleResetToDefaults :: ERROR resetting settings:", error );
            handleErrorCallback( error );
        }
    }, [ settings, handleSuccessCallback, handleErrorCallback ] );

    return {
        // Settings state
        settings,
        loadingSettings,
        errorSettings,

        // Settings operations
        handleFetchSettings,
        handleBackupSettings,
        handleSaveSettings,
        handleExportSettings,
        handleImportSettings,
        handleResetToDefaults,

        // Direct settings access
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
        integrations,

        // Settings actions
        updateSetting,
        updateSettings,
        updateNestedSetting,
        setColorHex,
        saveTheme,
        saveThemeAsPreset,
        applyPreset,
        applySettings,
        clearCustomColors,
        resetToDefaults,
        updateIntegrations,
    };
};

export default useSettings;



// const [ settings, setSettings ] = useState( {
//     theme: {
//         background: 'bg-sextary-800',
//         color: "",
//     },
//     user: {},
//     layout: {},
//     options: {},
//     account: {},
//     notifications: {},
// } );

/* const handleChangeBackground = ( mode ) => {
    switch ( mode ) {
        case 'flat':
            setSettings( ( prev ) => {
                prev.theme.background = 'bg-sextary-800';
                return prev;
            } );
            break;

        case 'gradient1':
            setSettings( ( prev ) => {
                prev.theme.background = 'bg-sextary-600/10 !bg-opacity-10 bg-gradient-to-br from-primary-purple-800/10 via-bodyprimary/0 to-secondaryAlt-300/10';
                return prev;
            } );
            break;

        case 'gradient2':
            setSettings( ( prev ) => {
                prev.theme.background = `bg-sextary-400 p-0 m-0 from-orange-400 to-pink-500 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500`;
                return prev;
            } );
            break;

        default:
            setSettings( ( prev ) => {
                prev.theme.background = 'bg-sextary-800';
                return prev;
            } );
            break;
    }

}; */
