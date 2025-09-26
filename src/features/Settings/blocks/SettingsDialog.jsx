import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import SettingsMenu from "../views/SettingsMenu";

export function SettingsDialog ( props ) {
    const {
        triggerLabel = "Open",
        user = {},
        setUser,
        isOpen = false,
        setIsOpen,
    } = props;

    const [ open, setOpen ] = useState( isOpen );

    useEffect( () => {
        setOpen( isOpen );
    }, [ isOpen ] );

    return (
        <Dialog
            open={ isOpen }
            onOpenChange={ setIsOpen }
            onClose={ () => { setIsOpen( false ); } }
        >
            <DialogOverlay onClick={ () => { setIsOpen( false ); } } />
            <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">
                    Customize your settings here.
                </DialogDescription>

                <SettingsMenu />

                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
