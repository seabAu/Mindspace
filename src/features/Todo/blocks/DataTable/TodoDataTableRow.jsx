import React, { useState, useRef, useCallback, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ChevronRight, ChevronDown, PenIcon, ArrowBigUpDash, ArrowBigDownDash, ArrowBigLeftDash, ArrowLeftCircleIcon, ListCollapse, Grid2X2, Grid3X3, GridIcon, LayoutGridIcon, Menu, Pen, Triangle, X, Check, Edit, Trash, PinIcon, PinOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import TodoDataTableRowSubtasks from "./TodoDataTableRowSubtasks";
import * as utils from 'akashatools';
import { Textarea } from "@/components/ui/textarea";
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from "@/lib/config/config";
import { caseCamelToSentence, convertCamelCaseToSentenceCase } from "@/lib/utilities/string";
import { Slider } from "@/components/ui/slider";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDateTime } from "@/lib/utilities/time";
import { buildIdSelectInput } from "@/lib/utilities/input";
import useGlobalStore from "@/store/global.store";
import { SelectItemText } from "@radix-ui/react-select";
import InputField from "@/components/Input/Input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import DatePicker from "@/components/Calendar/DatePicker";
import { DATE_PICKER_OPTIONS } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import useTask from "@/lib/hooks/useTask";

const TodoDataTableRow = ( props ) => {
    const {
        outerRef,
        provided,
        snapshot,
        isDragging,
        className,
        styles,
        index,
        id,
        task,
        tasks,
        onUpdateTask,
        deleteTask,
        onClickTask,
        onChangeTask,
        onDeleteTask,
        onCompleteTask,
        onMoveTask,
        groupId, // Grouped by status.
        visibleColumns,
        allColumns,
        columnConfig = [],
        subListReorderingEnabled = true,
    } = props;

    const { getColumnWidth } = useTask();

    const [ isExpanded, setIsExpanded ] = useState( false );
    // const [ notesOpen, setNotesOpen ] = useState( false );
    const [ viewMode, setViewMode ] = useState( 'grid2' ); // LIST | GRID-2 | GRID-3 | GRID-N
    const viewModeStyles = [ 'col-span-full', 'col-span-1', 'col-span-2', 'col-span-12' ];
    const viewModes = [ 'list', 'grid2', 'grid3', 'gridn' ];
    const viewModeIcons = [
        <ListCollapse className="!h-6 !w-6 stroke-primary-100" />,
        <Grid2X2 className="!h-6 !w-6 stroke-primary-100" />,
        <Grid3X3 className="!h-6 !w-6 stroke-primary-100" />,
        <LayoutGridIcon className="!h-6 !w-6 stroke-primary-100" />
    ];
    const ref = useRef( null );

    const {
        data, setData, getData,
        schemas,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    // let refData = getData();

    const handleFieldChange =
        // useCallback(
        ( field, value ) => {
            // onUpdateTask( task._id, { [ field ]: value } );
            // onUpdateTask( { ...task, [ field ]: value } );
            let updatedTask = { ...task, [ field ]: value };
            console.log( "TodoDataTableRow :: handleFieldChange :: field, value, updatedTask = ", field, value, updatedTask );
            onUpdateTask( updatedTask );
        };
    // , [ task, onUpdateTask ] );

    const renderCell = useCallback(
        ( column ) => {
            // const config = columnConfig?.[ column ];
            // const columnFieldName = columnConfig?.[ column ]?.field ?? true;
            // const columnInputType = columnConfig?.[ column ]?.inputType ?? true;
            // const columnShowTitle = columnConfig?.[ column ]?.showTitle ?? true;
            // const columnWidth = columnConfig?.[ column ]?.width ?? true;
            // const columnHidden = columnConfig?.[ column ]?.hidden ?? true;
            // const config = column;
            const columnFieldName = column?.field ?? '';
            const columnInputType = column?.inputType ?? 'text';
            const columnShowTitle = column?.showTitle ?? true;
            const columnWidth = Number( column?.width ?? 80 );
            const columnHidden = column?.hidden ?? true;
            const columnClassNames = `${ column?.classNames ?? '' } transition-all duration-200 ease-in-out !bg-transparent`;
            const value = task?.[ columnFieldName ];
            /* const {
                field,
                inputType,
                showTitle,
                width,
                hidden,
                data,
                classNames,
            } = config; */

            // console.log( "TodoDataTableRow :: renderCell :: column data = ", column, " :: ", "value = ", value );

            switch ( columnInputType ) {
                case "actions":
                    return (
                        <div className={ `w-full h-full flex justify-center items-center !p-0 !m-0` } >
                            <Checkbox
                                name={ columnFieldName ?? '' }
                                defaultChecked={ !!value }
                                onCheckedChange={ ( checked ) => handleFieldChange( columnFieldName, checked ) }
                                // className={ `w-4 h-full !p-0 !m-0 items-center justify-center ${ columnClassNames }` }
                                className={ `!size-6 aspect-square ${ columnClassNames } !rounded-none` }
                            />
                        </div>
                    );

                case "checkbox":
                    return (
                        <div className={ `w-full h-full flex justify-center items-center !p-0 !m-0` } >
                            <Checkbox
                                name={ columnFieldName ?? '' }
                                defaultChecked={ !!value }
                                onCheckedChange={ ( checked ) => handleFieldChange( columnFieldName, checked ) }
                                // className={ `w-4 h-full !p-0 !m-0 items-center justify-center ${ columnClassNames }` }
                                className={ `!size-5 aspect-square ${ columnClassNames } !rounded-none border-primary-300/20` }
                            />
                        </div>
                    );

                case "switch":
                    return (
                        <div className={ `w-full h-full justify-center items-center !flex !p-0 !m-0` } >
                            <Switch
                                name={ columnFieldName ?? '' }
                                defaultChecked={ !!value }
                                size={ 6 }
                                className={ `w-[2.75rem] h-full ${ column?.classNames ?? '' } transition-all duration-200 ease-in-out !rounded-none` }
                                thumbClassNames={ `h-4 ${ columnClassNames } !rounded-none` }
                                onCheckedChange={ ( checked ) => handleFieldChange( columnFieldName, checked ) }
                                icon={ !!value === true ? <X /> : <Check /> }
                            />
                        </div>
                    );

                case "index":
                    return (
                        <div className={ `!p-0 m-0 cursor-move` }>
                            <Menu className='text-gray-400 h-full ' />
                            <Input
                                name={ columnFieldName ?? '' }
                                type="number"
                                defaultValue={ value }
                                className={ `w-16 h-full ${ columnClassNames }` }
                                onChange={ ( e ) => handleFieldChange( columnFieldName, Math.floor( e.target.value ) ) }
                                step={ 1.0 }
                                { ...{
                                    ...( utils.val.isValidArray( tasks, true ) ? { max: tasks?.length } : {} ),
                                    ...( step ? { step: step } : {} ),
                                } }
                            />
                            <div className={ `p-0 m-0 h-full cursor-move` }>
                                <div className="button-group task-actions h-full ">
                                    <div className="button-group button-column">
                                        <Button className={ `button up-button h-[1rem] !m-0 !p-0 leading-3 ` }>▲</Button>
                                        <Button className={ `button down-button h-[1rem] !m-0 !p-0 leading-3 ` }>▼</Button>
                                    </div>
                                    {/* <button className="button edit-button">Edit</button> */ }
                                    {/* <button className="button delete-button">Del</button> */ }
                                </div>
                            </div>
                        </div>
                    );

                case "number":
                    return (
                        <Input
                            name={ columnFieldName ?? '' }
                            type="number"
                            className={ `w-16 h-full min-h-full ${ columnClassNames }` }
                            defaultValue={ value }
                            onChange={ ( e ) => handleFieldChange( columnFieldName, e.target.value ) }
                        />
                    );

                case "text":
                    return (
                        <Input
                            name={ columnFieldName ?? '' }
                            type="text"
                            className={ `!p-2 w-full h-6 min-h-full text-xs focus-visible:outline-none focus-visible:ring-0 focus-visible:outline-transparent focus-visible:ring-offset-0 focus:outline-transparent border-[1px] border-transparent focus-visible:border-[0px] !focus-within:border-x-sextary-500 ${ columnClassNames }` }
                            defaultValue={ value }
                            onChange={ ( e ) => handleFieldChange( columnFieldName, e.target.value ) }
                        />
                    );

                case "textarea":
                    return (
                        <Textarea
                            name={ columnFieldName ?? '' }
                            className={ `!p-2 w-full h-full min-h-full text-xs overflow-auto ${ columnClassNames }` }
                            defaultValue={ value }
                            onChange={ ( e ) => handleFieldChange( columnFieldName, e.target.value ) }
                        />
                    );

                case "badgearray":
                // return (
                //     <div className={ `` }>
                //         <InputField.BadgeArrayField
                //             label={ columnFieldName ?? '' }
                //             placeholder={ convertCamelCaseToSentenceCase( columnFieldName ) }
                //             fieldKey={ columnFieldName }
                //             items={ utils.val.isValidArray( value, true ) ? [ ...value ] : [ value ] }
                //             // refData={ refData ?? [] }
                //             refName={ column?.data ?? columnFieldName }
                //             handleChange={ ( key, value ) => { handleFieldChange( columnFieldName, value ); } }
                //             className={ `border-[0px] border-transparent ${ columnClassNames }` }
                //         />
                //     </div>
                // );
                case "select":
                    return (
                        <Select
                            // defaultValue={ value }
                            defaultValue={ utils.val.isDefined( value ) ? value : 'None Selected' }
                            key={ columnFieldName }
                            // name={ columnFieldName ?? '' }
                            className={ `relative z-[1001] !m-0 !p-0 w-full ${ columnClassNames } !bg-transparent` }
                            onValueChange={ ( newValue ) => handleFieldChange( columnFieldName, newValue ) }
                        >
                            <SelectTrigger className={ `border-[0px] border-transparent hover:shadow-inner hover:shadow-brown-50 !bg-transparent` }>
                                { `${ utils.val.isDefined( value ) ? String( value )?.toUpperCase() : [ 'Select', utils.val.isDefined( columnFieldName ) ? String( columnFieldName ).toUpperCase() : '' ].join( ' ' ) }` }
                                {/* <SelectValue  placeholder={ `${ utils.val.isDefined( value ) ? caseCamelToSentence( value ) : [ 'Select', utils.val.isDefined( value ) ? caseCamelToSentence( columnFieldName ) : '' ].join( ' ' ) }` }/> */ }
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup className={ `relative z-[1001] !m-0 !p-0 w-full ` }>
                                    { getOptionsForField( columnFieldName )?.map( ( option ) => (
                                        <SelectItem key={ option } value={ option } className={ `px-2` }>
                                            <SelectItemText>
                                                { caseCamelToSentence( option ) }
                                            </SelectItemText>
                                        </SelectItem>
                                    ) ) }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    );

                case "slider":
                    return (
                        <>
                            <Slider
                                name={ columnFieldName ?? '' }
                                className={ `w-full justify-center items-center !p-0 !px-2 h-6 text-xs ${ columnClassNames }` }
                                min="0.0"
                                max="100.0"
                                // step={ 1 }
                                defaultValue={ [ value ?? 0 ] }
                                onValueChange={ ( values ) => {
                                    // if ( debug === true ) 
                                    // console.log( "FORM GENERATOR :: NUMBER :: values[0] = ", values[ 0 ] );
                                    handleFieldChange( columnFieldName, Number.parseInt( values[ 0 ], 10 ) );
                                } }
                            />
                        </>
                    );

                case "selectId":
                    return (
                        <InputField.SelectId
                            name={ columnFieldName ?? '' }
                            plaseholder={ convertCamelCaseToSentenceCase( columnFieldName ) }
                            fieldKey={ columnFieldName }
                            initialValue={ value }
                            // refData={ refData ?? [] }
                            refName={ column?.data ?? columnFieldName }
                            handleChange={ ( key, value ) => { handleFieldChange( columnFieldName, value ); } }
                            multiple={ false }
                            className={ `border-[0px] border-transparent ${ columnClassNames }` }
                        />
                        /* buildIdSelectInput( {
                            placeholder: convertCamelCaseToSentenceCase( columnFieldName ),
                            key: columnFieldName,
                            // value: value,
                            initialValue: value,
                            refData: refData ?? [],
                            refName: column?.data ?? columnFieldName,
                            handleChange: ( key, value ) => { handleFieldChange( columnFieldName, value ); },
                            multiple: false,
                            className: '',
                        } ) */
                    );

                case "sheet":
                    // Find a way to make this work sometime. 
                    return (
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={ () => { onClickTask( task ); } }>
                            <Pen />
                            { caseCamelToSentence( columnFieldName ) }
                        </Button>
                    );
                case "date":
                case "datetime":
                case "datetimelocal":
                    return (
                        <div className={ `!p-0 m-0 w-full min-w-full h-full min-h-full cursor-pointer ` }>
                            <Input
                                type="date"
                                className={ cn(
                                    `!m-0 !p-0 !px-4 !py-0 flex flex-row justify-around`,
                                    `h-full w-full`,
                                    className,
                                    !value && "text-muted-foreground",
                                    `!hover:transform-none`,
                                    `text-xs text-left font-normal`,
                                    columnClassNames
                                ) }
                                name={ columnFieldName ?? '' }
                                defaultValue={ value ? new Date( value )?.toISOString()?.split( "T" )[ 0 ] : "" }
                                // defaultValue={ formatDate( value ? new Date( value ) : new Date( Date.now() ) ).yyyymmdd }
                                onChange={ ( e ) => handleFieldChange( columnFieldName, e.target.value ) }
                                width={ 8 }
                            />
                            {/* <DatePicker
                                name={ columnFieldName ?? '' }
                                placeholder={ columnFieldName ?? '' }
                                mode={ `single` }
                                className={ `!p-0 !m-0 w-full min-w-full ` }
                                usePopover={ true }
                                useSelect={ true }
                                // defaultValue={ formatDate( value ? new Date( value ) : new Date( Date.now() ) ).yyyymmdd }
                                // selectedDate={ value ? new Date( value ).yyyymmdd : new Date( Date.now() ) }
                                selectedDate={ value ? new Date( value )?.toISOString()?.split( "T" )[ 0 ] : "" }
                                setSelectedDate={ ( value ) => handleFieldChange( columnFieldName, value ) }
                                selectValue={ columnFieldName }
                                selectOnChange={ ( k, v ) => { } }
                                options={ DATE_PICKER_OPTIONS }
                                events={ [] } // Array of existing events to show highlighted on the calendar. 
                                showOutsideDays={ true }
                                footer={ <></> }
                            /> */}
                        </div>

                    );

                default:
                    return (
                        <Input
                            name={ columnFieldName ?? '' }
                            type={ columnInputType ?? 'text' }
                            defaultValue={ value }
                            onChange={ ( e ) => handleFieldChange( columnFieldName, e.target.value ) }
                            className={ `w-full h-6 text-xs !m-0 !p-0 ${ columnClassNames }` }
                        />
                    );
            }
        },
        [ task, handleFieldChange ],
    );

    const subTasks = useMemo( () => {
        return tasks?.filter( ( t ) => t?.parentTaskId === task?._id );
    }, [ tasks, task?._id ] );

    const hiddenColumns = columnConfig?.filter( ( column ) => !visibleColumns?.includes( column ) || column?.hidden === true );

    const gridStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridAutoRows: `2rem`,
        gridAuto: `2rem`,
        gridTemplateColumns: `span 1 / span 1`,
        gridTemplateColumns: `repeat(12, minmax(auto, 1fr))`,
    };

    const gridItemRowStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridTemplateColumns: `span 1 / span 1`,
    };

    const arrowButtonStyles = {
        fontWeight: `bold`,
        alignSelf: `center`,
        display: `inline-flex`,
        alignItems: `center`,
        justifyContent: `space-around`,
        color: `rgb(221, 221, 221)`,
        textShadow: `rgba(0, 0, 0, 0.8) 0px 1px`,
        borderColor: `rgb(17, 17, 17) rgb(17, 17, 17) black`,
        borderRadius: `3px`,
        cursor: `pointer`,
        boxShadow: `rgba(255, 255, 255, 0.0980392) 0px 1px inset, rgba(0, 0, 0, 0.298039) 0px -1px 3px inset, rgba(255, 255, 255, 0.0784314) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.14902) 0px 1px 2px`,
        background: `linear-gradient(rgba(255, 255, 255, 0.0784314), rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0) 51%, rgba(0, 0, 0, 0.247059)) padding-box rgb(70, 74, 79)`,
    };

    const buildRowActionsCell = ( t ) => {
        return (
            <TableCell
                className={ twMerge(
                    // `!h-full !min-h-full !max-h-full !px-0 !py-0 !m-0`,
                    // `border-[1px] border-primary-900 dark:border-gray-700 border-x-[1px] border-x-primary-700 hover:bg-primary-300 dark:hover:bg-sextary-400/60 transition-all duration-200 ease-in-out `,
                    `!h-full !max-h-full !min-h-full items-stretch justify-stretch !px-0 !py-0 !p-0 !m-0`,
                    // `flex-row !border-collapse justify-start items-center !w-full`,
                    `border-[1px] border-primary-900 dark:border-gray-700 border-x-[1px] border-x-primary-700`,
                ) }
                width={ `${ 200 }px` }
                key={ `task-table-view-cell-actions` }
            >
                <div className={ `!h-full flex flex-row flex-grow max-w-min justify-start items-center !min-h-full !p-0 !m-0` }>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={ `!h-full !min-h-full aspect-square self-center` }
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            setIsExpanded( !isExpanded );
                        } }
                    >
                        <ChevronRight className={ `text-white/40 transition-all duration-300 ease-in-out ${ isExpanded ? 'rotate-90' : '' }` } />
                    </Button>

                    <Menu className={ `text-gray-400 !aspect-square !w-8 !h-8 lg:block md:hidden` } />

                    <div className={ `w-min h-full flex justify-center items-center !p-0 !m-0` } >
                        <Checkbox
                            name={ 'completed' }
                            defaultChecked={ !!task?.completed }
                            onCheckedChange={ ( checked ) => handleFieldChange( 'completed', checked ) }
                            // className={ `w-4 h-full !p-0 !m-0 items-center justify-center ${ columnClassNames }` }
                            className={ `!size-5 aspect-square !rounded-none border-primary-300/20` }
                        />
                    </div>

                    <div className={ `!h-full !w-auto px-1 py-0 m-0 gap-1 cursor-move flex flex-row flex-nowrap justify-between items-center` }>

                        <div class="relative flex flex-col items-center justify-center self-center py-1 rounded-lg">

                            {/* <Button
                            // INCREMENT BUTTON // 
                            variant="ghost"
                            size="xs"
                            style={ arrowButtonStyles }
                            onClick={ () => { handleFieldChange( 'index', ( ( task?.index ?? -1 ) + 1 ) % tasks?.length ); } }
                            type="button"
                            id="increment-button"
                            data-input-counter-increment="quantity-input"
                            className={ `dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg px-2 !py-0 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none !bg-transparent` }
                        >
                            <svg class="text-gray-900 dark:text-white !size-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                            </svg>
                        </Button> 
                        */}

                            <input
                                type="text"
                                defaultValue={ task?.[ 'index' ] ?? -1 }
                                id={ `task-index-${ index }` }
                                onChange={ ( e ) => handleFieldChange( "index", Math.floor( e.target.value ) ) }
                                step={ 1.0 }
                                { ...{
                                    ...( utils.val.isValidArray( tasks, true ) ? { max: tasks?.length } : {} ),
                                } }
                                data-input-counter
                                aria-describedby={ `helper-text-explanation` }
                                className={ twMerge(
                                    `w-8 !h-full p-0 m-0 text-center border-x-0 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block bg-sextary-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`,
                                    `dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 p-1 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none !bg-transparent justify-center items-center self-center `
                                ) }
                                placeholder={ task?.[ 'index' ] ?? -1 }
                            />
                            {/* 
                        <Button
                            // DECREMENT BUTTON // 
                            variant="ghost"
                            size="xs"
                            style={ arrowButtonStyles }
                            onClick={ () => { handleFieldChange( 'index', ( ( task?.index ?? -1 ) + 1 ) % tasks?.length ); } }
                            type="button"
                            id="decrement-button"
                            data-input-counter-decrement="quantity-input"
                            className={ `h-full dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg px-2 !py-0 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none !bg-transparent` }
                        >
                            <svg class="text-gray-900 dark:text-white !size-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16" />
                            </svg>
                        </Button>
                        */}
                        </div>

                        <div className={ `button-group-col button-column p-0 m-0 cursor-move flex flex-col h-full min-h-full flex-grow justify-center items-center` }>

                            <Button
                                className={ `button up-button h-[1rem] !m-0 !p-0 leading-3 !bg-transparent ` }
                                variant="ghost"
                                size="sm"
                                style={ arrowButtonStyles }
                                onClick={ () => { handleFieldChange( 'index', ( ( task?.index ?? -1 ) + 1 ) % tasks?.length ); } }
                            >
                                <div className={ `text-white/40 bg-transparent flex w-4 justify-center items-center self-center p-0` }>
                                    <Triangle className={ `rotate-0` } />
                                </div>
                            </Button>

                            <Button
                                className={ `button down-button h-[1rem] !m-0 !p-0 leading-3 !bg-transparent ` }
                                variant="ghost"
                                size="sm"
                                style={ arrowButtonStyles }
                                onClick={ () => { handleFieldChange( 'index', ( ( task?.index ?? -1 ) + 1 ) % tasks?.length ); } }
                            >
                                <div className={ `text-white/40 bg-transparent flex w-4 justify-center items-center self-center !p-0 !m-0` }>
                                    <Triangle className={ `rotate-180` } />
                                </div>
                            </Button>

                        </div>
                        <div className={ `button-group-col button-column p-0 m-0 cursor-move flex flex-col h-full min-h-full flex-grow justify-center items-center` }>
                        </div>
                    </div>

                    <Button
                        variant={ `ghost` }
                        size={ `sm` }
                        style={ arrowButtonStyles }
                        className={ `button pin-button !bg-transparent w-auto aspect-square self-center` }
                        onClick={ () => handleFieldChange( "isPinned", !task?.isPinned ) }>
                        { task?.isPinned ? <PinIcon /> : <PinOffIcon /> }
                    </Button>

                    <Button
                        variant={ `ghost` }
                        size={ `sm` }
                        style={ arrowButtonStyles }
                        className={ `button delete-button !bg-transparent w-auto aspect-square self-center` }
                        onClick={ () => { if ( onClickTask ) onClickTask( task ); } }>
                        <PenIcon />
                    </Button>

                    <Button
                        variant={ `ghost` }
                        size={ `sm` }
                        style={ arrowButtonStyles }
                        className={ `button edit-button !bg-transparent w-auto aspect-square self-center` }
                        onClick={ () => { if ( onUpdateTask ) onUpdateTask( task ); } }>
                        <Edit />
                    </Button>

                    <Button
                        variant={ `ghost` }
                        size={ `sm` }
                        style={ arrowButtonStyles }
                        className={ `button delete-button !bg-transparent w-auto aspect-square self-center` }
                        onClick={ () => { if ( deleteTask ) deleteTask( task ); } }>
                        <Trash />
                    </Button>

                </div>
            </TableCell>
        );
    };

    return (
        <>
            <TableRow
                data-testid="todo-list-item"
                ref={ provided?.innerRef }
                { ...provided?.draggableProps }
                { ...provided?.dragHandleProps }
                className={ twMerge(
                    `task-row !table-row`,
                    `!m-0 !p-0 flex justify-center items-center`,
                    // `h-full max-h-screen min-h-full w-full min-w-full`,
                    `border-[1px] border-primary-900 dark:border-gray-700 transition-all duration-200 ease-in-out`,
                    // ` bg-gray-900 hover:bg-primary-300 dark:hover:bg-sextary-400/60`,
                    `bg-transparent`,
                    // isDragging ? "opacity-50" : "",
                    className,
                    // `todo_list__todos__li`,
                ) }
                // style={ { opacity: isDragging ? 0.5 : 1, ...gridStyles } }
                // style={ { opacity: isDragging ? 0.5 : 1 } }
                style={ styles }
            >

                { buildRowActionsCell( task ) }

                { visibleColumns?.map( ( column ) => {
                    let width = getColumnWidth( column );
                    return (
                        <TableCell
                            className={ twMerge(
                                `!h-full !max-h-full !min-h-full items-stretch justify-stretch !px-0 !py-0 !p-0 !m-0`,
                                `border-[1px] border-primary-900 dark:border-gray-700 border-x-[1px] border-x-primary-700`,
                            ) }
                            width={ `${ String( width ) }px` }
                            key={ `task-table-view-cell-${ groupId }-${ column?.field ?? index }` }

                        >
                                { renderCell( column ) }
                        </TableCell>
                    );
                } ) }

            </TableRow>

            { isExpanded === true && (
                <TableRow
                    className={ twMerge(
                        `w-full !flex !flex-col`,
                        `!col-span-full`,
                        `!p-0 `,
                    ) }>
                    {/* <TableCell className={ twMerge( `!p-0 ` ) }>  */ }
                    {/* `grid col-span-1 !w-full h-full` */ }
                    <div>
                        <Button
                            onClick={ () => setViewMode( viewModes[ ( viewModes?.indexOf( viewMode ) + 1 ) % viewModes?.length ] ) }
                            className="p-1 text-xs bg-transparent !w-8 !h-8 float-end"
                            variant={ 'ghost' }
                        >
                            { viewModeIcons?.[ viewModes?.indexOf( viewMode ) ] }
                        </Button>
                    </div>
                    {/* <TableRow>
                        <TableCell colSpan={ visibleColumns.length } className="p-0.5">
                            <div className="pl-4">
                                <div className="grid grid-cols-2 gap-1 mb-1">
                                    { hiddenColumns.map( ( column ) => (
                                        <div key={ column?.field } className="flex items-center">
                                            <span className="text-xs font-medium mr-1">{ column?.field }:</span>
                                            { renderCell( column?.field ) }
                                        </div>
                                    ) ) }
                                </div>
                                <TodoDataTableRowSubtasks
                                    parentTask={ task }
                                    subTasks={ subTasks }
                                    tasks={ tasks }
                                    onUpdateTask={ onUpdateTask }
                                    onMoveTask={ onMoveTask }
                                    visibleColumns={ visibleColumns }
                                    allColumns={ allColumns }
                                />
                            </div>
                        </TableCell>
                    </TableRow> */}
                    <div
                        className="col-span-full gap-1 !flex !flex-col"
                        style={ {
                            // gridAutoRows: `minmax(auto, auto)`,
                        } }
                    >
                        { hiddenColumns?.map( ( column ) => (
                            <TableRow
                                key={ column?.field }
                                // colSpan={ 1 }
                                // width={ "100%" }
                                // columnWidth={ `100%` }
                                className={ twMerge(
                                    `w-full !flex !flex-col`,
                                    `!col-span-full`,
                                    `!p-0 `,
                                ) }
                            >

                                <span
                                    className={ twMerge(
                                        // `flex-row w-2/6 justify-start`,
                                        // `grid col-span-1 row-span-1 h-12`,
                                    ) }
                                >
                                    { column?.showtitle && (
                                        convertCamelCaseToSentenceCase( column?.field ?? 'noNameGiven' )
                                    ) }
                                </span>

                                <div className={ `items-center !p-0` }>
                                    { renderCell( column ) }
                                </div>
                            </TableRow>
                        ) ) }
                    </div>
                    <TodoDataTableRowSubtasks
                        parentTask={ task }
                        subTasks={ subTasks }
                        tasks={ tasks }
                        onUpdateTask={ onUpdateTask }
                        onMoveTask={ onMoveTask }
                        visibleColumns={ visibleColumns }
                        allColumns={ allColumns }
                    />
                    {/* </div> */ }
                    {/* </TableCell> */ }
                </TableRow>
            )
            }
        </>
    );
};

/* <TableRow>
                <TableCell colSpan={ visibleColumns.length } className="p-0.5">
                    <div className="pl-4">
                        <div className="grid grid-cols-2 gap-1 mb-1">
                            { hiddenColumns.map( ( column ) => (
                                <div key={ column?.field } className="flex items-center">
                                    <span className="text-xs font-medium mr-1">{ column?.field }:</span>
                                    { renderCell( column?.field ) }
                                </div>
                            ) ) }
                        </div>
                        <TodoDataTableRowSubtasks
                            parentTask={ task }
                            subTasks={ subTasks }
                            tasks={ tasks }
                            onUpdateTask={ onUpdateTask }
                            onMoveTask={ onMoveTask }
                            visibleColumns={ visibleColumns }
                            allColumns={ allColumns }
                        />
                    </div>
                </TableCell> */

const getOptionsForField = ( field ) => {
    switch ( field ) {
        case "status":
            return TODO_STATUS_OPTIONS;
        case "priority":
            return TODO_PRIORITY_OPTIONS;
        case "difficulty":
            return TODO_DIFFICULTY_OPTIONS;
        default:
            return [];
    }
};

// export default React.memo( TodoDataTableRow )
export default TodoDataTableRow;
