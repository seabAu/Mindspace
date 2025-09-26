import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
    useId,
} from 'react';
import { Container } from 'postcss';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, Clock, Sun, Moon, Menu, ArrowBigUp, ArrowBigDown, Edit, Delete, StarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorPicker from '@/components/Form/color-picker';
import * as utils from 'akashatools';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { convertCamelCaseToSentenceCase } from '@/lib/utilities/string';
import { buildIdSelectInput, buildSelect } from '@/lib/utilities/input';
import { Textarea } from '@/components/ui/textarea';
import { twMerge } from 'tailwind-merge';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from "framer-motion";
import useGlobalStore from '@/store/global.store';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import { FaStar } from 'react-icons/fa';
// import PolarGantt from './PolarGantt';

const InputField = ( props ) => {
    const {
        fieldSchema,
        fieldModel,
        fieldKey,
        key,
        uuid,
        initialData,
        path,
        label,
        value,
        id,
        defaultValue,
        inputProps,
        onChange, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        labelClassName = '',
        inputClassName = '',
        layout,
        children,
    } = props;

    let inputContainerId = `form-generator-field-input-${ path
        && Array.isArray( path )
        && path?.length > 0
        ? path.join( '-' )
        : useId()
        }`;
    let inputContainerClassNames = twMerge(
        // Base styles
        `flex flex-row w-full h-fit flex`,
        // 'items-start justify-start px-1 py-1',
        'text-xs font-semibold transition-colors focus:outline-none focus:ring-1 text-left gap-1',
        // ' flex flex-row justify-center items-center h-full text-left content-stretch',

        // Border basics
        `border-b-${ layout?.border?.width ? layout?.border?.width[ 0 ] : 0 } border-l-${ layout?.border?.width ? layout?.border?.width[ 1 ] : 0 } border-t-${ layout?.border?.width ? layout?.border?.width[ 2 ] : 0 }border-r-${ layout?.border?.width ? layout?.border?.width[ 3 ] : 0 }`,

        // Light-mode focus state
        `focus:ring-${ layout?.border?.color ? layout?.border?.color : 'black' }-500`,

        // Dark-mode focus state
        `dark:focus:border-teal-400 dark:focus:ring-teal-400`,

        // true
        //     // Selected / hover states
        //     ? `border-teal-500 bg-teal-500 text-white hover:bg-teal-600`

        //     // Unselected / hover state
        //     : `border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`,

        // true &&

        // // Dark-mode unselected state (selected is the same)
        // `dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`,
        `hover:shadow-[0px_0px_2px_1px_rgba(0,0,0,0.28)] rounded-xl`,
        classNames,
    );

    // if ( debug === true )
    // console.log( "Input.jsx :: props = ", props, " :: ", "inputContainerId = ", inputContainerId );
    const inputKey = `${ uuid }-${ fieldKey ?? (
        label ?? (
            path
                && Array.isArray( path )
                && path?.length > 0
                ? path.join( '-' )
                : useId()
        )
    ) }`;

    return (
        <div
            id={ `form-generator-field-control-${ inputKey }` }
            key={ `form-generator-field-control-${ inputKey }` }
            className={ `${ inputContainerClassNames }` }
        >

            {/* <div className={ `w-full h-full hover:shadow-[0px_0px_2px_1px_rgba(0,0,0,0.28)] ${inputContainerClassNames}` }> */ }
            {/* { label && (
                <Label
                    className={ inputClassName }
                    fieldModel={ fieldModel }
                    path={ path }
                    key={ key }
                    fieldKey={ inputKey }
                    uuid={ uuid }
                    label={ label }
                />
            ) } */}
            { children && children }
            {/* </div> */ }
        </div>
    );
    /* 
        return (
            <div
                key={ uuid ?? inputContainerId }
                // key={ inputContainerId }
                classNames={ inputContainerClassNames }
            >
                { label && (
                    <FieldLabel
                        fieldKey={ fieldKey }
                        label={ label }
                        path={ path }
                    />
                ) }
                <div
                    key={ uuid ?? inputContainerId }
                    // key={ inputContainerId }
                    classNames={ inputContainerClassNames }
                >
                    { children && children }
                </div>
            </div>
        ); */
};

const FieldLabel = ( props ) => {
    const {
        useOverlappingLabel = true,
        fieldModel,
        // keyLabel,
        label,
        fieldKey,
        key,
        uuid,
        // value,
        required = false,
        disabled = false,
        useBadge = false,
        classNames,
    } = props;

    const inputKey = `form-generator-label-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;
    return (
        <Label
            id={ inputKey }
            key={ inputKey }
            name={ fieldKey }
            htmlFor={ fieldKey }
            className={
                twMerge(
                    `text-left justify-between items-center flex whitespace-nowrap max-w-2/6 min-w-2/6 w-2/6 overflow-hidden text-ellipsis hover:overflow-ellipsis text-wrap px-1 !mx-0 !my-auto !h-full !max-h-full self-center`,
                    `!text-[0.95rem] !leading-none font-sans text-xs font-medium text-foreground ${ required ? 'font-bold' : 'font-light' }`,
                    // useOverlappingLabel && ` start-1 top-0 z-10 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50`,
                    // `shadow-[0px_0px_2px_1px_rgba(0,0,0,0.8)]`,
                    classNames
                ) }
        >
            { label ? label : convertCamelCaseToSentenceCase( fieldKey ) }
            { required && required === true ? <FaStar className={ `text-quaternaryHighlight size-4 stroke-[0.5rem] justify-start items-start` } /> : <></> }
        </Label>
    );
};

InputField.Label = FieldLabel;

const _Slider = ( props ) => {
    const {
        inputProps,
        id = '',
        key = '',
        fieldKey,
        uuid,
        label,
        name,
        value,
        defaultValue,
        required = false,
        disabled = false,
        setValue,
        onChange,
        onSubmit,
        onCancel,
        min,
        max,
        step,
        minStepsBetweenThumbs = 1,
        fieldHeight = `${ 8 }rem`,
        fieldWeight = 'thin',
    } = props;
    // const randKey = Math.floor( utils.math.rand( 1e6, 0 ) );

    const inputKey = `inputfield-slider-label-${ uuid }-${ fieldKey ?? ( label ?? id ) }`;
    return (
        <div className={ `flex flex-row justify-center items-center gap-2 h-${ fieldHeight }` }>
            { label && (
                <Label
                    key={ inputKey }
                    id={ inputKey }
                    name={ fieldKey }
                    htmlFor={ fieldKey }
                    classNames={ twMerge(
                        `flex flex-row justify-start items-center w-2/6 h-${ fieldHeight } max-w-2/6 font-thin text-xs text-ellipsis text-wrap overflow-hidden`,
                    ) }
                >
                    { label }
                </Label>
            ) }
            <Slider
                // key={ uuid ?? fieldKey }
                key={ `inputfield-slider-input-${ uuid ?? key }` }
                className={ `w-4/6 h-${ fieldHeight }` }
                // defaultValue={ [ gridLines ] }
                onValueChange={ ( [ newValue ] ) =>
                    ( e ) => {
                        if ( onChange ) onChange( e );
                        else setValue( e.target.value );
                    }
                }
                id={ 'gridLines-input' }
                { ...{
                    ...inputProps,
                    ...( min ? { min: min } : {} ),
                    ...( max ? { max: max } : {} ),
                    ...( step ? { step: step } : {} ),
                    ...( required ? required : {} ),
                    ...( disabled ? disabled : {} ),
                    // ...( value ? { value: value } : {} ),
                    ...( defaultValue ? { defaultValue: defaultValue } : {} ),
                    ...( minStepsBetweenThumbs ? { minStepsBetweenThumbs: minStepsBetweenThumbs } : {} ),
                } }
            />
            <Input
                id={ id }
                key={ uuid ?? fieldKey }
                name={ fieldKey }
                type='number'
                className={ `w-16 h-${ fieldHeight }` }
                { ...{
                    ...inputProps,
                    ...( min ? { min: min } : {} ),
                    ...( max ? { max: max } : {} ),
                    ...( step ? { step: step } : {} ),
                    ...( required ? required : {} ),
                    ...( disabled ? disabled : {} ),
                    // ...( value ? { value: value } : {} ),
                    ...( defaultValue ? { defaultValue: defaultValue } : {} ),
                } }
                onChange={ ( e ) => {
                    if ( onChange ) onChange( e );
                    else setValue( e.target.value );
                } }
                required={ required }
                disabled={ disabled }
            />
            <div className={ `w-16 flex flex-row justify-center items-center` }>{ `${ String( Number( value ) ) }` }</div>
        </div>
    );
};

InputField.Slider = _Slider;


const TextField = ( props ) => {
    const {
        debug = false,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        initialData,
        path,
        label,
        key,
        fieldKey,
        uuid,
        value,
        defaultValue,
        minLength,
        maxLength,
        placeholder = '',
        required = false,
        disabled = false,
        inputProps,
        useEditor = true,
        useOnChangeUpdate = false,
        useOnBlurUpdate = true,
        useOnFocusUpdate = false,
        onChange = () => { }, // Callback function to handle changing the value
        handleOnBlur = () => { }, // Callback function to handle onBLur events.
        handleOnFocus = () => { }, // Callback function to handle onFocus events.
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const [ thisValue, setThisValue ] = useState( value ? value : defaultValue );
    // if ( value || defaultValue ) setThisValue( value ? value : defaultValue );

    const handleChange = ( val ) => {
        setThisValue( val );
        if ( onChange ) onChange( val );
    };

    const inputKey = `form-generator-input-text-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    if ( debug === true )
        console.log( `Input.jsx :: [${ inputKey }] :: Re-render :: props = `, props, ` :: `, `thisValue = `, thisValue );

    return (
        <Input
            placeholder={ placeholder ? placeholder : label }
            className={ classNames }
            type={ 'text' }
            id={ inputKey }
            key={ inputKey }
            name={ fieldKey }
            // required={ required }
            // onChange={ handleChange }
            /* onChange={ ( e ) => {
                console.log( "Input.jsx :: TextField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                if ( useOnChangeUpdate ) { handleChange( e?.target?.value ); }
                // else { setThisValue( e.target.value ); }
                setThisValue( e.target.value );
            } } */
            { ...{
                ...( required ? required : {} ),
                ...( disabled ? disabled : {} ),
                ...( minLength ? { minLength: minLength } : {} ),
                ...( maxLength ? { maxLength: maxLength } : {} ),
                ...( useOnChangeUpdate ? {
                    onChange: ( e ) => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                        if ( useOnChangeUpdate ) { handleChange( e?.target?.value ); }
                    }
                } : ( e ) => {
                    if ( debug === true )
                        console.log( "Input.jsx :: TextField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                    setThisValue( e.target.value );
                } ),
                ...( useOnBlurUpdate ? {
                    onBlur: () => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextField :: onBlur triggered! Sending onChange with: ", thisValue );
                        handleChange( thisValue );
                        if ( handleOnBlur ) handleOnBlur( thisValue );
                    }
                } : {} ),
                ...( useOnFocusUpdate ? {
                    onFocus: () => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextField :: onFocus triggered!" );
                        handleChange( thisValue );
                        if ( handleOnFocus ) handleOnBlur( thisValue );
                    }
                } : {} ),
                /* ...( thisValue
                    ? { defaultValue: thisValue }
                    : ( value
                        ? { defaultValue: value }
                        : { defaultValue: 'N/A' } )
                ), */
                ...( thisValue
                    ? { defaultValue: thisValue }
                    : ( { defaultValue: value } )
                ),
            } }
            required={ required }
            disabled={ disabled }
        />
    );
};

InputField.Text = TextField;



const TextAreaField = ( props ) => {
    const {
        debug = false,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        defaultValue,
        placeholder = '',
        required = false,
        disabled = false,
        minLength,
        maxLength,
        inputProps,
        useOnChangeUpdate = false,
        useOnBlurUpdate = true,
        useOnFocusUpdate = false,
        onChange = () => { }, // Callback function to handle changing the value
        handleOnBlur = () => { }, // Callback function to handle onBLur events.
        handleOnFocus = () => { }, // Callback function to handle onFocus events.
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const [ thisValue, setThisValue ] = useState( value ? value : defaultValue );

    const handleChange = ( value ) => {
        setThisValue( value );
        onChange( value );
    };

    const inputKey = `form-generator-input-textarea-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    if ( debug === true )
        console.log( `Input.jsx :: [${ inputKey }] :: Re-render :: props = `, props, ` :: `, `thisValue = `, thisValue );

    return (
        <Textarea
            placeholder={ placeholder ? placeholder : label }
            className={ classNames }
            id={ inputKey }
            key={ inputKey }
            name={ fieldKey }
            // value={ value }
            // defaultValue={ value }
            // defaultValue={ defaultValue }
            // defaultValue={ value ?? '' }
            // onBlur={ () => {
            //     console.log( "Input.jsx :: TextField :: onBlur triggered! Sending onChange with: ", thisValue );
            //     setThisValue( thisValue );
            //     onChange( thisValue );
            // } }
            // onFocus={ () => {
            //     console.log( "Input.jsx :: TextField :: onFocus triggered!" );
            // } }
            // onChange={ ( e ) => { if ( onChange ) onChange( e?.target?.value ); } }
            // onChange={ handleChange }
            { ...{
                ...( required ? required : {} ),
                ...( disabled ? disabled : {} ),
                ...( minLength ? { minLength: minLength } : {} ),
                ...( maxLength ? { maxLength: maxLength } : {} ),
                ...( useOnChangeUpdate ? {
                    onChange: ( e ) => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextAreaField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                        handleChange( e?.target?.value );
                        // handleChange( e );
                    }
                } : ( e ) => {
                    if ( debug === true )
                        console.log( "Input.jsx :: TextAreaField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                    setThisValue( e.target.value );
                } ),
                ...( useOnBlurUpdate ? {
                    onBlur: () => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextAreaField :: onBlur triggered! Sending onChange with: ", thisValue );
                        handleChange( thisValue );
                        if ( handleOnBlur ) handleOnBlur( thisValue );
                    }
                } : {} ),
                ...( useOnFocusUpdate ? {
                    onFocus: () => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextAreaField :: onFocus triggered!" );
                        handleChange( thisValue );
                        if ( handleOnFocus ) handleOnBlur( thisValue );
                    }
                } : {} ),
                /* ...( thisValue
                    ? { defaultValue: thisValue }
                    : ( value
                        ? { defaultValue: value }
                        : { defaultValue: 'N/A' } )
                ), */
                ...( thisValue
                    ? { defaultValue: thisValue }
                    : ( { defaultValue: value } )
                ),
            } }
            required={ required }
            disabled={ disabled }
        />
    );
};

InputField.TextArea = TextAreaField;


const TextEditorField = ( props ) => {
    const {
        debug = false,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        defaultValue,
        placeholder = '',
        required = false,
        disabled = false,
        minLength,
        maxLength,
        inputProps,
        useOnChangeUpdate = false,
        useOnBlurUpdate = true,
        useOnFocusUpdate = false,
        onChange = () => { }, // Callback function to handle changing the value
        handleOnBlur = () => { }, // Callback function to handle onBLur events.
        handleOnFocus = () => { }, // Callback function to handle onFocus events.
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const [ thisValue, setThisValue ] = useState( value ? value : ( defaultValue ? defaultValue : '' ) );

    const handleChange = ( value ) => {
        setThisValue( value );
        onChange( value );
    };

    const inputKey = `form-generator-input-textarea-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    if ( debug === true )
        console.log( `Input.jsx :: [${ inputKey }] :: Re-render :: props = `, props, ` :: `, `thisValue = `, thisValue );

    return (
        <div className={ `flex flex-col overflow-hidden` }>
            <div className={ `h-full max-h-full items-start justify-center relative overflow-auto rounded-xl  m-2` }>
                <QuillEditor
                    id={ inputKey }
                    key={ inputKey }
                    name={ fieldKey }
                    placeholder={ placeholder ? placeholder : label }
                    // required={ required }
                    className={ classNames }
                    useSaveButton={ false }
                    useThemeDropdown={ false }
                    // content={ value ?? defaultValue }
                    content={ thisValue }
                    setContent={ ( value ) => {
                        if ( debug === true )
                            console.log( "Input.jsx :: TextEditorField :: setContent (onChange) triggered! Sending onChange with: ", value );
                        handleChange( value );
                    } }
                    { ...{
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                        ...( minLength ? { minLength: minLength } : {} ),
                        ...( maxLength ? { maxLength: maxLength } : {} ),
                        ...( useOnChangeUpdate ? {
                            onChange: ( e ) => {
                                if ( debug === true )
                                    console.log( "Input.jsx :: TextAreaField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                                handleChange( e?.target?.value );
                                // handleChange( e );
                            }
                        } : ( e ) => {
                            if ( debug === true )
                                console.log( "Input.jsx :: TextAreaField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                            setThisValue( e.target.value );
                        } ),
                        ...( useOnBlurUpdate ? {
                            onBlur: () => {
                                if ( debug === true )
                                    console.log( "Input.jsx :: TextAreaField :: onBlur triggered! Sending onChange with: ", thisValue );
                                handleChange( thisValue );
                                if ( handleOnBlur ) handleOnBlur( thisValue );
                            }
                        } : {} ),
                        ...( useOnFocusUpdate ? {
                            onFocus: () => {
                                if ( debug === true )
                                    console.log( "Input.jsx :: TextAreaField :: onFocus triggered!" );
                                handleChange( thisValue );
                                if ( handleOnFocus ) handleOnBlur( thisValue );
                            }
                        } : {} ),
                        /* ...( thisValue
                            ? { defaultValue: thisValue }
                            : { defaultValue: '' } ), */
                    } }
                    required={ required }
                    disabled={ disabled }
                />
            </div>
        </div>

    );
};

InputField.Editor = TextEditorField;


const EnumField = ( props ) => {
    const {
        debug = false,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        options = [],
        required = false,
        disabled = false,
        path,
        label,
        key,
        uuid,
        value,
        initialValue,
        defaultValue,
        inputProps,
        onChange = () => { }, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    console.log( "Input :: Enum input :: value = ", value, " :: ", "initialValue = ", initialValue, " :: ", "fieldKey = ", fieldKey, " :: ", "options = ", options );

    const inputKey = `form-generator-input-enum-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;
    return (
        useMemo( () =>
            buildSelect( {
                placeholder: label,
                opts: options,
                key: fieldKey,
                value: value,
                initialData: initialValue,
                handleChange: onChange,
                className: classNames,
                multiple: false,
                disabled: disabled,
                required: required,
            } )
        )
    );
};

InputField.Enum = EnumField;


const DateField = ( props ) => {
    const {
        debug = false,
        type = 'datetime-local',
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        placeholder = '',
        defaultValue,
        required = false,
        disabled = false,
        inputProps,
        onChange = () => { }, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const inputKey = `form-generator-input-enum-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;
    return (
        <Input
            className={ `h-auto w-full ${ classNames }` }
            type={ type ?? 'date' }
            id={ uuid ?? fieldKey }
            key={ uuid ?? fieldKey }
            name={ fieldKey }
            placeholder={ placeholder ? placeholder : key }
            { ...{
                ...( required ? required : {} ),
                ...( disabled ? disabled : {} ),
            } }
            defaultValue={ value }
            // defaultValue={ defaultValue }
            onChange={ onChange }
            required={ required }
            disabled={ disabled }
        />
    );
};

InputField.Date = DateField;

const DecimalField = ( props ) => {
    const {
        debug = false,
        useSlidersForNumbers = true,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        min,
        max,
        step,
        defaultValue,
        placeholder = '',
        required = false,
        disabled = false,
        inputProps,
        onChange = () => { }, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const inputKey = `form-generator-input-decimal-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    if ( useSlidersForNumbers ) {
        return (
            <>
                <Slider
                    className={ classNames }
                    id={ `${ inputKey }-slider-input` }
                    key={ `${ inputKey }-slider-input` }
                    name={ fieldKey }
                    { ...{
                        ...( min ? { min: min } : {} ),
                        ...( max ? { max: max } : {} ),
                        ...( step ? { step: step } : {} ),
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                        // ...( defaultValue ? { defaultValue: Math.floor( Number( defaultValue ) ) } : {} ),
                    } }
                    placeholder={ placeholder ? placeholder : key }
                    defaultValue={ [ Number( defaultValue ) ?? 0 ] }
                    onValueChange={ ( values ) => {
                        if ( onChange ) {
                            onChange( values[ 0 ] );
                        }
                    } }
                    required={ required }
                    disabled={ disabled }
                />
                <Input
                    id={ `${ inputKey }-number-input` }
                    key={ `${ inputKey }-number-input` }
                    name={ `${ inputKey }-number-input` }
                    type={ `number` }
                    className={ `w-16 h-${ fieldHeight }` }
                    { ...{
                        ...( min ? { min: min } : {} ),
                        ...( max ? { max: max } : {} ),
                        ...( step ? { step: step } : {} ),
                        ...( value ? { value: value } : defaultValue ? { defaultValue: value } : {} ),
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                    } }
                    onChange={ onChange }
                />
                <div className={ `w-16 flex flex-col justify-center items-center` }>
                    <div>{ `${ String( Number( value ) ) }` }</div>
                </div>
            </>
        );
    }
    else {
        return (
            <Input
                className={ classNames }
                key={ inputKey }
                name={ fieldKey }
                type={ `number` }
                { ...{
                    ...( min ? { min: min } : {} ),
                    ...( max ? { max: max } : {} ),
                    ...( step ? { step: step } : {} ),
                    ...( defaultValue ? { defaultValue: defaultValue } : {} ),
                    ...( required ? required : {} ),
                    ...( disabled ? disabled : {} ),
                } }
                placeholder={ placeholder ? placeholder : key }
                // value={ value }
                // defaultValue={ defaultValue }
                onChange={ ( e ) => {
                    let { id, name, value } = e.target;
                    if ( onChange ) {
                        onChange( value );
                    }
                } }
                required={ required }
                disabled={ disabled }
            />
        );
    }
};

InputField.Decimal = DecimalField;

const NumberField = ( props ) => {
    const {
        debug = false,
        useSlidersForNumbers = true,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        min,
        max,
        step,
        defaultValue,
        placeholder = '',
        required = false,
        disabled = false,
        inputProps,
        useOnChangeUpdate = false,
        useOnBlurUpdate = true,
        useOnFocusUpdate = false,
        onChange = () => { }, // Callback function to handle changing the value
        handleOnBlur = () => { }, // Callback function to handle onBLur events.
        handleOnFocus = () => { }, // Callback function to handle onFocus events.
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const [ thisValue, setThisValue ] = useState( value ? value : ( defaultValue ? defaultValue : null ) );
    const inputKey = `form-generator-input-number-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    const handleUpdate = ( val ) => {
        setThisValue( val );
        if ( onChange && useOnChangeUpdate ) onChange( val );
        if ( handleOnBlur && useOnBlurUpdate ) handleOnBlur( val );
        if ( handleOnFocus && useOnFocusUpdate ) handleOnBlur( val );
    };

    const handleSubmit = () => {
        // Handles updating the externally passed value(s) when a given event occurs. 
        if ( onChange && useOnChangeUpdate ) onChange( thisValue );
        if ( handleOnBlur && useOnBlurUpdate ) handleOnBlur( thisValue );
        if ( handleOnFocus && useOnFocusUpdate ) handleOnBlur( thisValue );
    };

    if ( useSlidersForNumbers ) {
        return (
            <div className={ `w-full p-0 m-0 gap-2 flex flex-grow` }>
                <Slider
                    className={ classNames }
                    id={ `${ inputKey }-slider-input` }
                    key={ `${ inputKey }-slider-input` }
                    name={ fieldKey }
                    placeholder={ placeholder ? placeholder : key }
                    // value={ [ Number( value ) ?? 0 ] }
                    defaultValue={ [ Number( value ) ?? 0 ] }
                    // onValueChange={ ( values ) => {
                    //     if ( onChange ) {
                    //         onChange( Number( values[ 0 ] ) );
                    //     }
                    // } }
                    { ...{
                        ...( min ? { min: min } : {} ),
                        ...( max ? { max: max } : {} ),
                        ...( step ? { step: step } : {} ),
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                        ...( useOnChangeUpdate ? {
                            onValueChange: ( values ) => {
                                let value = values[ 0 ];
                                if ( min && value < min ) value = min;
                                if ( max && value > max ) value = max;
                                if ( onChange ) { onChange( Number( value ) ); }
                                handleUpdate( Number( value ) );
                            }
                        } : ( values ) => {
                            if ( debug === true )
                                console.log( "Input.jsx :: NumberField :: onChange triggered! Sending onChange with: ", Number( values[ 0 ] ) );
                            setThisValue( Number( values[ 0 ] ) );
                        } ),
                        ...( useOnBlurUpdate ? { onBlur: () => { handleSubmit(); } } : {} ),
                        ...( useOnFocusUpdate ? { onFocus: () => { handleSubmit(); } } : {} ),
                        ...( thisValue
                            ? { defaultValue: thisValue }
                            : { defaultValue: value } ),
                        // ...( defaultValue ? { defaultValue: Math.floor( Number( defaultValue ) ) } : {} ),
                    } }
                    onValueChange={ ( values ) => {
                        // if ( onChange ) { onChange( Number( values[ 0 ] ) ); }
                        let value = values[ 0 ];
                        if ( min && value < min ) value = min;
                        if ( max && value > max ) value = max;
                        if ( onChange ) { onChange( Number( value ) ); }
                        handleUpdate( Number( value ) );
                    } }
                    required={ required }
                    disabled={ disabled }
                />
                {/* <div className={ `w-20 border border-brand-primaryPurple border-spacing-1` }>
                    { `${ String( Number( value ) ) }` }
                </div> */}
                <Input
                    id={ `${ inputKey }-number-input` }
                    key={ `${ inputKey }-number-input` }
                    name={ fieldKey }
                    type={ `number` }
                    className={ `w-16 h-${ '' }` }
                    // onChange={ ( e ) => {
                    //     let { id, name, value } = e.target;
                    //     if ( onChange ) { onChange( Number( value ) ); }
                    // } }
                    { ...{
                        ...( inputProps ? { inputProps: inputProps } : {} ),
                        ...( min ? { min: min } : {} ),
                        ...( max ? { max: max } : {} ),
                        ...( step ? { step: step } : {} ),
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                        // ...( defaultValue ? { defaultValue: defaultValue } : value ? { value: value } : {} ),
                        ...( defaultValue ? { defaultValue: value } : value ? { value: value } : {} ),
                        ...( useOnChangeUpdate ? {
                            onChange: ( e ) => {
                                let { id, name, value } = e.target;
                                if ( onChange ) {
                                    if ( min && value < min ) value = min;
                                    if ( max && value > max ) value = max;
                                    onChange( Number( e.target?.value ) );
                                }
                            }
                        } : ( e ) => {
                            if ( debug === true )
                                console.log( "Input.jsx :: NumberField :: onChange triggered! Sending onChange with: ", e?.target?.value );
                            setThisValue( e.target.value );
                        } ),
                        ...( useOnBlurUpdate ? { onBlur: () => { handleSubmit(); } } : {} ),
                        ...( useOnFocusUpdate ? { onFocus: () => { handleSubmit(); } } : {} ),
                    } }
                    defaultValue={ [ Math.floor( Number( value ) ) ?? 0 ] }
                    required={ required }
                    disabled={ disabled }
                />
                <div className={ `w-16 flex flex-col justify-center items-center` }>
                    <div>{ `${ String( Number( value ) ) }` }</div>
                </div>
            </div>
        );
    }
    else {
        return (
            <Input
                className={ classNames }
                id={ `${ inputKey }-number-input` }
                key={ `${ inputKey }-number-input` }
                name={ fieldKey }
                type={ `number` }
                required={ required }
                disabled={ disabled }
                value={ value }
                placeholder={ placeholder ? placeholder : key }
                // onChange={ ( e ) => {
                //     let { id, name, value } = e.target;
                //     if ( onChange ) { onChange( value ); }
                // } }
                { ...{
                    ...( min ? { min: min } : {} ),
                    ...( max ? { max: max } : {} ),
                    ...( step ? { step: step } : {} ),
                    ...( value ? { value: value } : defaultValue ? { defaultValue: defaultValue } : {} ),
                    ...( useOnBlurUpdate ? { onBlur: () => { handleSubmit(); } } : {} ),
                    ...( useOnFocusUpdate ? { onFocus: () => { handleSubmit(); } } : {} ),
                    ...( useOnChangeUpdate ? {
                        onChange: ( e ) => {
                            let { id, name, value } = e.target;
                            if ( min && value < min ) value = min;
                            if ( max && value > max ) value = max;
                            if ( onChange ) { onChange( value ); }
                        }
                    } : {} ),
                } }
            />
        );
    }
};

InputField.Number = NumberField;


const Int32Field = ( props ) => {
    const {
        debug = false,
        useSlidersForNumbers = true,
        fieldKey,
        label,
        key,
        uuid,
        value,
        defaultValue,
        skipInterval = 5,
        min = 0,
        max = 100,
        step,
        placeholder = '',
        required = false,
        disabled = false,
        inputProps,
        onChange = () => { }, // Callback function to handle changing the value
        classNames = '',
    } = props;

    const inputKey = `form-generator-input-int32-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    if ( useSlidersForNumbers ) {
        const ticks = [ ...Array( max + 1 ) ].map( ( _, i ) => i );
        return (
            <div className={ `w-full py-2 m-0 gap-2 flex flex-grow justify-between` }>
                <div className={ `space-y-2 flex flex-grow w-full flex-col` }>
                    <Slider
                        aria-label={ `Slider with ticks` }
                        className={ classNames }
                        id={ `${ inputKey }-slider-input` }
                        key={ `${ inputKey }-slider-input` }
                        name={ fieldKey }
                        { ...{
                            ...( min ? { min: min } : {} ),
                            ...( max ? { max: max } : {} ),
                            ...( step ? { step: step } : {} ),
                            ...( required ? required : {} ),
                            ...( disabled ? disabled : {} ),
                        } }
                        placeholder={ placeholder ? placeholder : key }
                        // value={ [ Math.floor( Number( value ) ) ?? 0 ] }
                        defaultValue={ [ Math.floor( Number( value ? value : ( defaultValue ? defaultValue : 0 ) ) ) ?? 0 ] }
                        onValueChange={ ( values ) => {
                            let value = values[ 0 ];
                            if ( min && value < min ) value = min;
                            if ( max && value > max ) value = max;
                            if ( onChange ) { onChange( Math.floor( Number( value ) ) ); }
                        } }
                        required={ required }
                        disabled={ disabled }
                    />
                    <span className="mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium text-muted-foreground">
                        { ticks.map( ( _, i ) => (
                            <span key={ i } className="flex w-0 flex-col items-center justify-center gap-2">
                                <span
                                    className={ twMerge( "h-1 w-px bg-primary-50/70", i % skipInterval !== 0 && "h-0.5" ) }
                                />
                                <span className={ twMerge( i % skipInterval !== 0 && "opacity-0" ) }>{ i }</span>
                            </span>
                        ) ) }
                    </span>
                </div>
                <Input
                    id={ `${ inputKey }-number-input` }
                    key={ `${ inputKey }-number-input` }
                    name={ fieldKey }
                    type={ `number` }
                    className={ `w-16 h-${ '' }` }
                    { ...{
                        ...( inputProps ? { inputProps: inputProps } : {} ),
                        ...( min ? { min: min } : {} ),
                        ...( max ? { max: max } : {} ),
                        ...( step ? { step: step } : {} ),
                        ...( required ? required : {} ),
                        ...( disabled ? disabled : {} ),
                        // ...( value ? { value: Math.floor( Number( value ) ) } : defaultValue ? { defaultValue: Math.floor( Number( defaultValue ) ) } : {} ),
                        ...( defaultValue ? { defaultValue: !isNaN( value ) ? Math.floor( Number( value ) ) : 0 } : { defaultValue: 0 } ),
                    } }
                    onChange={ ( e ) => {
                        let { id, name, value } = e.target;
                        if ( min && value < min ) value = min;
                        if ( max && value > max ) value = max;
                        if ( onChange ) { onChange( Math.floor( Number( value ) ) ); }
                    } }
                    required={ required }
                    disabled={ disabled }
                />
                <div className={ `w-16 flex flex-col justify-center items-center` }>
                    {/* <div>{ `${ String( Number( defaultValue ) ) }` }</div> */ }
                    <div>{ `${ String( !isNaN( value ) ? Math.floor( Number( value ) ) : 0 ) }` }</div>
                </div>
            </div>
        );
    }
    else {
        return (
            <Input
                className={ classNames }
                id={ `${ inputKey }-number-input` }
                key={ `${ inputKey }-number-input` }
                name={ fieldKey }
                type={ `number` }
                { ...{
                    ...( min ? { min: min } : {} ),
                    ...( max ? { max: max } : {} ),
                    ...( step ? { step: step } : {} ),
                    ...( defaultValue ? { defaultValue: !isNaN( value ) ? Math.floor( Number( value ) ) : 0 } : {} ),
                } }
                disabled={ disabled }
                required={ required }
                value={ Math.floor( Number( value ) ) }
                placeholder={ placeholder ? placeholder : key }
                onChange={ ( e ) => {
                    let { id, name, value } = e.target;
                    if ( min && value < min ) value = min;
                    if ( max && value > max ) value = max;
                    if ( onChange ) { onChange( Math.floor( Number( value ) ) ); }
                } }
            />
        );
    }
};

InputField.Int32 = Int32Field;


const BooleanField = ( props ) => {
    const {
        debug = false,
        useSwitchesForBoolean = true,
        formData,
        setFormData = () => { },
        fieldData,
        fieldModel,
        fieldSchema,
        fieldKey,
        key,
        initialData,
        path,
        label,
        uuid,
        value,
        min,
        max,
        step,
        size,
        defaultChecked,
        placeholder = '',
        required = false,
        disabled = false,
        inputProps,
        onChange = () => { }, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    const inputKey = `form-generator-input-boolean-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    return ( useSwitchesForBoolean ? ( <Switch
        className={ classNames }
        id={ inputKey }
        key={ inputKey }
        name={ fieldKey }
        size={ size ?? 5 }
        disabled={ disabled }
        required={ required }
        placeholder={ placeholder ? placeholder : key }
        // checked={ value ?? defaultChecked }
        // defaultChecked={ value ?? defaultChecked }
        defaultChecked={ defaultChecked ?? value }
        onCheckedChange={ ( checked ) => {
            if ( onChange ) {
                onChange( checked );
            }
        } }
    /> )
        : ( <Checkbox
            className={ classNames }
            id={ inputKey }
            key={ inputKey }
            name={ fieldKey }
            // checked={ value ?? defaultChecked }
            // defaultChecked={ value ?? defaultChecked }
            defaultChecked={ defaultChecked ?? value }
            placeholder={ placeholder ? placeholder : key }
            disabled={ disabled }
            required={ required }
            onCheckedChange={ ( checked ) => {
                if ( onChange ) {
                    onChange( checked );
                }
            } }
        /> ) );
};

InputField.Boolean = BooleanField;



const FileInput = ( props ) => {
    const {
        debug = false,
        type = 'file',
        fieldKey,
        label,
        key,
        uuid,
        value,
        defaultValue,
        inputProps,
        onChange, // Callback function to handle changing the value
        required = false,
        disabled = false,
        classNames = '',
    } = props;

    const inputKey = `form-generator-input-file-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    return (
        <Input
            className={ `${ classNames }` }
            id={ inputKey }
            key={ inputKey }
            name={ fieldKey }
            type={ `file` }
            { ...{
                ...( value ? { value: value } : defaultValue ? { defaultValue: value } : {} )
            } }
            required={ required }
            disabled={ disabled }
            placeholder={ placeholder ? placeholder : key }
            onChange={ ( e ) => { if ( onChange ) { onChange( e.target.value ); } } }
        />
    );
};

InputField.File = FileInput;

const ColorInput = ( props ) => {
    const {
        debug = false,
        type = 'color',
        key,
        fieldKey,
        label,
        uuid,
        value,
        defaultValue,
        inputProps,
        onChange, // Callback function to handle changing the value
        required = false,
        disabled = false,
        classNames = '',
    } = props;

    const inputKey = `form-generator-input-color-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    return (
        <div className={
            twMerge(
                `flex flex-row justify-center items-center w-full p-0 m-0 border-none gap-2`,
            )
        }>
            <Input
                className={ `w-16 p-0 m-0 border-none ${ classNames }` }
                id={ `${ inputKey }-color-input` }
                key={ `${ inputKey }-color-input` }
                name={ fieldKey }
                type={ `color` }
                { ...{
                    ...( required ? required : {} ),
                    ...( disabled ? disabled : {} ),
                    ...( value
                        ? { value: value }
                        : defaultValue
                            ? { defaultValue: value }
                            : {}
                    ),
                } }
                onChange={ ( e ) => { if ( onChange ) { onChange( e.target.value ); } } }
                disabled={ disabled }
                required={ required }
            />
            <Input
                className={ `w-10/12 ${ classNames }` }
                id={ `${ inputKey }-text-input` }
                key={ `${ inputKey }-text-input` }
                name={ fieldKey }
                type={ `text` }
                disabled={ true }
                { ...{
                    ...( value
                        ? { value: value }
                        : defaultValue
                            ? { defaultValue: value }
                            : {}
                    ),
                } }
            />
        </div>
    );
};

InputField.Color = ColorInput;


const ObjectInput = ( props ) => {
    const {
        debug = false,
        fieldSchema,
        fieldModel,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        defaultValue,
        inputProps,
        onChange, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    return (
        <div
            className={ `${ className }` }
        >
            { children && children }
        </div>
    );
};

InputField.Object = ObjectInput;


const ArrayInput = ( props ) => {
    const {
        debug = false,
        fieldSchema,
        fieldModel,
        fieldKey,
        initialData,
        path,
        label,
        key,
        uuid,
        value,
        defaultValue,
        inputProps,
        onChange, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
        children,
    } = props;

    return (
        <div
            className={ `${ className }` }
        >
            { children && children }
        </div>
    );
};

InputField.Array = ArrayInput;


const transitionProps = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.5,
};

/*  <Input`Field.BadgeArrayField
        label={ keyLabel }
        selected={ utils.val.isValidArray( fieldData, true ) ? [ ...fieldData ] : [ fieldData ] }
        setSelected={ ( value ) => { handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value ); } }
        items={ utils.val.isValidArray( fieldModel?.options, true ) ? [ ...fieldModel?.options ] : [ fieldModel?.options ] }
    />;`
*/

// The BadgeArrayField can be used to select multiple of any datatype in an array. 
const StringBadgeArrayField = ( props ) => {
    const {
        debug = false,
        label,
        selected = [],
        setSelected,
        items,
        setItems,
        updateItem,
        required = false,
        disabled = false,
    } = props;

    // const [ selected, setSelected ] = useState( [] );

    const toggleItem = ( item ) => {
        setSelected( ( prev ) =>
            prev.includes( item ) ? prev.filter( ( c ) => c !== item ) : [ ...prev, item ]
        );
    };

    return (
        <div className="min-h-screen bg-black p-6 pt-40">
            { label && (
                <h1 className="text-white text-3xl font-semibold mb-12 text-center">
                    { label }
                </h1>
            ) }
            <div className="max-w-[570px] mx-auto">
                <motion.div
                    className="flex flex-wrap gap-3 overflow-visible"
                    layout
                    transition={ {
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.5,
                    } }
                >
                    { utils.val.isValidArray( items, true ) && (
                        items.map( ( item ) => {
                            const isSelected = selected.includes( item );
                            return (
                                <motion.button
                                    key={ item }
                                    onClick={ () => toggleItem( item ) }
                                    layout
                                    initial={ false }
                                    animate={ {
                                        backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.5)",
                                    } }
                                    whileHover={ {
                                        backgroundColor: isSelected ? "#2a1711" : "rgba(39, 39, 42, 0.8)",
                                    } }
                                    whileTap={ {
                                        backgroundColor: isSelected ? "#1f1209" : "rgba(39, 39, 42, 0.9)",
                                    } }
                                    transition={ {
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                        mass: 0.5,
                                        backgroundColor: { duration: 0.1 },
                                    } }
                                    className={ twMerge(
                                        `inline-flex items-center px-4 py-2 rounded-full text-base font-medium whitespace-nowrap overflow-hidden ring-1 ring-inset`,
                                        isSelected
                                            ? "text-[#ff9066] ring-[hsla(0,0%,100%,0.12)]"
                                            : "text-zinc-400 ring-[hsla(0,0%,100%,0.06)]",
                                    ) }
                                >
                                    <motion.div
                                        className="relative flex items-center"
                                        animate={ {
                                            width: isSelected ? "auto" : "100%",
                                            paddingRight: isSelected ? "1.5rem" : "0",
                                        } }
                                        transition={ {
                                            ease: [ 0.175, 0.885, 0.32, 1.275 ],
                                            duration: 0.3,
                                        } }
                                    >
                                        <span>{ item }</span>
                                        <AnimatePresence>
                                            { isSelected && (
                                                <motion.span
                                                    initial={ { scale: 0, opacity: 0 } }
                                                    animate={ { scale: 1, opacity: 1 } }
                                                    exit={ { scale: 0, opacity: 0 } }
                                                    transition={ {
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 30,
                                                        mass: 0.5
                                                    } }
                                                    className="absolute right-0"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-[#ff9066] flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-[#2a1711]" strokeWidth={ 1.5 } />
                                                    </div>
                                                </motion.span>
                                            ) }
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.button>
                            );
                        } )
                    ) }
                </motion.div>
            </div>
        </div>
    );
};

Input.StringBadgeArrayField = StringBadgeArrayField;


// The BadgeArrayField can be used to select multiple of any datatype in an array. 
const BadgeArrayField = ( props ) => {
    const {
        label,
        selected = [],
        setSelected,
        items,
        setItems,
        updateItem,
        required = false,
        disabled = false,
    } = props;

    // const [ selected, setSelected ] = useState( [] );

    // const toggleItem = ( item ) => {
    //     setSelected( ( prev ) =>
    //         prev.includes( item ) ? prev.filter( ( c ) => c !== item ) : [ ...prev, item ]
    //     );
    // };

    return (
        <div
            className={ twMerge(
                `w-full h-fit align-middle justify-items-center flex flex-row `,
                "flex justify-center items-start [&>div]:w-full",
            ) }
            key={ `${ inputContainerId }-${ subFieldPath.join( '-' ) }` }
        >
            <div className={ `w-full flex flex-col items-center p-0 ` }>
                <div className={ `w-full items-center p-0 gap-1 flex flex-wrap` }>
                    { utils.val.isValidArray( fieldData, true )
                        && fieldData?.map( ( d, i ) => {
                            if ( d ) {
                                return (
                                    <Badge
                                        key={ `badge-array-input-field-${ subFieldPath.join( '-' ) }-item-${ i }` }
                                        variant={ `outline` }
                                        className={ `` }
                                        onClick={ ( e ) => {
                                            // Delete the chonk of text in this badge.
                                            e.preventDefault();
                                            if ( utils.val.isValidArray( fieldData ) ) {
                                                let tempData = [ ...fieldData ];
                                                tempData = tempData?.filter( ( val, valIndex ) => i !== valIndex );
                                                setFormData(
                                                    deepPathSet(
                                                        formData,
                                                        subFieldPath,
                                                        tempData
                                                    )
                                                );
                                            }
                                        } }
                                    >
                                        { d?.toString() }
                                        <Button
                                            variant={ 'ghost' }
                                            size={ 'xs' }
                                            className={ `bg-transparent outline-transparent focus:outline-transparent` }
                                        ><X /></Button>
                                    </Badge>
                                );
                            }
                        } ) }
                </div>

                <InputField.Text
                    id={ fieldKey }
                    uuid={ uuid }
                    fieldKey={ fieldKey }
                    path={ path }
                    label={ keyLabel }
                    placeholder={ keyLabel }
                    required={ required }
                    disabled={ disabled }
                    value={
                        fieldData && utils.val.isDefined( fieldData )
                            ? ( utils.val.isValidArray( fieldData, true )
                                // Already is an array, join then split to clean up.
                                ? ( fieldData?.join( ' ' )?.split( ', ' ).join( ', ' ) )
                                // Not an array, but join it anyways. 
                                : ( utils.val.isString( fieldData )
                                    ? fieldData?.split( '|' )?.join( ' ' )
                                    : ( '' ) ) )
                            : ( ' ' )
                    }
                    useOnChangeUpdate={ true }
                    onChange={ ( value ) => {
                        // Value will be a string, but needs to be stored as an array of strings, so split it up by spaces.
                        handleChange(
                            formData,
                            [ ...( path ? path : fieldModel?.path ) ],
                            value
                                ?.split( ' ' )
                                ?.join( '|' )
                                ?.split( '|' )
                        );
                    } }
                />
            </div>
        </div>
    );

};




InputField.BadgeArrayField = BadgeArrayField;

// Input for selecting one input out of an array of { value: _id, name: title }.
const SelectId = ( props ) => {
    const {
        formGenerator,// For adding new options.
        formModel, // For adding new options.
        formSchema, // For adding new options.
        formData, setFormData = () => { },
        onClickAddOption = () => { },
        fieldKey,
        placeholder,
        initialData,
        options = [],
        label,
        key,
        uuid,
        value,
        defaultValue,
        initialValue,
        refName = '',
        required = false,
        disabled = false,
        multiple = false,
        handleChange = () => { }, // Callback function to handle changing the value
        onCancel, // Callback Function to clear the value
        classNames = '',
    } = props;

    const {
        data, setData, getData,
        schemas,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    let refData = getData();

    // const inputKey = `form-generator-input-enum-id-select-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;
    return (
        useMemo( () =>
            buildIdSelectInput( {
                placeholder: placeholder ?? convertCamelCaseToSentenceCase( fieldKey ),
                key: fieldKey,
                // value: value,
                initialValue: value,
                refData: refData ?? [],
                refName: refName,
                handleChange: handleChange,
                multiple: multiple,
                className: classNames,
                required: required,
                disabled: disabled,
            } )
        )
    );
};

InputField.SelectId = SelectId;





// Original code by https://21st.dev/chetanverma16/input-with-tags/default // 
const TagsArrayFieldTag = ( { text, onRemove } ) => {
    return (
        <motion.span
            initial={ { opacity: 0, scale: 0.8, y: -10, /* filter: "blur(10px)" */ } }
            animate={ { opacity: 1, scale: 1, y: 0, /* filter: "blur(0px)" */ } }
            exit={ { opacity: 0, scale: 0.8, y: -10, /* filter: "blur(10px)" */ } }
            transition={ {
                duration: 0.1,
                ease: "circInOut",
                type: "spring",
            } }
            className={ `bg-[#11111198] px-2 py-1 rounded-xl text-sm flex items-center gap-1 shadow-[0_0_10px_rgba(0,0,0,0.2)] backdrop-blur-sm text-white cursor-pointer` }
            onDoubleClick={ onRemove }
        >
            { text }
            <motion.div whileHover={ { scale: 1.1 } } whileTap={ { scale: 0.9 } }>
                <div className={ `bg-transparent text-xs h-fit flex items-center rounded-full justify-center text-white p-1 hover:bg-[#11111136] cursor-pointer` } onClick={ onRemove }>
                    <X className="size-4 aspect-square" />
                </div>
            </motion.div>
        </motion.span>
    );
};

InputField.TagsArrayTag = TagsArrayFieldTag;

const TagsArrayField = ( {
    placeholder,
    limit = 0,
    debug = false,
    fieldKey,
    label,
    key,
    uuid,
    value,
    defaultValue,
    inputProps,
    onChange, // Callback function to handle changing the value
    onUpdate, // Triggers when changes are passed to the parent form.
    // onSubmit, // Triggers on clicking the save button.
    // onCancel, // Callback Function to clear the value
    required = false,
    disabled = false,
    classNames = '',
    children,
    ...props
} ) => {
    // const [ thisValue, setThisValue ] = useState( value ? value : defaultValue );
    const [ tags, setTags ] = useState( value && utils.val.isValidArray( value, true ) ? [ ...value ] : [] ); // Local array implementation.
    const [ inputValue, setInputValue ] = useState( "" ); // Local string represention.
    const inputKey = `form-generator-input-boolean-${ uuid }-${ fieldKey ?? ( label ?? key ) }`;

    useEffect( () => {
        if ( value && utils.val.isValidArray( value, true ) ) {
            // Existing tags already in array. 
            setTags( [ ...value ] );
        }
    }, [] );

    useEffect( () => {
        console.log( "input.jsx :: TagsArrayField :: value has updated :: value = ", value, " :: ", "tags = ", tags, " :: ", 'inputValue = ', inputValue );
        if ( value && utils.val.isValidArray( value, true ) ) {
            // Existing tags already in array. 
            setTags( [ ...value ] );
        }
        else {
            setTags( [] );
        }
    }, [ value ] );

    const updateTags = ( updatedTags = [] ) => {
        if ( onUpdate ) onUpdate( updatedTags );
        if ( onChange ) onChange( updatedTags );
    };
    console.log( "input.jsx :: TagsArrayField :: value = ", value, " :: ", "tags = ", tags, " :: ", 'inputValue = ', inputValue );

    const handleKeyDown = ( e ) => {
        if ( e.key === "Enter" && inputValue.trim() ) {
            e.preventDefault();
            if ( !limit || tags.length < limit ) {
                const updatedTags = [ ...tags, inputValue.trim() ];
                setTags( updatedTags );
                setInputValue( "" );

                // Propagate updates.
                updateTags( updatedTags );
            }
        }
    };

    const removeTag = ( indexToRemove ) => {
        updateTags( tags.filter( ( _, index ) => index !== indexToRemove ) );
    };

    const clearTags = () => { updateTags( [] ); };

    // if ( debug === true ) console.log( "input.jsx :: TagsArrayField :: value = ", value, " :: ", "tags = ", tags, " :: ", 'inputValue = ', inputValue );

    return (
        <div className={ twMerge( "flex flex-col gap-0 max-w-full w-full", classNames ) }>
            { tags && utils.val.isValidArray( tags, true ) && (
                <div className={ `flex flex-wrap gap-2 w-full flex-1 h-auto px-2 py-2 border !border-opacity-80 border-neutral-800/20 rounded-xl` }>
                    <AnimatePresence>
                        { tags.map( ( tag, index ) => (
                            <TagsArrayFieldTag
                                key={ `array-tag-${ inputKey }-${ index }` }
                                text={ tag }
                                onRemove={ ( e ) => {
                                    e.preventDefault();
                                    removeTag( index );
                                } }
                            />
                        ) ) }
                    </AnimatePresence>
                </div>
            ) }
            <motion.div
                initial={ { opacity: 0, scale: 0.9/* , filter: "blur(10px)" */ } }
                animate={ { opacity: 1, scale: 1/* , filter: "blur(0px)" */ } }
                transition={ { duration: 0.5, type: "spring", stiffness: 200 } }
            >
                <motion.input
                    type="text"
                    value={ inputValue }
                    onChange={ ( e ) => setInputValue( e.target.value ) }
                    onKeyDown={ handleKeyDown }
                    placeholder={ placeholder || "Type something and press Enter..." }
                    // whileHover={ { scale: 1.01, backgroundColor: "#111111d1" } }
                    // whileTap={ { scale: 0.99, backgroundColor: "#11111198" } }
                    className={ twMerge(
                        `w-full px-4 py-2 border backdrop-blur-sm text-white disabled:opacity-50 disabled:cursor-not-allowed outline-none bg-transparent`,
                        // `bg-[#11111198]`
                    ) }
                    disabled={ !!disabled || limit ? tags.length >= limit : false }
                    required={ required }
                />
            </motion.div>
        </div>
    );
};

InputField.TagsArray = TagsArrayField;


export default InputField;
