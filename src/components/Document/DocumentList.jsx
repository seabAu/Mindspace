import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import * as utils from 'akashatools';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, Calendar1Icon, Copy, Edit, EditIcon, EllipsisIcon, LucideLayoutGrid, Plus, RefreshCcw, Trash } from 'lucide-react';
import clsx from 'clsx';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import { Spinner } from '@/components/Loader/Spinner';
import { twMerge } from 'tailwind-merge';
import PlannerDialog from '@/features/Planner/components/dialog/PlannerDialog';
import useReflectStore from '@/store/reflect.store';
import useReflect from '@/lib/hooks/useReflect';

const DocumentList = ( {
    parentPath = '/dash/reflect/journal',
    classNames,
    documents, setDocuments,
    dataType = 'note',
    parentPath = '/dash',
    documentItemRender = null,
    documentHeaders = null,

    // Callback functions
    onRefresh = () => { },
    onCreate = () => { },
    onUpdate = () => { },
    onClone = () => { },
    onChange = () => { },
    loading,
    error,
}, ...props ) => {

    const navigate = useNavigate();

    if ( loading ) {
        return (
            <Spinner
                variant={ 'circles' }
                size={ 'md' }
                color={ 'currentColor' }
                overlay={ false }
                className={ `` }
            />
        );
    }
    if ( error ) {
        return <div>Error: { error }</div>;
    }

    const buildActionButtons = ( item ) => {
        return (
            <TableCell>
                {/* Actions cell */ }
                <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                    <Button
                        size={ 'sm' }
                        variant={ `outline` }
                        className={ `rounded-lg` }
                        onClick={ () => {
                            navigate( `${ parentPath }/${ id }/detail` );
                        } }
                    >
                        Details
                    </Button>

                    <Button
                        size={ 'sm' }
                        variant={ `outline` }
                        className={ `rounded-lg` }
                        onClick={ () => {
                            navigate( `${ parentPath }/${ id }/edit` );
                        } }
                    >
                        <EditIcon />
                    </Button>

                    <Button
                        size={ 'sm' }
                        variant={ `outline` }
                        className={ `rounded-lg` }
                        onClick={
                            async () => {
                                let response = await onClone( item, dataType );
                                if ( response && utils.val.isObject( response ) && response?.hasOwnProperty( '_id' ) ) {
                                    if ( onRefresh ) { let fetchresponse = await onRefresh(); }
                                    navigate( `${ parentPath }/${ response?._id }/detail` );
                                }
                            }
                        }
                    >
                        <Copy />
                    </Button>

                    <Button
                        variant='destructive'
                        onClick={ () => { onDelete( item?._id, item, setDocuments, dataType ); } }>
                        <Trash />
                    </Button>
                </div>
            </TableCell>
        );
    };

    return (
        <div className={ `overflow-hidden space-y-4 w-full h-full ${ classNames }` }>
            <h1 className={ `text-2xl font-bold w-full h-full` }>{ title }</h1>
            {/* List of documents */ }
            <Table>
                <TableHeader>
                    <TableRow>
                        { utils.val.isValidArray( documentHeaders, true ) && (
                            documentHeaders.map( ( header ) => (
                                <TableHead>{ header }</TableHead>
                            ) )
                        ) }
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { utils.val.isValidArray( documents, true )
                        ? ( documents?.map( ( row, rowIndex ) => {
                            if ( documentItemRender ) {
                                return (
                                    <TableRow>
                                        { utils.val.isValidArray( documentHeaders, true ) && (
                                            documentHeaders.map( ( cell, cellIndex ) => {
                                                let cellData = row?.[ cell ];
                                                if ( cellData ) {
                                                    return (
                                                        <TableCell key={ `document-list-row-${ rowIndex }-cell-${ cellIndex }` }>
                                                            { String( cellData || '' ) }
                                                        </TableCell>
                                                    );
                                                }
                                            } )
                                        ) }
                                        <TableCell>
                                            { buildActionButtons( row ) }
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                        } ) )
                        : ( <Spinner
                            variant={ 'circles' }
                            size={ 'md' }
                            color={ 'currentColor' }
                            overlay={ false }
                            className={ `` }
                        /> ) }
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={ 3 }>Total</TableCell>
                        <TableCell className='text-right'>
                            { `Footer area` }
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div >
    );
};

export default DocumentList;
