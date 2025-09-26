import React, { useEffect, useState } from 'react';
import * as utils from 'akashatools';
// import rd3 from 'react-d3-library';
import * as d3 from 'd3';
import './clock.css';

const Clock = ( props ) => {
    const {
        time,
        setTime,
        timezone = "-5",
        options = [],
        settings = {},
    } = props;

    return (
        <div>

        </div>
    );
};


const Digital = ( props ) => {
    const {
        time,
        setTime,
        timezone = "-5",
        options = [],
        settings = {},
    } = props;

    return (
        <div>

        </div>
    );
};

Clock.Digital = Digital;

const Analog = ( props ) => {
    const {
        timerOn = true,
        timerInterval = 1000,
        locale = 'en',
        currTime,
        setCurrTime,
        timezone = "-5",
        options = [],
        settings = {},
    } = props;

    const [ date, setDate ] = useState( new Date() );
    const [ time, setTime ] = useState( new Date() );
    useEffect( () => {

        var timer = setInterval( () => {
            // let d = new Date();
            // const time = d.toLocaleTimeString( locale, {
            //     hour: 'numeric',
            //     hour12: true,
            //     minute: 'numeric',
            //     second: 'numeric'
            // } );
            // setDate( d );
            // setTime( time );

            var numname = [
                "zero",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine"
            ];

            function getCurrentSeconds () {
                var dNow = new Date();
                return dNow.getSeconds() + 60 * ( dNow.getMinutes() + 60 * dNow.getHours() );
            }

            var s1 = document.getElementById( "s1" );
            var s2 = document.getElementById( "s2" );

            var m1 = document.getElementById( "m1" );
            var m2 = document.getElementById( "m2" );

            var h1 = document.getElementById( "h1" );
            var h2 = document.getElementById( "h2" );

            var start = new Date().getTime();
            var interval = 1000;

            function countUp () {
                var count = getCurrentSeconds();

                // Only update if at least a second has passed.
                if ( new Date().getTime() - start >= interval ) {
                    start = new Date().getTime();

                    s2.className = "clock__digit " + numname[ ( count % 60 ) % 10 ];

                    s1.className = "clock__digit " + numname[ Math.floor( ( count % 60 ) / 10 ) ];

                    m2.className = "clock__digit " + numname[ Math.floor( ( ( count / 60 ) % 60 ) % 60 ) % 10 ];

                    m1.className = "clock__digit " + numname[ Math.floor( ( ( ( count / 60 ) % 60 ) % 60 ) / 10 ) ];

                    h2.className = "clock__digit " + numname[ Math.floor( ( ( count / 3600 ) % 60 ) % 24 ) % 10 ];

                    h1.className = "clock__digit " + numname[ Math.floor( ( ( ( count / 3600 ) % 60 ) % 24 ) / 10 ) ];
                }
                requestAnimationFrame( countUp );
            }
            var raf = requestAnimationFrame( countUp );
        }, timerInterval );

        return function cleanup () {
            clearInterval( timer );
        };
    }, [] );


    const buildAnalogClock = () => {
        let elements = [];
        [ "h1", "h2", "sep", "m1", "m2", "sep", "s1", "s2" ].forEach( ( val, index ) => {
            if ( val === "sep" ) elements.push(
                <div className="clock__spacer"></div>
            );
            else {
                elements.push( buildAnalogClockDigit( val ) );
            }
        } );

        return (
            <div className="clock">
                { elements }
            </div>
        );
    };

    const buildAnalogClockDigit = ( id = "" ) => {
        return (
            <div id={ id } className="clock__digit">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        );
    };

    return (
        <div>
            { buildAnalogClock() }
        </div>
    );
};

Clock.Analog = Analog;


const Day = ( props ) => {
    const {
        date = new Date(),
        setDate,
        time = new Date(),
        setTime,
        blocks = [], // Logged events at given times that occurred today or were logged. 
        options,
    } = props;

    const minDimensions = {
        width: 400,
        height: 400,
        clockRadius: 160,
        margin: 20,
    };

    const [ parameters, setParameters ] = useState( {
        width: 400,
        height: 400,
        clockRadius: 160,
        margin: 20,
        hoursHandLength: 0,
        minutesHandLength: 0,
        secondsHandLength: 0,
        hoursTickStart: 0,
        hoursTickLength: 0,
        hoursLabelRadius: 0,
        hoursLabelYOffset: 0,
        hoursScale: 0,
        minutesScale: 0,
        hoursData: { value: null, length: 0, scale: 0 },
        minutesData: { value: null, length: 0, scale: 0 },
        secondsData: { value: null, length: 0, scale: 0 },
        color: [ 255, 255, 255 ],
    } );

    const init = ( opt ) => {
        let container = d3.select( opt.sel );
        let t = new Date();

        let clockRadius = ( window.innerWidth * 0.8 ) / 2;
        let margin = ( window.innerWidth * 0.2 ) / 4;
        let width = ( clockRadius + margin * 2 ) * 2;
        let height = ( clockRadius + margin * 2 ) * 2;
        let hoursHandLength = clockRadius - 18;
        let minutesHandLength = clockRadius / 2;
        let secondsHandLength = clockRadius / 1.25;
        let hoursTickStart = clockRadius;
        let hoursTickLength = -8;
        let hoursLabelRadius = clockRadius - 40;
        let hoursLabelYOffset = 6;
        // let hoursScale = d3.scale.linear().range( [ 0, 330 ] ).domain( [ 0, 23 ] );
        // let minutesScale = secondsScale = d3.scale.linear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );
        let hoursScale = d3.scaleLinear().range( [ 0, 330 ] ).domain( [ 0, 23 ] );
        let minutesScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );
        let secondsScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );

        let hoursData = {
            value: t.getHours() + t.getMinutes() / 60,
            length: -hoursHandLength,
            scale: hoursScale
        };

        let minutesData = {
            value: t.getMinutes(),
            length: -minutesHandLength,
            scale: minutesScale
        };

        let secondsData = {
            value: t.getSeconds(),
            length: -secondsHandLength,
            scale: secondsScale
        };

        let color = d3.scaleLinear()
            .range( [ "hsl(-180,50%,50%)", "hsl(180,50%,50%)" ] )
            .domain( [ 0, blocks.length - 1 ] )
            .interpolate( _interpolateHsl );

        setParameters( {
            width: width,
            height: height,
            clockRadius: clockRadius,
            margin: margin,
            hoursHandLength: hoursHandLength,
            minutesHandLength: minutesHandLength,
            secondsHandLength: secondsHandLength,
            hoursTickStart: hoursTickStart,
            hoursTickLength: hoursTickLength,
            hoursLabelRadius: hoursLabelRadius,
            hoursLabelYOffset: hoursLabelYOffset,
            hoursScale: hoursScale,
            minutesScale: minutesScale,
            secondsScale: secondsScale,
            hoursData: hoursData,
            minutesData: minutesData,
            secondsData: secondsData,
            color: color,
        } );

        _draw( container );
    };

    const [ timeData, setTimeData ] = useState( {
        hours: 0,
        minutes: 0,
        seconds: 0,
    } );

    const updateClock = () => {
        const now = new Date();
        setTimeData( {
            hours: now.getHours() + now.getMinutes() / 60,
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
        } );
    };

    const updateDimensions = () => {
        const containerHeight = Math.min( window.innerHeight, minDimensions.height );
        const containerWidth = Math.min( window.innerWidth, minDimensions.width );
        const clockRadius = ( containerWidth * 0.8 ) / 2;
        const margin = ( containerWidth * 0.2 ) / 4;

        setParameters( {
            width: ( clockRadius + margin * 2 ) * 2,
            height: ( clockRadius + margin * 2 ) * 2,
            clockRadius,
            margin,
            ...parameters,
        } );
    };

    useEffect( () => {
        updateDimensions();
        updateClock();
        // const interval = setInterval( updateClock, 1000 );

        window.addEventListener( 'resize', updateDimensions );

        return () => {
            // clearInterval( interval );
            window.removeEventListener( 'resize', updateDimensions );
        };
    }, [] );

    const Translate = ( { x = 0, y = 0, children } ) => {
        if ( !x && !y ) return children;
        return <g transform={ `translate(${ x },${ y })` }>{ children }</g>;
    };

    function circlePath ( cx, cy, r, deg ) {
        var theta = deg * Math.PI / 180,
            dx = r * Math.cos( theta ),
            dy = -r * Math.sin( theta );
        return 'M ' + cx + ' ' + cy + ' m -' + r + ', 0 a ' + r + ',' + r + ' 0 1,1 ' + ( r * 2 ) + ',0 a ' + r + ',' + r + ' 0 1,1 -' + ( r * 2 ) + ',0';
    }

    function polarToCartesian ( centerX, centerY, radius, angleInDegrees ) {
        var angleInRadians = ( angleInDegrees - 90 ) * Math.PI / 180.0;

        return {
            x: centerX + ( radius * Math.cos( angleInRadians ) ),
            y: centerY + ( radius * Math.sin( angleInRadians ) )
        };
    }

    function describeArc ( x, y, radius, startAngle, endAngle ) {

        var start = polarToCartesian( x, y, radius, endAngle );
        var end = polarToCartesian( x, y, radius, startAngle );

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join( " " );

        return d;
    }

    function _interpolateHsl ( a, b ) {
        let i = d3.interpolateString( a, b );
        return t => d3.hsl( i( t ) );
    }

    function _arc ( data ) {
        let t0 = data.start.getHours() + data.start.getMinutes() / 60,
            t1 = data.end.getHours() + data.end.getMinutes() / 60,
            scale = parameters.hoursData.scale,
            ratio = ( parameters.clockRadius - 8 ) / parameters._fields().length,
            padding = 0.3;

        let arc = d3.arc();

        // return (
        //     <svg
        //         className={ `arc-data` }
        //     >
        //         <arc
        //             className={ `arc-data-arc` }
        //             startAngle={ ( scale( t0 ) * parameters.radians ) }
        //             endAngle={ ( scale( t1 ) * parameters.radians ) }
        //             innerRadius={ ( d => ( d.index + padding ) * ratio ) }
        //             outerRadius={ ( d => ( d.index - padding ) * ratio + ratio ) }
        //             cornerRadius={ ( ratio ) }
        //         ></arc>
        //     </svg>
        // );

        return arc( data );
    }

    function _draw ( container ) {
        // Call update.
        updateClock();
        // Build elements.

        let elements = [];
        let svgElements = [];
        let faceElements = [];


        // Outer Arc (frame)
        faceElements.push(
            <path
                d={ d3.arc()( {
                    startAngle: 0,
                    endAngle: Math.PI * 2,
                    innerRadius: clockRadius + hoursTickLength,
                    outerRadius: clockRadius
                } ) }
                style={ { 'fill': 'rgba(24, 24, 31, 0.8)' } }
            />
        );

        // Inner Circle (background)
        faceElements.push(
            <circle
                r={ clockRadius }
                cx={ 0 }
                cy={ 0 }
                fill={ 'rgba(31, 30, 39, 0.8)' }
            />
        );

        // Ticks
        let tickElements = [];

        // Ticks Labels
        ticks.forEach( ( tick ) => {
            tickElements.push(
                <line
                    className={ `hours-tick` }
                    key={ tick }
                    x1={ 0 }
                    x2={ 0 }
                    y1={ clockRadius }
                    y2={ clockRadius - 8 }
                    // transform={ `rotate(${ 90 * tick })` }
                    transform={ `rotate(${ 90 / 24 * tick })` }
                    style={ { stroke: 'white', strokeWidth: 1 } }
                />
            );

            tickElements.push(
                <text
                    className={ `hours-label` }
                    alignmentBaseline={ `middle` }
                    textAnchor={ `start` }
                    // x="132"
                    x={ ( d, i ) => i ? width / 2 - 28 : -width / 2 + 28 }
                    // y="-5.3884459162483544e-15"
                    y={ ( d, i ) => hoursLabelRadius * Math.cos( radians * 90 ) }
                >{ `${ tick }H` }</text>
            );
        } );
        faceElements.push( tickElements );

        faceElements.push(
            <g
                className={ `agenda-arc` }
            >
                <path
                    className={ `agenda-arc-path` }
                    fill={ color }
                    d={ ( d ) => { _arc( d ); } }
                >

                </path>
            </g>
        );


        // Hands
        faceElements.push(
            <g
                id={ 'clock-hands' }
            >

            </g>
        );

        faceElements.push(
            <g
                id={ 'face-overlay' }
                transform={ `translate(${ clockRadius + margin * 2 }, ${ clockRadius + margin * 2 })` }
            >
                <circle
                    className={ `hands-cover` }
                    x={ 0 }
                    y={ 0 }
                    r={ clockRadius / 20 }
                />
            </g>
        );


        faceElements.push(
            <g
                id={ `face-overlay` }
            >
                <circle>

                </circle>
            </g>
        );

        // Hands
        faceElements.push(
            <g id="clock-hands">
                <line
                    className={ `hours-hand` }
                    x1={ 0 }
                    x2={ 0 }
                    y1={ 0 }
                    y2={ hoursData.length }
                    transform={ `rotate(${ hours => hoursScale( hours ) })` }
                    style={ { stroke: 'white', strokeWidth: 3 } }
                />
                <line
                    className={ `minutes-hand` }
                    x1={ 0 }
                    x2={ 0 }
                    y1={ 0 }
                    // y2={ -clockRadius / 2 }
                    y2={ minutesData.length }
                    transform={ `rotate(${ minutes => minutesScale( minutes ) })` }
                    style={ { stroke: 'white', strokeWidth: 2 } }
                />
                <line
                    className={ `seconds-hand` }
                    x1={ 0 }
                    x2={ 0 }
                    y1={ 0 }
                    // y2={ -clockRadius / 1.25 }
                    y2={ secondsData.length }
                    transform={ `rotate(${ seconds => secondsScale( seconds ) })` }
                    style={ { stroke: 'red', strokeWidth: 1 } }
                />
            </g>
        );

        return (
            // Container
            <div
                id={ 'container' }
            >
                {/* Lower Container */ }
                <svg
                    id={ 'svg' }
                    className={ `` }
                    width={ width }
                    height={ height }
                >
                    {/* Face */ }
                    <g
                        id={ 'clock-face' }
                        transform={ `translate(${ clockRadius + margin * 2 }, ${ clockRadius + margin * 2 })` }
                    // transform={ [ 'translate(', clockRadius + margin * 2, ',', clockRadius + margin * 2, ')' ].join( '' ) }
                    >
                        { faceElements }
                    </g>
                </svg>
            </div>
        );
    }

    let {
        width,
        height,
        clockRadius,
        margin,
        hoursHandLength,
        minutesHandLength,
        secondsHandLength,
        hoursTickStart,
        hoursTickLength,
        hoursLabelRadius,
        hoursLabelYOffset,
        // hoursScale,
        // minutesScale,
        // secondsScale,
        hoursData,
        minutesData,
        secondsData,
        color,
    } = parameters;

    const hoursScale = d3.scaleLinear().range( [ 0, 330 ] ).domain( [ 0, 23 ] );
    const minutesScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );
    const secondsScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );

    let {
        hours,
        minutes,
        seconds,
    } = timeData;

    // color = d3.scaleLinear()
    //     .range( [ "hsl(-180,50%,50%)", "hsl(180,50%,50%)" ] )
    //     .domain( [ 0, blocks.length - 1 ] )
    //     .interpolate( _interpolateHsl );

    const ticks = [ 0, 6, 12, 18 ];

    init( { sel: '#target' } );

    return (
        <div
            className={ `polar-gantt` }
            style={ { width: '100%', height: '100%' } }
        >
            <div id="target" />
            {/* { _draw(  ) } */ }
        </div>
    );

    // let polarGantt = new PolarGantt();

    // polarGantt.init( { sel: '#target' } );

    // return (
    //     <div className="polar-gantt">
    //         <div id="target" />
    //     </div>
    // );
};

Clock.Day = Day;


export default Clock;
