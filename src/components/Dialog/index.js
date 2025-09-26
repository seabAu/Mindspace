import React, { useEffect, useRef } from "react";
import * as utils from 'akashatools';
import "./Dialog.css";
import { FaTimes } from "react-icons/fa";
import { MdOutlinePushPin } from "react-icons/md";

import Button from "../Button/index.js";
import { useState } from "react";

function Dialog ( props ) {
    const {
        // Child components passed inside this component's element.
        id = "",
        children,
        open = false,
        onFinish,
        onCancel,
        title = "",
        controls = [],
        motionEnabled = true,
        motion = "fade", // ZOOM | FADE 
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        showHeader = true,
        showFooter = true,
        footer,
        type = "default",
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

    const [ isOpen, setIsOpen ] = useState( false );
    const [ isPinned, setIsPinned ] = useState( false );
    const [ disabled, setDisabled ] = useState( true );
    const [ active, setActive ] = useState( false );
    if ( debug ) console.log( "Dialog.js :: props = ", props );
    useEffect( () => {
        if ( debug ) console.log( "Dialog.JS :: Props = ", props, " :: open is now: ", open );
        setActive( open ? open === true : false );
    }, [ open ] );

    useEffect( () => {
        if ( debug ) console.log( "Dialog.JS :: Props = ", props, " :: active is now: ", active );
    }, [ active ] );

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

    const getMotion = ( input ) => {
        switch ( input ) {
            case `zoom`:
                return "text-9xl";
            case `fade`:
                return "text-8xl";
            default:
                return "";
        }
    };

    const buildModal = ( mode ) => {
        if ( debug ) console.log( "buildModal triggered!" );
        return ( `` );
    };

    const onPin = ( e ) => {
        if ( debug ) console.log( "Dialog.js :: Modal :: isPinned is now: ", isPinned === true ? false : true );
        setIsPinned( isPinned === true ? false : true );
    };

    return (
        show && (
            <div className={ `modal-root` }>
                <div className={ `modal-mask` } onClick={ () => { setActive( false ); } }></div>
                <div
                    className={ `modal-container ${ !active ? `modal-hidden` : `` } ${ motionEnabled
                            ? motion === `fade`
                                ? `${ `modal-fade` }`
                                : //? `${active ? `modal-fade-enter` : `modal-fade-leave`}`
                                motion === `zoom`
                                    ? // ? `${active ? `modal-zoom-enter` : `modal-zoom-leave`}`
                                    `${ `modal-zoom` }`
                                    : motion === `slide`
                                        ? // ? `${active ? `modal-zoom-enter` : `modal-zoom-leave`}`
                                        `${ `modal-slide` }`
                                        : ``
                            : ``
                        }` }
                    // onMouseOver={
                    //     () =>
                    //     {
                    //         if (disabled) {
                    //             setDisabled(false);
                    //         }
                    //     }
                    // }
                    // onMouseOut={() => {
                    //     setDisabled(true);
                    // }}
                    // fix eslintjsx-a11y/mouse-events-have-key-events
                    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                    onFocus={ ( e ) => {
                        if ( debug ) console.log( `Dialog.js :: onFocus :: e = `, e );
                    } }
                    onBlur={ ( e ) => {
                        if ( debug ) console.log( `Dialog.js :: onBlur :: e = `, e );
                        // onCancel();
                    } }
                    onClick={ ( e ) => {
                        // console.log(`Dialog.js :: onClick :: e = `, e, " :: e.target = ", e.target, " :: e.target.classList = ", e.target.classList);
                        // if (e.target.toString().includes(`modal-container`)) {
                        let classes = e.target.classList;
                        if ( classes.contains( `modal-container` ) ) {
                            onCancel();
                        }
                        // setActive( false );
                        // onCancel();
                    } }>
                    <div className={ `modal` }>
                        { active ? (
                            <div
                                className={ `modal-content modal-dark` }
                                style={ componentStyles }
                                id={ id === `` ? `modal-${ Math.random() * 100 }` : `modal-${ id }` }
                                key={ id === `` ? `modal-${ Math.random() * 100 }` : `modal-${ id }` }>
                                <div className={ `modal-menu` }>
                                    <Button
                                        icon={ <MdOutlinePushPin className="modal-close-x modal-menu-icon" /> }
                                        classes={ `modal-menu-button modal-pin-button` }
                                        overrideStyles={ true }
                                        //label={}
                                        onClick={ ( e ) => {
                                            // setActive(false);
                                            onPin( e );
                                        } }
                                    // </div>onClick={onFinish ? onFinish : (e) => {}}
                                    />
                                    <Button
                                        icon={ <FaTimes className="modal-close-x modal-menu-icon" /> }
                                        classes={ `modal-menu-button modal-close-button` }
                                        overrideStyles={ true }
                                        //label={}
                                        onClick={ ( e ) => {
                                            // setActive(false);
                                            onCancel();
                                        } }
                                    // </div>onClick={onFinish ? onFinish : (e) => {}}
                                    />
                                </div>

                                { showHeader && title !== "" && <Dialog.Header title={ title }></Dialog.Header> }
                                <Dialog.Body>{ children && ( utils.val.isValidArray( children, true ) || utils.val.isValid( children ) ) && children }</Dialog.Body>
                                { showFooter && controls.length > 0 ? (
                                    <Dialog.Footer controls={ controls }></Dialog.Footer>
                                ) : (
                                    showFooter && footer && <Dialog.Footer>{ footer }</Dialog.Footer>
                                ) }
                            </div>
                        ) : (
                            <></>
                        ) }
                    </div>
                </div>
            </div>
        )
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
            className={ `modal-header` }
            style={ componentStyles }>
            <div className={ `modal-title` }>{ title }</div>
            { showChildren && children && children !== false && children }
        </div>
    );
}

Dialog.Header = Header;

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
            className={ `modal-body` }
            style={ componentStyles }>
            { showChildren && children && children !== false && children }
        </div>
    );
}

Dialog.Body = Body;

function Footer ( props ) {
    const {
        // Child components passed inside this component's element.
        children,
        // Render overrides, if ever needed.
        show = true,
        showChildren = true,
        // Content properties.
        controls = [],
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
            className={ `modal-footer` }
            style={ componentStyles }>
            { showChildren && children && children !== false && children }
            { controls && utils.val.isValidArray( controls, true ) && (
                <Button.Controls
                    show={ true }
                    controls={ controls }
                />
            ) }
        </div>
    );
}

Dialog.Footer = Footer;

export default Dialog;
