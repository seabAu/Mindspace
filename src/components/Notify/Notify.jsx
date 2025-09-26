import { useEffect } from "react";
import { BellRing, Cog, LucideFileQuestion, Moon, Snowflake, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as utils from 'akashatools';
import useGlobalStore from "@/store/global.store";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/ui/badge";

const Notify = ( props ) => {
    const {
        iconHeight = 0.8,
        iconWidth = 0.8,
        className = '',
    } = props;

    const {
        // Debug state
        debug,

        // Active notifications
        data, setData,
        notifications, setNotifications,
        activeNotifications, setActiveNotifications,
        reminders, setReminders,
        activeReminders, setActiveReminders,
    } = useGlobalStore();

    return (
        <DropdownMenu
            className={ `` }
        >
            <DropdownMenuTrigger
                className={ `flex w-full h-full ${ className } ` }
                asChild
            >
                <Button
                    className={ `!h-[${ iconHeight.toString() }rem] !w-[${ iconWidth.toString() } aspect-square p-2` }
                    // size="sm"
                    variant="outline"
                >
                    <BellRing className={ `scale-100 transition-all dark:scale-0 !h-[${ iconHeight.toString() }rem] !w-[${ iconWidth.toString() }rem]` } />

                    { utils.val.isValidArray( activeNotifications, true ) && (
                        <Badge
                            key={ index }
                            variant='primary'
                            className={ `p-0` }>
                            { activeNotifications?.length ?? 0 }
                        </Badge>
                    ) }
                    <span className="sr-only">Show Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={ twMerge(
                    `flex items-center flex-col w-full p-0 h-auto min-h-24`,
                ) }
            >
                <div className={ `px-2 py-2 text-base` }>{ `Notifications` }</div>
                { utils.val.isValidArray( activeNotifications, true ) ? (
                    <>
                        { activeNotifications.map( ( n, index ) => {
                            return (
                                <DropdownMenuItem
                                    key={ index }
                                    // onClick={ () => { setActiveNotification( n.toString() ); } }
                                    className={ twMerge(
                                        `flex justify-center items-center w-full m-auto text-lg transition-color duration-200 ease-in-out font-semibold`,
                                    ) }
                                >
                                    { utils.str.toCapitalCase( n.toString() ) }
                                </DropdownMenuItem>
                            );
                        } ) }
                    </>
                ) :
                (<div className={ `px-2 py-2 text-sm` }>{ `There are no notifications to show.` }</div>)}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notify;
