"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function PomodoroTimerCreationCard ( { onCreateTimer, timerSize = 20 } ) {
    const [ isActive, setIsActive ] = useState( false );
    const [ selectedDate, setSelectedDate ] = useState( undefined );
    const [ timerName, setTimerName ] = useState( "" );
    const [ step, setStep ] = useState( "initial" );
    const inputRef = useRef( null );

    useEffect( () => {
        if ( step === "name" && inputRef.current ) {
            inputRef.current.focus();
        }
    }, [ step ] );

    const handleClick = () => {
        if ( step === "initial" ) {
            setStep( "date" );
            setIsActive( true );
        }
    };

    const handleCancel = () => {
        setStep( "initial" );
        setIsActive( false );
        setSelectedDate( undefined );
        setTimerName( "" );
    };

    const handleConfirm = () => {
        if ( step === "date" && selectedDate ) {
            setStep( "name" );
        } else if ( step === "name" && timerName && selectedDate ) {
            const now = new Date();
            const timerType = selectedDate > now ? "till" : "from";
            onCreateTimer( {
                name: timerName,
                endDate: selectedDate,
                type: timerType,
            } );
            handleCancel();
        }
    };

    const handleKeyDown = ( e ) => {
        if ( e.key === "Enter" && timerName && selectedDate ) {
            handleConfirm();
        }
    };

    return (
        <Card
            className={ `w-[${ String( timerSize ) }rem] h-[${ String( timerSize ) }rem] rounded-lg overflow-visible transition-all duration-200 
        ${ step === "initial" ? "bg-transparent border border-muted-foreground/30 opacity-10 hover:opacity-80" : "bg-card" }
        ${ step === "initial" ? "hover:opacity-100 cursor-pointer" : "" }
      `}
            onClick={ handleClick }
        >
            <CardContent className="p-8 h-full flex flex-col items-center justify-center relative">
                { step === "initial" && <Plus className="w-12 h-12 text-muted-foreground/50" /> }
                { step === "date" && (
                    <>
                        <Calendar
                            mode="single"
                            selected={ selectedDate }
                            onSelect={ ( date ) => setSelectedDate( date ) }
                            className="rounded-md scale-[1] border-none"
                        />
                        <div className="flex justify-between w-full absolute bottom-4 left-0 right-0 px-4">
                            <Button variant="outline" onClick={ handleCancel }>
                                Cancel
                            </Button>
                            <Button onClick={ handleConfirm } disabled={ !selectedDate }>
                                Confirm
                            </Button>
                        </div>
                    </>
                ) }
                { step === "name" && (
                    <>
                        { selectedDate && (
                            <p className="text-xs text-muted-foreground text-center mb-4 font-mono">
                                { selectedDate.toLocaleString( undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                } ) }
                            </p>
                        ) }
                        <Input
                            ref={ inputRef }
                            type="text"
                            placeholder="Description"
                            value={ timerName }
                            onChange={ ( e ) => setTimerName( e.target.value ) }
                            onKeyDown={ handleKeyDown }
                            className="mb-4 w-full font-mono"
                        />
                        <div className="flex justify-between w-full absolute -bottom-6 left-0 right-0 px-4">
                            <Button variant="outline" onClick={ handleCancel }>
                                Cancel
                            </Button>
                            <Button onClick={ handleConfirm } disabled={ !timerName }>
                                Create Timer
                            </Button>
                        </div>
                    </>
                ) }
            </CardContent>
        </Card>
    );
}

