// Originally from https://v0.dev/chat/apple-notes-clone-V4QCMjALT0o // 
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as utils from 'akashatools';
import { Plus, Search, ChevronLeft, Clock, SaveIcon, ChevronRight } from "lucide-react";
import useNotesStore from "@/store/note.store";
import { Input } from "@/components/ui/input";
import QuillEditor from "@/features/Note/blocks/QuillEditor/QuillEditor";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { twMerge } from "tailwind-merge";
import { buildSelect } from "@/lib/utilities/input";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { getPrettyTime } from "@/lib/utilities/time";
import { Switch } from "@/components/ui/switch";

// export function NotepadWidget2 () {
//     return (
//         <Card>
//             <CardHeader className="py-3 px-4">
//                 <CardTitle className="text-base">Scratchpad</CardTitle>
//             </CardHeader>
//             <CardContent className="gap-3 px-4">
//                 {/* <div className="space-y-1.5">
//                     <Label htmlFor="note-category" className="text-xs">
//                         Category
//                     </Label>
//                     <Select>
//                         <SelectTrigger id="note-category" className="h-9">
//                             <SelectValue placeholder="Select a category" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="work">Work</SelectItem>
//                             <SelectItem value="personal">Personal</SelectItem>
//                             <SelectItem value="project-ideas">Project Ideas</SelectItem>
//                             <SelectItem value="misc">Miscellaneous</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//                 <div className="">
//                     <Label htmlFor="note-content" className="text-xs">
//                         Note
//                     </Label>
//                     <Textarea id="note-content" placeholder="Start typing..." className="resize-y min-h-min" />
//                 </div> */}

//             </CardContent>
//             <CardFooter className="px-4">
//                 <Button className="w-full h-9">Save Note</Button>
//             </CardFooter>
//         </Card>
//     );
// }


// Sample data
const initialNotes = [
    {
        id: "1",
        title: "Shopping List",
        content: "Milk\nEggs\nBread\nCheese\nApples",
        date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
        folder: "notes",
    },
    {
        id: "2",
        title: "Meeting Notes",
        content: "Discuss project timeline\nReview quarterly goals\nAssign new tasks",
        date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
        folder: "notes",
    },
    {
        id: "3",
        title: "Ideas",
        content: "App concept for productivity\nNew workout routine\nWeekend trip planning",
        date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
        folder: "notes",
    },
    {
        id: "4",
        title: "Books to Read",
        content: "1. Atomic Habits\n2. Deep Work\n3. The Psychology of Money\n4. Project Hail Mary",
        date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
        folder: "notes",
    },
    {
        id: "5",
        title: "Travel Plans",
        content: "Flight on May 15th\nHotel reservation\nPlaces to visit:\n- Museum\n- Beach\n- Downtown",
        date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
        folder: "notes",
    },
];

export function NotepadWidget () {
    const {
        stickyNotesData,
        setStickyNotesData,
        recentStickyNotesData,
        setRecentStickyNotesData,
        stickyNotesGroupsData,
        setStickyNotesGroupsData,
        getFoldersOfStickyNotes: getFolders,
    } = useNotesStore();
    const [ isCollapsed, setIsCollapsed ] = useState( false );

    const [ notes, setNotes ] = useState(
        utils.val.isValidArray( stickyNotesData, true )
            ? stickyNotesData
            : []
    );

    // const [ folders, setFolders ] = useState(
    //     utils.val.isValidArray( stickyNotesGroupsData, true )
    //         ? stickyNotesGroupsData
    //         : [ "all" ]
    // );

    const getFoldersOfStickyNotes = ( notes = [] ) => {
        let folders = [ "all" ];
        if ( utils.val.isValidArray( notes, true ) ) {
            notes.forEach( ( note ) => {
                if ( note?.folder ) {
                    let folder = note?.folder;
                    if ( !folders.includes( folder ) ) {
                        folders.push( folder );
                    }
                }
            } );
        }
        return folders;
    };

    const [ selectedNote, setSelectedNote ] = useState( null );
    const [ selectedFolder, setSelectedFolder ] = useState( "notes" );
    const [ availableFolders, setAvailableFolders ] = useState( getFolders() );
    const [ searchQuery, setSearchQuery ] = useState( "" );
    const [ isMobile, setIsMobile ] = useState( false );
    const [ useEditor, setUseEditor ] = useState( false );

    // Check if mobile on mount and window resize
    useEffect( () => {
        const checkIfMobile = () => setIsMobile( window.innerWidth < 768 );
        checkIfMobile();
        window.addEventListener( "resize", checkIfMobile );
        return () => window.removeEventListener( "resize", checkIfMobile );
    }, [] );

    useEffect( () => {
        setNotes( stickyNotesData );
    }, [ stickyNotesData ] );

    // Format date as "Today", "Yesterday", or "MM/DD/YY"
    const formatDate = ( date ) => {
        const today = new Date();
        const yesterday = new Date( today );
        yesterday.setDate( yesterday.getDate() - 1 );

        if ( date.toDateString() === today.toDateString() ) {
            return "Today";
        } else if ( date.toDateString() === yesterday.toDateString() ) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString( "en-US", { month: "numeric", day: "numeric", year: "2-digit" } );
        }
    };

    const filteredNotes = utils.val.isValidArray( notes, true )
        ? notes?.filter(
            ( note ) =>
                searchQuery === "" ||
                note.title.toLowerCase().includes( searchQuery.toLowerCase() ) ||
                note.content.toLowerCase().includes( searchQuery.toLowerCase() ),
        )
        : [];

    const handleNoteSelect = ( note ) => {
        if ( selectedNote && selectedNote.id === note.id ) {
            setSelectedNote( null );
        }
        else {
            setSelectedNote( note );
        }
    };

    const handleNoteChange = ( content ) => {
        console.log( "Notepad :: handleNoteChange :: selectedNote = ", selectedNote );
        if ( !selectedNote ) return;

        const updatedNotes = notes.map( ( note ) => ( note.id === selectedNote?.id ? { ...note, content: content } : note ) );
        // setStickyNotesData( updatedNotes );
        setNotes( updatedNotes );
        setSelectedNote( { ...selectedNote, content } );
    };

    const handleTitleChange = ( title ) => {
        if ( !selectedNote ) return;

        const updatedNotes = notes.map( ( note ) => ( note.id === selectedNote?.id ? { ...note, title: title } : note ) );
        // setStickyNotesData( updatedNotes );
        setNotes( updatedNotes );
        setSelectedNote( { ...selectedNote, title } );
    };

    const handleCreateNote = () => {
        const newNote = {
            id: Date.now().toString(),
            title: "New Note",
            content: "",
            date: new Date(),
            folder: "notes",
        };
        // let updatedNotes = [ newNote, ...( stickyNotesData && stickyNotesData?.length > 0 ? stickyNotesData : [] ) ];
        let updatedNotes = [ newNote, ...( notes ) ];
        // setStickyNotesData( updatedNotes );
        setNotes( updatedNotes );
        setSelectedNote( newNote );
    };

    const handleUpdateNote = ( name, value ) => {
        if ( !selectedNote ) return;
        if ( !selectedNote.hasOwnProperty( name ) ) return;

        const updatedNote = { ...selectedNote, [ name ]: value };
        const updatedNotes = notes.map( ( note ) => ( note.id === selectedNote?.id ? updatedNote : note ) );
        setNotes( updatedNotes );
        setSelectedNote( updatedNote );
    };

    const handleBackToList = () => {
        // Pass selected note back into the array. 
        setNotes( notes.map( ( note ) => ( note.id === selectedNote?.id ? selectedNote : note ) ) );

        // Clear selected note to return to list. 
        setSelectedNote( null );
    };

    const handleSaveAllNotes = () => {
        console.log( 'Notes/Dashboard :: Notepad :: handleSaveAllNotes :: stickyNotesData = ', stickyNotesData, " :: ", "notes = ", notes );

        // Update zustand data store.
        setStickyNotesData( notes );

        // Refresh folders list.
        setAvailableFolders( getFolders( notes ) );
    };

    const handleDeleteNote = () => {
        if ( !selectedNote ) return;

        const updatedNotes = notes.filter( ( note ) => note.id !== selectedNote?.id );
        setNotes( updatedNotes );
        setStickyNotesData( updatedNotes );
        setSelectedNote( null );
    };

    const buildNotesList =
        useCallback(
            ( notes ) => (
                <ul className={ `space-y-1 py-1` }>
                    { notes?.length > 0 ? (
                        notes
                            ?.filter( ( note ) => ( !utils.val.isDefined( selectedFolder ) ) || selectedFolder === 'all' || ( note.folder === selectedFolder ) )
                            ?.map( ( note ) => (
                                <li key={ note?.id } className={ `border-b border-t border-gray-800 rounded-lg px-2 py-3 gap-2 ${ selectedNote?.id === ( note?._id || note?.id )
                                    ? "bg-brand-primaryPurple/40"
                                    : "hover:bg-brand-primaryPurple/20 items-center"
                                    }` }>
                                    <Button
                                        variant={ `ghost` }
                                        size={ `sm` }
                                        className={ `w-full px-2 py-2 text-left justify-stretch hover:bg-transparent` }
                                        onClick={ () => handleNoteSelect( note ) }
                                    >
                                        <div className="flex text-xs text-gray-400 justify-between gap-2 w-full">

                                            <div className={ `scratchpad-item-header flex flex-col w-full` }>
                                                <div className={ `flex flex-row justify-between w-full` }>
                                                    <h3 className={ `scratchpad-item-header-title mb-1 font-medium text-white` }>
                                                        { note?.title }
                                                    </h3>
                                                    <span className={ `scratchpad-item-header-date flex-row flex-nowrap items-center` }>
                                                        <Clock className={ `mr-1 aspect-square !size-3` } />

                                                        <div className={ `flex flex-col justify-between items-start` }>
                                                            <p className={ `font-thin text-xs text-center capitalize font-sans` }>
                                                                { formatDate( new Date( note?.date ) ) }
                                                            </p>

                                                            <p className={ `font-thin text-xs text-center capitalize font-sans` }>
                                                                { getPrettyTime( new Date( note?.date ) ) }
                                                            </p>
                                                        </div>
                                                    </span>
                                                </div>
                                                <div className="scratchpad-item-blurb-text flex flex-row w-full justify-start items-center">
                                                    <span className="mx-1">•</span>
                                                    <span className="truncate">
                                                        { note?.content?.substring( 0, 30 ) }
                                                        { note?.content?.length > 30 ? "..." : "" }
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    </Button>
                                </li>
                            ) )
                    ) : (
                        <li className="flex h-32 items-center justify-center text-gray-500">No notes found</li>
                    ) }
                </ul>
            )
            , [ notes, stickyNotesData, selectedNote, selectedFolder ] );

    // Mobile view: show either notes list or editor
    if ( isMobile ) {
        return (
            <Card className={ `gap-3 !px-2 w-full flex-grow text-white p-2 overflow-hidden !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] !rounded-xl` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 7.5 ) }rem`,
                } }>
                <Collapsible defaultOpen={ !isCollapsed } className={ `group/collapsible w-full` }>
                    <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                        <CollapsibleTrigger className={ `flex flex-row w-full items-center justify-stretch` }>
                            <ChevronRight className={ `transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                            <CardTitle className="text-base">Scratchpad</CardTitle>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent className={ `w-full h-full flex-1` }>
                        <div className={ twMerge( 'space-y-1', isCollapsed && 'hidden', ) }>
                            <div className='flex justify-between items-center'>
                                <CardContent className={ `w-full` }>
                                    <ScrollArea
                                        // className={ twMerge(
                                        //     `scroll-area-container task-interface-container !w-full !max-w-full !h-full !max-h-[75vh] !p-2 mb-0 gap-0`,
                                        //     `rounded-[${ 0.5 }rem] relative inset-0`,
                                        //     `border-[0.200rem] border-primary-purple-50/10`,
                                        // ) }
                                        className={ `!w-full !max-w-full !h-full !max-h-[75vh] !p-2 mb-0 gap-0` }
                                    >
                                        { selectedNote ? (
                                            // Note editor view (mobile)
                                            <div className="flex h-full w-full flex-col">
                                                <div className="border-b pb-1 mb-2 w-full border-gray-800">
                                                    <div className="flex items-center justify-between w-full">
                                                        <Button
                                                            variant={ 'primary' }
                                                            onClick={ handleBackToList }
                                                            className="flex items-center text-sm text-yellow-500"
                                                            aria-label="Back to notes list"
                                                        >
                                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                                            Notes
                                                        </Button>
                                                        <div className="flex items-center justify-end">
                                                            <Switch
                                                                defaultChecked={ useEditor }
                                                                onCheckedChange={ ( checked ) =>
                                                                    setUseEditor( checked || !useEditor )
                                                                }
                                                            />
                                                            <Button
                                                                variant={ 'outline' }
                                                                className="w-auto rounded-lg bg-transparent bg-blue-700 py-2 text-black hover:bg-orange-700"
                                                                aria-label="Save Notes"
                                                                onClick={ ( e ) => {
                                                                    e.preventDefault();
                                                                    handleBackToList();
                                                                    handleSaveAllNotes();
                                                                } }
                                                            >
                                                                <SaveIcon /> Save Notes
                                                            </Button>
                                                            <Button onClick={ handleDeleteNote } className="text-sm text-red-500" aria-label="Delete note">
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        className="w-full bg-transparent text-xl font-semibold text-yellow-500 focus:outline-none"
                                                        value={ selectedNote?.title }
                                                        onChange={ ( e ) => handleTitleChange( e.target.value ) }
                                                    />
                                                    <div className="flex items-center justify-start flex-row">
                                                        <Clock className={ `mr-1 aspect-square !size-3` } />
                                                        <p className="text-xs text-gray-400 font-sans">
                                                            { formatDate( new Date( selectedNote?.date ) ) }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto">
                                                    { useEditor ?
                                                        (
                                                            <QuillEditor
                                                                className={ `flex flex-col items-stretch justify-start w-full h-full rounded-xl` }
                                                                placeholder={ selectedNote?.title }
                                                                useThemeDropdown={ false }
                                                                useSaveButton={ false }
                                                                content={ selectedNote?.content ?? '' }
                                                                setContent={ ( data ) => {
                                                                    // Store the data in the content. 
                                                                    if ( data && selectedNote?.content && selectedNote?.content !== data ) {
                                                                        console.log( "Notebad :: QuillEditor Markdown :: setContent :: data = ", data, " :: ", "value = ", selectedNote?.content );
                                                                        handleNoteChange( data );
                                                                    }
                                                                } }
                                                            />
                                                        ) : (
                                                            <Textarea
                                                                className="note-editor-content h-full w-full flex-grow-5 resize-none bg-transparent text-white focus:outline-none min-h-[20rem] flex-1 p-4 md:min-h-[300px] lg:min-h-[300px]"
                                                                value={ selectedNote?.content }
                                                                onChange={ ( e ) => handleNoteChange( e.target.value ) }
                                                                placeholder="Type something..."
                                                                spellCheck="true"
                                                                autoCapitalize="sentences"
                                                                autoCorrect="on"
                                                                resize={ true }
                                                            />
                                                        ) }
                                                </div>
                                            </div>
                                        ) : (
                                            // Notes list view (mobile)
                                            <div className="flex h-full w-full flex-1 flex-col">
                                                <div className="border-b border-gray-800 p-2 w-full">
                                                    <h1 className="gap-2 text-xl font-semibold text-yellow-500">Notes</h1>
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                        <Input
                                                            type="text"
                                                            placeholder="Search"
                                                            className="w-max rounded-md py-2 pl-8 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none"
                                                            value={ searchQuery }
                                                            onChange={ ( e ) => setSearchQuery( e.target.value ) }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex h-12 items-center justify-between border-b border-gray-800 px-4 border">
                                                    <span className="text-sm text-gray-400">{ filteredNotes.length } Notes</span>
                                                    <Button
                                                        onClick={ handleCreateNote }
                                                        className="rounded-full p-2 text-yellow-500"
                                                        aria-label="Create new note"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto momentum-scroll w-full">
                                                    { buildNotesList( filteredNotes ) }
                                                </div>
                                            </div>
                                        ) }

                                        {/* <ScrollBar orientation="horizontal" />
                                            <Scrollbar orientation="vertical" />
                                        */}
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="px-4">
                                </CardFooter>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        );
    }

    // Desktop view: simplified two-panel layout
    return (
        <Card className="flex flex-col w-full text-white border-gray-800">
            <Collapsible defaultOpen={ !isCollapsed } className='group/collapsible'>
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                    <CollapsibleTrigger className={ `flex flex-row w-full items-center justify-stretch` }>
                        <ChevronRight className={ `self-start Stransition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                        <div className={ `flex flex-col w-full justify-center items-stretch` }>
                            <CardTitle className="gap-2 text-left text-xl font-semibold text-yellow-500">Scratchpad</CardTitle>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent className={ `w-full h-full flex-1` }>
                    <div className={ twMerge( 'space-y-1', isCollapsed && 'hidden', ) }>
                        <CardContent className={ `!w-full !px-4 !py-2` }>
                            <div className="w-full grid grid-flow-col grid-cols-4 justify-stretch items-center">
                                <div className="relative col-span-3">
                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full rounded-md py-2 pl-8 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none"
                                        value={ searchQuery }
                                        onChange={ ( e ) => setSearchQuery( e.target.value ) }
                                    />
                                </div>
                                <div className="relative col-span-1">
                                    { buildSelect( {
                                        placeholder: 'Folders',
                                        opts: utils.val.isValidArray( availableFolders, true )
                                            ? ( availableFolders.map( ( folder ) => ( { name: caseCamelToSentence( folder ), value: folder, id: folder } ) ) )
                                            : ( [ "notes" ] ),
                                        value: selectedFolder || 'none',
                                        key: 'folder',
                                        initialData: selectedFolder || 'none',
                                        handleChange: ( key, value ) => ( setSelectedFolder( value ) ),
                                        className: '',
                                        multiple: true,
                                        required: false,
                                        disabled: false,
                                    } ) }
                                </div>
                            </div>
                            <div className="flex h-12 items-center justify-between border-b border-gray-800 px-4">
                                <span className="text-sm text-gray-400">{ filteredNotes.length } Notes</span>
                                <Button
                                    variant={ `outline` }
                                    size={ `sm` }
                                    onClick={ handleCreateNote }
                                    className="rounded-full p-2 text-yellow-500 hover:bg-brand-primaryPurple/20"
                                    aria-label="Create new note"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="h-[calc(100%-8.5rem)] overflow-y-auto momentum-scroll">
                                { buildNotesList( filteredNotes ) }
                            </div>
                            {/* Note editor panel (right) */ }
                            <div className="!p-2 flex-1 overflow-hidden">
                                { selectedNote ? (
                                    <div className="flex h-full flex-col">
                                        <CardContent className="border-b border-gray-800 px-2">
                                            <div className="flex items-center justify-between">

                                                {/* Title */ }
                                                <Input
                                                    type="text"
                                                    className="w-full bg-transparent text-2xl font-semibold text-yellow-500 focus:outline-none"
                                                    value={ selectedNote?.title }
                                                    // onChange={ ( e ) => handleTitleChange( e.target.value ) }
                                                    onChange={ ( e ) => handleUpdateNote( 'title', e.target.value ) }
                                                />

                                                {/* Folder */ }
                                                <Input
                                                    type="text"
                                                    className="w-full bg-transparent text-2xl font-semibold text-yellow-500 focus:outline-none"
                                                    value={ selectedNote?.folder }
                                                    onChange={ ( e ) => {
                                                        handleUpdateNote( 'folder', e.target.value );
                                                    } }
                                                />

                                                {/* Delete button */ }
                                                <Button
                                                    variant={ 'primary' }
                                                    onClick={ handleDeleteNote }
                                                    className="text-sm text-red-500 ml-4"
                                                    aria-label="Delete note"
                                                >
                                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-400">{ formatDate( new Date( selectedNote?.date ) ) }</p>
                                        </CardContent>
                                        <CardFooter className="flex-1 overflow-y-auto px-2 py-2">
                                            <Textarea
                                                className="note-editor-content h-full w-full resize-none bg-transparent text-lg text-white focus:outline-none"
                                                value={ selectedNote?.content }
                                                // onChange={ ( e ) => handleNoteChange( e.target.value ) }
                                                onChange={ ( e ) => handleUpdateNote( 'content', e.target.value ) }
                                                placeholder="Type something..."
                                                spellCheck="true"
                                                autoCapitalize="sentences"
                                                autoCorrect="on"
                                            />
                                        </CardFooter>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        <div className="text-center flex-col w-full justify-stretch items-stretch h-full">
                                            <p className="">Select a note or create a new one</p>
                                        </div>
                                    </div>
                                ) }
                            </div>

                        </CardContent>
                        <CardFooter className="">
                            <Button
                                variant={ 'outline' }
                                onClick={ ( e ) => {
                                    e.preventDefault();
                                    handleCreateNote();
                                } }
                                className="w-auto rounded-lg bg-transparent bg-blue-700 py-2 text-black hover:bg-orange-700"
                            >
                                Create New Note
                            </Button>
                            <Button
                                variant={ 'outline' }
                                className="w-auto rounded-lg bg-transparent bg-blue-700 py-2 text-black hover:bg-orange-700"
                                onClick={ ( e ) => {
                                    e.preventDefault();
                                    handleSaveAllNotes();
                                } }>
                                <SaveIcon /> Save Notes
                            </Button>
                        </CardFooter>
                    </div>
                </CollapsibleContent>
            </Collapsible>

        </Card>
    );
}

export function NoteNavWrapper ( {
    conditional = false,
    componentTrue = <></>,
    componentFalse = <></>,
}, ...props ) {

}