import React, { useState, useCallback, useEffect } from "react";
import { Plus, Minus, ExpandIcon, ShrinkIcon, ListCollapseIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as utils from "akashatools";

const DropTable = ( props ) => {
    const {
        label,
        data,
        showControls = true,
        expandable = true,
        compact = true,
        collapse = false,
        useBackgroundOverlay = true,
        classNames = "",
        classes = "",
        styles = {},
        debug = false,
    } = props;

    const [ renderData, setRenderData ] = useState( data );
    const [ showExpandable, setShowExpandable ] = useState( expandable );
    const [ showCompact, setShowCompact ] = useState( compact );
    const [ collapsed, setCollapsed ] = useState( collapse );

    useEffect( () => {
        if ( debug ) console.log( "DropTable.jsx :: data changed :: data = ", data );
        setRenderData( data );
    }, [ data, debug ] );

    const controls = [
        {
            name: "setExpandable",
            label: "Expandable",
            icon: <ExpandIcon className={ `size-auto p-0 m-0 stroke-[0.125rem]` } />,
            classes: `p-1 aspect-square ${ showExpandable ? `active bg-sextary-700/60` : `` }`,
            onClick: () => setShowExpandable( !showExpandable ),
        },
        {
            name: "setCompact",
            label: "Compact",
            icon: <ShrinkIcon className={ `size-auto p-0 m-0 stroke-[0.125rem]` } />,
            classes: `p-1 aspect-square ${ showCompact ? `active bg-sextary-700/60` : `` }`,
            onClick: () => setShowCompact( !showCompact ),
        },
        {
            name: "setCollapsed",
            label: "Collapse",
            icon: <ListCollapseIcon className={ `size-auto p-0 m-0 stroke-[0.125rem]` } />,
            classes: `p-1 aspect-square ${ collapsed ? `active bg-sextary-700/60` : `` }`,
            onClick: () => setCollapsed( !collapsed ),
        },
    ];

    const renderTable = useCallback(
        ( input, depth = 0 ) => {
            if ( utils.val.isDefined( data ) ) {

                if ( utils.val.isValidArray( input, true ) ) {
                    // Array type.
                    return (
                        <table className={ `w-full border-collapse ${ showCompact ? "text-sm" : "" }` }>
                            <tbody>
                                { input.map( ( value, index ) => {
                                    return (
                                        <DropTableItem
                                            input={ input }
                                            depth={ depth }
                                            key={ index }
                                            inputKey={ index }
                                            value={ value }
                                            index={ index }
                                            useBackgroundOverlay={ useBackgroundOverlay }
                                            collapsed={ collapsed }
                                            showExpandable={ showExpandable }
                                            renderTable={ renderTable }
                                        />
                                    );
                                } ) }
                            </tbody>
                        </table>
                    );
                }
                else if ( utils.val.isObject( input ) ) {
                    // Object type. 
                    return (
                        <table className={ `w-full border-collapse ${ showCompact ? "text-sm" : "" }` }>
                            <tbody>
                                { Object.entries( input ).map( ( [ key, value ], index ) => {
                                    return (
                                        <DropTableItem
                                            input={ input }
                                            depth={ depth }
                                            key={ key }
                                            inputKey={ key }
                                            value={ value }
                                            index={ index }
                                            useBackgroundOverlay={ useBackgroundOverlay }
                                            collapsed={ collapsed }
                                            showExpandable={ showExpandable }
                                            renderTable={ renderTable }
                                        />
                                    );
                                } ) }
                            </tbody>
                        </table>
                    );
                }
            }
            return <span>{ utils.ao.replaceIfInvalid( input?.toString(), "-" ) }</span>;
        }
        , [ showExpandable, showCompact, collapsed, useBackgroundOverlay ] );

    return (
        <div className={ `data-list-container overflow-auto ${ classes } ${ classNames }` } style={ styles }>
            <div className="flex flex-col w-full justify-stretch items-center border-b">
                { label && <h4 className="font-bold text-xl p-1 w-full">{ label }</h4> }
                { showControls && (
                    <div className="flex gap-2">
                        { controls.map( ( control ) => (
                            <button
                                key={ control?.name }
                                onClick={ control?.onClick }
                                className={ twMerge( `p-2 rounded`, control?.classes ) }
                                title={ control?.label }
                            >
                                { control?.icon }
                            </button>
                        ) ) }
                    </div>
                ) }
            </div>
            <div className={ `data-list ${ showCompact ? "data-list-compact" : "" } ${ collapsed ? "data-list-collapsed" : "" }` }>
                { renderTable( renderData ) }
            </div>
        </div>
    );
};

const DropTableItem = ( props ) => {
    const {
        key,
        inputKey,
        value,
        index,
        input,
        depth,
        useBackgroundOverlay,
        collapsed,
        showExpandable,
        renderTable,
    } = props;
    const isExpandable = utils.val.isArray( value ) || utils.val.isObject( value );
    const [ isExpanded, setIsExpanded ] = useState( !collapsed && isExpandable ); // Moved useState call outside the map function

    return (
        <React.Fragment key={ `${ depth }-${ index }` }>
            <tr
                className={ twMerge(
                    "border-b",
                    useBackgroundOverlay && "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isExpandable && "cursor-pointer",
                ) }
            >
                <td className="px-2 font-semibold" style={ { width: "30%" } }>
                    { isExpandable && showExpandable && (
                        <button onClick={ () => setIsExpanded( !isExpanded ) } className="mr-2 focus:outline-none">
                            { isExpanded ? <Minus size={ 16 } /> : <Plus size={ 16 } /> }
                        </button>
                    ) }
                    { utils.val.isValidArray( input ) ? `[ ${ index } ]` : `[ ${ inputKey ?? key } ]` }
                </td>
                <td className="px-2" style={ { width: "70%" } }>
                    { isExpandable
                        ? `${ utils.val.isArray( value ) ? "Array" : "Object" } (${ Object.keys( value )?.length || 0 })`
                        : utils.ao.replaceIfInvalid( value?.toString(), "-" ) }
                </td>
            </tr>
            { isExpandable && showExpandable && isExpanded && (
                <tr>
                    <td colSpan="2" className="p-0">
                        <div className="pl-4">{ renderTable( value, depth + 1 ) }</div>
                    </td>
                </tr>
            ) }
        </React.Fragment>
    );
};

DropTable.Item = DropTableItem;


export default DropTable


