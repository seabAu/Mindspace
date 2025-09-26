import React from 'react';
import * as utils from 'akashatools';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DATA_TYPES } from '@/lib/config/config';

const DataTypeSelect = ( {
    fieldName = '',
    value = '',
    errors = {},
    handleChange = () => { },
    className = '',
} ) => {
    return (
        <Select
            value={ value }
            key={ fieldName }
            onValueChange={ handleChange }>
            <SelectTrigger
                className={ `text-white h-7 text-xs ${ errors?.[ fieldName ] ? 'border-red-500' : ''
                    } ${ className }` }>
                <SelectValue placeholder={ `Select ${ fieldName }` } />
            </SelectTrigger>
            <SelectContent className='text-white'>
                { DATA_TYPES.map( ( type ) => (
                    <SelectItem
                        key={ type.value }
                        value={ type.value }
                        className='text-xs'>
                        { type.label }
                    </SelectItem>
                ) ) }
            </SelectContent>
        </Select>
    );
};

export default DataTypeSelect;
