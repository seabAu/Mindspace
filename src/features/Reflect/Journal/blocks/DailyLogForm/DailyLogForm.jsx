"use client";

import ReactMarkdown from "react-markdown";
import { LOG_MOOD_OPTIONS } from "@/lib/config/config";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { useState } from "react";
import { format, isDate } from "date-fns";
import { CalendarIcon, ChevronRight, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
// import { TiptapEditor } from "@/components/Editor/Tiptap/TiptapEditor";
import { DynamicArrayInput } from "@/components/Input/DynamicArrayInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as utils from "akashatools";
import QuillEditor from "@/features/Note/blocks/QuillEditor/QuillEditor";
import useGlobalStore from "@/store/global.store";
import { produce } from "immer";
import { typeToInitialDefault } from "@/lib/utilities/input";
import { formatDateTime, getPrettyDate, getPrettyTime } from "@/lib/utilities/time";
import { twMerge } from "tailwind-merge";
import useReflectStore from "@/store/reflect.store";
import useReflect from "@/lib/hooks/useReflect";
import remarkGfm from "remark-gfm";
import { CONTENT_HEADER_HEIGHT } from "../../../../../lib/config/constants";
// import { TiptapEditor } from "@/components/Editor/Tiptap/TiptapEditor";
// import { ReactTiptapEditor } from "@/components/Editor/ReactTiptap/ReactTiptapEditorClient";
// import Editor from "@/components/Editor/ReactTiptap/ReactTiptapEditorClient";
// import { ReactTiptapEditor }  from "@/components/Editor/ReactTiptap/ReactTiptapEditor";

const initialLogState = {
    date: new Date(),
    title: "Default placeholder form state",
    summary: "Default placeholder form state",
    content: "Default placeholder form state",
    notes: "Default placeholder form state",
    description: "Default placeholder form state",
    tokens: [],
    timeBlocks: [],
    morningGoals: "Default placeholder form state",
    eveningReflection: "Default placeholder form state",
    gratitude: [ "Default placeholder form state" ],
    challenges: [ "Default placeholder form state" ],
    mood: "Vibing",
    customMood: "Default placeholder form state",
    tags: [ "Default placeholder form state" ],
    achievements: [ { description: "", completed: false } ],
    plansForTomorrow: "",
    weather: { temperature: null, humidity: null, condition: "" },
    wellness: {
        stepsTaken: 0,
        sleep: 0,
        waterIntake: 0,
        tookVitamins: false,
        tookMeds: false,
    },
    attachments: [ { fileUrl: "", description: "" } ],
};

/**
 * Recursively initializes data based on schema type definition, handling arbitrary depth
 * @param {*} type - The schema type definition (can be nested objects, arrays, primitives)
 * @param {*} existingValue - Existing value to use if available
 * @param {boolean} isRoot - Whether this is the root level call
 * @returns {*} Properly initialized value matching the schema structure
 */
/* 
    const typeToInitialDefault = (type, existingValue = null, isRoot = false) => {
        // If we have an existing value that matches the expected type, use it
        if (utils.val.isDefined(existingValue)) {
            // For arrays, ensure it's actually an array
            if (Array.isArray(type) && Array.isArray(existingValue)) {
                return existingValue;
            }
            // For objects, ensure it's actually an object
            if (utils.val.isObject(type) && utils.val.isObject(existingValue) && !Array.isArray(existingValue)) {
                return existingValue;
            }
            // For primitives, return the existing value if types match
            if (!Array.isArray(type) && !utils.val.isObject(type)) {
                return existingValue;
            }
        }

        // Handle array types
        if (Array.isArray(type)) {
            if (type.length === 0) {
                return [];
            }
            // Initialize as empty array - items will be added via the UI
            return [];
        }

        // Handle object types (including nested schemas)
        if (utils.val.isObject(type) && type !== null) {
            // Check if it's a mongoose schema type definition
            if (type.type !== undefined) {
                return typeToInitialDefault(type.type, existingValue, false);
            }

            // Handle nested object schema
            const initializedObject = {};
            Object.keys(type).forEach(key => {
                const fieldType = type[key];
                let fieldExistingValue = null;

                if (utils.val.isObject(existingValue) && existingValue.hasOwnProperty(key)) {
                    fieldExistingValue = existingValue[key];
                }

                initializedObject[key] = typeToInitialDefault(fieldType, fieldExistingValue, false);
            });
            return initializedObject;
        }

        // Handle primitive types
        if (type === String || type === 'String') {
            return existingValue || '';
        }
        if (type === Number || type === 'Number') {
            return existingValue || 0;
        }
        if (type === Boolean || type === 'Boolean') {
            return existingValue || false;
        }
        if (type === Date || type === 'Date') {
            return existingValue || new Date();
        }

        // Handle mongoose schema types
        if (type && type.schemaName) {
            switch (type.schemaName) {
                case 'String':
                    return existingValue || '';
                case 'Number':
                    return existingValue || 0;
                case 'Boolean':
                    return existingValue || false;
                case 'Date':
                    return existingValue || new Date();
                case 'ObjectId':
                    return existingValue || null;
                case 'Int32':
                    return existingValue || 0;
                default:
                    return existingValue || '';
            }
        }

        // Default fallback
        return existingValue || '';
    };
*/

/**
 * Enhanced nested value setter with better error handling and path validation
 * @param {Object} obj - The object to modify
 * @param {Array} path - Array of keys representing the path to the value
 * @param {*} value - The value to set
 */
const setNestedValue = ( obj, path, value ) => {
    if ( !obj || !Array.isArray( path ) || path.length === 0 ) {
        console.error( "Invalid parameters for setNestedValue:", { obj, path, value } );
        return;
    }

    let current = obj;

    // Navigate to the parent of the target property
    for ( let i = 0; i < path.length - 1; i++ ) {
        const key = path[ i ];

        // If the current level doesn't exist or isn't an object, we can't proceed
        if ( !current || typeof current !== "object" ) {
            console.error( "Invalid path for state update - not an object at:", path.slice( 0, i + 1 ).join( "." ) );
            return;
        }

        // If the key doesn't exist, create it as an empty object
        if ( !( key in current ) ) {
            console.warn( "Creating missing path segment:", key );
            current[ key ] = {};
        }

        current = current[ key ];
    }

    // Set the final value
    const finalKey = path[ path.length - 1 ];
    if ( current && typeof current === "object" ) {
        current[ finalKey ] = value;
    } else {
        console.error( "Cannot set property on non-object:", current );
    }
};

/**
 * Enhanced array item addition with better error handling and initialization
 * @param {Object} draft - The immer draft object
 * @param {Array} path - Path to the array
 * @param {*} newItem - Item to add to the array
 */
const safeAddToArray = ( draft, path, newItem ) => {
    try {
        let current = draft;

        // Navigate to the array
        for ( let i = 0; i < path.length; i++ ) {
            const key = path[ i ];

            if ( i === path.length - 1 ) {
                // This should be the array
                if ( !current[ key ] ) {
                    current[ key ] = [];
                }
                if ( !Array.isArray( current[ key ] ) ) {
                    console.error( "Expected array at path but found:", typeof current[ key ], current[ key ] );
                    current[ key ] = [];
                }
                current[ key ].push( newItem );
                return;
            } else {
                // Navigate deeper
                if ( !current[ key ] ) {
                    current[ key ] = {};
                }
                current = current[ key ];
            }
        }
    } catch ( error ) {
        console.error( "Error adding item to array:", error, { path, newItem } );
    }
};

/**
 * Enhanced array item removal with better error handling
 * @param {Object} draft - The immer draft object
 * @param {Array} path - Path to the array
 * @param {number} index - Index to remove
 */
const safeRemoveFromArray = ( draft, path, index ) => {
    try {
        const array = path.reduce( ( acc, key ) => {
            if ( !acc || typeof acc !== "object" ) {
                throw new Error( `Invalid path segment: ${ key }` );
            }
            return acc[ key ];
        }, draft );

        if ( !Array.isArray( array ) ) {
            console.error( "Expected array at path but found:", typeof array );
            return;
        }

        if ( index >= 0 && index < array.length ) {
            array.splice( index, 1 );
        } else {
            console.error( "Invalid index for array removal:", index, "Array length:", array.length );
        }
    } catch ( error ) {
        console.error( "Error removing item from array:", error, { path, index } );
    }
};

export function DailyLogForm ( {
    data,
    setData,
    onUpdate = () => {
        console.log( "DailyLogForm :: Default onUpdate function called." );
    },
    onSubmit = ( data ) => {
        console.log( "DailyLogForm :: Default onSubmit function called. Data submitted: ", data );
    },
} ) {
    const { workspaceId, activeWorkspace, user, schemas, getSchema, getData, getDataOfType, reloadData } =
        useGlobalStore();

    const { handleCreateLog, handleCreateSubmit, handleUpdateLog, handleEditSubmit } = useReflect();

    const {
        logsData,
        setLogsData,
        selectedDate,
        setSelectedDate,
        selectedLog,
        setSelectedLog,
        notesOpen,
        setNotesOpen,
        notesContent,
        setNotesContent,
        isDrawerOpen,
        setIsDrawerOpen,
        addLog,
        updateLog,
        deleteLog,
        sortLogs,
        getLogById,
        getLogByDate,
    } = useReflectStore();

    const initializeDataForType = ( initialData = null, type = "log", schema ) => {
        // Create initial data.
        if ( !schema ) schema = getSchema( type );
        if ( !utils.val.isDefined( schema ) ) {
            return initialData;
        }

        const initializedData = {};

        Object.keys( schema ).forEach( ( fieldSchemaKey ) => {
            const fieldSchema = schema?.[ fieldSchemaKey ];
            let fieldInitialValue = null;
            if ( initialData && utils.val.isObject( initialData ) && initialData?.hasOwnProperty( fieldSchemaKey ) ) {
                fieldInitialValue = initialData?.[ fieldSchemaKey ];
            }

            if ( fieldSchema ) {
                initializedData[ fieldSchemaKey ] = typeToInitialDefault(
                    fieldSchema?.type || fieldSchema,
                    fieldInitialValue ?? null,
                    true,
                );
            }
        } );

        if ( schema ) {
            // Add essential fields we already have values for.
            if ( schema?.hasOwnProperty( "user" ) ) {
                initializedData[ "user" ] = user;
            }
            if ( schema?.hasOwnProperty( "userId" ) ) {
                initializedData[ "userId" ] = user?.id;
            }
            if ( schema?.hasOwnProperty( "workspaceId" ) ) {
                initializedData[ "workspaceId" ] = workspaceId;
            }
        }

        console.log( "DailyLogForm :: initializedData = ", initializedData, " :: ", "schema = ", schema );
        // setFormData( initializedData );
        return initializedData;
    };

    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ isCollapsed, setIsCollapsed ] = useState( false );
    const [ logFormData, setLogFormData ] = useState(
        data ? initializeDataForType( data, "log", getSchema( "log" ) ) : initializeDataForType( null, "log", getSchema( "log" ) ),
        // initializeDataForType( data, 'log', getSchema( 'log' ) )
    );

    const updateLogData = ( updater ) => {
        setLogFormData( produce( updater ) );
    };

    // --- GENERIC UPDATE HANDLERS ---
    const handleFieldChange = ( path, value ) => {
        updateLogData( ( draft ) => {
            console.log(
                "DailyLogForm :: handleFieldChange :: draft = ",
                draft,
                " :: ",
                "path = ",
                path,
                " :: ",
                "value = ",
                value,
            );
            setNestedValue( draft, path, value );
        } );
    };

    const handleAddItem = ( path, newItem ) => {
        updateLogData( ( draft ) => {
            console.log(
                "DailyLogForm :: handleAddItem :: draft = ",
                draft,
                " :: ",
                "path = ",
                path,
                " :: ",
                "newItem = ",
                newItem,
            );
            safeAddToArray( draft, path, newItem );
        } );
    };

    const handleRemoveItem = ( path, index ) => {
        updateLogData( ( draft ) => {
            console.log(
                "DailyLogForm :: handleRemoveItem :: draft = ",
                draft,
                " :: ",
                "path = ",
                path,
                " :: ",
                "index = ",
                index,
            );
            safeRemoveFromArray( draft, path, index );
        } );
    };

    const handleSubmit = ( e ) => {
        e.preventDefault();
        console.log( "Saving Log:", logFormData );
        alert( "Log saved! Check the console for the data." );
        onSubmit( logFormData );
    };

    const handleClear = () => {

        console.log( "Clearing Log Data:", logFormData );
        window.onp;
        setLogFormData(
            data
                ? initializeDataForType( data, "log", getSchema( "log" ) )
                : initializeDataForType( null, "log", getSchema( "log" ) )
        );
    };

    if ( !logFormData ) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>No log selected</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please select a date with a log or create a new one.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        // <Card className="max-h-full !h-full w-full overflow-hidden">
        <Card
            className={ twMerge(
                `overflow-hidden relative !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))]`,
                `!h-fit`,
            ) }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
        >
            <Collapsible defaultOpen={ !isCollapsed } className="group/collapsible">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                    <CollapsibleTrigger
                        className={ `flex flex-row w-full items-center justify-between transform-none hover:transform-none` }
                    >
                        <div className="flex items-center space-x-2">
                            <ChevronRight onClick={ () => { setIsCollapsed( !isCollapsed ); } } className={ `transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                            <CardTitle className="text-base">Daily Log</CardTitle>
                        </div>
                        <div className={ `flex items-center justify-between ${ isCollapsed ? "hidden" : "" }` }>
                        </div>
                    </CollapsibleTrigger>
                        <div className="flex items-center justify-center space-x-2 gap-8">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="expand-form" className="text-xs font-medium text-nowrap">
                                    More Fields
                                </Label>
                                <Switch
                                    id="expand-form"
                                    checked={ isExpanded }
                                    onCheckedChange={ setIsExpanded }
                                    onClick={ ( e ) => {
                                        // e.preventDefault();
                                        e.stopPropagation();
                                    } }
                                />
                            </div>
                            <Button size={ `sm` } variant={ `secondary` } className="w-full h-9" onClick={ handleClear }>
                                <X />{ ` Clear` }
                            </Button>
                            <Button type="submit" className="w-full h-9" onClick={ handleSubmit }>
                                <Save />{ ` Save Log` }
                            </Button>
                        </div>
                </CardHeader>
                <CollapsibleContent className={ `w-full` }>
                    <div className={ twMerge( "space-y-1 h-full", isCollapsed && "hidden" ) }>
                        {/* <div className="flex justify-between items-center"> */ }
                        <form
                            onSubmit={ handleSubmit }
                            className={ twMerge(
                                `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))]`,
                                `flex flex-col justify-start items-start w-full`,
                                `overflow-auto`,
                                `!h-fit`,
                            ) }
                            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
                        >
                            <CardContent className="!w-full space-y-3 px-4">
                                {/* --- AT-A-GLANCE VIEW --- */ }
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="gap-1.5">
                                        <Label htmlFor="title" className="text-xs">
                                            Title
                                        </Label>
                                        <Input
                                            id="title"
                                            value={ logFormData?.title }
                                            onChange={ ( e ) => handleFieldChange( [ "title" ], e.target.value ) }
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="gap-1.5">
                                        <Label htmlFor="date" className="text-xs">
                                            Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={ "outline" }
                                                    className={ cn(
                                                        "w-full justify-start text-left font-normal h-9",
                                                        !logFormData?.date && "text-muted-foreground",
                                                    ) }
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    { isDate( logFormData?.date ) ? (
                                                        format( new Date( logFormData?.date ), "PPP" )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    ) }
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={ ( new Date( logFormData?.date ) ) }
                                                    onSelect={ ( d ) => {
                                                        handleFieldChange( [ "date" ], d );
                                                        if ( !logFormData?.title ) {
                                                            if ( d !== "Invalid Date" ) {
                                                                handleFieldChange( [ "title" ], `Log for ${ getPrettyDate( d ) }` );
                                                            }
                                                        }
                                                    } }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="gap-1.5">
                                    <Label className="text-xs">Day's Summary</Label>
                                    { logFormData?.summary }
                                    <MarkdownEditor
                                        value={ logFormData?.summary }
                                        onChange={ ( v ) => handleFieldChange( [ "summary" ], v ) }
                                        placeholder="A brief summary of your day..."
                                        height={ 100 }
                                    />

                                    {/* <TiptapEditor
                            value={ logFormData?.summary }
                            onChange={ ( v ) => handleFieldChange( [ "summary" ], v ) }
                            placeholder="Summarize your day..."
                        /> */}
                                </div>
                                <div className="space-y-3 rounded-lg border p-3">
                                    <h3 className="text-sm font-semibold">Wellness Snapshot</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-12 gap-1.5">
                                            <Label htmlFor="sleep" className="text-xs">
                                                Sleep (h)
                                            </Label>
                                            <div className="flex-row gap-1.5">
                                                <Input
                                                    id="sleep.start"
                                                    type="datetime-local"
                                                    value={ logFormData?.wellness?.sleep?.start ? formatDateTime( new Date( logFormData?.wellness?.sleep?.start ) ) : null }
                                                    onChange={ ( e ) => handleFieldChange( [ "wellness", "sleep", "start" ], new Date( e.target.value ) ) }
                                                    className="h-9"
                                                />
                                                <Input
                                                    id="sleep.end"
                                                    type="datetime-local"
                                                    value={ logFormData?.wellness?.sleep?.end ? formatDateTime( new Date( logFormData?.wellness?.sleep?.end ) ) : null }
                                                    onChange={ ( e ) => handleFieldChange( [ "wellness", "sleep", "end" ], new Date( e.target.value ) ) }
                                                    className="h-9"
                                                />
                                                <Input
                                                    id="sleep.duration"
                                                    type="number"
                                                    value={ logFormData?.wellness?.sleep?.duration }
                                                    onChange={ ( e ) => handleFieldChange( [ "wellness", "sleep", "duration" ], e.target.value ) }
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-3 gap-1.5">
                                            <Label htmlFor="waterIntake" className="text-xs">
                                                Water (L)
                                            </Label>
                                            <Input
                                                id="waterIntake"
                                                type="number"
                                                value={ logFormData?.wellness?.waterIntake }
                                                onChange={ ( e ) => handleFieldChange( [ "wellness", "waterIntake" ], e.target.value ) }
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="col-span-3 gap-1.5">
                                            <Label htmlFor="stepsTaken" className="text-xs">
                                                Steps
                                            </Label>
                                            <Input
                                                id="stepsTaken"
                                                type="number"
                                                value={ logFormData?.wellness?.stepsTaken }
                                                onChange={ ( e ) => handleFieldChange( [ "wellness", "stepsTaken" ], e.target.value ) }
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="col-span-3 gap-1.5">
                                            <Label htmlFor="weight" className="text-xs">
                                                Weight
                                            </Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                value={ logFormData?.wellness?.weight }
                                                onChange={ ( e ) => handleFieldChange( [ "wellness", "weight" ], e.target.value ) }
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="flex-row justify-center items-center col-span-3 gap-1.5">
                                            <Label htmlFor="tookVitamins" className="text-xs">
                                                Took Vitamins
                                            </Label>
                                            <Switch
                                                id="tookVitamins"
                                                checked={ logFormData?.wellness?.tookVitamins }
                                                onCheckedChange={ ( c ) => handleFieldChange( [ "wellness", "tookVitamins" ], c ) }
                                                className="h-9"
                                            />

                                            <Label htmlFor="tookMeds" className="text-xs">
                                                Took Meds
                                            </Label>
                                            <Switch
                                                id="tookMeds"
                                                checked={ logFormData?.wellness?.tookMeds }
                                                onCheckedChange={ ( c ) => handleFieldChange( [ "wellness", "tookMeds" ], c ) }
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="col-span-12 space-y-3 rounded-lg border w-full min-w-full p-3">
                                            <h3 className="text-sm font-semibold">Effects</h3>
                                            <div className="grid grid-cols-3 gap-3 w-full min-w-full">
                                                <div className="gap-1.5">
                                                    <Label htmlFor="stepsTaken" className="text-xs">
                                                        Effects Intensity Overall
                                                    </Label>

                                                    <Input
                                                        id="effectIntensityOverall"
                                                        type="number"
                                                        value={ logFormData?.wellness?.effectIntensityOverall }
                                                        onChange={ ( e ) => handleFieldChange( [ "wellness", "effectIntensityOverall" ], e.target.value ) }
                                                        className="h-9"
                                                    />
                                                </div>

                                                <div className="flex-row flex-nowrap w-full flex-grow col-span-3">
                                                    <DynamicArrayInput
                                                        items={ logFormData?.wellness?.effects || [] }
                                                        onAdd={ () =>
                                                            handleAddItem( [ "wellness", "effects" ], {
                                                                effectType: '',
                                                                effectDuration: 0,
                                                                // effectStartTime: format( new Date(), "HH:mm" ),
                                                                effectStartTime: new Date().getHours() + ":" + new Date().getMinutes(),
                                                                // effectEndTime: format( new Date(), "HH:mm" ),
                                                                effectEndTime: new Date().getHours() + ":" + new Date().getMinutes(),
                                                                effectIntensity: 0,

                                                            } )
                                                        }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "wellness", "effects" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <div className="grid grid-cols-4 items-center justify-stretch border rounded-md w-full grid-flow-row gap-4 px-4">

                                                                <div className="gap-1.5">
                                                                    <Label htmlFor="stepsTaken" className="text-xs">
                                                                        Effect Type
                                                                    </Label>

                                                                    <Input
                                                                        placeholder="Type"
                                                                        value={ item?.effectType || "" }
                                                                        onChange={ ( e ) => handleFieldChange( [ "wellness", "effects", index, "effectType" ], e.target.value ) }
                                                                        className="h-8 col-span-2"
                                                                    />
                                                                </div>

                                                                <div className="gap-1.5">
                                                                    <Label htmlFor="stepsTaken" className="text-xs">
                                                                        Effect Intensity
                                                                    </Label>
                                                                    <div className={ `w-full flex-row flex-grow flex-nowrap gap-4` }>
                                                                        <Slider
                                                                            id={ `wellness-effects-${ index }-intensity-slider-input` }
                                                                            key={ `wellness-effects-${ index }-intensity-slider-input` }
                                                                            name={ "effectIntensity" }
                                                                            min={ 0 }
                                                                            max={ 10 }
                                                                            placeholder={ "Intensity" }
                                                                            defaultValue={ [ Number( item?.effectIntensity ) ?? 0 ] }
                                                                            onValueChange={ ( values ) => {
                                                                                handleFieldChange( [ "wellness", "effects", index, "effectIntensity" ], values[ 0 ] );
                                                                            } }
                                                                        />
                                                                        <Input
                                                                            type={ `number` }
                                                                            className={ `w-16 h-8 self-center` }
                                                                            id={ `wellness-effects-${ index }-intensity-number-input` }
                                                                            key={ `wellness-effects-${ index }-intensity-number-input` }
                                                                            name={ "effectIntensity" }
                                                                            min={ 0 }
                                                                            max={ 10 }
                                                                            placeholder={ "Intensity" }
                                                                            defaultValue={ [ Number( item?.effectIntensity ) ?? 0 ] }
                                                                            onValueChange={ ( values ) => {
                                                                                handleFieldChange( [ "wellness", "effects", index, "effectIntensity" ], values[ 0 ] );
                                                                            } }
                                                                        />
                                                                        {/* <div className={ `w-16 flex flex-col justify-center items-center` }>
                                                                            <div>{ `${ String( Number( item?.effectIntensity ) ) }` }</div>
                                                                        </div> */}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Start</Label>
                                                                    <Input
                                                                        type="time"
                                                                        // defaultValue={ item?.effectStartTime ? format( new Date( item.effectStartTime ), "HH:mm" ) : "" }
                                                                        value={ new Date( item.effectStartTime ).getHours() + ":" + new Date( item.effectStartTime ).getMinutes() }
                                                                        onChange={ ( e ) => {
                                                                            const [ hours, minutes ] = e.target.value.split( ":" );
                                                                            const date = new Date();
                                                                            date.setHours( Number.parseInt( hours ), Number.parseInt( minutes ), 0, 0 );
                                                                            handleFieldChange( [ "wellness", "effects", index, "effectStartTime" ], date );
                                                                        } }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">End</Label>
                                                                    <Input
                                                                        type="time"
                                                                        // defaultValue={ item?.effectEndTime ? format( new Date( item.effectEndTime ), "HH:mm" ) : "" }
                                                                        value={ new Date( item.effectEndTime ).getHours() + ":" + new Date( item.effectEndTime ).getMinutes() }
                                                                        onChange={ ( e ) => {
                                                                            const [ hours, minutes ] = e.target.value.split( ":" );
                                                                            const date = new Date();
                                                                            date.setHours( Number.parseInt( hours ), Number.parseInt( minutes ), 0, 0 );
                                                                            handleFieldChange( [ "wellness", "effects", index, "effectEndTime" ], date );
                                                                        } }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) }
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DynamicArrayInput
                                    label="Achievements"
                                    items={ logFormData?.achievements || [] }
                                    onAdd={ () => handleAddItem( [ "achievements" ], { description: "", completed: false } ) }
                                    onRemove={ ( index ) => handleRemoveItem( [ "achievements" ], index ) }
                                    renderItem={ ( item, index ) => (
                                        <div className={ `w-full flex-row items-center justify-center space-x-4 px-4` }>
                                            <Input
                                                placeholder="e.g., Finished the report"
                                                value={ item?.description }
                                                onChange={ ( e ) => handleFieldChange( [ "achievements", index, "description" ], e.target.value ) }
                                                className="h-9"
                                            />

                                            <Switch
                                                id="vitamins"
                                                checked={ item?.completed }
                                                onCheckedChange={ ( c ) => handleFieldChange( [ "achievements", index, "completed" ], c ) }
                                                className="h-9"
                                            />
                                        </div>
                                    ) }
                                />

                                {/* --- EXPANDED / FULL VIEW --- */ }
                                { isExpanded && (
                                    <div className="pt-4 border-t">
                                        <Accordion type="multiple" className="w-full space-y-2">
                                            <AccordionItem value="time-blocks">
                                                <AccordionTrigger className="text-sm py-2 transform-none hover:transform-none">
                                                    Time Blocks
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2">
                                                    <DynamicArrayInput
                                                        items={ logFormData?.timeBlocks || [] }
                                                        onAdd={ () =>
                                                            handleAddItem( [ "timeBlocks" ], {
                                                                name: "Time block",
                                                                description: "New block of time",
                                                                color: "#FFFFFF",
                                                                startTime: new Date(),
                                                                endTime: new Date( Date.now() + 60 * 60 * 1000 ), // 1 hour later
                                                                activity: "N/A",
                                                                intent: "N/A",
                                                                focusRating: 5,
                                                                notes: "",
                                                            } )
                                                        }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "timeBlocks" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-2 border rounded-md">
                                                                <Input
                                                                    placeholder="Block Name"
                                                                    value={ item?.name || "" }
                                                                    onChange={ ( e ) => handleFieldChange( [ "timeBlocks", index, "name" ], e.target.value ) }
                                                                    className="h-8 col-span-2"
                                                                />
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Start</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={ item?.startTime ? format( new Date( item.startTime ), "HH:mm" ) : "" }
                                                                        onChange={ ( e ) => {
                                                                            const [ hours, minutes ] = e.target.value.split( ":" );
                                                                            const date = new Date();
                                                                            date.setHours( Number.parseInt( hours ), Number.parseInt( minutes ), 0, 0 );
                                                                            handleFieldChange( [ "timeBlocks", index, "startTime" ], date );
                                                                        } }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">End</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={ item?.endTime ? format( new Date( item.endTime ), "HH:mm" ) : "" }
                                                                        onChange={ ( e ) => {
                                                                            const [ hours, minutes ] = e.target.value.split( ":" );
                                                                            const date = new Date();
                                                                            date.setHours( Number.parseInt( hours ), Number.parseInt( minutes ), 0, 0 );
                                                                            handleFieldChange( [ "timeBlocks", index, "endTime" ], date );
                                                                        } }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <Input
                                                                    placeholder="Activity"
                                                                    value={ item?.activity || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "timeBlocks", index, "activity" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                                <Input
                                                                    placeholder="Intent"
                                                                    value={ item?.intent || "" }
                                                                    onChange={ ( e ) => handleFieldChange( [ "timeBlocks", index, "intent" ], e.target.value ) }
                                                                    className="h-8"
                                                                />
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Focus Rating (0-10)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max="10"
                                                                        value={ item?.focusRating || 0 }
                                                                        onChange={ ( e ) =>
                                                                            handleFieldChange(
                                                                                [ "timeBlocks", index, "focusRating" ],
                                                                                Number.parseInt( e.target.value ) || 0,
                                                                            )
                                                                        }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Color</Label>
                                                                    <Input
                                                                        type="color"
                                                                        value={ item?.color || "#FFFFFF" }
                                                                        onChange={ ( e ) =>
                                                                            handleFieldChange( [ "timeBlocks", index, "color" ], e.target.value )
                                                                        }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                <Textarea
                                                                    placeholder="Notes"
                                                                    value={ item?.notes || "" }
                                                                    onChange={ ( e ) => handleFieldChange( [ "timeBlocks", index, "notes" ], e.target.value ) }
                                                                    className="col-span-2 min-h-[60px]"
                                                                />
                                                            </div>
                                                        ) }
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="main-content">
                                                <AccordionTrigger className="text-sm py-2 transform-none hover:transform-none">
                                                    Main Content
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-3 pt-2">
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Content</Label>

                                                        <MarkdownEditor
                                                            value={ logFormData?.content }
                                                            onChange={ ( v ) => handleFieldChange( [ "content" ], v ) }
                                                            height={ 100 }
                                                        />

                                                        {/* <TiptapEditor
                                                value={ logFormData?.content }
                                                onChange={ ( v ) => handleFieldChange( [ "content" ], v ) }
                                            /> */}
                                                    </div>
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Notes</Label>

                                                        <MarkdownEditor
                                                            value={ logFormData?.notes }
                                                            onChange={ ( v ) => handleFieldChange( [ "notes" ], v ) }
                                                            height={ 100 }
                                                        />

                                                        {/* <TiptapEditor
                                                value={ logFormData?.notes }
                                                onChange={ ( v ) => handleFieldChange( [ "notes" ], v ) }
                                            /> */}
                                                    </div>
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Description</Label>

                                                        <MarkdownEditor
                                                            value={ logFormData?.description }
                                                            onChange={ ( v ) => handleFieldChange( [ "description" ], v ) }
                                                            height={ 100 }
                                                        />

                                                        {/* <TiptapEditor
                                                value={ logFormData?.description }
                                                onChange={ ( v ) => handleFieldChange( [ "description" ], v ) }
                                            /> */}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="planning-reflection">
                                                <AccordionTrigger className="text-sm py-2 transform-none hover:transform-none">
                                                    Planning & Reflection
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4 pt-2">
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Morning Goals</Label>
                                                        <MarkdownEditor
                                                            value={ logFormData?.morningGoals }
                                                            onChange={ ( v ) => handleFieldChange( [ "morningGoals" ], v ) }
                                                            height={ 100 }
                                                        />

                                                        {/* <TiptapEditor
                                                value={ logFormData?.morningGoals }
                                                onChange={ ( v ) => handleFieldChange( [ "morningGoals" ], v ) }
                                            /> */}
                                                    </div>
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Evening Reflection</Label>
                                                        <MarkdownEditor
                                                            value={ logFormData?.eveningReflection }
                                                            onChange={ ( v ) => handleFieldChange( [ "eveningReflection" ], v ) }
                                                            height={ 100 }
                                                        />

                                                        {/* <TiptapEditor
                                                value={ logFormData?.eveningReflection }
                                                onChange={ ( v ) => handleFieldChange( [ "eveningReflection" ], v ) }
                                                height={ 100 }
                                            />

                                                            {/* <TiptapEditor
                                                value={ logFormData?.eveningReflection }
                                                onChange={ ( v ) => handleFieldChange( [ "eveningReflection" ], v ) }
                                            /> */}
                                                    </div>
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Plans for Tomorrow</Label>
                                                        <Textarea
                                                            value={ logFormData?.plansForTomorrow }
                                                            onChange={ ( e ) => handleFieldChange( [ "plansForTomorrow" ], e.target.value ) }
                                                            className="min-h-[80px]"
                                                        />
                                                    </div>
                                                    <div className="gap-1.5">
                                                        <Label className="text-xs">Mood</Label>
                                                        <Select value={ logFormData?.mood } onValueChange={ ( v ) => handleFieldChange( [ "mood" ], v ) }>
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                { LOG_MOOD_OPTIONS.map( ( m ) => (
                                                                    <SelectItem key={ m } value={ m }>
                                                                        { m }
                                                                    </SelectItem>
                                                                ) ) }
                                                            </SelectContent>
                                                        </Select>
                                                        { logFormData?.mood === "Custom" && (
                                                            <Input
                                                                placeholder="Describe your mood"
                                                                value={ logFormData?.customMood }
                                                                onChange={ ( e ) => handleFieldChange( [ "customMood" ], e.target.value ) }
                                                                className="h-9 mt-2"
                                                            />
                                                        ) }
                                                    </div>
                                                    <DynamicArrayInput
                                                        label="Gratitude"
                                                        items={ logFormData?.gratitude || [] }
                                                        onAdd={ () => handleAddItem( [ "gratitude" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "gratitude" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="Something you're grateful for..."
                                                                value={ item || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "gratitude", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />
                                                    <DynamicArrayInput
                                                        label="Challenges"
                                                        items={ logFormData?.challenges || [] }
                                                        onAdd={ () => handleAddItem( [ "challenges" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "challenges" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="An obstacle you faced..."
                                                                value={ item || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "challenges", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />

                                                    <DynamicArrayInput
                                                        label="Morning Goals"
                                                        items={ logFormData?.morningGoals || [] }
                                                        onAdd={ () => handleAddItem( [ "morningGoals" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "morningGoals" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="A goal for today..."
                                                                value={ item || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "morningGoals", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />

                                                    <DynamicArrayInput
                                                        label="Tags"
                                                        items={ logFormData?.tags || [] }
                                                        onAdd={ () => handleAddItem( [ "tags" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "tags" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="Add a tag..."
                                                                value={ item || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "tags", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />

                                                    <DynamicArrayInput
                                                        label="Attachments"
                                                        items={ logFormData?.attachments || [] }
                                                        onAdd={ () =>
                                                            handleAddItem( [ "attachments" ], { fileType: "", fileUrl: "", description: "" } )
                                                        }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "attachments" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <div className="grid grid-cols-1 gap-2 p-2 border rounded-md">
                                                                <Input
                                                                    placeholder="File Type (e.g., image, document)"
                                                                    value={ item?.fileType || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "attachments", index, "fileType" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                                <Input
                                                                    placeholder="File URL"
                                                                    value={ item?.fileUrl || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "attachments", index, "fileUrl" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                                <Input
                                                                    placeholder="Description"
                                                                    value={ item?.description || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "attachments", index, "description" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                            </div>
                                                        ) }
                                                    />

                                                    <div className="space-y-3 rounded-lg border p-3">
                                                        <h4 className="text-sm font-semibold">Weather</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="gap-1.5">
                                                                <Label className="text-xs">Temperature (°F)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="200"
                                                                    value={ logFormData?.weather?.temperature || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange(
                                                                            [ "weather", "temperature" ],
                                                                            Number.parseFloat( e.target.value ) || 0,
                                                                        )
                                                                    }
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <div className="gap-1.5">
                                                                <Label className="text-xs">Humidity (%)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={ logFormData?.weather?.humidity || "" }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "weather", "humidity" ], Number.parseFloat( e.target.value ) || 0 )
                                                                    }
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <Input
                                                                placeholder="Condition (e.g., sunny, rainy)"
                                                                value={ logFormData?.weather?.condition || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "weather", "condition" ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                            <Input
                                                                placeholder="Other notes"
                                                                value={ logFormData?.weather?.other || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "weather", "other" ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="wellness">
                                                <AccordionTrigger className="text-sm py-2 transform-none hover:transform-none">
                                                    Full Wellness Details
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4 pt-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="gap-1.5">
                                                            <Label className="text-xs">Browser Tabs Open</Label>
                                                            <Input
                                                                type="number"
                                                                value={ logFormData?.wellness?.numOfTabs }
                                                                onChange={ ( e ) => handleFieldChange( [ "wellness", "numOfTabs" ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="gap-1.5">
                                                            <Label className="text-xs">Weight</Label>
                                                            <Input
                                                                type="number"
                                                                value={ logFormData?.wellness?.weight }
                                                                onChange={ ( e ) => handleFieldChange( [ "wellness", "weight" ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2 pt-4">
                                                            <Switch
                                                                id="vitamins"
                                                                checked={ logFormData?.wellness?.tookVitamins }
                                                                onCheckedChange={ ( c ) => handleFieldChange( [ "wellness", "tookVitamins" ], c ) }
                                                            />
                                                            <Label htmlFor="vitamins" className="text-xs">
                                                                Took Vitamins
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pt-4">
                                                            <Switch
                                                                id="meds"
                                                                checked={ logFormData?.wellness?.tookMeds }
                                                                onCheckedChange={ ( c ) => handleFieldChange( [ "wellness", "tookMeds" ], c ) }
                                                            />
                                                            <Label htmlFor="meds" className="text-xs">
                                                                Took Meds
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">
                                                            Overall Effect Intensity: { logFormData?.wellness?.effectIntensityOverall }
                                                        </Label>
                                                        <Slider
                                                            value={ [ logFormData?.wellness?.effectIntensityOverall ] }
                                                            onValueChange={ ( v ) => handleFieldChange( [ "wellness", "effectIntensityOverall" ], v[ 0 ] ) }
                                                            max={ 10 }
                                                            step={ 1 }
                                                        />
                                                    </div>
                                                    <DynamicArrayInput
                                                        label="Specific Effects"
                                                        items={ logFormData?.wellness?.effects }
                                                        onAdd={ () =>
                                                            handleAddItem( [ "wellness", "effects" ], {
                                                                effectType: "",
                                                                effectStartTime: "09:00",
                                                                effectEndTime: "10:00",
                                                                effectIntensity: 5,
                                                                notes: "",
                                                            } )
                                                        }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "wellness", "effects" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <div className="p-2 border rounded-md space-y-2">
                                                                <Input
                                                                    placeholder="Effect Type (e.g. Caffeine)"
                                                                    value={ item?.effectType }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "wellness", "effects", index, "effectType" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Start</Label>
                                                                        <Input
                                                                            type="time"
                                                                            value={ item?.effectStartTime }
                                                                            onChange={ ( e ) =>
                                                                                handleFieldChange(
                                                                                    [ "wellness", "effects", index, "effectStartTime" ],
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            className="h-8"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">End</Label>
                                                                        <Input
                                                                            type="time"
                                                                            value={ item?.effectEndTime }
                                                                            onChange={ ( e ) =>
                                                                                handleFieldChange(
                                                                                    [ "wellness", "effects", index, "effectEndTime" ],
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            className="h-8"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Intensity: { item?.effectIntensity }</Label>
                                                                    <Slider
                                                                        value={ [ item?.effectIntensity ] }
                                                                        onValueChange={ ( v ) =>
                                                                            handleFieldChange( [ "wellness", "effects", index, "effectIntensity" ], v[ 0 ] )
                                                                        }
                                                                        max={ 10 }
                                                                        step={ 1 }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) }
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="metadata">
                                                <AccordionTrigger className="text-sm py-2 transform-none hover:transform-none">
                                                    Metadata
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4 pt-2">
                                                    <div className="p-2 border rounded-md space-y-2">
                                                        <Label className="text-sm font-medium">Weather</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                placeholder="Condition"
                                                                value={ logFormData?.weather?.condition || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "weather", "condition" ], e.target.value ) }
                                                                className="h-8"
                                                            />
                                                            <Input
                                                                placeholder="Temp"
                                                                type="number"
                                                                value={ logFormData?.weather?.temperature || "" }
                                                                onChange={ ( e ) => handleFieldChange( [ "weather", "temperature" ], e.target.value ) }
                                                                className="h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DynamicArrayInput
                                                        label="Tags"
                                                        items={ logFormData?.tags || [ "" ] }
                                                        onAdd={ () => handleAddItem( [ "tags" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "tags" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="e.g., work"
                                                                value={ item }
                                                                onChange={ ( e ) => handleFieldChange( [ "tags", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />
                                                    <DynamicArrayInput
                                                        label="Tokens"
                                                        items={ logFormData?.tokens }
                                                        onAdd={ () => handleAddItem( [ "tokens" ], "" ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "tokens" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <Input
                                                                placeholder="e.g., #project-id"
                                                                value={ item }
                                                                onChange={ ( e ) => handleFieldChange( [ "tokens", index ], e.target.value ) }
                                                                className="h-9"
                                                            />
                                                        ) }
                                                    />
                                                    <DynamicArrayInput
                                                        label="Attachments"
                                                        items={ logFormData?.attachments || [ { fileUrl: "", description: "" } ] }
                                                        onAdd={ () => handleAddItem( [ "attachments" ], { fileUrl: "", description: "" } ) }
                                                        onRemove={ ( index ) => handleRemoveItem( [ "attachments" ], index ) }
                                                        renderItem={ ( item, index ) => (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    placeholder="File URL"
                                                                    value={ item?.fileUrl }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "attachments", index, "fileUrl" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                                <Input
                                                                    placeholder="Description"
                                                                    value={ item?.description }
                                                                    onChange={ ( e ) =>
                                                                        handleFieldChange( [ "attachments", index, "description" ], e.target.value )
                                                                    }
                                                                    className="h-8"
                                                                />
                                                            </div>
                                                        ) }
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                ) }
                            </CardContent>
                            <CardFooter className="px-4 pb-3">
                                <Button type="submit" className="w-full h-9" onClick={ handleSubmit }>
                                    Save Log
                                </Button>
                            </CardFooter>
                        </form>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export function MarkdownEditor ( { value = "N/A", onChange, placeholder, height = 200 } ) {
    return (
        <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
                {/* <Textarea
                    placeholder={ placeholder }
                    value={ value }
                    onChange={ ( e ) => onChange( e.target.value ) }
                    className="resize-y"
                    style={ { minHeight: height } }
                /> */}

                {/* <div className={ `` }>
                    <div className={ `` }>{ `Current value:` }</div>
                    <div className={ `` }>{ String( value ) }</div>
                </div> */}
                {/* <TiptapEditor
                    className={ `flex flex-col items-stretch justify-start w-full h-full rounded-xl` }
                    value={ value ?? '' }
                    onChange={ ( data ) => {
                        // Store the data in the content. 
                        if ( data && value && value !== data ) {
                            console.log( "DailyLogForm :: TiptapEditor Markdown :: setContent :: data = ", data, " :: ", "value = ", value );
                            onChange( data );
                        }
                    } }
                /> */}

                <QuillEditor
                    className={ `flex flex-col items-stretch justify-start w-full h-full` }
                    placeholder={ placeholder }
                    useLiveUpdate={ true }
                    useThemeDropdown={ false }
                    useSaveButton={ false }
                    content={ value ?? "" }
                    setContent={ ( data ) => {
                        // Store the data in the content.
                        if ( utils.val.isDefined( data ) && utils.val.isDefined( value ) && value !== data ) {
                            console.log(
                                "DailyLogForm :: QuillEditor Markdown :: setContent :: data = ",
                                data,
                                " :: ",
                                "value = ",
                                value,
                            );
                            onChange( data );
                        }
                    } }
                />
            </TabsContent>
            <TabsContent value="preview">
                <div
                    className="prose dark:prose-invert prose-sm sm:prose-base min-w-full rounded-md border bg-muted p-4"
                    style={ { minHeight: height } }
                >
                    <ReactMarkdown remarkPlugins={ [ remarkGfm ] }>{ value || "Nothing to preview." }</ReactMarkdown>
                </div>
            </TabsContent>
        </Tabs>
    );
}
