import React, { useState, useEffect } from "react";
import * as utils from 'akashatools';
import * as datahelper from '../../lib/utilities/data.js';
import Input from "./Input.jsx";
import Button from "../Button/index.jsx";
import Droplist from "../Droplist/index.jsx";
// Form component hierarchy:
// <Form>
//     <FormGroup>
//         <FormText>Generic text to add descriptions or instructions.</FormText>
//         <FormField>
//             <FormFieldLabel>
//                 <Label></Label>
//             </FormFieldLabel>
//             <FormFieldInput>
//                 <Input></Input>
//             </FormFieldInput>
//         </FormField>
//         <FormField>
//             <FormFieldInput>
//                 <ArrayInput>Dynamic input for elemental array based data.</ArrayInput>
//             </FormFieldInput>
//         </FormField>
//         <FormField>
//             <FormFieldInput>
//                 <OAInput>Dynamic input for object array based data.</OAInput>
//             </FormFieldInput>
//         </FormField>
//         <FormSubmit>Button(s) to config and submit the form.</FormSubmit>
//     </FormGroup>
// </Form>;
//
// Unique components:
//  <Form />
//      <FormGroup />
//          <FormField />
//              <Label />
//              <Input />
//              <ArrayInput />
//              <OAInput />

/*  // Form organizational structure: 
Form (Or container)
	Form-Group
		Form-Group-Label
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

// This form will self-build based on the data provided to it.
export function Form ( props ) {
	const {
		// Child components passed inside this component's element.
		children,
		// Render overrides, if ever needed.
		show = true,
		// Form rendering properties.
		showViewport = false,
		viewportOverride,
		viewportLayout = `column`,
		formModel = {},
		data,
		setData = ( e ) => { },
		initialData,
		onSubmit = ( e ) => { },
		onChange = ( e ) => { },
		layout = "block", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
		// Style settings.
		styles = {},
		classes = "",
		debug = false,
	} = props;

	const [ formData, setFormData ] = React.useState( null );
	useEffect( () => {
		if ( debug ) console.log( "Form.js :: initialData is now = ", initialData );
		setFormData( initialData );
	}, [ initialData ] );

	useEffect( () => {
		if ( debug ) console.log( "Form.js :: formData is now = ", formData );
	}, [ formData ] );

	const componentStyles = {
		// Default styles go here.
		// Flex properties
		display: `${ "flex" }`,
		flexDirection: `${ "row" }`,
		justifyContent: `${ "center" }`,
		alignItems: `${ "center" }`,
		alignContent: `${ "center" }`,
		// Size properties
		height: `${ "100%" }`,
		minHeight: `${ "auto" }`,
		width: `${ "100%" }`,
		minWidth: `${ "50%" }`,
		padding: `0.25rem 1.0rem`,
		border: `1px dashed black`,
		// User-set styles override default settings.
		...styles,
		// Responsiveness overrides go here.
	};

	const fieldStyles = {};

	const labelStyles = {
		// Style overrides for individual cards.
		// gap: `${gridGap}`,
		// padding: `${padding ? padding : "0.0rem"}`,
		...{
			... (
				formModel
					? {
						// minWidth: `auto`,
						minWidth: `${ utils.str.getLongest( formModel ) / 2 + 2 }rem`,
						maxWidth: `${ 100 }%`,
						paddingInline: `${ 0.5 }rem`,
						flex: `0 1 ${ 10 }rem`,
					}
					: {}
			),
		},
		// height: `${cardWidth}`,
		// width: `${cardHeight}`,
	};

	const inputStyles = {};

	// To make this work, we're going to need a way to update values deep inside the data array stored in state.
	const constructForm = ( input ) => {
		let form = [];
		if ( utils.val.isObject( input ) ) {
			// if ( debug ) console.log("FORM.JS.js :: constructForm(", model, ") :: is valid object. It has ", Object.keys( model ).length, " keys.");

			// Valid input. Proceed.
			Object.keys( input ).forEach( ( key, index ) => {
				// Figure out what type of value is at each key.
				let value = input[ key ];

				let fieldType = datahelper.getFieldType( value );
				let dataType = datahelper.getType( value );
				// if ( debug ) console.log("FORM.JS.js :: constructForm(", model, ") :: key = ", key, ' :: value = ', value, ' :: index = ', index);
				// if (utils.val.isObject(value)) {
				if ( typeof value === "object" && Array.isArray( value ) ) {
					// Value is an array.
					fieldType = "data";
					if ( utils.val.isValidArray( value, true ) ) {
						let test = value[ 0 ];
						// Get the dataType of the array element to see if it's a scalar array or object array.
						if ( debug ) console.log( "Typeof sub-object = ", typeof test );
						if ( typeof test === "object" ) {
							// Array of objects.
							dataType = "[object]";
						} else if ( Array.isArray( test ) ) {
							// Array of arrays.
							dataType = "[array]";
						} else if ( [ "string", "number", "boolean", "date" ].includes( typeof test ) ) {
							// Array of scalars.
							dataType = `[${ typeof test }]`;
						}
					}
					// Value is a nested object array.
					// Render a specialized input.
					if ( fieldType && dataType ) {
						form.push( Field( formData, key, value, dataType, fieldType ) );
					}
				} else if (
					utils.val.isObject( value ) &&
					!utils.val.isArray( value )
				) {
					// Value is an object.
					if ( Object.keys( value ).length > 0 ) {
						// Valid object.
						fieldType = "data";
						dataType = "object";
						if ( fieldType && dataType ) {
							form.push(
								Field(
									formData,
									key,
									value,
									dataType,
									fieldType,
								),
							);
						}
					}
				} else {
					// Value is a scalar of some kind. Dig into the specific type.
					// if (utils.val.isString(value)) {
					if ( typeof value === "string" ) {
						// Value is a String.
						// Render a text input.
						dataType = "string";
						fieldType = "text";
					} else if ( utils.val.isNumber( value ) ) {
						// Value is a Number.
						// Render a number input.
						dataType = "number";
						fieldType = "number";
					} else if ( value === true || value === false ) {
						// Value is a Boolean.
						// Render a checkbox.
						dataType = "boolean";
						fieldType = "checkbox";
					} else {
						// I dunno lol.
						// return '';
					}
					form.push( Field( formData, key, value, dataType, fieldType ) );
					if ( debug )
						console.log(
							"FORM.JS.js :: constructForm(",
							input,
							") :: after typecheck run :: key = (",
							key,
							") :: value = (",
							value,
							") :: dataType = (",
							dataType,
							") :: fieldType = (",
							fieldType,
							")",
						);
				}
			} );
		} else if ( utils.val.isValidArray( input, true ) ) {
			let element = input[ 0 ];
			form = constructForm( element );
		}
		return form;
	};

	const Field = ( fieldData, key, value, dataType, fieldType ) => {
		if ( debug )
			console.log(
				"FORM.JS.js :: Field(",
				[ fieldData, key, value, dataType, fieldType ],
				")",
			);
		// Turns an input into a field. Simple as.
		// if (
		//     ["array", "object", "symbol", "oa", "data"].includes(dataType) ||
		//     fieldType === "data"
		// ) {
		// let rand = Math.floor( utils.rand.rand( 1e6, 0 ) );
		let id = `dynamic-form-input-${ dataType }-${ fieldType }-${ key }-${ '' }`;
		if ( [ "array", "object", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) || fieldType === "data" ) {
			// Dealing with a complex, possibly nested data input type.
			return (
				<Input.Data
					onChange={ ( e ) => {
						let temp = { ...fieldData };
						temp = JSON.parse( JSON.stringify( fieldData ) ); // Make a deep copy because of read-only property errors.
						if ( debug )
							console.log(
								"FORM.JS :: FIELD :: onChange triggered :: ",
								"\nfieldData = ",
								fieldData,
								"\nkey = ",
								key,
								"\ne.target.value = ",
								e.target.value,
								"\ntemp = ",
								temp,
							);
						let updatedData = utils.ao.deepFindSet(
							// fieldData,
							temp,
							key,
							e.target.value, // .toString(),
						);
						// onChange( updatedData );

						if ( onChange ) {
							onChange( e, key, value );
						}
						else setFormData( updatedData );
					} }
					setData={ ( key, input ) => {
						let temp = { ...fieldData };
						if ( debug )
							console.log(
								"FORM.JS :: FIELD :: setData triggered :: ",
								"\nfieldData = ",
								fieldData,
								"\nkey = ",
								key,
								"\ninput = ",
								input,
								"\n temp = ",
								temp,
								"utils.ao.deepFindSet(temp, key, input, ) = ",
								utils.ao.deepFindSet(
									// fieldData,
									temp,
									key,
									input,
								),
							);
						// setFormData(utils.ao.findAndSetObject(fieldData, key, input));
						let updated = utils.ao.deepFindSet(
							// fieldData,
							temp,
							key,
							input,
						);
						setFormData( updated );
						if ( setData ) setData( updated );
					} }
					datakey={ key }
					data={ value }
					datamodel={ fieldData }
					dataType={ dataType }
					fieldType={ fieldType }
					// value={value}
					// defaultValue={value}
					inputProps={ {
						// value: value,
						defaultValue: value,
						// checked: value === true,
						// defaultChecked: value === true,
					} }
					label={ key }
					id={ key }
					key={ id }
					name={ key }
					disabled={ false }
					required={ false }
					placeholder={ key }
					classes={ `input-field-textarea` }
					fieldStyles={ fieldStyles }
					labelStyles={ labelStyles }
					inputStyles={ inputStyles }
				/>
			);
		} else if (
			[ "string", "number", "boolean", "date" ].includes( dataType )
		) {
			// Dealing with a scalar data type.
			//
			return (
				<Input
					fieldType={ fieldType }
					value={ value }
					defaultValue={ value }
					inputProps={ {
						// value: value,
						defaultValue: value,
						// checked: value === true,
						// defaultChecked: value === true,
					} }
					label={ key }
					id={ key }
					key={ id }
					name={ key }
					onChange={ ( e ) => {
						let temp = { ...fieldData };

						let updatedData = utils.ao.deepFindSet(
							temp,
							key,
							// e.target.value,
							// fieldType === `checkbox` ? ( e.target.checked ? e.target.checked === true : false ) : e.target.value,
							datahelper.formatInputValue( e, fieldType ),
						);
						// onChange( updatedData );


						if ( debug )
							console.log(
								"FORM.JS :: BOOL :: onChange triggered :: ",
								"\nfieldData = ",
								fieldData,
								"\nkey = ",
								key,
								"\ntemp = ",
								temp,
							);

						if ( onChange ) {
							onChange( e, key, value );
						}

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

	const modelToData = ( model ) => {
		// Extract all keys from the model and build a database that can be filled from it.
	};

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
				if ( debug ) console.log(
					"FORM.JS :: dataToModel(",
					input,
					") :: key = ",
					key,
					" :: value = ",
					value,
				);
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
						setFormData(
							utils.ao.deepFindSet(
								{ ...input },
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

	const buildFormFields = ( input ) => {
		let form = [];
		let model = dataToModel( input );
		let id = `form-fields-item`;
		if ( showViewport ) {
			form.push(
				<div
					id={ `${ id }-viewport` }
					key={ `${ id }-viewport` }
					className={ `form-viewport-container` }
				>
					{
						viewportOverride
							? viewportOverride
							: <Droplist
								label={ `Form Data` }
								data={ formData }
							/>
					}
				</div>,
			);
		}
		// form.push(<Input.Group model={model} />);
		form.push(
			<div
				id={ `${ id }-inputs-container` }
				key={ `${ id }-inputs-container` }
				className={ `form-inputs-container` }
			>
				{ constructForm( formData ) }
			</div>
		);
		form.push(
			<div
				id={ `${ id }-submit-button` }
				key={ `${ id }-submit-button` }
				className="flex justify-end w-full"
			>
				<Button
					type="submit"
					appearance={ `glassmorphic` }
					onClick={ ( e ) => {
						onSubmit( formData );
					} }
					label={ `SAVE` }
					className="admin-button px-10 py-2 bg-primary text-white"
				/>
			</div>,
		);

		return form;
	};

	const getForm = () => {
		/*  Process: 
			Receive initialdata.
			Insert initialdata into formdata state.
			dataToModel: Convert formdata into a form model JSON object.
		*/

		if ( debug ) console.log(
			"Form.js :: getForm() :: props = ",
			props,
			" :: initialData = ",
			initialData,
			" :: formData = ",
			formData,
		);

		return (
			<div
				className={ `form-container ${ layout ? `form-container-${ layout }` : ""
					}` }
			>
				{
					!( formData && utils.val.isObject( formData ) )
						? children && children !== false && children
						: //     : constructForm(formData)
						buildFormFields( formData )
					// : <Form.Model model={ model } />
				}
			</div>
		);
	};

	if ( debug ) console.log( "Form.js :: {Props} = ", props );
	return (
		show && formData && (
			<>
				{
					getForm()
				}
			</>
		)
	);
};


// This form will self-build based on the data provided to it.
function Schema ( props ) {
	const {
		// Child components passed inside this component's element.
		children,
		// Render overrides, if ever needed.
		show = true,
		// Form data properties.
		schema,
		initialData = {},
		initialDataAutofillRandom = false,
		model = {},
		// Form functionality properties.
		setData = ( e ) => { },
		onSubmit = ( e ) => { },
		onChange = ( e ) => { },
		// Form rendering properties.
		showViewport = false,
		viewportOverride,
		viewportLayout = `column`,
		layout = "block", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
		// Style settings.
		styles = {},
		classes = "",
		debug = false,
	} = props;

	const [ formData, setFormData ] = React.useState( null );
	const [ formSchema, setFormSchema ] = React.useState( null );
	const [ formModel, setFormModel ] = React.useState( null );
	useEffect( () => {
		// Whenever the input initial data changes, update the loaded form initial data.
		if ( debug ) console.log( "FORM.SCHEMA.JS :: initialData is now = ", initialData, " :: and formData = ", formData );
		// if (!setFormData)
		setFormData( initialData );
	}, [ initialData ] );

	useEffect( () => {
		// Whenever the input schema changes, update the loaded form schema.
		// if (debug)
		if ( debug ) console.log( "FORM.SCHEMA.JS :: input schema is now = ", schema );
		setFormSchema( schema );
	}, [ schema ] );

	// useEffect(() => {
	// 	// Whenever the input schema changes, update the loaded form schema.
	// 	// if (debug)
	// 	let tempFormModel = schemaToFormModel(formSchema, initialDataAutofillRandom);
	// 	if (debug) console.log(
	// 		"FORM.SCHEMA.JS",
	// 		"\n :: initialDataAutofillRandom changed :: formData is now = ",
	// 		formData,
	// 		"\n :: formSchema = ",
	// 		formSchema,
	// 		"\n :: tempFormModel = ",
	// 		tempFormModel,
	// 	);
	// 	setFormModel(tempFormModel);
	// 	setFormData(tempFormModel.model);
	// }, [ initialDataAutofillRandom ] );

	useEffect( () => {
		// Whenever the loaded form data changes, run this.
		// if ( debug )
		let tempFormModel = schemaToFormModel( formSchema, initialDataAutofillRandom, formData );
		if ( debug )
			console.log(
				"FORM.SCHEMA.JS",
				"\n :: formData changed :: formData is now = ",
				formData,
				"\n :: formSchema = ",
				formSchema,
				"\n :: tempFormModel = ",
				tempFormModel,
				"\n :: initialDataAutofillRandom = ",
				initialDataAutofillRandom,
			);
		setFormModel( tempFormModel );
	}, [ formData ] );

	useEffect( () => {
		// Whenever the loaded form schema changes, run this.
		// if (debug)
		if ( debug ) console.log( "FORM.SCHEMA.JS :: formSchema is now = ", formSchema );

		// Generate a form model based on the schema provided.
		let tempFormModel = schemaToFormModel( formSchema, initialDataAutofillRandom, formData );
		if ( debug )
			console.log(
				"FORM.SCHEMA.JS",
				"\n :: formSchema just changed :: formSchema is now = ",
				formSchema,
				"\n :: formData = ",
				formData,
				"\n :: tempFormModel = ",
				tempFormModel,
			);
		setFormModel( tempFormModel );
	}, [ formSchema ] );

	const componentStyles = {
		// Default styles go here.
		// Flex properties
		display: `${ "flex" }`,
		flexDirection: `${ "row" }`,
		justifyContent: `${ "center" }`,
		alignItems: `${ "center" }`,
		alignContent: `${ "center" }`,
		// Size properties
		height: `${ "100%" }`,
		minHeight: `${ "auto" }`,
		width: `${ "100%" }`,
		minWidth: `${ "50%" }`,
		padding: `0.25rem 1.0rem`,
		border: `1px dashed black`,
		// User-set styles override default settings.
		...styles,
		// Responsiveness overrides go here.
	};

	const fieldStyles = {};

	const labelStyles = {
		// Style overrides for individual cards.
		// gap: `${gridGap}`,
		// padding: `${padding ? padding : "0.0rem"}`,
		...{
			...( schema
				? {
					// minWidth: `auto`,
					minWidth: `${ utils.str.getLongest( schema ) / 2 + 2 }rem`,
					maxWidth: `${ 100 }%`,
					paddingInline: `${ 0.5 }rem`,
					// flex: `1 1 ${cardWidth}rem`,
				}
				: {} ),
		},
		// height: `${cardWidth}`,
		// width: `${cardHeight}`,
	};

	const inputStyles = {};
	// Like schemaToModel, except that it produces a JSON model specifically geared towards generating a dynamic form.
	const schemaToFormModel = ( schema, initializeRandom = false, initialValues = {} ) => {
		if ( debug ) console.log( `schemaToFormModel called`, `\n :: schema = `, schema, "\n :: initializeRandom = ", initializeRandom, "\n :: initialValues = ", initialValues );
		// A model will be an object, with each key value pair having a nested object.
		let model = {};
		let form = {
			id: "",
			label: "",
			initialData: "",
			onSubmit: () => {
				onSubmit( formData );
			},
			onChange: () => {
				onChange( formData );
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
					if ( debug )
						console.log(
							`schemaToFormModel :: schema = `,
							schema,
							"\n", " :: ", "key = ",
							key,
							"\n", " :: ", "fieldSchema = ",
							fieldSchema,
							"\n", " :: ", "options = ",
							options,
							"\n", " :: ", "enums = ",
							enums,
							"\n", " :: ", "dataType = ",
							dataType,
							"\n", " :: ", "defaultValue = ",
							defaultValue,
							"\n", " :: ", "initialValue = ",
							initialValue,
						);
					if ( dataType ) {
						field.dataType = dataType;
						field.fieldType = datahelper.dataType2fieldType( dataType );

						// let defaultValue = utils.ao.has(fieldSchema, "defaultValue") ? fieldSchema.defaultValue : undefined;
						// let initialValue;

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
							// optionstemp = optionstemp.map((option, index) => {
							// 	return {
							// 		key: `${index}`,
							// 		value: `${option}`,
							// 		label: `${option}`,
							// 	};
							// });
							field.fieldType = "select";
							field.multiple = [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( dataType );
							field.inputProps.multiple = [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( dataType );
							field.inputProps.options = optionstemp;

							// field.options = enums;

							if ( initializeRandom && utils.val.isValidArray( enums, true ) ) {
								initialValue = enums[ Math.floor( Math.random() * enums.length ) ];
							}
						} else {
							field.fieldType = datahelper.dataType2fieldType( dataType );
						}

						// Figure out which initial value to go with.
						if ( initializeRandom ) {
							if ( utils.val.isValidArray( enums, true ) ) {
								initialValue = enums[ Math.floor( Math.random() * enums.length ) ];
							} else {
								initialValue = datahelper.generateRandom( dataType, 10, 10 );
							}
						} else if ( utils.ao.has( initialValues, key ) ) {
							// We're given an initial value to work with.
							let val = initialValues[ key ];
							if ( val ) initialValue = initialValues[ key ];
							else initialValue = datahelper.typeToInitialDefault( dataType, defaultValue );
						} else {
							// Try to glean an initial value from the dataType itself.
							initialValue = datahelper.typeToInitialDefault( dataType, defaultValue );
						}
						model[ key ] = initialValue;
						field.inputProps.defaultValue = initialValue;

						if ( debug )
							console.log(
								`schemaToFormModel :: schema = `,
								schema,
								"\n :: key = ",
								key,
								"\n :: fieldSchema = ",
								fieldSchema,
								"\n\n :: After if-else chain: ",
								"\n :: options = ",
								options,
								"\n :: enums = ",
								enums,
								"\n :: dataType = ",
								dataType,
								"\n :: defaultValue = ",
								defaultValue,
								"\n :: initialValue = ",
								initialValue,
								"\n\n :: field = ",
								field,
								"\n\n :: form = ",
								form,
							);
					}
					form.fields.push( field );
				}
			} );
		}
		if ( debug )
			console.log(
				`schemaToFormModel :: Post execution`,
				`\n :: schema = `,
				schema,
				"\n :: initializeRandom = ",
				initializeRandom,
				"\n :: initialValues = ",
				initialValues,
				"\n :: Model = ",
				model,
				"\n :: form = ",
				form,
			);
		setFormModel( model );
		return {
			model: model,
			form: form,
		};
	};

	// To make this work, we're going to need a way to update values deep inside the data array stored in state.
	const constructSchemaFormFields = ( input ) => {
		let formFields = [];
		if ( utils.val.isObject( input ) ) {
			// Valid input. Pull out the form data.
			let form = input.form;
			let formModels = form.model;
			let fieldModels = form.fields;
			if ( debug )
				console.log(
					"FORM.SCHEMA.JS :: constructSchemaFormFields(",
					input,
					") :: given a valid object. ",
					"\n :: form = ",
					form,
					"\n :: formModels = ",
					formModels,
					"\n :: fieldModels = ",
					fieldModels,
					"\n :: formData = ",
					formData,
					"\n :: initialData = ",
					initialData,
				);
			if ( utils.val.isValidArray( fieldModels, true ) ) {
				// Valid input. Proceed.
				fieldModels.forEach( ( field, index ) => {
					// let fieldType = datahelper.getFieldType(value);
					// let dataType = datahelper.getType(value);
					let key = field.key;
					let fieldType = field.fieldType;
					let dataType = field.dataType;
					let inputProps = field.inputProps;

					if ( debug )
						console.log(
							"FORM.SCHEMA.JS :: constructSchemaFormFields(",
							input,
							")",
							"\n :: field = ",
							field,
							"\n :: index = ",
							index,
							"\n :: fieldType = ",
							fieldType,
							"\n :: dataType = ",
							dataType,
							"\n :: key = ",
							key,
							"\n :: inputProps = ",
							inputProps,
							"\n :: formData = ",
							formData,
							"\n :: initialData = ",
							initialData,
						);
					// if (fieldType && dataType) {
					// 	formFields.push(SchemaField(field, key, inputProps, dataType, fieldType));
					// }
					formFields.push( buildSchemaField( field ) );
				} );
			}
		}
		return formFields;
	};

	const buildSchemaField = ( fieldData ) => {
		// let options = ["[string]", "[number]", "[boolean]", "[date]", "string", "number", "boolean", "date"];
		// let validTypes = ["string", "number", "boolean", "date"];
		// let validarrayTypes = ["array", "[array]", "[string]", "[number]", "[boolean]", "[date]"];
		// if (debug) console.log( "FORM.JS.js :: Field(", [ fieldData, key, value, dataType, fieldType ].join( '\n :: ' ), ")" );

		let key = fieldData.key;
		let fieldType = fieldData.fieldType;
		let dataType = fieldData.dataType;
		let inputProps = fieldData.inputProps;

		let value = inputProps.hasOwnProperty( "defaultValue" ) ? inputProps.defaultValue : inputProps.hasOwnProperty( "value" ) ? inputProps.value : undefined;
		if ( value === undefined || value === null ) value = datahelper.typeToInitialDefault( dataType );
		if ( debug )
			console.log(
				"FORM.SCHEMA.JS :: buildSchemaField() :: ",
				model,
				")",
				"\n :: fieldData = ",
				fieldData,
				"\n :: key = ",
				key,
				"\n :: value = ",
				"||",
				value,
				"||",
				"\n :: fieldType = ",
				fieldType,
				"\n :: dataType = ",
				dataType,
			);
		// Turns an input into a field. Simple as.
		// if (["array", "object", "symbol", "oa", "data"].includes(dataType) || fieldType === "data") {
		if ( [ "array", "object", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( dataType ) || fieldType === "data" ) {
			// Dealing with a complex, possibly nested data input type.
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

						if ( debug )
							console.log(
								"FORM.SCHEMA.JS :: buildSchemaField :: setData triggered :: ",
								"\n formData = ",
								formData,
								"\n key = ",
								key,
								"\n input = ",
								input,
								"\n temp = ",
								temp,
								"updatedData = ",
								updatedData,
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
				// options = options.map((option, index) => {
				// 	return {
				// 		key: `${index}`,
				// 		value: `${option}`,
				// 		label: `${option}`,
				// 	};
				// });
				// inputProps.options = options;
				// inputProps.multiple = fieldData.multiple;
				if ( debug ) console.log( "FORM.SCHEMA.JS :: buildSchemaField() :: ", "\n :: field is a select field, editing the inputprops :: inputProps = ", inputProps );
			} else if ( [ "date", "datetime", "datetime-local" ].includes( fieldType ) ) {
				// Adjust the formatting of the input value.
				// let date = utils.time.formatDate(inputProps.defaultValue); // new Date( inputProps.defaultValue );

				// 2023-04-17T16:47:12.141Z
				let storeddate = new Date( inputProps.defaultValue );
				let converteddate = storeddate.getFullYear() + "-" + parseInt( storeddate.getMonth() + 1 ) + "-" + storeddate.getDate();
				let reverteddate = new Date( converteddate.split( "-" ) ).getTime();
				if ( debug )
					console.log(
						"\n inputProps = ",
						inputProps.defaultValue,
						"\n storeddate = ",
						storeddate,
						"\n converteddate = ",
						converteddate,
						"\n reverteddate = ",
						reverteddate,
					);

				// inputProps.defaultValue = converteddate;
				inputProps.defaultValue = utils.time.formatTimestampDDMMYYYY( inputProps.defaultValue );
			}

			if ( debug )
				console.log(
					"FORM.SCHEMA.JS :: buildSchemaField() :: ",
					"\n :: fieldData = ",
					fieldData,
					"\n :: key = ",
					key,
					"\n :: value = ",
					value,
					"\n :: fieldType = ",
					fieldType,
					"\n :: dataType = ",
					dataType,
					"\n :: inputProps = ",
					inputProps,
					"\n :: dataType is a scalar, building a normal type of input.",
				);

			return (
				<Input
					fieldType={ fieldType }
					// value={value}
					// defaultValue={value}
					// inputProps={{
					// 	// value: value,
					// 	defaultValue: value,
					// 	// checked: value === true,
					// 	// defaultChecked: value === true,
					// }}
					inputProps={ inputProps }
					label={ key }
					id={ key }
					name={ key }
					onChange={ ( e ) => {
						let temp = { ...formData };

						let updatedData = utils.ao.deepFindSet(
							temp,
							key,
							// e.target.value,
							// fieldType === `checkbox` ? ( e.target.checked ? e.target.checked === true : false ) : e.target.value,
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

	const buildForm = ( input ) => {
		// Build a form based on the inputs.
		let form = [];
		if ( showViewport ) {
			form.push(
				<div className={ `form-viewport-container` }>
					{ viewportOverride ? (
						viewportOverride
					) : (
						<Droplist
							label={ `Form Data` }
							data={ formData }
						/>
					) }
				</div>,
			);
		}
		// form.push(<Input.Group model={model} />);
		form.push( <div className={ `form-inputs-container` }>{ constructSchemaFormFields( formModel ) }</div> );
		form.push(
			<div className="flex justify-end w-full">
				<Button
					type="submit"
					appearance={ `` }
					onClick={ ( e ) => {
						onSubmit( formData );
					} }
					label={ `SAVE` }
					className="admin-button px-10 py-2 bg-primary text-white"
				/>
			</div>,
		);

		return form;
	};

	const getForm = () => {
		/*  Process: 
			Receive initialdata.
			Insert initialdata into formdata state.
			dataToModel: Convert formdata into a form model JSON object.
		*/
		if ( debug )
			console.log(
				"FORM.SCHEMA.JS :: getForm()",
				"\n :: props = ",
				props,
				"\n :: initialData = ",
				initialData,
				"\n :: formModel = ",
				formModel,
				"\n :: formSchema = ",
				formSchema,
				"\n :: formData = ",
				formData,
			);
		return (
			<div className={ `form-container ${ layout ? `form-container-${ layout }` : "" }` }>
				{
					!( formModel && utils.val.isObject( formModel ) ) ? children && children !== false && children : buildForm( formModel ) // : <Form.Model model={ model } />
				}
			</div>
		);
	};

	if ( debug ) console.log( "Form.js :: {Props} = ", props );
	return show && formData && getForm();
};

Form.Schema = Schema;

function Model ( props ) {
	// Replacement for the default form component. Rather than passing through child components and accepting an onsubmit function as a property, this constructs an entire form based on a provided dataset.
	const {
		type = "default",
		initialValues,
		formData,
		setFormData,
		model = {},
		// Style settings.
		styles = {},
		classes = "",
	} = props;

	return <div className={ `form-input-array` } style={ styles }></div>;
};
Form.Model = Model;

function Group ( props ) {
	// A group of form inputs.
	const {
		children,
		initialData,
		formData,
		setFormData,
		layout = "block", // INLINE | INLINE-REVERSE | BLOCK | BLOCK-REVERSE
		formType = "text", // Default to text type.
		inputProps,
	} = props;

	const onSubmit = () => {
		// Handles passing the data changed within this component up to its parent form component.
	};

	// if(debug)console.log("Input.Group :: {Props} = ", props);
	return (
		<div className={ `form-group ${ layout ? `form-group-${ layout }` : "" }` }>
			{ children && children !== false && children }
		</div>
	);
}
Form.Group = Group;

export default Form;

/*	// Example from another library of a good dynamic form structure. 

		const buildModal = () => {
			return (
				<Modal
					open={showAddEditModal}
					footer={null}
					title={selectedItemForEdit ? "Edit Project" : "Add Project"}
					onCancel={() => {
						setShowAddEditModal(false);
						setSelectedItemForEdit(null);
						setType("");
					}}
					onFinish={onFinish}>
					<Form
						layout="vertical"
						onFinish={onFinish}
						initialValues={
							{
								...selectedItemForEdit,
								technologies: selectedItemForEdit?.technologies?.join(" , "),
							} || {}
						}>
						<Form.Item
							name="title"
							label="Title">
							<Input placeholder="Title"></Input>
						</Form.Item>
						<Form.Item
							name="image"
							label="Image URL">
							<Input placeholder="Image URL"></Input>
						</Form.Item>
						<Form.Item
							name="link"
							label="Link URL">
							<Input placeholder="Link URL"></Input>
						</Form.Item>
						<Form.Item
							name="context"
							label="Context">
							<Input placeholder="Context"></Input>
						</Form.Item>
						<Form.Item
							name="description"
							label="Description">
							<textarea placeholder="Description"></textarea>
						</Form.Item>
						<Form.Item
							name="technologies"
							label="Technologies">
							<Input placeholder="Technologies"></Input>
						</Form.Item>
						<div className="flex justify-end w-full">
							<button
								className="admin-button bg-white px-10 py-2 text-primary"
								onClick={() => {
									setType("add");
									setShowAddEditModal(false);
									setSelectedItemForEdit(null);
								}}>
								Cancel
							</button>
							<button className="admin-button px-10 py-2 bg-primary text-white">{selectedItemForEdit ? "Update" : "Add"}</button>
						</div>
					</Form>
				</Modal>
			);
		};

		
				<Form
					onFinish={onFinish}
					layout="vertical"
					initialValues={{
						...portfolioData.about,
						skills: portfolioData.about.skills.join( ", " ),
					}}>
					<Form.Item name="lottieURL" label="Lottie URL">
						<input type="text" placeholder="Lottie URL" />
					</Form.Item>
					<Form.Item name="description1" label="Description 1">
						<textarea type="text" placeholder="Description 1" />
					</Form.Item>
					<Form.Item name="description2" label="Description 2">
						<textarea type="text" placeholder="Description 2" />
					</Form.Item>
					<Form.Item name="skills" label="Skills">
						<textarea type="text" placeholder="Skills" />
					</Form.Item>
					<div className="flex justify-end w-full">
						<button
							className="px-10 py-2 bg-primary text-white"
							type="submit">
							SAVE
						</button>
					</div>
				</Form>
*/

/*  form-container
		form-row
			form-group
			form-input
		form-group
			input-field
			input-field .input-field-label input
			input-field .input-field-label
			input-field .input-field-select
			input-field .input-field-text
			input-field.input-field-inline .input-field-label
			input-field.input-field-inline .input-field-label .input-field-label-text
			input-field.input-field-inline .input-field-label .input-field-checkbox
			button-form-submit
		form-submit-container

	.form-container {
		padding: 4px 0;
		margin: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.form-container * {
		max-width: 100% !important;
		min-width: 0% !important;
	}
	.form-row {
		align-items: center;
		justify-content: center;
		width: 100%;
		display: inline-flex;
		flex-direction: row;
	}
	.form-group {
		width: 100%;
		display: inline-flex;
		flex-direction: column;
		padding: 10px;
	}
	.form-input {
		width: 100%;
		height: 2rem;
	}
	.form-group {
		width: 100%;
		border: none;
		outline: none;
		background: inherit;
		box-shadow: inset 2px 2px 2px #171717, inset -2px -2px 2px rgb(68, 60, 60);
	}
	.input-field {
		margin: 0;
		padding: 2px 4px;
		width: 100%;
		flex-grow: 1;
	}
	.input-field .input-field-label input {
		margin: 0;
		padding: 4px 2px;
		width: 100%;
		outline: none;
	}
	.input-field .input-field-label {
		margin: 0;
		padding: 2px 0;
		width: 100%;
	}
	.input-field .input-field-select {
		margin: 0;
		padding: 4px 2px;
		width: 100%;
	}
	.input-field .input-field-text {
		margin: 0;
		padding: 2px 0;
		width: 100%;
	}
	.input-field.input-field-inline .input-field-label {
		display: inline;
		padding: 4px 4px;
		margin: 0;
		width: 100%;
		width: auto;
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
		justify-content: flex-end;
	}
	.input-field.input-field-inline .input-field-label .input-field-label-text {
		min-width: 1rem !important;
		overflow-wrap: normal!important;
		white-space: nowrap;
		width: auto;
	}
	.input-field.input-field-inline .input-field-label .input-field-checkbox {
		width: auto;
	}
	.button-form-submit {
		width: 100%;
		align-self: center;
		text-align: center;
	}
	.form-submit-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}
*/

/*
	const dataToModel = (input) => {
		// Extract all keys from the input object and build a formModelJSON object.
		let dataModel = [];
		let obj = {
			...input,
			enabled: true,
		};
		if (utils.val.isObject(input)) {
			Object.keys(obj).forEach((key, index) => {
				let value = obj[key];
				if ( debug ) console.log(
					"FORM.JS :: dataToModel(",
					input,
					") :: key = ",
					key,
					" :: value = ",
					value,
				);
				let fieldType = utils.val.isString(value)
					? `text`
					: utils.val.isNumber(value)
					? `number`
					: utils.val.isBool(value)
					? `checkbox`
					: `text`;
				dataModel.push({
					name: key,
					type: `${fieldType}`,
					label: key,
					inputProps: {
						defaultValue: value,
						// placeholder: key.toString().capitalize(),
					},
					onChange: (e) => {
						setFormData(
							utils.ao.findAndSetObject(
								formData,
								key,
								// e.target.value.toString(),
								fieldType === `checkbox`
									? e.target.checked
										? e.target.checked === true
										: false
									: e.target.value,
							),
						);
					},
				});
			});
		}
	    
		return dataModel;
	};
*/
