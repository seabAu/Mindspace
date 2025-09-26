// Modular component for the custom header used at the top of each section with subsection nav and various buttons, and a refresh button. 

import React, { useCallback, useEffect, useState } from 'react';
import Content from '@/components/Page/Content';
import { Button } from '@/components/ui/button';
import * as utils from 'akashatools';
import { MenuSquare, RefreshCcw } from 'lucide-react';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { useLocation, useNavigate } from 'react-router-dom';
import { buttonListToSchema } from '@/lib/utilities/nav';
import { twMerge } from 'tailwind-merge';
import { CONTENT_HEADER_HEIGHT, CONTENT_NAV_HEADER_HEIGHT } from '@/lib/config/constants';

const ContentHeader = ( {
    useRefresh = true,
    refreshFn = () => { },
    parentRoute = 'dash',
    parentPath = '/dash',
    activeRoute,
    setActiveRoute,
    defaultRoute, // Fallback default on load.
    routes,
    buttonsLeft,
    buttonsRight,
    className,
    children,
}, ...props ) => {

    const location = useLocation();
    const navigate = useNavigate();
    const { pathname } = location;
    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( parentRoute ) + 1 ];

    const handleGetActiveRoute = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( localStorageName );
        if ( !t || t === '' ) { return endpoint ?? defaultRoute; }
        return t;
    };

    // const [ viewType, setViewType ] = useState( endpoint ?? handleGetActiveRoute() ); 


    const buttonClassNames = `px-2 py-1 rounded-lg items-center justify-center outline-none focus-within:outline-none focus-visible:outline-none focus:outline-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`;

    useEffect( () => {
        setActiveRoute( endpoint ?? handleGetActiveRoute() );
    }, [ endpoint ] );

    return (
        <Content.Header
            className={
                twMerge(
                    `flex flex-row justify-stretch items-center w-full gap-2 px-1`,
                    `h-8 max-h-8`,
                    className,
                    `min-h-[calc(var(--content-header-height))] h-[calc(var(--content-header-height))] !max-h-[calc(var(--content-header-height))]`,
                )
            }
            style={ { '--content-header-height': `${ String( CONTENT_NAV_HEADER_HEIGHT ) }rem` } }
        >
            { buttonsLeft && (
                <div className={ `flex flex-row flex-shrink items-center justify-around rounded-lg` }>
                    { buttonsLeft }
                </div>
            ) }

            <div className={ `flex flex-row flex-grow items-center justify-around px-4 rounded-lg border w-full` }>

                <ButtonGroup
                    // parentRoute={ `/${ parentPath }` }
                    parentRoute={ parentPath }
                    buttonClassNames={ `` }
                    containerClassNames={ `border-transparent min-h-7 rounded-full !hover:bg-transparent items-center justify-stretch max-h-8 h-full` }
                    dropdownMenuClassNames={ `rounded-lg bg-transparent hover:bg-transparent p-1 m-0` }
                    dropdownTriggerClassNames={ `` }
                    dropdownContentClassNames={ `` }
                    buttons={
                        buttonListToSchema(
                            routes,
                            activeRoute,
                            ( value ) => {
                                setActiveRoute( value );
                            }
                        ) }
                    activeValue={ activeRoute }
                    setActiveValue={ setActiveRoute }
                    dropdownTriggerIcon={ <MenuSquare className={ `p-1 h-9` } /> }
                    responsiveMode={ 'dropdown' }
                    responsiveBreakpoint={ 980 }
                />
            </div>
            { children }


            { buttonsRight && (
                <div className={ `flex flex-row flex-grow items-center justify-around px-4 rounded-lg border w-full` }>
                    { buttonsRight }
                </div>
            ) }

            <div className={ `flex flex-row flex-shrink items-center justify-between w-min` }>
                { useRefresh === true && (
                    <Button
                        size={ 'xs' }
                        variant={ 'outline' }
                        className={ `px-2 py-1 m-0 size-8 focus:outline-none aspect-square focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-lg self-center` }
                        onClick={ () => refreshFn() }
                    >
                        <RefreshCcw className={ `p-0 m-0 size-7 hover:animate-rotate transition-all` } />
                    </Button>
                ) }
            </div>

        </Content.Header>

    );
};

export default ContentHeader;