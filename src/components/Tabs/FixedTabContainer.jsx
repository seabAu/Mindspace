"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Fixed container component that maintains consistent dimensions
 * and provides scrolling for overflow content
 */
const FixedTabContainer = ( { children, height, width, className = "", ...props } ) => {
  const containerStyle = {
    height: height || "calc(100vh - 200px)", // Default: fill remaining space minus header/tabs
    width: width || "100%",
    minHeight: height || "400px", // Minimum height fallback
  };

  return (
    <div className={ cn( "border rounded-lg bg-card", className ) } style={ containerStyle } { ...props }>
      <ScrollArea className="h-full w-full">
        <div className="p-4">{ children }</div>
      </ScrollArea>
    </div>
  );
};

export default FixedTabContainer;
