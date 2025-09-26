import React from 'react';
import './Progress.css';
import { Progress } from '../ui/progress';

const ProgressBar = ( props ) => {
    const { items, display, animTime } = props;

    const examples = [
        {
            title: 'HTML5',
            progress: 0.85,
        },
        {
            title: 'CSS3',
            progress: 0.85,
        },
        {
            title: 'Javascript',
            progress: 0.85,
        },
    ];

    return (
        <section className={ `progress-section` }>
            <div className='container'>
                <div className='row'>
                    <div className='col-md-2 col-lg-2'></div>
                    <div className='col-md-8 col-lg-8'>
                        { examples &&
                            examples.map( ( element, index ) => {
                                return (
                                    <ProgressBar.Value
                                        title={ element?.title }
                                        value={ element?.progress }
                                        data={ element }
                                    />
                                );
                            } ) }
                        <div className='barWrapper'>
                            <span className='progressText'>
                                <B>CSS3</B>
                            </span>
                            <div className='progress '>
                                <div
                                    className='progress-bar'
                                    role='progressbar'
                                    aria-valuenow='75'
                                    aria-valuemin='10'
                                    aria-valuemax='100'
                                    style=''>
                                    <span
                                        className='popOver'
                                        data-toggle='tooltip'
                                        data-placement='top'
                                        title='75%'>
                                        { ' ' }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-2 col-lg-2'></div>
                </div>
            </div>
        </section>
    );
};

const Value = ( props ) => {
    const {
        title = '',
        value = 0,
        data
    } = props;

    return (
        <>
            { value && title && (
                <div className='barWrapper'>
                    <span className='progressText'>
                        <B>{ `${ title }` }</B>
                    </span>
                    <Progress
                        value={ progress }
                        className="w-[60%]"
                    >
                        <div
                            className='progress-bar'
                            role='progressbar'
                            aria-valuenow={ `${ Number( value * 100 ) }` }
                            aria-valuemin='0'
                            aria-valuemax='100'>
                            <span
                                className='popOver'
                                data-toggle='tooltip'
                                data-placement='top'
                                title={ `${ value }%` }>
                                { ' ' }
                            </span>
                        </div>
                    </Progress>
                </div>
            ) }
        </>
    );
};

ProgressBar.Value = Value;

export default Progress;
