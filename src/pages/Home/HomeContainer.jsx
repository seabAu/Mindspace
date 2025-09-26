import React from 'react';
import { Spinner } from '@/components/Loader/Spinner';
import Content from '@/components/Page/Content';
import Header from '@/components/Page/Header';
import Sidebar from '@/components/Page/Sidebar';
import Footer from '@/components/Page/Footer';
import Container from '@/components/Page/Container';
import useGlobalStore from '@/store/global.store';
import ParticleText from '@/components/Effects/ParticleText';
import {
    FlickeringGridBackground,
    ParticlesBackground,
    BeamsBackground,
} from '@/components/Effects/BackgroundEffects';
import Effects from '@/components/Effects/Effects';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import HomeHeader from '../HomeHeader';
import { CONTENT_HEADER_HEIGHT } from '../../lib/config/constants';

const HomeContainer = ( {
    title = 'Mindspace Compass',
    subtitle = `For the moonlighting daydreamers`,
    useEffectBackground = true,
    effectType = 'bggrid',
    classNames = '',
    children,
},
    ...props
) => {
    return (
        <Container
            classNames={ `!border-none !border-transparent absolute inset-0 !h-screen !max-h-screen !min-h-screen !w-screen !max-w-screen !min-w-screen !justify-stretch !items-stretch flex flex-col overflow-hidden !bg-transparent !m-0 !p-0 !z-2 ${ classNames }` }
        >
            {/* <div className={ `w-full h-full !z-20 justify-center items-center ` }> */ }
            <div className={ `w-full rounded-xl relative flex flex-col !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] !z-20 mb-4` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT - 4 ) }rem`,
                } }>

                <HomeHeader />
                <div className={ `!min-w-full !w-full !max-w-full !z-20 justify-center overflow-auto h-full` }>
                    { children && children }
                </div>
            </div>
            <div className={ `z-0 absolute inset-0` }>
                { useEffectBackground &&
                    ( effectType === 'particletext' ? (
                        <ParticleText
                            text={ title || 'Mindspace Compass' }
                            tagline={ subtitle || `For the moonlighting daydreamers` }
                            useBackground={ true }
                        />
                    ) : effectType === 'bgpaths' ? (
                        <Effects.BackgroundPaths
                            title={ title || 'Mindspace Compass' }
                            tagline={ subtitle || `For the moonlighting daydreamers` }
                            // content={ `Enter your space` }
                            icon={ <ArrowRight /> }
                            useBackground={ true }
                            link={ `/dash` }
                        />
                    ) : effectType === 'bgbeams' ? (
                        <BeamsBackground
                            text={ title || 'Mindspace Compass' }
                            tagline={ subtitle || `For the moonlighting daydreamers` }
                            useBackground={ true }
                        />
                    ) : (
                        effectType === 'bggrid' ? (
                            <FlickeringGridBackground
                                text={ title || 'Mindspace Compass' }
                                tagline={ subtitle || `For the moonlighting daydreamers` }
                                useBackground={ true }
                                squareSize={ 4 }
                                gridGap={ 6 }
                                flickerChance={ 0.3 }
                                color={ "#FF17bb" }
                                width={ 0 }
                                height={ 0 }
                                className={ 100 }
                                maxOpacity={ 0.3 }
                            />
                        ) : (
                            <></>
                        )
                    ) ) }
            </div>
            <Footer></Footer>
        </Container>
    );
};

export default HomeContainer;
