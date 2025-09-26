import React from 'react';
import './Popover.css';

const Popover = ( props ) => {
    const {
        popoverTrigger,
        popoverContent,
    } = props;

    return (
        <div className={ `popover-container` }>
            <div className={ `center` }>
                <span className={ `qs` }>
                    <div className={ `popover-trigger` }>
                        { popoverTrigger }
                    </div>
                    <span className={ `popover popover-content` }>
                        { popoverContent }
                    </span>
                </span>
            </div>
        </div>
    );
};

export default Popover;
