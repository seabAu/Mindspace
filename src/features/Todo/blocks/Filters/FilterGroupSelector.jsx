import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import * as utils from 'akashatools';
// import type { GroupByOption } from "./hooks/use-task-groups"
// import type { KanbanTask } from "@/lib/types"

// interface GroupSelectorProps {
//   value: GroupByOption
//   onChange: (value: GroupByOption) => void
//   onCustomGroupsChange: (groups: any[]) => void
//   customGroups: any[]
// }

export function FilterGroupSelector ( { value, onChange, onCustomGroupsChange, onCreateCustomGroup, onUpdateCustomGroup, onDeleteCustomGroup, customGroups } ) {
    const [ isCreateGroupOpen, setIsCreateGroupOpen ] = useState( false );
    const [ newGroupName, setNewGroupName ] = useState( "" );
    const [ filterType, setFilterType ] = useState( "status" );
    const [ statusFilter, setStatusFilter ] = useState( [] );
    const [ priorityFilter, setPriorityFilter ] = useState( [] );
    const [ difficultyFilter, setDifficultyFilter ] = useState( [] );
    const [ groupColor, setGroupColor ] = useState( "#3B82F6" );

    const handleCreateGroup = () => {
        if ( !newGroupName.trim() ) return;

        let filter/* : ( task ) => boolean */;

        switch ( filterType ) {
            case "status":
                filter = ( task ) => statusFilter.includes( task.status );
                break;
            case "priority":
                filter = ( task ) => priorityFilter.includes( task.priority || "" );
                break;
            case "difficulty":
                filter = ( task ) => difficultyFilter.includes( task.difficulty || "" );
                break;
            default:
                filter = () => true;
        }

        const newGroupData = {
            // id: `custom-${ Date.now() }`,
            title: newGroupName,
            color: groupColor,
            filters: [
                filterType === "status"
                    ? { status: statusFilter }
                    : filterType === "priority"
                        ? { priority: priorityFilter }
                        : filterType === "difficulty"
                            ? { difficulty: difficultyFilter }
                            : []
            ],
        };

        // onCustomGroupsChange( [ ...customGroups, newGroupData ] );
        onCreateCustomGroup( newGroupData );
        // onChange( "custom" );
        setIsCreateGroupOpen( false );
        resetForm();
    };

    const resetForm = () => {
        setNewGroupName( "" );
        setFilterType( "status" );
        setStatusFilter( [] );
        setPriorityFilter( [] );
        setDifficultyFilter( [] );
        setGroupColor( "#3B82F6" );
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex-1">
                <Select value={ value } onValueChange={ ( val ) => onChange( val ) }>
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Group by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="status" className="text-xs">
                            Status
                        </SelectItem>
                        <SelectItem value="priority" className="text-xs">
                            Priority
                        </SelectItem>
                        <SelectItem value="difficulty" className="text-xs">
                            Difficulty
                        </SelectItem>
                        <SelectItem value="assignee" className="text-xs">
                            Assignee
                        </SelectItem>
                        <SelectItem value="timestampDue" className="text-xs">
                            Due Date
                        </SelectItem>
                        <SelectItem value="tags" className="text-xs">
                            Tags
                        </SelectItem>
                        <SelectItem value="completion" className="text-xs">
                            Completion
                        </SelectItem>
                        { customGroups.length > 0 && (
                            <SelectItem value="custom" className="text-xs">
                                Custom Groups
                            </SelectItem>
                        ) }
                    </SelectContent>
                </Select>
            </div>

            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={ () => setIsCreateGroupOpen( true ) }>
                <PlusCircle className="h-3 w-3 mr-1" />
                Create Group
            </Button>

            <Dialog open={ isCreateGroupOpen } onOpenChange={ setIsCreateGroupOpen }>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Custom Group</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input
                                id="group-name"
                                value={ newGroupName }
                                onChange={ ( e ) => setNewGroupName( e.target.value ) }
                                placeholder="Enter group name..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group-color">Group Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="group-color"
                                    type="color"
                                    value={ groupColor }
                                    onChange={ ( e ) => setGroupColor( e.target.value ) }
                                    className="w-16 h-8 p-1"
                                />
                                <div className="w-8 h-8 rounded-md" style={ { backgroundColor: groupColor } } />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Filter By</Label>
                            <RadioGroup value={ filterType } onValueChange={ ( val ) => setFilterType( val ) }>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="status" id="filter-status" />
                                    <Label htmlFor="filter-status">Status</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="priority" id="filter-priority" />
                                    <Label htmlFor="filter-priority">Priority</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="difficulty" id="filter-difficulty" />
                                    <Label htmlFor="filter-difficulty">Difficulty</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        { filterType === "status" && (
                            <div className="space-y-2">
                                <Label>Status Values</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="status-incomplete"
                                            checked={ statusFilter.includes( "incomplete" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setStatusFilter( [ ...statusFilter, "incomplete" ] );
                                                } else {
                                                    setStatusFilter( statusFilter.filter( ( s ) => s !== "incomplete" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="status-incomplete">To Do</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="status-in-progress"
                                            checked={ statusFilter.includes( "in_progress" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setStatusFilter( [ ...statusFilter, "in_progress" ] );
                                                } else {
                                                    setStatusFilter( statusFilter.filter( ( s ) => s !== "in_progress" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="status-in-progress">In Progress</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="status-completed"
                                            checked={ statusFilter.includes( "completed" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setStatusFilter( [ ...statusFilter, "completed" ] );
                                                } else {
                                                    setStatusFilter( statusFilter.filter( ( s ) => s !== "completed" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="status-completed">Done</Label>
                                    </div>
                                </div>
                            </div>
                        ) }

                        { filterType === "priority" && (
                            <div className="space-y-2">
                                <Label>Priority Values</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="priority-high"
                                            checked={ priorityFilter.includes( "high" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setPriorityFilter( [ ...priorityFilter, "high" ] );
                                                } else {
                                                    setPriorityFilter( priorityFilter.filter( ( p ) => p !== "high" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="priority-high">High</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="priority-medium"
                                            checked={ priorityFilter.includes( "medium" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setPriorityFilter( [ ...priorityFilter, "medium" ] );
                                                } else {
                                                    setPriorityFilter( priorityFilter.filter( ( p ) => p !== "medium" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="priority-medium">Medium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="priority-low"
                                            checked={ priorityFilter.includes( "low" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setPriorityFilter( [ ...priorityFilter, "low" ] );
                                                } else {
                                                    setPriorityFilter( priorityFilter.filter( ( p ) => p !== "low" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="priority-low">Low</Label>
                                    </div>
                                </div>
                            </div>
                        ) }

                        { filterType === "difficulty" && (
                            <div className="space-y-2">
                                <Label>Difficulty Values</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="difficulty-high"
                                            checked={ difficultyFilter.includes( "high" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setDifficultyFilter( [ ...difficultyFilter, "high" ] );
                                                } else {
                                                    setDifficultyFilter( difficultyFilter.filter( ( d ) => d !== "high" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="difficulty-high">Hard</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="difficulty-medium"
                                            checked={ difficultyFilter.includes( "medium" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setDifficultyFilter( [ ...difficultyFilter, "medium" ] );
                                                } else {
                                                    setDifficultyFilter( difficultyFilter.filter( ( d ) => d !== "medium" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="difficulty-medium">Medium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="difficulty-low"
                                            checked={ difficultyFilter.includes( "low" ) }
                                            onCheckedChange={ ( checked ) => {
                                                if ( checked ) {
                                                    setDifficultyFilter( [ ...difficultyFilter, "low" ] );
                                                } else {
                                                    setDifficultyFilter( difficultyFilter.filter( ( d ) => d !== "low" ) );
                                                }
                                            } }
                                        />
                                        <Label htmlFor="difficulty-low">Easy</Label>
                                    </div>
                                </div>
                            </div>
                        ) }
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setIsCreateGroupOpen( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ handleCreateGroup }>Create Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
