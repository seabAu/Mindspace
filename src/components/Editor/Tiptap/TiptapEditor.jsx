import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TiptapToolbar } from "./TiptapToolbar";

// This is a stable, self-contained Tiptap editor component
// using the official libraries.
export function TiptapEditor ( { value, onChange, placeholder } ) {
    const editor = useEditor( {
        extensions: [
            StarterKit.configure( {
                // configure extensions as needed
            } ),
            Underline,
            Placeholder.configure( {
                placeholder: placeholder || "Start typing...",
            } ),
        ],
        content: value,
        onUpdate: ( { editor } ) => {
            if ( onChange ) {
                onChange( editor.getHTML() );
            }
        },
        editorProps: {
            attributes: {
                class:
                    "prose dark:prose-invert prose-sm sm:prose-base min-h-[150px] max-w-none rounded-b-md border border-t-0 border-input bg-transparent px-3 py-2 focus:outline-none",
            },
        },
    } );

    return (
        <div className="rounded-md bg-transparent">
            <TiptapToolbar editor={ editor } />
            <EditorContent editor={ editor } />
        </div>
    );
}
