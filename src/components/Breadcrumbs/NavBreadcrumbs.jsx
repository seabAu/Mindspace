import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { NavBreadcrumbItem } from './NavBreadcrumbsItem';
import * as utils from 'akashatools';

const NavBreadcrumbs = ( {
    items = [],
    path = [],
    className = ''
} ) => {
    const buildBreadcrumbs = useCallback( ( items ) => {
        if ( !utils.val.isValidArray( items, true ) ) return null;

        let breadPath = [];

        return items.map( ( item, index ) => {
            if ( utils.val.isObject( item, true ) ) {
                breadPath.push( item?.endpoint );
            } else if ( utils.val.isString( item ) ) {
                breadPath.push( item );
            }

            return (
                <NavBreadcrumbItem
                    key={ `breadcrumb-${ index }` }
                    item={ item }
                    index={ index }
                    breadPath={ [ ...breadPath ] }
                    showSeparator={ index > 0 }
                />
            );
        } );
    }, [] );

    const breadcrumbElements = useMemo( () => buildBreadcrumbs( path ), [ path, buildBreadcrumbs ] );

    return (
        <div className={ `flex flex-row gap-1 px-2 w-auto ${ className } flex flex-nowrap` }>
            <Breadcrumb className="flex flex-row w-auto justify-center items-center content-center h-full p-0 m-0">
                <BreadcrumbList className="flex flex-row w-auto content-center h-full p-0 m-0 flex-nowrap">
                    <BreadcrumbItem
                        className="flex flex-row w-auto justify-center items-center content-center h-full"
                        id={ utils.rand.randString( 16 ) }
                        key="breadcrumb-home"
                    >
                        <BreadcrumbPage>
                            <Link
                                to="/"
                                className="text-sm justify-center items-center self-center text-center object-center"
                            >
                                Home
                            </Link>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    { breadcrumbElements }
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default NavBreadcrumbs;
