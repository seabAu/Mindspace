"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Calendar, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import HomeContainer from '@/pages/Home/HomeContainer';
import useGlobalStore from '@/store/global.store';

/**
 * Subscription status component for header display
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with subscription data
 * @returns {JSX.Element} Subscription status display
 */
export default function UserSubscriptionStatus ( { userData } ) {
    const user = useGlobalStore( ( state ) => state.user );
    const [ userStatusData, setUserStatusData ] = useState( userData || user );


    const [ daysLeft, setDaysLeft ] = useState( 0 );
    const [ subscriptionData, setSubscriptionData ] = useState( {
        plan: "pro",
        status: "active",
        currentPeriodEnd: "2024-02-15",
        cancelAtPeriodEnd: false,
    } );

    useEffect( () => {
        // Calculate days left in subscription
        if ( userStatusData && userStatusData.subscription ) {
            const endDate = new Date( user.subscription.currentPeriodEnd );
            const today = new Date();
            const timeDiff = endDate.getTime() - today.getTime();
            const daysDiff = Math.ceil( timeDiff / ( 1000 * 3600 * 24 ) );
            setDaysLeft( Math.max( 0, daysDiff ) );
            setSubscriptionData( userStatusData.subscription );
        }
    }, [ userStatusData ] );

    /**
     * Gets the appropriate status color and icon
     * @returns {Object} Status styling object
     */
    const getStatusDisplay = () => {
        if ( subscriptionData.cancelAtPeriodEnd ) {
            return {
                variant: "destructive",
                icon: <AlertTriangle className="h-3 w-3" />,
                text: "Canceling",
            };
        }

        if ( daysLeft <= 3 ) {
            return {
                variant: "destructive",
                icon: <AlertTriangle className="h-3 w-3" />,
                text: "Expiring Soon",
            };
        }

        if ( daysLeft <= 7 ) {
            return {
                variant: "secondary",
                icon: <Calendar className="h-3 w-3" />,
                text: "Renewing Soon",
            };
        }

        return {
            variant: "default",
            icon: <CheckCircle className="h-3 w-3" />,
            text: "Active",
        };
    };

    const statusDisplay = getStatusDisplay();

    // Don't show for free users
    if ( !userStatusData || userStatusData.plan === "free" ) {
        return null;
    }

    return (
        <div className="flex items-center space-x-3">
            {/* Desktop View */ }
            <div className="w-full hidden md:flex items-center space-x-3">
                <Card className="w-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-1 w-full justify-between">
                        <div className="flex w-full items-center space-x-3 justify-between flex-row">
                            <div className="flex items-center space-x-2">
                                <Crown className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">Premium</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Badge variant={ statusDisplay.variant } className="text-xs">
                                    { statusDisplay.icon }
                                    <span className="ml-1">{ statusDisplay.text }</span>
                                </Badge>
                            </div>

                        </div>

                        <div className="text-xs text-muted-foreground p-1">{ daysLeft } days left</div>

                        { daysLeft <= 7 && (
                            <div className="mt-2">
                                <Progress value={ ( daysLeft / 30 ) * 100 } className="h-1" />
                            </div>
                        ) }
                    </CardContent>
                </Card>

                { ( daysLeft <= 7 || subscriptionData.cancelAtPeriodEnd ) && (
                    <Button size="sm" variant="outline" asChild>
                        <Link to="/billing">{ subscriptionData.cancelAtPeriodEnd ? "Reactivate" : "Renew" }</Link>
                    </Button>
                ) }
            </div>

            {/* Mobile View */ }
            <div className="md:hidden">
                <Badge variant="default" className="flex items-center gap-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Plan
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                    <a href="/billing">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Billing
                    </a>
                </Button>
            </div>
        </div>
    );
}
