"use client";

import { useState, useRef } from "react";
import RichTextEditor, {
    BaseKit,
    Bold,
    BulletList,
    Heading,
    Italic,
    // Import any other extensions you need
} from "reactjs-tiptap-editor";
import { Button } from "@/components/ui/button";

// You can create a separate CSS file for custom styles if needed
// import './Tiptap.css';

// Define the extensions for the editor
const extensions = [
    BaseKit.configure( {
        placeholder: {
            showOnlyCurrent: true,
            placeholder: "Start writing...",
        },
        characterCount: {
            limit: 50000,
        },
    } ),
    Heading,
    Italic,
    Bold,
    BulletList,
];

// Define custom options for the editor instance
const customOptions = {
    onUpdate: ( { editor } ) => console.log( "Content updated" ),
    editable: true,
    autofocus: "start",
};

const DEFAULT_CONTENT = "";

export function ReactTiptapEditor ( { content, onChangeContent } ) {
    const [ localContent, setLocalContent ] = useState( content || DEFAULT_CONTENT );

    // Create a ref to hold the editor instance
    const editorRef = useRef( null );

    // Function to interact with the editor instance via the ref
/*     const handleGetText = () => {
        if ( editorRef.current?.editor ) {
            const text = editorRef.current.editor.getText();
            console.log( "Current editor text:", text );
            alert( "Editor content logged to console." );
        } else {
            console.error( "Editor instance not available." );
        }
    }; */

    const handleChangeContent = ( newContent ) => {
        // Update the local state
        setLocalContent( newContent );
        // Propagate the change to the parent component
        if ( onChangeContent ) {
            onChangeContent( newContent );
        }
    };

    return (
        <div className="space-y-2">
            <RichTextEditor
                // Pass the ref to the component
                // ref={ editorRef }
                output="html"
                content={ localContent }
                onChangeContent={ handleChangeContent }
                extensions={ extensions }
                useEditorOptions={ customOptions }
            // By default, the toolbar is rendered.
            // You can customize it here if needed, but omitting it uses the default.
            />
            {/* <Button variant="outline" size="sm" onClick={ handleGetText }>
                Log Editor Content
            </Button> */}
        </div>
    );
}
