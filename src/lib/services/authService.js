import API from '../services/api';
import * as utils from 'akashatools';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import {
    handleApiRequest,
    handleError,
    handleSuccess,
} from '../utilities/fetch';

const API_BASE_URL = '/api/users'; // Base URL for notes API

export const fetchUserList = async ( {
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            let numUsers = utils.val.isValidArray( data, true ) ? data?.length : 0;
            toast( `Successfully fetched all users: [${ numUsers } users found].` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to fetch all users: ${ JSON.stringify( message ) }` );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
        // params: { workspaceId, id },
        // data: { ...data, workspaceId: workspaceId },
        // requiredFields: [ 'workspaceId', 'content' ],
    } );
};



// Fetch a specific user's data by ID
export const fetchUserById = ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/${ id }`,
        // params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};


export const updateUser = ( {
    id,
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/details/${ id }`,
        data: data,
        // params: { id },
        requiredFields: [],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
        setLoading: setLoading,
        setError: setError
    } );
};
