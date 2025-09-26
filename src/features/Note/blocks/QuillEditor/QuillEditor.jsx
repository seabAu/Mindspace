import React, { useContext, createContext, useEffect, useState, useRef, Suspense } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import './styles/quill.snow.css';
import './styles/quill.bubble.css';
import './styles/quill.core.css';
import * as utils from 'akashatools';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { EraserIcon, SaveIcon } from 'lucide-react';

let Clipboard = Quill.import( 'modules/clipboard' );
let Delta = Quill.import( 'delta' );
class PlainClipboard extends Clipboard {
    convert ( html = null ) {
        if ( typeof html === 'string' ) {
            this.container.innerHTML = html;
        }
        let text = this.container.innerText;
        this.container.innerHTML = '';
        return new Delta().insert( text );
    }
}

Quill.register( 'modules/clipboard', PlainClipboard, true );

let Inline = Quill.import( 'blots/inline' );
class BoldBlot extends Inline { }
BoldBlot.blotName = 'bold';
BoldBlot.tagName = 'strong';
Quill.register( 'formats/bold', BoldBlot );

const QuillEditor = ( props ) => {
    const {
        defaultTheme = "snow",
        content, setContent,
        handleSave, handleClear, handleLoad,
        classNames = '',
        useThemeDropdown = true,
        useSaveButton = true,
        useLiveUpdate = false,
    } = props;

    // Use a ref to access the quill instance directly
    const quillRef = useRef();
    const [ theme, setTheme ] = useState( defaultTheme );
    const [ localContent, setLocalContent ] = useState( content );

    // useEffect( () => {
    //     // When content changes, fetch the delta from Quill.

    //     // const length = Quill.prototype.getLength();
    //     const length = ReactQuill.length;

    //     // SYNTAX :: getContents(index: number = 0, length: number = remaining): Delta
    //     // const delta = Quill.prototype.getContents( 0, length );
    //     const delta = Quill.prototype.getContents( 0, length );

    //     // SYNTAX :: getSemanticHTML( index: number = 0, length: number = remaining ): string;
    //     const html = Quill.prototype.getSemanticHTML( 0, 10 );
    // }, [ content ] );

    /* 
        // SYNTAX :: handler(delta: Delta, oldContents: Delta, source: string)
        // Quill.events().SELECTION_CHANGE
        Quill.on( 'text-change', ( delta, oldDelta, source ) => {
            if ( source == 'api' ) {
                console.log( 'An API call triggered this change.' );
            } else if ( source == 'user' ) {
                console.log( 'A user action triggered this change.' );
            }
        } );
    
        // SYNTAX :: handler(range: { index: number, length: number }, oldRange: { index: number, length: number }, source: string)
        Quill.on( 'selection-change', ( range, oldRange, source ) => {
            if ( range ) {
                if ( range.length == 0 ) {
                    console.log( 'User cursor is on', range.index );
                } else {
                    const text = Quill.getText( range.index, range.length );
                    console.log( 'User has highlighted', text );
                }
            } else {
                console.log( 'Cursor not in the editor' );
            }
        } );
     */

    /* 
        let Clipboard = Quill.import( 'modules/clipboard' );
        let Delta = Quill.import( 'delta' );
        class PlainClipboard extends Clipboard {
            convert ( html = null ) {
                if ( typeof html === 'string' ) {
                    this.container.innerHTML = html;
                }
                let text = this.container.innerText;
                this.container.innerHTML = '';
                return new Delta().insert( text );
            }
        }
    
        Quill.register( 'modules/clipboard', PlainClipboard, true );
    */

    /* 
        let Inline = Quill.import( 'blots/inline' );
        class BoldBlot extends Inline { }
        BoldBlot.blotName = 'bold';
        BoldBlot.tagName = 'strong';
        Quill.register( 'formats/bold', BoldBlot );
    */

    /* 
        document.addEventListener( 'focus', function ( e ) {
            e.target.classList.add( 'focus-ring' );
        }, true );
    
        document.addEventListener( 'blur', function ( e ) {
            e.target.classList.remove( 'focus-ring' );
        }, true );
    */

    const Editor = {
        modules: {
            // Equivalent to { toolbar: { container: '#toolbar' }}
            // toolbar: '#toolbar'
            // container: '#toolbar',
            // handlers: {
            //     insertStar: insertStar,
            // },
            // table: false,
            toolbar: [
                /* [
                    'header', 'font', 'size',
                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                    'list', 'bullet', 'indent',
                    'link', 'image', 'video'
                ], */
                [ 'bold', 'italic', 'underline', 'strike' ],        // toggled buttons
                [ 'blockquote', 'code-block' ],
                [ 'link', 'image', 'video', 'formula' ],

                // [ { 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }, { 'header': 5 }, { 'header': 6 }, false ],               // custom button values
                [ { 'header': [ 1, 2, 3, 4, 5, 6, false ] } ],
                [ { 'size': [ 'small', false, 'large', 'huge' ] } ],  // custom dropdown

                [ { 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' } ],
                [ { 'font': [] } ],
                [ { 'script': 'sub' }, { 'script': 'super' } ],      // superscript/subscript
                [ { 'indent': '-1' }, { 'indent': '+1' } ],          // outdent/indent
                [ { 'direction': 'rtl' } ],                         // text direction
                [ { 'align': [] } ],                                // text align

                [ { 'color': [] }, { 'background': [] } ],          // dropdown with defaults from theme

                [ 'clean' ]                                         // remove formatting button
            ],
        },
        // clipboard: {
        //     matchVisual: false,
        // },
        // keyboard: {
        //     bindings: {
        //         'tab': {
        //             key: 9,
        //             handler: function ( range, context ) {
        //                 return true;
        //             }
        //         }
        //     }
        // },
        formats: [
            'header',
            'font',
            'size',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'list',
            'bullet',
            'indent',
            'link',
            'image',
            'color',
            'code-block',
            'script',
            'align',
            'background',
            // 'header',
            // 'bold', 'italic', 'underline', 'strike', 'blockquote',
            // 'list', 'bullet', 'indent',
            // 'link', 'image', 'video', // 'formula'
        ]
    };

    const handleThemeChange = ( newTheme ) => {
        if ( newTheme === "core" ) newTheme = null;
        setTheme( { theme: newTheme } );
    };

    return (
        <div className={ twMerge(
            `text-editor w-full h-full max-h-full min-h-full relative gap-2 p-0`,
            `flex flex-col items-stretch justify-start`,
            `overflow-hidden relative`,
            `z-0 rounded-[${ 0.25 }rem] flex flex-col items-stretch justify-stretch w-full`,
            `h-min max-h-full min-h-min flex-1 flex-grow-1`,
            // `min-h-[15vh] h-[15vh]`,
            `w-full min-w-full max-w-full`,
            // `max-h-80vh`,
            // classNames,
        ) }>
            <div className="flex-grow w-full items-center justify-stretch flex-row gap-4 p-0">
                <div className="saveButton !m-0 w-full">
                    { useSaveButton && (
                        <Button
                            className="savebtn rounded-xl"
                            size='sm'
                            variant={ `outline` }
                            onClick={ () => {
                                alert( JSON.stringify( content, null, 2 ) );
                                handleSave( content );
                            } }
                        >
                            <SaveIcon />
                            Save
                        </Button>
                    ) }

                    { handleClear && (
                        <Button
                            className="savebtn rounded-xl"
                            size='sm'
                            variant={ `outline` }
                            onClick={ () => {

                                if ( window.confirm( 'Are you sure you want to clear the contents of this document? This is irreversable.' ) ) {
                                    try {
                                        handleClear( content );
                                    } catch ( error ) {
                                        console.error( 'Error clearing content: ', error );
                                    }
                                }
                            } }
                        >
                            <EraserIcon />
                            Clear
                        </Button>
                    ) }

                </div>
                { useThemeDropdown && (
                    <div className="themeSwitcher !m-0 w-full">
                        <div className="flex flex-grow items-stretch justify-stretch flex-row gap-4 p-0">
                            <label>Theme </label>
                            <select onChange={ ( e ) => {
                                handleThemeChange( e.target.value );
                            } }>
                                <option value="snow">Snow</option>
                                <option value="bubble">Bubble</option>
                                <option value="core">Core</option>
                            </select>
                        </div>
                    </div>
                ) }
                {/* <Suspense fallback={ <Spinner /> }> */ }
            </div>

            <ReactQuill
                key={ `react-quill-editor` }
                ref={ quillRef }
                // placeholder={ 'Write something...' }
                className={ twMerge(
                    `z-0 flex flex-col items-stretch justify-stretch w-full`,
                    // `min-h-[75vh] h-[75vh] max-h-[75%]`,
                    `w-full min-w-full max-w-full`,
                    // `min-h-[15vh] h-[15vh] rounded-[${ 0.25 }rem]`,
                    `h-min`,
                    `flex-1`,
                    `overflow-auto relative`,
                    // classNames,
                ) }
                theme={ theme }
                modules={ Editor.modules }
                formats={ Editor.formats }
                // value={ localContent }
                defaultValue={ localContent }
                onChange={ ( value, delta, source, editor ) => {
                    // console.log( "ReactQuill :: onChange triggered :: inputs = [", value, delta, source, editor, "]" );
                    setLocalContent( editor.getText() );
                    if ( useLiveUpdate ) {
                        setContent( editor.getText() );
                    }
                } }
                onBlur={ ( previousRange, source, editor ) => {
                    // console.log( "ReactQuill :: onBlur triggered :: inputs = [", previousRange, source, editor, "]" );
                    setContent( editor.getText() );
                    // setContent( localContent );
                } }
            // scrollingContainer={ true } 
            /* preserveWhitespace={ true } */
            /* onChangeSelection={ ( range, source, editor ) => {
                // console.log( "ReactQuill :: onChangeSelection triggered :: inputs = [", range, source, editor, "]" );
            } } */
            >
                {/* <div className="text-editor-editing-area" /> */ }
            </ReactQuill>

            {/* </Suspense> */ }
        </div>
    );
};



const CustomToolbarContainer = () => {


    /* 
      const quill = new Quill('#editor', {
        modules: {
          syntax: true,
          toolbar: '#toolbar-container',
        },
        placeholder: 'Compose an epic...',
        theme: 'snow',
      });
    */
    return (
        <>
            <div id="toolbar-container">
                <span class="ql-formats">
                    <select class="ql-font"></select>
                    <select class="ql-size"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                    <button class="ql-strike"></button>
                </span>
                <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-script" value="sub"></button>
                    <button class="ql-script" value="super"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-header" value="1"></button>
                    <button class="ql-header" value="2"></button>
                    <button class="ql-blockquote"></button>
                    <button class="ql-code-block"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered"></button>
                    <button class="ql-list" value="bullet"></button>
                    <button class="ql-indent" value="-1"></button>
                    <button class="ql-indent" value="+1"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-direction" value="rtl"></button>
                    <select class="ql-align"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-link"></button>
                    <button class="ql-image"></button>
                    <button class="ql-video"></button>
                    <button class="ql-formula"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-clean"></button>
                </span>
            </div>
            <div id="editor">
            </div>
        </>
    );
};

/*
 * Custom "star" icon for the toolbar using an Octicon
 * https://octicons.github.io
 */
const CustomButton = () => <span className="octicon octicon-star" />;

/*
 * Event handler to be attached using Quill toolbar module
 * http://quilljs.com/docs/modules/toolbar/
 */
function insertStar () {
    const cursorPosition = this.quill.getSelection().index;
    this.quill.insertText( cursorPosition, '★' );
    this.quill.setSelection( cursorPosition + 1 );
}

/*
 * Custom toolbar component including insertStar button and dropdowns
 */
const CustomToolbar = () => (
    <div id="toolbar">
        <select
            className="ql-header"
            defaultValue={ '' }
            onChange={ ( e ) => e.persist() }
        >
            <option value="1"></option>
            <option value="2"></option>
            <option selected></option>
        </select>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <select className="ql-color">
            <option value="red"></option>
            <option value="green"></option>
            <option value="blue"></option>
            <option value="orange"></option>
            <option value="violet"></option>
            <option value="#d0d1d2"></option>
            <option selected></option>
        </select>
        <button className="ql-insertStar">
            <CustomButton />
        </button>
    </div>
);


export default QuillEditor;


