import React, { useEffect, useState } from 'react';

const TimeHeatmap = ( props ) => {
    const {
        title,
        selectedDate,
        setSelectedDate,
        classNames = '',
        mode = 'single',
        selected,
        onSelect,
        isLoading = false,
        children,
    } = props;

    return (
        <div className={ `w-full h-full flex flex-col p-0 m-0 justify-center items-center` }>
            { `Time Heatmap` }
        </div>
    );
};

export default TimeHeatmap;
