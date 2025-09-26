import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import * as utils from 'akashatools';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import GenericContextMenu from "@/components/ContextMenu/ContextMenu";
import { SidebarMenu } from "@/components/ui/sidebar";
import { EllipsisIcon, MoreHorizontalIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { convertCamelCaseToSentenceCase } from "./string";


/*  Converts a given array of strings into a button schema that is used by our custom tabs / button-groups.
*/
export const buttonListToSchema = ( buttonNames, view = '', setView = () => { } ) => {
    if ( utils.val.isValidArray( buttonNames ) ) {
        return buttonNames.map( ( b, index ) => (
            {
                title: ( b ? convertCamelCaseToSentenceCase( b ) : 'N/A' ),
                value: b,
                active: view === this?.value,
                link: b,
                onClick: () => setView( b ),
            } )
        );
    }
};



/*  // The schema for controls is as follows: 
    {
        index: 0,
        enabled: true,
        type: 'navlink',
        name: "home",
        label: "Home",
        link: '/',
        icon: <FaSwatchbook className="fa fa-2x nav-button-icon icon" />,
        classes: `nav-list-item`,
        onClick: ( e ) => { }
    }
*/
export const buildNav = ( controls, parentClasses = "", navClasses = "" ) => {
    let elements = [];
    let randKey = utils.rand.rand( 1e6, 0 );
    if ( utils.val.isValidArray( controls, true ) ) {
        controls?.filter( ( nav ) => ( nav?.enabled ) ).forEach( ( nav, index ) => {
            // Create button element. No matter what type this nav button is - the part wrapped around the button itself - the button itself will be the same.
            let id = `nav-button-${ nav?.index ? nav?.index : index }-${ nav?.name || nav?.title }-${ index }`;
            let button = (
                <Button
                    id={ id }
                    key={ id }
                    className={ `p-0 m-0 h-full w-full flex flex-row justify-stretch py-1 px-2 relative ${ navClasses ? navClasses : '' }` }
                    size={ `sm` }
                    variant={ 'ghost' }
                    onClick={ nav.onClick ? () => {
                        if ( nav.onClick ) {
                            nav.onClick();
                        }
                    } : () => { } }>
                    { nav?.icon && nav.icon }
                    { nav?.label && <div className="nav-button-text">{ nav.label }</div> }
                </Button>
            );

            // elements.push( button );
            if ( nav.type === 'navlink' ) {
                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <Link onClick={ () => { setShowDropdown( false ); } }
                            className={ `` }
                            to={ `${ nav.link }` }>
                            { nav.icon && nav.icon }
                            { nav.label && <div className="nav-button-text">{ nav.label }</div> }
                        </Link>
                    </li>
                );
            }
            else if ( nav.type === 'link' ) {
                // A useNavigate hook-using button.
                elements.push(
                    <li
                        className={ `${ nav?.classes ? nav?.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <Button
                            className={ `button nav-button` }
                            label={ nav?.label ? nav?.label : '' }
                            icon={ nav.icon ? nav.icon : '' }
                            onClick={ ( e ) => {
                                if ( nav.onClick ) {
                                    nav.onClick();
                                }
                                if ( nav.link ) {
                                    setShowDropdown( false );
                                }
                            } }>
                        </Button>
                    </li>
                );
            }
            else if ( nav?.type === 'href' ) {
                elements.push(
                    <li
                        className={ `${ nav?.classes ? nav?.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <a
                            className={ `button nav-button` }
                            href={ `${ nav?.link }` }
                        >
                            { nav?.icon && nav.icon }
                            { nav?.label && <div className="nav-button-text">{ nav?.label }</div> }
                        </a>
                    </li>
                );
            }
            else if ( nav?.type === 'button' ) {
                // Just the button.
                elements.push(
                    <li
                        className={ `${ nav?.classes ? nav?.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        { button }
                    </li>
                );
            }
            else if ( nav?.type === 'dropdown' ) {
                // let active = false;
                elements.push(

                    <DropdownMenuGroup
                        id={ id }
                        key={ id }
                        className={ `${ nav?.classes ? nav?.classes : '' }` }
                    // id={ nav?.label }
                    >
                        <DropdownMenuItem
                            onClick={ () => {
                                if ( nav?.onClick ) {
                                    nav.onClick();
                                }
                            } }
                        >
                            {/* { nav?.logo && <img src={ nav?.logo } height={ `0.125rem` } width={ `0.125rem` } /> } */ }
                            {
                                nav?.icon && nav?.icon != "" && (
                                    nav.icon
                                    // <nav.icon className={ `` } />
                                )
                            }
                            { nav?.label && (
                                <p className={ `dark:white text-sextary-50` }>
                                    { nav?.label }
                                </p>
                            ) }
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                );
            }
        } );

        return (
            // <ul className="dropdown-menu-items avatar-dropdown-menu-items dropdown-menu avatar-dropdown-menu ">
            //     { elements }
            // </ul>
            <ul className={
                parentClasses
                // `nav-list flex justify-between whitespace-nowrap dropdown-menu dropdown-menu-items `
            }
            >
                { elements }
            </ul>
        );
    }
};

export const buildButtonGroup = ( {
    parentRoute,
    buttons,
    showDropdown,
    activeValue,
    setActiveValue,

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

            let noOutline = `focus:outline-none focus-within:outline-none focus-visible:outline-none focus:outline-transparent`;
            let id = `group-btn-${ btn?.title }-${ btn?.value }-${ index }`;
            let link = (
                <Link
                    className={ `${ noOutline }w-full px-2 py-1 border-muted hover:bg-secondaryAlt-900 h-auto hover:text-accent-foreground ` }
                    to={ {
                        pathname: `${ parentRoute }/`, // '/',
                        search: `t=${ btn?.value }`, // '?myParam=myValue',
                    } }
                >
                    { btn?.title }
                </Link>
            );

            let button = (
                <Button
                    className={ twMerge(
                        noOutline,
                        `px-3 w-full items-center justify-center self-center gap-0`,
                        showDropdown === false && index === 0 && 'rounded-l-full',
                        showDropdown === false && index === buttons.length - 1 && 'rounded-r-full',
                        activeValue === btn?.value.toLowerCase()
                            ? 'cool:bg-tahiti-900 dark:bg-sextary-300 light:bg-tahiti-100'
                            : 'cool:bg-tahiti-900 light:bg-sextary-300 dark:bg-tahiti-900'
                        ,

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
                    {
                        btn?.title && (
                            <p
                                className={ twMerge(
                                    noOutline,
                                    `px-0 w-full hover:text-body hover:dark:text-body items-center justify-center self-center`,
                                    activeValue === btn?.value.toLowerCase()
                                        ? 'dark:text-textColor text-sextary-50'
                                        : 'text-sextary-50 dark:text-textColor'
                                    ,
                                ) }
                            >
                                { btn?.title }
                            </p>
                        )
                    }
                </Button>
            );

            if ( showDropdown ) {
                elements.push(
                    <DropdownMenuItem
                        key={ id }
                        id={ id }
                        className={ twMerge( noOutline, `p-0 gap-0 m-0` ) }
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
        <div className={ twMerge(
            `content-header-nav nav-dropdown-sm flex flex-row justify-stretch gap-0 h-6 p-0 overflow-hidden items-center bg-transparent`,
            showDropdown === true && 'h-full w-full overflow-hidden',
        ) }
        >
            { showDropdown
                ? ( <DropdownMenu>
                    <DropdownMenuTrigger> <EllipsisIcon /> </DropdownMenuTrigger>
                    <DropdownMenuContent> { elements } </DropdownMenuContent>
                </DropdownMenu> )
                : ( elements )
            }
        </div>
    );
};

export const buildButtonGroupResponsive = ( { parentRoute, buttons, showDropdown, activeValue, setActiveValue } ) => {
    let elements = [];
    if ( utils.val.isValidArray( buttons, true ) ) {

        buttons.forEach( ( btn, index ) => {
            let {
                title,
                value,
                active,
                onClick
            } = btn;

            let id = `group-btn-${ btn?.title }-${ btn?.value }-${ index }`;
            let link = (
                <Link
                    className={ `focus:outline-none focus-within:outline-none focus-visible:outline-none w-full px-2 py-1 border-muted hover:bg-secondaryAlt-900 h-auto hover:text-accent-foreground ` }
                    to={ {
                        pathname: `${ parentRoute }/`, // '/',
                        search: `t=${ btn?.value }`, // '?myParam=myValue',
                    } }
                >
                    { btn?.title }
                </Link>
            );

            let button = (
                <Button
                    className={ twMerge(
                        `px-3 focus:outline-none focus-within:outline-none focus-visible:outline-none w-full items-center justify-center self-center gap-0`,

                        showDropdown === false && index === 0 && 'rounded-l-full',

                        showDropdown === false && index === buttons.length - 1 && 'rounded-r-full',

                        activeValue === btn?.value.toLowerCase()
                            ? 'cool:bg-tahiti-900 dark:bg-sextary-300 light:bg-tahiti-100'
                            : 'cool:bg-tahiti-900 light:bg-sextary-300 dark:bg-tahiti-900'
                        ,

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
                    {
                        btn?.title && (
                            <p
                                className={ twMerge(
                                    `px-0 focus:outline-none focus-within:outline-none focus-visible:outline-none w-full hover:text-body hover:dark:text-body items-center justify-center self-center`,
                                    activeValue === btn?.value.toLowerCase()
                                        ? 'dark:text-textColor text-sextary-50'
                                        : 'text-sextary-50 dark:text-textColor'
                                    ,
                                ) }
                            >
                                { btn?.title }
                            </p>
                        )
                    }
                </Button>
            );

            if ( showDropdown ) {
                elements.push(
                    <DropdownMenuItem
                        key={ id }
                        id={ id }
                        className={ `p-0 gap-0 m-0` }
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
        <div className={ twMerge(
            `content-header-nav nav-dropdown-sm flex flex-row justify-stretch gap-0 h-6 p-0 overflow-hidden items-center bg-transparent`,
            showDropdown === true && 'h-full w-full overflow-hidden',
        ) }
        >
            { showDropdown
                ? ( <DropdownMenu>
                    <DropdownMenuTrigger> <EllipsisIcon /> </DropdownMenuTrigger>
                    <DropdownMenuContent> { elements } </DropdownMenuContent>
                </DropdownMenu> )
                : ( elements )
            }
        </div>
    );
};
/* 
export const buildItemContextMenu =
    useCallback(
        ( controls, item, index, children ) => {
            console.log( "Nav :: nav.js :: buildItemContextMenu :: Re-rendering: item = ", item, " :: ", "controls = ", controls );

            const {
                title,
                url,
                target,
                icon,
                badge,
                active,
            } = item;

            let id = title
                ? `nav-context-menu-list-item-${ title }-${ index }`
                : `nav-context-menu-list-item-${ 'noname' }-${ index }`;
            return (
                <GenericContextMenu
                    id={ id }
                    key={ id }
                    className={ `select-none outline-none cursor-pointer p-0 h-6 m-0 focus:outline-none` }
                    refItemData={ item }
                    controls={ controls }
                >
                    { children ? ( children ) : ( <MoreHorizontalIcon /> ) }
                </GenericContextMenu>
            );
        }
        , [ items ] );
 */

export const buildContextItems = ( items ) => {
    console.log( "Nav :: nav.js :: buildContextItems :: Re-rendering: items = ", items );

    return (
        <SidebarMenu
            className={ `gap-0 p-0` }
        >
            {
                items ? (
                    utils.val.isValidArray( items, true ) && (
                        items.map(
                            ( item, index ) => {
                                const {
                                    title,
                                    url,
                                    target,
                                    icon,
                                    badge,
                                    active,
                                } = item;
                                // console.log(  nav.js :: buildContextItems :: title, active, url, badge = ", title, active, url, badge );

                                let id = title ? `sidebar-nav-item-${ title }-${ index }` : `sidebar-nav-item-${ index }`;
                                return (
                                    <GenericContextMenu
                                        id={ id }
                                        key={ id }
                                        className={ `select-none outline-none cursor-pointer p-0 h-6 m-0 focus:outline-none` }
                                        refItemData={ item }
                                        controls={ controls }
                                    >
                                        { children ? ( children ) : ( <MoreHorizontalIcon /> ) }
                                    </GenericContextMenu>
                                );
                            }
                        )
                    )
                ) : (
                    <></>
                )
            }
        </SidebarMenu>
    );
};

// Utility function to check if a string is an ObjectId
export const isObjectId = ( str ) => {
    return /^[0-9a-fA-F]{24}$/.test( str );
};

// Extract route matching logic
export const findRouteConfig = ( routes, endpoint ) => {
    return routes?.find( route => route?.endpoint === endpoint );
};

// Build breadcrumb path data
export const buildBreadcrumbPath = ( pathTokens, routesConfig, getDataOfType ) => {
    let tempLocalPath = [];
    let tempRoutesConfig = [ ...routesConfig ];

    return pathTokens
        ?.filter( x => x )
        ?.map( token => {
            tempLocalPath.push( token );

            if ( isObjectId( token ) ) {
                return handleObjectIdToken( token, tempLocalPath, tempRoutesConfig, getDataOfType );
            }

            return handleRegularToken( token, tempLocalPath, tempRoutesConfig );
        } )
        ?.filter( Boolean );
};

// Handle ObjectId tokens in breadcrumbs
export const handleObjectIdToken = ( token, tempLocalPath, tempRoutesConfig, getDataOfType ) => {
    const updatedRoutes = tempRoutesConfig?.map( route => ( {
        ...route,
        title: route.title.replace( ':id', token ),
        endpoint: route.endpoint.replace( ':id', token ),
        target: route.target.replace( ':id', token ),
        url: route.url.replace( ':id', token ),
    } ) );

    const tokenConfig = findRouteConfig( updatedRoutes, token );

    if ( !tokenConfig ) return null;

    let sameLevelOptions = [];
    if ( tokenConfig.pageDataType ) {
        const dataOfType = getDataOfType( tokenConfig.pageDataType );
        if ( utils.val.isValidArray( dataOfType, true ) ) {
            sameLevelOptions = dataOfType.map( item => ( {
                value: item?._id || item?.id,
                endpoint: item?._id || item?.id,
                label: item?.title || item?.name,
            } ) );
        }
    }

    return {
        endpoint: token,
        url: `${ tempLocalPath.join( '/' ) }/detail`,
        title: caseCamelToSentence( token ),
        label: caseCamelToSentence( token ),
        options: sameLevelOptions,
    };
};

// Handle regular path tokens
export const handleRegularToken = ( token, tempLocalPath, tempRoutesConfig ) => {
    const tokenConfig = findRouteConfig( tempRoutesConfig, token );

    if ( !tokenConfig ) return null;

    const sameLevelOptions = tempRoutesConfig.map( route => route?.endpoint );

    return {
        endpoint: token,
        url: tempLocalPath.join( '/' ),
        title: caseCamelToSentence( token ),
        label: caseCamelToSentence( token ),
        options: sameLevelOptions,
    };
};

// Get data length safely
export const getDataLengthSafe = ( data ) => {
    return utils.val.isValidArray( data, true ) ? data.length : '';
};

// Calculate trash count
export const calculateTrashCount = ( dataArrays ) => {
    return dataArrays.reduce( ( total, data ) => {
        if ( !utils.val.isValidArray( data, true ) ) return total;
        return total + data.filter( item => item?.inTrash ).length;
    }, 0 );
};

// Build navigation configuration
export const buildNavConfig = ( routesConfig, dataStores ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }

    return routesConfig.map( route => ( {
        ...route,
        badge: route.badgeDataKey ? getDataLengthSafe( dataStores[ route.badgeDataKey ] ) : route.badge,
    } ) );
};


// Flatten routes recursively
export const flattenRoutes = ( parentPath = '', routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    let flattened = [];

    routesConfig.forEach( route => {
        const fullPath = parentPath ? `${ parentPath }/${ route.endpoint }` : route.endpoint;
        const routeWithPath = { ...route, fullPath };

        flattened.push( routeWithPath );

        if ( route.pages && Array.isArray( route.pages ) ) {
            flattened = [ ...flattened, ...flattenRoutes( route.pages, fullPath ) ];
        }
    } );

    return flattened;
};

// Find route by endpoint
export const findRouteByEndpoint = ( endpoint, routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    for ( const route of routesConfig ) {
        if ( route.endpoint === endpoint ) {
            return route;
        }
        if ( route.pages && Array.isArray( route.pages ) ) {
            const found = findRouteByEndpoint( endpoint, route.pages );
            if ( found ) return found;
        }
    }
    return null;
};

// Find route by path
export const findRouteByPath = ( path, routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    const pathSegments = path.split( '/' ).filter( Boolean );
    let currentRoutes = routesConfig;
    let currentRoute = null;

    for ( const segment of pathSegments ) {
        currentRoute = currentRoutes.find( route =>
            route.endpoint === segment ||
            ( route.isDynamic && route.endpoint === ':id' )
        );

        if ( !currentRoute ) break;

        if ( currentRoute.pages && Array.isArray( currentRoute.pages ) ) {
            currentRoutes = currentRoute.pages;
        }
    }

    return currentRoute;
};

// Get all routes that should show in menu
export const getMenuRoutes = ( routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    return flattenRoutes( routesConfig ).filter( route => route.showInMenu && route.enabled );
};

// Get all routes with shortcuts
export const getShortcutRoutes = ( routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    return flattenRoutes( routesConfig ).filter( route => route.shortcut && route.enabled );
};

// Get routes by parent endpoint
export const getChildRoutes = ( parentEndpoint, routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    const parentRoute = findRouteByEndpoint( parentEndpoint, routesConfig );
    return parentRoute?.pages || [];
};

// Get breadcrumb data for a path
export const getBreadcrumbData = ( pathname, routesConfig = [] ) => {
    if ( !utils.val.isDefined( routesConfig ) ) { return null; }
    const pathSegments = pathname.split( '/' ).filter( Boolean );
    const breadcrumbs = [];
    let currentRoutes = routesConfig;
    let currentPath = '';

    for ( let i = 0; i < pathSegments.length; i++ ) {
        const segment = pathSegments[ i ];
        currentPath += `/${ segment }`;

        // Skip 'dash' prefix
        if ( segment === 'dash' ) continue;

        const isObjectId = /^[0-9a-fA-F]{24}$/.test( segment );
        let route = null;
        let options = [];
        let nextLevelOptions = [];

        if ( isObjectId ) {
            // Handle dynamic routes
            route = currentRoutes.find( r => r.isDynamic && r.endpoint === ':id' );
            if ( route ) {
                // Get same-level options (other items of same type)
                options = getMockDataForType( route.dataType );
                // Get next-level options
                nextLevelOptions = route.pages || [];
            }
        } else {
            // Handle regular routes
            route = currentRoutes.find( r => r.endpoint === segment );
            if ( route ) {
                // Get same-level options
                options = currentRoutes.filter( r => r.enabled ).map( r => ( {
                    label: r.title,
                    value: r.endpoint,
                    endpoint: r.endpoint
                } ) );
                // Get next-level options
                nextLevelOptions = route.pages || [];
                // Update current routes for next iteration
                currentRoutes = route.pages || [];
            }
        }

        if ( route ) {
            breadcrumbs.push( {
                segment,
                route,
                path: currentPath,
                options,
                nextLevelOptions,
                isObjectId,
                isLast: i === pathSegments.length - 1
            } );
        }
    }

    return breadcrumbs;
};
