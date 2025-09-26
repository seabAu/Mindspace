import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import * as utils from 'akashatools';

const SHEET_SIDES = [ "top", "right", "bottom", "left" ];

export function SheetWrapper ( props ) {
    const {
        side,
        title,
        trigger,
        description,
        height,
        width,
        children,
        header,
        contents,
        footer,
        // layout,
        className,
        isOpen,
        onClose,
    } = props;

    return (
        // <div className={ `grid grid-cols-2 gap-2 ${ className }` }>
        <div
            className={ `settings-menu w-full justify-center items-stretch overflow-auto ${ className }` }
        >
            {/* { SHEET_SIDES.map( ( side ) => ( */ }
            { side && (
                <Sheet
                    key={ side }
                    open={ isOpen }
                    onOpenChange={ () => { if ( onClose ) onClose(); } }
                >
                    <SheetTrigger asChild>
                        {/* <Button variant="outline"> */ }
                        { trigger ? trigger : side }
                        {/* </Button> */ }
                    </SheetTrigger>
                    <SheetContent
                        side={ side }
                        className={ `w-[${ width ? width : 400 }px] sm:w-[${ width ? width * 1.25 : 520 }px] h-[${ height ? height : 400 }px] sm:h-[${ height ? height * 1.25 : 520 }px]` }
                    >
                        <SheetHeader>
                            { title && ( <SheetTitle>{ title }</SheetTitle> ) }
                            { description && ( <SheetDescription>{ description }</SheetDescription> ) }
                            { header && ( header ) }
                        </SheetHeader>
                        {/* 
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input id="name" value="Pedro Duarte" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Username
                                </Label>
                                <Input id="username" value="@peduarte" className="col-span-3" />
                            </div>
                        </div>
                        */}
                        { contents && ( contents ) }
                        { children && ( children ) }
                        <SheetFooter>
                            { footer && ( footer ) }
                            <SheetClose asChild>
                                <Button variant={ `ghost` } size={ `sm` }>Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            ) }
            {/* ) ) } */ }
        </div>
    );
}
