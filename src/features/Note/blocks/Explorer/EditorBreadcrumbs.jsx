// Variant of Breadcrumbs.jsx specifically for the file and folder system. 
/*
    Places a tooltip on each of the breadcrumb elements that show the ID when moused over, 
    clicking the tooltip copies that ID to the clipboard,
    and clicking on the breadcrumb itself sends the user to that directory. 
*/


import React, { useContext, createContext, useEffect, useState } from 'react';

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

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

const items = [
    { href: "#", label: "Home" },
    { href: "#", label: "Documentation" },
    { href: "#", label: "Building Your Application" },
    { href: "#", label: "Data Fetching" },
    { label: "Caching and Revalidating" },
];

const ITEMS_TO_DISPLAY = 3;

import { Link, useLocation } from "react-router-dom";
import * as utils from 'akashatools';
import { Separator } from '@/components/ui/separator';
import { util } from 'zod';
import { Slash } from 'lucide-react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

const EditorBreadcrumbs = ( props ) => {
    const {
        path = [],
        pageName = ''
    } = props;
    const [ pageLabel, setPageLabel ] = useState( '' );

    // const location = useLocation();
    // const pathnames = location.pathname.split( "/" ).filter( ( x ) => x );
    // let breadcrumbPath = "";

    useEffect( () => {
        // console.log( "Breadcrumbs :: pathnames = ", pathnames, " :: ", "path = ", path );
    }, [ pathnames, path ] );

    const buildBreadcrumbs = ( items ) => {
        let elements = [];
        if ( utils.val.isValidArray( items, true ) ) {
            items.forEach( ( name, index ) => {
                breadcrumbPath += `/${ name }`;
                const isLast = index === pathnames.length - 1;
                // console.log( name, pathnames, breadcrumbPath );

                elements.push(
                    <BreadcrumbItem
                        className={ `flex flex-row` }
                        key={ `breadcrumb-${ index }-${ name }` }
                    >
                        <BreadcrumbPage
                            className={ `flex flex-row` }
                        >
                            <BreadcrumbLink
                                className={ `flex flex-row` }
                                href={ breadcrumbPath }
                            >
                                <BreadcrumbSeparator
                                    orientation="vertical"
                                    className="mr-2 h-4"
                                >
                                    <Slash />
                                </BreadcrumbSeparator>
                                { " " } / <div className={ `` }>
                                    { utils.str.toCapitalCase( name ) }
                                </div>
                            </BreadcrumbLink>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                );
            } );

        }
        return (
            <div className={ `breadcrumbs-container` }>
                { elements }
            </div>
        );
    };

    return (
        <div className="flex flex-row gap-2 px-3 w-full ">
            <Separator
                orientation="vertical"
                className="mr-2 h-4"
            />
            <Breadcrumb
            // className={ `flex flex-row w-auto justify-center items-center content-center h-full p-0 m-0` }
            >
                <BreadcrumbList
                // className={ `flex flex-row w-auto justify-center items-center content-center h-full p-0 m-0 ` }
                >
                    <BreadcrumbItem
                        // className={ `flex flex-row w-auto justify-center items-center content-center h-full` }
                        id={ `breadcrumb-${ 0 }-${ 'home' }` }
                        key={ `breadcrumb-${ 0 }-${ 'home' }` }
                    >
                        <BreadcrumbPage className="">
                            <Link to={ '/' }>{ "Home" }</Link>
                        </BreadcrumbPage>
                    </BreadcrumbItem>

                    { utils.val.isValidArray( path, true )
                        ? ( buildBreadcrumbs( path ) )
                        : ( utils.val.isValidArray( pathnames, true ) &&
                            pathnames.map( ( name, index ) => {
                                breadcrumbPath += `/${ name }`;
                                // const isLast = index === pathnames.length - 1;
                                // console.log( name, pathnames, breadcrumbPath );
                                return ( <>
                                    <BreadcrumbItem key={ `breadcrumb-${ index }-${ name }` }>
                                        <BreadcrumbPage
                                            className={ `flex flex-row` }
                                        >
                                            <BreadcrumbSeparator
                                                orientation="vertical"
                                                className={ `m-0 p-0 flex justify-center items-center ` }
                                            >
                                                <Slash
                                                    className={ `slash-icon mr-2 my-0 p-0 flex justify-center items-center relative h-full ` }
                                                />
                                            </BreadcrumbSeparator>
                                            <Link
                                                // about={ name }
                                                // href={ breadcrumbPath }
                                                to={ breadcrumbPath }
                                                className={ `text-sm ` }
                                            >
                                                { utils.str.toCapitalCase( name ) }
                                            </Link>
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </> );
                            } )
                        ) }
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};



const Responsive = ( props ) => {
    const {
        elements,
        setElements,
    } = props;

    const [ open, setOpen ] = React.useState( false );
    const isDesktop = useMediaQuery( "(min-width: 768px)" );

    return (
        <Breadcrumb>
            { utils.val.isValidArray( elements, true ) && (
                <BreadcrumbList className={ `!w-full h-auto flex flex-row text-nowrap whitespace-nowrap flex-nowrap items-center justify-center gap-2 ` }>
                    <BreadcrumbItem>{ elements[ 0 ] }</BreadcrumbItem>
                    <BreadcrumbSeparator />
                    { elements.length > ITEMS_TO_DISPLAY
                        ? (
                            <>
                                <BreadcrumbItem>
                                    { isDesktop ? (
                                        <DropdownMenu open={ open } onOpenChange={ setOpen }>
                                            <DropdownMenuTrigger
                                                className="flex items-center gap-1"
                                                aria-label="Toggle menu"
                                            >
                                                <BreadcrumbEllipsis className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                { elements.slice( 1, -2 ).map( ( element, index ) => (
                                                    <DropdownMenuItem key={ `editor-breadcrumbs-item-${ index }-${ element }` } >
                                                        { element }
                                                    </DropdownMenuItem>
                                                ) ) }
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Drawer open={ open } onOpenChange={ setOpen }>
                                            <DrawerTrigger aria-label="Toggle Menu">
                                                <BreadcrumbEllipsis className="h-4 w-4" />
                                            </DrawerTrigger>
                                            <DrawerContent>
                                                <DrawerHeader className="text-left">
                                                    <DrawerTitle>Navigate to</DrawerTitle>
                                                    <DrawerDescription>
                                                        Select an asset to navigate to.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                <div className="grid gap-1 px-4">
                                                    {
                                                        elements
                                                            .slice( 1, -2 )
                                                            .map( ( element, index ) => {
                                                                return (
                                                                    element ? element : ''
                                                                );
                                                            } )
                                                    }
                                                </div>
                                                <DrawerFooter className="pt-4">
                                                    <DrawerClose asChild>
                                                        <Button variant="outline">Close</Button>
                                                    </DrawerClose>
                                                </DrawerFooter>
                                            </DrawerContent>
                                        </Drawer>
                                    ) }
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>
                        ) : null }
                    { elements.slice( -ITEMS_TO_DISPLAY + 1 ).map( ( element, index ) => (
                        <BreadcrumbItem className={ `leading-8 self-center h-full` } key={ `editor-breadcrumbs-item-${ index }-${ element }` }>
                            { element ? (
                                <React.Fragment>
                                    <BreadcrumbLink
                                        asChild
                                        className="max-w-20 truncate md:max-w-none leading-3"
                                    >
                                        { element }
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                </React.Fragment>
                            ) : (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none leading-3">
                                    { element }
                                </BreadcrumbPage>
                            ) }
                        </BreadcrumbItem>
                    ) ) }
                </BreadcrumbList>
            ) }
        </Breadcrumb>
    );
};

EditorBreadcrumbs.Responsive = Responsive;


export default EditorBreadcrumbs;


