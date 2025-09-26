/**
 * Builds a directory tree from a flat array of notes using path arrays and parentId
 * @param {Array} notesData - Flat array of all notes
 * @returns {Array} - Nested directory tree structure
 */
export const buildDirectoryTree = ( notesData ) => {
    if ( !Array.isArray( notesData ) || notesData.length === 0 ) {
        return [];
    }

    // Create a map for quick lookups by ID
    const notesMap = new Map();
    notesData.forEach( ( note ) => {
        notesMap.set( note._id, {
            ...note,
            content: [], // Initialize content array for nested items
        } );
    } );

    // Find root items (items with no parentId or parentId not in the dataset)
    const rootItems = [];

    notesData.forEach( ( note ) => {
        const noteWithContent = notesMap.get( note._id );

        if ( !note.parentId || !notesMap.has( note.parentId ) ) {
            // This is a root item
            rootItems.push( noteWithContent );
        } else {
            // This item has a parent, add it to parent's content array
            const parent = notesMap.get( note.parentId );
            if ( parent ) {
                parent.content.push( noteWithContent );
            }
        }
    } );

    // Sort function to put folders before files
    const sortItems = ( items ) => {
        return items.sort( ( a, b ) => {
            // Folders first, then files
            if ( a.itemType === "folder" && b.itemType === "file" ) return -1;
            if ( a.itemType === "file" && b.itemType === "folder" ) return 1;
            // Then sort alphabetically by title
            return a.title.localeCompare( b.title );
        } );
    };

    // Recursively sort all levels
    const sortRecursively = ( items ) => {
        const sorted = sortItems( items );
        sorted.forEach( ( item ) => {
            if ( item.content && item.content.length > 0 ) {
                item.content = sortRecursively( item.content );
            }
        } );
        return sorted;
    };

    return sortRecursively( rootItems );
};

/**
 * Finds a note in the tree by its path array
 * @param {Array} tree - Directory tree
 * @param {Array} pathArray - Array of path objects with {value, title}
 * @returns {Object|null} - Found note or null
 */
export const findNoteByPath = ( tree, pathArray ) => {
    if ( !Array.isArray( tree ) || !Array.isArray( pathArray ) || pathArray.length === 0 ) {
        return null;
    }

    const [ currentPath, ...remainingPath ] = pathArray;
    const currentNote = tree.find( ( note ) => note._id === currentPath.value );

    if ( !currentNote ) {
        return null;
    }

    if ( remainingPath.length === 0 ) {
        return currentNote;
    }

    return findNoteByPath( currentNote.content || [], remainingPath );
};

/**
 * Builds breadcrumb path from a note's path array
 * @param {Array} pathArray - Array of path objects with {value, title}
 * @returns {Array} - Breadcrumb array
 */
export const buildBreadcrumbs = ( pathArray ) => {
    if ( !Array.isArray( pathArray ) ) {
        return [];
    }

    return pathArray.map( ( pathItem ) => ( {
        id: pathItem.value,
        title: pathItem.title,
        path: pathArray.slice( 0, pathArray.indexOf( pathItem ) + 1 ),
    } ) );
};

/**
 * Gets all children of a specific note recursively
 * @param {Array} tree - Directory tree
 * @param {String} noteId - ID of the parent note
 * @returns {Array} - Flat array of all children
 */
export const getAllChildren = ( tree, noteId ) => {
    const children = [];

    const findChildren = ( items ) => {
        items.forEach( ( item ) => {
            if ( item.parentId === noteId ) {
                children.push( item );
                if ( item.content && item.content.length > 0 ) {
                    findChildren( item.content );
                }
            } else if ( item.content && item.content.length > 0 ) {
                findChildren( item.content );
            }
        } );
    };

    findChildren( tree );
    return children;
};
