import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetWrapper } from "@/components/Sheet/Sheet";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as utils from 'akashatools';
import { Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import QuillEditor from "@/features/Note/blocks/QuillEditor/QuillEditor";

const NotesDrawer = ( props ) => {
    const { isOpen, onOpen, onClose, task, setTask, onUpdateNotes, onCancel, className, } = props;
    // const [ taskData, setTask ] = useState( null );
    const [ notes, setNotes ] = useState( task?.notes );

    // if ( !task ) return null;
    // else { setTask( { ...task } ); }

    // useEffect( () => {
    //     setTask( { ...task } );
    // }, [ task ] );

    // console.log( "NotesDrawer :: render :: props = ", props );

    return (
        <>
            <>
                <Sheet
                    open={ isOpen }
                    onOpenChange={ () => {
                        // console.log( "TaskTableView :: Sheet :: NotesDrawer :: onOpenChange triggered." );
                        if ( onClose ) {
                            onClose();
                        }
                    } }
                >
                    <SheetContent className="w-[400px] sm:w-[540px] p-compact h-full max-h-full min-h-full">
                        <SheetHeader>
                            <SheetTitle>{ `${ task?.title } - Notes` }</SheetTitle>
                            <div className={ `sheet-header-container` }>
                                <div className={ `sheet-header-title` }>{ `{ ${ task?.title } - Notes}` }</div>
                                <div className={ `sheet-header-content w-full ` }>
                                    <Button variant={ 'ghost' } size={ 'xs' } onClick={ () => {
                                        if ( onUpdateNotes ) { onUpdateNotes( task?.notes?.split( "\n" ).filter( Boolean ) ); }
                                    } }><Save /> { `Save` }</Button>
                                    <Button variant={ 'ghost' } size={ 'xs' } onClick={ () => {
                                        if ( onUpdateNotes ) { onUpdateNotes( [ '' ] ); }
                                    } }><X />{ `Clear` }</Button>
                                </div>
                            </div>
                        </SheetHeader>
                        <div className="mt-2">
                            <div className="mt-2">
                                <Input
                                    name={ 'title' }
                                    type="text"
                                    className={ `w-full h-full min-h-full text-xs p-1 border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:outline-transparent focus-visible:ring-offset-0 focus:outline-transparent focus-visible:border-[1px] border-[1px] !focus-within:border-x-sextary-500` }
                                    defaultValue={ task?.title ?? 'No Title' }
                                    // onChange={ ( e ) => setTask( { ...taskData, [ e.target.name ]: e.target.value } ) }
                                    onChange={ ( e ) => {
                                        setTask( { ...task, title: e.target.value } );
                                    } }
                                />
                                <ReactQuill
                                    theme="snow"
                                    className={ `h-[calc(100vh-240px)]` }
                                    value={ notes && utils.val.isValidArray( notes, true ) ? notes?.join( "\n" ) : '' }
                                    onChange={ ( content ) => {
                                        // if ( onUpdateNotes ) {
                                        //     onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                        // }
                                        if ( task && task?.notes && task?.notes !== '' && task?.notes?.join( '\n' ) !== content ) {
                                            // onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                            // console.log( "Task Table View :: NotesDrawer :: QuillEditor :: setContent :: content = ", content );
                                            // setTask( { ...task, notes: content.split( "\n" ).filter( Boolean )  } );
                                            setNotes( content.split( "\n" ).filter( Boolean ) );
                                        }
                                    } }
                                />
                                {/* { task && utils.val.isObject( task ) && utils.ao.hasAll( task, [ '_id', 'notes', 'title' ] ) && (

                                    <QuillEditor
                                        className={ `flex flex-col w-full mx-auto rounded-[${ 0.25 }rem]` }
                                        content={ task?.notes?.join( "\n" ) ?? 'No notes yet.' }
                                        setContent={ ( content ) => {
                                            // if ( onUpdateNotes ) {
                                            //     onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                            // }
                                            if ( task && task?.notes && task?.notes !== '' && task?.notes?.join( '\n' ) !== content ) {
                                                // onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                                console.log( "Task Table View :: NotesDrawer :: QuillEditor :: setContent :: content = ", content );
                                                setTask( { ...task, notes: content } );
                                            }
                                        } }
                                    />
                                ) } */}

                            </div>
                            {/* <ReactQuill
                                    theme="snow"
                                    value={ task.notes.join( "\n" ) }
                                    onChange={ ( content ) => {
                                        if ( onUpdateNotes && content !== task?.notes?.join( '\n' ) ) onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                    } }
                                    className="h-[calc(100vh-120px)]"
                                /> */}
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        </>
    );
};

export default NotesDrawer

