// Recursive dynamically generated navigation directory tree.
'use client';

import { useState, useMemo, useRef } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Folder,
    File,
    Hash,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { useNav } from '@/lib/providers/NavProvider';
import * as utils from 'akashatools';
import { isInvalid } from '@/lib/utilities/data';
import { Input } from '../ui/input';
import useDoubleClick from '@/lib/hooks/useDoubleClick';
import { caseCamelToSentence } from '@/lib/utilities/string';

// Performance safeguards
const MAX_RECURSION_DEPTH = 10;
const MAX_ITEMS_PER_LEVEL = 50;

const strIncludesSafe = ( src, test, caseInsensitive = true ) => (
    ( utils.val.isString( src ) && utils.val.isString( test ) )
        ? (
            ( caseInsensitive )
                ? ( String( String( src ).toLocaleLowerCase() ).includes( String( test ).toLocaleLowerCase() ) )
                : ( String( src ).includes( test ) )
        )
        : ( false )
);

// Mock data functions (replace with your actual implementations)
const getDataLengthSafe = ( data ) => {
    return Array.isArray( data ) ? data.length : 0;
};

const getIdsOfType = ( type ) => {
    // Mock implementation - replace with your actual data fetching
    const mockData = {
        log: [
            { id: '1', title: 'Log Entry 1' },
            { id: '2', title: 'Log Entry 2' },
        ],
        event: [
            { id: '1', title: 'Event 1' },
            { id: '2', title: 'Event 2' },
        ],
        planner: [ { id: '1', title: 'Planner 1' } ],
        task: [
            { id: '1', title: 'Task 1' },
            { id: '2', title: 'Task 2' },
        ],
    };
    return mockData[ type ] || [];
};

const NavigationItemButton = ( { singleClickFn, doubleClickFn, latency = 350, children } ) => {
    const ref = useRef();

    useDoubleClick( {
        onSingleClick: e => {
            console.log( e, 'single click' );
            if ( singleClickFn ) singleClickFn( e );
        },
        onDoubleClick: e => {
            console.log( e, 'double click' );
            if ( doubleClickFn ) doubleClickFn( e );
        },
        ref: ref,
        latency: latency || 250
    } );

    return <div ref={ ref }>{ children }</div>;
};

// Navigation item component
const NavigationItem = ( {
    item,
    depth = 0,
    onNavigate,
    expandedItems, setExpandedItems,
    searchTerm = '', setSearchTerm,
    caseInsensitiveSearch = true, setCaseInsensitiveSearch,
} ) => {
    const navRef = useRef();

    const [ isExpanded, setIsExpanded ] = useState( false );
    const hasPages =
        item.pages && Array.isArray( item.pages ) && item.pages.length > 0;
    const hasDynamicPages =
        item.getPages && typeof item.getPages === 'function';
    const hasChildren = hasPages || hasDynamicPages;

    // Handle dynamic pages
    const dynamicPagesCount = useMemo( () => {
        if ( hasDynamicPages && item.pageDataType ) {
            const dynamicItems = getIdsOfType( item.pageDataType );
            return dynamicItems.length;
        }
        return 0;
    }, [ hasDynamicPages, item.pageDataType ] );

    // Performance guard: prevent excessive nesting
    if ( depth > MAX_RECURSION_DEPTH ) {
        return (
            <div className='text-xs text-muted-foreground p-2'>
                Max depth reached
            </div>
        );
    }

    // Generate unique key for this item
    const itemKey = useMemo( () => `${ item.endpoint || item.title }-${ depth }`, [ item?.endpoint, depth ] );

    // Handle expand/collapse
    const handleToggle = ( value ) => {
        if ( hasChildren ) {
            const newExpanded = utils.val.isDefined( value ) ? value : !isExpanded;
            setIsExpanded( newExpanded );

            // Update global expanded state if provided
            if ( setExpandedItems ) {
                setExpandedItems( ( prev ) => ( {
                    ...prev,
                    [ itemKey ]: newExpanded,
                } ) );
            }
        }
    };

    // Handle navigation
    const handleNavigate = () => {
        if ( item.url && onNavigate ) {
            onNavigate( item.url );
        }
    };

    const handleSingleClick = ( e ) => {
        e.stopPropagation();
        // e.preventDefault();
        handleToggle( null );
    };

    const handleDoubleClick = ( e ) => {
        e.stopPropagation();
        // e.preventDefault();
        handleToggle( true );
        handleNavigate( e );
    };


    useDoubleClick( {
        onSingleClick: e => {
            // console.log( e, 'single click' );
            handleSingleClick( e );
        },
        onDoubleClick: e => {
            // console.log( e, 'double click' );
            handleDoubleClick( e );
        },
        ref: navRef,
        latency: 350
    } );

    // Handle dynamic page navigation
    const handleDynamicNavigate = ( e ) => {
        e.stopPropagation();
        if ( item.pageDataType && onNavigate ) {
            const listUrl = `/dash/${ item.endpoint }/${ item.pageDataType }/list`;
            onNavigate( listUrl );
        }
    };

    // Render icon
    const renderIcon = () => {
        if ( item.icon ) {
            const IconComponent = item.icon;
            return <IconComponent className='size-4 aspect-square shrink-0' />;
        }

        if ( hasChildren ) {
            return <Folder className='size-4 aspect-square shrink-0' />;
        }

        if ( hasDynamicPages ) {
            return <Hash className='size-4 aspect-square shrink-0' />;
        }

        return <File className='size-4 aspect-square shrink-0' />;
    };

    // Render badge
    const renderBadge = () => {
        if ( item.badge !== undefined && item.badge !== null ) {
            return (
                <Badge
                    variant='secondary'
                    className='ml-auto text-xs'>
                    { item.badge }
                </Badge>
            );
        }

        if ( dynamicPagesCount > 0 ) {
            return (
                <Badge
                    variant='outline'
                    className='ml-auto text-xs'>
                    { dynamicPagesCount }
                </Badge>
            );
        }

        return null;
    };

    // Render children recursively
    const renderChildren = () => {
        if ( !hasChildren || !isExpanded ) return null;

        const children = [];

        // Render static pages
        if ( hasPages ) {
            const staticPages = item.pages.slice( 0, MAX_ITEMS_PER_LEVEL );
            let filteredPages = [ ...( utils.val.isValidArray( staticPages, true ) ? staticPages : [] ) ];
            if ( !isInvalid( searchTerm ) && searchTerm !== '' && filteredPages.length > 0 ) {
                // Filter by search term first.
                filteredPages = filteredPages
                    ?.filter( ( route ) => (
                        strIncludesSafe( route?.url, searchTerm, caseInsensitiveSearch )
                        || strIncludesSafe( route?.title, searchTerm, caseInsensitiveSearch )
                        || strIncludesSafe( route?.endpoint, searchTerm, caseInsensitiveSearch )
                        // ( caseInsensitiveSearch )
                        //     ? ( String( String( route?.title ).toLocaleLowerCase() ).includes( String( searchTerm ).toLocaleLowerCase() ) )
                        //     : ( String( route?.title ).includes( searchTerm ) )
                    ) );
            }

            filteredPages.forEach( ( page, index ) => {
                if ( typeof page === 'string' ) {
                    // Simple string page
                    children.push(
                        <NavigationItem
                            key={ `${ page }-${ index }` }
                            item={ {
                                title: caseCamelToSentence( page ),
                                endpoint: page,
                                url: `${ item.url }/${ page }`,
                                enabled: true,
                            } }
                            depth={ depth + 1 }
                            onNavigate={ onNavigate }
                            expandedItems={ expandedItems }
                            setExpandedItems={ setExpandedItems }
                        />,
                    );
                } else if ( typeof page === 'object' && page.enabled !== false ) {
                    // Complex page object
                    children.push(
                        <NavigationItem
                            key={ page.endpoint || page.title || index }
                            item={ page }
                            depth={ depth + 1 }
                            onNavigate={ onNavigate }
                            expandedItems={ expandedItems }
                            setExpandedItems={ setExpandedItems }
                        />,
                    );
                }
            } );
        }

        // Add dynamic pages indicator
        if ( hasDynamicPages && dynamicPagesCount > 0 ) {
            children.push(
                <div
                    key='dynamic-pages'
                    /* className={ cn(
                        'flex items-center gap-2 p-1 text-sm cursor-pointer hover:bg-accent rounded-md',
                        'ml-2',
                    ) } */
                    className={ cn( "flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-accent rounded-md", "ml-4" ) }
                    onClick={ handleDynamicNavigate }>
                    <Users className='size-4 aspect-square shrink-0' />
                    <span className='flex-1 truncate'>
                        View all { item.pageDataType }s
                    </span>
                    <Badge
                        variant='outline'
                        className='text-xs'>
                        { dynamicPagesCount }
                    </Badge>
                </div>,
            );
        }


        return children.length > 0
            ? (
                <div className="ml-4 border-l border-border pl-2 space-y-1">
                    { children }
                </div>
            )
            : null;
    };

    // Don't render disabled items
    if ( item.enabled === false ) {
        return null;
    }

    return (
        <Collapsible
            // onClick={ handleToggle }
            open={ isExpanded }
            onOpenChange={ setIsExpanded }
        >
            <div className='space-y-1 h-full'>
                <div
                    ref={ navRef }
                    className={ cn(
                        "flex items-center gap-1 text-sm rounded-md transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "cursor-pointer select-none",
                        'border-2 border-transparent hover:border-border transition-all duration-200',
                        depth > 0 && "ml-2",
                    ) }>
                    { hasChildren && (
                        <CollapsibleTrigger
                            asChild
                        >
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-auto w-auto p-0 hover:bg-transparent'
                                /* onClick={ handleToggle } */>
                                { isExpanded ? (
                                    <ChevronDown className='size-4 aspect-square' />
                                ) : (
                                    <ChevronRight className='size-4 aspect-square' />
                                ) }
                            </Button>
                        </CollapsibleTrigger>
                    ) }

                    {/* { !hasChildren && <div className='w-2' /> } */ }

                    <div
                        className='flex items-center h-full gap-2 flex-1 min-w-0 p-2'
                    // onDoubleClick={ handleNavigate }
                    >
                        { renderIcon() }
                        <span className='flex-1 truncate font-medium'>
                            { caseCamelToSentence( item?.title ) }
                        </span>
                        { renderBadge() }
                    </div>
                </div>

                <CollapsibleContent className='space-y-1'>
                    { renderChildren() }
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

// Main recursive navigation tree component
export const RecursiveNavigationTree = ( {
    routesConfig,
    onNavigate,
    className,
} ) => {
    const [ expandedItems, setExpandedItems ] = useState( {} );
    const [ searchTerm, setSearchTerm ] = useState( '' );
    const [ caseInsensitiveSearch, setCaseInsensitiveSearch ] = useState( true );

    // Filter and process routes
    const processedRoutes = useMemo( () => {
        if ( !Array.isArray( routesConfig ) || routesConfig.length === 0 ) return [];

        let tempRoutes = [ ...routesConfig ];
        if ( !isInvalid( searchTerm ) && searchTerm !== '' ) {
            // Filter by search term first.
            tempRoutes = routesConfig
                ?.filter( ( route ) => (
                    strIncludesSafe( route?.url, searchTerm, caseInsensitiveSearch )
                    || strIncludesSafe( route?.title, searchTerm, caseInsensitiveSearch )
                    || strIncludesSafe( route?.endpoint, searchTerm, caseInsensitiveSearch )
                    // ( caseInsensitiveSearch )
                    //     ? ( String( String( route?.title ).toLocaleLowerCase() ).includes( String( searchTerm ).toLocaleLowerCase() ) )
                    //     : ( String( route?.title ).includes( searchTerm ) )
                ) );
        }

        if ( tempRoutes.length > 0 ) {
            return tempRoutes
                ?.filter( ( route ) => route.enabled !== false )
                ?.slice( 0, MAX_ITEMS_PER_LEVEL ); // Performance limit
        }
        return [];
    }, [ searchTerm, routesConfig ] );

    const handleSearchRoutes = useMemo( () => {
        if ( !isInvalid( searchTerm ) && searchTerm !== '' ) {
            // Non-empty term, do search.
        }
        else {
            // Revert to original items. 

        }
    }, [ searchTerm, routesConfig ] );


    return (
        <div className={ cn( 'space-y-1', className ) }>
            <Input
                className={ `w-full p-1` }
                placeholder={ `Search App...` }
                type={ `search` }
                defaultValue={ searchTerm }
                onChange={ ( e ) => {
                    // let { id, name, value } = e?.target;
                    setSearchTerm( e?.target?.value );
                } }
            />

            { processedRoutes.map( ( route, index ) => (
                <NavigationItem
                    key={ route.endpoint || route.title || index }
                    item={ route }
                    depth={ 0 }
                    onNavigate={ onNavigate }
                    expandedItems={ expandedItems }
                    setExpandedItems={ setExpandedItems }
                    searchTerm={ searchTerm }
                    setSearchTerm={ setSearchTerm }
                    caseInsensitiveSearch={ caseInsensitiveSearch }
                    setCaseInsensitiveSearch={ setCaseInsensitiveSearch }
                />
            ) ) }
        </div>
    );
};

// Container and initializer component
export const NavigationTree = () => {

    const navigate = useNavigate();
    const {
        routesConfig,
        userNavConfig,
        buildBreadcrumbs,
    } = useNav();

    const handleNavigate = ( url ) => {
        console.log( 'Navigate to:', url );
        // TODO :: Validate url before proceeding. 
        if ( url ) navigate( url );
    };

    return (
        <div className='w-80 border rounded-lg'>
            <div className='p-4 border-b'>
                <h3 className='font-semibold'>Navigation Tree</h3>
            </div>
            <RecursiveNavigationTree
                routesConfig={ routesConfig }
                onNavigate={ handleNavigate }
            />
        </div>
    );
};

export default RecursiveNavigationTree;
