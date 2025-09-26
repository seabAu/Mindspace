// https://stackoverflow.com/questions/76394331/is-there-a-better-way-to-implement-a-hook-that-delays-updating-the-data // 
// https://github.com/uidotdev/usehooks/blob/main/index.js#L225 // 
import { useState, useEffect } from "react";

const useDebounce = ( value, delay, onUpdate ) => {
    const [ debouncedValue, setDebouncedValue ] = useState( value );

    useEffect( () => {
        const timeoutID = setTimeout( () => {
            setDebouncedValue( value );
        }, delay );

        return () => clearTimeout( timeoutID );
    }, [ value, delay ] );

    useEffect( () => {
        if ( debouncedValue !== value ) {
            onUpdate( debouncedValue );
        }
    }, [ debouncedValue, value, onUpdate ] );

    return debouncedValue;
};

export default useDebounce;