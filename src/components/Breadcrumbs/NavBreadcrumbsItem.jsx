import React from 'react';
import { Link } from 'react-router-dom';
import { Slash, Database } from 'lucide-react';
import {
    BreadcrumbItem,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { caseCamelToSentence } from '@/lib/utilities/string';
import * as utils from 'akashatools';

export const NavBreadcrumbItem = ( {
    item,
    index,
    breadPath,
    navigate,
    showSeparator = true
} ) => {
    const id = utils.rand.randString( 16 );

    if ( utils.val.isObject( item, true ) ) {
        return (
            <BreadcrumbItem
                className="h-8 max-h-8 m-0 p-0 self-stretch justify-stretch items-center"
                id={ `breadcrumb-${ index }-${ item?.endpoint }-${ id }` }
                key={ `breadcrumb-${ index }-${ item?.endpoint }-${ id }` }
            >
                { showSeparator && (
                    <BreadcrumbSeparator orientation="vertical">
                        <Slash className="slash-icon !m-0 !p-0 flex justify-center items-center relative h-6" />
                    </BreadcrumbSeparator>
                ) }

                { utils.val.isValidArray( item?.options, true ) ? (
                    <Select
                        className="h-6 max-h-6 self-center justify-center items-center"
                        defaultValue={ item?.endpoint }
                        onValueChange={ ( value ) => {
                            let parentPath = [ ...breadPath ];
                            parentPath?.splice( index, 100, value );
                            navigate( `/${ parentPath?.join( '/' ) }` );
                        } }
                    >
                        <SelectTrigger
                            className="relative ps-9 py-0 h-6 max-h-6 border-transparent focus-visible:border-[0px] bg-transparent gap-2"
                            aria-label="Select path"
                        >
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                                <Database size={ 12 } strokeWidth={ 1 } aria-hidden="true" />
                            </div>
                            <SelectValue placeholder="Select page" />
                        </SelectTrigger>
                        <SelectContent className="h-auto max-h-64 py-0">
                            { item?.options?.map( ( option, i ) => (
                                <SelectItem
                                    key={ i }
                                    value={ utils.val.isObject( option ) && option?.hasOwnProperty( 'endpoint' ) ? option?.endpoint : option }
                                >
                                    { caseCamelToSentence(
                                        utils.val.isObject( option )
                                            ? ( option?.hasOwnProperty( 'label' ) ? option?.label : String( option ) )
                                            : option
                                    ) }
                                </SelectItem>
                            ) ) }
                        </SelectContent>
                    </Select>
                ) : (
                    <Link
                        to={ `/${ breadPath?.join( '/' ) }` }
                        className="text-sm justify-center items-center self-center text-center object-center"
                    >
                        { utils.val.isString( item?.label ) ? utils.str.toCapitalCase( item?.label ) : 'Error' }
                    </Link>
                ) }
            </BreadcrumbItem>
        );
    }

    if ( utils.val.isString( item ) ) {
        return (
            <BreadcrumbItem
                className="h-6 max-h-6 py-0 p-0"
                id={ `breadcrumb-${ index }-${ item }-${ id }` }
                key={ `breadcrumb-${ index }-${ item }-${ id }` }
            >
                { showSeparator && (
                    <BreadcrumbSeparator
                        orientation="vertical"
                        className="m-0 p-0 flex justify-center items-center"
                    >
                        <Slash className="slash-icon mr-2 my-0 p-0 flex justify-center items-center relative h-full" />
                    </BreadcrumbSeparator>
                ) }
                <Link
                    to={ `/${ breadPath?.join( '/' ) }` }
                    className="text-sm justify-center items-center self-center text-center object-center"
                >
                    { utils.str.toCapitalCase( item ) }
                </Link>
            </BreadcrumbItem>
        );
    }

    return null;
};
