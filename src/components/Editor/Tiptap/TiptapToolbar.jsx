"use client";

import { useCallback } from "react";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Undo,
    Redo,
    Link,
    ImageIcon,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Table,
    Minus,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function TiptapToolbar ( { editor, style } ) {
    const setLink = useCallback( () => {
        const previousUrl = editor.getAttributes( "link" ).href;
        const url = window.prompt( "URL", previousUrl );
        if ( url === null ) return;
        if ( url === "" ) {
            editor.chain().focus().extendMarkRange( "link" ).unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange( "link" ).setLink( { href: url } ).run();
    }, [ editor ] );

    const addImage = useCallback( () => {
        const url = window.prompt( "URL" );
        if ( url ) {
            editor.chain().focus().setImage( { src: url } ).run();
        }
    }, [ editor ] );

    if ( !editor ) return null;

    return (
        <div style={ style }>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "bold" ) }
                onPressedChange={ () => editor.chain().focus().toggleBold().run() }
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "italic" ) }
                onPressedChange={ () => editor.chain().focus().toggleItalic().run() }
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "underline" ) }
                onPressedChange={ () => editor.chain().focus().toggleUnderline().run() }
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "strike" ) }
                onPressedChange={ () => editor.chain().focus().toggleStrike().run() }
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-8" />
            <Toggle
                size="sm"
                pressed={ editor.isActive( "heading", { level: 1 } ) }
                onPressedChange={ () => editor.chain().focus().toggleHeading( { level: 1 } ).run() }
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "heading", { level: 2 } ) }
                onPressedChange={ () => editor.chain().focus().toggleHeading( { level: 2 } ).run() }
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "heading", { level: 3 } ) }
                onPressedChange={ () => editor.chain().focus().toggleHeading( { level: 3 } ).run() }
            >
                <Heading3 className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-8" />
            <Toggle
                size="sm"
                pressed={ editor.isActive( "bulletList" ) }
                onPressedChange={ () => editor.chain().focus().toggleBulletList().run() }
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "orderedList" ) }
                onPressedChange={ () => editor.chain().focus().toggleOrderedList().run() }
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "blockquote" ) }
                onPressedChange={ () => editor.chain().focus().toggleBlockquote().run() }
            >
                <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( "codeBlock" ) }
                onPressedChange={ () => editor.chain().focus().toggleCodeBlock().run() }
            >
                <Code className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-8" />
            <Toggle
                size="sm"
                pressed={ editor.isActive( { textAlign: "left" } ) }
                onPressedChange={ () => editor.chain().focus().setTextAlign( "left" ).run() }
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( { textAlign: "center" } ) }
                onPressedChange={ () => editor.chain().focus().setTextAlign( "center" ).run() }
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( { textAlign: "right" } ) }
                onPressedChange={ () => editor.chain().focus().setTextAlign( "right" ).run() }
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={ editor.isActive( { textAlign: "justify" } ) }
                onPressedChange={ () => editor.chain().focus().setTextAlign( "justify" ).run() }
            >
                <AlignJustify className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-8" />
            <input
                type="color"
                onInput={ ( event ) => editor.chain().focus().setColor( event.target.value ).run() }
                value={ editor.getAttributes( "textStyle" ).color || "#000000" }
                className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                title="Text Color"
            />
            <Toggle
                size="sm"
                pressed={ editor.isActive( "highlight" ) }
                onPressedChange={ () => editor.chain().focus().toggleHighlight().run() }
            >
                <Highlighter className="h-4 w-4" />
            </Toggle>
            <Button size="sm" variant="ghost" onClick={ setLink } className="p-2">
                <Link className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={ addImage } className="p-2">
                <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={ () => editor.chain().focus().insertTable( { rows: 3, cols: 3, withHeaderRow: true } ).run() }
                className="p-2"
            >
                <Table className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={ () => editor.chain().focus().setHorizontalRule().run() }
                className="p-2"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button size="sm" variant="ghost" onClick={ () => editor.chain().focus().undo().run() } className="p-2">
                <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={ () => editor.chain().focus().redo().run() } className="p-2">
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
}
