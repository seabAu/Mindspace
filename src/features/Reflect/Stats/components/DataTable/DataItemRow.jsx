import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, Trash2, GripVertical, AlertCircle, Calendar, CalendarRange, X, LucideCopyPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DataValueInput from "../DataForm/DataValueInput";
// import DateTimePicker from "../DataForm/DateTimePicker";
import { format } from "date-fns";
import { validateItem } from "@/lib/utilities/validation";
import { twMerge } from "tailwind-merge";
import useReflect from "@/lib/hooks/useReflect";
import * as utils from 'akashatools';
// import useReflectStore from "@/store/reflect.store";
import useStatsStore from "@/store/stats.store";
import { DATA_TYPES } from "@/lib/config/config";
import DataTypeSelect from "../DataForm/DataTypeSelect";
import DropTable from "@/components/Droplist/droptable";
import DateTimeClockPicker from "../DataForm/DateTimeClockPicker";
import DataKeyDropdown from "../DataForm/DataKeyDropdown";
import { Label } from "@/components/ui/label";

const DataItemRow = memo( ( {
    item,
    index,
    onEdit,
    onDelete,
    showRowLabels = false,
    ...props
} ) => {

    const {
        dialogType, setDialogType,
        dialogData, setDialogData,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,

        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
        handleFetchStatsById,
        handleCloneStats,
        handleCreateStats,
        handleUpdateStats,
        handleDeleteStats,
    } = useReflect();

    // Check if the item is new (has default values)
    const isNewItem = () => {
        return item.dataKey && item.dataValue === "" && item._metadata === "";
    };

    const [ isEditing, setIsEditing ] = useState( isNewItem() );
    const [ localItem, setLocalItem ] = useState( {
        ...(
            utils.val.isDefined( item ) && utils.val.isObject( item )
                ? ( item )
                : ( null ) )
    } );
    const [ errors, setErrors ] = useState( {} );
    const [ isDragging, setIsDragging ] = useState( false );
    const [ showTimeRangeInputs, setShowTimeRangeInputs ] = useState( false );
    // const { updateItem, deleteItem } = useData();
    const rowRef = useRef( null );
    const dragHandleRef = useRef( null );

    // console.log( "DataItemRow :: item = ", item, " :: ", "localItem = ", localItem );

    // Parse endTime from metadata if present
    useEffect( () => {
        if ( item._metadata && item._metadata.startsWith( "Range:" ) ) {
            try {
                const dateRange = item._metadata.replace( "Range:", "" ).trim().split( " to " );
                if ( dateRange.length === 2 ) {
                    const endTime = new Date( dateRange[ 1 ] );
                    if ( !isNaN( endTime.getTime() ) ) {
                        setShowTimeRangeInputs( true );
                        setLocalItem( ( prev ) => ( {
                            ...prev,
                            endTime: endTime,
                        } ) );
                    }
                }
            } catch ( error ) {
                console.error( "Error parsing date range:", error );
            }
        }
    }, [ item._metadata ] );

    useEffect( () => {
        setLocalItem( { ...item } );
        // Update editing state if the item changes
        setIsEditing( isNewItem() );
    }, [ item ] );

    const validateAndSetErrors = useCallback( () => {
        const validationErrors = validateItem( localItem );
        setErrors( validationErrors );
        return Object.keys( validationErrors ).length === 0;
    }, [ localItem ] );

    const handleSave = useCallback( async () => {
        if ( validateAndSetErrors() ) {
            // If we have an end date, update the metadata
            if ( showTimeRangeInputs && localItem.endTime ) {
                localItem._metadata = `Range: ${ localItem.timeStamp.toISOString() } to ${ localItem.endTime.toISOString() }`;
            }

            // If isNewItem === true or there is no _id field, assume it's a new item.
            const isNew = isNewItem();
            if ( isNew || !localItem.hasOwnProperty( "_id" ) ) {
                // Creating new
                let res = await handleCreateStats( localItem );
                // console.log( "DataItemRow :: handleChange :: AFTER handleUpdateStats :: localItem = ", localItem, " :: ", "item = ", item, "res = ", res );
                if ( res ) setLocalItem( res );
                setIsEditing( false );
            }
            else {
                // Editing existing
                let res = await handleUpdateStats( item?._id, localItem );
                // console.log( "DataItemRow :: handleChange :: AFTER handleUpdateStats :: localItem = ", localItem, " :: ", "item = ", item, "res = ", res );
                if ( res ) setLocalItem( res );
                setIsEditing( false );
            }

        }
    }, [ validateAndSetErrors, handleUpdateStats, item._id, localItem, showTimeRangeInputs ] );

    const handleKeyDown = useCallback(
        ( e ) => {
            // Shift+Enter to save
            if ( e.key === "Enter" && e.shiftKey ) {
                e.preventDefault();
                handleSave();
            }

            // Escape to cancel
            if ( e.key === "Escape" ) {
                e.preventDefault();
                handleCancel();
            }

            // Tab navigation
            if ( e.key === "Tab" && !e.shiftKey && e.target.getAttribute( "data-last-field" ) === "true" ) {
                e.preventDefault();
                handleSave();
            }
        },
        [ handleSave, item ],
    );

    const handleCancel = useCallback( () => {
        if ( isEditing ) {
            setLocalItem( { ...item } );
            setIsEditing( false );
            setErrors( {} );
        }
    }, [ isEditing ] );

    const handleDoubleClick = useCallback( () => {
        if ( !isEditing ) {
            setIsEditing( true );
        }
    }, [ isEditing ] );

    const handleChange = useCallback(
        ( field, value ) => {
            let updatedData = {};
            let resultData = {};

            setLocalItem( ( prev ) => {
                let updatedFields = { ...prev, [ field ]: value };
                // console.log( "DataItemRow :: handleChange :: field = ", field, " :: ", "value = ", value, " :: ", "updatedFields = ", updatedFields );

                // If changing dataType, reset dataValue to appropriate default
                if ( field === "dataType" ) {
                    switch ( value ) {
                        case "String":
                            updatedFields.dataValue = "";
                            break;
                        case "Number":
                        case "Integer":
                        case "Decimal":
                            updatedFields.dataValue = 0;
                            break;
                        case "Boolean":
                            updatedFields.dataValue = false;
                            break;
                        case "Date":
                        case "DateTime":
                        case "DateTimeLocal":
                            updatedFields.dataValue = new Date();
                            break;
                        case "Array":
                            updatedFields.dataValue = [];
                            break;
                        case "Object":
                        case "Mixed":
                            updatedFields.dataValue = {};
                            break;
                        default:
                            updatedFields.dataValue = "";
                    }
                }
                updatedData = updatedFields;
                // With updatedData calculated, send it to the server.
                // TODO :: Implement a batch updating system here and in the tasks dashboards to prevent lag.
                // console.log( "DataItemRow :: handleChange :: field = ", field, " :: ", "value = ", value, "updatedFields = ", updatedFields );

                return updatedFields;
            } );

            // Clear error for this field when changed
            if ( errors[ field ] ) {
                setErrors( ( prev ) => {
                    const updatedFields = { ...prev };
                    delete updatedFields[ field ];
                    return updatedFields;
                } );
            }
        },
        [ errors ],
    );

    const toggleEndDate = useCallback( () => {
        setShowTimeRangeInputs( ( prev ) => {
            const newState = !prev;
            if ( newState && !localItem.endTime ) {
                // Initialize end date if not present
                setLocalItem( ( prev ) => ( {
                    ...prev,
                    endTime: new Date( prev.timeStamp ),
                } ) );
            }
            return newState;
        } );
    }, [ localItem.endTime ] );

    const editItemClassNames = twMerge(
        `relative h-full transition-all duration-300 ease-in-out hover:bg-washed-blue-900/10 hover:border-primary-300/20 border-transparent border-x-[0.125rem] flex flex-nowrap items-center h-full justify-start items-stretch overflow-ellipsis p-1`,
    );

    const renderErrorTooltip = useCallback(
        ( field ) => {
            if ( !errors[ field ] ) return null;

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-bodyprimary">
                                <AlertCircle className={ `size-4 aspect-square` } />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-900 text-white text-xs">
                            <ul className="list-disc pl-4">
                                { errors[ field ].map( ( error, i ) => (
                                    <li key={ i }>{ error }</li>
                                ) ) }
                            </ul>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        [ errors ],
    );

    return (
        <div
            ref={ rowRef }
            className={ `hover:bg-primary-purple-800/20 border border-sextary-200/60 rounded-lg ${ isDragging ? "opacity-50" : "" }` }
            onDoubleClick={ handleDoubleClick }
            onKeyDown={ ( e ) => handleKeyDown( e ) }
        >
            <div className={ `grid grid-cols-12 items-center justify-center !border-collapse` }>
                {/* Drag handle */ }

                {/* dataKey */ }
                <div className={ twMerge(
                    `col-span-2 h-full flex justify-center items-center`,
                    editItemClassNames,
                ) }>
                    <div
                        ref={ dragHandleRef }
                        className="h-full flex justify-center items-center cursor-move"
                        onMouseDown={ ( e ) => {
                            // Prevent text selection during drag
                            e.preventDefault();
                        } }
                    >
                        <GripVertical className="h-4 w-4 text-neutrals-400" />
                    </div>
                    { showRowLabels === true && ( <Label className={ `text-xs font-medium text-neutrals-400 !m-0` }>Data Key</Label> ) }
                    { isEditing ? (
                        <div className={ `h-full flex justify-center items-center` }>
                            {/* <Input
                                value={ localItem.dataKey }
                                onChange={ ( e ) => handleChange( "dataKey", e.target.value ) }
                                className={ `bg-sextary-700 flex self-center text-white text-sm self-start !p-0 !m-0 !py-2 !px-0 !pr-4 !pl-4 h-8 ${ errors.dataKey ? "border-bodyprimary" : "" }` }
                                autoFocus
                            /> */}
                            <DataKeyDropdown
                                value={ localItem.dataKey }
                                onChange={ ( value ) => handleChange( "dataKey", value ) }
                                onBlur={ () => validateAndSetErrors() }
                                error={ errors.dataKey }
                            />
                            { renderErrorTooltip( "dataKey" ) }
                        </div>
                    ) : (
                        <div className="bg-transparent rounded-md text-white text-sm h-full flex items-center">
                            { localItem.dataKey }
                        </div>
                    ) }
                </div>

                {/* dataType */ }
                <div className={ twMerge(
                    `col-span-1`,
                    editItemClassNames,
                    `flex items-center justify-stretch h-full`,
                ) }>
                    { showRowLabels === true && ( <Label className={ `text-xs font-medium text-neutrals-400 ` }>Data Type</Label> ) }
                    { isEditing ? (
                        <>
                            {/* // <div className={ `flex flex-col w-full h-min h-full flex items-stretch` }> */ }
                            <DataTypeSelect
                                className={ `!py-1 !px-1 h-8` }
                                fieldName={ `dataType` }
                                fieldLabel={ `Type` }
                                value={ localItem.dataType }
                                handleChange={ ( value ) => handleChange( "dataType", value ) }
                            />
                            {/* <Select value={ localItem.dataType } onValueChange={ ( value ) => handleChange( "dataType", value ) }>
                                <SelectTrigger
                                    className={ `bg-sextary-700 text-white flex-row w-full flex self-start items-start text-sm ${ errors.dataType ? "border-bodyprimary" : "" }` }
                                >
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-sextary-700 text-white">
                                    { DATA_TYPES.map( ( type ) => (
                                        <SelectItem key={ type?.value } value={ type?.value }>
                                            { type?.Label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select> */}
                            { renderErrorTooltip( "dataType" ) }
                        </>
                    ) : (
                        <div className="p-1 rounded-md text-white text-sm h-full flex items-center">
                            { localItem.dataType }
                        </div>
                    ) }
                </div>

                {/* timeStamp */ }
                <div className={ twMerge(
                    `col-span-3`,
                    // editItemClassNames,
                    // `flex relative flex-row flex-nowrap justify-stretch items-stretch w-auto h-full`,
                    // `col-span-5`,
                    editItemClassNames,
                    `flex items-center justify-center h-full`,
                ) }>
                    <div className={ `flex flex-col w-full h-min` }>
                        {/* <div className={ `flex flex-row flex-shrink` }>
                            { showRowLabels === true && ( <Label className={ `text-xs font-medium text-neutrals-400 ` }>Timestamp</Label> ) }

                        </div> */}

                        { isEditing ? (
                            <div className={ `rounded-md text-white text-sm h-min flex flex-grow flex-nowrap overflow-hidden text-ellipsis flex-col w-full` }>
                                <div className={ `flex flex-row items-stretch justify-stretch h-full w-full` }>
                                    { isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            className={ `aspect-square max-h-full px-1` }
                                            onClick={ toggleEndDate }
                                            title={ showTimeRangeInputs ? "Remove end date" : "Add end date" }
                                        >
                                            <CalendarRange className={ `size-4 aspect-square inline items-center justify-center self-center ${ showTimeRangeInputs ? "text-blue-500" : "text-neutrals-400" }` } />
                                        </Button>
                                    ) }
                                    <DateTimeClockPicker
                                        className={ `!p-1` }
                                        showOutsideDays={ true }
                                        value={ new Date( localItem?.timeStamp || new Date() ).getTime() }
                                        onChange={ ( date ) => handleChange( "timeStamp", new Date( date ).getTime() ) }
                                        onClear={ () => handleChange( "timeStamp", new Date() ) }
                                    />
                                </div>
                                { showTimeRangeInputs && (
                                    <>
                                        { showRowLabels === true && (
                                            <Label className={ `text-xs font-medium text-neutrals-400 !m-0` }>
                                                Start Date
                                            </Label>
                                        ) }
                                        <DateTimeClockPicker
                                            className={ `w-full` }
                                            showOutsideDays={ true }
                                            value={ localItem?.startTime || new Date() }
                                            onChange={ ( date ) => handleChange( "startTime", date ) }
                                            onClear={ () => handleChange( "startTime", new Date() ) }
                                        />
                                    </>
                                ) }
                                {/* End date picker (if enabled) */ }
                                { isEditing && showTimeRangeInputs && (
                                    <div className="h-full flex flex-col items-center overflow-hidden text-ellipsis">
                                        { showRowLabels === true && ( <Label className={ `text-xs font-medium text-neutrals-400 !m-0` }>End Date</Label> ) }
                                        <DateTimeClockPicker
                                            className={ `` }
                                            showOutsideDays={ true }
                                            value={ localItem?.endTime || new Date() }
                                            onChange={ ( date ) => handleChange( "endTime", date ) }
                                            onClear={ () => handleChange( "endTime", new Date() ) }
                                        />
                                    </div>
                                ) }
                                { renderErrorTooltip( "timeStamp" ) }
                            </div>
                        ) : (
                            <div className={ `p-1 rounded-md text-white text-sm h-full flex items-center overflow-hidden text-ellipsis` }>
                                { localItem.timeStamp ? format( new Date( localItem.timeStamp ), "PPpp" ) : "" }

                                {/* Show end date if present in metadata */ }
                                { localItem._metadata && localItem._metadata.startsWith( "Range:" ) && (
                                    <span className={ `ml-1 text-xs text-neutrals-400` }>
                                        { " → " }
                                        { localItem.endTime ? format( new Date( localItem.endTime ), "PPpp" ) : "" }
                                    </span>
                                ) }
                            </div>
                        ) }

                    </div>
                </div>

                {/* dataValue */ }
                <div className={ twMerge(
                    `col-span-5`,
                    editItemClassNames,
                    `flex items-center justify-start h-full`,
                ) }>
                    { showRowLabels === true && (
                        <Label className={ `text-xs font-medium text-neutrals-400 p-0 !m-0` }>Data Value</Label>
                    ) }
                    { isEditing ? (
                        <>
                            <div className={ twMerge(
                                `w-full justify-center items-center h-min`,
                                errors.dataValue ? "border border-bodyprimary rounded-md" : ""
                            ) }>
                                <DataValueInput
                                    className={ `` }
                                    dataType={ localItem.dataType }
                                    value={ localItem.dataValue }
                                    onChange={ ( value ) => {
                                        console.log( "DataItemRow :: DataValueInput[dataValue] :: new dataValue = ", value, " :: ", "dataKey = ", localItem.dataKey, " :: ", "localItem = ", localItem );
                                        handleChange( "dataValue", value );
                                    } }
                                    compact={ false }
                                />
                            </div>
                            { renderErrorTooltip( "dataValue" ) }
                        </>
                    ) : (
                        <div className={ `p-1 rounded-md text-white text-sm h-full flex items-center text-wrap whitespace-pre-wrap w-full max-w-full break-before-all break-all` }>
                            {/* { typeof localItem.dataValue === "object"
                            ? JSON.stringify( localItem.dataValue )
                            : String( localItem.dataValue ) } */}
                            { typeof localItem.dataValue === "object"
                                ? ( <DropTable
                                    data={ localItem.dataValue }
                                    compact={ true }
                                    collapse={ false }
                                    expandable={ false }
                                    showControls={ false }
                                />
                                )
                                : String( localItem.dataValue ) }
                        </div>
                    ) }
                </div>

                {/* Actions */ }
                <div className={ twMerge(
                    `col-span-1`,
                    editItemClassNames,
                    `w-full h-full items-start justify-end flex-row`,
                ) }>
                    <div className={ `flex flex-row w-min h-min justify-center items-center` }>
                        { isEditing ? (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={ () => handleCancel() }
                                className={ `self-start text-white hover:bg-washed-blue-600 p-1 text-xs` }
                            >
                                <X className={ `size-4 aspect-square` } />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={ () => handleCloneStats( localItem ) }
                                className={ `self-start text-white hover:bg-washed-blue-600 p-1 text-xs` }
                            >
                                <LucideCopyPlus className={ `size-4 aspect-square` } />
                            </Button>
                        ) }
                        <Button
                            variant="ghost"
                            size="xs"
                            onClick={ () => ( isEditing ? handleSave() : setIsEditing( true ) ) }
                            className="self-start text-white hover:bg-washed-blue-600 p-1 text-xs"
                            data-last-field={ isEditing ? "true" : "false" }
                        >
                            { isEditing
                                ? <Save className={ `size-4 aspect-square` } />
                                : <Edit className={ `size-4 aspect-square` } /> }
                        </Button>
                        <Button
                            variant="destructive"
                            size="xs"
                            onClick={ () => onDelete( item._id ) }
                            className="bg-transparent self-starthover:bg-bodyprimary/30 self-start text-white p-1 text-xs"
                        >
                            <Trash2 className={ `size-4 aspect-square inline` } />
                        </Button>
                    </div>
                </div>

                {/* _metadata (collapsed by default) */ }
                { isEditing && (
                    <div className={ twMerge(
                        `col-span-full px-2`,
                        editItemClassNames,
                    ) }>
                        { showRowLabels === true && ( <Label className={ `text-xs self-start font-medium text-sextary-400 !m-0` }>Metadata</Label> ) }
                        <Textarea
                            value={ localItem._metadata }
                            onChange={ ( e ) => handleChange( "_metadata", e.target.value ) }
                            className={ `text-white bg-transparent px-2 text-sm ${ errors._metadata ? "border-bodyprimary" : "" }` }
                            rows={ 2 }
                        />
                        { renderErrorTooltip( "_metadata" ) }
                    </div>
                ) }
            </div>
        </div>
    );
} );

DataItemRow.displayName = "DataItemRow";

export default DataItemRow

