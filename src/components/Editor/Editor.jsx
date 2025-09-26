import React, { memo, useEffect, useRef, useState } from "react";
import { createReactEditorJS } from 'react-editor-js'
import EditorJS from "@editorjs/editorjs";
import { EDITOR_JS_TOOLS } from "./tools";

// Initial Data
const INITIAL_DATA = {
    time: new Date().getTime(),
    blocks: [
        {
            type: "header",
            data: {
                text: "This is my awesome editor!",
                level: 1,
            },
        },
    ],
};

const Editor = ( { data, onChange, editorblock } ) => {
    const ref = useRef();
    //Initialize editorjs
    useEffect( () => {
        //Initialize editorjs if we don't have a reference
        if ( !ref.current ) {
            const editor = new EditorJS( {
                holder: editorblock,
                tools: EDITOR_JS_TOOLS,
                data: data,
                async onChange ( api, event ) {
                    const data = await api.saver.save();
                    onChange( data );
                },
            } );
            ref.current = editor;
        }

        //Add a return function to handle cleanup
        return () => {
            if ( ref.current && ref.current.destroy ) {
                ref.current.destroy();
            }
        };
    }, [] );
    return <div id={ editorblock } />;
};

const Notes = () => {

    const [ data, setData ] = useState( INITIAL_DATA );
    return (
        <div className="editor">
            <Editor data={ data } onChange={ setData } editorblock="editorjs-container" />
            <button
                className="savebtn"
                onClick={ () => {
                    alert( JSON.stringify( data ) );
                } }
            >
                Save
            </button>
        </div>
    );
}

Notes.Editor = Editor;

export default memo( Notes );

/*
const editor = () => {
    const DEFAULT_INITIAL_DATA = {
        "time": new Date().getTime(),
        "blocks": [
            {
                "type": "header",
                "data": {
                    "text": "This is my awesome editor!",
                    "level": 1
                }
            },
        ]
    }

    const [ blocks, setBlocks ] = useState( DEFAULT_INITIAL_DATA );
    const ReactEditorJS = createReactEditorJS()

    return (
        <div>
            <ReactEditorJS defaultValue={ blocks } tools={ EDITOR_JS_TOOLS } onChange={()=>{setBlocks(e.target)}} />
        </div>
    )
}

export default editor
*/


/*
import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from '@editorjs/header';

const DEFAULT_INITIAL_DATA = {
    "time": new Date().getTime(),
    "blocks": [
        {
            "type": "header",
            "data": {
                "text": "This is my awesome editor!",
                "level": 1
            }
        },
    ]
}

const editor = () => {
    const ejInstance = useRef();

    const initEditor = () => {
        const editor = new EditorJS( {
            holder: 'editorjs',
            onReady: () => {
                ejInstance.current = editor;
            },
            autofocus: true,
            data: DEFAULT_INITIAL_DATA,
            onChange: async () => {
                let content = await editor.saver.save();

                console.log( content );
            },
            tools: {
                header: Header,
            },
        } );
    };

    // This will run only once
    useEffect( () => {
        if ( ejInstance.current === null ) {
            initEditor();
        }

        return () => {
            ejInstance?.current?.destroy();
            ejInstance.current = null;
        };
    }, [] );

    return <>
        <div id='editorjs'></div>
    </>;
}

export default editor;

*/