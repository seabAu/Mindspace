// This is for laying out various global types to be used all over the site.
// Work in progress.
export const validInputTypes = [
    'button',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
    'select',
];
export const fieldTypes = {
    button: 'button',
    checkbox: 'checkbox',
    color: 'color',
    date: 'date',
    datetimeLocal: 'datetime-local',
    email: 'email',
    file: 'file',
    hidden: 'hidden',
    image: 'image',
    month: 'month',
    number: 'number',
    password: 'password',
    radio: 'radio',
    range: 'range',
    reset: 'reset',
    search: 'search',
    submit: 'submit',
    tel: 'tel',
    text: 'text',
    time: 'time',
    url: 'url',
    week: 'week',
    select: 'select',
};

// INPUT TYPES
export const INPUT_TOGGLE = 'toggle';
export const INPUT_TOGGLE_GROUP = 'toggle_group';
export const INPUT_SWITCH = 'switch';
export const INPUT_CHECKBOX = 'checkbox';
export const INPUT_SELECT = 'select';
export const INPUT_RADIO_GROUP = 'select_radio';
export const INPUT_RADIO = 'radio';
export const INPUT_TEXT = 'text';
export const INPUT_TEXTAREA = 'textarea';
export const INPUT_ARRAY = 'array';
export const INPUT_OBJECT = 'object';
export const INPUT_DATE = 'date';
export const INPUT_DATE_TIME = 'datetime';
export const INPUT_DATE_DAY = 'dateday';
export const INPUT_DATE_WEEK = 'dateweek';
export const INPUT_DATE_MONTH = 'datemonth';
export const INPUT_DATE_TIME_LOCAL = 'datetimelocal';
export const INPUT_DATE_SELECT = 'date_select'; // Date picker variant with a select dropdown.
export const INPUT_SLIDER = 'slider';
export const INPUT_RANGE = 'range';
export const INPUT_NUMBER = 'number';
export const INPUT_EMAIL = 'email';
export const INPUT_PASSWORD = 'password';
export const INPUT_PASSWORD_CONFIRM = 'password'; // Validation check variant of password.
export const INPUT_OTP = 'password_otp';
export const INPUT_FILE = 'file';
export const INPUT_MEDIA = 'media';
export const INPUT_BUTTON = 'button';
export const INPUT_BUTTON_GROUP = 'buttongroup';
export const INPUT_BUTTON_SUBMIT = 'submit';

// DATA TYPES
export const TYPE_STRING = 'String';
export const TYPE_DATE = 'Date';
export const TYPE_DATE_DAY = 'DateDay';
export const TYPE_DATE_WEEK = 'DateWeek';
export const TYPE_DATE_MONTH = 'DateMonth';
export const TYPE_DATE_TIME = 'DateTime';
export const TYPE_DATE_TIME_LOCAL = 'DateTimeLocal';
export const TYPE_DECIMAL = 'Decimal';
export const TYPE_NUMBER = 'Number';
export const TYPE_BOOLEAN = 'Boolean';
export const TYPE_OBJECT_ID = 'ObjectId';
export const TYPE_OBJECT = 'Object';
export const TYPE_ARRAY_OF_OBJECT = '[Object]'; // 'ObjectArray';
export const TYPE_ARRAY_OF_OBJECT_ID = '[ObjectId]';
export const TYPE_ARRAY_OF_STRING = '[String]';
export const TYPE_ARRAY_OF_DATE = '[Date]';
export const TYPE_ARRAY_OF_DATE_TIME_LOCAL = '[DateTimeLocal]';
export const TYPE_ARRAY_OF_NUMBER = '[Number]';
export const TYPE_ARRAY_OF_DECIMAL = '[Decimal]';
export const TYPE_ARRAY_OF_BOOLEAN = '[Boolean]';
export const TYPE_ARRAY_OF_ARRAY = '[Array]';
export const TYPE_ARRAY = 'Array';
export const TYPE_BUTTON = 'Button';

export const DATA_TYPES = {
    STRING: TYPE_STRING,
    DATE: TYPE_DATE,
    TIME: TYPE_DATE_TIME,
    DATE_TIME_LOCAL: TYPE_DATE_TIME_LOCAL,
    DECIMAL: TYPE_DECIMAL,
    NUMBER: TYPE_NUMBER,
    BOOLEAN: TYPE_BOOLEAN,
    OBJECT_ID: TYPE_OBJECT_ID,
    OBJECT: TYPE_OBJECT,
    ARRAY_OF_OBJECT: TYPE_ARRAY_OF_OBJECT,
    ARRAY_OF_OBJECT_ID: TYPE_ARRAY_OF_OBJECT_ID,
    ARRAY_OF_STRING: TYPE_ARRAY_OF_STRING,
    ARRAY_OF_DATE: TYPE_ARRAY_OF_DATE,
    ARRAY_OF_DATE_TIME_LOCAL: TYPE_ARRAY_OF_DATE_TIME_LOCAL,
    ARRAY_OF_NUMBER: TYPE_ARRAY_OF_NUMBER,
    ARRAY_OF_DECIMAL: TYPE_ARRAY_OF_DECIMAL,
    ARRAY_OF_BOOLEAN: TYPE_ARRAY_OF_BOOLEAN,
    ARRAY_OF_ARRAY: TYPE_ARRAY_OF_ARRAY,
    ARRAY: TYPE_ARRAY,
    BUTTON: TYPE_BUTTON,
};

// VALID INPUT TYPES per the requisite type of data involved.
// Refer to this for options: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
export const VALID_INPUT_TYPES = [
    {
        type: DATA_TYPES.STRING,
        inputs: [
            INPUT_TEXT,
            INPUT_TEXTAREA,
            INPUT_SELECT,
            INPUT_RADIO_GROUP,
            INPUT_EMAIL,
            INPUT_PASSWORD,
            INPUT_PASSWORD_CONFIRM,
            INPUT_OTP,
        ],
    },
    {
        type: DATA_TYPES.TIME,
        inputs: [
            INPUT_DATE,
            INPUT_DATE_TIME,
            INPUT_DATE_DAY,
            INPUT_DATE_WEEK,
            INPUT_DATE_MONTH,
            INPUT_DATE_TIME_LOCAL,
            INPUT_DATE_SELECT,
        ],
    },
    {
        type: DATA_TYPES.DATE,
        inputs: [
            INPUT_DATE,
            INPUT_DATE_TIME,
            INPUT_DATE_DAY,
            INPUT_DATE_WEEK,
            INPUT_DATE_MONTH,
            INPUT_DATE_TIME_LOCAL,
            INPUT_DATE_SELECT,
        ],
    },
    {
        type: DATA_TYPES.DATE_TIME_LOCAL,
        inputs: [
            INPUT_DATE,
            INPUT_DATE_TIME,
            INPUT_DATE_DAY,
            INPUT_DATE_WEEK,
            INPUT_DATE_MONTH,
            INPUT_DATE_TIME_LOCAL,
            INPUT_DATE_SELECT,
        ],
    },
    {
        type: DATA_TYPES.DECIMAL,
        inputs: [
            INPUT_SLIDER,
            INPUT_NUMBER,
            INPUT_RANGE,
        ],
    },
    {
        type: DATA_TYPES.NUMBER,
        inputs: [
            INPUT_SLIDER,
            INPUT_NUMBER,
            INPUT_RANGE,
        ],
    },
    {
        type: DATA_TYPES.BOOLEAN,
        inputs: [
            INPUT_SWITCH,
            INPUT_CHECKBOX,
            INPUT_RADIO,
            INPUT_TOGGLE,
            INPUT_TOGGLE_GROUP,
        ],
    },
    {
        type: DATA_TYPES.OBJECT_ID,
        inputs: [
            INPUT_FILE,
            INPUT_MEDIA
        ],
    },
    {
        type: DATA_TYPES.OBJECT,
        inputs: [
            INPUT_OBJECT,
            INPUT_FILE,
            INPUT_MEDIA
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_OBJECT,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_OBJECT_ID,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_STRING,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_DATE,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_DATE_TIME_LOCAL,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_NUMBER,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_DECIMAL,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_BOOLEAN,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY_OF_ARRAY,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.ARRAY,
        inputs: [
            INPUT_ARRAY
        ],
    },
    {
        type: DATA_TYPES.BUTTON,
        inputs: [
            INPUT_BUTTON,
            INPUT_BUTTON_GROUP,
            INPUT_BUTTON_SUBMIT
        ],
    },
];



// Custom type constructors
export function ObjectArray ( arr = [] ) {
    return Object.setPrototypeOf( arr, ObjectArray.prototype );
}
ObjectArray.prototype = Object.create( Array.prototype );
ObjectArray.prototype.constructor = ObjectArray;

export function DateTimeLocal ( date = new Date() ) {
    if ( !( this instanceof DateTimeLocal ) ) {
        return new DateTimeLocal( date );
    }
    this.date = new Date( date );
    this.toISOString = function () {
        return this.date.toISOString().slice( 0, 16 );
    };
}

export function Decimal ( value = 0 ) {
    if ( !( this instanceof Decimal ) ) {
        return new Decimal( value );
    }
    this.value = Number.parseFloat( value );
}

export function Integer ( value = 0 ) {
    if ( !( this instanceof Number ) && Number.isSafeInteger( this.value ) ) {
        return Math.floor( new Number( value ) );
    }
    this.value = Math.floor( Number.parseFloat( value ) );
}

export function ObjectId ( id ) {
    this.id = id;
    return this?.id;
}
