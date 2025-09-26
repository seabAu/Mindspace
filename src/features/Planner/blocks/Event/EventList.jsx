import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import usePlannerStore from '@/store/planner.store';
import * as utils from 'akashatools';
import { Badge } from '@/components/ui/badge';
import { Pen } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import usePlanner from '@/lib/hooks/usePlanner';
import { isDate } from 'date-fns';
import { getPrettyDateTime } from '@/lib/utilities/time';

const EventList = () => {
    const {
        requestFetchEvents, setRequestFetchEvents,
        requestFetchLogs, setRequestFetchLogs,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleDeleteSubmit,
        handleEditSubmit,
        handleCreateSubmit,
        handleCloneSubmit,
    } = usePlanner();

    if ( loadingPlanner ) return <div>Loading...</div>;
    if ( errorPlanner ) return <div>Error: { errorPlanner }</div>;

    return (
        <div className="event-list gap-y-3.5 w-fit max-w-full">
            <h1 className="text-2xl font-bold mb-4">All Events</h1>
            <Link to={ `./create` }>
                <Button className="mb-4">Create New Event</Button>
            </Link>
            <div className="event-list p-4">
                { eventsData.map( event => (
                    <Card
                        key={ event?._id }
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
                            { event?.title && (
                                <CardTitle className={ `border-b-2 border-opacity-60 text-white/70 w-3/5 ` }>
                                    { event?.title }
                                </CardTitle>
                            ) }
                            <div className={ `flex flex-row w-full justify-start items-center` }>
                                { event?.hasOwnProperty( 'start' ) && isDate( new Date( event?.start ) ) && ( <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 text-md font-bold text-center capitalize font-sans` }>{ `Starts: ${ getPrettyDateTime( new Date( event?.start ) ) }` }</Badge> ) }
                                <div
                                    className={ `flex flex-row w-6 border-b border-2 border-opacity-60 border-primary-purple-800 h-0 justify-center items-center` }></div>
                                { event?.hasOwnProperty( 'end' ) && isDate( new Date( event?.end ) ) && ( <Badge className={ `border-2 border-opacity-60 border-primary-purple-800 text-md font-bold text-center capitalize font-sans` }>{ `Ends: ${ getPrettyDateTime( new Date( event?.end ) ) }` }</Badge> ) }
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>{ event?.summary }</p>
                            <div className="flex-row">
                                <Link to={ `./${ event?._id }` }>
                                    <Button variant="outline" className="mr-2">View Details</Button>
                                </Link>
                                <Link to={ `./${ event?._id }/edit` }>
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

export default EventList;

