import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./quote.css";
import { Button } from "../ui/button";
import { Play, Pause, QuoteIcon } from 'lucide-react';
import { QUOTE_API_URLS } from "@/lib/config/quote";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";

// Utility: timeout wrapper for fetch with AbortController
async function fetchJSONWithTimeout ( url, { timeout = 8000 } = {} ) {
    const controller = new AbortController();
    const id = setTimeout( () => controller.abort(), timeout );
    try {
        const res = await fetch( url, { signal: controller.signal, cache: "no-store" } );
        if ( !res.ok ) throw new Error( `Request failed: ${ res.status } ${ res.statusText }` );
        const data = await res.json();
        return data;
    } finally {
        clearTimeout( id );
    }
}

// Normalize various APIs to a unified shape: { text, author, source }
function normalizeQuotes ( url, raw ) {
    const source =
        url.includes( "type.fit" ) ? "type.fit" :
            url.includes( "quotable.io" ) ? "Quotable" :
                url.includes( "zenquotes.io" ) ? "ZenQuotes" :
                    url.includes( "programming-quotesapi" ) ? "Programming Quotes" :
                        url.includes( "gist.githubusercontent" ) ? "FreeCodeCamp" :
                            new URL( url ).hostname;

    const out = [];

    try {
        // type.fit
        if ( url.includes( "type.fit" ) ) {
            if ( Array.isArray( raw ) ) {
                for ( const q of raw ) {
                    if ( !q ) continue;
                    const text = q.text || q.quoteText || "";
                    const author = q.author || q.quoteAuthor || "Unknown";
                    if ( text ) out.push( { text, author, source } );
                }
            }
        }
        // Quotable list or single
        else if ( url.includes( "quotable.io" ) ) {
            if ( raw && Array.isArray( raw.results ) ) {
                for ( const q of raw.results ) {
                    const text = q.content || q.text || "";
                    const author = q.author || "Unknown";
                    if ( text ) out.push( { text, author, source } );
                }
            } else if ( raw && ( raw.content || raw.text ) ) {
                out.push( { text: raw.content || raw.text, author: raw.author || "Unknown", source } );
            }
        }
        // ZenQuotes
        else if ( url.includes( "zenquotes.io" ) ) {
            if ( Array.isArray( raw ) ) {
                for ( const q of raw ) {
                    const text = q.q || q.quote || "";
                    const author = q.a || q.author || "Unknown";
                    if ( text ) out.push( { text, author, source } );
                }
            } else if ( raw && raw.q ) {
                out.push( { text: raw.q, author: raw.a || "Unknown", source } );
            }
        }
        // Programming Quotes
        else if ( url.includes( "programming-quotesapi" ) ) {
            if ( Array.isArray( raw ) ) {
                for ( const q of raw ) {
                    const text = q.en || q.quote || "";
                    const author = q.author || "Unknown";
                    if ( text ) out.push( { text, author, source } );
                }
            } else if ( raw && ( raw.en || raw.quote ) ) {
                out.push( { text: raw.en || raw.quote, author: raw.author || "Unknown", source } );
            }
        }
        // FreeCodeCamp gist format
        else if ( url.includes( "gist.githubusercontent" ) ) {
            if ( raw && Array.isArray( raw.quotes ) ) {
                for ( const q of raw.quotes ) {
                    const text = q.quote || q.text || "";
                    const author = q.author || "Unknown";
                    if ( text ) out.push( { text, author, source } );
                }
            }
        }
        // Fallback generic handlers
        else if ( Array.isArray( raw ) ) {
            for ( const q of raw ) {
                const text = q.content || q.text || q.quote || q.q || q.en || "";
                const author = q.author || q.a || "Unknown";
                if ( text ) out.push( { text, author, source } );
            }
        } else if ( raw && ( raw.content || raw.text || raw.quote || raw.q || raw.en ) ) {
            out.push( {
                text: raw.content || raw.text || raw.quote || raw.q || raw.en,
                author: raw.author || raw.a || "Unknown",
                source,
            } );
        }
    } catch ( err ) {
        // If parsing fails, return what we have
        // console.warn("Failed to normalize quotes from", url, err)
    }

    return out;
}

// Deduplicate by text+author
function dedupeQuotes ( quotes ) {
    const seen = new Set();
    const result = [];
    for ( const q of quotes ) {
        const key = `${ q.text }__${ q.author }`;
        if ( !seen.has( key ) ) {
            seen.add( key );
            result.push( q );
        }
    }
    return result;
}

// Shuffle array inplace (Fisher-Yates)
function shuffle ( arr ) {
    const a = arr.slice();
    for ( let i = a.length - 1; i > 0; i-- ) {
        const j = Math.floor( Math.random() * ( i + 1 ) )
            ;[ a[ i ], a[ j ] ] = [ a[ j ], a[ i ] ];
    }
    return a;
}

// Local fallback quotes (ensures component still works offline)
const FALLBACK_QUOTES = [
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", source: "Local" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", source: "Local" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", source: "Local" },
    { text: "What we think, we become.", author: "Buddha", source: "Local" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", source: "Local" },
];

export default function RandomQuote ( props ) {
    const {
        timerOn = true,
        timerInterval = 8000, // a few seconds by default
        className = "",
    } = props;

    // UI states
    const [ isPlaying, setIsPlaying ] = useState( Boolean( timerOn ) );
    const [ isHovered, setIsHovered ] = useState( false );

    // Quote data states
    const [ quotes, setQuotes ] = useState( [] );
    const [ currentIndex, setCurrentIndex ] = useState( 0 );

    // Transition phase for quote changes
    const [ phase, setPhase ] = useState( "idle" ); // idle | fading-out | waiting | fading-in

    // Timers refs to cleanup reliably
    const cycleTimerRef = useRef( null );
    const fadeOutTimerRef = useRef( null );
    const waitTimerRef = useRef( null );
    const fadeInTimerRef = useRef( null );

    const fadeOutDuration = 400;
    const waitBetweenQuotes = 1000; // per requirement: wait 1 second before next fade in
    const fadeInDuration = 400;

    const currentQuote = quotes.length > 0 ? quotes[ currentIndex ] : { text: "", author: "", source: "" };

    // Fetch & prepare quotes on mount
    useEffect( () => {
        let cancelled = false;

        async function loadQuotes () {
            const all = [];

            const results = await Promise.allSettled(
                QUOTE_API_URLS.map( ( url ) => fetchJSONWithTimeout( url, { timeout: 8000 } ).then( ( raw ) => ( { url, raw } ) ) )
            );

            for ( const r of results ) {
                if ( r.status === "fulfilled" ) {
                    const { url, raw } = r.value;
                    const normalized = normalizeQuotes( url, raw );
                    if ( normalized.length > 0 ) {
                        all.push( ...normalized );
                    }
                } else {
                    // You can log per-source errors here if desired
                    // console.warn("Quote source failed:", r.reason)
                }
            }

            // Fallback if all remote sources failed
            const prepared = all.length > 0 ? all : FALLBACK_QUOTES;

            // Deduplicate + shuffle for variety
            const unique = shuffle( dedupeQuotes( prepared ) );

            if ( !cancelled ) {
                setQuotes( unique );
                // pick a random start index for freshness
                setCurrentIndex( unique.length > 0 ? Math.floor( Math.random() * unique.length ) : 0 );
            }
        }

        loadQuotes();

        return () => {
            cancelled = true;
        };
    }, [] );

    // Helper to cleanup timers
    const clearAllTimers = useCallback( () => {
        if ( cycleTimerRef.current ) {
            clearTimeout( cycleTimerRef.current );
            cycleTimerRef.current = null;
        }
        if ( fadeOutTimerRef.current ) {
            clearTimeout( fadeOutTimerRef.current );
            fadeOutTimerRef.current = null;
        }
        if ( waitTimerRef.current ) {
            clearTimeout( waitTimerRef.current );
            waitTimerRef.current = null;
        }
        if ( fadeInTimerRef.current ) {
            clearTimeout( fadeInTimerRef.current );
            fadeInTimerRef.current = null;
        }
    }, [] );

    // Quote change pipeline (fade out -> wait -> set next -> fade in)
    const runOneCycle = useCallback( () => {
        // Start fade-out
        setPhase( "fading-out" );

        fadeOutTimerRef.current = setTimeout( () => {
            setPhase( "waiting" );

            waitTimerRef.current = setTimeout( () => {
                // Set next index
                setCurrentIndex( ( idx ) => ( quotes.length > 0 ? ( idx + 1 ) % quotes.length : idx ) );
                setPhase( "fading-in" );

                fadeInTimerRef.current = setTimeout( () => {
                    setPhase( "idle" );
                    // Schedule next cycle only if still playing
                    if ( isPlaying ) {
                        cycleTimerRef.current = setTimeout( runOneCycle, timerInterval );
                    }
                }, fadeInDuration );
            }, waitBetweenQuotes );
        }, fadeOutDuration );
    }, [ fadeOutDuration, fadeInDuration, isPlaying, quotes.length, timerInterval, waitBetweenQuotes ] );

    // Start/stop the interval cycle when isPlaying changes or after quotes are loaded
    useEffect( () => {
        clearAllTimers();
        if ( isPlaying && quotes.length > 0 ) {
            cycleTimerRef.current = setTimeout( runOneCycle, timerInterval );
        }
        return clearAllTimers;
    }, [ isPlaying, quotes.length, runOneCycle, timerInterval, clearAllTimers ] );

    // Pause if parent toggles timerOn prop
    useEffect( () => {
        setIsPlaying( Boolean( timerOn ) );
    }, [ timerOn ] );

    const onMouseEnter = useCallback( () => setIsHovered( true ), [] );
    const onMouseLeave = useCallback( () => setIsHovered( false ), [] );
    const togglePlay = useCallback( () => setIsPlaying( ( p ) => !p ), [] );

    // Computed classes for crossfade
    const containerPhaseClass = useMemo( () => {
        if ( phase === "fading-out" ) return "rq-fade-out";
        if ( phase === "fading-in" ) return "rq-fade-in";
        return "";
    }, [ phase ] );

    return (
        <div
            className={ `rq-container ${ className } flex-nowrap flex-row items-center justify-start` }
            onMouseEnter={ onMouseEnter }
            onMouseLeave={ onMouseLeave }
            // The header controls height; we fill available space and keep overflow hidden.
            // style={ { width: "100%", height: "100%", overflow: "hidden" } }
            aria-live="polite"
            style={ {
                height: `${ CONTENT_HEADER_HEIGHT }rem`,
                maxHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                minHeight: `${ CONTENT_HEADER_HEIGHT }rem`,
                width: `${ 100 }% !important`,
                maxWidth: `${ 100 }% !important`,
                minWidth: `${ 100 }% !important`,
            } }
        >
            <div className="">
                <Button
                    size="icon"
                    variant="ghost"
                    className="rq-btn"
                    onClick={ togglePlay }
                    title={ isPlaying ? "Pause auto-rotate quotes" : "Play auto-rotate quotes" }
                    aria-label={ isPlaying ? "Pause quotes" : "Play quotes" }
                >
                    { isPlaying ? <Pause className="rq-icon" /> : <Play className="rq-icon" /> }
                </Button>
            </div>

            <div className={ `rq-content ${ containerPhaseClass } flex-nowrap flex-row w-full overflow-hidden` }>
                {/* Quote text layer (hidden on hover) */ }
                <QuoteIcon aria-hidden className="size-3 opacity-40 mr-2 rq-quote-mark inline-flex" />
                <div
                    className={ `rq-line rq-quote ${ isHovered ? "rq-hidden" : "rq-visible" } inline-flex` }
                    role="text"
                >
                    <span className="rq-text gap-2 ml-5 mr-2 opacity-40 text-wrap text-left" title={ currentQuote.text || "" }>
                        <div className={ `text-xs text-muted-foreground size-auto w-auto inline` }>{ currentQuote.text || "" }</div>
                    </span>
                </div>

                {/* Author layer (visible on hover) */ }
                <div
                    className={ `rq-line rq-author ml-5 mr-2 ${ isHovered ? "rq-visible" : "rq-hidden" }` }
                    role="text"
                >
                    <span className="rq-author-text" title={ currentQuote.author || "Unknown" }>
                        { "— " }{ currentQuote.author || "Unknown" }
                    </span>
                </div>
            </div>
        </div>
    );
}
