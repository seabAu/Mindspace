import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API from '../services/api';
import * as utils from 'akashatools';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import { handleApiRequest } from '../utilities/fetch';

const API_BASE_URL = '/api/app/note'; // Base URL for notes API

/*  const handleError = (
        err,
        setLoading = () => { },
        setError = () => { },
        doThrow = false,
    ) => {
        let errMsg;
        if ( utils.val.isString( err ) ) {
            errMsg = err;
        } else if ( utils.val.isAO( err ) ) {
            errMsg = err?.response?.data?.message;
        }
        if ( setLoading ) setLoading( false );
        if ( setError ) setError( errMsg || "An unexpected error occurred" );

        if ( errMsg ) {
            if ( doThrow ) throw new Error( errMsg );
            else console.error( "notesService :: API Error: ", errMsg );
        }
    };

    const validateInputs = ( inputs, requiredFields ) => {
        for ( const field of requiredFields ) {
            if ( !inputs[ field ] ) throw new Error( `${ field } is required` );
        }
    };
*/

/* 
const handleApiRequest = async ( {
    method = "get",
    url,
    data = {},
    params = {},
    requiredFields = [],
    successCallback,
    stateSetter,
    setLoading = () => { },
    setError = () => { },
} ) => {
    try {
        if ( requiredFields.length ) validateInputs( data, requiredFields );

        if ( setLoading ) setLoading( true );
        const response = await API[ method ]( url, { data, params } );
        if ( setLoading ) setLoading( false );

        if ( stateSetter ) stateSetter( response.data.data );
        if ( successCallback ) successCallback( response.data.data );

        return response.data.data;
    } catch ( err ) {
        handleError(
            err,
            true,
            setLoading,
            setError,
        );
        return null;
    }
};
 */
/* 
    // Helper function to handle API requests
    const apiRequest = async (
        url,
        method,
        data = null,
        params = null,
        setLoading = () => { },
        setError = () => { },
    ) => {
        try {
            if ( setLoading ) setLoading( true );

            let tokenLocalLabel = [ 'mindspace', 'app', 'user', 'token' ].join( '_' );
            const response = await API[ method ]( {
                url,
                method,
                data,
                params,
                headers: {
                    "x-auth-token": localStorage.getItem( tokenLocalLabel ), // token,
                    "Content-type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            } );

            console.log( "notesService :: apiRequest :: response = ", response );

            return response.data;
        } catch ( err ) {
            handleError( { err, setLoading, setError, doThrow: true } );
        } finally {
            if ( setLoading ) setLoading( false );
        }
    };
*/

// export const fetchFullFolderTree = async ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     try {
//         const response = await API.get( `${ API_BASE_URL }/path/tree`, {
//             data: { workspaceId }
//         } );
//         // setNotes( response.data.data );
//         return response.data.data;
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//     }
// };

// // File operations
// export const getFile = ( {
//     workspaceId,
//     id,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/file/${ id }/?workspaceId=${ workspaceId }`,
//         params: { workspaceId },
//         errorCallback: handleError,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// export const getFiles = ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/file/`, // ?workspaceId=${ workspaceId }`,
//         params: { workspaceId },
//         // stateSetter: setFiles,
//         errorCallback: handleError,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// // File: fileApi.js

// /**
//  * Fetches the most recently modified files with optional sorting and filtering.
//  * @param {Object} options - Options for the request.
//  * @param {number} options.order - Sorting order (1 for ascending, -1 for descending).
//  * @param {string} options.keyword - Keyword to filter file names (case insensitive).
//  * @returns {Promise<Object>} - The response containing the file data or an error.
//  */
// export const getRecentFiles = async ( {
//     workspaceId,
//     options = {},
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/file/recent?workspaceId=${ workspaceId }`,
//         params: { workspaceId },
//         data: { options },
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
//     /* 
//       try {
//           const response = await fetch( `${ API_BASE_URL }/file/recent?workspaceId=${ workspaceId }`, {
//               method: "POST",
//               headers: {
//                   "Content-Type": "application/json",
//               },
//               body: JSON.stringify( { data: options } ),
//           } );

//           const result = await response.json();
//           if ( !result.success ) {
//               throw new Error( result.message );
//           }

//           return result.data;
//       } catch ( error ) {
//           console.error( "Error fetching recent files:", error );
//           return null;
//       } */
// };

// export const createFile = async ( {
//     workspaceId,
//     data,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     if ( !data ) {
//         handleError( {
//             err: 'notesService :: createFile :: data is required.',
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     // Make sure workspace Id is set.
//     if ( utils.ao.has( data, 'workspaceId' ) ) {
//         console.log( 'Data has workspaceId: ', data?.workspaceId );
//     } else {
//         handleError( {
//             err: 'notesService :: createFile :: workspaceId is required.',
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     return handleApiRequest( {
//         method: 'post',
//         url: `${ API_BASE_URL }/file`,
//         // params: { workspaceId, id },
//         data: { ...data, workspaceId: workspaceId },
//         requiredFields: [ 'workspaceId', 'content' ],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: ( err ) => ( handleError( { err, setLoading, setError, doThrow: true } ) ),
//         setLoading: setLoading,
//         setError: setError
//     } );/* 
//     try {
//         if ( setLoading ) setLoading( true );

//         const response = await API.post( `${ API_BASE_URL }/file/`, {
//             data: {
//                 ...data,
//                 workspaceId: workspaceId
//             }
//         } );

//         console.log( 'notesService :: createFile :: response = ', response );

//         if ( response.data.success ) {
//             // Successful request. We'll receive back the full data for the file. We set our current active file to this one.
//             return response.data.data;
//         } else {
//             handleError( {
//                 err: `notesService :: createFile :: API Error = ${ response.data.message }`,
//                 setLoading,
//                 setError,
//                 doThrow: true
//             } );
//             return null;
//         }
//         // return response.data.data;
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//         return null;
//     } finally {
//         if ( setLoading ) setLoading( false );
//     } */
// };

// export const updateFile = ( {
//     id,
//     data,
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'put',
//         url: `${ API_BASE_URL }/file/${ id }`,
//         data: data,
//         // params: { id },
//         requiredFields: [ '_id', 'workspaceId' ],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };
// /* 
// export const updateFile = async ( {
//     id,
//     data,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     if ( !data ) {
//         handleError( {
//             err: `notesService :: updateFile :: data is required :: Data = ${ JSON.stringify( data ) }`,
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     try {
//         if ( setLoading ) setLoading( true );

//         const response = await API.post( `${ API_BASE_URL }/file/${ id }`, {
//             data: data
//         } );

//         console.log(
//             'notesService :: updateFile :: data = ',
//             data,
//             ' :: ',
//             'response = ',
//             response
//         );

//         if ( response.data.success ) {
//             // Successful request. We'll receive back the full data for the file. We set our current active file to this one.
//             return response.data.data;
//         } else {
//             handleError( {
//                 err: `notesService :: updateFile :: API Error = ${ response.data.message }`,
//                 setLoading,
//                 setError,
//                 doThrow: true
//             } );
//             return null;
//         }
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//         return null;
//     } finally {
//         if ( setLoading ) setLoading( false );
//     }
// };
//  */
// export const deleteFile = ( {
//     id,
//     parentId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'delete',
//         url: `${ API_BASE_URL }/file/${ id }`,
//         data: {
//             id,
//             parentId
//         },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// // Folder operations
// export const getFolder = ( {
//     workspaceId,
//     id,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/folder/${ id }?workspaceId=${ workspaceId }`,
//         params: { workspaceId, id },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// export const getFolders = ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/folder/`, // ?workspaceId=${ workspaceId }`,
//         params: { workspaceId },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// // const createFolder = async ( folderData ) =>
// // await apiRequest( `${ API_BASE_URL }/folder/`, 'POST', folderData );

// export const createFolder = async ( {
//     workspaceId,
//     data,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     if ( !data ) {
//         handleError( { err: 'notesService :: data is required.', setLoading, setError, doThrow: true } );
//         return null;
//     }

//     // Make sure workspace Id is set.
//     if ( utils.ao.has( data, 'workspaceId' ) ) {
//         console.log( 'Data has workspaceId: ', data?.workspaceId );
//     } else {
//         handleError( {
//             err: 'notesService :: createFolder :: workspaceId is required.',
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     try {
//         if ( setLoading ) setLoading( true );

//         const response = await API.post( `${ API_BASE_URL }/folder/`, {
//             data: {
//                 ...data,
//                 workspaceId: workspaceId
//             }
//         } );

//         console.log( 'notesService :: createFolder :: response = ', response );

//         if ( response.data.success ) {
//             // Successful request. We'll receive back the full data for the file. We set our current active file to this one.
//             return response.data.data;
//         } else {
//             handleError( {
//                 err: `notesService :: createFolder :: API Error = ${ response.data.message }`,
//                 setLoading,
//                 setError,
//                 doThrow: true
//             } );
//             return null;
//         }
//         return response.data.data;
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//         return null;
//     } finally {
//         if ( setLoading ) setLoading( false );
//     }
// };

// export const updateFolder = ( {
//     id,
//     data,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     return handleApiRequest( {
//         method: 'put',
//         url: `${ API_BASE_URL }/folder/${ id }`,
//         data: data,
//         // params: { id },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// export const deleteFolder = ( {
//     id,
//     parentId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     return handleApiRequest( {
//         method: 'delete',
//         url: `${ API_BASE_URL }/folder/${ id }`,
//         data: {
//             id,
//             parentId
//         },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError
//     } );
// };

// // Generic operations
// export const getByPath = ( {
//     workspaceId,
//     path,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/path/?workspaceId=${ workspaceId }`,
//         params: { path },
//         data: { path },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError,
//     } );
// };

// export const getTree = ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     return handleApiRequest( {
//         method: 'get',
//         url: `${ API_BASE_URL }/path/tree/?workspaceId=${ workspaceId }`,
//         params: { workspaceId },
//         requiredFields: [],
//         stateSetter: stateSetter,
//         successCallback: successCallback,
//         errorCallback: errorCallback,
//         setLoading: setLoading,
//         setError: setError,
//     } );
// };

// export const fetchTree = async ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { }
// } ) => {
//     if ( !workspaceId ) {
//         // WorkspaceId required.
//         handleError( {
//             err: 'notesService.js :: fetchTree :: workspaceId must be provided and valid.',
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     try {
//         if ( setLoading ) setLoading( true );

//         const response = await API.get(
//             `${ API_BASE_URL }/path/tree?workspaceId=${ workspaceId }`
//         );

//         console.log( 'notesService :: fetchTree :: response = ', response );

//         return response.data.data;
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//     } finally {
//         if ( setLoading ) setLoading( false );
//     }
// };

// export const fetchDirectoryTree = async ( {
//     workspaceId,
//     handleError = () => { },
//     stateSetter = () => { },
//     successCallback = () => { },
//     errorCallback = () => { },
//     setLoading = () => { },
//     setError = () => { },
// } ) => {
//     if ( !workspaceId ) {
//         // WorkspaceId required.
//         handleError( {
//             err: 'notesService.js :: fetchDirectoryTree :: workspaceId must be provided and valid.',
//             setLoading,
//             setError,
//             doThrow: true
//         } );
//         return null;
//     }

//     try {
//         // if ( setLoading ) setLoading( true );

//         const response = await API.get(
//             `${ API_BASE_URL }/path/explorer?workspaceId=${ workspaceId }`
//         );

//         console.log( 'notesService :: fetchDirectoryTree :: response = ', response, " :: ", "data = ", response?.data?.data );

//         return response.data.data;
//     } catch ( err ) {
//         handleError( { err, setLoading, setError, doThrow: true } );
//     } finally {
//         // if ( setLoading ) setLoading( false );
//     }
// };



export const notesService = {
    // Get all notes with filtering
    async getNotes ( { workspaceId, itemType, categories, tags, search, inTrash = false } ) {
        const params = new URLSearchParams( {
            workspaceId,
            ...( itemType && { itemType } ),
            ...( categories && { categories: Array.isArray( categories ) ? categories.join( "," ) : categories } ),
            ...( tags && { tags: Array.isArray( tags ) ? tags.join( "," ) : tags } ),
            ...( search && { search } ),
            inTrash: inTrash.toString(),
        } );

        return handleApiRequest( {
            method: "get",
            url: `${ API_BASE_URL }?${ params }`,
        } );
    },

    // Get directory tree
    async getDirectoryTree ( { workspaceId } ) {
        return handleApiRequest( {
            method: "get",
            url: `${ API_BASE_URL }/tree?workspaceId=${ workspaceId }`,
        } );
    },

    // Get single note
    async getNote ( { id, workspaceId } ) {
        return handleApiRequest( {
            method: "get",
            url: `${ API_BASE_URL }/${ id }?workspaceId=${ workspaceId }`,
        } );
    },

    // Create note (file or folder)
    async createNote ( { workspaceId, path, itemType, subType, title, content, ...data } ) {
        return handleApiRequest( {
            method: "post",
            url: `${ API_BASE_URL }`,
            data: {
                workspaceId,
                path: Array.isArray( path ) ? path : path.split( "/" ).filter( Boolean ),
                itemType,
                subType,
                title,
                content,
                ...data,
            },
        } );
    },

    // Update note
    async updateNote2 ( { id, ...data } ) {
        if ( data.path ) {
            data.path = Array.isArray( data.path ) ? data.path : data.path.split( "/" ).filter( Boolean );
        }

        return handleApiRequest( {
            method: "put",
            url: `${ API_BASE_URL }/${ id }`,
            data,
        } );
    },
    async updateNote ( { id, data } ) {
        if ( data?.path ) {
            data.path = Array.isArray( data?.path ) ? data?.path : data?.path?.split( "/" ).filter( Boolean );
        }

        return handleApiRequest( {
            method: "put",
            url: `${ API_BASE_URL }/${ id }`,
            data,
        } );
    },

    // Delete note
    async deleteNote ( { id, permanent = false } ) {
        return handleApiRequest( {
            method: "delete",
            url: `${ API_BASE_URL }/${ id }?permanent=${ permanent }`,
        } );
    },

    // Get recent notes
    async getRecentNotes ( { workspaceId, limit = 10 } ) {
        return handleApiRequest( {
            method: "get",
            url: `${ API_BASE_URL }/recent?workspaceId=${ workspaceId }&limit=${ limit }`,
        } );
    },

    // Search notes
    async searchNotes ( { workspaceId, query, itemType, categories, tags } ) {
        const params = new URLSearchParams( {
            workspaceId,
            query,
            ...( itemType && { itemType } ),
            ...( categories && { categories: Array.isArray( categories ) ? categories.join( "," ) : categories } ),
            ...( tags && { tags: Array.isArray( tags ) ? tags.join( "," ) : tags } ),
        } );

        return handleApiRequest( {
            method: "get",
            url: `${ API_BASE_URL }/search?${ params }`,
        } );
    },

    // Legacy compatibility methods
    getFiles: function ( params ) {
        return this.getNotes( { ...params, itemType: "file" } );
    },
    getFolders: function ( params ) {
        return this.getNotes( { ...params, itemType: "folder" } );
    },
    createFile: function ( params ) {
        return this.createNote( { ...params, itemType: "file" } );
    },
    createFolder: function ( params ) {
        return this.createNote( { ...params, itemType: "folder" } );
    },
    updateFile: function ( params ) {
        return this.updateNote( params );
    },
    updateFolder: function ( params ) {
        return this.updateNote( params );
    },
    deleteFile: function ( params ) {
        return this.deleteNote( params );
    },
    deleteFolder: function ( params ) {
        return this.deleteNote( params );
    },
    getFile: function ( params ) {
        return this.getNote( params );
    },
    getFolder: function ( params ) {
        return this.getNote( params );
    },
    getRecentFiles: function ( params ) {
        return this.getRecentNotes( params );
    },
    fetchDirectoryTree: function ( params ) {
        return this.getDirectoryTree( params );
    },
    fetchTree: function ( params ) {
        return this.getDirectoryTree( params );
    },
};

// Export individual functions for backward compatibility
export const {
    getNotes,
    getDirectoryTree,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    getRecentNotes,
    searchNotes,
    getFiles,
    getFolders,
    createFile,
    createFolder,
    updateFile,
    updateFolder,
    deleteFile,
    deleteFolder,
    getFile,
    getFolder,
    getRecentFiles,
    fetchDirectoryTree,
    fetchTree,
} = notesService;

export default notesService;
