import React, { useState, useEffect, useMemo } from 'react';
import * as utils from 'akashatools';
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { twMerge } from 'tailwind-merge';
import { Spinner } from '../Loader/Spinner';

const GenericContextMenu = ( props ) => {
    const {
        children,
        trigger,
        controls = [],
        refItemData = {}, // Date for the item this is wrapped around. 
        className,
        menuItemClasses,
        menuIconClasses,
        menuClasses,
    } = props;

    /*  Schema: {
            enabled: true,
            index: 0,
            id: '',
            key: '',
            type: 'button',
            shortcut?: '',
            name: "home",
            label: "Home",
            link: '/',
            icon: <FaSwatchbook className="fa fa-2x control-button-icon icon" />,
            classes: `control-list-item`,
            onClick: ( e ) => { },
            useTooltip: true,
            tooltipInfo: '',
            controls?: [ list of sub-items if type === 'group' ],
            disabled?: true/false,
            inset?: true/false,
        }
    */

    // console.log( 'GenericContextMenu :: props = ', props );

    const buildContextMenuControlGroup = ( control ) => {
        if ( utils.ao.has( control, 'controls' ) ) {
            let groupNavElements = [];
            let groupNav = control?.controls;
            groupNav.forEach( ( groupNavItem, groupNavIndex ) => {
                groupNavElements.push(
                    buildContextMenuControls(
                        groupNavItem,
                        `context-menu-group-control`,
                        `context-menu-group-control-item`
                    )
                );
            } );

            return (
                <ContextMenuSub
                    className={ `mr-2` }
                >
                    <ContextMenuSubTrigger inset>
                        { control?.trigger }
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        { groupNavElements }
                    </ContextMenuSubContent>
                </ContextMenuSub>
            );
        }
        else {
            return ( <></> );
        }
    };

    const buildContextMenuControls = ( controls ) => {
        let elements = [];

        if ( utils.val.isValidArray( controls, true ) ) {

            controls
                ?.filter( ( c ) => ( utils.val.isObject( c ) && Object.keys( c ).includes( 'enabled' ) ? c?.enabled : false ) )
                .forEach( ( control, index ) => {
                    // if ( !control.enabled ) return null;
                    // console.log( 'GenericContextMenu :: buildContextMenuControls :: control #', index, ' = ', control );
                    const ButtonContent = (
                        <div className={ `controls-button-item flex flex-row justify-stretch, items-center h-auto w-full` }>
                            { control?.icon && <span
                                className={ `px-0` }
                            >{ control?.icon }</span> }

                            { control?.label && control?.label }

                            { control?.shortcut && (
                                <ContextMenuShortcut>
                                    { control?.shortcut }
                                </ContextMenuShortcut>
                            ) }
                        </div>
                    );

                    let id = `context-menu-control-item-${ control?.id ? control?.id : control?.label }-${ index }`;
                    if ( control?.type === 'separator' ) {
                        elements.push(
                            <ContextMenuSeparator
                                id={ id }
                                key={ id }
                            />
                        );
                    }
                    if ( control?.type === 'group' ) {
                        if ( utils.ao.has( control, 'controls' ) ) {
                            // console.log( 'buildNavDropdownItem :: control = ', control );
                            elements.push( buildContextMenuControlGroup( control ) );
                        }
                    }
                    else if ( control?.type === 'radiogroup' ) {
                        let radioDefaultVal = control?.defaultValue;
                        let optionsArr = control?.options;
                        if ( optionsArr && utils.val.isValidArray( optionsArr, true ) ) {
                            elements.push(
                                <ContextMenuRadioGroup >
                                    { control?.title && (
                                        <ContextMenuLabel inset>
                                            { control?.title }
                                        </ContextMenuLabel>
                                    ) }
                                    <ContextMenuSeparator />
                                    { optionsArr.map( ( opt, index ) => {
                                        return (
                                            <ContextMenuRadioItem
                                                key={ `context-menu-radiogroup-option-${ opt?.value }-${ opt?.name }-${ index }` }
                                                value={ opt?.value }
                                            >
                                                { opt?.name }
                                            </ContextMenuRadioItem>
                                        );
                                    } ) }
                                </ContextMenuRadioGroup>
                            );
                        }
                    }
                    else if ( control?.type === 'toggle' ) {
                        elements.push(

                            <ContextMenuItem
                                className={ twMerge( `cursor-pointer`, control?.classes || '' ) }
                                onClick={ () => control?.onClick( refItemData ? refItemData : control ) }
                            >
                                <ContextMenuCheckboxItem>
                                    Show Full URLs
                                </ContextMenuCheckboxItem>
                            </ContextMenuItem>
                        );
                    }
                    else if ( control?.type === 'button' ) {
                        elements.push(
                            <div
                                id={ id }
                                key={ id }
                            >
                                { control?.useTooltip ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ContextMenuItem
                                                className={ twMerge( `cursor-pointer`, control?.classes || '' ) }
                                                onClick={ () => control?.onClick( refItemData ? refItemData : control ) }
                                            >
                                                { ButtonContent }
                                            </ContextMenuItem>
                                        </TooltipTrigger>
                                        <TooltipContent>{ control?.tooltipInfo || '' }</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <ContextMenuItem
                                        className={ `cursor-pointer ${ control?.classes || '' }` }
                                        onClick={ () => {
                                            if ( control?.onClick && refItemData ) {
                                                control.onClick( refItemData );
                                            }
                                        } }
                                    >
                                        { ButtonContent }
                                    </ContextMenuItem>
                                ) }
                                {/* { control?.type === 'separator' && <ContextMenuSeparator /> } */ }
                            </div>
                        );
                    }
                    else {
                        elements.push( <></> );
                    }
                } );
        }

        if ( elements ) {
            return (
                <ContextMenuContent className="shadow-md rounded-md">
                    { elements }
                </ContextMenuContent>
            );
        }
    };

    // const renderNav = useMemo( () => buildContextMenuControls( controls ), [ controls ] );

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                { trigger ? trigger : children }
            </ContextMenuTrigger>
            {/* { utils.val.isValidArray( controls, true ) ? renderNav : <Spinner /> } */}
            { buildContextMenuControls( controls ) }
        </ContextMenu>
    );
};

export default GenericContextMenu;
