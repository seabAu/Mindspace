'use client';
import { forwardRef } from 'react';
import {
	StringInput,
	NumberInput,
	BooleanInput,
	DateInput,
	DateTimeInput,
	TimeOnlyInput,
	TimeRangeOnlyInput,
	ObjectIdInput,
} from './DataTypeInputs';
import MixedTypeInput from './MixedTypeInput';
import NestedDataEditor from './NestedDataEditor';

const DataValueInput = forwardRef(
	( { dataType, value, onChange, className, compact = true, onKeyDown }, ref ) => {
		const handleClear = () => {
			switch ( dataType ) {
				case 'String':
					onChange( '' );
					break;
				case 'Number':
				case 'Integer':
				case 'Decimal':
					onChange( 0 );
					break;
				case 'Boolean':
					onChange( false );
					break;
				case 'Date':
					onChange( null );
					break;
				case 'DateTime':
				case 'DateTimeLocal':
					onChange( null );
					break;
				case 'Time':
					onChange( '' );
					break;
				case 'TimeRange':
					onChange( { start: '', end: '' } );
					break;
				case 'Object':
					onChange( {} );
					break;
				case 'Array':
					onChange( [] );
					break;
				case 'ObjectId':
					onChange( '' );
					break;
				case 'Mixed':
				case 'Custom':
					onChange( '' );
					break;
				default:
					onChange( '' );
			}
		};

		const renderInput = () => {
			switch ( dataType ) {
				case 'String':
					return (
						<StringInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Number':
				case 'Integer':
				case 'Decimal':
					return (
						<NumberInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Boolean':
					return (
						<BooleanInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Date':
					return (
						<DateInput
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'DateTime':
				case 'DateTimeLocal':
					return (
						<DateTimeInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Time':
					return (
						<TimeOnlyInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'TimeRange':
					return (
						<TimeRangeOnlyInput
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Object':
					// Use the nested editor for objects
					return (
						<NestedDataEditor
							dataType={ dataType }
							className={ className }
							value={ value || {} }
							onChange={ onChange }
							// dataType='Object'
							compact={ compact }
						/>
					);
				case 'Array':
					// Use the nested editor for arrays
					return (
						<NestedDataEditor
							dataType={ dataType }
							className={ className }
							value={ value || [] }
							onChange={ onChange }
							// dataType='Array'
							compact={ compact }
						/>
					);
				case 'ObjectId':
					return (
						<ObjectIdInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				case 'Mixed':
				case 'Custom':
					return (
						<MixedTypeInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
				default:
					return (
						<StringInput
							dataType={ dataType }
							className={ className }
							value={ value }
							onChange={ onChange }
							onClear={ handleClear }
							compact={ compact }
							ref={ ref }
							onKeyDown={ onKeyDown }
						/>
					);
			}
		};

		return renderInput();
	},
);

DataValueInput.displayName = 'DataValueInput';

export default DataValueInput;
