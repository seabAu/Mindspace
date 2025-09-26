import * as utils from 'akashatools';

export const updateNodeWithNewFileOrFolder = ( node, parentId, newItem, type ) => {
    if ( node._id === parentId ) {
        if ( type === "file" ) {
            return {
                ...node,
                fileContents: [ ...node.fileContents, newItem ],
            };
        } else if ( type === "folder" ) {
            return {
                ...node,
                folderContents: [ ...node.folderContents, newItem ],
            };
        }
    }

    return {
        ...node,
        folderContents: node.folderContents.map( ( childNode ) =>
            updateNodeWithNewFileOrFolder( childNode, parentId, newItem, type )
        ),
    };
};

export const deepFindSet = ( input = {}, key = "", mirrorObj, mirrorKey = "" ) => {
    const result = [];
    let inputobj = { ...input };
    const recursiveMirror = ( obj = {}, key, mirrorObj, mirrorKey ) => {
        if ( !obj || typeof obj !== "object" ) {
            return obj;
        }
        if ( obj.hasOwnProperty( key ) ) {
            var newObj = { ...obj, [ key ]: mirrorObj, mirrorKey };
            return newObj;
        }
        Object.keys( obj ).forEach( ( k ) => {
            return recursiveMirror( obj[ k ], key, mirrorObj, mirrorKey );
        } );
    };
    return recursiveMirror( inputobj, key, mirrorObj, mirrorKey );
    // return result;
};

export const deepMirrorNodes = ( mirrorNode, newNode ) => {
    const result = [];
    let inputNewNode = { ...newNode };
    /* 
        console.log(
            "deepMirrorNodes",
            " :: ", "mirrorNode = ", mirrorNode,
            " :: ", "newNode = ", newNode
        ); 
    */
    const recursiveMirrorNodes = ( mirrorNode, newNode ) => {
        // Mirror a property from mirrorNode to newNode.
        // Traverse the newNode.
        /* 
            console.log(
                "deepMirrorNodes",
                " :: ", "recursiveMirrorNodes",
                " :: ", "at top",
                " :: ", "mirrorNode = ", mirrorNode,
                " :: ", "newNode = ", newNode
            ); 
        */
        if ( utils.val.isValidArray( newNode, true ) ) {
            // Given an array.
            newNode.forEach( ( node, index ) => {
                // For each object in the array.
                /* 
                    console.log(
                        "deepMirrorNodes",
                        " :: ", "recursiveMirrorNodes",
                        " :: ", "(array case) running for each newNode",
                        " :: ", "mirrorNode = ", mirrorNode,
                        " :: ", "newNode = ", newNode
                    );
                 */
                return recursiveMirrorNodes( mirrorNode[ index ], node );
            } );
        }
        else if ( utils.val.isObject( newNode ) ) {
            // Given an object.

            // Detect type of node.
            let isFolder = (
                newNode.hasOwnProperty( 'folderContents' )
                |
                newNode.hasOwnProperty( 'fileContents' )
            );

            if ( isFolder ) {
                // Dealing with a folder.
                // Look at the folderContents and run through it if applicable. 
                let updatedNode = newNode.folderContents.map( ( folder, index ) => {
                    let newNodeFolder = folder;
                    let mirrorNodeFolder = mirrorNode.folderContents[ index ];
                    /* 
                    console.log(
                        "deepMirrorNodes",
                        " :: ", "recursiveMirrorNodes",
                        " :: ", "isObject",
                        " :: ", "isFolder",
                        " :: ", "mirrorNode = ", mirrorNode,
                        " :: ", "newNode = ", newNode,
                        " :: ", "folder = ", folder,
                        " :: ", "newNodeFolder = ", newNodeFolder,
                        " :: ", "mirrorNodeFolder = ", mirrorNodeFolder,
                    ); 
                    */

                    return recursiveMirrorNodes(
                        mirrorNode, {
                        ...newNode,
                        isActive: mirrorNode.isActive
                    } );
                } );

                return updatedNode;
            }

            return recursiveMirrorNodes( mirrorNode, newNode );
        }

        // Object.keys( mirrorNode ).forEach( ( nodeKey ) => {
        //     // For each key in this node.
        //     let nodeValue = mirrorNode[ nodeKey ];
        //     if ( newNode[ nodeKey ] !== mirrorNode[ nodeKey ] ) {
        //         newNode[ nodeKey ] = mirrorNode[ nodeKey ];
        //     }
        // } );
    };
    if ( utils.val.isValidArray( newNode, true ) ) {
        return recursiveMirrorNodes( mirrorNode[ 0 ], inputNewNode[ 0 ] );
    }
    else if ( utils.val.isObject( newNode ) ) {
        return recursiveMirrorNodes( mirrorNode, inputNewNode );
    }
};

/**
 * Recursively finds the path to a given target ID in the directory tree?.
 * @param {Object} tree - The current folder or file tree?.
 * @param {String} targetId - The ID of the target file or folder.
 * @param {Array} currentPath - The current path being built (used in recursion).
 * @returns {Array|null} - The absolute path as an array of IDs, or null if not found.
 */
/* 
    export const findAbsolutePath = ( tree, targetId, currentPath = [] ) => {
    // Add the current node's ID to the path
    const newPath = [ ...currentPath, tree?._id ];

    // Check if the current node is the target
    if ( tree?._id === targetId ) {
        return newPath;
    }
    else if ( tree?.folderContents ) {
        // Search in folderContents (if any)
        for ( const folder of tree.folderContents ) {
            const result = findAbsolutePath( folder, targetId, newPath );
            if ( result ) {
                return result; // Return the path if found
            }
        }
    }
    else if ( tree?.fileContents ) {
        // Search in fileContents (if any)
        for ( const file of tree.fileContents ) {
            if ( file?._id === targetId ) {
                return [ ...newPath, file?._id ];
            }
        }
    }
    else {
        // Return null if the target ID is not found in this branch
        return null;
    }
};
 */
/**
 * Recursively finds the path to a given target ID in the directory tree?.
 * @param {Object} tree - The current folder or file tree?.
 * @param {String} targetId - The ID of the target file or folder.
 * @returns {Array|null} - The absolute path as an array of IDs, or null if not found.
 */
export const findAbsolutePath = ( inputTree, targetId ) => {
    console.log( "note.js :: findAbsolutePath :: inputTree = ", inputTree, " :: ", "targetId = ", targetId );
    let tree;
    if ( inputTree && utils.val.isDefined( inputTree ) ) {

        if ( utils.val.isValidArray( inputTree, true ) ) {
            // Given an array instead of an object. 
            tree = { ...inputTree[ 0 ] };
        }
        else {
            tree = { ...inputTree };
        }

        // Detect type of node.
        let isFolder = (
            tree?.hasOwnProperty( 'folderContents' )
            |
            tree?.hasOwnProperty( 'fileContents' )
        );

        // Null case: If the targetId is null, assume and return the top level ID as the path head.
        if ( targetId === null || targetId === undefined ) {
            // return tree?._id;
            return { _id: tree?._id, type: isFolder, title: tree?.title, parentId: tree?.parentId };
        }

        // Base case: If the current node matches the target ID
        if ( tree?._id === targetId ) {
            return [ { _id: tree?._id, type: isFolder, title: tree?.title, parentId: tree?.parentId } ];
        }

        // Search in folderContents if it exists
        if ( tree?.folderContents && tree?.folderContents.length > 0 ) {
            for ( const folder of tree.folderContents ) {
                const path = findAbsolutePath( folder, targetId );
                if ( path ) {
                    return [
                        { _id: tree?._id, type: isFolder, title: tree?.title, parentId: tree?.parentId },
                        ...path
                    ]; // Prepend current node's ID to the path
                }
            }
        }

        // Search in fileContents if it exists
        if ( tree?.fileContents && tree?.fileContents.length > 0 ) {
            for ( const file of tree.fileContents ) {
                if ( file?._id === targetId ) {
                    return [
                        { _id: tree?._id, type: isFolder, title: tree?.title, parentId: tree?.parentId },
                        { _id: file?._id, type: isFolder, title: file?.title, parentId: file?.parentId },

                    ]; // Return path to the file
                }
            }
        }

        // Return null if the target ID is not found in this branch
        return null;
    }
    else {
        // Return null if the given tree is empty.
        return null;
    }
};


export const getNodeAtPath = ( inputTree, path = [] ) => {
    // Get any subpaths of the a page at the end of the provided path.
    // let tree = [ ...routesConfig ];
    console.log( 'note.js :: getNodeAtPath :: inputTree = ', inputTree, ' :: ', 'path = ', path );

    let tree;
    if ( inputTree && utils.val.isDefined( inputTree ) ) {

        if ( utils.val.isValidArray( inputTree, true ) ) {
            // Given an array instead of an object. 
            tree = { ...inputTree[ 0 ] };
        }
        else {
            tree = { ...inputTree };
        }
    }

    if ( utils.val.isValidArray( path, true ) ) {
        path.forEach( ( token, index ) => {
            let pathId = token?.value;
            let pathTitle = token?.title;

            if ( pathId && pathId !== 'Home' ) {
                if ( utils.val.isDefined( tree ) ) {
                    // Don't search tree if it was nulled out in a previous step.
                    // tree = tree?.content?.find( ( item ) => item?._id === pathId );
                    if ( tree?._id === pathId ) {
                        tree = tree?.content?.find( ( item ) => item?._id === pathId );
                        if ( tree ) {
                            // Valid path token, proceed to next one.
                            if ( index < path.length - 1 ) {
                                // Not at last token, check to make sure we have pages defined.
                                // tree = tree.content;
                                if (
                                    tree?.hasOwnProperty( 'content' ) &&
                                    utils.val.isValidArray( tree?.content, true )
                                ) {
                                    // tree = tree.content;
                                } else {
                                    // No defined pages to continue down, stop here.
                                    // tree = null;
                                    return tree;
                                }
                            }
                            else {
                                // At last token, return result.
                                return tree;
                            }
                        } else {
                            tree = null;
                        }
                    }
                }
            }
        } );
    }

    return tree;
};


export const recursiveNotesMigration = ( inputTree, path = [] ) => {
    console.log( 'note.js :: recursiveNotesMigration :: inputTree = ', inputTree, " :: ", "path = ", path );
    let tree;
    if ( inputTree && utils.val.isDefined( inputTree ) ) {
        if ( utils.val.isValidArray( inputTree, true ) ) {
            // Given an array instead of an object.
            tree = { ...inputTree[ 0 ] };
        } else {
            tree = { ...inputTree };
        }

        // Detect type of node.
        let isFolder =
            tree?.hasOwnProperty( 'folderContents' ) |
            tree?.hasOwnProperty( 'fileContents' );

        // Base case: If the current node matches the target ID
        // if ( tree?._id === targetId ) {
        //     return [
        //         {
        //             _id: tree?._id,
        //             type: isFolder,
        //             title: tree?.title,
        //             parentId: tree?.parentId,
        //         },
        //     ];
        // }

        // Update path value
        path = [ ...( path.length > 0 ? path : [] ), { value: tree?._id || tree?.id, title: tree?.title } ];
        tree.path = path;

        tree.content = [];

        if ( isFolder ) {
            tree = {
                ...tree,
                _id: tree?._id,
                itemType: 'folder',
                subType: 'folder',
                title: tree?.title,
                parentId: tree?.parentId,
                path: path,
                // path: [ ...( path.length > 0 ? path : [] ), tree?.parentId ],
                // path,
                content: []
            };

            // Search in folderContents if it exists
            if ( tree?.hasOwnProperty( 'folderContents' ) && utils.val.isDefined( tree?.folderContents ) && Array.isArray( tree?.folderContents ) && tree?.folderContents.length > 0 ) {

                const newContent = tree.folderContents.map( ( node ) => ( recursiveNotesMigration( node, path ) ) ) || [];
                tree = {
                    ...tree,
                    _id: tree?._id,
                    itemType: 'folder',
                    subType: 'folder',
                    title: tree?.title,
                    parentId: tree?.parentId,
                    // path: [ ...( path.length > 0 ? path : [] ), tree?._id ],
                    content: [
                        ...( tree?.hasOwnProperty( 'content' ) && utils.val.isValidArray( tree?.content, true ) ? tree?.content : [] ),
                        ...( utils.val.isValidArray( newContent, true ) ? newContent : [] )
                    ]
                };

            }

            // Search in fileContents if it exists
            if ( tree?.hasOwnProperty( 'fileContents' ) && utils.val.isDefined( tree?.fileContents ) && Array.isArray( tree?.fileContents ) && tree?.fileContents.length > 0 ) {

                // const newContent = tree.fileContents.map( ( node ) => ( recursiveNotesMigration( node, [ ...( tree?.path.length > 0 ? tree?.path : [] ), node?.parentId ] ) ) );
                const newContent = tree.fileContents.map( ( node ) => ( recursiveNotesMigration( node, path ) ) ) || [];
                tree = {
                    ...tree,
                    _id: tree?._id,
                    itemType: 'folder',
                    subType: 'folder',
                    title: tree?.title,
                    parentId: tree?.parentId,
                    // path: [ ...( path.length > 0 ? path : [] ), tree?._id ],
                    content: [
                        ...( tree?.hasOwnProperty( 'content' ) && utils.val.isValidArray( tree?.content, true ) ? tree?.content : [] ),
                        ...( utils.val.isValidArray( newContent, true ) ? newContent : [] )
                    ]
                };

            }


            // Clean up.
            if ( tree?.hasOwnProperty( 'folderContents' ) ) delete tree.folderContents;
            if ( tree?.hasOwnProperty( 'fileContents' ) ) delete tree.fileContents;
            if ( !tree?.hasOwnProperty( 'content' ) || !utils.val.isDefined( tree?.content ) ) tree.content = [];

            return tree;
        }
        else {
            // Is a file. Return with some tweaks for the new fieldNames. 
            // console.log( 'note.js :: recursiveNotesMigration :: tree object is a file :: tree = ', tree );
            return {
                ...tree,
                _id: tree?._id,
                itemType: 'file',
                subType: 'document',
                title: tree?.title,
                parentId: tree?.parentId,
                // path: [ ...( path.length > 0 ? path : [] ), tree?._id ],
                path: path,
                content: tree?.content || '',
            };
        }
    } else {
        // Return null if the given tree is empty.
        // if ( !tree?.hasOwnProperty( 'content' ) || !utils.val.isDefined( tree?.content ) ) tree.content = [];
        return null;
    }
};

export const recursiveNotesMigration2 = ( inputTree ) => {
    console.log( 'note.js :: recursiveNotesMigration :: inputTree = ', inputTree );
    let tree;
    if ( inputTree && utils.val.isDefined( inputTree ) ) {
        if ( utils.val.isValidArray( inputTree, true ) ) {
            // Given an array instead of an object.
            tree = { ...inputTree[ 0 ] };
        } else {
            tree = { ...inputTree };
        }

        // Detect type of node.
        let isFolder =
            tree?.hasOwnProperty( 'folderContents' ) |
            tree?.hasOwnProperty( 'fileContents' );

        // Base case: If the current node matches the target ID
        // if ( tree?._id === targetId ) {
        //     return [
        //         {
        //             _id: tree?._id,
        //             type: isFolder,
        //             title: tree?.title,
        //             parentId: tree?.parentId,
        //         },
        //     ];
        // }

        if ( isFolder ) {
            // tree = {
            //     ...tree,
            //     content: [
            //         ...( tree?.folderContents && Array.isArray( tree?.folderContents ) && tree?.folderContents.length > 0 ? tree?.folderContents : [] ),
            //         ...( tree?.fileContents && Array.isArray( tree?.fileContents ) && tree?.fileContents.length > 0 ? tree?.fileContents : [] ),
            //     ]
            // };

            console.log( 'note.js :: recursiveNotesMigration :: tree object is a folder :: tree = ', tree );
            // Search in folderContents if it exists
            // if ( tree?.contents && Array.isArray( tree?.contents ) && tree?.contents.length > 0 ) {
            //     return {
            //         ...tree,
            //         _id: tree?._id,
            //         type: 'folder',
            //         subType: 'folder',
            //         title: tree?.title,
            //         parentId: tree?.parentId,
            //         content: tree.contents.map( ( node ) => ( recursiveNotesMigration( node ) ) )
            //     };
            // }
            // else {
            //     return {
            //         ...tree,
            //         _id: tree?._id,
            //         type: 'folder',
            //         subType: 'folder',
            //         title: tree?.title,
            //         parentId: tree?.parentId,
            //         content: []
            //     };
            // }

            // Search in folderContents if it exists
            if ( tree?.folderContents && Array.isArray( tree?.folderContents ) && tree?.folderContents.length > 0 ) {

                tree = {
                    ...tree,
                    _id: tree?._id,
                    type: 'folder',
                    subType: 'folder',
                    title: tree?.title,
                    parentId: tree?.parentId,
                    content: [
                        ...( tree?.hasOwnProperty( 'content' ) && utils.val.isValidArray( tree?.content, true ) ? tree?.content : [] ),
                        ...( tree.folderContents.map( ( folder ) => ( recursiveNotesMigration( folder ) ) ) )
                    ]
                };
            }

            // Search in fileContents if it exists
            if ( tree?.fileContents && Array.isArray( tree?.fileContents ) && tree?.fileContents.length > 0 ) {

                tree = {
                    ...tree,
                    _id: tree?._id,
                    type: 'folder',
                    subType: 'folder',
                    title: tree?.title,
                    parentId: tree?.parentId,
                    content: [
                        ...( tree?.hasOwnProperty( 'content' ) && utils.val.isValidArray( tree?.content, true ) ? tree?.content : [] ),
                        ...( tree.fileContents.map( ( file ) => ( recursiveNotesMigration( file ) ) ) )
                    ]
                };

            }

            return tree;
        }
        else {
            // Is a file. Return with some tweaks for the new fieldNames. 
            return {
                ...tree,
                _id: tree?._id,
                type: 'file',
                subType: 'document',
                title: tree?.title,
                parentId: tree?.parentId,
                content: tree?.content,
            };
        }
    } else {
        // Return null if the given tree is empty.
        return null;
    }
};

export const findAbsolutePath2 = ( inputTree, targetId ) => {
    // console.log( "note.js :: findAbsolutePath :: inputTree = ", inputTree, " :: ", "targetId = ", targetId );
    let tree;
    if ( utils.val.isValidArray( inputTree, true ) ) {
        // Given an array instead of an object. 
        tree = { ...inputTree[ 0 ] };
    }
    else {
        tree = { ...inputTree };
    }

    // Null case: If the targetId is null, assume and return the top level ID as the path head.
    if ( targetId === null || targetId === undefined ) {
        return tree?._id;
    }

    // Base case: If the current node matches the target ID
    if ( tree?._id === targetId ) {
        return [ tree?._id ];
    }

    // Search in folderContents if it exists
    if ( tree?.folderContents && tree?.folderContents.length > 0 ) {
        for ( const folder of tree.folderContents ) {
            const path = findAbsolutePath( folder, targetId );
            if ( path ) {
                return [ tree?._id, ...path ]; // Prepend current node's ID to the path
            }
        }
    }

    // Search in fileContents if it exists
    if ( tree?.fileContents && tree?.fileContents.length > 0 ) {
        for ( const file of tree.fileContents ) {
            if ( file?._id === targetId ) {
                return [ tree?._id, file?._id ]; // Return path to the file
            }
        }
    }

    // Return null if the target ID is not found in this branch
    return null;
};

export const getPathIds = ( path = [], idKey = '' ) => (
    utils.val.isDefined( path, true )
        ? ( utils.val.isValidArray( path, true ) // Path is array and has at least 1 item.
            ? ( path?.map( ( v, i ) => ( v?.[ idKey ] ) ) ) // Path is an array of objects
            : ( [ path ]?.map( ( v, i ) => ( v?.[ idKey ] ) ) ) ) // Path is 1 object or is empty.
        : ( null )  // Invalid path
);


/**
 * // Inverse of findAbsolutePath; use the path to fetch the document. 
 * Recursively traverses the directory tree based on a path array and returns the target object.
 * @param {Object} inputTree - The directory tree to search.
 * @param {Array} path - An array of IDs representing the path to the target object.
 * @returns {Object|null} - The object at the end of the path, or null if not found.
 */
export const findNodeByAbsolutePath = ( inputTree, path ) => {
    // console.log( "note.js :: findNodeByAbsolutePath :: inputTree = ", inputTree, " :: ", "path = ", path );
    // Base case: If the path is empty, return the current tree
    let tree;
    if ( utils.val.isValidArray( inputTree, true ) ) {
        // Given an array instead of an object. Get 0th index.
        tree = { ...inputTree[ 0 ] };
    }
    else {
        tree = { ...inputTree };
    }

    if ( path.length === 0 ) {
        return tree;
    }

    // console.log( "findNodeByAbsolutePath :: path left = ", path );
    // Extract the next ID to search for and the remaining path
    // Separate out the current ID (0th item in array) and the rest of the array.
    // const [ currentId, ...remainingPath ] = path;
    // const [ currentId, ...remainingPath ] = path;
    let currentId;
    // let remainingPath = utils.val.isValidArray( path, true ) ? [...path[ path?.length ]] : [ path ];
    let remainingPath;
    if ( utils.val.isValidArray( path, true ) ) {
        if ( path.length > 1 ) {
            // At least another element besides current id.
            currentId = path[ 0 ];
            remainingPath = [ ...path ];
            remainingPath.shift();
        }
        else {
            // Only one item left. Can't be none, or it wouldn't get past the isValidArray check.
            currentId = path[ 0 ];
            remainingPath = [];
        }
    }
    else {
        currentId = null;
        remainingPath = [ null ];
    }

    // If the current ID matches the tree's ID, continue down the remaining path
    if ( tree?._id === currentId ) {
        // If there's no more path left, return the current tree
        if ( remainingPath.length === 0 ) {
            return tree;
        }

        // Search in folderContents
        if ( tree?.folderContents && tree?.folderContents.length > 0 ) {
            for ( const folder of tree.folderContents ) {
                const result = findNodeByAbsolutePath( folder, remainingPath );
                if ( result ) {
                    return result;
                }
            }
        }

        // Search in fileContents
        if ( tree?.fileContents && tree?.fileContents.length > 0 ) {
            for ( const file of tree.fileContents ) {
                if ( file?._id === remainingPath[ 0 ] ) {
                    return file;
                }
            }
        }
    }

    // Return null if no match is found
    return null;
};

export const findNodeByAbsolutePath2 = ( inputTree, path ) => {
    // console.log( "note.js :: findNodeByAbsolutePath :: inputTree = ", inputTree, " :: ", "path = ", path );
    // Base case: If the path is empty, return the current tree
    let tree;
    if ( utils.val.isValidArray( inputTree, true ) ) {
        // Given an array instead of an object. 
        tree = { ...inputTree[ 0 ] };
    }
    else {
        tree = { ...inputTree };
    }

    if ( path.length === 0 ) {
        return tree;
    }

    // Extract the next ID to search for and the remaining path
    const [ currentId, ...remainingPath ] = path;

    // If the current ID matches the tree's ID, continue down the remaining path
    if ( tree?._id === currentId ) {
        // If there's no more path left, return the current tree
        if ( remainingPath.length === 0 ) {
            return tree;
        }

        // Search in folderContents
        if ( tree?.folderContents && tree?.folderContents.length > 0 ) {
            for ( const folder of tree.folderContents ) {
                const result = findNodeByAbsolutePath( folder, remainingPath );
                if ( result ) {
                    return result;
                }
            }
        }

        // Search in fileContents
        if ( tree?.fileContents && tree?.fileContents.length > 0 ) {
            for ( const file of tree.fileContents ) {
                if ( file?._id === remainingPath[ 0 ] ) {
                    return file;
                }
            }
        }
    }

    // Return null if no match is found
    return null;
};


export const deepUpdateNode = ( node, parentId, newItem, newNodeType ) => {
    // Detect type of node.
    let isFolder = (
        node.hasOwnProperty( 'folderContents' )
        |
        node.hasOwnProperty( 'fileContents' )
    );

    if ( isFolder && node._id === parentId ) {
        if ( newNodeType === "file" ) {
            return {
                ...node,
                fileContents: [ ...node.fileContents, newItem ],
            };
        } else if ( newNodeType === "folder" ) {
            return {
                ...node,
                folderContents: [ ...node.folderContents, newItem ],
            };
        }
    }

    return {
        ...node,
        folderContents: node.folderContents.map( ( childNode ) =>
            deepUpdateNode( childNode, parentId, newItem, newNodeType )
        ),
        // fileContents: node.fileContents.map( ( childNode ) =>
        //     deepUpdateNode( childNode, parentId, newItem, type )
        // ),
    };
};