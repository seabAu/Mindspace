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

const DocumentDetail = ( {
    // Config
    dataType = 'note',
    parentPath = '/dash',
    editingMode = false,
    customDocumentForm = null,

    // Data
    documents = [],
    setDocuments,
    documentContentOverride = null,

    // Callback functions
    onUpdateSubmit = () => { },
    onUpdateStart = () => { },
    onDelete = () => { },
    onCancel = () => { },
    // documents, setDocuments,
}, ...props ) => {

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
    } = useReflectStore();

    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const path = useMemo( () => location.pathname?.split( '/' ).filter( x => x ), [ location.pathname ] );
    const pathnames = useMemo( () => location.pathname.split( "/" ).filter( ( x ) => x ), [ location.pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );
    const isEditingMode = pathnames?.[ pathnames?.length - 1 ] === 'edit';


    // const { logs, removeLog } = useLogs();
    const document = (
        ( utils.val.isDefined( documentContentOverride ) )
            ? documentContentOverride
            : ( utils.val.isValidArray( documents, true )
                ? documents?.find( ( e ) => e?._id === id )
                : null )
    );
    const [ formData, setFormData ] = useState( document );

    useEffect( () => {
        setFormData( document );
    }, [ document ] );

    const schema = getSchema( dataType );
    let allData = getData();
    console.log( 'DocumentDetail :: props: ', props, ' :: ', 'id = ', id, ' :: ', 'document = ', document );

    const onFormChange = ( name, value ) => {
        if ( formData && utils.val.isObject( formData ) && Object.keys( formData ).includes( name ) ) {
            setFormData( { ...formData, [ name ]: value } );
        }
    };

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
            else { acc[ key ] = value; }
            return acc;
        }, {} );

        console.log( 'Document-edit form submitted with data:', processedData );
        // Here you would typically send the processedData to your backend
        if ( onUpdateSubmit ) onUpdateSubmit( formData, dataType );
        // if ( editingMode ) {
        //     if ( onUpdateSubmit ) onUpdateSubmit( formData, dataType );
        //     navigate( `${ parentPath }/${ id }/detail` );
        // }
        // else {
        //     if ( onUpdateStart ) onUpdateStart( formData, dataType );
        //     navigate( `${ parentPath }/${ id }/edit` );
        // }
    };

    const gridItemStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        // gridAutoRows: `1.00rem`,
        gridTemplateColumns: `span 1 / span 1`,
    };

    const renderDocumentField = ( fieldKey, fieldValue, fieldType, index ) => {
        let fieldKeyLabel = ( <h2 className="text-xl font-semibold">{ `${ caseCamelToSentence( fieldKey ) }` }</h2> );

        // console.log( "LogDetail.jsx :: renderDocumentField :: fieldKey = ", fieldKey, " :: ", "fieldValue = ", fieldValue, " :: ", "fieldType = ", fieldType, " :: ", "index = ", index );
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
                                    // console.log( "LogDetail.jsx :: renderDocumentField :: ARRAY FIELD :: subFieldIndex = ", subFieldIndex, " :: ", "subFieldValue = ", subFieldValue, " :: ", "subfieldType = ", subfieldType );
                                    if ( utils.val.isObject( subFieldValue ) ) {
                                        return ( <ul className={ `border border-sextary-200/20 rounded-lg p-1 h-auto justify-start items-center flex flex-col flex-grow min-w-1/4` }>
                                            { Object.keys( subFieldValue )?.map( ( subSubFieldKey, subSubFieldIndex ) => (
                                                <div className={ `flex flex-row flex-grow w-full` } key={ subFieldIndex }>
                                                    { renderDocumentField( subSubFieldKey, subFieldValue?.[ subSubFieldKey ], utils.val.getType( subFieldValue?.[ subSubFieldKey ] ) ) }
                                                </div> ) )
                                            }
                                        </ul> );
                                    }
                                    else if ( utils.val.isValidArray( subFieldValue, true ) ) {
                                        return ( <ul className={ `border border-sextary-200/20 rounded-lg p-1 h-auto justify-start items-center flex flex-col flex-grow min-w-1/4` }>
                                            { subFieldValue?.map( ( subSubFieldValue, subSubFieldIndex ) => (
                                                <div className={ `flex flex-row flex-grow w-full` } key={ subFieldIndex }>
                                                    { renderDocumentField( subSubFieldIndex, subSubFieldValue, utils.val.getType( subSubFieldValue ), subSubFieldIndex ) }
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

    const renderHeaderButtons = () => {
        return (

            <div className={ `flex flex-row justify-center items-center gap-2` }>
                <Link to={ `${ parentPath }/list` }>
                    <Button
                        size={ 'sm' }
                        variant={ `outline` }
                        className={ `rounded-lg` }
                    >
                        <ArrowBigLeft className={ `!size-5 aspect-square self-center` } />
                    </Button>
                </Link>
                {/* { isEditing === true || editingMode === true
                            ? (
                                <Link to={ `/dash/planner/logs/${ id }/detail` }>
                                    <Button
                                        size={ 'sm' }
                                        variant={ `outline` }
                                        className={ `rounded-lg` }
                                        onClick={ () => {

                                        } }
                                    >
                                        <DockIcon className={ `!size-5 aspect-square self-center` } />
                                    </Button>
                                </Link> )
                            : (
                                <Link to={ `/dash/planner/logs/${ id }/edit` }>
                                    <Button
                                        size={ 'sm' }
                                        variant={ `outline` }
                                        className={ `rounded-lg` }
                                    >
                                        <DockIcon className={ `!size-5 aspect-square self-center` } />
                                    </Button>
                                </Link> )
                        } */}

                <Button
                    size={ 'sm' }
                    variant={ `outline` }
                    className={ `rounded-lg` }
                    onClick={ () => {
                        if ( editingMode ) {
                            onUpdateSubmit( formData, dataType );
                            navigate( `${ parentPath }/${ id }/detail` );
                        }
                        else {
                            onUpdateStart( formData, dataType );
                            navigate( `${ parentPath }/${ id }/edit` );
                        }
                    } }>
                    { editingMode === true
                        ? <Save className={ `!size-5 aspect-square self-center` } />
                        : <PenIcon className={ `!size-5 aspect-square self-center` } />
                    }
                </Button>

                <Button
                    size={ 'sm' }
                    variant={ `destructive` }
                    className={ `rounded-lg` }
                    onClick={ () => {
                        onDelete( document?._id, document, setDocuments );
                    } }>
                    <TrashIcon className={ `!size-5 aspect-square self-center` } />
                </Button>
            </div>
        );
    };

    return (
        <Card className={ `document-detail !h-full !max-h-full !min-h-full !overflow-hidden !relative` }>
            <CardHeader className={ `w-full gap-2 whitespace-nowrap flex flex-row items-start justify-stretch p-4 h-16` }>
                { document?.title && (
                    <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                        { document?.title }
                    </CardTitle>
                ) }
                {/* <div className={ `flex flex-row w-full justify-start items-center` }>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `${ log?.mood }` }</Badge>
                    <div
                        className={ `flex flex-row w-6 border-b border-2 border-opacity-60 border-primary-purple-800 h-0 justify-center items-center` }></div>
                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `${ log?.weather?.temperature }°C, ${ log?.weather?.condition }` }</Badge>
                </div> */}
                <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                    { renderHeaderButtons() }
                </div>
            </CardHeader>
            <CardContent
                className={ `document-detail !h-full !max-h-full !min-h-full !overflow-auto !relative flex flex-col` }
            >
                <ScrollArea className={ `document-detail !h-full !max-h-full !min-h-full !overflow-auto !relative flex flex-col` }>
                    <ScrollAreaViewport>
                        {/* <h2 className='text-3xl font-semibold mb-2'>Summary</h2> */ }
                        <div className={ `flex flex-col gap-2` }>
                            {/* { schema && utils.val.isObject( schema ) && ( */ }
                            { editingMode ? (
                                <div className={ `` }>
                                    { customDocumentForm
                                        ? ( customDocumentForm )
                                        : (
                                            <FormGenerator
                                                debug={ true }
                                                dataType={ dataType }
                                                viewMode={ !editingMode }
                                                initialData={ formData }
                                                data={ formData }
                                                setData={ setFormData }
                                                useInitialData={ false }
                                                refData={ allData }
                                                schema={ schema || getSchema( dataType ) }
                                                showFormData={ false }
                                                showFormModel={ false }
                                                showFormSchema={ false }
                                                showOptional={ true }
                                                onChange={ ( e ) => {
                                                    const { name, value } = e.target;
                                                    onFormChange( name, value, data, setData );
                                                } }
                                                // onCancel={ () => handleCancel() }
                                                onSubmit={ ( data ) => handleSubmit( data, dataType ) }
                                                inputMaxWidth={ 10 }
                                                inputMaxHeight={ 32 }
                                            />
                                        ) }
                                </div>
                            )
                                : ( <>
                                    { formData && utils.val.isObject( formData ) && (
                                        Object?.keys( formData )?.map( ( fieldKey, index ) => {
                                            let fieldValue = formData?.[ fieldKey ];
                                            if ( utils.val.isTruthy( fieldValue ) ) {
                                                // console.log( "fieldKey = ", fieldKey, " :: ", "fieldValue = ", fieldValue, " :: ", "typeof fieldValue = ", typeof fieldValue );
                                                let fieldType = utils.val.getType( fieldValue );
                                                return renderDocumentField( fieldKey, fieldValue, fieldType, index );
                                            }
                                        } ) ) }
                                    <Droplist
                                        label={ `${ formData?.title || 'N/A' }` }
                                        data={ formData }
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

export default DocumentDetail;
