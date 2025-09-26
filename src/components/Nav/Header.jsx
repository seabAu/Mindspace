import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../Button/index.jsx";
import "./nav.css";
import "./header.css";
import * as utils from 'akashatools';
import Avatar from "../Avatar/Avatar.js";
import Icon from "../Icon/index.jsx";
import { buildNav } from "@/lib/utilities/nav.js";
import { HEADER_TRIGGER_DROPDOWN_WIDTH_LG } from "@/lib/config/constants.js";
// import { buildNav } from "./Nav.jsx";

function Header ( props ) {
    const {
        enabled = true,
        nav = [],
        layout = 'column',
    } = props;

    // const HEADER_TRIGGER_DROPDOWN_WIDTH = 1024;
    // const HEADER_TRIGGER_DROPDOWN_WIDTH = 896;
    const [ showDropdown, setShowDropdown ] = useState( false );
    const showDropdownRef = useRef( false );
    const [ width, setWidth ] = useState( window.innerWidth );
    const [ height, setHeight ] = useState( window.innerHeight );
    const [ smallScale, setSmallScale ] = useState( false );
    const navigate = useNavigate();

    /* 
        function onHover ( toggle ) {
            const button = document.querySelector( "#menu-button" );
            const menu = document.querySelector( "#menu" );
            if ( menu ) {
                if ( toggle ) {
                    menu.classList.remove( "md:hidden" );
                } else {
                    menu.classList.add( "md:hidden" );
                }
            }
        }
    */

    const updateDimensions = () => {
        setWidth( window.innerWidth );
        setHeight( window.innerHeight );
    };

    useEffect( () => {
        // Catch and process changes in window size. 
        window.addEventListener( "resize", updateDimensions );
        return () => window.removeEventListener( "resize", updateDimensions );
    }, [] );

    useEffect( () => {
        // Catch and process changes in width
        setSmallScale( width < HEADER_TRIGGER_DROPDOWN_WIDTH_LG );
        // Disabled as no other elements presently need the page width actively tracked.
        // Will uncomment when the need arises. 
        // dispatch( SetPageWidth( width ) );
    }, [ width ] );

    useEffect( () => {
        // Catch and process changes in smallScale
        if ( !smallScale && showDropdown ) setShowDropdown( false );
    }, [ smallScale ] );

    const buildControls = ( controls ) => {
        // let userData = user;
        // let userRole = userData.hasOwnProperty( "role" ) ? userData.role : "guest";
        // let userToken = userData.hasOwnProperty( "token" ) ? userData.token : "";
        let token = localStorage.getItem( "mindspace-app-token" );
        // let tokenValid = utils.val.isValid( userToken, true );

        let elements = [];

        controls.forEach( ( nav, index ) => {
            // Create button element. No matter what type this nav button is - the part wrapped around the button itself - the button itself will be the same.
            // let id = `header-nav-${ nav.label ? nav.label : index }-${ index }`;
            let id = `nav-button-${ nav.index }-${ nav.name }-${ index }`;
            let button = (
                <Button
                    classes={ `button nav-button` }
                    // label={ nav.label ? <div className="nav-button-text">{ nav.label }</div> : '' }
                    label={ nav.label ? nav.label : '' }
                    icon={ nav.icon ? nav.icon : '' }
                    id={ id }
                    key={ id }
                    onClick={ nav.onClick ? () => {
                        if ( nav.onClick ) {
                            nav.onClick();
                        }
                        if ( nav.link ) {
                            setShowDropdown( false );
                            // navigate( nav.link );
                        }
                    } : () => { } }></Button>
            );

            if ( nav.type === 'navlink' ) {
                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <Link onClick={ () => { setShowDropdown( false ); } }
                            className={ `button nav-button` }
                            to={ `${ nav.link }` }>
                            { nav.icon && nav.icon }
                            { nav.label && <div className="nav-button-text">{ nav.label }</div> }
                        </Link>
                    </li>
                );
            }
            else if ( nav.type === 'link' ) {
                // A useNavigate hook-using button.
                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <Button
                            classes={ `button nav-button` }
                            label={ nav.label ? nav.label : '' }
                            icon={ nav.icon ? nav.icon : '' }
                            onClick={ ( e ) => {
                                if ( nav.onClick ) {
                                    nav.onClick();
                                }
                                if ( nav.link ) {
                                    setShowDropdown( false );
                                    // navigate( nav.link );
                                }
                            } }>

                        </Button>
                    </li>
                );
            }
            else if ( nav.type === 'href' ) {
                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <a
                            className={ `button nav-button` }
                            href={ `${ nav.link }` }
                        >
                            { nav.icon && nav.icon }
                            { nav.label && <div className="nav-button-text">{ nav.label }</div> }

                        </a>
                    </li>
                );
            }
            else if ( nav.type === 'button' ) {
                // Just the button.
                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        { button }
                    </li>
                );
            }
            else if ( nav.type === 'dropdown' ) {
                // let active = false;

                elements.push(
                    <li
                        className={ `${ nav.classes ? nav.classes : '' }` }
                        id={ id }
                        key={ id }
                    >
                        <Button.Dropdown
                            classes={ `button nav-button` }
                            label={ nav.label ? nav.label : '' }
                            icon={ nav.icon ? nav.icon : '' }
                            orientation={ 'left' }
                        // active={active}
                        // setActive={
                        //     () => {
                        //         // active = !active;
                        //         console.log( "SetActive triggered." );
                        //     }
                        // }
                        >
                            { nav.children ? nav.children : <></> }
                        </Button.Dropdown>
                    </li>
                );
            }
        } );

        return (
            <ul className={ `nav-list flex justify-between whitespace-nowrap ${ width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG
                ? ""
                : showDropdown // & width under 768px
                    ? ""
                    : "nav-hidden"
                }` }>
                { elements }
            </ul>
        );
    };

    const buildHeaderNav = ( controls ) => {
        let parentClasses = `nav-list flex justify-between whitespace-nowrap ${ width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG
            ? ""
            : showDropdown // & width under 768px
                ? ""
                : "nav-hidden"
            }`;

        return buildNav( controls, parentClasses );
    };

    return (
        <div
            className={ `page-header` }>
            <div
                className={ `page-header-left` }>
                {
                    // <div className="page-header-left-container">
                }


                <div className="page-header-icon-container">
                    <Avatar
                        // navLinks={ nav }
                        navClasses={ `` }
                        dropdownClasses={ `` }
                        classes={ `` }
                    />

                    {/* <div className={``}>
                        <img
                            className="page-header-icon"
                            src={ process.env.PUBLIC_URL + "/assets/img/portfolio_icon.jpg" }
                            alt="User Icon"
                            onClick={ ( event ) => {
                                // iconOnClick();
                            } }></img>
                    </div> */}
                </div>


                <div className="page-header-title-container">
                    <div className="page-header-title">
                        <h1 className="text-5xl text-textColor ">S</h1>
                        <h1 className="text-5xl text-highlightColor ">G</h1>
                        <h1 className="text-5xl text-textColor ">B</h1>
                    </div>
                </div>
                {
                    // </div>
                }
                { width < HEADER_TRIGGER_DROPDOWN_WIDTH_LG && (
                    <div className="page-header-dropdown-toggle">
                        <Icon.Hamburger
                            type={ 'button' }
                            id="menu-button"
                            active={ showDropdown }
                            className={ `nav-toggle-button h-6 w-6 cursor-pointer text-lg text-gray-700` }
                            onClick={ ( e ) => { setShowDropdown( showDropdown === true ? false : true ); } }
                        />
                    </div>
                ) }
            </div>

            <div
                id="menu"
                className={ `page-header-right ${
                    // width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG
                    // ? ""
                    // : showDropdown // & width under 768px
                    //     ? "flex justify-center w-full whitespace-nowrap"
                    //     : "section-hidden"
                    // 
                    '' }` }>
                {
                    // width > 768 && buildControls( nav )
                    nav && buildHeaderNav( nav )
                }
                { (
                    width < HEADER_TRIGGER_DROPDOWN_WIDTH_LG &&
                    <div
                        className={ `nav-list-overlay ${ showDropdown ? '' : 'section-hidden' }` }
                        onClick={ () => { setShowDropdown( false ); } }
                    ></div>
                )
                }

            </div>
        </div>
    );
}

export default Header;

/*          
                <div className="page-header-icon-container">
                    <Link
                        to={ `${ window.location.href.includes( "/portfolio" )
                                ? ( user ? ( utils.ao.has( user, "role" ) ? [ "admin", "superadmin" ].includes( user.role ) : "/admin" ) : "/" )
                                    ? "/admin"
                                    : "/"
                                : "/portfolio"
                            }` }>
                        <img
                            className="page-header-icon"
                            src={ process.env.PUBLIC_URL + "/assets/img/portfolio_icon.jpg" }
                            alt="User Icon"
                            onClick={ ( event ) => {
                                // iconOnClick();
                            } }></img>
                    </Link>
                </div>

    <div
        className={`page-header-center ${
            width < 768 ? "" : "hidden w-0"
        }`}>
        <svg
            id="menu-button"
            xmlns="http://www.w3.org/2000/svg"
            className={`burger-menu h-6 w-6 cursor-pointer lg:hidden 
            text-lg text-gray-700`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={handleDropdown}
            // onClick={onHover(true)}
            // </div>onMouseOver={onHover(true)}
            // </div>onMouseOut={onHover(false)}
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    </div>
    <HeaderNav
        showDropdown={showDropdown}
        handleDropdown={handleDropdown}
        loginOnClick={loginOnClick}
        width={width}
        height={height}></HeaderNav>
*/
