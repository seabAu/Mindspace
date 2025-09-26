import { Bell, X, BellRing, XCircle, EyeOff, PinOffIcon, PinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
// import { formatTimeAgo } from "@/lib/notification-trigger-utils";
import { formatTimeAgo } from "../../lib/notificationUtils";
import useNotificationsStore from "@/store/notification.store";
import * as utils from 'akashatools';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, getPrettyDate, getPrettyTime } from "@/lib/utilities/time";
import { BsCheckCircleFill } from "react-icons/bs";

export function NotificationsDropdown () {
    // const {
    //     notificationData,
    //     getUnreadNotifications,
    //     markNotificationAsRead,
    //     dismissNotification,
    //     markAllNotificationsAsRead
    // } = useNotificationsStore();
    const notificationData = useNotificationsStore( ( state ) => state.notificationData );
    const getUnreadNotifications = useNotificationsStore( ( state ) => state.getUnreadNotifications );
    const markNotificationAsRead = useNotificationsStore( ( state ) => state.markNotificationAsRead );
    const dismissNotification = useNotificationsStore( ( state ) => state.dismissNotification );
    const markAllNotificationsAsRead = useNotificationsStore( ( state ) => state.markAllNotificationsAsRead );
    const clearDismissedNotifications = useNotificationsStore( ( state ) => state.clearDismissedNotifications );
    const clearAllNotifications = useNotificationsStore( ( state ) => state.clearAllNotifications );
    const getDismissedNotifications = useNotificationsStore( ( state ) => state.getDismissedNotifications );
    const getUndismissedNotifications = useNotificationsStore( ( state ) => state.getUndismissedNotifications );
    const getVisibleNotifications = useNotificationsStore( ( state ) => state.getVisibleNotifications );
    const markNotificationAsPinned = useNotificationsStore( ( state ) => state.markNotificationAsPinned );
    const dismissAllNotifications = useNotificationsStore( ( state ) => state.dismissAllNotifications );


    const [ activeTab, setActiveTab ] = useState( "all" );
    const [ dropdownOpen, setDropdownOpen ] = useState( false );


    const navigate = useNavigate();
    let location = useLocation();


    // const filteredNotifications = notificationData.filter( ( n ) => {
    //     if ( activeTab === "unread" ) return !n.isRead && !n.isDismissed;
    //     if ( activeTab === "dismissed" ) return n.isDismissed;
    //     return !n.isDismissed; // "all" tab shows non-dismissed notificationData
    // } );

    const unreadNotifications = useMemo( () => ( getUnreadNotifications() ), [ notificationData ] );
    // const unreadNotifications = notificationData.filter( ( n ) => !n.isRead && !n.isDismissed );
    // const dismissedNotifications = useMemo( () => ( notificationData.filter( ( n ) => n.isDismissed ) ), [ notificationData ] );
    const dismissedNotifications = useMemo( () => ( getDismissedNotifications() ), [ notificationData ] );
    // const unDismissedNotifications = useMemo( () => ( notificationData.filter( ( n ) => !n.isDismissed ) ), [ notificationData ] );
    const unDismissedNotifications = useMemo( () => ( getUndismissedNotifications() ), [ notificationData ] );
    const visibleNotifications = useMemo( () => ( getUndismissedNotifications() ), [ notificationData ] );

    const unreadCount = useMemo( () => ( utils.val.isValidArray( unreadNotifications, true ) ? unreadNotifications.length : 0 ), [ notificationData, unreadNotifications ] );
    const dismissedCount = useMemo( () => ( utils.val.isValidArray( dismissedNotifications, true ) ? dismissedNotifications.length : 0 ), [ notificationData, dismissedNotifications ] );
    const unDismissedCount = useMemo( () => ( utils.val.isValidArray( unDismissedNotifications, true ) ? unDismissedNotifications.length : 0 ), [ notificationData, unDismissedNotifications ] );

    const buildNotificationList = ( items ) => {
        if ( utils.val.isValidArray( items, true ) ) {
            return (
                items
                    // .filter( ( n ) => !n.isDismissed )
                    .sort( ( a, b ) => new Date( b.triggerDate ) - new Date( a.triggerDate ) )
                    .map( ( notif ) => (
                        <DropdownMenuItem
                            key={ notif._id }
                            className={ `flex items-start justify-start gap-2 p-2 ${ !notif.isRead ? "bg-primary/10 font-bold" : "" }` }
                            onClick={ () => !notif.isRead && markNotificationAsRead( notif._id ) } // Mark as isRead on click
                            onDoubleClick={ () => {
                                if ( notif?.hasOwnProperty( 'docURL' ) && notif?.docURL ) {
                                    // has a set document URL; send user to that location. 
                                    navigate( notif?.docURL ?? './' );
                                }
                            } } // Mark as isRead on click
                        >
                            <BellRing className={ `aspect-square size-3.5 ${ !notif.isRead ? "text-primary" : "text-muted-foreground" }` } />

                            <div className={ `flex-grow` }>
                                <p className={ `font-semibold text-sm ${ !notif.isRead ? "text-primary font-bold" : "text-muted-foreground font-normal" }` }>{ notif.title }</p>
                                <p className={ `text-xs text-muted-foreground truncate max-w-full text-wrap ${ !notif.isRead ? "text-primary font-bold" : "text-muted-foreground font-normal" }` }>
                                    { notif?.message || "Notification triggered." }
                                </p>


                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="text-xs text-muted-foreground/80">
                                                { formatTimeAgo( notif.triggerDate ) }
                                            </p>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="left"
                                            align="center"
                                        >
                                            { `${ getPrettyDate( new Date( notif.triggerDate ) ) }, ${ getPrettyTime( new Date( notif.triggerDate ) ) }` }
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>



                            </div>

                            <div className={ `flex-col w-6 h-full` }>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="aspect-square size-6 p-1"
                                    onClick={ ( e ) => { e.stopPropagation(); dismissNotification( notif._id ); } }
                                >

                                    { !notif.isDismissed ? (
                                        <>
                                            <X className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Dismiss` }</span>
                                        </>
                                    ) : (
                                        <>
                                            <BsCheckCircleFill className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Dismissed` }</span>
                                        </>
                                    ) }
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={ ( e ) => { e.stopPropagation(); markNotificationAsRead( notif._id, !notif.isRead ); } }
                                    className="aspect-square size-6 p-1 text-xs text-orange-600 hover:text-orange-700"

                                >
                                    { !notif.isRead ? (
                                        <>
                                            <EyeOff className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Read` }</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Unread` }</span>
                                        </>
                                    ) }
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={ ( e ) => { e.stopPropagation(); markNotificationAsPinned( notif._id, !notif.isPinned ); } }
                                    className={ `aspect-square size-6 p-1 text-xs ${ notif?.isPinned ? 'text-neutral-200 hover:text-neutral-100 stroke-2' : 'text-neutral-600 hover:text-neutral-700 ' }` }
                                >
                                    { !notif.isPinned ? (
                                        <>
                                            <PinOffIcon className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Unpinned` }</span>
                                        </>
                                    ) : (
                                        <>
                                            <PinIcon className="aspect-square size-3.5" />
                                            <span className={ `sr-only` }>{ `Pinned` }</span>
                                        </>
                                    ) }
                                </Button>


                            </div>

                        </DropdownMenuItem>
                    ) )
            );
        }
        else {
            return (
                <DropdownMenuItem disabled className="text-center text-muted-foreground">
                    No new notifications
                </DropdownMenuItem>
            );
        }
    };

    return (
        <DropdownMenu open={ dropdownOpen } onOpenChange={ setDropdownOpen }>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    { utils.val.isValidArray( unreadNotifications, true ) && unreadNotifications.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                            { unreadNotifications.length }
                        </Badge>
                    ) }
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    { utils.val.isValidArray( unreadNotifications, true ) && unreadNotifications?.length > 0 && activeTab !== 'dismissed' && (
                        <Button variant="outline" size="sm" onClick={ () => { e.stopPropagation(); markAllNotificationsAsRead( true ); } } className={ `!py-1 !px-3` }>
                            Read All
                        </Button>
                    ) }

                    { utils.val.isValidArray( notificationData, true ) && (
                        <>
                            { activeTab !== "unread" && (
                                <Button variant="outline" size="sm" onClick={ () => { e.stopPropagation(); markAllNotificationsAsRead( false ); } } className={ `!py-1 !px-3` }>
                                    Unread All
                                </Button>
                            ) }
                            { activeTab !== "dismissed" && (
                                <Button variant="outline" size="sm" onClick={ ( e ) => { e.stopPropagation(); dismissAllNotifications( true ); } } className={ `!py-1 !px-3` }>
                                    Dismiss All
                                </Button>
                            ) }
                            { activeTab === "dismissed" && dismissedCount > 0 && (
                                <Button variant="outline" size="sm" onClick={ clearDismissedNotifications } className={ `!py-1 !px-3` }>
                                    Clear Dismissed
                                </Button>
                            ) }
                        </>
                    ) }
                    
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                { utils.val.isValidArray( notificationData, true ) && (
                    <>
                        <Tabs value={ activeTab } onValueChange={ setActiveTab } className="mb-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all">All ({ unDismissedCount })</TabsTrigger>
                                <TabsTrigger value="unread">Unread ({ unreadCount })</TabsTrigger>
                                <TabsTrigger value="dismissed">Dismissed ({ dismissedCount })</TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value={ "all" }
                                className={ `max-h-80 overflow-x-hidden overflow-y-auto` }
                            >
                                <div className="h-full w-full">
                                    { buildNotificationList( getVisibleNotifications() ) }
                                </div>
                            </TabsContent>

                            <TabsContent
                                value={ "unread" }
                                className={ `max-h-80 overflow-x-hidden overflow-y-auto` }
                            >
                                <div className="h-full w-full">
                                    { buildNotificationList( getUnreadNotifications() ) }
                                </div>
                            </TabsContent>

                            <TabsContent
                                value={ "dismissed" }
                                className={ `max-h-80 overflow-x-hidden overflow-y-auto` }
                            >
                                <div className="h-full w-full">
                                    { buildNotificationList( getDismissedNotifications() ) }
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                ) }
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to={ {
                        pathname: "/dash/messages/notifications",
                    } } className="w-full justify-center">
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
