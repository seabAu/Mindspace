import React, { Children, Component, useEffect, useState, useRef } from 'react';
import * as utils from 'akashatools';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip';
import { BsAlt, BsShift } from 'react-icons/bs';
import { AiFillControl, AiOutlineEnter } from 'react-icons/ai';
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import './Button.css';
// import './GradientButton.css';

export const Button = ( props ) => {
    const {
        children,
        showChildren = true,

        // Basic parameters.
        id,
        name = ``,
        label,
        icon,
        endIcon,
        ref,

        // Custom interaction functions.
        onMouseEnter = ( e ) => { },
        onMouseLeave = ( e ) => { },
        onFocus = ( e ) => { },
        onBlur = ( e ) => { },
        onClick,

        // Styling.
        type = 'button', // BUTTON | SUBMIT | RESET
        appearance = `flat`, // FLAT (or DEFAULT) | NEUMORPHIC | GLASSMORPHIC | CONSOLE
        model,
        overrideStyles = false, // Override default button class styling.
        classes = '',
        styles = {},
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.{{
        // display: `${"flex"}`,
        ...styles,
        // Responsiveness overrides go here.
    };

    const buildButton = () => {
        return (
            <button
                id={ `button-${ id ?? `` }-${ Math.random() * 100000 }` }
                key={ `button-${ id ?? `` }-${ Math.random() * 100000 }` }
                className={ `${ overrideStyles ? `` : `button` } ${ classes
                    // utils.val.isValidArray(classes, true)
                    //     ? classes
                    //     : ""
                    } ${ appearance
                        ? appearance === `glassmorphic`
                            ? `button-glassmorphic`
                            : appearance === `neumorphic`
                                ? `button-neumorphic`
                                : appearance === `console`
                                    ? `button-console`
                                    : appearance === `control`
                                        ? `button-control`
                                        : ``
                        : ``
                    }` }
                style={ componentStyles }
                onClick={ onClick }
                // {...onMouseEnter ? (onMouseEnter={onMouseEnter}) : null}
                onMouseEnter={ onMouseEnter }
                onMouseLeave={ onMouseLeave }
                onFocus={ onFocus }
                onBlur={ onBlur }
                type={
                    [ `button`, `submit`, `reset` ].includes( type )
                        ? type
                        : `button`
                }>
                { icon && icon }
                { label && <div className={ `button-text` }>{ label }</div> }
                { showChildren && children && children !== false && children }
                { endIcon && endIcon }
            </button>
        );
    };

    return buildButton();
};

export const Shortcut = ( props ) => {
    const {
        children,
        shortcut = '',
        className = '',
        textClassName = '',
        leftIcon,
        leftIconClassName = '',
        rightIcon,
        rightIconClassName = '',
        style = 'basic',
        showChildren = true,

        // Basic parameters.
        id = '',
        name = ``,
        label,
        icon,
        endIcon,
        ref,

        // Custom interaction functions.
        onMouseEnter = ( e ) => { },
        onMouseLeave = ( e ) => { },
        onFocus = ( e ) => { },
        onBlur = ( e ) => { },
        onClick = () => { },

        // Styling.
        type = 'button', // BUTTON | SUBMIT | RESET
        appearance = `flat`, // FLAT (or DEFAULT) | NEUMORPHIC | GLASSMORPHIC | CONSOLE
        model,
        overrideStyles = false, // Override default button class styling.
        classes = '',
        styles = {},
        // ...props
    } = props;

    const [ isFlashing, setIsFlashing ] = useState( false );
    const [ isTooltipOpen, setIsTooltipOpen ] = useState( false );
    let tooltipTimeout;

    useEffect( () => {
        if ( shortcut ) {
            const handleKeyDown = ( event ) => {
                const keys = shortcut.toLowerCase().split( '+' );
                const pressedKeys = [];

                if ( event.ctrlKey ) pressedKeys.push( 'ctrl' );
                if ( event.altKey ) pressedKeys.push( 'alt' );
                if ( event.shiftKey ) pressedKeys.push( 'shift' );
                if ( event.metaKey ) pressedKeys.push( 'meta' );
                if (
                    event.key !== 'Control' &&
                    event.key !== 'Alt' &&
                    event.key !== 'Shift' &&
                    event.key !== 'Meta'
                ) {
                    pressedKeys.push( event.key.toLowerCase() );
                }

                if (
                    keys.every( ( key ) => pressedKeys.includes( key ) ) &&
                    keys.length === pressedKeys.length
                ) {
                    event.preventDefault();
                    setIsFlashing( true );
                    setTimeout( () => setIsFlashing( false ), 500 );
                    props.onClick?.( event );
                }
            };

            window.addEventListener( 'keydown', handleKeyDown );

            return () => {
                window.removeEventListener( 'keydown', handleKeyDown );
            };
        }
    }, [ shortcut, props.onClick ] );

    const baseClassName = twMerge(
        'flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'active:shadow-inner active:translate-y-0.5',
        styleVariants[ style ],
        className,
    );

    const flashClassName = isFlashing ? 'flash' : '';

    const renderShortcut = () => {
        if ( shortcut && utils.val.isString( shortcut ) ) {
            return shortcut.split( '+' ).map( ( key, index ) => {
                switch ( key.toLowerCase() ) {
                    case 'alt':
                        return (
                            <BsAlt
                                key={ index }
                                className='inline-block mr-1'
                                size={ 16 }
                            />
                        );
                    case 'shift':
                        return (
                            <BsShift
                                key={ index }
                                className='inline-block mr-1'
                                size={ 16 }
                            />
                        );
                    case 'ctrl':
                        return (
                            <AiFillControl
                                key={ index }
                                className='inline-block mr-1'
                                size={ 16 }
                            />
                        );
                    case 'enter':
                        return (
                            <AiOutlineEnter
                                key={ index }
                                className='inline-block mr-1'
                                size={ 16 }
                            />
                        );
                    default:
                        return (
                            <span
                                key={ index }
                                className='mr-1'>
                                { key.toUpperCase() }
                            </span>
                        );
                }
            } );
        }
    };

    return (
        <TooltipProvider>
            <Tooltip
                open={ isTooltipOpen }
                onOpenChange={ setIsTooltipOpen }>
                <TooltipTrigger asChild>
                    <Button
                        className={ `${ baseClassName } ${ flashClassName }` }
                        onMouseEnter={ () => {
                            tooltipTimeout = setTimeout(
                                () => setIsTooltipOpen( true ),
                                1000,
                            );
                        } }
                        onMouseLeave={ () => {
                            clearTimeout( tooltipTimeout );
                            setIsTooltipOpen( false );
                        } }
                        { ...props }>
                        { leftIcon && (
                            <span className={ `mr-2 ${ leftIconClassName ?? '' }` }>
                                { leftIcon }
                            </span>
                        ) }
                        <span className={ textClassName }>{ children }</span>
                        { rightIcon && (
                            <span
                                className={ `ml-2 ${ rightIconClassName ?? '' }` }>
                                { rightIcon }
                            </span>
                        ) }
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Shortcut: { renderShortcut() }</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export function Group ( props ) {
    // For rendering and controlling a collection of buttons. These can either act independently, or as a selection array (only the last-clicked button can be active at once).
    const {
        children,
        type = 'default', // DEFAULT | DROPDOWN
        layout = 'row', // ROW | COL | MOSAIC | DROPDOWN
        inputProps,
        debug = false,
    } = props;
    const [ activeIndex, setActiveIndex ] = React.useState( 0 );

    // if(debug)console.log("Button.Group :: {Props} = ", props);
    return (
        <div
            className={ `button-group ${ layout ? `button-group-${ layout }` : ''
                }` }>
            { children && children !== false && children }
        </div>
    );
}
Button.Group = Group;

export function Dropdown ( props ) {
    const {
        // open=false,
        // setOpen=()=>{},
        children, // Children in a dropdown are assumed to be the nav button elements in the opened dropdown.
        active = false,
        orientation = 'left',
        setActive = () => { },
        icon,
        label,
        classes = '',
        name = '',
        endIcon,
        type = 'default', // DEFAULT | DROPDOWN
        layout = 'row', // ROW | COL | MOSAIC | DROPDOWN
        appearance = `flat`, // FLAT (or DEFAULT) | NEUMORPHIC | GLASSMORPHIC | CONSOLE
        inputProps,
        styles = {},
        childClasses = '',
        childStyles = {},
        // Operation option booleans.
        openOnHover = false,
        openOnClick = true,
    } = props;

    // const [ active, setActive ] = useState( false );
    const [ open, setOpen ] = useState( false );
    const [ isHovering, setIsHovering ] = useState( false );

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.{{
        opacity: `${ isHovering ? `${ '1.0' }` : `0.0` }}`,
        ...styles,
        // Responsiveness overrides go here.
    };

    const containerStyles = {
        // Default styles go here.
        // User-set styles override default settings.{{
        display: `${ open ? 'block' : 'none' }`,
        opacity: `${ isHovering ? `${ '1.0' }` : `0.0` }}`,
        ...childStyles,
        // Responsiveness overrides go here.
    };

    const buildDropdown = ( elements ) => {
        let dropdownElements = [];
        if ( utils.val.isValidArray( elements, true ) ) {
            elements.forEach( ( element, index ) => {
                dropdownElements.push(
                    <li
                        key={ `button-dropdown-item-${ index }` }
                        className={ `dropdown-item` }>
                        { element }
                    </li>,
                );
            } );
        }

        return (
            <ul
                className={ `dropdown-menu ` }
                style={ containerStyles }>
                { dropdownElements }
            </ul>
        );
    };

    const handleOnClick = () => {
        console.log( 'Button.Dropdown :: onClick triggered.' );
        // handleClick();
        // handleDropdown( e );
        // if ( openOnClick ) {
        // if ( open ) setOpen( false );
        // else setOpen( true );
        // }

        setOpen( !open );
        setActive( !open );
    };

    // if (debug) console.log("Button.Dropdown :: {Props} = ", props);
    return (
        <div
            className={ `dropdown dropdown-${ orientation ? orientation : 'left'
                } ${ layout ? `dropdown-${ layout }` : '' } ${ open ? `dropdown-active` : ``
                } ${ isHovering ? 'dropdown-hovering' : '' }` }>
            <Button
                label={ label ? label : '' }
                icon={ icon ? icon : '' }
                endIcon={ <div className={ `dropdown-toggle` }></div> }
                type={ type }
                appearance={ appearance }
                onMouseEnter={ ( e ) => {
                    // console.log( "Button.Dropdown :: onMouseEnter triggered." );
                    setIsHovering( true );
                    if ( openOnHover ) setOpen( true );
                } }
                onMouseLeave={ ( e ) => {
                    // console.log( "Button.Dropdown :: onMouseLeave triggered." );
                    // setIsHovering( false );
                    // if ( openOnHover || open ) setOpen( false );
                } }
                onClick={ ( e ) => {
                    handleOnClick();
                } }
                onBlur={ ( e ) => {
                    // Event called when we click away from the dropdown.
                    // console.log( "Button.Dropdown :: onBlur triggered." );
                    setOpen( false );
                } }
                onFocusOut={ () => {
                    // Event called when we click away from the dropdown.
                    // console.log( "Button.Dropdown :: onFocusOut triggered." );
                    setOpen( false );
                } }
                classes={ `button-full ${ classes ? classes : '' }` }
            />
            { children && buildDropdown( children ) }
        </div>
    );
}
Button.Dropdown = Dropdown;

export function Controls ( props ) {
    const {
        // Content settings.
        show = true,
        showLabels = true,
        // controls = [],
        layout = 'row',
        appearance = 'control',
        controls = [
            { label: 'fullscreen', func: () => { }, classes: '' },
            { label: 'edit', func: () => { }, classes: '' },
            { label: 'delete', func: () => { }, classes: '' },
            { label: 'share', func: () => { }, classes: '' },
        ],
        // Styling properties.
        gap = false,
        // Can import extra styles.
        classes = '',
        styles = {},
        debug = false,
    } = props;

    const controlsModel = [
        {
            name: '',
            label: '',
            icon: {},
            classes: ``,
            func: ( e ) => { },
        },
    ];

    const renderControls = () => {
        if ( debug )
            console.log(
                'Button.Controls.js :: renderControls :: controls = ',
                controls,
            );

        return (
            <div
                className={ `button-controls ${ layout === 'row'
                    ? `button-row`
                    : layout === 'column'
                        ? `button-col`
                        : ``
                    } ${ gap === true ? `button-group-gapped` : `` }` }>
                { utils.val.isValidArray( controls, true )
                    ? controls.map( ( control, index ) => {
                        return utils.ao.has( control, 'label' ) &&
                            utils.ao.has( control, 'onClick' ) ? (
                            <div
                                id={ `control-button-${ control.label }` }
                                key={ `control-button-${ control.label }` }
                                className={ `button ${ utils.ao.has( control, 'classes' )
                                    ? control.classes
                                    : ''
                                    } ${ appearance
                                        ? appearance === `glassmorphic`
                                            ? `button-glassmorphic`
                                            : appearance === `neumorphic`
                                                ? `button-neumorphic`
                                                : appearance === `console`
                                                    ? `button-console`
                                                    : appearance === `control`
                                                        ? `button-control`
                                                        : ``
                                        : ``
                                    }` }
                                onClick={ control.onClick }>
                                { showLabels && (
                                    <div className={ `button-text` }>
                                        { control.label }
                                    </div>
                                ) }
                                { control.hasOwnProperty( 'icon' ) ? (
                                    <i className='button-icon'>
                                        { control.icon }
                                    </i>
                                ) : (
                                    <></>
                                ) }
                            </div>
                        ) : (
                            <></>
                        );
                    } )
                    : '' }
            </div>
        );
    };

    if ( debug ) console.log( 'Button.Controls :: {Props} = ', props );
    return show && utils.val.isValidArray( controls, true ) && renderControls();
}
Button.Controls = Controls;


const retroButtonVariants = cva(
    "relative inline-flex items-center justify-center w-24 border-2 border-transparent rounded-[2px] bg-[#010101] shadow-[1px_1px_1px_rgba(255,255,255,0.6)]",
    {
        variants: {
            variant: {
                default: [
                    "text-white",
                    "[--bg-color:theme(colors.orange.500)]",
                    "[--bg-color-active:theme(colors.orange.600)]",
                    "[--shadow-light:theme(colors.orange.300)]",
                    "[--shadow-dark:theme(colors.orange.700)]",
                ],
                darkGray: [
                    "text-white",
                    "[--bg-color:theme(colors.neutral.700)]",
                    "[--bg-color-active:theme(colors.neutral.800)]",
                    "[--shadow-light:theme(colors.neutral.400)]",
                    "[--shadow-dark:theme(colors.neutral.900)]",
                ],
                white: [
                    "text-black",
                    "[--bg-color:theme(colors.neutral.200)]",
                    "[--bg-color-active:theme(colors.neutral.300)]",
                    "[--shadow-light:theme(colors.white)]",
                    "[--shadow-dark:theme(colors.neutral.500)]",
                ],
                lightGray: [
                    "text-white",
                    "[--bg-color:theme(colors.neutral.400)]",
                    "[--bg-color-active:theme(colors.neutral.500)]",
                    "[--shadow-light:theme(colors.neutral.200)]",
                    "[--shadow-dark:theme(colors.neutral.600)]",
                ],
                gray: [
                    "text-white",
                    "[--bg-color:theme(colors.neutral.600)]",
                    "[--bg-color-active:theme(colors.neutral.700)]",
                    "[--shadow-light:theme(colors.neutral.400)]",
                    "[--shadow-dark:theme(colors.neutral.800)]",
                ],
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const retroButtonInnerVariants = cva(
    [
        "inline-block w-full rounded-[9px] px-3 py-2",
        "uppercase tracking-wider text-center",
        "bg-[var(--bg-color)] transition-all duration-200",
        "shadow-[inset_1px_1px_1px_var(--shadow-light),inset_-1px_-1px_1px_var(--shadow-dark),2px_2px_4px_#000]",
        "active:scale-[0.98] active:bg-[var(--bg-color-active)]",
        "active:shadow-[inset_0_0_4px_#000,inset_1px_1px_1px_transparent,inset_-1px_-1px_1px_transparent,2px_2px_4px_transparent]",
    ]
);

/* export interface RetroButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
    children: React.ReactNode;
} */

    export const RetroButton = React.forwardRef(
    ( { className, variant, children, ...props }, ref ) => {
        return (
            <button
                className={ cn( retroButtonVariants( { variant, className } ) ) }
                ref={ ref }
                { ...props }
            >
                <span className={ retroButtonInnerVariants() }>{ children }</span>
            </button>
        );
    }
);
RetroButton.displayName = "RetroButton";
Button.Retro = RetroButton;

/* Usage: 
    function RetroButtonRender() {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-wrap justify-center items-center max-w-[26em] gap-4">
                    <RetroButton>Record</RetroButton>
                    <RetroButton variant="darkGray">Sound</RetroButton>
                    <RetroButton variant="white">Erase</RetroButton>
                    <RetroButton variant="lightGray">Shift</RetroButton>
                    <RetroButton variant="gray">Play</RetroButton>
                </div>
            </div>
        )
    }
*/


// https://21st.dev/serafimcloud/gradient-button/default // 
export const gradientButtonVariants = cva(
    [
        "gradient-button",
        "inline-flex items-center justify-center",
        "rounded-[11px] min-w-[132px] px-9 py-4",
        "text-base leading-[19px] font-[500] text-white",
        "font-sans font-bold",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                default: "",
                variant: "gradient-button-variant",
            },
        },
        defaultVariants: {
            variant: "default",
        }
    }
);

export const GradientButton = React.forwardRef(
    ( { className, variant, asChild = false, ...props }, ref ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={ cn( gradientButtonVariants( { variant, className } ) ) }
                ref={ ref }
                { ...props }
            />
        );
    }
);
Button.Gradient = GradientButton;

export function RainbowButton ( {
    children,
    className,
    ...props
} ) {
    return (
        <button
            className={ cn(
                "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

                // before styles
                "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

                // light mode colors
                "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

                // dark mode colors
                "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

                className,
            ) }
            { ...props }
        >
            { children }
        </button>
    );
}
Button.Rainbow = RainbowButton;

export default Button;

/*
    const handleDropdown = ( e ) =>
    {
        // setShowDropdown(!showDropdown);
        if ( utils.dom.hasClass( e, "dropdown-toggle" ) || utils.dom.hasClass( e, "dropdown" ) || utils.dom.hasClass( e, "nav-list-item" ) )
        {
            // 
            console.log( "handleDropdown :: e = ", e, " :: Dropdown is now = ", open === true ? false : true );
            setOpen( open === true ? false : true );
        }
        // if (showDropdown.current) {
        //     showDropdown.current = false;
        // } else {
        //     showDropdown.current = true;
        // }
        // showDropdown.current = !showDropdown.current;
    };

    return (
        <Button
            classes={ `dropdown ${ layout ? `dropdown-${ layout }` : "" } ${ open ? `dropdown-active` : `` } ${ isHovering ? 'dropdown-hovering' : '' }` }
            label={ label ? label : '' }
            icon={ icon ? icon : '' }
            onMouseEnter={ ( e ) =>
            {
                console.log( "Button.Dropdown :: onMouseEnter triggered." );
                setIsHovering( true );
                if ( openOnHover ) setOpen( true );
            } }
            onMouseLeave={ ( e ) =>
            {
                console.log( "Button.Dropdown :: onMouseLeave triggered." );
                // setIsHovering( false );
                // if ( openOnHover || open ) setOpen( false );
            } }
            // onBlur={ ( e ) =>
            // {
            //     // Event called when we click away from the dropdown.
            //     setOpen( false );
            // }}
            // onFocus={ ( e ) =>
            // {
            //     // Event called when we click on the dropdown.
            //     setOpen( true );
            // }}
            onClick={ ( e ) =>
            {
                console.log( "Button.Dropdown :: onClick triggered." );
                // handleClick();
                // handleDropdown( e );
                if ( open ) setOpen( false );
                else setOpen( true );
            } }
            onBlur={ ( e ) =>
            {
                // Event called when we click away from the dropdown.
                console.log( "Button.Dropdown :: onBlur triggered." );
                setOpen( false );
            } }
            styles={ componentStyles }
            endIcon={<div className={ `dropdown-toggle` }></div>}
        >
            { children && buildDropdown( children ) }
        </Button>
    );
*/

/*  // https://codepen.io/sgbn23/pen/rNZEjOq // 
    <div class="container">
        <h1 class="section-title">Normal buttons</h1>
        <div class="button-collection">
            <div class="button-group button-cols">
                <div class="button button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
            </div>
        </div>
        <h1 class="section-title">Glassmorphic buttons</h1>
        <div class="button-collection">
            <button class="button button-glassmorphic button-glow button-primary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </button>
            <button class="button button-glassmorphic button-glow button-secondary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </button>
            <button class="button button-glassmorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </button>
            <button class="button button-glassmorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </button>
        </div>
        <h1 class="section-title">Glassmorphic buttons as a group</h1>
        <div class="button-collection">
            <div class="button-group">
                <div class="button button-glassmorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-glassmorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-glassmorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-glassmorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
        </div>
        <h1 class="section-title">Neumorphic buttons</h1>
        <div class="button-collection">
            <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </div>
            <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </div>
            <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </div>
            <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                <div class="button-text">Button Text</div>
            </div>
        </div>
        <h1 class="section-title">Neumorphic buttons as a group</h1>
        <div class="button-collection">
            <div class="button-group">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">Button Text</div>
                </div>
            </div>
        </div>

        <h1 class="section-title">Buttons as a group of rows</h1>
        <div class="button-collection button-rows">
            <div class="button-group button-row">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
            <div class="button-group button-row">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
            <div class="button-group button-row">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
        </div>

        <h1 class="section-title">Buttons as a group of columns</h1>
        <div class="button-collection button-cols">
            <div class="button-group button-col">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
            <div class="button-group button-col">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
            <div class="button-group button-col">
                <div class="button button-neumorphic button-glow button-primary" onclick="btnOnClick(event)">
                    <div class="button-text">1</div>
                </div>
                <div class="button button-neumorphic button-glow button-secondary" onclick="btnOnClick(event)">
                    <div class="button-text">2</div>
                </div>
                <div class="button button-neumorphic button-glow button-tertiary" onclick="btnOnClick(event)">
                    <div class="button-text">3</div>
                </div>
                <div class="button button-neumorphic button-glow button-quaternary" onclick="btnOnClick(event)">
                    <div class="button-text">4</div>
                </div>
            </div>
        </div>
    </div>
*/
