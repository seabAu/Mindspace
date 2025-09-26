"use client";

import React, { useState } from "react";
// import { AdvancedBreadcrumbs } from "@/components/advanced-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CreditCard,
    Download,
    Plus,
    Trash2,
    Star,
    Calendar,
    DollarSign,
    Users,
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Settings,
} from "lucide-react";


export default function UserBillingPage () {
    const [ activeTab, setActiveTab ] = useState( "overview" );
    const [ showAddPaymentMethod, setShowAddPaymentMethod ] = useState( false );
    const [ paymentMethods, setPaymentMethods ] = useState( [
        {
            id: 1,
            type: "card",
            brand: "Visa",
            last4: "4242",
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
        },
        {
            id: 2,
            type: "card",
            brand: "Mastercard",
            last4: "5555",
            expiryMonth: 8,
            expiryYear: 2026,
            isDefault: false,
        },
    ] );

    const billingHistory = [
        {
            id: "inv_001",
            date: "2024-01-15",
            amount: 29.99,
            status: "paid",
            description: "Premium Plan - Monthly",
            downloadUrl: "#",
        },
        {
            id: "inv_002",
            date: "2023-12-15",
            amount: 29.99,
            status: "paid",
            description: "Premium Plan - Monthly",
            downloadUrl: "#",
        },
        {
            id: "inv_003",
            date: "2023-11-15",
            amount: 29.99,
            status: "paid",
            description: "Premium Plan - Monthly",
            downloadUrl: "#",
        },
        {
            id: "inv_004",
            date: "2023-10-15",
            amount: 29.99,
            status: "failed",
            description: "Premium Plan - Monthly",
            downloadUrl: "#",
        },
    ];

    const handleAddPaymentMethod = ( e ) => {
        e.preventDefault();
        // Simulate adding payment method
        const newMethod = {
            id: paymentMethods.length + 1,
            type: "card",
            brand: "Visa",
            last4: "1234",
            expiryMonth: 12,
            expiryYear: 2027,
            isDefault: false,
        };
        setPaymentMethods( [ ...paymentMethods, newMethod ] );
        setShowAddPaymentMethod( false );
    };

    const handleSetDefault = ( id ) => {
        setPaymentMethods( ( methods ) =>
            methods.map( ( method ) => ( {
                ...method,
                isDefault: method.id === id,
            } ) ),
        );
    };

    const handleRemovePaymentMethod = ( id ) => {
        setPaymentMethods( ( methods ) => methods.filter( ( method ) => method.id !== id ) );
    };

    const getStatusIcon = ( status ) => {
        switch ( status ) {
            case "paid":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "failed":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = ( status ) => {
        const variants = {
            paid: "default",
            failed: "destructive",
            pending: "secondary",
        };
        return (
            <Badge variant={ variants[ status ] || "secondary" } className="text-xs">
                { status.charAt( 0 ).toUpperCase() + status.slice( 1 ) }
            </Badge>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 container py-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold">Billing & Subscription</h1>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                        <Settings className="mr-1 h-3 w-3" />
                        Billing Settings
                    </Button>
                </div>

                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="tabs-compact">
                    <TabsList className="mb-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                        <TabsTrigger value="history">Billing History</TabsTrigger>
                        <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            <Card className="border-border/50 card-compact">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Current Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold">Premium Plan</div>
                                    <p className="text-xs text-muted-foreground">$29.99/month</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Next Billing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold">Feb 15</div>
                                    <p className="text-xs text-muted-foreground">in 12 days</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Usage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold">2,450</div>
                                    <p className="text-xs text-muted-foreground">of unlimited</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold text-green-600">Active</div>
                                    <p className="text-xs text-muted-foreground">Auto-renew on</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Recent Invoices</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        { billingHistory.slice( 0, 3 ).map( ( invoice ) => (
                                            <div
                                                key={ invoice.id }
                                                className="flex items-center justify-between p-2 border rounded-md border-border/30"
                                            >
                                                <div className="flex items-center gap-2">
                                                    { getStatusIcon( invoice.status ) }
                                                    <div>
                                                        <div className="text-xs font-medium">{ invoice.description }</div>
                                                        <div className="text-xs text-muted-foreground">{ invoice.date }</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium">${ invoice.amount }</span>
                                                    { getStatusBadge( invoice.status ) }
                                                </div>
                                            </div>
                                        ) ) }
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                                        View All Invoices
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Payment Methods</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        { paymentMethods.slice( 0, 2 ).map( ( method ) => (
                                            <div
                                                key={ method.id }
                                                className="flex items-center justify-between p-2 border rounded-md border-border/30"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    <div>
                                                        <div className="text-xs font-medium">
                                                            { method.brand } •••• { method.last4 }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Expires { method.expiryMonth }/{ method.expiryYear }
                                                        </div>
                                                    </div>
                                                </div>
                                                { method.isDefault && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Default
                                                    </Badge>
                                                ) }
                                            </div>
                                        ) ) }
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                                        Manage Payment Methods
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="payment-methods">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold">Payment Methods</h2>
                            <Dialog open={ showAddPaymentMethod } onOpenChange={ setShowAddPaymentMethod }>
                                <DialogTrigger asChild>
                                    <Button className="h-7 text-xs">
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Payment Method
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Payment Method</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={ handleAddPaymentMethod } className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Expiry Date</Label>
                                                <Input id="expiry" placeholder="MM/YY" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Cardholder Name</Label>
                                            <Input id="name" placeholder="John Doe" required />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={ () => setShowAddPaymentMethod( false ) }>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Add Card</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            { paymentMethods.map( ( method ) => (
                                <Card key={ method.id } className="border-border/50 card-compact">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                <CardTitle className="text-sm">
                                                    { method.brand } •••• { method.last4 }
                                                </CardTitle>
                                            </div>
                                            { method.isDefault && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Default
                                                </Badge>
                                            ) }
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">
                                                Expires { method.expiryMonth }/{ method.expiryYear }
                                            </p>
                                            <div className="flex gap-2">
                                                { !method.isDefault && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs bg-transparent"
                                                        onClick={ () => handleSetDefault( method.id ) }
                                                    >
                                                        Set as Default
                                                    </Button>
                                                ) }
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs text-destructive hover:text-destructive bg-transparent"
                                                    onClick={ () => handleRemovePaymentMethod( method.id ) }
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) ) }
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold">Billing History</h2>
                            <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                <Download className="mr-1 h-3 w-3" />
                                Export All
                            </Button>
                        </div>

                        <Card className="border-border/50 card-compact">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border/30">
                                                <th className="text-left p-3 text-xs font-medium">Invoice</th>
                                                <th className="text-left p-3 text-xs font-medium">Date</th>
                                                <th className="text-left p-3 text-xs font-medium">Description</th>
                                                <th className="text-left p-3 text-xs font-medium">Amount</th>
                                                <th className="text-left p-3 text-xs font-medium">Status</th>
                                                <th className="text-left p-3 text-xs font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { billingHistory.map( ( invoice ) => (
                                                <tr key={ invoice.id } className="border-b border-border/20">
                                                    <td className="p-3 text-xs font-mono">{ invoice.id }</td>
                                                    <td className="p-3 text-xs">{ invoice.date }</td>
                                                    <td className="p-3 text-xs">{ invoice.description }</td>
                                                    <td className="p-3 text-xs font-medium">${ invoice.amount }</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            { getStatusIcon( invoice.status ) }
                                                            { getStatusBadge( invoice.status ) }
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Download
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ) ) }
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subscription">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Current Subscription</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Plan</span>
                                            <Badge variant="default" className="text-xs">
                                                Premium Plan
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Price</span>
                                            <span className="text-sm">$29.99/month</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Next Billing</span>
                                            <span className="text-sm">February 15, 2024</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Status</span>
                                            <Badge variant="default" className="text-xs bg-green-500">
                                                Active
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Usage This Month</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Projects</span>
                                                <span>12 of unlimited</span>
                                            </div>
                                            <div className="h-2 bg-muted/20 rounded-full">
                                                <div className="h-2 bg-primary rounded-full" style={ { width: "20%" } }></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Storage</span>
                                                <span>2.4 GB of unlimited</span>
                                            </div>
                                            <div className="h-2 bg-muted/20 rounded-full">
                                                <div className="h-2 bg-primary rounded-full" style={ { width: "15%" } }></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>API Calls</span>
                                                <span>1,250 of unlimited</span>
                                            </div>
                                            <div className="h-2 bg-muted/20 rounded-full">
                                                <div className="h-2 bg-primary rounded-full" style={ { width: "10%" } }></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Subscription Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full h-8 text-xs bg-transparent">
                                            Change Plan
                                        </Button>
                                        <Button variant="outline" className="w-full h-8 text-xs bg-transparent">
                                            Update Billing Cycle
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full h-8 text-xs text-destructive hover:text-destructive bg-transparent"
                                        >
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 card-compact">
                                <CardHeader>
                                    <CardTitle className="text-sm">Billing Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-xs">
                                            <div className="font-medium">Billing Address</div>
                                            <div className="text-muted-foreground">
                                                123 Main Street
                                                <br />
                                                San Francisco, CA 94105
                                                <br />
                                                United States
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                            Update Address
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
