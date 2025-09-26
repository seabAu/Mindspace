import React from 'react';
import * as utils from 'akashatools';
import useGlobalStore from '@/store/global.store';
import Content from '@/components/Page/Content';
import Settings from '@/features/Settings/blocks/SettingsView';

const SettingsPage = ( props ) => {
    const {
        options,
    } = props;

    const {
        debug,
        setDebug,
        data,
        getData,
        setData,
        user,
        setUser,
        workspacesData,
        setWorkspacesData,
        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
        loading,
        setLoading,
        error,
        setError,
    } = useGlobalStore();

    return (
        <>
            <div className="">
                <Content.Container
                    className={ `settings-page-container h-full w-full overflow-hidden max-h-[90vh]` }
                >
                    <Content.Header
                    // className={ `flex flex-row justify-center items-center h-full w-full border rounded-xl` }
                    >
                    </Content.Header>

                    <Content.Body
                        className={ `settings-page-content h-full w-full border rounded-xl overflow-hidden max-h-[90vh] flex flex-col gap-2 justify-center items-center max-w-full` }
                    >
                        {/* <SettingsMenu /> */ }
                        <Settings />

                    </Content.Body>

                </Content.Container>
            </div>
        </>
    );
};

export default SettingsPage;