import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsProvider } from '@/features/stats/contexts/StatsContext';
import StatsPageView from '@/features/Reflect/Stats/views/StatsPageView';
import useReflect from '@/lib/hooks/useReflect';
import * as utils from 'akashatools';
import { useStatsContext } from '../../../features/Stats/contexts/StatsContext';

const StatsPage = ( props ) => {
    const {
        entries, setEntries,
        date, setData,
        logData, setLogData,
        timeInterval,
        columnNames = [],
        columnRelations = [], // Key-name pairs to match columns to database field names. 
    } = props;

    const {
        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
    } = useReflect();

    useEffect( () => {
        // Stats Data for Reflections
        handleFetchAllStats();
    }, [] );

    const buildPage = () => {
        // Build a key-value list-sheet style UI. each line have editable
        // key and value fields.
    };

    return (
        <StatsProvider>
            <div className={ `flex flex-col` }>
                {/* <div className={ `stats-page-container w-full max-w-full min-w-full flex-1 flex flex-col h-full` }> */ }
                <StatsPageView />
                {/* </div> */ }
            </div>
        </StatsProvider>
    );
};

export default StatsPage

