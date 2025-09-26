import React, { lazy, Suspense } from 'react';
// import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
// import * as LucideIcons from 'lucide-react';

const fallback = <div style={ { background: '#ddd', width: 24, height: 24 } } />;

const Icon = ( { name, ...props } ) => {
    // const LucideIcon = lazy( dynamicIconImports[ name ] );
    // const LucideIcon = LucideIcons[ name ];
    return (
        <Suspense fallback={ fallback }>
            <LucideIcon { ...props } />
        </Suspense>
    );
};

export default Icon;