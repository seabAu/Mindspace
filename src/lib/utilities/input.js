
import { v4 as uuidV4 } from "uuid";
import * as utils from 'akashatools';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import Input from "@/components/Form/Input";
import { dataType2fieldType, generateRandom, getType, isInvalid } from "@/lib/utilities/data";
import { formatDateTime } from "@/lib/utilities/time";
import { convertCamelCaseToSentenceCase } from "@/lib/utilities/string";
import { formatDateDDMMYYYY } from "akashatools/lib/Time";
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from "@/lib/config/types";
import { DEFAULT_DATA_TYPES } from "../config/constants";
// import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';

export const validateForm = ( formData ) => {
    const errors = {};
    if ( !formData.name ) errors.name = 'Name is required';
    if ( !formData.email || !/\S+@\S+\.\S+/.test( formData.email ) ) errors.email = 'Invalid email';
    return errors;
};

export const validateEmail = ( email ) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email );

export const formatCurrency = ( value ) => `$${ value.toFixed( 2 ) }`;

export const buildSelect = ( {
    placeholder,
    opts,
    value = 'none',
    key,
    initialData,
    handleChange = () => { },
    className,
    multiple = false,
    required = false,
    disabled = false,
} ) => {
    // If the value is not one of the values in options, replace it with the 'none' option.
    // opts.push( {
    //     value: 'none',
    //     name: 'None'
    // } );
    // let validvalue = opts.filter( ( o ) => o.value === value )?.value;
    // if ( validvalue ) value = -1;
    // let multiple = false;

    // DefaultValue must be a scalar, so check for arrays and objects.
    if ( utils.val.isArray( value ) ) {
        if ( value.length > 0 ) { multiple = true; } // Has some items in it. 
        else { value = 'none'; } // Empty value.
    }
    else if ( utils.val.isObject( value ) ) {
        value = value.toString();
    }
    else if ( utils.val.isDefined( value ) ) {
        multiple = false;
    }
    else {
        multiple = false;
    }

    let currValueName = '-';
    if ( utils.val.isDefined( value ) ) currValueName = opts.filter( ( o ) => o.value === value )?.name;

    // See if we already have a 'none' option. 
    let hasNoneOpt = opts.filter( ( o ) => o?.name && ( String( o?.name ?? '' )?.toLowerCase() === 'none' ) ) ? true : false;

    // console.log( "Input.js :: buildSelect :: input args = ", [ placeholder, opts, value, key, initialData, handleChange, className, multiple ], " :: ", "currValueName = ", currValueName, " :: ", "hasNoneOpt = ", hasNoneOpt, " :: ", );

    if ( opts && utils.val.isValidArray( opts, true ) ) {
        return (
            <Select
                key={ `input-field-select-${ key }` }
                name={ key }
                multiple={ multiple }
                required={ required }
                disabled={ disabled }
                className={ `relative z-[1001] mb-2 p-0 w-full ${ className }` }
                placeholder={ placeholder }
                // value={ utils.val.isDefined( value ) ? value : 'None Selected' }
                defaultValue={ utils.val.isDefined( value ) ? value : 'None Selected' }
                // onChange={ }
                // onValueChange={ ( value ) => {
                //     table.setPageSize( Number( value ) );
                // } }
                onValueChange={ ( value ) => {
                    // console.log( 'Input.js :: buildSelect :: value = ', value, " :: ", "key = ", key );
                    if ( handleChange && utils.val.isDefined( value ) ) {
                        // handleChange( initialData, key, value );
                        handleChange( key, value );
                    }
                    // setDate( addDays( new Date(), parseInt( value ) ) )
                } }
            >
                <SelectTrigger
                    // asChild
                    className={ `!transition-all !transform-none ${ className }` }
                >
                    <SelectValue
                        className={ `w-[100%]` }
                        placeholder={ `Select ${ placeholder }` }
                    >
                        { currValueName }
                    </SelectValue>
                </SelectTrigger>
                <SelectContent
                    position="popper"
                    disabled={ disabled }
                >
                    <SelectGroup>
                        <SelectLabel>{ `Select ${ placeholder }` }</SelectLabel>
                        { ( hasNoneOpt === false ) && (
                            <SelectItem
                                id={ `input-field-select-${ 'none' }-${ 'None' }` }
                                key={ `input-field-select-${ 'none' }-${ 'None' }` }
                                className={ `cursor-pointer` }
                                value={ 'none' }
                                disabled={ disabled }
                            >
                                { `None` }
                            </SelectItem>
                        ) }
                        {
                            opts.map( ( opt, index ) => {
                                return (
                                    <SelectItem
                                        id={ `input-field-select-${ key }-${ index }-${ opt?.value }` }
                                        key={ `input-field-select-${ key }-${ index }-${ opt?.value }` }
                                        className={ `cursor-pointer` }
                                        value={ opt?.value }
                                        disabled={ disabled }
                                    >
                                        { opt?.name && opt?.name !== '' && utils.str.toCapitalCase( opt?.name ) }
                                    </SelectItem>
                                );
                            } )
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        );
    }
};

export const buildIdSelectInput = ( {
    placeholder = '',
    refData,
    refName = '',
    key = '',
    // value = 'none',
    initialValue,
    handleChange = () => { },
    multiple = false,
    required = false,
    disabled = false,
    className,
} ) => {
    // (
    //     fieldKey = '',
    //     initialValue,
    //     refData = [],
    //     refName = '',
    //     handleChange = () => { },
    // )
    // Make select inputs specifically for IDs corresponding to named reference types. 

    // This is an objectId. Turn it into a select switch for choosing an ID. 
    // if ( fieldSchema && fieldSchema.hasOwnProperty( 'ref' ) ) {
    // let refName = fieldSchema?.ref;
    if ( refData && refName && utils.val.isValidArray( refData[ refName ], true ) ) {
        let refIdValue = initialValue;
        let options = refData[ refName ].map( ( d, index ) => {
            if ( d?._id === initialValue ) { refIdValue = initialValue; } // Current value.
            return ( { value: d?._id, name: d?.title } );
        } );

        /*  field.fieldType = 'Select';
            field.dataType = 'ObjectId';
            field.options = options;
            field.value = refIdValue;
            field.defaultValue = refIdValue;
            field.path = path;
            field.onChange = ( e ) => {
                e.preventDefault();
                handleChange( fieldData, key, parseFloat( e.target.value ) );
            };
        */

        return (
            buildSelect( {
                placeholder: placeholder,
                initialData: initialValue,
                value: refIdValue,
                key: key,
                opts: options,
                handleChange: ( key, value ) => handleChange( key, value ),
                className: '',
                multiple: false,
                disabled: disabled,
                required: required,
            } )
        );
    }
};

export const typeToInitialDefault = ( type = 'String', defaultValue = '', debug = false ) => {

    if ( debug === true )
        console.log( "Utils.data.typeToInitialDefault :: type = ", type, " :: defaultValue = ", defaultValue, " :: typeof type = ", typeof type );
    if ( !DEFAULT_DATA_TYPES.includes( type ) ) {
        // Edge case for when type is accidentally passed in as an array. 
        if ( utils.val.isValidArray( type, true ) ) {
            type = type[ 0 ];
            if ( type ) type = `[${ type }]`;
        }
        else if ( type.hasOwnProperty( 'type' ) ) {
            // Edge case for when type is of format: type: { type: { ...type info here... } }
            type = type?.type;
            if ( debug === true )
                console.log( "Utils.data.typeToInitialDefault :: type has a subtype: type = ", type, " :: defaultValue = ", defaultValue, " :: ", "type has a type of: ", typeof type );
        }

        if (
            ( utils.val.isObject( type ) )
            && ( Object.keys( type ).length > 0 )
            && ( !DEFAULT_DATA_TYPES.includes( type ) )
        ) {
            // Type is an inline object or array definition. 
            if ( debug === true )
                console.log( "Utils.data.typeToInitialDefault :: type has a subtype of an object definition: type = ", type, " :: defaultValue = ", defaultValue );
            let newObj = {};
            Object.keys( type ).forEach( ( k, i ) => {
                let v = type[ k ];
                if ( debug === true )
                    console.log( "Utils.data.typeToInitialDefault :: Object input at top of  :: k = ", k, " :: ", "v = ", v, " :: ", "type = ", type );

                // v will be {type: 'something'}.
                if ( v.hasOwnProperty( 'type' ) ) {
                    // Has a type. Extract and create initial data with it.
                    let kDefault = defaultValue
                        ? ( utils.val.isObject( defaultValue ) && defaultValue.hasOwnProperty( k )
                            ? defaultValue?.[ k ]
                            : defaultValue
                        )
                        : null;
                    let initialized = kDefault || typeToInitialDefault( v?.type, kDefault );
                    newObj[ k ] = initialized;
                }
                if ( debug === true )
                    console.log( "Utils.data.typeToInitialDefault :: type = ", type, " :: v = ", v, " :: ", "k = ", k, " :: ", "i = ", i, " :: ", " v?.type = ", v?.type );
            } );
            if ( debug === true )
                console.log( "Utils.data.typeToInitialDefault :: type = ", type, " :: defaultValue = ", defaultValue, " :: ", "newObj = ", newObj );
            return newObj;
        }
        else {
            if ( debug === true )
                console.log( "Utils.data.typeToInitialDefault :: type has a subtype of a normal type: type = ", type, " :: defaultValue = ", defaultValue );

            if ( type.hasOwnProperty( 'ObjectId' ) ) {
                type = 'ObjectId';
            }
            else if ( utils.val.isNum( type ) && !utils.val.isNum( type?.type ) ) {
                type = 'Number';
            }
            else if ( ( utils.val.isNum( type ) && !utils.val.isFloat( type ) ) || ( utils.val.isNum( type?.type ) && !utils.val.isFloat( type?.type ) ) ) {
                type = 'Int32';
            }
            // else if ( utils.val.isFloat( type ) && !utils.val.isFloat( type?.type ) ) {
            else if ( utils.val.isNum( type ) && utils.val.isFloat( type ) ) {
                type = 'Decimal';
            }
            else if ( utils.val.isString( type ) || utils.val.isString( type?.type ) ) {
                type = 'String';
            }
            else if ( utils.val.isObject( type ) && !utils.val.isArray( type ) ) {
                type = 'Object';
            }
            else if ( utils.val.isObjectArray( type, true ) ) {
                type = '[Object]';
            }
        }
        // else if ( utils.val.isArray( type ) ) {
        //     type = 'Array';
        // }

    };

    if ( debug === true )
        console.log( "Utils.data.typeToInitialDefault :: BEFORE TYPE-SWITCH :: type = ", type, " :: defaultValue = ", defaultValue );

    // Type is a regular, basic, atomic data type. Process accordingly. 

    switch ( type ) {
        case 'String':
            return "";
        case 'Int32':
            return 0;
        case 'Number':
            return 0;
        case 'Boolean':
            return false;
        case 'Date':
        case 'DateTime':
            return formatDateDDMMYYYY( new Date( defaultValue ?? Date.now() ) );
        case 'DateTimeLocal':
            return formatDateTime( new Date( defaultValue ?? Date.now() ) );
        case 'Decimal':
            return new Decimal( 0 );
        case 'Array':
            return [ defaultValue ? defaultValue : '' ];
        case 'ObjectId':
            // return ( uuidV4() );
            return ( utils.rand.randString( 24, '0123456789abcdef' ) );
        case 'Object':
            // return type.hasOwnProperty( 'ObjectId' )
            //     // ? type?.ObjectId
            //     ? ( uuidV4() )
            //     : {};
            // if ( type instanceof Object ) {
            //     return Object.fromEntries(
            //         Object.entries( type ).map( ( [ key, value ] ) => [
            //             key,
            //             typeToInitialDefault( value ),
            //         ] ),
            //     );
            // }
            // return defaultValue ? defaultValue : '';
            if ( type.hasOwnProperty( 'type' ) ) {
                type = type?.type;
                let newObj = {};
                Object.keys( type ).forEach( ( k, i ) => {
                    let v = type[ k ];
                    // if ( debug === true )
                    console.log( "FORM GENERATOR :: Object input +button :: v = ", v, " :: ", "schemaType = ", schemaType, " :: ", "" );
                    // v will be {type: 'something'}.
                    let kType = null;
                    let kDefault = null;
                    if ( v.hasOwnProperty( 'type' ) ) {
                        // Has a type. Extract and create initial data with it.
                        kType = v.type;
                    }
                    if ( v.hasOwnProperty( 'default' ) ) {
                        kDefault = v.default;
                    }
                    if ( kType ) newObj[ k ] = typeToInitialDefault( kType, kDefault );
                } );

                return newObj;
            }

        case '[String]':
            return [ typeToInitialDefault( 'String', '' ) ];
        case '[Date]':
            return [ typeToInitialDefault( 'Date', Date.now() ) ];
        case '[DateTime]':
            return [ typeToInitialDefault( 'DateTime', Date.now() ) ];
        case '[DateTimeLocal]':
            return [ typeToInitialDefault( 'DateTimeLocal', Date.now() ) ];
        case '[Boolean]':
            return [ typeToInitialDefault( 'Boolean', false ) ];
        case '[Int32]':
            return [ typeToInitialDefault( 'Int32', 0 ) ];
        case '[Decimal]':
            return [ typeToInitialDefault( 'Decimal', 0.0 ) ];
        case '[Number]':
            return [ typeToInitialDefault( 'Number', 0 ) ];
        case 'ObjectArray':
        case '[Object]':
            // return [];
            return [ typeToInitialDefault( 'Object', {} ) ];
        // default:
        // return defaultValue ? defaultValue : '';
        default:
            return defaultValue ? defaultValue : '';
            if ( type instanceof Object ) {
                return Object.fromEntries(
                    Object.entries( type ).map( ( [ key, value ] ) => [
                        key,
                        typeToInitialDefault( value ),
                    ] ),
                );
            }
    }
    // type.includes( "[" ) && type.includes( "]" ) ? `[${ typeToInitialDefault( utils.str.replaceMultiple( type, { "[": "", "]": "" } ) ) }]`
    // ""; // : schemaToFormModel(fieldSchema, initializeRandom);
};

export const initializeValueFromSchema = (
    schema = {},
    type = 'String',
    defaultValue = '',
    debug = false,
) => {
    if ( debug === true )
        console.log( "Utils.data.initializeValueFromSchema :: type = ", type, " :: defaultValue = ", defaultValue );
    // Edge case for when type is accidentally passed in as an array. 
    if ( utils.val.isValidArray( schema, true ) ) {
        type = schema[ 0 ];
        if ( type ) type = `[${ type }]`;
    }
    else if ( type.hasOwnProperty( 'type' ) ) {
        type = type?.type;
        if ( debug === true )
            console.log( "Utils.data.typeToInitialDefault :: type has a subtype: type = ", type, " :: defaultValue = ", defaultValue, " :: ", "type has a type of: ", typeof type, " :: ", "Object.keys( type ) = ", Object.keys( type ) );

        if (
            ( Object.keys( type ).length > 0 )
            && ( ![ 'String', 'Date', 'DateTimeLocal', 'Int32', 'Number', 'Decimal', 'Boolean' ].includes( type ) )
        ) {
            if ( debug === true )
                console.log( "Utils.data.typeToInitialDefault :: type has a subtype of an object definition: type = ", type, " :: defaultValue = ", defaultValue );
            let newObj = {};
            Object.keys( type ).forEach( ( k, i ) => {
                let v = type[ k ];
                // v will be {type: 'something'}.
                if ( v.hasOwnProperty( 'type' ) ) {
                    // Has a type. Extract and create initial data with it.
                    if ( !defaultValue ) {
                        newObj[ k ] = typeToInitialDefault( v?.type );
                    }
                    else {
                        newObj[ k ] = typeToInitialDefault( v?.type, defaultValue.hasOwnProperty( k ) ? defaultValue?.[ k ] : defaultValue );
                    }
                }
            } );
            // if ( debug === true )
            // console.log( "Utils.data.typeToInitialDefault :: type = ", type, " :: defaultValue = ", defaultValue );
            return newObj;
        }
        else {
            // if ( debug === true )
            // console.log( "Utils.data.typeToInitialDefault :: type has a subtype of a normal type: type = ", type, " :: defaultValue = ", defaultValue );

        }
    }
    // else if ( utils.val.isArray( type ) ) {
    //     type = 'Array';
    // }

    if ( type.hasOwnProperty( 'ObjectId' ) ) {
        type = 'ObjectId';
    }
    else if ( utils.val.isString( type ) || utils.val.isString( type?.type ) ) {
        type = 'String';
    }
    else if ( utils.val.isObject( type ) && !utils.val.isArray( type ) ) {
        type = 'Object';
    }
    else if ( utils.val.isObjectArray( type, true ) ) {
        type = '[Object]';
    }

    if ( debug === true )
        console.log( "Utils.data.initializeValueFromSchema :: BEFORE TYPE-SWITCH :: type = ", type, " :: defaultValue = ", defaultValue );

    switch ( type ) {
        case 'String':
            return "";
        case 'Int32':
            return 0;
        case 'Number':
            return 0;
        case 'Boolean':
            return false;
        case 'Date':
            return Date.now();
        case 'Date':
        case 'DateTimeLocal':
            return new Date();
        case 'Decimal':
            return new Decimal( 0 );
        case 'Array':
            return [ defaultValue ? defaultValue : '' ];
        case 'ObjectId':
            // return ( uuidV4() );
            return ( utils.rand.randString( 24 ) );
        // case '[Object]':
        // case 'ObjectArray':
        // return [ {} ];
        case 'Object':
            // return type.hasOwnProperty( 'ObjectId' )
            //     // ? type?.ObjectId
            //     ? ( uuidV4() )
            //     : {};
            // if ( type instanceof Object ) {
            //     return Object.fromEntries(
            //         Object.entries( type ).map( ( [ key, value ] ) => [
            //             key,
            //             typeToInitialDefault( value ),
            //         ] ),
            //     );
            // }
            // return defaultValue ? defaultValue : '';
            if ( type.hasOwnProperty( 'type' ) ) {
                type = type?.type;
                let newObj = {};
                Object.keys( type ).forEach( ( k, i ) => {
                    let v = type[ k ];
                    // console.log( "FORM GENERATOR :: Object input +button :: v = ", v, " :: ", "schemaType = ", schemaType, " :: ", "" );
                    // v will be {type: 'something'}.
                    if ( v.hasOwnProperty( 'type' ) ) {
                        // Has a type. Extract and create initial data with it.
                        newObj[ k ] = typeToInitialDefault( v?.type );
                    }
                } );

                return newObj;
            }

        case '[String]':
            return [ typeToInitialDefault( 'String', '' ) ];
        case '[Date]':
            return [ typeToInitialDefault( 'Date', Date.now() ) ];
        case '[Boolean]':
            return [ typeToInitialDefault( 'Boolean', false ) ];
        case '[Int32]':
            return [ typeToInitialDefault( 'Int32', 0 ) ];
        case '[Number]':
            return [ typeToInitialDefault( 'Number', 0 ) ];
        case '[Object]':
            return [ typeToInitialDefault( 'Object', {} ) ];
        // default:
        // return defaultValue ? defaultValue : '';
        default:
            if ( type instanceof Object ) {
                return Object.fromEntries(
                    Object.entries( type ).map( ( [ key, value ] ) => [
                        key,
                        typeToInitialDefault( value ),
                    ] ),
                );
            }
            return defaultValue ? defaultValue : '';
    }
    // type.includes( "[" ) && type.includes( "]" ) ? `[${ typeToInitialDefault( utils.str.replaceMultiple( type, { "[": "", "]": "" } ) ) }]`
    // ""; // : schemaToFormModel(fieldSchema, initializeRandom);
};

export const cleanJSON = ( input ) => {
    if ( input ) {
        if ( utils.val.isObject( input ) && !utils.val.isArray( input ) ) {
            // Nested object. Need to go deeper.
            let cleanedObj = {};
            Object.keys( input ).forEach( ( key, index ) => {
                // Run through each key-value pair in the object. If we encounter a value that is an array or object, we go deeper. 
                let value = input[ key ];
                let cleanedValue;
                // Get type of value.
                if ( utils.val.isObject( value ) ) {
                    // Nested object. Need to go deeper.
                    cleanedValue = cleanJSON( value );
                }
                else if ( utils.val.isArray( value ) ) {
                    // Nested array. Need to go deeper.
                    if ( utils.val.isValidArray( value, true ) ) {
                        // Has more than one entry.
                        let testValue = value[ 0 ];
                        cleanedValue = [ cleanJSON( testValue ) ];
                    }
                    else {
                        // Is an array datatype, but nothing is present here. Push a [] into the cleanedObj. 
                        cleanedValue = [];
                    }
                } else {
                    cleanedValue = cleanJSON( value );
                }
                cleanedObj[ key ] = cleanedValue;
            } );
            return cleanedObj;
        }
        else if ( utils.val.isArray( input ) ) {
            // Nested array. Need to go deeper.
            if ( utils.val.isValidArray( input, true ) ) {
                // Has more than one entry.
                let testValue = input[ 0 ];
                return [ cleanJSON( testValue ) ];
            } else {
                return [];
            }
        }
        else if ( utils.val.isNumber( input ) ) {
            return 0;
        }
        else if ( utils.val.isString( input ) ) {
            return "";
        }
        else if ( utils.val.isBool( input ) ) {
            return false;
        }
    }
    return input;
};

export const initializeModel = ( input, debug = false ) => {
    let model;
    if ( utils.val.isValidArray( input, true ) ) { model = utils.ao.cleanJSON( input[ 0 ] ); }
    else if ( utils.val.isObject( input ) ) { model = utils.ao.cleanJSON( input ); }
    if ( debug === true ) console.log( "initializeModel :: input = ", input, " :: ", "model = ", model );
    return model;
};

export const handleSchema2InitialData = ( { schema = {}, refData = {} }, debug = false ) => {
    if ( utils.val.isObject( schema ) ) {
        let tempFormModel = initializeFormModel( {
            schema: schema,
            initialData: null,
            formData: null,
            refData: refData,
            initializeRandom: true,
            useSlidersForNumbers: true,
            useSwitchesForBoolean: true,
            useInitialData: false,
        } );
        if ( debug === true )
            console.log( "Input.js :: handleSchema2InitialData :: tempFormModel generated: ", tempFormModel );
        if ( tempFormModel?.data ) return tempFormModel?.data;
        else if ( tempFormModel?.initialData ) return tempFormModel?.initialData;
        else return null;
    }
    console.error( "Input.js :: handleSchema2InitialData :: ERROR: Schema not provided. " );
    return null;
};

export const handleChangeEvent = ( {
    field,
    value,
    data,
    setData
} ) => {
    if ( data && setData ) setData( { ...data, [ field ]: value } );
};


export const initializeFormModel = ( {
    schema,
    useInitialData = true, // Whether to make all new values (false) or use initial values (true)
    initializeRandom = false,
    initialData,
    formData,
    onInit,
    onChange,
    onSubmit,
    useSlidersForNumbers = true,
    useSwitchesForBoolean = true,
    refData,
    debug = false,
    // setFormModel,
} ) => {
    // A model will be an object, with each key value pair having a nested object.
    let model = {};
    let data = {};
    let form = {
        id: "",
        label: "",
        initialData: initialData,
        onSubmit: () => {
            onSubmit( formData );
        },
        onChange: () => {
            onChange( formData );
        },
        onInit: () => {
            onInit( { formSchema, initialData } );
        },
        fields: [],
    };
    if ( debug === true )
        console.log( "INPUT :: initializeFormModel :: initialData = ", initialData, " :: ", "with inputs: schema = ", schema, " :: ", "formData = ", formData );

    const processSchema = (
        fieldSchema,
        fieldData,
        key,
        schema, // FormSchema
        refData, // InitialData / FormData.
        onChange = ( key, value ) => { },
        path = [],
        debug = false,
    ) => {
        let keyLabel = convertCamelCaseToSentenceCase( key ? key : '[Null Key]' );
        let type;
        let fieldType;
        let dataType;
        let value;
        let elementSchema;
        // Infer the data type by combining the schema and the initial data, and 
        // pull an initial value OR generate one if need be. 

        if ( utils.val.isObject( fieldSchema ) ) {
            // Object schema, check for fieldSchema?.type.
            elementSchema = fieldSchema;
            if ( fieldSchema?.type ) {
                type = fieldSchema?.type;
                dataType = fieldSchema?.type;
                fieldType = fieldSchema?.type;
            }
            else {
                type = getType( fieldSchema );
            }
        }
        else if ( utils.val.isValidArray( fieldSchema, true ) ) {
            // Array schema, grab the 0th index as the fieldSchema. 
            // When the schema is an array, that implies by default that the value is an array of something too.
            elementSchema = fieldSchema[ 0 ];
            if ( elementSchema?.type ) {
                type = elementSchema?.type;
                dataType = 'Array';
                fieldType = elementSchema?.type;
            }
            else {
                type = getType( elementSchema );
            }
        }


        // type = fieldSchema?.type ? fieldSchema?.type : getType( fieldData );

        // Now get the value sorted. 
        // If fieldData has a value, use that.
        // If not, create a new one from the schema. Assume the schema will always have the answer as a fallback.

        if ( !type && fieldData ) {
            // Try to infer type from the data. 
            type = getType( fieldData );
        }

        // if ( fieldData ) {
        //     value = fieldData;
        // }
        // else {
        //     value = typeToInitialDefault(
        //         elementSchema,
        //         ( fieldData !== undefined && fieldData !== null )
        //             ? fieldData
        //             : ( elementSchema?.default ?? elementSchema?.type?.default )
        //     );
        //     fieldData = value; // Switcheroo 
        // }

        let inputContainerId = `form-generator-label-${ key }`;

        // function v4(options?: Version4Options, buf?: undefined, offset?: number): string;
        let uuid = uuidV4();

        value = fieldData
            ? fieldData
            : ( value
                ? value
                : ( typeToInitialDefault( elementSchema,
                    ( fieldData !== undefined && fieldData !== null )
                        ? fieldData
                        : ( elementSchema?.default ?? elementSchema?.type?.default ) )
                ) );

        let field = {
            uuid: uuid, // Create a unique identifier to try and avoid re-renders by using the key field. 
            // data: typeToInitialDefault( elementSchema, fieldData ? fieldData : elementSchema?.default ),
            // data: fieldData
            //     ? fieldData
            //     : ( value
            //         ? value
            //         : ( typeToInitialDefault( elementSchema,
            //             ( fieldData !== undefined && fieldData !== null )
            //                 ? fieldData
            //                 : ( elementSchema?.default ?? elementSchema?.type?.default ) )
            //         ) ),
            data: value,
            defaultValue: value,
            value: value,
            id: key,
            key: key,
            name: inputContainerId,
            label: keyLabel,
            placeholder: keyLabel,
            type: type,
            dataType: type, // type,
            fieldType: type, // type,
            fieldSchema: fieldSchema, // elementSchema, // fieldSchema,
            elementSchema: elementSchema,
            schema: fieldSchema,
            inputProps: {},
            required: fieldSchema?.required ? fieldSchema?.required : false,
            fields: [],
            ...elementSchema,
            // ...fieldData,
        };


        if ( elementSchema?.default ) { field.defaultValue = elementSchema.default; }
        if ( elementSchema?.required ) { field.required = elementSchema.required; }
        if ( elementSchema?.disabled ) { field.disabled = elementSchema.disabled; }
        if ( elementSchema?.enum ) { field.options = elementSchema.options; }
        if ( elementSchema?.min ) { field.min = elementSchema.min; }
        if ( elementSchema?.max ) { field.max = elementSchema.max; }
        if ( elementSchema?.maxLength ) { field.maxLength = elementSchema.maxLength; }
        if ( elementSchema?.minLength ) { field.minLength = elementSchema.minLength; }
        if ( elementSchema?.step ) { field.step = elementSchema.step; }

        if ( debug === true )
            console.log(
                "initializeFormModel",
                "\n :: ", "GLOBALS: ",
                "\n :: ", "schema = ", schema,
                "\n :: ", "fieldData = ", fieldData,

                "\n :: ", "renderField :: LOCALS: ",
                "\n :: ", "fieldKey = ", key,
                "\n :: ", "value = ", value,
                "\n :: ", "field = ", field,
                "\n :: ", "fieldSchema = ", fieldSchema,
                "\n :: ", "elementSchema = ", elementSchema,
                "\n :: ", "fieldData = ", fieldData,
                "\n :: ", "path = ", path,
                "\n :: ", "type = ", type,
            );

        if ( utils.val.isDefined( type ) ) {


            // switch(type)
            // else if ( Array.isArray( fieldSchema ) && utils.val.isValidArray( fieldSchema, true ) ) {
            // && ( utils.val.isObject( fieldSchema ) )
            // && ( ![ 'String', 'Date', 'Number', 'Array', 'Decimal', 'Boolean' ].includes( type ) )
            if (
                // ( utils.val.isValidArray( fieldData, true ) )
                // ||
                ( utils.val.isValidArray( fieldSchema, true ) )
            ) {
                // Array of something.
                // else if ( type === Array || type === 'Array' || [ '[String]', '[Boolean]', '[Number]', '[Object]', '[ObjectId]', '[Schema]' ].includes( type ) ) {
                // TODO :: Check to see if there are any objects in this array. If not, render as a CSV-field.
                // Get the type from field[0]?.type.
                let arrFieldSchema = fieldSchema;
                let arrFieldType; // = 'String'; // String by default.
                if ( utils.val.isObject( fieldSchema ) ) {
                    arrFieldSchema = fieldSchema;
                }
                else if ( utils.val.isValidArray( fieldSchema, true ) ) {
                    arrFieldSchema = fieldSchema[ 0 ];
                }
                field.schema = arrFieldSchema;
                field.fieldSchema = arrFieldSchema;

                if ( arrFieldSchema.hasOwnProperty( 'type' ) ) {
                    if ( Object.keys( arrFieldSchema?.type ) > 1 ) {
                        // Object keys def
                        arrFieldType = arrFieldSchema?.type;
                    }
                    else {
                        // Just a regular datatype.
                        arrFieldType = arrFieldSchema?.type;
                    }
                }
                else {
                    arrFieldType = arrFieldSchema;
                }

                // else if ( utils.val.isValidArray( fieldSchema, true ) && fieldSchema[ 0 ].hasOwnProperty( 'type' ) ) type = fieldSchema[ 0 ]?.type;

                // Since the fieldData isn't necessarily filled in with initial data, make it an array if it isn't one already so it renders properly. Else, it doesn't render this field. 
                let arrFieldData;
                let arrSubDefault = arrFieldSchema?.default ? arrFieldSchema?.default : '';

                if ( fieldData ) {
                    // Not null or undefined. At least. Hooray.
                    if ( utils.val.isValidArray( fieldData, true ) ) {
                        // All good to go. Already an array.
                        arrFieldData = fieldData;
                    }
                    else {
                        // NOT an array, but isn't invalid. Wrap in an array.
                        arrFieldData = [ fieldData ];
                    }
                }
                else {
                    // Initialize new data. 
                    arrFieldData = [ typeToInitialDefault(
                        arrFieldType,
                        arrFieldSchema?.default
                            ? arrFieldSchema?.default
                            : ''
                    ) ];
                }

                if ( arrFieldType === 'Object' ) {
                    field.fieldType = 'ObjectArray';
                    field.dataType = 'ObjectArray';
                }
                else if ( arrFieldType === 'Array' ) {
                    // An array inside an array? Yikes lol.
                    field.fieldType = 'ArrayArray';
                    field.dataType = 'ArrayArray';
                }
                else {
                    // console.log( "arrFieldType = ", arrFieldType );
                    field.fieldType = 'Array';
                    field.dataType = `[${ utils.val.isObject( arrFieldType ) ? 'Object' : arrFieldType }]`;
                }

                field.path = path;
                field.type = arrFieldType;
                // let initializedVal = arrFieldData ?? typeToInitialDefault( arrFieldSchema, arrSubDefault );
                let initializedVal = arrFieldData;

                field.defaultValue = arrSubDefault;
                field.value = initializedVal;
                field.schema = arrFieldSchema;
                field.fieldSchema = arrFieldSchema;

                field.onChange = ( key, value ) => {
                    // handleChange( fieldData, key, parseFloat( e.target.value ) );
                    // MAY need to follow the path to this point to the correct spot. 
                    // let updatedData = utils.ao.deepFindSet(
                    //     formData,
                    //     key,
                    //     [ ...arrFieldData, value ]
                    // );
                    setFormData( deepPathSet( formData, path, value ) );
                };

                if ( debug === true )
                    console.log(
                        "initializeFormModel",
                        "\n :: ", "ARRAY TYPE",
                        "\n :: ", "fieldKey = ", key,
                        "\n :: ", "field = ", field,
                        "\n :: ", "value = ", value,
                        "\n :: ", "fieldData = ", fieldData,
                        "\n :: ", "fieldSchema = ", fieldSchema,
                        "\n :: ", "elementSchema = ", elementSchema,
                        "\n :: ", "initializedVal = ", initializedVal,
                        "\n :: ", "field.fieldType = ", field.fieldType,
                        "\n :: ", "field.dataType  = ", field.dataType,
                        "\n :: ", "arrFieldData = ", arrFieldData,
                        "\n :: ", "path = ", path,
                        "\n :: ", "type = ", type,
                    );

                // if ( fieldData[ key ] && utils.val.isValidArray( fieldData[ key ], true ) ) {
                // field.fields = [];
                if ( arrFieldData && utils.val.isValidArray( arrFieldData, true ) ) {
                    arrFieldData.forEach( ( f, index ) => {
                        let subField = processSchema(
                            // utils.val.isValid( arrFieldSchema )
                            //     ? arrFieldSchema?.hasOwnProperty( 'type' )
                            //         ? arrFieldSchema?.type
                            //         : type
                            //     : type,
                            elementSchema,
                            // [ 0 ], // fieldSchema,
                            f, // [ ...arrFieldData ], // f, // arrFieldData[ key ][ index ],
                            String( index ), // key, // `${ path.join( '.' ) }.${ key }[${ index }]`,
                            f,
                            refData, // InitialData / FormData.
                            ( key, value ) => {
                                setFormData( deepPathSet( formData, [ ...path, index ], value ) );
                            },
                            [ ...path, index ],
                            debug,
                        );
                        if ( debug === true )
                            console.log(
                                "initializeFormModel",
                                "\n :: ", "ARRAY TYPE",
                                "\n :: ", "SUBFIELD CREATION",
                                "\n :: ", "fieldKey = ", key,
                                "\n :: ", "field = ", field,
                                "\n :: ", "type = ", type,
                                "\n :: ", "f = ", f,
                                "\n :: ", "index = ", index,
                                "\n :: ", "elementSchema = ", elementSchema,
                                "\n :: ", "subField = ", subField,
                                "\n :: ", "subFieldPath = ", [ ...path, index ],
                                "\n :: ", "field.fieldType = ", field.fieldType,
                                "\n :: ", "field.dataType  = ", field.dataType,
                                "\n :: ", "arrFieldData = ", arrFieldData,
                                "\n :: ", "arrFieldSchema = ", arrFieldSchema,
                            );

                        field.fields.push(
                            subField
                        );
                    } );
                }
            }

            else if (
                // type === 'Object'
                // || type === 'Schema'
                // || 
                (
                    ( !type.hasOwnProperty( 'type' ) )
                    // && ( typeof type === 'object' )
                    && ( utils.val.isObject( type ) )
                    && ( !Array.isArray( type ) )
                    && ( ![ 'String', 'Date', 'Number', 'Array', 'Decimal', 'Int32', 'Boolean' ].includes( type ) )
                )
            ) {
                // This is a regular object with fields. 
                // else if ( type === 'Object' ) {

                field.dataType = 'Object';
                field.fieldType = 'Object';
                // field.value = value;
                // field.defaultValue = value;
                // field.required = fieldSchema?.required;
                field.path = path;
                field.onChange = ( e ) => {
                    // handleChange( fieldData, key, parseFloat( e.target.value ) );
                    const { id, name, value } = e.target;
                    setFormData( deepPathSet( formData, path, value ) );
                };
                field.fields = [];

                Object.keys( type ).forEach( ( subKey ) => {
                    let subField = type[ subKey ];
                    let subId = `${ key }.${ subKey }`;
                    field.fields[ subKey ] = (
                        processSchema(
                            fieldSchema.type[ subKey ],
                            fieldData
                                ? ( fieldData.hasOwnProperty( subKey )
                                    ? fieldData[ subKey ]
                                    : '' )
                                : ( '' ),
                            subKey,
                            subField,
                            refData, // InitialData / FormData.
                            ( key, value ) => {
                                setFormData( deepPathSet( formData, [ ...path, subKey ], value ) );
                            },
                            [ ...path, subKey ],
                            debug,
                        )
                    );
                } );
            }

            // else if ( typeof field === 'object' && !Array.isArray( field ) ) {
            else if ( type === 'ObjectId' ) {
                // Field is an ObjectId.
                // Check to see if it's an ObjectID, or just a regular object with fields. 
                if ( debug === true )
                    console.log( "field is an object: fieldSchema = ", fieldSchema, " :: ", "schema = ", schema, " :: ", "key = ", key );
                if ( fieldSchema && fieldSchema?.hasOwnProperty( 'refPath' ) ) {
                    // This is an objectId. 
                    // Turn it into a select switch for choosing an ID. 
                    let objectTypeRef = fieldSchema?.refPath;
                    let options = [];

                    // First check for a special case where an enum inside the schema defines the options for this refPath. 
                    // if ( schema?.hasOwnProperty( objectTypeRef ) && fieldSchema?.[ objectTypeRef ]?.hasOwnProperty( 'enum' ) ) {

                    let refIdValue = value;
                    let optionsEnum = utils.ao.deepGetKey( schema, objectTypeRef );
                    // Enums can either have the structure of an object { values: [ ... ], message: "..." }
                    // or a straight array [ ...values... ]
                    let optionsEnumValues = extractValidationEnum( optionsEnum );

                    if ( debug === true )
                        console.log( "ERROR HERE :: fieldSchema = ", fieldSchema, " :: ", "refIdValue = ", refIdValue, " :: ", "optionsEnum = ", optionsEnum, " :: ", "optionsEnum.enum = ", optionsEnum?.enum );
                    options = [ {
                        name: 'None',
                        value: null,
                    },
                    ...( utils.val.isValidArray( optionsEnumValues, true )
                        ? (
                            optionsEnumValues?.map( ( o ) => {
                                if ( o?._id === value ) { refIdValue = value; }
                                return ( {
                                    value: o?._id,
                                    name: o?.title
                                } );
                            } )
                        )
                        : ( [] ) )
                    ];

                    field.fieldType = 'Select';
                    field.dataType = 'ObjectId';
                    field.options = options;
                    field.value = refIdValue;
                    field.defaultValue = refIdValue;
                    field.path = path;
                    field.onChange = ( e ) => {
                        setFormData( deepPathSet( formData, path, value ) );
                    };
                    if ( debug === true )
                        console.log( "input.js :: refPath item :: fieldSchema = ", fieldSchema, " :: ", "options = ", options, optionsEnum );

                }
                else if ( fieldSchema && fieldSchema.hasOwnProperty( 'ref' ) ) {
                    // This is an objectId. 
                    // Turn it into a select switch for choosing an ID. 
                    let objectTypeRef = fieldSchema?.ref;
                    let options = [];

                    if ( refData && utils.val.isValidArray( refData[ objectTypeRef ], true ) ) {
                        let refIdValue = value;
                        options = refData[ objectTypeRef ].map( ( o, index ) => {
                            if ( o?._id === value ) { refIdValue = value; }
                            return ( {
                                value: o?._id,
                                name: o?.title
                            } );
                        } );

                        // Add a null "None" value to ids. 
                        // ids.push( {
                        //     // value: null,
                        //     value: -1,
                        //     name: 'None'
                        // } );

                        field.fieldType = 'Select';
                        field.dataType = 'ObjectId';
                        field.options = options;
                        // field.trigger = options.index
                        field.value = refIdValue;
                        field.defaultValue = refIdValue;
                        field.path = path;

                        field.onChange = ( e ) => {
                            setFormData( deepPathSet( formData, path, value ) );
                        };
                        // if ( debug === true )
                        // console.log( "field is an ObjectID: objectTypeRef ids = ", ids );
                    }
                }
            }

            else if ( type === String || type === 'String' ) {
                if ( fieldSchema?.enum ) { // schema[ key ]?.enum ) {
                    let values = fieldSchema?.enum?.values;
                    if ( utils.val.isValidArray( values, true ) ) {
                        let opts = values?.map( ( option, index ) => {
                            return ( {
                                name: utils.str.toCapitalCase( option ),
                                value: option,
                            } );
                        } );

                        // Add a null "None" value to opts. 
                        // opts.push( {
                        //     value: 'none',
                        //     name: 'None'
                        // } );

                        field.fieldType = 'Select';
                        field.dataType = 'String';
                        field.options = opts;
                        field.defaultValue = value;

                        field.value = value;
                    }
                }
                else {
                    // Just a regular string value, no enum for selectors. 

                    let maxlength = extractValidationNum( fieldSchema?.maxlength );

                    if ( maxlength && maxlength > 256 ) {
                        field.dataType = 'String';
                        field.fieldType = 'Textarea';
                        // field.maxlength = fieldSchema?.maxlength;
                    }
                    else {
                        field.dataType = 'String';
                        field.fieldType = 'Text';
                        // field.maxlength = fieldSchema?.maxlength;
                    }
                    // field.value = fieldData ? fieldData : '';
                }
                field.path = path;
            }

            else if ( type === Date || type === 'Date' ) { // ( key.toLowerCase().includes( 'date' ) ) {
                field.dataType = 'Date';
                field.value = formatDateTime( new Date( fieldData ) );
                field.defaultValue = fieldSchema?.default
                    ? formatDateTime( new Date( fieldSchema?.default ) )
                    : null;
                field.path = path;
            }

            else if ( type === DateTimeLocal || type === 'DateTimeLocal' ) {
                field.dataType = 'Date';
                field.value = formatDateTime( new Date( fieldData ) );
                field.defaultValue = fieldSchema?.default
                    ? formatDateTime( new Date( fieldSchema?.default ) )
                    : null;
                field.path = path;
            }

            else if ( type === Decimal || type === 'Decimal' ) {

                field.dataType = 'Decimal';
                field.fieldType = 'Number';
                field.value = parseFloat( fieldData );
                field.defaultValue = fieldSchema?.default
                    ? parseFloat( fieldSchema?.default )
                    : null;
                field.path = path;
                field.min = fieldSchema?.min ?? 0;
                field.max = fieldSchema?.max ?? 100;
                field.step = 0.01;
            }

            else if ( ( type === Number || type === 'Number' ) || ( type === 'Int32' ) ) {
                // field.value = [ value ?? 0 ];
                // field.defaultValue = [ value ?? 0 ];
                field.value = value ?? 0;
                field.defaultValue = value ?? 0;
                field.path = path;
                field.min = fieldSchema?.min ?? 0;
                field.max = fieldSchema?.max ?? 100;
                field.step = 0.01;
                field.onChange = ( e ) => {
                    // handleChange( fieldData, key, parseFloat( e.target.value ) );
                    setFormData(
                        deepPathSet(
                            formData,
                            path,
                            Number( e?.target?.value )
                        )
                    );
                };

                if ( type === 'Int32' ) { field.dataType = 'Int32'; }
                else { field.dataType = 'Number'; }

                if ( useSlidersForNumbers ) { field.fieldType = 'Slider'; }
                else { field.fieldType = field.dataType; }
            }

            else if ( type === Boolean || type === 'Boolean' ) {
                let active = fieldData && fieldData.hasOwnProperty( key )
                    ? fieldData[ key ]
                    : false || fieldSchema?.default;
                field.dataType = 'Boolean';
                field.checked = !!active;
                field.value = !!active;
                // field.required = fieldSchema?.required;
                field.defaultChecked = !!active;
                field.path = path;
                field.onChange = ( e ) => {
                    // handleChange( fieldData, key, parseFloat( e.target.value ) );
                    setFormData(
                        deepPathSet(
                            formData,
                            path,
                            !value
                        )
                    );
                };

                if ( useSwitchesForBoolean ) { field.fieldType = 'Switch'; }
                else { field.fieldType = 'Checkbox'; }
            }

            return field;
        }

    };

    if ( utils.val.isObject( schema ) ) {
        if ( debug === true )
            console.log( "input.js :: initializeFormModel :: initialData = ", initialData, " :: ", "with inputs: schema = ", schema, " :: ", "formData = ", formData );
        Object.keys( schema ).forEach( ( key, index ) => {
            // if ( schema.hasOwnProperty( key ) ) {
            let fieldSchema = schema[ key ];
            let fieldData;
            if ( useInitialData ) {
                // Calling function prefers initialData to seed the form. 
                // Check if initial data is valid. 
                if ( utils.val.isObject( initialData )
                    && initialData.hasOwnProperty( key )
                    && utils.val.isValid( initialData[ key ] ) ) {
                    // Use initial data.
                    fieldData = initialData?.[ key ];
                }
                else {
                    // Initial data provided is undefined, use formData as a fallback regardless.
                    fieldData = formData?.[ key ];
                }
            }
            else if ( utils.val.isObject( formData )
                && formData.hasOwnProperty( key )
                && utils.val.isValid( formData[ key ] ) ) {
                fieldData = formData?.[ key ];
            }
            else {
                if ( debug === true )
                    console.log( "input.js :: initializeFormModel :: Initializing values for field = ", fieldSchema, " :: ", "initialData = ", initialData, " :: ", "formData = ", formData );
                if ( utils.val.isValidArray( fieldSchema, true ) ) {
                    fieldData = typeToInitialDefault( fieldSchema[ 0 ], fieldSchema[ 0 ]?.defaultValue ?? null );
                }
                else {
                    fieldData = typeToInitialDefault( fieldSchema, fieldSchema?.defaultValue ?? null );
                }
            }

            if ( debug === true )
                console.log( "input.js :: initializeFormModel :: after data splicing :: initialData = ", initialData, " :: ", "with inputs: schema = ", schema, " :: ", "formData = ", formData, " :: ", "fieldData = ", fieldData );

            let field = processSchema(
                fieldSchema,
                fieldData,
                key,
                schema,
                refData,
                onChange,
                [ key ],
                debug
            );
            model[ key ] = field;
            form.fields.push( field );

            // Create a separate data object JUST for the form's data. Construct via schema and initialData.
            // let fData = {};
            // if ( field?.hasOwnProperty( 'value' ) ) fData.value = field?.value;
            // if ( field?.hasOwnProperty( 'defaultValue' ) ) fData.defaultValue = field?.defaultValue;
            // if ( field?.hasOwnProperty( 'options' ) ) fData.options = field?.options;
            // if ( field?.hasOwnProperty( 'dataType' ) ) fData.dataType = field?.dataType;
            // if ( field?.hasOwnProperty( 'fieldType' ) ) fData.fieldType = field?.fieldType;
            // if ( field?.hasOwnProperty( 'path' ) ) fData.path = field?.path;
            // if ( field?.hasOwnProperty( 'onChange' ) ) fData.onChange = field?.onChange;
            // if ( field?.hasOwnProperty( 'defaultChecked' ) ) fData.defaultChecked = field?.defaultChecked;
            // data[ key ] = fData;
            // if ( field?.hasOwnProperty( 'value' ) ) data[ key ] = field?.value;
            data[ key ] = fieldData;
            if ( !utils.val.isDefined( data[ key ] ) ) {
                if ( field?.hasOwnProperty( 'value' ) ) {
                    data[ key ] = field?.value;
                    // data[ key ] = typeToInitialDefault( field?.elementSchema );
                }
                else if ( field?.hasOwnProperty( 'defaultValue' ) ) {
                    data[ key ] = field?.defaultValue;
                }
                else if ( field?.elementSchema?.hasOwnProperty( 'default' ) ) {
                    data[ key ] = field?.elementSchema?.default;
                }
                else {
                    data[ key ] = typeToInitialDefault( field?.elementSchema );
                }
            }

            if ( debug === true )
                console.log(
                    "input.js",
                    " :: initializeFormModel",
                    " :: At end of process",
                    "\n :: ", "Object.keys( schema )",
                    "\n :: ", "GLOBALS: ",
                    "\n :: ", "schema = ", schema,
                    "\n :: ", "fieldData = ", fieldData,
                    "\n :: ", "formData = ", formData,
                    "\n :: ", "initialData = ", initialData,
                    "\n :: ", "fieldSchema = ", fieldSchema,
                    "\n :: ", "key = ", key,
                    "\n :: ", "refData = ", refData,
                    "\n :: ", "data = ", data,
                    "\n :: ", "path = ", [ key ],
                    "\n :: ", "field = ", field,
                );
            // }
        } );
    }
    return {
        model: model,
        form: form,
        data: data,
    };
};
/**
 * Validates if the provided value is a valid ObjectId.
 * 
 * An ObjectId is considered valid if:
 * - It is an integer.
 * - It is a string of 12 characters.
 * - It is a string of 24 hexadecimal characters (0-9, a-f, A-F).
 *
 * @param {*} objectId The value to validate.
 * @returns {boolean} True if the value is a valid ObjectId, false otherwise.
 */
// // Example usages:
// console.log( validateObjectId( 123456 ) ); // true, because it's an integer
// console.log( validateObjectId( "abcdefghijkl" ) ); // true, 12 characters string
// console.log( validateObjectId( "507f1f77bcf86cd799439011" ) ); // true, 24 hexadecimal characters
// console.log( validateObjectId( "507f1f77bcf86cd7994390" ) ); // false, not 12 or 24 characters
// console.log( validateObjectId( {} ) ); // false, not an integer or string
export function validateObjectId ( objectId ) {
    // Check if the value is an integer.
    if ( typeof objectId === 'number' ) { return true; }

    // If not a string, it cannot be a valid ObjectId.
    if ( typeof objectId !== 'string' ) { return false; }

    // Check if the string is 12 characters long.
    // if ( objectId.length === 12 ) { return true; }

    // Check if the string is 24 characters long and contains only hexadecimal characters.
    if ( objectId.length === 24 && /^[a-fA-F0-9]{24}$/.test( objectId ) ) { return true; }

    // If none of the above conditions are met, return false.
    return false;
}

export const extractValidationEnum = ( input ) => {
    if ( utils.val.isDefined( input ) ) {
        let val;
        // Has a max length variable. 
        if ( utils.val.isValidArray( input, true ) ) {
            // maxLength represented by an array, of layout: [ LENGTH, VALIDATOR_MESSAGE ]
            return input;
        }
        else if ( utils.val.isObject( input ) && input?.hasOwnProperty( 'value' ) ) {
            // maxLength represented by an object, with layout: { value: LENGTH, message: VALIDATOR_MESSAGE }
            return input?.value;
        }
        return null;
    }
    return null;
};

export const extractValidationNum = ( input ) => {
    if ( utils.val.isDefined( input ) ) {
        let val;
        // Has a max length variable. 
        if ( utils.val.isValidArray( input, true ) ) {
            // maxLength represented by an array, of layout: [ LENGTH, VALIDATOR_MESSAGE ]
            if ( utils.val.isNum( input[ 0 ] ) ) { val = input[ 0 ]; }
            else if ( utils.val.isNum( input[ 1 ] ) ) { val = input[ 1 ]; }
        }
        else if ( utils.val.isObject( input ) && input?.hasOwnProperty( 'value' ) ) {
            // maxLength represented by an object, with layout: { value: LENGTH, message: VALIDATOR_MESSAGE }
            val = input?.value;
        }
        return val;
    }
    return null;
};

/**
 * Validates form data against a provided Mongoose-like schema.
 * Recursively traverses deeply nested objects/arrays and validates:
 *  - Required fields are present.
 *  - Field values match the expected type (String, Number, Boolean, Date).
 *  - For strings: verifies enum membership, minimum length, and maximum length.
 *  - For numbers: verifies minimum and maximum values.
 *
 * Each invalid data point is recorded in the returned errors array with the structure:
 * {
 *   fieldName: { error: <error>, message: <message>, value: <current value> }
 * }
 *
 * @param {object} formData The nested form data object to validate.
 * @param {object} schema A plain object representing the schema. Each key maps to a validation object (e.g., { type: String, required: true, ... }),
 *                        a nested schema object, or an array (with the first element defining the schema for array items).
 * @returns {object} An object with the structure { result: boolean, errors: array }.
 */
export function validateFormData ( formData, schema ) {
    const errors = [];

    // Helper: Validate an individual field against its validation descriptor.
    function validateField ( fieldPath, value, schemaDef ) {
        const fieldErrors = [];
        const expectedType = schemaDef.type;

        // Check for required field
        if ( schemaDef.required && ( value === undefined || value === null || value === '' ) ) {
            fieldErrors.push( {
                field: fieldPath,
                error: 'required',
                message: 'Field is required',
                value
            } );
            // If required is missing, we may skip further validations.
            return fieldErrors;
        }

        // Only validate further if a value is provided
        if ( value !== undefined && value !== null ) {
            // Validate type
            if ( expectedType === String && typeof value !== 'string' ) {
                fieldErrors.push( {
                    field: fieldPath,
                    error: 'type',
                    message: 'Expected type string',
                    value
                } );
            } else if ( expectedType === Number && typeof value !== 'number' ) {
                fieldErrors.push( {
                    field: fieldPath,
                    error: 'type',
                    message: 'Expected type number',
                    value
                } );
            } else if ( expectedType === Boolean && typeof value !== 'boolean' ) {
                fieldErrors.push( {
                    field: fieldPath,
                    error: 'type',
                    message: 'Expected type boolean',
                    value
                } );
            } else if ( expectedType === Date ) {
                const date = new Date( value );
                if ( isNaN( date.getTime() ) ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'type',
                        message: 'Expected a valid date',
                        value
                    } );
                }
            }

            // String validations
            if ( expectedType === String && typeof value === 'string' ) {
                if ( schemaDef.enum && Array.isArray( schemaDef.enum ) && !schemaDef.enum.includes( value ) ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'enum',
                        message: 'Value must be one of the allowed options',
                        value
                    } );
                }
                if ( schemaDef.minlength && value.length < schemaDef.minlength ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'minlength',
                        message: `Minimum length is ${ schemaDef.minlength }`,
                        value
                    } );
                }
                if ( schemaDef.maxlength && value.length > schemaDef.maxlength ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'maxlength',
                        message: `Maximum length is ${ schemaDef.maxlength }`,
                        value
                    } );
                }
            }

            // Number validations
            if ( expectedType === Number && typeof value === 'number' ) {
                if ( schemaDef.min !== undefined && value < schemaDef.min ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'min',
                        message: `Minimum value is ${ schemaDef.min }`,
                        value
                    } );
                }
                if ( schemaDef.max !== undefined && value > schemaDef.max ) {
                    fieldErrors.push( {
                        field: fieldPath,
                        error: 'max',
                        message: `Maximum value is ${ schemaDef.max }`,
                        value
                    } );
                }
            }
        }
        return fieldErrors;
    }

    // Recursive traversal function: Walk the formData according to the schema structure.
    function traverse ( data, schemaObj, currentPath = '' ) {
        // Iterate over each key defined in the schema.
        for ( const key in schemaObj ) {
            const newPath = currentPath ? `${ currentPath }.${ key }` : key;
            const schemaField = schemaObj[ key ];
            const fieldValue = data ? data[ key ] : undefined;

            // Check if the schema field is an array (assume an array of items).
            if ( Array.isArray( schemaField ) ) {
                // Schema expects an array; if data isn't an array, record an error.
                if ( !Array.isArray( fieldValue ) ) {
                    errors.push( {
                        [ newPath ]: {
                            error: 'type',
                            message: 'Expected an array',
                            value: fieldValue
                        }
                    } );
                } else {
                    // For each element, validate against the first element in the schema array.
                    const itemSchema = schemaField[ 0 ];
                    for ( let i = 0; i < fieldValue.length; i++ ) {
                        traverse( fieldValue[ i ], itemSchema, `${ newPath }[${ i }]` );
                    }
                }
            }
            // If the schema field is a plain object without a "type" property, it’s a nested schema.
            else if ( typeof schemaField === 'object' && schemaField.type === undefined ) {
                traverse( fieldValue, schemaField, newPath );
            }
            // Otherwise, we have a validation descriptor.
            else {
                const fieldErrors = validateField( newPath, fieldValue, schemaField );
                for ( const err of fieldErrors ) {
                    // Format error as: { fieldName: { error: <error>, message: <message>, value: <value> } }
                    const errObj = {};
                    errObj[ newPath ] = {
                        error: err.error,
                        message: err.message,
                        value: err.value
                    };
                    errors.push( errObj );
                }
            }
        }
    }

    traverse( formData, schema );
    return { result: errors.length === 0, errors };
}

// Like schemaToModel, except that it produces a JSON model specifically geared towards generating a dynamic form.
export const schemaToFormModel = ( {
    schema,
    initializeRandom = false,
    initialValues = {},
    // setFormModel,
} ) => {
    // console.log( `schemaToFormModel called`, `\n :: schema = `, schema, "\n :: initializeRandom = ", initializeRandom, "\n :: initialValues = ", initialValues );
    // A model will be an object, with each key value pair having a nested object.
    let model = {};
    let form = {
        id: "",
        label: "",
        initialData: "",
        onSubmit: () => {
            // onSubmit( formData );
        },
        onChange: () => {
            // onChange( formData );
        },
        fields: [],
    };
    if ( utils.val.isObject( schema ) ) {
        Object.keys( schema ).forEach( ( key, index ) => {
            let fieldSchema = schema[ key ];
            if ( fieldSchema ) {
                let field = {
                    id: key,
                    key: key,
                    label: key,
                    dataType: "",
                    fieldType: "",
                    fieldSchema: fieldSchema,
                    inputProps: {},
                    required: false,
                    // value: category,
                    // disabled: { isFetching },
                    // isInvalid: false,
                    // multiple: "",
                    // unsetOption: "Select Category*",
                    // options: CategoryOptions,
                };
                // let type = value.hasOwnProperty( "type" ) ? value.type : "";
                let dataType = fieldSchema.hasOwnProperty( "instance" ) ? fieldSchema.instance : undefined;
                if ( dataType ) dataType = dataType.toLowerCase();

                let options = utils.ao.deepGetKey( fieldSchema, "options" );
                let enums = utils.ao.deepGetKey( fieldSchema, "enumValues" );
                let defaultValue = utils.ao.has( fieldSchema, "defaultValue" ) ? fieldSchema.defaultValue : undefined;
                let initialValue;
                if ( dataType ) {
                    field.dataType = dataType;
                    field.fieldType = dataType2fieldType( dataType );

                    // TODO :: Make copyKeys(obj1, obj2) function to safely copy keys from one object to another and return the result.
                    if ( utils.val.isObject( options ) ) {
                        // Options are defined, pull out what is useful and plug it into the field model.
                        if ( utils.ao.has( options, "default" ) ) { defaultValue = options.default; }
                        if ( utils.ao.has( options, "required" ) ) { field.required = options.required; }
                        if ( utils.ao.has( options, "disabled" ) ) { field.disabled = options.disabled; }
                        if ( utils.ao.has( options, "enum" ) ) { field.options = options.options; }
                        if ( utils.ao.has( options, "min" ) ) { field.min = options.min; }
                        if ( utils.ao.has( options, "max" ) ) { field.max = options.max; }
                    }

                    if ( utils.val.isValidArray( enums, true ) ) {
                        // We're provided a limited list of options to choose from, thus this field must be either a select field (if instance is non-array) or a select-multiple / radio button array (if instance is an array of any type)
                        // Build an options array in the correct format for a select field.
                        let optionstemp = [ ...enums ];
                        field.fieldType = "select";
                        field.multiple = [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( dataType );
                        field.inputProps.multiple = [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( dataType );
                        field.inputProps.options = optionstemp;

                        if ( initializeRandom && utils.val.isValidArray( enums, true ) ) {
                            initialValue = enums[ Math.floor( Math.random() * enums.length ) ];
                        }
                    } else {
                        field.fieldType = dataType2fieldType( dataType );
                    }

                    // Figure out which initial value to go with.
                    if ( initializeRandom ) {
                        if ( utils.val.isValidArray( enums, true ) ) {
                            initialValue = enums[ Math.floor( Math.random() * enums.length ) ];
                        } else {
                            initialValue = generateRandom( dataType, 10, 10 );
                        }
                    } else if ( utils.ao.has( initialValues, key ) ) {
                        // We're given an initial value to work with.
                        let val = initialValues[ key ];
                        if ( val ) initialValue = initialValues[ key ];
                        else initialValue = typeToInitialDefault( dataType, defaultValue );
                    } else {
                        // Try to glean an initial value from the dataType itself.
                        initialValue = typeToInitialDefault( dataType, defaultValue );
                    }
                    model[ key ] = initialValue;
                    field.inputProps.defaultValue = initialValue;

                    form.fields.push( field );
                }
            }
        } );
    }
    // setFormModel( model );
    return {
        model: model,
        form: form,
    };
};

export const dataToModel = ( {
    fieldData,
    setFormData,
    onChange,
} ) => {
    // Extract all keys from the input object and build a formModelJSON object.
    let dataModel = [];
    let obj = {
        ...fieldData,
        enabled: true,
    };
    if ( utils.val.isObject( fieldData ) ) {
        Object.keys( obj ).forEach( ( key, index ) => {
            let value = obj[ key ];
            let fieldType = utils.val.isString( value )
                ? `text`
                : utils.val.isNumber( value )
                    ? `number`
                    : utils.val.isBool( value )
                        ? `checkbox`
                        : `text`;
            dataModel.push( {
                name: key,
                type: `${ fieldType }`,
                label: key,
                inputProps: {
                    defaultValue: value,
                    // placeholder: key.toString().capitalize(),
                },
                onChange: ( e ) => {
                    if ( onChange ) { onChange( e ); }
                    setFormData(
                        utils.ao.deepFindSet(
                            { ...fieldData },
                            key,
                            // e.target.value.toString(),
                            fieldType === `checkbox`
                                ? (
                                    e.target.checked
                                        ? ( e.target.checked === true )
                                        : ( false )
                                )
                                : ( e.target.value ),
                        ),
                    );
                },
            } );
        } );
    }

    return dataModel;
};


// To make this work, we're going to need a way to update values deep inside the data array stored in state.
export const constructSchemaFormFields = ( {
    fieldData,
    setFormData,
    onChange,
} ) => {
    let formFields = [];
    if ( utils.val.isObject( fieldData ) ) {
        // Valid fieldData. Pull out the form data.
        let form = fieldData.form;
        let formModels = form.model;
        let fieldModels = form.fields;
        if ( utils.val.isValidArray( fieldModels, true ) ) {
            // Valid fieldData. Proceed.
            fieldModels.forEach( ( field, index ) => {
                let key = field.key;
                let fieldType = field.fieldType;
                let dataType = field.dataType;
                let inputProps = field.inputProps;

                formFields.push( buildSchemaField( {
                    field,
                    setFormData,
                    onChange,
                } ) );
            } );
        }
    }
    return formFields;
};

export const buildSchemaField = ( {
    fieldData,
    setFormData,
    onChange,
} ) => {
    let key = fieldData.key;
    let fieldType = fieldData.fieldType;
    let dataType = fieldData.dataType;
    let inputProps = fieldData.inputProps;

    let value = inputProps.hasOwnProperty( "defaultValue" ) ? inputProps.defaultValue : inputProps.hasOwnProperty( "value" ) ? inputProps.value : undefined;
    if ( value === undefined || value === null ) value = datahelper.typeToInitialDefault( dataType );
    // Turns an fieldData into a field. Simple as.
    if ( [ "array", "object", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) || fieldType === "data" ) {
        // Dealing with a complex, possibly nested data fieldData type.
        return (
            <Input.Data
                onChange={ ( e ) => {
                    let temp = { ...formData };

                    temp = JSON.parse( JSON.stringify( formData ) ); // Make a deep copy because of read-only property errors.

                    let updatedData = utils.ao.deepFindSet(
                        // fieldData,
                        temp,
                        key,
                        e.target.value, // .toString(),
                    );
                    if ( onChange ) {
                        onChange( e, key, value );
                    }
                    setFormData( updatedData );
                } }
                setData={ ( key, input ) => {
                    let temp = { ...formData };

                    let updatedData = utils.ao.deepFindSet(
                        // fieldData,
                        temp,
                        key,
                        input,
                    );

                    // setFormData(utils.ao.findAndSetObject(fieldData, key, input));
                    setFormData( updatedData );
                } }
                datakey={ key }
                data={ value }
                datamodel={ formData }
                dataType={ dataType }
                fieldType={ fieldType }
                // value={value}
                // defaultValue={value}
                inputProps={ inputProps }
                // inputProps={{
                // 	// value: value,
                // 	defaultValue: value,
                // 	// checked: value === true,
                // 	// defaultChecked: value === true,
                // }}
                label={ key }
                id={ key }
                name={ key }
                disabled={ false }
                required={ false }
                placeholder={ key }
                classes={ `input-field-data` }
                fieldStyles={ fieldStyles }
                labelStyles={ labelStyles }
                inputStyles={ inputStyles }
            />
        );
    } else if ( [ "string", "number", "boolean", "date" ].includes( dataType ) ) {
        // Dealing with a scalar data type.

        if ( fieldType === "select" ) {
            // let options = fieldData.options;
            // Build an options array in the correct format for a select field.
        } else if ( [ "date", "datetime", "datetime-local" ].includes( fieldType ) ) {
            // Adjust the formatting of the input value.
            // let date = utils.time.formatDate(inputProps.defaultValue); // new Date( inputProps.defaultValue );

            // 2023-04-17T16:47:12.141Z
            let storeddate = new Date( inputProps.defaultValue );
            let converteddate = storeddate.getFullYear() + "-" + parseInt( storeddate.getMonth() + 1 ) + "-" + storeddate.getDate();
            let reverteddate = new Date( converteddate.split( "-" ) ).getTime();

            // inputProps.defaultValue = converteddate;
            inputProps.defaultValue = utils.time.formatTimestampDDMMYYYY( inputProps.defaultValue );
        }

        return (
            <Input
                fieldType={ fieldType }
                inputProps={ inputProps }
                label={ key }
                id={ key }
                name={ key }
                onChange={ ( e ) => {
                    let temp = { ...formData };

                    let updatedData = utils.ao.deepFindSet(
                        temp,
                        key,
                        datahelper.formatInputValue( e, fieldType ),
                    );
                    onChange( updatedData );
                    setFormData( updatedData );
                } }
                disabled={ false }
                required={ false }
                placeholder={ key }
                fieldStyles={ fieldStyles }
                labelStyles={ labelStyles }
                inputStyles={ inputStyles }
            />
        );
    }
};



export const validateSubmittedData = ( data, schema, isCloned = false, isNew = false, debug = false ) => {
    let validatedData = { ...data };
    Object.keys( data )?.forEach( ( key ) => {
        let value = data?.[ key ];
        if ( debug === true )
            console.log( "validateSubmittedData :: key = ", key, " :: ", "value = \"", value, "\"" );
        // if ( utils.val.isTruthy( value ) ) {
        if ( utils.val.isDefined( value ) ) {
            // Get the schema for this key. 
            let isObjectId = false;
            if ( schema && utils.ao.has( schema, key ) ) {
                let keySchema = schema?.[ key ];
                let schemaType = utils.ao.deepGetKey( keySchema, 'type' );
                if ( debug === true )
                    console.log( "validateSubmittedData :: keySchema = ", keySchema, " :: ", "schemaType = ", schemaType );
                if ( schemaType === 'ObjectId' ) isObjectId = true;

                if ( isObjectId ) {
                    if ( ( isCloned || isNew ) && key === '_id' ) {
                        // Set to null so the server doesn't try to cast an invalid value to ObjectId. 
                        // validatedData[ key ] = null;
                        validatedData = utils.ao.removeKey( validatedData, key );
                    }
                    else {
                        // if ( value !== '' ) {
                        if ( !isInvalid( value ) ) {
                            validatedData[ key ] = value;
                        }
                        else {
                            validatedData = utils.ao.removeKey( validatedData, key );
                        }
                    }
                }
            }
            else {
                // No schema defined.
                // validatedData[ key ] = null;
                // utils.ao.removeKey( validatedData, key );
                validatedData[ key ] = value;
            }
        }
        else {
            // Value is null, undefined, or NaN.
            // validatedData[ key ] = null;
            // console.log( "validateData :: Removing key: ", key, " with current value: ", value );
            validatedData = utils.ao.removeKey( validatedData, key );
        }
        // if ( [ '_id', "userId", "workspaceId", "todoList", "subtaskIds", "parentTaskId", "groupId", "fileIds", "parentFolderId" ].includes( key ) ) {
        //     // This has to be an ObjectId. 
        //     if ( value && utils.val.isString( value ) && value === "" ) {
        //         // 
        //     }
        // }
    } );
    // console.log( "validateData() :: validatedData = ", validatedData );
    return validatedData;
};

// Backed up 06-26-25
export const validateSubmittedData2 = ( data, schema, isCloned = false, isNew = false ) => {
    let validatedData = { ...data };
    Object.keys( data )?.forEach( ( key ) => {
        let value = data?.[ key ];
        // console.log( "validateData :: key = ", key, " :: ", "value = \"", value, "\"" );
        // if ( utils.val.isTruthy( value ) ) {
        if ( utils.val.isDefined( value ) ) {
            // Get the schema for this key. 
            let isObjectId = false;
            if ( schema && utils.ao.has( schema, key ) ) {
                let keySchema = schema?.[ key ];
                let schemaType = utils.ao.deepGetKey( keySchema, 'type' );
                console.log( "validateData :: keySchema = ", keySchema, " :: ", "schemaType = ", schemaType );
                if ( schemaType === 'ObjectId' ) isObjectId = true;

                if ( ( isCloned || isNew ) && isObjectId && key === '_id' ) {
                    // Set to null so the server doesn't try to cast an invalid value to ObjectId. 
                    // validatedData[ key ] = null;
                    validatedData = utils.ao.removeKey( validatedData, key );
                }
                else {
                    validatedData[ key ] = value;
                }
            }
            else {
                // No schema defined.
                // validatedData[ key ] = null;
                // utils.ao.removeKey( validatedData, key );
                validatedData[ key ] = value;
            }
        }
        else {
            // Value is null, undefined, or NaN.
            // validatedData[ key ] = null;
            // console.log( "validateData :: Removing key: ", key, " with current value: ", value );
            validatedData = utils.ao.removeKey( validatedData, key );
        }
        // if ( [ '_id', "userId", "workspaceId", "todoList", "subtaskIds", "parentTaskId", "groupId", "fileIds", "parentFolderId" ].includes( key ) ) {
        //     // This has to be an ObjectId. 
        //     if ( value && utils.val.isString( value ) && value === "" ) {
        //         // 
        //     }
        // }
    } );
    // console.log( "validateData() :: validatedData = ", validatedData );
    return validatedData;
};

