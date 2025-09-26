import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import * as utils from 'akashatools';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useGlobalStore from '@/store/global.store';
import FormGenerator from '@/components/Form/FormGenerator';
import { Spinner } from '@/components/Loader/Spinner';
import { DateTimeLocal } from '@/lib/config/types';
import FormGeneratorProvider from '@/lib/providers/FormGeneratorContext';
import { DailyLogForm } from '../blocks/DailyLogForm/DailyLogForm';
import { produce } from 'immer';
import useReflect from '@/lib/hooks/useReflect';
import { caseCamelToSentence } from '@/lib/utilities/string';
import { DeleteIcon, X } from 'lucide-react';

const DocumentCreate = ( {
    // Config
    dataType = 'note',
    parentPath = '/dash',
    customDocumentForm = null,

    // Data
    initialData = {},
    date = new Date( Date.now() ),

    // Callback functions
    onCancel = () => { },
    onRefresh = () => { },
    onCreateSubmit = () => { },
    onCreateStart = () => { },
    onChange = () => { },
    // documents, setDocuments,
}, ...props ) => {
    const {
        // log,
        // setLog,
        // updateLog,
        // schema,
        classNames
    } = props;

    const {
        user,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const { id } = useParams();
    const [ formData, setFormData ] = useState( {
        workspaceId: workspaceId,
        userId: user?.id ?? null,
        date: date,
    } );
    // const [ plannerLogSchema, setPlannerLogSchema ] = useState( null );

    let allData = getData();

    const schema = getSchema( dataType );

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
            else { acc[ key ] = value; }
            return acc;
        }, {}
        );

        console.log( "Create-document form submitted with data:", processedData );
        // Here you would typically send the processedData to your backend
        onCreateSubmit( formData );
    };

    const updateData = ( updater ) => {
        setFormData( produce( updater ) );
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
                <Button
                    size={ 'sm' }
                    variant={ `outline` }
                    className={ `rounded-lg` }
                    onClick={ () => {
                        if ( onCancel ) onCancel();
                    } }>
                    <X className={ `!size-5 aspect-square self-center` } />{ ` Clear` }
                </Button>

                <Button
                    size={ 'sm' }
                    variant={ `destructive` }
                    className={ `rounded-lg` }
                    onClick={ () => {
                        setFormData( {} );
                    } }>
                    <DeleteIcon className={ `!size-5 aspect-square self-center` } />{ ` Clear` }
                </Button>
            </div>
        );
    };

    return (
        <div className={ `w-full h-full overflow-hidden p-4` }>
            <h1 className='text-2xl font-bold h-full '>
                { `New ${ caseCamelToSentence( dataType ) } for date: ${ new Date( Date.now() ).toLocaleDateString() }` }
            </h1>

            <div className={ `w-full h-full overflow-hidden` }>
                <h1 className="text-3xl font-bold">{ `Create ${ caseCamelToSentence( dataType ) }` }</h1>
                <div className={ `px-2 border-brand-washedBlue-200` }>
                    { schema && utils.val.isObject( schema ) ? (
                        <>
                            { ( customDocumentForm )
                                ? ( customDocumentForm )
                                : ( <FormGenerator
                                    debug={ false }
                                    showOptional={ true } // Show all fields by default. 
                                    customFields={ [] }
                                    data={ formData }
                                    setData={ setFormData }
                                    refData={ allData }
                                    initialData={ initialData || {} }
                                    model={ schema ?? getSchema( dataType ) }
                                    schema={ schema ?? getSchema( dataType ) }
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        if ( formData && Object.keys( formData )?.includes( name ) ) {
                                            if ( onChange ) onChange( name, value, formData, setData );
                                            setFormData( { ...formData, [ name ]: value } );
                                        }
                                    } }
                                    onCancel={ onCancel }
                                    onSubmit={ ( data ) => handleSubmit( data ) }
                                    inputMaxWidth={ 10 }
                                    inputMaxHeight={ 32 }
                                /> ) }
                        </>
                    ) : ( <Spinner variant={ 'circles' } size={ 'md' } overlay={ false } /> ) }
                </div>
            </div>
        </div>
    );
};

export default DocumentCreate;
