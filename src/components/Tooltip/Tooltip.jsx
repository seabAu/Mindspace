// https://www.radix-ui.com/primitives/docs/components/tooltip/1.1.3
import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PlusIcon } from "@radix-ui/react-icons";

const Hovertip = ( props ) => {
    const {
        trigger,
        content,
        variant,
        children,
        open,
        defaultOpen,
        onOpenChange,
        options,
        ...props
    } = props;

    return (
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <button className="inline-flex size-[35px] items-center justify-center rounded-full bg-white text-violet11 shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black">
                        { trigger ? trigger : <PlusIcon /> }
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="TooltipContent select-none rounded bg-white px-[15px] py-2.5 text-[15px] leading-none text-violet11 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade"
                        sideOffset={ 5 }
                        onEscapeKeyDown={ () => { } }
                    >
                        { content && content }
                        <Tooltip.Arrow className="fill-white" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default Hovertip;


/* // your-tooltip.jsx
import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function Tooltip({
    children,
    content,
    open,
    defaultOpen,
    onOpenChange,
    ...props
}) {
    return (
        <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
        >
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content side="top" align="center" {...props}>
                {content}
                <TooltipPrimitive.Arrow width={11} height={5} />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Root>
    );
}
*/