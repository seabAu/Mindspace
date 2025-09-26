
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Filter, Download, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useTasksStore from "@/store/task.store";
import { useUpdateQueueStore } from "@/lib/store/update-queue-store";
import * as utils from 'akashatools';
import useGlobalStore from "@/store/global.store";

export function FilterBar () {
    const {
        filters, setFilters,
        tags: availableTags,
        searchTerm, setSearchTerm,
        // isDarkMode, setIsDarkMode,
        // users: availableUsers,
    } = useTasksStore();

    const { usersData: availableUsers } = useGlobalStore();

    const { processUpdates } = useUpdateQueueStore();
    const [ isSearchActive, setIsSearchActive ] = useState( false );

    const handleExport = async () => {
        try {
            // Get all tasks from all columns
            const allTasks = useTasksStore.getState().columns.flatMap( ( column ) =>
                column.tasks.map( ( task ) => ( {
                    ...task,
                    id: task?._id,
                    title: task.title,
                    column: column.id,
                    description: task.description || "",
                    timestampDue: task.timestampDue ? new Date( task.timestampDue ).toISOString().split( "T" )[ 0 ] : "",
                    timestampStarted: task.timestampStarted ? new Date( task.timestampStarted ).toISOString().split( "T" )[ 0 ] : "",
                    timestampEstimated: task.timestampEstimated ? new Date( task.timestampEstimated ).toISOString().split( "T" )[ 0 ] : "",
                    timestampCompleted: task.timestampCompleted ? new Date( task.timestampCompleted ).toISOString().split( "T" )[ 0 ] : "",
                    createdAt: task.createdAt ? new Date( task.createdAt ).toISOString().split( "T" )[ 0 ] : "",
                    assignee: task.user ? task.user.name : "",
                    status: task.status || "none",
                    priority: task.priority || "medium",
                    difficulty: task.difficulty || "medium",
                    progress: task.progress || 0,
                    tags: task.tags.map( ( t ) => t.name ).join( ", " ),
                } ) ),
            );

            // Convert data to CSV
            const headers = Object.keys( allTasks[ 0 ] || {} ).join( "," );
            const rows = allTasks.map( ( row ) => Object.values( row ).join( "," ) );
            const csv = [ headers, ...rows ].join( "\n" );

            // Create a blob and download
            const blob = new Blob( [ csv ], { type: "text/csv" } );
            const url = URL.createObjectURL( blob );
            const a = document.createElement( "a" );
            a.href = url;
            a.download = `kanban-export-${ new Date().toISOString().split( "T" )[ 0 ] }.csv`;
            document.body.appendChild( a );
            a.click();
            document.body.removeChild( a );
            URL.revokeObjectURL( url );
        } catch ( error ) {
            console.error( "Error exporting data:", error );
        }
    };

    const clearAllFilters = () => {
        setFilters( {
            tags: [],
            users: [],
            timestampDue: "all",
            priority: "all",
        } );
        setSearchTerm( "" );
    };

    const hasActiveFilters = () => {
        return (
            filters.tags.length > 0 ||
            filters.users.length > 0 ||
            filters.timestampDue !== "all" ||
            filters.priority !== "all" ||
            searchTerm.trim() !== ""
        );
    };

    return (
        <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center space-x-1">
                { isSearchActive ? (
                    <div className="relative">
                        <Input
                            placeholder="Search tasks..."
                            value={ searchTerm }
                            onChange={ ( e ) => setSearchTerm( e.target.value ) }
                            className="w-48 pl-6 h-6 text-xs"
                            autoFocus
                        />
                        <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        { searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-4 w-4"
                                onClick={ () => setSearchTerm( "" ) }
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        ) }
                    </div>
                ) : (
                    <Button variant="outline" size="sm" className="h-6 text-xs" onClick={ () => setIsSearchActive( true ) }>
                        <Search className="h-3 w-3 mr-1" />
                        Search
                    </Button>
                ) }

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters
                            { hasActiveFilters() && (
                                <Badge variant="secondary" className="ml-1 h-4 px-0.5 text-[10px]">
                                    { filters.tags.length +
                                        filters.users.length +
                                        ( filters.timestampDue !== "all" ? 1 : 0 ) +
                                        ( filters.priority !== "all" ? 1 : 0 ) +
                                        ( searchTerm.trim() !== "" ? 1 : 0 ) }
                                </Badge>
                            ) }
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-xs">Filters</h3>
                                { hasActiveFilters() && (
                                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={ clearAllFilters }>
                                        Clear all
                                    </Button>
                                ) }
                            </div>

                            <Separator className="my-1" />

                            <div>
                                <h4 className="font-medium text-xs mb-1">Filter by Tags</h4>
                                <div className="space-y-1">
                                    { availableTags.map( ( tag ) => (
                                        <div key={ tag.id } className="flex items-center space-x-1">
                                            <Checkbox
                                                id={ `tag-${ tag.id }` }
                                                checked={ filters.tags.includes( tag.id ) }
                                                onCheckedChange={ ( checked ) => {
                                                    setFilters( {
                                                        ...filters,
                                                        tags: checked ? [ ...filters.tags, tag.id ] : filters.tags.filter( ( id ) => id !== tag.id ),
                                                    } );
                                                } }
                                                className="h-3 w-3"
                                            />
                                            <Label htmlFor={ `tag-${ tag.id }` } className="flex items-center text-xs font-normal">
                                                <span className="w-2 h-2 rounded-full mr-1" style={ { backgroundColor: tag.color } }></span>
                                                { tag.name }
                                            </Label>
                                        </div>
                                    ) ) }
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-xs mb-1">Filter by Assignee</h4>
                                <div className="space-y-1">
                                    { availableUsers.map( ( user ) => (
                                        <div key={ user.id } className="flex items-center space-x-1">
                                            <Checkbox
                                                id={ `user-${ user.id }` }
                                                checked={ filters.users.includes( user.id ) }
                                                onCheckedChange={ ( checked ) => {
                                                    setFilters( {
                                                        ...filters,
                                                        users: checked ? [ ...filters.users, user.id ] : filters.users.filter( ( id ) => id !== user.id ),
                                                    } );
                                                } }
                                                className="h-3 w-3"
                                            />
                                            <Label htmlFor={ `user-${ user.id }` } className="text-xs font-normal">
                                                { user.name }
                                            </Label>
                                        </div>
                                    ) ) }
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-xs mb-1">Filter by Due Date</h4>
                                <RadioGroup
                                    value={ filters.timestampDue }
                                    onValueChange={ ( value /* : "all" | "overdue" | "today" | "upcoming" | "this-week" | "next-week" */ ) => {
                                        setFilters( {
                                            ...filters,
                                            timestampDue: value,
                                        } );
                                    } }
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="all" id="due-all" className="h-3 w-3" />
                                        <Label htmlFor="due-all" className="text-xs font-normal">
                                            All
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="overdue" id="due-overdue" className="h-3 w-3" />
                                        <Label htmlFor="due-overdue" className="text-xs font-normal">
                                            Overdue
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="today" id="due-today" className="h-3 w-3" />
                                        <Label htmlFor="due-today" className="text-xs font-normal">
                                            Today
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="this-week" id="due-this-week" className="h-3 w-3" />
                                        <Label htmlFor="due-this-week" className="text-xs font-normal">
                                            This Week
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="next-week" id="due-next-week" className="h-3 w-3" />
                                        <Label htmlFor="due-next-week" className="text-xs font-normal">
                                            Next Week
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="upcoming" id="due-upcoming" className="h-3 w-3" />
                                        <Label htmlFor="due-upcoming" className="text-xs font-normal">
                                            All Upcoming
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <h4 className="font-medium text-xs mb-1">Filter by Priority</h4>
                                <RadioGroup
                                    value={ filters.priority }
                                    onValueChange={ ( value ) => {
                                        setFilters( {
                                            ...filters,
                                            priority: value,
                                        } );
                                    } }
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="all" id="priority-all" className="h-3 w-3" />
                                        <Label htmlFor="priority-all" className="text-xs font-normal">
                                            All
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="high" id="priority-high" className="h-3 w-3" />
                                        <Label htmlFor="priority-high" className="text-xs font-normal">
                                            High
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="medium" id="priority-medium" className="h-3 w-3" />
                                        <Label htmlFor="priority-medium" className="text-xs font-normal">
                                            Medium
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="low" id="priority-low" className="h-3 w-3" />
                                        <Label htmlFor="priority-low" className="text-xs font-normal">
                                            Low
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={ () => processUpdates() }>
                    Sync
                </Button>
            </div>

            <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={ handleExport }>
                    <Download className="h-3 w-3 mr-1" />
                    Export
                </Button>
            </div>
        </div>
    );
}
