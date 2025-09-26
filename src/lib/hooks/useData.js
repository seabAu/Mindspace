import React, { useEffect, useState } from 'react';
import * as utils from 'akashatools';
import useGlobalStore from '@/store/global.store.js';
import {
    handleApiRequest,
    handleError,
    handleSuccess,
    validateInputs
} from '../utilities/fetch.js';

const useData = ( { error, setError, loading, setLoading, debug } ) => {
    // Log of errors. 
    const [ useLogging, setUserLogging ] = useState( false );
    const [ errors, setErrors ] = useState( [] );

    // Utility functions for state management
    // Wrapper function for logic to set all data. 
    const handleSetData = ( data, setData ) => {
        if ( data && setData ) {
            setData( data );
        }
    };

    // Wrapper function for logic to replace and set an item in an array of documents. 
    const handleReplaceSetData = ( id, data, setData ) => {
        if ( setData && setData && id ) {
            setData( ( prev ) => prev.map( ( item ) => ( item?._id === id ? data : item ) ) );
        }
    };

    // Wrapper function for logic to set all data. 
    const handleDeleteSetData = ( id, setData ) => {
        if ( setData && id ) {
            setData( ( prev ) => prev.filter( ( item ) => item?._id !== id ) );
        }
    };

    // Wrapper function for logic to filter and set data based on a given predicate function. 
    const handleFilterSetData = ( setData, filterPredicate ) => {
        if ( setData && filterPredicate ) {
            setData( ( prev ) => prev.filter( filterPredicate ) );
        }
    };

    const handleInsertSetData = ( data, setData ) => {
        if ( data && setData ) {
            setData( ( prev ) => [ ...( prev ? prev : [] ), data ] );
        }
        else if ( !data && setData ) {
            // Data is null currently, but setData is provided valid.
            setData( [ data ] );
        }
    };

    return {
        handleSetData,
        handleReplaceSetData,
        handleDeleteSetData,
        handleFilterSetData,
        handleInsertSetData,
    };
};

export default useData;
