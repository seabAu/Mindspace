import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ZUSTAND_SETTINGS_STORE_DIRECTORY_NAME } from "@/lib/config/constants";
import { isInvalid } from "@/lib/utilities/data";
import * as utils from 'akashatools';
import { removeItem, uniqueArray } from "@/lib/utilities/array";
import useGlobalStore from "./global.store";

export const SETTINGS_DEFAULT_THEMES = [
    { value: "system", label: "System" },
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "cool", label: "Cool" },
    { value: "warm", label: "Warm" },
    { value: "neumorphism", label: "Neumorphism" },
    { value: "glassmorphism", label: "Glassmorphism" },
];

const borderRadiusVariantsMap = {
    'none': { "--radius": "0" },
    'xs': { "--radius-xs": "0.125rem" },
    'sm': { "--radius-sm": "0.25rem" },
    'md': { "--radius-md": "0.375rem" },
    'lg': { "--radius-lg": "0.5rem" },
    'xl': { "--radius-xl": "0.75rem" },
    '2xl': { "--radius-2xl": "1rem" },
    '3xl': { "--radius-3xl": "1.5rem" },
    '4xl': { "--radius-4xl": "2rem" },
    'full': { "--radius-full": "9999px" },
};

// ------------------------------------
// RAF scheduler and diff cache
// ------------------------------------
let rafId = null;

// ------------------------------------
// Validation & Utilities
// ------------------------------------
const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Validates if a string is a valid hex color
 * @param {string} hex - The hex color string to validate
 * @returns {boolean} True if valid hex color
 */
const isValidHex = ( hex ) => {
    return typeof hex === "string" && HEX_REGEX.test( hex.trim() );
};

/**
 * Expands 3-digit hex colors to 6-digit format
 * @param {string} hex - The hex color to expand
 * @returns {string} Expanded hex color
 */
const expandHex3To6 = ( hex ) => {
    const h = hex.replace( "#", "" );
    if ( h.length === 3 ) {
        return "#" + h[ 0 ] + h[ 0 ] + h[ 1 ] + h[ 1 ] + h[ 2 ] + h[ 2 ];
    }
    return hex.startsWith( "#" ) ? hex : "#" + h;
};

/**
 * Converts hex color to HSL color string
 * @param {string} hex - Hex color value
 * @returns {string|null} HSL color string or null if invalid
 */
const hexToHslString = ( hex ) => {
    if ( !isValidHex( hex ) ) return null;
    const full = expandHex3To6( hex ).replace( "#", "" );
    const r = Number.parseInt( full.substring( 0, 2 ), 16 ) / 255;
    const g = Number.parseInt( full.substring( 2, 4 ), 16 ) / 255;
    const b = Number.parseInt( full.substring( 4, 6 ), 16 ) / 255;

    const max = Math.max( r, g, b ),
        min = Math.min( r, g, b );
    let h,
        s,
        l = ( max + min ) / 2;

    if ( max === min ) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
        switch ( max ) {
            case r:
                h = ( g - b ) / d + ( g < b ? 6 : 0 );
                break;
            case g:
                h = ( b - r ) / d + 2;
                break;
            case b:
                h = ( r - g ) / d + 4;
                break;
        }
        h /= 6;
    }
    return `${ Math.round( h * 360 ) } ${ Math.round( s * 100 ) }% ${ Math.round( l * 100 ) }%`;
};

/**
 * Clamps a number between min and max values
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
const clamp = ( num, min, max ) => {
    const n = typeof num === "number" ? num : Number.parseFloat( num );
    if ( Number.isNaN( n ) ) return min;
    return Math.min( Math.max( n, min ), max );
};

/**
 * Ensures a value is in the allowed options array
 * @param {any} value - Value to check
 * @param {array} options - Array of allowed options
 * @param {any} fallback - Fallback value if not found
 * @returns {any} Valid option or fallback
 */
const ensureOption = ( value, options, fallback ) => {
    return options.includes( value ) ? value : fallback;
};

/**
 * Scales a rem value by a factor
 * @param {string} remString - Rem value string
 * @param {number} factor - Scale factor
 * @returns {string} Scaled rem value
 */
const scaleRem = ( remString, factor ) => {
    if ( typeof remString !== "string" || !remString.endsWith( "rem" ) ) return remString;
    const n = Number.parseFloat( remString.replace( "rem", "" ) );
    const scaled = ( n * factor ).toFixed( 4 );
    return `${ scaled }rem`;
};

/**
 * Validates email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = ( email ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === "string" && emailRegex.test( email.trim() );
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = ( phone ) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return typeof phone === "string" && phoneRegex.test( phone.replace( /[\s\-$$$$]/g, "" ) );
};

// Map color keys to CSS vars
const cssVarMap = {
    background: "--background",
    foreground: "--foreground",
    cardBg: "--card",
    cardFg: "--card-foreground",
    popoverBg: "--popover",
    popoverFg: "--popover-foreground",
    primary: "--primary",
    primaryFg: "--primary-foreground",
    secondary: "--secondary",
    secondaryFg: "--secondary-foreground",
    muted: "--muted",
    mutedFg: "--muted-foreground",
    accent: "--accent",
    accentFg: "--accent-foreground",
    destructive: "--destructive",
    destructiveFg: "--destructive-foreground",
    border: "--border",
    input: "--input",
    ring: "--ring",
    sidebarBackground: "--sidebar-background",
    sidebarForeground: "--sidebar-foreground",
    sidebarPrimary: "--sidebar-primary",
    sidebarPrimaryForeground: "--sidebar-primary-foreground",
    sidebarAccent: "--sidebar-accent",
    sidebarAccentForeground: "--sidebar-accent-foreground",
    sidebarBorder: "--sidebar-border",
    sidebarRing: "--sidebar-ring",
};

// Theme definitions
const themeDefinitions = {
    dark: {
        "--background": "hsl(20 10% 10%)",
        "--foreground": "hsl(20 10% 98%)",
        "--card": "hsl(20 10% 12%)",
        "--card-foreground": "hsl(20 10% 98%)",
        "--popover": "hsl(20 10% 12%)",
        "--popover-foreground": "hsl(20 10% 98%)",
        "--primary": "hsl(20 90% 60%)",
        "--primary-foreground": "hsl(20 10% 10%)",
        "--secondary": "hsl(20 20% 20%)",
        "--secondary-foreground": "hsl(20 10% 98%)",
        "--muted": "hsl(20 20% 20%)",
        "--muted-foreground": "hsl(20 10% 70%)",
        "--accent": "hsl(20 30% 30%)",
        "--accent-foreground": "hsl(20 10% 98%)",
        "--destructive": "hsl(0 62.8% 30.6%)",
        "--destructive-foreground": "hsl(20 10% 98%)",
        "--border": "hsl(20 20% 25%)",
        "--input": "hsl(20 20% 25%)",
        "--ring": "hsl(20 90% 60%)",
        "--sidebar-background": "hsl(20 15% 15%)",
        "--sidebar-foreground": "hsl(20 10% 90%)",
        "--sidebar-primary": "hsl(20 90% 60%)",
        "--sidebar-primary-foreground": "hsl(20 10% 10%)",
        "--sidebar-accent": "hsl(20 20% 25%)",
        "--sidebar-accent-foreground": "hsl(20 10% 98%)",
        "--sidebar-border": "hsl(20 20% 30%)",
        "--sidebar-ring": "hsl(20 90% 60%)",
    },
    light: {
        "--background": "hsl(0 0% 100%)",
        "--foreground": "hsl(240 10% 3.9%)",
        "--card": "hsl(0 0% 100%)",
        "--card-foreground": "hsl(240 10% 3.9%)",
        "--popover": "hsl(0 0% 100%)",
        "--popover-foreground": "hsl(240 10% 3.9%)",
        "--primary": "hsl(240 5.9% 10%)",
        "--primary-foreground": "hsl(0 0% 98%)",
        "--secondary": "hsl(240 4.8% 95.9%)",
        "--secondary-foreground": "hsl(240 5.9% 10%)",
        "--muted": "hsl(240 4.8% 95.9%)",
        "--muted-foreground": "hsl(240 3.8% 46.1%)",
        "--accent": "hsl(240 4.8% 95.9%)",
        "--accent-foreground": "hsl(240 5.9% 10%)",
        "--destructive": "hsl(0 84.2% 60.2%)",
        "--destructive-foreground": "hsl(0 0% 98%)",
        "--border": "hsl(0 0% 25%)",
        "--input": "hsl(240 5.9% 90%)",
        "--ring": "hsl(240 5.9% 10%)",
        "--sidebar-background": "hsl(0 0% 98%)",
        "--sidebar-foreground": "hsl(240 5.3% 26.1%)",
        "--sidebar-primary": "hsl(240 5.9% 10%)",
        "--sidebar-primary-foreground": "hsl(0 0% 98%)",
        "--sidebar-accent": "hsl(240 4.8% 95.9%)",
        "--sidebar-accent-foreground": "hsl(240 5.9% 10%)",
        "--sidebar-border": "hsl(220 13% 91%)",
        "--sidebar-ring": "hsl(217.2 91.2% 59.8%)",
    },
    cool: {
        "--background": "hsl(220 10% 10%)",
        "--foreground": "hsl(220 10% 98%)",
        "--card": "hsl(220 10% 12%)",
        "--card-foreground": "hsl(220 10% 98%)",
        "--popover": "hsl(220 10% 12%)",
        "--popover-foreground": "hsl(220 10% 98%)",
        "--primary": "hsl(220 90% 60%)",
        "--primary-foreground": "hsl(220 10% 10%)",
        "--secondary": "hsl(220 20% 20%)",
        "--secondary-foreground": "hsl(220 10% 98%)",
        "--muted": "hsl(220 20% 20%)",
        "--muted-foreground": "hsl(220 10% 70%)",
        "--accent": "hsl(220 30% 30%)",
        "--accent-foreground": "hsl(220 10% 98%)",
        "--destructive": "hsl(0 62.8% 30.6%)",
        "--destructive-foreground": "hsl(220 10% 98%)",
        "--border": "hsl(220 20% 25%)",
        "--input": "hsl(220 20% 25%)",
        "--ring": "hsl(220 90% 60%)",
        "--sidebar-background": "hsl(220 15% 15%)",
        "--sidebar-foreground": "hsl(220 10% 90%)",
        "--sidebar-primary": "hsl(220 90% 60%)",
        "--sidebar-primary-foreground": "hsl(220 10% 10%)",
        "--sidebar-accent": "hsl(220 20% 25%)",
        "--sidebar-accent-foreground": "hsl(220 10% 98%)",
        "--sidebar-border": "hsl(220 20% 30%)",
        "--sidebar-ring": "hsl(220 90% 60%)",
    },
    warm: {
        "--background": "hsl(30 10% 10%)",
        "--foreground": "hsl(30 10% 98%)",
        "--card": "hsl(30 10% 12%)",
        "--card-foreground": "hsl(30 10% 98%)",
        "--popover": "hsl(30 10% 12%)",
        "--popover-foreground": "hsl(30 10% 98%)",
        "--primary": "hsl(30 90% 60%)",
        "--primary-foreground": "hsl(30 10% 10%)",
        "--secondary": "hsl(30 20% 20%)",
        "--secondary-foreground": "hsl(30 10% 98%)",
        "--muted": "hsl(30 20% 20%)",
        "--muted-foreground": "hsl(30 10% 70%)",
        "--accent": "hsl(30 30% 30%)",
        "--accent-foreground": "hsl(30 10% 98%)",
        "--destructive": "hsl(0 62.8% 30.6%)",
        "--destructive-foreground": "hsl(30 10% 98%)",
        "--border": "hsl(30 20% 25%)",
        "--input": "hsl(30 20% 25%)",
        "--ring": "hsl(30 90% 60%)",
        "--sidebar-background": "hsl(30 15% 15%)",
        "--sidebar-foreground": "hsl(30 10% 90%)",
        "--sidebar-primary": "hsl(30 90% 60%)",
        "--sidebar-primary-foreground": "hsl(30 10% 10%)",
        "--sidebar-accent": "hsl(30 20% 25%)",
        "--sidebar-accent-foreground": "hsl(30 10% 98%)",
        "--sidebar-border": "hsl(30 20% 30%)",
        "--sidebar-ring": "hsl(30 90% 60%)",
    },
    neumorphism: {
        "--background": "hsl(220 20% 92%)",
        "--foreground": "hsl(220 20% 10%)",
        "--card": "hsl(220 20% 92%)",
        "--card-foreground": "hsl(220 20% 10%)",
        "--popover": "hsl(220 20% 92%)",
        "--popover-foreground": "hsl(220 20% 10%)",
        "--primary": "hsl(220 90% 50%)",
        "--primary-foreground": "hsl(220 20% 98%)",
        "--secondary": "hsl(220 20% 85%)",
        "--secondary-foreground": "hsl(220 20% 10%)",
        "--muted": "hsl(220 20% 85%)",
        "--muted-foreground": "hsl(220 20% 40%)",
        "--accent": "hsl(220 30% 80%)",
        "--accent-foreground": "hsl(220 20% 10%)",
        "--destructive": "hsl(0 62.8% 50.6%)",
        "--destructive-foreground": "hsl(220 20% 98%)",
        "--border": "hsl(220 20% 80%)",
        "--input": "hsl(220 20% 80%)",
        "--ring": "hsl(220 90% 50%)",
        "--sidebar-background": "hsl(220 20% 92%)",
        "--sidebar-foreground": "hsl(220 20% 10%)",
        "--sidebar-primary": "hsl(220 90% 50%)",
        "--sidebar-primary-foreground": "hsl(220 20% 98%)",
        "--sidebar-accent": "hsl(220 20% 85%)",
        "--sidebar-accent-foreground": "hsl(220 20% 10%)",
        "--sidebar-border": "hsl(220 20% 80%)",
        "--sidebar-ring": "hsl(220 90% 50%)",
    },
    glassmorphism: {
        "--background": "hsl(220 20% 10%)",
        "--foreground": "hsl(220 20% 98%)",
        "--card": "hsl(220 20% 10% / 0.7)",
        "--card-foreground": "hsl(220 20% 98%)",
        "--popover": "hsl(220 20% 10% / 0.7)",
        "--popover-foreground": "hsl(220 20% 98%)",
        "--primary": "hsl(220 90% 60%)",
        "--primary-foreground": "hsl(220 20% 10%)",
        "--secondary": "hsl(220 20% 20% / 0.7)",
        "--secondary-foreground": "hsl(220 20% 98%)",
        "--muted": "hsl(220 20% 20% / 0.7)",
        "--muted-foreground": "hsl(220 20% 70%)",
        "--accent": "hsl(220 30% 30% / 0.7)",
        "--accent-foreground": "hsl(220 20% 98%)",
        "--destructive": "hsl(0 62.8% 30.6%)",
        "--destructive-foreground": "hsl(220 20% 98%)",
        "--border": "hsl(220 20% 25% / 0.7)",
        "--input": "hsl(220 20% 25% / 0.7)",
        "--ring": "hsl(220 90% 60%)",
        "--sidebar-background": "hsl(220 20% 10% / 0.7)",
        "--sidebar-foreground": "hsl(220 20% 90%)",
        "--sidebar-primary": "hsl(220 90% 60%)",
        "--sidebar-primary-foreground": "hsl(220 20% 10%)",
        "--sidebar-accent": "hsl(220 20% 25% / 0.7)",
        "--sidebar-accent-foreground": "hsl(220 20% 98%)",
        "--sidebar-border": "hsl(220 20% 30% / 0.7)",
        "--sidebar-ring": "hsl(220 90% 60%)",
    },
};

// ------------------------------------
// Store Slices
// ------------------------------------

/**
 * Creates the appearance slice for theme and visual settings
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Appearance slice state and actions
 */
const createAppearanceSlice = ( set, get ) => ( {
    // Theme settings
    theme: "dark",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    backgroundColor: "",
    textColor: "",
    colorsHex: {
        background: "",
        foreground: "",
        cardBg: "",
        cardFg: "",
        popoverBg: "",
        popoverFg: "",
        primary: "",
        primaryFg: "",
        secondary: "",
        secondaryFg: "",
        muted: "",
        mutedFg: "",
        accent: "",
        accentFg: "",
        destructive: "",
        destructiveFg: "",
        border: "",
        input: "",
        ring: "",
        sidebarBackground: "",
        sidebarForeground: "",
        sidebarPrimary: "",
        sidebarPrimaryForeground: "",
        sidebarAccent: "",
        sidebarAccentForeground: "",
        sidebarBorder: "",
        sidebarRing: "",
    },

    // Typography
    fontFamily: "Inter, sans-serif",
    fontSize: "medium",
    fontWeight: "normal",

    // Layout
    uiDensity: "compact",
    paddingScale: 1.0,
    marginScale: 1.0,
    borderRadius: "md",
    borderRadiusPx: 8,
    borderRadiusVariants: {
        "--radius-none": "0rem",
        "--radius-xs": "0.125rem",
        "--radius-sm": "0.25rem",
        "--radius-md": "0.375rem",
        "--radius-lg": "0.5rem",
        "--radius-xl": "0.75rem",
        "--radius-2xl": "1rem",
        "--radius-3xl": "1.5rem",
        "--radius-4xl": "2rem",
    },
    borderSize: 1,
    boxShadowStrength: 2,

    // Navigation
    sidebarCollapsed: false,
    sidebarPosition: "left",
    headerHeight: "default",

    // Custom CSS
    customCSS: "",

    // Presets
    activePresetId: null,
    themePresets: [
        {
            id: "builtin-dark",
            name: "Dark",
            builtIn: true,
            settings: {
                theme: "dark",
                colorsHex: {},
                fontFamily: "Inter, sans-serif",
                fontSize: "medium",
                fontWeight: "normal",
                uiDensity: "compact",
                paddingScale: 1.0,
                marginScale: 1.0,
                borderRadius: "md",
                borderRadiusPx: 8,
                borderSize: 1,
                boxShadowStrength: 2,
                animationsEnabled: true,
                highContrastMode: false,
                reducedMotion: false,
                sidebarCollapsed: false,
                sidebarPosition: "left",
                headerHeight: "default",
            },
        },
        {
            id: "builtin-light",
            name: "Light",
            builtIn: true,
            settings: {
                theme: "light",
                colorsHex: {},
                fontFamily: "Inter, sans-serif",
                fontSize: "medium",
                fontWeight: "normal",
                uiDensity: "default",
                paddingScale: 1.0,
                marginScale: 1.0,
                borderRadius: "md",
                borderRadiusPx: 8,
                borderSize: 1,
                boxShadowStrength: 1,
                animationsEnabled: true,
                highContrastMode: false,
                reducedMotion: false,
                sidebarCollapsed: false,
                sidebarPosition: "left",
                headerHeight: "default",
            },
        },
        {
            id: "builtin-nord",
            name: "Nord",
            builtIn: true,
            settings: {
                theme: "dark",
                colorsHex: {
                    background: "", // using exact HSL palette via CSS theme class not necessary; override nothing for performance
                    // In practice these can be filled with Nord values if you want absolute override control
                    "--background": "hsl(240 10% 3.9%)",
                    "--foreground": "hsl(0 0% 98%)",
                    "--card": "hsl(240 10% 3.9%)",
                    "--card-foreground": "hsl(0 0% 98%)",
                    "--popover": "hsl(240 10% 3.9%)",
                    "--popover-foreground": "hsl(0 0% 98%)",
                    "--primary": "hsl(0 0% 98%)",
                    "--primary-foreground": "hsl(240 5.9% 10%)",
                    "--secondary": "hsl(240 3.7% 15.9%)",
                    "--secondary-foreground": "hsl(0 0% 98%)",
                    "--muted": "hsl(240 3.7% 15.9%)",
                    "--muted-foreground": "hsl(240 5% 64.9%)",
                    "--accent": "hsl(240 3.7% 15.9%)",
                    "--accent-foreground": "hsl(0 0% 98%)",
                    "--destructive": "hsl(0 62.8% 30.6%)",
                    "--destructive-foreground": "hsl(0 0% 98%)",
                    "--border": "hsl(240 3.7% 15.9%)",
                    "--input": "hsl(240 3.7% 15.9%)",
                    "--ring": "hsl(240 4.9% 83.9%)",
                    "--sidebar-background": "hsl(240 5.9% 10%)",
                    "--sidebar-foreground": "hsl(240 4.8% 95.9%)",
                    "--sidebar-primary": "hsl(240 1% 14%)",
                    "--sidebar-primary-foreground": "hsl(0 0% 100%)",
                    "--sidebar-accent": "hsl(240 3.7% 15.9%)",
                    "--sidebar-accent-foreground": "hsl(240 4.8% 95.9%)",
                    "--sidebar-border": "hsl(240 3.7% 15.9%)",
                    "--sidebar-ring": "hsl(217.2 91.2% 59.8%)",
                },
                borderRadiusPx: 8,
                uiDensity: "compact",
                paddingScale: 1.0,
                marginScale: 1.0,
                borderSize: 1,
                boxShadowStrength: 2,
                fontFamily: "Inter, sans-serif",
                fontSize: "medium",
                fontWeight: "normal",
                animationsEnabled: true,
                highContrastMode: false,
                reducedMotion: false,
                sidebarCollapsed: false,
                sidebarPosition: "left",
                headerHeight: "default",
            },
        },
        {
            id: "builtin-dracula",
            name: "Dracula",
            builtIn: true,
            settings: {
                theme: "dark",
                colorsHex: {},
                borderRadiusPx: 8,
                uiDensity: "compact",
                paddingScale: 1.0,
                marginScale: 1.0,
                borderSize: 1,
                boxShadowStrength: 2,
                fontFamily: "Inter, sans-serif",
                fontSize: "medium",
                fontWeight: "normal",
                animationsEnabled: true,
                highContrastMode: false,
                reducedMotion: false,
                sidebarCollapsed: false,
                sidebarPosition: "left",
                headerHeight: "default",
            },
        },
        {
            id: "builtin-solarized",
            name: "Solarized",
            builtIn: true,
            settings: {
                theme: "light",
                colorsHex: {},
                borderRadiusPx: 8,
                uiDensity: "default",
                paddingScale: 1.0,
                marginScale: 1.0,
                borderSize: 1,
                boxShadowStrength: 1,
                fontFamily: "Inter, sans-serif",
                fontSize: "medium",
                fontWeight: "normal",
                animationsEnabled: true,
                highContrastMode: false,
                reducedMotion: false,
                sidebarCollapsed: false,
                sidebarPosition: "left",
                headerHeight: "default",
            },
        },
    ],

    savedTheme: null,
    themeDefinitions,
} );

/**
 * Creates the accessibility slice for accessibility settings
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Accessibility slice state and actions
 */
const createAccessibilitySlice = ( set, get ) => ( {
    animationsEnabled: true,
    highContrastMode: false,
    reducedMotion: false,
    enabledPages: {
        dashboard: true,
        todo: true,
        orion: true,
        profile: true,
        planner: true,
        time: true,
        notes: true,
        notifications: true,
        search: true,
        habits: true,
        stats: true,
        insights: true,
        workspaces: true,
        settings: true,
        trash: true,
        help: true,
    },
} );

/**
 * Creates the notifications slice for notification settings
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Notifications slice state and actions
 */
const createNotificationsSlice = ( set, get ) => ( {
    notificationsEnabled: true,
    notificationSound: true,
    notificationFrequency: "immediately",

    // Email notifications
    emailNotifications: {
        enabled: false,
        contact: "",
        verified: false,
    },

    // SMS notifications
    smsNotifications: {
        enabled: false,
        contact: "",
        verified: false,
    },

    // Push notifications
    pushNotifications: {
        enabled: false,
        permission: "default", // "default", "granted", "denied"
    },

    // Toast/Alert notifications
    toastNotifications: {
        enabled: true,
    },

    /**
     * Updates email notification settings
     * @param {Object} updates - Email notification updates
     */
    updateEmailNotifications: ( updates ) => {
        if ( updates && updates?.hasOwnProperty( 'contact' ) ) {
            // Check if the value provided is valid.
            updates = {
                ...updates,
                verified: isValidEmail( updates?.contact )
            };
        }
        set( ( state ) => ( {
            emailNotifications: { ...state.emailNotifications, ...updates },
        } ) );
    },

    /**
     * Updates SMS notification settings
     * @param {Object} updates - SMS notification updates
     */
    updateSmsNotifications: ( updates ) => {
        if ( updates && updates?.hasOwnProperty( 'contact' ) ) {
            // Check if the value provided is valid.
            updates = {
                ...updates,
                verified: isValidPhone( updates?.contact )
            };
        }
        set( ( state ) => ( {
            smsNotifications: { ...state.smsNotifications, ...updates },
        } ) );
    },

    /**
     * Updates push notification settings and handles browser permissions
     * @param {Object} updates - Push notification updates
     */
    updatePushNotifications: async ( updates ) => {
        if ( updates.enabled !== undefined ) {
            if ( updates.enabled && typeof window !== "undefined" && "Notification" in window ) {
                try {
                    const permission = await Notification.requestPermission();
                    updates.permission = permission;
                } catch ( error ) {
                    console.error( "Error requesting notification permission:", error );
                    updates.enabled = false;
                    updates.permission = "denied";
                }
            } else if ( !updates.enabled ) {
                updates.permission = "denied";
            }
        }

        set( ( state ) => ( {
            pushNotifications: { ...state.pushNotifications, ...updates },
        } ) );
    },

    /**
     * Updates toast notification settings
     * @param {Object} updates - Toast notification updates
     */
    updateToastNotifications: ( updates ) => {
        set( ( state ) => ( {
            toastNotifications: { ...state.toastNotifications, ...updates },
        } ) );
    },
} );

/**
 * Creates the integrations slice for third-party integrations
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Integrations slice state and actions
 */
const createIntegrationsSlice = ( set, get ) => ( {
    integrations: {
        googleCalendar: {
            apikey: "",
            calendarIds: [],
        },
        appleCalendar: {
            apikey: "",
            calendarIds: [],
        },
        emailProvider: {
            apikey: "",
            calendarIds: [],
        },
        AIModels: [],
    },

    /**
     * Updates integration settings
     * @param {string} type - Integration type
     * @param {string} action - Action to perform
     * @param {any} value - Value to set
     * @param {number} index - Index for array operations
     */
    updateIntegrations: ( type, action, value, index ) => {
        if ( !utils.val.isDefined( action ) || !utils.val.isDefined( value ) ) return;

        switch ( type ) {
            case "googleCalendar":
                if ( action === "apikey" ) {
                    set( ( state ) => ( {
                        integrations: {
                            ...state.integrations,
                            googleCalendar: {
                                ...state.integrations.googleCalendar,
                                apikey: value,
                            },
                        },
                    } ) );
                } else if ( action === "add-calendarIds" ) {
                    set( ( state ) => ( {
                        integrations: {
                            ...state.integrations,
                            googleCalendar: {
                                ...state.integrations.googleCalendar,
                                calendarIds: [ ...state.integrations.googleCalendar.calendarIds, value ],
                            },
                        },
                    } ) );
                } else if ( action === "update-calendarIds" ) {
                    set( ( state ) => ( {
                        integrations: {
                            ...state.integrations,
                            googleCalendar: {
                                ...state.integrations.googleCalendar,
                                calendarIds: state.integrations.googleCalendar.calendarIds.map( ( val, valIndex ) =>
                                    valIndex === index ? value : val,
                                ),
                            },
                        },
                    } ) );
                } else if ( action === "remove-calendarIds" ) {
                    set( ( state ) => ( {
                        integrations: {
                            ...state.integrations,
                            googleCalendar: {
                                ...state.integrations.googleCalendar,
                                calendarIds: removeItem( state.integrations.googleCalendar.calendarIds, index ),
                            },
                        },
                    } ) );
                }
                break;

            case "reset":
                set( ( state ) => ( {
                    integrations: {
                        googleCalendar: {
                            apikey: "",
                            calendarIds: [],
                        },
                        appleCalendar: {
                            apikey: "",
                            calendarIds: [],
                        },
                        emailProvider: {
                            apikey: "",
                            calendarIds: [],
                        },
                        AIModels: [],
                    },
                } ) );
                break;

            default:
                break;
        }
    },
} );

/**
 * Creates the permissions slice for app permissions
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Permissions slice state and actions
 */
const createPermissionsSlice = ( set, get ) => ( {
    developerMode: false,
    experimentalFeatures: false,
} );

/**
 * Creates the core settings slice with shared functionality
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {Object} Core slice state and actions
 */
const createCoreSlice = ( set, get ) => ( {
    // Loading and saving settings data.

    showWorkspaceStats: true,
    setShowWorkspaceStats: ( showWorkspaceStats ) => {
        set( () => ( { showWorkspaceStats } ) );
    },

    getSettingsConfig: () => {
        // Pack up relevant settings config and send it out; used by user in useGlobalStore.
        return {
            themeSettings: {
                theme: get().theme,
                savedTheme: get().savedTheme,
                customCSS: get().customCSS,
                themePresets: get().themePresets,
                colorsHex: get().colorsHex,
                fontFamily: get().fontFamily,
                fontSize: get().fontSize,
                fontWeight: get().fontWeight,
                uiDensity: get().uiDensity,
                paddingScale: get().paddingScale,
                marginScale: get().marginScale,
                borderRadius: get().borderRadius,
                borderRadiusPx: get().borderRadiusPx,
                borderRadiusVariants: get().borderRadiusVariants,
                borderSize: get().borderSize,
                boxShadowStrength: get().boxShadowStrength,
            },
            accessabilitySettings: {
                animationsEnabled: get().animationsEnabled,
                highContrastMode: get().highContrastMode,
                reducedMotion: get().reducedMotion,
                headerHeight: get().headerHeight,
                enabledPages: get().enabledPages,
            },
            permissionsSettings: {
                notificationsEnabled: get().notificationsEnabled,
                experimentalFeatures: get().experimentalFeatures,
                notificationSound: get().notificationSound,
                developerMode: get().developerMode,
                integrations: get().integrations,
            },
        };
    },
    setSettingsConfig: ( config ) => {
        // Unpack settings config received from a user object from the server.
        let updatedState = {};
        if ( utils.val.isObject( config ) ) {
            if ( config.hasOwnProperty( 'integrations' ) ) { updatedState.integrations = config.integrations; }
            if ( config.hasOwnProperty( 'themeSettings' ) ) {
                let themeSettings = updatedState.themeSettings;
                if ( themeSettings.hasOwnProperty( 'theme' ) ) { updatedState.theme = themeSettings.theme; }
                if ( themeSettings.hasOwnProperty( 'customCSS' ) ) { updatedState.customCSS = themeSettings.customCSS; }
                if ( themeSettings.hasOwnProperty( 'themePresets' ) ) { updatedState.themePresets = themeSettings.themePresets; }
                if ( themeSettings.hasOwnProperty( 'colorsHex' ) ) { updatedState.colorsHex = themeSettings.colorsHex; }
                if ( themeSettings.hasOwnProperty( 'fontFamily' ) ) { updatedState.fontFamily = themeSettings.fontFamily; }
                if ( themeSettings.hasOwnProperty( 'fontSize' ) ) { updatedState.fontSize = themeSettings.fontSize; }
                if ( themeSettings.hasOwnProperty( 'fontWeight' ) ) { updatedState.fontWeight = themeSettings.fontWeight; }
                if ( themeSettings.hasOwnProperty( 'uiDensity' ) ) { updatedState.uiDensity = themeSettings.uiDensity; }
                if ( themeSettings.hasOwnProperty( 'paddingScale' ) ) { updatedState.paddingScale = themeSettings.paddingScale; }
                if ( themeSettings.hasOwnProperty( 'marginScale' ) ) { updatedState.marginScale = themeSettings.marginScale; }
                if ( themeSettings.hasOwnProperty( 'borderRadius' ) ) { updatedState.borderRadius = themeSettings.borderRadius; }
                if ( themeSettings.hasOwnProperty( 'borderRadiusPx' ) ) { updatedState.borderRadiusPx = themeSettings.borderRadiusPx; }
                if ( themeSettings.hasOwnProperty( 'borderRadiusVariants' ) ) { updatedState.borderRadiusVariants = themeSettings.borderRadiusVariants; }
                if ( themeSettings.hasOwnProperty( 'borderSize' ) ) { updatedState.borderSize = themeSettings.borderSize; }
                if ( themeSettings.hasOwnProperty( 'boxShadowStrength' ) ) { updatedState.boxShadowStrength = themeSettings.boxShadowStrength; }
            }
            if ( config.hasOwnProperty( 'accessabilitySettings' ) ) {
                let accessabilitySettings = updatedState.accessabilitySettings;
                if ( accessabilitySettings.hasOwnProperty( 'animationsEnabled' ) ) { accessabilitySettings.animationsEnabled = accessabilitySettings.animationsEnabled; }
                if ( accessabilitySettings.hasOwnProperty( 'highContrastMode' ) ) { updatedState.highContrastMode = accessabilitySettings.highContrastMode; }
                if ( accessabilitySettings.hasOwnProperty( 'reducedMotion' ) ) { updatedState.reducedMotion = accessabilitySettings.reducedMotion; }
                if ( accessabilitySettings.hasOwnProperty( 'headerHeight' ) ) { updatedState.headerHeight = accessabilitySettings.headerHeight; }
                if ( accessabilitySettings.hasOwnProperty( 'enabledPages' ) ) { updatedState.enabledPages = accessabilitySettings.enabledPages; }
            }
            if ( config.hasOwnProperty( 'permissionsSettings' ) ) {
                let permissionsSettings = updatedState.permissionsSettings;
                if ( permissionsSettings.hasOwnProperty( 'integrations' ) ) { updatedState.integrations = permissionsSettings.integrations; }
                if ( permissionsSettings.hasOwnProperty( 'notificationsEnabled' ) ) { updatedState.notificationsEnabled = permissionsSettings.notificationsEnabled; }
                if ( permissionsSettings.hasOwnProperty( 'notificationSound' ) ) { updatedState.notificationSound = permissionsSettings.notificationSound; }
                if ( permissionsSettings.hasOwnProperty( 'developerMode' ) ) { updatedState.developerMode = permissionsSettings.developerMode; }
                if ( permissionsSettings.hasOwnProperty( 'experimentalFeatures' ) ) { updatedState.experimentalFeatures = permissionsSettings.experimentalFeatures; }
            }
        }

    },


    // Loading states
    requestFetchSettings: false,
    loadingSettings: false,
    errorSettings: false,
    settingsDebug: false,
    activeTab: 'appearance',
    // setActiveTab: ( activeTab ) => set( () => ( { activeTab } ) ),
    setActiveTab: ( activeTab ) => {
        set( () => ( { activeTab } ) );
    },

    // State setters
    setRequestFetchSettings: ( requestFetchSettings ) => set( () => ( { requestFetchSettings } ) ),
    setLoadingSettings: ( loadingSettings ) => set( { loadingSettings } ),
    setErrorSettings: ( errorSettings ) => set( { errorSettings } ),
    setSettingsDebug: ( settingsDebug ) => set( () => ( { settingsDebug } ) ),

    /**
     * Schedules settings application on next animation frame
     */
    scheduleApply: () => {
        if ( typeof window === "undefined" ) return;
        if ( rafId ) cancelAnimationFrame( rafId );
        rafId = requestAnimationFrame( () => {
            rafId = null;
            get().applySettings();
        } );
    },

    /**
     * Updates a single setting with validation
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    updateSetting: ( key, value ) => {
        const apply = get().scheduleApply;
        const currentTheme = get().theme;

        switch ( key ) {
            case "theme":
                value = ensureOption( value, [ "dark", "light", "system", "cool", "warm", "neumorphism", "glassmorphism" ], "dark" );
                if ( value !== currentTheme && !get().savedTheme ) {
                    get().clearCustomColors();
                }
                set( { theme: value, activePresetId: null } );
                apply();
                return;

            case "fontSize":
                value = ensureOption( value, [ "small", "medium", "large", "x-large" ], "medium" );
                set( { fontSize: value } );
                apply();
                return;

            case "fontFamily":
                if ( typeof value !== "string" || !value.trim() ) return;
                set( { fontFamily: value } );
                apply();
                return;

            case "fontWeight":
                value = ensureOption( value, [ "light", "normal", "medium", "bold" ], "normal" );
                set( { fontWeight: value } );
                apply();
                return;

            case "uiDensity":
                value = ensureOption( value, [ "compact", "default", "comfortable" ], "compact" );
                set( { uiDensity: value } );
                apply();
                return;

            case "paddingScale":
                set( { paddingScale: clamp( value, 0.6, 1.6 ) } );
                apply();
                return;

            case "marginScale":
                set( { marginScale: clamp( value, 0.6, 1.6 ) } );
                apply();
                return;

            case "borderRadius":
                value = ensureOption( value, [ "none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full" ], "md" );
                set( { borderRadius: value } );
                apply();
                return;

            case "borderRadiusPx":
                set( { borderRadiusPx: clamp( value, 0, 36 ) } );
                set( ( state ) => ( {
                    ...state,
                    borderRadiusVariants: {
                        ...state.borderRadiusVariants,
                        [ `--radius-${ state.borderRadius }` ]: `${ clamp( value, 0, 36 ) / 8 }rem`,
                    },
                } ) );
                apply();
                return;

            case "borderSize":
                set( { borderSize: clamp( value, 0, 4 ) } );
                apply();
                return;

            case "boxShadowStrength":
                set( { boxShadowStrength: clamp( value, 1, 3 ) } );
                apply();
                return;

            case "animationsEnabled":
            case "sidebarCollapsed":
            case "notificationsEnabled":
            case "notificationSound":
            case "highContrastMode":
            case "reducedMotion":
            case "developerMode":
            case "experimentalFeatures":
                set( { [ key ]: Boolean( value ) } );
                apply();
                return;

            case "sidebarPosition":
                value = ensureOption( value, [ "left", "right" ], "left" );
                set( { sidebarPosition: value } );
                apply();
                return;

            case "headerHeight":
                value = ensureOption( value, [ "small", "default", "large" ], "default" );
                set( { headerHeight: value } );
                apply();
                return;

            case "customCSS":
                set( { customCSS: typeof value === "string" ? value : "" } );
                apply();
                return;

            case "primaryColor":
            case "secondaryColor":
            case "accentColor":
            case "backgroundColor":
            case "textColor": {
                if ( !isValidHex( value ) ) return;
                const hex = expandHex3To6( value );
                set( { [ key ]: hex } );
                const map = {
                    primaryColor: "primary",
                    secondaryColor: "secondary",
                    accentColor: "accent",
                    backgroundColor: "background",
                    textColor: "foreground",
                };
                const colorKey = map[ key ];
                apply();
                return;
            }

            default:
                return;
        }
    },

    /**
     * Updates multiple settings at once
     * @param {Object} settings - Settings object
     */
    updateSettings: ( settings ) => {
        if ( !settings || typeof settings !== "object" ) return;
        Object.entries( settings ).forEach( ( [ k, v ] ) => get().updateSetting( k, v ) );
        get().scheduleApply();
    },

    /**
     * Updates nested setting values
     * @param {string} parent - Parent key
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    updateNestedSetting: ( parent, key, value ) => {
        const apply = get().scheduleApply;
        const state = get();
        if ( parent === "enabledPages" ) {
            const next = {
                enabledPages: {
                    ...state.enabledPages,
                    [ key ]: Boolean( value ),
                },
            };
            set( next );
            apply();
        } else if ( parent === "colorsHex" ) {
            get().setColorHex( key, value );
        }
    },

    /**
     * Sets a color hex value with validation
     * @param {string} colorKey - Color key
     * @param {string} hex - Hex color value
     */
    setColorHex: ( colorKey, hex ) => {
        if ( !cssVarMap[ colorKey ] ) return;
        if ( !isValidHex( hex ) && hex !== "" ) return;
        const clean = hex ? expandHex3To6( hex ) : "";
        set( ( s ) => ( {
            colorsHex: { ...s.colorsHex, [ colorKey ]: clean },
        } ) );
        get().scheduleApply();
    },

    /**
     * Gets theme payload from current state
     * @returns {Object} Theme configuration object
     */
    getThemePayloadFromState: () => {
        const s = get();
        return {
            theme: s.theme,
            colorsHex: { ...s.colorsHex },
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            uiDensity: s.uiDensity,
            paddingScale: s.paddingScale,
            marginScale: s.marginScale,
            borderRadius: s.borderRadius,
            borderRadiusPx: s.borderRadiusPx,
            borderRadiusVariants: s.borderRadiusVariants,
            borderSize: s.borderSize,
            boxShadowStrength: s.boxShadowStrength,
            animationsEnabled: s.animationsEnabled,
            highContrastMode: s.highContrastMode,
            reducedMotion: s.reducedMotion,
            sidebarCollapsed: s.sidebarCollapsed,
            sidebarPosition: s.sidebarPosition,
            headerHeight: s.headerHeight,
        };
    },

    /**
     * Saves current theme configuration
     * @param {string} name - Theme name
     */
    saveTheme: ( name = "Current Theme" ) => {
        const payload = get().getThemePayloadFromState();
        const savedTheme = { name, updatedAt: Date.now(), settings: payload };
        set( { savedTheme } );
        try {
            localStorage.setItem( "user-current-theme", JSON.stringify( savedTheme ) );
        } catch { }
    },

    /**
     * Saves current theme as a preset
     * @param {string} name - Preset name
     */
    saveThemeAsPreset: ( name ) => {
        if ( typeof name !== "string" || !name.trim() ) return;
        const payload = get().getThemePayloadFromState();
        const id = `user-${ Date.now() }`;
        const preset = { id, name: name.trim(), builtIn: false, settings: payload };
        set( ( s ) => ( { themePresets: [ ...s.themePresets, preset ], activePresetId: id } ) );
        try {
            const all = get().themePresets;
            localStorage.setItem( "user-theme-presets", JSON.stringify( all ) );
        } catch { }
    },

    /**
     * Applies a theme preset
     * @param {string} id - Preset ID
     */
    applyPreset: ( id ) => {
        const preset = get().themePresets.find( ( p ) => p.id === id );
        if ( !preset ) return;
        const st = preset.settings || {};
        set( {
            ...st,
            activePresetId: id,
        } );
        get().scheduleApply();
    },

    /**
     * Gets CSS variables for current theme
     * @returns {Object} CSS variables object
     */
    getCssVariables: () => {
        const s = get();

        let base = themeDefinitions[ s.theme ] || themeDefinitions.dark;

        if ( s.theme === "system" ) {
            const systemTheme =
                typeof window !== "undefined" && window.matchMedia( "(prefers-color-scheme: dark)" ).matches ? "dark" : "light";
            base = themeDefinitions[ systemTheme ];
        }

        const result = { ...base };

        Object.entries( s.colorsHex ).forEach( ( [ key, hex ] ) => {
            if ( hex && isValidHex( hex ) ) {
                const varName = cssVarMap[ key ];
                const hsl = hexToHslString( hex );
                if ( varName && hsl ) {
                    result[ varName ] = `hsl(${ hsl })`;
                }
            }
        } );

        const fontSizeMap = {
            small: {
                "--font-size-xs": "0.65rem",
                "--font-size-sm": "0.75rem",
                "--font-size-base": "0.875rem",
                "--font-size-lg": "1rem",
                "--font-size-xl": "1.125rem",
                "--font-size-2xl": "1.25rem",
                __bodySize: "0.875rem",
            },
            medium: {
                "--font-size-xs": "0.75rem",
                "--font-size-sm": "0.875rem",
                "--font-size-base": "1rem",
                "--font-size-lg": "1.125rem",
                "--font-size-xl": "1.25rem",
                "--font-size-2xl": "1.5rem",
                __bodySize: "1rem",
            },
            large: {
                "--font-size-xs": "0.875rem",
                "--font-size-sm": "1rem",
                "--font-size-base": "1.125rem",
                "--font-size-lg": "1.25rem",
                "--font-size-xl": "1.5rem",
                "--font-size-2xl": "1.75rem",
                __bodySize: "1.125rem",
            },
            "x-large": {
                "--font-size-xs": "1rem",
                "--font-size-sm": "1.125rem",
                "--font-size-base": "1.25rem",
                "--font-size-lg": "1.5rem",
                "--font-size-xl": "1.75rem",
                "--font-size-2xl": "2rem",
                __bodySize: "1.25rem",
            },
        };

        const borderRadiusMap = {
            none: { "--radius": "0" },
            small: { "--radius": "0.25rem" },
            medium: { "--radius": "0.5rem" },
            large: { "--radius": "0.75rem" },
            full: { "--radius": "9999px" },
        };

        const uiDensityMap = {
            compact: {
                "--space-1": "0.125rem",
                "--space-2": "0.25rem",
                "--space-3": "0.5rem",
                "--space-4": "0.75rem",
                "--space-5": "1rem",
            },
            default: {
                "--space-1": "0.25rem",
                "--space-2": "0.5rem",
                "--space-3": "0.75rem",
                "--space-4": "1rem",
                "--space-5": "1.5rem",
            },
            comfortable: {
                "--space-1": "0.5rem",
                "--space-2": "0.75rem",
                "--space-3": "1rem",
                "--space-4": "1.5rem",
                "--space-5": "2rem",
            },
        };

        const fontWeightMap = {
            light: 300,
            normal: 400,
            medium: 500,
            bold: 700,
        };

        Object.assign( result, {
            ...fontSizeMap[ s.fontSize ],
            ...borderRadiusMap[ s.borderRadius ],
            ...uiDensityMap[ s.uiDensity ],
            "--font-family": s.fontFamily,
            "--font-weight": String( fontWeightMap[ s.fontWeight ] ?? 400 ),
            "--border-size": `${ clamp( s.borderSize, 0, 4 ) }px`,
            "--margin-scale": String( clamp( s.marginScale, 0.6, 1.6 ) ),
            ...s.borderRadiusVariants,
        } );

        const p = clamp( s.paddingScale, 0.6, 1.6 )
            ;[ "--space-1", "--space-2", "--space-3", "--space-4", "--space-5" ].forEach( ( k ) => {
                if ( result[ k ] ) result[ k ] = scaleRem( result[ k ], p );
            } );

        const radiusPx = clamp( s.borderRadiusPx, 0, 36 );
        result[ "--radius" ] = `${ radiusPx }px`;

        const shadowMap = {
            1: "0 1px 2px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)",
            2: "0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
            3: "0 8px 20px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.12)",
        };
        const bs = clamp( s.boxShadowStrength, 1, 3 );
        result[ "--shadow" ] = shadowMap[ bs ];

        if ( s.highContrastMode ) {
            result[ "--foreground" ] = "hsl(0 0% 100%)";
            result[ "--background" ] = "hsl(0 0% 0%)";
            result[ "--border" ] = "hsl(0 0% 50%)";
            result[ "--muted-foreground" ] = "hsl(0 0% 90%)";
            result[ "--accent" ] = "hsl(0 0% 15%)";
            result[ "--accent-foreground" ] = "hsl(0 0% 100%)";
            result[ "--card" ] = "hsl(0 0% 7%)";
            result[ "--card-foreground" ] = "hsl(0 0% 100%)";
        }

        return result;
    },

    /**
     * Applies current settings to the DOM
     */
    applySettings: () => {
        if ( typeof document === "undefined" ) return;
        const root = document.documentElement;
        const vars = get().getCssVariables();

        const currentVars = Array.from( root.style ).filter( ( prop ) => prop.startsWith( "--" ) );

        currentVars.forEach( ( varName ) => {
            if ( !vars.hasOwnProperty( varName ) ) {
                root.style.removeProperty( varName );
            }
        } );

        Object.entries( vars ).forEach( ( [ k, v ] ) => {
            if ( v != null && v !== "" ) {
                root.style.setProperty( k, v );
            } else {
                root.style.removeProperty( k );
            }
        } );

        const { theme, highContrastMode, reducedMotion, uiDensity, animationsEnabled } = get();

        root.classList.remove( "light", "dark", "cool", "warm", "neumorphism", "glassmorphism" );
        root.classList.remove(
            "high-contrast",
            "reduced-motion",
            "ui-compact",
            "ui-default",
            "ui-comfortable",
            "animations-off",
        );

        if ( theme === "system" ) {
            const systemTheme = window.matchMedia( "(prefers-color-scheme: dark)" ).matches ? "dark" : "light";
            root.classList.add( systemTheme );
        } else {
            root.classList.add( theme );
        }

        if ( highContrastMode ) root.classList.add( "high-contrast" );
        if ( reducedMotion ) root.classList.add( "reduced-motion" );
        root.classList.add( `ui-${ uiDensity }` );
        if ( !animationsEnabled ) root.classList.add( "animations-off" );

        const s = get();
        const sizeMap = {
            small: "0.875rem",
            medium: "1rem",
            large: "1.125rem",
            "x-large": "1.25rem",
        };
        document.body.style.fontFamily = "var(--font-family)";
        document.body.style.fontWeight = "var(--font-weight)";
        document.body.style.fontSize = sizeMap[ s.fontSize ] || "1rem";

        let custom = document.getElementById( "custom-user-css" );
        if ( !custom ) {
            custom = document.createElement( "style" );
            custom.id = "custom-user-css";
            document.head.appendChild( custom );
        }
        custom.textContent = get().customCSS;
    },

    /**
     * Clears all custom colors
     */
    clearCustomColors: () => {
        set( ( state ) => ( {
            ...state,
            colorsHex: Object.keys( state.colorsHex ).reduce( ( acc, key ) => {
                acc[ key ] = "";
                return acc;
            }, {} ),
            primaryColor: "",
            secondaryColor: "",
            accentColor: "",
            backgroundColor: "",
            textColor: "",
        } ) );
        get().scheduleApply();
    },

    /**
     * Resets all settings to defaults
     */
    resetToDefaults: () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all themes and settings to defaults? This will permanently delete all your custom themes and cannot be undone.",
        );
        if ( confirmed ) {
            set( ( state ) => ( {
                ...createAppearanceSlice( set, get ),
                ...createAccessibilitySlice( set, get ),
                ...createNotificationsSlice( set, get ),
                ...createIntegrationsSlice( set, get ),
                ...createPermissionsSlice( set, get ),
                themePresets: state.themePresets.filter( ( p ) => p.builtIn ),
            } ) );
            try {
                localStorage.removeItem( "user-current-theme" );
                localStorage.removeItem( "user-theme-presets" );
            } catch { }
            get().scheduleApply();
        }
    },

    /**
     * Gets settings configuration for export
     * @returns {Object} Settings configuration
     */
    getSettingsConfig: () => {
        const s = get();
        return {
            themeSettings: {
                theme: s.theme,
                savedTheme: s.savedTheme,
                customCSS: s.customCSS,
                themePresets: s.themePresets,
                colorsHex: s.colorsHex,
                fontFamily: s.fontFamily,
                fontSize: s.fontSize,
                fontWeight: s.fontWeight,
                uiDensity: s.uiDensity,
                paddingScale: s.paddingScale,
                marginScale: s.marginScale,
                borderRadius: s.borderRadius,
                borderRadiusPx: s.borderRadiusPx,
                borderRadiusVariants: s.borderRadiusVariants,
                borderSize: s.borderSize,
                boxShadowStrength: s.boxShadowStrength,
            },
            accessibilitySettings: {
                animationsEnabled: s.animationsEnabled,
                highContrastMode: s.highContrastMode,
                reducedMotion: s.reducedMotion,
                headerHeight: s.headerHeight,
                enabledPages: s.enabledPages,
            },
            notificationSettings: {
                notificationsEnabled: s.notificationsEnabled,
                notificationSound: s.notificationSound,
                notificationFrequency: s.notificationFrequency,
                emailNotifications: s.emailNotifications,
                smsNotifications: s.smsNotifications,
                pushNotifications: s.pushNotifications,
                toastNotifications: s.toastNotifications,
            },
            integrationSettings: {
                integrations: s.integrations,
            },
            permissionSettings: {
                developerMode: s.developerMode,
                experimentalFeatures: s.experimentalFeatures,
            },
        };
    },
} );

// ------------------------------------
// Main Store
// ------------------------------------
export const useSettingsStore = create(
    persist(
        ( set, get ) => ( {
            ...createCoreSlice( set, get ),
            ...createAppearanceSlice( set, get ),
            ...createAccessibilitySlice( set, get ),
            ...createNotificationsSlice( set, get ),
            ...createIntegrationsSlice( set, get ),
            ...createPermissionsSlice( set, get ),
        } ),
        {
            name: ZUSTAND_SETTINGS_STORE_DIRECTORY_NAME,
            getStorage: () => localStorage,
        },
    ),
);
