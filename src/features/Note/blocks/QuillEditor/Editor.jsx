import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import QuillEditor from "../components/QuillEditor";
import Quill from "quill";
import 'quill/dist/quill.snow.css';

const Editor = ( props ) => {
    const Delta = Quill.import( "delta" );
    const [ range, setRange ] = useState();
    const [ lastChange, setLastChange ] = useState();
    const [ readOnly, setReadOnly ] = useState( false );
    const quillRef = useRef();

    return (
        <section>
            <QuillEditor
                ref={ quillRef }
                readOnly={ readOnly }
                defaultValue={ new Delta()
                    .insert( "Hello" )
                    .insert( "\n", { header: 1 } )
                    .insert( "Some " )
                    .insert( "initial", { bold: true } )
                    .insert( " " )
                    .insert( "content", { underline: true } )
                    .insert( "\n" ) }
                onSelectionChange={ setRange }
                onTextChange={ setLastChange }
            />
            <div>
                <label>
                    Read Only:{ " " }
                    <input
                        type="checkbox"
                        value={ readOnly }
                        onChange={ ( e ) => setReadOnly( e.target.checked ) }
                    />
                </label>
                <button
                    type="button"
                    onClick={ () => {
                        alert( quillRef.current?.getLength() );
                    } }
                >
                    Get Content Length
                </button>
            </div>
            <div>
                <div>Current Range:</div>
                { range ? JSON.stringify( range ) : "Empty" }
            </div>
            <div>
                <div>Last Change:</div>
                { lastChange ? JSON.stringify( lastChange.ops ) : "Empty" }
            </div>
        </section>
    );
};

const QuillEditor = forwardRef(
    ( { readOnly, defaultValue, onTextChange, onSelectionChange }, ref ) => {
        const containerRef = useRef( null );
        const defaultValueRef = useRef( defaultValue );
        const onTextChangeRef = useRef( onTextChange );
        const onSelectionChangeRef = useRef( onSelectionChange );

        useLayoutEffect( () => {
            onTextChangeRef.current = onTextChange;
            onSelectionChangeRef.current = onSelectionChange;
        } );

        useEffect( () => {
            ref.current?.enable( !readOnly );
        }, [ ref, readOnly ] );

        useEffect( () => {
            const container = containerRef.current;
            const editorContainer = container.appendChild(
                container.ownerDocument.createElement( "article" ),
            );
            const quill = new Quill( editorContainer, {
                theme: "snow",
            } );

            ref.current = quill;

            if ( defaultValueRef.current ) {
                quill.setContents( defaultValueRef.current );
            }

            quill.on( Quill.events.TEXT_CHANGE, ( ...args ) => {
                onTextChangeRef.current?.( ...args );
            } );

            quill.on( Quill.events.SELECTION_CHANGE, ( ...args ) => {
                onSelectionChangeRef.current?.( ...args );
            } );

            return () => {
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ ref ] );

        return <section ref={ containerRef }></section>;
    },
);

QuillEditor.displayName = "Editor";

export default Editor;

QuillEditor.propTypes = {
    readOnly: PropTypes.bool,
    defaultValue: PropTypes.object,
    onTextChange: PropTypes.func,
    onSelectionChange: PropTypes.func,
};