
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
    format,
    parse,
    eachMonthOfInterval,
    eachYearOfInterval,
    eachWeekOfInterval,
    eachDayOfInterval,
    eachHourOfInterval,
    getWeek,
    formatDate,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { useStatsContext } from "@/features/Reflect/Stats/contexts/StatsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltipContent, BarChart, LineChart, PieChart, AreaChart } from "@/features/Reflect/Stats/components/_defunct/ui/chart";
import * as utils from 'akashatools';
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

// Generate a random color
const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for ( let i = 0; i < 6; i++ ) {
        color += letters[ Math.floor( Math.random() * 16 ) ];
    }
    return color;
};

const DataAnalysis = () => {
    const { statsData } = useReflectContext();
    const [ selectedDataKey, setSelectedDataKey ] = useState( "" );
    const [ chartType, setChartType ] = useState( "line" );
    const [ timeRange, setTimeRange ] = useState( { start: null, end: null } );
    const [ timeStep, setTimeStep ] = useState( "day" );
    const [ aggregationMethod, setAggregationMethod ] = useState( "show" );

    // Extract unique data keys from statsData
    const dataKeys = useMemo( () => {
        const keys = new Set();
        if ( utils.val.isValidArray( statsData, true ) ) {
            statsData.forEach( ( item ) => {
                keys.add( item.dataKey );
            } );
        }
        return Array.from( keys );
    }, [ statsData ] );

    // Get time range from data
    useEffect( () => {
        // if ( statsData.length > 0 ) {
        if ( utils.val.isValidArray( statsData, true ) ) {
            const timestamps = statsData.map( ( item ) => new Date( item.timeStamp ).getTime() );
            const minTime = new Date( Math.min( ...timestamps ) );
            const maxTime = new Date( Math.max( ...timestamps ) );

            setTimeRange( {
                start: minTime,
                end: maxTime,
            } );
        }
    }, [ statsData ] );

    // Generate chart data based on selected parameters
    const chartData = useMemo( () => {
        if ( !selectedDataKey ) {
            // Return sample data if no key is selected
            return [
                { name: "Jan", value: 400 },
                { name: "Feb", value: 300 },
                { name: "Mar", value: 600 },
                { name: "Apr", value: 800 },
                { name: "May", value: 500 },
                { name: "Jun", value: 900 },
            ];
        }

        // Filter statsData by selected data key
        let filteredItems = statsData.filter( ( item ) => item.dataKey === selectedDataKey );

        // Ensure we have valid start and end dates
        if ( !timeRange?.start || !timeRange?.end ) {
            return [];
        }

        const startDate = new Date( timeRange?.start );
        const endDate = new Date( timeRange?.end );

        // Filter statsData by date range using timeStamp
        filteredItems = filteredItems.filter( ( item ) => {
            const itemDate = new Date( item.timeStamp );
            return itemDate >= startDate && itemDate <= endDate;
        } );

        // Generate all time periods in the selected range
        let timePeriods = [];
        switch ( timeStep ) {
            case "hour":
                timePeriods = eachHourOfInterval( { start: startDate, end: endDate } );
                break;
            case "day":
                timePeriods = eachDayOfInterval( { start: startDate, end: endDate } );
                break;
            case "week":
                timePeriods = eachWeekOfInterval( { start: startDate, end: endDate } );
                break;
            case "month":
                timePeriods = eachMonthOfInterval( { start: startDate, end: endDate } );
                break;
            case "year":
                timePeriods = eachYearOfInterval( { start: startDate, end: endDate } );
                break;
            default:
                timePeriods = eachDayOfInterval( { start: startDate, end: endDate } );
        }

        // Initialize data structure with all time periods
        const groupedData = {};
        timePeriods.forEach( ( period ) => {
            let key;
            switch ( timeStep ) {
                case "hour":
                    key = format( period, "yyyy-MM-dd HH:00" );
                    break;
                case "day":
                    key = format( period, "yyyy-MM-dd" );
                    break;
                case "week":
                    key = `${ format( period, "yyyy" ) }-W${ getWeek( period ) }`;
                    break;
                case "month":
                    key = format( period, "yyyy-MM" );
                    break;
                case "year":
                    key = format( period, "yyyy" );
                    break;
                default:
                    key = format( period, "yyyy-MM-dd" );
            }
            groupedData[ key ] = [];
        } );

        // Group statsData by time period
        filteredItems.forEach( ( item ) => {
            const date = new Date( item.timeStamp );
            let key;

            switch ( timeStep ) {
                case "hour":
                    key = format( date, "yyyy-MM-dd HH:00" );
                    break;
                case "day":
                    key = format( date, "yyyy-MM-dd" );
                    break;
                case "week":
                    const weekNum = getWeek( date );
                    key = `${ format( date, "yyyy" ) }-W${ weekNum }`;
                    break;
                case "month":
                    key = format( date, "yyyy-MM" );
                    break;
                case "year":
                    key = format( date, "yyyy" );
                    break;
                default:
                    key = format( date, "yyyy-MM-dd" );
            }

            if ( groupedData[ key ] ) {
                groupedData[ key ].push( item );
            }
        } );

        // Apply aggregation method to each time period
        return Object.entries( groupedData )
            .map( ( [ key, items ] ) => {
                let value = 0;

                if ( items.length > 0 ) {
                    switch ( aggregationMethod ) {
                        case "mean":
                            // Calculate average
                            value =
                                items.reduce( ( sum, item ) => {
                                    const val = typeof item.dataValue === "number" ? item.dataValue : 0;
                                    return sum + val;
                                }, 0 ) / items.length;
                            break;
                        case "sum":
                            // Calculate sum
                            value = items.reduce( ( sum, item ) => {
                                const val = typeof item.dataValue === "number" ? item.dataValue : 0;
                                return sum + val;
                            }, 0 );
                            break;
                        case "min":
                            // Find minimum
                            value =
                                items.length > 0
                                    ? Math.min( ...items.map( ( item ) => ( typeof item.dataValue === "number" ? item.dataValue : 0 ) ) )
                                    : 0;
                            break;
                        case "max":
                            // Find maximum
                            value =
                                items.length > 0
                                    ? Math.max( ...items.map( ( item ) => ( typeof item.dataValue === "number" ? item.dataValue : 0 ) ) )
                                    : 0;
                            break;
                        case "count":
                            // Count items
                            value = items.length;
                            break;
                        default:
                            // Just use the first value or 0 if no items
                            value = items.length > 0 && typeof items[ 0 ]?.dataValue === "number" ? items[ 0 ].dataValue : 0;
                    }
                }

                // Format the display name based on time step
                let name;
                try {
                    switch ( timeStep ) {
                        case "hour":
                            const hourDate = parse( key, "yyyy-MM-dd HH:00", new Date() );
                            name = format( hourDate, "MMM d, HH:00" );
                            break;
                        case "day":
                            const dayDate = parse( key, "yyyy-MM-dd", new Date() );
                            name = format( dayDate, "MMM d" );
                            break;
                        case "week":
                            const [ year, weekPart ] = key.split( "-W" );
                            name = `${ year } W${ weekPart }`;
                            break;
                        case "month":
                            const monthDate = parse( key, "yyyy-MM", new Date() );
                            name = format( monthDate, "MMM yyyy" );
                            break;
                        case "year":
                            name = key;
                            break;
                        default:
                            name = key;
                    }
                } catch ( error ) {
                    console.error( "Error formatting date:", error, key );
                    name = key;
                }

                return { name, value, itemCount: statsData.length };
            } )
            .sort( ( a, b ) => {
                // Sort by the original key format to ensure chronological order
                return a.name.localeCompare( b.name );
            } );
    }, [ statsData, selectedDataKey, timeRange, timeStep, aggregationMethod ] );

    // Generate chart series based on the data
    const chartSeries = useMemo( () => {
        return [ { key: "value", color: "#3b82f6", label: selectedDataKey || "Value" } ];
    }, [ selectedDataKey ] );

    // Render the appropriate chart based on the selected type
    const renderChart = useCallback( () => {
        const config = chartSeries.reduce( ( acc, series ) => {
            acc[ series.key ] = {
                label: series.label,
                color: series.color,
            };
            return acc;
        }, {} );

        return (
            <ChartContainer config={ config } className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    { chartType === "bar" ? (
                        <BarChart data={ chartData } margin={ { top: 20, right: 30, left: 20, bottom: 60 } }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={ -45 } textAnchor="end" height={ 60 } />
                            <YAxis />
                            <Tooltip
                                content={ <ChartTooltipContent /> }
                                formatter={ ( value, name, props ) => {
                                    return [ `${ value } (${ props.payload.itemCount } items)`, name ];
                                } }
                            />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" name={ selectedDataKey || "Value" } />
                        </BarChart>
                    ) : chartType === "line" ? (
                        <LineChart data={ chartData } margin={ { top: 20, right: 30, left: 20, bottom: 60 } }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={ -45 } textAnchor="end" height={ 60 } />
                            <YAxis />
                            <Tooltip
                                content={ <ChartTooltipContent /> }
                                formatter={ ( value, name, props ) => {
                                    return [ `${ value } (${ props.payload.itemCount } items)`, name ];
                                } }
                            />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" name={ selectedDataKey || "Value" } />
                        </LineChart>
                    ) : chartType === "area" ? (
                        <AreaChart data={ chartData } margin={ { top: 20, right: 30, left: 20, bottom: 60 } }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={ -45 } textAnchor="end" height={ 60 } />
                            <YAxis />
                            <Tooltip
                                content={ <ChartTooltipContent /> }
                                formatter={ ( value, name, props ) => {
                                    return [ `${ value } (${ props.payload.itemCount } items)`, name ];
                                } }
                            />
                            <Legend />
                            <Area type="monotone" dataKey="value" fill="#3b82f6" stroke="#3b82f6" name={ selectedDataKey || "Value" } />
                        </AreaChart>
                    ) : chartType === "pie" ? (
                        <PieChart>
                            <Tooltip
                                content={ <ChartTooltipContent /> }
                                formatter={ ( value, name, props ) => {
                                    return [ `${ value } (${ props.payload.itemCount } items)`, name ];
                                } }
                            />
                            <Legend />
                            <Pie
                                data={ chartData }
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={ 100 }
                                fill="#3b82f6"
                                label={ ( { name, value, percent } ) => `${ name }: ${ value.toFixed( 2 ) } (${ ( percent * 100 ).toFixed( 0 ) }%)` }
                            />
                        </PieChart>
                    ) : null }
                </ResponsiveContainer>
            </ChartContainer>
        );
    }, [ chartType, chartData, chartSeries, selectedDataKey ] );

    const chartTypeOptions = useMemo(
        () => [
            { value: "line", label: "Line Chart" },
            { value: "bar", label: "Bar Chart" },
            { value: "area", label: "Area Chart" },
            { value: "pie", label: "Pie Chart" },
        ],
        [],
    );

    const timeStepOptions = useMemo(
        () => [
            { value: "hour", label: "Hourly" },
            { value: "day", label: "Daily" },
            { value: "week", label: "Weekly" },
            { value: "month", label: "Monthly" },
            { value: "year", label: "Yearly" },
        ],
        [],
    );

    const aggregationOptions = useMemo(
        () => [
            { value: "show", label: "Show All Values" },
            { value: "mean", label: "Mean (Average)" },
            { value: "sum", label: "Sum" },
            { value: "min", label: "Minimum" },
            { value: "max", label: "Maximum" },
            { value: "count", label: "Count" },
        ],
        [],
    );

    return (
        <div className="h-full flex flex-col bg-sextary-900 text-white p-2">
            <Card className="bg-sextary-800 border-gray-700 text-white h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Data Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hiddewlex-col">
                    <div className="grid grid-cols-1 md:grid-wg:grid-cols-4 gap-4 mb-6">
                        {/* Data Key Selection */ }
                        { utils.val.isValidArray( dataKeys, true ) && (
                            <div>
                                <Label htmlFor="dataKey" className="text-sm font-medium text-neutral-400 mb-1 block">
                                    Data Key
                                </Label>
                                <Select value={ selectedDataKey } onValueChange={ setSelectedDataKey }>
                                    <SelectTrigger className="border-gray-600 text-white">
                                        <SelectValue placeholder="Select data key" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-600 text-white">
                                        { dataKeys.map( ( key ) => (
                                            <SelectItem key={ key } value={ key }>
                                                { key }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>
                        ) }

                        {/* Chart Type Selection */ }
                        <div>
                            <Label htmlFor="chartType" className="text-sm font-medium text-neutral-400 mb-1 block">
                                Chart Type
                            </Label>
                            <Select value={ chartType } onValueChange={ setChartType }>
                                <SelectTrigger className="border-gray-600 text-white">
                                    <SelectValue placeholder="Select chart type" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-600 text-white">
                                    { chartTypeOptions.map( ( option ) => (
                                        <SelectItem key={ option.value } value={ option.value }>
                                            { option.label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Step Selection */ }
                        <div>
                            <Label htmlFor="timeStep" className="text-sm font-medium text-neutral-400 mb-1 block">
                                Time Step
                            </Label>
                            <Select value={ timeStep } onValueChange={ setTimeStep }>
                                <SelectTrigger className="border-gray-600 text-white">
                                    <SelectValue placeholder="Select time step" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-600 text-white">
                                    { timeStepOptions.map( ( option ) => (
                                        <SelectItem key={ option.value } value={ option.value }>
                                            { option.label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Aggregation Method */ }
                        <div>
                            <Label htmlFor="aggregation" className="text-sm font-medium text-neutral-400 mb-1 block">
                                Aggregation Method
                            </Label>
                            <Select value={ aggregationMethod } onValueChange={ setAggregationMethod }>
                                <SelectTrigger className="border-gray-600 text-white">
                                    <SelectValue placeholder="Select aggregation" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-600 text-white">
                                    { aggregationOptions.map( ( option ) => (
                                        <SelectItem key={ option.value } value={ option.value }>
                                            { option.label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Time Range Selection */ }
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <Label htmlFor="startDate" className="text-sm font-medium text-neutral-400 mb-1 block">
                                Start Date
                            </Label>
                            <Input
                                type="date"
                                id="startDate"
                                className="border-gray-600 text-white"
                                // value={ timeRange?.start ? format( new Date( timeRange?.start ), "yyyy-MM-dd" ) : new Date( Date.now() ) }
                                value={ formatDate( new Date( timeRange?.start instanceof Date ? timeRange?.start : Date.now() ), "yyyy-MM-dd" ) }
                                onChange={ ( e ) => setTimeRange( ( prev ) => ( { ...prev, start: new Date( e.target.value ) } ) ) }
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="text-sm font-medium text-neutral-400 mb-1 block">
                                End Date
                            </Label>
                            <Input
                                type="date"
                                id="endDate"
                                className="border-gray-600 text-white"
                                // value={ timeRange?.end ? format( new Date( timeRange?.end ), "yyyy-MM-dd" ) : new Date( Date.now() ) }
                                value={ formatDate( new Date( timeRange?.end instanceof Date ? timeRange?.end : Date.now() ), "yyyy-MM-dd" ) }
                                onChange={ ( e ) => setTimeRange( ( prev ) => ( { ...prev, end: new Date( e.target.value ) } ) ) }
                            />
                        </div>
                    </div>

                    {/* Chart Display */ }
                    <ScrollArea className="flex-1">
                        <div className="mt-6">
                            { chartData.length > 0 ? (
                                renderChart()
                            ) : (
                                <div className="flex items-center justify-center h-96 text-neutral-400">
                                    No data available for the selected parameters
                                </div>
                            ) }
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default memo( DataAnalysis );
