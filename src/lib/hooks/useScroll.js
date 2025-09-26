import { useEffect, useState } from 'react';

export const useHandleScroll = ( start, count ) => {
    const [ numberVisiblePosts, setNumberVisiblePosts ] = useState( start );

    useEffect( () => {
        document.addEventListener( 'scroll', handleScroll );

        return () => {
            document.removeEventListener( 'scroll', handleScroll );
        };
        // eslint-disable-next-line
    }, [] );

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const innerHeight = window.innerHeight;

        if ( scrollHeight - ( scrollTop + innerHeight ) < 100 ) {
            setNumberVisiblePosts( ( prev ) => prev + count );
        }
    };

    return { numberVisiblePosts, setNumberVisiblePosts };
};