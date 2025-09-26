// https://github.com/mohammedmohsin203/Notion-Clone-7/blob/main/components/providers/ModalProvider.jsx // 
import React, { useCallback, useEffect, useState } from 'react';
import PlannerDialogWrapper from "@/features/Planner/components/dialog/PlannerDialogWrapper";
import NoteDialogWrapper from "@/features/Note/blocks/Dialog/NoteDialogWrapper";

// import { useEffect, useState } from "react";

// import SettingsModal from "@/components/modals/SettingsModal";
// import CoverImageModal from "@/components/modals/CoverImageModal";

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
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/button';
import * as utils from 'akashatools';
import { twMerge } from 'tailwind-merge';
import useTasksStore from '@/store/task.store.js';
import useNotesStore from '@/store/note.store.js';
import useGlobalStore from '@/store/global.store.js';
import { DIALOG_TYPE_CLOSE_ICONS, DIALOG_TYPE_CLOSE_NAMES, DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPE_SUBMIT_NAMES, DIALOG_TYPES } from '../config/config.js';
import FormGenerator from '@/components/Form/FormGenerator.jsx';
import { X } from 'lucide-react';
import TaskDialogWrapper from '@/features/Todo/blocks/Dialog/TaskDialogWrapper.jsx';



const ModalContext = createContext();

const ModalProvider = () => {
    const [ isMounted, setIsMounted ] = useState( false );
    const [ isOpen, setIsOpen ] = useState( false );
    const value = {
        isMounted, setIsMounted,
        isOpen, setIsOpen,
    };

    useEffect( () => {
        setIsMounted( true );
    }, [] );

    if ( !isMounted ) {
        return null;
    }

    return (
        <ModalContext.Provider { ...props } value={ value }>
            { children }
            <NoteDialogWrapper />
            <PlannerDialogWrapper />
            <TaskDialogWrapper />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext( ModalContext );

    if ( context === undefined )
        throw new Error( "useModal must be used within a ModalProvider" );

    return context;
};

export default ModalProvider;


/* export const ModalProvider = () => {
    const [ isMounted, setIsMounted ] = useState( false );

    useEffect( () => {
        setIsMounted( true );
    }, [] );

    if ( !isMounted ) {
        return null;
    }

    return (
        <>
            <NoteDialogWrapper />
            <PlannerDialogWrapper />
            <TaskDialogWrapper />
        </>
    );
}; */
