import React from "react";
import { Button } from "@/components/ui/button";

const ActionBar = ( {
    actions = [],
    className = "",
    alignment = "between", // "start", "center", "end", "between"
} ) => {
    const alignmentClasses = {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
    };

    return (
        <div className={ `flex items-center ${ alignmentClasses[ alignment ] } ${ className }` }>
            { actions.map( ( action, index ) => (
                <React.Fragment key={ index }>
                    { action.render ? (
                        action.render()
                    ) : (
                        <Button
                            variant={ action.variant || "outline" }
                            size={ action.size || "sm" }
                            onClick={ action.onClick }
                            disabled={ action.disabled }
                            className={ action.className || "" }
                        >
                            { action.icon && <span className="mr-1">{ action.icon }</span> }
                            { action.label }
                        </Button>
                    ) }
                </React.Fragment>
            ) ) }
        </div>
    );
};

export default React.memo( ActionBar )

