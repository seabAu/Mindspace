
import { useState, useCallback, memo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const NestedDataDisplay = memo( ( { value, compact = false, depth = 0 } ) => {
    const [ expandedItems, setExpandedItems ] = useState( {} );

    const maxDepth = 5; // Prevent infinite recursion

    // Toggle expansion of a nested object/array
    const toggleExpand = useCallback( ( key ) => {
        setExpandedItems( ( prev ) => ( {
            ...prev,
            [ key ]: !prev[ key ],
        } ) );
    }, [] );

    // Format a value for display
    const formatValue = useCallback( ( val ) => {
        if ( val === null || val === undefined ) return "null";

        if ( typeof val === "object" ) {
            if ( val instanceof Date ) {
                return format( val, "PPp" );
            }
            // Complex objects are handled by the recursive rendering
            return null;
        }

        if ( typeof val === "boolean" ) {
            return val ? "true" : "false";
        }

        return String( val );
    }, [] );

    // Determine if a value is a complex type (object or array)
    const isComplexType = useCallback( ( val ) => {
        return val !== null && typeof val === "object" && !( val instanceof Date );
    }, [] );

    // Render array data
    if ( Array.isArray( value ) ) {
        if ( value.length === 0 ) {
            return <div className="text-xs text-gray-400 italic">Empty array</div>;
        }

        return (
            <div className={ `${ compact ? "space-y-0.5" : "space-y-1" }` }>
                { value.map( ( item, index ) => {
                    const isComplex = isComplexType( item );
                    const isExpanded = expandedItems[ `array-${ index }` ];
                    const formattedValue = formatValue( item );

                    return (
                        <div key={ `array-${ index }` } className="border border-gray-700 rounded-md overflow-hidden">
                            <div
                                className="flex items-center justify-between bg-gray-800 px-2 py-1 cursor-pointer"
                                onClick={ () => isComplex && toggleExpand( `array-${ index }` ) }
                            >
                                <div className="flex items-center">
                                    { isComplex && (
                                        <div className="mr-1">
                                            { isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" /> }
                                        </div>
                                    ) }
                                    <span className="text-xs text-gray-400">[{ index }]</span>
                                    { !isComplex && <span className="text-xs ml-2">{ formattedValue }</span> }
                                </div>
                            </div>

                            { isComplex && isExpanded && depth < maxDepth && (
                                <div className="pl-3 pr-1 py-1 bg-gray-750">
                                    <NestedDataDisplay value={ item } compact={ compact } depth={ depth + 1 } />
                                </div>
                            ) }
                        </div>
                    );
                } ) }
            </div>
        );
    }
    // Render object data
    else if ( typeof value === "object" && value !== null && !( value instanceof Date ) ) {
        const entries = Object.entries( value );

        if ( entries.length === 0 ) {
            return <div className="text-xs text-gray-400 italic">Empty object</div>;
        }

        return (
            <div className={ `${ compact ? "space-y-0.5" : "space-y-1" }` }>
                { entries.map( ( [ key, fieldValue ] ) => {
                    const isComplex = isComplexType( fieldValue );
                    const isExpanded = expandedItems[ `object-${ key }` ];
                    const formattedValue = formatValue( fieldValue );

                    return (
                        <div key={ `object-${ key }` } className="border border-gray-700 rounded-md overflow-hidden">
                            <div
                                className="flex items-center justify-between bg-gray-800 px-2 py-1 cursor-pointer"
                                onClick={ () => isComplex && toggleExpand( `object-${ key }` ) }
                            >
                                <div className="flex items-center">
                                    { isComplex && (
                                        <div className="mr-1">
                                            { isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" /> }
                                        </div>
                                    ) }
                                    <span className="text-xs font-medium">{ key }</span>
                                </div>
                                { !isComplex && <span className="text-xs text-gray-300">{ formattedValue }</span> }
                            </div>

                            { isComplex && isExpanded && depth < maxDepth && (
                                <div className="pl-3 pr-1 py-1 bg-gray-750">
                                    <NestedDataDisplay value={ fieldValue } compact={ compact } depth={ depth + 1 } />
                                </div>
                            ) }
                        </div>
                    );
                } ) }
            </div>
        );
    }

    // Fallback for non-complex types
    return <div className="text-xs p-1">{ formatValue( value ) }</div>;
} );

NestedDataDisplay.displayName = "NestedDataDisplay";

export default NestedDataDisplay;
