import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import { CustomSelectDropdown } from "../Calendar/DatePicker";

/**
 * Render the dropdown to navigate between months.
 *
 * @group Components
 * @see https://daypicker.dev/guides/custom-components
 */
export function MonthsDropdown ( props ) {
    const { components } = useDayPicker();
    return <components.Dropdown { ...props } />;
}


function Calendar ( {
    className,
    classNames,
    components,
    showOutsideDays = true,
    gridSize = 8,
    gridGap = 1,
    captionFontSize = `${ 0.8 }rem`,
    headerFontSize = `${ 0.8 }rem`,
    gridFontSize = `${ 0.8 }rem`,
    defaultMonth, // = new Date( 2024, 6 ),
    startMonth, // = new Date( 2024, 6 ),
    endMonth, // = new Date( 2025, 9 ),
    ...props
} ) {
    return (
        ( <DayPicker
            showOutsideDays={ showOutsideDays }
            className={ cn( "p-2", className ) }
            classNames={ {
                caption_dropdowns: `flex flex-row flex-nowrap w-full h-full justify-stretch items-stretch gap-4`,
                dropdown_icon: `hidden`,
                dropdown_month: `gap-4 justify-center w-1/2`,
                dropdown_year: `gap-4 justify-center w-1/2`,
                head: `flex flex-row w-full flex-nowrap items-center`,
                dropdown: `flex flex-row w-full flex-nowrap`,
                months: `flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0`,
                month: `space-y-4`,
                caption: `flex justify-stretch pt-2 relative items-center justify-center`,
                caption_label: `text-[${ captionFontSize }] font-medium items-center justify-center flex flex-row w-full text-center`,
                nav: `space-x-1 flex items-center`,
                nav_button: cn( buttonVariants( { variant: `outline` } ), `h-${ gridSize } w-${ gridSize } bg-transparent p-0 opacity-50 hover:opacity-100` ),
                nav_button_previous: `absolute left-1`,
                nav_button_next: `absolute right-1`,
                table: `w-full border-collapse space-y-1`,
                head_row: `flex gap-${ gridGap }`,
                head_cell: `text-muted-foreground rounded-md w-${ gridSize } font-normal text-[${ headerFontSize }]`,
                row: `flex w-full mt-0 gap-${ gridGap }`,
                cell: twMerge( `h-${ gridSize } w-${ gridSize } text-center text-${ String( gridFontSize ) } p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20` ),
                day: cn( buttonVariants( { variant: `ghost` } ), `h-${ gridSize } w-${ gridSize } p-0 font-normal aria-selected:opacity-100` ),
                day_range_end: `day-range-end`,
                day_selected: `bg-washed-purple-500 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground`,
                day_today: `bg-accent text-accent-foreground`,
                day_outside: `day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground`,
                day_disabled: `text-muted-foreground opacity-50`,
                day_range_middle: `aria-selected:bg-accent aria-selected:text-primary-purple-500`,
                day_hidden: `invisible`,

            } }
            components={ {
                IconLeft: ( { ...props } ) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ( { ...props } ) => <ChevronRight className="h-4 w-4" />,
                // Dropdown: ( { ...props } ) => <MonthsDropdown />,
                ...( components ? components : [] )
            } }
            hideNavigation={ false }
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            pagedNavigation={ true }
            reverseMonths={ true }
            captionLayout="dropdown"
            defaultMonth={ defaultMonth ?? new Date( new Date().getFullYear(), new Date().getMonth() ) }
            startMonth={ startMonth ?? new Date( new Date().getFullYear() - 5, new Date().getMonth() ) }
            endMonth={ endMonth ?? new Date( new Date().getFullYear() + 5, new Date().getMonth() ) }
            { ...props } /> )
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
