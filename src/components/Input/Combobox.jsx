// Base code from this answer: //
// https://stackoverflow.com/questions/78454976/shadcn-ui-popover-element-including-commands-in-next-js-14-cant-select-click-t // 

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const statuses = [
    { value: "backlog", label: "Backlog", },
    { value: "todo", label: "Todo", },
    { value: "in progress", label: "In Progress", },
    { value: "done", label: "Done", },
    { value: "canceled", label: "Canceled", },
];

export function ComboBoxResponsive () {
    const [ open, setOpen ] = useState( false );
    const isDesktop = useMediaQuery( "(min-width: 768px)" );
    const [ selectedStatus, setSelectedStatus ] = useState(
        null
    );

    if ( isDesktop ) {
        return (
            <Popover open={ open } onOpenChange={ setOpen }>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[150px] justify-start">
                        { selectedStatus ? <>{ selectedStatus.label }</> : <>+ Set status</> }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <StatusList setOpen={ setOpen } setSelectedStatus={ setSelectedStatus } />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-start">
                    { selectedStatus ? <>{ selectedStatus.label }</> : <>+ Set status</> }
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <StatusList setOpen={ setOpen } setSelectedStatus={ setSelectedStatus } />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function StatusList ( {
    setOpen,
    setSelectedStatus,
} ) {
    return (
        <Command>
            <CommandInput placeholder="Filter status..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    { statuses.map( ( status ) => (
                        <CommandItem
                            key={ status.value }
                            value={ status.value }
                            onSelect={ ( value ) => {
                                setSelectedStatus(
                                    statuses.find( ( priority ) => priority.value === value ) || null
                                );
                                setOpen( false );
                            } }
                        >
                            { status.label }
                        </CommandItem>
                    ) ) }
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
