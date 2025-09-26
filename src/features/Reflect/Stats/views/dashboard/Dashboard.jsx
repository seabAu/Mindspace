import { useMemo } from "react";
import * as utils from 'akashatools';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Database, Filter } from "lucide-react";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const Dashboard = () => {
    const { statsData, selectedDate } = useReflectContext();

    // Calculate some basic stats - memoized to prevent recalculation
    const { totalItems, uniqueKeys, typeDistribution, recentItems } = useMemo( () => {
        console.log( "Stats Dashboard.jsx :: memoized stats calculation on component mount :: statsData = ", statsData, " :: " );
        const validData = statsData.filter( ( item ) => ( item && utils.val.isDefined( item ) && utils.val.isDefined( item?.dataKey ) ) );
        const totalItems = validData.length;
        const uniqueKeys = new Set( validData.map( ( item ) => item?.dataKey ) ).size;
        const typeDistribution = validData.reduce( ( acc, item ) => {
            acc[ item?.dataType ] = ( acc?.[ item?.dataType ] || 0 ) + 1;
            return acc;
        }, {} );

        // Get recent statsData
        const recentItems = [ ...validData ].sort( ( a, b ) => new Date( b?.timeStamp ) - new Date( a?.timeStamp ) ).slice( 0, 5 );

        return { totalItems, uniqueKeys, typeDistribution, recentItems };
    }, [ statsData ] );

    // Memoize the type color function
    const getTypeColor = useMemo( () => {
        return ( type ) => {
            switch ( type ) {
                case "string":
                    return "#3b82f6";
                case "number":
                    return "#10b981";
                case "boolean":
                    return "#f59e0b";
                case "date":
                    return "#8b5cf6";
                case "array":
                    return "#ec4899";
                default:
                    return "#6366f1";
            }
        };
    }, [] );

    return (
        <div className="h-full overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-2">
                <CardContent className="space-y-2">
                    {/* Stats Cards */ }
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Card className="border-gray-600">
                            <CardContent className="p-4 flex items-center">
                                <Database className="h-8 w-8 mr-4 text-blue-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Total Items</p>
                                    <p className="text-2xl font-bold">{ totalItems }</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-600">
                            <CardContent className="p-4 flex items-center">
                                <Filter className="h-8 w-8 mr-4 text-purple-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Unique Keys</p>
                                    <p className="text-2xl font-bold">{ uniqueKeys }</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-600">
                            <CardContent className="p-4 flex items-center">
                                <Calendar className="h-8 w-8 mr-4 text-green-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Date Filter</p>
                                    <p className="text-lg font-bold truncate">
                                        { ( selectedDate && utils.val.isDefined( selectedDate ) ) && ( selectedDate instanceof Date ) ? selectedDate.toLocaleDateString() : "None" }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Type Distribution */ }
                    <Card className="border-gray-600">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Data Type Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                { Object.entries( typeDistribution ).map( ( [ type, count ] ) => (
                                    <div key={ type } className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={ { backgroundColor: getTypeColor( type.toLowerCase() ) } }
                                        />
                                        <span className="text-sm">
                                            { type }: { count }
                                        </span>
                                    </div>
                                ) ) }
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Items */ }
                    <Card className="border-gray-600">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Recent Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="space-y-2">
                                { recentItems.map( ( item ) => (
                                    <div key={ item?._id } className="p-2 bg-neutral-900/20 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{ item.dataKey }</span>
                                            <span className="text-xs text-gray-400">{ new Date( item.timeStamp ).toLocaleString() }</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-sm text-gray-400">{ item.dataType }</span>
                                            <span className="text-sm truncate max-w-[200px]">
                                                { typeof item.dataValue === "object"
                                                    ? JSON.stringify( item.dataValue ).substring( 0, 30 ) + "..."
                                                    : String( item.dataValue ) }
                                            </span>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </ScrollArea>
        </div>
    );
};

export default Dashboard;
