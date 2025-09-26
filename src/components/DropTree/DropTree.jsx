import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as utils from 'akashatools';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

export function DropTree ( { items } ) {
    return (
        <div className='space-y-2'>
            { utils.val.isValidArray( items, true ) && items?.map( ( item, index ) => (
                <DropTreeItem
                    key={ index }
                    item={ item }
                />
            ) ) }
        </div>
    );
}

function DropTreeItem ( { item } ) {
    const [ isOpen, setIsOpen ] = React.useState( false );

    if ( item.items ) {
        return (
            <Collapsible
                open={ isOpen }
                onOpenChange={ setIsOpen }>
                <CollapsibleTrigger className='flex items-center w-full p-2 text-left hover:bg-gray-100 rounded'>
                    <ChevronRight
                        className={ `mr-2 h-4 w-4 transition-transform ${ isOpen ? 'transform rotate-90' : ''
                            }` }
                    />
                    { item.title }
                </CollapsibleTrigger>
                <CollapsibleContent className='pl-4'>
                    <DropTree items={ item.items } />
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return <div className='p-2 hover:bg-gray-100 rounded'>{ item.title }</div>;
}



