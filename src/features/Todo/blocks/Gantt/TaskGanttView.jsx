import { useMemo } from "react";
// TODO :: Find a replacement for this library. This one has vulnerabilitiues and is unmaintained
// import Timeline from "react-gantt-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TaskGanttView = ( { tasks } ) => {
    const getColorByStatus = ( status ) => {
        switch ( status ) {
            case "completed":
                return "green";
            case "inProgress":
                return "blue";
            case "waitingRequirements":
                return "orange";
            case "cancelled":
                return "red";
            default:
                return "gray";
        }
    };

    const chartData = useMemo( () => {
        return tasks.map( ( task ) => ( {
            id: task._id,
            start: new Date( task.createdDate ),
            end: new Date( task.dueDate ),
            name: task.title,
            color: getColorByStatus( task.status ),
            progress: task.completeness,
        } ) );
    }, [ tasks ] );

    return (
        <Card className="gantt-chart bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
            <CardHeader>
                <CardTitle>Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={ { height: "500px" } }>
                    {/* <GanttTimeline
                        data={ chartData }
                        links={ [] }
                        mode="year"
                        itemHeight={ 40 }
                        nonWorkingDays={ [ 6, 0 ] } // Saturday and Sunday
                        rowHeight={ 40 }
                        itemHeightRatio={ 0.8 }
                        selectedItem={ null }
                        onSelectItem={ ( item ) => console.log( item ) }
                        onUpdateTask={ ( item, props ) => console.log( item, props ) }
                    /> */}
                    {/* <Timeline
                        data={ chartData }
                        links={ [] }
                        mode="year"
                        itemHeight={ 40 }
                        nonWorkingDays={ [ 6, 0 ] } // Saturday and Sunday
                        rowHeight={ 40 }
                        itemHeightRatio={ 0.8 }
                        selectedItem={ null }
                        onSelectItem={ ( item ) => console.log( item ) }
                        onUpdateTask={ ( item, props ) => console.log( item, props ) }
                    /> */}
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskGanttView

