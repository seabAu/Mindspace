import React, { useContext, createContext, useEffect, useState } from 'react';
import { THEME_MODES, THEME_STORAGE_NAME } from '../config/constants';
import { useSettingsStore } from '@/store/settings.store';

const ThemeContext = createContext();

const ThemeProvider = ( {
    children,
    defaultTheme = "system",
    storageKey = THEME_STORAGE_NAME,
    ...props
} ) => {
    const modes = THEME_MODES;

    const settings = useSettingsStore();

    const [ theme, setTheme ] = useState(
        () => settings?.theme
            ? settings?.theme
            : ( localStorage.getItem( storageKey )
                ? localStorage.getItem( storageKey )
                : defaultTheme
            )
    );

    useEffect( () => {
        const root = window.document.documentElement;

        root.classList.remove( "light", "dark" );

        if ( theme === "system" ) {
            const systemTheme = window.matchMedia( "(prefers-color-scheme: dark)" )
                .matches
                ? "dark"
                : "light";

            root.classList.add( systemTheme );
            return;
        }

        root.classList.add( theme );
    }, [ theme ] );

    const value = {
        theme,
        setTheme: ( theme ) => {
            localStorage.setItem( storageKey, theme );
            setTheme( theme );
        },
    };

    return (
        <ThemeContext.Provider { ...props } value={ value }>
            { children }
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext( ThemeContext );

    if ( context === undefined )
        throw new Error( "useTheme must be used within a ThemeProvider" );

    return context;
};

export default ThemeProvider;