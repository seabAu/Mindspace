// https://21st.dev/originui/dialog/edit-profile-dialog // 
import { useState } from "react";

/* type UseCharacterLimitProps = {
    maxLength: number;
    initialValue?: string;
}; */

export function useCharacterLimit ( { maxLength, initialValue = "" } ) {
    const [ value, setValue ] = useState( initialValue );
    const [ characterCount, setCharacterCount ] = useState( initialValue.length );

    const handleChange = ( e ) => {
        const newValue = e.target.value;
        if ( newValue.length <= maxLength ) {
            setValue( newValue );
            setCharacterCount( newValue.length );
        }
    };

    return {
        value,
        characterCount,
        handleChange,
        maxLength,
    };
}