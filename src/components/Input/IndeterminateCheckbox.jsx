import { useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const IndeterminateCheckbox = ( {
    checked,
    indeterminate,
    onCheckedChange,
    className,
    ...props
} ) => {
    const checkboxRef = useRef( null );

    useEffect( () => {
        if ( checkboxRef.current ) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [ indeterminate ] );

    return (
        <Checkbox
            ref={ checkboxRef }
            checked={ checked }
            onCheckedChange={ onCheckedChange }
            className={ className }
            { ...props }
        />
    );
};

export default IndeterminateCheckbox;
