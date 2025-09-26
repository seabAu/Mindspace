import React, { useContext, createContext, useEffect, useState, useCallback } from 'react';
import * as utils from 'akashatools';
import Droplist from '@/components/Droplist';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PropertiesView = ( props ) => {
    const {
        activeFile,
        activeFolder,
        directoryTree,
        directoryPath,
    } = props;

    const [ activeTab, setActiveTab ] = useState( 'file' );

    return (
        <div
            className={ `z-0 flex flex-col flex-nowrap flex-grow gap-2 items-stretch justify-stretch mx-auto h-full w-full max-w-full ` }
        >
            <div
                // className={ `flex flex-col w-full h-full max-w-full relative overflow-hidden items-center justify-start flex-wrap flex-grow rounded-2xl` }
                className={ `z-0 flex flex-col flex-nowrap flex-grow gap-2 items-stretch justify-stretch mx-auto h-full w-full max-w-full ` }
            >
                <Tabs
                    defaultValue={ activeTab }
                    // defaultValue={ sidebarContentSecondary ? sidebarContentSecondary : 'notes' }

                    className={ `flex flex-col w-full h-auto p-0 justify-stretch items-start overflow-x-hidden rounded-xl` }
                    // className={ `flex flex-col w-full h-full max-w-full relative overflow-hidden items-center justify-start flex-wrap flex-grow rounded-2xl` }
                    onValueChange={ setActiveTab }
                >
                    <TabsList
                        className={ `bg-transparent overflow-x-auto flex-row w-full p-0 justify-stretch items-start` }
                    >
                        { [ 'file', 'folder', 'tree', 'path' ].map( ( t, i ) => {
                            let name = utils.val.isString( t )
                                ? utils.str.toCapitalCase( t )
                                : utils.str.toCapitalCase( t.toString() );
                            return (
                                <TabsTrigger
                                    id={ `notes-page-properties-view-tabs-${ t }-${ i }` }
                                    key={ t }
                                    value={ t }
                                    className={ `m-0 flex flex-1 cursor-default font-extrabold select-none  bg-primary-900 text-[1.125rem] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black leading-2 !py-0 !px-0 !leading-2 ` }
                                >
                                    { name }
                                </TabsTrigger>
                            );
                        } ) }
                    </TabsList>

                    <div
                        // className={ `justify-stretch items-start flex-col h-full w-full overflow-auto relative` }
                        className={ `flex flex-col w-full h-full max-w-full relative overflow-hidden items-center justify-start flex-wrap flex-grow rounded-2xl` }
                    >

                        <TabsContent
                            className={ `w-full justify-stretch items-start flex-col` }
                            value='file'
                        >
                            { activeFile && utils.val.isObject( activeFile ) && (
                                <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-start items-stretch w-full h-full px-2 py-2 ` }>
                                    <Droplist
                                        label={ 'Current File' }
                                        data={ activeFile }
                                        layout={ "default" }
                                        display={ "block" }
                                        flexDirection={ "column" }
                                        fillArea={ true }
                                        height={ "auto" }
                                        width={ "auto" }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                        classes={ "" }
                                        styles={ { width: `100%` } }
                                        debug={ false }
                                    />
                                </ul>
                            ) }
                        </TabsContent>

                        <TabsContent
                            className={ `w-full justify-stretch items-start flex-col` }
                            value='folder'
                        >
                            { activeFolder && utils.val.isObject( activeFolder ) && (
                                <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-start items-stretch w-full h-full px-2 py-2 ` }>
                                    <Droplist
                                        label={ 'Current Folder' }
                                        data={ activeFolder }
                                        layout={ "default" }
                                        display={ "block" }
                                        flexDirection={ "column" }
                                        fillArea={ true }
                                        height={ "auto" }
                                        width={ "auto" }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                        classes={ "" }
                                        styles={ { width: `100%` } }
                                        debug={ false }
                                    />
                                </ul>
                            ) }
                        </TabsContent>

                        <TabsContent
                            className={ `w-full justify-stretch items-start flex-col` }
                            value='path'
                        >
                            { directoryPath && utils.val.isValidArray( directoryPath, true ) && (
                                <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-start items-stretch w-full h-full px-2 py-2 ` }>
                                    <Droplist
                                        label={ 'Directory Path' }
                                        data={ directoryPath }
                                        layout={ "default" }
                                        display={ "block" }
                                        flexDirection={ "column" }
                                        fillArea={ true }
                                        height={ "auto" }
                                        width={ "auto" }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                        classes={ "" }
                                        styles={ { width: `100%` } }
                                        debug={ false }
                                    />
                                </ul>
                            ) }
                        </TabsContent>

                        <TabsContent
                            className={ `w-full justify-stretch items-start flex-col` }
                            value='tree'
                        >
                            { directoryTree && utils.val.isValidArray( directoryTree, true ) && (
                                <ul className={ `properties-list flex flex-grow flex-col flex-nowrap justify-start items-stretch w-full h-full px-2 py-2 ` }>
                                    <Droplist
                                        label={ 'Directory Tree' }
                                        data={ directoryTree }
                                        layout={ "default" }
                                        display={ "block" }
                                        flexDirection={ "column" }
                                        fillArea={ true }
                                        height={ "auto" }
                                        width={ "auto" }
                                        showControls={ true }
                                        expandable={ true }
                                        compact={ true }
                                        collapse={ false }
                                        classes={ "" }
                                        styles={ { width: `100%` } }
                                        debug={ false }
                                    />
                                </ul>
                            ) }
                        </TabsContent>

                    </div>

                </Tabs>


            </div>
        </div>
    );
};

export default PropertiesView;