"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, ChevronRight, ChevronDown, Edit, Save } from "lucide-react";
import DataValueInput from "./DataValueInput";
import { isValid } from "date-fns";

const NestedDataEditor = ( { value, onChange, className, dataType, compact = false, depth = 0 } ) => {
    const [ expandedItems, setExpandedItems ] = useState( {} );
    const [ newFieldName, setNewFieldName ] = useState( "" );
    const [ newFieldType, setNewFieldType ] = useState( "String" );
    const [ newFieldValue, setNewFieldValue ] = useState( "" );
    const [ fieldDataTypes, setFieldDataTypes ] = useState( {} );
    const [ editingField, setEditingField ] = useState( null );
    const [ editFieldName, setEditFieldName ] = useState( "" );
    const [ editFieldType, setEditFieldType ] = useState( "" );
    const [ editFieldValue, setEditFieldValue ] = useState( null );

    const newFieldNameRef = useRef( null );
    const newFieldTypeRef = useRef( null );
    const newFieldValueRef = useRef( null );

    const maxDepth = 5; // Prevent infinite recursion
    console.log( "NestedDataEditor :: value = ", value );

    // Initialize field data types from current value
    useEffect( () => {
        if ( dataType === "Object" && typeof value === "object" && value !== null ) {
            const types = {};
            Object.entries( value ).forEach( ( [ key, val ] ) => {
                if ( !( key in fieldDataTypes ) ) {
                    types[ key ] = getValueType( val );
                }
            } );

            if ( Object.keys( types ).length > 0 ) {
                setFieldDataTypes( ( prev ) => ( { ...prev, ...types } ) );
            }
        } else if ( dataType === "Array" && Array.isArray( value ) ) {
            const types = {};
            value.forEach( ( val, index ) => {
                if ( !( `array-${ index }` in fieldDataTypes ) ) {
                    types[ `array-${ index }` ] = getValueType( val );
                }
            } );

            if ( Object.keys( types ).length > 0 ) {
                setFieldDataTypes( ( prev ) => ( { ...prev, ...types } ) );
            }
        }
    }, [ value, dataType ] );

    // Reset new field form and focus on name input
    const resetNewFieldForm = useCallback( () => {
        setNewFieldName( "" );
        setNewFieldType( "String" );
        setNewFieldValue( "" );

        // Focus on the name input after a short delay to ensure the DOM has updated
        setTimeout( () => {
            if ( newFieldNameRef.current ) {
                newFieldNameRef.current.focus();
            }
        }, 10 );
    }, [] );

    // Toggle expansion of a nested object/array
    const toggleExpand = useCallback( ( key ) => {
        setExpandedItems( ( prev ) => ( {
            ...prev,
            [ key ]: !prev[ key ],
        } ) );
    }, [] );

    // Convert value to the correct type based on the selected type
    const convertValueToType = useCallback( ( val, type ) => {
        if ( val === null || val === undefined ) {
            return getDefaultValueForType( type );
        }

        switch ( type ) {
            case "String":
                return String( val );
            case "Decimal":
            case "Integer":
            case "Number":
                const num = Number( val );
                return isNaN( num ) ? 0 : num;
            case "Boolean":
                return Boolean( val );
            case "Date":
            case "DateTime":
            case "DateTimeLocal":
                try {
                    const date = new Date( val );
                    return isValid( date ) ? date : new Date();
                } catch ( e ) {
                    return new Date();
                }
            case "Array":
                return Array.isArray( val ) ? val : [];
            case "Object":
                return typeof val === "object" && val !== null && !Array.isArray( val ) ? val : {};
            case 'ObjectId':
                return val;
            case 'Mixed':
            case 'Custom':
            default:
                return val;
        }
    }, [] );

    // Get default value based on type
    const getDefaultValueForType = useCallback( ( type ) => {
        switch ( type ) {
            case "String":
                return "";
            case "Decimal":
            case "Integer":
            case "Number":
                return 0;
            case "Boolean":
                return false;
            case "Date":
            case "DateTime":
            case "DateTimeLocal":
                return new Date();
            case "Array":
                return [];
            case "Object":
                return {};
            case 'ObjectId':
                return '';
            case 'Mixed':
            case 'Custom':
            default:
                return "";
        }
    }, [] );

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        ( e ) => {
            // Ctrl+Enter to add field and start a new one
            if ( e.key === "Enter" && ( e.ctrlKey || e.metaKey ) ) {
                e.preventDefault();

                if ( dataType === "Object" ) {
                    addObjectField();
                } else if ( dataType === "Array" ) {
                    addArrayItem();
                }
            }
        },
        [ dataType, newFieldName, newFieldType, newFieldValue ],
    );

    // Add a new field to an object
    const addObjectField = useCallback( () => {
        if ( !newFieldName.trim() ) return;

        const updatedValue = { ...value };
        // Convert the input value to the correct type
        const typedValue = convertValueToType( newFieldValue, newFieldType );

        updatedValue[ newFieldName ] = typedValue;

        // Save the data type
        setFieldDataTypes( ( prev ) => ( {
            ...prev,
            [ newFieldName ]: newFieldType,
        } ) );

        onChange( updatedValue );
        resetNewFieldForm();
    }, [ value, onChange, newFieldName, newFieldType, newFieldValue, resetNewFieldForm, convertValueToType ] );

    // Add a new item to an array
    const addArrayItem = useCallback( () => {
        // Convert the input value to the correct type
        const typedValue = convertValueToType( newFieldValue, newFieldType );

        const updatedValue = [ ...value, typedValue ];
        const newIndex = value.length;

        // Save the data type
        setFieldDataTypes( ( prev ) => ( {
            ...prev,
            [ `array-${ newIndex }` ]: newFieldType,
        } ) );

        onChange( updatedValue );
        resetNewFieldForm();
    }, [ value, onChange, newFieldType, newFieldValue, resetNewFieldForm, convertValueToType ] );

    // Start editing a field
    const startEditField = useCallback( ( key, fieldType, fieldValue ) => {
        setEditingField( key );
        setEditFieldName( key.startsWith( "array-" ) ? "" : key );
        setEditFieldType( fieldType );
        setEditFieldValue( fieldValue );
    }, [] );

    // Save edited field
    const saveEditField = useCallback(
        ( oldKey ) => {
            if ( dataType === "Object" ) {
                const updatedValue = { ...value };
                // Convert the edited value to the correct type
                const typedValue = convertValueToType( editFieldValue, editFieldType );

                // If key changed, remove old key and add new one
                if ( oldKey !== editFieldName && !oldKey.startsWith( "array-" ) ) {
                    delete updatedValue[ oldKey ];
                    updatedValue[ editFieldName ] = typedValue;

                    // Update data type
                    const updatedTypes = { ...fieldDataTypes };
                    delete updatedTypes[ oldKey ];
                    updatedTypes[ editFieldName ] = editFieldType;
                    setFieldDataTypes( updatedTypes );
                } else {
                    // Just update the value
                    updatedValue[ oldKey ] = typedValue;

                    // Update data type
                    setFieldDataTypes( ( prev ) => ( {
                        ...prev,
                        [ oldKey ]: editFieldType,
                    } ) );
                }

                onChange( updatedValue );
            } else if ( dataType === "Array" ) {
                const index = Number.parseInt( oldKey.replace( "array-", "" ) );
                const updatedValue = [ ...value ];
                // Convert the edited value to the correct type
                const typedValue = convertValueToType( editFieldValue, editFieldType );

                updatedValue[ index ] = typedValue;

                // Update data type
                setFieldDataTypes( ( prev ) => ( {
                    ...prev,
                    [ oldKey ]: editFieldType,
                } ) );

                onChange( updatedValue );
            }

            setEditingField( null );
        },
        [ dataType, value, onChange, editFieldName, editFieldType, editFieldValue, fieldDataTypes, convertValueToType ],
    );

    // Remove a field from an object
    const removeObjectField = useCallback(
        ( key ) => {
            const updatedValue = { ...value };
            delete updatedValue[ key ];

            // Remove data type
            const updatedTypes = { ...fieldDataTypes };
            delete updatedTypes[ key ];
            setFieldDataTypes( updatedTypes );

            onChange( updatedValue );
        },
        [ value, onChange, fieldDataTypes ],
    );

    // Remove an item from an array
    const removeArrayItem = useCallback(
        ( index ) => {
            const updatedValue = [ ...value ];
            updatedValue.splice( index, 1 );

            // Remove data type and update indices for remaining items
            const updatedTypes = {};
            Object.entries( fieldDataTypes ).forEach( ( [ key, type ] ) => {
                if ( key.startsWith( "array-" ) ) {
                    const itemIndex = Number.parseInt( key.replace( "array-", "" ) );
                    if ( itemIndex < index ) {
                        updatedTypes[ key ] = type;
                    } else if ( itemIndex > index ) {
                        updatedTypes[ `array-${ itemIndex - 1 }` ] = type;
                    }
                } else {
                    updatedTypes[ key ] = type;
                }
            } );
            setFieldDataTypes( updatedTypes );

            onChange( updatedValue );
        },
        [ value, onChange, fieldDataTypes ],
    );

    // Update a field in an object
    const updateObjectField = useCallback(
        ( key, newValue ) => {
            const updatedValue = { ...value };
            updatedValue[ key ] = newValue;
            onChange( updatedValue );
        },
        [ value, onChange ],
    );

    // Update an item in an array
    const updateArrayItem = useCallback(
        ( index, newValue ) => {
            const updatedValue = [ ...value ];
            updatedValue[ index ] = newValue;
            onChange( updatedValue );
        },
        [ value, onChange ],
    );

    // Determine if a value is a complex type (object or array)
    const isComplexType = ( val ) => {
        return val !== null && typeof val === "object" && !( val instanceof Date ) && Object.keys( val ).length > 0;
    };

    // Get the type of a value
    const getValueType = ( val ) => {
        if ( val === null || val === undefined ) return "null";
        if ( Array.isArray( val ) ) return "Array";
        if ( val instanceof Date && isValid( val ) ) return "Date";
        return typeof val === "object"
            ? "Object"
            : typeof val === "string"
                ? "String"
                : typeof val === "number"
                    ? "Number"
                    : typeof val === "boolean"
                        ? "Boolean"
                        : "String";
    };

    // Format value for display in header
    const formatValueForDisplay = ( val, type ) => {
        if ( val === null || val === undefined ) return "null";
        // console.log( "formatValueForDisplay :: val = ", val );
        switch ( type ) {
            case "String":
                return val.length > 15 ? `"${ val.substring( 0, 12 ) }..."` : `"${ val }"`;
            case "Number":
                return String( val );
            case "Boolean":
                return val ? "true" : "false";
            case "Date":
                console.log( 'NestedDataEditor :: formatValueForDisplay :: val = ', val, ' :: ', 'type =  ', type );
                try {
                    const date = val instanceof Date ? val : new Date( val );
                    // return isValid( date ) ? date.toLocaleDateString() : "Invalid Date";
                    return isValid( date ) ? date.toLocaleDateString() : new Date().toLocaleDateString();
                    // return isValid( date ) ? date.toLocaleDateString() : new Date().toLocaleDateString();
                } catch ( e ) {
                    // return "Invalid Date";
                    return new Date().toLocaleDateString();
                }
            case "Array":
                return `[${ Array.isArray( val ) ? val.length : 0 } items]`;
            case "Object":
                return `{${ typeof val === "object" && val !== null ? Object.keys( val ).length : 0 } keys}`;
            default:
                return String( val );
        }
    };

    // Render the appropriate editor based on data type
    if ( dataType === "Array" || Array.isArray( value ) ) {
        return (
            <div className={ `border border-gray-700 rounded-md ${ compact ? "p-1" : "p-2" }` }>
                <div className="space-y-1">
                    { Array.isArray( value ) &&
                        value.map( ( item, index ) => {
                            const itemKey = `array-${ index }`;
                            const isComplex = isComplexType( item );
                            const itemType = fieldDataTypes[ itemKey ] || getValueType( item );
                            const isExpanded = expandedItems[ itemKey ];
                            const isEditing = editingField === itemKey;
                            const displayValue = formatValueForDisplay( item, itemType );

                            return (
                                <div key={ itemKey } className="border border-gray-700 rounded-md overflow-hidden">
                                    <div className="flex items-center justify-between bg-sextary-800 px-2 py-1">
                                        <div className="flex items-center">
                                            { isComplex && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0 mr-1"
                                                    onClick={ () => toggleExpand( itemKey ) }
                                                >
                                                    { isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" /> }
                                                </Button>
                                            ) }
                                            <span className="text-xs text-neutral-400">[{ index }]</span>
                                            <span className="text-xs ml-2 text-neutral-300">{ itemType }</span>
                                            <span className="text-xs ml-2 text-neutral-400 font-mono">{ displayValue }</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            { !isEditing ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0"
                                                    onClick={ () => startEditField( itemKey, itemType, item ) }
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0 text-green-500"
                                                    onClick={ () => saveEditField( itemKey ) }
                                                >
                                                    <Save className="h-3 w-3" />
                                                </Button>
                                            ) }
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 p-0 text-red-500"
                                                onClick={ () => removeArrayItem( index ) }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    { isEditing ? (
                                        <div className="p-2 bg-sextary-750 space-y-2">
                                            <Select value={ editFieldType } onValueChange={ setEditFieldType }>
                                                <SelectTrigger className="h-7 bg-sextary-700 border-gray-600 text-white text-xs">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-sextary-800 border-gray-700 text-white">
                                                    <SelectItem value="String" className="text-xs">
                                                        String
                                                    </SelectItem>
                                                    <SelectItem value="Number" className="text-xs">
                                                        Number
                                                    </SelectItem>
                                                    <SelectItem value="Boolean" className="text-xs">
                                                        Boolean
                                                    </SelectItem>
                                                    <SelectItem value="Date" className="text-xs">
                                                        Date
                                                    </SelectItem>
                                                    <SelectItem value="Array" className="text-xs">
                                                        Array
                                                    </SelectItem>
                                                    <SelectItem value="Object" className="text-xs">
                                                        Object
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <DataValueInput
                                                dataType={ editFieldType }
                                                value={ editFieldValue }
                                                onChange={ setEditFieldValue }
                                                compact={ compact }
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            { ( !isComplex || isExpanded ) && (
                                                <div className="p-2 bg-sextary-750">
                                                    { isComplex && depth < maxDepth ? (
                                                        <NestedDataEditor
                                                            value={ item }
                                                            onChange={ ( newValue ) => updateArrayItem( index, newValue ) }
                                                            dataType={ itemType }
                                                            compact={ compact }
                                                            depth={ depth + 1 }
                                                        />
                                                    ) : (
                                                        <DataValueInput
                                                            dataType={ itemType }
                                                            value={ item }
                                                            onChange={ ( newValue ) => updateArrayItem( index, newValue ) }
                                                            compact={ compact }
                                                        />
                                                    ) }
                                                </div>
                                            ) }
                                        </>
                                    ) }
                                </div>
                            );
                        } ) }

                    {/* Add new array item - all fields at once */ }
                    <div className="mt-2 border border-gray-700 rounded-md p-2 bg-sextary-750 space-y-2">
                        <Select value={ newFieldType } onValueChange={ setNewFieldType } ref={ newFieldTypeRef }>
                            <SelectTrigger className="h-7 bg-sextary-700 border-gray-600 text-white text-xs">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-sextary-800 border-gray-700 text-white">
                                <SelectItem value="String" className="text-xs">
                                    String
                                </SelectItem>
                                <SelectItem value="Number" className="text-xs">
                                    Number
                                </SelectItem>
                                <SelectItem value="Boolean" className="text-xs">
                                    Boolean
                                </SelectItem>
                                <SelectItem value="Date" className="text-xs">
                                    Date
                                </SelectItem>
                                <SelectItem value="Array" className="text-xs">
                                    Array
                                </SelectItem>
                                <SelectItem value="Object" className="text-xs">
                                    Object
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-2">
                            <DataValueInput
                                dataType={ newFieldType }
                                value={ newFieldValue }
                                onChange={ setNewFieldValue }
                                compact={ compact }
                                ref={ newFieldValueRef }
                                onKeyDown={ handleKeyDown }
                            />
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 w-full"
                            onClick={ addArrayItem }
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Item (Ctrl+Enter)
                        </Button>
                    </div>
                </div>
            </div>
        );
    } else if ( dataType === "Object" || ( typeof value === "object" && value !== null ) ) {
        return (
            <div className={ `border border-gray-700 rounded-md ${ compact ? "p-1" : "p-2" }` }>
                <div className="space-y-1">
                    { typeof value === "object" &&
                        value !== null &&
                        Object.entries( value ).map( ( [ key, fieldValue ] ) => {
                            const isComplex = isComplexType( fieldValue );
                            const fieldType = fieldDataTypes[ key ] || getValueType( fieldValue );
                            const isExpanded = expandedItems[ `object-${ key }` ];
                            const isEditing = editingField === key;
                            const displayValue = formatValueForDisplay( fieldValue, fieldType );

                            return (
                                <div key={ `object-${ key }` } className="border border-gray-700 rounded-md overflow-hidden">
                                    <div className="flex items-center justify-between bg-sextary-800 px-2 py-1">
                                        <div className="flex items-center flex-wrap max-w-[70%]">
                                            { isComplex && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0 mr-1"
                                                    onClick={ () => toggleExpand( `object-${ key }` ) }
                                                >
                                                    { isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" /> }
                                                </Button>
                                            ) }
                                            <span className="text-xs font-medium">{ key }</span>
                                            <span className="text-xs ml-2 text-neutral-300">{ fieldType }</span>
                                            <span className="text-xs ml-2 text-neutral-400 font-mono truncate">{ displayValue }</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            { !isEditing ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0"
                                                    onClick={ () => startEditField( key, fieldType, fieldValue ) }
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0 text-green-500"
                                                    onClick={ () => saveEditField( key ) }
                                                >
                                                    <Save className="h-3 w-3" />
                                                </Button>
                                            ) }
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 p-0 text-red-500"
                                                onClick={ () => removeObjectField( key ) }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    { isEditing ? (
                                        <div className="p-2 bg-sextary-750 space-y-2">
                                            <Input
                                                placeholder="Field name"
                                                value={ editFieldName }
                                                onChange={ ( e ) => setEditFieldName( e.target.value ) }
                                                className="h-7 bg-sextary-700 border-gray-600 text-white text-xs"
                                            />

                                            <Select value={ editFieldType } onValueChange={ setEditFieldType }>
                                                <SelectTrigger className="h-7 bg-sextary-700 border-gray-600 text-white text-xs">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-sextary-800 border-gray-700 text-white">
                                                    <SelectItem value="String" className="text-xs">
                                                        String
                                                    </SelectItem>
                                                    <SelectItem value="Number" className="text-xs">
                                                        Number
                                                    </SelectItem>
                                                    <SelectItem value="Boolean" className="text-xs">
                                                        Boolean
                                                    </SelectItem>
                                                    <SelectItem value="Date" className="text-xs">
                                                        Date
                                                    </SelectItem>
                                                    <SelectItem value="Array" className="text-xs">
                                                        Array
                                                    </SelectItem>
                                                    <SelectItem value="Object" className="text-xs">
                                                        Object
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <DataValueInput
                                                dataType={ editFieldType }
                                                value={ editFieldValue }
                                                onChange={ setEditFieldValue }
                                                compact={ compact }
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            { ( !isComplex || isExpanded ) && (
                                                <div className="p-2 bg-sextary-750">
                                                    { isComplex && depth < maxDepth ? (
                                                        <NestedDataEditor
                                                            value={ fieldValue }
                                                            onChange={ ( newValue ) => updateObjectField( key, newValue ) }
                                                            dataType={ fieldType }
                                                            compact={ compact }
                                                            depth={ depth + 1 }
                                                        />
                                                    ) : (
                                                        <DataValueInput
                                                            dataType={ fieldType }
                                                            value={ fieldValue }
                                                            onChange={ ( newValue ) => updateObjectField( key, newValue ) }
                                                            compact={ compact }
                                                        />
                                                    ) }
                                                </div>
                                            ) }
                                        </>
                                    ) }
                                </div>
                            );
                        } ) }

                    {/* Add new object field - all fields at once */ }
                    <div className="mt-2 border border-gray-700 rounded-md p-2 bg-sextary-750 space-y-2">
                        <Input
                            placeholder="Field name"
                            value={ newFieldName }
                            onChange={ ( e ) => setNewFieldName( e.target.value ) }
                            className="h-7 bg-sextary-700 border-gray-600 text-white text-xs"
                            ref={ newFieldNameRef }
                            onKeyDown={ handleKeyDown }
                        />

                        <Select value={ newFieldType } onValueChange={ setNewFieldType } ref={ newFieldTypeRef }>
                            <SelectTrigger className="h-7 bg-sextary-700 border-gray-600 text-white text-xs">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-sextary-800 border-gray-700 text-white">
                                <SelectItem value="String" className="text-xs">
                                    String
                                </SelectItem>
                                <SelectItem value="Number" className="text-xs">
                                    Number
                                </SelectItem>
                                <SelectItem value="Boolean" className="text-xs">
                                    Boolean
                                </SelectItem>
                                <SelectItem value="Date" className="text-xs">
                                    Date
                                </SelectItem>
                                <SelectItem value="Array" className="text-xs">
                                    Array
                                </SelectItem>
                                <SelectItem value="Object" className="text-xs">
                                    Object
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-2">
                            <DataValueInput
                                dataType={ newFieldType }
                                value={ newFieldValue }
                                onChange={ setNewFieldValue }
                                compact={ compact }
                                ref={ newFieldValueRef }
                                onKeyDown={ handleKeyDown }
                            />
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 w-full"
                            onClick={ addObjectField }
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Field (Ctrl+Enter)
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback for non-complex types
    return <div className="text-xs text-red-500 p-2">Invalid data type for nested editor</div>;
};

export default NestedDataEditor;
