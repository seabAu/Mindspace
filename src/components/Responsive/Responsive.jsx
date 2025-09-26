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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HEADER_TRIGGER_DROPDOWN_WIDTH_MD } from '@/lib/config/constants';
import { twMerge } from 'tailwind-merge';

const Responsive = ( props ) => {
    const {
        children,
        dropdownBreakpoint = HEADER_TRIGGER_DROPDOWN_WIDTH_MD,
        DROPDOWN_BREAKPOINTS = [ 768 ],
        containerClassNames = '',
        dropdownContainerClassNames = '',
        dropdownMenuClassNames = '',
    } = props;

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
        // if ( showDropdown && width > dropdownBreakpoint ) setShowDropdown( false );
        if ( width > dropdownBreakpoint ) {
            // Over threshold, don't use dropdown.
            // If currently open. close it.
            if ( showDropdown ) setShowDropdown( false );
        } else {
            // Under threshold; shrink to dropdown
            setShowDropdown( true );
        }
    }, [ width ] );

    /* 
        useEffect( () => {
            // Catch and process changes in smallScale
            if ( showDropdown && width > dropdownBreakpoint ) setShowDropdown( false );
        }, [ width ] );
    */

    return (
        <div>
            <div className={ `bg-gradient-to-r from-slate-900 to-slate-700 overflow-hidden` }>
                <div className="content-body mx-auto h-9 w-full max-w-3xl rounded-xl justify-center items-center overflow-hidden">
                    {
                        width > dropdownBreakpoint && (
                            <div className={ twMerge(
                                `content-header-nav nav-dropdown-sm flex flex-row justify-center items-center`,
                                containerClassNames,
                            ) }>
                                {/* { buildPlannerBtns( false ) } */ }
                                { children }
                            </div>
                        )
                    }
                    {
                        width < dropdownBreakpoint && (
                            <div
                                className={ twMerge(
                                    `content-header-nav nav-dropdown-sm flex flex-row justify-center items-center h-full w-full overflow-hidden`,
                                    dropdownContainerClassNames,
                                ) }
                            >
                                <DropdownMenu
                                    className={ twMerge(
                                        dropdownMenuClassNames,
                                    ) }
                                >
                                    <DropdownMenuTrigger>
                                        <EllipsisIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {/* { buildPlannerBtns( true ) } */ }
                                        { children }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Responsive;
