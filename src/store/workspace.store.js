import { create } from 'zustand';
import axios from 'axios';
import * as utils from 'akashatools';
import API from '@/lib/services/api';

const useWorkspacesStore = create( ( set ) => ( {
    // Fetch request variables.
    requestFetchWorkspaces: false,
    setRequestFetchWorkspaces: ( requestFetchWorkspaces ) =>
        set( () => ( { requestFetchWorkspaces } ) ),

    remindersData: null,
    setRemindersData: ( remindersData ) => set( () => ( { remindersData } ) ),

    workspacesData: null,
    setWorkspacesData: ( workspacesData ) => set( () => ( { workspacesData } ) ),

    activeWorkspace: null,
    setActiveWorkspace: ( activeWorkspace ) => set( () => ( { activeWorkspace } ) ),

    workspaceId: null,
    setWorkspaceId: ( workspaceId ) => set( () => ( { workspaceId } ) ),

    loading: false,
    setLoading: ( loading ) => set( () => ( { loading } ) ),

    error: null,
    setError: ( error ) => set( () => ( { error } ) ),

    fetchWorkspaces: async () => {
        set( () => ( { loading: true } ) );
        try {
            const response = await axios.get( '/api/app/workspace/' );
            set( () => ( {
                workspacesData: response.data.data,
                error: null,
            } ) );
        } catch ( err ) {
            set( () => ( { error: err.response?.data?.message || 'Failed to fetch workspaces' } ) );
        } finally {
            set( () => ( { loading: false } ) );
        }
    },
} ) );

export default useWorkspacesStore;
