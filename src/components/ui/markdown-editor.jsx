import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, List, ListOrdered, Heading, Link, ImageIcon, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import * as utils from 'akashatools';

/* interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
} */

export function MarkdownEditor ( {
    value,
    onChange,
    placeholder = "Write your content here...",
    minHeight = "150px",
    maxHeight = "300px",
} ) {
    const [ activeTab, setActiveTab ] = useState( "write" );

    const insertMarkdown = ( markdownSyntax, selectionOffset = 0 ) => {
        const textarea = document.getElementById( "markdown-textarea" );
        if ( !textarea ) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring( start, end );

        const beforeText = textarea.value.substring( 0, start );
        const afterText = textarea.value.substring( end );

        let newText;
        let newCursorPos;

        if ( selectedText ) {
            // If text is selected, wrap it with the markdown syntax
            newText = beforeText + markdownSyntax.replace( "text", selectedText ) + afterText;
            newCursorPos = start + markdownSyntax.indexOf( "text" ) + selectedText.length + selectionOffset;
        } else {
            // If no text is selected, just insert the markdown syntax
            newText = beforeText + markdownSyntax + afterText;
            newCursorPos = start + markdownSyntax.indexOf( "text" );
        }

        onChange( newText );

        // Set focus back to textarea and restore cursor position
        setTimeout( () => {
            textarea.focus();
            textarea.setSelectionRange( newCursorPos, newCursorPos );
        }, 0 );
    };

    return (
        <div className="border rounded-md overflow-hidden">
            <Tabs value={ activeTab } onValueChange={ ( value ) => setActiveTab( value ) }>
                <div className="flex items-center justify-between border-b px-2 py-1">
                    <TabsList className="h-8">
                        <TabsTrigger value="write" className="text-xs px-2 py-1">
                            Write
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs px-2 py-1">
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "**text**", 0 ) }
                            title="Bold"
                        >
                            <Bold className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "*text*", 0 ) }
                            title="Italic"
                        >
                            <Italic className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "### text", 0 ) }
                            title="Heading"
                        >
                            <Heading className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "[text](url)", 1 ) }
                            title="Link"
                        >
                            <Link className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "![text](url)", 1 ) }
                            title="Image"
                        >
                            <ImageIcon className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "- text", 0 ) }
                            title="Bullet List"
                        >
                            <List className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "1. text", 0 ) }
                            title="Numbered List"
                        >
                            <ListOrdered className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={ () => insertMarkdown( "`text`", 0 ) }
                            title="Code"
                        >
                            <Code className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="write" className="p-0 m-0">
                    <textarea
                        id="markdown-textarea"
                        value={ value }
                        onChange={ ( e ) => onChange( e.target.value ) }
                        placeholder={ placeholder }
                        className="w-full p-2 text-xs focus:outline-none resize-none"
                        style={ { minHeight, maxHeight, overflowY: "auto" } }
                    />
                </TabsContent>

                <TabsContent
                    value="preview"
                    className="p-2 m-0 prose prose-sm max-w-none dark:prose-invert"
                    style={ { minHeight, maxHeight, overflowY: "auto" } }
                >
                    { value ? (
                        <ReactMarkdown>{ value }</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground text-xs italic">Nothing to preview</p>
                    ) }
                </TabsContent>
            </Tabs>
        </div>
    );
}
