import React from 'react';
import * as utils from 'akashatools';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { SidebarGroupLabel } from '../ui/sidebar';

const Collapse = ( { open, defaultOpen = true, onOpenChange, onClick, children, label, trigger, triggerIcon, content, className, triggerClassNames, contentClassNames } ) => {

    return (
        <>
            <Collapsible
                defaultOpen={ defaultOpen }
                className={ twMerge( `group/collapsible`, className ) }
                { ...{
                    ...( utils.val.isDefined( open ) ? { open: open } : {} ),
                    ...( utils.val.isDefined( onOpenChange ) ? { onOpenChange: onOpenChange } : {} ),
                } }
            >
                <SidebarGroupLabel
                    asChild
                    className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                <CollapsibleTrigger className={ twMerge( `group/collapsible`, triggerClassNames ) }>
                    { label && ( <div className={ `text-sm text-primary-600 align-text-bottom font-sans font-extrabold` }>
                        { label }
                    </div> ) }
                    { utils.val.isDefined( triggerIcon ) ? { triggerIcon } : ( <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" /> ) }
                </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className={ twMerge( `group/collapsible`, contentClassNames ) }>
                    { children ? ( children ) : ( <></> ) }
                    { content ? ( content ) : ( <></> ) }
                </CollapsibleContent>
            </Collapsible>
        </>
    );
};

export default Collapse;
