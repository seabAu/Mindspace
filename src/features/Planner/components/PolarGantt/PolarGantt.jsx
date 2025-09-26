import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
} from '@/components/ui/context-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Container } from 'postcss';
// import PolarGantt from './PolarGantt';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
// import { Slider } from "@/components/ui/slider";
import { Clock, Sun, Moon, Menu, ArrowBigUp, ArrowBigDown, Edit, Delete, Cog } from 'lucide-react';
// import ColorPicker from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import ColorPicker from '@/components/Form/color-picker';
import * as utils from 'akashatools';
import './PolarGantt.css';
import { Slider } from '@/components/ui/slider';
import { twMerge } from 'tailwind-merge';
import { SheetWrapper } from '@/components/Sheet/Sheet';
import { randRGBChannel } from '@/lib/utilities/color';

export const PolarGantt = ( {
    chartConfig,
    data,
    icons,
    regions,
    boxPlots,
    onIconClick,
    onEventClick,
    onRegionClick,
    onBoxPlotClick,
    onCategoryChange,
    useMotion = true,
    gridLines, setGridLines,
    subGridLines, setSubGridLines,
    categories,
    selectedCategory, setSelectedCategory,
    groupOverlappingEvents,
    convertInputData,
    processedData,
    filteredData,
    eventGroups,
} ) => {
    const svgRef = useRef( null );
    const [ time, setTime ] = useState( new Date() );
    const [ timeData, setTimeData ] = useState( {
        hours: 0,
        minutes: 0,
        seconds: 0,
    } );

    const [ hoveredGroup, setHoveredGroup ] = useState( null );

    const {
        scale,
        width,
        height,
        clockRadius,
        margin,
        useMilitaryTime,
        hoursCount,
        hoursHandLength,
        minutesHandLength,
        secondsHandLength,
        hoursTickStart,
        hoursTickLength,
        hoursLabelRadius,
        hoursLabelYOffset,
        arcThickness,
        arcPadding,
        cornerRadius,
        mainTickCount,
        showTickLabels,
        subTickCount,
        subTickOpacity,
        clockHandColors,
        clockFaceColor,
        clockFrameColor,
    } = chartConfig;

    const radians = Math.PI / 180;

    let color = useMemo(
        () =>
            d3
                .scaleLinear()
                .range( [ 'hsl(-180,50%,50%)', 'hsl(180,50%,50%)' ] )
                .domain( [ 0, data.length - 1 ] )
                .interpolate( d3.interpolateHcl ),
        [ data ],
    );

    let hoursScale = d3.scaleLinear().range( [ 0, 330 ] ).domain( [ 0, 23 ] );
    let minutesScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );
    let secondsScale = d3.scaleLinear().range( [ 0, 354 ] ).domain( [ 0, 59 ] );

    let hoursData = {
        value: time.hours + time.minutes / 60,
        length: -hoursHandLength,
        scale: hoursScale,
        strokeWidth: 8,
        stroke: '#FF00FF',
    };

    let minutesData = {
        value: time.minutes,
        length: -minutesHandLength,
        scale: minutesScale,
        strokeWidth: 8,
        stroke: '#00FF00',
    };

    let secondsData = {
        value: time.seconds,
        length: -secondsHandLength,
        scale: secondsScale,
        strokeWidth: 8,
        stroke: '#0000FF',
    };

    // const hoursRotation = hoursScale( time.getHours() + time.getMinutes() / 60 );
    // const minutesRotation = minutesScale( time.getMinutes() );
    // const secondsRotation = secondsScale( time.getSeconds() );

    const [ handsConfig, setHandsConfig ] = useState( {
        seconds: {
            value: time.seconds,
            length: -secondsHandLength * ( ( secondsHandLength ) / clockRadius ),
            scale: secondsScale,
            strokeWidth: 3,
            stroke: '#0000FF',
        },
        minutes: {
            value: time.minutes,
            length: -minutesHandLength * ( ( minutesHandLength ) / clockRadius ),
            scale: minutesScale,
            strokeWidth: 4,
            stroke: '#00FF00',
        },
        hours: {
            value: time.hours + time.minutes / 60,
            length: -hoursHandLength * ( ( hoursHandLength ) / clockRadius ),
            scale: hoursScale,
            strokeWidth: 8,
            stroke: '#FF00FF',
        },
    } );

    const [ handsData, setHandsData ] = useState( {
        hoursRotation: 0,
        minutesRotation: 0,
        secondsRotation: 0,
    } );

    const updateClock = () => {
        const now = new Date();

        setTime( {
            hours: now.getHours() + now.getMinutes() / 60,
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
        } );

        setHandsData( {
            // hoursRotation: hoursScale( now.getHours() + now.getMinutes() / 60 ),
            hoursRotation: hoursScale( ( now.getHours() % ( useMilitaryTime ? 24 : 12 ) + now.getMinutes() / 60 ) ),
            minutesRotation: minutesScale( now.getMinutes() ),
            secondsRotation: secondsScale( now.getSeconds() ),
        } );
    };

    useEffect( () => {
        const interval = setInterval( () => {
            setTimeData( new Date() );
            updateClock();
        }, 1000 );

        return () => clearInterval( interval );
    }, [] );





    const arc = useMemo( ( item, index ) => {
        let numItems = ( eventGroups?.length > gridLines ? eventGroups?.length : gridLines );
        const ratio = ( clockRadius - arcThickness / 2 ) / numItems;// processedData.length;
        let radialRatio = ( radians * ( 1 / ( ( useMilitaryTime ? 24 : 12 ) / 24 ) ) );
        const gridSpacing = clockRadius / ( gridLines + 1 );

        return d3
            .arc()
            .startAngle(
                ( d ) =>
                    hoursScale( d.start.getHours() + d.start.getMinutes() / 60 ) *
                    // radians,
                    // radians * ( hoursCount / 24 ),
                    // radians * ( 24 / ( useMilitaryTime ? 24 : 12 ) )
                    radialRatio
            )
            .endAngle(
                ( d ) =>
                    hoursScale( d.end.getHours() + d.end.getMinutes() / 60 ) *
                    // radians,
                    // radians * ( hoursCount / 24 ),
                    // radians * ( 24 / ( useMilitaryTime ? 24 : 12 ) )
                    radialRatio
            )
            // .innerRadius( ( d ) => ( d.index + arcPadding ) * ratio )
            // .outerRadius( ( d ) => ( d.index + 1 - arcPadding ) * ratio )
            .innerRadius( ( d, i ) => ( gridLines - i + 1 ) * gridSpacing + arcPadding / 2 )
            .outerRadius( ( d, i ) => ( gridLines - i + 2 ) * gridSpacing - arcPadding / 2 )
            .cornerRadius( cornerRadius );

    }, [
        scale,
        gridLines,
        clockRadius,
        processedData.length,
        filteredData.length,
        hoursScale,
        radians,
        arcThickness,
        arcPadding,
        cornerRadius,
    ] );


    const mainTicks = useMemo( () => {
        return Array.from(
            { length: mainTickCount },
            ( _, i ) => i * Math.floor( Number( ( useMilitaryTime ? 24 : 12 ) / mainTickCount ) ),
        );
    }, [ mainTickCount, useMilitaryTime ] );

    const subTicks = useMemo( () => {
        if ( subTickCount === 0 ) return [];
        const ticksPerMainInterval = subTickCount + 1;
        const allTicks = [];
        for (
            let i = 0;
            // i < 24;
            i < 24;
            // i += 24 / ( mainTickCount * ticksPerMainInterval )
            i += 24 / ( mainTickCount * ticksPerMainInterval )
        ) {
            allTicks.push( i );
        }
        return allTicks.filter( ( tick ) => !mainTicks.includes( tick ) );
    }, [ mainTickCount, subTickCount ] );

    const handleGroupHover = useCallback( ( groupIndex ) => {
        setHoveredGroup( groupIndex );
    }, [] );

    const renderGrid = () => {
        const gridCircles = [];
        const gridCount = gridLines + 1; // Include the outermost circle
        for ( let i = 1; i <= gridCount; i++ ) {
            const radius = ( i / gridCount ) * clockRadius;
            gridCircles.push(
                <circle
                    key={ `grid-${ i }` }
                    cx={ 0 }
                    cy={ 0 }
                    r={ radius }
                    fill='none'
                    stroke='rgba(255,255,255,0.2)'
                    strokeWidth={ i === gridCount ? 2 : 1 }
                />,
            );

            if ( i < gridCount && subGridLines > 0 ) {
                for ( let j = 1; j <= subGridLines; j++ ) {
                    const subRadius =
                        radius +
                        ( j / ( subGridLines + 1 ) ) * ( clockRadius / gridCount );
                    gridCircles.push(
                        <circle
                            key={ `subgrid-${ i }-${ j }` }
                            cx={ 0 }
                            cy={ 0 }
                            r={ subRadius }
                            fill='none'
                            stroke='rgba(255,255,255,0.1)'
                            strokeWidth={ 0.5 }
                            strokeDasharray='4,4'
                        />,
                    );
                }
            }
        }
        return gridCircles;
    };


    const buildIcons = ( items ) => {
        if ( utils.val.isValidArray( items ) ) {
            return icons?.map( ( icon, index ) => {
                let radialRatio = radians * ( ( useMilitaryTime ? 24 : 12 ) / 24 );
                // const angle = hoursScale( icon.time ) * radians * ( ( useMilitaryTime ? 24 : 12 ) / 24 );
                const angle = hoursScale( icon.time ) * radialRatio;
                const x = Math.sin( angle ) * clockRadius * 0.9;
                const y = -Math.cos( angle ) * clockRadius * 0.9;

                return (
                    <Popover key={ index }>
                        <PopoverTrigger asChild>
                            <ContextMenu>
                                <ContextMenuTrigger asChild>
                                    <motion.g
                                        style={ {
                                            position: 'absolute',
                                            transform: `translate(${ x }px, ${ y }px)`,
                                        } }
                                        x={ x }
                                        y={ y }
                                        x1={ x }
                                        x2={ y }
                                        y1={ x }
                                        y2={ y }
                                        initial={ {
                                            x: x,
                                            y: y
                                        } }
                                        animate={ {
                                            x: x,
                                            y: y,
                                            scale: 1,
                                        } }
                                        className='icon'
                                        onClick={ () => onIconClick( icon ) }
                                        whileHover={ { scale: 1.2 } }
                                        whileTap={ { scale: 0.9 } }>
                                        { icon?.component }
                                    </motion.g>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    { icon?.contextMenuItems }
                                </ContextMenuContent>
                            </ContextMenu>
                        </PopoverTrigger>
                        <PopoverContent>
                            { icon?.popoverContent }
                        </PopoverContent>
                    </Popover>
                );
            } );
        }
    };

    const buildClockHands = () => {
        if ( useMotion ) {
            return (
                <g className={ `clock-hands-container` }>
                    <g className='clock-hands'>
                        <g id="clock-hands">

                            <AnimatePresence>
                                <motion.line
                                    className='hours-hand'
                                    x1={ 0 }
                                    y1={ 0 }
                                    x2={ 0 }
                                    y2={ -handsConfig?.hours?.length }
                                    // stroke={ handsConfig?.hours?.stroke }
                                    // strokeWidth={ handsConfig?.hours?.strokeWidth }
                                    // initial={ { opacity: 0, y: 20 } }
                                    // animate={ { opacity: 1, y: 0 } }
                                    // transition={ { delay: 0.5 } }
                                    // transform={ `rotate(${ hours => hoursScale( hours ) })` }
                                    initial={ {
                                        opacity: 0,
                                        x: 0,
                                        y: 0,
                                    } }
                                    animate={ {
                                        opacity: 1,
                                        rotateZ: handsData?.hoursRotation * ( 1 / ( ( useMilitaryTime ? 24 : 12 ) / 24 ) )
                                    } }
                                    transform={ `rotate(${ handsData?.hoursRotation * ( 1 / ( ( useMilitaryTime ? 24 : 12 ) / 24 ) ) })` }
                                    transition={ { delay: 0.7 } }
                                    // transform={ `rotate(${ minutes => minutesScale( minutes ) })` }
                                    // transform={ `rotate(${ handsData?.minutesRotation })` }
                                    style={ {
                                        // transformOrigin: '100% 50%',
                                        zIndex: '100',
                                        // transform: `rotate(${ handsData?.hoursRotation })`,
                                        // x, 
                                        rotate: 180,
                                        originX: 0.0,
                                        originY: 0.0, // 1.0
                                        color: '#FF00FF',
                                        stroke: '#FF00FF',
                                        strokeWidth: handsConfig?.hours?.strokeWidth,
                                    } }
                                />

                                <motion.line
                                    className='minutes-hand'
                                    x1={ 0 }
                                    y1={ 0 }
                                    x2={ 0 }
                                    y2={ handsConfig?.minutes?.length }
                                    // stroke={ handsConfig?.minutes?.stroke }
                                    // strokeWidth={ handsConfig?.minutes?.strokeWidth }
                                    initial={ {
                                        opacity: 0,
                                        x: 0,
                                        y: 0,
                                    } }
                                    animate={ {
                                        opacity: 1,
                                        rotateZ: handsData?.minutesRotation
                                    } }
                                    transition={ { delay: 0.7 } }
                                    // transform={ `rotate(${ minutes => minutesScale( minutes ) })` }
                                    // transform={ `rotate(${ handsData?.minutesRotation })` }
                                    style={ {
                                        // transformOrigin: '100% 50%',
                                        zIndex: '100',
                                        // transform: `rotate(${ handsData?.minutesRotation })`,
                                        // x, 
                                        // rotate: 90,
                                        // rotate: 180,
                                        originX: 0.0,
                                        originY: 1.0,
                                        color: '#00FF00',
                                        stroke: handsConfig?.minutes?.stroke,
                                        strokeWidth: handsConfig?.minutes?.stroke,
                                    } }
                                />

                                <motion.line
                                    className='seconds-hand'
                                    x1={ 0 }
                                    y1={ 0 }
                                    x2={ 0 }
                                    y2={ -handsConfig?.seconds?.length }
                                    // stroke={ handsConfig?.seconds?.stroke }
                                    // strokeWidth={ handsConfig?.seconds?.strokeWidth }
                                    initial={ {
                                        opacity: 0,
                                        x: 0,
                                        y: 0,
                                    } }
                                    animate={ {
                                        opacity: 1,
                                        rotateZ: handsData?.secondsRotation
                                    } }
                                    // transition={ { delay: 0.7 } }
                                    style={ {
                                        transformOrigin: '100% 50%',
                                        zIndex: '100',
                                        // transform: `rotate(${ handsData?.secondsRotation })`,
                                        // x, 
                                        rotate: 180,
                                        originX: 0.0,
                                        originY: 0.0, // 1.0
                                        stroke: handsConfig?.seconds?.stroke,
                                        strokeWidth: handsConfig?.seconds?.strokeWidth,
                                    } }
                                />

                                {/* <motion.line
                                    className='minutes-hand'
                                    x1={ 0 }
                                    y1={ 0 }
                                    x2={ 0 }
                                    y2={ -minutesHandLength }
                                    stroke={ clockHandColors.minutes }
                                    strokeWidth={ 3 }
                                    initial={ {
                                        opacity: 1,
                                        y: 0,
                                        rotate: 0
                                    } }
                                    animate={ {
                                        opacity: 1,
                                        y: 0,
                                        rotate: handsData?.secondsRotation
                                    } }
                                    transition={ {
                                        delay: 1,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    } }
                                    //   transform: 'rotate('+ this.hoursData.scale(this.hoursData.value) +')'
                                    // transform={ `rotate(${ minutesRotation })` }
                                    style={ { transformOrigin: '50% 100%', zIndex: '100' } }
                                /> */}
                                {/* <motion.line
                                className='seconds-hand'
                                x1={ 0 }
                                y1={ 0 }
                                x2={ 0 }
                                y2={ -secondsHandLength }
                                stroke={ clockHandColors?.seconds }
                                strokeWidth={ 2 }
                                initial={ { opacity: 0, y: 20 } }
                                animate={ { opacity: 1, y: 0 } }
                                transition={ { delay: 0.9 } }
                                // transform={ `rotate(${ seconds => secondsScale( seconds ) })` }
                                transform={ `rotate(${ handsData?.secondsRotation })` }
                                style={ { transformOrigin: '50% 100%', zIndex: '100' } }
                            /> */}
                            </AnimatePresence>
                        </g>

                        <motion.circle
                            className='hands-cover'
                            cx={ 0 }
                            cy={ 0 }
                            r={ clockRadius / 20 }
                            fill={ clockHandColors?.cover }
                            initial={ { scale: 0 } }
                            animate={ { scale: 1 } }
                            transition={ { type: 'spring', stiffness: 260, damping: 20 } }
                        />
                    </g>
                </g>
            );
        }
        else {
            return (
                <g className={ `clock-hands-container` }>
                    <g className='clock-hands'>
                        <g id="clock-hands">
                            <line
                                className={ `hours-hand` }
                                x1={ 0 }
                                x2={ 0 }
                                y1={ 0 }
                                y2={ handsConfig?.hours?.length }
                                // transform={ `rotate(${ hours => hoursScale( hours ) })` }
                                transform={ `rotate(${ handsData?.hoursRotation })` }
                                style={ {
                                    stroke: handsConfig?.hours?.stroke,
                                    strokeWidth: handsConfig?.hours?.strokeWidth
                                } }
                            />
                            <line
                                className={ `minutes-hand` }
                                x1={ 0 }
                                x2={ 0 }
                                y1={ 0 }
                                // y2={ -clockRadius / 2 }
                                y2={ handsConfig?.minutes?.length }
                                // transform={ `rotate(${ minutes => minutesScale( minutes ) })` }
                                transform={ `rotate(${ handsData?.minutesRotation })` }
                                style={ {
                                    stroke: handsConfig?.minutes?.stroke,
                                    strokeWidth: handsConfig?.minutes?.strokeWidth
                                } }
                            />
                            <line
                                className={ `seconds-hand` }
                                x1={ 0 }
                                x2={ 0 }
                                y1={ 0 }
                                // y2={ -clockRadius / 1.25 }
                                y2={ handsConfig?.seconds?.length }
                                // transform={ `rotate(${ seconds => secondsScale( seconds ) })` }
                                transform={ `rotate(${ handsData?.secondsRotation })` }
                                style={ {
                                    stroke: handsConfig?.seconds?.stroke,
                                    strokeWidth: handsConfig?.seconds?.strokeWidth
                                } }
                            />
                        </g>

                        <motion.circle
                            className='hands-cover'
                            cx={ 0 }
                            cy={ 0 }
                            r={ clockRadius / 20 }
                            fill={ clockHandColors?.cover }
                            initial={ { scale: 0 } }
                            animate={ { scale: 1 } }
                            transition={ { type: 'spring', stiffness: 260, damping: 20 } }
                        />
                    </g>
                </g>
            );
        }
    };

    const buildRegions = ( regions ) => {
        if ( utils.val.isValidArray( regions, true ) ) {
            let radialRatio = Math.PI / 12 * ( 24 / ( useMilitaryTime ? 24 : 12 ) );
            return (
                regions.map( ( region, index ) => {
                    let start = region?.start;
                    let end = region?.end;
                    if ( start > end ) {
                        // End is a smaller number, thus PAST the 24th hour and on the other side of the clock. 
                        // start = end;
                        start = start;
                        // end = region?.start;
                        end = 24 + end;
                    }

                    const regionArc = d3
                        .arc()
                        // .startAngle( hoursScale( (start / ( 24/360 ) )* ( 24* Math.PI  / 360 ) ) * ( radians ) )
                        // .startAngle( hoursScale( start ) * ( ( radians ) ) )
                        .startAngle( ( start * ( radialRatio ) ) )
                        // .endAngle( hoursScale( (end / ( 24/360 ) )* ( 24* Math.PI  / 360 ) ) * ( radians ) )
                        // .endAngle( hoursScale( end ) * ( ( radians ) ) )
                        .endAngle( ( end * ( radialRatio ) ) )
                        .innerRadius( region.innerRadius )
                        .outerRadius( region.outerRadius );

                    return (
                        <TooltipProvider key={ index }>
                            <Tooltip>
                                <TooltipTrigger
                                    asChild // popoverTargetAction=''
                                // delayDuration={ 100 }
                                // skipDelayDuration={ false }
                                // disableHoverableContent
                                >
                                    <motion.path
                                        d={ regionArc() }
                                        fill={ region.color }
                                        opacity={ 0.5 }
                                        className='region'
                                        onClick={ () => onRegionClick( region ) }
                                        initial={ { opacity: 0 } }
                                        animate={ { opacity: 0.5 } }
                                        whileHover={ { opacity: 0.8 } }
                                        transition={ { duration: 0.3 } }
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{ region?.label }</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                } )
            );
        }
    };

    const buildEventArcs = ( arcs ) => {
        if ( utils.val.isValidArray( eventGroups, true ) ) {
            return eventGroups.map( ( group, groupIndex ) => {
                return (

                    <motion.g
                        key={ groupIndex }
                        initial="hidden"
                        animate="visible"
                        variants={ {
                            visible: { transition: { staggerChildren: 0.05 } },
                            hidden: { transition: { staggerChildren: 0.05 } }
                        } }
                    >
                        <AnimatePresence>
                            { group.map( ( item, itemIndex ) => {
                                const isHovered = hoveredGroup === groupIndex;
                                const offset = isHovered ? itemIndex * 10 : 0;

                                return (
                                    <TooltipProvider key={ item.index }>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.path
                                                    className="agenda-arc-path"
                                                    d={ arc( item, item.index ) }
                                                    fill={ color( item.index ) }
                                                    onClick={ () => onEventClick( item ) }
                                                    variants={ {
                                                        visible: { opacity: 1, scale: 1 },
                                                        hidden: { opacity: 0, scale: 0 }
                                                    } }
                                                    whileHover={ { scale: 1.05 } }
                                                    transition={ { type: "spring", stiffness: 300, damping: 20 } }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{ item.label }</p>
                                                <p>{ `${ item.start.toLocaleTimeString() } - ${ item.end.toLocaleTimeString() }` }</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            } ) }
                        </AnimatePresence>
                    </motion.g>
                );
            } );
        }
    };

    const buildBoxPlots = ( boxPlots ) => {
        if ( utils.val.isValidArray( boxPlots, true ) ) {
            let radialRatio = radians * ( ( useMilitaryTime ? 24 : 12 ) / 24 );
            return (
                boxPlots.map( ( plot, index ) => {

                    let start = plot?.start;
                    let end = plot?.end;
                    if ( start > end ) {
                        start = start;
                        end = 24 + end;
                    }
                    let whisker_Start = plot?.whiskerStart;
                    let whisker_End = plot?.whiskerEnd;
                    if ( whisker_Start > whisker_End ) {
                        whisker_Start = whisker_Start;
                        whisker_End = 24 + whisker_End;
                    }

                    // ( plot.start >= plot.start &&
                    //     plot.start < plot.end ) ||
                    // ( plot.end > plot.start &&
                    //     plot.end <= plot.end ),
                    const boxArc = d3
                        .arc()
                        .startAngle( hoursScale( start ) * radialRatio )
                        .endAngle( hoursScale( end ) * radialRatio )
                        .innerRadius( clockRadius * 0.7 )
                        .outerRadius( clockRadius * 0.8 );

                    const whiskerStart = d3
                        .arc()
                        .startAngle( hoursScale( plot?.whiskerStart ) * radialRatio )
                        .endAngle( hoursScale( plot?.whiskerStart ) * radialRatio )
                        .innerRadius( clockRadius * 0.65 )
                        .outerRadius( clockRadius * 0.85 );

                    const whiskerEnd = d3
                        .arc()
                        .startAngle( hoursScale( plot?.whiskerEnd ) * radialRatio )
                        .endAngle( hoursScale( plot?.whiskerEnd ) * radialRatio )
                        .innerRadius( clockRadius * 0.65 )
                        .outerRadius( clockRadius * 0.85 );

                    return (
                        <TooltipProvider key={ index }>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.g
                                        className='box-plot'
                                        onClick={ () => onBoxPlotClick( plot ) }
                                        whileHover={ { scale: 1.05 } }>
                                        <motion.path
                                            d={ boxArc() }
                                            fill={ plot?.color }
                                            opacity={ 0.7 }
                                            initial={ { opacity: 0 } }
                                            animate={ { opacity: 0.7 } }
                                            transition={ { duration: 0.5 } }
                                        />
                                        <motion.path
                                            d={ whiskerStart() }
                                            stroke={ plot?.color }
                                            strokeWidth={ 2 }
                                            initial={ { pathLength: 0 } }
                                            animate={ { pathLength: 1 } }
                                            transition={ {
                                                duration: 0.5,
                                                delay: 0.2,
                                            } }
                                        />
                                        <motion.path
                                            d={ whiskerEnd() }
                                            stroke={ plot?.color }
                                            strokeWidth={ 2 }
                                            initial={ { pathLength: 0 } }
                                            animate={ { pathLength: 1 } }
                                            transition={ {
                                                duration: 0.5,
                                                delay: 0.4,
                                            } }
                                        />
                                    </motion.g>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{ plot?.label }</p>
                                    <p>{ `Range: ${ plot?.whiskerStart }H - ${ plot?.whiskerEnd }H` }</p>
                                    <p>{ `Likely: ${ plot?.start }H - ${ plot?.end }H` }</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                } )
            );
        }
    };

    return (
        <div
            className={ `w-full h-full overflow-auto z-20 flex flex-col justify-center items-center` }
        >
            <svg
                className={ `polar-gantt flex flex-row justify-center items-center` }
                ref={ svgRef }
                height={ `${ height }px` }
                width={ `${ width }px` }
                style={ {
                    // height: `${ height }px`,
                    height: `${ 100 }%`,
                    // width: `${ width }px`,
                    width: `${ 100 }%`,
                } }
            >

                <g
                    className={ `clock-face flex flex-row justify-center items-center` }
                    transform={ `translate(${ clockRadius + margin },${ clockRadius + margin })` }
                    height={ `${ height }px` }
                    width={ `${ width }px` }
                >
                    <motion.path
                        d={ d3.arc()( {
                            startAngle: 0,
                            endAngle: Math.PI * 2,
                            innerRadius: clockRadius + hoursTickLength,
                            outerRadius: clockRadius,
                        } ) }
                        className='clock-frame'
                        fill={ clockFrameColor }
                        initial={ { pathLength: 0 } }
                        animate={ { pathLength: 1 } }
                        transition={ { duration: 1 } }
                    />
                    <motion.circle
                        cx={ 0 }
                        cy={ 0 }
                        r={ clockRadius }
                        className='clock-background'
                        fill={ clockFaceColor }
                        initial={ { scale: 0 } }
                        animate={ { scale: 1 } }
                        transition={ { type: 'spring', stiffness: 260, damping: 20 } }
                    />

                    {/* Circumferencial hour markers. */ }
                    { mainTicks.map( ( hour, index ) => (
                        <React.Fragment key={ hour }>
                            <motion.line
                                className='hours-tick'
                                x1={ 0 }
                                x2={ 0 }
                                y1={ hoursTickStart }
                                y2={ hoursTickStart + hoursTickLength }
                                transform={ `rotate(${ hour * 15 })` }
                                stroke='white'
                                initial={ { opacity: 0, y: 10 } }
                                animate={ { opacity: 1, y: 0 } }
                                transition={ { delay: hour * 0.1 } }
                            />
                            { showTickLabels && (
                                <motion.text
                                    className='hours-label'
                                    alignmentBaseline='middle'
                                    textAnchor='middle'
                                    x={
                                        hoursLabelRadius *
                                        Math.sin( hour * 15 * radians * ( 24 / ( useMilitaryTime ? 24 : 12 ) ) )
                                    }
                                    y={
                                        -hoursLabelRadius *
                                        Math.cos( hour * 15 * radians * ( 24 / ( useMilitaryTime ? 24 : 12 ) ) ) +
                                        hoursLabelYOffset
                                    }
                                    fill='white'
                                    initial={ { opacity: 0 } }
                                    animate={ { opacity: 1 } }
                                    transition={ { delay: hour * 0.1 + 0.5 } }>
                                    { `${ hour }H` }
                                </motion.text>
                            ) }
                        </React.Fragment>
                    ) ) }
                    { subTicks.map( ( hour ) => (
                        <motion.line
                            key={ hour }
                            className='sub-tick'
                            x1={ 0 }
                            x2={ 0 }
                            y1={ hoursTickStart }
                            y2={ hoursTickStart + hoursTickLength / 2 }
                            transform={ `rotate(${ hour * 15 })` }
                            stroke='white'
                            opacity={ subTickOpacity }
                            initial={ { opacity: 0 } }
                            animate={ { opacity: subTickOpacity } }
                            transition={ { delay: hour * 0.05 } }
                        />
                    ) ) }

                    { renderGrid() }

                    { buildRegions( regions ) }

                    { utils.val.isValidArray( eventGroups, true ) && buildEventArcs( eventGroups ) }

                    { utils.val.isValidArray( icons, true ) && buildIcons( icons ) }


                    { buildBoxPlots( boxPlots ) }

                    { buildClockHands() }
                </g>
            </svg>
        </div>
    );
};

export const PolarGanttContainer = ( props ) => {
    const {
        dimensions,
        eventsData = [],
    } = props;

    const [ chartConfig, setChartConfig ] = useState( {
        scale: 2.0,
        width: 600,
        height: 600,
        clockRadius: 250,
        useMilitaryTime: true,
        hoursCount: 24,
        margin: 20,
        hoursHandLength: 150,
        minutesHandLength: 200,
        secondsHandLength: 220,
        hoursTickStart: 265,
        hoursTickLength: 20,
        hoursLabelRadius: 265,
        hoursLabelYOffset: 0,
        arcThickness: 32,
        arcPadding: 0.24,
        cornerRadius: 5,
        mainTickCount: 12,
        showTickLabels: true,
        subTickCount: 1,
        subTickOpacity: 0.75,
        clockHandColors: {
            hours: '#ffffff',
            minutes: '#cccccc',
            seconds: '#ff0000',
            cover: '#000000',
        },
        clockFaceColor: '#1a1a1a',
        clockFrameColor: '#333333',
        // gridLines: 4,
        // subGridLines: 1,
    } );

    const updateConfig = ( key, value ) => {
        setChartConfig( ( prev ) => ( { ...prev, [ key ]: value } ) );
    };

    const updateClockHandColor = ( hand, color ) => {
        setChartConfig( ( prev ) => ( {
            ...prev,
            clockHandColors: {
                ...prev.clockHandColors,
                [ hand ]: color,
            },
        } ) );
    };

    const categories = useMemo( () => {
        let uniqueCategories;
        if ( utils.val.isValidArray( eventsData, true ) ) {
            uniqueCategories = new Set(
                eventsData.map( ( item ) => {
                    if ( utils.val.isValid( item ) ) {
                        if ( item?.category && item?.category !== '' ) return item?.category;
                    }
                } ),
            );
        }
        return [ 'all', ...Array.from( uniqueCategories ).filter( ( v, i ) => ( v ) ) ];
    }, [ eventsData ] );

    const icons = [
        {
            time: 6,
            component: <Sun size={ 20 } />,
            popoverContent: <div>Wake up time</div>,
            contextMenuItems: <div>Set alarm</div>,
        },
        {
            time: 22,
            component: <Moon size={ 20 } />,
            popoverContent: <div>Bedtime</div>,
            contextMenuItems: <div>Set reminder</div>,
        },
    ];

    const regions = [
        {
            label: 'Sleep Hours',
            start: 3,
            end: 10,
            innerRadius: chartConfig.clockRadius * 0.125,
            outerRadius: chartConfig.clockRadius * 0.875,
            color: 'rgba(255, 0, 255, 0.4)',
        },
        {
            label: 'Work Hours',
            start: 10,
            end: 18,
            innerRadius: chartConfig.clockRadius * 0.125,
            outerRadius: chartConfig.clockRadius * 0.875,
            color: 'rgba(255, 0, 128, 0.4)',
        },
        {
            label: 'Play Hours',
            start: 18,
            end: 3,
            innerRadius: chartConfig.clockRadius * 0.125,
            outerRadius: chartConfig.clockRadius * 0.875,
            color: 'rgba(0, 255, 0, 0.4)',
        },
    ];

    const boxPlots = [
        {
            start: 12,
            end: 14,
            whiskerStart: 11.5,
            whiskerEnd: 14.5,
            color: `rgba(${ 129 }, ${ 128 }, ${ 255 }, ${ 0.7 })`,
            label: 'Lunch Time',
        },
        {
            start: 23,
            end: 4,
            whiskerStart: 22, // () => { return this.start + this.start * 0.1; },
            whiskerEnd: 5, // () => { return this.end + this.end * 0.1; },
            // color: `rgba(${ 0 }, ${ randRGBChannel() }, ${ 0 }, ${ 0.7 })`,
            color: 'rgba(0, 255, 0, 0.7)',
            label: 'Hobby Time',
        },
    ];

    const handleIconClick = ( icon ) => {
        console.log( 'Icon clicked:', icon );
    };

    const handleEventClick = ( event ) => {
        console.log( 'Event clicked:', event );
    };

    const handleRegionClick = ( region ) => {
        console.log( 'Region clicked:', region );
    };

    const handleBoxPlotClick = ( boxPlot ) => {
        console.log( 'Box plot clicked:', boxPlot );
    };

    const handleCategoryChange = ( category ) => {
        setSelectedCategory( category );
    };

    const groupOverlappingEvents = useCallback( ( events ) => {
        const groups = [];
        events.forEach( ( event ) => {
            const overlappingGroup = groups.find( ( group ) =>
                group.some(
                    ( groupEvent ) =>
                        ( event.start >= groupEvent.start &&
                            event.start < groupEvent.end ) ||
                        ( event.end > groupEvent.start &&
                            event.end <= groupEvent.end ),
                ),
            );
            if ( overlappingGroup ) {
                overlappingGroup.push( event );
            } else {
                groups.push( [ event ] );
            }
        } );
        return groups;
    }, [] );

    const convertInputData = useCallback( ( inputData ) => {
        return inputData.map( ( item, index ) => ( {
            ...item,
            index,
            start: new Date( item.start ),
            end: new Date( item.end ),
        } ) );
    }, [] );

    const processedData = useMemo(
        () => convertInputData( eventsData ),
        [ eventsData, convertInputData ],
    );

    const [ selectedCategory, setSelectedCategory ] = useState( 'all' );
    const filteredData =
        selectedCategory === 'all'
            ? processedData
            : processedData.filter(
                ( item ) => item && item.hasOwnProperty( 'category' ) && item?.category === selectedCategory,
            );

    const eventGroups = useMemo(
        () => groupOverlappingEvents( filteredData ),
        [ filteredData, groupOverlappingEvents ],
    );

    const [ gridLines, setGridLines ] = useState( utils.val.isValidArray( filteredData, true ) ? filteredData?.length : 4 );
    const [ subGridLines, setSubGridLines ] = useState( 1 );

    useEffect( () => {
        if ( utils.val.isValidArray( filteredData, true ) && gridLines >= filteredData?.length ) setGridLines( filteredData?.length );
    }, [ filteredData, selectedCategory ] );

    let fieldHeight = 6;
    return (
        <div className={`flex flex-col flex-1 items-center justify-center gap-4 w-full max-h-fit relative`}>

            {/* Filter button group */ }
            <div className='flex flex-row justify-center items-center w-full border-[0.125rem] rounded-xl'>

                <SheetWrapper
                    className={ `p-2` }
                    title={ `Chart Settings` }
                    side={ `right` }
                    trigger={
                        <Button
                            className={ `p-2` }
                            size={ 'sm' }
                            variant={ 'outline' }
                        >
                            <Cog />
                        </Button>
                    }
                >
                    <div
                        className={ `settings-menu w-full justify-center items-stretch overflow-hidden` }
                    >
                        { Object.entries( chartConfig ).map( ( [ key, value ] ) => {
                            if ( key === 'clockHandColors' ) {
                                return (
                                    <div
                                        key={ key }
                                        className={ `` }>
                                        <Label
                                            className={ `w-2/6 max-w-2/6 h-${ fieldHeight } font-thin text-xs text-ellipsis text-wrap` }
                                        >
                                            Clock Hand Colors
                                        </Label>
                                        { Object.entries( value ).map(
                                            ( [ hand, color ] ) => (
                                                <div
                                                    key={ hand }
                                                    className={ `text-sm font-medium w-2/6 flex items-center` }
                                                >
                                                    <Label
                                                        htmlFor={ `${ hand }-color` }
                                                        className={ `w-20 h-${ fieldHeight } ` }
                                                    >
                                                        { hand }
                                                    </Label>
                                                    <ColorPicker
                                                        color={ color }
                                                        onChange={ ( newColor ) =>
                                                            updateClockHandColor(
                                                                hand,
                                                                newColor,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                        ) }
                                    </div>
                                );
                            }
                            if (
                                key === 'clockFaceColor' ||
                                key === 'clockFrameColor'
                            ) {
                                return (
                                    <div
                                        key={ key }
                                        className={ `flex flex-row justify-center items-center gap-1 h-${ fieldHeight } ` }
                                    >
                                        <Label
                                            htmlFor={ key }
                                            className={ `w-2/6 h-${ fieldHeight } max-w-2/6 font-thin text-xs text-ellipsis text-wrap overflow-hidden` }
                                        >
                                            { key }
                                        </Label>
                                        <ColorPicker
                                            color={ value }
                                            onChange={ ( newColor ) =>
                                                updateConfig( key, newColor )
                                            }
                                        />
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={ key }
                                    className={ `flex flex-row justify-center items-center gap-2 h-${ fieldHeight }` }
                                >
                                    <Label
                                        htmlFor={ key }
                                        className={ `flex flex-row justify-start items-center w-2/6 h-${ fieldHeight } max-w-2/6 font-thin text-xs text-ellipsis text-wrap overflow-hidden` }
                                    >
                                        { key }
                                    </Label>
                                    { typeof value === 'boolean' ? (
                                        <Checkbox
                                            id={ key }
                                            checked={ value }
                                            onCheckedChange={ ( checked ) =>
                                                updateConfig( key, checked )
                                            }
                                            className={ `` }
                                        />
                                    ) : typeof value === 'number' ? (
                                        key === 'subTickOpacity'
                                            ? (
                                                <div className={ `flex flex-row flex-nowrap justify-center items-center w-full h-full h-${ fieldHeight }` }>
                                                    <Slider
                                                        className={ `w-4/6 h-${ fieldHeight }` }
                                                        id={ key }
                                                        max={ 100 }
                                                        min={ 0 }
                                                        step={ 1 }
                                                        defaultValue={ [ value ] }
                                                        onValueChange={ ( [ newValue ] ) => updateConfig( key, Number( newValue ) ) }
                                                    />
                                                </div>
                                            ) : (
                                                <div className={ `flex flex-row flex-nowrap justify-center items-center w-full h-full` }>
                                                    <Slider
                                                        className={ `w-4/6 h-${ fieldHeight }` }
                                                        id={ key }
                                                        // max={ 1 }
                                                        min={ 0 }
                                                        step={ 1 }
                                                        defaultValue={ [ value ] }
                                                        onValueChange={ ( [ newValue ] ) => updateConfig( key, Number( newValue ) ) }
                                                    />

                                                    <Input
                                                        id={ key }
                                                        type='number'
                                                        defaultValue={ value }
                                                        // min={ }
                                                        // onValueChange={ ( [ newValue ] ) => updateConfig( key, Number( newValue ) ) }
                                                        onChange={ ( e ) => updateConfig( key, Number( e.target.value ) ) }
                                                        className={ `w-16 h-${ fieldHeight }` }
                                                    />
                                                    <div className={ `w-16` }>{ `${ value }` }</div>
                                                </div>
                                            )
                                    ) : null }
                                </div>
                            );
                        } ) }

                        <div className={ `flex flex-row justify-center items-center gap-2 h-${ fieldHeight }` }>
                            <Label
                                htmlFor='gridLines'
                                className={ `flex flex-row justify-start items-center w-2/6 h-${ fieldHeight } max-w-2/6 font-thin text-xs text-ellipsis text-wrap overflow-hidden` }
                            >
                                { `Grid Lines` }
                            </Label>
                            <Slider
                                key={ 'gridLines' }
                                // minStepsBetweenThumbs={ 1 }
                                onValueChange={ ( [ newValue ] ) => setGridLines( Number( newValue ) ) }
                                className={ `w-4/6 h-${ fieldHeight }` }
                                defaultValue={ [ gridLines ] }
                                id={ 'gridLines-input' }
                                max={ 32 }
                                min={ eventGroups?.length }
                                step={ 1 }
                            />
                            <Input
                                id='gridLines'
                                type='number'
                                value={ gridLines }
                                min={ eventGroups?.length }
                                onChange={ ( e ) => setGridLines( Number( e.target.value ) ) }
                                className={ `w-16 h-${ fieldHeight }` }
                            />
                            <div className={ `w-16` }>{ `${ gridLines }` }</div>
                        </div>

                        <div className='flex flex-row justify-center items-center gap-2 w-full h-${ fieldHeight }'>
                            <Label
                                htmlFor='subGridLines'
                                className={ `flex flex-row justify-start items-center w-2/6 h-${ fieldHeight } max-w-2/6 font-thin text-xs text-ellipsis text-wrap overflow-hidden` }
                            >
                                Sub-Grid Lines
                            </Label>
                            <Slider
                                id={ 'subGridLines' }
                                onValueChange={ ( [ newValue ] ) => setSubGridLines( newValue ) }
                                className={ `w-4/6 h-${ fieldHeight }` }
                                min={ 0 }
                                max={ 16 }
                                step={ 1 }
                                defaultValue={ [ subGridLines ] }
                            />

                            <Input
                                id='subGridLines'
                                type='number'
                                value={ subGridLines }
                                min={ eventGroups?.length }
                                onChange={ ( e ) =>
                                    setSubGridLines( Number( e.target.value ) )
                                }
                                className={ `w-16 h-${ fieldHeight }` }
                            />
                            <div className={ `w-16` }>{ `${ subGridLines }` }</div>
                        </div>

                    </div>
                </SheetWrapper>
                { categories && utils.val.isValidArray( categories, true ) && categories.map( ( category ) => (
                    <Button
                        key={ category }
                        onClick={ () => handleCategoryChange( category ) }
                        variant={
                            selectedCategory === category
                                ? 'default'
                                : 'outline'
                        }
                        className='mr-2'>
                        { category && category != '' && category?.charAt( 0 ).toUpperCase() + category?.slice( 1 ) }
                    </Button>
                ) ) }
            </div>

            <div
                className={ twMerge(
                    `polar-gantt-chart-container flex flex-row flex-grow justify-center items-center max-h-fit overflow-auto`,
                    `flex md:flex-col lg:flex-row justify-stretch items-stretch border border-[0.125rem] rounded-xl`
                ) }
            >

                <div
                    className={ twMerge(
                        `polar-gantt-chart w-full max-h-fit  p-8`,
                        `flex md:flex-col lg:flex-row `,
                        `fjustify-center items-center `,
                    ) }
                >
                    <PolarGantt
                        chartConfig={ chartConfig }
                        data={ eventsData }
                        icons={ icons }
                        regions={ regions }
                        boxPlots={ boxPlots }
                        onIconClick={ handleIconClick }
                        onEventClick={ handleEventClick }
                        onRegionClick={ handleRegionClick }
                        onBoxPlotClick={ handleBoxPlotClick }
                        categories={ categories }
                        selectedCategory={ selectedCategory }
                        setSelectedCategory={ setSelectedCategory }
                        onCategoryChange={ handleCategoryChange }
                        gridLines={ gridLines }
                        setGridLines={ setGridLines }
                        subGridLines={ subGridLines }
                        setSubGridLines={ setSubGridLines }
                        groupOverlappingEvents={ groupOverlappingEvents }
                        convertInputData={ convertInputData }
                        processedData={ processedData }
                        filteredData={ filteredData }
                        eventGroups={ eventGroups }
                    />
                </div>

            </div>
        </div>
    );
};

PolarGantt.Container = PolarGanttContainer;


/*
    const convertInputData = useCallback( ( inputData ) => {
        return inputData.map( ( item, index ) => ( {
            ...item,
            index,
            start: new Date( item.start ),
            end: new Date( item.end ),
        } ) );
    }, [] );
 
    const processedData = useMemo(
        () => convertInputData( data ),
        [ data, convertInputData ],
    );
 
    const groupOverlappingEvents = useCallback( ( events ) => {
        const groups = [];
        events.forEach( ( event ) => {
            const overlappingGroup = groups.find( ( group ) =>
                group.some(
                    ( groupEvent ) =>
                        ( event.start >= groupEvent.start &&
                            event.start < groupEvent.end ) ||
                        ( event.end > groupEvent.start &&
                            event.end <= groupEvent.end ),
                ),
            );
            if ( overlappingGroup ) {
                overlappingGroup.push( event );
            } else {
                groups.push( [ event ] );
            }
        } );
        return groups;
    }, [] );
 
    const filteredData =
        selectedCategory === 'all'
            ? processedData
            : processedData.filter(
                ( item ) => item && item.hasOwnProperty( 'category' ) && item?.category === selectedCategory,
            );
 
    const eventGroups = useMemo(
        () => groupOverlappingEvents( filteredData ),
        [ filteredData, groupOverlappingEvents ],
    );
 
    useEffect( () => {
        if ( utils.val.isValidArray( filteredData, true ) && gridLines > filteredData?.length ) setGridLines( filteredData?.length );
    }, [ filteredData, selectedCategory ] );
 */