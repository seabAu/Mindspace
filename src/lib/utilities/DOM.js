import { v4 as uuidv4 } from 'uuid';

// Utility to add keys if missing
export const addUniqueKeys = ( children ) => {
    return React.Children.map( children, ( child ) => {
        if ( React.isValidElement( child ) ) {
            // If the child already has a key, keep it.
            if ( child.key != null ) {
                return child;
            }
            // Otherwise, add a UUID as the key.
            return React.cloneElement( child, { key: uuidv4() } );
        }
        return child; // If not a valid React element, return as is.
    } );
};
