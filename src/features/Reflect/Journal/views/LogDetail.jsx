import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import { ArrowBigLeft, ArrowBigRight, DockIcon, PenIcon, Save, TrashIcon } from 'lucide-react';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { formatDate, formatDateTime, isValidDate } from '@/lib/utilities/time';
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';
import Droplist from '@/components/Droplist';
import { caseCamelToSentence } from '@/lib/utilities/string';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScrollAreaScrollbar, ScrollAreaViewport } from '@radix-ui/react-scroll-area';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext';
import { DailyLogForm } from '../blocks/DailyLogForm/DailyLogForm';
import useReflectStore from '@/store/reflect.store';
import useReflect from '@/lib/hooks/useReflect';

const LogDetail = ( props ) => {
    const {
        parentPath = '/dash/planner/logs',
        logOverride = null,
        editingMode = false,
        onSave,
        onBack,
        // logsData, setLogsData,
    } = props;

    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas,
        getSchema,
        data,
        getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const {
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        handleInputChange,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCancel,
        handleGetEventsData,
        handleChangeEventsRangeSelect,
        handleChangeEventsRangeDates,

        // DIALOG MENUS
    } = useReflect();

    const {
        logsData, setLogsData,
    } = useReflectStore();

    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const path = useMemo( () => location.pathname?.split( '/' ).filter( x => x ), [ location.pathname ] );
    const pathnames = useMemo( () => location.pathname.split( "/" ).filter( ( x ) => x ), [ location.pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );
    // const path = pathname?.split( '/' );
    // const endpoint = path?.[ path.indexOf( parentPath ) + 1 ];
    // const pathnames = path?.filter( ( x ) => x );
    // const log = useMemo( () => ( logsData.find( ( e ) => e?._id === id ) ), [ endpoint ] );
    const isEditingMode = pathnames?.[ pathnames?.length - 1 ] === 'edit';


    // const { logs, removeLog } = useLogs();
    const log = (
        ( utils.val.isDefined( logOverride ) )
            ? logOverride
            : ( utils.val.isValidArray( logsData, true )
                ? logsData?.find( ( e ) => e?._id === id )
                : null )
    );
    const [ logFormData, setLogFormData ] = useState( log );

    useEffect( () => {
        setLogFormData( log );
    }, [ log ] );

    const schema = getSchema( 'log' );
    let allData = getData();
    console.log( 'LogDetail :: props: ', props, ' :: ', 'id = ', id, ' :: ', 'log = ', log );

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
            else { acc[ key ] = value; }
            return acc;
        }, {} );

        console.log( 'Form submitted with data:', processedData );
        // Here you would typically send the processedData to your backend
        handleEditSubmit( formData, 'log' );
    };

    const gridItemStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        // gridAutoRows: `1.00rem`,
        gridTemplateColumns: `span 1 / span 1`,
    };

    const renderLogDetails = () => {
        return (
            <>
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p>{ log?.summary }</p>

                <h2 className="text-xl font-semibold">Morning Goals</h2>
                <ul>
                    { log?.morningGoals?.map( ( goal, index ) => (
                        <li key={ index }>{ goal }</li>
                    ) ) }
                </ul>

                <h2 className="text-xl font-semibold">Time Blocks</h2>
                { log?.timeBlocks?.map( ( block, index ) => (
                    <div key={ index } className="mb-2">
                        <p>{ new Date( block.startTime ).toLocaleTimeString() } - { new Date( block.endTime ).toLocaleTimeString() }</p>
                        <p>{ block.activity } (Focus: { block.focusRating }/10)</p>
                    </div>
                ) ) }

                <h2 className="text-xl font-semibold">Evening Reflection</h2>
                <p>{ log?.eveningReflection }</p>

                <h2 className="text-xl font-semibold">Gratitude</h2>
                <ul>
                    { log?.gratitude.map( ( item, index ) => (
                        <li key={ index }>{ item }</li>
                    ) ) }
                </ul>

                <h2 className="text-xl font-semibold">Challenges</h2>
                <ul>
                    { log?.challenges.map( ( challenge, index ) => (
                        <li key={ index }>{ challenge }</li>
                    ) ) }
                </ul>

                <h2 className="text-xl font-semibold">Achievements</h2>
                <ul>
                    { log?.achievements.map( ( achievement, index ) => (
                        <li key={ index }>
                            { achievement.description } - { achievement.completed ? 'Completed' : 'Not Completed' }
                        </li>
                    ) ) }
                </ul>

                <h2 className="text-xl font-semibold">Plans for Tomorrow</h2>
                <p>{ log?.plansForTomorrow }</p>

                <h2 className="text-xl font-semibold">Wellness</h2>
                <p>Steps: { log?.wellness.stepsTaken }</p>
                <p>Sleep: { log?.wellness.hoursSlept } hours</p>
                <p>Water: { log?.wellness.waterIntake } liters</p>

                <h2 className="text-xl font-semibold">Weather</h2>
                <p>{ log?.weather.temperature }°C, { log?.weather.condition }</p>

                <h2 className="text-xl font-semibold">Attachments</h2>
                { log?.attachments.map( ( attachment, index ) => (
                    <div key={ index }>
                        <a href={ attachment?.fileUrl } target="_blank"></a>
                        <cut_off_point>
                            <div key={ index }>
                                <a href={ attachment?.fileUrl } target="_blank"></a>
                            </div>
                        </cut_off_point>

                        <a href="#" rel="noopener noreferrer">
                            { attachment?.description || `Attachment ${ index + 1 }` }
                        </a>
                    </div>
                ) ) }
            </>
        );
    };

    const renderLogField = ( fieldKey, fieldValue, fieldType, index ) => {
        let fieldKeyLabel = ( <h2 className="text-xl font-semibold">{ `${ caseCamelToSentence( fieldKey ) }` }</h2> );

        // console.log( "LogDetail.jsx :: renderLogField :: fieldKey = ", fieldKey, " :: ", "fieldValue = ", fieldValue, " :: ", "fieldType = ", fieldType, " :: ", "index = ", index );
        switch ( fieldType ) {
            case '[object]':
            case '[string]':
            case '[date]':
            case '[datetime]':
            case '[datetimelocal]':
            case '[number]':
            case '[decimal]':
            case '[objectId]':
            case '[array]':
            case "array":
                // Check if elements inside are objects or basic data types.
                if ( utils.val.isValidArray( fieldValue, true ) ) {
                    return ( <ul className={ `w-full h-auto justify-start items-center flex ` }>
                        <li key={ index } className={ `grid grid-cols-12 border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-2 w-full flex flex-row` } style={ gridItemStyles }>
                            <div className={ `col-span-3 obj-list-key text-nowrap` }>{ fieldKeyLabel }</div>
                            <div className={ `col-span-9 obj-list-value text-wrap flex-wrap flex-row hover:bg-sextary-100/20 ` }>
                                { fieldValue?.map( ( subFieldValue, subFieldIndex ) => {
                                    // let subFieldValue = fieldValue?.[ subFieldKey ];
                                    let subfieldType = utils.val.getType( subFieldValue );
                                    // console.log( "LogDetail.jsx :: renderLogField :: ARRAY FIELD :: subFieldIndex = ", subFieldIndex, " :: ", "subFieldValue = ", subFieldValue, " :: ", "subfieldType = ", subfieldType );
                                    if ( utils.val.isObject( subFieldValue ) ) {
                                        return ( <ul className={ `border border-sextary-200/20 rounded-lg p-1 h-auto justify-start items-center flex flex-col flex-grow min-w-1/4` }>
                                            { Object.keys( subFieldValue )?.map( ( subSubFieldKey, subSubFieldIndex ) => (
                                                <div className={ `flex flex-row flex-grow w-full` } key={ subFieldIndex }>
                                                    { renderLogField( subSubFieldKey, subFieldValue?.[ subSubFieldKey ], utils.val.getType( subFieldValue?.[ subSubFieldKey ] ) ) }
                                                </div> ) )
                                            }
                                        </ul> );
                                    }
                                    else if ( utils.val.isValidArray( subFieldValue, true ) ) {
                                        return ( <ul className={ `border border-sextary-200/20 rounded-lg p-1 h-auto justify-start items-center flex flex-col flex-grow min-w-1/4` }>
                                            { subFieldValue?.map( ( subSubFieldValue, subSubFieldIndex ) => (
                                                <div className={ `flex flex-row flex-grow w-full` } key={ subFieldIndex }>
                                                    { renderLogField( subSubFieldIndex, subSubFieldValue, utils.val.getType( subSubFieldValue ), subSubFieldIndex ) }
                                                </div> ) ) }
                                        </ul> );
                                    }
                                    else {
                                        // Basic data type. 
                                        return ( <li className={ `` } key={ subFieldIndex }>{ `${ caseCamelToSentence( subFieldValue ) }` }</li> );
                                    }
                                } ) }
                            </div>
                        </li>
                    </ul> );
                }
                break;
            case "object":
                if ( utils.val.isObject( fieldValue, true ) ) {
                    // TODO :: Make a complimentary "isValidObject" function that checks for the existence of at least 1 key value pair.
                    return ( <ul className={ `w-full h-auto justify-start items-start flex flex-col border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-1 flex-grow` }>
                        { fieldKeyLabel }
                        { Object.keys( fieldValue )?.filter( ( v, i ) => ( v !== "_id" ) )?.map( ( fieldValueKey, fieldValueIndex ) => (
                            <li key={ fieldValueIndex } className={ `grid grid-cols-12 border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-2 w-full flex flex-row` } style={ gridItemStyles }>
                                <div className={ `col-span-3 obj-list-key text-nowrap` }>{ `${ caseCamelToSentence( fieldValueKey ) }` }</div>
                                <div className={ `col-span-9 obj-list-value text-nowrap` }>{ `${ fieldValue?.[ fieldValueKey ] }` }</div>
                            </li>
                        ) ) }
                    </ul> );
                }
                break;
            case "string":
                return (
                    <li key={ index } className={ `grid grid-cols-12 border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-2 w-full flex flex-row` }
                        style={ gridItemStyles }>
                        <div className={ `col-span-3 obj-list-key text-nowrap` }>
                            { `${ caseCamelToSentence( fieldKey ) }` }
                        </div>
                        <div className={ `col-span-9 obj-list-value text-wrap` }>
                            { `${ fieldValue }` }
                        </div>
                    </li>
                );
                break;
            case "number":
                return (
                    <li key={ index } className={ `grid grid-cols-12 border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-2 w-full flex flex-row` }
                        style={ gridItemStyles }>
                        <div className={ `col-span-3 obj-list-key text-nowrap` }>
                            { `${ caseCamelToSentence( fieldKey ) }` }
                        </div>
                        <div className={ `col-span-9 obj-list-value text-nowrap` }>
                            { `${ fieldValue }` }
                        </div>
                    </li>
                );
                break;
            default:
                // return ( <li className={ `` } key={ subFieldIndex }>{ `${ caseCamelToSentence( fieldKey ) }` }{ JSON.stringify( fieldValue ) }</li> );
                return ( <li key={ index } className={ `grid grid-cols-12 border border-sextary-200/20 hover:bg-sextary-100/20 rounded-lg p-2 w-full flex flex-row` } style={ gridItemStyles }>
                    <div className={ `col-span-3 obj-list-key text-nowrap` }>{ `${ caseCamelToSentence( fieldKey ) }` }</div>
                    <div className={ `col-span-9 obj-list-value text-nowrap` }>{ `${ fieldValue }` }</div>
                </li> );
        };
    };

    return (
        <Card className={ `log-detail !h-full !max-h-full !min-h-full !overflow-hidden !relative` }>
            <CardHeader className={ `w-full gap-2 whitespace-nowrap flex flex-row items-start justify-stretch p-4 h-16` }>
                { log?.title && (
                    <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                        { log?.title }
                    </CardTitle>
                ) }
                <div className={ `flex flex-row w-full justify-start items-center` }>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `${ log?.mood }` }</Badge>
                    <div
                        className={ `flex flex-row w-6 border-b border-2 border-opacity-60 border-primary-purple-800 h-0 justify-center items-center` }></div>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `${ log?.weather?.temperature }°C, ${ log?.weather?.condition }` }</Badge>
                </div>
                <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                    <div className={ `flex flex-row justify-center items-center gap-2` }>
                        {/* <Link to={ `${ parentPath }/list` }> */ }
                        <Button
                            size={ 'sm' }
                            variant={ `outline` }
                            className={ `rounded-lg` }
                            onClick={ ( e ) => {
                                e.preventDefault();

                                if ( onBack ) {
                                    // Run the override instead.
                                    onBack();
                                    return;
                                }

                                navigate( `${ parentPath }/list` );
                            } }
                        >
                            <ArrowBigLeft className={ `!size-5 aspect-square self-center` } />
                        </Button>
                        <Button
                            size={ 'sm' }
                            variant={ `outline` }
                            className={ `rounded-lg` }
                            onClick={ () => {
                                if ( onSave ) {
                                    // Run the override instead.
                                    onSave( log, 'log' );
                                    return;
                                }

                                if ( editingMode ) {
                                    handleEditSubmit( log, 'log' );
                                    navigate( `${ parentPath }/${ id }/detail` );
                                }
                                else {
                                    handleEditStart( log, 'log' );
                                    navigate( `${ parentPath }/${ id }/edit` );
                                }
                            } }>
                            { editingMode === true ? <Save className={ `!size-5 aspect-square self-center` } /> : <PenIcon className={ `!size-5 aspect-square self-center` } /> }
                        </Button>
                        <Button
                            size={ 'sm' }
                            variant={ `destructive` }
                            className={ `rounded-lg` }
                            onClick={ () => {
                                handleDeleteStart( log?._id, log, setLogsData );
                            } }>
                            <TrashIcon className={ `!size-5 aspect-square self-center` } />
                        </Button>
                        {/*     <Link to={ `/logs/${ id }/edit` }>
                            <Button variant="outline">Edit</Button>
                        </Link> */}
                    </div>
                </div>
            </CardHeader>
            <CardContent
                className={ `log-detail !h-full !max-h-full !min-h-full !overflow-auto !relative flex flex-col` }
            >
                <ScrollArea className={ `log-detail !h-full !max-h-full !min-h-full !overflow-auto !relative flex flex-col` }>
                    <ScrollAreaViewport>
                        <h2 className='text-3xl font-semibold mb-2'>Summary</h2>
                        <div className={ `flex flex-col gap-2` }>
                            {/* { eventSchema && utils.val.isObject( eventSchema ) && ( */ }
                            { editingMode ? (
                                <div className={ `` }>

                                    <DailyLogForm
                                        data={ logFormData }
                                        setData={ setLogFormData }
                                        onUpdate={ ( name, value ) => { setLogFormData( ( prev ) => ( { ...prev, [ name ]: value } ) ); } }
                                        onSubmit={ ( data ) => ( handleEditSubmit( data, 'log' ) ) }
                                    />
                                    {/* <FormGenerator
                                        debug={ true }
                                        dataType={ 'log' }
                                        viewMode={ !editingMode }
                                        data={ logFormData }
                                        setData={ setLogFormData }
                                        useInitialData={ false }
                                        refData={ allData }
                                        initialData={ logFormData }
                                        schema={ logSchema || getSchema( 'log' ) }
                                        showFormData={ false }
                                        showFormModel={ false }
                                        showFormSchema={ false }
                                        showOptional={ true }
                                        onChange={ ( e ) => {
                                            const { name, value } = e.target;
                                            if ( log && Object.keys( log ).includes( name ) ) { if ( handleChange ) { handleChange( name, value, data, setData ); } }
                                        } }
                                        // onCancel={ () => handleCancel() }
                                        onSubmit={ ( data ) => handleEditSubmit( data, 'log' ) }
                                        inputMaxWidth={ 10 }
                                        inputMaxHeight={ 32 }
                                    /> */}
                                </div>
                            )
                                : ( <>
                                    { logFormData && utils.val.isObject( logFormData ) && (
                                        Object?.keys( logFormData )?.map( ( fieldKey, index ) => {
                                            let fieldValue = logFormData?.[ fieldKey ];
                                            if ( utils.val.isTruthy( fieldValue ) ) {
                                                // console.log( "fieldKey = ", fieldKey, " :: ", "fieldValue = ", fieldValue, " :: ", "typeof fieldValue = ", typeof fieldValue );
                                                let fieldType = utils.val.getType( fieldValue );
                                                return renderLogField( fieldKey, fieldValue, fieldType, index );
                                            }
                                        } ) ) }
                                    <Droplist
                                        label={ `Log: ${ logFormData?.title || 'N/A' }` }
                                        data={ logFormData }
                                        showControls={ false }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                    />
                                </> ) }
                        </div>

                    </ScrollAreaViewport>
                    <ScrollAreaScrollbar />

                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default LogDetail;
