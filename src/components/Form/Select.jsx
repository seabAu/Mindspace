import React from "react";
import * as utils from 'akashatools';
import Input from "./Input.jsx";

function Select ( props ) {
	const {
		height = 50,
		width = 100,
		label,
		id,
		name,
		value,
		unsetOption,
		options,
		onChange,
		disabled,
		required,
		multiple = false,
		dropdown,
		debug = false,
	} = props;
	// console.log("Select :: props = ", props);

	const isOptionSelected = ( optionValue, selected ) => {
		if ( optionValue && utils.val.isValidArray( selected ) ) {
			if ( selected.includes( optionValue ) ) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
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

	return (
		<Input.Field>
			<Input.Label
				label={ label ?? name }
				name={ name ?? "" }
				id={ id }
			/>
			<select
				className="input-field-control input-field-select"
				height={ height }
				width={ width }
				key={ id }
				id={ id }
				name={ name }
				size={ `1` }
				value={ multiple === true ? value : value } //{value !== null && value !== undefined ? value : ""}
				onChange={ ( event ) => {
					let selected = event.target.value;
					if ( selected === unsetOption ) {
						return;
					}
					if ( multiple === true ) {
						let currValue = value;
						if ( selected !== "" && selected !== undefined && selected !== null ) {
							if ( !Array.isArray( currValue ) ) {
								// console.log( "Value is not an array :: ", currValue );
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
				multiple={ multiple === true && dropdown !== true ? true : false }
				required={ required ?? "" }
				disabled={ disabled ? disabled : false }>
				<option
					value=""
					className="option">
					{ unsetOption }
				</option>
				{ arrayToOptions( options ).map( ( option, index ) => {
					// console.log(option, index);
					return (
						<option
							className={ `option ${ isOptionSelected( option.value, value ) ? "option-selected" : "" }` }
							key={ index }
							value={ option.value }>
							{ option.label }
						</option>
					);
				} ) }
			</select>
		</Input.Field>
	);
}

export default Select;
