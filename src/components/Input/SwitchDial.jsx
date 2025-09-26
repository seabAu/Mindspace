import { useState, useCallback } from "react";
import MultiStateToggle from "@/components/MultiStateToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const generateStates = ( count ) => {
    const hueStep = 360 / count;
    return Array.from( { length: count }, ( _, i ) => ( {
        name: `State ${ i + 1 }`,
        color: `hsl(${ i * hueStep }, 70%, 50%)`,
    } ) );
};

const SelectDial = ( props ) => {
    const {
        options,
        initialState = 0,
        size = 200,
        onChange
    } = props;

    const [ stateCount, setStateCount ] = useState( 4 );
    const [ states, setStates ] = useState( options ? options : () => generateStates( stateCount ) );
    const [ currentState, setCurrentState ] = useState( 0 );

    const handleStateCountChange = useCallback( ( event ) => {
        const newCount = Number.parseInt( event.target.value, 10 );
        if ( newCount >= 2 && newCount <= 12 ) {
            setStateCount( newCount );
            setStates( generateStates( newCount ) );
            setCurrentState( 0 );
        }
    }, [] );

    const handleStateChange = useCallback(
        ( stateIndex ) => {
            setCurrentState( stateIndex );
            console.log( `Changed to state: ${ states[ stateIndex ].name }` );
        },
        [ states ],
    );

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Multi-State Toggle Switch</h1>
            <div className="p-12 bg-white rounded-xl shadow-2xl">
                <div className="flex flex-col items-center space-y-8">
                    <MultiStateToggle
                        options={ states }
                        onChange={ handleStateChange }
                        size={ size }
                        initialState={ initialState }
                    />

                    <div className="flex items-center space-x-4">
                        <Label htmlFor="stateCount">Number of States:</Label>
                        <Input
                            id="stateCount"
                            type="number"
                            min="2"
                            max="12"
                            value={ stateCount }
                            onChange={ handleStateCountChange }
                            className="w-20"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold">Current State:</p>
                        <p className="text-xl" style={ { color: states[ currentState ].color } }>
                            { states[ currentState ].name }
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};



const MultiStateToggle = ( props ) => {
    const {
        options,
        initialState = 0,
        size = 200,
        onChange
    } = props;

    const [ currentState, setCurrentState ] = useState( initialState );
    const [ isDragging, setIsDragging ] = useState( false );
    const svgRef = useRef( null );

    const handleStateChange = useCallback(
        ( index ) => {
            if ( index !== currentState ) {
                setCurrentState( index );
                onChange?.( index );
            }
        },
        [ currentState, onChange ],
    );

    const handleCenterClick = useCallback( () => {
        const nextState = ( currentState + 1 ) % options.length;
        handleStateChange( nextState );
    }, [ currentState, options.length, handleStateChange ] );

    const getStateFromCoordinates = useCallback(
        ( x, y ) => {
            if ( !svgRef.current ) return -1;

            const svgRect = svgRef.current.getBoundingClientRect();
            const centerX = svgRect.width / 2;
            const centerY = svgRect.height / 2;
            const dx = x - centerX;
            const dy = y - centerY;

            let angle = Math.atan2( dy, dx );
            if ( angle < 0 ) angle += 2 * Math.PI;

            const stateIndex = Math.floor( ( angle / ( 2 * Math.PI ) ) * options.length );
            return ( stateIndex + Math.floor( options.length / 4 ) ) % options.length;
        },
        [ options.length ],
    );

    const handleMouseDown = useCallback(
        ( event ) => {
            setIsDragging( true );
            const stateIndex = getStateFromCoordinates( event.nativeEvent.offsetX, event.nativeEvent.offsetY );
            if ( stateIndex !== -1 ) handleStateChange( stateIndex );
        },
        [ getStateFromCoordinates, handleStateChange ],
    );

    const handleMouseMove = useCallback(
        ( event ) => {
            if ( !isDragging || !svgRef.current ) return;

            const svgRect = svgRef.current.getBoundingClientRect();
            const stateIndex = getStateFromCoordinates( event.clientX - svgRect.left, event.clientY - svgRect.top );
            if ( stateIndex !== -1 ) handleStateChange( stateIndex );
        },
        [ isDragging, getStateFromCoordinates, handleStateChange ],
    );

    const handleMouseUp = useCallback( () => {
        setIsDragging( false );
    }, [] );

    useEffect( () => {
        if ( isDragging ) {
            window.addEventListener( "mousemove", handleMouseMove );
            window.addEventListener( "mouseup", handleMouseUp );
        }
        return () => {
            window.removeEventListener( "mousemove", handleMouseMove );
            window.removeEventListener( "mouseup", handleMouseUp );
        };
    }, [ isDragging, handleMouseMove, handleMouseUp ] );

    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    return (
        <TooltipProvider>
            <div className="relative inline-block" style={ { width: size, height: size } }>
                <svg
                    ref={ svgRef }
                    width={ size }
                    height={ size }
                    viewBox={ `0 0 ${ size } ${ size }` }
                    className="transform transition-transform duration-300 ease-in-out hover:scale-105"
                    onMouseDown={ handleMouseDown }
                >
                    { options.map( ( state, index ) => {
                        const startAngle = ( index / options.length ) * 2 * Math.PI - Math.PI / 2;
                        const endAngle = ( ( index + 1 ) / options.length ) * 2 * Math.PI - Math.PI / 2;
                        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

                        const startX = centerX + radius * Math.cos( startAngle );
                        const startY = centerY + radius * Math.sin( startAngle );
                        const endX = centerX + radius * Math.cos( endAngle );
                        const endY = centerY + radius * Math.sin( endAngle );

                        return (
                            <Tooltip key={ state.name }>
                                <TooltipTrigger asChild>
                                    <path
                                        d={ `M ${ centerX } ${ centerY } L ${ startX } ${ startY } A ${ radius } ${ radius } 0 ${ largeArcFlag } 1 ${ endX } ${ endY } Z` }
                                        fill={ currentState === index ? state.color : "transparent" }
                                        stroke={ state.color }
                                        strokeWidth="2"
                                        className="cursor-pointer transition-all duration-300 ease-in-out hover:brightness-110"
                                        onClick={ () => handleStateChange( index ) }
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{ state.name }</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    } ) }
                    <circle
                        cx={ centerX }
                        cy={ centerY }
                        r={ radius * 0.3 }
                        className="fill-background cursor-pointer shadow-inner transition-shadow duration-300 ease-in-out hover:shadow-lg"
                        onClick={ handleCenterClick }
                    />
                </svg>
            </div>
        </TooltipProvider>
    );
};

SelectDial.MultiStateToggle = MultiStateToggle;

export default SelectDial;

