
// Helper function for error handling
// export const handleError = ( err ) => {
//     setError( err.response?.data?.message || 'An unexpected error occurred' );
//     setLoading( false );
//     console.error( err );
// };
import API from '../services/api';
import * as utils from 'akashatools';
import { convertToText } from './obj';
// import { toast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import { cleanStringify } from './string';

const debug = process.env.VITE_NODE_DEBUG;

// Helper function to validate inputs
export const validateInputs = ( inputs, requiredFields, doThrow = true ) => {
    for ( const field of requiredFields ) {
        if ( !inputs[ field ] ) {
            if ( doThrow ) throw new Error( `Validation error: ${ field } is required` );
            // else return {
            //     valid: false,
            //     message: `Validation error: ${ field } is required`
            // };
        }
    }

    if ( !doThrow ) {
        return {
            valid: true,
            message: ''
        };
    }
};

/*  // Helper function to safely make API calls
    const safeApiCall = async ( {
        apiCall,
        stateSetter = () => { },
        successCallback = () => { },
        errorCallback = () => { },
    } ) => {
        // setIsLoading( true );
        errorCallback( null );
        try {
            const response = await apiCall();
            // setIsLoading( false );
            return response.data;
        } catch ( err ) {
            // setIsLoading( false );
            errorCallback( err );
            return null;
        }
    };

    export const safeApiCall = useCallback( async ( {
        apiCall,
        data = {},
        params = {},
        requiredFields = [],
        stateSetter,
        successCallback,
        errorCallback,
        setLoading = () => { },
        setError = () => { },
    } ) => {
        if ( setLoading ) setLoading( true );
        setError( null );
        try {
            const response = await apiCall();
            if ( stateSetter ) stateSetter( response.data.data );
            if ( successCallback ) successCallback( response );
            if ( setLoading ) setLoading( false );
            return response.data;
        } catch ( err ) {
            if ( errorCallback ) errorCallback( err?.message ? err?.message : err?.response?.data?.message );
            if ( setLoading ) setLoading( false );
            setError( err.response?.data?.message || 'An unexpected error occurred.' );
            throw err;
        }
    }, [] );
*/

export const handleApiRequest = async ( {
    headers,
    method = "get",
    url,
    data = {},
    params = {},
    requiredFields = [],
    stateSetter,
    successCallback,
    errorCallback,
    setLoading = () => { },
    setError = () => { },
} ) => {
    // console.log( "fetch.js :: handleAPIRequest :: ",
    //     "\n :: method = ", method,
    //     "\n :: url = ", url,
    //     "\n :: data = ", data,
    //     "\n :: params = ", params,
    //     "\n :: requiredFields = ", requiredFields,
    // );
    let response;
    try {
        if ( requiredFields.length ) {
            let validation = validateInputs( data, requiredFields, false );
            // if ( validation?.valid && validation.valid === false ) {
            //     // if ( errorCallback ) errorCallback( validation?.message );
            // }
        }

        if ( setLoading ) setLoading( true );

        response = await API[ method ](
            url,
            {
                data,
                params,
                ...( headers ? headers : {} )
            } );

        if ( response?.data?.success ) {
            // Successfully authenticated.
            if ( stateSetter ) stateSetter( response?.data?.data );
            if ( successCallback ) successCallback( response );
            // if ( successCallback ) successCallback( response?.data?.data );
            if ( setLoading ) setLoading( false );
            console.log( "fetch.js :: handleAPIRequest :: response = ", response );
            return response?.data?.data;
        } else {
            if ( setLoading ) setLoading( false );
            return null;
        }
        /* 
            if ( stateSetter ) stateSetter( response?.data?.data );
            if ( successCallback ) successCallback( response );
            // if ( successCallback ) successCallback( response?.data?.data );
            if ( setLoading ) setLoading( false );
    
            console.log( "fetch.js :: handleAPIRequest :: response = ", response );
            return response?.data?.data; 
        */
    } catch ( err ) {
        if ( errorCallback ) {
            // Check if the error has a response body field, indicating there's extended or custom error details available.
            console.log( "fetch.js :: handleAPIRequest :: errorCallback :: err = ", err, " :: ", "response = ", response );
            if ( err?.hasOwnProperty( 'response' ) ) {
                if ( err?.response?.hasOwnProperty( 'data' ) ) {
                    let errData = err.response.data?.data;
                    let status = errData?.status || err.response.status;
                    let message = errData?.message || err.response?.message;
                    let type = errData?.type;
                    let errCode = errData?.code;
                    let errSubCode = errData?.subcode;

                    switch ( status ) {
                        case 401: {
                            switch ( type ) {
                                case ( 'OAuthExpired' ):
                                    // Expired token
                                    break;
                                case ( 'OAuthException' ):
                                    // Invalid token or token not provided.
                                    break;
                                default:
                                    // Unknown error. 
                                    break;
                            }
                            break;
                        }

                        default:
                            errorCallback( message );
                            break;
                    }
                }
                else {
                    errorCallback( err.response?.message || err?.message );
                }
            }
            else {
                errorCallback( err?.message );
            }
        }
        if ( setLoading ) setLoading( false );
        return null;
    }
    finally {
        if ( setLoading ) setLoading( false );
    }
};

export const handleError = ( {
    err,
    setError = () => { },
    setLoading = () => { },
    doThrow = false,
} ) => {
    if ( !err ) {
        if ( setError ) setError( null );
        return null;
    }

    let errMsg;
    if ( utils.val.isAO( err ) ) {
        // Given an object or array.
        errMsg = err?.response?.data?.message;
    }
    else if ( utils.val.isString( err ) ) {
        // Given a basic string.
        errMsg = err;
    }
    let msg = utils.ao.deepGetKey( err, "message" );
    errMsg = msg;

    // if ( msg ) {
    //     // Given an object or array. Take out the message only. 
    //     errMsg = msg;
    // }
    // else {
    //     if ( utils.val.isString( err ) ) {
    //         // Given a basic string.
    //         errMsg = err;
    //     }
    //     else {
    //         // Dunno lmao 
    //         errMsg = null;
    //     }
    // }


    if ( utils.val.isValid( errMsg ) && utils.val.isString( errMsg ) ) {
        let randId = Math.floor( utils.rand.rand( 1e6, 0 ) );


        try {
            toast( "API Error", {
                id: randId,
                // title: "API Error",
                // description: convertToText( msg ),
                description: (
                    <pre className={ `rounded-md bg-background p-2` }>
                        <code className={ `text-white break-words whitespace-break-spaces` }>
                            {/* { `${ JSON.stringify( errMsg, null, 2 ) }` } */ }
                            { cleanStringify( errMsg ) }
                        </code>
                    </pre>
                ),
                // message: 'test',
                duration: 5000,
                closeButton: true,
                action: {
                    label: "OK",
                    onClick: () => {
                        console.log( `Toast #${ randId } :: OK button clicked.` );
                    },
                },
                // action: (
                //     <ToastAction
                //         altText="OK"
                //         onClick={ () => {  } }
                //     >
                //         { `OK` }
                //     </ToastAction>
                // ),
            } );
        } catch ( error ) {
            console.error( "HandleSuccess :: Error: ", error );
        }
    }


    // if ( setError ) { setError( [ JSON.stringify( errMsg ) ] || "An unexpected error occurred" ); }
    if ( setError ) { setError( `${ errMsg }` || "An unexpected error occurred" ); }
    if ( setLoading ) { setLoading( false ); }
    console.log( "handleError :: err = ", err, " :: ", "errMsg = ", errMsg, " :: ", "setError = ", setError, " :: ", "setLoading = ", setLoading, " :: ", "doThrow = ", doThrow );

    if ( errMsg ) {
        if ( doThrow ) throw new Error( errMsg );
        else console.error( "API Error: ", errMsg );
        // return errMsg;
    }
    else {
        return '[No Data]';
    }
};

export const handleSuccess = ( {
    res,
    stateSetter,
    setLoading = () => { },
    setError = () => { },
    doToast = true
} ) => {
    let msg;

    if ( utils.val.isString( res ) ) { msg = res; }
    else if ( utils.val.isAO( res ) ) { msg = res?.data?.message; }

    let data = res?.data?.data;

    if ( debug === true ) console.log( "handleSuccess :: res = ", res, " :: ", "setError = ", setError, " :: ", "setLoading = ", setLoading, " :: ", "doToast = ", doToast );
    if ( msg && doToast ) {
        let randId = Math.floor( utils.rand.rand( 1e6, 0 ) );

        try {
            toast( "Success", {
                id: randId,
                // description: convertToText( msg ),
                description: (
                    <pre className={ `rounded-md bg-background p-2` }>
                        <code className={ `text-white break-words whitespace-break-spaces` }>
                            {/* { `${ JSON.stringify( msg, null, 2 ) }` } */ }
                            { cleanStringify( msg ) }
                        </code>
                    </pre>
                ),
                message: 'test',
                duration: 5000,
                closeButton: true,
                action: {
                    label: "OK",
                    onClick: () => {
                        console.log( `Toast #${ randId } :: OK button clicked.` );
                    },
                },
                // action: (
                //     <ToastAction
                //         altText="OK"
                //         onClick={ () => {  } }
                //     >
                //         { `OK` }
                //     </ToastAction>
                // ),
            } );
        } catch ( error ) {
            console.error( "HandleSuccess :: Error: ", error );
        }
    }

    if ( stateSetter ) { stateSetter( data ); }
    if ( setLoading ) { setLoading( false ); }
    if ( setError ) { setError( null ); }
};

/*  export const handleResponse = ( result ) => {
        // Manages the response to a request. 
        if ( result?.success ) {
            if ( result.success === true ) {
                // Good response.
                return result?.data?.data;
            }
            else if ( result.success === false ) {
                // Error. 
                handleError( result );
            }
        }
    };
*/
