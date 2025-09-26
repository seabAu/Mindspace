import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as utils from 'akashatools';
import useGlobalStore from "@/store/global.store";

export function ReminderForm ( { onReminderCreated } ) {
    const user = useGlobalStore( ( state ) => state.user );
    const workspaceId = useGlobalStore( ( state ) => state.workspaceId );

    const [ title, setTitle ] = useState( "" );
    const [ message, setMessage ] = useState( "" );
    const [ triggerDate, setTriggerDate ] = useState( new Date() );
    const [ isRecurring, setIsRecurring ] = useState( false );
    const [ isSubmitting, setIsSubmitting ] = useState( false );

    const handleSubmit = async ( e ) => {
        e.preventDefault();
        setIsSubmitting( true );

        // These would come from auth context in a real app
        const MOCK_USER_ID = "60d21b4667d0d8992e610c84";
        const MOCK_WORKSPACE_ID = "60d21b4667d0d8992e610c85";

        const reminderData = {
            title,
            message,
            userId: user?.id ?? MOCK_USER_ID,
            workspaceId: workspaceId ?? MOCK_WORKSPACE_ID,
            triggerDates: [ triggerDate ],
            isRecurring,
            // A real form would have UI for rrules. This is a hardcoded example.
            rrules: isRecurring
                ? [
                    {
                        enabled: true,
                        rules: [ { ruleType: "onDay", onDays: [ "mon", "wed", "fri" ] } ],
                        startDate: triggerDate, // Use the selected date as the start time for recurrence
                        count: 10, // Example: repeat 10 times
                    },
                ]
                : [],
        };

        try {
            const response = await fetch( "/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( reminderData ),
            } );
            if ( !response.ok ) {
                const errorData = await response.json();
                throw new Error( errorData.message || "Failed to create reminder" );
            }
            setTitle( "" );
            setMessage( "" );
            onReminderCreated(); // Callback to refresh the list
        } catch ( error ) {
            console.error( error );
            alert( `Error: ${ error.message }` );
        } finally {
            setIsSubmitting( false );
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={ handleSubmit } className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={ title }
                            onChange={ ( e ) => setTitle( e.target.value ) }
                            required
                            placeholder="e.g., Follow up with client"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            value={ message }
                            onChange={ ( e ) => setMessage( e.target.value ) }
                            placeholder="Add a short note or details..."
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="recurring-switch">Recurring Reminder</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Does this reminder repeat on a schedule?</p>
                        </div>
                        <Switch id="recurring-switch" checked={ isRecurring } onCheckedChange={ setIsRecurring } />
                    </div>

                    <div>
                        <Label>{ isRecurring ? "Start Date" : "Trigger Date" }</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={ "outline" }
                                    className={ cn( "w-full justify-start text-left font-normal", !triggerDate && "text-muted-foreground" ) }
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    { triggerDate ? format( triggerDate, "PPP" ) : <span>Pick a date</span> }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={ triggerDate } onSelect={ setTriggerDate } initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    { isRecurring && (
                        <div className="p-4 border rounded-md bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground">
                                Recurrence rule UI is complex. For this demo, it's hardcoded to trigger every Mon, Wed, & Fri for 10
                                weeks.
                            </p>
                        </div>
                    ) }
                    <Button type="submit" className="w-full" disabled={ isSubmitting }>
                        { isSubmitting ? "Creating..." : "Create Reminder" }
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
