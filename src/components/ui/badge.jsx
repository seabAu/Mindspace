import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                tertiary: "border-transparent bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
                muted: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
                accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground text-accent-foreground hover:bg-accent/80 hover:bg-secondary-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge ( {
    className,
    variant,
    ...props
} ) {
    return ( <div className={ cn( badgeVariants( { variant } ), className ) } { ...props } /> );
}

export { Badge, badgeVariants };
