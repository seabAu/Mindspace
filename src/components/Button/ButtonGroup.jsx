import
React,
{
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback
} from 'react';
import * as utils from 'akashatools';
import { HEADER_TRIGGER_DROPDOWN_WIDTH_MD } from '@/lib/config/constants';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { EllipsisIcon } from 'lucide-react';

const ButtonGroup = ( props ) => {
    const {
        buttons = [],
        // showDropdown,
        dropdownTriggerIcon,
        responsiveMode = 'dropdown', // DROPDOWN | WRAP | SCROLL | LIST
        responsiveBreakpoint = HEADER_TRIGGER_DROPDOWN_WIDTH_MD,
        parentRoute,
        activeValue,
        setActiveValue,
        containerClassNames = '',
        buttonClassNames = '',
        dropdownMenuClassNames = '',
        dropdownTriggerClassNames = '',
        dropdownContentClassNames = '',
        rounded = true,
    } = props;

    const navigate = useNavigate();

    const [ responsiveRender, setResponsiveRender ] = useState( false ); // Whether we're above or below the threshold. 
    const [ showDropdown, setShowDropdown ] = useState( false );
    const [ width, setWidth ] = useState( window.innerWidth );
    const [ height, setHeight ] = useState( window.innerHeight );

    const updateDimensions = () => {
        setWidth( window.innerWidth );
        setHeight( window.innerHeight );
    };

    useEffect( () => {
        // Catch and process changes in window size. 
        window.addEventListener( "resize", updateDimensions );
        return () => window.removeEventListener( "resize", updateDimensions );
    }, [] );

    useEffect( () => {
        // Catch and process changes in smallScale
        // if ( showDropdown && width > responsiveBreakpoint ) setShowDropdown( false );
        if ( width > responsiveBreakpoint ) {
            // Over threshold, don't use dropdown. If currently open. close it.
            setResponsiveRender( false );
            if ( showDropdown ) setShowDropdown( false );
        } else {
            // Under threshold; shrink to dropdown
            setResponsiveRender( true );
            setShowDropdown( true );
        }
    }, [ width, responsiveBreakpoint ] );

    /* 
        useEffect( () => {
            // Catch and process changes in smallScale
            if ( showDropdown && width > responsiveBreakpoint ) setShowDropdown( false );
        }, [ width ] );
    */

    const buildButtonGroup = ( {
        parentRoute,
        buttons,
        showDropdown,
        activeValue,
        setActiveValue,
        useLinks = false,
    } ) => {
        let elements = [];
        if ( utils.val.isValidArray( buttons, true ) ) {

            buttons.forEach( ( btn, index ) => {
                let {
                    title,
                    value,
                    active,
                    onClick
                } = btn;

                let noOutline = `!focus:outline-none !focus-within:outline-none !focus-visible:outline-none !focus:outline-transparent select-none `;
                let btnClassNames = twMerge(
                    noOutline,
                    `px-3 items-center justify-center self-center items-start justify-start gap-0`,

                    ( responsiveRender === true && responsiveMode === 'dropdown' ) && `!w-full`,
                    ( responsiveRender === true && responsiveMode === 'wrap' ) && `!w-auto`,

                    rounded && ( responsiveRender === false || showDropdown === false ) && index === 0 && 'rounded-l-full',

                    rounded && ( responsiveRender === false || showDropdown === false ) && index === buttons.length - 1 && 'rounded-r-full',

                    rounded && ( responsiveRender || showDropdown === false ) && ( responsiveMode === 'wrap' ) && index === 0 && 'rounded-l-full',

                    rounded && ( responsiveRender || showDropdown === false ) && ( responsiveMode === 'wrap' ) && index === buttons.length - 1 && 'rounded-r-full',
                    // activeValue === btn?.value.toLowerCase()
                    //     ? 'cool:bg-tahiti-900 dark:bg-sextary-300 light:bg-sextary-100 border border-primary-purple-1000 hover:bg-sextary-200'
                    //     : 'cool:bg-tahiti-900 light:bg-sextary-300 bg-sextary-900 border border-hidden border-sextary-600 hover:bg-sextary-300  hover:dark:bg-secondary-800',
                    activeValue === btn?.value.toLowerCase()
                        ? 'bg-muted-foreground bg-primary-900 border border-muted hover:bg-muted-foreground'
                        : 'bg-muted-background border border-hidden border-muted hover:bg-primary-900 text-muted-foreground',
                    // `focus:outline-none focus-within:outline-none focus-visible:outline-none border-muted hover:bg-secondaryAlt-900 hover:text-accent-foreground `,
                    // `focus:outline-none focus-within:outline-none focus-visible:outline-none border-muted hover:bg-background hover:text-accent-foreground`,
                    // `!border !border-primary-purple-1000`,
                    `!h-full`,
                );
                let id = `group-btn-${ btn?.title }-${ btn?.value }-${ index }`;

                let button;
                if ( btn?.link ) {
                    button = (
                        <Button
                            variant={ `ghost` }
                            className={ twMerge(
                                btnClassNames,
                                showDropdown === true && responsiveRender && `!w-full`,
                                rounded && ( responsiveRender === false || showDropdown === false ) && index === 0 && 'rounded-l-full',

                                rounded && ( responsiveRender === false || showDropdown === false ) && index === buttons.length - 1 && 'rounded-r-full',
                                'h-full',
                                buttonClassNames,
                            ) }
                            size={ `xs` }
                            onClick={ () => {
                                if ( btn?.onClick ) { btn?.onClick( value ); }
                                setActiveValue( btn?.value );
                                navigate( `../${ parentRoute }/${ btn?.link }` );
                            } }
                        >
                            {/* <Link
                                className={ twMerge(
                                    // btnClassNames,
                                    showDropdown === true && responsiveRender && `!w-full `,
                                    `text-foreground hover:text-ring`,
                                ) }
                                // className={ btnClassNames }
                                to={ {
                                    // pathname: `${ parentRoute }/`, // '/',
                                    // search: `t=${ btn?.value }`, // '?myParam=myValue',
                                    pathname: `../${ parentRoute }/${ btn?.link }`
                                } }
                            >
                                { btn?.title }
                            </Link> */}
                            { btn?.title }
                        </Button>
                    );
                }
                else {
                    button = (
                        <Button
                            className={ twMerge(
                                btnClassNames,

                                rounded && ( responsiveRender === false || showDropdown === false ) && index === 0 && 'rounded-l-full',

                                rounded && ( responsiveRender === false || showDropdown === false ) && index === buttons.length - 1 && 'rounded-r-full',
                                buttonClassNames,
                            ) }
                            // variant={ `${ activeValue === btn?.value.toLowerCase() ? 'default' : 'ghost' }` }
                            variant={ `ghost` }
                            // variant={ `${ btn?.active === true // === btn?.value.toLowerCase()
                            //     ? 'default'
                            //     : 'ghost'
                            //     }` }
                            size={ `xs` }
                            onClick={ () => {
                                if ( btn?.onClick ) {
                                    btn?.onClick( value );
                                }
                                setActiveValue( btn?.value.toLowerCase() );
                            } }
                        >
                            { btn?.title && (
                                <p
                                    className={ twMerge(
                                        noOutline,
                                    ) }
                                >
                                    { btn?.title }
                                </p>
                            ) }
                        </Button>
                    );
                }

                if ( responsiveMode === 'dropdown' && showDropdown ) {
                    elements.push(
                        <DropdownMenuItem
                            key={ id }
                            id={ id }
                            className={ twMerge(
                                showDropdown === true || responsiveRender === true && `!p-0 !w-full !min-w-full `,
                                rounded && ( responsiveRender === false || showDropdown === false ) && index === 0 && 'rounded-l-full',

                                rounded && ( responsiveRender === false || showDropdown === false ) && index === buttons.length - 1 && 'rounded-r-full',
                                buttonClassNames,
                            ) }
                            onClick={ () => {
                                if ( btn?.onClick ) {
                                    btn?.onClick( value );
                                }
                                setActiveValue( btn?.value.toLowerCase() );
                            } }
                        >
                            { button }
                        </DropdownMenuItem>
                    );
                }
                else {
                    elements.push( button );
                }
            } );
        }

        return (
            <div className={
                twMerge(
                    `content-header-nav nav-dropdown-sm flex flex-row p-0 overflow-hidden items-center bg-transparent`,
                    responsiveRender === true && 'h-full w-full overflow-hidden',
                    responsiveMode === 'dropdown' && `h-auto justify-stretch gap-0`,
                    responsiveMode === 'wrap' && `h-full justify-start items-start`,
                    ` !z-1000`,
                    `border-[0.1rem] border-primary-purple-1000`,
                    containerClassNames,
                ) }
            >
                { responsiveRender
                    ? ( ( showDropdown && responsiveMode === 'dropdown' )
                        ? ( <DropdownMenu
                            className={
                                twMerge(
                                    dropdownMenuClassNames,
                                )
                            }
                        >
                            <DropdownMenuTrigger
                                className={
                                    twMerge(
                                        dropdownTriggerClassNames,
                                    )
                                }>
                                { dropdownTriggerIcon ?? <EllipsisIcon className={ `p-2 size-4 aspect-square justify-center items-center self-center` } /> }
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className={
                                    twMerge(
                                        `w-full `,
                                        dropdownContentClassNames,
                                    )
                                }>
                                { elements }
                            </DropdownMenuContent>
                        </DropdownMenu> )
                        : ( ( ( responsiveMode === 'wrap' )
                            ? ( <div className={
                                twMerge(
                                    `w-full flex flex-wrap !h-full flex-grow items-start justify-start `,
                                    responsiveRender === true && 'h-6 w-full overflow-hidden',
                                    responsiveMode === 'dropdown' && `h-auto justify-stretch gap-0 `,
                                    responsiveMode === 'wrap' && `h-full justify-start items-start`,
                                    containerClassNames,
                                    ` !z-1000`,
                                ) }>
                                { elements }
                            </div> )
                            : ( elements )
                        ) )
                    )
                    : ( elements )
                }
            </div >
        );
    };

    return (
        <>
            { utils.val.isValidArray( buttons, true ) && (
                buildButtonGroup( {
                    parentRoute: parentRoute,
                    buttons: buttons,
                    showDropdown: responsiveRender | showDropdown,
                    activeValue: activeValue,
                    setActiveValue: setActiveValue,
                } ) ) }
        </>
    );
};

export default ButtonGroup;
