
import { useEffect } from "react";
import { ChartNetworkIcon, Cog, CogIcon, GlassWaterIcon, LucideFileQuestion, Moon, MoonIcon, Snowflake, SnowflakeIcon, Sun, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as utils from 'akashatools';
import useGlobalStore from "@/store/global.store";
import { twMerge } from "tailwind-merge";
import { CONTENT_HEADER_HEIGHT, THEME_MODES, THEME_STORAGE_NAME } from "@/lib/config/constants";
import { SETTINGS_DEFAULT_THEMES, useSettingsStore } from "@/store/settings.store";

export const ThemeToggle = ( props ) => {
    const {
        iconHeight = 0.8,
        iconWidth = 0.8,
        className = '',
    } = props;

    const {
        activePresetId,
        theme, applyPreset: setTheme,
        updateSetting,
    } = useSettingsStore();

    const modes = SETTINGS_DEFAULT_THEMES;
    let modepath = THEME_STORAGE_NAME;

    function handleThemeChange ( value ) {
        console.log( "ThemeToggle :: setThemeMode :: new theme set = ", value );
        if ( value.startsWith( "preset:" ) ) {
            const id = value.replace( "preset:", "" );
            setTheme( id );
        } else {
            updateSetting( "theme", value );
        }
    }

    const setThemeMode = ( mode ) => {
        console.log( "ThemeToggle :: setThemeMode :: new mode = ", mode );
        if ( modes.includes( mode ) ) {
            setTheme( mode.toString() );
            localStorage.setItem(
                THEME_STORAGE_NAME,
                theme, // JSON.stringify( theme ),
            );
        }
    };

    useEffect( () => {
        const loadTheme = () => {
            // Fetch theme from localstorage if exists. 
            if ( localStorage.getItem( THEME_STORAGE_NAME ) ) {
                setTheme( localStorage.getItem( THEME_STORAGE_NAME ) );
            }
            else {
                // None set; default to system settings.
                setTheme( 'system' );
            }
        };

        // Fetch theme on component load. 
        loadTheme();
    }, [] );

    const getThemeIcon = ( mode ) => {
        switch ( mode ) {
            case 'system':
                return ( <CogIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'light':
                return ( <Sun className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'dark':
                return ( <MoonIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'cool':
                return ( <SnowflakeIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'warm':
                return ( <SunIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'neumorphism':
                return ( <ChartNetworkIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'glassmorphism':
                return ( <GlassWaterIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            case 'system':
                return ( <CogIcon className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
            default:
                return ( <LucideFileQuestion className={ `aspect-square size-[${ iconWidth.toString() }rem] text-muted-foreground` } /> );
        }
    };

    return (
        <DropdownMenu
            className={ `` }
        >
            <DropdownMenuTrigger
                className={ `${ className }` }
                asChild
            >
                <Button
                    variant="outline"
                    // size="xs"
                    // style={ {
                    //     height: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                    //     maxHeight: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                    //     minHeight: `${ CONTENT_HEADER_HEIGHT }rem !important`,
                    // } }
                >
                    { getThemeIcon( theme ) }
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="flex items-center flex-col w-full p-0"
            >
                { modes.map( ( mode, index ) => {
                    return (
                        <DropdownMenuItem
                            key={ index }
                            onClick={ () => { handleThemeChange( mode.value ); } }
                            className={ twMerge(
                                `flex justify-start items-center w-full m-auto text-lg transition-color duration-200 ease-in-out font-semibold`,
                                "bg-background text-muted-foreground hover:bg-popover-foreground",
                            ) }
                        >
                            { getThemeIcon( mode.value ) }
                            { utils.str.toCapitalCase( mode.label ) }
                        </DropdownMenuItem>
                    );
                } ) }
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
