
const Timeblocks = ( props ) => {
    const {
        title,
        eventsData,
        setEventsData,
        classNames = '',
        mode = 'single',
        selected,
        onSelect,
        isLoading = false,
        children,
    } = props;

    return (
        <div>
            <h2 className={ `text-3xl` }>
                { `Timeblocks visualizer` }
            </h2>
            { children && children }
        </div>
    );
};

export default Timeblocks;