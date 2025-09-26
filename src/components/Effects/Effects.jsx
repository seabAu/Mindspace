// A set of multiple different visual effects found on codepen, v0.dev, and https://21st.dev/.

import React, { useState } from "react";
import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";
import * as utils from 'akashatools';
import './Effects.css';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import { randomColor, rgbRand } from "@/lib/utilities/color";
import { useNavigate } from "react-router-dom";

const Effects = () => {
    return (
        <div>
            Effects
        </div>
    );
};

const Glow = ( props ) => {
    const {
        content, // Currently just taking text
        filters, // Filter options, object
        filterColor,
        fontSize,
    } = props;

    const getFilters = ( input ) => {
        // input is the filter name we want to use. 
        return (
            <div className="filters-container">
                <svg className="filters" width='1440px' height='300px' viewBox='0 0 1440 300' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <defs>
                        <filter id="glow-4" color-interpolation-filters="sRGB" x="-50%" y="-200%" width="200%" Height="500%">
                            <feGaussianBlur in="SourceGraphic" data-target-blur="4" stdDeviation="4" result="blur4" />
                            <feGaussianBlur in="SourceGraphic" data-target-blur="19" stdDeviation="19" result="blur19" />
                            <feGaussianBlur in="SourceGraphic" data-target-blur="9" stdDeviation="9" result="blur9" />
                            <feGaussianBlur in="SourceGraphic" data-target-blur="30" stdDeviation="30" result="blur30" />
                            <feColorMatrix in="blur4" result="color-0-blur" type="matrix" values="1 0 0 0 0
                              0 0.9803921568627451 0 0 0
                              0 0 0.9647058823529412 0 0
                              0 0 0 0.8 0" />
                            <feOffset in="color-0-blur" result="layer-0-offsetted" dx="0" dy="0" data-target-offset-y="0" />
                            <feColorMatrix in="blur19" result="color-1-blur" type="matrix" values="0.8156862745098039 0 0 0 0
                              0 0.49411764705882355 0 0 0
                              0 0 0.2627450980392157 0 0
                              0 0 0 1 0" />
                            <feOffset in="color-1-blur" result="layer-1-offsetted" dx="0" dy="2" data-target-offset-y="2" />
                            <feColorMatrix in="blur9" result="color-2-blur" type="matrix" values="1 0 0 0 0
                              0 0.6666666666666666 0 0 0
                              0 0 0.36470588235294116 0 0
                              0 0 0 0.65 0" />
                            <feOffset in="color-2-blur" result="layer-2-offsetted" dx="0" dy="2" data-target-offset-y="2" />
                            <feColorMatrix in="blur30" result="color-3-blur" type="matrix" values="1 0 0 0 0
                              0 0.611764705882353 0 0 0
                              0 0 0.39215686274509803 0 0
                              0 0 0 1 0" />
                            <feOffset in="color-3-blur" result="layer-3-offsetted" dx="0" dy="2" data-target-offset-y="2" />
                            <feColorMatrix in="blur30" result="color-4-blur" type="matrix" values="0.4549019607843137 0 0 0 0
                              0 0.16470588235294117 0 0 0
                              0 0 0 0 0
                              0 0 0 1 0" />
                            <feOffset in="color-4-blur" result="layer-4-offsetted" dx="0" dy="16" data-target-offset-y="16" />
                            <feColorMatrix in="blur30" result="color-5-blur" type="matrix" values="0.4235294117647059 0 0 0 0
                              0 0.19607843137254902 0 0 0
                              0 0 0.11372549019607843 0 0
                              0 0 0 1 0" />
                            <feOffset in="color-5-blur" result="layer-5-offsetted" dx="0" dy="64" data-target-offset-y="64" />
                            <feColorMatrix in="blur30" result="color-6-blur" type="matrix" values="0.21176470588235294 0 0 0 0
                              0 0.10980392156862745 0 0 0
                              0 0 0.07450980392156863 0 0
                              0 0 0 1 0" />
                            <feOffset in="color-6-blur" result="layer-6-offsetted" dx="0" dy="64" data-target-offset-y="64" />
                            <feColorMatrix in="blur30" result="color-7-blur" type="matrix" values="0 0 0 0 0
                              0 0 0 0 0
                              0 0 0 0 0
                              0 0 0 0.68 0" />
                            <feOffset in="color-7-blur" result="layer-7-offsetted" dx="0" dy="64" data-target-offset-y="64" />
                            <feMerge>
                                <feMergeNode in="layer-0-offsetted" />
                                <feMergeNode in="layer-1-offsetted" />
                                <feMergeNode in="layer-2-offsetted" />
                                <feMergeNode in="layer-3-offsetted" />
                                <feMergeNode in="layer-4-offsetted" />
                                <feMergeNode in="layer-5-offsetted" />
                                <feMergeNode in="layer-6-offsetted" />
                                <feMergeNode in="layer-7-offsetted" />
                                <feMergeNode in="layer-0-offsetted" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>
        );
    };

    const getGlow = ( input ) => {
        return (
            <div className="glow-filter-content">
                <span
                    className="glow-filter"
                    data-text={ `${ input.toString() }` }
                ></span>
            </div>
        );
    };

    return ( utils.val.isValid( content, true ) && (
        <div className="glow-filter-container" aria-hidden="true">
            {
                getGlow( content )
            }
            {
                getFilters( filters )
            }
        </div>
    ) );
};

Effects.Glow = Glow;

const HoverShadow = ( {
    children,
} ) => {
    return (
        <div className='relative group cursor-pointer'>
            <div className='absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200'></div>
            <div className='relative ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start'>
                { children }
            </div>
        </div>
    );
};

Effects.HoverShadow = HoverShadow;

function FloatingPaths ( { position } ) {
    const paths = Array.from( { length: 36 }, ( _, i ) => ( {
        id: i,
        d: `M-${ 380 - i * 5 * position } -${ 189 + i * 6 }C-${ 380 - i * 5 * position
            } -${ 189 + i * 6 } -${ 312 - i * 5 * position } ${ 216 - i * 6 } ${ 152 - i * 5 * position
            } ${ 343 - i * 6 }C${ 616 - i * 5 * position } ${ 470 - i * 6 } ${ 684 - i * 5 * position
            } ${ 875 - i * 6 } ${ 684 - i * 5 * position } ${ 875 - i * 6 }`,
        color: `rgba(15,23,42,${ 0.1 + i * 0.03 })`,
        width: 0.5 + i * 0.03,
    } ) );

    return (
        <div className="absolute inset-0 pointer-events-none ">
            <svg className={ 'w-full h-full text-secondary-900 dark:text-white' } viewBox="0 0 696 316" fill="none">
                <filter id="blur">
                    <feGaussianBlur stdDeviation="2" />
                </filter>
                {/* <title>Background Paths</title> */ }
                { paths.map( ( path ) => (
                    <motion.path
                        key={ path.id }
                        d={ path.d }
                        radius={ 2 }
                        repeatCount={ 5 }

                        stroke={ `#${ randomColor() }` }
                        strokeWidth={ path.width + Math.floor( Math.random() * 15 ) }
                        strokeOpacity={ 0.5 * Math.random() + path.id * 0.03 }
                        initial={ { pathLength: 0.3, opacity: 0.6 } }
                        animate={ {
                            pathLength: Math.floor( Math.random() * 5 ),
                            opacity: [ 0.3, 0.6, 0.3 ],
                            pathOffset: [ 0, 1, 0 ],
                        } }
                        transition={ {
                            duration: Math.random() * 56 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        } }
                    // filter={ `25px` }
                    />
                ) ) }
            </svg>
        </div>
    );
}

Effects.FloatingPaths = FloatingPaths;

function BackgroundPaths ( props ) {
    const {
        background = true,
        title = "Background Paths",
        content = "Discover Excellence",
        tagline = '',
        icon = "→",
        link,
    } = props;
    const navigate = useNavigate();

    const words = title.split( " " );

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden dark:bg-Neutrals/neutrals-12">
            <div className="absolute inset-0 blur-[1.6rem] mix-blend-plus-darker !bg-blend-color-dodge">
                <FloatingPaths position={ 5 } />
                <FloatingPaths position={ 3 } />
                <FloatingPaths position={ -1 } />
            </div>

            { !background && ( <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={ { opacity: 0 } }
                    animate={ { opacity: 1 } }
                    transition={ { duration: 2 } }
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-3xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-widest">
                        { words.map( ( word, wordIndex ) => (
                            <span key={ wordIndex } className="inline-block mr-4 last:mr-0">
                                { word.split( "" ).map( ( letter, letterIndex ) => (
                                    <motion.span
                                        key={ `${ wordIndex }-${ letterIndex }` }
                                        initial={ { y: 100, opacity: 0 } }
                                        animate={ { y: 0, opacity: 1 } }
                                        transition={ {
                                            delay: wordIndex * 0.1 + letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        } }
                                        className={ `inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-Neutrals/neutrals-8 to-Neutrals/neutrals-6/80 dark:from-white dark:to-white/80 text-[3.0rem] font-sans font-extrabold`}
                                    >
                                        { letter }
                                    </motion.span>
                                ) ) }
                            </span>
                        ) ) }
                    </h1>

                    <div
                        className="inline-block group relative bg-gradient-to-b from-sextary-900/10 to-white/10 
                        dark:from-primary-200/10 dark:to-primary-900/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Button
                            variant="ghost"
                            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/95 hover:bg-white/10 dark:bg-black/95 dark:hover:bg-black/10 
                            text-black dark:text-white transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                            hover:shadow-md dark:hover:shadow-neutral-800/50"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                if ( link ) navigate( link );
                            } }
                        >
                            { content !== '' && ( <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                { content }
                            </span> ) }
                            { icon !== '' && ( <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
                            >
                                { icon }
                            </span> ) }
                        </Button>
                    </div>
                </motion.div>
            </div> ) }
        </div>
    );
}

Effects.BackgroundPaths = BackgroundPaths;

function GradientShadowCard ( { children } ) {
    return (
        <div
            className={ twMerge(
                `p-6 rounded-lg bg-white cursor-pointer`,
                `shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_2px_4px_-1px_rgba(0,0,0,0.26),0_0_0_1px_rgba(59,130,246,0.5),0_0_0_4px_rgba(249,115,22,0.25)]`,
                `hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_3px_rgba(59,130,246,0.5),0_0_0_8px_rgba(249,115,22,0.25)]`,
                `focus:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.26),inset_0_0_0_3px_rgba(59,130,246,0.5),inset_0_0_0_8px_rgba(249,115,22,0.25)]`,
                `transition-all duration-500 ease-in-out"`
            ) }
        >
            { children }
        </div>
    );
}
/* 
// Example usage of the card
function ExampleUsage () {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <GradientShadowCard>
                <h2 className="text-2xl font-bold mb-2">Gradient Shadow Card</h2>
                <p className="text-gray-600">
                    This card has a large gradient box shadow that changes on hover and becomes inset when focused.
                </p>
            </GradientShadowCard>
        </div>
    )
}
*/
Effects.GradientShadowCard = GradientShadowCard;




/* interface GlowingEffectProps {
  blur?
  inactiveZone?
  proximity?
  spread?
  variant?: "default" | "white"
  glow?: boolean
  className?: string
  disabled?: boolean
  movementDuration?
  borderWidth?
} */
const GlowingEffect = memo(
    ( {
        blur = 0,
        inactiveZone = 0.7,
        proximity = 0,
        spread = 20,
        variant = "default",
        glow = false,
        className,
        movementDuration = 2,
        borderWidth = 1,
        disabled = true,
    } ) => {
        const containerRef = useRef < HTMLDivElement > ( null );
        const lastPosition = useRef( { x: 0, y: 0 } );
        const animationFrameRef = useRef < number > ( 0 );

        const handleMove = useCallback(
            ( e ) => {
                if ( !containerRef.current ) return;

                if ( animationFrameRef.current ) {
                    cancelAnimationFrame( animationFrameRef.current );
                }

                animationFrameRef.current = requestAnimationFrame( () => {
                    const element = containerRef.current;
                    if ( !element ) return;

                    const { left, top, width, height } = element.getBoundingClientRect();
                    const mouseX = e?.x ?? lastPosition.current.x;
                    const mouseY = e?.y ?? lastPosition.current.y;

                    if ( e ) {
                        lastPosition.current = { x: mouseX, y: mouseY };
                    }

                    const center = [ left + width * 0.5, top + height * 0.5 ];
                    const distanceFromCenter = Math.hypot( mouseX - center[ 0 ], mouseY - center[ 1 ] );
                    const inactiveRadius = 0.5 * Math.min( width, height ) * inactiveZone;

                    if ( distanceFromCenter < inactiveRadius ) {
                        element.style.setProperty( "--active", "0" );
                        return;
                    }

                    const isActive =
                        mouseX > left - proximity &&
                        mouseX < left + width + proximity &&
                        mouseY > top - proximity &&
                        mouseY < top + height + proximity;

                    element.style.setProperty( "--active", isActive ? "1" : "0" );

                    if ( !isActive ) return;

                    const currentAngle = Number.parseFloat( element.style.getPropertyValue( "--start" ) ) || 0;
                    const targetAngle = ( 180 * Math.atan2( mouseY - center[ 1 ], mouseX - center[ 0 ] ) ) / Math.PI + 90;

                    const angleDiff = ( ( targetAngle - currentAngle + 180 ) % 360 ) - 180;
                    const newAngle = currentAngle + angleDiff;

                    animate( currentAngle, newAngle, {
                        duration: movementDuration,
                        ease: [ 0.16, 1, 0.3, 1 ],
                        onUpdate: ( value ) => {
                            element.style.setProperty( "--start", String( value ) );
                        },
                    } );
                } );
            },
            [ inactiveZone, proximity, movementDuration ],
        );

        useEffect( () => {
            if ( disabled ) return;

            const handleScroll = () => handleMove();
            const handlePointerMove = ( e ) => handleMove( e );

            window.addEventListener( "scroll", handleScroll, { passive: true } );
            document.body.addEventListener( "pointermove", handlePointerMove, {
                passive: true,
            } );

            return () => {
                if ( animationFrameRef.current ) {
                    cancelAnimationFrame( animationFrameRef.current );
                }
                window.removeEventListener( "scroll", handleScroll );
                document.body.removeEventListener( "pointermove", handlePointerMove );
            };
        }, [ handleMove, disabled ] );

        return (
            <>
                <div
                    className={ cn(
                        "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
                        glow && "opacity-100",
                        variant === "white" && "border-white",
                        disabled && "!block",
                    ) }
                />
                <div
                    ref={ containerRef }
                    style={
                        {
                            "--blur": `${ blur }px`,
                            "--spread": spread,
                            "--start": "0",
                            "--active": "0",
                            "--glowingeffect-border-width": `${ borderWidth }px`,
                            "--repeating-conic-gradient-times": "5",
                            "--gradient":
                                variant === "white"
                                    ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                                    : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
                )`,
                        }
                    }
                    className={ cn(
                        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
                        glow && "opacity-100",
                        blur > 0 && "blur-[var(--blur)] ",
                        className,
                        disabled && "!hidden",
                    ) }
                >
                    <div
                        className={ cn(
                            "glow",
                            "rounded-[inherit]",
                            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                            "after:[mask-clip:padding-box,border-box]",
                            "after:[mask-composite:intersect]",
                            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
                        ) }
                    />
                </div>
            </>
        );
    },
);

GlowingEffect.displayName = "GlowingEffect";
Effects.GlowingEffect = GlowingEffect;


const GooeyFilter = ( { id = "goo-filter", strength = 10 } ) => {
    return (
        <svg className="hidden absolute">
            <defs>
                <filter id={ id }>
                    <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation={ strength }
                        result="blur"
                    />
                    <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                        result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </defs>
        </svg>
    );
};

/*  // Example usage: 
    import { useState } from "react";
    import { AnimatePresence, motion } from "framer-motion";
    import { GooeyFilter } from "@/components/ui/gooey-filter";

    import { useScreenSize } from "@/hooks/use-screen-size";
    import { Button } from "@/components/ui/button";

    const TAB_CONTENT = [
        {
            title: "2024",
            files: [
                "learning-to-meditate.md",
                "spring-garden-plans.md",
                "travel-wishlist.md",
                "new-coding-projects.md",
            ],
        },
        {
            title: "2023",
            files: [
                "year-in-review.md",
                "marathon-training-log.md",
                "recipe-collection.md",
                "book-reflections.md",
            ],
        },
        {
            title: "2022",
            files: [
                "moving-to-a-new-city.md",
                "starting-a-blog.md",
                "photography-basics.md",
                "first-coding-project.md",
            ],
        },
        {
            title: "2021",
            files: [
                "goals-and-aspirations.md",
                "daily-gratitude.md",
                "learning-to-cook.md",
                "remote-work-journal.md",
            ],
        },
    ];

    function GooeyDemo () {
        const [ activeTab, setActiveTab ] = useState( 0 );
        const [ isGooeyEnabled, setIsGooeyEnabled ] = useState( true );
        const screenSize = useScreenSize();

        return (
            <div className="relative w-full h-full min-h-[600px] flex justify-center p-8 font-calendas md:text-base text-xs sm:text-sm bg-white dark:bg-black">
                <GooeyFilter
                    id="gooey-filter"
                    strength={ screenSize.lessThan( "md" ) ? 8 : 15 }
                />

                <Button
                    variant="outline"
                    onClick={ () => setIsGooeyEnabled( !isGooeyEnabled ) }
                    className="absolute top-4 left-4 font-overusedGrotesk"
                >
                    { isGooeyEnabled ? "Disable filter" : "Enable filter" }
                </Button>

                <div className="w-11/12 md:w-4/5 relative mt-24">
                    <div
                        className="absolute inset-0"
                        style={ { filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" } }
                    >
                        <div className="flex w-full ">
                            { TAB_CONTENT.map( ( _, index ) => (
                                <div key={ index } className="relative flex-1 h-8 md:h-12">
                                    { activeTab === index && (
                                        <motion.div
                                            layoutId="active-tab"
                                            className="absolute inset-0 bg-[#efefef]"
                                            transition={ {
                                                type: "spring",
                                                bounce: 0.0,
                                                duration: 0.4,
                                            } }
                                        />
                                    ) }
                                </div>
                            ) ) }
                        </div>
                        <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-[#efefef] overflow-hidden text-muted-foreground">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={ activeTab }
                                    initial={ {
                                        opacity: 0,
                                        y: 50,
                                        filter: "blur(10px)",
                                    } }
                                    animate={ {
                                        opacity: 1,
                                        y: 0,
                                        filter: "blur(0px)",
                                    } }
                                    exit={ {
                                        opacity: 0,
                                        y: -50,
                                        filter: "blur(10px)",
                                    } }
                                    transition={ {
                                        duration: 0.2,
                                        ease: "easeOut",
                                    } }
                                    className="p-8 md:p-12"
                                >
                                    <div className="space-y-2 mt-4 sm:mt-8 md:mt-8">
                                        <ul className="">
                                            { TAB_CONTENT[ activeTab ].files.map( ( file, index ) => (
                                                <li
                                                    key={ file }
                                                    className="border-b border-muted-foreground/50 pt-2 pb-1 text-black"
                                                >
                                                    { file }
                                                </li>
                                            ) ) }
                                        </ul>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="relative flex w-full ">
                        { TAB_CONTENT.map( ( tab, index ) => (
                            <button
                                key={ index }
                                onClick={ () => setActiveTab( index ) }
                                className="flex-1 h-8 md:h-12"
                            >
                                <span
                                    className={ `
                    w-full h-full flex items-center justify-center
                    ${ activeTab === index ? "text-black" : "text-muted-foreground" }
                `}
                                >
                                    { tab.title }
                                </span>
                            </button>
                        ) ) }
                    </div>
                </div>
            </div>
        );
    }

    export { GooeyDemo }; 
*/

GooeyFilter.displayName = "GooeyFilter";
Effects.GooeyFilter = GooeyFilter;

export { GooeyFilter };



export default Effects;


/*  import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
    import { GlowingEffect } from "@/components/ui/glowing-effect";
    export default function GlowingEffectDemo () {
        return (
            <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
                <GridItem
                    area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                    icon={ <Box className="h-4 w-4 text-black dark:text-neutral-400" /> }
                    title="Do things the right way"
                    description="Running out of copy so I'll write anything."
                />

                <GridItem
                    area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                    icon={ <Settings className="h-4 w-4 text-black dark:text-neutral-400" /> }
                    title="The best AI code editor ever."
                    description="Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me."
                />

                <GridItem
                    area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                    icon={ <Lock className="h-4 w-4 text-black dark:text-neutral-400" /> }
                    title="You should buy Aceternity UI Pro"
                    description="It's the best money you'll ever spend"
                />

                <GridItem
                    area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                    icon={ <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" /> }
                    title="This card is also built by Cursor"
                    description="I'm not even kidding. Ask my mom if you don't believe me."
                />

                <GridItem
                    area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                    icon={ <Search className="h-4 w-4 text-black dark:text-neutral-400" /> }
                    title="Coming soon on Aceternity UI"
                    description="I'm writing the code as I record this, no shit."
                />
            </ul>
        );
    }

    const GridItem = ( { area, icon, title, description }: GridItemProps ) => {
        return (
            <li className={ `min-h-[14rem] list-none ${ area }` }>
                <div className="relative h-full rounded-2.5xl border  p-2  md:rounded-3xl md:p-3">
                    <GlowingEffect spread={ 40 } glow={ true } disabled={ false } proximity={ 64 } inactiveZone={ 0.01 } />
                    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6  dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                            <div className="w-fit rounded-lg border border-gray-600 p-2 ">{ icon }</div>
                            <div className="space-y-3">
                                <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance text-black dark:text-white">
                                    { title }
                                </h3>
                                <h2
                                    className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] md:text-base/[1.375rem]  text-black dark:text-neutral-400"
                                >
                                    { description }
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    };
*/