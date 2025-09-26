import { useEffect, useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as utils from 'akashatools';
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import QuillEditor from "@/features/Note/blocks/QuillEditor/QuillEditor";
import usePlannerStore from "@/store/planner.store";
import usePlanner from "@/lib/hooks/usePlanner";

export function NotesSidebar ( { isOpen = true, onClose, item, fieldKey = 'notes', onUpdateItem, onCloseOnSave = false } ) {
    const { handleUpdateLog } = usePlanner();
    const { setLogsData } = usePlannerStore()
    const [ open, setOpen ] = useState( isOpen );
    const [ notes, setNotes ] = useState( "" );
    const [ title, setTitle ] = useState( "" );
    const [ titleTemp, setTitleTemp ] = useState( "" );
    const [ editingTitle, setEditingTitle ] = useState( false );

    useEffect( () => {
        // Update local open state if parent props change. 
        setOpen( !!isOpen );
    }, [ isOpen ] );

    console.log( "NotesSidebar :: item = ", item, " :: ", "isOpen = ", isOpen );
    useEffect( () => {
        if ( item ) {
            setNotes( utils.val.isValidArray( item?.notes, true ) ? item?.notes?.join( "\n\n" ) : "" );
            setTitle( item?.title );
        } else {
            setNotes( "" );
            setTitle( "" );
        }
    }, [ item ] );

    const handleSave = async () => {
        if ( item ) {
            const notesArray = notes.trim() ? notes.split( "\n\n" ).filter( Boolean ) : [];
            const updatedItem = { ...item, [ fieldKey ]: notes };
            let result = await onUpdateItem( updatedItem );
            // updateTask( item?._id, result );
        }
        if ( onCloseOnSave ) onClose();
    };

    if ( !open ) return null;

    return (
        <Sheet
            // open={ isOpen }
            // open={ item !== null && item !== undefined }
            open={ open }
            onOpenChange={ () => {
                if ( onClose ) { onClose(); }
            } }
        >
            <SheetContent className="w-full max-w-md p-compact h-full max-h-full min-h-full">
                <div className="fixed inset-0 z-50 !bg-black/50 flex justify-end">
                    <div className="bg-background w-full max-w-md h-full flex flex-col shadow-lg">
                        <SheetHeader>
                            <div className="flex items-center justify-between border-b pl-4">
                                <SheetTitle className={ `text-lg font-medium h-8 flex-row p-0 items-center justify-stretch w-full flex-nowrap` }>
                                    { !editingTitle
                                        ? (
                                            <>
                                                <div className={ `h-8 flex-1 flex-grow w-full` }>
                                                    { `Notes: ${ title }` }
                                                </div>
                                                <Button className={ `aspect-square` } variant="ghost" size="sm" onClick={ () => {
                                                    setTitleTemp( title );
                                                    setEditingTitle( true );
                                                } }>
                                                    <Edit className={ `size-4 aspect-square !p-0` } />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className={ `h-8 flex-row p-0 items-center justify-center w-full flex-nowrap ` }>
                                                <Input
                                                    name={ 'title' }
                                                    type="text"
                                                    className={ `w-full h-full min-h-full text-xs p-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:outline-transparent focus-visible:ring-offset-0 focus:outline-transparent focus-visible:border-[1px] border-[1px] !focus-within:border-x-sextary-500 flex-1 !w-full flex-grow` }
                                                    defaultValue={ item?.title ?? 'No Title' }
                                                    onChange={ ( e ) => { setTitleTemp( e.target.value ); } }
                                                />

                                                <div className={ `flex justify-end` }>
                                                    <Button className={ `aspect-square` } variant="outline" size="sm" onClick={ () => {
                                                        setTitleTemp( title );
                                                        setEditingTitle( false );
                                                    } }>
                                                        <X className={ `size-4 aspect-square !p-0` } />
                                                    </Button>
                                                    <Button className={ `aspect-square` } size="sm" onClick={ () => {
                                                        // handleSave
                                                        setTitle( titleTemp );
                                                        setTitleTemp( "" );
                                                        setEditingTitle( false );
                                                    } }>
                                                        <Save className={ `aspect-square` } />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) }
                                </SheetTitle>

                                <Button className={ `aspect-square` } variant="ghost" size="sm" onClick={ onClose }>
                                    <X className={ `size-4 aspect-square !p-0` } />
                                </Button>
                            </div>
                        </SheetHeader>
                        <div className="gap-2">
                            <div className="flex-1 h-full overflow-y-auto max-h-[calc(100vh-72px)]">
                                {/* <MarkdownEditor
                                    value={ notes }
                                    onChange={ setNotes }
                                    placeholder="Add your notes here..."
                                    minHeight={ `calc(100vh - 200px)` }
                                />
                                <ReactQuill
                                    theme="snow"
                                    className={ `h-[calc(100vh-120px)]` }
                                    value={ notes && utils.val.isValidArray( notes, true ) ? notes?.join( "\n" ) : 'No notes yet.' }
                                    onChange={ ( content ) => {
                                        if ( notes && notes !== '' && notes.join( '\n' ) !== content ) {
                                            setNotes( content.split( "\n" ).filter( Boolean ) );
                                        }
                                    } }
                                /> */}
                                <QuillEditor
                                    useThemeDropdown={ false }
                                    useSaveButton={ false }
                                    classNames={ `h-[calc(100vh-72px)] rounded-[${ 0.25 }rem]` }
                                    value={ notes && utils.val.isValidArray( notes, true ) ? notes?.join( "\n" ) : 'No notes yet.' }
                                    setContent={ ( content ) => {
                                        if ( notes && notes !== '' && notes.join( '\n' ) !== content ) {
                                            setNotes( content.split( "\n" ).filter( Boolean ) );
                                        }
                                    } }
                                />
                            </div>

                            <SheetFooter>
                                <div className={ `p-4 border-t flex justify-end gap-2 max-h-16` }>
                                    <Button variant="outline" size="sm" onClick={ onClose }>Cancel</Button>
                                    <Button size="sm" onClick={ handleSave }>Save Notes</Button>
                                </div>
                            </SheetFooter>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
