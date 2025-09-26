"use client";

import { useRef, useState, useEffect, memo, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TimeTooltip } from "./TimeTooltip";

/**
 * @typedef {Object} GridItem
 * @property {number} id
 * @property {boolean} isPast
 * @property {boolean} isCurrent
 * @property {boolean} isFuture
 * @property {string} [label]
 * @property {React.ReactNode} tooltipContent
 */

/**
 * Optimized grid cell component to reduce re-renders
 */
const GridCell = memo( function GridCell ( { item, cellSize } ) {
    return (
        <TimeTooltip content={ item?.tooltipContent }>
            <div
                className={ `flex items-center justify-center text-xs rounded ${ item?.isCurrent
                    ? "bg-blue-500 text-white"
                    : item?.isPast
                        ? "bg-gray-300 text-gray-700"
                        : "bg-blue-100 text-blue-800"
                    }` }
                style={ {
                    width: `100%`,
                    minWidth: `${ cellSize }px`,
                    height: `100%`,
                    minHeight: `${ cellSize }px`,
                } }
            >
                { item?.id + 1 }
            </div>
        </TimeTooltip>
    );
} );

/**
 * @param {Object} props
 * @param {GridItem[]} props.items
 * @param {number} props.columns
 * @param {number} [props.cellSize=40]
 */
function VirtualizedGridComponent ( { items, columns, cellSize = 40 } ) {
    const parentRef = useRef( null );
    const [ parentWidth, setParentWidth ] = useState( 0 );

    // Update parent width on resize - optimized with debounce
    useEffect( () => {
        if ( !parentRef.current ) return;

        const updateWidth = () => {
            if ( parentRef.current ) {
                setParentWidth( parentRef.current.offsetWidth );
            }
        };

        // Initial width calculation
        updateWidth();

        // Debounced resize handler
        let timeoutId;
        const handleResize = () => {
            if ( timeoutId ) clearTimeout( timeoutId );
            timeoutId = setTimeout( updateWidth, 100 );
        };

        const observer = new ResizeObserver( handleResize );
        observer.observe( parentRef.current );

        return () => {
            if ( timeoutId ) clearTimeout( timeoutId );
            if ( parentRef.current ) {
                observer.unobserve( parentRef.current );
            }
        };
    }, [] );

    // Calculate rows based on items and columns
    const rows = Math.ceil( items.length / columns );

    // Calculate actual cell size based on available width - memoized
    const actualCellSize = useMemo( () => {
        return Math.min( cellSize, parentWidth > 0 ? Math.floor( ( parentWidth - ( columns - 1 ) * 4 ) / columns ) : cellSize );
    }, [ cellSize, columns, parentWidth ] );

    // Set up virtualizer for rows with optimized settings
    const rowVirtualizer = useVirtualizer( {
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => actualCellSize + 4, // cell + gap
        overscan: 3, // Reduced overscan for better performance
        paddingStart: 0,
        paddingEnd: 0,
    } );

    // Pre-calculate virtual rows for better performance
    const virtualRows = useMemo( () => {
        return rowVirtualizer.getVirtualItems();
    }, [ rowVirtualizer ] );

    return (
        <div
            ref={ parentRef }
            className={ `overflow-auto w-full h-full justify-center items-start flex flex-grow` }
            style={ {
                height: "60vh",
                width: "100%",
            } }
        >
            <div
                className={ `w-full h-full justify-center items-start` }
                style={ {
                    height: `${ rowVirtualizer.getTotalSize() }px`,
                    width: "100%",
                    position: "relative",
                } }
            >
                { virtualRows.map( ( virtualRow ) => {
                    const rowStart = virtualRow.index * columns;

                    return (
                        <div
                            className={ `w-full h-full flex-grow justify-center items-center` }
                            key={ virtualRow.index }
                            style={ {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${ actualCellSize }px`,
                                transform: `translateY(${ virtualRow.start }px)`,
                                display: "grid",
                                gridTemplateColumns: `repeat(${ columns }, ${ actualCellSize }px)`,
                                gap: "4px",
                                willChange: "transform", // Optimize for GPU acceleration
                            } }
                        >
                            { Array.from( { length: Math.min( columns, items.length - rowStart ) } ).map( ( _, columnIndex ) => {
                                const itemIndex = rowStart + columnIndex;
                                if ( itemIndex >= items.length ) return null;

                                const item = items[ itemIndex ];

                                return <GridCell key={ item.id } item={ item } cellSize={ actualCellSize } />;
                            } ) }
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualizedGrid = memo( VirtualizedGridComponent )

