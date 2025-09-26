import React, { useEffect, useState } from 'react';
// import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
    ToastAction,
    ToastClose,
} from "@/components/ui/toast";

import * as utils from 'akashatools';
import { deepMirrorNodes, findAbsolutePath } from '../utilities/note.js';
import useGlobalStore from '@/store/global.store.js';
import {
    handleApiRequest,
    handleError,
    handleSuccess,
    validateInputs
} from '../utilities/fetch.js';
import { convertToText, objToString } from '../utilities/obj.js';
// import { useToast } from '@/hooks/use-toast.js';
import { toast } from 'sonner';
import useAuth from './useAuth.js';

const useError = ( useToast = false ) => {
    // Global state variables. 
    const {
        debug,
        error, setError,
        loading, setLoading,
        requestLogUserOut, setRequestLogUserOut,
        logUserOut
    } = useGlobalStore();

    // Usehook state variables. 
    const [ useLogging, setUserLogging ] = useState( false );
    // Log of errors. 
    const [ errors, setErrors ] = useState( [] );
    // const [ error, setError ] = useState( null );
    // const [ loading, setLoading ] = useState( false );

    useEffect( () => {
        if (
            utils.val.isValid( error )
            && error !== null
            && error !== undefined
            && !utils.val.isObject( error )
        ) {
            // if ( error ) {

            // if ( debug === true ) 
            console.log( "Error useEffect triggered :: error = ", objToString( error ) );
            let errMsg;
            let msg = utils.ao.deepGetKey( error, "message" );
            if ( msg ) { errMsg = msg; }
            else {
                if ( utils.val.isString( error ) ) { errMsg = error; }
                else { errMsg = null; }
            }


            // toast( {
            //     title: "API Error",
            //     description: objToString( errMsg ),
            //     duration: 5000,
            //     closeButton: true,
            //     action: ( 'OK' ),
            //     // {
            //     //     label: "OK",
            //     //     onClick: () => console.log( "Undo" ),
            //     // },
            //     // action: (
            //     //     <ToastAction
            //     //         altText="OK"
            //     //         onClick={ () => { } }
            //     //     >
            //     //         { `OK` }
            //     //     </ToastAction>
            //     // ),
            //     variant: "destructive",
            // } );

            setErrors( [
                ...errors,
                {
                    timestamp: new Date( Date.now() ),
                    data: errMsg,
                }
            ] );

            setError( null );
        }
    }, [ error ] );

    // useEffect( () => {
    //     console.log( "Loading useEffect triggered :: loading = ", loading );
    // }, [ loading ] );

    const handleErrorCallback = ( err, doThrow = false ) => {
        // Wrapper function for this useHook file's error handling.
        // Options for using global error/loading state or local to this datatype.
        console.log( "useError :: handleErrorCallback :: err = ", err, " :: ", "doThrow = ", doThrow );
        // if ( err ) {
        handleError( {
            err,
            setLoading,
            setError,
            doThrow: doThrow
        } );
        // }
    };

    const handleSuccessCallback = ( res, doToast ) => {
        // Wrapper function for this useHook file's success handling.
        // Options for using global error/loading state or local to this datatype.
        // if ( res ) {
        handleSuccess( {
            res,
            // stateSetter,
            setLoading,
            setError,
            // doToast: doToast,
            doToast: doToast ?? useToast
        } );
        // }
    };

    const handleResponse = ( res, doThrow = false ) => {
        // Manages the response to a request. 
        console.log( 'useError :: handleResponse :: res = ', res, ' :: ', 'doThrow = ', doThrow );
        if ( res?.success ) {
            if ( res.success === true ) {
                // Good response.
                return res?.data?.data;
            }
            else if ( res?.success === false ) {
                // Error. 
                handleError( {
                    err: res,
                    setError,
                    setLoading,
                    doThrow: doThrow
                } );
            }
        }
    };

    return {
        error,
        setError,
        loading,
        setLoading,
        handleError,
        handleSuccessCallback,
        handleErrorCallback,
        handleResponse,
    };
};

export default useError;
