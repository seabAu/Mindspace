// Validation utility for MongoDB schema
const validateField = ( field, value, schema ) => {
    const errors = [];

    // Check required fields
    if ( schema.required && !value && value !== false && value !== 0 ) {
        errors.push( `${ field } is required` );
    }

    // Check string length
    if ( typeof value === "string" && schema.maxlength ) {
        const max = Array.isArray( schema.maxlength ) ? schema.maxlength[ 0 ] : schema.maxlength;
        if ( value.length > max ) {
            const message = Array.isArray( schema.maxlength )
                ? schema.maxlength[ 1 ]
                : `${ field } must be less than ${ max } characters`;
            errors.push( message );
        }
    }

    // Check enum values
    if ( schema.enum && value ) {
        const enumValues = schema.enum.values || schema.enum;
        if ( Array.isArray( enumValues ) && !enumValues.includes( value ) ) {
            const message = schema.enum.message || `${ value } is not a valid option for ${ field }`;
            errors.push( message );
        }
    }

    // Check type
    if ( schema.type && value !== undefined && value !== null ) {
        let typeError = false;

        switch ( schema.type.name || schema.type ) {
            case "String":
                typeError = typeof value !== "string";
                break;
            case "Number":
                typeError = typeof value !== "number" || isNaN( value );
                break;
            case "Boolean":
                typeError = typeof value !== "boolean";
                break;
            case "Date":
                typeError = !( value instanceof Date ) && isNaN( new Date( value ).getTime() );
                break;
            case "Array":
                typeError = !Array.isArray( value );
                break;
            case "Object":
                typeError = typeof value !== "object" || value === null || Array.isArray( value );
                break;
        }

        if ( typeError ) {
            errors.push( `${ field } must be a valid ${ schema.type.name || schema.type }` );
        }
    }

    return errors;
};

// Validate an entire item against the schema
export const validateItem = ( item ) => {
    const errors = {};

    // Define schema based on MongoDB model
    const schema = {
        _metadata: {
            type: "String",
            maxlength: [ 4096, "The _metadata value must be less than 4096 characters" ],
        },
        timeStamp: {
            type: "Date",
        },
        endDate: {
            type: "Date",
        },
        dataKey: {
            type: "String",
            required: [ true, "A valid setting key name must be provided." ],
            maxlength: [ 128, "The setting key name must be less than 128 characters" ],
        },
        entrytype: {
            type: "String",
        },
        dataType: {
            type: "String",
            enum: {
                values: [
                    "String",
                    "Number",
                    "Integer",
                    "Decimal",
                    "Boolean",
                    "Date",
                    "DateTime",
                    "DateTimeLocal",
                    "Object",
                    "Array",
                    "ObjectId",
                    "Mixed",
                    "Custom",
                ],
                message: "{VALUE} is not supported",
            },
        },
        // dataValue is validated based on dataType
    };

    // Validate each field
    Object.keys( schema ).forEach( ( field ) => {
        if ( field in item ) {
            const fieldErrors = validateField( field, item[ field ], schema[ field ] );
            if ( fieldErrors.length > 0 ) {
                errors[ field ] = fieldErrors;
            }
        }
    } );

    // Validate dataValue based on dataType
    if ( item.dataType ) {
        const dataValueErrors = [];

        switch ( item.dataType ) {
            case "String":
                if ( item.dataValue !== undefined && typeof item.dataValue !== "string" ) {
                    dataValueErrors.push( "Data value must be a string" );
                }
                break;
            case "Number":
            case "Integer":
            case "Decimal":
                if ( item.dataValue !== undefined && ( typeof item.dataValue !== "number" || isNaN( item.dataValue ) ) ) {
                    dataValueErrors.push( "Data value must be a number" );
                }
                break;
            case "Boolean":
                if ( item.dataValue !== undefined && typeof item.dataValue !== "boolean" ) {
                    dataValueErrors.push( "Data value must be a boolean" );
                }
                break;
            case "Date":
            case "DateTime":
            case "DateTimeLocal":
                if ( item.dataValue !== undefined && item.dataValue !== null ) {
                    const date = new Date( item.dataValue );
                    if ( isNaN( date.getTime() ) ) {
                        dataValueErrors.push( "Data value must be a valid date" );
                    }
                }
                break;
            case "Array":
                if ( item.dataValue !== undefined && !Array.isArray( item.dataValue ) ) {
                    dataValueErrors.push( "Data value must be an array" );
                }
                break;
            case "Object":
                if (
                    item.dataValue !== undefined &&
                    ( typeof item.dataValue !== "object" || item.dataValue === null || Array.isArray( item.dataValue ) )
                ) {
                    dataValueErrors.push( "Data value must be an object" );
                }
                break;
        }

        if ( dataValueErrors.length > 0 ) {
            errors.dataValue = dataValueErrors;
        }
    }

    // Validate date range if endDate is present
    if ( item.timeStamp && item.endDate ) {
        if ( !( item.timeStamp instanceof Date ) ) {
            item.timeStamp = new Date( item.timeStamp );
        }
        if ( !( item.endDate instanceof Date ) ) {
            item.endDate = new Date( item.endDate );
        }

        if ( item.endDate < item.timeStamp ) {
            if ( !errors.endDate ) errors.endDate = [];
            errors.endDate.push( "End date must be after start date" );
        }
    }

    return errors;
};

export const isItemValid = ( item ) => {
    const errors = validateItem( item );
    return Object.keys( errors ).length === 0;
};
