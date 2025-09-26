import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, BellOff, Mail, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// type AlertType = "price" | "volume" | "indicator" | "news";
// type AlertCondition = "above" | "below" | "crosses-above" | "crosses-below" | "percent-change";
// type AlertMethod = "app" | "email" | "sms";

// interface Alert {
//     id;
//     asset;
//     type;
//     condition;
//     value;
//     methods[];
//     active: boolean;
// }

export function AlertSystem ( { asset } ) {
    const [ alerts, setAlerts ] = useState( [
        {
            id: "1",
            asset: "BTC/USD",
            type: "price",
            condition: "above",
            value: 45000,
            methods: [ "app", "email" ],
            active: true,
        },
        {
            id: "2",
            asset: "BTC/USD",
            type: "price",
            condition: "below",
            value: 40000,
            methods: [ "app" ],
            active: true,
        },
        {
            id: "3",
            asset: "ETH/USD",
            type: "indicator",
            condition: "crosses-above",
            value: 70,
            methods: [ "app", "email" ],
            active: false,
        },
    ] );

    const [ newAlert, setNewAlert ] = useState( {
        asset: asset,
        type: "price",
        condition: "above",
        value: 0,
        methods: [ "app" ],
    } );

    const addAlert = () => {
        if ( !newAlert.value ) return;

        const alert = {
            id: Date.now().toString(),
            asset: newAlert.asset || asset,
            type: newAlert.type,
            condition: newAlert.condition,
            value: newAlert.value,
            methods: newAlert.methods,
            active: true,
        };

        setAlerts( [ ...alerts, alert ] );
        setNewAlert( {
            asset: asset,
            type: "price",
            condition: "above",
            value: 0,
            methods: [ "app" ],
        } );
    };

    const toggleAlert = ( id ) => {
        setAlerts( alerts.map( ( alert ) => ( alert.id === id ? { ...alert, active: !alert.active } : alert ) ) );
    };

    const deleteAlert = ( id ) => {
        setAlerts( alerts.filter( ( alert ) => alert.id !== id ) );
    };

    const toggleAlertMethod = ( method ) => {
        setNewAlert( ( prev ) => {
            const methods = prev.methods || [];
            if ( methods.includes( method ) ) {
                return { ...prev, methods: methods.filter( ( m ) => m !== method ) };
            } else {
                return { ...prev, methods: [ ...methods, method ] };
            }
        } );
    };

    const getConditionLabel = ( condition ) => {
        switch ( condition ) {
            case "above":
                return "rises above";
            case "below":
                return "falls below";
            case "crosses-above":
                return "crosses above";
            case "crosses-below":
                return "crosses below";
            case "percent-change":
                return "changes by";
            default:
                return condition;
        }
    };

    const getTypeLabel = ( type, value ) => {
        switch ( type ) {
            case "price":
                return `$${ value.toLocaleString() }`;
            case "volume":
                return `$${ value.toLocaleString() } volume`;
            case "indicator":
                return `RSI ${ value }`;
            case "news":
                return "important news";
            default:
                return type;
        }
    };

    const filteredAlerts = alerts.filter( ( alert ) => alert.asset === asset );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Alert System
                </CardTitle>
                <CardDescription>Set up custom alerts for { asset }</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Create Alert</TabsTrigger>
                        <TabsTrigger value="manage">Manage Alerts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="alertType">Alert Type</Label>
                                    <Select
                                        value={ newAlert.type }
                                        onValueChange={ ( value ) => setNewAlert( { ...newAlert, type: value } ) }
                                    >
                                        <SelectTrigger id="alertType">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="price">Price Alert</SelectItem>
                                            <SelectItem value="volume">Volume Alert</SelectItem>
                                            <SelectItem value="indicator">Indicator Alert</SelectItem>
                                            <SelectItem value="news">News Alert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alertCondition">Condition</Label>
                                    <Select
                                        value={ newAlert.condition }
                                        onValueChange={ ( value ) => setNewAlert( { ...newAlert, condition: value } ) }
                                    >
                                        <SelectTrigger id="alertCondition">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="above">Rises Above</SelectItem>
                                            <SelectItem value="below">Falls Below</SelectItem>
                                            <SelectItem value="crosses-above">Crosses Above</SelectItem>
                                            <SelectItem value="crosses-below">Crosses Below</SelectItem>
                                            <SelectItem value="percent-change">Percent Change</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alertValue">Value</Label>
                                    <Input
                                        id="alertValue"
                                        type="number"
                                        value={ newAlert.value || "" }
                                        onChange={ ( e ) => setNewAlert( { ...newAlert, value: Number( e.target.value ) } ) }
                                        placeholder={ newAlert.type === "price" ? "Enter price..." : "Enter value..." }
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Notification Methods</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="app-notifications"
                                            checked={ newAlert.methods?.includes( "app" ) }
                                            onCheckedChange={ () => toggleAlertMethod( "app" ) }
                                        />
                                        <Label htmlFor="app-notifications" className="flex items-center">
                                            <Bell className="h-4 w-4 mr-2" />
                                            App Notifications
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="email-notifications"
                                            checked={ newAlert.methods?.includes( "email" ) }
                                            onCheckedChange={ () => toggleAlertMethod( "email" ) }
                                        />
                                        <Label htmlFor="email-notifications" className="flex items-center">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Notifications
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="sms-notifications"
                                            checked={ newAlert.methods?.includes( "sms" ) }
                                            onCheckedChange={ () => toggleAlertMethod( "sms" ) }
                                        />
                                        <Label htmlFor="sms-notifications" className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            SMS Notifications
                                        </Label>
                                    </div>
                                </div>

                                <Button className="w-full mt-4" onClick={ addAlert } disabled={ !newAlert.value }>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Alert
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="manage" className="pt-4">
                        { filteredAlerts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Alert</TableHead>
                                        <TableHead>Notifications</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    { filteredAlerts.map( ( alert ) => (
                                        <TableRow key={ alert.id }>
                                            <TableCell>
                                                <div className="font-medium">
                                                    { alert.asset } { getConditionLabel( alert.condition ) } { getTypeLabel( alert.type, alert.value ) }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    { alert.methods.includes( "app" ) && (
                                                        <Badge variant="outline" className="text-xs">
                                                            App
                                                        </Badge>
                                                    ) }
                                                    { alert.methods.includes( "email" ) && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Email
                                                        </Badge>
                                                    ) }
                                                    { alert.methods.includes( "sms" ) && (
                                                        <Badge variant="outline" className="text-xs">
                                                            SMS
                                                        </Badge>
                                                    ) }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Switch checked={ alert.active } onCheckedChange={ () => toggleAlert( alert.id ) } />
                                                    <span className={ alert.active ? "text-green-500" : "text-muted-foreground" }>
                                                        { alert.active ? "Active" : "Inactive" }
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={ () => deleteAlert( alert.id ) }>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) ) }
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <BellOff className="h-10 w-10 text-muted-foreground mb-4" />
                                <h3 className="font-medium text-lg">No alerts set</h3>
                                <p className="text-muted-foreground">Create alerts to get notified about market changes</p>
                            </div>
                        ) }
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

