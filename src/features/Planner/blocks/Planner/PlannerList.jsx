import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import usePlannerStore from '@/store/planner.store';
import * as utils from 'akashatools';
import { Badge } from '@/components/ui/badge';
import { CopyCheck, Edit2Icon, InfoIcon, Pen, Trash } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import usePlanner from '@/lib/hooks/usePlanner';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/Loader/Spinner';
import { invertColor, stringAsColor } from '@/lib/utilities/color';

const PlannerList = ( props ) => {
    const {
        classNames
    } = props;

    const {
        requestFetchEvents, setRequestFetchEvents,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleCloneSubmit,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleClonePlanner,
        handleCancel,
    } = usePlanner();

    if ( loadingPlanner ) return <div>Loading...</div>;
    if ( errorPlanner ) return <div>Error: { errorPlanner }</div>;

    return (
        <div className={ `overflow-hidden w-full h-full` }>
            <h1 className={ `text-2xl font-bold mb-4  w-full h-full` }>{ `Planners` }</h1>
            {/* List of logs */ }
            <Table className={ `table-fixed` }>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { plannerData && utils.val.isValidArray( plannerData, true )
                        ? ( plannerData?.map( ( item ) => {
                            if ( item && utils.ao.hasAll( item, [ '_id', 'title', 'description', 'categories' ] ) ) {
                                return (
                                    <TableRow id={ item?._id } key={ item?._id }>

                                        <TableCell className={ `border-x h-full w-auto flex-1 p-2` }>
                                            {/* Title */ }
                                            { item?.title && item?.title }
                                        </TableCell>

                                        <TableCell className={ `border-x h-full w-auto flex-1 p-2` }>
                                            {/* Description */ }
                                            { item?.description && item?.description }
                                        </TableCell>

                                        <TableCell className={ `border-x h-full w-auto flex-1 p-2` }>
                                            {/* Events */ }
                                            { item?.eventIds && utils.val.isValidArray( item?.eventIds, true )
                                                ? ( item?.eventIds?.map( ( id ) => {
                                                    let event = eventsData?.find( ( ev ) => ( ev?._id === id ) );
                                                    if ( event ) return (
                                                        <div className={ `flex flex-col w-full h-full` }>
                                                            <div className={ `flex flex-row w-full h-auto` }>
                                                                { event?.title }
                                                            </div>
                                                            <div className={ `flex flex-row w-full h-auto` }>
                                                                { `${ new Date( event?.start ) } - ${ new Date( event?.end ) }` }
                                                            </div>
                                                        </div>
                                                    );
                                                } ) )
                                                : ( '' )
                                            }
                                        </TableCell>

                                        <TableCell className={ `border-x h-full !min-w-[20vw] flex-1 p-2` }>
                                            {/* Categories */ }
                                            { item?.categories && utils.val.isValidArray( item?.categories, true ) && (
                                                item?.categories?.filter( ( category ) => ( category ) ).map( ( category ) => {
                                                    let bgColor = stringAsColor( category );
                                                    let complimentaryColor = invertColor( bgColor );
                                                    return (
                                                        <Badge
                                                            className={ `border-2 hover:border-opacity-0 border-opacity-60 border-primary-purple-800 !py-1 !px-2` }
                                                            style={ {
                                                                backgroundColor: `${ bgColor }88`,
                                                                // borderColor: `${ bgColor }88`,
                                                                color: complimentaryColor,
                                                            } }
                                                        >
                                                            <div className={ `font-bold text-xs` }>{ category }</div>
                                                        </Badge>
                                                    );
                                                } )
                                            ) }
                                        </TableCell>

                                        <TableCell className={ `border-x h-full w-auto flex-1 p-0` }>
                                            {/* Actions cell */ }

                                            <div className={ `m-0 p-0 grid grid-flow-row grid-cols-4 flex-wrap flex flex-row justify-center items-center` }>
                                                <Link to={ `./../planners/${ item?._id }` }>
                                                    <Button size={ 'sm' } variant={ `ghost` } className={ `aspect-square !p-1` }>
                                                        <InfoIcon className={ `!size-6 aspect-square p-0` } />
                                                    </Button>
                                                </Link>
                                                <Link to={ `./../planners/${ item?._id }/edit` }>
                                                    <Button size={ 'sm' } variant={ `ghost` } className={ `aspect-square !p-1` }>
                                                        <Edit2Icon className={ `!size-6 aspect-square p-0` } />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size={ 'sm' }
                                                    className={ `aspect-square !p-1` }
                                                    variant={ `ghost` }
                                                    onClick={ () => { handleClonePlanner( item ); } }
                                                >
                                                    <CopyCheck className={ `!size-6 aspect-square p-0` } />
                                                </Button>
                                                <Button
                                                    size={ 'sm' }
                                                    className={ `aspect-square !p-1` }
                                                    variant={ `destructive` }
                                                    onClick={ () => { handleDeleteStart( item?._id, item, setPlannerData, 'planner' ); } }>
                                                    <Trash className={ `!size-6 aspect-square p-0` } />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                        } ) )
                        : ( <Spinner
                            variant={ 'circles' }
                            size={ 'md' }
                            color={ 'currentColor' }
                            overlay={ false }
                            className={ `` }
                        /> ) }
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={ 3 }>Total</TableCell>
                        <TableCell className='text-right'>
                            { `Footer area` }
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div >
    );
};

export default PlannerList;
