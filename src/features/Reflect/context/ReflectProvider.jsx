import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import * as utils from 'akashatools';
import useStatsStore from "@/store/stats.store";
import useReflectStore from "@/store/reflect.store";

const ReflectContext = createContext( null );

export function ReflectProvider ( { children } ) {
    const store = useReflectStore();

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ( {
            ...store,
        } ),
        [
            store,
        ],
    );

    return <ReflectContext.Provider value={ contextValue }>
        { children }
    </ReflectContext.Provider>;
}

export function useReflectContext () {
    const context = useContext( ReflectContext );
    if ( !context ) {
        throw new Error( "useReflectContext must be used within a ReflectProvider" );
    }
    return context;
}
