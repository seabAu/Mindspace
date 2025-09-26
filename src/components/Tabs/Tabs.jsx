import React, { Children, Component, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as utils from 'akashatools';
import './tabs.css';

const Tabs = ( props ) => {
    const {
        children,
        items = [],
        navPosition = 'top',
        defaultActiveIndex = 0,
        activeIndex,

        // Container style options.
        padding = `0.5rem 1.0rem`,
        opacity = `1.0`,
        filter = 'none',
        backFilter = 'none',
        glassmorphic = false,
        boxShadow = '0px 0px 6px 1px #00000077',

        // Content-area style options.
        overflowLock = false,
        centered = true,
        padContent = true,
        contentPadding = `0.0`,
        fillArea = true,

        // Menu-area style options.
        roundedNav = false,
        contentBoxShadow = true,
        navBoxShadow = true,

        // Global styling.
        classes = '',
        containerClasses = '',
        childClasses = '',
        styles = {},
        navStyles = {},
        contentStyles = {},
        debug = false,
    } = props;

    const itemsToTabs = ( input ) => {
        let tabitems = [];
        if ( utils.val.isValidArray( input, true ) ) {
            input.forEach( ( item, index ) => {
                // if (debug) console.log("itemsToTabs :: ", item, item.label, item.children);
                if ( utils.ao.has( item, 'label' ) && utils.ao.has( item, 'children' ) ) {
                    if ( item.hasOwnProperty( 'enabled' ) ) {
                        if ( item.enabled === true ) {
                            tabitems.push(
                                <div
                                    className='tabs-item'
                                    label={ item.label }
                                    id={ `tab-${ index }-${ item.label }` }
                                    key={ utils.ao.has( item, 'key' ) ? item.key : index }>
                                    { item.children }
                                </div>
                            );
                        }
                    }
                }
                return '';
            } );
        }
        return tabitems;
    };

    const [ tabChildren, setTabChildren ] = React.useState(
        children ? children : utils.val.isValidArray( items, true ) ? itemsToTabs( items ) : []
    );
    const [ activeTabIndex, setActiveTabIndex ] = React.useState( 0 );

    const onClickSetActiveTab = ( index ) => {
        setActiveTabIndex( index );
    };
    // const tabContents = Children.toArray( children );
    // console.log("TABS :: props = ", props);

    useEffect( () => {
        // On mount, check if we're using an items array or child components.
        if ( items ) {
            if ( utils.val.isValidArray( items, true ) ) {
                let components = itemsToTabs( items );
                if ( debug )
                    console.log(
                        'Tabs.js :: items provided :: items = ',
                        items,
                        ' :: itemsToTabs( items ) = ',
                        itemsToTabs( items )
                    );
                setTabChildren( components );
            }
        }
    }, [] );

    useEffect( () => {
        if ( children ) {
            if ( children.length > 0 ) {
                if ( activeTabIndex >= children.length - 1 ) {
                    // console.log("TABS :: activeTabIndex = ", activeTabIndex, " children.length = ", children.length);
                    setActiveTabIndex( children.length - 1 );
                }
            }
        }
    }, [ children ] );

    const tabContainerStyles = {
        // height: `${centered ? "100%" : "auto"}`,
        width: `${ centered ? '100%' : 'auto' }`,
        minHeight: `${ fillArea ? '100% !important' : 'auto' }`,
        height: `${ fillArea ? '100% !important' : 'auto' }`,
        padding: `${ padding ? padding : '0.25rem 0.25rem' }`,
        // display: "flex",
        // justifyContent: "space-around",
        // alignItems: "center",
        // flexDirection: "row",
        // alignContent: "center",
        // height: height,
        // width: `${width > 100 ? 100 : width}%`,
        // backgroundColor: fillercolor,
        // borderRadius: borderRadius,
        // padding: `${padding}px`,
        // margin: `${margin}`,
        overflow: `${ `hidden` }`,
    };

    return (
        <div
            style={ tabContainerStyles }
            className={ `tabs-container ${ classes ? classes : '' } ${ navPosition === 'top' ? 'tabs-top' : navPosition === 'left' ? 'tabs-left' : ''
                } ${ fillArea ? 'fill-area' : '' }
            ${ glassmorphic ? 'tab-glassmorphic' : '' }` }
            id={ `tabs-container` }>
            <Tabs.Menu
                activeTabIndex={ activeTabIndex }
                defaultActiveIndex={ defaultActiveIndex }
                tabNavOnClick={ onClickSetActiveTab }
                // style={tabNavListStyles}
                // id={utils.ao.has(tab.props, "id") ? tab.props.id : utils.ao.has(tab.props, "label") ? tab.props.label : ""} // {id === "" ? "" : id}
                // key={utils.ao.has(tab.props, "id") ? tab.props.id : utils.ao.has(tab.props, "label") ? tab.props.label : ""}
                rounded={ roundedNav }
                navBoxShadow={ navBoxShadow }>
                { tabChildren && tabChildren }
            </Tabs.Menu>
            <Tabs.Content
                // styles={tabContentStyles}
                padContent={ padContent }
                contentPadding={ contentPadding }
                activeTabIndex={ activeTabIndex }
                defaultActiveIndex={ defaultActiveIndex }
                contentBoxShadow={ contentBoxShadow }>
                {
                    // (children)
                    tabChildren && tabChildren
                }
            </Tabs.Content>
        </div>
    );
};

function Menu ( props ) {
    // This builds the full list of tab navigation links.
    const {
        children,
        activeTabIndex,
        defaultActiveIndex = 0,
        setActiveTabIndex,
        tabNavOnClick = ( index ) => { },
        id,
        rounded = false,

        // Menu-area style options.
        roundedNav = false,
        navBoxShadow = false,
        styles = {},
        navStyles = {},
        contentStyles = {},
    } = props;
    // console.log("Input.Field :: {Props} = ", props);

    const tabNavListStyles = {
        // padding: `${spinnerPadding}px`,
        // textAlign: "right",
        // transition: "width 1s ease-in-out",
        // display: "flex",
        // justifyContent: "flex-end",
        // alignItems: "center",
        // top: "50%",
        // left: "50%",
        // margin: "-25px 0 0 -25px",
        // width: "50px",
        // height: "50px",
        overflow: `${ `hidden` }`,
    };

    const buildTabNav = ( tab, index ) => {
        // This assumes the tab has already been validated.
        if ( tab ) {
            return (
                <Tabs.Nav
                    tabIndex={ index }
                    activeTabIndex={ activeTabIndex }
                    label={ utils.ao.has( tab.props, 'label' ) ? tab.props.label : '' } // {label ?? ' '}
                    sublabel={ utils.ao.has( tab.props, 'sublabel' ) ? tab.props.sublabel : '' }
                    onClick={ tabNavOnClick }
                    id={
                        utils.ao.has( tab.props, 'id' )
                            ? tab.props.id
                            : utils.ao.has( tab.props, 'label' )
                                ? tab.props.label
                                : ''
                    } // {id === "" ? "" : id}
                    key={
                        utils.ao.has( tab.props, 'id' )
                            ? tab.props.id
                            : utils.ao.has( tab.props, 'label' )
                                ? tab.props.label
                                : ''
                    }
                    rounded={ roundedNav }
                    navBoxShadow={ navBoxShadow }
                />
            );
        } else {
            return (
                <Tabs.Nav
                    tabIndex={ 0 }
                    defaultActiveIndex={ defaultActiveIndex ?? 0 }
                    activeTabIndex={ activeTabIndex }
                    label={ '' }
                    onClick={ tabNavOnClick }
                    id={ `blank-tab-nav-${ Math.random() * 100 }` }
                    key={ `blank-tab-nav-${ Math.random() * 100 }` }
                    rounded={ roundedNav }
                    navBoxShadow={ navBoxShadow }
                />
            );
        }
    };

    const buildTabMenu = ( input ) => {
        if ( input ) {
            if ( typeof input === 'object' && !Array.isArray( input ) ) {
                input = [ input ];
            }
            if ( utils.val.isValidArray( input, true ) ) {
                return input.map( ( tab, index ) => {
                    if ( tab ) {
                        if ( utils.ao.has( tab, 'props' ) ) {
                            return utils.ao.has( tab.props, 'enabled' )
                                ? tab.props.enabled
                                    ? buildTabNav( tab, index )
                                    : ''
                                : buildTabNav( tab, index );
                        }
                    }
                    return <></>;
                } );
            }
        }
        return buildTabNav( {}, 0 );
    };

    return (
        <div
            className={ `tabs-nav-list` }
            style={ tabNavListStyles }>
            { buildTabMenu( children ) }
        </div>
    );
    // return (
    //     <div className="input-field">
    //         {children && children !== false && children}
    //     </div>
    // );
}

Tabs.Menu = Menu;

function Nav ( props ) {
    const {
        // children,
        tabIndex,
        activeTabIndex,
        id,
        label,
        sublabel,
        onClick,
        rounded = false,
        navBoxShadow = false,
    } = props;
    // console.log("Input.Field :: {Props} = ", props);

    const tabNavItemStyles = {
        // borderRadius: `${rounded ? "8px" : "0px"}`,
        boxShadow: `${ navBoxShadow ? '0 0 5px black' : 'none' }`,
        // padding: `${spinnerPadding}px`,
        // textAlign: "right",
        // transition: "width 1s ease-in-out",
        // display: "flex",
        // justifyContent: "flex-end",
        // alignItems: "center",
        // top: "50%",
        // left: "50%",
        // margin: "-25px 0 0 -25px",
        // width: "50px",
        // height: "50px",
    };

    return (
        <div
            style={ tabNavItemStyles }
            className={ `tab-nav-item ${ activeTabIndex === tabIndex ? 'tab-active' : '' } ${ rounded ? 'tab-nav-rounded' : ''
                }` }
            onClick={ ( event ) => {
                onClick( tabIndex );
            } }
            id={ id === '' ? '' : id }
            key={ id === '' ? '' : id }>
            { label && label !== undefined && label !== null && (
                <div className='tab-nav-item-label'>{ label ? label : '-' }</div>
            ) }
            { sublabel && sublabel !== undefined && sublabel !== null && (
                <div className='tab-nav-item-sublabel'>{ sublabel ? sublabel : '-' }</div>
            ) }
        </div>
    );
    // return (
    //     <div className="input-field">
    //         {children && children !== false && children}
    //     </div>
    // );
}

Tabs.Nav = Nav;

function Content ( props ) {
    const {
        children,
        show = true,
        showChildren = true,
        // Content settings.
        defaultActiveIndex,
        activeTabIndex,
        // Content-area style settings.
        overflowLock = false,
        centered = true,
        padContent = true,
        contentPadding = `0.5rem 1.0rem`,
        fillArea = true,
        contentBoxShadow = true,
        boxShadow = '0px 0px 6px 1px #00000077',
        // Can import extra styles.
        styles = {},
        debug = false,
    } = props;

    const tabContentStyles = {
        // gap: `${padContent ? padding : "0rem"}`,
        // boxShadow: `${contentBoxShadow ? boxShadow : "none"}`,
        minHeight: `${ fillArea ? '100% !important' : 'auto' }`,
        height: `${ fillArea ? '100% !important' : 'auto' }`,
        padding: `${ padContent ? contentPadding : '0.0rem 0.0rem' }`,
        overflow: `${ overflowLock ? 'hidden' : 'auto' }`,
        // filter: `blur(0.4rem)`,
        // backdropFilter: `blur(100%)`,
        // opacity: `0.7`,
    };

    const getTabContentQuickRender = ( input ) => {
        // This version creates the content for all tabs and hides the ones that aren't currently active.
        if ( input ) {
            if ( debug ) console.log( 'getTabContent :: input = ', input, typeof input, Array.isArray( input ) );
            if ( typeof input === 'object' && !Array.isArray( input ) ) {
                input = [ input ];
            }
            if ( utils.val.isValidArray( input, true ) ) {
                return input.map( ( tab, index ) => {
                    if ( tab ) {
                        if ( utils.ao.has( tab, 'props' ) ) {
                            if ( utils.ao.has( tab.props, 'children' ) ) {
                                // return tab.props.children;
                                return (
                                    <div
                                        style={ tabContentStyles }
                                        className={ `tab-content ${ padContent ? 'tab-content-padded' : '' } ${ index !== activeTabIndex ? 'tab-content-hidden' : ''
                                            }` }>
                                        { tab.props.children }
                                    </div>
                                );
                            }
                        }
                    }
                    return '';
                } );
            }
        }
    };

    const getTabContent = ( input ) => {
        // This version only renders the content for the currently active tab index.
        if ( input ) {
            // console.log(
            //     "getTabContent :: input = ",
            //     input,
            //     typeof input,
            //     Array.isArray(input),
            // );
            if ( typeof input === 'object' && !Array.isArray( input ) ) {
                input = [ input ];
            }
            if ( utils.val.isValidArray( input, true ) ) {
                return input.map( ( tab, index ) => {
                    if ( tab ) {
                        if ( index !== activeTabIndex ) {
                            return undefined;
                        } else {
                            if ( utils.ao.has( tab, 'props' ) ) {
                                if ( utils.ao.has( tab.props, 'children' ) ) {
                                    if ( utils.ao.has( tab.props, 'enabled' ) ) {
                                        if ( tab.props.enabled ) {
                                            return tab.props.children;
                                        }
                                    } else {
                                        // DEVNOTE ::
                                        //      Assume enabled by default, even if the property isn't provided.
                                        //      I'll iron out this messy way of handling tabs and their children and properties later when I convert it into a compound component later in development.
                                        return tab.props.children;
                                    }
                                }
                            }
                            return undefined;
                        }
                    } else {
                        return '';
                    }
                } );
            }
        }
    };

    // console.log("Tabs.Content :: {Props} = ", props);
    return (
        <div className={ `tab-content-container ${ contentBoxShadow ? `tab-content-container-shadow` : `` }` }>
            <div
                style={ tabContentStyles }
                className={ `tab-content ${ padContent ? 'tab-content-padded' : '' } ` }>
                { getTabContent( children ) }
            </div>
        </div>
    );
}
Tabs.Content = Content;

export default Tabs;
