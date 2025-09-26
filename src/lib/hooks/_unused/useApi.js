import React from 'react';

const useApi = () => {

    const handleClone = async ( {
        inputData,
        data, setData,
        createCallback,
        cancelCallback,
        errorCallback,
        successCallback,
        stateSetter,
    } ) => {
        if ( utils.val.isObject( inputData ) ) {
            let valtemp = { ...inputData };
            valtemp = utils.ao.filterKeys( inputData, [ "_id" ] );
            inputData = valtemp;

            let result = await createCallback( inputData );
            if ( result ) {
                // Result not null, successful.
                // Insert into list.
                if ( stateSetter ) stateSetter( result );
                else if ( setData ) setData( ...data, result );

                if ( successCallback ) successCallback();

                if ( cancelCallback ) cancelCallback();
            }
            else {
                if ( errorCallback ) errorCallback( `Error calling API function.` );
                return null;
            }
        }
    };

    return (
        handleClone,
    );
};

export default useApi;
