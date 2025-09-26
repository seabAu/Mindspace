import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef( ( { className, size = 6, thumbClassNames = '', ...props }, ref ) => (
    <SwitchPrimitives.Root
        className={ cn(
            `peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`,
            // `!h-[${ String( size ) }rem] !w-[${ String( size * 2 ) }rem]`,
            className
        ) }
        style={ {
            height: `${ String( size / 4 ) }rem`,
            width: `${ String( size / 2 ) }rem`,
        } }
        { ...props }
        ref={ ref }
    >
        <SwitchPrimitives.Thumb
            className={ cn(
                `pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0`,
                // `data-[state=checked]:translate-x-${ String(size - 1) }`,
                `data-[state=checked]:translate-x-[--switchTranslateX]`,
                // `h-${ size - 1 } w-${ size - 1 }`,
                thumbClassNames,
            ) }
            style={ {
                '--switchTranslateX': `${ ( size  ) / 4 }rem`,
                height: `${ String( Math.abs( size - 1 ) / 4 ) }rem`,
                width: `${ String( Math.abs( size - 1 ) / 4 ) }rem`,
            } }
        />
    </SwitchPrimitives.Root>
) );
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
