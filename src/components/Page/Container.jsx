import React from 'react';

import useGlobalStore from '@/store/global.store';
import { twMerge } from 'tailwind-merge';

const Container = ( props ) => {
    const {
        children,
        classNames,
    } = props;

    const {
        // Debug state
        debug,
        setDebug,

        // UI state
        theme,
        setTheme,
    } = useGlobalStore();

    return (
        <div
            className={ twMerge(
                `flex h-screen max-h-screen min-w-screen w-screen items-center justify-center overflow-hidden ${ theme ? ` theme-${ theme }` : '' }`,
                classNames,
            ) }
            { ...props }
        >
            { children }
        </div>
    );
};

export default Container;
