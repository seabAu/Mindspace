import React, { Suspense } from 'react';
import Spinner from '../Loader/Spinner';


export const LazySuspenseComponent = ( {
    lazyComponent,
    lazyImportPath,
    suspenseFallback = <div> { `Loading...` }</div>,
    suspenseSpinner = (
        <Spinner
            variant={ 'circles' }
            size={ 'md' }
            color={ 'currentColor' }
            overlay={ false }
            className={ `` }
        />
    ),
} ) => {
    const LazyComponent = lazyComponent
        ? lazyComponent
        : ( React.lazy( () => import( lazyImportPath ) ) );

    return (
        <div className={ `` }>
            <Suspense fallback={ suspenseSpinner || suspenseFallback }>
                { LazyComponent }
            </Suspense>
        </div>
    );
};


export const asyncImportComponent = ( { importPath = { ''} } ) => {
    const [ importedComponent, setImportedComponent ] = useState( null );

    useEffect( () => {
        const importComponent = async () => {
            const module = await import( './AnotherComponent' );
            const AnotherComponent = module.default;
            setImportedComponent( <AnotherComponent /> );

            ///Another Way is ...///
            // const module = import( './AnotherComponent' );
            // const { AnotherComponent } = await module;
            // return <AnotherComponent />;
        };

        importComponent();
    }, [] );

    return (
        <>
            { importedComponent }
        </>
    );
};
