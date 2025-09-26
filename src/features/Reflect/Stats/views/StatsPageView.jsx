import { memo, useCallback, useEffect } from 'react';
import * as utils from 'akashatools';
import {
    StatsProvider,
    useStatsContext,
} from '@/features/Reflect/Stats/contexts/StatsContext';
import DynamicDataForm from './dataform/DynamicDataForm';
import DataAnalysis from './analysis/DataAnalysis';
import Calendar from './calendar/Calendar';
import ReflectStatsSidebar from './sidebar/ReflectStatsSidebar';
import Dashboard from './dashboard/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    SidebarProvider,
    Sidebar,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import useStatsStore from '@/store/stats.store';
import useReflect from '@/lib/hooks/useReflect';
import { useNavigate } from 'react-router-dom';
import { useReflectContext } from '@/features/Reflect/context/ReflectProvider';
import { CONTENT_HEADER_HEIGHT } from '../../../../lib/config/constants';

// Memoize the content components to prevent unnecessary re-renders
const MemoizedDashboard = memo( Dashboard );
const MemoizedReflectStatsSidebar = memo( ReflectStatsSidebar );
const MemoizedDynamicDataForm = memo( DynamicDataForm );
const MemoizedDataAnalysis = memo( DataAnalysis );
const MemoizedCalendar = memo( Calendar );

const StatsPageView = () => {
    const navigate = useNavigate();
    const {
        requestFetchStats,
        setRequestFetchStats,
        selectedDate,
        selectedEndDate,
        clearDateSelection,
        activePageTab,
        setActivePageTab,
    } = useReflectContext();
    const { handleFetchAllStats } = useReflect();

    // Memoize the clearDateSelection callback
    const handleClearDate = useCallback( () => {
        clearDateSelection();
    }, [ clearDateSelection ] );

    const isSameDay = ( date1, date2 ) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    useEffect( () => {
        if ( requestFetchStats === true ) {
            setRequestFetchStats( false );
            handleFetchAllStats();
        }
    }, [ requestFetchStats ] );

    return (
        <div
            className={ `w-full max-w-full min-w-full flex-1 flex flex-col rounded-xl space-y-2 !px-2 overflow-hidden min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))]` }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem` } }
        >
            <div className='w-full flex-1 flex overflow-hidden'>
                {/* Main Content */ }
                <div className='flex-1 overflow-hidden flex flex-col border-b border-sextary-800 shrink-0 bg-background'>
                    <Tabs
                        defaultValue={ activePageTab ?? 'dashboard' }
                        className='flex-1 flex flex-col overflow-hidden'>
                        <div className='flex items-center justify-between px-2 py-2 text-white'>
                            <div
                                className={ `flex flex-row w-full justify-between items-center gap-4` }>
                                <TabsList className='rounded-xl'>
                                    <TabsTrigger
                                        value='dashboard'
                                        className='rounded-lg text-white'
                                        onClick={ () => navigate( '../stats/dashboard' ) }>
                                        Dashboard
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='data'
                                        className='rounded-lg text-white'
                                        onClick={ () => navigate( '../stats/data' ) }>
                                        Data
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='analysis'
                                        className='rounded-lg text-white'
                                        onClick={ () => navigate( '../stats/analysis' ) }>
                                        Analysis
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='calendar'
                                        className='rounded-lg text-white'
                                        onClick={ () => navigate( '../stats/calendar' ) }>
                                        Calendar
                                    </TabsTrigger>
                                </TabsList>

                                <div className='gap-2 flex flex-col flex-wrap'>
                                    {/* Title stating what day is shown, if any. */ }
                                    <h1
                                        className={ `text-xl font-bold text-white` }>
                                        { selectedDate &&
                                            new Date( selectedDate ) instanceof
                                            Date &&
                                            selectedEndDate &&
                                            new Date( selectedEndDate ) instanceof
                                            Date &&
                                            selectedEndDate &&
                                            !isSameDay(
                                                new Date( selectedDate ),
                                                new Date( selectedEndDate ),
                                            )
                                            ? `Data for ${ new Date(
                                                selectedDate,
                                            ).toLocaleDateString() } - ${ new Date(
                                                selectedEndDate,
                                            ).toLocaleDateString() }`
                                            : selectedDate !== null &&
                                                selectedDate !== undefined &&
                                                new Date( selectedDate )
                                                ? `Data for ${ new Date(
                                                    selectedDate,
                                                ).toLocaleDateString() }`
                                                : `Data` }
                                    </h1>
                                    { selectedDate &&
                                        utils.val.isDefined( selectedDate ) &&
                                        new Date( selectedDate ) instanceof
                                        Date && (
                                            <div className='text-sm text-gray-400 flex items-center gap-4'>
                                                <button
                                                    className='text-xs text-washed-blue-400 hover:text-washed-blue-300'
                                                    onClick={ handleClearDate }>
                                                    Clear
                                                </button>
                                                <span>
                                                    Filtered by date:{ ' ' }
                                                    { new Date(
                                                        selectedDate,
                                                    ).toLocaleDateString() }
                                                </span>
                                            </div>
                                        ) }
                                </div>
                            </div>
                        </div>

                        <div className='flex-1 overflow-hidden'>
                            <TabsContent
                                value='dashboard'
                                className='h-full p-2 overflow-hidden'>
                                <Card className='h-full overflow-hidden'>
                                    <MemoizedDashboard />
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value='data'
                                className='h-full p-2 overflow-hidden'>
                                <Card className='h-full overflow-hidden'>
                                    <MemoizedDynamicDataForm />
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value='analysis'
                                className='h-full p-2 overflow-hidden'>
                                <Card className='h-full overflow-hidden'>
                                    <MemoizedDataAnalysis />
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value='calendar'
                                className='h-full p-2 overflow-hidden'>
                                <Card className='h-full overflow-hidden'>
                                    <MemoizedCalendar />
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default StatsPageView;
