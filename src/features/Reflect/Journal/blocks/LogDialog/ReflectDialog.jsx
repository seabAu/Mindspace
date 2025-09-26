import React, { useCallback, useEffect, useState } from 'react';
import { DIALOG_TYPES } from '@/lib/config/config';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import useReflect from '@/lib/hooks/useReflect';

const ReflectDialog = ( props ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 
    const {
        refData = {},
        dataSchema,
        dialogOpen = true,
        setDialogOpen = () => { },
        data,
        setData = () => { },
        initialData,
        handleClose = () => { },
        handleSubmit = () => { },
        handleChange = () => { },
        dialogType = 'add',
        dataType = 'log',
        dialogTrigger,
    } = props;

    const {
        debug,
        setDebug,
        getSchema,
        getData,
    } = useGlobalStore();

    const {
        // DIALOG MENUS
        getSchemaForDataType,
        buildDialog,
    } = useReflect();

    const constructDialog =
        useCallback(
            () => {
                return (
                    dialogType && utils.val.isString( dialogType ) &&
                    DIALOG_TYPES.includes( dialogType.toString().toLowerCase() ) &&
                    ( <div className={ `content-body mx-auto h-auto w-full justify-center items-center` }>
                        { ( dialogOpen ) && data && (
                            buildDialog( {
                                data: data,
                                initialData: initialData,
                                refData: getData() ?? refData,
                                setData: setData,
                                dataSchema: dataSchema ?? getSchema( dataType ?? 'event' ),
                                dialogOpen: ( !!dialogOpen === true ),
                                setDialogOpen: setDialogOpen,
                                handleSubmit: handleSubmit,
                                handleChange: handleChange,
                                handleClose: handleClose,
                                dialogType: dialogType ?? 'add',
                                dataType: dataType ?? 'event',
                                debug: debug,
                                dialogTrigger,
                            } ) ) }
                    </div> )
                );
            }
            , [ data, initialData, dialogType, dataType ]
        );

    // return ( <>{ constructDialog() }</> );
    return (
        <div className={ `h-full w-full flow-root flex flex-col justify-start items-stretch gap-4 relative overflow-hidden` }>
            { constructDialog() }
        </div>
    );
};


export default ReflectDialog;
