import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { SheetWrapper } from '@/components/Sheet/Sheet';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as utils from 'akashatools';
import { Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';

const LogNotesDrawer = ( props ) => {
    const {
        isOpen,
        onOpen,
        onClose,
        log,
        setLog,
        onUpdateNotes,
        onCancel,
        className,
    } = props;
    // const [ logData, setLog ] = useState( null );
    const [ notes, setNotes ] = useState( log?.notes );

    // useEffect( () => {
    //     setLog( { ...log } );
    // }, [ log ] );

    console.log( 'LogNotesDrawer :: render :: props = ', props );

    return (
        <>
            <>
                <Sheet
                    open={ isOpen }
                    onOpenChange={ () => {
                        // console.log( "LogTableView :: Sheet :: LogNotesDrawer :: onOpenChange triggered." );
                        if ( onClose ) { onClose(); }
                    } }>
                    <SheetContent className='w-[400px] sm:w-[540px] p-compact h-full max-h-full min-h-full'>
                        <SheetHeader>
                            {/* <SheetTitle>{ `${ log?.title } - Notes` }</SheetTitle> */ }
                            {/* 
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
                            */}
                            <div className={ `sheet-header-container` }>
                                <div
                                    className={ `sheet-header-title` }>{ `{ ${ log?.title } - Notes}` }</div>
                                <div className={ `sheet-header-content w-full ` }>
                                    <Button
                                        variant={ 'ghost' }
                                        size={ 'xs' }
                                        onClick={ () => {
                                            if ( onUpdateNotes ) {
                                                onUpdateNotes(
                                                    log?.notes
                                                        ?.split( '\n' )
                                                        .filter( Boolean ),
                                                );
                                            }
                                        } }>
                                        <Save /> { `Save` }
                                    </Button>
                                    <Button
                                        variant={ 'ghost' }
                                        size={ 'xs' }
                                        onClick={ () => { if ( onUpdateNotes ) { onUpdateNotes( [ '' ] ); } } }
                                    >
                                        <X />
                                        { `Clear` }
                                    </Button>
                                </div>
                            </div>
                        </SheetHeader>
                        <div className='mt-2'>
                            <div className='mt-2'>
                                <Input
                                    name={ 'title' }
                                    type='text'
                                    className={ `w-full h-full min-h-full text-xs p-1 border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:outline-transparent focus-visible:ring-offset-0 focus:outline-transparent focus-visible:border-[1px] border-[1px] !focus-within:border-x-sextary-500` }
                                    defaultValue={ log?.title ?? 'No Title' }
                                    // onChange={ ( e ) => setLog( { ...logData, [ e.target.name ]: e.target.value } ) }
                                    onChange={ ( e ) => {
                                        setLog( {
                                            ...log,
                                            title: e.target.value,
                                        } );
                                    } }
                                />
                                <ReactQuill
                                    theme='snow'
                                    className={ `h-[calc(100vh-240px)]` }
                                    value={
                                        notes &&
                                            utils.val.isValidArray( notes, true )
                                            ? notes?.join( '\n' )
                                            : ''
                                    }
                                    onChange={ ( content ) => {
                                        // if ( onUpdateNotes ) {
                                        //     onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                        // }
                                        if (
                                            log &&
                                            log?.notes &&
                                            log?.notes !== '' &&
                                            log?.notes?.join( '\n' ) !== content
                                        ) {
                                            // onUpdateNotes( content.split( "\n" ).filter( Boolean ) );
                                            // console.log( "Log Table View :: LogNotesDrawer :: QuillEditor :: setContent :: content = ", content );
                                            // setLog( { ...log, notes: content.split( "\n" ).filter( Boolean )  } );
                                            setNotes(
                                                content
                                                    .split( '\n' )
                                                    .filter( Boolean ),
                                            );
                                        }
                                    } }
                                />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        </>
    );
};

export default LogNotesDrawer;
