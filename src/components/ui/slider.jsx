import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef( ( { className, trackHeight = 2, thumbSize = 4, ...props }, ref ) => (
    <SliderPrimitive.Root
        ref={ ref }
        className={ cn( "relative flex w-full touch-none select-none items-center", className ) }
        { ...props }>
        <SliderPrimitive.Track
            className={ `relative h-${ String( trackHeight ) } w-full grow overflow-hidden rounded-full bg-secondary` }>
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={ `block h-${ String( thumbSize ) } w-${ String( thumbSize ) } rounded-full border-[0.125rem] border-primary-500 bg-background ring-offset-background transition-colors focus-visible:outline-transparent visible:outline-transparent focus-visible:outline-none  disabled:pointer-events-none disabled:opacity-50` } />
    </SliderPrimitive.Root>
) );
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
