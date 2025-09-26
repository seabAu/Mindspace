import React, { useState, useEffect, useRef, Children, Component } from "react";
import * as utils from 'akashatools';
import * as data from './../../utilities/Data.js';
// import "./CardGrid.css";
import "./Card.css";
import Button from "../Button/index.js";
import Input from "../Form/Input.js";
import Section from "../Section/index.js";
import { BsFillGrid1X2Fill } from "react-icons/bs";
import {
    FaTh,
    FaThList,
    FaThLarge,
    FaWindowMaximize,
    FaWindowMinimize,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
} from "react-icons/fa";
import Tags from "../Tags/index.js";
function Card ( props ) {
    const {
        // Child components passed inside this component's element.
        id = "",
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        showExpanded = true,
        type = "default",
        // Style settings.
        margin,
        padding,
        // padContent,
        height,
        width,
        // Can import extra styles.
        classes = "text-highlightColor",
        styles = {},
        debug = false,
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.
        // display: `${"flex"}`,
        // flexDirection: `${"row"}`,
        // justifyContent: `${"flex-start"}`,
        // alignItems: `${"flex-start"}`,
        // alignContent: `${"flex-start"}`,
        /// verticalAlign: `top`,
        /// textAlign: `left`,
        // height: `100%`,
        // width: `100%`,
        // border: `1px solid white`,
        // padding: padding ? padding : '0px',


        ...( padding
            ? {
                padding: `${ padding }`,
            }
            : {} ),
        ...styles,
        // Responsiveness overrides go here.
    };

    return (
        <div
            className={ `card ${ ``
                // showExpanded ? `card-full` : `card-summary`
                } ${ classes ? classes : "" }` }
            style={ componentStyles }
            id={ id === `` ? `grid-card-item-${ Math.floor( Math.random() * 100000 ) }` : `grid-card-item-${ id }` }
            key={ id === `` ? `grid-card-item-${ Math.floor( Math.random() * 100000 ) }` : `grid-card-item-${ id }` }>
            { children && ( utils.val.isValidArray( children, true ) || utils.val.isValid( children ) ) && children }
        </div>
    );
}

function Header ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        title = "",
        // Style settings.
        margin,
        padding,
        height,
        width,
        borderBottom = true,
        // Can import extra styles.
        classes = "text-highlightColor",
        titleClasses,
        styles = {},
        debug = false,
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.
        // display: `${"flex"}`,
        // flexDirection: `${"row"}`,
        // justifyContent: `${"flex-start"}`,
        // alignItems: `${"flex-start"}`,
        // alignContent: `${"flex-start"}`,
        /// verticalAlign: `top`,
        /// textAlign: `left`,
        // height: `100%`,
        // width: `100%`,
        // border: `1px solid white`,
        ...styles,
        // Responsiveness overrides go here.
    };

    return (
        <div
            className={ `card-header ${ borderBottom ? 'card-header-underlined' : '' }` }
            style={ componentStyles }>
            { title &&
                <Section.Text
                    classes="text-xl font-bold px-4"
                    type="text"
                    content={ title }></Section.Text> }
            { showChildren && children && children !== false && children }
        </div>
    );
}

Card.Header = Header;

function Body ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        // Style settings.
        margin,
        padding,
        height,
        width,
        // Can import extra styles.
        classes = "text-highlightColor",
        styles = {},
        debug = false,
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.
        // display: `${"flex"}`,
        // flexDirection: `${"row"}`,
        // justifyContent: `${"flex-start"}`,
        // alignItems: `${"flex-start"}`,
        // alignContent: `${"flex-start"}`,
        /// verticalAlign: `top`,
        /// textAlign: `left`,
        // height: `100%`,
        // width: `100%`,
        // border: `1px solid white`,
        ...styles,
        // Responsiveness overrides go here.
    };

    return (
        <div
            className={ `card-body` }
            style={ componentStyles }>
            { showChildren && children && children !== false && children }
        </div>
    );
}

Card.Body = Body;

function Footer ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        // Style settings.
        margin,
        padding,
        height,
        width,
        // Can import extra styles.
        classes = "text-highlightColor",
        styles = {},
        debug = false,
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.
        // display: `${"flex"}`,
        // flexDirection: `${"row"}`,
        // justifyContent: `${"flex-start"}`,
        // alignItems: `${"flex-start"}`,
        // alignContent: `${"flex-start"}`,
        /// verticalAlign: `top`,
        /// textAlign: `left`,
        // height: `100%`,
        // width: `100%`,
        // border: `1px solid white`,
        ...styles,
        // Responsiveness overrides go here.
    };

    return (
        <div
            className={ `card-footer` }
            style={ componentStyles }>
            { showChildren && children && children !== false && children }
        </div>
    );
}

Card.Footer = Footer;

function Frame ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        src,
        title = "",
        // Style settings.
        loading = "",
        margin,
        padding,
        height,
        width,
        // Can import extra styles.
        classes = "text-highlightColor",
        styles = {},
        debug = false,
    } = props;

    const componentStyles = {
        // Default styles go here.
        // User-set styles override default settings.
        // display: `${"flex"}`,
        // flexDirection: `${"row"}`,
        // justifyContent: `${"flex-start"}`,
        // alignItems: `${"flex-start"}`,
        // alignContent: `${"flex-start"}`,
        /// verticalAlign: `top`,
        /// textAlign: `left`,
        // height: `${height}`,
        // width: `${width}`,
        // border: `1px solid white`,
        ...styles,
        // Responsiveness overrides go here.
    };

    // console.log(`Card.Frame.js :: props = `, props);
    return (
        <div
            className={ `iframe-container` }
            style={ componentStyles }>
            { src && src !== "" && (
                <iframe
                    src={ src }
                    title={ title }
                    style={ componentStyles }
                    height={ `${ height }` }
                    width={ `${ width }` }
                    frameBorder="0"
                    scrolling="no"
                    loading={ `${ loading }` }
                    allowtransparency="true"
                    allowFullScreen={ true }></iframe>
            ) }
        </div>
    );
}

Card.Frame = Frame;

/* 
            {children && (utils.val.isValidArray(children, true) || utils.val.isValid(children)) && children}
*/
function Grid ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        headerItems = [],
        footerItems = [],
        gridControls = [], // Functionality to apply to the card collection as a whole.
        elementControls = [], // Functionality to apply to each card in the grid.
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        enableControls = false,
        // We can pass in a JSON object as data to dynamically build the cards instead.
        data,
        layout = "grid", // GRID | FLEX | LIST
        title = "",
        // Grid layout settings.
        gridRows,
        gridRowHeight = `auto`,
        gridCols,
        gridColWidth = `1fr`,
        gridGap = `1.0`,
        // Style settings.
        margin = "0.0rem",
        padding = "0.0rem",
        height = "100%",
        width = "100%",
        itemHeight,
        itemWidth,
        // Can import extra styles.
        classes = "text-highlightColor",
        styles = {},
        debug = false,
    } = props;

    const [ gridItems, setGridItems ] = useState( null );

    const expandTypeRef = useRef( -1 );
    const activeIndexRef = useRef( -1 );
    const [ activeIndex, setActiveIndex ] = useState( activeIndexRef.current ? activeIndexRef.current : 0 );
    const [ gridLayout, setGridLayout ] = useState( layout ); // LIST | GRID | FLEX | MASONRY
    const [ cardExpandType, setCardExpandType ] = useState( `fill` ); // FILL | OVERLAY
    const [ pageIndex, setPageIndex ] = useState( 0 );
    const [ pageLength, setPageLength ] = useState( 10 );
    const [ cardWidth, setCardWidth ] = useState( `20` );
    const [ cardHeight, setCardHeight ] = useState( `50` );

    const onClickSetActive = ( index = -1 ) => {
        setActiveIndex( index === activeIndex ? -1 : index );
        activeIndexRef.current = index === activeIndex ? -1 : index;
        if ( debug ) console.log( "Posts.js :: onClickSetActive. index = ", index, " :: activeIndexRef.current = ", activeIndexRef.current );
    };
    // Tracking the window size.
    const [ screenWidth, setScreenWidth ] = useState( window.innerWidth );
    const [ screenHeight, setScreenHeight ] = useState( window.innerHeight );
    const updateDimensions = () => {
        setScreenWidth( window.innerWidth );
        setScreenHeight( window.innerHeight );
    };
    const controls = [
        {
            name: "displayList",
            label: "List",
            icon: <FaThList />,
            classes: `${ gridLayout === `list` ? `active` : `` }`,
            onClick: ( e ) => {
                setGridLayout( "list" );
            },
        },
        {
            name: "displayGrid",
            label: "Grid",
            icon: <FaTh />,
            classes: `${ gridLayout === `grid` ? `active` : `` }`,
            onClick: ( e ) => {
                setGridLayout( "grid" );
            },
        },
        {
            name: "displayFlex",
            label: "Flex",
            icon: <FaThLarge />, //FaJira
            classes: `${ gridLayout === `flex` ? `active` : `` }`,
            onClick: ( e ) => {
                setGridLayout( "flex" );
            },
        },
        {
            name: "displayMosaic",
            label: "Mosaic",
            icon: <BsFillGrid1X2Fill />, //FaJira
            classes: `${ gridLayout === `mosaic` ? `active` : `` }`,
            onClick: ( e ) => {
                setGridLayout( "mosaic" );
            },
        },
        {
            name: "postExpandBehavior",
            label: `${ cardExpandType === "Fill" ? "Overlay" : "Fill" }`,
            icon: cardExpandType ? <FaWindowMaximize /> : <FaWindowMinimize />,
            classes: ``,
            onClick: ( e ) => {
                setCardExpandType( cardExpandType === "Fill" ? "Overlay" : "Fill" );
            },
        },
    ];

    let controlFields = [
        {
            name: `setcardwidth`,
            label: `x`,
            type: `number`,
            layout: `inline-reverse`,
            inputProps: {
                defaultValue: cardWidth,
            },
            onChange: ( e ) => {
                setCardWidth( utils.math.clamp( parseInt( e.target.value ), 0, 100 ) );
            },
        },
        {
            name: `setcardheight`,
            label: `x`,
            type: `number`,
            layout: `inline-reverse`,
            inputProps: {
                defaultValue: cardHeight,
            },
            onChange: ( e ) => {
                setCardHeight( utils.math.clamp( parseInt( e.target.value ), 0, 100 ) );
            },
        },
        {
            name: `setpagenum`,
            label: `of ${ utils.val.isValidArray( gridItems, true ) ? gridItems.length % parseInt( pageLength !== 0 ? pageLength : 1 ) : "0" }`,
            type: `number`,
            layout: `inline-reverse`,
            inputProps: {
                defaultValue: pageIndex,
                min: 0,
                max: utils.val.isValidArray( gridItems, true ) ? gridItems.length % parseInt( pageLength !== 0 ? pageLength : 1 ) : 0,
            },
            onChange: ( e ) => {
                // setPageIndex(e.target.value);
                changePage( gridItems, pageIndex, pageLength );
            },
        },
        {
            name: `setpagelength`,
            label: ` / page`,
            type: `number`,
            layout: `inline-reverse`,
            inputProps: {
                defaultValue: pageLength,
                min: 0,
                max: utils.val.isValidArray( gridItems, true ) ? gridItems.length : 0,
            },
            onChange: ( e ) => {
                let value = e.target.value;
                if ( value ) {
                    if ( !isNaN( value ) ) {
                        if ( value > 0 && value < 200 ) {
                            setPageLength( +value );
                        }
                    }
                }
                // let numpages = data.length % pageLength;
                // setPageLength(utils.math.clamp(e.target.value, 0, numpages));
            },
        },
    ];

    const gridStyles = {
        display: "grid",
        gridTemplateRows: `auto 1fr auto`,
        gridTemplateColumns: `repeat(auto-fill, minmax(400px, 1fr))`, // `repeat(auto-fit, minmax(150px, 1fr))`,
        gridGap: `${ gridGap }rem`,
        grid: `repeat(auto-fit, 1fr) / auto-flow 1fr`,
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        // flexDirection: "row",
        // alignContent: "center",
        // height: height,
        // width: `${width > 100 ? 100 : width}%`,
        // backgroundColor: fillercolor,
        // borderRadius: borderRadius,
        padding: `${ padding }`,
        margin: `${ margin }`,
        width: `${ height }`,
        height: `${ width }`,
        textAlign: "middle",
        transition: "width 1s ease-in-out",
        // top: "50%",
        // left: "50%",
    };

    const filterStyles = {
        gap: `${ gridGap }`,
        padding: `${ padding ? padding : "0.0rem" }`,
    };

    const cardStyles = {
        // Style overrides for individual cards.
        gap: `${ gridGap }`,
        padding: `${ padding ? padding : "0.0rem" }`,
        ...{
            //  	...(cardWidth !== -1 && enableControls
            //  		? {
            //  				minWidth: `auto`,
            //  				maxWidth: `${cardWidth}rem`,
            //  				// flex: `1 1 ${cardWidth}rem`,
            //  		  }
            //  		: {}),
            // 	...(cardHeight !== -1 && enableControls
            // 		? {
            // 				minHeight: `auto`,
            // 				maxHeight: `${cardHeight}rem`,
            // 		  }
            // 		: {}),
            ...( itemWidth
                ? {
                    flexBasis: `${ itemWidth }`,
                    // flex: `1 1 ${cardWidth}rem`,
                }
                : {} ),
        },
        // height: `${cardWidth}`,
        // width: `${cardHeight}`,
    };

    useEffect( () => {
        window.addEventListener( "resize", updateDimensions );
        return () => window.removeEventListener( "resize", updateDimensions );
    }, [] );

    useEffect( () => {
        expandTypeRef.current = cardExpandType;
        if ( debug ) console.log( "expandTypeRef = ", expandTypeRef.current );
    }, [ cardExpandType ] );

    // useEffect( () =>
    // {
    //     setCardExpandType(cardExpandType === "Fill" ? "Overlay" : "Fill");
    // }, [activeIndexRef]);
    useEffect( () => {
        if ( utils.val.isValidArray( data, true ) && !children ) {
            setGridItems( buildCards( data ) );
        }
        else if ( utils.val.isValidArray( children, true ) ) {
            setGridItems( children );
        } else // if ( utils.val.isValidArray( data, true ) ) 
        {
            // setGridItems(buildCards(data));
        }
    }, [ children, data ] );

    const getPageEntries = ( data, page, numPerPage, filters = [] ) => {
        if ( !data ) {
            return [ { Error: "No data." } ];
        }

        let entries = [];
        let startIndex = page * numPerPage;
        let endIndex = page * numPerPage + numPerPage - 1;
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[ i ] ) {
                if ( i >= startIndex && i <= endIndex ) {
                    entries.push( data[ i ] );
                }
            }
        }
        return entries;
    };

    const changePage = ( data, page, numPerPage ) => {
        // if (debug) console.log( "changePage(): ", pagenum, pageNum );
        if ( data ) {
            if ( utils.val.isValidArray( data, true ) ) {
                let dataLen = data.length;
                const numPages = Math.ceil( dataLen / parseInt( numPerPage ) );
                if ( page >= 0 && page < numPages ) {
                    // if (dataLen > entriesPerPage) {
                    setTimeout( () => {
                        return setPageIndex( parseInt( page ) );
                    }, 10 );
                }
            }
        }
    };

    const buildCards = ( input ) => {
        // Build the display of all the current data in this dataset.

        if ( debug )
            console.log( "CARD.GRID.JS :: buildCards() :: input = ", input );
        return input.map( ( element, elementIndex ) => {
            return (
                <Card
                    classes={ `text-white shadow ${ classes ? classes : "" }` }
                    styles={ cardStyles }
                    key={ `card-grid-item-${ elementIndex }${ element.hasOwnProperty( "title" ) ? `-${ element.title }` : "" }` }
                    id={ `card-grid-item-${ elementIndex }${ element.hasOwnProperty( "title" ) ? `-${ element.title }` : "" }` }>

                    {
                        element.hasOwnProperty( "title" ) || utils.val.isTruthy( title ) ? (

                            <Card.Header>
                                { element.hasOwnProperty( "title" ) ? (
                                    <Section.Text
                                        classes="text-white text-xl font-bold"
                                        type="text"
                                        scale={ `xl` }
                                        content={ utils.str.toCapitalCase( element.title ) }
                                        styles={ {
                                            padding: `0.125rem`,
                                        } }></Section.Text>
                                ) : (
                                    ``
                                ) }
                            </Card.Header>
                        ) : (
                            ''
                        )
                    }
                    <Card.Body>
                        <Section>
                            <Section.Content>
                                <Section.Pane
                                    layout={ `mosaic` }
                                    flexDirection={ "column !important" }
                                    alignContent={ "flex-start" }
                                    justifyContent={ "flex-start" }
                                    classes={ `section-pane-mosaic` }
                                    styles={ {
                                        flexWrap: `${ `wrap` }`,
                                    } }>
                                    { Object.keys( element ).map( ( key, index ) => {
                                        let value = element[ key ];
                                        let type = data.getType( value );
                                        if ( debug )
                                            console.log(
                                                "CARD.GRID.JS :: buildCards()",
                                                "\n :: input = ",
                                                input,
                                                "\n :: element = ",
                                                element,
                                                "\n :: key = ",
                                                key,
                                                "\n :: value = ",
                                                value,
                                                "\n :: value type = ",
                                                type,
                                            );

                                        return value ? (
                                            <Section.Pane
                                                layout={ `row` }
                                                classes="py-2 m-0"
                                                flexDirection={ "column !important" }
                                                alignContent={ "flex-start" }
                                                justifyContent={ "flex-start" }
                                                styles={ {
                                                    flexWrap: `${ `wrap` }`,
                                                } }>
                                                { type === `string` ? (
                                                    <Section.Text
                                                        content={ value.toString() }
                                                        before={ `${ key }: ` }
                                                        scale={ `sm` }
                                                    />
                                                ) : type === `number` ? (
                                                    <Section.Text
                                                        content={ value.toString() }
                                                        before={ `${ key }: ` }
                                                        scale={ `sm` }
                                                    />
                                                ) : type === `boolean` ? (
                                                    <Section.Text
                                                        content={ value.toString() }
                                                        before={ `${ key }: ` }
                                                        scale={ `sm` }
                                                    />
                                                ) : type === `array` ? (
                                                    <Section.List
                                                        datalabel={ key }
                                                        data={ value }
                                                        datakeys={ [] }
                                                        datatype={ "array" }
                                                    />
                                                ) : [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( type ) ? (
                                                    <Tags
                                                        dataLabel={ `${ utils.str.toCapitalCase( key ) }: ` }
                                                        dataLabelSize={ "md" }
                                                        dataList={ utils.ao.arrayToObjArray( value, key ) }
                                                        dataDisplayKey={ key }
                                                        filteringEnabled={ false }
                                                    />
                                                ) : (
                                                    <Section.Text
                                                        content={ value.toString() }
                                                        before={ `${ key }: ` }
                                                        scale={ `sm` }
                                                    />
                                                ) }
                                            </Section.Pane>
                                        ) : (
                                            <> </>
                                        );
                                    } ) }
                                </Section.Pane>
                            </Section.Content>
                        </Section>
                    </Card.Body>
                    <Card.Footer>
                        { elementControls && enableControls && utils.val.isValidArray( elementControls, true ) && (
                            <div className={ `section-nav` }>
                                { elementControls.map( ( action, actionIndex ) => {
                                    return (
                                        <Button
                                            id={ actionIndex }
                                            name={ action.hasOwnProperty( "name" ) ? action.name : "" }
                                            label={ action.hasOwnProperty( "name" ) ? action.name : "" }
                                            icon={ action.hasOwnProperty( "icon" ) ? action.icon : "" }
                                            type={ action.hasOwnProperty( "type" ) ? action.type : "" }
                                            classes={ action.hasOwnProperty( "classes" ) ? action.classes : "" }
                                            onClick={
                                                action.hasOwnProperty( "onClick" )
                                                    ? ( e ) => {
                                                        if ( debug )
                                                            console.log(
                                                                "CARD.GRID.JS :: BuildGrid() :: controls onclick triggered :: element = ",
                                                                element,
                                                                " :: action = ",
                                                                action,
                                                            );
                                                        action.onClick( element, elementIndex );
                                                    }
                                                    : ( e ) => { }
                                            }
                                        />
                                    );
                                } ) }
                            </div>
                        ) }
                    </Card.Footer>
                </Card>
            );
        } );
    };

    const getPageButtons = ( dataLen, page, numPerPage, parentID ) => {
        // if (debug) console.log("getPageButtons(): ", dataLen, page, numPerPage);
        let buttons = [];
        const numButtons = Math.ceil( dataLen / numPerPage );
        buttons.push(
            <li
                className=""
                id={ `table-${ parentID }-pagination-container-back` }
                key={ `table-${ parentID }-pagination-container-back` }>
                <button
                    className={ `pagination-button` }
                    onClick={ () => {
                        changePage( dataLen, +page - 1, numPerPage );
                    } }>
                    <FaAngleDoubleLeft />
                </button>
            </li>,
        );
        for ( let i = 0; i < numButtons; i++ ) {
            // if ( i - page < page - 3 || i + page > page + 3 ) {
            if ( Math.abs( i - page ) < 3 || i === 0 || i === numButtons - 1 ) {
                buttons.push(
                    <li
                        className=""
                        id={ `table-${ parentID }-pagination-container-${ i }` }
                        key={ `table-${ parentID }-pagination-container-${ i }` }>
                        <button
                            className={ `pagination-button ${ i === page ? "current-page-button" : "" }` }
                            onClick={ ( event ) => {
                                changePage(
                                    dataLen,
                                    i, // event.target.innerText,
                                    numPerPage,
                                );
                            } }>
                            { i }
                        </button>
                    </li>,
                );
            }
        }
        buttons.push(
            <li
                className=""
                id={ `table-${ parentID }-pagination-container-next` }
                key={ `table-${ parentID }-pagination-container-next` }>
                <button
                    className={ `pagination-button` }
                    onClick={ () => {
                        changePage( dataLen, +page + 1, numPerPage );
                    } }>
                    <FaAngleDoubleRight />
                </button>
            </li>,
        );
        return <ul className="cards-pagination">{ buttons }</ul>;
    };

    const buildContainerPagination = ( input, index, length ) => {
        let numEntries = input.length;
        if ( utils.val.isValidArray( input, true ) ) {
            let buttons = getPageButtons( numEntries, index, length, `cards-grid-${ title }` );
            if ( debug ) console.log( "Pagination :: buttons = ", buttons );
            return (
                <div className="cards-pagination-container">
                    {
                        // <ul className="cards-pagination">{ [ getPageButtons( numEntries, index, length, `cards-grid-${ title }` ) ] }</ul>
                        getPageButtons( numEntries, index, length, `cards-grid-${ title }` )
                    }
                    <p className={ `cards-pagination-info` }>
                        { `Viewing ${ index * length } to ${ index * length + length - 1 > numEntries ? numEntries : index * length + length - 1 } of ${ numEntries } entries found.` }
                    </p>
                </div>
            );
        }
    };

    const buildCollection = ( input ) => {
        let collection = [];
        if ( enableControls ) {
            collection.push(
                <div
                    className={ `cards-controls` }
                    style={ {} }>
                    <Button.Controls
                        show={ true }
                        controls={ controls }
                    />
                    <Input.Group
                        model={ controlFields }
                        groupLayout="inline"
                        fieldLayout="inline"
                    />
                    {
                        // buildFieldsFor(controlFields)
                    }
                </div>,
            );

            collection.push(
                <div
                    className={ `cards-options cards-options-container` }
                    style={ {} }></div>,
            );
            if ( input ) {
                if ( utils.val.isValidArray( input, true ) ) {
                    collection.push( buildContainerPagination( input, pageIndex, pageLength ) );
                }
            }
        }
        collection.push(
            <div
                className={ `cards-filters-container` }
                style={ filterStyles }></div>,
        );
        collection.push(
            <div
                className={ `cards-content-container` }
            // style={
            //     gridLayout === "grid"
            //         ? { ...contentStyles, ...gridStyles }
            //         : gridLayout === "flex"
            //         ? { ...contentStyles, ...flexGridStyles }
            //         : contentStyles
            // }
            >
                {
                    // !utils.val.isValidArray(posts, true) && children && children !== false && children
                }
                { utils.val.isValidArray( input, true ) && input }
            </div>,
        );
        return collection;
    };

    // Else proceed like normal.
    return (
        <div
            className={ `cards-container cards-${ gridLayout === "grid"
                ? ( gridLayout )
                : (
                    gridLayout === "flex"
                        ? gridLayout
                        : ( gridLayout === "mosaic"
                            ? gridLayout
                            : ( gridLayout === "list"
                                ? gridLayout
                                : 'list'
                            )
                        )
                )
                }` }
            style={
                {}
                // gridStyles
            }>
            {
                utils.val.isValidArray( gridItems, true ) && buildCollection(
                    getPageEntries(
                        gridItems,
                        pageIndex,
                        pageLength,
                        []
                    )
                )
            }
        </div>
    );
}

Card.Grid = Grid;

export default Card;
