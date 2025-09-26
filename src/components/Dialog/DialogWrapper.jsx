import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowDownUp, Star, Dot } from 'lucide-react';
import * as utils from 'akashatools';
import { twMerge } from 'tailwind-merge';

export function DialogWrapper ( props ) {
    const {
        header,
        title = '',
        description = '',
        trigger,
        content,
        footer,
        closeButton,
        listData,
        open,
        setOpen,
        onOpenChange,
        onOpen,
        onClose,
        children,
        className = '',
        onSubmit,
    } = props;

    const [ isOpen, setIsOpen ] = useState( open );

    const handleClose = () => {
        setOpen( false );
        if ( onClose ) {
            onClose();
        }
    };

    return (
        <Dialog
            open={ open }
            // onOpenChange={ onOpenChange }
            onOpenChange={ onClose }
        >
            <DialogOverlay />

            { trigger && (
                <DialogTrigger
                    asChild
                    className={ clsx( '', className ) }
                >
                    { trigger }
                </DialogTrigger>
            ) }

            <DialogContent
                className={ twMerge(
                    `sm:max-w-md bg-black/40 backdrop-blur-xl border border-white/10`,
                    `h-screen block sm:h-[440px] overflow-scroll w-full`,
                    // `flex flex-col max-h-modal w-full sm:max-w-[${ 100 }%] max-h-modal rounded-xl overflow-y-auto `,
                ) }
            >
                <DialogHeader>
                    { title && (
                        <DialogTitle className={ `text-2xl text-white/90` }>
                            { title }
                        </DialogTitle>
                    ) }
                    { description && (
                        <DialogDescription className={ `text-white/70` }>
                            { description }
                        </DialogDescription>
                    ) }
                    { header && header }
                </DialogHeader>

                { utils.val.isValidArray( listData, true ) && (
                    listData.map( ( item, index ) => {
                        let listItemIcon = item?.icon ?? Dot;
                        let listItemTitle = item?.title ?? '';
                        let listItemDescription = item?.description ?? '';
                        return (
                            <div className={ `space-y-6 py-4` }>
                                <div className={ `flex items-start gap-4` }>
                                    <div className={ `p-2 rounded-lg bg-purple-500/10 text-purple-500` }>
                                        {/* <ClipboardList className={ `w-5 h-5` } /> */ }
                                        { listItemIcon && <listItemIcon className={ `w-5 h-5` } /> }
                                    </div>
                                    <div>
                                        { listItemTitle && (
                                            <h3 className={ `font-medium text-white/90 mb-1` }>
                                                { listItemTitle }
                                            </h3>
                                        ) }
                                        { listItemDescription && (
                                            <p className={ `text-sm text-white/70` }>
                                                { listItemDescription }
                                            </p>
                                        ) }
                                    </div>
                                </div>
                            </div>
                        );
                    } )
                ) }

                { ( footer || closeButton ) && (
                    <DialogFooter className={ `sm:justify-start` }>
                        { footer }
                        <div className={ `flex justify-end` }>
                            {
                                closeButton
                                    ? (
                                        <DialogClose
                                            asChild
                                        >
                                            { closeButton }
                                        </DialogClose>
                                    )
                                    : (
                                        <DialogClose
                                            asChild
                                        >
                                            <Button
                                                className={ `bg-purple-600 hover:bg-purple-500 text-white select-none` }
                                                variant='outline'
                                                size={ 'sm' }
                                                // onClick={ () => { handleClose(); } }
                                                onClick={ () => { onOpenChange( false ); } }
                                            >
                                                { `Close` }
                                            </Button>
                                        </DialogClose>
                                    )
                            }
                        </div>

                    </DialogFooter>
                ) }

            </DialogContent>
        </Dialog>
    );
}
