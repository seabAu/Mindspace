import { useState, useCallback, memo } from "react";
import { CalendarIcon } from "lucide-react";
import * as utils from 'akashatools';
import SidebarDatePicker from "./SidebarDatePicker";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const SidebarCalendarView = memo( () => {
    const { handleDateSelect, selectedDate, clearDateSelection } = useReflectContext();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="border-b flex items-center justify-between">
                <div className="flex flex-col w-full justify-stretch items-center">
                    <div className="flex flex-row items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Calendar</span>
                    </div>
                    <SidebarDatePicker
                        selectedDate={ selectedDate }
                        handleDateSelect={ handleDateSelect }
                        clearDateSelection={ clearDateSelection }
                    />
                </div>
            </div>
        </div>
    );
} );

SidebarCalendarView.displayName = "SidebarCalendarView";

export default SidebarCalendarView;
