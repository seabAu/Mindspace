
import { useState, useMemo } from "react";
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ComposedChart,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import useReflectStore from "@/store/reflect.store";

const HabitChartsView = () => {
    const { habitsData, getActiveHabits } = useReflectStore();
    const [ selectedHabits, setSelectedHabits ] = useState( [] );
    const [ dateRange, setDateRange ] = useState( {
        from: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 ),
        to: new Date(),
    } );
    const [ interval, setInterval ] = useState( "every-day" );
    const [ analysisMethod, setAnalysisMethod ] = useState( "sum" );
    const [ chartType, setChartType ] = useState( "line" );

    // const activeHabits = getActiveHabits();
    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );

    const handleHabitToggle = ( habitId ) => {
        setSelectedHabits( ( prev ) => ( prev.includes( habitId ) ? prev.filter( ( id ) => id !== habitId ) : [ ...prev, habitId ] ) );
    };

    // Analysis functions
    const calculateAnalysis = ( values, method ) => {
        if ( values.length === 0 ) return 0;

        switch ( method ) {
            case "mean":
                return values.reduce( ( sum, val ) => sum + val, 0 ) / values.length;
            case "median":
                const sorted = [ ...values ].sort( ( a, b ) => a - b );
                const mid = Math.floor( sorted.length / 2 );
                return sorted.length % 2 === 0
                    ? ( sorted[ mid - 1 ] + sorted[ mid ] ) / 2
                    : sorted[ mid ];
            case "sum":
                return values.reduce( ( sum, val ) => sum + val, 0 );
            case "min":
                return Math.min( ...values );
            case "max":
                return Math.max( ...values );
            case "count":
                return values.filter( val => val > 0 ).length;
            case "std":
                const mean = values.reduce( ( sum, val ) => sum + val, 0 ) / values.length;
                const variance = values.reduce( ( sum, val ) => sum + Math.pow( val - mean, 2 ), 0 ) / values.length;
                return Math.sqrt( variance );
            default:
                return values.reduce( ( sum, val ) => sum + val, 0 );
        }
    };

    const chartData = useMemo( () => {
        if ( !selectedHabits.length || !dateRange.from || !dateRange.to ) return [];

        let intervals;
        let formatString;

        switch ( interval ) {
            case "every-hour":
                intervals = eachDayOfInterval( { start: dateRange.from, end: dateRange.to } );
                formatString = "M/d";
                break;
            case "every-day":
                intervals = eachDayOfInterval( { start: dateRange.from, end: dateRange.to } );
                formatString = "M/d";
                break;
            case "every-week":
                intervals = eachWeekOfInterval( { start: dateRange.from, end: dateRange.to } );
                formatString = "M/d";
                break;
            case "every-month":
                intervals = eachMonthOfInterval( { start: dateRange.from, end: dateRange.to } );
                formatString = "MMM yy";
                break;
            default:
                intervals = eachDayOfInterval( { start: dateRange.from, end: dateRange.to } );
                formatString = "M/d";
        }

        return intervals.map( ( date ) => {
            const dataPoint = {
                date: format( date, formatString ),
                fullDate: date,
            };

            selectedHabits.forEach( ( habitId ) => {
                const habit = activeHabits.find( ( h ) => h.id === habitId );
                if ( !habit ) return;

                let values = [];

                if ( interval === "every-week" ) {
                    const weekStart = startOfWeek( date );
                    const weekEnd = new Date( weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 );

                    habit.activity.forEach( ( activity ) => {
                        const activityDate = new Date( activity.date );
                        if ( activityDate >= weekStart && activityDate <= weekEnd ) {
                            values.push( activity.value );
                        }
                    } );
                } else if ( interval === "every-month" ) {
                    const monthStart = startOfMonth( date );
                    const monthEnd = new Date( monthStart.getFullYear(), monthStart.getMonth() + 1, 0 );

                    habit.activity.forEach( ( activity ) => {
                        const activityDate = new Date( activity.date );
                        if ( activityDate >= monthStart && activityDate <= monthEnd ) {
                            values.push( activity.value );
                        }
                    } );
                } else {
                    const activity = habit.activity.find( ( a ) => new Date( a.date ).toDateString() === date.toDateString() );
                    values = activity ? [ activity.value ] : [ 0 ];
                }

                dataPoint[ habit.title ] = calculateAnalysis( values, analysisMethod );
            } );

            return dataPoint;
        } );
    }, [ selectedHabits, dateRange, interval, analysisMethod, activeHabits ] );

    // Prepare data for pie chart (aggregated totals)
    const pieData = useMemo( () => {
        if ( !selectedHabits.length ) return [];

        return selectedHabits.map( habitId => {
            const habit = activeHabits.find( h => h.id === habitId );
            if ( !habit ) return null;

            const values = habit.activity.map( a => a.value ).filter( v => v > 0 );
            const total = calculateAnalysis( values, analysisMethod );

            return {
                name: habit.title,
                value: total,
                color: habit.color
            };
        } ).filter( Boolean );
    }, [ selectedHabits, analysisMethod, activeHabits ] );

    // Prepare data for radar chart (recent performance)
    const radarData = useMemo( () => {
        if ( !selectedHabits.length ) return [];

        const recentDays = eachDayOfInterval( {
            start: new Date( Date.now() - 6 * 24 * 60 * 60 * 1000 ),
            end: new Date()
        } );

        return recentDays.map( date => {
            const dataPoint = {
                day: format( date, "EEE" ),
                fullDate: date
            };

            selectedHabits.forEach( habitId => {
                const habit = activeHabits.find( h => h.id === habitId );
                if ( !habit ) return;

                const activity = habit.activity.find( a =>
                    new Date( a.date ).toDateString() === date.toDateString()
                );
                dataPoint[ habit.title ] = activity ? activity.value : 0;
            } );

            return dataPoint;
        } );
    }, [ selectedHabits, activeHabits ] );

    const renderChart = () => {
        if ( !chartData.length && !pieData.length ) return null;

        const commonProps = {
            width: "100%",
            height: "100%"
        };

        switch ( chartType ) {
            case "line":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <LineChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={ { fontSize: 10 } } />
                            <YAxis tick={ { fontSize: 10 } } />
                            <Tooltip />
                            <Legend />
                            { selectedHabits.map( ( habitId ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                return (
                                    <Line
                                        key={ habitId }
                                        type="monotone"
                                        dataKey={ habit.title }
                                        stroke={ habit.color }
                                        strokeWidth={ 2 }
                                    />
                                );
                            } ) }
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "bar":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <BarChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={ { fontSize: 10 } } />
                            <YAxis tick={ { fontSize: 10 } } />
                            <Tooltip />
                            <Legend />
                            { selectedHabits.map( ( habitId ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                return (
                                    <Bar
                                        key={ habitId }
                                        dataKey={ habit.title }
                                        fill={ habit.color }
                                        opacity={ 0.8 }
                                    />
                                );
                            } ) }
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "area":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <AreaChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={ { fontSize: 10 } } />
                            <YAxis tick={ { fontSize: 10 } } />
                            <Tooltip />
                            <Legend />
                            { selectedHabits.map( ( habitId ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                return (
                                    <Area
                                        key={ habitId }
                                        type="monotone"
                                        dataKey={ habit.title }
                                        stackId="1"
                                        stroke={ habit.color }
                                        fill={ habit.color }
                                        fillOpacity={ 0.6 }
                                    />
                                );
                            } ) }
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case "pie":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <PieChart>
                            <Pie
                                data={ pieData }
                                cx="50%"
                                cy="50%"
                                labelLine={ false }
                                label={ ( { name, percent } ) => `${ name } ${ ( percent * 100 ).toFixed( 0 ) }%` }
                                outerRadius={ 80 }
                                fill="#8884d8"
                                dataKey="value"
                            >
                                { pieData.map( ( entry, index ) => (
                                    <Cell key={ `cell-${ index }` } fill={ entry.color } />
                                ) ) }
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case "radar":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <RadarChart data={ radarData }>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="day" tick={ { fontSize: 10 } } />
                            <PolarRadiusAxis tick={ { fontSize: 10 } } />
                            { selectedHabits.map( ( habitId ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                return (
                                    <Radar
                                        key={ habitId }
                                        name={ habit.title }
                                        dataKey={ habit.title }
                                        stroke={ habit.color }
                                        fill={ habit.color }
                                        fillOpacity={ 0.3 }
                                    />
                                );
                            } ) }
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                );

            case "scatter":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <ScatterChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={ { fontSize: 10 } } />
                            <YAxis tick={ { fontSize: 10 } } />
                            <Tooltip />
                            <Legend />
                            { selectedHabits.map( ( habitId ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                return (
                                    <Scatter
                                        key={ habitId }
                                        name={ habit.title }
                                        dataKey={ habit.title }
                                        fill={ habit.color }
                                    />
                                );
                            } ) }
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case "composed":
                return (
                    <ResponsiveContainer { ...commonProps }>
                        <ComposedChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={ { fontSize: 10 } } />
                            <YAxis tick={ { fontSize: 10 } } />
                            <Tooltip />
                            <Legend />
                            { selectedHabits.map( ( habitId, index ) => {
                                const habit = activeHabits.find( ( h ) => h.id === habitId );
                                if ( index % 2 === 0 ) {
                                    return (
                                        <Bar
                                            key={ habitId }
                                            dataKey={ habit.title }
                                            fill={ habit.color }
                                            opacity={ 0.8 }
                                        />
                                    );
                                } else {
                                    return (
                                        <Line
                                            key={ habitId }
                                            type="monotone"
                                            dataKey={ habit.title }
                                            stroke={ habit.color }
                                            strokeWidth={ 2 }
                                        />
                                    );
                                }
                            } ) }
                        </ComposedChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    const getChartDescription = () => {
        const methodDescriptions = {
            mean: "Average values",
            median: "Middle values",
            sum: "Total values",
            min: "Minimum values",
            max: "Maximum values",
            count: "Count of non-zero entries",
            std: "Standard deviation"
        };

        const chartDescriptions = {
            line: "trends over time",
            bar: "comparisons across periods",
            area: "cumulative progress",
            pie: "overall distribution",
            radar: "recent 7-day performance pattern",
            scatter: "data point distribution",
            composed: "combined bar and line view"
        };

        return `${ methodDescriptions[ analysisMethod ] } shown as ${ chartDescriptions[ chartType ] }`;
    };

    return (
        <div className="space-y-4">
            {/* Controls */ }
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {/* Habit Selection */ }
                <div className="space-y-1">
                    <label className="text-sm font-medium">Habits</label>
                    <div className="border rounded p-2 max-h-32 overflow-y-auto space-y-1">
                        { activeHabits.map( ( habit ) => (
                            <div key={ habit.id } className="flex items-center space-x-2">
                                <Checkbox
                                    checked={ selectedHabits.includes( habit.id ) }
                                    onCheckedChange={ () => handleHabitToggle( habit.id ) }
                                    className="h-3 w-3"
                                />
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full" style={ { backgroundColor: habit.color } } />
                                    <span className="text-xs">{ habit.title }</span>
                                </div>
                            </div>
                        ) ) }
                    </div>
                </div>

                {/* Date Range */ }
                <div className="space-y-1">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="space-y-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left h-8 text-xs">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    { dateRange.from ? format( dateRange.from, "M/d/yy" ) : "From" }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={ dateRange.from }
                                    onSelect={ ( date ) => setDateRange( ( prev ) => ( { ...prev, from: date } ) ) }
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left h-8 text-xs">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    { dateRange.to ? format( dateRange.to, "M/d/yy" ) : "To" }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={ dateRange.to }
                                    onSelect={ ( date ) => setDateRange( ( prev ) => ( { ...prev, to: date } ) ) }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Interval */ }
                <div className="space-y-1">
                    <label className="text-sm font-medium">Interval</label>
                    <Select value={ interval } onValueChange={ setInterval }>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="every-day">Daily</SelectItem>
                            <SelectItem value="every-week">Weekly</SelectItem>
                            <SelectItem value="every-month">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Analysis Method */ }
                <div className="space-y-1">
                    <label className="text-sm font-medium">Analysis</label>
                    <Select value={ analysisMethod } onValueChange={ setAnalysisMethod }>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="mean">Mean</SelectItem>
                            <SelectItem value="median">Median</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="std">Std Dev</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Chart Type */ }
                <div className="space-y-1">
                    <label className="text-sm font-medium">Chart Type</label>
                    <Select value={ chartType } onValueChange={ setChartType }>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="line">Line</SelectItem>
                            <SelectItem value="bar">Bar</SelectItem>
                            <SelectItem value="area">Area</SelectItem>
                            <SelectItem value="pie">Pie</SelectItem>
                            <SelectItem value="radar">Radar</SelectItem>
                            <SelectItem value="scatter">Scatter</SelectItem>
                            <SelectItem value="composed">Combined</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Chart Description */ }
            { selectedHabits.length > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    Showing { getChartDescription() }
                </div>
            ) }

            {/* Chart */ }
            { ( chartData.length > 0 || pieData.length > 0 ) && selectedHabits.length > 0 ? (
                <div className="h-80 border rounded p-2">
                    { renderChart() }
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded">
                    <p className="text-sm">Select habits and configure options to view charts</p>
                </div>
            ) }

            {/* Quick Stats */ }
            { selectedHabits.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    { selectedHabits.map( habitId => {
                        const habit = activeHabits.find( h => h.id === habitId );
                        if ( !habit ) return null;

                        const values = habit.activity.map( a => a.value ).filter( v => v > 0 );
                        const stats = {
                            total: calculateAnalysis( values, "sum" ),
                            avg: calculateAnalysis( values, "mean" ),
                            count: calculateAnalysis( values, "count" ),
                            best: calculateAnalysis( values, "max" )
                        };

                        return (
                            <div key={ habitId } className="border rounded p-2">
                                <div className="flex items-center space-x-1 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={ { backgroundColor: habit.color } } />
                                    <span className="text-xs font-medium truncate">{ habit.title }</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div>
                                        <div className="text-muted-foreground">Total</div>
                                        <div className="font-medium">{ stats.total.toFixed( 1 ) }</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Avg</div>
                                        <div className="font-medium">{ stats.avg.toFixed( 1 ) }</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Days</div>
                                        <div className="font-medium">{ stats.count }</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Best</div>
                                        <div className="font-medium">{ stats.best.toFixed( 1 ) }</div>
                                    </div>
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            ) }
        </div>
    );
};

export default HabitChartsView;
