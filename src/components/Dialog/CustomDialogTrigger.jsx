import React, { useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import clsx from 'clsx';
import { Button } from '../ui/button';

const CustomDialogTrigger = ( {
    header,
    content,
    footer,
    isOpen,
    setIsOpen,
    onOpen,
    onClose,
    children,
    description,
    className,
    onSubmit,
} ) => {

    const [ open, setOpen ] = useState( false );
    const handleClose = () => {
        setOpen( false );
        if ( onClose ) {
            onClose();
        }
    };

    return (
        <Dialog
            onOpenChange={ () => {
                handleClose();
            } }
            open={ open }
            onClose={ onClose }
            className={ `w-full rounded-xl justify-center items-center` }
        // defaultOpen={true}
        >
            <DialogOverlay />

            <DialogTrigger
                asChild
                className={ clsx( '', className ) }
            >
                { children }
                {/* dialogTrigger */ }
            </DialogTrigger>
            <DialogContent
                className="h-screen block sm:h-[440px] overflow-scroll w-full"
            >
                <DialogHeader>
                    <DialogTitle>{ header }</DialogTitle>
                    <DialogDescription>{ description }</DialogDescription>
                </DialogHeader>
                { content }
            </DialogContent>
            <DialogFooter
                className="sm:justify-start"
            >
                <DialogClose asChild>
                    <Button
                        size={ 'sm' }
                        onClick={ () => {
                            handleClose();
                        } }
                    >
                        { `Close` }
                    </Button>
                </DialogClose>
            </DialogFooter>
        </Dialog>
    );
};

export default CustomDialogTrigger;