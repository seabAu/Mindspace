import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, EyeOff, BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useNotificationsStore from "@/store/notification.store";

export function NotificationCenter () {
    const {
        notificationData,
        markNotificationAsRead,
        dismissNotification,
        markAllNotificationsAsRead,
        clearDismissedNotifications,
        clearAllNotifications,
    } = useNotificationsStore( ( state ) => ( {
        notificationData: state.notificationData,
        markNotificationAsRead: state.markNotificationAsRead,
        dismissNotification: state.dismissNotification,
        markAllNotificationsAsRead: state.markAllNotificationsAsRead,
        clearDismissedNotifications: state.clearDismissedNotifications,
        clearAllNotifications: state.clearAllNotifications,
    } ) );

    const [ activeTab, setActiveTab ] = useState( "all" );

    const filteredNotifications = notificationData.filter( ( n ) => {
        if ( activeTab === "unread" ) return !n.isRead && !n.isDismissed;
        if ( activeTab === "dismissed" ) return n.isDismissed;
        return !n.isDismissed;
    } );

    const unreadCount = notificationData.filter( ( n ) => !n.isRead && !n.isDismissed ).length;
    const dismissedCount = notificationData.filter( ( n ) => n.isDismissed ).length;

    return (
        <Card className="mt-10 shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">Notification Center</CardTitle>
                    { notificationData.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={ clearAllNotifications }
                            className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                        >
                            Clear All Notifications
                        </Button>
                    ) }
                </div>
                <CardDescription>View and manage your reminder notificationData.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="mb-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All ({ notificationData.filter( ( n ) => !n.isDismissed ).length })</TabsTrigger>
                        <TabsTrigger value="unread">Unread ({ unreadCount })</TabsTrigger>
                        <TabsTrigger value="dismissed">Dismissed ({ dismissedCount })</TabsTrigger>
                    </TabsList>
                </Tabs>

                { notificationData.length > 0 && activeTab !== "dismissed" && unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={ markAllNotificationsAsRead } className="mb-3 mr-2 bg-transparent">
                        Mark All as Read
                    </Button>
                ) }
                { notificationData.length > 0 && activeTab === "dismissed" && dismissedCount > 0 && (
                    <Button variant="outline" size="sm" onClick={ clearDismissedNotifications } className="mb-3 bg-transparent">
                        Clear Dismissed
                    </Button>
                ) }

                { filteredNotifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                        { activeTab === "all" && "No active notificationData." }
                        { activeTab === "unread" && "All caught up! No unread notificationData." }
                        { activeTab === "dismissed" && "No dismissed notificationData." }
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        { filteredNotifications.map( ( notification ) => (
                            <div
                                key={ notification._id }
                                className={ `p-4 rounded-md border flex items-start gap-3 ${ notification.isRead ? "bg-muted/40" : "bg-card hover:bg-muted/20"
                                    } transition-colors` }
                            >
                                <BellRing
                                    className={ `h-5 w-5 mt-1 ${ notification.isRead ? "text-muted-foreground" : "text-primary" }` }
                                />
                                <div className="flex-grow">
                                    <h4 className={ `font-semibold ${ notification.isRead ? "text-muted-foreground" : "" }` }>
                                        { notification.titleSnapshot }
                                    </h4>
                                    { notification.messageSnapshot && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{ notification.messageSnapshot }</p>
                                    ) }
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Triggered: { formatDistanceToNow( new Date( notification.triggerDate ), { addSuffix: true } ) }
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-1 items-center">
                                    { !notification.isRead && !notification.isDismissed && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={ () => markNotificationAsRead( notification._id ) }
                                            className="h-8 px-2 text-xs"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Read
                                        </Button>
                                    ) }
                                    { !notification.isDismissed && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={ () => dismissNotification( notification._id ) }
                                            className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700"
                                        >
                                            <EyeOff className="h-3.5 w-3.5 mr-1" /> Dismiss
                                        </Button>
                                    ) }
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }
            </CardContent>
        </Card>
    );
}
