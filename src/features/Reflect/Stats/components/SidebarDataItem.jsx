import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useReflect } from "../contexts/StatsContext";
import DataValueInput from "./DataForm/DataValueInput";
// import DateTimePicker from "./DataForm/DateTimePicker";
import NestedDataDisplay from "./DataForm/NestedDataDisplay";
import DataKeyDropdown from "./DataForm/DataKeyDropdown";
import useReflect from "@/lib/hooks/useReflect";
import useStatsStore from "@/store/stats.store";
import { DATA_TYPES } from "@/lib/config/config";
import { useStatsContext } from "../contexts/StatsContext";
import DateTimeClockPicker from "./DataForm/DateTimeClockPicker";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

// Change the component declaration to include a default for onSelect
const SidebarDataItem = ( { item, isSelected = false, onSelect = () => { } } ) => {
    const [ isEditing, setIsEditing ] = useState( false );
    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ localItem, setLocalItem ] = useState( { ...item } );
    const { updateStat, deleteStat } = useReflectContext();
    const { handleUpdateStats, handleDeleteStats } = useReflect();

    // Update local item when the prop changes
    useEffect( () => {
        setLocalItem( { ...item } );
    }, [ item ] );

    const handleDelete = useCallback( async ( id ) => {
        let result = await handleDeleteStats( id );
        deleteStat( id );
    }, [ handleDeleteStats, item, item._id, deleteStat ] );

    const handleSave = useCallback( async () => {
        let result = await handleUpdateStats( item._id, localItem );
        if ( result ) {
            updateStat( item._id, result );
            setLocalItem( { ...result } );
        }
        setIsEditing( false );
    }, [ updateStat, item._id, localItem ] );

    const handleChange = useCallback( ( field, value ) => {
        setLocalItem( ( prev ) => {
            const updated = { ...prev, [ field ]: value };

            // If changing dataType, reset dataValue to appropriate default
            if ( field === "dataType" ) {
                switch ( value ) {
                    case "String":
                        updated.dataValue = "";
                        break;
                    case "Number":
                    case "Integer":
                    case "Decimal":
                        updated.dataValue = 0;
                        break;
                    case "Boolean":
                        updated.dataValue = false;
                        break;
                    case "Date":
                    case "DateTime":
                    case "DateTimeLocal":
                        updated.dataValue = new Date();
                        break;
                    case "Array":
                        updated.dataValue = [];
                        break;
                    case "Object":
                    case "Mixed":
                        updated.dataValue = {};
                        break;
                    default:
                        updated.dataValue = "";
                }
            }

            return updated;
        } );
    }, [] );

    const handleCancel = useCallback( () => {
        setLocalItem( { ...item } );
        setIsEditing( false );
    }, [ item ] );

    const handleItemClick = useCallback( () => {
        if ( !isEditing ) {
            onSelect( item._id );
        }
    }, [ isEditing, onSelect, item._id ] );

    const handleToggleExpand = useCallback(
        ( e ) => {
            e.stopPropagation();
            setIsExpanded( !isExpanded );
        },
        [ isExpanded ],
    );

    const getTypeColor = ( dataType ) => {
        switch ( dataType ) {
            case "String":
                return "bg-washed-blue-900 hover:bg-washed-blue-800";
            case "Number":
            case "Integer":
            case "Decimal":
                return "bg-brown-900 hover:bg-brown-800";
            case "Boolean":
                return "bg-primary-purple-900 hover:bg-primary-purple-800";
            case "Date":
            case "DateTime":
            case "DateTimeLocal":
                return "bg-tahiti-900 hover:bg-tahiti-800";
            case "Object":
                return "bg-primary-purple-900 hover:bg-washed-purple-800";
            case "Array":
                return "bg-primary-blue-900 hover:bg-primary-blue-800";
            default:
                return "bg-neutral-700 hover:bg-neutral-600";
        }
    };

    const isComplexValue = () => {
        const { dataValue, dataType } = localItem;
        return (
            ( dataType === "Object" || dataType === "Array" ) &&
            dataValue !== null &&
            typeof dataValue === "object" &&
            !( dataValue instanceof Date )
        );
    };

    return (
        <div
            className={ `border-b border-neutral-700 ${ isSelected ? "bg-sextary-700" : "hover:bg-sextary-800"
                } transition-colors cursor-pointer gap-2` }
            onClick={ handleItemClick }
        >
            <div className="p-1.5">
                {/* Header row with key, type badge, and actions */ }
                <div className="flex items-center justify-between">
                    { isComplexValue() && (
                        <button onClick={ handleToggleExpand } className="p-0.5 text-neutral-400 hover:text-white">
                            { isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" /> }
                        </button>
                    ) }

                    { isEditing ? (
                        <div className="flex-1 min-w-0">
                            <DataKeyDropdown
                                value={ localItem.dataKey }
                                onChange={ ( value ) => handleChange( "dataKey", value ) }
                            />
                        </div>
                    ) : (
                        <div className={ `flex items-stretch gap-1 flex-1 min-w-0 ${ isEditing ? 'flex-col w-full' : '' }` }>
                            <div className="font-medium text-sm truncate flex-1 min-w-0">{ localItem.dataKey }</div>
                            <Badge className={ `text-[0.65rem] text-neutral-400 px-1 py-0 h-4 ${ getTypeColor( localItem.dataType ) }` }>
                                { localItem.dataType }
                            </Badge>

                        </div>
                    ) }

                    <div className="flex items-center gap-1">
                        { isEditing ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={ handleSave } className="h-6 w-6 p-0">
                                    <Save className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={ handleCancel } className="h-6 w-6 p-0 text-neutral-400">
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={ ( e ) => {
                                        e.stopPropagation();
                                        setIsEditing( true );
                                    } }
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={ ( e ) => {
                                        e.stopPropagation();
                                        handleDelete( item._id );
                                    } }
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </>
                        ) }
                    </div>
                </div>

                {/* Editing form or value display */ }
                { isEditing ? (
                    <div className="space-y-2 pt-1">
                        {/* Data Type */ }
                        <div>
                            <label className="text-xs text-gray-400">Type</label>
                            <Select
                                value={ localItem?.dataType }
                                className="w-full bg-gray-700 border border-gray-600 rounded-sm text-white text-xs p-1"
                                onValueChange={ ( value ) => handleChange( "dataType", value ) }
                            >
                                <SelectTrigger className="gap-2 h-8" id="dataType">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    { DATA_TYPES.map( ( o ) => ( <SelectItem key={ o?.value } value={ o?.value }>{ o?.label }</SelectItem> ) )
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Timestamp */ }
                        <div>
                            <label className="text-xs text-gray-400">Timestamp</label>
                            <DateTimeClockPicker
                                value={ new Date( localItem?.timeStamp ) }
                                onChange={ ( date ) => handleChange( "timeStamp", new Date( date ).getTime() ) }
                                onClear={ () => handleChange( "timeStamp", new Date().getTime() ) }
                                compact={ true }
                            />
                        </div>

                        {/* Data Value */ }
                        <div>
                            <label className="text-xs text-gray-400">Value</label>
                            <DataValueInput
                                dataType={ localItem.dataType }
                                value={ localItem?.dataValue }
                                onChange={ ( value ) => handleChange( "dataValue", value ) }
                                compact={ true }
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Value display */ }
                        <div className="text-xs text-gray-300 break-words">
                            { isComplexValue() ? (
                                isExpanded ? (
                                    <div className="pl-3 pt-1">
                                        <NestedDataDisplay value={ localItem.dataValue } compact={ true } />
                                    </div>
                                ) : (
                                    <div className="opacity-60 italic">
                                        { localItem.dataType === "Array"
                                            ? `Array [${ Array.isArray( localItem.dataValue ) ? localItem.dataValue.length : 0 }]`
                                            : "Object {...}" }
                                    </div>
                                )
                            ) : (
                                <div className="truncate">
                                    { typeof localItem.dataValue === "object"
                                        ? JSON.stringify( localItem.dataValue )
                                        : String( localItem.dataValue ) }
                                </div>
                            ) }
                        </div>
                    </>
                ) }
            </div>
        </div>
    );
};

export default SidebarDataItem;
