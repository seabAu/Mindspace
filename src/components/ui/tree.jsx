import * as React from "react";
import { ChevronRight, File, Folder } from "lucide-react";
import * as utils from 'akashatools';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from "@/components/ui/sidebar";

const Tree = ( { item } ) => {
    const [ name, ...items ] = Array.isArray( item ) ? item : [ item ];
    const [ subDirectories, setSubDirectories ] = React.useState( [] );

    /*
        Each item will have the schema: 
        {
            name: "app",
            state: false,
            data: [],
            icon: "",
            url: "#",
            items: []
        }
    */


    const buildBranch = ( element ) => {
        if ( utils.val.isObject( element ) ) {
            // Is a valid object. 
            let {
                name,
                state,
                isActive,
                data,
                icon,
                url,
                items: subItems
            } = element;
            if ( !utils.val.isValidArray( subItems, true ) ) {
                // There are subitems. 
                return (
                    <SidebarMenuButton
                        isActive={ state === true }
                        className="data-[active=true]:bg-transparent"
                    >
                        <File />
                        { name }
                    </SidebarMenuButton>
                );
            }
            else {
                return (
                    <Collapsible
                        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                        defaultOpen={ state
                            ?
                            state === true
                            :
                            (
                                isActive
                                    ?
                                    (
                                        isActive === true
                                    )
                                    :
                                    (
                                        false
                                    )
                            )
                        }
                    >
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                <ChevronRight className="transition-transform" />
                                <Folder />
                                { name }
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {
                                    subItems.map( ( subItem, index ) => (
                                        <Tree key={ index } item={ subItem } />
                                    ) )
                                }
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                );
            }
        }
    };

    // console.log( "TREE :: items = ", items, " :: ", "item = ", item );

    /*
        if ( !items.length ) {
            return (
                <SidebarMenuButton
                    isActive={ name === "button.tsx" }
                    className="data-[active=true]:bg-transparent"
                >
                    <File />
                    { name }
                </SidebarMenuButton>
            );
        }

        return (
            <SidebarMenuItem>
                <Collapsible
                    className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                    defaultOpen={ name === "components" || name === "ui" }
                >
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                            <ChevronRight className="transition-transform" />
                            <Folder />
                            { name }
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            { items.map( ( subItem, index ) => (
                                <Tree key={ index } item={ subItem } />
                            ) ) }
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
        );
    */

    return (
        <SidebarMenuItem>
            {
                item && utils.val.isValid( item ) ? (
                    buildBranch( item )
                ) : (
                    <></>
                )
            }
        </SidebarMenuItem>
    );
};

export default Tree;