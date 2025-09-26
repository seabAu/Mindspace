import React, { useState } from 'react';
import {
    ChevronRight,
    FileIcon,
    FolderIcon,
    MoreHorizontal,
    Plus,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import * as utils from 'akashatools';

const NavDropdown =  ( {
    items = [],
    label = '',
    maxShow = 5,
} ) => {

    const [ showMore, setShowMore ] = useState( false );
    return (
        <SidebarGroup>
            <SidebarGroupLabel>
                { utils.str.toCapitalCase( label ) }
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    { items.map( ( item, index ) => {
                        if ( ( !showMore && index < maxShow ) || ( showMore ) ) {
                            if ( utils.ao.has( item, 'pages' ) ) {
                                return (
                                    <Collapsible key={ `workspaces-nav-${ index }-${ item?.title }` }>
                                        <SidebarMenuItem
                                            className={ `py-0 px-0` }
                                        >
                                            <SidebarMenuButton
                                                asChild
                                                className={ `py-0 px-0` }
                                            >
                                                <a href="#">
                                                    { <span>{ item?.icon }</span> }
                                                    <span>{ item?.title }</span>
                                                </a>
                                            </SidebarMenuButton>

                                            <CollapsibleTrigger
                                                className={ `py-0 px-0` }
                                                asChild
                                            >
                                                <SidebarMenuAction
                                                    className="py-0 px-0 left-0 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                                                    showOnHover
                                                >
                                                    <ChevronRight
                                                        className={ `py-0 px-0 w-4 h-4 ` }
                                                    />
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>

                                            <SidebarMenuAction showOnHover>
                                                <FolderIcon />
                                            </SidebarMenuAction>

                                            <SidebarMenuAction showOnHover>
                                                <FileIcon />
                                            </SidebarMenuAction>

                                            <SidebarMenuAction showOnHover>
                                                <Plus />
                                            </SidebarMenuAction>

                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    { item.pages.map( ( page ) => (
                                                        <SidebarMenuSubItem key={ page?.title }>
                                                            <SidebarMenuSubButton asChild>
                                                                <a href="#">
                                                                    {
                                                                        page?.iconId && (
                                                                            <page.iconId className={ `` } />
                                                                        )
                                                                    }
                                                                    <span>{ page?.title }</span>
                                                                </a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ) ) }
                                                </SidebarMenuSub>
                                            </CollapsibleContent>


                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }
                            else {
                                // Instead, return a navlist. 
                                return (
                                    <SidebarMenuItem
                                        className={ `py-0 px-0 m-0` }
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            className={ `py-0 px-0 m-0` }
                                        >
                                            <a href="#">
                                                {
                                                    item?.iconId && item.iconId !== '' // && !( 'http://' in item.iconId )
                                                        ? ( <item.iconId className={ `` } /> )
                                                        : ( <></> )
                                                }
                                                <span>{ item?.title }</span>
                                            </a>
                                        </SidebarMenuButton>

                                        <SidebarMenuAction showOnHover>
                                            <Plus />
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                );
                            }
                        }
                    }
                    ) }

                    {
                        showMore
                            ? (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="text-sidebar-foreground/70"
                                        onClick={ () => { setShowMore( false ); } }
                                    >
                                        <MoreHorizontal />
                                        <span>Less</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                            : (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="text-sidebar-foreground/70"
                                        onClick={ () => { setShowMore( true ); } }
                                    >
                                        <MoreHorizontal />
                                        <span>More</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                    }
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export default NavDropdown;