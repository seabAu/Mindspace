import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';

const name = ( {
    title = '',
    subtitle = '',
    className,
    children,
}, ...props ) => {
    return (

        <div className={ `flex flex-row bg-sidebar-background w-full h-full items-center p-0 h-${ CONTENT_HEADER_HEIGHT }` }>
            <Button
                title={ `Refetch Schemas (for input forms)` }
                variant={ 'ghost' }
                size={ `icon` }
                className={ `h-full aspect-square` }
                onClick={ () => { fetchSchemas(); } }
            >
                <DatabaseBackupIcon />
            </Button>

            <Button
                title={ `Refetch All Data` }
                variant={ 'ghost' }
                size={ `icon` }
                className={ `h-full aspect-square` }
                onClick={ () => { wipeData(); } }
            >
                <XOctagonIcon className={ `size-6 aspect-square !p-0` } />
            </Button>

            <DashboardSync />

            { children }
        </div>
    );
};

export default name;