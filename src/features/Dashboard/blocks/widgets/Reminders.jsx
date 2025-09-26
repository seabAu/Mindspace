import { useMemo, useState } from "react";
import * as utils from 'akashatools';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronRight, PlusCircle } from "lucide-react";
import useReminderStore from "@/store/reminder.store";
import { addDays } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { twMerge } from "tailwind-merge";

// const reminders = [
//     { id: 1, label: "Call the bank" },
//     { id: 2, label: "Pick up dry cleaning" },
//     { id: 3, label: "Book flight for vacation" },
// ];

export function RemindersWidget () {
    const date = new Date();
    const { remindersData, getRemindersByDateRange } = useReminderStore();
    const [ isCollapsed, setIsCollapsed ] = useState( false );
    const reminders = useMemo( () => ( getRemindersByDateRange( date, addDays( date, 1 ) ) ) );

    return (
        <Card>
            <Collapsible defaultOpen={ !isCollapsed } className='group/collapsible'>
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                    <CollapsibleTrigger className={ `flex flex-row w-full items-center justify-stretch` }>
                        <ChevronRight className={ `transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                        <div className='p-2 flex justify-between items-center'>
                            <CardTitle className="text-base">Reminders</CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent className={ `w-full h-full flex-1` }>
                    <div className={ twMerge( 'space-y-1', isCollapsed && 'hidden', ) }>
                        <div className='flex justify-between items-center'>
                            <CardContent className="px-4 gap-2">
                                <div className="">
                                    { utils.val.isValidArray( remindersData, true )
                                        ? remindersData?.map( ( reminder ) => (
                                            <div key={ reminder?._id } className="flex items-center space-x-2">
                                                <Checkbox id={ `reminder-${ reminder?._id }` } />
                                                <label
                                                    htmlFor={ `reminder-${ reminder?._id }` }
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    { reminder?.title }
                                                </label>
                                            </div>
                                        ) )
                                        : <p className={ `text-xs` }>{ `Nothing to show.` }</p>
                                    }
                                </div>
                            </CardContent>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
