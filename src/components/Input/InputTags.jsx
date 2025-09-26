// Source: https://v0.dev/community/tag-input-shadcn-RdfiUWQhgX8

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, ChevronsUpDown, Search, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Utility function to merge refs
function mergeRefs ( ...refs ) {
    return ( value ) => {
        refs.forEach( ( ref ) => {
            if ( typeof ref === "function" ) {
                ref( value );
            } else if ( ref != null ) {
                ; ( ref ).current = value;
            }
        } );
    };
}

// export interface InputTagsProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
//     value[];
//     onChange: ( value[] ) => void;
//     placeholder?;
//     onBlur?: React.FocusEventHandler<HTMLInputElement>;
//     disabled?: boolean;
//     availableTags?: { id?; name; }[];
//     onManageAllTags?: () => void;
//     showManageOption?: boolean;
//     maxTags?: number;
//     allowDuplicates?: boolean;
//     variant?: "default" | "outline";
// }

const InputTags = React.forwardRef(
    (
        {
            className,
            value = [],
            onChange,
            placeholder = "Add tags...",
            disabled = false,
            availableTags = [],
            onManageAllTags,
            showManageOption = true,
            maxTags,
            allowDuplicates = false,
            variant = "default",
            ...props
        },
        ref,
    ) => {
        const [ open, setOpen ] = React.useState( false );
        const [ inputValue, setInputValue ] = React.useState( "" );
        const commandRef = React.useRef( null );
        const inputRef = React.useRef( null );

        const allTags = React.useMemo( () => {
            const tagMap = new Map();
            availableTags.forEach( ( tag ) => {
                tagMap.set( tag.name, tag );
            } );
            value.forEach( ( tagName ) => {
                if ( !tagMap.has( tagName ) ) {
                    tagMap.set( tagName, { name: tagName } );
                }
            } );
            return Array.from( tagMap.values() );
        }, [ availableTags, value ] );

        const addTag = ( tagName ) => {
            if ( !tagName.trim() ) return;
            if ( !allowDuplicates && value.includes( tagName ) ) return;
            if ( maxTags && value.length >= maxTags ) return;
            onChange( [ ...value, tagName ] );
            setInputValue( "" );
        };

        const removeTag = ( tagToRemove ) => {
            onChange( value.filter( ( tag ) => tag !== tagToRemove ) );
        };

        const filteredTags = React.useMemo( () => {
            const input = inputValue.toLowerCase().trim();
            if ( !input ) return allTags;
            return allTags.filter( ( tag ) => tag.name.toLowerCase().includes( input ) );
        }, [ allTags, inputValue ] );

        const handleKeyDown = ( e ) => {
            const input = inputValue.trim();
            if ( e.key === "Enter" && input && !filteredTags.some( ( t ) => t.name.toLowerCase() === input.toLowerCase() ) ) {
                e.preventDefault();
                addTag( input );
            }
        };

        const isMaxReached = maxTags ? value.length >= maxTags : false;

        return (
            <Popover
                open={ open }
                onOpenChange={ ( openState ) => {
                    setOpen( openState );
                } }
            >
                <PopoverTrigger asChild>
                    <div
                        className={ cn(
                            "max-w-xs relative flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-colors",
                            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                            variant === "outline" && "border-2",
                            disabled && "cursor-not-allowed opacity-50",
                            isMaxReached && "border-orange-200 bg-orange-50",
                            className,
                        ) }
                        onClick={ () => {
                            if ( !disabled && !isMaxReached ) {
                                setOpen( true );
                            }
                        } }
                    >
                        { value.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                { value.map( ( tag, index ) => (
                                    <Badge key={ `${ tag }-${ index }` } variant="secondary" className="h-6 gap-1 px-2 text-xs font-medium">
                                        { tag }
                                        { !disabled && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-3.5 w-3.5 rounded-full p-0 hover:bg-muted"
                                                onClick={ ( e ) => {
                                                    e.stopPropagation();
                                                    removeTag( tag );
                                                } }
                                            >
                                                <X className="h-2.5 w-2.5" />
                                                <span className="sr-only">Remove { tag }</span>
                                            </Button>
                                        ) }
                                    </Badge>
                                ) ) }
                            </div>
                        ) : (
                            <span className="text-muted-foreground">{ placeholder }</span>
                        ) }

                        { maxTags && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                { value.length }/{ maxTags }
                            </div>
                        ) }

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex shrink-0 opacity-60">
                            <Search className="h-3.5 w-3.5 mr-1" />
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" side="bottom">
                    <Command shouldFilter={ false } ref={ commandRef } onKeyDown={ handleKeyDown }>
                        <CommandInput
                            placeholder="Search tags..."
                            value={ inputValue }
                            onValueChange={ setInputValue }
                            className="h-9"
                            ref={ mergeRefs( inputRef, ref ) }
                            disabled={ isMaxReached }
                        />
                        <CommandList className="max-h-64">
                            <CommandEmpty className="py-2">
                                { inputValue.trim() !== "" && !isMaxReached && (
                                    <button
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent font-medium"
                                        onClick={ () => addTag( inputValue ) }
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Create tag &quot;{ inputValue }&quot;
                                    </button>
                                ) }
                                { isMaxReached && (
                                    <p className="p-2 text-sm text-center text-muted-foreground">
                                        Maximum number of tags reached ({ maxTags })
                                    </p>
                                ) }
                                { inputValue.trim() === "" && !isMaxReached && (
                                    <p className="p-2 text-sm text-center text-muted-foreground">No tags found.</p>
                                ) }
                            </CommandEmpty>
                            { filteredTags.length > 0 && !isMaxReached && (
                                <CommandGroup>
                                    { filteredTags.map( ( tag ) => (
                                        <CommandItem
                                            key={ tag.name }
                                            value={ tag.name }
                                            onSelect={ () => {
                                                if ( value.includes( tag.name ) ) {
                                                    removeTag( tag.name );
                                                } else {
                                                    addTag( tag.name );
                                                }
                                            } }
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <Check className={ cn( "h-4 w-4", value.includes( tag.name ) ? "opacity-100" : "opacity-0" ) } />
                                                <span className="flex-1">{ tag.name }</span>
                                            </div>
                                        </CommandItem>
                                    ) ) }
                                </CommandGroup>
                            ) }
                            { filteredTags.length > 8 && (
                                <div className="sticky bottom-0 border-t border-dashed py-1.5 px-2 text-xs text-center text-muted-foreground italic bg-background/80 backdrop-blur-sm">
                                    Scroll for more tags...
                                </div>
                            ) }
                            { showManageOption && onManageAllTags && (
                                <CommandGroup className="border-t border-dashed">
                                    <CommandItem
                                        value="__manage_all_tags__"
                                        onSelect={ () => {
                                            setOpen( false );
                                            if ( onManageAllTags ) {
                                                onManageAllTags();
                                            }
                                        } }
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Settings className="h-4 w-4" />
                                            <span className="font-medium">Manage Tags</span>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>
                            ) }
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);

InputTags.displayName = "InputTags";

export { InputTags };



// Example usage: 
/*  "use client"

    import { useState } from "react"
    import { InputTags } from "@/components/input-tags"
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
    import { Badge } from "@/components/ui/badge"
    import { Button } from "@/components/ui/button"
    import { toast } from "@/hooks/use-toast"
    import { Separator } from "@/components/ui/separator"

    // Sample available tags for different categories
    const availableSkillTags = [
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "Next.js" },
    { id: "4", name: "Node.js" },
    { id: "5", name: "Python" },
    { id: "6", name: "JavaScript" },
    { id: "7", name: "CSS" },
    { id: "8", name: "HTML" },
    { id: "9", name: "Tailwind CSS" },
    { id: "10", name: "GraphQL" },
    { id: "11", name: "Vue.js" },
    { id: "12", name: "Angular" },
    { id: "13", name: "Svelte" },
    { id: "14", name: "Docker" },
    { id: "15", name: "Kubernetes" },
    ]

    const availableInterestTags = [
    { id: "1", name: "Web Development" },
    { id: "2", name: "Mobile Apps" },
    { id: "3", name: "AI/ML" },
    { id: "4", name: "Data Science" },
    { id: "5", name: "DevOps" },
    { id: "6", name: "UI/UX Design" },
    { id: "7", name: "Blockchain" },
    { id: "8", name: "Gaming" },
    { id: "9", name: "IoT" },
    { id: "10", name: "Cybersecurity" },
    ]

    const availableProjectTags = [
    { id: "1", name: "Frontend" },
    { id: "2", name: "Backend" },
    { id: "3", name: "Full Stack" },
    { id: "4", name: "Mobile" },
    { id: "5", name: "Desktop" },
    { id: "6", name: "API" },
    { id: "7", name: "Database" },
    { id: "8", name: "Testing" },
    ]

    export default function InputTagsDemo() {
    const [skillTags, setSkillTags] = useState<string[]>(["React", "TypeScript"])
    const [interestTags, setInterestTags] = useState<string[]>(["Web Development"])
    const [projectTags, setProjectTags] = useState<string[]>([])
    const [customTags, setCustomTags] = useState<string[]>([])
    const [disabledTags, setDisabledTags] = useState<string[]>(["Read-only", "Disabled"])
    const [limitedTags, setLimitedTags] = useState<string[]>(["Tag 1", "Tag 2"])

    const handleManageSkills = () => {
        toast({
            title: "Manage Skills",
            description: "This would open a skills management dialog.",
        })
    }

    const handleManageInterests = () => {
        toast({
            title: "Manage Interests",
            description: "This would open an interests management dialog.",
        })
    }

    const handleManageProjects = () => {
        toast({
            title: "Manage Project Tags",
            description: "This would open a project tags management dialog.",
        })
    }

    const resetAll = () => {
        setSkillTags(["React", "TypeScript"])
        setInterestTags(["Web Development"])
        setProjectTags([])
        setCustomTags([])
        setLimitedTags(["Tag 1", "Tag 2"])
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <InputTags 
                value={skillTags}
                onChange={setSkillTags}
                placeholder="Add your skills..."
                availableTags={availableSkillTags}
                onManageAllTags={handleManageSkills}
                showManageOption={true}
            />
        </div>
    )
    }

*/