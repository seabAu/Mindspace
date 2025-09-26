import
React,
{
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    memo
} from 'react';

import * as utils from 'akashatools';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { buildSelect, extractValidationNum, initializeFormModel, schemaToFormModel, typeToInitialDefault, validateFormData } from '@/lib/utilities/input';
import { Label } from '@/components/ui/label';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { d8, dateFormatYYYYMMDD, formatDate, formatDateTime, formatDateYYYYMMDD } from '@/lib/utilities/time';
import { MinusCircle, PlusCircle, X, LucideFilter, Plus, BoxSelect, BoxIcon, RefreshCcw, ChevronRight, LucideChevronsLeftRight } from 'lucide-react';
import { arrayToString, dataType2fieldType, deepPathSet, deepSet, getType, stringToArray } from '@/lib/utilities/data';
import { v4 as uuidV4 } from "uuid";
import Droplist from '@/components/Droplist';
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';

import { Slider } from '@/components/ui/slider';
import { caseCamelToSentence, convertCamelCaseToSentenceCase } from '@/lib/utilities/string';
import { cn } from '@/lib/utils';
import InputField from '@/components/Input/Input';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Loader/Loader';
import { Spinner } from '@/components/Loader/Spinner';
import useGlobalStore from '@/store/global.store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
/**
 * Handles cleanly parsing deeply nested data that was converted to/from stringified JSON. 
 * Recursively runs through each branch of the nested data
 * @param {[any]} input An array, object, or array of objects. Will parse differently depending on which is given.
 * @returns {[any]} Cleaned input
 */
const FormGenerator = ( props ) => {
    const {
        debug = false,
        showAllFieldsByDefault = true,
        showSidebar = false,
        showData = true,
        showOptional = true,
        showFormModel = false,
        showFormData = false,
        showFormSchema = false,
        refSchemas = {}, // All other schemas in this project. 
        excludedFields = [ "createdAt", "updatedAt", "_id" ],
        refData = {}, // All other data in this project; for fetching IDs.
        schema,
        initialData = {},
        data = {},
        setData,
        dataType = 'none', // Specific document type this form is for. 
        // Object defining any custom field definition overrides, 
        // such as using Quilleditor for string data instead of Text or Textarea. 
        customFields = {},
        onSubmit,
        onUpdate,
        onCancel,
        onChange,
        initialDataAutofillRandom = false,
        useMultiSelectForObjectIds = false,
        useSlidersForNumbers = true,
        useSwitchesForBoolean = true,
        useBadgesForStringArrays = true,
        useDateRangeForDateArrays = true,
        useDateTimeLocalForDateInputs = true,
        useRadialForDecimals = true,
        submitButton,
        inputMaxWidth = 32,
        inputMaxHeight = 32,
        layout = {
            columns: 1,
            border: {
                width: [ `0px`, `0px`, `0px`, `0px` ],
                color: 'teal',
            },
            useFlex: true,
            hover: true,
            height: `100%`,
            minHeight: `100%`,
            maxHeight: `80vh`,
            width: `100%`,
            minWidth: `100%`,
            maxWidth: `80vw`,
        },
    } = props;

    const form = useForm();

    const [ openSidebar, setOpenSidebar ] = useState( showSidebar );
    const [ showDroplists, setShowDroplists ] = useState( showData === true );
    const [ showOptionalFields, setShowOptionalFields ] = useState( showOptional === true );
    const [ showFormModelDroplist, setShowFormModelDroplist ] = useState( showFormModel === true );
    const [ showFormDataDroplist, setShowFormDataDroplist ] = useState( showFormData === true );
    const [ showFormSchemaDroplist, setShowFormSchemaDroplist ] = useState( showFormSchema === true );
    const [ formData, setFormData ] = useState( data );
    const [ formSchema, setFormSchema ] = useState( null );
    const [ formModel, setFormModel ] = useState( null );

    const [ requiredFields, setRequiredFields ] = useState( null );
    const [ allFields, setAllFields ] = useState( null );
    const [ activeFields, setActiveFields ] = useState(
        /* ( ( utils.val.isObject( formSchema ) )
            ? Object.keys( formSchema )?.filter( ( field ) => {
                let fieldValue = formSchema?.[ field ];
                let required = utils.ao.deepSearch( fieldValue, 'required', ( k, v ) => { } );
                // console.log( "activeFields :: field = ", field, " :: ", "fieldValue = ", fieldValue );
                return ( required === true || showAllFieldsByDefault === true );
            } )
            : [] ) */
        () => (
            ( utils.val.isObject( formModel ) )
                ? ( showAllFieldsByDefault === true
                    ? ( Object.keys( formModel )?.map( ( field ) => ( field ) ) )
                    : ( Object.keys( formModel )?.filter( ( field ) => {
                        let fieldValue = formModel?.[ field ];
                        let required = utils.ao.deepSearch( fieldValue, 'required', ( k, v ) => { } );
                        // if ( debug === true )
                        // console.log( "activeFields :: field = ", field, " :: ", "fieldValue = ", fieldValue );
                        return ( required === true || showAllFieldsByDefault === true );
                    } ) )
                )
                : []
        )
    );
    // Initialize activeFields with all required fields. Or, if setting is true, all fields. 
    /* if ( utils.val.isObject( formSchema ) ) {
        setActiveFields( Object.keys( formSchema )?.filter( ( field ) => {
            let fieldValue = formSchema?.[ field ];
            return ( fieldValue && fieldValue?.required === true );
        } ) );
    } */

    const handleInitActiveFields =
        useCallback(
            ( model ) => {
                if ( utils.val.isObject( model ) ) {

                    let allFieldNames = Object.keys( model )?.map( ( fieldKey ) => ( fieldKey ) );
                    setAllFields( allFieldNames );

                    let reqFields = Object.keys( model )?.map( ( f ) => (
                        utils.val.isDefined( f )
                            ? ( utils.val.isValidArray( f, true )
                                ? ( f[ 0 ]?.required
                                    ? ( f[ 0 ]?.required )
                                    : ( false ) )
                                : ( f?.required )
                            )
                            : ( false )
                    ) );

                    setRequiredFields( reqFields );

                    let activeFieldNames = ( showAllFieldsByDefault === true
                        ? ( Object.keys( model ) )
                        : ( Object.keys( model )?.filter( ( field ) => {
                            let fieldValue = model?.[ field ];
                            // let required = utils.ao.deepSearch( fieldValue, 'required', ( k, v ) => { } );

                            let fieldSchema;
                            // let isRequired = false;
                            let isRequired = false; // utils.val.isValidArray( reqFields ) ? reqFields?.includes( field ) : false;
                            // if ( utils.val.isObject( formModel ) ) {
                            //     // fieldSchema = utils.ao.deepSearch( formModel, f );
                            //     fieldSchema = formModel?.[ f ];
                            //     if ( utils.val.isDefined( fieldSchema ) ) {
                            //         if ( fieldSchema && Object.keys( fieldSchema )?.includes( 'required' ) ) {
                            //             isRequired = fieldSchema?.required;
                            //         }
                            //     }
                            // }

                            if ( debug === true )
                                console.log( "activeFields :: field = ", field, " :: ", "fieldValue = ", fieldValue );
                            return ( showAllFieldsByDefault === true ? true : ( isRequired === true ) );
                        } ) )
                    );
                    setActiveFields( activeFieldNames );
                }
            }
            , [ formModel ]
        );

    const fieldsFilterPredicate = ( f, i ) => {

        // Check if this field is required. 
        let fieldSchema;
        let isRequired = false;
        if ( utils.val.isObject( formModel ) ) {
            // fieldSchema = utils.ao.deepSearch( formModel, f );
            fieldSchema = formModel?.[ f ];
            if ( utils.val.isDefined( fieldSchema ) ) {
                if ( fieldSchema && Object.keys( fieldSchema )?.includes( 'required' ) ) {
                    isRequired = fieldSchema?.required;
                }
            }
        }

        if ( debug === true )
            console.log( 'FormGenerator :: buildFieldSelectInput :: f = ', f, ' :: ', 'i = ', i, ' :: ', 'fieldSchema = ', fieldSchema, ' :: ', 'isRequired = ', isRequired );

        return ( ( isRequired ) );
    };

    const handleChangeActiveFields =
        useCallback(
            ( key, value, mode ) => {
                // Value will be the name of a field we're toggling on or off. Check if it's in the activeFields array yet. 
                // let allFieldNames = Object.keys( schema )?.map( ( fieldKey ) => ( fieldKey ) );

                if ( debug === true )
                    console.log( "FormGenerator :: handleChangeActiveFields :: schema = ", schema, " :: ", "activeFields = ", activeFields, " :: ", "allFields = ", allFields, " :: ", "HANDLECHANGE triggered :: key = ", key, " :: ", "value = ", value );
                let updatedFields = [];
                if ( activeFields && utils.val.isValidArray( activeFields, true ) ) {

                    if ( activeFields?.includes( value ) ) {
                        // Remove\
                        updatedFields = activeFields?.filter( ( v, i ) => ( v !== value ) );
                    }
                    else {
                        // Add
                        if ( utils.val.isValidArray( activeFields, true ) ) { updatedFields = [ ...activeFields, value ]; }
                        else { updatedFields = [ value ]; }
                    }
                }

                if ( debug === true )
                    console.log( "updatedFields = ", updatedFields );
                setActiveFields( updatedFields );

                /* if ( activeFields && utils.val.isValidArray( activeFields, true ) && activeFields.includes( value ) ) {
                    // Already in array, remove it. 
                    // setActiveFields( ( prev ) => ( activeFields?.filter( fieldsFilterPredicate )?.filter( ( f ) => {
                    setActiveFields( ( activeFields?.filter( ( f ) => {
                        console.log( "FormGenerator :: handleChangeActiveFields :: field = ", f, " :: ", "activeFields = ", activeFields, " :: ", "allFields = ", allFields );
                        return ( f !== value );
                    } ) ) );
                }
                else {
                    // Is not in array, add it.
                    setActiveFields( [ ...activeFields, value ] );
                } */
            }
            , []
        );

    const buildFieldSelectInput =
        useCallback(
            ( schema, activeFieldNames ) => {
                // Create a select input with all (non-required) field names as the options.
                // Clicking one or multiple adds them to the form.
                // Idea is to make things less cluttered, especially for the longer schemas. 

                /*  
                
                let allFieldNames = Object.keys( schema )?.map( ( fieldKey ) => ( fieldKey ) );
                let opts = Object.keys( schema )?.map( ( fieldKey, index ) => ( { key: fieldKey, value: fieldKey, name: caseCamelToSentence( fieldKey ), index: index } ) );

                let selectInput = buildSelect( {
                    opts: opts,
                    placeholder: 'Add / Remove Form Fields',
                    key: 'activeFieldNames',
                    value: utils.val.isValidArray( activeFields, true ) ? [ ...activeFields ] : [ activeFields ],
                    initialData: activeFields,
                    handleChange: handleChangeActiveFields,
                    multiple: true,
                    className: `w-full`,
                } ); */

                return (
                    <div className={ `h-auto` } key={ `form-generator-active-fields-select-input` }>
                        {/* { selectInput } */ }
                        <FieldToggleList
                            multiple={ true }
                            options={ allFields }
                            allFields={ allFields }
                            requiredOptions={ requiredFields }
                            activeFields={ activeFields }
                            setActiveFields={ setActiveFields }
                            title={ `Available Form Fields` }
                            classNames={ `!z-1100` }
                            contentClassNames={ `!z-1200` }
                            handleChange={ handleChangeActiveFields }
                        />
                    </div>
                );
            }
            , [ formModel, schema, activeFields, handleChangeActiveFields ]
        );

    const [ submitAttempted, setSubmitAttempted ] = useState( false ); // (Boolean) Submitted attempt?

    const handleValidationChecks = ( data, schema ) => {
        // Runs through the model and compares to the data; 
        // Makes sure the data types line up, and all required fields are present. 
        // Also checks min and max length and other validation requirements to try and prevent errors. 
        let result = validateFormData( data, schema );
        return { result: result, errors: [ "No Errors" ] };
    };

    const handleOnSubmit = ( data ) => {
        setSubmitAttempted( true );
        if ( debug === true )
            console.log( "FormGenerator :: handleOnSubmit :: onSubmit triggered :: data = ", data );
        // let valid = handleValidationChecks( data, formModel );
        let valid = handleValidationChecks( data, formSchema );
        // Valid will be: [ result: true/false, errors: [ errors?|null ] ];
        if ( valid ) {
            if ( valid?.result === true ) {
                // Valid result. Send off to server.
                if ( onSubmit ) { onSubmit( data ); }
                else { console.error( "FormGenerator :: handleOnSubmit :: onSubmit must be defined." ); }
            }
        }
        else {
            console.error( "FormGenerator :: handleOnSubmit :: An unknown error occurred and validation failed. " );
        }
    };

    const handleChange = ( data, key, value ) => {
        // Deep set by key.
        setFormData( { ...data, [ key ]: value } );
        // let res = utils.ao.deepFindSet( data, key, value );
        // setFormData( res );
    };

    const handleDeepChange = ( data, path, value ) => {
        if ( debug === true )
            console.log(
                "FORM GENERATOR",
                " :: ", "data = ", data,
                " :: ", "path = ", path,
                " :: ", "value = ", value
            );

        if ( data && value && path ) {
            const updatedData = deepPathSet( { ...data }, path, value );
            if ( onUpdate ) onUpdate( updatedData );
            // if ( onChange ) onChange( updatedData );
            setFormData( updatedData );
        }
    };

    useEffect( () => {
        if ( debug === true )
            console.log( "FORM GENERATOR :: formData changed :: formData = ", formData, " :: ", "data = ", formData );
    }, [ formData ] );

    useEffect( () => {
        // Whenever the input schema changes, update the loaded form schema.
        if ( debug === true )
            console.log(
                "FORM GENERATOR",
                " :: ", "initialData changed",
                " :: ", "initialData = ", initialData,
                " :: ", "data = ", data,
                " :: ", "schema = ", schema,
                " :: ", "formModel = ", formModel,
                " :: ", "formData = ", formData,
                " :: ", "formSchema = ", formSchema,
            );
        // setFormData( initialData );
    }, [ initialData ] );

    useEffect( () => {
        // Whenever the input schema changes, update the loaded form schema.

        if ( debug === true )
            console.log(
                "FORM GENERATOR",
                " :: ", "schema changed",
                " :: ", "initialData = ", initialData,
                " :: ", "data = ", data,
                " :: ", "schema = ", schema,
                " :: ", "formModel = ", formModel,
                " :: ", "formData = ", formData,
                " :: ", "formSchema = ", formSchema,
            );
        setFormSchema( schema );
    }, [ schema ] );

    // /* 
    const handleInitializeFormModel = () => {
        // if ( utils.val.isObject( formData ) && utils.val.isObject( formSchema ) ) {
        if ( utils.val.isObject( formSchema ) ) {
            let tempFormModel = initializeFormModel( {
                schema: formSchema,
                initialData: initialData,
                formData: data,
                refData: refData,
                initializeRandom: initialDataAutofillRandom,
                useSlidersForNumbers: useSlidersForNumbers,
                useSwitchesForBoolean: useSwitchesForBoolean,
                useInitialData: true,
            } );
            if ( tempFormModel?.data ) setFormData( tempFormModel?.data );
            if ( tempFormModel?.model ) {
                setFormModel( tempFormModel?.model );
                // Initialize the active fields and all-fields arrays. 
                handleInitActiveFields( tempFormModel?.model );
            }

            if ( debug === true )
                console.log( "FORM GENERATOR :: formModel created :: formModel = ", tempFormModel, " :: ", "with inputs: formSchema = ", formSchema, " :: ", "formData = ", formData );
        }
    };

    if ( !formModel ) handleInitializeFormModel();

    if ( debug === true )
        console.log(
            "FormGenerator",
            " :: ", "formData = ", formData,
            " :: ", "formSchema = ", formSchema,
            // " :: ", "schema = ", schema,
            " :: ", "refData = ", refData,
            " :: ", "data = ", data,
            " :: ", "initialData = ", initialData,
            " :: ", "setData = ", setData,
            " :: ", "onSubmit = ", onSubmit,
        );


    const generateForm =
        // useCallback(
        ( formSchema, formData ) => {
            if (
                utils.val.isObject( formData )
                && utils.val.isObject( formModel )
                && utils.val.isObject( formSchema )
            ) {
                return Object.keys( formModel ).map( ( fieldKey ) => {

                    if ( !(
                        excludedFields
                        && utils.val.isValidArray( excludedFields, true )
                        && excludedFields.find( ( field ) => ( field === fieldKey ) )
                    ) ) {

                        let fieldSchema = formSchema.hasOwnProperty( fieldKey )
                            ? formSchema[ fieldKey ]
                            : '';

                        let fieldModel = formModel.hasOwnProperty( fieldKey )
                            ? formModel[ fieldKey ]
                            : '';

                        let fieldData = formData.hasOwnProperty( fieldKey )
                            ? formData?.[ fieldKey ]
                            // : typeToInitialDefault( fieldModel?.dataType, '' );
                            // : typeToInitialDefault( fieldSchema, '' );
                            : typeToInitialDefault( fieldModel?.elementSchema, fieldModel?.defaultValue );

                        if ( debug === true )
                            console.log(
                                "FormGenerator",
                                "\n :: ", "fieldKey = ", fieldKey,
                                // "\n :: ", "field = ", field,
                                // "\n :: ", "value = ", value,
                                "\n :: ", "formSchema = ", formSchema,
                                "\n :: ", "fieldModel = ", fieldModel,
                                "\n :: ", "fieldSchema = ", fieldSchema,
                                "\n :: ", "fieldData = ", fieldData,
                            );

                        // let field = useMemo( () => generateField( fieldModel, fieldSchema, fieldData, key, [ key ] ), [] );
                        let required = fieldModel?.required;
                        if ( ( required === false && showOptionalFields === true ) || ( required === true ) ) {
                            // ( key, value ) => {
                            //     setFormData(
                            //         deepPathSet(
                            //             formData,
                            //             fieldModel?.path, // [ key ],
                            //             value
                            //         )
                            //     );
                            // },
                            let isActiveField = ( activeFields && utils.val.isValidArray( activeFields, true )
                                ? ( activeFields?.includes( fieldKey ) )
                                : ( false )
                            );

                            let thisFieldData = fieldData;
                            if ( utils.val.isObject( thisFieldData ) ) thisFieldData = { ...thisFieldData };
                            else if ( utils.val.isValidArray( thisFieldData ) ) thisFieldData = [ ...thisFieldData ];
                            return (
                                <FormGeneratorField
                                    debug={ debug }
                                    isActiveField={ isActiveField }
                                    formData={ { ...formData } } setFormData={ setFormData }
                                    formModel={ formModel } setFormModel={ setFormModel }
                                    formSchema={ formSchema }
                                    fieldModel={ fieldModel }
                                    fieldSchema={ fieldSchema }
                                    fieldData={ thisFieldData }
                                    key={ fieldKey }
                                    fieldKey={ fieldKey }
                                    path={ [ fieldKey ] }
                                    classNames={ `` }
                                    handleChange={ handleDeepChange }
                                    initialDataAutofillRandom={ initialDataAutofillRandom }
                                    useMultiSelectForObjectIds={ useMultiSelectForObjectIds }
                                    useSlidersForNumbers={ useSlidersForNumbers }
                                    useSwitchesForBoolean={ useSwitchesForBoolean }
                                    useBadgesForStringArrays={ useBadgesForStringArrays }
                                    useDateRangeForDateArrays={ useDateRangeForDateArrays }
                                    useDateTimeLocalForDateInputs={ useDateTimeLocalForDateInputs }
                                    useRadialForDecimals={ useRadialForDecimals }
                                    layout={ layout }
                                    refData={ refData }
                                    refSchemas={ refSchemas }
                                // { ...props }
                                />
                            );
                        }
                    }
                    else {
                        // console.log( "Excluded field encountered: ", fieldKey, " :: ", "all excluded fields = ", excludedFields );
                    }

                } );
            }
        };
    // , [ formSchema, formData, showOptionalFields ] );

    const renderDroplists =
        useCallback(
            () => {
                return (
                    <>
                        { showDroplists && (
                            <div className={ `flex flex-col w-full` }>
                                { ( showFormModelDroplist ) && formData && (
                                    <div className={ `` }>
                                        <Droplist
                                            label={ `Form Model` }
                                            data={ formModel }
                                            width={ '100%' }
                                            minWidth={ '100%' }
                                            maxWidth={ '100%' }
                                            height={ '100%' }
                                            // minHeight={'100%'}
                                            maxHeight={ `${ 50 }rem` }
                                            showControls={ true }
                                            expandable={ true }
                                            compact={ true }
                                            collapse={ false }
                                        />
                                    </div>
                                ) }

                                { ( showFormDataDroplist ) && (
                                    <div className={ `` }>
                                        <Droplist
                                            label={ `Form Data` }
                                            data={ formData }
                                            width={ '100%' }
                                            minWidth={ '100%' }
                                            maxWidth={ '100%' }
                                            height={ '100%' }
                                            // minHeight={'100%'}
                                            maxHeight={ `${ 50 }rem` }
                                            showControls={ true }
                                            expandable={ true }
                                            compact={ true }
                                            collapse={ false }
                                        />
                                    </div>
                                ) }

                                { ( showFormSchemaDroplist ) && (
                                    <Droplist
                                        label={ `Schema` }
                                        data={ formSchema }
                                        width={ '100%' }
                                        minWidth={ '100%' }
                                        maxWidth={ '100%' }
                                        height={ '100%' }
                                        // minHeight={'100%'}
                                        maxHeight={ `${ 50 }rem` }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                    />
                                ) }
                            </div>
                        ) }

                    </>
                );
            }, [ formSchema, formData, showOptionalFields, showDroplists, showFormModelDroplist, showFormDataDroplist, showFormSchemaDroplist ] );

    const buildFormControls = () => {
        return (
            <>
                <div
                    className={ `flex flex-row items-center justify-start w-full h-full flex-grow px-4 gap-8` }
                    onClick={ ( checked ) => { setShowDroplists( checked ); } }
                >
                    <Switch
                        size={ 4 }
                        id={ 'show-droplists-toggle-switch' }
                        key={ 'show-droplists-toggle-switch' }
                        placeholder={ "Show data" }
                        defaultChecked={ showDroplists }
                        onCheckedChange={ ( checked ) => { setShowDroplists( checked ); } }
                    />
                    <Label
                        name={ `` }
                        htmlFor={ 'show-droplists-toggle-switch' }
                        className={ `flex flex-col items-stretch justify-stretch` }
                    >
                        { `${ showDroplists ? 'Hide' : 'Show' } Data` }
                    </Label>
                </div>

                <div key={ `show-optional-fields-toggle-switch` }
                    className={ `flex flex-row items-center justify-start w-full h-full flex-grow px-4 gap-8` }
                    onClick={ ( checked ) => { setShowOptionalFields( checked ); } }
                >
                    <Switch
                        size={ 4 }
                        id={ 'show-optional-fields-toggle-switch-input' }
                        key={ `show-optional-fields-toggle-switch-input` }
                        placeholder={ "Show Optional Fields" }
                        defaultChecked={ showOptionalFields }
                        onCheckedChange={ ( checked ) => { setShowOptionalFields( checked ); } }
                    />
                    <Label
                        name={ `` }
                        htmlFor={ 'show-optional-fields-toggle-switch-input' }
                        id={ `show-optional-fields-toggle-switch-label` }
                        key={ `show-optional-fields-toggle-switch-label` }
                        className={ `flex flex-col items-stretch justify-stretch` }
                    >
                        { `${ showOptionalFields ? 'Hide' : 'Show' } Optional Fields` }
                    </Label>
                </div>

                <div key={ `show-form-data-toggle-switch` }
                    className={ `flex flex-row items-center justify-start w-full h-full flex-grow px-4 gap-8` }
                    onClick={ ( e ) => { setShowFormDataDroplist( !showFormDataDroplist ); } }
                >
                    <Switch
                        size={ 4 }
                        id={ 'show-optional-fields-toggle-switch-input' }
                        key={ `show-optional-fields-toggle-switch-input` }
                        placeholder={ "Show Optional Fields" }
                        defaultChecked={ showFormDataDroplist }
                        onCheckedChange={ ( checked ) => { setShowFormDataDroplist( checked ); } }
                    />
                    <Label
                        name={ `` }
                        htmlFor={ 'show-optional-fields-toggle-switch-input' }
                        id={ `show-optional-fields-toggle-switch-label` }
                        key={ `show-optional-fields-toggle-switch-label` }
                        className={ `flex flex-col items-stretch justify-stretch` }
                    >
                        { `${ showFormDataDroplist ? 'Hide' : 'Show' } Data` }
                    </Label>
                </div>

                <div key={ `show-form-model-toggle-switch` }
                    className={ `flex flex-row items-center justify-start w-full h-full flex-grow px-4 gap-8` }
                    onClick={ ( e ) => { setShowFormModelDroplist( !showFormModelDroplist ); } }
                >
                    <Switch
                        size={ 4 }
                        id={ 'show-optional-fields-toggle-switch-input' }
                        key={ `show-optional-fields-toggle-switch-input` }
                        placeholder={ "Show Optional Fields" }
                        defaultChecked={ showFormModelDroplist }
                        onCheckedChange={ ( checked ) => { setShowFormModelDroplist( checked ); } }
                    />
                    <Label
                        name={ `` }
                        htmlFor={ 'show-optional-fields-toggle-switch-input' }
                        id={ `show-optional-fields-toggle-switch-label` }
                        key={ `show-optional-fields-toggle-switch-label` }
                        className={ `flex flex-col items-stretch justify-stretch` }
                    >
                        { `${ showFormModelDroplist ? 'Hide' : 'Show' } Model` }
                    </Label>
                </div>

                <div key={ `show-form-schema-toggle-switch` }
                    className={ `flex flex-row items-center justify-start w-full h-full flex-grow px-4 gap-8` }
                    onClick={ ( e ) => { setShowFormSchemaDroplist( !showFormSchemaDroplist ); } }
                >
                    <Switch
                        size={ 4 }
                        id={ 'show-optional-fields-toggle-switch-input' }
                        key={ `show-optional-fields-toggle-switch-input` }
                        placeholder={ "Show Optional Fields" }
                        defaultChecked={ showFormSchemaDroplist }
                        onCheckedChange={ ( checked ) => { setShowFormSchemaDroplist( checked ); } }
                    />
                    <Label
                        name={ `` }
                        htmlFor={ `show-optional-fields-toggle-switch-input` }
                        id={ `show-optional-fields-toggle-switch-label` }
                        key={ `show-optional-fields-toggle-switch-label` }
                        className={ `flex flex-col items-stretch justify-stretch` }
                    >
                        { `${ showFormSchemaDroplist ? 'Hide' : 'Show' } Schema` }
                    </Label>
                </div>
            </>
        );
    };

    const buildFormView = () => {
    };

    const buildView = () => {
        return (
            // <div className={ `flex flex-row ${ showDroplists ? 'w-3/12' : 'w-0' }` }>
            <div className={ `flex flex-row gap-4 ${ showDroplists ? 'w-full' : 'w-full' }` }>
                <Collapsible defaultOpen={ openSidebar === true && showSidebar === true } className="group/collapsible">
                    <Label
                        className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                        <CollapsibleTrigger onClick={ ( e ) => {
                            e.preventDefault();
                            if ( showSidebar === true ) setOpenSidebar( !openSidebar );
                        } }>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                    </Label>
                    <CollapsibleContent>
                        <div className={ `flex flex-col items-stretch justify-stretch w-1/2 h-full` }>
                            { buildFormControls() }
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <div className={ `flex flex-col !w-3/12 ${ openSidebar ? '!w-3/12 opacity-100' : '!w-0 opacity-0' } border-r justify-start items-center px-2` }>
                    <Tabs defaultValue="fields" className={ `w-full justify-center !col-span-12` }>
                        <TabsList className={ `flex flex-row items-center justify-center h-auto rounded-[0.5rem]` }>
                            <TabsTrigger value="fields">Fields</TabsTrigger>
                            { formData && ( <TabsTrigger value="data">Data</TabsTrigger> ) }
                            { formModel && ( <TabsTrigger value="model">Model</TabsTrigger> ) }
                            { formSchema && ( <TabsTrigger value="schema">Schema</TabsTrigger> ) }
                        </TabsList>

                        {/* Sidebar with details */ }
                        <TabsContent value="fields" className={ `space-y-4` }>
                            {/* <div className={ `flex flex-col items-stretch justify-stretch w-1/2 h-full` }> */ }
                            <div className={ `flex flex-col items-stretch justify-stretch h-full mx-5` }>
                                { buildFieldSelectInput( formSchema, activeFields ) }
                                { activeFields && formSchema && (
                                    <ToggleSection
                                        // options={ Object.keys( formSchema )?.map( ( fieldKey ) => ( fieldKey ) ) }
                                        options={ allFields }
                                        allFields={ allFields }
                                        active={ activeFields }
                                        setActive={ setActiveFields }
                                        title={ "Optional Fields" }
                                        // handleChange={ ( field ) => ( handleChangeActiveFields( field, field ) ) }
                                        handleChange={ handleChangeActiveFields }
                                        useCheckboxes={ false }
                                        requiredOptions={ requiredFields }
                                        activeFields={ activeFields }
                                        setActiveFields={ setActiveFields }
                                        classNames={ `!z-1100` }
                                        contentClassNames={ `!z-1200` }
                                    /> ) }
                            </div>
                        </TabsContent>

                        { formData && (
                            <TabsContent value="data" className={ `space-y-4` }>
                                <div className={ `` }>
                                    <Droplist
                                        label={ `Form Data` }
                                        data={ formData }
                                        width={ '100%' }
                                        minWidth={ '100%' }
                                        maxWidth={ '100%' }
                                        height={ '100%' }
                                        // minHeight={'100%'}
                                        maxHeight={ `${ 50 }rem` }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                    />
                                </div>
                            </TabsContent>
                        ) }

                        { formModel && (
                            <TabsContent value="model" className={ `space-y-4` }>
                                <div className={ `` }>
                                    <Droplist
                                        label={ `Form Model` }
                                        data={ formModel }
                                        width={ '100%' }
                                        minWidth={ '100%' }
                                        maxWidth={ '100%' }
                                        height={ '100%' }
                                        // minHeight={'100%'}
                                        maxHeight={ `${ 50 }rem` }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                    />
                                </div>
                            </TabsContent>
                        ) }

                        { formSchema && (
                            <TabsContent value="schema" className={ `space-y-4` }>
                                <Droplist
                                    label={ `Schema` }
                                    data={ formSchema }
                                    width={ '100%' }
                                    minWidth={ '100%' }
                                    maxWidth={ '100%' }
                                    height={ '100%' }
                                    // minHeight={'100%'}
                                    maxHeight={ `${ 50 }rem` }
                                    showControls={ true }
                                    expandable={ true }
                                    compact={ true }
                                    collapse={ false }
                                />
                            </TabsContent>
                        ) }

                    </Tabs>
                </div>
                <div className="flex flex-col !w-9/12">
                    {/* The form */ }
                    { generateForm( formSchema, formData ) }
                    { submitButton
                        ? ( submitButton )
                        : ( <Button
                            type="submit"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                // if ( debug === true )
                                console.log( "FormGenerator :: BUTTON onSubmit triggered :: formData = ", formData, " :: ", "formSchema = ", formSchema, " :: ", "formModel = ", formModel );
                                onSubmit( formData );
                                // handleOnSubmit( formData );
                            } }
                        >
                            Submit
                        </Button> ) }
                </div>
            </div>
        );
    };



    return (
        <form
            // className={ `h-[80vh] min-h-[80vh] flex flex-col justify-center items-center overflow-auto w-full h-full border overflow-y-hidden md:grid-cols-4 gap-4 md:columns-auto lg:columns-4 space-y-4 columns-3xs p-4` }
            className={ twMerge(

                // Base styles
                `w-full max-w-full h-full gap-${ layout?.gap }`,
                // ` dark:border-neutral-900 dark:bg-transparent dark:text-neutral-200 dark:hover:bg-neutral-950/20`,

                // Flex vs. Grid layouts
                layout?.useFlex === true
                    ? `flex flex-col `
                    : `columns-${ layout?.columns + 1 }xs md:grid-cols-${ layout?.columns + 2 } md:columns-${ layout?.columns }`,

                // // Light-mode focus state
                // 'focus:border-teal-500 focus:ring-teal-500',

                // // Dark-mode focus state
                // 'dark:focus:border-teal-400 dark:focus:ring-teal-400',

                // true
                //     // Selected / hover states
                //     ? 'border-teal-500 bg-teal-500 text-white hover:bg-teal-600'

                //     // Unselected / hover state
                //     : 'hover:border-zinc-300 hover:bg-white hover:text-zinc-700 hover:bg-transparent',
            ) }

        /* onSubmit={ ( e ) => {
            e.preventDefault();
            console.log( "FormGenerator :: onSubmit triggered :: formData = ", formData );
            handleOnSubmit( formData );
        } } */
        >
            { formData
                && utils.val.isObject( formData )
                && utils.val.isObject( formSchema )
                ? ( <div className={ `flex flex-col items-stretch justify-stretch w-full h-full flex-grow gap-2` }>
                    <div className={ `flex flex-col items-stretch justify-stretch w-full h-full flex-shrink` }>

                        <div className={ `flex flex-col items-stretch justify-stretch w-full h-full flex-grow` }>
                            <div key={ `form-generator-form-fields-container w-full h-full` }
                                className={ `flex flex-row w-full h-full gap-4 items-stretch justify-stretch flex-grow px-2` }
                            >
                                { showSidebar === true && ( <div className={ `flex flex-col h-full min-h-full max-h-full transition-all duration-500 ease-in-out ${ openSidebar ? '!w-3/12 opacity-100' : '!w-0 opacity-0' } border-r justify-start items-center` }>
                                    <Tabs defaultOpen='fields' defaultValue="fields" className={ `w-full justify-center !col-span-12 flex flex-col items-stretch ${ openSidebar ? '' : 'hidden' }` }>
                                        <TabsList className={ `flex flex-row items-center justify-center h-auto rounded-[0.5rem]` }>
                                            <TabsTrigger value="fields">Fields</TabsTrigger>
                                            { formData && ( <TabsTrigger value="data" className={ `px-1 w-auto justify-stretch items-start` }>Data</TabsTrigger> ) }
                                            { formModel && ( <TabsTrigger value="model" className={ `px-1 w-auto justify-stretch items-start` }>Model</TabsTrigger> ) }
                                            { formSchema && ( <TabsTrigger value="schema" className={ `px-1 w-auto justify-stretch items-start` }>Schema</TabsTrigger> ) }
                                        </TabsList>

                                        {/* Sidebar with details */ }
                                        { formData && (
                                            <TabsContent value="data" className={ `transition-all duration-500 ease-in-out ${ openSidebar ? 'opacity-100' : 'opacity-0 hidden' } ` }>
                                                <div className={ `` }>
                                                    <Droplist
                                                        label={ `Form Data` }
                                                        data={ formData }
                                                        width={ '100%' }
                                                        minWidth={ '100%' }
                                                        maxWidth={ '100%' }
                                                        height={ '100%' }
                                                        // minHeight={'100%'}
                                                        maxHeight={ `${ 50 }rem` }
                                                        showControls={ true }
                                                        expandable={ true }
                                                        compact={ true }
                                                        collapse={ false }
                                                    />
                                                </div>
                                            </TabsContent>
                                        ) }

                                        { formModel && (
                                            <TabsContent value="model" className={ `transition-all duration-500 ease-in-out` }>
                                                <div className={ `` }>
                                                    <Droplist
                                                        label={ `Form Model` }
                                                        data={ formModel }
                                                        width={ '100%' }
                                                        minWidth={ '100%' }
                                                        maxWidth={ '100%' }
                                                        height={ '100%' }
                                                        // minHeight={'100%'}
                                                        maxHeight={ `${ 50 }rem` }
                                                        showControls={ true }
                                                        expandable={ true }
                                                        compact={ true }
                                                        collapse={ false }
                                                    />
                                                </div>
                                            </TabsContent>
                                        ) }

                                        { formSchema && (
                                            <TabsContent value="schema" className={ `transition-all duration-500 ease-in-out` }>
                                                <Droplist
                                                    label={ `Schema` }
                                                    data={ formSchema }
                                                    width={ '100%' }
                                                    minWidth={ '100%' }
                                                    maxWidth={ '100%' }
                                                    height={ '100%' }
                                                    // minHeight={'100%'}
                                                    maxHeight={ `${ 50 }rem` }
                                                    showControls={ true }
                                                    expandable={ true }
                                                    compact={ true }
                                                    collapse={ false }
                                                />
                                            </TabsContent>
                                        ) }

                                        <TabsContent value="fields" className={ `` }>
                                            <div className={ `flex flex-row gap-4 transition-all duration-400 ease-in-out flex-shrink` }>
                                                <Collapsible defaultOpen={ true } className="group/collapsible">
                                                    <Label
                                                        className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                                        <CollapsibleTrigger >
                                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                        </CollapsibleTrigger>
                                                    </Label>
                                                    <CollapsibleContent>
                                                        <div className={ `flex flex-col items-stretch justify-stretch` }>
                                                            { buildFormControls() }
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>

                                            </div>

                                            {/* <div className={ `flex flex-col items-stretch justify-stretch w-1/2 h-full` }> */ }
                                            <div className={ `flex flex-col items-stretch justify-stretch h-full transition-all duration-400 ease-in-out w-full flex-grow` }>
                                                {/* { buildFieldSelectInput( formSchema, activeFields ) } */ }
                                                { activeFields && formSchema && (
                                                    <ToggleSection
                                                        // options={ Object.keys( formSchema )?.map( ( fieldKey ) => ( fieldKey ) ) }
                                                        options={ allFields }
                                                        requiredOptions={ requiredFields }
                                                        active={ activeFields }
                                                        setActive={ setActiveFields }
                                                        title={ "Optional Fields" }
                                                        // handleChange={ ( field ) => ( handleChangeActiveFields( field, field ) ) }
                                                        handleChange={ handleChangeActiveFields }
                                                        useCheckboxes={ false }
                                                    />
                                                ) }
                                            </div>
                                        </TabsContent>

                                    </Tabs>
                                </div> ) }

                                <div className={ `flex flex-col h-full min-h-full max-h-full items-center justify-start transition-all duration-500 ease-in-out overflow-autos flex-grow ${ openSidebar ? '!w-9/12' : '!w-full' }` }>
                                    {/* The form */ }

                                    <div className={ `flex flex-row justify-start w-full h-fit py-2 px-2 gap-2` }>

                                        { ( showSidebar === true ) && ( <Button
                                            size={ 'sm' }
                                            variant={ 'outline' }
                                            className={ `m-0 rounded-full h-10 w-10` }
                                            onClick={ ( e ) => {
                                                e.preventDefault();
                                                if ( showSidebar === true ) setOpenSidebar( !openSidebar );
                                            } }
                                        >
                                            <LucideChevronsLeftRight className={ `p-0 m-0 !size-6 !stroke-1 transition-all duration-1000 ease-linear hover:animate-rotate` } />
                                        </Button> ) }

                                        {/* { buildFieldSelectInput( formSchema, activeFields ) } */ }

                                        <Button
                                            size={ 'sm' }
                                            variant={ 'outline' }
                                            className={ `m-0 rounded-full h-10 w-10` }
                                            onClick={
                                                ( e ) => {
                                                    // Reload the form in case something went wonky.
                                                    e.preventDefault();
                                                    handleInitializeFormModel();
                                                }
                                            }
                                        >
                                            <RefreshCcw className={ `p-0 m-0 !size-6 !stroke-1 self-center transition-all duration-100 ease-linear hover:animate-rotate` } />
                                        </Button>
                                    </div>

                                    <div className={ `flex flex-col justify-start w-full h-full gap-2` }>
                                        { generateForm( formSchema, formData ) }
                                    </div>

                                    <div className={ `flex-row gap-2 w-full self-center items-center justify-center` }>
                                        <Button
                                            variant={ `destructive` }
                                            onClick={ ( e ) => {
                                                e.preventDefault();
                                                if ( window.confirm( 'Are you sure?' ) ) { onCancel(); }
                                            } }
                                        >
                                            Cancel
                                        </Button>

                                        { submitButton
                                            ? ( submitButton )
                                            : ( <Button
                                                type="submit"
                                                variant={ `primary` }
                                                onClick={ ( e ) => {
                                                    e.preventDefault();
                                                    if ( debug === true )
                                                        console.log( "FormGenerator :: BUTTON onSubmit triggered :: formData = ", formData );
                                                    onSubmit( formData );
                                                    // handleOnSubmit( formData );
                                                } }
                                            >
                                                Submit
                                            </Button> ) }

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div> )
                : ( <Spinner
                    // pulse | wave | dots | circles | bars | grid | ripple | orbit |
                    variant={ 'circles' }
                    size={ 'md' }
                    color={ 'currentColor' }
                    overlay={ false }
                    className={ `` }
                /> )
            }
        </form >
    );
};


const FormGeneratorField = ( props ) => {
    const {
        debug = false,
        isActiveField = true,
        formModel,
        formData,
        setFormData,
        formSchema,
        fieldModel,
        setFormModel,
        fieldSchema,
        fieldData,
        fieldKey,
        key,
        path = [],
        refData = {},
        refSchemas = {},
        handleChange,
        initialDataAutofillRandom = false,
        useMultiSelectForObjectIds = true,
        useSlidersForNumbers = true,
        useSwitchesForBoolean = true,
        useBadgesForStringArrays = true,
        useDateRangeForDateArrays = true,
        useDateTimeLocalForDateInputs = true,
        useRadialForDecimals = true,
        layout,
        classNames = '',
        inputClassNames = '',
        // ...props
    } = props;

    // const [ fieldInputData, setFieldInputData ] = useState( { ...fieldData } );
    /* 
        const handleDeepChange = ( data, path, value ) => {
            if ( debug === true )
                console.log(
                    "FORM GENERATOR",
                    "\n ::: handleDeepChange",
                    "\n :: ", "data = ", data,
                    "\n :: ", "path = ", path,
                    "\n :: ", "value = ", value
                );
    
            //  const submitHandle = (e) => {
            //         e.preventDefault();
            //         console.log("clicked");
            //         const newArr = [...arr, { name: text.name, DOBs: text.DOBs, id: uuid() }];
            //         console.log("newarr", newArr);
            //         setArr(newArr);
            //         setText({ name: "", DOBs: "" });
            //     };
           
    
            if ( data && value && path ) {
                setFormData(
                    deepPathSet(
                        { ...data },
                        path,
                        value,
                    )
                );
            }
        };
    
        const bla = ( workspaceId ) => ( data, key, field ) => { };
    */

    const generateFormField = ( {
        fieldModel,
        fieldSchema,
        fieldData,
        fieldKey,
        key,
        path = [],
        classNames = '',
    } ) => {
        // let fieldKey = fieldModel?.key;
        let elementSchema = fieldModel?.elementSchema;
        let dataType = fieldModel?.dataType;
        let fieldType = fieldModel?.fieldType;
        let type = fieldModel?.type;

        // TODO :: Move this part back up into the generateForm part and pass it all the way down. 
        let value = fieldData
            ? ( utils.val.isValidArray( fieldData, true ) && fieldType !== 'Array'
                ? ( fieldData[ 0 ] )
                : ( fieldData )
            )
            : typeToInitialDefault( elementSchema, fieldData?.defaultValue );

        // Special case for checkboxes.
        if ( fieldType === 'Checkbox' || fieldType === 'Switch' ) value = !!value ?? fieldModel?.defaultChecked;

        let keyLabel = '';
        if ( utils.val.isValid( value ) ) {
            // Only show key if there is a value to show, else we get indexes floating in the middle of nowhere if we delete all elements in an array. 
            keyLabel = convertCamelCaseToSentenceCase(
                utils.val.isValid( fieldKey )
                    ? String( fieldKey )
                    : fieldModel?.label
            );
        }

        // Fetch the unique identifier from the schema. 
        // Use the fieldKey for data traversal; use the uuid for limiting unnecessary updates.
        let uuid = fieldModel?.uuid ?? null;
        return (
            <InputField
                uuid={ uuid }
                id={ fieldKey }
                key={ fieldKey }
                fieldKey={ fieldKey }
                path={ path }
                // label={ keyLabel }
                classNames={ twMerge(
                    `flex flex-row justify-stretch items-stretch w-full h-min`,
                    `hover:bg-sextary-100/20`,
                    `rounded-xl`,
                ) }
                inputClassName={ `` }
                labelClassName={ twMerge(
                    typeof keyLabel === Number ? `!w-1/12` : `!w-2/6`,
                ) }
            >
                { ( <InputField.Label
                    // value={ value }
                    label={ keyLabel }
                    uuid={ uuid }
                    key={ fieldKey }
                    fieldKey={ fieldKey }
                    required={ fieldModel?.required ?? false }
                    classNames={ twMerge(
                        ( !isNaN( fieldKey ) ) ? `!w-min !min-w-1/12` : `!w-2/12 !min-w-2/12`,
                    ) }
                /> ) }
                <div className={ twMerge(
                    `flex flex-row h-fit p-0 m-0`,
                    // `border border-spacing-2`,
                    ( !isNaN( fieldKey ) ) ? `!w-11/12 !min-w-11/12` : `!w-10/12 !min-w-10/12`,
                ) }
                >
                    <FormGeneratorFieldInput
                        debug={ debug }
                        formData={ { ...formData } } setFormData={ setFormData }
                        formModel={ formModel } setFormModel={ setFormModel }
                        formSchema={ formSchema }
                        fieldModel={ fieldModel }
                        fieldSchema={ fieldSchema }
                        fieldData={ fieldData }
                        value={ value }
                        key={ fieldKey }
                        fieldKey={ fieldKey }
                        fieldLabel={ keyLabel }
                        uuid={ uuid }
                        path={ path }
                        classNames={ `` }
                        handleChange={ handleChange }
                        initialDataAutofillRandom={ initialDataAutofillRandom }
                        useMultiSelectForObjectIds={ useMultiSelectForObjectIds }
                        useSlidersForNumbers={ useSlidersForNumbers }
                        useSwitchesForBoolean={ useSwitchesForBoolean }
                        useBadgesForStringArrays={ useBadgesForStringArrays }
                        useDateRangeForDateArrays={ useDateRangeForDateArrays }
                        useRadialForDecimals={ useRadialForDecimals }
                        useDateTimeLocalForDateInputs={ useDateTimeLocalForDateInputs }
                        layout={ layout }
                        refData={ refData }
                        refSchemas={ refSchemas }
                    // { ...props }
                    />
                </div>
            </InputField>
        );
    };

    return (
        <>
            { formData
                && isActiveField === true
                && ( generateFormField( {
                    fieldModel: fieldModel,
                    fieldSchema: fieldSchema,
                    fieldData: fieldData,
                    fieldKey: key,
                    path: path,
                    classNames: classNames,
                    ...props
                } ) ) }
        </>
    );
};
// , [ formSchema, formData ]
// , [    formData ]
// );

FormGenerator.FormGeneratorField = FormGeneratorField;

const FormGeneratorFieldInput = ( props ) => {
    const {
        fieldName,
        field,
        renderField,
        data,
        debug = false,
        formModel,
        setFormModel,
        formData,
        setFormData,
        formSchema,
        fieldModel,
        fieldSchema,
        fieldData,
        fieldKey,
        key,
        path = [],
        refData = {},
        refSchemas = {},
        handleChange,
        initialDataAutofillRandom = false,
        useMultiSelectForObjectIds = true,
        useSlidersForNumbers = true,
        useDateTimeLocalForDateInputs = true,
        useSwitchesForBoolean = true,
        useBadgesForStringArrays = true,
        useDateRangeForDateArrays = true,
        useRadialForDecimals = true,
        layout,
        classNames = '',
        // ...props
    } = props;

    const handleAddArrayItem = ( model, data, value, path ) => {
        // Add a new item to the list. 

        let currObjs = (
            utils.val.isDefined( value, true )
                ? ( utils.val.isValidArray( value, true )
                    ? ( [ ...value ] ) // Defined and is array.
                    : ( utils.val.isObject( value, true )
                        ? ( [ value ] )
                        : ( null )
                    ) // Defined but is not array. 
                )
                : ( null ) // Undefined
        );

        let newObj = typeToInitialDefault( model?.elementSchema, model?.defaultValue );

        let updatedObjs = [ newObj ];
        if ( currObjs && Array.isArray( currObjs ) && currObjs.length > 0 ) {
            if ( currObjs?.length > 0 ) { updatedObjs = [ ...currObjs, newObj ]; }
        }

        console.log(
            'FormGenerator',
            '\n :: handleAddArrayItem',
            "\n :: ", "+BUTTON on array element",
            "\n :: ", "path = ", path,
            "\n :: ", "model = ", model,
            "\n :: ", "value = ", value,
            "\n :: ", "(form)data = ", data,
            "\n :: ", "newObj = ", newObj,
            "\n :: ", "currObjs = ", currObjs,
            "\n :: ", "updatedObjs = ", updatedObjs,
        );

        handleChange(
            data,
            path,
            updatedObjs
        );

        if ( debug === true )
            console.log(
                'FormGenerator',
                ' :: handleAddArrayItem',
                " :: ", "+BUTTON on array element",
                " :: ", "currObjs = ", currObjs,
                // " :: ", "key = ", key,
                " :: ", "formData = ", data,
                " :: ", "value = ", value,
                " :: ", "path = ", path,
                " :: ", "newObj = ", newObj,
            );
    };

    const handleDeleteArrayItem = ( data, value, path, index ) => {
        let currObjs = (
            utils.val.isValidArray( value, true )
                ? ( value )
                : ( [ value ] )
        );

        // Remove the index-th item from currObjs and insert it back into formData. 
        if ( utils.val.isValid( currObjs ) ) {
            // Made sure it's valid.
            if ( index > -1 && index < currObjs?.length ) {
                // Remove this entry from the data.
                // currObjs = currObjs.splice( index, 1 );
                currObjs = currObjs.filter( ( o, i ) => i !== index );

                handleChange(
                    data,
                    path,
                    currObjs
                );

                if ( debug === true )
                    console.log(
                        'FormGenerator',
                        " :: ", "DELETE BUTTON on array element",
                        " :: ", "formData = ", formData,
                        " :: ", "currObjs = ", currObjs,
                        " :: ", "value = ", value,
                        " :: ", "data = ", data,
                        " :: ", "index = ", index,
                    );
            }
        }
    };

    const handleAddObjectProperty = ( objSchema, data, value, path ) => {
        // Add a new property to the object. 
        e.preventDefault();

        // Schema for this obj is in the type field. 
        // Object.keys( fieldSchemaType ).forEach( ( k, i ) => {
        //     let v = fieldSchemaType[ k ];
        //     console.log( "FORM GENERATOR :: Object input +button :: v = ", v, " :: ", "fieldSchemaType = ", fieldSchemaType, " :: ", "" );
        //     // v will be {type: 'something'}.
        //     if ( v.hasOwnProperty( 'type' ) ) {
        //         // Has a type. Extract and create initial data with it.
        //         newObj[ k ] = typeToInitialDefault( v?.type );
        //     }
        // } );

        // We have a prefabricated initialized value to append. 
        // Make use of the initialData stored in the objSchema. 
        let newObj = {};
        if ( objSchema.hasOwnProperty( 'data' ) ) { newObj = objSchema?.data; }
        else { newObj = typeToInitialDefault( fieldSchemaType ); }

        let currObjs = (
            utils.val.isValidArray( value, true )
                ? ( value )
                : ( [ value ] )
        );

        /* setFormData( deepPathSet( formData, [ ...path ], [ ...currObjs, newObj ] ) ); */

        handleChange( data, [ ...path ], [ ...currObjs, newObj ] );

        if ( debug === true )
            console.log(
                "FormGenerator",
                " :: ", "+button on object element",
                " :: ", "fieldKey = ", fieldKey,
                " :: ", "fieldModel = ", fieldModel,
                " :: ", "currObjs = ", currObjs
            );
    };

    const generateFormFieldInput = ( {
        fieldModel,
        fieldSchema,
        fieldData,
        fieldKey,
        path,
        // key,
        // fieldKey,
        // dataType,
        // fieldType,
        // keyLabel,
        // uuid,
        // value,
        // defaultValue,
        classNames = '',
    } ) => {
        // let fieldKey = fieldModel?.key;
        let elementSchema = fieldModel?.elementSchema;
        let dataType = fieldModel?.dataType;
        let fieldType = fieldModel?.fieldType;
        let type = fieldModel?.type;
        let onChange = fieldModel?.onChange;
        let required = fieldModel?.required;
        // let fieldPath = fieldModel?.path;
        let value = fieldData
            ? ( utils.val.isValidArray( fieldData, true ) && fieldType !== 'Array'
                ? ( fieldData[ 0 ] )
                : ( fieldData )
            )
            : typeToInitialDefault( elementSchema, fieldData?.defaultValue );
        let defaultValue = fieldData?.defaultValue
            ? fieldData?.defaultValue
            : ( fieldModel?.defaultValue
                ? ( fieldModel?.defaultValue )
                : ( utils.val.isValidArray( value, true )
                    ? value[ 0 ]
                    : value
                )
            );
        // let initialValue = fieldData.hasOwnProperty( fieldKey )
        //     ? fieldData[ fieldKey ]
        //     : ( fieldData
        //         ? fieldData
        //         : value
        //     );

        // Special case for checkboxes.
        if ( fieldType === 'Checkbox' || fieldType === 'Switch' ) value = !!value ?? fieldModel?.defaultChecked;

        let keyLabel = '';
        if ( utils.val.isValid( value ) ) {
            // Only show key if there is a value to show, else we get indexes floating in the middle of nowhere if we delete all elements in an array. 
            if ( utils.val.isValid( fieldKey ) ) { keyLabel = convertCamelCaseToSentenceCase( fieldKey ? String( fieldKey ) : fieldModel?.label ); }
            else { keyLabel = fieldModel?.label; }
        }

        let subFields = fieldModel?.fields
            ? fieldModel?.fields
            : [];
        let fieldSchemaType = fieldModel?.schema?.type
            ? fieldModel?.schema?.type
            : fieldModel?.type;

        let inputContainerClassNames = twMerge(

            // Base styles
            `flex flex-row gap-2 w-full h-fit `,
            'items-start justify-center px-1 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 text-left gap-2',
            // ' flex flex-row justify-center items-center h-full text-left content-stretch',

            // Border basics
            `border-b-${ layout?.border?.width ? layout?.border?.width[ 0 ] : 0 } border-l-${ layout?.border?.width ? layout?.border?.width[ 1 ] : 0 } border-t-${ layout?.border?.width ? layout?.border?.width[ 2 ] : 0 }border-r-${ layout?.border?.width ? layout?.border?.width[ 3 ] : 0 }`,

            // Light-mode focus state
            `focus:ring-${ layout?.border?.color ? layout?.border?.color : 'black' }-500`,

            // Dark-mode focus state
            // `dark:focus:border-teal-400 dark:focus:ring-teal-400`,

            // true
            //     // Selected / hover states
            //     ? `border-teal-500 bg-teal-500 text-white hover:bg-teal-600`

            //     // Unselected / hover state
            //     : `border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`,

            // true &&
            // // Dark-mode unselected state (selected is the same)
            // `dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`,
        );

        let uuid = fieldModel?.uuid ?? null;
        /* let label = (
            <Label
                id={ fieldKey }
                key={ `form-generator-label-${ fieldKey }` }
                name={ fieldKey }
                htmlFor={ `${ fieldKey }` }
                className={ `text-left content-stretch justify-center items-center inline-block whitespace-nowrap max-w-2/6 min-w-2/6 w-2/6 overflow-hidden text-ellipsis hover:overflow-ellipsis text-wrap h-full ` }
            >
                { keyLabel }
            </Label>
        ); */

        const commonProperties = {
            uuid: uuid,
            path: path,
            data: value,
            id: fieldKey,
            key: fieldKey,
            label: keyLabel,
            fieldKey: fieldKey,
            model: fieldModel,
            schema: fieldSchema,
            required: required,
            classNames: classNames,
            value: value,
            initialValue: value,
            defaultValue: defaultValue,
            ...{
                ...( fieldModel?.minLength ? { min: fieldModel?.minLength } : {} ),
                ...( fieldModel?.min ? { min: fieldSchema?.min } : {} ),
                ...( fieldModel?.maxLength ? { max: fieldModel?.maxLength } : {} ),
                ...( fieldModel?.max ? { max: fieldSchema?.max } : {} ),
            }
        };

        if ( debug === true )
            console.log(
                "FORM GENERATOR",
                "\n :: ", "generateFormFieldInput ",
                "\n :: ", "GLOBALS: ",
                // "\n :: ", "formModel = ", formModel,
                "\n :: ", "formData = ", formData,
                // "\n :: ", "formSchema = ", formSchema,

                "\n :: ", "renderField :: LOCALS: ",
                // "\n :: ", "fieldPath = ", fieldPath,
                "\n :: ", "fieldKey = ", fieldKey,
                "\n :: ", "keyLabel = ", keyLabel,
                "\n :: ", "value = ", value,
                "\n :: ", "defaultValue = ", defaultValue,
                "\n :: ", "subFields = ", subFields,
                "\n :: ", "fieldSchemaType = ", fieldSchemaType,
                "\n :: ", "fieldModel = ", fieldModel,
                "\n :: ", "fieldSchema = ", fieldSchema,
                "\n :: ", "fieldData = ", fieldData,
                "\n :: ", "path = ", path,
                "\n :: ", "fieldModel?.path = ", fieldModel?.path,
                "\n :: ", "dataType = ", dataType,
                "\n :: ", "fieldType = ", fieldType,
            );

        // Infer the data type by combining the schema and the initial data, and 
        // pull an initial value OR generate one if need be. 
        switch ( dataType ) {

            case 'String':
                if ( fieldModel?.options && utils.val.isValidArray( fieldModel?.options, true ) ) {
                    return (
                        <InputField.Enum
                            model={ fieldModel }
                            schema={ fieldSchema }
                            data={ value }
                            placeholder={ fieldModel?.ref }
                            label={ keyLabel }
                            id={ fieldKey }
                            uuid={ uuid }
                            fieldKey={ fieldKey }
                            path={ path }
                            value={ value }
                            defaultValue={ defaultValue }
                            initialValue={ value }
                            required={ required }
                            classNames={ classNames }
                            { ...{ ...commonProperties } }
                            options={ [ { name: 'Add New', value: "createItem" }, ...fieldModel?.options ] }
                            onChange={
                                ( key, value ) => {
                                    if ( debug === true )
                                        console.log(
                                            "FORM GENERATOR",
                                            " :: ", "TEXT / ENUM",
                                            " :: ", "formData = ", formData,
                                            " :: ", "path = ", path,
                                            " :: ", "value = ", value,
                                        );
                                    handleChange( formData, path, value );
                                    // setFormData( deepPathSet( formData, path, value ) );
                                }
                            }
                        />
                    );
                }
                else if ( value && utils.val.isString( value ) && value?.startsWith( "#", 0 ) ) {
                    if ( debug === true )
                        console.log( "FormGeneratorInput :: Color string type. :: value = ", value );

                    return (
                        <InputField.Color
                            uuid={ uuid }
                            label={ keyLabel }
                            id={ fieldKey }
                            fieldKey={ fieldKey }
                            path={ path }
                            value={ value }
                            defaultValue={ value }
                            classNames={ classNames }
                            onChange={ ( value ) => {
                                if ( debug === true )
                                    console.log(
                                        "FORM GENERATOR",
                                        " :: ", "TEXT / COLOR",
                                        " :: ", "formData = ", formData,
                                        " :: ", "path = ", path,
                                        " :: ", "value = ", value,
                                    );
                                setFormData( deepPathSet( formData, path, value ) );
                            } }
                        />
                    );
                }
                else if ( fieldSchema?.hasOwnProperty( 'inputType' ) && fieldSchema?.inputType === 'wysiwyg' ) {
                    return (
                        <InputField.Editor
                            uuid={ uuid }
                            id={ fieldKey }
                            key={ fieldKey }
                            fieldKey={ fieldKey }
                            path={ path }
                            value={ value }
                            defaultValue={ value }
                            label={ keyLabel }
                            placeholder={ keyLabel }
                            required={ required }
                            classNames={ classNames }
                            { ...{ ...commonProperties } }
                            minLength={ fieldModel?.minLength ?? null }
                            maxLength={ fieldModel?.maxLength ?? null }
                            onChange={ ( value ) => {
                                // setFormData( deepPathSet( formData, path, value ) );
                                handleChange( formData, path, value );
                            } }
                        />
                    );
                }
                else if ( fieldType && fieldType === 'Textarea' ) {
                    return (
                        <InputField.TextArea
                            uuid={ uuid }
                            id={ fieldKey }
                            key={ fieldKey }
                            fieldKey={ fieldKey }
                            path={ path }
                            value={ value }
                            defaultValue={ value }
                            label={ keyLabel }
                            placeholder={ keyLabel }
                            required={ required }
                            { ...{ ...commonProperties } }
                            minLength={ fieldModel?.minLength ?? null }
                            maxLength={ fieldModel?.maxLength ?? null }
                            classNames={ classNames }
                            onChange={ ( value ) => {
                                // e.preventDefault();
                                // let value = e.target.value;
                                if ( debug === true )
                                    console.log(
                                        "FORM GENERATOR",
                                        " :: ", "TEXT / TEXTAREA",
                                        " :: ", "formData = ", formData,
                                        " :: ", "path = ", path,
                                        " :: ", "value = ", value,
                                    );
                                // handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                                // setFormData( deepPathSet( formData, path, value ) );
                                handleChange( formData, path, value );
                            } }
                        />
                    );
                }
                else {
                    return (
                        <InputField.Text
                            uuid={ uuid }
                            id={ fieldKey }
                            key={ fieldKey }
                            fieldKey={ fieldKey }
                            label={ keyLabel }
                            path={ path }
                            value={ value }
                            defaultValue={ value }
                            required={ required }
                            placeholder={ keyLabel }
                            { ...{ ...commonProperties } }
                            minLength={ fieldModel?.minLength ?? null }
                            maxLength={ fieldModel?.maxLength ?? null }
                            classNames={ classNames }
                            useOnChangeUpdate={ true }
                            useOnBlurUpdate={ false }
                            useOnFocusUpdate={ false }
                            onChange={ ( value ) => {
                                // e.preventDefault();
                                // let value = e.target.value;
                                if ( debug === true )
                                    console.log(
                                        "FORM GENERATOR",
                                        " :: ", "TEXT / TEXT",
                                        " :: ", "formData = ", formData,
                                        " :: ", "path = ", path,
                                        " :: ", "value = ", value,
                                    );
                                // handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                                // setFormData( deepPathSet( formData, path, value ) );
                                handleChange( formData, path, value );
                            } }
                        />
                    );
                }
                break;

            case 'Date':
            case 'DateTime':
            case 'DateTimeLocal':
                return (
                    <InputField.Date
                        id={ fieldKey }
                        name={ fieldKey }
                        uuid={ uuid }
                        // type={ dataType.toLowerCase() }
                        type={ useDateTimeLocalForDateInputs ? 'datetime-local' : dataType.toLowerCase() }
                        fieldKey={ fieldKey }
                        label={ keyLabel }
                        value={
                            useDateTimeLocalForDateInputs
                                ? ( value ? formatDateTime( value ) : null )
                                : ( value ? dateFormatYYYYMMDD( value ) : null )
                        }
                        // defaultValue={ useDateTimeLocalForDateInputs ? formatDateTime( new Date( value ) ) : formatDateYYYYMMDD( new Date( value ) ) }
                        classNames={ classNames }
                        onChange={ ( e ) => {
                            e.preventDefault();
                            // const { id, name, value } = e.target;
                            console.log( "Date provided: ", e.target.value );
                            handleChange(
                                formData,
                                [ ...( path ? path : fieldModel?.path ) ],
                                useDateTimeLocalForDateInputs
                                    ? ( new Date( e?.target?.value ) )
                                    : ( dateFormatYYYYMMDD( new Date( e?.target?.value ) ) )
                            );
                        } }
                    />
                );
                break;

            case 'Decimal':
                return ( <InputField.Decimal
                    uuid={ uuid }
                    id={ fieldKey }
                    fieldKey={ fieldKey }
                    label={ keyLabel }
                    path={ path }
                    classNames={ classNames }
                    useSlidersForNumbers={ useSlidersForNumbers }
                    min={ ( fieldSchema?.min ) ?? 0.0 }
                    max={ ( fieldSchema?.max ) ?? 100.0 }
                    step={ fieldSchema?.step ?? 0.01 }
                    // value={ [ value ?? 0 ] }
                    // value={ value }
                    value={ useSlidersForNumbers ? [ value ?? 0 ] : value }
                    defaultValue={ useSlidersForNumbers ? [ value ?? 0 ] : value }
                    onChange={ ( value ) => {
                        if ( debug === true )
                            console.log(
                                "FORM GENERATOR",
                                " :: ", "DECIMAL / SLIDER | NUMBER",
                                " :: ", "formData = ", formData,
                                " :: ", "fieldModel?.path = ", fieldModel?.path,
                                " :: ", "path = ", fieldModel?.path,
                                " :: ", "value = ", value
                            );

                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                    } }
                /> );
                break;

            case 'Int32':
                return ( <InputField.Int32
                    id={ fieldKey }
                    uuid={ uuid }
                    fieldKey={ fieldKey }
                    label={ keyLabel }
                    path={ path }
                    classNames={ classNames }
                    useSlidersForNumbers={ useSlidersForNumbers }
                    min={ ( fieldSchema?.min ) ?? 0 }
                    max={ ( fieldSchema?.max ) ?? 100 }
                    skipInterval={ 10 }
                    step={ fieldSchema?.step ?? 1 }
                    value={ useSlidersForNumbers ? [ Math.floor( Number( value ) ) ?? 0 ] : Math.floor( Number( value ) ) }
                    defaultValue={ useSlidersForNumbers ? [ value ?? 0 ] : value }
                    onChange={ ( value ) => {
                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], Math.floor( Number( value ) ) );
                    } }
                /> );
                break;

            case 'Number':
                return ( <InputField.Number
                    id={ fieldKey }
                    uuid={ uuid }
                    fieldKey={ fieldKey }
                    label={ keyLabel }
                    path={ path }
                    classNames={ classNames }
                    useSlidersForNumbers={ useSlidersForNumbers }
                    min={ ( fieldSchema?.min ) ?? 0 }
                    max={ ( fieldSchema?.max ) ?? 100 }
                    step={ fieldSchema?.step ?? 1 }
                    // value={ [ value ?? 0 ] }
                    // value={ value }
                    // defaultValue={ value }
                    value={ useSlidersForNumbers ? [ value ?? 0 ] : value }
                    defaultValue={ useSlidersForNumbers ? [ value ?? 0 ] : value }
                    onChange={ ( value ) => {
                        if ( debug === true )
                            console.log(
                                "FORM GENERATOR",
                                " :: ", "NUMBER / SLIDER | NUMBER",
                                " :: ", "formData = ", formData,
                                " :: ", "fieldModel?.path = ", fieldModel?.path,
                                " :: ", "path = ", fieldModel?.path,
                                " :: ", "value = ", value
                            );
                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], Number( value ) );
                        /* setFormData(
                            deepPathSet(
                                formData,
                                [ ...( path ? path : fieldModel?.path ) ],
                                Number( value )
                            )
                        ); */
                    } }
                /> );
                break;

            case 'Boolean':
                // let active = fieldData && fieldData.hasOwnProperty( fieldKey ) ? fieldData[ fieldKey ] : false || fieldSchema?.default;
                return ( <InputField.Boolean
                    id={ fieldKey }
                    uuid={ uuid }
                    fieldKey={ fieldKey }
                    label={ keyLabel }
                    path={ path }
                    classNames={ classNames }
                    useSwitchesForBoolean={ useSwitchesForBoolean }
                    value={ value }
                    defaultChecked={ value }
                    onChange={ ( checked ) => {
                        if ( debug === true )
                            console.log(
                                "FORM GENERATOR",
                                " :: ", "BOOLEAN / SWITCH | CHECKBOX",
                                " :: ", "formData = ", formData,
                                " :: ", "fieldModel?.path = ", fieldModel?.path,
                                " :: ", "path = ", fieldModel?.path,
                                " :: ", "value = ", value,
                                " :: ", "checked = ", checked,
                            );
                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], checked );
                    } }
                /> );
                break;

            case 'Object':
                // let subFields = fieldModel?.fields ? fieldModel?.fields : [];
                // let fieldSchemaType = fieldModel?.schema?.type ? fieldModel?.schema?.type : fieldModel?.type;
                // ( utils.val.isObject( type ) )
                // && ( !Array.isArray( type ) )
                // && ( ![ 'String', 'Date', 'Number', 'Array', 'Decimal', 'Boolean' ].includes( type ) )
                // // This is a regular object with fields. 
                if ( debug === true )
                    console.log(
                        "Form Generator",
                        "\n :: ", "OBJECT TYPE",
                        "\n :: ", "fieldSchemaType = ", fieldSchemaType,
                        "\n :: ", "fieldModel = ", fieldModel,
                        "\n :: ", "Object.keys( fieldSchemaType ) = ", Object.keys( fieldSchemaType ),
                        "\n :: ", "type = ", type,
                        "\n :: ", "fieldModel = ", fieldModel,
                        "\n :: ", "subFields = ", subFields,
                        "\n :: ", "value = ", value,
                    );
                return (

                    <Collapsible defaultOpen={ true } className="group/collapsible w-full h-full !p-0 !m-0">
                        <CollapsibleTrigger className={ `w-full h-fit border !p-1 !m-0 !transition-all !transform-none shadow-sextary-900 shadow-2xl` }>
                            {/* <div className={ `w-full h-full !p-0 !m-0 text-sm text-primary-600 align-text-bottom font-sans font-extrabold` }>
                            </div> */}
                            <ChevronRight className={ `aspect-square size-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90` } />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <InputField
                                uuid={ uuid }
                                fieldKey={ fieldKey }
                                key={ fieldKey }
                                id={ fieldKey }
                                path={ path }
                                // label={ keyLabel }
                                layout={ layout }
                                classNames={ `!w-full !flex-col !items-stretch !justify-stretch` }
                                labelClassName={ `` }
                                inputClassName={ `` }
                            >
                                {/* <InputField.Label
                            // value={ value }
                            uuid={ uuid }
                            key={ fieldKey }
                            label={ keyLabel }
                            fieldKey={ fieldKey }
                            required={ required }
                        /> */}





                                {/* TODO :: USE THIS TO ADD NEW OBJECT FIELDS */ }
                                {/* TODO :: USE THIS TO ADD NEW OBJECT FIELDS */ }
                                {/* TODO :: USE THIS TO ADD NEW OBJECT FIELDS */ }
                                {/* TODO :: USE THIS TO ADD NEW OBJECT FIELDS */ }
                                {/* TODO :: USE THIS TO ADD NEW OBJECT FIELDS */ }



                                {/* 
                        <Button
                            className={ `rounded-xl hover:bg-bodysecondary` }
                            size={ 'sm' }
                            variant={ `ghost` }
                            onClick={ ( e ) => {
                                // Add a new item to the list. 
                                e.preventDefault();

                                // Schema for this obj is in the type field. 
                                // let newObj = {};
                                // // Object.keys( fieldSchemaType ).forEach( ( k, i ) => {
                                // //     let v = fieldSchemaType[ k ];
                                // //     console.log( "FORM GENERATOR :: Object input +button :: v = ", v, " :: ", "fieldSchemaType = ", fieldSchemaType, " :: ", "" );
                                // //     // v will be {type: 'something'}.
                                // //     if ( v.hasOwnProperty( 'type' ) ) {
                                // //         // Has a type. Extract and create initial data with it.
                                // //         newObj[ k ] = typeToInitialDefault( v?.type );
                                // //     }
                                // // } );
    
                                // if ( fieldModel.hasOwnProperty( 'data' ) ) {
                                //     // We have a prefabricated initialized value to append. 
                                //     newObj = fieldModel?.data;
                                // }
                                // else {
                                //     newObj = typeToInitialDefault( fieldSchemaType );
                                // }
    
                                // if ( debug === true )
                                //     console.log( "FORM GENERATOR :: newObj = ", newObj, " :: ", "value = ", value );
                                // let currObjs = (
                                //     utils.val.isValidArray( fieldData, true )
                                //         ? ( fieldData )
                                //         : ( [ fieldData ] )
                                // );
    
                                // setFormData(
                                //     deepPathSet(
                                //         formData,
                                //         [ ...path ],
                                //         [ ...currObjs, newObj ],
                                //     )
                                // );
                                // if ( debug === true )
                                //     console.log( 'FormGenerator :: +button on object element :: fieldKey = ', fieldKey, " :: ", "fieldModel = ", fieldModel, " :: ", "currObjs = ", currObjs ); 

                                handleAddObjectProperty( formModel, formData, value, path );
                            } }
                        >
                            <PlusCircle />
                        </Button>
                         */}
                                {/* { Object.keys( fieldSchemaType ).map( ( subKey, index ) => { */ }
                                { Object.keys( subFields ).map( ( subKey, index ) => {
                                    let subField = subFields[ subKey ];
                                    let subFieldPath = [ ...( path ? path : fieldModel?.path ), subKey ];
                                    let subId = `${ subFieldPath?.join( '-' ) }`;
                                    let subFieldSchemaType = fieldSchemaType?.[ subKey ];
                                    // let subFieldDataValue = fieldData?.[ subKey ];
                                    let subFieldDataValue = value?.[ subKey ];
                                    if ( debug === true )
                                        console.log(
                                            "FormGenerator",
                                            "\n :: ", "Object type",
                                            "\n :: ", "subFields = ", subFields,
                                            "\n :: ", "fieldModel = ", fieldModel,
                                            "\n :: ", "fieldSchema = ", fieldSchema,
                                            "\n :: ", "fieldData = ", fieldData,
                                            "\n :: ", "fieldSchemaType = ", fieldSchemaType,
                                            "\n :: ", "type = ", type,
                                            "\n :: ", "value = ", value,
                                            "\n :: ", "subFieldDataValue = \'", subFieldDataValue, "\'",
                                            // "\n :: ", "key = ", key,
                                            "\n :: ", "fieldKey = ", fieldKey,
                                            "\n :: ", "index = ", index,
                                            "\n :: ", "subId = ", subId,
                                            "\n :: ", "subKey = ", subKey,
                                            "\n :: ", "subFields = ", subFields,
                                            "\n :: ", "subField = ", subField,
                                            "\n :: ", "subFieldPath = ", subFieldPath,
                                            "\n :: ", "subFieldSchemaType = ", subFieldSchemaType,
                                            // "\n :: ", "fieldSchema?.[ subKey ] = ", fieldSchema?.[ subKey ],
                                            "\n :: ", "value?.[ subKey ] = ", value?.[ subKey ],
                                            "\n :: ", "fieldData?.[ subKey ] = ", fieldData?.[ subKey ],
                                            "\n :: ", "subFieldPath = ", subFieldPath,
                                        );
                                    /* 
                                    const generatedField = memo(
                                        function memoizedGenerateField ( subField, fieldSchema, fieldData, subKey, subFieldPath ) {
                                            generateField(
                                                subField,
                                                fieldSchema?.[ subKey ],
                                                fieldData?.[ subKey ],
                                                subKey,
                                                subFieldPath,
                                            );
                                        }
                                    );
                         
                                    if ( debug === true )
                                        console.log( "FormGenerator :: Object type input :: generatedField = ", generatedField );
                                    */

                                    return (
                                        <div
                                            key={ `form-generator-object-field-${ [ ...subFieldPath ].join( '-' ) }` }
                                            className={ `object-array-subfield-input-field grid-flow-col hover:grid-flow-row items-start justify-stretch` }
                                        >
                                            <div
                                                className={ `w-full h-fit flex flex-col ` }
                                            >
                                                {/* {
                                            // useMemo(
                                            // () => 
                                            generateFormField( {
                                                fieldModel: subField,
                                                fieldSchema: subFieldSchemaType, // fieldSchema?.[ subKey ],
                                                fieldData: subFieldDataValue,
                                                key: subKey,
                                                path: subFieldPath,
                                                classNames: '',
                                                // ...props
                                            } )
                                            // )
                                        } */}
                                                <FormGeneratorField
                                                    formModel={ formModel }
                                                    formSchema={ formSchema }
                                                    debug={ debug }
                                                    fieldModel={ subField }
                                                    fieldSchema={ subFieldSchemaType }
                                                    fieldData={ subFieldDataValue }
                                                    formData={ { ...formData } }
                                                    setFormData={ setFormData }
                                                    // key={ subKey }
                                                    fieldKey={ subKey }
                                                    path={ subFieldPath }
                                                    handleChange={ handleChange }
                                                    initialDataAutofillRandom={ initialDataAutofillRandom }
                                                    useSlidersForNumbers={ useSlidersForNumbers }
                                                    useSwitchesForBoolean={ useSwitchesForBoolean }
                                                    useBadgesForStringArrays={ useBadgesForStringArrays }
                                                    useDateRangeForDateArrays={ useDateRangeForDateArrays }
                                                    useDateTimeLocalForDateInputs={ useDateTimeLocalForDateInputs }
                                                    useRadialForDecimals={ useRadialForDecimals }
                                                    layout={ layout }
                                                    refData={ refData }
                                                    classNames={ `` }
                                                // { ...props }
                                                />
                                            </div>
                                        </div>
                                    );
                                } ) }
                            </InputField>
                        </CollapsibleContent>
                    </Collapsible>
                );
                break;

            case 'ObjectId':
                // Field is an ObjectId.
                // Check to see if it's an ObjectID, or just a regular object with fields. 
                if ( fieldModel && fieldModel.hasOwnProperty( 'ref' ) ) {
                    // This is an objectId. 
                    // Turn it into a select switch for choosing an ID. 
                    if ( refData && utils.val.isValidArray( refData[ fieldModel?.ref ], true ) ) {
                        return (
                            useMultiSelectForObjectIds
                                ? ( <MultiSelectId
                                    // formGenerator={ }
                                    // formModel={ }
                                    // formSchema={ }
                                    multiple={ false }
                                    value={ value }
                                    refData={ refData }
                                    refSchemas={ refSchemas }
                                    schemaRefName={ fieldModel?.ref }
                                    optionSchema={ fieldSchema }
                                    formData={ formData }
                                    setFormData={ setFormData }
                                    // onClickAddOption={ () => {} }
                                    onCreateNewItem={ ( data ) => {
                                        if ( data ) {
                                            let currObjs = (
                                                value && utils.val.isDefined( value, true )
                                                    ? ( utils.val.isValidArray( value, true )
                                                        ? ( [ ...value ] ) // Defined and is array.
                                                        : ( [ value ] ) // Defined but is not array. 
                                                    )
                                                    : ( null ) // Undefined
                                            );

                                            let updatedObjs = [ data ];
                                            if ( currObjs && currObjs?.length > 0 ) {
                                                updatedObjs = [ ...currObjs, data ];
                                            }

                                            handleChange( formData, path, data );
                                            // handleAddArrayItem( fieldModel, formData, fieldData, path );
                                        }
                                    } }
                                    title={ keyLabel }
                                    placeholder={ keyLabel }
                                    fieldKey={ fieldKey }
                                    classNames={ `` }
                                    contentClassNames={ `` }
                                    optionClassNames={ `` }
                                    options={ fieldModel?.options }
                                    handleSubmit={ ( data ) => {
                                        // TODO :: Find a way to route the API path all the way down to the input element so it can submit the data itself and receive back a new _id.
                                        // handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value.concat( data ) );
                                        // On submit, change the refData to include this new item.
                                        setFormModel( {
                                            ...formModel,
                                            fieldKey: {
                                                ...fieldModel,
                                                options: [
                                                    ...fieldModel?.options,
                                                    { value: data?._id, name: data?.title }
                                                ]
                                            }
                                        } );
                                    } }
                                    handleChange={ ( value ) => {
                                        if ( debug === true )
                                            console.log(
                                                "FORM GENERATOR",
                                                "\n :: ", "MultiSelectId",
                                                "\n :: ", "formData = ", formData,
                                                "\n :: ", "path = ", path,
                                                "\n :: ", "value = ", value,
                                            );
                                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                                    } }
                                    onOptionClick={ ( value ) => {
                                        if ( debug === true )
                                            console.log( 'FormGenerator :: MultiSelectId :: onOptionClick :: options = ', fieldModel?.options, ' :: ', 'value = ', value );
                                        if ( dataType === '[ObjectId]' ) {
                                            if ( fieldData?.includes( value ) ) {
                                                // Remove
                                                handleChange(
                                                    formData,
                                                    [ ...( path ? path : fieldModel?.path ) ],
                                                    fieldData?.filter( ( v, i ) => ( v !== value ) )
                                                );
                                            }
                                            else {
                                                // Add
                                                handleChange(
                                                    formData,
                                                    [ ...( path ? path : fieldModel?.path ) ],
                                                    [ ...( utils.val.isValidArray( fieldData, true ) ? fieldData : [] ), value ]
                                                );
                                            }
                                        }
                                        else if ( dataType === 'ObjectId' ) {
                                            handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                                        }
                                    } }
                                    onOptionClear={ ( key, value ) => {
                                        handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], [] );
                                    } }
                                    useCheckboxes={ false }
                                />
                                )
                                : (
                                    fieldModel?.options
                                    && utils.val.isValidArray( fieldModel?.options, true )
                                    && ( <InputField.Enum
                                        uuid={ uuid }
                                        placeholder={ fieldModel?.ref }
                                        label={ keyLabel }
                                        id={ fieldKey }
                                        path={ path }
                                        classNames={ classNames }
                                        value={ value }
                                        defaultValue={ value }
                                        initialValue={ value }
                                        fieldKey={ fieldKey }
                                        options={ fieldModel?.options }
                                        onChange={
                                            ( key, value ) => {
                                                if ( debug === true )
                                                    console.log(
                                                        "FORM GENERATOR",
                                                        "\n :: ", "OBJECTID",
                                                        "\n :: ", "formData = ", formData,
                                                        "\n :: ", "path = ", path,
                                                        "\n :: ", "value = ", value,
                                                    );
                                                handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                                            }
                                        }
                                    /> )
                                )
                        );
                    }
                }
                break;

            case '[ObjectId]':
                if ( debug === true )
                    console.log( "FORM GENERATOR :: [ObjectId] :: formModel = ", formModel, formSchema, formData, " :: ", "fieldModel = ", fieldModel );

            /* if ( fieldModel && fieldModel.hasOwnProperty( 'ref' ) ) {
                // This is an objectId. 
                // Turn it into a select switch for choosing an ID. 
                if ( refData && utils.val.isValidArray( refData[ fieldModel?.ref ], true ) ) {
                    return ( ( <MultiSelectId
                        schemaRefName={ fieldModel?.ref }
                        optionSchema={ fieldSchema }
                        formData={ formData }
                        setFormData={ setFormData }
                        onClickAddOption={ () => { } }
                        onCreateNewItem={ ( data ) => {
                            if ( data ) {
                                let currObjs = (
                                    value && utils.val.isDefined( value, true )
                                        ? ( utils.val.isValidArray( value, true )
                                            ? ( [ ...value ] ) // Defined and is array.
                                            : ( [ value ] ) // Defined but is not array. 
                                        )
                                        : ( null ) // Undefined
                                );

                                let updatedObjs = [ data ];
                                if ( currObjs && currObjs?.length > 0 ) { updatedObjs = [ ...currObjs, data ]; }

                                handleChange( data, path, updatedObjs );
                                // handleAddArrayItem( fieldModel, formData, fieldData, path );
                            }
                        } }
                        title={ keyLabel }
                        placeholder={ keyLabel }
                        fieldKey={ fieldKey }
                        classNames={ `` }
                        contentClassNames={ `` }
                        optionClassNames={ `` }
                        options={ fieldModel?.options }
                        handleChange={ ( value ) => {
                            if ( debug === true )
                                console.log(
                                    "FORM GENERATOR",
                                    "\n :: ", "MultiSelectId",
                                    "\n :: ", "formData = ", formData,
                                    "\n :: ", "path = ", path,
                                    "\n :: ", "value = ", value,
                                );
                            handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                        } }
                        onOptionClick={ ( key, value ) => {
                            handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], value );
                            if ( fieldData?.includes( value ) ) {
                                // Remove
                                handleChange(
                                    formData,
                                    [ ...( path ? path : fieldModel?.path ) ],
                                    fieldData?.filter( ( v, i ) => ( v !== value ) )
                                );
                            }
                            else {
                                // Add
                                handleChange(
                                    formData,
                                    [ ...( path ? path : fieldModel?.path ) ],
                                    [ ...( utils.val.isValidArray( fieldData, true ) ? fieldData : [] ), value ]
                                );
                            }
                        } }
                        onOptionClear={ ( key, value ) => {
                            handleChange( formData, [ ...( path ? path : fieldModel?.path ) ], [] );
                        } }
                        useCheckboxes={ false }
                    />
                    ) );
                }
            }
            break;
        */
            case '[Object]':
                if ( debug === true )
                    console.log( "field is an [object]: fieldModel = ", fieldModel, " :: ", "fieldKey = ", fieldKey );
            case '[String]':
            case '[Date]':
            case '[DateTimeLocal]':
            case '[Int32]':
            case '[Number]':
            case '[Decimal]':
            case '[Boolean]':
            // TODO :: Make a Boolean-Array input: a line of checkboxes, with a + button at the right side to append a new one. 

            case 'ObjectArray':
            case 'ArrayArray':
            case 'Array':
                if ( value !== undefined && value !== null
                    // utils.val.isValidArray( value ) 
                    // || utils.val.isValidArray( fieldData ) 
                    // || utils.val.isValidArray( fieldModel?.data ) 
                ) {
                    let inputContainerId = `form-generator-label-${ fieldKey }`;
                    if ( debug === true )
                        console.log(
                            "Form Generator",
                            "\n :: ", "OBJECT TYPE",
                            "\n :: ", "fieldSchemaType = ", fieldSchemaType,
                            "\n :: ", "fieldModel = ", fieldModel,
                            "\n :: ", "Object.keys( fieldSchemaType ) = ", Object.keys( fieldSchemaType ),
                            "\n :: ", "type = ", type,
                            "\n :: ", "fieldModel = ", fieldModel,
                            "\n :: ", "subFields = ", subFields,
                            "\n :: ", "value = ", value
                        );

                    if (
                        useBadgesForStringArrays
                        && dataType === '[String]'
                        // && utils.val.isValidArray( fieldData, true )
                    ) {
                        let subField = subFields?.length >= 0 ? subFields[ 0 ] : fieldSchema;
                        let subFieldPath = [ ...( path ? path : fieldModel?.path ) ];

                        if ( true ) {
                            return (
                                <div className={ `w-full flex-1` }>
                                    <InputField.TagsArray
                                        placeholder={ keyLabel }
                                        limit={ 0 } // No limit. 
                                        debug={ false }
                                        classNames={ '' }
                                        id={ fieldKey }
                                        uuid={ uuid }
                                        key={ fieldKey }
                                        fieldKey={ fieldKey }
                                        label={ keyLabel }
                                        required={ required }
                                        value={ value }
                                        useOnChangeUpdate={ true }
                                        onUpdate={ () => { } }
                                        onChange={ ( values ) => {
                                            // Value will be a string, but needs to be stored as an array of strings, so split it up by spaces.
                                            // setFormData( deepPathSet( formData, subFieldPath, values ) );
                                            handleChange( formData, subFieldPath, values );
                                        } }
                                    />
                                    {/* <div className={ `` }>
                                        { arrayToString( value ) }
                                    </div> */}
                                </div>
                            );
                        }

                        // return (
                        //     <div
                        //         className={ twMerge(
                        //             `w-full h-fit align-middle justify-items-center flex flex-row `,
                        //             "flex justify-center items-start [&>div]:w-full",
                        //         ) }
                        //         key={ `${ inputContainerId }-${ subFieldPath.join( '-' ) }` }
                        //     >
                        //         <div className={ `w-full flex flex-col items-center p-0 ` }>
                        //             <div className={ `w-full items-center p-0 gap-0 flex flex-grow flex-wrap` }>
                        //                 { utils.val.isValidArray( value, true )
                        //                     && value?.map( ( d, i ) => {
                        //                         if ( d ) {
                        //                             return (
                        //                                 <Badge
                        //                                     key={ `badge-array-input-field-${ subFieldPath.join( '-' ) }-item-${ i }` }
                        //                                     variant={ `outline` }
                        //                                     className={ `` }
                        //                                 >
                        //                                     { d?.toString() }
                        //                                     <Button
                        //                                         variant={ 'ghost' }
                        //                                         size={ 'xs' }
                        //                                         className={ `bg-transparent outline-transparent focus:outline-transparent` }
                        //                                         onClick={ ( e ) => {
                        //                                             // Delete the chonk of text in this badge.
                        //                                             // currObjs = currObjs.splice( index, 1 );
                        //                                             /* let tempData = [ ...fieldData ]?.filter( ( val, valIndex ) => i !== valIndex );
                        //                                             const newValue = [ ...( field.value || [] ) ];
                        //                                             newValue.splice( index, 1 ); */
                        //                                             e.preventDefault();
                        //                                             // currObjs = currObjs.filter( ( o, i ) => i !== index );

                        //                                             // console.log( "BadgeArray :: fieldData = ", fieldData, " :: ", "value = ", value );
                        //                                             if ( utils.val.isValidArray( value ) ) {
                        //                                                 let tempData = [ ...value ];
                        //                                                 // ?.split( ' ' )
                        //                                                 // ?.join( ',' )?.split( ',' )
                        //                                                 // ?.join( '|' )?.split( '|' )
                        //                                                 // ;
                        //                                                 tempData = tempData?.filter( ( val, valIndex ) => i !== valIndex );
                        //                                                 setFormData(
                        //                                                     deepPathSet(
                        //                                                         formData,
                        //                                                         subFieldPath,
                        //                                                         tempData
                        //                                                         // utils.val.isValidArray( tempData, true )
                        //                                                         //     ? ( tempData?.join( ' ' )?.split( ', ' ).join( ', ' ) )
                        //                                                         //     : ( tempData?.join( '' )?.split( '|' )?.join( ' ' ) ),
                        //                                                     )
                        //                                                 );
                        //                                             }
                        //                                             /* handleDeleteArrayItem(
                        //                                                 formData,
                        //                                                 fieldData,
                        //                                                 path,
                        //                                                 i,
                        //                                             ); */
                        //                                         } }
                        //                                     ><X /></Button>
                        //                                 </Badge>
                        //                             );
                        //                         }
                        //                     } ) }
                        //             </div>

                        //             { value && ( <InputField.Text
                        //                 id={ fieldKey }
                        //                 uuid={ uuid }
                        //                 fieldKey={ fieldKey }
                        //                 path={ path }
                        //                 // value={ fieldData }
                        //                 label={ keyLabel }
                        //                 placeholder={ keyLabel }
                        //                 required={ required }
                        //                 value={
                        //                     value && utils.val.isDefined( value )
                        //                         ? ( utils.val.isValidArray( value, true )
                        //                             // Already is an array, join then split to clean up.
                        //                             ? ( value?.join( ' ' )?.split( ', ' ).join( ', ' ) )
                        //                             // Not an array, but join it anyways. 
                        //                             // : ( fieldData?.join( '' )?.split( '|' )?.join( ' ' ) )
                        //                             : ( utils.val.isString( value )
                        //                                 ? value?.split( '|' )?.join( ' ' )
                        //                                 : ( '' ) ) )
                        //                         : ( ' ' )
                        //                     // value?.join( ' ' ) 
                        //                 }
                        //                 useOnChangeUpdate={ true }
                        //                 onChange={ ( value ) => {
                        //                     // Value will be a string, but needs to be stored as an array of strings, so split it up by spaces.
                        //                     handleChange(
                        //                         formData,
                        //                         [ ...( path ? path : fieldModel?.path ) ],
                        //                         stringToArray( value )
                        //                     );
                        //                 } }
                        //             /> ) }
                        //             {/* 
                        //             { generateFormField(
                        //                 subField,
                        //                 fieldSchema,
                        //                 value?.split( ' ' ),
                        //                 fieldKey,
                        //                 path
                        //             ) }
                        //              */}
                        //         </div>
                        //     </div>
                        // );
                    }
                    else {
                        return (
                            <div
                                key={ inputContainerId }
                                className={ `${ inputContainerClassNames } flex flex-col transition-all duration-300 ease-in-out hover:border-l-primary-purple-200 border-l-brand-primaryPurple/20 border-l-4 border` }
                            >
                                <div className={ `flex flex-row w-auto h-min ` }>
                                    { <Button
                                        className={ `rounded-full border border-transparent opacity-80 !px-2 !py-1 !m-0 self-start aspect-square justify-stretch items-start` }
                                        size={ 'xs' }
                                        variant={ `ghost` }
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            handleAddArrayItem(
                                                fieldModel,
                                                formData,
                                                fieldData,
                                                path,
                                            );
                                        } }
                                    >
                                        <PlusCircle className={ `!p-0 !m-0 transition-all duration-300 ease-in-out self-center aspect-square justify-center items-center stroke-1 hover:stroke-2 hover:text-washed-blue-300 ` } />
                                    </Button> }
                                    {/* { label } */ }
                                </div>
                                {/* { fieldData?.length && fieldData.map( ( f, i ) => { */ }
                                {
                                    utils.val.isValidArray( fieldData, true )
                                    && fieldData?.length > 0
                                    && fieldData.map( ( f, i ) => {
                                        // f is the same as arrFieldData[index].
                                        let subField = subFields?.length >= 0 ? subFields[ 0 ] : fieldSchema;
                                        let subFieldSchema = subField?.fieldSchema ? subField?.fieldSchema : subField?.type;
                                        let subFieldData = fieldData?.length >= i ? fieldData[ i ] : fieldData;
                                        let subFieldPath = [ ...( path ? path : fieldModel?.path ), i ];
                                        let subFieldValue = fieldData?.length >= i
                                            ? fieldData[ i ]
                                            : ( typeToInitialDefault( subFieldSchema ) );
                                        if ( debug === true )
                                            console.log(
                                                'FormGenerator',
                                                '\n :: ', 'arrays subfields 2',
                                                '\n :: ', 'subFields.map()',
                                                '\n :: ', 'subFields = ', subFields,
                                                '\n :: ', 'fieldKey = ', fieldKey,
                                                "\n :: ", 'f = ', f,
                                                "\n :: ", "i = ", i,
                                                "\n :: ", "fieldSchema = ", fieldSchema,
                                                "\n :: ", "fieldData = ", fieldData,
                                                "\n :: ", "fieldModel = ", fieldModel,
                                                "\n :: ", "value = ", value,
                                                "\n :: ", "subField = ", subField,
                                                "\n :: ", "subFieldValue = ", subFieldValue,
                                                "\n :: ", "subFieldData = ", subFieldData,
                                                "\n :: ", "subFieldPath = ", subFieldPath,
                                                "\n :: ", "subFieldSchema = ", subFieldSchema,
                                            );

                                        return (
                                            <div
                                                className={ twMerge(
                                                    `w-full h-fit align-middle justify-items-center flex flex-row `,
                                                    "flex justify-center items-start [&>div]:w-full",
                                                ) }
                                                key={ `${ inputContainerId }-${ subFieldPath.join( '-' ) }` }
                                            >

                                                { <Button
                                                    // className={ `rounded-full hover:bg-secondaryAlt-300 border border-transparent opacity-40 hover:border-error p-1 m-0 h-7` }
                                                    className={ `rounded-full border border-transparent opacity-80 !px-2 !py-1 !m-0 self-start aspect-square justify-start items-start` }
                                                    size={ 'xs' }
                                                    variant={ `ghost` }
                                                    onClick={ ( e ) => {
                                                        e.preventDefault();
                                                        handleDeleteArrayItem( formData, fieldData, path, i );
                                                    } }
                                                >
                                                    <MinusCircle className={ `!p-0 !m-0 transition-all duration-300 ease-in-out self-center aspect-square justify-center items-center stroke-1 hover:stroke-2 hover:text-washed-blue-300 ` } />
                                                </Button> }

                                                <div
                                                    className={ `w-full flex flex-col items-stretch justify-stretch p-0 ` }
                                                >
                                                    <FormGeneratorField
                                                        formData={ formData }
                                                        setFormData={ setFormData }
                                                        formModel={ formModel }
                                                        formSchema={ formSchema }
                                                        fieldModel={ subField }
                                                        fieldSchema={ fieldSchema }
                                                        fieldData={ f }
                                                        fieldKey={ i }
                                                        key={ i }
                                                        path={ subFieldPath }
                                                        // fieldSchema={ fieldSchema }
                                                        // fieldSchema={ subFieldSchema }
                                                        classNames={ `` }
                                                        handleChange={ handleChange }
                                                        useMultiSelectForObjectIds={ useMultiSelectForObjectIds }
                                                        initialDataAutofillRandom={ initialDataAutofillRandom }
                                                        useSlidersForNumbers={ useSlidersForNumbers }
                                                        useSwitchesForBoolean={ useSwitchesForBoolean }
                                                        useBadgesForStringArrays={ useBadgesForStringArrays }
                                                        useDateRangeForDateArrays={ useDateRangeForDateArrays }
                                                        useRadialForDecimals={ useRadialForDecimals }
                                                        layout={ layout }
                                                        refData={ refData }
                                                    // { ...props }
                                                    />

                                                    {/* { memo(
                                                        () => generateField(
                                                            subField,
                                                            fieldSchema,
                                                            f,
                                                            i,
                                                            subFieldPath
                                                        )
                                                    ) }
                                                */}
                                                </div>
                                            </div>
                                        );
                                    } ) }
                            </div>
                        );
                    }
                }
                break;

            default:
                return '';
                break;
        }
    };

    return (
        <div className={
            twMerge(
                `flex flex-row h-fit p-0 m-0 w-full`,
                // `border border-spacing-2`,
                // ( !isNaN( fieldKey ) ) ? `!w-11/12 !min-w-11/12` : `!w-10/12 !min-w-10/12`,

            )
        }>
            { generateFormFieldInput( {
                fieldModel: fieldModel,
                fieldSchema: fieldSchema,
                fieldData: fieldData,
                fieldKey: fieldKey,
                key: fieldKey,
                path: path,
                classNames: classNames,
                // ...props
            } ) }
        </div>
    );

};

FormGenerator.FormGeneratorFieldInput = FormGeneratorFieldInput;

const FieldGenerator = ( props ) => {
    const {
        fieldName,
        fieldSchema,
        field,
        renderField,
        data,
        useSlidersForNumbers,
        path,
    } = props;

    const handleAddItem = () => {
        const newItem = getDefaultValueForType( fieldSchema.type[ 0 ] || fieldSchema.of );
        field.onChange( [ ...( field.value || [] ), newItem ] );
    };

    const handleItemChange = ( index, itemValue ) => {
        const newValue = [ ...( field.value || [] ) ];
        newValue[ index ] = itemValue;
        field.onChange( newValue );
    };

    const handleRemoveItem = ( index ) => {
        const newValue = [ ...( field.value || [] ) ];
        newValue.splice( index, 1 );
        field.onChange( newValue );
    };

    return (
        <div className={ `border p-4 my-4` }>
            <h3 className={ `text-lg font-semibold mb-2` }>{ fieldName }</h3>
            <Button
                onClick={ handleAddItem }
                className='m-0 p-2'
                variant={ 'ghost' }
                size={ 'sm' }
            >
                <Plus />{ `Add Item` }
            </Button>
            { utils.val.isValidArray( field?.value, true ) &&
                field?.value.map( ( item, index ) => {
                    return (
                        <div
                            key={ index }
                            className={ `text-lg font-semibold mb-2` }
                        >
                            <span className='font-semibold'>
                                Item { index + 1 }
                            </span>
                            <Button
                                className={ `mt-2` }
                                onClick={ () => {
                                    handleRemoveItem( index );
                                } }
                            >
                                Remove
                            </Button>
                            { renderField( {
                                // fieldName: `${ fieldName }[${ index }]`,
                                // fieldSchema: fieldSchema?.of || {},
                                fieldName: `${ fieldName }[${ index }]`,
                                // fieldSchema: fieldSchema.type[ 0 ] || fieldSchema.of || {},
                                fieldSchema: fieldSchema[ 0 ] || fieldSchema.of || {},
                                field: {
                                    value: item,
                                    onChange: ( newValue ) => {
                                        // const newArray = [ ...field?.value ];
                                        // newArray[ index ] = newValue;
                                        // field?.onChange( newArray );
                                        handleItemChange( index, newValue );
                                    },
                                },
                                useSlidersForNumbers: useSlidersForNumbers,
                                path: `${ path }[${ index }]`,
                                data: data,
                            } ) }
                        </div>
                    );
                } ) }
        </div>
    );
};

FormGenerator.FieldGenerator = FieldGenerator;

const FieldToggleList = ( {
    classNames = '',
    contentClassNames = '',
    allFields,
    activeFields, setActiveFields,
    handleChange,
} ) => {
    return (
        <div className="task-filters flex">
            <Popover className={ `border-bodysecondary border border-dashed ${ classNames } ` }>
                <PopoverTrigger asChild>
                    <Button
                        className={ `self-center rounded-full focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none ${ classNames }` }
                        variant="outline"
                    >
                        <LucideFilter className={ `p-0 m-0 !size-6` } />
                        <h6 className={ `text-center self-center h-max w-full text-base` }>
                            { `Available Form Fields` }
                        </h6>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={ `w-auto h-128 max-h-128 relative overflow-hidden border rounded-xl p-4 !z-2000 border-bodysecondary/40 ${ contentClassNames }` }>
                    <div className={ `h-full max-h-full min-h-full relative overflow-auto p-1` }>
                        {/* Put the list of checkbox options here. */ }
                        { allFields && utils.val.isValidArray( allFields, true ) && (
                            <ToggleSection
                                options={ allFields }
                                // requiredOptions={ requiredFields }
                                active={ activeFields }
                                setActive={ setActiveFields }
                                title={ "Optional Fields" }
                                handleChange={ handleChange }
                                useCheckboxes={ false }
                            />
                        ) }
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};


const ToggleSection = ( props ) => {
    const {
        title,
        options = [],
        requiredOptions = [],
        active, setActive,
        handleChange,
        useCheckboxes = false,
    } = props;

    const [ allActive, setAllActive ] = useState( false );

    return (
        <div className={ `!z-2000 w-fit h-full flex flex-grow flex-col justify-stretch w-full` }>
            <h3 className={ `font-semibold` }>{ title }</h3>

            <div
                key={ `${ title }-toggle-all` }
                className={ twMerge(
                    `flex items-center px-4 py-1 my-1 gap-4 w-full h-auto justify-stretch hover:bg-tahiti-500/60 rounded-[0.25rem]`,
                    allActive
                        ? `bg-Neutrals/neutrals-11` // Highlighted
                        : `` // Normal
                ) }
                onClick={ ( e ) => {
                    e.preventDefault();
                    setAllActive( !allActive );
                    if ( allActive === true ) { handleChange( 'active', [ ...( requiredOptions ? requiredOptions : [] ) ], true ); } // Currently all active, remove all.
                    else { handleChange( 'active', options, true ); } // Currently not all active, add all.
                } }
            >
                { useCheckboxes && <Checkbox
                    id={ `${ title }-toggle-all` }
                    className={ `${ allActive ? 'border border-body' : '' }` }
                    defaultChecked={ allActive }
                    onCheckedChange={ ( checked ) => {
                        setAllActive( !allActive );
                        if ( allActive === true ) { handleChange( 'active', [ ...( requiredOptions ? requiredOptions : [] ) ] ); } // Currently all active, remove all.
                        else { handleChange( 'active', options ); } // Currently not all active, add all.
                    } }
                /> }
                <Label htmlFor={ `${ title }-toggle-all-label` }>{ `${ allActive ? 'Hide' : 'Show' } All` }</Label>
            </div>

            { options && utils.val.isValidArray( options, true ) && ( options.map( ( option ) => (
                <div
                    key={ option }
                    className={ twMerge(
                        // `flex items-center space-x-2 w-full`,
                        `flex items-center px-4 py-1 my-1 gap-4 w-full h-auto justify-stretch hover:bg-tahiti-500/60 rounded-[0.25rem]`,
                        active?.includes( option )
                            ? `bg-Neutrals/neutrals-11` // Highlighted
                            : `` // Normal
                    ) }
                    onClick={ ( e ) => {
                        e.preventDefault();
                        if ( handleChange ) { handleChange( option, option ); }
                    } }
                >
                    { useCheckboxes && <Checkbox
                        id={ `${ title }-${ option }` }
                        className={ `${ active?.includes( option ) ? 'border border-body' : '' }` }
                        checked={ active?.includes( option ) || allActive ? true : false }
                        onCheckedChange={ ( checked ) => {
                            // if ( checked ) { setActive( [ ...active, option ] ); }
                            // else { setActive( active.filter( ( filter ) => filter !== option ) ); }
                            if ( handleChange ) { handleChange( option, option, checked ); }
                        } }
                    /> }
                    <Label className={ `!p-0 !m-0` } htmlFor={ `${ title }-${ option }-label` }>{ caseCamelToSentence( option ) }</Label>
                </div>
            ) ) ) }

        </div>
    );
};


FieldToggleList.Section = ToggleSection;


const MultiSelectId = ( props ) => {
    const {
        // formGenerator, // For adding new options.
        // formModel, // For adding new options.
        // formSchema, // For adding new options.
        multiple = false,
        value,
        refData,
        schemaRefName,
        optionSchema,  // For adding new options.
        formData, setFormData = () => { },
        onClickAddOption = () => { },
        onCreateNewItem = () => { },
        placeholder = '',
        fieldKey,
        classNames,
        contentClassNames,
        optionClassNames,
        title,
        requiredOptions,
        options,
        // active, setActive,
        handleChange,
        handleSubmit,
        onOptionClick,
        onOptionClear,
        useCheckboxes = false,
        debug = false,
    } = props;

    const [ addNewMode, setAddNewMode ] = useState( false );
    const [ addNewData, setAddNewData ] = useState( null );
    const [ addNewSchema, setAddNewSchema ] = useState( null );

    const [ selected, setSelected ] = useState( null );
    const [ allSelected, setAllSelected ] = useState( false );

    const baseClassNames = `flex items-center px-4 py-1 my-1 gap-4justify-stretch hover:bg-tahiti-700/60 rounded-[0.25rem]`;

    const { getSchema } = useGlobalStore();

    if ( debug === true )
        console.log( 'FormGenerator :: MultiSelectId :: props = ', props, " :: ", "getSchema(schemaRefName) = ", getSchema( schemaRefName ) );

    const handleSelectAll = () => {
        setAllActive( !allSelected );
        if ( allSelected === true ) {
            // Currently all active, remove all.
            if ( handleChange ) handleChange( [] );
            setAllSelected( [] );
        }
        else {
            // Currently not all active, add all.
            if ( handleChange ) handleChange( options );
            setAllSelected( options );
        }
    };


    const handleAddNewStart = () => {

        // Fetch the schema needed to generate a new entry of this field. Given that all this would normally see are the available IDs in an array of that document type, we need to go way above normal scope to make this work. Might come to regret this if it causes memory leaks. 

        if ( schemaRefName ) {
            let schema = getSchema( schemaRefName );
            if ( debug === true )
                console.log( 'FormGenerator :: MultiSelectId :: handleAddNewStart :: schema = ', schema );

            // Create initial defaults for the given subschema. 
            if ( utils.val.isObject( schema ) ) {
                setAddNewSchema( schema );
                // utils.ao.deepSearch( optionSchema, 'type' )
                let initialData = typeToInitialDefault( schema );
                setAddNewData( initialData );
                if ( debug === true )
                    console.log( 'FormGenerator :: MultiSelectId :: handleAddNewStart :: schema = ', schema, ' :: ', 'initialData = ', initialData );
            }

            // Finally, enable the form. 
            setAddNewMode( true );
        }

    };

    const handleAddNewSubmit = async ( data ) => {
        if ( utils.val.isDefined( data ) ) {
            // Do some validation here later. Compare to the schema's field types.
            let res = await handleSubmit( data );

            if ( res ) {
                console.log( 'FormGenerator :: MultiSelectId :: handleAddNewSubmit :: data = ', data, ' :: ', 'res = ', res );
                onCreateNewItem( res );
                handleCancel();
            }
        }
    };

    const handleOptionClick = ( option ) => {
        let optionValue = option?.value;
        let optionName = option?.name;
        if ( onOptionClick ) {
            console.log( 'FormGenerator :: MultiSelectId :: onOptionClick :: options = ', options, ' :: ', 'option = ', option );
            if ( multiple ) {
                onOptionClick( [
                    ...( Array.isArray( value ) && value.length > 0
                        ? value
                        : [] ),
                    optionValue
                ] );
            }
            else {
                onOptionClick( optionValue );
            }
        }

        // handleChange( option, option, e?.target?.checked );
        if ( multiple ) {
            if ( selected && utils.val.isValidArray( selected, true ) ) {

                if ( selected?.includes( optionValue ) ) {
                    // Remove
                    setSelected( selected?.filter( ( v, i ) => ( v !== optionValue ) ) );
                }
                else {
                    // Add
                    if ( utils.val.isValidArray( selected, true ) ) { setSelected( [ ...selected, optionValue ] ); }
                    else { setSelected( [ optionValue ] ); }
                }
            }
        }
    };

    const handleCancel = () => {
        setAddNewMode( false );
        setAddNewSchema( null );
        setAddNewData( null );
    };

    const buildOptions = () => {
        return (

            <div className={ `!z-2000 w-full h-full` }>
                <h3 className={ `select-group-label font-semibold rounded-[0.5rem] py-1 px-2 bg-quinaryHighlight/60` }>{ title }</h3>

                <div key={ `${ title }-add-new` }
                    onClick={ ( e ) => { if ( addNewMode ) { handleAddNewStart(); } else { handleCancel(); } } }
                    className={ twMerge(
                        `gap-2 p-4`,
                        baseClassNames,
                        allSelected ? `bg-Neutrals/neutrals-11` : ``,
                        optionClassNames,
                    ) }
                >
                    <Plus className={ `!p-0 !m-0 stroke-primary-500 stroke-1 ${ addNewMode ? 'rotate-45' : '' }` } />
                    <Label htmlFor={ `${ title }-add-new-label` }>
                        { ` ${ addNewMode ? 'Cancel' : 'New' } ` }
                    </Label>
                </div>

                { multiple && (
                    <div key={ `${ title }-select-all` }
                        onClick={ () => { handleSelectAll(); } }
                        className={ twMerge(
                            baseClassNames,
                            allSelected ? `bg-Neutrals/neutrals-11` : ``,
                            optionClassNames,
                        ) }
                    >
                        <Label htmlFor={ `${ title }-select-all-label` }>
                            { `${ allSelected ? 'Remove' : 'Select' } All` }
                        </Label>
                    </div>
                ) }

                { options
                    && utils.val.isValidArray( options, true )
                    && ( options.map( ( option ) => {
                        let optionValue = option?.value;
                        let optionName = option?.name;
                        return (
                            <div key={ `${ title }-${ optionValue }` }
                                onClick={ () => { handleOptionClick( option ); } }
                                className={ twMerge(
                                    baseClassNames,
                                    selected?.includes( optionValue ) || value === optionValue ? `bg-Neutrals/neutrals-11` : ``,
                                    optionClassNames,
                                ) }
                            >
                                <Label className={ `!p-0 !m-0` } htmlFor={ `${ title }-${ optionValue }` }>
                                    { caseCamelToSentence( optionName ) }
                                </Label>
                            </div>
                        );
                    } ) ) }

            </div>
        );
    };

    return (
        <div className={ `w-full self-end justify-stretch items-start flex flex-grow` }>
            <Popover className={ `border-bodysecondary border border-dashed ${ classNames } ` }>
                <PopoverTrigger asChild className={ `w-full h-full` }>
                    <Button
                        className={ `focus:outline-none focus-within:outline-none focus-visible:outline-none ${ classNames }` }
                        variant="outline"
                    >
                        <BoxIcon className={ ( `size-8`, value ? ` stroke-quaternaryHighlight stroke-1` : `stroke-white stroke-2` ) } />
                        <h6 className={ `text-start self-center h-max w-full text-base` }>
                            { placeholder ?? convertCamelCaseToSentenceCase( fieldKey ) }
                        </h6>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={ `w-auto h-64 max-h-128 relative overflow-hidden border rounded-xl p-0 !z-2000 border-bodysecondary/40 ${ contentClassNames }` }>
                    {/* <ScrollArea> */ }
                    <div className={ `h-full max-h-full min-h-full relative overflow-auto p-1` }>
                        {/* Put the list of checkbox options here. */ }
                        { options && utils.val.isValidArray( options, true ) && (
                            buildOptions()
                        ) }
                    </div>
                    {/* </ScrollArea> */ }
                </PopoverContent>
            </Popover>


            { addNewMode && ( <div className={ `flex flex-col gap-2` }>
                { addNewData && addNewSchema && utils.val.isObject( addNewSchema ) && (
                    <FormGenerator
                        debug={ true }
                        data={ addNewData }
                        setData={ setAddNewData }
                        schema={ addNewSchema }
                        initialData={ addNewData }
                        refData={ refData }
                        onChange={ ( e ) => {
                            // e.preventDefault();
                            const { name, value } = e.target;
                            if ( debug === true )
                                console.log( 'FormGenerator :: MultiSelectId :: onChange triggered :: name, value = ', name, value );
                            if ( data && Object.keys( data ).includes( name ) ) {
                                setAddNewData( { ...data, [ name ]: value } );
                            }
                        } }
                        onCancel={ () => handleCancel() }
                        onSubmit={ ( data ) => {
                            handleAddNewSubmit( data );
                        } }
                    />
                ) }
            </div>
            ) }
        </div>
    );
};

FormGenerator.MultiSelectId = MultiSelectId;

export default FormGenerator;

////////////////////////////////

/*  const buildForm = ( schema, data ) => {
        let elements = [];
        if ( utils.val.isValidArray( schema, true ) ) {
            Object.entries( schema ).forEach( ( [ key, field ] ) => {
                elements.push(
                    <FormField
                        name={ `${ key }` }
                        control={ form.control }
                        render={
                            ( { field } ) => {
                                <FormItem>
                                    <FormLabel>
                                        { utils.str.toCapitalCase( key ) }
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" { ...field } />
                                        { renderField( data, key, field ) }
                                    </FormControl>
                                    <FormDescription>
                                        { key }
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>;
                            }
                        }
                    />
                );
            } );
        }
 
        return (
            <Form
                className={ `dynamic-form-container` }
                { ...form }
            >
                <form
                    onSubmit={ form.handleSubmit( onSubmit ) }
                    className="space-y-8"
                >
                    { elements }
                </form>
            </Form>
        );
    };
*/


/*  const FieldToggleList = ( {
        title=``,
        classNames = '',
        allFields,
        activeFields, setActiveFields,
        handleChange,
    } ) => {
        return (
            <div className="task-filters flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            className={ `self-center rounded-full focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none ${ classNames }` }
                            variant="outline"
                        >
                            <LucideFilter className={ `p-0 m-0 !size-6` } />
                            <h6 className={ `text-center self-center h-max w-full text-base` }>
                                { title }
                            </h6>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            { allFields && utils.val.isValidArray( allFields, true ) && (
                                <ToggleSection
                                    options={ allFields }
                                    active={ activeFields }
                                    setActive={ setActiveFields }
                                    title={ "Optional Fields" }
                                />
                            ) }
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        );
    };


    const ToggleSection = ( props ) => {
        const {
            title,
            options,
            active, setActive,
            handleChange,
        } = props;

        return (
            <div className="mb-4">
                <h3 className="font-semibold mb-2">{ title }</h3>
                { options && utils.val.isValidArray( options, true ) && ( options.map( ( option ) => (
                    <div key={ option } className="flex items-center space-x-2 mb-1">
                        <Checkbox
                            id={ `${ title }-${ option }` }
                            checked={ active.includes( option ) }
                            onCheckedChange={ ( checked ) => {
                                if ( checked ) { setActive( [ ...active, option ] ); }
                                else { setActive( active.filter( ( filter ) => filter !== option ) ); }

                                if ( handleChange ) { handleChange( option, checked ); }
                            } }
                        />
                        <Label htmlFor={ `${ title }-${ option }` }>{ option }</Label>
                    </div>
                ) ) ) }
            </div>
        );
    };
    FieldToggleList.Section = ToggleSection;
    export default FieldToggleList
*/