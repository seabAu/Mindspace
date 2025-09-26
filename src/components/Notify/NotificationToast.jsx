// Source: https://v0.dev/community/notification-card-5rrW0Dvjp6Y // 

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Check, CornerUpRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

// type NotificationProps = {
//     sender: string;
//     message: string;
//     time: string;
//     variant?: "light" | "dark";
//     onMarkAsRead?: () => void;
//     onReply?: ( message: string ) => void;
// };

const Notification = ( { sender, message, time, variant = "light", onMarkAsRead, onReply }) => {
    const isDark = variant === "dark";
    const [ isRead, setIsRead ] = useState( false );
    const [ showReadButton, setShowReadButton ] = useState( true );
    const [ isReplying, setIsReplying ] = useState( false );
    const [ replyText, setReplyText ] = useState( "" );
    const [ messageSent, setMessageSent ] = useState( false );
    const [ isReplyHovered, setIsReplyHovered ] = useState( false );
    const [ isReplyPressed, setIsReplyPressed ] = useState( false );
    const [ isAnimatingOut, setIsAnimatingOut ] = useState( false );
    const [ scope, animate ] = useAnimate();
    const inputRef = useRef ( null );
    const replyContainerRef = useRef( null );
    const buttonContainerRef = useRef( null );

    // Define fixed colors to ensure consistency
    const darkModeColors = {
        normal: "rgb(39, 39, 42)", // zinc-800
        hover: "rgb(63, 63, 70)", // zinc-700
        active: "rgb(63, 63, 70)", // zinc-700
        text: {
            normal: "rgb(228, 228, 231)", // zinc-200
            hover: "rgb(255, 255, 255)", // white
            active: "rgb(255, 255, 255)", // white
        },
    };

    const lightModeColors = {
        normal: "rgb(243, 244, 246)", // zinc-100
        hover: "rgb(229, 231, 235)", // zinc-200
        active: "rgb(229, 231, 235)", // zinc-200
        text: {
            normal: "rgb(82, 82, 91)", // zinc-600
            hover: "rgb(39, 39, 42)", // zinc-800
            active: "rgb(39, 39, 42)", // zinc-800
        },
    };

    // Get the appropriate background color based on state
    const getBackgroundColor = () => {
        const colors = isDark ? darkModeColors : lightModeColors;

        if ( isReplyPressed ) return colors.active;
        if ( isReplyHovered ) return colors.hover;
        return colors.normal;
    };

    // Get the appropriate text color based on state
    const getTextColor = () => {
        const colors = isDark ? darkModeColors.text : lightModeColors.text;

        if ( isReplyPressed ) return colors.active;
        if ( isReplyHovered ) return colors.hover;
        return colors.normal;
    };

    // Optimized spring animation config
    const springConfig = {
        type: "spring",
        stiffness: 170, // Increased stiffness for faster response
        damping: 26, // Balanced damping for controlled bounce
        mass: 0.8, // Reduced mass for lighter feel
    };

    // Exit animation config with slightly longer duration to ensure smooth completion
    const exitConfig = {
        type: "spring",
        stiffness: 170,
        damping: 26,
        mass: 0.8,
        restDelta: 0.001, // Smaller rest delta for smoother finish
        restSpeed: 0.001, // Smaller rest speed for smoother finish
    };

    // Auto-dismiss timer for "Marked as read" button
    useEffect( () => {
        let readButtonTimer;

        if ( isRead && showReadButton ) {
            readButtonTimer = setTimeout( () => {
                setShowReadButton( false );
            }, 1500 ); // Changed from 3000 to 1500 (1.5 seconds)
        }

        return () => {
            if ( readButtonTimer ) clearTimeout( readButtonTimer );
        };
    }, [ isRead, showReadButton ] );

    // Auto-dismiss timer for message sent confirmation
    useEffect( () => {
        let dismissTimer;

        if ( messageSent && !isAnimatingOut ) {
            dismissTimer = setTimeout( () => {
                // Start the exit animation
                setIsAnimatingOut( true );
            }, 1500 ); // 1.5 seconds
        }

        return () => {
            if ( dismissTimer ) clearTimeout( dismissTimer );
        };
    }, [ messageSent, isAnimatingOut ] );

    // Focus input when reply opens
    useEffect( () => {
        if ( isReplying && !messageSent && !isAnimatingOut && inputRef.current ) {
            setTimeout( () => {
                inputRef.current?.focus();
            }, 300 );
        }
    }, [ isReplying, messageSent, isAnimatingOut ] );

    const handleMarkAsRead = () => {
        if ( isRead ) return;

        setIsRead( true );
        animate( scope.current, { opacity: [ 1, 0.7, 1 ], scale: [ 1, 0.98, 1 ] }, { duration: 0.3 } );

        // Animate the icon to pulse
        animate( "svg.message-icon", { scale: [ 1, 1.2, 1 ] }, { duration: 0.4, ease: "easeInOut" } );

        onMarkAsRead?.();
    };

    const handleReplyClick = () => {
        // If a message was just sent, don't allow toggling
        if ( messageSent || isAnimatingOut ) return;

        const newIsReplying = !isReplying;
        setIsReplying( newIsReplying );
    };

    const handleSubmitReply = () => {
        if ( !replyText.trim() || messageSent || isAnimatingOut ) return;

        // Call the onReply callback with the message
        onReply?.( replyText );

        // Clear the input
        setReplyText( "" );

        // Show the confirmation message
        setMessageSent( true );
        setIsAnimatingOut( false );

        // Animate the notification to acknowledge the sent message
        animate( scope.current, { scale: [ 1, 1.02, 1 ] }, { duration: 0.4, ease: "easeInOut" } );
    };

    const handleKeyDown = ( e ) => {
        if ( e.key === "Enter" && !e.shiftKey ) {
            e.preventDefault();
            handleSubmitReply();
        }
    };

    // Handle animation complete
    const handleExitComplete = () => {
        // Use a slightly longer timeout to ensure the animation is completely finished
        setTimeout( () => {
            setMessageSent( false );
            setIsReplying( false );
            setIsAnimatingOut( false );
        }, 100 ); // Increased from 50ms to 100ms
    };

    return (
        <div className="flex flex-col">
            <motion.div
                ref={ scope }
                initial={ { opacity: 0, y: 20, scale: 0.95 } }
                animate={ { opacity: 1, y: 0, scale: 1 } }
                transition={ {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: variant === "dark" ? 0.15 : 0,
                } }
                className={ cn(
                    "p-5 rounded-xl w-full max-w-md border shadow-lg relative overflow-hidden",
                    isDark
                        ? "bg-zinc-900 text-white border-zinc-800 shadow-zinc-900/20"
                        : "bg-white text-zinc-800 border-zinc-100 shadow-zinc-300/10",
                ) }
                style={ {
                    boxShadow: isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.2)" : "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                } }
            >
                {/* Background decoration */ }
                <motion.div
                    className="absolute -right-12 -top-12 w-24 h-24 rounded-full opacity-10"
                    style={ {
                        background: isDark
                            ? "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 70%)"
                            : "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)",
                    } }
                    animate={ {
                        scale: [ 1, 1.1, 1 ],
                    } }
                    transition={ {
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    } }
                />

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <motion.div whileHover={ { rotate: [ 0, -10, 10, -5, 0 ] } } transition={ { duration: 0.5 } }>
                            <MessageCircle className={ cn( "message-icon w-5 h-5", isRead ? "text-zinc-400" : "text-emerald-500" ) } />
                        </motion.div>
                        <span className={ cn( "font-medium", isRead && "text-muted-foreground" ) }>New message from { sender }</span>
                    </div>
                    <motion.span
                        className="text-sm text-muted-foreground"
                        initial={ { opacity: 0.5 } }
                        animate={ { opacity: 1 } }
                        transition={ { delay: 0.3 } }
                    >
                        { time }
                    </motion.span>
                </div>

                <motion.p
                    className={ cn( "mb-4 text-muted-foreground", isRead && "opacity-75" ) }
                    initial={ { opacity: 0 } }
                    animate={ { opacity: 1 } }
                    transition={ { delay: 0.2 } }
                >
                    { message }
                </motion.p>

                {/* Button container with fixed layout */ }
                <div ref={ buttonContainerRef } className="flex gap-1 h-[42px] relative">
                    {/* Reply button - always present */ }
                    <motion.button
                        onClick={ handleReplyClick }
                        onMouseEnter={ () => setIsReplyHovered( true ) }
                        onMouseLeave={ () => setIsReplyHovered( false ) }
                        onMouseDown={ () => setIsReplyPressed( true ) }
                        onMouseUp={ () => setIsReplyPressed( false ) }
                        onTouchStart={ () => setIsReplyPressed( true ) }
                        onTouchEnd={ () => setIsReplyPressed( false ) }
                        layout
                        style={ {
                            backgroundColor: getBackgroundColor(),
                            color: getTextColor(),
                            transition: "background-color 0.2s ease, color 0.2s ease",
                            height: "42px",
                            transformOrigin: "center",
                            willChange: "transform",
                            flex: showReadButton || !isRead ? 1 : 2,
                        } }
                        className="py-2.5 px-4 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-1.5"
                    >
                        <CornerUpRight className="w-4 h-4" /> Reply
                    </motion.button>

                    {/* Mark as read button - conditionally rendered */ }
                    { ( showReadButton || !isRead ) && (
                        <motion.button
                            onClick={ handleMarkAsRead }
                            whileHover={ { scale: 1.02 } }
                            whileTap={ { scale: 0.98 } }
                            layout
                            style={ {
                                height: "42px",
                                transformOrigin: "center",
                                willChange: "transform, opacity",
                                flex: 1,
                            } }
                            className={ cn(
                                "py-2.5 px-4 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-1.5",
                                isRead
                                    ? isDark
                                        ? "bg-zinc-800/50 text-zinc-500"
                                        : "bg-zinc-100/50 text-zinc-400"
                                    : isDark
                                        ? "bg-zinc-800 text-emerald-400 hover:bg-zinc-700"
                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                            ) }
                            disabled={ isRead }
                        >
                            <AnimatePresence mode="wait">
                                { isRead ? (
                                    <motion.span
                                        key="checked"
                                        initial={ { opacity: 0, y: 5 } }
                                        animate={ { opacity: 1, y: 0 } }
                                        className="flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        <Check className="w-4 h-4" /> Marked as read
                                    </motion.span>
                                ) : (
                                    <motion.span key="unread" exit={ { opacity: 0, y: -5 } } className="whitespace-nowrap">
                                        Mark as read
                                    </motion.span>
                                ) }
                            </AnimatePresence>
                        </motion.button>
                    ) }
                </div>
            </motion.div>

            {/* Reply input with 4px gap */ }
            <AnimatePresence mode="wait" onExitComplete={ handleExitComplete }>
                { isReplying && !isAnimatingOut && (
                    <motion.div
                        ref={ replyContainerRef }
                        initial={ { opacity: 0, y: -10, height: 0 } }
                        animate={ { opacity: 1, y: 0, height: "auto" } }
                        exit={ { opacity: 0, y: -10, height: 0 } }
                        transition={ isAnimatingOut ? exitConfig : springConfig }
                        className="mt-1" // 4px gap
                    >
                        <div
                            className={ cn(
                                "p-3 rounded-xl w-full border flex items-center gap-2",
                                isDark ? "bg-zinc-900 text-white border-zinc-800" : "bg-white text-zinc-800 border-zinc-100",
                            ) }
                        >
                            { messageSent ? (
                                <motion.div
                                    key="confirmation"
                                    initial={ { opacity: 0, scale: 0.9 } }
                                    animate={ { opacity: 1, scale: 1 } }
                                    exit={ { opacity: 0, scale: 0.9 } }
                                    transition={ isAnimatingOut ? exitConfig : springConfig }
                                    className="flex items-center gap-2 w-full justify-center py-1"
                                >
                                    <motion.div
                                        initial={ { scale: 0 } }
                                        animate={ { scale: 1 } }
                                        exit={ { scale: 0 } }
                                        transition={ {
                                            ...springConfig,
                                            delay: 0.1,
                                        } }
                                    >
                                        <Check className={ cn( "w-4 h-4", isDark ? "text-emerald-400" : "text-emerald-500" ) } />
                                    </motion.div>
                                    <span className={ cn( "text-sm font-medium", isDark ? "text-emerald-400" : "text-emerald-600" ) }>
                                        Message has been sent
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="input"
                                    initial={ { opacity: 0 } }
                                    animate={ { opacity: 1 } }
                                    exit={ { opacity: 0 } }
                                    transition={ springConfig }
                                    className="flex w-full items-center gap-2"
                                >
                                    <input
                                        ref={ inputRef }
                                        type="text"
                                        value={ replyText }
                                        onChange={ ( e ) => setReplyText( e.target.value ) }
                                        onKeyDown={ handleKeyDown }
                                        placeholder={ `Reply to ${ sender }...` }
                                        className={ cn(
                                            "flex-1 bg-transparent border-none outline-none text-sm",
                                            isDark ? "placeholder:text-zinc-500" : "placeholder:text-zinc-400",
                                        ) }
                                    />
                                    <motion.button
                                        onClick={ handleSubmitReply }
                                        whileHover={ { scale: 1.05 } }
                                        whileTap={ { scale: 0.95 } }
                                        disabled={ !replyText.trim() }
                                        className={ cn(
                                            "p-2 rounded-full transition-colors",
                                            !replyText.trim()
                                                ? isDark
                                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                                : isDark
                                                    ? "bg-zinc-800 text-emerald-400 hover:bg-zinc-700"
                                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                                        ) }
                                    >
                                        <Send className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            ) }
                        </div>
                    </motion.div>
                ) }
            </AnimatePresence>
        </div>
    );
};

export default Notification
