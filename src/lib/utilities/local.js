
export const SetLocal = ( key, value ) => {
    console.log( "Saving local storage: {", key, " :: ", ", ", value, "}" );
    localStorage.setItem(
        key,
        value,
    );
};

export const GetLocal = ( key ) => {
    let value = localStorage.getItem( key );
    console.log( "Fetching local storage key: ", key, " :: ", "value = ", value );
    if ( value ) {
        return value;
    }
    else {
        // Return null instead of undefined as an indicator of error.
        return null;
    }
};

export const DeleteLocal = ( key ) => {
    console.log( "Deleting local storage key: ", key );
    localStorage.removeItem( key );
};
