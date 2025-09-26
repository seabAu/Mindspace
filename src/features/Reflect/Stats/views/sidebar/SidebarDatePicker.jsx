import { useState, useCallback, memo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import * as utils from 'akashatools';
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const SidebarDatePicker = memo( (
    { showControls = true }
    // { handleDateSelect, selectedDate, clearDateSelection, showControls = true } 
) => {
    const { handleDateSelect, selectedDate, clearDateSelection } = useReflectContext();
    const [ date, setDate ] = useState( new Date( selectedDate ) || new Date( Date.now() ) );

    const handleSelect = useCallback(
        ( newDate ) => {
            console.log( "SidebarCalendarView :: handleSelect :: newDate = ", newDate );
            setDate( newDate );
            handleDateSelect( newDate );
            // No longer switching tabs automatically
        },
        [ handleDateSelect, selectedDate ],
    );

    const handleClear = useCallback( () => {
        clearDateSelection();
        setDate( new Date( Date.now() ) );
    }, [ clearDateSelection ] );

    return (
        <div className={ `flex flex-col flex-1 items-center justify-center` }>
            <ScrollArea className={ `flex-1` }>
                <div className={ `self-center justify-center items-center mx-auto w-full` }>
                    <Calendar
                        mode="single"
                        selected={ new Date( selectedDate ) ?? date }
                        onSelect={ handleSelect }
                        className={ `rounded-lg border-b-2 self-center justify-center items-center mx-auto p-0` }
                        showOutsideDays={ true }
                        gridSize={ 8 }
                        gridGap={ 0 }
                        captionFontSize={ `0.75rem` }
                        headerFontSize={ `0.85rem` }
                        gridFontSize={ `0.65rem` }
                        // startMonth={ new Date( new Date().getFullYear() - 5, new Date().getMonth(), 0 ) }
                        // endMonth={ new Date( 2025, 9 ) }
                        defaultMonth={ new Date( Date.now() ) }
                    />
                </div>
                { showControls && (
                    <>
                        { selectedDate && (
                            <Button size={ 'xs' } variant={ 'outline' } onClick={ handleClear } className="text-xs px-2 py-1 rounded-lg">
                                Clear
                            </Button>
                        ) }
                        <Button size={ 'xs' } variant={ 'ghost' } onClick={ () => { handleSelect( new Date( Date.now() ) ); } } className="text-xs px-2 py-1">
                            Today
                        </Button>
                    </>
                ) }
            </ScrollArea>
        </div>
    );
} );

export default SidebarDatePicker;