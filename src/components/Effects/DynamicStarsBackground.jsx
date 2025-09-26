// https://21st.dev/aceternity/stars-background/default // 

import { cn } from "@/lib/utils";
import React, {
    useState,
    useEffect,
    useRef,
    RefObject,
    useCallback,
} from "react";
"use client";
import React, { useState } from "react";
import { StarsBackground } from "@/components/ui/stars-background";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

/* interface StarProps {
  x;
  y;
  radius;
  opacity;
  twinkleSpeed | null;
}

interface StarBackgroundProps {
  starDensity?;
  allStarsTwinkle?: boolean;
  twinkleProbability?;
  minTwinkleSpeed?;
  maxTwinkleSpeed?;
  className?: string;
} */

export const StarsBackground = ( {
    starDensity = 0.00015,
    allStarsTwinkle = true,
    twinkleProbability = 0.7,
    minTwinkleSpeed = 0.5,
    maxTwinkleSpeed = 1,
    className,
} ) => {
    const [ stars, setStars ] = useState( [] );
    const canvasRef =
        useRef( null );

    const generateStars = useCallback(
        ( width, height ) => {
            const area = width * height;
            const numStars = Math.floor( area * starDensity );
            return Array.from( { length: numStars }, () => {
                const shouldTwinkle =
                    allStarsTwinkle || Math.random() < twinkleProbability;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 0.05 + 0.5,
                    opacity: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: shouldTwinkle
                        ? minTwinkleSpeed +
                        Math.random() * ( maxTwinkleSpeed - minTwinkleSpeed )
                        : null,
                };
            } );
        },
        [
            starDensity,
            allStarsTwinkle,
            twinkleProbability,
            minTwinkleSpeed,
            maxTwinkleSpeed,
        ]
    );

    useEffect( () => {
        const updateStars = () => {
            if ( canvasRef.current ) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext( "2d" );
                if ( !ctx ) return;

                const { width, height } = canvas.getBoundingClientRect();
                canvas.width = width;
                canvas.height = height;
                setStars( generateStars( width, height ) );
            }
        };

        updateStars();

        const resizeObserver = new ResizeObserver( updateStars );
        if ( canvasRef.current ) {
            resizeObserver.observe( canvasRef.current );
        }

        return () => {
            if ( canvasRef.current ) {
                resizeObserver.unobserve( canvasRef.current );
            }
        };
    }, [
        starDensity,
        allStarsTwinkle,
        twinkleProbability,
        minTwinkleSpeed,
        maxTwinkleSpeed,
        generateStars,
    ] );

    useEffect( () => {
        const canvas = canvasRef.current;
        if ( !canvas ) return;

        const ctx = canvas.getContext( "2d" );
        if ( !ctx ) return;

        let animationFrameId;

        const render = () => {
            ctx.clearRect( 0, 0, canvas.width, canvas.height );
            stars.forEach( ( star ) => {
                ctx.beginPath();
                ctx.arc( star.x, star.y, star.radius, 0, Math.PI * 2 );
                ctx.fillStyle = `rgba(255, 255, 255, ${ star.opacity })`;
                ctx.fill();

                if ( star.twinkleSpeed !== null ) {
                    star.opacity =
                        0.5 +
                        Math.abs( Math.sin( ( Date.now() * 0.001 ) / star.twinkleSpeed ) * 0.5 );
                }
            } );

            animationFrameId = requestAnimationFrame( render );
        };

        render();

        return () => {
            cancelAnimationFrame( animationFrameId );
        };
    }, [ stars ] );

    return (
        <canvas
            ref={ canvasRef }
            className={ cn( "h-full w-full absolute inset-0", className ) }
        />
    );
};

export function StarsBackgroundDemo () {
    const [ settings, setSettings ] = useState( {
        density: 0.00015,
        allTwinkle: true,
        twinkleProbability: 0.7,
        minSpeed: 0.5,
        maxSpeed: 1,
    } );

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden">
            <StarsBackground
                starDensity={ settings.density }
                allStarsTwinkle={ settings.allTwinkle }
                twinkleProbability={ settings.twinkleProbability }
                minTwinkleSpeed={ settings.minSpeed }
                maxTwinkleSpeed={ settings.maxSpeed }
            />

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={ { opacity: 0, y: 20 } }
                    animate={ { opacity: 1, y: 0 } }
                    transition={ { duration: 0.8 } }
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Dynamic Stars Background
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                        A customizable canvas-based starry night effect with twinkling stars
                    </p>
                </motion.div>

                <motion.div
                    initial={ { opacity: 0 } }
                    animate={ { opacity: 1 } }
                    transition={ { delay: 0.5 } }
                    className="w-full max-w-[500px] min-w-[400px]"
                >
                    <Card className="bg-card/80 backdrop-blur-md border-border/40">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Star Density: { settings.density.toFixed( 5 ) }
                                    </Label>
                                    <Slider
                                        value={ [ settings.density ] }
                                        min={ 0.00005 }
                                        max={ 0.0003 }
                                        step={ 0.00001 }
                                        onValueChange={ ( [ value ] ) =>
                                            setSettings( ( prev ) => ( { ...prev, density: value } ) )
                                        }
                                        className="my-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Min Twinkle Speed: { settings.minSpeed.toFixed( 1 ) }
                                    </Label>
                                    <Slider
                                        value={ [ settings.minSpeed ] }
                                        min={ 0.1 }
                                        max={ 2 }
                                        step={ 0.1 }
                                        onValueChange={ ( [ value ] ) =>
                                            setSettings( ( prev ) => ( { ...prev, minSpeed: value } ) )
                                        }
                                        className="my-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Max Twinkle Speed: { settings.maxSpeed.toFixed( 1 ) }
                                    </Label>
                                    <Slider
                                        value={ [ settings.maxSpeed ] }
                                        min={ 0.1 }
                                        max={ 2 }
                                        step={ 0.1 }
                                        onValueChange={ ( [ value ] ) =>
                                            setSettings( ( prev ) => ( { ...prev, maxSpeed: value } ) )
                                        }
                                        className="my-2"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allTwinkle"
                                        checked={ settings.allTwinkle }
                                        onCheckedChange={ ( checked ) =>
                                            setSettings( ( prev ) => ( {
                                                ...prev,
                                                allTwinkle: checked,
                                            } ) )
                                        }
                                    />
                                    <Label htmlFor="allTwinkle" className="text-white">
                                        All Stars Twinkle
                                    </Label>
                                </div>

                                { !settings.allTwinkle && (
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Twinkle Probability: { settings.twinkleProbability.toFixed( 2 ) }
                                        </Label>
                                        <Slider
                                            value={ [ settings.twinkleProbability ] }
                                            min={ 0 }
                                            max={ 1 }
                                            step={ 0.1 }
                                            onValueChange={ ( [ value ] ) =>
                                                setSettings( ( prev ) => ( {
                                                    ...prev,
                                                    twinkleProbability: value,
                                                } ) )
                                            }
                                            className="my-2"
                                        />
                                    </div>
                                ) }
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}