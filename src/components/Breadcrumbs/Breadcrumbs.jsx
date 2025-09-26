import React, { useContext, createContext, useEffect, useState, useId, useCallback } from 'react';

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link, useLocation, useNavigate } from "react-router-dom";
import * as utils from 'akashatools';
import { util } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Database, Slash } from 'lucide-react';
import { caseCamelToSentence } from '@/lib/utilities/string';

const Breadcrumbs = ( props ) => {
    const {
        items = [],
        useSelect = false,
        path = [],
        nextPaths = [],
        pageName = '',
        className = '',
    } = props;
    const location = useLocation();
    const navigate = useNavigate();
    const [ pageLabel, setPageLabel ] = useState( '' );
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

    const pathnames = location.pathname.split( "/" ).filter( ( x ) => x );
    let breadcrumbPath = "";

    console.log( "Breadcrumbs :: path = ", path, " :: ", "nextPaths = ", nextPaths );

    const buildBreadcrumbs = useCallback(
        ( items ) => {
            let elements = [];
            let breadPath = [];
            if ( utils.val.isValidArray( items, true ) ) {
                items.forEach( ( item, index ) => {
                    let id = utils.rand.randString( 16 );
                    if ( utils.val.isObject( item, true ) ) {
                        // Case of a path item with options to be shown in a select / dropdown. 
                        // On select change, route to new path. 
                        // {
                        //     name: path,
                        //     label: caseCamelToSentence( path ),
                        //     options: ROUTES_DASHBOARD,
                        // }
                        breadPath.push( item?.endpoint );
                        breadcrumbPath += `/${ item?.endpoint }`;
                        // const isLast = index === pathnames.length - 1;
                        elements.push(
                            <BreadcrumbItem
                                className={ `m-0 p-0 self-stretch justify-stretch items-center` }
                                id={ `breadcrumb-${ index }-${ item?.endpoint }-${ id }` }
                                key={ `breadcrumb-${ index }-${ item?.endpoint }-${ id }` }>
                                <BreadcrumbSeparator orientation="vertical">
                                    <Slash className={ `slash-icon !m-0 !p-0 flex justify-center items-center relative h-6 !w-3 !p-0` } />
                                </BreadcrumbSeparator>
                                { utils.val.isValidArray( item?.options, true )
                                    ? (
                                        <Select
                                            className={ `self-center justify-center items-center px-1 text-xs` }
                                            defaultValue={ item?.endpoint }
                                            onValueChange={ ( value ) => {
                                                let parentPath = [ ...breadPath ];
                                                parentPath?.splice( index, 100, value );
                                                navigate( `/${ parentPath?.join( '/' ) }` );
                                                // navigate( breadcrumbPath );
                                            } }
                                        >
                                            <SelectTrigger
                                                id={ `select-path-element` }
                                                className={ `relative items-center h-full py-0 px-1 border-transparent focus-visible:border-[0px] !focus-within:border-x-sextary-500 bg-transparent gap-2 flex-row !text-xs` }
                                                aria-label={ `Select path` }
                                            >
                                                <Database size={ 12 } strokeWidth={ 1 } aria-hidden="true" className={ `items-center py-[0.125rem]` } />
                                                <SelectValue className={ `!text-xs placeholder:[&>span]:text-xs` } placeholder="Select page" />
                                            </SelectTrigger>
                                            <SelectContent className={ `h-auto max-h-64 py-0` }>
                                                { item?.options?.map( ( v, i ) => (
                                                    <SelectItem className={ `!text-xs` } value={ utils.val.isObject( v ) && v?.hasOwnProperty( 'endpoint' ) ? v?.endpoint : v }>
                                                        <span className={ `text-xs` }>
                                                            { caseCamelToSentence(
                                                                utils.val.isObject( v )
                                                                    ? ( v?.hasOwnProperty( 'label' )
                                                                        ? ( v?.label )
                                                                        : ( String( v ) ) )
                                                                    : ( v )
                                                            ) }
                                                        </span>
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select> )
                                    : ( <Link
                                        to={ `/${ breadPath?.join( '/' ) }` }
                                        className={ `!text-xs justify-center items-center self-center text-center object-center` }
                                    >
                                        <span className={ `text-xs` }>
                                            { utils.val.isString( item?.label ) ? utils.str.toCapitalCase( item?.label ) : 'Error' }
                                        </span>
                                    </Link> )
                                }
                            </BreadcrumbItem>
                        );
                    }
                    else if ( utils.val.isString( item ) ) {
                        breadPath.push( item );
                        breadcrumbPath += `/${ item }`;
                        // const isLast = index === pathnames.length - 1;
                        elements.push(
                            <BreadcrumbItem
                                className={ `py-0 p-0` }
                                id={ `breadcrumb-${ index }-${ item }-${ id }` }
                                key={ `breadcrumb-${ index }-${ item }-${ id }` }>
                                <BreadcrumbSeparator
                                    orientation="vertical"
                                    className={ `m-0 p-0 flex justify-center items-center ` }
                                >
                                    <Slash className={ `slash-icon mr-2 my-0 p-0 flex justify-center items-center relative h-full ` } />
                                </BreadcrumbSeparator>
                                <Link
                                    to={ `/${ breadPath?.join( '/' ) }` }
                                    className={ `text-xs justify-center items-center self-center text-center object-center` }
                                >
                                    <span className={ `text-xs` }>
                                        { utils.str.toCapitalCase( item ) }
                                    </span>
                                </Link>
                            </BreadcrumbItem>
                        );
                    }
                } );
            }
            return (
                <div className={ `breadcrumbs-container` }>
                    { elements }
                </div>
            );
        }, [ items, pathnames ] );

    return (
        <div className={ `flex flex-row gap-1 px-2 w-auto ${ className } flex flex-nowrap` }>
            <Breadcrumb
                className={ `flex flex-row w-auto justify-center items-center content-center h-full p-0 m-0` }
            >
                <BreadcrumbList
                    className={ `flex flex-row w-auto content-center h-full p-0 m-0 flex-nowrap` }
                >
                    <BreadcrumbItem
                        className={ `flex flex-row w-auto justify-center items-center content-center h-full` }
                        id={ utils.rand.randString( 16 ) }
                        key={ `breadcrumb-${ 0 }-${ 'home' }` }
                    >
                        <BreadcrumbPage className="">
                            <Link to={ '/' }
                                className={ `text-xs justify-center items-center self-center text-center object-center` }>{ "Home" }</Link>
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    { utils.val.isValidArray( path, true )
                        ? ( buildBreadcrumbs( path ) )
                        : ( <></> ) }

                    { utils.val.isValidArray( nextPaths, true )
                        ? (
                            <>
                                { buildBreadcrumbs( nextPaths ) }
                            </>
                        )
                        : ( <></> ) }

                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default Breadcrumbs;
