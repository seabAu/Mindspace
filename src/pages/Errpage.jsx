import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiFillCaretLeft } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft } from 'lucide-react';

const Errpage = ( props ) => {
    const {
        enabled = true,
        errCode = 404,
        errMsg = `Nothing to see here!`,
        routeBack = `/`,
        url,
        errcode = 404,
        nav = [],
        layout = 'column',
    } = props;

    const navigate = useNavigate();

    return (
        <div className={ `px-10 flex flex-col justify-stretch items-center h-full w-full` }>
            <div className={ `page-content-section page-content-section-col items-center bg-gradient-to-r from-violet-800 from-10% via-sky-500 via-30% to-orange-500 to-90%` }>
                <div className={ `page-content-section-row h-[200px]` }>
                    <div className={ `flex flex-col md:flex-row w-3/12 page-content-section-col border-r border-highlightColor items-center justify-start flex-wrap` }>
                        <h1 className={ `text-5xl sm:text-3xl text-highlightColor font-semibold` }>
                            { errCode ? errCode : 404 }
                        </h1>
                    </div>
                    <div className={ `flex flex-col flex-wrap md:flex-row w-9/12 justify-around align-center items-center` }>
                        <div className={ `text-4xl text-gray text-med h-auto w-full sm:text-xl flex items-center justify-center ` }>
                            { errMsg ? errMsg : `Nothing to see here!` }
                        </div>
                        <div className={ `justify-end items-center` }>
                            <Button
                                id={ `landing-page-nav-button` }
                                icon={ <AiFillCaretLeft className={ `button-text button-icon` } /> }
                                label={ `Return to safety!` }
                                appearance={ `neumorphic` }
                                onClick={ ( e ) => {
                                    navigate( routeBack ? routeBack : '/dashboard' );
                                } }>
                                <ArrowBigLeft className={ `h-10 w-10 flex p-0 m-0` } />
                                { `BACK` }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Errpage;
