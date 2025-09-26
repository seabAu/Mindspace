import React, { useCallback, useEffect, useState } from 'react';

// Creates a controllable, managed unordered list from arbitrary JSON data.
import './droplist.css';
import Button from '../Button';
import { Expand, ExpandIcon, List, ListCollapse, ListCollapseIcon, Minus, Plus, ShrinkIcon } from 'lucide-react';
import * as utils from 'akashatools';
import { twMerge } from 'tailwind-merge';

function Droplist ( props ) {
    const {
        label,
        data,
        type,
        // Style settings.
        layout = "default",
        display = "block",
        flexDirection = "column",
        fillArea = true,
        height = "auto",
        width = "auto",
        minHeight, //  = "auto",
        minWidth, //  = "auto",
        maxHeight, //  = "100%",
        maxWidth, //  = "100%",
        showControls = true,
        expandable = true,
        compact = true,
        collapse = false,
        useBackgroundOverlay = true,
        classes = "",
        styles = {},
        debug = false,
    } = props;
    const [ renderData, setRenderData ] = useState( data ?? {} );
    const [ showExpandable, setShowExpandable ] = useState( expandable ?? false );
    const [ showCompact, setShowCompact ] = useState( compact ?? false );
    const [ collapsed, setCollapsed ] = useState( collapse ?? false );

    const controls = [
        {
            name: "setExpandable",
            label: "Expandable",
            icon: <ExpandIcon />,
            classes: `${ showExpandable ? `active` : `` }`,
            onClick: ( e ) => {
                setShowExpandable( showExpandable === true ? false : true );
            },
        },
        {
            name: "setCompact",
            label: "Compact",
            icon: <ShrinkIcon />,
            classes: `${ showCompact ? `active` : `` }`,
            onClick: ( e ) => {
                setShowCompact( showCompact === true ? false : true );
            },
        },
        {
            name: "setCollapsed",
            label: "Collapse",
            icon: <ListCollapseIcon />, //FaJira
            classes: `${ collapsed ? `active` : `` }`,
            onClick: ( e ) => {
                setCollapsed( collapsed === true ? false : true );
            },
        },
    ];

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.{{
        // display: `${"flex"}`,
        // flexDirection: `${flexDirection}`,
        // justifyContent: `${justifyContent}`,
        // alignItems: `${alignContent}`,
        // alignContent: `${alignContent}`,
        height: `${ height }`,
        ...{
            ...( minHeight ? { minHeight: `${ minHeight }` } : {} ),
        },
        ...{
            ...( maxHeight ? {
                maxHeight: `${ maxHeight } !important`,
                overflowY: `auto !important`,
            } : {} ),
        },
        // minHeight: `${minHeight}`,
        width: `${ width }`,
        ...{
            ...( minWidth ? { minWidth: `${ minWidth }` } : {} ),
        },
        ...{
            ...( maxWidth ? {
                maxWidth: `${ maxWidth } !important`,
                overflowX: `auto !important`,
            } : {} ),
        },
        // minWidth: `${minWidth}`,
        // padding: `${padding ? padding : "0.0rem"}`,
        // overflowX: `${overflowX}`,
        // overflowY: `${overflowY}`,
        // border: `1px solid white`,
        ...styles,
        // Responsiveness overrides go here.
    };

    useEffect( () => {
        if ( debug ) console.log( "Droplist.js :: data changed :: data = ", data );
        setRenderData( data );
    }, [ data ] );

    // if ( debug ) console.log( 'Droplist.js :: props = ', props );

    const dataToList = useCallback(
        (
            input,
            classPrefix,
            parentIndex,
            expandable,
            checked = false,
        ) => {
            // let id = `droplist-${ classPrefix }-array-item-${ parentIndex }-${ utils.rand.rand( 1e6, 0 ) }`;
            let id = `droplist-${ classPrefix }-array-item-${ parentIndex }-${ expandable }) }`;
            if ( utils.val.isArray( input ) ) {
                // Top-level input is an array.
                return (
                    <ul
                        id={ id }
                        key={ id }
                        className={ `${ classPrefix }-array ${ expandable ? `${ classPrefix }-expandable` : ''
                            }` }
                    >
                        { input?.map( ( arrElement, arrayIndex ) => {
                            // Map for each item in the array.
                            return valToListElement(
                                arrayIndex, // Datalabel
                                arrElement, // Datavalue
                                classPrefix, // Classprefix
                                `${ parentIndex }-${ arrayIndex }`, // ParentIndex
                                expandable, // Expandable?
                                checked ?? false, // Checked?
                            );
                        } ) }
                    </ul>
                );
            } else if ( utils.val.isObject( input ) ) {
                // Top-level input is an object.
                // return objToList(input, classPrefix, parentIndex, expandable);

                // Input is an object.
                return (
                    <ul
                        id={ id }
                        key={ id }
                        className={ `${ classPrefix }-obj ${ expandable ? `${ classPrefix }-expandable` : ''
                            }` }
                    >
                        { Object.entries( input ).map( ( prop, objIndex ) => {
                            // Iterate for each entry in the object.
                            let objKey = prop[ 0 ];
                            let objValue = prop[ 1 ];
                            return valToListElement(
                                objKey,
                                objValue,
                                classPrefix,
                                `${ parentIndex }-${ objIndex }`,
                                expandable ?? false,
                                checked ?? false,
                            );
                        } ) }
                    </ul>
                );
            } else {
                // if ( debug ) console.log( 'Droplist :: input = ', input );
                return (
                    <ul
                        className={ `${ classPrefix }` }>
                        <li>{ input }</li>
                    </ul>
                );
            }
        },
        [ renderData ]
    );

    // Generic function to turn any label-value pair into a <li></li> wrapped DOM element with appropriate styling and interactivity elements.
    // When called from functions dealing with array elements, the data label will simply be the array index.
    // When called from functions delaing with object elements, the data label and value will be the key-value pair.
    const valToListElement = useCallback(
        (
            dataLabel,
            dataValue,
            classPrefix,
            parentIndex,
            expandable = false,
            checked = false,
        ) => {
            if ( !dataValue ) dataValue = "-";
            // let id = `droplist-${ classPrefix }-item-${ dataLabel }-${ parentIndex }-${ utils.rand.rand( 1e6, 0 ) }`;
            let id = `droplist-${ classPrefix }-item-${ dataLabel }-${ parentIndex }-${ expandable }-${ checked }`;
            let value = utils.val.isArray( dataValue )
                ? // Object value is a nested array.
                dataToList( dataValue, classPrefix, `${ parentIndex }`, expandable, checked )
                : utils.val.isObject( dataValue )
                    ? // Object value is a nested object
                    dataToList( dataValue, classPrefix, `${ parentIndex }`, expandable, checked )
                    : // Object value is not a nested object; is a scalar.
                    utils.ao.replaceIfInvalid( dataValue.toString(), '-' );
            if (
                expandable &&
                ( utils.val.isObject( dataValue ) || utils.val.isArray( dataValue ) )
            ) {
                return (
                    <li
                        id={ id }
                        key={ id }
                        className={ twMerge(
                            `${ classPrefix }-item !bg-accent`,
                            useBackgroundOverlay && 'overlay-bg'
                        ) }
                    >
                        <div className={ `${ classPrefix }-item-content max-w-full` }>
                            <label
                                htmlFor={ `tab-${ parentIndex }` }
                                name="tab"
                                tabIndex="-1"
                                role="tab"
                                className={ `${ classPrefix }-key !bg-transparent !text-accent-foreground` }>
                                { `${ dataLabel } ${ utils.val.isArray( dataValue )
                                    ? `[${ dataValue.length }]`
                                    : utils.val.isObject( dataValue )
                                        ? `{${ Object.keys( dataValue ).length }}`
                                        : ``
                                    }` }
                            </label>
                            <input
                                type="checkbox"
                                defaultChecked={ `${ checked ? "checked" : "" }` }
                                className="tab"
                                id={ `tab-${ parentIndex }` }
                                tabIndex={ `${ parentIndex }` }
                            />
                            <span className="open-close-icon self-center">
                                { checked ? <Minus className="fas fa-minus-icon p-0 m-0 text-accent-foreground" /> : <Plus className="fas fa-plus-icon p-0 m-0 text-accent-foreground" /> }
                            </span>
                            <div className={ `${ classPrefix }-content` }>{ value }</div>
                        </div>
                    </li>
                );
            } else {
                return (
                    <li
                        id={ id }
                        key={ id }
                        className={ twMerge(
                            `${ classPrefix }-item !bg-background`,
                            useBackgroundOverlay && 'overlay-bg'
                        ) }
                    >
                        <div className={ `${ classPrefix }-key !text-foreground` }>{ dataLabel }: </div>
                        <div className={ `${ classPrefix }-value !text-foreground` }>{ value }</div>
                    </li>
                );
            }
        },
        [ dataToList ]
    );

    const buildDropListOptions = useCallback( () => {
        let options = [];
        options.push(
            <Button.Controls
                show={ true }
                showLabels={ false }
                controls={ controls }
            />
        );
        return options;
    }, [ controls ] );

    const buildDropList = ( input ) => {
        return dataToList(
            input,
            `data-list`,
            0,
            showExpandable,
            false,
        );
    };

    /* 
        const buildDropList = useCallback(
            ( input ) => {
                return dataToList(
                    input,
                    `data-list`,
                    0,
                    showExpandable,
                );
            },
            [ renderData ]
        );
     */
    return (
        <>
            {
                // utils.val.isValidArray( renderData, true ) && (
                // utils.val.isValidArray( renderData, true ) ||
                // utils.val.isObject( renderData ) ) && (
                <div
                    key={ `data-drop-list-${ utils.rand.rand( 1e6, 0 ) }` }
                    className={ `data-list-container overflow-y-auto overflow-x-auto !bg-background` }
                    // style={ componentStyles }
                >
                    <div className={ `flex flex-col w-full justify-stretch items-center border` }>
                        { label && (
                            <h4 className={ `font-bold text-xl p-1 gap-2 w-full justify-stretch items-center` }>{ label }</h4>
                        ) }
                        { showControls && buildDropListOptions() }
                    </div>
                    <div className={ `data-list ${ showCompact ? "data-list-compact" : "" } ${ collapsed ? 'data-list-collapsed' : '' } ` }>{ buildDropList( renderData ) }</div>
                </div>
            }
        </>
    );
}

export default Droplist;
