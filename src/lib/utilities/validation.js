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
        timestamp: {
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
        entryType: {
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
    if ( item.timestamp && item.endDate ) {
        if ( !( item.timestamp instanceof Date ) ) {
            item.timestamp = new Date( item.timestamp );
        }
        if ( !( item.endDate instanceof Date ) ) {
            item.endDate = new Date( item.endDate );
        }

        if ( item.endDate < item.timestamp ) {
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

/**
 * Validates an email address using a comprehensive regular expression.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
export function isValidEmail ( email ) {
    if ( !email || typeof email !== "string" ) return false;

    // Remove whitespace and convert to lowercase
    email = email.trim().toLowerCase();

    // Check for basic format and length constraints
    if ( email.length < 5 || email.length > 254 ) return false;

    // Enhanced regex for email validation
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if ( !emailRegex.test( email ) ) return false;

    // Additional checks for common issues
    const parts = email.split( "@" );
    if ( parts.length !== 2 ) return false;

    const [ localPart, domainPart ] = parts;

    // Local part checks
    if ( localPart.length > 64 ) return false;
    if ( localPart.startsWith( "." ) || localPart.endsWith( "." ) ) return false;
    if ( localPart.includes( ".." ) ) return false;

    // Domain part checks
    if ( domainPart.length > 253 ) return false;
    if ( domainPart.startsWith( "-" ) || domainPart.endsWith( "-" ) ) return false;
    if ( !domainPart.includes( "." ) ) return false;

    return true;
}

/**
 * Validates a phone number, supporting multiple international formats.
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
export function isValidPhoneNumber ( phone ) {
    if ( !phone || typeof phone !== "string" ) return false;

    // Remove all whitespace, dashes, parentheses, and dots
    const cleaned = phone.replace( /[\s\-$$$$.+]/g, "" );

    // Check if it contains only digits after cleaning
    if ( !/^\d+$/.test( cleaned ) ) return false;

    // Check length constraints (7-15 digits is typical for international numbers)
    if ( cleaned.length < 7 || cleaned.length > 15 ) return false;

    // For E.164 format validation (if original includes +)
    if ( phone.trim().startsWith( "+" ) ) {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test( phone.replace( /[\s\-$$$$.]/g, "" ) );
    }

    // For US numbers (10 or 11 digits)
    if ( cleaned.length === 10 || ( cleaned.length === 11 && cleaned.startsWith( "1" ) ) ) {
        return true;
    }

    // For other international numbers (7-15 digits)
    return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Formats a phone number for display purposes.
 * @param {string} phone - The phone number to format.
 * @returns {string} - The formatted phone number.
 */
export function formatPhoneNumber ( phone ) {
    if ( !phone ) return "";

    const cleaned = phone.replace( /[{}[\]()\s\-$$$$.+]/g, "" );

    if ( cleaned.length <= 12 ) {
        // Format US numbers
        if ( cleaned.length === 3 ) {
            return `(${ cleaned.slice( 0, 3 ) }) `;
        }

        if ( cleaned.length === 6 ) {
            return `(${ cleaned.slice( 0, 3 ) }) ${ cleaned.slice( 3, 6 ) }-`;
        }

        if ( cleaned.length === 10 ) {
            return `(${ cleaned.slice( 0, 3 ) }) ${ cleaned.slice( 3, 6 ) }-${ cleaned.slice( 6, 10 ) }`;
        }

        // Format US numbers with country code
        if ( cleaned.length === 11 && cleaned.startsWith( "1" ) ) {
            return `+1 (${ cleaned.slice( 1, 4 ) }) ${ cleaned.slice( 4, 7 ) }-${ cleaned.slice( 7, 11 ) }`;
        }
    }
    else {
        // For international numbers, just add + if not present
        if ( cleaned.trim().startsWith( "+" ) ) {
            return cleaned.trim();
        }
    }

    return `+${ cleaned }`;
}

/**
 * Provides user-friendly error messages for validation failures.
 * @param {string} type - The type of validation ('email' or 'phone').
 * @param {string} value - The value that failed validation.
 * @returns {string} - A descriptive error message.
 */
export function getValidationErrorMessage ( type, value ) {
    if ( !value || !value.trim() ) {
        return `${ type === "email" ? "Email address" : "Phone number" } is required.`;
    }

    if ( type === "email" ) {
        if ( value.length < 5 ) return "Email address is too short.";
        if ( value.length > 254 ) return "Email address is too long.";
        if ( !value.includes( "@" ) ) return "Email address must contain @ symbol.";
        if ( value.startsWith( "." ) || value.endsWith( "." ) ) return "Email address cannot start or end with a period.";
        if ( value.includes( ".." ) ) return "Email address cannot contain consecutive periods.";
        return "Please enter a valid email address.";
    }

    if ( type === "phone" ) {
        const cleaned = value.replace( /[\s\-$$$$.+]/g, "" );
        if ( !/^\d+$/.test( cleaned ) )
            return "Phone number can only contain digits, spaces, dashes, parentheses, and + symbol.";
        if ( cleaned.length < 7 ) return "Phone number is too short (minimum 7 digits).";
        if ( cleaned.length > 15 ) return "Phone number is too long (maximum 15 digits).";
        return "Please enter a valid phone number.";
    }

    return "Invalid input.";
}


export const validatePassword = ( password, specialChars ) => {
    const errors = [];

    // Check minimum length
    if ( !password || password.length < 6 ) {
        errors.push( "Password must be at least 6 characters long" );
    }

    // Check for lowercase letter
    if ( !/[a-z]/.test( password ) ) {
        errors.push( "Password must contain at least one lowercase letter" );
    }

    // Check for uppercase letter (recomme ded but not required)
    const hasUpper = /[A-Z]/.test( password );

    // Check for number (recommended but not required)
    const hasNumber = /\d/.test( password );

    // Check for special characters using the exact set specified: !@#$%^&*(),.-_
    const hasSpecial = (
        specialChars && specialChars !== ""
            ? specialChars.test( password )
            : /[!@#$%^&*(),.\-_]/.test( password )
    );

    // For a life management app, we're more lenient but still encourage good practices
    // We only require length and lowercase, but recommend the others
    if ( !hasUpper && !hasNumber && !hasSpecial ) {
        errors.push(
            "Password should contain at least one uppercase letter, number, or special character (!@#$%^&*(),.-_) for better security",
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};



export const calculatePasswordStrength = ( password ) => {
    if ( !password ) return { score: 0, label: "", color: "" };

    let score = 0;
    const checks = {
        length: password.length >= 6,
        hasLower: /[a-z]/.test( password ),
        hasUpper: /[A-Z]/.test( password ),
        hasNumber: /\d/.test( password ),
        hasSpecial: /[!@#$%^&*(),.-_]/.test( password ),
    };

    // More lenient scoring for life management app
    if ( checks.length ) score += 30;
    if ( checks.hasLower ) score += 20;
    if ( checks.hasUpper ) score += 20;
    if ( checks.hasNumber ) score += 15;
    if ( checks.hasSpecial ) score += 15;

    if ( score >= 80 ) return { score, label: "Strong", color: "bg-green-500" };
    if ( score >= 60 ) return { score, label: "Good", color: "bg-yellow-500" };
    if ( score >= 30 ) return { score, label: "Fair", color: "bg-orange-500" };
    return { score, label: "Weak", color: "bg-red-500" };
};

export const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*(),.-_";

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = "";

    // Ensure at least one character from each category
    password += lowercase[ Math.floor( Math.random() * lowercase.length ) ];
    password += uppercase[ Math.floor( Math.random() * uppercase.length ) ];
    password += numbers[ Math.floor( Math.random() * numbers.length ) ];
    password += symbols[ Math.floor( Math.random() * symbols.length ) ];

    // Fill the rest randomly (8-12 characters total)
    const targetLength = Math.floor( Math.random() * 5 ) + 8;
    for ( let i = password.length; i < targetLength; i++ ) {
        password += allChars[ Math.floor( Math.random() * allChars.length ) ];
    }

    // Shuffle the password
    return password
        .split( "" )
        .sort( () => Math.random() - 0.5 )
        .join( "" );
};
