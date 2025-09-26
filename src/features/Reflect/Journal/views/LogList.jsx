import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import * as utils from 'akashatools';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, Calendar1Icon, Copy, Edit, EllipsisIcon, LucideLayoutGrid, Plus, RefreshCcw, Trash } from 'lucide-react';
import clsx from 'clsx';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import { Spinner } from '@/components/Loader/Spinner';
import { twMerge } from 'tailwind-merge';
import PlannerDialog from '@/features/Planner/components/dialog/PlannerDialog';
import useReflectStore from '@/store/reflect.store';
import useReflect from '@/lib/hooks/useReflect';

const LogList = ( props ) => {
    const {
        parentPath = '/dash/reflect/journal',
        classNames,
    } = props;

    const navigate = useNavigate();

    const {
        requestFetchLogs, setRequestFetchLogs,
        logsData, setLogsData,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = useReflectStore();

    const {
        handleChange,
        handleFetchLogs,
        handleCloneSubmit,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCancel,
    } = useReflect();

    if ( loadingPlanner ) return <div>Loading...</div>;
    if ( errorPlanner ) return <div>Error: { errorPlanner }</div>;

    console.log( "LogList :: logsData = ", logsData );
    return (
        <div className={ `overflow-hidden space-y-4 w-full h-full` }>
            <h1 className={ `text-2xl font-bold w-full h-full` }>Daily Logs</h1>
            {/* List of logsData */ }
            <Table className={ `overflow-auto h-full w-full flex-1` }>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={ `overflow-auto h-full w-full flex-1` }>
                    { utils.val.isValidArray( logsData, true )
                        ? ( logsData?.map( ( log ) => {
                            if (
                                log &&
                                utils.ao.hasAll( log, [
                                    '_id',
                                    'date',
                                    'title',
                                    'summary',
                                ] )
                            ) {
                                const id = log?._id;
                                return (
                                    <TableRow
                                        id={ log?._id }
                                        key={ log?._id }>
                                        <TableCell>
                                            { new Date(
                                                log?.date,
                                            ).toLocaleDateString() }
                                        </TableCell>
                                        <TableCell>
                                            {/* Title */ }
                                            { log?.title }
                                        </TableCell>
                                        <TableCell>
                                            {/* Summary */ }
                                            { log?.summary }
                                        </TableCell>
                                        <TableCell>
                                            {/* Actions cell */ }

                                            <div className={ `m-0 p-0 space-x-2 flex flex-row ` }>

                                                <Button
                                                    size={ 'sm' }
                                                    variant={ `outline` }
                                                    className={ `rounded-lg` }
                                                    onClick={ () => {
                                                        navigate( `${ parentPath }/${ id }/detail` );
                                                    } }
                                                >
                                                    Details
                                                </Button>

                                                <Button
                                                    size={ 'sm' }
                                                    variant={ `outline` }
                                                    className={ `rounded-lg` }
                                                    onClick={ () => {
                                                        navigate( `${ parentPath }/${ id }/edit` );
                                                    } }
                                                >
                                                    Edit
                                                </Button>

                                                {/* <Button variant='outline'>
                                                    <Link to={ `./../${ log?._id }/detail` }>
                                                        Details
                                                    </Link>
                                                </Button>

                                                <Button variant='outline'>
                                                    <Link to={ `./../${ log?._id }/edit` }>
                                                        <Edit />
                                                    </Link>
                                                </Button> */}

                                                <Button
                                                    size={ 'sm' }
                                                    variant={ `outline` }
                                                    className={ `rounded-lg` }
                                                    onClick={ async () => {
                                                        let response = await handleCloneSubmit( log, 'log' );
                                                        if ( response && utils.val.isObject( response ) && response?.hasOwnProperty( '_id' ) ) {
                                                            let fetchresponse = await handleFetchLogs();
                                                            navigate( `${ parentPath }/${ response?._id }/detail` );
                                                        }
                                                    } }
                                                >
                                                    <Copy />
                                                </Button>

                                                {/* <Button
                                                    variant='primary'
                                                    onClick={ () => { handleCloneSubmit( log, 'log' ); } }>
                                                    <Copy />
                                                </Button> */}

                                                <Button
                                                    variant='destructive'
                                                    onClick={ () => { handleDeleteStart( log?._id, log, setLogsData, 'log' ); } }>
                                                    <Trash />
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

export default LogList


/*  const handleSubmit = ( formData ) => {
        // Convert DateTimeLocal objects to ISO strings for submission
        const processedData = Object.entries( formData ).reduce( ( acc, [ key, value ] ) => {
            if ( value instanceof DateTimeLocal ) { acc[ key ] = value.toISOString(); }
            else { acc[ key ] = value; }
            return acc;
        }, {} );
 
        console.log( 'Form submitted with data:', processedData );
        // Here you would typically send the processedData to your backend
        handleEditSubmit( formData );
    };
*/

/*  const LogList = () => {
        const {
            requestFetchEvents, setRequestFetchEvents,
            requestFetchLogs, setRequestFetchLogs,
            requestFetchCalendars, setRequestFetchCalendars,
            plannerData, setPlannerData,
            eventsData, setEventsData,
            logsData, setLogsData,
            loading: loadingPlanner, setLoading: setLoadingPlanner,
            error: errorPlanner, setError: setErrorPlanner,
        } = usePlannerStore();

        if ( loadingPlanner ) return <div>Loading...</div>;
        if ( errorPlanner ) return <div>Error: { errorPlanner }</div>;

        return (
            <div className="log-list gap-y-3.5">
                <h1 className="text-2xl font-bold mb-4">All Logs</h1>
                <Link to={ `./create` }>
                    <Button className="mb-4">Create New Log</Button>
                </Link>
                <div className="log-list p-4">
                    { logsData.map( log => (
                        <Card
                            key={ log?._id }
                            className={
                                twMerge(
                                    `w-full mb-4`,
                                    `shadow-[0px_0px_0px_1px_hsl(var(--sidebar-border))] hover:bg-Neutrals/neutrals-12/20 hover:text-sidebar-accent-foreground hover:shadow-[0px_0px_0px_1px_hsl(var(--sidebar-accent))]`,
                                    "transition-all duration-200 ease-in-out",
                                    `rounded-lg bg-sextary-900 cursor-pointer`,
                                    // `shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.2),0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_0px_0px_1px_rgba(59,130,246,0.5),0px_0px_0px_4px_rgba(249,115,22,0.25)]`,
                                    `shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.2),0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_0px_2px_0px_rgba(59,59,166,0.5),0px_0px_1px_4px_rgba(22,22,22,0.25)]`,
                                    `hover:shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25),0px_0px_0px_3px_rgba(59,130,246,0.5),0px_0px_8px_1px_rgba(59,59,59,0.5),0px_0px_8px_8px_rgba(111,115,255,0.25)]`,
                                    `focus:shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.06),inset_0px_0px_0px_3px_rgba(59,130,246,0.5),inset_0px_0px_0px_8px_rgba(111,115,22,0.25)]`,
                                ) }
                        >
                            <CardHeader className={ `flex flex-col w-full justify-center gap-2 items-start whitespace-nowrap ` }>
                                { log?.title && (
                                    <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                                        { log?.title }
                                    </CardTitle>
                                ) }
                                <div className={ `flex flex-row w-full justify-start items-center` }>
                                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `Starts: ${ log?.start
                                        ?.split( 'T' )
                                        ?.join( ' at ' ) }` }</Badge>
                                    <div
                                        className={ `flex flex-row w-6 border-b border-2 border-opacity-60 border-primary-purple-800 h-0 justify-center items-center` }></div>
                                    <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 ` }>{ `Ends: ${ log?.end
                                        ?.split( 'T' )
                                        ?.join( ' at ' ) }` }</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p>{ log?.summary }</p>

                                <Separator />

                                <p>{ log?.content }</p>

                                <div className="flex-row">
                                    <Link to={ `./${ log?._id }` }>
                                        <Button variant="outline" className="mr-2">View Details</Button>
                                    </Link>
                                    <Link to={ `./${ log?._id }/edit` }>
                                        <Button variant="outline"><Pen />Edit</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) ) }
                </div>
            </div >
        );
    };

    export default LogList;
*/