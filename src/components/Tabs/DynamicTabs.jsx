// Dynamic tabs with preset routes passed in as child components OR as properties in "[items]", 
// with the ability to open or close new tabs if presented with a schema for the resulting new tab content and name. 

import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { AnimatePresence, motion } from "framer-motion";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { useScreenSize } from "@/hooks/use-screen-size";
import { Button } from "@/components/ui/button";

// Define the possible screen sizes as a const array for better type inference
const SCREEN_SIZES = [ "xs", "sm", "md", "lg", "xl", "2xl" ];

// Create a union type from the array
// export type ScreenSize = ( typeof SCREEN_SIZES )[ number ];

// Type-safe size order mapping
const sizeOrder = { 'xs': 0, 'sm': 1, 'md': 2, 'lg': 3, 'xl': 4, '2xl': 5 };

const useScreenSize = () => {
    const [ screenSize, setScreenSize ] = useState( "xs" );

    useEffect( () => {
        const handleResize = () => {
            const width = window.innerWidth;

            if ( width >= 1536 ) { setScreenSize( "2xl" ); }
            else if ( width >= 1280 ) { setScreenSize( "xl" ); }
            else if ( width >= 1024 ) { setScreenSize( "lg" ); }
            else if ( width >= 768 ) { setScreenSize( "md" ); }
            else if ( width >= 640 ) { setScreenSize( "sm" ); }
            else { setScreenSize( "xs" ); }
        };

        handleResize();
        window.addEventListener( "resize", handleResize );
        return () => window.removeEventListener( "resize", handleResize );
    }, [] );

    function toString () { return this.value; }
    function valueOf () { return sizeOrder[ this.value ]; }
    // Add type predicate methods for better TypeScript support
    function equals ( other ) { return this.value === other; }
    function lessThan ( other ) { return this.valueOf() < sizeOrder[ other ]; }
    function greaterThan ( other ) { return this.valueOf() > sizeOrder[ other ]; }
    function lessThanOrEqual ( other ) { return this.valueOf() <= sizeOrder[ other ]; }
    function greaterThanOrEqual ( other ) { return this.valueOf() >= sizeOrder[ other ]; }

    return new ComparableScreenSize( screenSize );
};

export { useScreenSize };

export const GooeyFilter = ( {
    id = "goo-filter",
    strength = 10,
} ) => {
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

export function GooeyTabsRender ( { content } ) {
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
                        { content.map( ( _, index ) => (
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
                    {/* Content panel */ }
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
                                        { content[ activeTab ].files.map( ( file, index ) => (
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

                {/* Interactive text overlay, no filter */ }
                <div className="relative flex w-full ">
                    { content.map( ( tab, index ) => (
                        <button
                            key={ index }
                            onClick={ () => setActiveTab( index ) }
                            className="flex-1 h-8 md:h-12"
                        >
                            <span
                                className={ `w-full h-full flex items-center justify-center ${ activeTab === index ? "text-black" : "text-muted-foreground" }` }
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

export { GooeyTabsRender };

export default DynamicTabs;