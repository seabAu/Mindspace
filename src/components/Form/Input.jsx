import React, { useState, useEffect, useRef } from "react";
import * as utils from 'akashatools';
import * as data from './../../lib/utilities/data.js';

import "./Input.css";
import {
    FaRegEdit,
    FaExpand,
    FaExpandArrowsAlt,
    FaFilter,
    FaEllipsisH,
    FaEllipsisV,
    // Icons for adding content
    FaPlusSquare,
    FaPlusCircle,
    FaPlus,
    // Icons for removing content
    FaWindowClose,
    FaTimesCircle,
    FaTimes,
    FaRedoAlt,
    // Icons for adjusting index
    FaSortDown,
    FaSortUp,
    FaSort,
    FaEdit,
    FaTrashAlt,
    FaCheck,
    FaMinus,
} from "react-icons/fa";
import * as types from "../../lib/config/types.js";
import Button from "../Button";
import Droplist from "../Droplist";
import { getFieldType, getType } from "akashatools/lib/Val.js";

/*  // Input organizational structure: 
Form (Or container)
    Form-Group
        Input-Field
            Input-Field-Label
            Input-Field-Control
    Form-Group
        Input-Group
            Input-Field
                Input-Field-Label
                Input-Field-Control
            Input-Field
                Input-Field-Label
                Input-Field-Control
            Input-Field
                Input-Field-Label
                Input-Field-Control
        Input-Group
            Input-Field
                Input-Field-Label
                Input-Field-Control
            Input-Field
                Input-Field-Label
                Input-Field-Control
            Input-Field
                Input-Field-Label
                Input-Field-Control
*/

function Input ( props ) {
    const {
        // Input-field constructor properties.
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        label = "",
        id = "", // Field ID
        name = "", // Value ID
        onChange,
        disabled = false,
        required = true,
        value = "",
        defaultValue = "",
        placeholder, // = "",
        // Extra styling.
        classes = "",
        styles = {},
        fieldStyles = {}, // Style overrides for the input field container element
        labelStyles = {}, // Style overrides for the input field label element
        inputStyles = {}, // Style overrides for the input field input element
        debug = false,
    } = props;

    // console.log("Input :: {Props} = ", props);

    return (
        <Input.Field
            fieldLayout={ fieldLayout }
            styles={ fieldStyles }>
            <Input.Label
                label={ label }
                name={ name }
                styles={ labelStyles }
            />
            <Input.Control
                { ...props }
                styles={ inputStyles }
            />
        </Input.Field>
    );
}

function Control ( props ) {
    const {
        // Input-field constructor properties.
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        label = "",
        id = "", // Field ID
        name = "", // Value ID
        onChange,
        disabled = false,
        required = true,
        value = "",
        defaultValue = "",
        placeholder, // = "",
        // Extra styling.
        classes = "",
        styles = {},
        debug = false,
    } = props;

    const inputStyles = {
        ...styles,
    };

    const createField = ( type ) => {
        // console.log("Input.Control.js :: createField", "\n :: props = ", props, "\n :: type = ", type, "\n :: inputProps = ", inputProps, "inputProps.defaultValue = ", inputProps.defaultValue);
        if ( types.validInputTypes.includes( type ) ) {
            // Type given is valid, proceed.
            if ( type === "checkbox" ) {
                // Render checkbox-specific properties.
                return (
                    <input
                        type="checkbox"
                        className={ `input-field-control input-field-checkbox` }
                        style={ inputStyles }
                        name={ name }
                        key={ `checkbox-input-${ name }` }
                        id={ `checkbox-input-${ name }` }
                        // inputProps={inputProps}
                        { ...inputProps }
                        onChange={ onChange }
                        required={ required ?? false }
                        disabled={ disabled ?? false }
                        // defaultValue={inputProps.defaultValue}
                        checked={ `${ inputProps.defaultValue === true ? 'checked' : '' }` }
                    // defaultChecked={`${inputProps.defaultValue === true ? 'checked' : ''}`}
                    />
                );
            } else if ( type === "select" ) {
                // Render select-specific properties.
                // if (debug) console.log("Input.Control.js :: createField", "\n :: SELECT :: type = ", type, "\n :: inputProps = ", inputProps);
                return (
                    <Input.Select
                        height={ 50 }
                        width={ 100 }
                        // id={`querySelect`}
                        name={ name }
                        // value={query.id ?? ""}
                        key={ `select-input-${ name }` }
                        id={ `select-input-${ name }` }
                        // unsetOption={`Select`}
                        // optionsConfig={inputProps.options}
                        inputProps={ inputProps }
                        { ...inputProps }
                        { ...props }
                        disabled={ disabled ?? false }
                        required={ required ?? false }
                        onChange={ onChange }
                        styles={ inputStyles }
                        classes={ `input-field-control input-field-select` }
                    // onChange={
                    // 	(selected) => {
                    // 		console.log("Query selected: ", selected, queryConfig.filter((value) => value.id === selected)[0]);
                    // 		setQuery(queryConfig.filter((value) => value.id === selected)[0]);
                    // 	}
                    // 	// setQuery
                    // }
                    />
                );
            } else {
                // Render as normal.
                // if ((type === "text" && value.toString().length > 80) || ()) {
                let val = value;
                let areaOverride = false;
                var rowCount = 1;

                if ( utils.ao.has( inputProps, "defaultValue" ) ) {
                    val = inputProps.defaultValue;
                }
                let textareaOverride = utils.val.isDefined( val ) ? val.toString().length > 80 : false;
                if ( utils.val.isDefined( val ) ) {
                    if ( val.toString().length > 80 ) {
                        areaOverride = true;
                        // Adjust the row count and height dynamically so it wraps over multiple lines.
                    }
                }
                if ( type === "textarea" ) { // || (type === "text" && areaOverride)) {
                    // Render a text area instead.
                    return (
                        <Input.Textarea
                            // type="text"
                            classes={ `input-field-control input-field-textarea` }
                            inputStyles={ {
                                ...inputStyles,
                                minHeight: `${ 19 }px`,
                                resize: "none"
                            } }
                            name={ name }
                            key={ `textarea-input-${ name }-${ id }` }
                            id={ `textarea-input-${ name }-${ id }` }
                            // {...inputProps}
                            inputProps={ inputProps }
                            // value={value}
                            // defaultValue={defaultValue}
                            /// placeholder={`${placeholder}`}
                            onChange={ onChange }
                            required={ required ?? false }
                            disabled={ disabled ?? false }
                        // wrap={"soft"}
                        // rows={4}
                        // cols={50}
                        // onBlur={''}
                        // onFocus={''}
                        />
                    );
                } else {
                    return (
                        <input
                            type={ types.validInputTypes.includes( type ) ? type : "text" }
                            style={ inputStyles }
                            className={ `input-field-control input-field-${ types.validInputTypes.includes( type ) ? type : "text" } ${ classes ? classes : "" }` }
                            name={ name }
                            key={ `${ type }-input-${ name }-${ id }` }
                            id={ `${ type }-input-${ name }-${ id }` }
                            { ...{
                                ...inputProps,
                                ...( placeholder ? { placeholder: placeholder } : {} ),
                            } }
                            // value={value}
                            // defaultValue={defaultValue}
                            /// placeholder={`${placeholder}`}
                            onChange={ onChange }
                            required={ required ?? false }
                            disabled={ disabled ?? false }
                        />
                    );
                }
            }
        }
    };

    // if(debug)console.log("Input.Control :: {Props} = ", props);
    return createField( fieldType );
}
Input.Control = Control;

function Select ( props ) {
    const {
        height,
        width,
        label = "",
        id = "",
        name = "",
        value,
        defaultValue,
        inputProps,
        unsetOption = "-",
        optionsConfig,
        onChange,
        disabled,
        required,
        multiple,
        dropdown,
        classes = "",
        styles = {},
        debug = false,
    } = props;

    // if (debug) console.log("Select :: props = ", props);

    const inputStyles = {
        ...styles,
    };

    const isOptionSelected = ( optionValue, currValue ) => {
        if ( debug === true ) console.log( "isOptionSelected :: optionValue = ", optionValue, " :: currValue = ", currValue );
        let selected = currValue ? ( currValue.hasOwnProperty( "value" ) ? currValue.value : currValue.hasOwnProperty( "defaultValue" ) ? currValue.defaultValue : [ "-" ] ) : [ "-" ];
        // if ( inputProps.hasOwnProperty( 'value' ) )
        // {
        // 	selected = inputProps.value;
        // }
        // else if ( inputProps.hasOwnProperty( 'defaultValue' ) )
        // {
        // 	selected = inputProps.defaultValue;
        // }
        // if (debug) console.log( "INPUT.SELECT :: isOptionSelected :: ", optionValue, selected, " is selected = ", optionValue ? (
        // 	( utils.val.isValidArray( selected ) ) ? ( selected.includes( optionValue ) ) : (optionValue === selected)
        // ) : (false) );
        return (
            optionValue ? ( utils.val.isValidArray( selected ) ? selected.includes( optionValue ) : optionValue === selected ) : false
        );
        // if (optionValue) {
        // 	if ( utils.val.isValidArray( selected ) )
        // 	{
        // 		return selected.includes(optionValue);
        // 	} else
        // 	{
        // 		return optionValue === selected;
        // 	}
        // } else {
        // 	return false;
        // }
    };

    const arrayToOptions = ( input ) => {
        return utils.val.isValidArray( input, true )
            ? input.map( ( option, index ) => {
                return {
                    key: `${ index }`,
                    value: `${ option }`,
                    label: `${ option }`,
                };
            } )
            : [];
    };

    const buildOptions = ( input ) => {
        let selections = [];
        selections.push(
            <option
                className="option"
                value={ unsetOption }
                key={ -1 }>
                { unsetOption }
            </option>,
        );

        // Make sure we have an object array to work with, prebuilt.
        let inputOptions = input;
        if ( utils.val.isValidArray( input, true ) ) {
            let testval = input[ 0 ];
            if ( utils.val.isObject( testval ) ) {
                if ( Object.keys( testval ).length !== 0 ) {
                    inputOptions = input;
                } else {
                    inputOptions = arrayToOptions( input );
                }
            } else {
                inputOptions = arrayToOptions( input );
            }
        } else {
            inputOptions = arrayToOptions( input );
        }
        inputOptions.forEach( ( option, index ) => {
            // if (debug) console.log( "INPUT.SELECT :: ", option, index );
            selections.push(
                <option
                    className={ `option ${ isOptionSelected( option.value, inputProps ) ? "option-selected" : "" }` }
                    key={ index }
                    value={ option.value }>
                    { option.label }
                </option>,
            );
        } );
        return selections;
    };

    if ( debug === true ) console.log( "Form.Select :: {Props} = ", props );
    return (
        <select
            className={ `input-field-control input-field-select ${ classes ? classes : "" }` }
            height={ height }
            width={ width }
            key={ id }
            id={ id }
            name={ name }
            size={ `1` }
            // {...{
            // 	// ...inputProps,
            // 	...(multiple === true ? { value: inputProps.defaultValue } : { value: inputProps.defaultValue }),
            // } }
            // {...{
            // 	...(inputProps
            // 		? inputProps.hasOwnProperty("value")
            // 			? { value: inputProps.value }
            // 			: inputProps.hasOwnProperty("defaultValue")
            // 			? { value: inputProps.defaultValue }
            // 			: "-"
            // 		: "-"),
            // }}
            // value={multiple === true ? inputProps.defaultValue : inputProps.defaultValue} //{value !== null && value !== undefined ? value : ""}
            // value={inputProps ? (inputProps.hasOwnProperty("value") ? inputProps.value : inputProps.hasOwnProperty("defaultValue") ? inputProps.defaultValue : "-") : "-"}
            // defaultValue={value ? value : multiple === true ? inputProps.defaultValue : inputProps.defaultValue}
            value={ multiple === true ? value : value }
            defaultValue={
                // multiple === true
                // ?
                value ? value : defaultValue ? defaultValue : "--"
                // : inputProps
                // ? inputProps.hasOwnProperty("defaultValue")
                // 	? inputProps.defaultValue
                // 	: inputProps.hasOwnProperty("value")
                // 	? inputProps.value
                // 	: "-"
                // : "-"
            } //{value !== null && value !== undefined ? value : ""}
            onChange={ ( event ) => {
                let selected = event.target.value;
                if ( selected === unsetOption ) {
                    return;
                }
                if ( multiple === true ) {
                    // let currValue = value;
                    let currValue = value
                        ? value
                        : defaultValue
                            ? defaultValue
                            : inputProps
                                ? inputProps.hasOwnProperty( "value" )
                                    ? inputProps.value
                                    : inputProps.hasOwnProperty( "defaultValue" )
                                        ? inputProps.defaultValue
                                        : "-"
                                : "-";
                    if ( selected !== "" && selected !== undefined && selected !== null ) {
                        if ( !Array.isArray( currValue ) ) {
                            // if (debug) console.log( "Value is not an array :: ", currValue );
                            currValue = [ currValue ];
                        }
                        if ( currValue.indexOf( selected ) > -1 ) {
                            onChange(
                                currValue.filter( ( item ) => {
                                    return item !== selected && item !== "" && item !== undefined && item !== null;
                                } ),
                            );
                        } else {
                            onChange( [ ...currValue.filter( ( val ) => val !== "" && val !== undefined && val !== null ), selected ] );
                        }
                    }
                } else {
                    onChange( selected );
                }
            } }
            { ...{
                ...( multiple === true && dropdown !== true ? { multiple: multiple } : {} ),
                ...( dropdown === true ? { dropdown: true } : {} ),
            } }
            // multiple={multiple === true && dropdown !== true ? "multiple" : ""}
            required={ required ?? "" }
            disabled={ disabled ? disabled : false }>
            {
                // optionsConfig ?
                // 	buildOptions( optionsConfig ) :
                inputProps ? inputProps.hasOwnProperty( "options" ) ? buildOptions( inputProps.options ) : <></> : <></>
            }
        </select>
    );
}

Input.Select = Select;

function Group ( props ) {
    /* A collection of input fields. Arranged either in a row or column. */
    const {
        children,
        model,
        setData, // Callback to update the calling component's data.
        groupLayout = "block", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        styles = {},
        debug = false,
    } = props;

    const dataToModel = ( input ) => {
        // Extract all keys from the input object and build a formModelJSON object.
        let dataModel = [];
        let obj = {
            ...input,
            enabled: true,
        };
        if ( utils.val.isObject( input ) ) {
            Object.keys( obj ).forEach( ( key, index ) => {
                let value = obj[ key ];
                if ( debug === true ) console.log( "FORM.JS :: dataToModel(", input, ") :: key = ", key, " :: value = ", value );
                let fieldType = utils.val.isString( value ) ? `text` : utils.val.isNumber( value ) ? `number` : utils.val.isBool( value ) ? `checkbox` : `text`;
                dataModel.push( {
                    name: key,
                    type: `${ fieldType }`,
                    label: key,
                    inputProps: {
                        defaultValue: value,
                        // placeholder: key.toString().capitalize(),
                    },
                    onChange: ( e ) => {
                        setData(
                            utils.ao.findAndSetObject(
                                { ...input },
                                key,
                                // e.target.value.toString(),
                                fieldType === `checkbox` ? ( e.target.checked ? e.target.checked === true : false ) : e.target.value,
                            ),
                        );
                    },
                } );
            } );
        }

        return dataModel;
    };

    const buildFields = ( input ) => {
        if ( utils.val.isValidArray( input, true ) ) {
            return input.map( ( field, index ) => {
                return (
                    <Input
                        fieldType={ `${ field.type }` }
                        label={ `${ field.label }` }
                        name={ `input-${ field.type }-${ field.name }` }
                        id={ `input-${ field.type }-${ field.name }` }
                        { ...field.inputProps }
                        onChange={ field.onChange }
                        inputProps={ field.inputProps }
                        fieldLayout={ field.layout }
                    />
                );
            } );
        }
    };

    const buildFields2 = ( input ) => {
        let fields = [];
        if ( debug === true ) console.log( "INPUT.GROUP.JS :: buildFuilds(", input, ")" );
        if ( utils.val.isValidArray( input, true ) ) {
            return input.forEach( ( field, index ) => {
                let value;
                let dataType = "text";
                if ( utils.ao.has( field, "inputProps" ) ) {
                    let inputProps = field.inputProps;
                    if ( utils.ao.has( inputProps, "defaultValue" ) ) {
                        // A default value is set. Glean the dataType and format accordingly.
                        value = inputProps.defaultValue;
                        dataType = getType( value ); // typeof value;
                    }
                }
                if ( debug )
                    console.log(
                        "INPUT.GROUP.JS :: buildFields()",
                        // " :: field = ",
                        // field,
                        "\n :: value = ",
                        value,
                        "\n :: value dataType = ",
                        dataType,
                    );
                if ( [ "array", "[array]", "[object]" ].includes( dataType ) ) {
                    // Value is an iterable.
                    fields.push(
                        <Input.DataInput
                            fieldLayout={ field.layout }
                            data={ value }
                            // datamodel={data}
                            dataType={ dataType }
                            inputProps={ field.inputProps }
                            // inputProps={{
                            //     // value: value,
                            //     defaultValue: value,
                            //     // checked: value === true,
                            //     // defaultChecked: value === true,
                            // }}
                            fieldType={ `${ field.type ? field.type : `text` }` }
                            label={ `${ field.label ?? `` }` }
                            name={ `input-${ field.type }-${ field.name }` }
                            id={ `input-${ field.type }-${ field.name }` }
                            onChange={ field.onChange }
                            // onChange={(e) => {
                            //     setFormData(
                            //         utils.ao.findAndSetObject(
                            //             data,
                            //             key,
                            //             e.target.value.toString(),
                            //         ),
                            //     );
                            // }}
                            disabled={ false }
                            required={ false }
                            classes={ `input-field-textarea` }
                        />,
                    );
                } else {
                    // Render with default settings.
                    fields.push(
                        <Input
                            fieldType={ `${ field.type ? field.type : `text` }` }
                            label={ `${ field.label ?? `` }` }
                            name={ `input-${ field.type }-${ field.name }` }
                            id={ `input-${ field.type }-${ field.name }` }
                            // {...field.inputProps}
                            inputProps={ field.inputProps }
                            onChange={ field.onChange }
                            fieldLayout={ field.layout }
                        />,
                    );
                }
            } );
        }
        return fields;
    };

    const getFields = () => {
        if ( debug === true ) console.log( "INPUT.GROUP.JS :: getFields() :: props = ", props, " :: data = ", model );
        return <div className={ `input-group ${ groupLayout ? `input-group-${ groupLayout }` : "" }` }>{ !model ? children && children !== false && children : buildFields( model ) }</div>;
    };

    // if(debug)console.log("Input.Group :: {Props} = ", props);
    return getFields();
}
Input.Group = Group;

function Field ( props ) {
    const {
        children,
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        debug = false,
    } = props;

    // if(debug)console.log("Input.Field :: {Props} = ", props);
    return <div className={ `input-field ${ fieldLayout ? `input-field-${ fieldLayout }` : "" }` }>{ children && children !== false && children }</div>;
}
Input.Field = Field;

function Label ( props ) {
    const {
        children,
        label = "",
        name = "", // Value ID
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        aligned = true,
        maxWidth = `${ `10rem` }`,
        // fieldType = "text", // Default to text type.
        debug = false,
        styles = {},
    } = props;

    // if(debug)console.log("Input.Label :: {Props} = ", props);
    return (
        <label
            className={ `input-field-label ${ aligned ? `input-field-label-aligned` : `` }` }
            htmlFor={ name }
            key={ `input-label-${ label }-${ name }` }
            style={ {
                // maxWidth: `${ aligned ? maxWidth : `100%` }`,
                ...styles,
            } }>
            { utils.str.toCapitalCase( label.toLowerCase() ) }
        </label>
    );
}
Input.Label = Label;

function Tags ( props ) {
    // Basic array-type input. As you type, each word is removed and inserted into a state array, and re-rendered into the output as a tag element.
    // https://sitek94.github.io/react-tag-input-demo/
    const {
        children,
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        debug = false,
    } = props;

    // if(debug)console.log("Input.Tags :: {Props} = ", props);
    return <div className={ `input-field ${ fieldLayout ? `input-field-${ fieldLayout }` : "" }` }>{ children && children !== false && children }</div>;
}
Input.Tags = Tags;

function Props ( props ) {
    // Like tags input, but more full featured. Each tag has multiple fields, representing an object property.
    const {
        children,
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        debug = false,
    } = props;

    // if(debug)console.log("Input.Field :: {Props} = ", props);
    return <div className={ `input-field ${ fieldLayout ? `input-field-${ fieldLayout }` : "" }` }>{ children && children !== false && children }</div>;
}
Input.Props = Props;

// Updates the height on value update.
export const useTextareaAutoHeight = ( ref ) => {
    useEffect( () => {
        const listener = () => {
            let clientWidth = ref.current.parentElement.clientWidth;
            let text = ref.current.value.toString();
            let textLength = text.length;
            let rowHeight = 24;
            // let newHeight = Number( ( textLength * ( 13 / 10 ) ) % clientWidth ) * rowHeight;
            const textRowCount = text ? text.split( "\n" ).length : 0;
            const rows = textRowCount + 1;

            // console.log(
            //   	"ref.current.scrollHeight = ",
            //   	ref.current.scrollHeight,
            //   	"textLength = ", textLength,
            // 		"clientwidth = ", clientWidth,
            // 		// "newheight = ", newHeight
            // 	);

            // ref.current.style.padding = "0px";
            // ref.current.style.height = rowHeight + "px";
            // ref.current.style.removeProperty("height");
            // ref.current.style.height = rowHeight + ref.current.scrollHeight + "px";
            // // ref.current.style.height = newHeight + "px";
            // ref.current.style.removeProperty( "padding" );

            // Reset height - important to shrink on delete
            // ref.current.style.height = "inherit";
            // Set height
            ref.current.style.height = `${ Math.max(
                ref.current.scrollHeight,
                // ref.current.parentElement.clientHeight
                rowHeight
            ) }px`;
        };
        ref.current.addEventListener( "input", listener );
    }, [ ref ] );
};

const Textarea = ( props ) => {
    const {
        // Input-field constructor properties.
        fieldLayout = "inline", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
        fieldType = "text", // Default to text type.
        inputProps,
        label = "",
        id = "", // Field ID
        name = "", // Value ID
        onChange,
        disabled = false,
        required = true,
        rows = `${ 4 }`,
        cols = `${ 50 }`,
        wrap = "",
        defaultValue = "",
        placeholder, // = "",
        // Extra styling.
        classes = "",
        styles = {},
        debug = false,
    } = props;

    const ref = useRef( null );

    // console.log( "Textarea resizing :: at start :: ref = ", ref );
    const inputStyles = {
        ...styles,
    };

    useTextareaAutoHeight( ref );

    // useEffect(() => {
    // 	const listener = () => {
    // 	  	ref.current.style.padding = "0px";
    // 	  	ref.current.style.height = ref.current.scrollHeight + "px";
    // 	  	ref.current.style.removeProperty("padding");
    // 	};
    // 	ref.current.addEventListener("keydown", listener);
    // }, [ref]);

    return (
        <textarea
            ref={ ref }
            // type="text"
            className={ `input-field-control input-field-textarea` }
            name={ name }
            key={ `textarea-input-${ name }-${ id }` }
            id={ `textarea-input-${ name }-${ id }` }
            { ...inputProps }
            // value={value}
            // defaultValue={defaultValue}
            placeholder={ `${ placeholder }` }
            onChange={ onChange }
            required={ required ?? false }
            disabled={ disabled ?? false }
            wrap={ wrap }
            // rows={rows}
            // cols={cols}
            // onBlur={''}
            // onFocus={''}
            styles={ inputStyles }
        />
    );
};

Input.Textarea = Textarea;

function InputArea ( props ) {
    const {
        inputProps = {},
        label = "",
        id = "",
        name = "",
        onChange,
        disabled = false,
        required = false,
        // value,
        // defaultValue,
        placeholder = "",
        rows = `${ 4 }`,
        cols = `${ 50 }`,
        wrap = `${ "soft" }`,
        fieldStyles = {},
        labelStyles = {},
        inputStyles = {},
        debug = false,
    } = props;

    const debugReadProps = () => {
        if ( debug === true ) console.log( "InputArea :: {Props} = ", props );
    };

    debugReadProps();

    // debugReadProps();
    return (
        <Input.Field styles={ fieldStyles }>
            <Input.Label
                label={ label }
                name={ name }
                styles={ labelStyles }
            />
            <Input.Textarea
                // ref={ ref }
                // type="text"
                className={ `input-field-control input-field-textarea` }
                name={ name }
                key={ `textarea-input-${ name }-${ id }` }
                id={ `textarea-input-${ name }-${ id }` }
                inputProps={ inputProps }
                // {...inputProps}
                // value={value}
                // defaultValue={defaultValue}
                placeholder={ `${ placeholder }` }
                onChange={ onChange }
                required={ required ?? false }
                disabled={ disabled ?? false }
                wrap={ wrap }
                // rows={rows}
                // cols={cols}
                // onBlur={''}
                // onFocus={''}
                styles={ inputStyles }
            />
        </Input.Field>
    );
}
Input.InputArea = InputArea;

function Data ( props ) {
    const {
        // Data properties.
        datakey,
        data, // The values to put into each processed element's value fields.
        setData,
        datamodel, // Descriptive object
        dataType = "array", // Array | Object | ObjectArray (or OA)
        fieldType, // The type of input element to create.
        formtype, // Type of display: List | Column | Cell Mosiac
        // Input-field constructor properties.
        inputProps,
        // value = [],
        // defaultValue = [],
        label = "",
        id = "",
        name = "",
        onChange,
        disabled = false,
        required = false,
        placeholder = "",
        // Extra styling.
        classes = "",
        styles = {},
        debug = false,
        fieldStyles = {},
        labelStyles = {},
        inputStyles = {},
    } = props;

    const [ inputData, setInputData ] = React.useState( null ); // Keeps track of all data managed by this input.
    const [ inputDataModel, setInputDataModel ] = React.useState( null ); // Keeps track of all data managed by this input.
    const [ currentInputData, setCurrentInputData ] = React.useState( null ); // Content currently in the input
    const [ currentInputMode, setCurrentInputMode ] = React.useState( `none` ); // Content currently in the input
    const [ currentlyEditingIndex, setCurrentlyEditingIndex ] = React.useState( -1 ); // Content currently in the input
    const [ currentlyEditingData, setCurrentlyEditingData ] = React.useState( null ); // Content currently in the input

    const buildInputModel = ( input ) => {
        // Accepts a json object and reduces all entries to empty values. All keys and datatypes are retained.
        let premodel = input;
        if ( utils.val.isValidArray( premodel, true ) ) {
            // Input is valid array. Proceed.
            if ( [ "array", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) ) {
                premodel = premodel[ 0 ];
            }
        } else {
            if ( dataType === "array" ) {
                premodel = [ premodel ];
            }
        }
        // let cleaned = utils.val.isValidArray(input, true) ? cleanJSON(input) : cleanJSON(input);
        let cleaned = utils.ao.cleanJSON( premodel );
        if ( debug === true ) console.log( "INPUT.DATA.JS :: buildInputModel", "\n :: BEFORE :: input = ", input, "\n :: AFTER :: cleaned = ", cleaned );
        return cleaned;
    };

    useEffect( () => {
        if ( debug === true ) console.log( "Input.DataInput.js :: data is now = ", data );
        setInputData( data );

        setInputDataModel( buildInputModel( data ) );
    }, [ data ] );

    useEffect( () => {
        if ( debug === true ) console.log( "Input.DataInput.js", "\n :: inputDataModel is now = ", inputDataModel );
    }, [ inputDataModel ] );

    useEffect( () => {
        if ( debug === true ) console.log( "Input.DataInput.js", "\n :: currentInputData is now = ", currentInputData );
    }, [ currentInputData ] );

    useEffect( () => {
        if ( debug === true ) console.log( "Input.DataInput.js", "\n :: inputData is now = ", inputData );
        // setData(name, inputData);
    }, [ inputData ] );

    const debugReadProps = () => {
        if ( debug === true ) console.log( "DataInput :::: ONRENDER :::: {Props} = ", props );
    };

    useEffect( () => {
        if ( debug === true )
            console.log(
                "Input.DataInput.js :: Useeffect On Change :: ",
                "\n :: data is now = ",
                data,
                "\n :: inputDataModel is now = ",
                inputDataModel,
                "\n :: inputData is now = ",
                inputData,
                "\n :: currentInputData is now = ",
                currentInputData,
                "\n :: currentInputMode is now = ",
                currentInputMode,
                "\n :: dataType is now = ",
                dataType,
                "\n :: fieldType is now = ",
                fieldType,
            );
    }, [ inputDataModel, data, inputData, currentInputData, currentInputMode, dataType, fieldType ] );

    debugReadProps();

    const buildField = ( inputModel, currentInput, dataType = "array" ) => {
        // Create the input field to enter new data into.
        // Depending on the dataType, this may have extra interfaces such as an "add new" button, a "delete" button, etc.
        let field = [];
        if ( debug === true ) console.log( "DataInput :: buildField(", "[", inputModel, "]", "[", currentInput, "]", dataType, ")" );
        let type = "text";
        field.push(
            <Droplist
                label={ `${ `Field Input Model:` }` }
                data={ inputModel }
                showControls={ false }
                expandable={ true }
            />,
        );
        if ( utils.val.isDefined( inputModel ) ) {
            if ( debug === true ) console.log( `buildField() :: adding a single array input field control` );
            // Input is valid. Proceed.
            if ( [ "array", "[array]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) ) {
                // Input is an array of scalars. Easy to handle.
                // if (utils.val.isValidArray(inputModel, true)) {
                // Input is valid array. Proceed.
                // For array input fields, we don't provide a label.
                field.push(
                    <div className={ `data-input-group input-group-inline` }>
                        <Input.Field
                            fieldLayout={ `block` }
                            styles={ fieldStyles }>
                            <Input.Label
                                label={ `${ `index` }` }
                                htmlFor={ name }
                                name={ name }
                                styles={ labelStyles }
                            />
                            <Input.Control
                                fieldType={ type }
                                name={ name }
                                key={ `data-input-${ name }-${ id }` }
                                id={ `data-input-${ name }-${ id }` }
                                onChange={ ( e ) => {
                                    console.log( "OnChange :: e.target.value = ", e.target.value );
                                    setCurrentInputData(
                                        // utils.ao.findAndSetObject(data, name, e.target.value),
                                        e.target.value,
                                    );
                                } }
                                inputProps={ {
                                    defaultValue: currentInputData ? currentInputData.toString() : ``,
                                    placeholder: `${ `Array input` }`,
                                } }
                                classes={ `input-field-data input-field-data-array` }
                                styles={ inputStyles }
                            />
                        </Input.Field>
                    </div>,
                );
            } else if ( [ "object", "[object]" ].includes( dataType ) ) {
                // Input is an array of objects. In this case, for each key in the objects in the array, we create an input field, arranged in a grid.
                let model = inputModel;
                if ( utils.val.isValidArray( inputModel, true ) ) {
                    // Input is valid array. Proceed.
                    inputModel = inputModel[ 0 ];
                }
                if ( utils.val.isObject( inputModel ) ) {
                    if ( Object.keys( inputModel ).length > 0 ) {
                        // Valid object item - Iterate over its keys.
                        Object.keys( inputModel ).forEach( ( key, index ) => {
                            let value = inputModel[ key ];
                            // Get the data type and according field type of each individual element of this object.
                            let elementdatatype = getType( value );
                            let elementfieldtype = getFieldType( value );
                            if ( debug )
                                console.log(
                                    "Input.DataInput.js :: OA / ObjectArray input render. :: key = ",
                                    key,
                                    ` :: value = `,
                                    value,
                                    " :: elementdatatype = ",
                                    elementdatatype,
                                    " :: elementfieldtype = ",
                                    elementfieldtype,
                                );
                            if ( key !== `_id` ) {
                                // if (elementdatatype === "array") {
                                if ( [ "array", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( elementdatatype ) ) {
                                    // For arrays, we show inputs for all current entries, plus an "Add more" button.
                                    if ( utils.val.isValidArray( value ) ) {
                                        // field.push(buildField(val, val, elementdatatype));
                                        field.push(
                                            <div className={ `data-input-group input-group-block` }>
                                                <Input.Field
                                                    fieldLayout={ `block` }
                                                    styles={ fieldStyles }>
                                                    <Input.Label
                                                        label={ `${ key } []` }
                                                        name={ name }
                                                        styles={ labelStyles }
                                                    />
                                                    <div className={ `data-input-field` }>
                                                        { value.map( ( val, valIndex ) => {
                                                            return (
                                                                <div className={ `data-input-field-inline-controls` }>
                                                                    <Input.Control
                                                                        fieldType={ elementfieldtype }
                                                                        name={ name }
                                                                        key={ `data-input-${ name }-${ id }-${ val }-${ valIndex }` }
                                                                        id={ `data-input-${ name }-${ id }-${ val }-${ valIndex }` }
                                                                        onKeyPress={ ( e ) => {
                                                                            let keynum = e.which;
                                                                            if ( debug === true )
                                                                                console.log( "Key pressed on input: e = ", e, " :: keynum = ", keynum, " :: e.key = ", e.key );

                                                                            if ( e.key === "Enter" ) {
                                                                                // setState({ message: e.target.value }, () => {
                                                                                // 	alert(this.state.message);
                                                                                // });
                                                                                let temp = { ...currentInputData };
                                                                                if ( !temp ) {
                                                                                    temp = { ...inputModel };
                                                                                }

                                                                                temp[ key ] = [ ...temp[ key ], "-" ];
                                                                                setCurrentInputData( temp );
                                                                            }
                                                                        } }
                                                                        onChange={ ( e ) => {
                                                                            let val =
                                                                                elementdatatype === `boolean`
                                                                                    ? e.target.checked
                                                                                        ? e.target.checked === true
                                                                                        : false
                                                                                    : e.target.value;
                                                                            let temp = currentInputData;
                                                                            if ( !temp ) {
                                                                                temp = inputModel;
                                                                            }
                                                                            if ( !utils.ao.has( temp, key ) ) {
                                                                                Object.defineProperty( temp, key, {
                                                                                    value: [],
                                                                                } );
                                                                            }
                                                                            if ( debug === true )
                                                                                console.log( "temp[key] = ", temp[ key ], " :: " );
                                                                            temp[ key ][ valIndex ] = val; // e.target.value;

                                                                            // Clean out empties.
                                                                            // temp[key] = removeEmpty(temp[key]);
                                                                            setCurrentInputData( temp );
                                                                        } }
                                                                        inputProps={ {
                                                                            defaultValue: val,
                                                                            placeholder: valIndex,
                                                                        } }
                                                                        classes={ `input-field-data input-field-data-array` }
                                                                        styles={ inputStyles }
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        id={ `input-data-field-oa-remove-array-entry` }
                                                                        icon={ <FaMinus className={ `button-icon` } /> }
                                                                        appearance={ `control` }
                                                                        onClick={ ( e ) => {
                                                                            let temp = { ...currentInputData };

                                                                            temp[ key ] = temp[ key ].filter( ( item, itemIndex ) => {
                                                                                if ( debug === true ) console.log( item, itemIndex );
                                                                                return itemIndex !== valIndex;
                                                                            } );

                                                                            if ( debug === true )
                                                                                console.log(
                                                                                    "FaMinus button onclick :: temp = ",
                                                                                    temp,
                                                                                    "\n :: currentInputData = ",
                                                                                    currentInputData,
                                                                                    "\n :: currentInput = ",
                                                                                    currentInput,
                                                                                );
                                                                            setCurrentInputData( temp );
                                                                        } }
                                                                    />
                                                                </div>
                                                            );
                                                        } ) }
                                                    </div>
                                                    <div className={ `data-input-controls` }>
                                                        <Button
                                                            type="button"
                                                            id={ `input-data-field-oa-add-array-entry` }
                                                            icon={ <FaPlus className={ `button-icon` } /> }
                                                            appearance={ `control` }
                                                            onClick={ ( e ) => {
                                                                // let temp = currentInputData;
                                                                /// * let temp = { ...inputModel };

                                                                let temp = { ...currentInputData };
                                                                if ( !temp ) {
                                                                    temp = { ...inputModel };
                                                                }

                                                                if ( debug === true )
                                                                    console.log(
                                                                        `Input.Control :: OA :: Inner loop for array elements :: Add button clicked :: inputModel = `,
                                                                        inputModel,
                                                                        " :: currentInput = ",
                                                                        currentInput,
                                                                        " :: currentInputData = ",
                                                                        currentInputData,
                                                                        " :: temp = ",
                                                                        temp,
                                                                        // " :: deepSearchObject(currentInput, key) = ",
                                                                        // deepSearchObject(currentInput, key),
                                                                        " :: temp[ key ] = ",
                                                                        temp[ key ],
                                                                        " :: ...currentInputData = ",
                                                                        { ...currentInputData },
                                                                    );
                                                                // if (!temp) temp = model;
                                                                // temp[ key ].push( "-" );
                                                                temp[ key ] = [ ...temp[ key ], "-" ];
                                                                // temp[key][valIndex] = e.target.value;
                                                                setCurrentInputData( temp );
                                                            } }
                                                        />
                                                        ,
                                                    </div>
                                                </Input.Field>
                                            </div>,
                                        );
                                    }
                                } else {
                                    field.push(
                                        <div className={ `data-input-group input-group-inline` }>
                                            <Input.Field
                                                fieldLayout={ `block` }
                                                styles={ fieldStyles }>
                                                <Input.Label
                                                    label={ `${ key }` }
                                                    name={ name }
                                                    styles={ labelStyles }
                                                />
                                                <Input.Control
                                                    fieldType={ elementfieldtype }
                                                    name={ key }
                                                    key={ `data-input-${ name }-${ key }-${ id }` }
                                                    id={ `data-input-${ name }-${ key }-${ id }` }
                                                    onKeyDown={ ( e ) => {
                                                        let keynum = e.which;
                                                        if ( debug === true )
                                                            console.log( "Key pressed on input: e = ", e, " :: keynum = ", keynum );
                                                    } }
                                                    onChange={ ( e ) => {
                                                        if ( debug === true )
                                                            console.log(
                                                                `Input.Control :: OA :: e.target.value = `,
                                                                e.target.value,
                                                                " :: currentInput = ",
                                                                currentInput,
                                                                " :: currentInputData = ",
                                                                currentInputData,
                                                            );
                                                        // let temp = currentInput;
                                                        // let temp = { ...currentInput };
                                                        let temp = { ...currentInputData };
                                                        let val = elementdatatype === `boolean` ? ( e.target.checked ? e.target.checked === true : false ) : e.target.value;
                                                        if ( !temp ) {
                                                            temp = { ...inputModel, [ key ]: val };
                                                        } else if ( utils.val.isObject( temp ) ) {
                                                            temp[ key ] = val; // e.target.value;
                                                        } else {
                                                            temp = inputModel;
                                                            temp[ key ] = val; // e.target.value;
                                                        }
                                                        // temp = removeEmpty(temp);
                                                        setCurrentInputData( temp );
                                                    } }
                                                    inputProps={ {
                                                        // defaultValue: currentInput ? currentInput[key] : ``,
                                                        defaultValue: currentInputData ? currentInputData[ key ] : ``,
                                                        // placeholder: `${placeholder}`,,
                                                        placeholder: `${ `OA input` }`,
                                                    } }
                                                    // onChange={onChange}
                                                    classes={ `input-field-data input-field-data-object` }
                                                    styles={ inputStyles }
                                                />
                                            </Input.Field>
                                        </div>,
                                    );
                                }
                            }
                        } );
                    }
                }
            } else if ( dataType === "object" ) {
                // Input is just one object. For convenience, we can treat it as an array of one item.
                field.push(
                    <Button
                        type="button"
                        appearance={ `control` }
                        onClick={ ( e ) => {
                            setInputData( [ ...inputData, currentInputData ] );
                            setData( datakey, [
                                // setInputData([
                                ...inputData,
                                currentInputData,
                            ] );
                            // onChange(e);
                        } }
                        label={ `Add` }
                        className="admin-button px-10 py-2 bg-primary text-white"
                    />,
                );
            }
        }
        return field;
    };

    const buildDataArray = ( input ) => { };

    const buildDataObject = ( input ) => { };

    const buildComponents = ( input, dataType = "array" ) => {
        // Create the elements representing values currently stored in the array.
        let datacells = [];
        let datalist = [];
        if ( debug === true ) console.log( "DataInput :: buildComponents(", input, dataType, ")" );
        if ( input ) {
            // Input is valid. Proceed.
            if ( [ "array", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) ) {
                // Input is an array of scalars. Easy to handle.

                // return getCellList(input);
                if ( utils.val.isValidArray( input, true ) ) {
                    input.forEach( ( element, index ) => {
                        // return createCell(item, index, true, true);
                        if ( element ) {
                            datacells.push(
                                <div className={ `data-input-cell-item data-input-cell-item-row` }>
                                    <div className="data-input-cell-buttons">
                                        <Button
                                            icon={ <FaTimes className={ `button-icon` } /> }
                                            id={ `input-data-cell-array-delete-entry` }
                                            appearance={ `control` }
                                            onClick={ ( e ) => {
                                                // Remove this entry from the data.
                                                let temp = [ ...inputData ];
                                                let x = temp.splice( temp.indexOf( element ), 1 );
                                                x = temp.filter( ( i ) => index !== i );
                                                setInputData( x );
                                                if ( debug === true )
                                                    console.log( "deleteCell :: index = ", index, " :: inputData = ", inputData, " :: inputData[index] = ", inputData[ index ], " :: x = ", x );
                                            } }
                                        />
                                        <Button
                                            icon={ <FaEdit className={ `button-icon` } /> }
                                            id={ `input-data-cell-array-edit-entry` }
                                            appearance={ `control` }
                                            onClick={ ( e ) => {
                                                // Swap the content with an editable input field.
                                                if ( debug === true )
                                                    console.log( "createCell :: index = ", index, " :: inputData = ", inputData, " :: inputData[index] = ", inputData[ index ] );
                                                setCurrentInputMode( "edit" );
                                                setCurrentInputData( inputData[ index ] );
                                                setCurrentlyEditingIndex( index );
                                            } }
                                        />
                                    </div>
                                    { currentlyEditingIndex !== index && (
                                        //<Droplist
                                        //    label={`${element._id}`}
                                        //    data={element}
                                        //    showControls={false}
                                        //    expandable={true}
                                        ///>
                                        <div className="data-input-cell-content">
                                            <div className={ `data-input-cell-item-text data-key` }>{ `${ index }:` }</div>
                                            <div className={ `data-input-cell-item-text data-value` }>{ `${ element }` }</div>
                                        </div>
                                    ) }
                                    { currentlyEditingIndex === index && (
                                        // Currently editing this entry.
                                        <div className={ `data-input-cell-content` }>
                                            <div className={ `data-input-field-container` }>
                                                <div className={ `data-input-field` }>{ buildField( currentInputData, element, dataType ) }</div>
                                            </div>
                                            <div className={ `data-input-cell-buttons` }>
                                                <Button
                                                    label={ <FaCheck /> }
                                                    id={ `input-data-cell-array-submit-update` }
                                                    appearance={ `control` }
                                                    onClick={ ( e ) => {
                                                        handleDataUpdate( index, currentInputData );
                                                    } }
                                                />
                                                <Button
                                                    label={ <FaTimes /> }
                                                    id={ `input-data-cell-array-clear-update` }
                                                    appearance={ `control` }
                                                    onClick={ ( e ) => {
                                                        setCurrentInputData( inputDataModel );
                                                        setCurrentlyEditingIndex( -1 );
                                                        setCurrentInputMode( "none" );
                                                    } }
                                                />
                                            </div>
                                        </div>
                                    ) }
                                </div>,
                            );
                        }
                    } );
                    datalist.push( <div className="data-input-cell-list" key={ utils.rand.randString( 16 ) }>{ datacells }</div> );
                }
            } else if ( [ "[array]", "[object]" ].includes( dataType ) ) {
                // Input is an array of objects. In this case, for each key in the objects in the array, we create an input field, arranged in a grid.
                if ( utils.val.isValidArray( input, true ) ) {
                    // Input is valid array of objects. Proceed.
                    if ( debug === true ) console.log( "DataInput :: buildComponents(", input, dataType, ") :: Running for OA data. " );
                    input.forEach( ( element, index ) => {
                        // Build a cell for each element in the array.
                        let celldata = [];
                        if ( utils.val.isObject( element ) ) {
                            if ( Object.keys( element ).length > 0 ) {
                                // Valid object entry - Iterate over its keys.
                                Object.keys( element ).forEach( ( key, index ) => {
                                    let value = element[ key ];
                                    if ( value ) {
                                        celldata.push(
                                            <div className={ `data-input-cell-item-row` }>
                                                <div
                                                    className={ `data-input-cell-item-text data-key` }
                                                    contentEditable={ false }>{ `${ key }:` }</div>
                                                <div
                                                    className={ `data-input-cell-item-text data-value` }
                                                    contentEditable={ false }>{ `${ value }` }</div>
                                            </div>,
                                        );
                                    }
                                } );
                            }
                        }
                        datacells.push(
                            <div className={ `data-input-cell-item mosaic-item ${ currentlyEditingIndex === index ? "active" : "" }` }>
                                <div className={ `data-input-cell-item-toolbar` }>
                                    <div className={ `button-group button-row` }>
                                        <Button
                                            type="button"
                                            id={ `input-data-field-oa-edit-entry` }
                                            icon={ <FaEdit className={ `button-icon` } /> }
                                            appearance={ `neumorphic` }
                                            onClick={ ( e ) => {
                                                // Remove this entry from the data BUT replace the values currently in the input fields with this cell's values.
                                                setCurrentInputData( {
                                                    ...element,
                                                } );
                                                setCurrentInputMode( "edit" );
                                                setCurrentlyEditingIndex( index );
                                            } }
                                            label={ `` }
                                            className="button cell-toolbar-button edit-button"
                                        />
                                        <Button
                                            type="button"
                                            id={ `input-data-field-oa-delete-entry` }
                                            icon={ <FaTimes className={ `button-icon` } /> }
                                            appearance={ `neumorphic` }
                                            onClick={ ( e ) => {
                                                // Remove this entry from the data.
                                                setInputData(
                                                    inputData.filter( ( data, index ) => {
                                                        return data._id !== element._id;
                                                    } ),
                                                );
                                                if ( debug === true )
                                                    console.log( "Array of objects :: deleteCell :: inputData = ", inputData );
                                            } }
                                            label={ `` }
                                            className="button cell-toolbar-button delete-button"
                                        />
                                    </div>
                                </div>
                                <div className={ `data-input-cell-item-content` }>
                                    { currentlyEditingIndex !== index && (
                                        <Droplist
                                            label={ `${ element._id }` }
                                            data={ element }
                                            showControls={ false }
                                            expandable={ true }
                                        />
                                    ) }
                                    { currentlyEditingIndex === index && (
                                        // Currently editing this entry.
                                        <div className={ `data-input-field-container` }>
                                            <div className={ `data-input-field` }>{ buildField( currentInputData, element, dataType ) }</div>
                                            <div className={ `data-input-cell-buttons` }>
                                                <Button
                                                    id={ `input-data-cell-oa-submit-update` }
                                                    icon={ <FaCheck className={ `button-icon` } /> }
                                                    appearance={ `control` }
                                                    onClick={ ( e ) => {
                                                        handleDataUpdate( index, currentInputData );
                                                    } }
                                                />

                                                <Button
                                                    id={ `input-data-cell-oa-submit-update` }
                                                    icon={ <FaTrashAlt className={ `button-icon` } /> }
                                                    appearance={ `control` }
                                                    onClick={ ( e ) => {
                                                        setCurrentInputData( inputDataModel );
                                                        setCurrentlyEditingIndex( -1 );
                                                        setCurrentInputMode( "none" );
                                                    } }
                                                />
                                            </div>
                                        </div>
                                    ) }
                                </div>
                            </div>,
                        );
                    } );
                    datalist.push( <div className="data-input-cell-list mosaic">{ datacells }</div> );
                }
            } else if ( dataType === "object" ) {
                // Input is just one object. For convenience, we can treat it as an array of one item.
            }
        }

        return (
            <div className={ `data-input-container` }>
                <div className={ `data-input-visual-container` }>{ datalist }</div>
                { currentInputMode && currentInputMode === "none" && (
                    <div className={ `data-input-field-container` }>
                        <div className={ `data-input-field` }></div>
                        <div className={ `data-input-controls` }>
                            <Button
                                type="button"
                                icon={ <FaPlus className={ `button-icon` } /> }
                                appearance={ `control` }
                                onClick={ ( e ) => {
                                    setCurrentInputData( inputDataModel );
                                    setCurrentInputMode( "add" );
                                } }
                            />
                        </div>
                    </div>
                ) }
                { currentInputMode && currentInputMode === "add" && (
                    <div className={ `data-input-field-container` }>
                        <div className={ `data-input-field` }>{ buildField( currentInputData ? currentInputData : inputDataModel, currentInputData, dataType ) }</div>
                        <div className={ `data-input-controls` }>
                            <Button
                                type="button"
                                icon={ <FaCheck className={ `button-icon` } /> }
                                appearance={ `control` }
                                onClick={ ( e ) => {
                                    // Insert the data currently in currentInputData.
                                    handleDataAdd();
                                    setCurrentInputMode( "none" );
                                } }
                                className="admin-button px-10 py-2 bg-primary text-white"
                            />
                            <Button
                                type="button"
                                icon={ <FaTrashAlt className={ `button-icon` } /> }
                                appearance={ `control` }
                                onClick={ ( e ) => {
                                    // Clear out the changes made to currentInputData.
                                    setCurrentInputData( inputDataModel );
                                    setCurrentInputMode( "add" );
                                } }
                                className="admin-button px-10 py-2 bg-primary text-white"
                            />
                            <Button
                                type="button"
                                icon={ <FaTimes className={ `button-icon` } /> }
                                appearance={ `control` }
                                onClick={ ( e ) => {
                                    // Cancel making the data insertion.
                                    setCurrentInputData( inputDataModel );
                                    setCurrentInputMode( "none" );
                                } }
                                className="admin-button px-10 py-2 bg-primary text-white"
                            />
                        </div>
                    </div>
                ) }
                <div className={ `data-input-field-container` }>
                    {
                        debug && currentInputMode !== "none" && inputDataModel && (
                            <Droplist
                                label={ `${ `Current Input Model` }` }
                                data={ inputDataModel }
                                showControls={ false }
                                expandable={ false }
                            />
                        )
                    }
                    {
                        debug && currentInputMode !== "none" && currentInputData && (
                            <Droplist
                                label={ `${ `Current Input` }` }
                                data={ currentInputData }
                                showControls={ false }
                                expandable={ false }
                            />
                        )
                    }
                </div>
            </div>
        );
    };

    const handleDataRemove = ( data, index, input ) => {
        // Remove this entry from the data.
        let temp = [ ...data ];
        let x = temp.splice( temp.indexOf( input ), 1 );
        x = temp.filter( ( i ) => index !== i );
        setInputData( x );
    };

    const handleDataClear = () => {
        // Remove this entry from the data.
        setCurrentInputData( inputDataModel );
        setCurrentlyEditingIndex( -1 );
        setCurrentInputMode( "none" );
    };

    const handleDataUpdate = ( index, input ) => {
        // setCurrentlyEditingIndex(-1);
        // let temp = inputData;
        // temp[index] = currentInputData;
        // setInputData(temp);
        // setCurrentInputData(null);
        // setCurrentInputMode("add");
        // let temp = inputData;

        if ( debug === true )
            console.log(
                "DataInput.js :: handleDataUpdate :: ",
                "\n OPERATION: ",
                currentInputMode,
                "\n :: dataType = ",
                dataType,
                "\n :: currentInputData = ",
                currentInputData,
                "\n :: {...currentInputData} = ",
                { ...currentInputData },
                "\n :: inputData = ",
                inputData,
                "\n :: {...inputData} = ",
                { ...inputData },
            );
        let temp = [ ...inputData ];
        temp[ index ] = input;
        setInputData( temp );
        setCurrentInputData( inputDataModel );
        setCurrentlyEditingIndex( -1 );
        setCurrentInputMode( "add" );
    };

    const handleDataAdd = () => {
        let requiredKeys = Object.keys( inputDataModel );
        requiredKeys = requiredKeys.filter( ( key ) => ![ "_id", "index" ].includes( key ) );
        if ( debug === true )
            console.log(
                "DataInput.js :: handleDataAdd :: ",
                "\n OPERATION: ",
                currentInputMode,
                "\n :: dataType = ",
                dataType,
                "\n :: currentInputData = ",
                currentInputData,
                "\n Required keys = ",
                requiredKeys,
                // "\n [...currentInputData] = ",
                // [...currentInputData],
            );
        // let temp = {...currentInputData};
        if (
            // ( utils.val.isObject( currentInput ) && utils.ao.hasAll( currentInput, [ Object.keys( inputDataModel ) ] ) ) ||
            // ( utils.val.isString( currentInput ) && currentInput !== '' )
            [ "[object]" ].includes( dataType ) &&
            utils.val.isObject( currentInputData ) &&
            utils.ao.hasAll( currentInputData, requiredKeys )
        ) {
            ///*
            let temp = { ...currentInputData };
            temp._id = Math.random() * 1000000000000;
            temp.index = inputData.length;
            // setCurrentInputData(inputDataModel);
            setInputData( [ ...inputData, temp ] );
            setData( datakey, [
                // setInputData([
                ...inputData,
                temp,
            ] );
            //*/
            // setCurrentInputData(null);
            // setInputData([...inputData, currentInputData]);
            // setData(datakey, [
            //     // setInputData([
            //     ...inputData,
            //     currentInputData,
            // ]);
            // onChange(e);
        } else if ( [ "array", "[array]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) && currentInputData !== "" ) {
            // let temp = [...currentInputData];
            let temp = currentInputData;
            if ( debug === true )
                console.log( "[...inputData, temp] = ", [ ...inputData, temp ] );
            // setCurrentInputData(inputDataModel);
            setInputData( [ ...inputData, temp ] );
            setData( datakey, [
                // setInputData([
                ...inputData,
                temp,
            ] );
        }
        // setCurrentInputData(inputDataModel);
        // setCurrentInputMode("none");
        handleDataClear();
    };

    return (
        <Input.Field styles={ fieldStyles }>
            <Input.Label
                label={ label }
                name={ name }
                styles={ labelStyles }></Input.Label>
            { inputData && buildComponents( inputData, dataType ) }
        </Input.Field>
    );

    // return (
    //     <Input.Field>
    //         <Input.Label label={label} name={name}></Input.Label>
    //         {inputData && (
    //             <div className={`data-input-container`}>
    //                 <div className={`data-input-visual-container`}>
    //                     {buildDataView(inputData, dataType)}
    //                 </div>
    //                 <br />
    //                 <div className={`data-input-field-container`}>
    //                     {
    //                         // buildInput( inputData, dataType )
    //                         buildInput(
    //                             inputDataModel,
    //                             currentInputData,
    //                             dataType,
    //                         )
    //                     }
    //                 </div>
    //                 <div className={`data-input-field-container`}>
    //                     <Droplist
    //                         label={`${`Current Input`}`}
    //                         data={currentInputData}
    //                         showControls={false}
    //                         expandable={true}
    //                     />
    //                 </div>
    //             </div>
    //         )}
    //     </Input.Field>
    // );
}
Input.Data = Data;

export default Input;
