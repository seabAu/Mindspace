'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    getFirstUnitOptions,
    getSecondUnitOptions,
    isValidCombination,
    findNearestValidCombination,
} from '../utilities/time-units';
import TimeGridDisplay from './TimeGridDisplay';

// Memoize description function to avoid recalculations
const descriptionCache = {};

/**
 * Get description for a time unit combination with caching
 * @param {string} firstUnit
 * @param {string} secondUnit
 * @returns {string}
 */
function getDescription ( firstUnit, secondUnit ) {
    const key = `${ firstUnit }-${ secondUnit }`;

    if ( descriptionCache[ key ] ) {
        return descriptionCache[ key ];
    }

    const descriptions = {
        'Hour-Minutes': 'The 60 minutes in an hour',
        'Hour-Seconds': 'The 3,600 seconds in an hour',
        'Day-Hours': 'The 24 hours in a day',
        'Day-Minutes': 'The 1,440 minutes in a day',
        'Week-Days': 'The 7 days in a week',
        'Week-Hours': 'The 168 hours in a week',
        'Month-Days': 'All days in the current month',
        'Month-Weeks': 'The weeks in the current month',
        'Year-Days': 'All 365 (or 366) days in the current year',
        'Year-Weeks': 'The 52 weeks in the current year',
        'Year-Months': 'The 12 months in the current year',
        'Decade-Years': 'The 10 years in the current decade',
        'Decade-Months': 'All months in the current decade',
        'Life-Years': 'An 80-year lifespan shown in years',
        'Life-Months': 'An 80-year lifespan shown in months',
        'Life-Weeks': 'An 80-year lifespan shown in weeks',
        'Life-Days': 'An 80-year lifespan shown in days',
    };

    const result =
        descriptions[ key ] ||
        `${ firstUnit } divided into ${ secondUnit.toLowerCase() }`;
    descriptionCache[ key ] = result;

    return result;
}

// Memoize options to avoid recalculations
const firstUnitOptions = getFirstUnitOptions();
const secondUnitOptions = getSecondUnitOptions();

function EnhancedTimeGrid () {
    const [ firstUnit, setFirstUnit ] = useState( 'Year' );
    const [ secondUnit, setSecondUnit ] = useState( 'Weeks' );
    const [ currentDate, setCurrentDate ] = useState( new Date() );
    const [ birthYear ] = useState( 1990 ); // Default birth year for Life calculations

    // Update the current date less frequently (every 10 seconds instead of every minute)
    useEffect( () => {
        const interval = setInterval( () => {
            setCurrentDate( new Date() );
        }, 10000 );
        return () => clearInterval( interval );
    }, [] );

    // Validate and correct the combination if needed - memoized
    const [ validFirstUnit, validSecondUnit ] = useMemo( () => {
        if ( !isValidCombination( firstUnit, secondUnit ) ) {
            return findNearestValidCombination( firstUnit, secondUnit );
        }
        return [ firstUnit, secondUnit ];
    }, [ firstUnit, secondUnit ] );

    // If the combination changed, update the state - optimized with useCallback
    useEffect( () => {
        if ( firstUnit !== validFirstUnit || secondUnit !== validSecondUnit ) {
            setFirstUnit( validFirstUnit );
            setSecondUnit( validSecondUnit );
        }
    }, [ validFirstUnit, validSecondUnit, firstUnit, secondUnit ] );

    // Calculate age for Life visualizations - memoized
    const age = useMemo( () => {
        const age = currentDate.getFullYear() - birthYear;
        return age > 0 ? age : 0;
    }, [ currentDate, birthYear ] );

    // Memoize handlers to prevent recreation on each render
    const handleFirstUnitChange = useCallback( ( value ) => {
        setFirstUnit( value );
    }, [] );

    const handleSecondUnitChange = useCallback( ( value ) => {
        setSecondUnit( value );
    }, [] );

    return (
        <div className='py-2 px-4'>
            <Tabs
                defaultValue='about'
                className='w-full'>
                <h1 className='text-3xl font-bold mb-2 text-center'>
                    Time Grid Visualization
                </h1>

                <TabsList className=''>
                    <TabsTrigger value='gridsettings'>Grid Settings</TabsTrigger>
                    <TabsTrigger value='about'>About This View</TabsTrigger>
                    <TabsTrigger value='legend'>Color Legend</TabsTrigger>
                </TabsList>
                <Card className={ `w-full h-full justify-center items-center` }>
                    <CardHeader className={ `!p-3 !m-0 !h-min` }>
                        <div className={ `w-full flex-row justify-between items-start flex-nowrap` }>
                            <div className={ `w-full flex-col justify-between items-start flex-nowrap` }>
                                <CardTitle>
                                    { firstUnit } in { secondUnit }
                                </CardTitle>
                                <CardDescription>
                                    { getDescription( firstUnit, secondUnit ) }
                                </CardDescription>
                            </div>
                            <TabsContent
                                value='gridsettings'
                                className='p-2 w-auto max-w-auto'>
                                <div className='flex flex-col md:flex-row gap-4 mb-4 justify-center'>
                                    <div className='w-full md:w-64'>
                                        <label className='block text-sm font-medium mb-2'>
                                            Time Period
                                        </label>
                                        <Select
                                            value={ firstUnit }
                                            onValueChange={ handleFirstUnitChange }>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select time period' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                { firstUnitOptions.map( ( option ) => (
                                                    <SelectItem
                                                        key={ option }
                                                        value={ option }>
                                                        { option }
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='w-full md:w-64'>
                                        <label className='block text-sm font-medium mb-2'>
                                            Displayed As
                                        </label>
                                        <Select
                                            value={ secondUnit }
                                            onValueChange={ handleSecondUnitChange }>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select display unit' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                { secondUnitOptions.map( ( option ) => (
                                                    <SelectItem
                                                        key={ option }
                                                        value={ option }>
                                                        { option }
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                            </TabsContent>
                            <TabsContent
                                value='about'
                                className='p-2 w-auto max-w-auto'>
                                <p>
                                    This visualization shows how many{ ' ' }
                                    { secondUnit.toLowerCase() } fit into a{ ' ' }
                                    { firstUnit.toLowerCase() }. Each cell represents one{ ' ' }
                                    { secondUnit.slice( 0, -1 ).toLowerCase() }.
                                </p>
                                <p className='mt-2'>
                                    The current { secondUnit.slice( 0, -1 ).toLowerCase() } is
                                    highlighted in blue, past { secondUnit.toLowerCase() } are
                                    in gray, and future { secondUnit.toLowerCase() } are in
                                    light blue.
                                </p>
                                { firstUnit === 'Life' && (
                                    <p className='mt-2'>
                                        For the Life view, we're using a standard life
                                        expectancy of 80 years.
                                    </p>
                                ) }
                            </TabsContent>
                            <TabsContent
                                value='legend'
                                className='p-2 w-auto max-w-auto'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-4 h-4 bg-gray-300 rounded'></div>
                                    <span>Past { secondUnit }</span>
                                </div>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-4 h-4 bg-blue-500 rounded'></div>
                                    <span>Current { secondUnit.slice( 0, -1 ) }</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='w-4 h-4 bg-blue-100 rounded'></div>
                                    <span>Future { secondUnit }</span>
                                </div>
                            </TabsContent>
                        </div>
                    </CardHeader>
                    <CardContent className={ `w-full h-full justify-center items-center` }>
                        <TimeGridDisplay
                            firstUnit={ firstUnit }
                            secondUnit={ secondUnit }
                            currentDate={ currentDate }
                            age={ age }
                        />
                    </CardContent>
                </Card>
            </Tabs>

        </div>
    );
}

export default React.memo( EnhancedTimeGrid );

// "use client";

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { TimeGridDisplay } from "./TimeGridDisplay";
// import {
//     getFirstUnitOptions,
//     getSecondUnitOptions,
//     isValidCombination,
//     findNearestValidCombination,
// } from "../utilities/time-units";

// // Memoize description function to avoid recalculations
// const descriptionCache = {};

// /**
//  * Get description for a time unit combination with caching
//  * @param {string} firstUnit
//  * @param {string} secondUnit
//  * @returns {string}
//  */
// function getDescription ( firstUnit, secondUnit ) {
//     const key = `${ firstUnit }-${ secondUnit }`;

//     if ( descriptionCache[ key ] ) {
//         return descriptionCache[ key ];
//     }

//     const descriptions = {
//         "Hour-Minutes": "The 60 minutes in an hour",
//         "Hour-Seconds": "The 3,600 seconds in an hour",
//         "Day-Hours": "The 24 hours in a day",
//         "Day-Minutes": "The 1,440 minutes in a day",
//         "Week-Days": "The 7 days in a week",
//         "Week-Hours": "The 168 hours in a week",
//         "Month-Days": "All days in the current month",
//         "Month-Weeks": "The weeks in the current month",
//         "Year-Days": "All 365 (or 366) days in the current year",
//         "Year-Weeks": "The 52 weeks in the current year",
//         "Year-Months": "The 12 months in the current year",
//         "Decade-Years": "The 10 years in the current decade",
//         "Decade-Months": "All months in the current decade",
//         "Life-Years": "An 80-year lifespan shown in years",
//         "Life-Months": "An 80-year lifespan shown in months",
//         "Life-Weeks": "An 80-year lifespan shown in weeks",
//         "Life-Days": "An 80-year lifespan shown in days",
//     };

//     const result = descriptions[ key ] || `${ firstUnit } divided into ${ secondUnit.toLowerCase() }`;
//     descriptionCache[ key ] = result;

//     return result;
// }

// // Memoize options to avoid recalculations
// const firstUnitOptions = getFirstUnitOptions();
// const secondUnitOptions = getSecondUnitOptions();

// function EnhancedTimeGrid ( { date }, ...props ) {
//     const [ firstUnit, setFirstUnit ] = useState( "Year" );
//     const [ secondUnit, setSecondUnit ] = useState( "Weeks" );
//     const [ currentDate, setCurrentDate ] = useState( new Date() );
//     const [ birthYear ] = useState( 1990 ); // Default birth year for Life calculations

//     // Update the current date less frequently (every 10 seconds instead of every minute)
//     useEffect( () => {
//         const interval = setInterval( () => {
//             setCurrentDate( new Date() );
//         }, 10000 );
//         return () => clearInterval( interval );
//     }, [] );

//     // Validate and correct the combination if needed - memoized
//     const [ validFirstUnit, validSecondUnit ] = useMemo( () => {
//         if ( !isValidCombination( firstUnit, secondUnit ) ) {
//             return findNearestValidCombination( firstUnit, secondUnit );
//         }
//         return [ firstUnit, secondUnit ];
//     }, [ firstUnit, secondUnit ] );

//     // If the combination changed, update the state - optimized with useCallback
//     useEffect( () => {
//         if ( firstUnit !== validFirstUnit || secondUnit !== validSecondUnit ) {
//             setFirstUnit( validFirstUnit );
//             setSecondUnit( validSecondUnit );
//         }
//     }, [ validFirstUnit, validSecondUnit, firstUnit, secondUnit ] );

//     // Calculate age for Life visualizations - memoized
//     const age = useMemo( () => {
//         const age = currentDate.getFullYear() - birthYear;
//         return age > 0 ? age : 0;
//     }, [ currentDate, birthYear ] );

//     // Memoize handlers to prevent recreation on each render
//     const handleFirstUnitChange = useCallback( ( value ) => {
//         setFirstUnit( value );
//     }, [] );

//     const handleSecondUnitChange = useCallback( ( value ) => {
//         setSecondUnit( value );
//     }, [] );

//     return (
//         <div className="container mx-auto py-8 px-4">
//             <h1 className="text-3xl font-bold mb-8 text-center">Time Grid Visualization</h1>

//             <Tabs defaultValue="about" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="about">About This View</TabsTrigger>
//                     <TabsTrigger value="legend">Color Legend</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="about" className="p-4">
//                     <p>
//                         This visualization shows how many { secondUnit.toLowerCase() } fit into a { firstUnit.toLowerCase() }. Each cell
//                         represents one { secondUnit.slice( 0, -1 ).toLowerCase() }.
//                     </p>
//                     <p className="mt-2">
//                         The current { secondUnit.slice( 0, -1 ).toLowerCase() } is highlighted in blue, past { secondUnit.toLowerCase() }{ " " }
//                         are in gray, and future { secondUnit.toLowerCase() } are in light blue.
//                     </p>
//                     { firstUnit === "Life" && (
//                         <p className="mt-2">For the Life view, we're using a standard life expectancy of 80 years.</p>
//                     ) }
//                 </TabsContent>
//                 <TabsContent value="legend" className="p-4">
//                     <div className="flex items-center gap-2 mb-2">
//                         <div className="w-4 h-4 bg-gray-300 rounded"></div>
//                         <span>Past { secondUnit }</span>
//                     </div>
//                     <div className="flex items-center gap-2 mb-2">
//                         <div className="w-4 h-4 bg-blue-500 rounded"></div>
//                         <span>Current { secondUnit.slice( 0, -1 ) }</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <div className="w-4 h-4 bg-blue-100 rounded"></div>
//                         <span>Future { secondUnit }</span>
//                     </div>
//                 </TabsContent>
//             </Tabs>
//             <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
//                 <div className="w-full md:w-64">
//                     <label className="block text-sm font-medium mb-2">Time Period</label>
//                     <Select value={ firstUnit } onValueChange={ handleFirstUnitChange }>
//                         <SelectTrigger>
//                             <SelectValue placeholder="Select time period" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             { firstUnitOptions.map( ( option ) => (
//                                 <SelectItem key={ option } value={ option }>
//                                     { option }
//                                 </SelectItem>
//                             ) ) }
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 <div className="w-full md:w-64">
//                     <label className="block text-sm font-medium mb-2">Displayed As</label>
//                     <Select value={ secondUnit } onValueChange={ handleSecondUnitChange }>
//                         <SelectTrigger>
//                             <SelectValue placeholder="Select display unit" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             { secondUnitOptions.map( ( option ) => (
//                                 <SelectItem key={ option } value={ option }>
//                                     { option }
//                                 </SelectItem>
//                             ) ) }
//                         </SelectContent>
//                     </Select>
//                 </div>
//             </div>

//             <Card className="mb-8">
//                 <CardHeader>
//                     <CardTitle>
//                         { firstUnit } in { secondUnit }
//                     </CardTitle>
//                     <CardDescription>{ getDescription( firstUnit, secondUnit ) }</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <TimeGridDisplay firstUnit={ firstUnit } secondUnit={ secondUnit } currentDate={ currentDate } age={ age } />
//                 </CardContent>
//             </Card>

//         </div>
//     );
// }

// export default React.memo( EnhancedTimeGrid )
