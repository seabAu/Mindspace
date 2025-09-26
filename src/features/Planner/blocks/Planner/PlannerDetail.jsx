import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import { ArrowBigLeft, ArrowBigRight, EditIcon, SaveIcon, TrashIcon } from 'lucide-react';
import * as utils from 'akashatools';
import FormGenerator from '@/components/Form/FormGenerator';
import { formatDate, formatDateTime } from '@/lib/utilities/time';
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from '@/lib/config/types';
import { invertColor, stringAsColor } from '@/lib/utilities/color';

const PlannerDetail = ( props ) => {
    const {
        editingMode = false,
        parentPath,
    } = props;

    const {
        workspaceId, setWorkspaceId,
        getSchema,
        data,
        getData, // setData,
        debug, setDebug,
    } = useGlobalStore();

    const {
        plannerData, setPlannerData,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCancel,
    } = usePlanner();

    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { hash, pathname, search } = location;
    const path = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );

    const planner = useMemo( () => ( plannerData.find( ( item ) => item?._id === id ) ), [ endpoint ] );
    const [ formData, setFormData ] = useState( planner || {} );

    let allData = getData();
    // const schema = getSchemaForDataType( 'planner' );

    const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) {
                acc[ key ] = value.toISOString();
            } else {
                acc[ key ] = value;
            }
            return acc;
        }, {} );

        console.log( 'Form submitted with data:', processedData );
        // Here you would typically send the processedData to your backend
        handleEditSubmit( formData, 'planner' );
    };

    return (
        <Card className='planner-detail'>
            <CardHeader className={ `flex flex-col w-full flex-grow-1 justify-stretch gap-2 items-start whitespace-nowrap ` }>

                <div className={ `m-0 p-0 space-x-2 flex flex-row w-full justify-between` }>

                    { planner?.title && (
                        <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 text-highlightColor` }>
                            { planner?.title }
                        </CardTitle>
                    ) }

                    {/* <h1 className='text-2xl font-bold h-full '>
                        { `Planner Details` }
                    </h1> */}
                    <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>
                        <Link to={ `..` }>
                            <Button variant='outline' className={ `space-x-2` }>
                                <ArrowBigLeft className={ `aspect-square size-6 p-0 m-0` } />
                            </Button>
                        </Link>

                        <Link to={ `${ editingMode ? '..' : './edit' }` }>
                            <Button
                                className={ `px-4 py-1 rounded-xl` }
                                variant='outline'
                                onClick={ () => ( handleEditSubmit( formData, 'planner' ) ) }
                            >
                                { editingMode
                                    ? <><SaveIcon className={ `aspect-square size-6 p-0 m-0` } />{ 'Save' }</>
                                    : <><EditIcon className={ `aspect-square size-6 p-0 m-0` } />{ 'Edit' }</> }
                            </Button>
                        </Link>

                        <Button
                            className={ `px-4 py-1 rounded-xl` }
                            variant='destructive'
                            onClick={ () => {
                                handleDeleteStart( planner?._id, planner, setPlannerData, 'planner' );
                            } }>
                            <TrashIcon className={ `aspect-square size-6 p-0 m-0` } /> { `Delete` }
                        </Button>
                    </div>
                </div>
                <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>

                    <div className={ `flex flex-row w-full justify-start items-center gap-2 flex-wrap max-w-screen-xl` }>
                        { planner?.categories && utils.val.isValidArray( planner?.categories, true ) && (
                            planner?.categories?.filter( ( category ) => ( category ) ).map( ( category ) => {
                                let bgColor = stringAsColor( category );
                                let complimentaryColor = invertColor( bgColor );
                                return (
                                    <div className={ `flex flex-row border-opacity-60 border-primary-purple-800 justify-center items-center` }>
                                        <Badge
                                            className={ `border-2 border-opacity-60 border-primary-purple-800 !py-1 !px-2` }
                                            style={ {
                                                backgroundColor: bgColor,
                                                color: complimentaryColor,
                                                borderColor: bgColor,
                                            } }
                                        >
                                            <div className={ `font-bold text-xs` }>{ category }</div>
                                        </Badge>
                                    </div>
                                );
                            } )
                        ) }
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <h2 className='text-3xl font-semibold mb-2'>Summary</h2>
                <div className={ `flex flex-row w-full gap-4` }>
                    <h2 className='text-lg font-semibold'>{ `Starts: ${ formatDateTime( new Date( planner?.start ) )
                        ?.split( 'T' )
                        ?.join( ' at ' ) }` }</h2>
                    <h2 className='text-lg font-semibold'>{ `Ends: ${ formatDateTime( new Date( planner?.end ) )
                        ?.split( 'T' )
                        ?.join( ' at ' ) }` }</h2>
                </div>
                <div className={ `flex flex-col gap-2` }>
                    <FormGenerator
                        debug={ true }
                        refData={ allData }
                        data={ formData }
                        setData={ setFormData }
                        initialData={ planner }
                        showFormData={ true }
                        schema={ getSchema( 'planner' ) }
                        showFormModel={ true }
                        showFormSchema={ true }
                        onChange={ ( e ) => {
                            const { name, value } = e.target;
                            console.log(
                                'PlannerDetail :: CardContent ==> FormGenerator :: onChange triggered :: name, value = ',
                                name,
                                value,
                            );
                            if ( planner && Object.keys( planner ).includes( name ) ) {
                                if ( handleChange ) {
                                    handleChange( name, value, data, setData );
                                }
                            }
                        } }
                        // onCancel={ () => handleCancel() }
                        onSubmit={ ( data ) => handleEditSubmit( data, 'planner' ) }
                        inputMaxWidth={ 10 }
                        inputMaxHeight={ 32 }
                    />
                    {/* ) } */ }
                </div>

            </CardContent>
        </Card>
    );
};


export default PlannerDetail;
